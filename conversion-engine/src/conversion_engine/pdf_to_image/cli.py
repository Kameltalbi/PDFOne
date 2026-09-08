from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from conversion_engine.domain.errors import ConversionError
from conversion_engine.infra.logging import configure_logging

from .models import RenderRequest
from .renderer import PdfiumPageRenderer


def main() -> int:
    parser = argparse.ArgumentParser(prog="one2pdf-pdf-to-image")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--dpi", type=int, default=180)
    parser.add_argument("--quality", type=int, default=85)
    parser.add_argument("--max-pages", type=int, default=200)
    parser.add_argument("--max-pixels", type=int, default=12_000_000)
    parser.add_argument("--max-dimension", type=int, default=10_000)
    parser.add_argument("--password", default="")
    parser.add_argument("--conversion-id")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    if args.check:
        print(json.dumps({"ok": True, "engine": "pdfium", "version": 2}))
        return 0
    if not args.input or not args.output:
        print(json.dumps({"ok": False, "code": "INVALID_ARGUMENTS"}))
        return 2
    try:
        result = PdfiumPageRenderer(configure_logging(args.verbose)).render(
            RenderRequest(
                input_path=args.input.resolve(),
                output_path=args.output.resolve(),
                dpi=max(72, min(300, args.dpi)),
                jpeg_quality=max(40, min(100, args.quality)),
                max_pages=max(1, args.max_pages),
                max_pixels=max(1_000_000, args.max_pixels),
                max_dimension=max(1_000, args.max_dimension),
                password=args.password,
                conversion_id=args.conversion_id,
            )
        )
        print(
            json.dumps(
                {
                    "ok": True,
                    "conversionId": result.conversion_id,
                    "extension": result.extension,
                    "diagnostics": result.diagnostics.as_dict(),
                }
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
                    "code": "PDF_TO_IMAGE_FAILED",
                    "message": "Impossible de convertir ce PDF en JPG.",
                },
                ensure_ascii=False,
            )
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
