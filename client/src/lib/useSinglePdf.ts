import { useCallback, useId, useState } from 'react';
import { useI18n } from '../i18n';
import { useBilling } from './billing';
import { maxFileBytes, maxFileLabel } from './limits';
import { useUpgrade } from './upgrade';
import { inspectPdfFile, renderPdfPages } from './pdfPreview';

export function useSinglePdf(options: { allPages?: boolean; allowLocked?: boolean } = {}) {
  const allPages = options.allPages !== false;
  const { m, t } = useI18n();
  const { status } = useBilling();
  const { allowFile } = useUpgrade();
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
    const incoming = Array.from(list).find((item) => item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf'));
    if (!incoming) {
      setError(m.merge.pdfOnly);
      return;
    }
    if (!allowFile(incoming)) return;
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
      if (allPages) {
        const pages = await renderPdfPages(incoming);
        setThumbs(pages);
        setPageCount(pages.length);
      } else {
        const info = await inspectPdfFile(incoming, 1.2);
        setThumbs(info.thumb ? [info.thumb] : []);
        setPageCount(info.pages);
      }
    } catch {
      setThumbs([]);
    } finally {
      setIsLoading(false);
    }
  }, [allPages, allowFile, m, maxBytes, sizeLabel, t]);

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
