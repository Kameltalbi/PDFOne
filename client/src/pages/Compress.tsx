import { Link } from 'react-router-dom';
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import './Compress.css';

interface FileUploadType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

function Compress() {
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier PDF');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file.file);
      });

      setProgress(30);

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la compression');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
      } else {
        throw new Error(data.error || 'Échec de la compression');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la compression');
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
    <div className="compress-page">
      <div className="compress-container">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="separator">›</span>
          <span className="current">Compresser PDF</span>
        </div>

        <div className="compress-header">
          <h1>Compresser PDF</h1>
          <p>Réduisez la taille de vos fichiers PDF tout en conservant la qualité</p>
        </div>

        <main className="compress-content">
          {!downloadUrl ? (
            <>
              <FileUpload 
                multiple={true}
                onFilesChange={setFiles}
                maxFiles={10}
                accept=".pdf"
              />

              {files.length > 0 && (
                <div className="compress-actions">
                  <button
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="compress-button"
                  >
                    {isProcessing ? 'Compression en cours...' : `Compresser ${files.length} PDF${files.length > 1 ? 's' : ''}`}
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
              <h2>Compression réussie !</h2>
              <p>Vos fichiers PDF ont été compressés avec succès.</p>
              <div className="download-actions">
                <a href={downloadUrl} download="compressed.pdf" className="download-button">
                  Télécharger le PDF compressé
                </a>
                <button onClick={handleReset} className="reset-button">
                  Compresser d'autres fichiers
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Compress;