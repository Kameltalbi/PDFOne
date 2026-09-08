from __future__ import annotations

import re
import unicodedata
from statistics import median
from typing import Any, Dict, List, Optional, Sequence, Tuple

from .models import BBox, Table, TextLine, Word


HEADER_PHRASES: Dict[str, Tuple[str, ...]] = {
    "Description": ("description", "designation", "article", "item", "product", "produit"),
    "Unit price": ("unit price", "prix unitaire", "prix unit", "p u", "pu"),
    "Qty": ("quantity", "qty", "quantite", "qte"),
    "Discount": ("discount", "remise", "rabais"),
    "Total": ("total ht", "line total", "total", "montant", "amount"),
    "VAT": ("vat", "tva", "tax", "taxe"),
    "Date": ("date",),
    "Reference": ("reference", "ref"),
    "Debit": ("debit",),
    "Credit": ("credit",),
    "Balance": ("balance", "solde"),
}
TOTAL_RE = re.compile(
    r"\b(?:sous[- ]?total|subtotal|total\s+ht|total\s+ttc|grand\s+total|net\s+a\s+payer|tax|tva)\b",
    re.I,
)
NUMBER_RE = re.compile(r"^[+-]?(?:\d{1,3}(?:[ .,'’]\d{3})+|\d+)(?:[.,]\d+)?\s*%?$")


def normalize(value: str) -> str:
    plain = unicodedata.normalize("NFKD", value)
    plain = "".join(char for char in plain if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9%]+", " ", plain.casefold()).strip()


