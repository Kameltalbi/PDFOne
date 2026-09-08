from __future__ import annotations

import logging
import time
from pathlib import Path
from statistics import median
from typing import List, Optional

import pdfplumber

from conversion_engine.domain.errors import (
    EncryptedPdfError,
    InvalidPdfError,
    ResourceLimitError,
    ScannedPdfError,
)
from conversion_engine.infra.logging import log_event

from .layout import LayoutAnalyzer
from .models import DocumentAnalysis, PageAnalysis, Word
from .table_detector import TableDetector
from .text_extractor import TextExtractor


class DocumentAnalyzer:
    def __init__(
        self,
        logger: logging.Logger,
        max_pages: int = 200,
        max_words: int = 500_000,
    ):
        self.logger = logger
        self.max_pages = max_pages
        self.max_words = max_words
        self.text = TextExtractor()
        self.tables = TableDetector()
        self.layout = LayoutAnalyzer()

    def analyze(self, source: Path, conversion_id: Optional[str] = None) -> DocumentAnalysis:
        pages: List[PageAnalysis] = []
        page_kinds = []
        total_words = 0
        try:
            with pdfplumber.open(source) as pdf:
                if len(pdf.pages) > self.max_pages:
                    raise ResourceLimitError(
                        f"Le document dépasse la limite de {self.max_pages} pages."
                    )
                for number, page in enumerate(pdf.pages, start=1):
                    started = time.monotonic()
                    words = self.text.extract_words(page)
                    total_words += len(words)
                    if total_words > self.max_words:
                        raise ResourceLimitError(
                            "Le document contient trop d’éléments textuels."
                        )
                    lines = self.text.group_lines(words)
                    detected_tables, strategy = self.tables.detect(
                        page, words, lines, number
                    )
                    zones = self.layout.semantic_zones(
                        lines,
                        detected_tables,
                        number,
                        float(page.width),
                        float(page.height),
                    )
                    detected_column_count = max(
                        (len(table.headers) for table in detected_tables),
                        default=0,
                    )
                    has_text = bool(words)
                    has_images = bool(page.images)
                    page_kinds.append(
                        "mixed" if has_text and has_images else "digital" if has_text else "scanned"
                    )
                    analysis = PageAnalysis(
                        number=number,
                        width=float(page.width),
                        height=float(page.height),
                        rotation=int(getattr(page, "rotation", 0) or 0),
                        words=words,
                        lines=lines,
                        line_count=len(getattr(page, "lines", [])),
                        rectangle_count=len(getattr(page, "rects", [])),
                        image_count=len(page.images),
                        column_count=max(
                            detected_column_count,
                            self._column_count(words, float(page.width)),
                        ),
                        tables=detected_tables,
                        zones=zones,
                        strategy=strategy,
                    )
                    pages.append(analysis)
                    log_event(
                        self.logger,
                        "excel.page.analyzed",
                        conversion_id=conversion_id,
                        page=number,
                        duration_ms=round((time.monotonic() - started) * 1000),
                        strategy=strategy,
                        document_page_type=page_kinds[-1],
                        counts={
                            "words": len(words),
                            "lines": len(lines),
                            "tables": len(detected_tables),
                            "images": len(page.images),
                            "columns": analysis.column_count,
                        },
                    )
        except (EncryptedPdfError, ResourceLimitError, ScannedPdfError):
            raise
        except Exception as error:
            message = str(error)
            if "password" in message.casefold():
                raise EncryptedPdfError(
                    "Ce PDF est protégé par un mot de passe. Déverrouillez-le avant de continuer."
                ) from error
            raise InvalidPdfError("Le fichier PDF est invalide ou corrompu.") from error

        if not pages or all(kind == "scanned" for kind in page_kinds):
            raise ScannedPdfError(
                "Ce PDF est scanné. Utilisez d’abord l’outil OCR avant la conversion Excel."
            )
        document_type = (
            "mixed"
            if len(set(page_kinds)) > 1 or "mixed" in page_kinds
            else page_kinds[0]
        )
        warnings = [
            f"page_{page.number}_requires_ocr"
            for page, kind in zip(pages, page_kinds)
            if kind == "scanned"
        ]
        all_tables = [table for page in pages for table in page.tables]
        all_zones = [zone for page in pages for zone in page.zones]
        source_text = "\n".join(line.text for page in pages for line in page.lines)
        return DocumentAnalysis(
            document_type=document_type,
            pages=pages,
            tables=all_tables,
            zones=all_zones,
            source_text=source_text,
            warnings=warnings,
        )

    @staticmethod
    def _column_count(words: List[Word], page_width: float) -> int:
        body = [word for word in words if word.bbox.width < page_width * 0.45]
        if len(body) < 8:
            return 1
        centers = sorted(word.x_center for word in body)
        gaps = [
            (centers[index + 1] - centers[index], index)
            for index in range(len(centers) - 1)
        ]
        largest, index = max(gaps, default=(0, 0))
        typical = median(
            max(1.0, word.bbox.x1 - word.bbox.x0) for word in body
        )
        left_count, right_count = index + 1, len(centers) - index - 1
        return 2 if largest > max(36, typical * 3) and min(left_count, right_count) >= 3 else 1
