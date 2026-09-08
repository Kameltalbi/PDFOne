from pathlib import Path

import pytest
from PIL import Image
from reportlab.lib.colors import Color, black, navy, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas


def invoice(path: Path):
    pdf = canvas.Canvas(str(path), pagesize=A4)
    pdf.setFillColor(navy)
    pdf.rect(35, 760, 90, 45, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(49, 777, "LOGO")
    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(420, 790, "INVOICE")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(420, 770, "Invoice No: INV-2026-104")
    pdf.drawString(420, 754, "Date: 08/09/2026")
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(40, 710, "SELLER")
    pdf.drawString(320, 710, "CUSTOMER")
    pdf.setFont("Helvetica", 9)
    pdf.drawString(40, 692, "One2PDF Services")
    pdf.drawString(40, 676, "seller@example.test")
    pdf.drawString(320, 692, "ACME Corporation")
    pdf.drawString(320, 676, "customer@example.test")

    xs = [40, 250, 330, 380, 455, 550]
    top, bottom = 625, 525
    for x in xs:
        pdf.line(x, top, x, bottom)
    for y in [top, 595, 560, bottom]:
        pdf.line(xs[0], y, xs[-1], y)
    headers = ["Description", "Unit price", "Qty", "Discount", "Total", "VAT"]
    values = ["Advertising page", "3000.000", "1", "10%", "2700.000", "19%"]
    pdf.setFont("Helvetica-Bold", 8)
    for x, text in zip(xs, headers):
        pdf.drawString(x + 3, 605, text)
    pdf.setFont("Helvetica", 8)
    for x, text in zip(xs, values):
        pdf.drawString(x + 3, 570, text)

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawRightString(550, 485, "Subtotal: 2700.000")
    pdf.drawRightString(550, 466, "VAT: 513.000")
    pdf.drawRightString(550, 447, "Grand total: 3213.000")
    pdf.setFont("Helvetica", 8)
    pdf.drawString(40, 65, "Bank: TEST BANK - IBAN XX00 0000 0000 0000")
    pdf.drawString(40, 48, "Legal registration 123456 - Payment due in 30 days")
    pdf.save()


@pytest.fixture()
def image_pdf_fixtures(tmp_path: Path):
    paths = {}

    paths["text"] = tmp_path / "text.pdf"
    pdf = canvas.Canvas(str(paths["text"]), pagesize=A4)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 780, "Complete text-only page")
    for index in range(20):
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, 740 - index * 25, f"Line {index + 1}: rendered text must remain visible.")
    pdf.save()

    paths["invoice"] = tmp_path / "invoice.pdf"
    invoice(paths["invoice"])

    paths["image"] = tmp_path / "image.pdf"
    logo = Image.new("RGB", (120, 80), (220, 40, 30))
    logo_path = tmp_path / "embedded.png"
    logo.save(logo_path)
    pdf = canvas.Canvas(str(paths["image"]), pagesize=A4)
    pdf.drawImage(str(logo_path), 80, 600, width=240, height=160)
    pdf.drawString(80, 570, "Text below the embedded image")
    pdf.save()

    paths["vector"] = tmp_path / "vectors.pdf"
    pdf = canvas.Canvas(str(paths["vector"]), pagesize=A4)
    for index in range(20):
        pdf.setStrokeColor(Color(index / 20, 0.2, 1 - index / 20))
        pdf.setLineWidth(2)
        pdf.line(40, 760 - index * 25, 550, 740 - index * 25)
        pdf.circle(70 + index * 20, 300, 8 + index, stroke=1, fill=0)
    pdf.save()

    paths["multipage"] = tmp_path / "multipage.pdf"
    pdf = canvas.Canvas(str(paths["multipage"]), pagesize=A4)
    for page in range(3):
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(60, 760, f"Page {page + 1}")
        pdf.showPage()
    pdf.save()

    paths["landscape"] = tmp_path / "landscape.pdf"
    pdf = canvas.Canvas(str(paths["landscape"]), pagesize=landscape(A4))
    pdf.drawString(60, 520, "Landscape content")
    pdf.line(60, 500, 750, 100)
    pdf.save()

    paths["transparency"] = tmp_path / "transparency.pdf"
    pdf = canvas.Canvas(str(paths["transparency"]), pagesize=A4)
    if hasattr(pdf, "setFillAlpha"):
        pdf.setFillAlpha(0.35)
    pdf.setFillColorRGB(1, 0, 0)
    pdf.rect(100, 500, 300, 180, fill=1, stroke=0)
    if hasattr(pdf, "setFillAlpha"):
        pdf.setFillAlpha(1)
    pdf.setFillColor(black)
    pdf.drawString(130, 580, "Text over transparency")
    pdf.save()

    paths["large"] = tmp_path / "large-page.pdf"
    pdf = canvas.Canvas(str(paths["large"]), pagesize=(3000, 3000))
    pdf.setFont("Helvetica-Bold", 40)
    pdf.drawString(100, 2800, "Large page safely capped")
    pdf.rect(100, 100, 2800, 2500, fill=0, stroke=1)
    pdf.save()

    paths["malformed"] = tmp_path / "malformed.pdf"
    paths["malformed"].write_bytes(b"%PDF-1.7\nbroken")
    return paths
