from __future__ import annotations

from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


@dataclass(frozen=True)
class BBox:
    x0: float
    top: float
    x1: float
    bottom: float

    @property
    def width(self) -> float:
        return max(0.0, self.x1 - self.x0)

    def contains(self, x: float, y: float) -> bool:
        return self.x0 <= x <= self.x1 and self.top <= y <= self.bottom


@dataclass
class Word:
    text: str
    bbox: BBox
    font_name: str = ""
    font_size: float = 0.0
    bold: bool = False

    @property
    def x_center(self) -> float:
        return (self.bbox.x0 + self.bbox.x1) / 2


@dataclass
class TextLine:
    words: List[Word]
    bbox: BBox

    @property
    def text(self) -> str:
        return " ".join(word.text for word in self.words).strip()


@dataclass
class Table:
    headers: List[str]
    rows: List[List[str]]
    bbox: BBox
    page_number: int
    strategy: str
    confidence: float
    source_pages: List[int] = field(default_factory=list)


@dataclass
class SemanticZone:
    kind: str
    lines: List[str]
    page_number: int
    bbox: Optional[BBox] = None


@dataclass
class PageAnalysis:
    number: int
    width: float
    height: float
    rotation: int
    words: List[Word]
    lines: List[TextLine]
    line_count: int
    rectangle_count: int
    image_count: int
    column_count: int
    tables: List[Table] = field(default_factory=list)
    zones: List[SemanticZone] = field(default_factory=list)
    strategy: str = "none"


@dataclass
class DocumentAnalysis:
    document_type: str
    pages: List[PageAnalysis]
    tables: List[Table]
    zones: List[SemanticZone]
    source_text: str
    warnings: List[str] = field(default_factory=list)


@dataclass
class QualityDiagnostics:
    document_type: str
    pages: int
    tables_detected: int
    text_coverage: float
    table_confidence: float
    row_consistency: float
    column_consistency: float
    numeric_preservation: float
    conversion_quality: float
    strategies: List[str]
    warnings: List[str]
    duration_ms: int = 0

    def as_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ConversionRequest:
    input_path: Path
    output_path: Path
    report_path: Optional[Path] = None
    conversion_id: Optional[str] = None


@dataclass(frozen=True)
class ConversionResult:
    output_path: Path
    diagnostics: QualityDiagnostics
    conversion_id: str


CellValue = Tuple[Any, Optional[str]]
