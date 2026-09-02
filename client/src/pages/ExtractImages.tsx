import { PdfAction } from '../components/PdfAction';
import { useI18n } from '../i18n';

export default function ExtractImages() {
  const { m } = useI18n();
  return (
    <PdfAction
      copy={m.extractImages}
      endpoint="/api/pages/extract-images"
      downloadName="images.zip"
      downloadLabel={m.extractImages.download}
    />
  );
}
