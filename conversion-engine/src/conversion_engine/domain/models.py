from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Tuple, Union


@dataclass(frozen=True)
class BBox:
    x0: float
    top: float
    x1: float
    bottom: float

    @property
    def width(self) -> float:
        return max(0.0, self.x1 - self.x0)

    @property
    def height(self) -> float:
        return max(0.0, self.bottom - self.top)


@dataclass
class TextSpan:
    text: str
    bbox: BBox
    font_name: str = "Arial"
    font_size: float = 11.0
    bold: bool = False
    italic: bool = False
    color: Optional[Tuple[int, int, int]] = None


@dataclass
class ParagraphBlock:
    spans: List[TextSpan]
    bbox: BBox
    kind: str = "paragraph"  # paragraph, heading, list
    heading_level: Optional[int] = None
    list_ordered: bool = False
    list_level: int = 0
    alignment: str = "left"
    confidence: float = 1.0

    @property
    def text(self) -> str:
        return "".join(span.text for span in self.spans).strip()


@dataclass
class TableBlock:
    rows: List[List[str]]
    bbox: BBox
    confidence: float = 0.8


@dataclass
class ImageBlock:
    path: Path
    bbox: BBox
    width_px: int
    height_px: int
    mime_type: str
    confidence: float = 1.0


Block = Union[ParagraphBlock, TableBlock, ImageBlock]


@dataclass
class PageIR:
    number: int
    width: float
    height: float
    rotation: int = 0
    blocks: List[Block] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass
class DocumentIR:
    pages: List[PageIR]
    title: Optional[str] = None
    author: Optional[str] = None
    warnings: List[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        parts: List[str] = []
        for page in self.pages:
            for block in page.blocks:
                if isinstance(block, ParagraphBlock):
                    parts.append(block.text)
                elif isinstance(block, TableBlock):
                    parts.extend(" ".join(row) for row in block.rows)
        return "\n".join(parts)
