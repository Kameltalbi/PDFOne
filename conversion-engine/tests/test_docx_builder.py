from pathlib import Path
from zipfile import ZipFile

from docx import Document
from lxml import etree

from conversion_engine.builders.docx import DocxBuilder
from conversion_engine.domain.models import (
    BBox,
    DocumentIR,
    ImageBlock,
    PageIR,
    ParagraphBlock,
    TableBlock,
    TextSpan,
)


def paragraph(text: str, kind: str = "paragraph") -> ParagraphBlock:
    return ParagraphBlock(
        spans=[TextSpan(text=text, bbox=BBox(36, 36, 300, 50), bold=kind == "heading")],
        bbox=BBox(36, 36, 300, 50),
        kind=kind,
        heading_level=1 if kind == "heading" else None,
        list_ordered=kind == "list",
    )


def test_builds_editable_paragraphs_table_and_page_break(tmp_path: Path):
    target = tmp_path / "result.docx"
    source = DocumentIR(
        pages=[
            PageIR(
                number=1,
                width=595,
                height=842,
                blocks=[
                    paragraph("Editable heading", "heading"),
                    paragraph("1. Editable list", "list"),
                    TableBlock([["Item", "Price"], ["A", "10"]], BBox(36, 100, 400, 180)),
                ],
            ),
            PageIR(
                number=2,
                width=595,
                height=842,
                blocks=[paragraph("Second page")],
            ),
        ]
    )
    DocxBuilder().build(source, target)

    output = Document(target)
    with ZipFile(target) as archive:
        root = etree.fromstring(archive.read("word/document.xml"))
    all_text = " ".join(
        root.xpath(
            ".//w:t/text()",
            namespaces={
                "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            },
        )
    )
    assert "Editable heading" in all_text
    assert "Editable list" in all_text
    assert output.tables[0].cell(1, 1).text == "10"
    assert len(output.sections) == 2


def test_short_label_pages_keep_fixed_layout_and_section_footer(tmp_path: Path):
    target = tmp_path / "positioned.docx"

    def positioned(text: str, top: float) -> ParagraphBlock:
        bbox = BBox(42, top, 550, top + 14)
        return ParagraphBlock(
            spans=[TextSpan(text=text, bbox=bbox, font_size=10)],
            bbox=bbox,
        )

    source = DocumentIR(
        pages=[
            PageIR(
                number=number,
                width=595,
                height=842,
                blocks=[
                    positioned(f"Chapter {number}", 60),
                    positioned("First paragraph", 110),
                    positioned("Second paragraph", 150),
                    positioned(f"Report | Page {number}", 796),
                ],
            )
            for number in (1, 2)
        ]
    )
    DocxBuilder().build(source, target)

    with ZipFile(target) as archive:
        root = etree.fromstring(archive.read("word/document.xml"))
        footer_xml = archive.read("word/footer1.xml")
    namespaces = {
        "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        "v": "urn:schemas-microsoft-com:vml",
    }
    textboxes = root.xpath(".//v:textbox", namespaces=namespaces)
    footer_root = etree.fromstring(footer_xml)
    footer_text = " ".join(footer_root.xpath(".//w:t/text()", namespaces=namespaces))

    assert len(Document(target).sections) == 2
    assert len(textboxes) == 6
    assert "Report | Page 1" in footer_text


def test_long_report_paragraphs_use_flowing_layout_not_vml(tmp_path: Path):
    target = tmp_path / "report.docx"
    long = (
        "La Chambre de Commerce et d'Industrie Tuniso-Française a engagé une "
        "évaluation de ses émissions de gaz à effet de serre couvrant l'ensemble "
        "de ses activités, dans le but d'en identifier les principales sources."
    )

    def body(text: str, top: float, height: float = 60) -> ParagraphBlock:
        bbox = BBox(65, top, 530, top + height)
        return ParagraphBlock(
            spans=[TextSpan(text=text, bbox=bbox, font_size=11)],
            bbox=bbox,
        )

    source = DocumentIR(
        pages=[
            PageIR(
                number=1,
                width=595,
                height=842,
                blocks=[
                    body("I - SYNTHÈSE EXÉCUTIVE", 58, 18),
                    body(long, 90, 70),
                    body(long, 180, 70),
                    body("Bilan Carbone 2025 | Page 1", 796, 14),
                ],
            )
        ]
    )
    DocxBuilder().build(source, target)

    with ZipFile(target) as archive:
        root = etree.fromstring(archive.read("word/document.xml"))
        footer_xml = archive.read("word/footer1.xml")
    namespaces = {
        "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        "v": "urn:schemas-microsoft-com:vml",
    }
    assert root.xpath(".//v:textbox", namespaces=namespaces) == []
    assert "SYNTHÈSE" in " ".join(root.xpath(".//w:t/text()", namespaces=namespaces))
    assert "Page 1" in " ".join(
        etree.fromstring(footer_xml).xpath(".//w:t/text()", namespaces=namespaces)
    )


def test_normalizes_pdf_font_face_names():
    assert DocxBuilder._safe_font("ABCDEF+Arial-Bold") == "Arial"
    assert DocxBuilder._safe_font("Carlito-Regular") == "Calibri"
    assert DocxBuilder._safe_font("ABCDEF+Carlito-BoldItalic") == "Calibri"
    assert DocxBuilder._word_font_size("Carlito-Regular", 10.999999) == 11


def test_office_font_is_written_in_body_and_footer(tmp_path: Path):
    body_box = BBox(65, 60, 530, 85)
    footer_box = BBox(340, 796, 480, 808)
    body = ParagraphBlock([TextSpan("Office-compatible text", body_box, font_name="Carlito-Regular")], body_box)
    footer = ParagraphBlock([TextSpan("Report | Page 1", footer_box, font_name="Carlito-Regular", font_size=8)], footer_box)
    target = tmp_path / "office-font.docx"
    DocxBuilder().build(DocumentIR([PageIR(1, 595, 842, blocks=[body, footer])]), target)
    document = Document(target)
    assert document.paragraphs[0].runs[0].font.name == "Calibri"
    assert document.paragraphs[0].runs[0].font.size.pt == 11
    assert document.sections[0].footer.paragraphs[0].runs[-1].font.name == "Calibri"


def test_report_with_table_keeps_editable_body_within_margins(tmp_path: Path):
    def body(top):
        box = BBox(65, top, 530, top + 50)
        return ParagraphBlock([TextSpan('A report paragraph with explanatory text. ' * 5, box)], box)

    page = PageIR(1, 595, 842, blocks=[
        body(60), body(125),
        TableBlock([['Description', 'Value'], ['Energy', '123']], BBox(65, 200, 530, 260)),
    ])
    target = tmp_path / 'mixed.docx'
    DocxBuilder().build(DocumentIR([page]), target)
    document = Document(target)
    assert len([p for p in document.paragraphs if p.text.strip()]) == 2
    section = document.sections[0]
    table = document.tables[0]
    assert sum(c.width.pt for c in table.columns) <= section.page_width.pt - section.left_margin.pt - section.right_margin.pt + .1
    assert table._tbl.tblPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tblInd').get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w') == '0'


