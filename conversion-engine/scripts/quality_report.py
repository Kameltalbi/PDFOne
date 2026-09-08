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
from conversion_engine.services.conversion import (  # noqa: E402
    ConversionRequest,
    ConversionService,
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--corpus",
        type=Path,
        default=ROOT.parent / "capacity" / "fixtures",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "quality-report.json",
    )
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    files = [
        item
        for item in sorted(args.corpus.glob("*.pdf"))
        if not any(token in item.name.lower() for token in ("scan", "protected"))
    ][: args.limit]
    if not files:
        parser.error(f"no PDF files found in {args.corpus}")

    logger = configure_logging()
    results = []
    with tempfile.TemporaryDirectory(prefix="one2pdf-quality-") as directory:
        target_dir = Path(directory)
        for source in files:
            try:
                result = ConversionService(logger).convert(
                    ConversionRequest(
                        source,
                        target_dir / f"{source.stem}.docx",
                    )
                )
                results.append(
                    {
                        "file": source.name,
                        "status": "ok",
                        "durationMs": result.duration_ms,
                        **result.report.as_dict(),
                    }
                )
            except Exception as error:
                results.append(
                    {
                        "file": source.name,
                        "status": "failed",
                        "errorCode": getattr(error, "code", "CONVERSION_FAILED"),
                    }
                )

    successful = [item for item in results if item["status"] == "ok"]
    report = {
        "engine": "one2pdf-python-docx",
        "corpus": str(args.corpus),
        "files": len(results),
        "successful": len(successful),
        "summary": {
            "meanTextSimilarity": round(
                statistics.fmean(item["text_similarity"] for item in successful), 4
            )
            if successful
            else 0,
            "meanTextCoverage": round(
                statistics.fmean(item["text_coverage"] for item in successful), 4
            )
            if successful
            else 0,
            "meanDurationMs": round(
                statistics.fmean(item["durationMs"] for item in successful)
            )
            if successful
            else 0,
        },
        "results": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report["summary"], ensure_ascii=False))
    return 0 if len(successful) == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
