from __future__ import annotations

import re
from collections import defaultdict
from typing import DefaultDict, List, Sequence

from .models import BBox, SemanticZone, Table, TextLine
from .table_detector import normalize


DOCUMENT_RE = re.compile(
    r"\b(?:invoice|facture|quotation|quote|devis|statement|releve|report)\b", re.I
)
METADATA_RE = re.compile(
    r"\b(?:date|invoice\s*(?:no|number)|facture\s*n|devis\s*n|reference|ref)\b", re.I
)
SELLER_RE = re.compile(r"\b(?:seller|supplier|vendor|from|emetteur|fournisseur)\b", re.I)
CUSTOMER_RE = re.compile(r"\b(?:customer|client|bill\s*to|ship\s*to|destinataire)\b", re.I)
TOTAL_RE = re.compile(
    r"\b(?:subtotal|sous\s*total|total\s*ht|total\s*ttc|grand\s*total|discount|remise|vat|tva|tax|net\s*a\s*payer)\b",
    re.I,
)


class LayoutAnalyzer:
    def semantic_zones(
        self,
        lines: Sequence[TextLine],
        tables: Sequence[Table],
        page_number: int,
        page_width: float,
        page_height: float,
    ) -> List[SemanticZone]:
        table_boxes = [table.bbox for table in tables]
        visible = [
            line
            for line in lines
            if not any(self._inside(line.bbox, box) for box in table_boxes)
        ]
        table_top = min((box.top for box in table_boxes), default=page_height * 0.62)
        buckets: DefaultDict[str, List[str]] = defaultdict(list)
        boxes: DefaultDict[str, List[BBox]] = defaultdict(list)

        for line in visible:
            normalized = normalize(line.text)
            if not normalized:
                continue
            if line.bbox.top >= page_height * 0.87:
                self._add(buckets, boxes, "footer", line.text, line.bbox)
                continue
            if TOTAL_RE.search(normalized) and line.bbox.top >= table_top * 0.75:
                self._add(buckets, boxes, "totals", line.text, line.bbox)
                continue
            if (
                DOCUMENT_RE.search(normalized)
                or METADATA_RE.search(normalized)
                or (
                    line.bbox.top <= page_height * 0.16
                    and max((word.font_size for word in line.words), default=0) >= 14
                )
            ):
                self._add(buckets, boxes, "document_header", line.text, line.bbox)
                continue
            if line.bbox.top < table_top:
                split = self._split_party_line(line, page_width)
                if split:
                    for kind, text, bbox in split:
                        self._add(buckets, boxes, kind, text, bbox)
                else:
                    kind = self._party_kind(normalized, line.bbox, page_width)
                    self._add(buckets, boxes, kind, line.text, line.bbox)
                continue
            self._add(buckets, boxes, "other", line.text, line.bbox)

        order = ("document_header", "seller", "customer", "totals", "other", "footer")
        return [
            SemanticZone(
                kind=kind,
                lines=buckets[kind],
                page_number=page_number,
                bbox=self._union(boxes[kind]),
            )
            for kind in order
            if buckets[kind]
        ]

    def _split_party_line(self, line: TextLine, page_width: float):
        left = [word for word in line.words if word.x_center < page_width / 2]
        right = [word for word in line.words if word.x_center >= page_width / 2]
        if not left or not right:
            return []
        left_text = " ".join(word.text for word in left)
        right_text = " ".join(word.text for word in right)
        return [
            ("seller", left_text, self._words_bbox(left)),
            ("customer", right_text, self._words_bbox(right)),
        ]

    @staticmethod
    def _party_kind(normalized: str, bbox: BBox, page_width: float) -> str:
        if CUSTOMER_RE.search(normalized):
            return "customer"
        if SELLER_RE.search(normalized):
            return "seller"
        return "seller" if (bbox.x0 + bbox.x1) / 2 < page_width / 2 else "customer"

    @staticmethod
    def _inside(inner: BBox, outer: BBox) -> bool:
        center_x = (inner.x0 + inner.x1) / 2
        center_y = (inner.top + inner.bottom) / 2
        return outer.contains(center_x, center_y)

    @staticmethod
    def _add(buckets, boxes, kind: str, text: str, bbox: BBox) -> None:
        buckets[kind].append(text)
        boxes[kind].append(bbox)

    @staticmethod
    def _union(boxes: Sequence[BBox]) -> BBox:
        return BBox(
            min(box.x0 for box in boxes),
            min(box.top for box in boxes),
            max(box.x1 for box in boxes),
            max(box.bottom for box in boxes),
        )

    @staticmethod
    def _words_bbox(words) -> BBox:
        return BBox(
            min(word.bbox.x0 for word in words),
            min(word.bbox.top for word in words),
            max(word.bbox.x1 for word in words),
            max(word.bbox.bottom for word in words),
        )
