import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** In-memory handoff. The file stays in router state until the tool reads it, then the state is cleared. */
export type IncomingPdfState = {
  incomingPdf?: File;
  incomingFiles?: File[];
};

export function incomingPdfFrom(state: unknown): File | null {
  const file = (state as IncomingPdfState | null | undefined)?.incomingPdf;
  return file instanceof File ? file : null;
}

export function incomingFilesFrom(state: unknown): File[] {
  const many = (state as IncomingPdfState | null | undefined)?.incomingFiles;
  if (Array.isArray(many)) {
    const files = many.filter((file): file is File => file instanceof File);
    if (files.length > 0) return files;
  }
  const one = incomingPdfFrom(state);
  return one ? [one] : [];
}

function useConsumeIncoming(read: (state: unknown) => File[], onFiles: (files: File[]) => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const onFilesRef = useRef(onFiles);
  const seen = useRef<unknown>(undefined);

  useEffect(() => {
    onFilesRef.current = onFiles;
  }, [onFiles]);

  useEffect(() => {
    if (seen.current === location.state) return;
    const files = read(location.state);
    if (files.length === 0) return;
    seen.current = location.state;
    onFilesRef.current(files);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, read]);
}

export function useIncomingPdf(onFile: (file: File) => void) {
  useConsumeIncoming(incomingPdfList, (files) => onFile(files[0]));
}

export function useIncomingFiles(onFiles: (files: File[]) => void) {
  useConsumeIncoming(incomingFilesFrom, onFiles);
}

function incomingPdfList(state: unknown): File[] {
  const file = incomingPdfFrom(state);
  return file ? [file] : [];
}
