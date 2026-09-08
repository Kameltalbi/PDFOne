import errno
import logging
from pathlib import Path
from types import SimpleNamespace

import pytest
from docx import Document

from conversion_engine.domain.models import BBox, DocumentIR, PageIR, ParagraphBlock, TextSpan
from conversion_engine.services import conversion


@pytest.mark.parametrize('error_number', [errno.EXDEV, errno.EACCES])
def test_publishes_atomically_across_volumes(tmp_path: Path, monkeypatch, error_number):
    source = tmp_path / 'source.pdf'
    source.write_bytes(b'input handled by the analyzer stub')
    target = tmp_path / 'result.docx'
    target.write_bytes(b'previous result')
    box = BBox(65, 60, 530, 80)
    ir = DocumentIR([PageIR(1, 595, 842, blocks=[
        ParagraphBlock([TextSpan('Editable result', box)], box),
    ])])
    service = conversion.ConversionService(
        logging.getLogger(__name__),
        analyzer=SimpleNamespace(analyze=lambda *args: ir),
    )
    original_replace = conversion.os.replace
    calls = []

    def replace(source_path, destination):
        calls.append(Path(source_path))
        if len(calls) == 1:
            raise OSError(error_number, 'simulated filesystem error')
        assert Path(source_path).parent == target.parent
        assert target.read_bytes() == b'previous result'
        original_replace(source_path, destination)

    monkeypatch.setattr(conversion.os, 'replace', replace)
    request = conversion.ConversionRequest(source, target)
    if error_number == errno.EXDEV:
        service.convert(request)
        assert Document(target).paragraphs[0].text == 'Editable result'
        assert len(calls) == 2
    else:
        with pytest.raises(OSError) as caught:
            service.convert(request)
        assert caught.value.errno == errno.EACCES
        assert target.read_bytes() == b'previous result'
        assert len(calls) == 1
    assert sorted(path.name for path in tmp_path.iterdir()) == ['result.docx', 'source.pdf']
