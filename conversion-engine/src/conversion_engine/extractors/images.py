from __future__ import annotations

import hashlib
import io
from pathlib import Path
from typing import Any, Dict, List, Tuple

from PIL import Image, UnidentifiedImageError

from conversion_engine.domain.models import BBox, ImageBlock


class ImageExtractor:
    """Extract decodable raster XObjects and normalize them to PNG."""

    def __init__(self, asset_dir: Path, max_pixels: int = 24_000_000):
        self.asset_dir = asset_dir
        self.max_pixels = max_pixels
        self._assets: Dict[str, Tuple[Path, int, int]] = {}

    def extract(self, page: Any, page_number: int) -> List[ImageBlock]:
        self.asset_dir.mkdir(parents=True, exist_ok=True)
        blocks: List[ImageBlock] = []
        for index, raw in enumerate(page.images):
            stream = raw.get("stream")
            try:
                data = stream.get_data() if stream is not None else b""
            except Exception:
                continue
            if not data:
                continue
            digest = hashlib.sha256(data).hexdigest()
            cached = self._assets.get(digest)
            if cached:
                target, width, height = cached
            else:
                try:
                    try:
                        image = Image.open(io.BytesIO(data))
                        image.load()
                    except UnidentifiedImageError:
                        image = self._decode_raw(stream, data)
                    with image:
                        if image.width * image.height > self.max_pixels:
                            image.thumbnail((4000, 4000))
                        normalized = image.convert("RGBA" if "A" in image.getbands() else "RGB")
                        target = self.asset_dir / f"image-{digest[:16]}.png"
                        normalized.save(target, "PNG", optimize=True)
                        width, height = normalized.size
                except (UnidentifiedImageError, OSError, ValueError):
                    continue
                self._assets[digest] = (target, width, height)
            blocks.append(
                ImageBlock(
                    path=target,
                    bbox=BBox(
                        float(raw.get("x0", 0)),
                        float(raw.get("top", 0)),
                        float(raw.get("x1", page.width)),
                        float(raw.get("bottom", page.height)),
                    ),
                    width_px=width,
                    height_px=height,
                    mime_type="image/png",
                )
            )
        return blocks

    @staticmethod
    def _decode_raw(stream: Any, data: bytes) -> Image.Image:
        attrs = getattr(stream, "attrs", {})
        width = int(attrs.get("Width", 0))
        height = int(attrs.get("Height", 0))
        bits = int(attrs.get("BitsPerComponent", 8))
        color_space = str(attrs.get("ColorSpace", ""))
        if bits != 8 or width <= 0 or height <= 0:
            raise UnidentifiedImageError("unsupported raw PDF image")
        if "DeviceRGB" in color_space:
            mode, channels = "RGB", 3
        elif "DeviceCMYK" in color_space:
            mode, channels = "CMYK", 4
        elif "DeviceGray" in color_space:
            mode, channels = "L", 1
        else:
            raise UnidentifiedImageError("unsupported PDF color space")
        if len(data) != width * height * channels:
            raise UnidentifiedImageError("unexpected raw PDF image length")
        return Image.frombytes(mode, (width, height), data)
