from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from conversion_engine import ConversionRequest, ConversionService
from conversion_engine.domain.errors import ConversionError
from conversion_engine.infra.logging import configure_logging


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="one2pdf-convert")
    root.add_argument("--verbose", action="store_true")
    root.add_argument("--check", action="store_true", help="Validate runtime dependencies")
    root.add_argument("--input", type=Path)
    root.add_argument("--output", type=Path)
    root.add_argument("--report", type=Path)
    root.add_argument("--conversion-id")
    return root


def main() -> int:
    args = parser().parse_args()
    if args.check:
        print(json.dumps({"ok": True, "engine": "one2pdf-python-docx", "version": 1}))
        return 0
    if not args.input or not args.output:
        print(
            json.dumps(
                {"ok": False, "code": "INVALID_ARGUMENTS", "message": "--input and --output are required"}
            )
        )
        return 2

    logger = configure_logging(args.verbose)
    try:
        result = ConversionService(logger).convert(
            ConversionRequest(
                input_path=args.input.resolve(),
                output_path=args.output.resolve(),
                report_path=args.report.resolve() if args.report else None,
                conversion_id=args.conversion_id,
            )
        )
        print(
            json.dumps(
                {
                    "ok": True,
                    "conversionId": result.conversion_id,
                    "durationMs": result.duration_ms,
                    "quality": result.report.as_dict(),
                },
                ensure_ascii=False,
            )
        )
        return 0
    except ConversionError as error:
        print(
            json.dumps(
                {"ok": False, "code": error.code, "message": str(error)},
                ensure_ascii=False,
            )
        )
        return 3
    except Exception:
        print(
            json.dumps(
                {
                    "ok": False,
                    "code": "CONVERSION_FAILED",
                    "message": "La conversion PDF vers Word a échoué.",
                },
                ensure_ascii=False,
            )
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
