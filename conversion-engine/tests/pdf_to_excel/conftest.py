from __future__ import annotations

import io
from pathlib import Path

import pytest
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas


HEADERS = ["Description", "Prix unit.", "Qté", "Remise", "Total HT", "TVA"]
X_POSITIONS = [42, 250, 330, 375, 445, 525]


def draw_row(pdf, y, values, xs=X_POSITIONS, bold=False):
    pdf.setFont("Helvetica-Bold" if bold else "Helvetica", 9)
    for x, value in zip(xs, values):
        pdf.drawString(x, y, str(value))


def draw_parties(pdf):
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(42, 730, "Émetteur")
    pdf.drawString(330, 730, "Client")
    pdf.setFont("Helvetica", 9)
    pdf.drawString(42, 714, "SoftFacture SARL")
    pdf.drawString(330, 714, "ACME Customer")
    pdf.drawString(42, 699, "seller@example.test")
    pdf.drawString(330, 699, "customer@example.test")
    pdf.drawString(42, 684, "TVA: FR001234")
    pdf.drawString(330, 684, "Paris, France")


def make_invoice(path: Path, title="FACTURE", multi_page=False):
    pdf = canvas.Canvas(str(path), pagesize=A4)
    pages = 2 if multi_page else 1
    for page in range(pages):
        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawString(420, 790, title)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(420, 772, f"N° SF-2026-{page + 1:03d}")
        pdf.drawString(420, 756, "Date: 07/09/2026")
        draw_parties(pdf)
        draw_row(pdf, 630, HEADERS, bold=True)
        draw_row(pdf, 606, [f"Page publicité {page + 1}", "3000.000", "1", "10%", "2700.000", "19%"])
        draw_row(pdf, 582, ["Service design", "500.000", "2", "0%", "1000.000", "19%"])
        if page == pages - 1:
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(405, 525, "Total HT: 3700.000")
            pdf.drawString(405, 507, "TVA: 703.000")
            pdf.drawString(405, 489, "Total TTC: 4403.000")
        pdf.setFont("Helvetica", 8)
        pdf.drawString(42, 40, "Conditions de paiement et informations bancaires")
        pdf.showPage()
    pdf.save()


def make_grid_table(path: Path, multiple=False):
    pdf = canvas.Canvas(str(path), pagesize=A4)
    tables = [(650, [["Item", "Qty", "Amount"], ["A", "2", "20.00"], ["B", "3", "45.00"]])]
    if multiple:
        tables.append((430, [["Tax", "Rate", "Value"], ["VAT", "19%", "12.35"]]))
    for top, rows in tables:
        xs = [50, 260, 360, 520]
        row_height = 24
        for x in xs:
            pdf.line(x, top, x, top - len(rows) * row_height)
        for index in range(len(rows) + 1):
            y = top - index * row_height
            pdf.line(xs[0], y, xs[-1], y)
        for row_index, row in enumerate(rows):
            draw_row(pdf, top - (row_index + 1) * row_height + 8, row, xs[:-1], bold=row_index == 0)
    pdf.save()


def make_borderless(path: Path, page_size=A4):
    pdf = canvas.Canvas(str(path), pagesize=page_size)
    xs = [50, 270, 380]
    draw_row(pdf, 650, ["Product", "Quantity", "Unit price"], xs, bold=True)
    draw_row(pdf, 625, ["Alpha", "2", "15.50"], xs)
    draw_row(pdf, 600, ["Beta", "4", "7.25"], xs)
    draw_row(pdf, 575, ["Gamma", "1", "99.00"], xs)
    pdf.save()


@pytest.fixture()
def pdf_fixtures(tmp_path: Path):
    paths = {}
    paths["softfacture"] = tmp_path / "softfacture-invoice.pdf"
    make_invoice(paths["softfacture"])
    paths["quotation"] = tmp_path / "quotation.pdf"
    make_invoice(paths["quotation"], title="DEVIS")
    paths["bordered"] = tmp_path / "bordered.pdf"
    make_grid_table(paths["bordered"])
    paths["borderless"] = tmp_path / "borderless.pdf"
    make_borderless(paths["borderless"])
    paths["multipage"] = tmp_path / "multipage.pdf"
    make_invoice(paths["multipage"], multi_page=True)
    paths["multiple"] = tmp_path / "multiple-tables.pdf"
    make_grid_table(paths["multiple"], multiple=True)
    paths["landscape"] = tmp_path / "landscape.pdf"
    make_borderless(paths["landscape"], landscape(A4))
    paths["image"] = tmp_path / "text-image.pdf"
    image = Image.new("RGB", (80, 40), (25, 100, 150))
    image_path = tmp_path / "logo.png"
    image.save(image_path)
    pdf = canvas.Canvas(str(paths["image"]), pagesize=A4)
    pdf.drawImage(str(image_path), 40, 730, width=80, height=40)
    draw_row(pdf, 650, ["Item", "Qty", "Amount"], [50, 270, 380], bold=True)
    draw_row(pdf, 625, ["Visual service", "1", "50.00"], [50, 270, 380])
    pdf.save()
    paths["malformed"] = tmp_path / "malformed.pdf"
    paths["malformed"].write_bytes(b"%PDF-1.7\nnot a valid document")
    return paths
