import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function ToPng() {
  const { m } = useI18n();
  return (
    <PdfAction
      copy={m.toPng}
      endpoint="/api/to-png"
      downloadName="pages.png"
      downloadLabel={m.toPng.download}
    />
  );
}
