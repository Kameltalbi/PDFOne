import type { PageSeoCopy } from '../i18n/types';
import { stripLocalePrefix } from '../i18n/localePath';

/**
 * One indexable URL per keyword, on the same converter.
 * Set `live: true` and fill `h1`, `lead` and `copy` to publish another variant.
 * Planned, not published: /webp-to-pdf, /compress-pdf-to-100kb, /compress-pdf-to-1mb.
 */
export type ToolVariant = {
  path: string;
  tool: 'jpg-to-pdf' | 'compress';
  live: boolean;
  h1?: string;
  lead?: string;
  copy?: PageSeoCopy;
};

const pngCopy: PageSeoCopy = {
  seoTitle: 'PNG to PDF Converter — Free & Online | One2PDF',
  seoDescription: 'Turn PNG screenshots and transparent images into one PDF. Each PNG stays a PNG inside the file. Free, no account, on One2PDF.',
  seoH2: 'Make a PDF from PNG screenshots and transparent images',
  seoP1: 'A PNG is often a screenshot, a diagram or a logo with a transparent background. This page uses the same image converter as JPG to PDF, with copy written for PNG files. Upload one PNG or several, set the page order, and download a single PDF.',
  seoP2: 'PNG files are embedded as PNG, so the transparency channel stays in the PDF. Most viewers paint the page white behind those pixels. WebP files on this converter are turned into JPEG first; start here when the source really is a PNG.',
  seoP3: 'You can mix PNG with JPG in the same document. The original images are deleted when processing finishes, and the PDF is removed after download or within about 15 minutes. No account is required.',
  howTitle: 'How to convert PNG to PDF',
  howSteps: [
    'Open PNG to PDF and add your PNG files',
    'Drag the thumbnails into the order you want',
    'Create the PDF and download it'
  ],
  faqTitle: 'Questions about PNG to PDF',
  faq: [
    {
      question: 'Does PNG transparency survive the conversion?',
      answer: 'Yes. A PNG is embedded as PNG, so its transparency channel stays in the PDF. Viewers usually show those pixels on a white page.'
    },
    {
      question: 'Can I convert a screenshot saved as PNG?',
      answer: 'Yes. Screenshot PNGs are accepted, alone or with other PNG, JPG and WebP images. Each image becomes one page.'
    },
    {
      question: 'Can I mix PNG and JPG in one PDF?',
      answer: 'Yes. Add both formats, then drag the thumbnails. The PDF follows that order.'
    },
    {
      question: 'Is a PNG flattened into a photo?',
      answer: 'No. PNG files stay PNG inside the PDF. WebP files are converted to JPEG before they are placed on a page.'
    },
    {
      question: 'Do I need an account?',
      answer: 'No. You can convert images without signing up. Files are deleted after processing, or within about 15 minutes if the PDF is not downloaded.'
    }
  ]
};

const imagesCopy: PageSeoCopy = {
  seoTitle: 'Images to PDF Converter — Free & Online | One2PDF',
  seoDescription: 'Combine JPG, PNG and WebP images into one PDF, in your order. Free online converter for photos and screenshots on One2PDF.',
  seoH2: 'Turn several images into one PDF',
  seoP1: 'Use this page when the job is “images to PDF”, not one format. JPG photos, PNG screenshots and WebP files can go into the same document. Each image becomes a page, in the order you set.',
  seoP2: 'PNG files keep their PNG encoding, including transparency. JPG files stay JPEG. WebP files are converted to JPEG first, so a transparent WebP loses that transparency. Reorder the thumbnails before you create the file.',
  seoP3: 'No account is required. Uploaded images are deleted when the PDF is created. The result is deleted after download, or within about 15 minutes if you leave it.',
  howTitle: 'How to convert images to PDF',
  howSteps: [
    'Add JPG, PNG or WebP images',
    'Drag the thumbnails to set the page order',
    'Download the PDF'
  ],
  faqTitle: 'Questions about images to PDF',
  faq: [
    {
      question: 'Which image formats can I add?',
      answer: 'JPG, PNG and WebP. You can mix them in one document. Each file becomes one page.'
    },
    {
      question: 'Can I combine screenshots and photos?',
      answer: 'Yes. Put PNG screenshots and JPG photos in the list, then arrange the thumbnails.'
    },
    {
      question: 'What happens to a transparent image?',
      answer: 'A PNG keeps its transparency channel inside the PDF. A WebP is converted to JPEG first, so its transparency is not kept.'
    },
    {
      question: 'How do I change the page order?',
      answer: 'Drag the thumbnails before you create the PDF. The document follows that order.'
    },
    {
      question: 'Do I need an account?',
      answer: 'No. Conversion works without an account. Images and the finished PDF are temporary files.'
    }
  ]
};

export const TOOL_VARIANTS: ToolVariant[] = [
  {
    path: '/png-to-pdf',
    tool: 'jpg-to-pdf',
    live: true,
    h1: 'PNG to PDF',
    lead: 'Turn PNG screenshots and transparent images into one PDF.',
    copy: pngCopy
  },
  {
    path: '/images-to-pdf',
    tool: 'jpg-to-pdf',
    live: true,
    h1: 'Images to PDF',
    lead: 'Combine JPG, PNG and WebP images into one PDF, in your order.',
    copy: imagesCopy
  },
  { path: '/webp-to-pdf', tool: 'jpg-to-pdf', live: false },
  { path: '/compress-pdf-to-100kb', tool: 'compress', live: false },
  { path: '/compress-pdf-to-1mb', tool: 'compress', live: false }
];

export type LiveJpgVariant = ToolVariant & { h1: string; lead: string; copy: PageSeoCopy };

export function liveJpgVariants(): LiveJpgVariant[] {
  return TOOL_VARIANTS.filter((variant): variant is LiveJpgVariant => (
    variant.live && variant.tool === 'jpg-to-pdf' && Boolean(variant.h1 && variant.lead && variant.copy)
  ));
}

export function jpgVariantForPath(pathname: string): LiveJpgVariant | undefined {
  const bare = stripLocalePrefix(pathname.split(/[?#]/)[0] ?? pathname);
  return liveJpgVariants().find((variant) => variant.path === bare);
}
