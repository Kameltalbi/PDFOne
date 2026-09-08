from __future__ import annotations

from copy import deepcopy
from difflib import SequenceMatcher
from typing import List, Sequence

from .models import Table
from .table_detector import normalize


class TableExtractor:
    """Reconcile detected page tables into logical multi-page datasets."""

    def merge_continuations(self, tables: Sequence[Table]) -> List[Table]:
        logical: List[Table] = []
        for table in sorted(tables, key=lambda item: (item.page_number, item.bbox.top)):
            current = deepcopy(table)
            current.source_pages = current.source_pages or [current.page_number]
            previous = logical[-1] if logical else None
            if (
                previous
                and table.page_number == max(previous.source_pages) + 1
                and self._same_headers(previous.headers, table.headers)
            ):
                rows = [
                    row
                    for row in current.rows
                    if not self._same_headers(current.headers, row)
                ]
                previous.rows.extend(rows)
                previous.source_pages.append(table.page_number)
                previous.confidence = round(
                    min(previous.confidence, table.confidence), 3
                )
                previous.strategy = (
                    previous.strategy
                    if previous.strategy == table.strategy
                    else "combined"
                )
            else:
                logical.append(current)
        return logical

    @staticmethod
    def _same_headers(first: Sequence[str], second: Sequence[str]) -> bool:
        if len(first) != len(second) or len(first) < 2:
            return False
        left = "|".join(normalize(value) for value in first)
        right = "|".join(normalize(value) for value in second)
        return SequenceMatcher(None, left, right).ratio() >= 0.86
