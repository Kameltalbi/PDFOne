from __future__ import annotations

import re
from statistics import median
from typing import Any, Dict, Iterable, List, Sequence

from conversion_engine.domain.models import BBox, ParagraphBlock, TextSpan


def _inside(box: BBox, excluded: Sequence[BBox]) -> bool:
    cx, cy = (box.x0 + box.x1) / 2, (box.top + box.bottom) / 2
    return any(item.x0 <= cx <= item.x1 and item.top <= cy <= item.bottom for item in excluded)


def _color(value: Any):
    if not isinstance(value, (list, tuple)) or len(value) < 3:
        return None
    values = [float(component) for component in value[:3]]
    if max(values) <= 1:
        values = [component * 255 for component in values]
    return tuple(max(0, min(255, round(component))) for component in values)


class TextExtractor:
    """Extract styled text lines from pdfplumber character dictionaries."""

    def extract(self, page: Any, excluded: Sequence[BBox] = ()) -> List[ParagraphBlock]:
        chars: List[Dict[str, Any]] = []
        for char in page.chars:
            text = str(char.get("text", ""))
            if not text or text.isspace():
                continue
            bbox = BBox(
                float(char.get("x0", 0)),
                float(char.get("top", 0)),
                float(char.get("x1", 0)),
                float(char.get("bottom", 0)),
            )
            if not _inside(bbox, excluded):
                chars.append({**char, "_bbox": bbox})

        if not chars:
            return []
        typical_size = median(float(char.get("size", 11)) for char in chars)
        lines: List[List[Dict[str, Any]]] = []
        for char in sorted(chars, key=lambda item: (round(float(item["top"]), 1), float(item["x0"]))):
            line = next(
                (
                    candidate
                    for candidate in reversed(lines[-4:])
                    if abs(float(candidate[0]["top"]) - float(char["top"]))
                    <= max(2.0, typical_size * 0.35)
                ),
                None,
            )
            if line is None:
                lines.append([char])
            else:
                line.append(char)

        return [self._line_to_block(sorted(line, key=lambda item: float(item["x0"]))) for line in lines]

    def _line_to_block(self, chars: Iterable[Dict[str, Any]]) -> ParagraphBlock:
        values = list(chars)
        spans: List[TextSpan] = []
        current: List[Dict[str, Any]] = []

        def flush() -> None:
            if not current:
                return
            first, last = current[0], current[-1]
            font = str(first.get("fontname", "Arial"))
            text = "".join(str(item.get("text", "")) for item in current)
            spans.append(
                TextSpan(
                    text=text,
                    bbox=BBox(
                        float(first["x0"]),
                        min(float(item["top"]) for item in current),
                        float(last["x1"]),
                        max(float(item["bottom"]) for item in current),
                    ),
                    font_name=re.sub(r"^[A-Z]{6}\+", "", font),
                    font_size=float(first.get("size", 11)),
                    bold=bool(re.search(r"bold|black|heavy|semibold", font, re.I)),
                    italic=bool(re.search(r"italic|oblique", font, re.I)),
                    color=_color(first.get("non_stroking_color")),
                )
            )
            current.clear()

        previous = None
        for char in values:
            if previous is not None:
                gap = float(char["x0"]) - float(previous["x1"])
                size = float(char.get("size", 11))
                if gap > size * 0.22:
                    current.append({
                        **previous,
                        "text": " ",
                        "x0": previous["x1"],
                        "x1": char["x0"],
                    })
                style_changed = (
                    char.get("fontname") != previous.get("fontname")
                    or abs(size - float(previous.get("size", 11))) > 0.25
                    or char.get("non_stroking_color") != previous.get("non_stroking_color")
                )
                if style_changed:
                    flush()
            current.append(char)
            previous = char
        flush()

        bbox = BBox(
            min(span.bbox.x0 for span in spans),
            min(span.bbox.top for span in spans),
            max(span.bbox.x1 for span in spans),
            max(span.bbox.bottom for span in spans),
        )
        return ParagraphBlock(spans=spans, bbox=bbox)
