import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';
import { StudioLanding, StudioProcessing, StudioResult } from '../components/PdfStudio';
import { postForm } from '../lib/api';
import { useBilling } from '../lib/billing';
import {
  clientToPdf,
  cssDeltaToPdf,
  formatLocaleDate,
  pdfBoxToCss,
  rasterizeCursive,
  trimTransparentPng,
  uid,
  type FillSignItem,
  type FillSignTool,
  type FormWidget
} from '../lib/fillSign';
import { maxFileBytes, maxFileLabel } from '../lib/limits';
import { ensurePdfWorker } from '../lib/pdfPreview';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useUpgrade } from '../lib/upgrade';
import { useI18n } from '../i18n';
import { trackFileUpload } from '../lib/analytics';
import './FillSign.css';

ensurePdfWorker();

type StampMode = 'signature' | 'initials';
type ModalTab = 'draw' | 'type' | 'import';

function PageCanvas({
  pdf,
  pageNumber,
  zoom,
  items,
  widgets,
  values,
  tool,
  selectedId,
  onSelect,
  onUpdate,
  onPlace,
  onDraw,
  onWidgetChange
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  items: FillSignItem[];
  widgets: FormWidget[];
  values: Record<string, string | boolean>;
  tool: FillSignTool;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (item: FillSignItem) => void;
  onPlace: (point: { x: number; y: number }, pageIndex: number) => void;
  onDraw: (points: Array<{ x: number; y: number }>) => void;
  onWidgetChange: (name: string, value: string | boolean) => void;
}) {
  const { m } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const drag = useRef<{ id: string; mode: 'move' | 'resize'; start: { x: number; y: number }; origin: FillSignItem } | null>(null);
  const drawPts = useRef<Array<{ x: number; y: number }>>([]);
  const [preview, setPreview] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    let active = true;
    pdf.getPage(pageNumber).then((loaded) => { if (active) setPage(loaded); });
    return () => { active = false; };
  }, [pdf, pageNumber]);

  useEffect(() => {
    if (!page || !canvasRef.current) return;
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1.45, 860 / base.width) * zoom;
    const next = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(next.width * ratio);
    canvas.height = Math.floor(next.height * ratio);
    canvas.style.width = `${next.width}px`;
    canvas.style.height = `${next.height}px`;
    const context = canvas.getContext('2d');
    if (!context) return;
    const task = page.render({
      canvas,
      canvasContext: context,
      viewport: next,
      transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0]
    });
    setViewport(next);
    return () => task.cancel();
  }, [page, zoom]);

  const pageItems = items.filter((item) => item.page === pageNumber - 1);
  const pageWidgets = widgets.filter((item) => item.page === pageNumber - 1);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!viewport || !layerRef.current) return;
    const bounds = layerRef.current.getBoundingClientRect();
    if (tool === 'draw') {
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = clientToPdf(viewport, bounds, event.clientX, event.clientY);
      drawPts.current = [point];
      setPreview([point]);
      return;
    }
    if (tool !== 'select') {
      onPlace(clientToPdf(viewport, bounds, event.clientX, event.clientY), pageNumber - 1);
    } else {
      onSelect(null);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!viewport || !layerRef.current) return;
    const bounds = layerRef.current.getBoundingClientRect();
    if (tool === 'draw' && drawPts.current.length) {
      const next = [...drawPts.current, clientToPdf(viewport, bounds, event.clientX, event.clientY)];
      drawPts.current = next;
      setPreview(next);
      return;
    }
    const current = drag.current;
    if (!current) return;
    const { dx, dy } = cssDeltaToPdf(viewport, bounds, current.start, event.clientX, event.clientY);
    const origin = current.origin;
    if (origin.type === 'drawing') return;
    if (current.mode === 'resize') {
      onUpdate({
        ...origin,
        width: Math.max(8, origin.width + dx),
        height: Math.max(8, origin.height + dy)
      });
    } else {
      onUpdate({ ...origin, x: origin.x + dx, y: origin.y + dy });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool === 'draw' && drawPts.current.length > 1) onDraw(drawPts.current);
    drawPts.current = [];
    setPreview([]);
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="fs-page" id={`fs-page-${pageNumber}`}>
      <span className="fs-page-label">{m.common.page} {pageNumber}</span>
      <div className={`fs-sheet tool-${tool}`} ref={layerRef}>
        <canvas ref={canvasRef} />
        <div
          className="fs-layer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {viewport && pageWidgets.map((widget) => {
            const style = pdfBoxToCss(viewport, widget.x, widget.y, widget.width, widget.height);
            if (widget.type === 'checkbox') {
              return (
                <label key={widget.id} className="fs-widget fs-widget-check" style={style} onPointerDown={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={Boolean(values[widget.name])}
                    disabled={widget.readOnly}
                    onChange={(event) => onWidgetChange(widget.name, event.target.checked)}
                    aria-label={widget.name}
                  />
                </label>
              );
            }
            if (widget.type === 'dropdown') {
              return (
                <select
                  key={widget.id}
                  className="fs-widget"
                  style={style}
                  value={String(values[widget.name] ?? '')}
                  disabled={widget.readOnly}
                  aria-label={widget.name}
                  onPointerDown={(event) => event.stopPropagation()}
                  onChange={(event) => onWidgetChange(widget.name, event.target.value)}
                >
                  <option value="">{m.fillSign.choose}</option>
                  {(widget.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              );
            }
            if (widget.type === 'radio') {
              return (
                <label key={widget.id} className="fs-widget fs-widget-check" style={style} onPointerDown={(event) => event.stopPropagation()}>
                  <input
                    type="radio"
                    name={`fs-${widget.name}`}
                    checked={values[widget.name] === (widget.radioValue || '')}
                    disabled={widget.readOnly}
                    onChange={() => onWidgetChange(widget.name, widget.radioValue || '')}
                    aria-label={widget.name}
                  />
                </label>
              );
            }
            return (
              <input
                key={widget.id}
                className="fs-widget"
                style={style}
                value={String(values[widget.name] ?? '')}
                disabled={widget.readOnly}
                aria-label={widget.name}
                onPointerDown={(event) => event.stopPropagation()}
                onChange={(event) => onWidgetChange(widget.name, event.target.value)}
              />
            );
          })}
          {viewport && pageItems.map((item) => {
            if (item.type === 'drawing') {
              const xs = item.points.map((point) => point.x);
              const ys = item.points.map((point) => point.y);
              const minX = Math.min(...xs);
              const minY = Math.min(...ys);
              const maxX = Math.max(...xs);
              const maxY = Math.max(...ys);
              const style = pdfBoxToCss(viewport, minX, minY, Math.max(8, maxX - minX), Math.max(8, maxY - minY));
              const left = parseFloat(style.left);
              const top = parseFloat(style.top);
              const boxW = parseFloat(style.width);
              const boxH = parseFloat(style.height);
              const points = item.points.map((point) => {
                const [x, y] = viewport.convertToViewportPoint(point.x, point.y);
                const px = (x / viewport.width) * 100;
                const py = (y / viewport.height) * 100;
                return `${((px - left) / boxW) * 100},${((py - top) / boxH) * 100}`;
              }).join(' ');
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`fs-item drawing${selectedId === item.id ? ' selected' : ''}`}
                  style={style}
                  aria-label={m.fillSign.draw}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelect(item.id);
                  }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" points={points} />
                  </svg>
                </button>
              );
            }
            const style = pdfBoxToCss(viewport, item.x, item.y, item.width, item.height);
            return (
              <div
                key={item.id}
                className={`fs-item ${item.type}${selectedId === item.id ? ' selected' : ''}`}
                style={style}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (!viewport || !layerRef.current) return;
                  onSelect(item.id);
                  const bounds = layerRef.current.getBoundingClientRect();
                  drag.current = {
                    id: item.id,
                    mode: (event.target as HTMLElement).dataset.handle ? 'resize' : 'move',
                    start: clientToPdf(viewport, bounds, event.clientX, event.clientY),
                    origin: item
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
              >
                {item.type === 'text' ? (
                  <textarea
                    value={item.text}
                    aria-label={m.fillSign.text}
                    onChange={(event) => onUpdate({ ...item, text: event.target.value.slice(0, 240) })}
                    onPointerDown={(event) => event.stopPropagation()}
                    style={{ fontSize: `${item.size}px`, fontWeight: item.bold ? 700 : 500, color: item.color }}
                  />
                ) : item.type === 'image' ? (
                  <img src={item.dataUrl} alt={item.kind === 'initials' ? m.fillSign.initials : m.fillSign.signature} draggable={false} />
                ) : (
                  <span className={`fs-mark ${item.kind}`} style={{ color: item.color }} aria-hidden="true">
                    {item.kind === 'checkbox' ? '☑' : item.kind === 'check' ? '✓' : item.kind === 'cross' ? '✕' : '○'}
                  </span>
                )}
                {selectedId === item.id && <i data-handle="1" className="fs-handle" />}
              </div>
            );
          })}
          {viewport && preview.length > 1 && (
            <svg className="fs-preview" viewBox={`0 0 ${viewport.width} ${viewport.height}`} aria-hidden="true">
              <polyline
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={preview.map((point) => {
                  const [x, y] = viewport.convertToViewportPoint(point.x, point.y);
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}

function StampModal({
  mode,
  tab,
  typed,
  onTab,
  onTyped,
  onClose,
  onConfirm,
  saved
}: {
  mode: StampMode;
  tab: ModalTab;
  typed: string;
  onTab: (tab: ModalTab) => void;
  onTyped: (value: string) => void;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
  saved: string | null;
}) {
  const { m } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Array<{ x: number; y: number } | null>>([]);
  const drawing = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const title = mode === 'initials' ? m.fillSign.initialsTitle : m.fillSign.signatureTitle;

  const redraw = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#111827';
    context.lineWidth = mode === 'initials' ? 3.2 : 2.6;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    let started = false;
    context.beginPath();
    for (const point of points.current) {
      if (!point) { started = false; continue; }
      if (!started) { context.moveTo(point.x, point.y); started = true; }
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
  };

  const pointerPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (event.currentTarget.width / bounds.width),
      y: (event.clientY - bounds.top) * (event.currentTarget.height / bounds.height)
    };
  };

  const confirm = async () => {
    if (tab === 'type') {
      const value = typed.trim();
      if (!value) return;
      onConfirm(rasterizeCursive(value, mode));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = await trimTransparentPng(canvas.toDataURL('image/png'));
    onConfirm(dataUrl);
  };

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const image = new Image();
      const dataUrl = String(reader.result);
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(); image.src = dataUrl; });
      const canvas = document.createElement('canvas');
      const max = 900;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      onConfirm(await trimTransparentPng(canvas.toDataURL('image/png')));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fs-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="fs-modal" role="dialog" aria-modal="true" aria-labelledby="fs-stamp-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="fs-stamp-title">{title}</h2>
        <div className="fs-tabs" role="tablist">
          {(['draw', 'type', 'import'] as const).map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => onTab(item)}>
              {item === 'draw' ? m.fillSign.drawTab : item === 'type' ? m.fillSign.typeTab : m.fillSign.importTab}
            </button>
          ))}
        </div>
        {tab === 'draw' && (
          <canvas
            ref={canvasRef}
            className="fs-sign-pad"
            width={640}
            height={220}
            aria-label={title}
            onPointerDown={(event) => {
              drawing.current = true;
              points.current.push(pointerPos(event));
              event.currentTarget.setPointerCapture(event.pointerId);
              redraw();
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return;
              points.current.push(pointerPos(event));
              redraw();
            }}
            onPointerUp={() => { drawing.current = false; points.current.push(null); }}
          />
        )}
        {tab === 'type' && (
          <div className="fs-type-wrap">
            <input value={typed} onChange={(event) => onTyped(event.target.value)} maxLength={mode === 'initials' ? 8 : 48} placeholder={mode === 'initials' ? 'JD' : m.fillSign.typePlaceholder} />
            <p className="fs-type-preview" aria-hidden="true">{typed.trim() || '—'}</p>
          </div>
        )}
        {tab === 'import' && (
          <div className="fs-import">
            <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => loadFile(event.target.files?.[0])} />
            <button type="button" className="fs-secondary" onClick={() => fileRef.current?.click()}>{m.fillSign.chooseImage}</button>
            <p>{m.fillSign.importHint}</p>
          </div>
        )}
        <div className="fs-modal-actions">
          {tab === 'draw' && <button type="button" className="fs-ghost" onClick={() => { points.current = []; redraw(); }}>{m.fillSign.clearPad}</button>}
          {saved && <button type="button" className="fs-ghost" onClick={() => onConfirm(saved)}>{m.fillSign.reuseLast}</button>}
          <button type="button" className="fs-ghost" onClick={onClose}>{m.fillSign.cancel}</button>
          <button type="button" className="fs-primary" onClick={() => void confirm()}>{m.fillSign.useStamp}</button>
        </div>
      </div>
    </div>
  );
}

