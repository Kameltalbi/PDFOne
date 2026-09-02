import { useEffect, useState } from 'react';
import { StudioDocumentCanvas, StudioLanding, StudioProcessing, StudioResult, StudioSidebarFrame, StudioWorkspace } from '../components/PdfStudio';
import { postForm, postFormData } from '../lib/api';
import { useSinglePdf } from '../lib/useSinglePdf';
import { landingSeoFrom, usePageSeo } from '../lib/usePageSeo';
import { useI18n } from '../i18n';

type FormField = {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'list';
  value: string | boolean;
  options?: string[];
};

function FillForm() {
  const { m } = useI18n();
  usePageSeo(m.fillForm.seoTitle, m.fillForm.seoDescription);
  const pdf = useSinglePdf();
  const [fields, setFields] = useState<FormField[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [flatten, setFlatten] = useState(true);
  const [inspecting, setInspecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pdf.file) {
      setFields([]);
      setValues({});
      return;
    }
    let cancelled = false;
    setInspecting(true);
    pdf.setError(null);
    const formData = new FormData();
    formData.append('file', pdf.file);
    void postFormData<{ fields: FormField[] }>('/api/pages/form-inspect', formData)
      .then((data) => {
        if (cancelled) return;
        setFields(data.fields);
        setValues(Object.fromEntries(data.fields.map((field) => [field.name, field.value])));
      })
      .catch((err) => {
        if (cancelled) return;
        setFields([]);
        pdf.setError(err instanceof Error ? err.message : m.fillForm.fail);
      })
      .finally(() => {
        if (!cancelled) setInspecting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pdf.file]);

  const handleFill = async () => {
    if (!pdf.file || fields.length === 0) return;
    setIsProcessing(true);
    pdf.setError(null);
    setProgress(25);
    try {
      const formData = new FormData();
      formData.append('file', pdf.file);
      formData.append('values', JSON.stringify(values));
      formData.append('flatten', String(flatten));
      setProgress(60);
      const result = await postForm('/api/pages/form-fill', formData);
      setProgress(100);
      pdf.setDownloadUrl(result.downloadUrl);
    } catch (err) {
      pdf.setError(err instanceof Error ? err.message : m.fillForm.fail);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (pdf.downloadUrl) {
    return (
      <StudioResult
        title={m.fillForm.doneTitle}
        text={m.fillForm.doneText}
        downloadUrl={pdf.downloadUrl}
        downloadName="formulaire.pdf"
        resetLabel={m.fillForm.reset}
        onReset={pdf.reset}
        previewSrc={pdf.thumbs[0]}
        sourceName={pdf.file?.name}
      />
    );
  }

  if (isProcessing) {
    return <StudioProcessing label={m.fillForm.running} progress={progress} onCancel={pdf.reset} />;
  }

  if (!pdf.file) {
    return (
      <StudioLanding
        title={m.fillForm.title}
        subtitle={m.fillForm.subtitle}
        pickerId={pdf.pickerId}
        isDragging={pdf.isDragging}
        isLoading={pdf.isLoading}
        error={pdf.error}
        features={m.fillForm.features}
        seo={landingSeoFrom(m.fillForm)}
        onDragOver={() => pdf.setIsDragging(true)}
        onDragLeave={() => pdf.setIsDragging(false)}
        onDrop={pdf.onDropFiles}
        onFiles={(files) => void pdf.loadFile(files)}
      />
    );
  }

  return (
    <StudioWorkspace
      canvas={(
        <StudioDocumentCanvas
          thumbs={pdf.thumbs}
          isLoading={pdf.isLoading || inspecting}
          zoom={pdf.zoom}
          setZoom={pdf.setZoom}
          fileName={pdf.file.name}
          pageCount={pdf.pageCount}
        />
      )}
      sidebar={(
        <StudioSidebarFrame
          title={m.fillForm.title}
          tip={inspecting ? m.fillForm.inspecting : m.fillForm.tip}
          error={pdf.error}
          progress={progress}
          isProcessing={isProcessing}
          actionLabel={isProcessing ? m.fillForm.running : m.fillForm.action}
          onAction={() => void handleFill()}
          disabled={inspecting || fields.length === 0}
          onChangeFile={pdf.reset}
        >
          {fields.map((field) => (
            <div className="studio-field" key={field.name}>
              <label htmlFor={`ff-${field.name}`}>{field.name}</label>
              {field.type === 'checkbox' ? (
                <label className="studio-check-row">
                  <input
                    id={`ff-${field.name}`}
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                  />
                  {m.fillForm.checked}
                </label>
              ) : field.options?.length ? (
                <select
                  id={`ff-${field.name}`}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  <option value="">{m.fillForm.choose}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`ff-${field.name}`}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
            </div>
          ))}
          {fields.length > 0 && (
            <label className="studio-check-row">
              <input type="checkbox" checked={flatten} onChange={(event) => setFlatten(event.target.checked)} />
              {m.fillForm.flatten}
            </label>
          )}
        </StudioSidebarFrame>
      )}
    />
  );
}

export default FillForm;
