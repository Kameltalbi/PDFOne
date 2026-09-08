from __future__ import annotations

import re
from statistics import median
from typing import List, Sequence

from conversion_engine.domain.models import BBox, ParagraphBlock


LIST_RE = re.compile(r"^\s*(?:(\d+|[A-Za-z])[.)]|[•●▪◦‣–-])\s+")


class SemanticAnalyzer:
    def analyze(self, lines: Sequence[ParagraphBlock], page_width: float) -> List[ParagraphBlock]:
        if not lines:
            return []
        two_column_layout = self._has_two_columns(lines, page_width)
        ordered = self._reading_order(lines, page_width)
        paragraphs = self._merge_lines(ordered, preserve_line_breaks=two_column_layout)
        body_size = median(
            span.font_size
            for block in paragraphs
            for span in block.spans
            if span.text.strip()
        )
        sizes = sorted(
            {
                round(max(span.font_size for span in block.spans), 1)
                for block in paragraphs
                if block.text
            },
            reverse=True,
        )
        heading_sizes = [size for size in sizes if size >= body_size * 1.18][:3]

        for block in paragraphs:
            match = LIST_RE.match(block.text)
            if match:
                block.kind = "list"
                block.list_ordered = bool(match.group(1))
                block.list_level = max(0, round(block.bbox.x0 / 36) - 1)
                continue
            size = max((span.font_size for span in block.spans), default=body_size)
            short = len(block.text) <= 140 and len(block.text.split()) <= 18
            bold = any(span.bold for span in block.spans)
            if short and heading_sizes and (size in heading_sizes or (bold and size >= body_size * 1.08)):
                block.kind = "heading"
                block.heading_level = min(3, heading_sizes.index(size) + 1) if size in heading_sizes else 3
        return paragraphs

    def _reading_order(
        self, lines: Sequence[ParagraphBlock], page_width: float
    ) -> List[ParagraphBlock]:
        narrow = [line for line in lines if line.bbox.width < page_width * 0.62]
        left = [
            line
            for line in narrow
            if (line.bbox.x0 + line.bbox.x1) / 2 < page_width * 0.5
        ]
        right = [line for line in narrow if line not in left]
        if len(left) >= 3 and len(right) >= 3:
            wide = [line for line in lines if line not in left and line not in right]
            before = [line for line in wide if line.bbox.top < min(item.bbox.top for item in narrow)]
            after = [line for line in wide if line not in before]
            key = lambda block: (block.bbox.top, block.bbox.x0)
            return sorted(before, key=key) + sorted(left, key=key) + sorted(right, key=key) + sorted(after, key=key)
        return sorted(lines, key=lambda block: (block.bbox.top, block.bbox.x0))

    @staticmethod
    def _has_two_columns(
        lines: Sequence[ParagraphBlock], page_width: float
    ) -> bool:
        narrow = [line for line in lines if line.bbox.width < page_width * 0.62]
        left = [
            line
            for line in narrow
            if (line.bbox.x0 + line.bbox.x1) / 2 < page_width * 0.5
        ]
        right = [line for line in narrow if line not in left]
        return len(left) >= 3 and len(right) >= 3

    def _merge_lines(
        self,
        lines: Sequence[ParagraphBlock],
        preserve_line_breaks: bool = False,
    ) -> List[ParagraphBlock]:
        result: List[ParagraphBlock] = []
        for line in lines:
            previous = result[-1] if result else None
            gap = line.bbox.top - previous.bbox.bottom if previous else 999
            same_indent = previous is not None and abs(line.bbox.x0 - previous.bbox.x0) <= 12
            typical_size = max((span.font_size for span in line.spans), default=11)
            previous_ends_sentence = bool(previous and re.search(r"[.!?:;]\s*$", previous.text))
            continuation = (
                previous is not None
                and same_indent
                and -2 <= gap <= typical_size * 0.9
                and not LIST_RE.match(line.text)
                and not previous_ends_sentence
            )
            if continuation:
                if previous.spans and not previous.spans[-1].text.endswith((" ", "-")):
                    # Preserve the source line boundary. Word keeps this as an
                    # editable line break, which is important for addresses,
                    # totals and other stacked business-document fields.
                    previous.spans[-1].text += "\n" if preserve_line_breaks else " "
                previous.spans.extend(line.spans)
                previous.bbox = BBox(
                    min(previous.bbox.x0, line.bbox.x0),
                    min(previous.bbox.top, line.bbox.top),
                    max(previous.bbox.x1, line.bbox.x1),
                    max(previous.bbox.bottom, line.bbox.bottom),
                )
            else:
                result.append(line)
        return result
