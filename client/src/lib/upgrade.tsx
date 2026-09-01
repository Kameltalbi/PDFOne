import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBilling } from './billing';
import { FREE_MAX_FILE_BYTES } from './limits';

export type UpgradeOffer =
  | { reason: 'size'; name: string; size: number }
  | { reason: 'batch'; count: number };

type UpgradeContextValue = {
  offer: UpgradeOffer | null;
  closeUpgrade: () => void;
  allowFile: (file: File) => boolean;
  allowFiles: (files: File[]) => File[];
};

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const { status, loading } = useBilling();
  const [offer, setOffer] = useState<UpgradeOffer | null>(null);

  const closeUpgrade = useCallback(() => setOffer(null), []);

  useEffect(() => {
    if (status.paid) setOffer(null);
  }, [status.paid]);

  const allowFile = useCallback((file: File) => {
    if (loading || status.paid || file.size <= FREE_MAX_FILE_BYTES) return true;
    setOffer({ reason: 'size', name: file.name, size: file.size });
    return false;
  }, [loading, status.paid]);

  const allowFiles = useCallback((files: File[]) => {
    if (files.length === 0) return files;

    if (loading || status.paid) return files;

    if (files.length > 1) {
      setOffer({ reason: 'batch', count: files.length });
      return [];
    }

    const blocked = files.find((file) => file.size > FREE_MAX_FILE_BYTES);
    if (blocked) {
      setOffer({ reason: 'size', name: blocked.name, size: blocked.size });
      return files.filter((file) => file.size <= FREE_MAX_FILE_BYTES);
    }

    return files;
  }, [loading, status.paid]);

  const value = useMemo<UpgradeContextValue>(() => ({
    offer,
    closeUpgrade,
    allowFile,
    allowFiles
  }), [offer, closeUpgrade, allowFile, allowFiles]);

  return (
    <UpgradeContext.Provider value={value}>
      {children}
    </UpgradeContext.Provider>
  );
}

export function useUpgrade(): UpgradeContextValue {
  const context = useContext(UpgradeContext);
  if (!context) throw new Error('useUpgrade must be used inside UpgradeProvider');
  return context;
}
