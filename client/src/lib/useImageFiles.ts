import { useCallback, useId, useState } from 'react';
import { useI18n } from '../i18n';

export type ImageItem = {
  id: string;
  file: File;
  name: string;
  thumb: string;
};

const IMAGE = /(\.jpe?g|\.png|\.webp)$/i;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useImageFiles() {
  const { m, t } = useI18n();
  const pickerId = useId();
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const loadFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list).filter((file) => file.type.startsWith('image/') || IMAGE.test(file.name));
    if (incoming.length === 0) {
      setError(m.common.imagesOnly);
      return;
    }

    const prepared: ImageItem[] = [];
    for (const file of incoming) {
      if (file.size > 100 * 1024 * 1024) {
        setError(t(m.common.fileTooLarge, { name: file.name, size: '100 MB' }));
        continue;
      }
      prepared.push({ id: uid(), file, name: file.name, thumb: URL.createObjectURL(file) });
    }
    setItems((current) => [...current, ...prepared].slice(0, 20));
  }, [m, t]);

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) loadFiles(event.dataTransfer.files);
  };

  const reset = () => {
    items.forEach((item) => URL.revokeObjectURL(item.thumb));
    setItems([]);
    setDownloadUrl(null);
    setError(null);
    setZoom(1);
  };

  return {
    pickerId,
    items,
    setItems,
    isDragging,
    setIsDragging,
    error,
    setError,
    zoom,
    setZoom,
    downloadUrl,
    setDownloadUrl,
    loadFiles,
    onDropFiles,
    reset
  };
}
