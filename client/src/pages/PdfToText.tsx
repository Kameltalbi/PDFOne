import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function PdfToText() {
  const { m } = useI18n();
  return (
    <PdfAction
      copy={m.toText}
      endpoint="/api/to-text"
      downloadName="document.txt"
      downloadLabel={m.toText.download}
    />
  );
}
