from conversion_engine.domain.models import BBox
from conversion_engine.extractors.tables import TableExtractor
from conversion_engine.extractors.text import TextExtractor


class FakePage:
    chars = [
        {"text": "H", "x0": 10, "x1": 17, "top": 10, "bottom": 22, "size": 12, "fontname": "ABCDEF+Arial-Bold", "non_stroking_color": (0, 0, 0)},
        {"text": "i", "x0": 17, "x1": 20, "top": 10, "bottom": 22, "size": 12, "fontname": "ABCDEF+Arial-Bold", "non_stroking_color": (0, 0, 0)},
        {"text": "X", "x0": 100, "x1": 108, "top": 30, "bottom": 42, "size": 12, "fontname": "Arial", "non_stroking_color": (1, 0, 0)},
    ]


def test_extracts_positions_and_styles_and_exclusions():
    blocks = TextExtractor().extract(FakePage())
    assert [block.text for block in blocks] == ["Hi", "X"]
    assert blocks[0].spans[0].bold
    assert blocks[0].spans[0].font_name == "Arial-Bold"
    assert blocks[1].spans[0].color == (255, 0, 0)

    visible = TextExtractor().extract(FakePage(), [BBox(90, 25, 120, 50)])
    assert [block.text for block in visible] == ["Hi"]


class FakeTable:
    bbox = (10, 20, 300, 120)

    def extract(self):
        return [["Item", "Price"], ["A", "10"]]


class FakeTablePage:
    def find_tables(self, table_settings):
        assert table_settings["vertical_strategy"] == "lines"
        return [FakeTable()]


def test_extracts_simple_table():
    result = TableExtractor().extract(FakeTablePage())
    assert result[0].rows == [["Item", "Price"], ["A", "10"]]
    assert result[0].bbox == BBox(10, 20, 300, 120)
