import { Link } from 'react-router-dom';
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import './PdfToExcel.css';

interface FileUploadType {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

function PdfToExcel() {
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

      const response = await fetch('/api/pdf-to-excel', {
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
    <div className="pdf-to-excel-page">
      <div className="pdf-to-excel-container">
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Accueil</Link>
          <span className="separator">›</span>
          <span className="current">PDF en Excel</span>
        </div>

        <div className="pdf-to-excel-header">
          <h1>PDF en Excel</h1>
          <p>Convertissez vos fichiers PDF en classeurs Excel</p>
        </div>

        <main className="pdf-to-excel-content">
          {!downloadUrl ? (
            <>
              <FileUpload 
                multiple={true}
                onFilesChange={setFiles}
                maxFiles={10}
                accept=".pdf"
              />

              {files.length > 0 && (
                <div className="pdf-to-excel-actions">
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="pdf-to-excel-button"
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
              <div className="success-icon">✓</div>
              <h2>Conversion réussie !</h2>
              <p>Vos fichiers PDF ont été convertis en Excel.</p>
              <div className="download-actions">
                <a href={downloadUrl} download="converted.xlsx" className="download-button">
                  Télécharger le fichier Excel
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

export default PdfToExcel;