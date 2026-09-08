from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

from conversion_engine.domain.models import (
    DocumentIR,
    ImageBlock,
    PageIR,
    ParagraphBlock,
    TableBlock,
)


LIST_PREFIX = re.compile(r"^\s*(?:(?:\d+|[A-Za-z])[.)]|[•●▪◦‣–-])\s+")


class DocxBuilder:
    def build(self, source: DocumentIR, output: Path) -> None:
        document = Document()
        if source.title:
            document.core_properties.title = source.title
        if source.author:
            document.core_properties.author = source.author
        document.core_properties.subject = "Converted by One2PDF"
        self._configure_styles(document)

        for index, page in enumerate(source.pages):
            section = (
                document.sections[0]
                if index == 0
                else document.add_section(WD_SECTION.NEW_PAGE)
            )
            self._configure_section(section, page)
            for block in page.blocks:
                if isinstance(block, ParagraphBlock):
                    self._add_paragraph(document, block, page)
                elif isinstance(block, TableBlock):
                    self._add_table(document, block)
                elif isinstance(block, ImageBlock):
                    self._add_image(document, block, page)

        output.parent.mkdir(parents=True, exist_ok=True)
        document.save(output)

    @staticmethod
    def _configure_styles(document: Document) -> None:
        normal = document.styles["Normal"]
        normal.font.name = "Arial"
        normal.font.size = Pt(11)
        normal.paragraph_format.space_after = Pt(5)
        for level in range(1, 4):
            style = document.styles[f"Heading {level}"]
            style.font.name = "Arial"
            style.font.color.rgb = RGBColor(0, 0, 0)
            style.font.size = Pt({1: 20, 2: 16, 3: 13}[level])
            style.paragraph_format.keep_with_next = True

    @staticmethod
    def _configure_section(section, page: PageIR) -> None:
        section.page_width = Pt(page.width)
        section.page_height = Pt(page.height)
        section.top_margin = Pt(36)
        section.bottom_margin = Pt(36)
        section.left_margin = Pt(36)
        section.right_margin = Pt(36)

    def _add_paragraph(self, document: Document, block: ParagraphBlock, page: PageIR) -> None:
        style = (
            f"Heading {block.heading_level}"
            if block.kind == "heading" and block.heading_level
            else ("List Number" if block.kind == "list" and block.list_ordered else "List Bullet")
            if block.kind == "list"
            else "Normal"
        )
        paragraph = document.add_paragraph(style=style)
        paragraph.alignment = {
            "center": WD_ALIGN_PARAGRAPH.CENTER,
            "right": WD_ALIGN_PARAGRAPH.RIGHT,
            "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
        }.get(block.alignment, WD_ALIGN_PARAGRAPH.LEFT)
        if block.kind != "list":
            paragraph.paragraph_format.left_indent = Pt(
                max(0, min(block.bbox.x0 - 36, page.width * 0.25))
            )
        else:
            paragraph.paragraph_format.left_indent = Inches(0.25 * block.list_level)

        spans = list(block.spans)
        if block.kind == "list" and spans:
            spans[0].text = LIST_PREFIX.sub("", spans[0].text, count=1)
        for span in spans:
            if not span.text:
                continue
            run = paragraph.add_run(span.text)
            run.bold = span.bold
            run.italic = span.italic
            run.font.name = self._safe_font(span.font_name)
            run.font.size = Pt(max(7, min(36, span.font_size)))
            if span.color and not all(component > 245 for component in span.color):
                run.font.color.rgb = RGBColor(*span.color)

    @staticmethod
    def _add_table(document: Document, block: TableBlock) -> None:
        columns = max((len(row) for row in block.rows), default=1)
        table = document.add_table(rows=len(block.rows), cols=columns)
        table.style = "Table Grid"
        table.autofit = True
        for row_index, values in enumerate(block.rows):
            for column_index in range(columns):
                value = values[column_index] if column_index < len(values) else ""
                table.cell(row_index, column_index).text = value

    @staticmethod
    def _add_image(document: Document, block: ImageBlock, page: PageIR) -> None:
        if not block.path.exists():
            return
        width = min(max(block.bbox.width, 36), page.width - 72)
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.add_run().add_picture(str(block.path), width=Pt(width))

    @staticmethod
    def _safe_font(value: str) -> str:
        cleaned = re.sub(r"^[A-Z]{6}\+", "", value or "")
        cleaned = re.sub(r"[^A-Za-z0-9 ._-]", "", cleaned).strip()
        return cleaned[:80] or "Arial"


def set_cell_margins(cells: Iterable, margin_twips: int = 80) -> None:
    """OOXML helper kept public for advanced table reconstruction."""
    for cell in cells:
        properties = cell._tc.get_or_add_tcPr()
        margins = properties.first_child_found_in("w:tcMar")
        if margins is None:
            margins = OxmlElement("w:tcMar")
            properties.append(margins)
        for edge in ("top", "start", "bottom", "end"):
            node = OxmlElement(f"w:{edge}")
            node.set(qn("w:w"), str(margin_twips))
            node.set(qn("w:type"), "dxa")
            margins.append(node)
