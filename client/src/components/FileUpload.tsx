import { useState, useCallback } from 'react';
import './FileUpload.css';

interface FileUploadType {
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
}

// Local utilities (will be replaced with shared package later)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function validateFile(file: File, maxSize: number = 100 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${formatFileSize(maxSize)} limit` };
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  return { valid: true };
}

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function FileUpload({ multiple = true, onFilesChange, maxFiles = 10, accept = '.pdf' }: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((fileList: FileList) => {
    setError(null);
    const newFiles: FileUploadType[] = [];

    Array.from(fileList).forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      const fileUpload: FileUploadType = {
        id: generateUniqueId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file
      };

      newFiles.push(fileUpload);
    });

    if (newFiles.length === 0) return;

    setFiles(prev => {
      const updated = multiple ? [...prev, ...newFiles] : newFiles;
      const limited = updated.slice(0, maxFiles);
      onFilesChange?.(limited);
      return limited;
    });
  }, [multiple, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const updated = [...prev];
      const [movedFile] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedFile);
      onFilesChange?.(updated);
      return updated;
    });
  }, [onFilesChange]);

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            Drag & drop PDF files here or <span className="browse-text">browse</span>
          </p>
          <p className="upload-hint">Maximum file size: 100MB</p>
        </label>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-list">
          <h3>Files ({files.length})</h3>
          <div className="file-items">
            {files.map((file, index) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <div className="file-actions">
                  {multiple && files.length > 1 && (
                    <>
                      <button
                        onClick={() => moveFile(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                        className="move-button"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveFile(index, Math.min(files.length - 1, index + 1))}
                        disabled={index === files.length - 1}
                        className="move-button"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="remove-button"
                    title="Remove file"
                  >
                    ×
                  </button>
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
