import { useCallback, useEffect, useId, useState } from 'react';
import { renderPdfPage } from '../lib/pdfPreview';
import { formatFileSize } from '../lib/api';
import { useBilling } from '../lib/billing';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { useI18n } from '../i18n';
import './FileUpload.css';

export interface FileUploadType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface FileUploadProps {
  multiple?: boolean;
  onFilesChange?: (files: FileUploadType[]) => void;
  maxFiles?: number;
  accept?: string;
  preview?: boolean;
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isImage(file: File) {
  return file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
}

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function FileThumb({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (isImage(file)) {
      objectUrl = URL.createObjectURL(file);
      setSrc(objectUrl);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    renderPdfPage(file, 1).then((url) => {
      if (!cancelled) setSrc(url);
    }).catch(() => {
      if (!cancelled) setSrc(null);
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return src
    ? <img src={src} alt="" className="file-thumb" />
    : <div className="file-thumb placeholder">PDF</div>;
}

function FileUpload({
  multiple = true,
  onFilesChange,
  maxFiles = 10,
  accept = '.pdf,application/pdf',
  preview = true
}: FileUploadProps) {
  const { m, t } = useI18n();
  const { status } = useBilling();
  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const inputId = useId();
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setError(null);
    const next: FileUploadType[] = [];
    for (const file of incoming) {
      const validationError = (() => {
        if (file.size > maxBytes) return t(m.common.fileTooLarge, { name: file.name, size: sizeLabel });
        const imagesOnly = accept.includes('image') && !accept.includes('pdf');
        if (imagesOnly && !isImage(file)) return m.common.imagesOnly;
        if (!imagesOnly && !isPdf(file)) return m.common.pdfOnly;
        return null;
      })();
      if (validationError) {
        setError(validationError);
        continue;
      }
      next.push({
        id: generateUniqueId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file
      });
    }
    if (next.length === 0) return;

    setFiles((prev) => {
      const updated = multiple ? [...prev, ...next] : next.slice(0, 1);
      const limited = updated.slice(0, maxFiles);
      if (updated.length > maxFiles) {
        setError(t(m.common.maxFiles, { count: maxFiles }));
      }
      onFilesChange?.(limited);
      return limited;
    });
  }, [accept, maxBytes, maxFiles, multiple, onFilesChange, m, sizeLabel, t]);

  const handleDropZone = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id);
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  const imagesOnly = accept.includes('image') && !accept.includes('pdf');

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={handleDropZone}
      >
        <input
          type="file"
          id={inputId}
          multiple={multiple}
          accept={accept}
          onChange={(event) => {
            if (event.target.files) processFiles(event.target.files);
            event.target.value = '';
          }}
          className="file-input"
        />
        <label htmlFor={inputId} className="upload-label">
          <div className="upload-icon">{imagesOnly ? '🖼️' : '📁'}</div>
          <p className="upload-text">
            {m.upload.drop} <span className="browse-text">{m.upload.browse}</span>
          </p>
          <p className="upload-hint">
            {imagesOnly ? m.upload.hintImages : m.upload.hintPdf} · {t(m.upload.hintMax, { count: maxFiles })}
          </p>
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      {files.length > 0 && (
        <div className="file-list">
          <h3>{t(m.upload.listTitle, { count: files.length })}</h3>
          <div className="file-items">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={`file-item ${dragIndex === index ? 'dragging' : ''}`}
                draggable={multiple && files.length > 1}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (dragIndex !== null) moveFile(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
              >
                {preview && <FileThumb file={file.file} />}
                <div className="file-info">
                  <span className="file-index">{index + 1}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <div className="file-actions">
                  {multiple && files.length > 1 && (
                    <>
                      <button type="button" onClick={() => moveFile(index, index - 1)} disabled={index === 0} className="move-button" title={m.upload.up}>↑</button>
                      <button type="button" onClick={() => moveFile(index, index + 1)} disabled={index === files.length - 1} className="move-button" title={m.upload.down}>↓</button>
                    </>
                  )}
                  <button type="button" onClick={() => removeFile(file.id)} className="remove-button" title={m.upload.remove}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
