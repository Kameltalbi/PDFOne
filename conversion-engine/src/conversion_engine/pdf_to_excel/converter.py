from __future__ import annotations

import logging
import os
import shutil
import tempfile
import time
import uuid
from pathlib import Path
from typing import Optional

from conversion_engine.infra.logging import log_event

from .analyzer import DocumentAnalyzer
from .excel_builder import ExcelBuilder
from .models import ConversionRequest, ConversionResult
from .quality_checker import QualityChecker
from .table_extractor import TableExtractor


class PdfToExcelConverter:
    def __init__(
        self,
        logger: logging.Logger,
        analyzer: Optional[DocumentAnalyzer] = None,
        table_extractor: Optional[TableExtractor] = None,
        builder: Optional[ExcelBuilder] = None,
        quality_checker: Optional[QualityChecker] = None,
    ):
        self.logger = logger
        self.analyzer = analyzer or DocumentAnalyzer(
            logger,
            max_pages=int(os.environ.get("PDF2EXCEL_MAX_PAGES", "200")),
            max_words=int(os.environ.get("PDF2EXCEL_MAX_WORDS", "500000")),
        )
        self.table_extractor = table_extractor or TableExtractor()
        self.builder = builder or ExcelBuilder()
        self.quality_checker = quality_checker or QualityChecker()

    def convert(self, request: ConversionRequest) -> ConversionResult:
        started = time.monotonic()
        conversion_id = request.conversion_id or uuid.uuid4().hex
        workspace = Path(tempfile.mkdtemp(prefix="pdfone-excel-"))
        temporary_output = workspace / "output.xlsx"
        try:
            log_event(
                self.logger,
                "excel.conversion.started",
                conversion_id=conversion_id,
                input_bytes=request.input_path.stat().st_size,
            )
            analysis = self.analyzer.analyze(request.input_path, conversion_id)
            tables = self.table_extractor.merge_continuations(analysis.tables)
            log_event(
                self.logger,
                "excel.layout.selected",
                conversion_id=conversion_id,
                document_type=analysis.document_type,
                strategies=sorted({page.strategy for page in analysis.pages}),
                page_tables=len(analysis.tables),
                logical_tables=len(tables),
            )
            self.builder.build(analysis, tables, temporary_output)
            duration_ms = round((time.monotonic() - started) * 1000)
            diagnostics = self.quality_checker.evaluate(
                analysis, tables, temporary_output, duration_ms
            )
            request.output_path.parent.mkdir(parents=True, exist_ok=True)
            os.replace(temporary_output, request.output_path)
            if request.report_path:
                self.quality_checker.write(diagnostics, request.report_path)
            log_event(
                self.logger,
                "excel.conversion.completed",
                conversion_id=conversion_id,
                output_bytes=request.output_path.stat().st_size,
                diagnostics=diagnostics.as_dict(),
            )
            return ConversionResult(
                output_path=request.output_path,
                diagnostics=diagnostics,
                conversion_id=conversion_id,
            )
        except Exception as error:
            log_event(
                self.logger,
                "excel.conversion.failed",
                conversion_id=conversion_id,
                duration_ms=round((time.monotonic() - started) * 1000),
                error_code=getattr(error, "code", "CONVERSION_FAILED"),
                error_type=type(error).__name__,
            )
            raise
        finally:
            shutil.rmtree(workspace, ignore_errors=True)
