from __future__ import annotations

import logging
import errno
import os
import shutil
import tempfile
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from conversion_engine.analyzers.document import DocumentAnalyzer
from conversion_engine.builders.docx import DocxBuilder
from conversion_engine.infra.logging import log_event
from conversion_engine.services.quality import QualityEvaluator, QualityReport


@dataclass(frozen=True)
class ConversionRequest:
    input_path: Path
    output_path: Path
    report_path: Optional[Path] = None
    conversion_id: Optional[str] = None


@dataclass(frozen=True)
class ConversionResult:
    output_path: Path
    report: QualityReport
    duration_ms: int
    conversion_id: str


class ConversionService:
    def __init__(
        self,
        logger: logging.Logger,
        analyzer: Optional[DocumentAnalyzer] = None,
        builder: Optional[DocxBuilder] = None,
        evaluator: Optional[QualityEvaluator] = None,
    ):
        self.logger = logger
        self.analyzer = analyzer or DocumentAnalyzer(
            logger,
            max_pages=int(os.environ.get("PDF2DOCX_MAX_PAGES", "200")),
            max_image_pixels=int(
                os.environ.get("PDF2DOCX_MAX_IMAGE_PIXELS", "24000000")
            ),
        )
        self.builder = builder or DocxBuilder()
        self.evaluator = evaluator or QualityEvaluator()

    def convert(self, request: ConversionRequest) -> ConversionResult:
        started = time.monotonic()
        conversion_id = request.conversion_id or uuid.uuid4().hex
        workspace = Path(tempfile.mkdtemp(prefix="pdfone-docx-"))
        temporary_output = workspace / "output.docx"
        log_event(
            self.logger,
            "conversion.started",
            conversion_id=conversion_id,
            input_bytes=request.input_path.stat().st_size,
        )
        try:
            document = self.analyzer.analyze(
                request.input_path, workspace / "assets", conversion_id
            )
            analyzed_ms = round((time.monotonic() - started) * 1000)
            log_event(
                self.logger,
                "document.analyzed",
                conversion_id=conversion_id,
                pages=len(document.pages),
                duration_ms=analyzed_ms,
                warnings=document.warnings,
            )
            self.builder.build(document, temporary_output)
            report = self.evaluator.evaluate(document, temporary_output)
            request.output_path.parent.mkdir(parents=True, exist_ok=True)
            try:
                os.replace(temporary_output, request.output_path)
            except OSError as error:
                if error.errno != errno.EXDEV:
                    raise
                # The OS temp directory and result directory can be on different
                # volumes. Stage beside the destination before the atomic rename.
                staged = None
                try:
                    with tempfile.NamedTemporaryFile(
                        dir=request.output_path.parent, suffix=".docx", delete=False
                    ) as handle:
                        staged = Path(handle.name)
                        with temporary_output.open("rb") as source:
                            shutil.copyfileobj(source, handle)
                    os.replace(staged, request.output_path)
                finally:
                    if staged is not None:
                        staged.unlink(missing_ok=True)
            if request.report_path:
                self.evaluator.write(report, request.report_path)
            duration_ms = round((time.monotonic() - started) * 1000)
            log_event(
                self.logger,
                "conversion.completed",
                conversion_id=conversion_id,
                duration_ms=duration_ms,
                output_bytes=request.output_path.stat().st_size,
                quality=report.as_dict(),
            )
            return ConversionResult(
                output_path=request.output_path,
                report=report,
                duration_ms=duration_ms,
                conversion_id=conversion_id,
            )
        except Exception as error:
            log_event(
                self.logger,
                "conversion.failed",
                conversion_id=conversion_id,
                duration_ms=round((time.monotonic() - started) * 1000),
                error_code=getattr(error, "code", "CONVERSION_FAILED"),
                error_type=type(error).__name__,
            )
            raise
        finally:
            shutil.rmtree(workspace, ignore_errors=True)