function FillSign() {
  const { m, t, locale } = useI18n();
  usePageSeo(m.fillSign.seoTitle, m.fillSign.seoDescription);
  const { status } = useBilling();
  const { allowFile } = useUpgrade();
  const pickerId = useId();
  const maxBytes = maxFileBytes(status.paid);
  const sizeLabel = maxFileLabel(status.paid);
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [items, setItems] = useState<FillSignItem[]>([]);
  const [redo, setRedo] = useState<FillSignItem[][]>([]);
  const [history, setHistory] = useState<FillSignItem[][]>([]);
  const [widgets, setWidgets] = useState<FormWidget[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [tool, setTool] = useState<FillSignTool>('text');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [stampOpen, setStampOpen] = useState<StampMode | null>(null);
  const [stampTab, setStampTab] = useState<ModalTab>('draw');
  const [typed, setTyped] = useState('');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [savedInitials, setSavedInitials] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);

  useEffect(() => {
    document.body.classList.toggle('fs-editing', Boolean(pdf) && !downloadUrl && !exporting);
    return () => document.body.classList.remove('fs-editing');
  }, [pdf, downloadUrl, exporting]);

  const commit = useCallback((next: FillSignItem[]) => {
    setHistory((stack) => [...stack.slice(-40), items]);
    setRedo([]);
    setItems(next);
  }, [items]);

  const readWidgets = async (document: PDFDocumentProxy) => {
    const found: FormWidget[] = [];
    const nextValues: Record<string, string | boolean> = {};
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const annotations = await page.getAnnotations();
      const [, , pageW, pageH] = [page.view[0], page.view[1], page.view[2] - page.view[0], page.view[3] - page.view[1]];
      for (const annotation of annotations as Array<Record<string, unknown>>) {
        if (annotation.subtype !== 'Widget' || !annotation.fieldName || annotation.readOnly) continue;
        const rect = annotation.rect as number[] | undefined;
        if (!rect || rect.length < 4) continue;
        const x = Math.min(rect[0], rect[2]) - page.view[0];
        const y = Math.min(rect[1], rect[3]) - page.view[1];
        const width = Math.abs(rect[2] - rect[0]);
        const height = Math.abs(rect[3] - rect[1]);
        if (width < 1 || height < 1 || x > pageW || y > pageH) continue;
        const name = String(annotation.fieldName);
        const fieldType = String(annotation.fieldType || '');
        let type: FormWidget['type'] = 'text';
        if (annotation.checkBox || (fieldType === 'Btn' && !annotation.radioButton)) type = 'checkbox';
        if (annotation.radioButton) type = 'radio';
        if (annotation.choice || fieldType === 'Ch') type = 'dropdown';
        const options = Array.isArray(annotation.options)
          ? (annotation.options as Array<{ exportValue?: string; displayValue?: string }>).map((option) => option.exportValue || option.displayValue || '').filter(Boolean)
          : annotation.buttonValue ? [String(annotation.buttonValue)] : [];
        found.push({
          id: `${name}-${index}-${found.length}`,
          page: index - 1,
          name,
          type,
          x, y, width, height,
          options,
          radioValue: annotation.buttonValue ? String(annotation.buttonValue) : undefined,
          readOnly: Boolean(annotation.readOnly)
        });
        if (!(name in nextValues)) {
          const raw = annotation.fieldValue;
          nextValues[name] = type === 'checkbox' ? Boolean(raw) : String(raw ?? '');
        }
      }
    }
    setWidgets(found);
    setValues(nextValues);
  };

  const openPdf = async (selected: File) => {
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(m.common.pdfOnly);
      return;
    }
    if (!allowFile(selected)) return;
    if (selected.size > maxBytes) {
      setError(t(m.common.fileTooLarge, { name: selected.name, size: sizeLabel }));
      return;
    }
    try {
      setError('');
      const loaded = await pdfjsLib.getDocument({ data: await selected.arrayBuffer() }).promise;
      setFile(selected);
      setPdf(loaded);
      setItems([]);
      setHistory([]);
      setRedo([]);
      setActivePage(0);
      setDownloadUrl('');
      await readWidgets(loaded);
      const preview: string[] = [];
      for (let index = 1; index <= loaded.numPages; index += 1) {
        const page = await loaded.getPage(index);
        const viewport = page.getViewport({ scale: 0.22 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          preview.push(canvas.toDataURL('image/png'));
        }
      }
      setThumbs(preview);
      trackFileUpload(selected);
    } catch {
      setError(m.fillSign.cannotOpen);
    }
  };

  const placeStamp = (dataUrl: string, kind: StampMode) => {
    if (!pdf) return;
    void pdf.getPage(activePage + 1).then((page) => {
      const pageW = page.view[2] - page.view[0];
      const pageH = page.view[3] - page.view[1];
      const width = pageW * (kind === 'initials' ? 0.14 : 0.28);
      const height = width * 0.38;
      commit([...items, {
        id: uid(),
        type: 'image',
        page: activePage,
        x: pageW * 0.12,
        y: pageH * 0.08,
        width,
        height,
        dataUrl,
        kind
      }]);
      setTool('select');
      setSelectedId(null);
      if (kind === 'signature') setSavedSignature(dataUrl);
      else setSavedInitials(dataUrl);
    });
  };

  const onPlace = (point: { x: number; y: number }, pageIndex: number) => {
    setActivePage(pageIndex);
    const color = '#111827';
    if (tool === 'text' || tool === 'date') {
      const text = tool === 'date' ? formatLocaleDate(locale) : m.fillSign.defaultText;
      const size = tool === 'date' ? 13 : 14;
      const next: FillSignItem = {
        id: uid(), type: 'text', page: pageIndex, x: point.x, y: point.y, width: tool === 'date' ? 110 : 160, height: size * 1.5, text, size, color
      };
      commit([...items, next]);
      setSelectedId(next.id);
      setTool('select');
      return;
    }
    if (tool === 'checkbox' || tool === 'check' || tool === 'cross' || tool === 'circle') {
      const size = tool === 'circle' ? 22 : 16;
      const next: FillSignItem = {
        id: uid(), type: 'mark', page: pageIndex, x: point.x - size / 2, y: point.y - size / 2, width: size, height: size, kind: tool, color: '#dc2626'
      };
      commit([...items, next]);
      setSelectedId(next.id);
      setTool('select');
    }
  };

  const exportPdf = async () => {
    if (!file) return;
    setExporting(true);
    setProgress(30);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('annotations', JSON.stringify(items.map(({ id: _id, ...item }) => {
        if (item.type === 'image') {
          const { kind: _kind, ...rest } = item;
          return rest;
        }
        return item;
      })));
      formData.append('formValues', JSON.stringify(values));
      setProgress(65);
      const result = await postForm('/api/pages/fill-sign', formData);
      setProgress(100);
      setDownloadUrl(result.downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.fillSign.fail);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setPdf(null);
    setItems([]);
    setWidgets([]);
    setValues({});
    setDownloadUrl('');
    setError('');
    setThumbs([]);
  };

  const selected = items.find((item) => item.id === selectedId) || null;
  const tools: Array<{ id: FillSignTool; label: string; icon: string }> = [
    { id: 'text', label: m.fillSign.text, icon: 'T' },
    { id: 'signature', label: m.fillSign.signature, icon: '〰' },
    { id: 'initials', label: m.fillSign.initials, icon: 'Aa' },
    { id: 'date', label: m.fillSign.date, icon: '📅' },
    { id: 'checkbox', label: m.fillSign.checkbox, icon: '☑' },
    { id: 'check', label: m.fillSign.check, icon: '✓' },
    { id: 'cross', label: m.fillSign.cross, icon: '✕' },
    { id: 'circle', label: m.fillSign.circle, icon: '○' },
    { id: 'draw', label: m.fillSign.draw, icon: '✎' }
  ];

  const chooseTool = (next: FillSignTool) => {
    if (next === 'signature') {
      setStampTab('draw');
      setStampOpen('signature');
      return;
    }
    if (next === 'initials') {
      setStampTab('draw');
      setStampOpen('initials');
      return;
    }
    setTool(next);
  };

  if (downloadUrl) {
    return (
      <StudioResult
        title={m.fillSign.doneTitle}
        text={m.fillSign.doneText}
        downloadUrl={downloadUrl}
        downloadName="rempli-signe.pdf"
        resetLabel={m.fillSign.reset}
        onReset={reset}
        sourceName={file?.name}
      />
    );
  }

  if (exporting) {
    return <StudioProcessing label={m.fillSign.running} progress={progress} onCancel={() => setExporting(false)} />;
  }

  if (!pdf) {
    return (
      <StudioLanding
        title={m.fillSign.title}
        subtitle={m.fillSign.subtitle}
        pickerId={pickerId}
        isDragging={dragging}
        isLoading={false}
        error={error || null}
        features={m.fillSign.features}
        seo={landingSeoFrom(m.fillSign)}
        selectLabel={m.fillSign.select}
        dropLabel={m.fillSign.orDrop}
        onDragOver={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files[0]) void openPdf(event.dataTransfer.files[0]);
        }}
        onFiles={(files) => { if (files[0]) void openPdf(files[0]); }}
      >
        <ul className="fs-trust">
          {m.fillSign.trust.map((item) => <li key={item}>✓ {item}</li>)}
        </ul>
      </StudioLanding>
    );
  }

  return (
    <div className="fs-app">
      <header className="fs-top">
        <Link to="/" className="fs-logo" aria-label={m.brand}>
          <img src="/one2pdf-logo.png?v=2" alt="" />
        </Link>
        <strong className="fs-filename" title={file?.name}>{file?.name}</strong>
        <div className="fs-top-actions">
          <button type="button" onClick={() => {
            const previous = history.at(-1);
            if (!previous) return;
            setRedo((stack) => [...stack, items]);
            setHistory((stack) => stack.slice(0, -1));
            setItems(previous);
          }} disabled={!history.length} aria-label={m.fillSign.undo}>↶</button>
          <button type="button" onClick={() => {
            const next = redo.at(-1);
            if (!next) return;
            setHistory((stack) => [...stack, items]);
            setRedo((stack) => stack.slice(0, -1));
            setItems(next);
          }} disabled={!redo.length} aria-label={m.fillSign.redo}>↷</button>
          <button type="button" className="fs-download" onClick={() => void exportPdf()}>{m.fillSign.download}</button>
        </div>
      </header>

      <div className="fs-tools" role="toolbar" aria-label={m.fillSign.toolsAria}>
        <button type="button" className={tool === 'select' ? 'active' : ''} onClick={() => setTool('select')}>{m.fillSign.selectTool}</button>
        {tools.map((item) => (
          <button key={item.id} type="button" className={tool === item.id ? 'active' : ''} onClick={() => chooseTool(item.id)} title={item.label}>
            <span aria-hidden="true">{item.icon}</span>
            <em>{item.label}</em>
          </button>
        ))}
      </div>

      <div className="fs-workspace">
        <aside className="fs-thumbs" aria-label={m.fillSign.pagesAria}>
          {thumbs.map((src, index) => (
            <button key={src} type="button" className={activePage === index ? 'active' : ''} onClick={() => {
              setActivePage(index);
              document.getElementById(`fs-page-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>
              <img src={src} alt="" />
              <b>{index + 1}</b>
            </button>
          ))}
        </aside>
        <div className="fs-stage">
          {Array.from({ length: pdf.numPages }, (_, index) => (
            <PageCanvas
              key={index}
              pdf={pdf}
              pageNumber={index + 1}
              zoom={zoom}
              items={items}
              widgets={widgets}
              values={values}
              tool={tool}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdate={(updated) => setItems((current) => current.map((item) => item.id === updated.id ? updated : item))}
              onPlace={onPlace}
              onDraw={(points) => {
                commit([...items, { id: uid(), type: 'drawing', page: index, color: '#111827', width: 1.8, points }]);
                setTool('select');
              }}
              onWidgetChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
            />
          ))}
          {error && <p className="fs-error">{error}</p>}
        </div>
      </div>

      <div className="fs-zoom">
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom((value) => Math.min(1.8, value + 0.1))} aria-label="+">+</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.55, value - 0.1))} aria-label="−">−</button>
      </div>

      {selected?.type === 'text' && (
        <div className="fs-text-options">
          <label>
            {m.fillSign.size}
            <input type="range" min="9" max="36" value={selected.size} onChange={(event) => {
              const size = Number(event.target.value);
              setItems((current) => current.map((item) => item.id === selected.id && item.type === 'text' ? { ...item, size, height: size * 1.5 } : item));
            }} />
          </label>
          <label className="fs-check">
            <input type="checkbox" checked={Boolean(selected.bold)} onChange={(event) => setItems((current) => current.map((item) => item.id === selected.id && item.type === 'text' ? { ...item, bold: event.target.checked } : item))} />
            {m.fillSign.bold}
          </label>
          <button type="button" onClick={() => { commit(items.filter((item) => item.id !== selected.id)); setSelectedId(null); }}>{m.fillSign.delete}</button>
        </div>
      )}
      {selected && selected.type !== 'text' && (
        <div className="fs-text-options">
          {selected.type === 'image' && (
            <button type="button" onClick={() => commit([...items, { ...selected, id: uid(), x: selected.x + 12, y: selected.y + 12 }])}>{m.fillSign.duplicate}</button>
          )}
          <button type="button" onClick={() => { commit(items.filter((item) => item.id !== selected.id)); setSelectedId(null); }}>{m.fillSign.delete}</button>
        </div>
      )}

      {stampOpen && (
        <StampModal
          mode={stampOpen}
          tab={stampTab}
          typed={typed}
          onTab={setStampTab}
          onTyped={setTyped}
          onClose={() => setStampOpen(null)}
          saved={stampOpen === 'initials' ? savedInitials : savedSignature}
          onConfirm={(dataUrl) => {
            placeStamp(dataUrl, stampOpen);
            setStampOpen(null);
          }}
        />
      )}
    </div>
  );
}

export default FillSign;
