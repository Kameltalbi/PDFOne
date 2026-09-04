import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type IncomingPdfState = { incomingPdf?: File };

export function incomingPdfFrom(state: unknown): File | null {
  const file = (state as IncomingPdfState | null | undefined)?.incomingPdf;
  return file instanceof File ? file : null;
}

export function useIncomingPdf(onFile: (file: File) => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const onFileRef = useRef(onFile);

  useEffect(() => {
    onFileRef.current = onFile;
  }, [onFile]);

  useEffect(() => {
    const file = incomingPdfFrom(location.state);
    if (!file) return;
    onFileRef.current(file);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);
}