class TableDetector:
    def detect(
        self, page: Any, words: Sequence[Word], lines: Sequence[TextLine], page_number: int
    ) -> Tuple[List[Table], str]:
        graphical_objects = len(getattr(page, "lines", [])) + len(getattr(page, "rects", []))
        if graphical_objects >= 4:
            bordered = self._bordered(page, page_number)
            if bordered and max(table.confidence for table in bordered) >= 0.68:
                return bordered, "bordered"

        semantic = self._semantic_borderless(lines, page.width, page.height, page_number)
        if semantic:
            return semantic, "semantic-alignment"

        aligned = self._generic_aligned(lines, page.width, page_number)
        if aligned:
            return aligned, "whitespace-alignment"
        return [], "none"

    def _bordered(self, page: Any, page_number: int) -> List[Table]:
        settings = {
            "vertical_strategy": "lines",
            "horizontal_strategy": "lines",
            "snap_tolerance": 3,
            "join_tolerance": 3,
            "intersection_tolerance": 4,
            "text_tolerance": 3,
        }
        try:
            found = page.find_tables(table_settings=settings)
        except Exception:
            return []
        result = []
        for raw_table in found:
            data = [
                [self._clean(cell) for cell in row]
                for row in (raw_table.extract() or [])
                if row and any(self._clean(cell) for cell in row)
            ]
            width = max((len(row) for row in data), default=0)
            if len(data) < 2 or width < 2:
                continue
            data = [row + [""] * (width - len(row)) for row in data]
            header_index = self._best_header_index(data[:3])
            headers = data[header_index]
            rows = data[header_index + 1 :]
            if not rows:
                continue
            filled = sum(bool(cell) for row in rows for cell in row)
            density = filled / max(1, len(rows) * width)
            confidence = min(0.98, 0.64 + density * 0.24 + (0.08 if self._header_score(headers) >= 2 else 0))
            result.append(
                Table(
                    headers=self._unique_headers(headers),
                    rows=rows,
                    bbox=BBox(*(float(value) for value in raw_table.bbox)),
                    page_number=page_number,
                    strategy="bordered",
                    confidence=round(confidence, 3),
                )
            )
        return result

    def _semantic_borderless(
        self, lines: Sequence[TextLine], page_width: float, page_height: float, page_number: int
    ) -> List[Table]:
        tables: List[Table] = []
        used_until = -1
        for index, line in enumerate(lines):
            if index <= used_until:
                continue
            anchors = self._header_anchors(line)
            if len(anchors) < 3:
                continue
            rows, end_index = self._rows_from_anchors(
                lines, index + 1, anchors, page_width, page_height
            )
            if len(rows) < 1:
                continue
            nonempty = sum(bool(cell) for row in rows for cell in row)
            consistency = nonempty / max(1, len(rows) * len(anchors))
            numeric_columns = self._numeric_column_score(rows)
            confidence = min(0.97, 0.65 + consistency * 0.2 + numeric_columns * 0.12)
            if confidence < 0.72:
                continue
            tables.append(
                Table(
                    headers=[label for label, _x in anchors],
                    rows=rows,
                    bbox=BBox(
                        min(x for _label, x in anchors),
                        line.bbox.top,
                        page_width,
                        lines[end_index].bbox.bottom,
                    ),
                    page_number=page_number,
                    strategy="semantic-alignment",
                    confidence=round(confidence, 3),
                )
            )
            used_until = end_index
        return tables

    def _rows_from_anchors(
        self,
        lines: Sequence[TextLine],
        start: int,
        anchors: Sequence[Tuple[str, float]],
        page_width: float,
        page_height: float,
    ) -> Tuple[List[List[str]], int]:
        x_values = [x for _label, x in anchors]
        rows: List[List[str]] = []
        end_index = max(0, start - 1)
        previous_bottom: Optional[float] = None
        for index in range(start, len(lines)):
            line = lines[index]
            if line.bbox.top > page_height * 0.93:
                break
            if rows and TOTAL_RE.search(normalize(line.text)):
                break
            if self._header_anchors(line):
                break
            typical_height = max(8.0, line.bbox.bottom - line.bbox.top)
            if previous_bottom is not None and line.bbox.top - previous_bottom > typical_height * 2.8:
                break
            cells = [[] for _ in anchors]
            for cluster in self._clusters(line.words):
                # A long description may extend under the next header. Assigning
                # every word independently at midpoint boundaries therefore
                # corrupts borderless invoice rows. Cell-sized whitespace
                # clusters are stable and their left edge aligns with headers.
                column = min(
                    range(len(anchors)),
                    key=lambda idx: abs(cluster[0].bbox.x0 - x_values[idx]),
                )
                cells[column].extend(cluster)
            values = [
                " ".join(word.text for word in sorted(cell, key=lambda item: item.bbox.x0))
                for cell in cells
            ]
            filled_columns = [column for column, value in enumerate(values) if value]
            if len(filled_columns) < 2:
                if rows and len(filled_columns) == 1:
                    column = filled_columns[0]
                    rows[-1][column] = f"{rows[-1][column]}\n{values[column]}".strip()
                    previous_bottom = line.bbox.bottom
                    end_index = index
                    continue
                if rows:
                    break
                continue
            rows.append(values)
            previous_bottom = line.bbox.bottom
            end_index = index
        return rows, end_index

    def _generic_aligned(
        self, lines: Sequence[TextLine], page_width: float, page_number: int
    ) -> List[Table]:
        for index, line in enumerate(lines[:-2]):
            candidates = self._clusters(line.words)
            if len(candidates) < 3:
                continue
            anchors = [(cluster[0].text, cluster[0].bbox.x0) for cluster in candidates]
            rows, end_index = self._rows_from_anchors(lines, index + 1, anchors, page_width, 10_000)
            if len(rows) < 2 or self._numeric_column_score(rows) < 0.25:
                continue
            consistency = sum(bool(cell) for row in rows for cell in row) / (len(rows) * len(anchors))
            if consistency < 0.58:
                continue
            return [
                Table(
                    headers=self._unique_headers([cluster[0].text for cluster in candidates]),
                    rows=rows,
                    bbox=BBox(line.bbox.x0, line.bbox.top, page_width, lines[end_index].bbox.bottom),
                    page_number=page_number,
                    strategy="whitespace-alignment",
                    confidence=round(0.58 + consistency * 0.22, 3),
                )
            ]
        return []

    def _header_anchors(self, line: TextLine) -> List[Tuple[str, float]]:
        tokens = [normalize(word.text) for word in line.words]
        matches: List[Tuple[str, float, int, int]] = []
        occupied = set()
        phrases = sorted(
            (
                (label, phrase.split())
                for label, variants in HEADER_PHRASES.items()
                for phrase in variants
            ),
            key=lambda item: len(item[1]),
            reverse=True,
        )
        for label, phrase_tokens in phrases:
            for start in range(0, len(tokens) - len(phrase_tokens) + 1):
                stop = start + len(phrase_tokens)
                if any(position in occupied for position in range(start, stop)):
                    continue
                if tokens[start:stop] == phrase_tokens:
                    display = " ".join(
                        word.text for word in line.words[start:stop]
                    )
                    matches.append((display or label, line.words[start].bbox.x0, start, stop))
                    occupied.update(range(start, stop))
                    break
        return [(label, x) for label, x, _start, _stop in sorted(matches, key=lambda item: item[1])]

    @staticmethod
    def _clusters(words: Sequence[Word]) -> List[List[Word]]:
        clusters: List[List[Word]] = []
        for word in sorted(words, key=lambda item: item.bbox.x0):
            if not clusters:
                clusters.append([word])
                continue
            gap = word.bbox.x0 - clusters[-1][-1].bbox.x1
            if gap >= max(14, word.font_size * 1.4):
                clusters.append([word])
            else:
                clusters[-1].append(word)
        return clusters

    def _best_header_index(self, rows: Sequence[Sequence[str]]) -> int:
        return max(range(len(rows)), key=lambda index: self._header_score(rows[index]))

    def _header_score(self, row: Sequence[str]) -> int:
        text = normalize(" ".join(row))
        return sum(
            any(normalize(phrase) in text for phrase in variants)
            for variants in HEADER_PHRASES.values()
        )

    @staticmethod
    def _numeric_column_score(rows: Sequence[Sequence[str]]) -> float:
        if not rows:
            return 0.0
        columns = max(len(row) for row in rows)
        numeric_columns = 0
        for column in range(columns):
            values = [row[column].strip() for row in rows if column < len(row) and row[column].strip()]
            if values and sum(bool(NUMBER_RE.match(value)) for value in values) / len(values) >= 0.6:
                numeric_columns += 1
        return numeric_columns / max(1, columns)

    @staticmethod
    def _unique_headers(headers: Sequence[str]) -> List[str]:
        used: Dict[str, int] = {}
        output = []
        for index, value in enumerate(headers, start=1):
            base = value.strip() or f"Column {index}"
            used[base] = used.get(base, 0) + 1
            output.append(base if used[base] == 1 else f"{base} ({used[base]})")
        return output

    @staticmethod
    def _clean(value: Any) -> str:
        return " ".join(str(value or "").replace("\x00", "").split())
