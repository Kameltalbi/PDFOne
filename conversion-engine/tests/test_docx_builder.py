from pathlib import Path

from docx import Document

from conversion_engine.builders.docx import DocxBuilder
from conversion_engine.domain.models import (
    BBox,
    DocumentIR,
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
    assert "Editable heading" in "\n".join(item.text for item in output.paragraphs)
    assert "Editable list" in "\n".join(item.text for item in output.paragraphs)
    assert output.tables[0].cell(1, 1).text == "10"
    assert len(output.sections) == 2
