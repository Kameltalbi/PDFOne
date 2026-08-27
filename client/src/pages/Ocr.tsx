import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function Ocr() {
  const { m, locale } = useI18n();
  return (
    <PdfAction
      copy={m.ocrPdf}
      endpoint="/api/ocr"
      extraForm={(form) => form.append('lang', locale)}
      downloadName="ocr.pdf"
    />
  );
}
