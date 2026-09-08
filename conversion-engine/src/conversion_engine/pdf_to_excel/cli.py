from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from conversion_engine.domain.errors import ConversionError
from conversion_engine.infra.logging import configure_logging

from .converter import PdfToExcelConverter
from .models import ConversionRequest


def main() -> int:
    parser = argparse.ArgumentParser(prog="one2pdf-pdf-to-excel")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--conversion-id")
    args = parser.parse_args()
    if args.check:
        print(json.dumps({"ok": True, "engine": "one2pdf-pdf-to-excel", "version": 2}))
        return 0
    if not args.input or not args.output:
        print(json.dumps({"ok": False, "code": "INVALID_ARGUMENTS"}))
        return 2
    try:
        result = PdfToExcelConverter(configure_logging(args.verbose)).convert(
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
                    "diagnostics": result.diagnostics.as_dict(),
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
                    "code": "PDF2EXCEL_FAILED",
                    "message": "La conversion PDF vers Excel a échoué.",
                },
                ensure_ascii=False,
            )
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
