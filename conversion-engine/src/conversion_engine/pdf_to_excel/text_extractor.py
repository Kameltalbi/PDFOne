from __future__ import annotations

import re
from statistics import median
from typing import Any, Dict, List, Sequence

from .models import BBox, TextLine, Word


class TextExtractor:
    def extract_words(self, page: Any) -> List[Word]:
        try:
            raw_words = page.extract_words(
                x_tolerance=2,
                y_tolerance=3,
                keep_blank_chars=False,
                use_text_flow=False,
                extra_attrs=["fontname", "size"],
            )
        except Exception:
            raw_words = page.extract_words(
                x_tolerance=2,
                y_tolerance=3,
                keep_blank_chars=False,
                use_text_flow=False,
            )
        words = []
        for raw in raw_words:
            text = " ".join(str(raw.get("text", "")).replace("\x00", "").split())
            if not text:
                continue
            font_name = str(raw.get("fontname", ""))
            words.append(
                Word(
                    text=text,
                    bbox=BBox(
                        float(raw.get("x0", 0)),
                        float(raw.get("top", 0)),
                        float(raw.get("x1", 0)),
                        float(raw.get("bottom", 0)),
                    ),
                    font_name=re.sub(r"^[A-Z]{6}\+", "", font_name),
                    font_size=float(raw.get("size", 0) or 0),
                    bold=bool(re.search(r"bold|black|heavy|semibold", font_name, re.I)),
                )
            )
        return words

    def group_lines(self, words: Sequence[Word]) -> List[TextLine]:
        if not words:
            return []
        heights = [word.bbox.bottom - word.bbox.top for word in words]
        tolerance = max(2.5, median(heights) * 0.45)
        groups: List[List[Word]] = []
        for word in sorted(words, key=lambda item: (item.bbox.top, item.bbox.x0)):
            target = next(
                (
                    group
                    for group in reversed(groups[-5:])
                    if abs(median(item.bbox.top for item in group) - word.bbox.top)
                    <= tolerance
                ),
                None,
            )
            if target is None:
                groups.append([word])
            else:
                target.append(word)
        lines = []
        for group in groups:
            ordered = sorted(group, key=lambda item: item.bbox.x0)
            lines.append(
                TextLine(
                    words=ordered,
                    bbox=BBox(
                        min(item.bbox.x0 for item in ordered),
                        min(item.bbox.top for item in ordered),
                        max(item.bbox.x1 for item in ordered),
                        max(item.bbox.bottom for item in ordered),
                    ),
                )
            )
        return lines

    @staticmethod
    def words_outside_boxes(words: Sequence[Word], boxes: Sequence[BBox]) -> List[Word]:
        return [
            word
            for word in words
            if not any(box.contains(word.x_center, (word.bbox.top + word.bbox.bottom) / 2) for box in boxes)
        ]