def test_bottom_body_text_is_not_moved_into_footer():
    block = paragraph('The final recommendation remains part of the report.')
    block.bbox = BBox(65, 755, 530, 780)
    page = PageIR(1, 595, 842, blocks=[block])
    body, footer = DocxBuilder._split_footer_blocks(page)
    assert body == [block]
    assert footer == []


def test_keeps_pdf_display_dimensions_for_images(tmp_path: Path):
    from PIL import Image
    image_path = tmp_path / 'chart.png'
    Image.new('RGB', (400, 300), 'white').save(image_path)
    block = ImageBlock(image_path, BBox(65, 60, 465, 240), 400, 300, 'image/png')
    target = tmp_path / 'image.docx'
    DocxBuilder().build(DocumentIR([PageIR(1, 595, 842, blocks=[block])]), target)
    picture = Document(target).inline_shapes[0]
    assert picture.width.pt == 400
    assert picture.height.pt == 180


def test_building_list_does_not_modify_source(tmp_path: Path):
    item = paragraph('1. Keep source text', 'list')
    source = DocumentIR([PageIR(1, 595, 842, blocks=[item])])
    DocxBuilder().build(source, tmp_path / 'list.docx')
    assert item.text == '1. Keep source text'


def test_quality_includes_section_footers_and_styled_words(tmp_path: Path):
    from conversion_engine.services.quality import QualityEvaluator
    pages = []
    for number in (1, 2):
        box = BBox(65, 60, 530, 80)
        body = ParagraphBlock([TextSpan('con', box), TextSpan('version', box, bold=True)], box)
        footer_box = BBox(340, 796, 480, 808)
        footer = ParagraphBlock([TextSpan(f'Report | Page {number}', footer_box, font_size=8)], footer_box)
        pages.append(PageIR(number, 595, 842, blocks=[body, footer]))
    source = DocumentIR(pages)
    target = tmp_path / 'footers.docx'
    DocxBuilder().build(source, target)
    report = QualityEvaluator().evaluate(source, target)
    assert report.text_coverage == 1
    assert report.text_similarity == 1
