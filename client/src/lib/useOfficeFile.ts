import { useCallback, useId, useState } from 'react';
import { useI18n } from '../i18n';
import { renderPdfPages } from './pdfPreview';

function extensionOf(name: string) {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
}

export function useOfficeFile(extensions: string[], options: { previewPdf?: boolean } = {}) {
  const previewPdf = options.previewPdf === true;
  const allowedKey = extensions.join(',').toLowerCase();
  const { m, t } = useI18n();
  const pickerId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const loadFile = useCallback(async (list: FileList | File[]) => {
    const allowed = new Set(allowedKey.split(','));
    const incoming = Array.from(list).find((item) => allowed.has(extensionOf(item.name)));
    if (!incoming) {
      setError(m.convert.invalidFile);
      return;
    }
    if (incoming.size > 100 * 1024 * 1024) {
      setError(t(m.common.fileTooLarge, { name: incoming.name, size: '100 MB' }));
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);
    try {
      if (previewPdf && extensionOf(incoming.name) === '.pdf') {
        const pages = await renderPdfPages(incoming);
        setThumbs(pages.slice(0, 1));
      } else {
        setThumbs([]);
      }
      setFile(incoming);
    } catch {
      setError(t(m.merge.cannotRead, { name: incoming.name }));
    } finally {
      setIsLoading(false);
    }
  }, [allowedKey, m, previewPdf, t]);

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) void loadFile(event.dataTransfer.files);
  };

  const reset = () => {
    setFile(null);
    setThumbs([]);
    setDownloadUrl(null);
    setError(null);
  };

  return {
    pickerId,
    file,
    thumbs,
    isLoading,
    isDragging,
    setIsDragging,
    error,
    setError,
    downloadUrl,
    setDownloadUrl,
    loadFile,
    onDropFiles,
    reset
  };
}
