from conversion_engine.analyzers.semantics import SemanticAnalyzer
from conversion_engine.domain.models import BBox, ParagraphBlock, TextSpan


def block(text: str, top: float, size: float = 11, x: float = 36, bold: bool = False):
    return ParagraphBlock(
        spans=[
            TextSpan(
                text=text,
                bbox=BBox(x, top, x + 200, top + size),
                font_size=size,
                bold=bold,
            )
        ],
        bbox=BBox(x, top, x + 200, top + size),
    )


def test_detects_headings_and_lists():
    blocks = [
        block("Annual report", 30, 22, bold=True),
        block("Introduction.", 80),
        block("• First item", 110),
        block("2. Second item", 135),
    ]
    result = SemanticAnalyzer().analyze(blocks, 595)
    assert result[0].kind == "heading"
    assert result[0].heading_level == 1
    assert result[2].kind == "list" and not result[2].list_ordered
    assert result[3].kind == "list" and result[3].list_ordered


def test_merges_wrapped_lines_into_paragraph():
    result = SemanticAnalyzer().analyze(
        [block("A wrapped line without", 50), block("terminal punctuation.", 61)],
        595,
    )
    assert len(result) == 1
    assert result[0].text == "A wrapped line without terminal punctuation."


def test_reads_two_columns_left_then_right():
    lines = [
        *(block(f"Left {index}.", 80 + index * 20, x=40) for index in range(3)),
        *(block(f"Right {index}.", 80 + index * 20, x=330) for index in range(3)),
    ]
    result = SemanticAnalyzer().analyze(lines, 595)
    assert [item.text for item in result[:3]] == ["Left 0.", "Left 1.", "Left 2."]
