from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Optional


@dataclass(frozen=True)
class RenderRequest:
    input_path: Path
    output_path: Path
    dpi: int = 180
    jpeg_quality: int = 85
    max_pages: int = 200
    max_pixels: int = 12_000_000
    max_dimension: int = 10_000
    password: str = ""
    conversion_id: Optional[str] = None


@dataclass
class RenderDiagnostics:
    pages: int
    requested_dpi: int
    minimum_effective_dpi: float
    maximum_width: int
    maximum_height: int
    output_kind: str
    duration_ms: int
    capped_pages: int

    def as_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass(frozen=True)
class RenderResult:
    output_path: Path
    extension: str
    diagnostics: RenderDiagnostics
    conversion_id: str
