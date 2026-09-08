from __future__ import annotations

from typing import Any, List

from conversion_engine.domain.models import BBox, TableBlock
from conversion_engine.pdf_to_excel.table_detector import TableDetector
from conversion_engine.pdf_to_excel.text_extractor import TextExtractor


class TableExtractor:
    """Extract simple ruled or aligned tables through pdfplumber."""

    SETTINGS = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "join_tolerance": 3,
        "intersection_tolerance": 4,
        "text_tolerance": 3,
    }

    def extract(self, page: Any) -> List[TableBlock]:
        blocks: List[TableBlock] = []
        try:
            tables = page.find_tables(table_settings=self.SETTINGS)
        except Exception:
            tables = []
        for table in tables:
            rows = [
                [self._clean(cell) for cell in row]
                for row in (table.extract() or [])
                if row and any(self._clean(cell) for cell in row)
            ]
            if len(rows) < 2 or max((len(row) for row in rows), default=0) < 2:
                continue
            x0, top, x1, bottom = (float(value) for value in table.bbox)
            blocks.append(
                TableBlock(
                    rows=rows,
                    bbox=BBox(x0, top, x1, bottom),
                    confidence=0.9 if len(rows) >= 3 else 0.75,
                )
            )
        if blocks:
            return blocks

        # Many invoices use only a colored header background and whitespace,
        # without a complete ruled grid. Reuse the semantic detector from the
        # Excel engine so these rows remain real editable Word tables.
        extractor = TextExtractor()
        words = extractor.extract_words(page)
        lines = extractor.group_lines(words)
        detected, _strategy = TableDetector().detect(page, words, lines, 1)
        return [
            TableBlock(
                rows=[table.headers, *table.rows],
                bbox=BBox(
                    table.bbox.x0,
                    table.bbox.top,
                    min(float(page.width), table.bbox.x1),
                    table.bbox.bottom,
                ),
                confidence=table.confidence,
            )
            for table in detected
            if table.headers and table.rows
        ]

    @staticmethod
    def _clean(value: Any) -> str:
        return " ".join(str(value or "").replace("\x00", "").split())
