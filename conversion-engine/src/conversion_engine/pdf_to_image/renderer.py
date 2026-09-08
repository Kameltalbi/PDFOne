from __future__ import annotations

import io
import logging
import math
import time
import uuid
import zipfile
from pathlib import Path
from typing import Optional, Tuple

import pypdfium2 as pdfium
from PIL import Image

from conversion_engine.domain.errors import (
    EncryptedPdfError,
    InvalidPdfError,
    ResourceLimitError,
)
from conversion_engine.infra.logging import log_event

from .models import RenderDiagnostics, RenderRequest, RenderResult


class PdfiumPageRenderer:
    """Render complete PDF pages through the PDFium viewer engine."""

    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def render(self, request: RenderRequest) -> RenderResult:
        started = time.monotonic()
        conversion_id = request.conversion_id or uuid.uuid4().hex
        request.output_path.parent.mkdir(parents=True, exist_ok=True)
        document = None
        max_width = 0
        max_height = 0
        minimum_dpi = float(request.dpi)
        capped_pages = 0
        try:
            document = pdfium.PdfDocument(
                str(request.input_path),
                password=request.password or None,
            )
            pages = len(document)
            if pages <= 0:
                raise InvalidPdfError("Le PDF ne contient aucune page.")
            if pages > request.max_pages:
                raise ResourceLimitError(
                    f"Le PDF dépasse la limite de {request.max_pages} pages."
                )
            try:
                document.init_forms()
            except Exception:
                pass

            log_event(
                self.logger,
                "image.render.started",
                conversion_id=conversion_id,
                pages=pages,
                requested_dpi=request.dpi,
                jpeg_quality=request.jpeg_quality,
            )
            if pages == 1:
                image, effective_dpi, was_capped = self._render_page(
                    document[0], request
                )
                max_width, max_height = image.size
                minimum_dpi = effective_dpi
                capped_pages = int(was_capped)
                image.save(
                    request.output_path,
                    "JPEG",
                    quality=request.jpeg_quality,
                    optimize=True,
                    progressive=True,
                    subsampling=0,
                )
                image.close()
                extension = "jpg"
                output_kind = "jpeg"
            else:
                with zipfile.ZipFile(
                    request.output_path,
                    mode="w",
                    compression=zipfile.ZIP_STORED,
                    allowZip64=True,
                ) as archive:
                    for index in range(pages):
                        page_started = time.monotonic()
                        image, effective_dpi, was_capped = self._render_page(
                            document[index], request
                        )
                        width, height = image.size
                        max_width = max(max_width, width)
                        max_height = max(max_height, height)
                        minimum_dpi = min(minimum_dpi, effective_dpi)
                        capped_pages += int(was_capped)
                        buffer = io.BytesIO()
                        image.save(
                            buffer,
                            "JPEG",
                            quality=request.jpeg_quality,
                            optimize=True,
                            progressive=True,
                            subsampling=0,
                        )
                        image.close()
                        archive.writestr(
                            f"page-{index + 1:03d}.jpg",
                            buffer.getvalue(),
                        )
                        log_event(
                            self.logger,
                            "image.page.rendered",
                            conversion_id=conversion_id,
                            page=index + 1,
                            width=width,
                            height=height,
                            effective_dpi=round(effective_dpi, 2),
                            capped=was_capped,
                            duration_ms=round(
                                (time.monotonic() - page_started) * 1000
                            ),
                        )
                extension = "zip"
                output_kind = "zip"

            duration_ms = round((time.monotonic() - started) * 1000)
            diagnostics = RenderDiagnostics(
                pages=pages,
                requested_dpi=request.dpi,
                minimum_effective_dpi=round(minimum_dpi, 2),
                maximum_width=max_width,
                maximum_height=max_height,
                output_kind=output_kind,
                duration_ms=duration_ms,
                capped_pages=capped_pages,
            )
            log_event(
                self.logger,
                "image.render.completed",
                conversion_id=conversion_id,
                output_bytes=request.output_path.stat().st_size,
                diagnostics=diagnostics.as_dict(),
            )
            return RenderResult(
                output_path=request.output_path,
                extension=extension,
                diagnostics=diagnostics,
                conversion_id=conversion_id,
            )
        except (InvalidPdfError, ResourceLimitError, EncryptedPdfError):
            request.output_path.unlink(missing_ok=True)
            raise
        except Exception as error:
            request.output_path.unlink(missing_ok=True)
            message = str(error).casefold()
            if "password" in message or "security handler" in message:
                raise EncryptedPdfError(
                    "Ce PDF est protégé par un mot de passe. Déverrouillez-le avant de continuer."
                ) from error
            raise InvalidPdfError("Le fichier PDF est invalide ou corrompu.") from error
        finally:
            if document is not None:
                document.close()

    def render_pages(
        self,
        request: RenderRequest,
        output_directory: Path,
        page_limit: Optional[int] = None,
    ) -> RenderResult:
        """Render complete pages as individual PNG files for OCR streaming."""
        started = time.monotonic()
        conversion_id = request.conversion_id or uuid.uuid4().hex
        document = None
        output_directory.mkdir(parents=True, exist_ok=True)
        max_width = 0
        max_height = 0
        minimum_dpi = float(request.dpi)
        capped_pages = 0
        try:
            document = pdfium.PdfDocument(
                str(request.input_path),
                password=request.password or None,
            )
            pages = len(document)
            if pages <= 0:
                raise InvalidPdfError("Le PDF ne contient aucune page.")
            if pages > request.max_pages:
                raise ResourceLimitError(
                    f"Le PDF dépasse la limite de {request.max_pages} pages."
                )
            rendered_pages = min(pages, page_limit) if page_limit else pages
            try:
                document.init_forms()
            except Exception:
                pass
            for index in range(rendered_pages):
                image, effective_dpi, was_capped = self._render_page(
                    document[index], request
                )
                width, height = image.size
                max_width = max(max_width, width)
                max_height = max(max_height, height)
                minimum_dpi = min(minimum_dpi, effective_dpi)
                capped_pages += int(was_capped)
                image.save(
                    output_directory / f"page-{index + 1:03d}.png",
                    "PNG",
                    dpi=(effective_dpi, effective_dpi),
                )
                image.close()
            diagnostics = RenderDiagnostics(
                pages=rendered_pages,
                requested_dpi=request.dpi,
                minimum_effective_dpi=round(minimum_dpi, 2),
                maximum_width=max_width,
                maximum_height=max_height,
                output_kind="png-directory",
                duration_ms=round((time.monotonic() - started) * 1000),
                capped_pages=capped_pages,
            )
            return RenderResult(
                output_path=output_directory,
                extension="directory",
                diagnostics=diagnostics,
                conversion_id=conversion_id,
            )
        except (InvalidPdfError, ResourceLimitError, EncryptedPdfError):
            raise
        except Exception as error:
            message = str(error).casefold()
            if "password" in message or "security handler" in message:
                raise EncryptedPdfError(
                    "Ce PDF est protégé par un mot de passe. Déverrouillez-le avant de continuer."
                ) from error
            raise InvalidPdfError("Le fichier PDF est invalide ou corrompu.") from error
        finally:
            if document is not None:
                document.close()

    def _render_page(
        self, page, request: RenderRequest
    ) -> Tuple[Image.Image, float, bool]:
        width_points = float(page.get_width())
        height_points = float(page.get_height())
        requested_scale = max(72, min(300, request.dpi)) / 72
        dimension_scale = min(
            request.max_dimension / max(1.0, width_points),
            request.max_dimension / max(1.0, height_points),
        )
        pixel_scale = math.sqrt(
            request.max_pixels / max(1.0, width_points * height_points)
        )
        scale = min(requested_scale, dimension_scale, pixel_scale)
        if scale <= 0:
            raise ResourceLimitError("Dimensions PDF invalides.")
        effective_dpi = scale * 72
        was_capped = scale < requested_scale - 0.001

        bitmap = page.render(
            scale=scale,
            may_draw_forms=True,
            fill_color=(255, 255, 255, 255),
            optimize_mode="print",
            draw_annots=True,
            rev_byteorder=True,
            maybe_alpha=True,
            limit_image_cache=True,
        )
        try:
            source = bitmap.to_pil()
            if source.mode == "RGBA":
                white = Image.new("RGB", source.size, "white")
                white.paste(source, mask=source.getchannel("A"))
                return white, effective_dpi, was_capped
            return source.convert("RGB"), effective_dpi, was_capped
        finally:
            bitmap.close()
