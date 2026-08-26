import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import './EditPdf.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Point = { x: number; y: number };
type TextAnnotation = { id: string; type: 'text'; page: number; x: number; y: number; text: string; size: number; color: string; decoration?: 'underline' | 'strike' };
type DrawingAnnotation = { id: string; type: 'drawing'; page: number; color: string; width: number; points: Point[] };
type ShapeAnnotation = { id: string; type: 'shape'; page: number; shape: 'rectangle' | 'line' | 'arrow'; color: string; width: number; start: Point; end: Point };
type ImageAnnotation = { id: string; type: 'image'; page: number; x: number; y: number; width: number; height: number; dataUrl: string };
type Annotation = TextAnnotation | DrawingAnnotation | ShapeAnnotation | ImageAnnotation;
type Tool = 'pan' | 'select' | 'text' | 'draw' | 'rectangle' | 'erase' | 'line' | 'arrow' | 'image' | 'underline' | 'strike' | 'signature';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface PdfPageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  annotations: Annotation[];
  tool: Tool;
  text: string;
  size: number;
  color: string;
  strokeWidth: number;
  zoom: number;
  onAdd: (annotation: Annotation) => void;
  onRemove: (id: string) => void;
  onUpdate: (annotation: Annotation) => void;
}

function PdfPage({ pdf, pageNumber, annotations, tool, text, size, color, strokeWidth, zoom, onAdd, onRemove, onUpdate }: PdfPageProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [drawing, setDrawing] = useState<Point[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let active = true;
    pdf.getPage(pageNumber).then((loadedPage) => active && setPage(loadedPage));
    return () => { active = false; };
  }, [pdf, pageNumber]);

  useEffect(() => {
    if (!page || !pdfCanvasRef.current || !overlayRef.current) return;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.35, 760 / baseViewport.width) * zoom;
    const viewport = page.getViewport({ scale });
    const canvas = pdfCanvasRef.current;
    const overlay = overlayRef.current;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    overlay.width = Math.floor(viewport.width * pixelRatio);
    overlay.height = Math.floor(viewport.height * pixelRatio);
    overlay.style.width = `${viewport.width}px`;
    overlay.style.height = `${viewport.height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    const renderTask = page.render({ canvas, canvasContext: context, viewport, transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0] });
    return () => renderTask.cancel();
  }, [page, zoom]);

  const redraw = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    for (const annotation of annotations) {
      if (annotation.type === 'text') {
        context.fillStyle = annotation.color;
        context.strokeStyle = annotation.color;
        context.font = `${annotation.size}px Arial, sans-serif`;
        context.textBaseline = 'top';
        context.fillText(annotation.text, annotation.x * width, annotation.y * height);
        const textWidth = context.measureText(annotation.text).width;
        if (annotation.decoration) {
          const lineY = annotation.y * height + (annotation.decoration === 'underline' ? annotation.size + 2 : annotation.size * .55);
          context.lineWidth = Math.max(1, annotation.size / 12);
          context.beginPath(); context.moveTo(annotation.x * width, lineY); context.lineTo(annotation.x * width + textWidth, lineY); context.stroke();
        }
      } else if (annotation.type === 'drawing' && annotation.points.length > 1) {
        context.strokeStyle = annotation.color;
        context.lineWidth = annotation.width;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(annotation.points[0].x * width, annotation.points[0].y * height);
        annotation.points.slice(1).forEach((point) => context.lineTo(point.x * width, point.y * height));
        context.stroke();
      } else if (annotation.type === 'shape') {
        context.strokeStyle = annotation.color;
        context.lineWidth = annotation.width;
        const x1 = annotation.start.x * width; const y1 = annotation.start.y * height;
        const x2 = annotation.end.x * width; const y2 = annotation.end.y * height;
        context.beginPath();
        if (annotation.shape === 'rectangle') context.rect(x1, y1, x2 - x1, y2 - y1);
        else { context.moveTo(x1, y1); context.lineTo(x2, y2); }
        context.stroke();
        if (annotation.shape === 'arrow') {
          const angle = Math.atan2(y2 - y1, x2 - x1); const head = 12;
          context.beginPath(); context.moveTo(x2, y2); context.lineTo(x2 - head * Math.cos(angle - .45), y2 - head * Math.sin(angle - .45));
          context.moveTo(x2, y2); context.lineTo(x2 - head * Math.cos(angle + .45), y2 - head * Math.sin(angle + .45)); context.stroke();
        }
      }
    }

    const selected = annotations.find((item) => item.id === selectedId);
    if (selected?.type === 'image') {
      const x = selected.x * width; const y = selected.y * height;
      const imageWidth = selected.width * width; const imageHeight = selected.height * height;
      context.setLineDash([6, 4]); context.lineWidth = 2; context.strokeStyle = '#2563eb';
      context.strokeRect(x, y, imageWidth, imageHeight); context.setLineDash([]);
      context.fillStyle = '#2563eb'; context.fillRect(x + imageWidth - 7, y + imageHeight - 7, 14, 14);
      context.strokeStyle = 'white'; context.lineWidth = 2; context.strokeRect(x + imageWidth - 7, y + imageHeight - 7, 14, 14);
    }

    if (drawing && drawing.length > 1) {
      context.strokeStyle = tool === 'signature' ? '#111827' : color;
      context.lineWidth = strokeWidth;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(drawing[0].x * width, drawing[0].y * height);
      if (tool === 'rectangle') context.rect(drawing[0].x * width, drawing[0].y * height, (drawing.at(-1)!.x - drawing[0].x) * width, (drawing.at(-1)!.y - drawing[0].y) * height);
      else drawing.slice(1).forEach((point) => context.lineTo(point.x * width, point.y * height));
      context.stroke();
    }
  }, [annotations, drawing, color, strokeWidth, tool, selectedId]);

  useEffect(redraw, [redraw]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);
    if (tool === 'pan') return;
    if (tool === 'erase' || tool === 'select') {
      const currentSelection = annotations.find((annotation) => annotation.id === selectedId);
      if (tool === 'select' && currentSelection?.type === 'image') {
        const handleDistance = Math.hypot(point.x - (currentSelection.x + currentSelection.width), point.y - (currentSelection.y + currentSelection.height));
        if (handleDistance < .035) {
          setIsResizing(true); setDrawing([point]); event.currentTarget.setPointerCapture(event.pointerId); return;
        }
      }
      const hit = [...annotations].reverse().find((annotation) => {
        if (annotation.type === 'image') return point.x >= annotation.x && point.x <= annotation.x + annotation.width && point.y >= annotation.y && point.y <= annotation.y + annotation.height;
        if (annotation.type === 'text') return Math.abs(annotation.x - point.x) < .18 && Math.abs(annotation.y - point.y) < .08;
        if (annotation.type === 'drawing') return annotation.points.some((item) => Math.hypot(item.x - point.x, item.y - point.y) < .035);
        const minX = Math.min(annotation.start.x, annotation.end.x) - .035; const maxX = Math.max(annotation.start.x, annotation.end.x) + .035;
        const minY = Math.min(annotation.start.y, annotation.end.y) - .035; const maxY = Math.max(annotation.start.y, annotation.end.y) + .035;
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
      });
      if (hit && tool === 'erase') onRemove(hit.id);
      if (hit && tool === 'select') { setSelectedId(hit.id); setIsResizing(false); setDrawing([point]); event.currentTarget.setPointerCapture(event.pointerId); }
      if (!hit && tool === 'select') setSelectedId(null);
      return;
    }
    if (tool === 'image') {
      return;
    }
    if (tool === 'text' || tool === 'underline' || tool === 'strike') {
      if (!text.trim()) return;
      onAdd({ id: uid(), type: 'text', page: pageNumber - 1, ...point, text: text.trim(), size, color, decoration: tool === 'underline' ? 'underline' : tool === 'strike' ? 'strike' : undefined });
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawing([point]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawing) {
      const point = getPoint(event);
      if (tool === 'select' && selectedId) {
        const selected = annotations.find((item) => item.id === selectedId);
        if (selected) {
          const dx = point.x - drawing[0].x; const dy = point.y - drawing[0].y;
          if (selected.type === 'image' && isResizing) {
            const factor = Math.max(.2, (selected.width + dx) / selected.width);
            onUpdate({ ...selected, width: Math.max(.04, selected.width * factor), height: Math.max(.03, selected.height * factor) });
          } else if (selected.type === 'text' || selected.type === 'image') onUpdate({ ...selected, x: selected.x + dx, y: selected.y + dy });
          else if (selected.type === 'drawing') onUpdate({ ...selected, points: selected.points.map((item) => ({ x: item.x + dx, y: item.y + dy })) });
          else onUpdate({ ...selected, start: { x: selected.start.x + dx, y: selected.start.y + dy }, end: { x: selected.end.x + dx, y: selected.end.y + dy } });
        }
        setDrawing([point]);
        return;
      }
      setDrawing(tool === 'draw' || tool === 'signature' ? [...drawing, point] : [drawing[0], point]);
    }
  };

  const finishDrawing = () => {
    if (tool === 'select') { setDrawing(null); setIsResizing(false); return; }
    if (drawing && drawing.length > 1) {
      if (tool === 'draw' || tool === 'signature') onAdd({ id: uid(), type: 'drawing', page: pageNumber - 1, points: drawing, color: tool === 'signature' ? '#111827' : color, width: tool === 'signature' ? 2 : strokeWidth });
      else if (tool === 'rectangle' || tool === 'line' || tool === 'arrow') onAdd({ id: uid(), type: 'shape', page: pageNumber - 1, shape: tool, start: drawing[0], end: drawing.at(-1)!, color, width: strokeWidth });
    }
    setDrawing(null);
  };

  return (
    <section className="edit-page-shell" id={`pdf-page-${pageNumber}`}>
      <span className="edit-page-number">Page {pageNumber}</span>
      <div className={`edit-page-canvas tool-${tool}`}>
        <canvas ref={pdfCanvasRef} />
        {annotations.filter((item): item is ImageAnnotation => item.type === 'image').map((item) => <img key={item.id} className="placed-pdf-image" src={item.dataUrl} alt="Image ajoutée" style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, width: `${item.width * 100}%`, height: `${item.height * 100}%` }} />)}
        <canvas
          ref={overlayRef}
          className="edit-overlay"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        />
      </div>
    </section>
  );
}

function PdfThumbnail({ pdf, pageNumber, annotations }: { pdf: PDFDocumentProxy; pageNumber: number; annotations: Annotation[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: ReturnType<PDFPageProxy['render']> | undefined;
    let cancelled = false;

    pdf.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 145 / baseViewport.width });
      const canvas = canvasRef.current;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d');
      if (!context) return;
      renderTask = page.render({ canvas, canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      renderTask.promise.then(async () => {
        if (cancelled) return;
        const width = viewport.width; const height = viewport.height;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        for (const annotation of annotations) {
          if (annotation.type === 'image') {
            const image = new Image();
            image.src = annotation.dataUrl;
            await image.decode().catch(() => undefined);
            if (!cancelled) context.drawImage(image, annotation.x * width, annotation.y * height, annotation.width * width, annotation.height * height);
          } else if (annotation.type === 'text') {
            context.fillStyle = annotation.color; context.strokeStyle = annotation.color;
            context.font = `${Math.max(3, annotation.size * viewport.scale)}px Arial`; context.textBaseline = 'top';
            context.fillText(annotation.text, annotation.x * width, annotation.y * height);
          } else if (annotation.type === 'drawing') {
            if (annotation.points.length < 2) continue;
            context.strokeStyle = annotation.color; context.lineWidth = Math.max(.5, annotation.width * viewport.scale); context.lineCap = 'round';
            context.beginPath(); context.moveTo(annotation.points[0].x * width, annotation.points[0].y * height);
            annotation.points.slice(1).forEach((point) => context.lineTo(point.x * width, point.y * height)); context.stroke();
          } else {
            context.strokeStyle = annotation.color; context.lineWidth = Math.max(.5, annotation.width * viewport.scale);
            const x1 = annotation.start.x * width; const y1 = annotation.start.y * height; const x2 = annotation.end.x * width; const y2 = annotation.end.y * height;
            context.beginPath();
            if (annotation.shape === 'rectangle') context.rect(x1, y1, x2 - x1, y2 - y1);
            else { context.moveTo(x1, y1); context.lineTo(x2, y2); }
            context.stroke();
          }
        }
      }).catch((error) => {
        if (error?.name !== 'RenderingCancelledException') console.error('Thumbnail annotation error:', error);
      });
      renderTask.promise.catch((error) => {
        if (error?.name !== 'RenderingCancelledException') console.error('Thumbnail render error:', error);
      });
    });

    return () => { cancelled = true; renderTask?.cancel(); };
  }, [pdf, pageNumber, annotations]);

  return <span className="thumbnail-sheet"><canvas ref={canvasRef} aria-label={`Aperçu de la page ${pageNumber}`} /></span>;
}

function EditPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [tool, setTool] = useState<Tool>('text');
  const [text, setText] = useState('Votre texte');
  const [size, setSize] = useState(18);
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [redoStack, setRedoStack] = useState<Annotation[]>([]);
  const [zoom, setZoom] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const openPdf = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Veuillez sélectionner un fichier PDF.');
      return;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Le fichier dépasse la limite de 100 Mo.');
      return;
    }
    try {
      setError('');
      const bytes = await selectedFile.arrayBuffer();
      const loadedPdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setFile(selectedFile);
      setPdf(loadedPdf);
      setAnnotations([]);
      setRedoStack([]);
      setActivePage(0);
    } catch {
      setError('Ce PDF ne peut pas être ouvert ou il est protégé.');
    }
  };

  const exportPdf = async () => {
    if (!file) return;
    setIsExporting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('annotations', JSON.stringify(annotations.map(({ id: _id, ...annotation }) => annotation)));
      const response = await fetch('/api/edit', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Export impossible');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.pdf$/i, '')}-modifie.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Impossible de générer le PDF. Vérifiez que le serveur est démarré.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!pdf) {
    return (
      <main className="edit-landing">
        <section className="edit-hero">
          <div className="edit-kicker">ÉDITEUR PDF EN LIGNE</div>
          <h1>Modifier PDF</h1>
          <p>Ajoutez du texte et dessinez directement sur vos documents PDF.</p>
          <div
            className={`edit-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (event.dataTransfer.files[0]) openPdf(event.dataTransfer.files[0]); }}
          >
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => event.target.files?.[0] && openPdf(event.target.files[0])} />
            <button className="edit-select-button" onClick={() => inputRef.current?.click()}>
              <span>＋</span> Sélectionner le fichier
            </button>
            <span>ou glissez-déposez votre PDF ici</span>
          </div>
          {error && <div className="edit-error">{error}</div>}
        </section>

        <section className="edit-features">
          <article><span>✏️</span><h2>Édition simple</h2><p>Placez votre texte précisément et dessinez librement sur chaque page.</p></article>
          <article><span>✓</span><h2>Aperçu fidèle</h2><p>Visualisez immédiatement chaque modification avant de télécharger.</p></article>
          <article><span>🔒</span><h2>Traitement sécurisé</h2><p>Le document temporaire est supprimé du serveur après son export.</p></article>
        </section>
      </main>
    );
  }

  const addAnnotation = (annotation: Annotation) => {
    setAnnotations((items) => [...items, annotation]);
    setRedoStack([]);
  };

  const undo = () => setAnnotations((items) => {
    const last = items.at(-1);
    if (last) setRedoStack((redo) => [...redo, last]);
    return items.slice(0, -1);
  });

  const redo = () => setRedoStack((items) => {
    const last = items.at(-1);
    if (last) setAnnotations((current) => [...current, last]);
    return items.slice(0, -1);
  });

  const tools: Array<{ id: Tool; icon: string; label: string }> = [
    { id: 'pan', icon: '☝', label: 'Déplacer la vue' }, { id: 'select', icon: '↖', label: 'Sélectionner' },
    { id: 'text', icon: 'T', label: 'Ajouter du texte' }, { id: 'draw', icon: '✎', label: 'Dessiner' },
    { id: 'rectangle', icon: '▭', label: 'Rectangle' }, { id: 'erase', icon: '⌫', label: 'Gomme' },
    { id: 'line', icon: '╱', label: 'Ligne' }, { id: 'arrow', icon: '↗', label: 'Flèche' },
    { id: 'image', icon: '🖼', label: 'Ajouter une image' }, { id: 'underline', icon: 'U', label: 'Texte souligné' },
    { id: 'strike', icon: 'S', label: 'Texte barré' }, { id: 'signature', icon: '〰', label: 'Signature manuscrite' }
  ];

  const chooseTool = (selectedTool: Tool) => {
    if (selectedTool === 'image') imageInputRef.current?.click();
    setTool(selectedTool);
  };

  const loadImage = (imageFile?: File) => {
    if (!imageFile || !imageFile.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(); image.src = dataUrl; });
      const pdfPage = await pdf.getPage(activePage + 1);
      const pageSize = pdfPage.getViewport({ scale: 1 });
      const widthInPoints = image.naturalWidth * .75;
      const heightInPoints = image.naturalHeight * .75;
      const naturalWidthRatio = widthInPoints / pageSize.width;
      const naturalHeightRatio = heightInPoints / pageSize.height;
      const fitScale = Math.min(1, .35 / naturalWidthRatio, .28 / naturalHeightRatio);
      const fittedWidth = naturalWidthRatio * fitScale;
      const fittedHeight = naturalHeightRatio * fitScale;
      addAnnotation({
        id: uid(), type: 'image', page: activePage,
        x: (1 - fittedWidth) / 2,
        y: (1 - fittedHeight) / 2,
        width: fittedWidth,
        height: fittedHeight,
        dataUrl
      });
      setTool('select');
      document.getElementById(`pdf-page-${activePage + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <main className="pdf-editor">
      <aside className="editor-toolrail" aria-label="Outils d'édition">
        <input ref={imageInputRef} hidden type="file" accept="image/png,image/jpeg" onChange={(event) => loadImage(event.target.files?.[0])} />
        {tools.map((item) => <button key={item.id} className={tool === item.id ? 'active' : ''} onClick={() => chooseTool(item.id)} title={item.label}>{item.icon}</button>)}
      </aside>

      <aside className="editor-sidebar">
        <div className="editor-file"><strong>{file?.name}</strong><span>{pdf.numPages} page{pdf.numPages > 1 ? 's' : ''}</span></div>
        <h2>{tools.find((item) => item.id === tool)?.label}</h2>
        {['text', 'underline', 'strike'].includes(tool) ? (
          <div className="tool-options">
            <label>Contenu<input value={text} onChange={(event) => setText(event.target.value)} maxLength={120} /></label>
            <label>Police<select><option>Helvetica</option></select></label>
            <label>Taille<input type="range" min="8" max="72" value={size} onChange={(event) => setSize(Number(event.target.value))} /><span>{size} px</span></label>
          </div>
        ) : !['pan', 'select', 'erase', 'image'].includes(tool) ? (
          <div className="tool-options"><label>Épaisseur<input type="range" min="1" max="12" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /><span>{strokeWidth} px</span></label></div>
        ) : null}
        {!['pan', 'select', 'erase', 'image', 'signature'].includes(tool) && <label className="color-option">Couleur<input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label>}
        {tool === 'image' && <button className="change-image" onClick={() => imageInputRef.current?.click()}>＋ Ajouter une autre image</button>}
        <p className="editor-help">{tool === 'erase' ? 'Cliquez sur un élément pour le supprimer.' : tool === 'image' ? `L’image est redimensionnée proportionnellement et centrée sur la page ${activePage + 1}.` : tool === 'pan' ? 'Utilisez le défilement pour parcourir le document.' : tool === 'select' ? 'Cliquez puis faites glisser un élément pour le déplacer.' : ['text','underline','strike'].includes(tool) ? 'Cliquez sur une page pour placer le texte.' : 'Maintenez et déplacez le pointeur sur la page.'}</p>
        <button className="clear-page" disabled={!annotations.length} onClick={() => { setAnnotations([]); setRedoStack([]); }}>Tout effacer</button>
        <button className="change-file" onClick={() => { setPdf(null); setFile(null); }}>Changer de fichier</button>
      </aside>

      <section className="editor-workspace">
        <div className="editor-history"><button onClick={undo} disabled={!annotations.length} title="Annuler">↶</button><button onClick={redo} disabled={!redoStack.length} title="Rétablir">↷</button></div>
        {Array.from({ length: pdf.numPages }, (_, index) => (
          <PdfPage key={index} pdf={pdf} pageNumber={index + 1} annotations={annotations.filter((item) => item.page === index)} tool={tool} text={text} size={size} color={color} strokeWidth={strokeWidth} zoom={zoom} onAdd={addAnnotation} onRemove={(id) => setAnnotations((items) => items.filter((item) => item.id !== id))} onUpdate={(updated) => setAnnotations((items) => items.map((item) => item.id === updated.id ? updated : item))} />
        ))}
        <div className="editor-zoom"><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.min(1.6, value + .1))}>+</button><button onClick={() => setZoom((value) => Math.max(.6, value - .1))}>−</button></div>
      </section>

      <aside className="editor-pages">
        <button className="editor-export" onClick={exportPdf} disabled={isExporting}>{isExporting ? 'Génération…' : '⇩ Exporter'}</button>
        <div className="page-counter">{pdf.numPages} page{pdf.numPages > 1 ? 's' : ''}</div>
        <div className="page-thumbnails">{Array.from({ length: pdf.numPages }, (_, index) => <button key={index} className={activePage === index ? 'active' : ''} onClick={() => { setActivePage(index); document.getElementById(`pdf-page-${index + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><PdfThumbnail pdf={pdf} pageNumber={index + 1} annotations={annotations.filter((item) => item.page === index)} /><b>{index + 1}</b></button>)}</div>
        {error && <span className="edit-error inline">{error}</span>}
      </aside>
    </main>
  );
}

export default EditPdf;
