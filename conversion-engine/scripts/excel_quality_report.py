#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import statistics
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from conversion_engine.infra.logging import configure_logging  # noqa: E402
from conversion_engine.pdf_to_excel.converter import PdfToExcelConverter  # noqa: E402
from conversion_engine.pdf_to_excel.models import ConversionRequest  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus", type=Path, default=ROOT.parent / "capacity" / "fixtures")
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "pdf-to-excel-quality-report.json",
    )
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()
    sources = sorted(args.corpus.glob("*.pdf"))[: args.limit]
    if not sources:
        parser.error(f"no PDF files found in {args.corpus}")

    logger = configure_logging()
    results = []
    with tempfile.TemporaryDirectory(prefix="one2pdf-excel-quality-") as directory:
        output_dir = Path(directory)
        for source in sources:
            try:
                result = PdfToExcelConverter(logger).convert(
                    ConversionRequest(source, output_dir / f"{source.stem}.xlsx")
                )
                results.append(
                    {
                        "file": source.name,
                        "status": "ok",
                        **result.diagnostics.as_dict(),
                    }
                )
            except Exception as error:
                results.append(
                    {
                        "file": source.name,
                        "status": "failed",
                        "errorCode": getattr(error, "code", "PDF2EXCEL_FAILED"),
                    }
                )
    successful = [item for item in results if item["status"] == "ok"]
    report = {
        "engine": "pdf-to-excel-v2",
        "corpus": str(args.corpus),
        "files": len(results),
        "successful": len(successful),
        "summary": {
            "meanQuality": round(
                statistics.fmean(item["conversion_quality"] for item in successful), 4
            ) if successful else 0,
            "meanTextCoverage": round(
                statistics.fmean(item["text_coverage"] for item in successful), 4
            ) if successful else 0,
            "meanTableConfidence": round(
                statistics.fmean(item["table_confidence"] for item in successful), 4
            ) if successful else 0,
            "meanDurationMs": round(
                statistics.fmean(item["duration_ms"] for item in successful)
            ) if successful else 0,
        },
        "results": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report["summary"], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
