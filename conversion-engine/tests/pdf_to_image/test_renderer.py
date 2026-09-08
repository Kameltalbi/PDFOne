from __future__ import annotations

import io
import zipfile
from pathlib import Path

import pytest
from PIL import Image, ImageStat

from conversion_engine.domain.errors import InvalidPdfError
from conversion_engine.infra.logging import configure_logging
from conversion_engine.pdf_to_image.models import RenderRequest
from conversion_engine.pdf_to_image.renderer import PdfiumPageRenderer


A4_HEIGHT = 841.89


def render(source: Path, tmp_path: Path, **options):
    output = tmp_path / f"{source.stem}.output"
    request = RenderRequest(
        input_path=source,
        output_path=output,
        dpi=options.pop("dpi", 150),
        jpeg_quality=options.pop("jpeg_quality", 90),
        max_pixels=options.pop("max_pixels", 5_000_000),
        max_dimension=options.pop("max_dimension", 5000),
        **options,
    )
    result = PdfiumPageRenderer(configure_logging()).render(request)
    return result, output


def open_jpeg(path: Path) -> Image.Image:
    image = Image.open(path)
    image.load()
    return image


def pdf_region(image: Image.Image, x, y, width, height, page_height=A4_HEIGHT):
    scale_x = image.width / 595.28
    scale_y = image.height / page_height
    return image.crop(
        (
            round(x * scale_x),
            round((page_height - y - height) * scale_y),
            round((x + width) * scale_x),
            round((page_height - y) * scale_y),
        )
    )


def nonwhite_ratio(image: Image.Image) -> float:
    gray = image.convert("L")
    histogram = gray.histogram()
    return sum(histogram[:235]) / max(1, image.width * image.height)


def test_text_only_page_is_fully_rendered(image_pdf_fixtures, tmp_path):
    result, output = render(image_pdf_fixtures["text"], tmp_path)
    with open_jpeg(output) as image:
        assert result.extension == "jpg"
        assert nonwhite_ratio(image) > 0.01
        assert image.width / image.height == pytest.approx(595.28 / A4_HEIGHT, rel=0.02)


def test_invoice_regression_contains_every_visual_zone(image_pdf_fixtures, tmp_path):
    _result, output = render(image_pdf_fixtures["invoice"], tmp_path, dpi=200)
    with open_jpeg(output) as image:
        regions = {
            "logo": (35, 758, 95, 50),
            "invoice_title": (400, 782, 175, 32),
            "invoice_number": (405, 762, 170, 20),
            "date": (405, 744, 170, 20),
            "seller": (35, 665, 235, 60),
            "customer": (315, 665, 245, 60),
            "item_table": (35, 520, 525, 110),
            "amounts_vat_totals": (380, 435, 180, 65),
            "footer_bank_legal": (35, 40, 525, 40),
        }
        missing = [
            name
            for name, box in regions.items()
            if nonwhite_ratio(pdf_region(image, *box)) < 0.002
        ]
        assert missing == []


def test_embedded_image_and_surrounding_text_are_rendered(image_pdf_fixtures, tmp_path):
    _result, output = render(image_pdf_fixtures["image"], tmp_path)
    with open_jpeg(output) as image:
        image_region = pdf_region(image, 75, 595, 250, 170)
        text_region = pdf_region(image, 75, 555, 260, 30)
        red_mean = ImageStat.Stat(image_region).mean
        assert red_mean[0] > red_mean[1] * 2
        assert nonwhite_ratio(text_region) > 0.002


def test_vector_heavy_page_is_not_blank(image_pdf_fixtures, tmp_path):
    _result, output = render(image_pdf_fixtures["vector"], tmp_path)
    with open_jpeg(output) as image:
        assert nonwhite_ratio(image) > 0.006


def test_multi_page_pdf_returns_streamed_zip(image_pdf_fixtures, tmp_path):
    result, output = render(image_pdf_fixtures["multipage"], tmp_path)
    assert result.extension == "zip"
    with zipfile.ZipFile(output) as archive:
        assert archive.namelist() == ["page-001.jpg", "page-002.jpg", "page-003.jpg"]
        for name in archive.namelist():
            with Image.open(io.BytesIO(archive.read(name))) as image:
                assert nonwhite_ratio(image) > 0.001


def test_ocr_mode_renders_complete_png_pages(image_pdf_fixtures, tmp_path):
    output_directory = tmp_path / "ocr-pages"
    request = RenderRequest(
        input_path=image_pdf_fixtures["invoice"],
        output_path=output_directory,
        dpi=200,
        max_pixels=5_000_000,
    )
    result = PdfiumPageRenderer(configure_logging()).render_pages(
        request, output_directory
    )
    pages = sorted(output_directory.glob("page-*.png"))
    assert result.extension == "directory"
    assert [page.name for page in pages] == ["page-001.png"]
    with Image.open(pages[0]) as image:
        assert nonwhite_ratio(image) > 0.01
        assert image.info["dpi"][0] == pytest.approx(
            result.diagnostics.minimum_effective_dpi, abs=1
        )


def test_preview_mode_limits_rendering_to_first_page(image_pdf_fixtures, tmp_path):
    output_directory = tmp_path / "preview-page"
    request = RenderRequest(
        input_path=image_pdf_fixtures["multipage"],
        output_path=output_directory,
        dpi=83,
        max_pixels=2_000_000,
    )
    result = PdfiumPageRenderer(configure_logging()).render_pages(
        request, output_directory, page_limit=1
    )
    assert result.diagnostics.pages == 1
    assert [page.name for page in output_directory.glob("*.png")] == [
        "page-001.png"
    ]


def test_landscape_aspect_ratio_is_preserved(image_pdf_fixtures, tmp_path):
    _result, output = render(image_pdf_fixtures["landscape"], tmp_path)
    with open_jpeg(output) as image:
        assert image.width > image.height
        assert nonwhite_ratio(image) > 0.001


def test_transparency_is_composited_on_white(image_pdf_fixtures, tmp_path):
    _result, output = render(image_pdf_fixtures["transparency"], tmp_path)
    with open_jpeg(output) as image:
        assert min(image.getpixel((5, 5))) > 245
        center = pdf_region(image, 150, 530, 100, 80)
        assert ImageStat.Stat(center).mean[0] > ImageStat.Stat(center).mean[1]


def test_large_page_respects_pixel_and_dimension_limits(image_pdf_fixtures, tmp_path):
    result, output = render(
        image_pdf_fixtures["large"],
        tmp_path,
        dpi=300,
        max_pixels=1_000_000,
        max_dimension=1200,
    )
    with open_jpeg(output) as image:
        assert image.width * image.height <= 1_010_000
        assert max(image.size) <= 1200
        assert result.diagnostics.capped_pages == 1


def test_malformed_pdf_is_rejected_without_partial_output(image_pdf_fixtures, tmp_path):
    output = tmp_path / "malformed.output"
    with pytest.raises(InvalidPdfError):
        PdfiumPageRenderer(configure_logging()).render(
            RenderRequest(image_pdf_fixtures["malformed"], output)
        )
    assert not output.exists()
