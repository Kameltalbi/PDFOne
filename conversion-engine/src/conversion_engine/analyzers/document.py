from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Optional

import pdfplumber

from conversion_engine.analyzers.semantics import SemanticAnalyzer
from conversion_engine.domain.errors import (
    EncryptedPdfError,
    InvalidPdfError,
    ResourceLimitError,
    ScannedPdfError,
)
from conversion_engine.domain.models import DocumentIR, PageIR
from conversion_engine.extractors.images import ImageExtractor
from conversion_engine.extractors.tables import TableExtractor
from conversion_engine.extractors.text import TextExtractor
from conversion_engine.infra.logging import log_event


class DocumentAnalyzer:
    def __init__(
        self,
        logger: logging.Logger,
        max_pages: int = 200,
        max_image_pixels: int = 24_000_000,
    ):
        self.logger = logger
        self.max_pages = max_pages
        self.max_image_pixels = max_image_pixels
        self.text_extractor = TextExtractor()
        self.table_extractor = TableExtractor()
        self.semantic_analyzer = SemanticAnalyzer()

    def analyze(
        self, source: Path, asset_dir: Path, conversion_id: Optional[str] = None
    ) -> DocumentIR:
        image_extractor = ImageExtractor(asset_dir, self.max_image_pixels)
        pages = []
        total_text_chars = 0
        try:
            with pdfplumber.open(source) as pdf:
                if getattr(pdf.doc, "is_encrypted", False):
                    raise EncryptedPdfError(
                        "Ce PDF est protégé par un mot de passe. Déverrouillez-le avant de continuer."
                    )
                if len(pdf.pages) > self.max_pages:
                    raise ResourceLimitError(
                        f"Le document dépasse la limite de {self.max_pages} pages."
                    )
                metadata = pdf.metadata or {}
                for number, page in enumerate(pdf.pages, start=1):
                    started = time.monotonic()
                    tables = self.table_extractor.extract(page)
                    lines = self.text_extractor.extract(page, [table.bbox for table in tables])
                    paragraphs = self.semantic_analyzer.analyze(lines, float(page.width))
                    images = image_extractor.extract(page, number)
                    blocks = sorted(
                        [*paragraphs, *tables, *images],
                        key=lambda block: (block.bbox.top, block.bbox.x0),
                    )
                    chars = sum(len(block.text) for block in paragraphs)
                    chars += sum(len(cell) for table in tables for row in table.rows for cell in row)
                    total_text_chars += chars
                    warnings = []
                    if not chars and images:
                        warnings.append("page_without_extractable_text")
                    pages.append(
                        PageIR(
                            number=number,
                            width=float(page.width),
                            height=float(page.height),
                            rotation=int(getattr(page, "rotation", 0) or 0),
                            blocks=blocks,
                            warnings=warnings,
                        )
                    )
                    log_event(
                        self.logger,
                        "page.analyzed",
                        conversion_id=conversion_id,
                        page=number,
                        duration_ms=round((time.monotonic() - started) * 1000),
                        counts={
                            "paragraphs": len(paragraphs),
                            "tables": len(tables),
                            "images": len(images),
                        },
                        warnings=warnings,
                    )
                if total_text_chars == 0:
                    raise ScannedPdfError(
                        "Aucun texte extractible. Utilisez d’abord l’outil OCR."
                    )
                return DocumentIR(
                    pages=pages,
                    title=self._metadata(metadata, "Title"),
                    author=self._metadata(metadata, "Author"),
                    warnings=[
                        warning
                        for page in pages
                        for warning in page.warnings
                    ],
                )
        except (EncryptedPdfError, ResourceLimitError, ScannedPdfError):
            raise
        except Exception as error:
            raise InvalidPdfError("Le fichier PDF est invalide ou corrompu.") from error

    @staticmethod
    def _metadata(metadata: dict, name: str) -> Optional[str]:
        value = metadata.get(name) or metadata.get(name.lower())
        return str(value).strip()[:255] if value else None
