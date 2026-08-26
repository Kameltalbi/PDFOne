import { Link } from 'react-router-dom';
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import './Merge.css';

interface FileUploadType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

function Merge() {
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      
      // Add files in the current order
      files.forEach((file) => {
        formData.append('files', file.file);
      });

      // Add file order
      formData.append('order', JSON.stringify(files.map((_, index) => index)));

      setProgress(30);

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to merge PDFs');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
      } else {
        throw new Error(data.error || 'Failed to merge PDFs');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during merging');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="merge-page">
      <div className="merge-container">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="separator">›</span>
          <span className="current">Fusionner PDF</span>
        </div>

        <div className="merge-header">
          <h1>Fusionner PDF</h1>
          <p>Combinez plusieurs fichiers PDF en un seul document</p>
        </div>

        <main className="merge-content">
          {!downloadUrl ? (
            <>
              <FileUpload 
                multiple={true}
                onFilesChange={setFiles}
                maxFiles={10}
              />

              {files.length >= 2 && (
                <div className="merge-actions">
                  <button
                    onClick={handleMerge}
                    disabled={isProcessing}
                    className="merge-button"
                  >
                    {isProcessing ? 'Fusion en cours...' : `Fusionner ${files.length} PDFs`}
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">{progress}% Complété</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2>PDFs fusionnés avec succès !</h2>
              <p>Vos fichiers ont été combinés en un seul PDF.</p>
              <div className="download-actions">
                <a href={downloadUrl} download="merged.pdf" className="download-button">
                  Télécharger le PDF fusionné
                </a>
                <button onClick={handleReset} className="reset-button">
                  Fusionner d'autres fichiers
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Merge;
