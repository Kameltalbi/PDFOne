import { useCallback, useId, useState } from 'react';
import { useI18n } from '../i18n';
import { useBilling } from './billing';
import { maxFileBytes, maxFileLabel } from './limits';
import { inspectPdfFile } from './pdfPreview';

function extensionOf(name: string) {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
}

export function useOfficeFile(extensions: string[], options: { previewPdf?: boolean } = {}) {
  const previewPdf = options.previewPdf === true;
  const allowedKey = extensions.join(',').toLowerCase();
  const { m, t } = useI18n();
  const { status } = useBilling();
  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const pickerId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const loadFile = useCallback(async (list: FileList | File[]) => {
    const allowed = new Set(allowedKey.split(','));
    const incoming = Array.from(list).find((item) => allowed.has(extensionOf(item.name)));
    if (!incoming) {
      setError(m.convert.invalidFile);
      return;
    }
    if (incoming.size > maxBytes) {
      setError(t(m.common.fileTooLarge, { name: incoming.name, size: sizeLabel }));
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);
    setThumbs([]);
    setPageCount(0);
    setFile(incoming);
    try {
      if (previewPdf && extensionOf(incoming.name) === '.pdf') {
        const info = await inspectPdfFile(incoming, 1.2);
        setThumbs(info.thumb ? [info.thumb] : []);
        setPageCount(info.pages);
      } else {
        setThumbs([]);
      }
    } catch {
      setThumbs([]);
    } finally {
      setIsLoading(false);
    }
  }, [allowedKey, m, maxBytes, previewPdf, sizeLabel, t]);

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) void loadFile(event.dataTransfer.files);
  };

  const reset = () => {
    setFile(null);
    setThumbs([]);
    setPageCount(0);
    setDownloadUrl(null);
    setError(null);
    setZoom(1);
  };

  return {
    pickerId,
    file,
    thumbs,
    pageCount,
    isLoading,
    isDragging,
    setIsDragging,
    error,
    setError,
    zoom,
    setZoom,
    downloadUrl,
    setDownloadUrl,
    loadFile,
    onDropFiles,
    reset
  };
}
