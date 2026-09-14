import { useEffect, useState } from 'react';
import { opsRequest } from '../lib/ops';
import { formatBytes, formatDate } from './opsShared';

type SystemPayload = {
  health: {
    uptimeSec: number;
    eventLoopLagMs: number;
    memory: { rss: number; heapUsed: number; free: number };
    tempDisk: { freeBytes: number | null; totalBytes: number | null; minFreeBytes: number };
    converters: { libreoffice: boolean; tesseract: boolean; pdfToDocx: boolean };
    jobBudget?: { running?: number; waiting?: number };
  };
  converters: {
    libreofficeOk?: boolean;
    tesseractOk?: boolean;
    pdfToDocxOk?: boolean;
    pdfToExcelOk?: boolean | null;
    pdfToImageOk?: boolean | null;
  } | null;
  stripe: boolean;
  checkedAt: string;
};

function Row({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li>
      <i className={ok ? 'ops-live' : 'ops-dead'} />
      {label}
      <b>{ok ? 'OK' : 'KO'}{detail ? ` · ${detail}` : ''}</b>
    </li>
  );
}

export default function InternalOpsSystem() {
  const [data, setData] = useState<SystemPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void opsRequest<SystemPayload>('/api/admin/system?ready=1')
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Chargement impossible.'));
  }, []);

  if (error) return <p className="ops-error">{error}</p>;
  if (!data) return <p className="ops-muted">Vérification des services…</p>;

  const disk = data.health.tempDisk;
  const used = disk.totalBytes != null && disk.freeBytes != null ? disk.totalBytes - disk.freeBytes : 0;
  const pct = disk.totalBytes ? Math.round((used / disk.totalBytes) * 100) : 0;
  const conv = data.converters;

  return (
    <div className="ops-pagebody">
      <div className="ops-pagehead">
        <div>
          <h1>Système</h1>
          <p>Santé API, convertisseurs et disque temporaire. Dernière vérif. {formatDate(data.checkedAt, true)}</p>
        </div>
      </div>
      <section className="ops-panel">
        <header>
          <h2>Services</h2>
          <span className="ops-ok">Contrôle readiness</span>
        </header>
        <ul className="ops-svc">
          <Row ok label="Frontend" detail="one2pdf.com" />
          <Row ok label="API" detail={`${data.health.eventLoopLagMs} ms lag · ${Math.round(data.health.uptimeSec / 60)} min uptime`} />
          <Row ok={data.stripe} label="Stripe" />
          <Row ok={Boolean(conv?.libreofficeOk ?? data.health.converters.libreoffice)} label="Conversion Office" />
          <Row ok={Boolean(conv?.tesseractOk ?? data.health.converters.tesseract)} label="OCR" />
          <Row ok={Boolean(conv?.pdfToDocxOk ?? data.health.converters.pdfToDocx)} label="PDF → Word" />
          {conv?.pdfToExcelOk != null && <Row ok={conv.pdfToExcelOk} label="PDF → Excel" />}
          {conv?.pdfToImageOk != null && <Row ok={conv.pdfToImageOk} label="PDF → image" />}
        </ul>
      </section>
      <section className="ops-panel">
        <header>
          <h2>Stockage temporaire</h2>
        </header>
        <div className="ops-disk">
          <div className="ops-disk-bar"><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
          <p>{formatBytes(used)} / {formatBytes(disk.totalBytes)} · {pct}% · libre {formatBytes(disk.freeBytes)}</p>
        </div>
        <p className="ops-muted">
          Mémoire RSS {formatBytes(data.health.memory.rss)} · heap {formatBytes(data.health.memory.heapUsed)} ·
          RAM libre OS {formatBytes(data.health.memory.free)}
        </p>
      </section>
    </div>
  );
}
