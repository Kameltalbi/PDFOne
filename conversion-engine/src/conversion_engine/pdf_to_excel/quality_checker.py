from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from statistics import fmean
from typing import Sequence

from openpyxl import load_workbook

from .models import DocumentAnalysis, QualityDiagnostics, Table
from .table_detector import normalize


NUMBER_TOKEN_RE = re.compile(
    r"(?<!\w)[+-]?(?:\d{1,3}(?:[ .,'’]\d{3})+|\d+)(?:[.,]\d+)?%?(?!\w)"
)


class QualityChecker:
    def evaluate(
        self,
        analysis: DocumentAnalysis,
        tables: Sequence[Table],
        output: Path,
        duration_ms: int = 0,
    ) -> QualityDiagnostics:
        load_workbook(output, read_only=True, data_only=False).close()
        represented = "\n".join(
            [
                *(line for zone in analysis.zones for line in zone.lines),
                *(
                    " ".join([*table.headers, *(cell for row in table.rows for cell in row)])
                    for table in tables
                ),
            ]
        )
        coverage = self._token_coverage(analysis.source_text, represented)
        numeric = self._numeric_preservation(analysis.source_text, represented)
        table_confidence = fmean(table.confidence for table in tables) if tables else 0.0
        row_consistency = self._row_consistency(tables)
        column_consistency = self._column_consistency(tables)
        structure_score = table_confidence if tables else min(0.55, coverage)
        quality = (
            coverage * 0.32
            + structure_score * 0.26
            + row_consistency * 0.14
            + column_consistency * 0.12
            + numeric * 0.16
        )
        warnings = list(analysis.warnings)
        if not tables:
            warnings.append("no_tables_detected")
        if coverage < 0.9:
            warnings.append("low_text_coverage")
        if tables and table_confidence < 0.75:
            warnings.append("low_table_confidence")
        if numeric < 0.95:
            warnings.append("numeric_values_may_be_missing")
        return QualityDiagnostics(
            document_type=analysis.document_type,
            pages=len(analysis.pages),
            tables_detected=len(tables),
            text_coverage=round(coverage, 4),
            table_confidence=round(table_confidence, 4),
            row_consistency=round(row_consistency, 4),
            column_consistency=round(column_consistency, 4),
            numeric_preservation=round(numeric, 4),
            conversion_quality=round(min(1.0, quality), 4),
            strategies=sorted({page.strategy for page in analysis.pages}),
            warnings=warnings,
            duration_ms=duration_ms,
        )

    @staticmethod
    def write(diagnostics: QualityDiagnostics, target: Path) -> None:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            json.dumps(diagnostics.as_dict(), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    @staticmethod
    def _token_coverage(source: str, represented: str) -> float:
        source_tokens = Counter(normalize(source).split())
        output_tokens = Counter(normalize(represented).split())
        total = sum(source_tokens.values())
        return (
            sum(min(count, output_tokens[token]) for token, count in source_tokens.items()) / total
            if total
            else 1.0
        )

    @staticmethod
    def _numeric_preservation(source: str, represented: str) -> float:
        source_values = Counter(match.group(0).replace(" ", "") for match in NUMBER_TOKEN_RE.finditer(source))
        output_values = Counter(match.group(0).replace(" ", "") for match in NUMBER_TOKEN_RE.finditer(represented))
        total = sum(source_values.values())
        return (
            sum(min(count, output_values[value]) for value, count in source_values.items()) / total
            if total
            else 1.0
        )

    @staticmethod
    def _row_consistency(tables: Sequence[Table]) -> float:
        rows = [row for table in tables for row in table.rows]
        if not rows:
            return 0.0
        valid = sum(
            len(row) == len(table.headers)
            for table in tables
            for row in table.rows
        )
        return valid / len(rows)

    @staticmethod
    def _column_consistency(tables: Sequence[Table]) -> float:
        cells = [
            bool(cell.strip())
            for table in tables
            for row in table.rows
            for cell in row
        ]
        return sum(cells) / len(cells) if cells else 0.0
