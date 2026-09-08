import os
from pathlib import Path

import pytest

from conversion_engine.domain.errors import ScannedPdfError
from conversion_engine.infra.logging import configure_logging
from conversion_engine.services.conversion import ConversionRequest, ConversionService


REPO_ROOT = Path(__file__).resolve().parents[2]
CORPUS = Path(
    os.environ.get("PDF_CORPUS_DIR", REPO_ROOT / "capacity" / "fixtures")
)
PDFS = [
    item
    for item in sorted(CORPUS.glob("*.pdf"))
    if item.stat().st_size <= 10_000_000
    and not any(token in item.name.lower() for token in ("scan", "protected"))
][:20]


@pytest.mark.parametrize("source", PDFS, ids=lambda item: item.name)
def test_real_pdf_converts_to_structured_docx(source: Path, tmp_path: Path):
    result = ConversionService(configure_logging()).convert(
        ConversionRequest(
            input_path=source,
            output_path=tmp_path / f"{source.stem}.docx",
            report_path=tmp_path / f"{source.stem}.quality.json",
        )
    )
    assert result.output_path.read_bytes().startswith(b"PK")
    assert result.report.pages >= 1
    assert result.report.text_coverage >= 0.85
    assert result.report.text_similarity >= 0.80
    if source.name.startswith("pdf-"):
        assert result.report.images >= 1


def test_scanned_pdf_requests_ocr(tmp_path: Path):
    source = CORPUS / "scan-2pages.pdf"
    if not source.exists():
        pytest.skip("Run `node capacity/generate-fixtures.mjs` to create scan fixture")
    with pytest.raises(ScannedPdfError):
        ConversionService(configure_logging()).convert(
            ConversionRequest(source, tmp_path / "scan.docx")
        )
