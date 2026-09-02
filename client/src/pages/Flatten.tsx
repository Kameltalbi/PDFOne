import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function Flatten() {
  const { m } = useI18n();
  return (
    <PdfAction
      copy={m.flattenPdf}
      endpoint="/api/pages/flatten"
      downloadName="aplatis.pdf"
    />
  );
}
