import { Link } from 'react-router-dom';
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import './ToJpg.css';

interface FileUploadType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

function ToJpg() {
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
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

      const response = await fetch('/api/to-jpg', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la conversion');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
      } else {
        throw new Error(data.error || 'Échec de la conversion');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la conversion');
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
    <div className="to-jpg-page">
      <div className="to-jpg-container">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="separator">›</span>
          <span className="current">PDF en JPG</span>
        </div>

        <div className="to-jpg-header">
          <h1>PDF en JPG</h1>
          <p>Convertissez vos pages PDF en images JPG haute qualité</p>
        </div>

        <main className="to-jpg-content">
          {!downloadUrl ? (
            <>
              <FileUpload 
                multiple={true}
                onFilesChange={setFiles}
                maxFiles={10}
                accept=".pdf"
              />

              {files.length > 0 && (
                <div className="to-jpg-actions">
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="to-jpg-button"
                  >
                    {isProcessing ? 'Conversion en cours...' : `Convertir ${files.length} PDF${files.length > 1 ? 's' : ''}`}
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
              <div className="success-icon">🖼️</div>
              <h2>Conversion réussie !</h2>
              <p>Vos fichiers PDF ont été convertis en images JPG.</p>
              <div className="download-actions">
                <a href={downloadUrl} download="images.zip" className="download-button">
                  Télécharger les images
                </a>
                <button onClick={handleReset} className="reset-button">
                  Convertir d'autres fichiers
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ToJpg;