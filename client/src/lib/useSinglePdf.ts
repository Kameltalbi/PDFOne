import { useCallback, useId, useState } from 'react';
import { useI18n } from '../i18n';
import { inspectPdfFile, renderPdfPages } from './pdfPreview';

export function useSinglePdf(options: { allPages?: boolean; allowLocked?: boolean } = {}) {
  const allPages = options.allPages !== false;
  const allowLocked = options.allowLocked === true;
  const { m, t } = useI18n();
  const pickerId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const loadFile = useCallback(async (list: FileList | File[]) => {
    const incoming = Array.from(list).find((item) => item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf'));
    if (!incoming) {
      setError(m.merge.pdfOnly);
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
      if (allPages) {
        setThumbs(await renderPdfPages(incoming));
      } else {
        const info = await inspectPdfFile(incoming);
        setThumbs(info.thumb ? [info.thumb] : []);
      }
      setFile(incoming);
    } catch {
      if (allowLocked) {
        setThumbs([]);
        setFile(incoming);
      } else {
        setError(t(m.merge.cannotRead, { name: incoming.name }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [allPages, allowLocked, m, t]);

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
    setZoom(1);
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
    zoom,
    setZoom,
    downloadUrl,
    setDownloadUrl,
    loadFile,
    onDropFiles,
    reset
  };
}
