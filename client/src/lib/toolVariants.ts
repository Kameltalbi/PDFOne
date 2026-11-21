import type { PageSeoCopy } from '../i18n/types';
import { stripLocalePrefix } from '../i18n/localePath';

/**
 * One indexable URL per keyword, on the same tool.
 * Set `live: true` and fill `h1`, `lead` and `copy` to publish another variant.
 * Compress size pages stay English until those URLs have impressions.
 * Planned, not published: /webp-to-pdf.
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

const compress100kbCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF to 100KB — Free & Online | One2PDF',
  seoDescription: 'Compress a PDF toward a 100 KB upload cap for a short form or ID scan. Compare the new size. Free, no account, on One2PDF.',
  seoH2: 'When a form or portal rejects anything over 100 KB',
  seoP1: 'Some government forms, visa uploads and HR portals stop at 100 KB. A phone photo saved as a PDF is often several megabytes, so the form rejects it before anyone reads the page. This page runs the same Compress PDF tool, aimed at that cap.',
  seoP2: 'High keeps the text selectable and rarely reaches 100 KB. Medium and Strong replace each page with a JPEG. Strong is the level that can approach 100 KB, and only on a short document: one or two pages, mostly white space. A color scan of many pages usually stays above 100 KB even at Strong. Download the result, read the new size, and only then replace the original.',
  seoP3: 'Nothing on this page forces the output to 100 KB. If the file is still over the cap, export fewer pages or crop the scan before you try again. Free use allows 5 documents a day and 20 MB per file. The original is deleted when processing ends. The result is removed after download, or within about 15 minutes.',
  howTitle: 'How to compress a PDF toward 100 KB',
  howSteps: [
    'Upload the PDF that the form rejected',
    'Choose Strong for a one- or two-page scan, or Medium if you need more detail',
    'Download the file and compare its size with 100 KB before you upload it again'
  ],
  faqTitle: 'Questions about compressing a PDF to 100 KB',
  faq: [
    {
      question: 'Can One2PDF guarantee a PDF under 100 KB?',
      answer: 'No. The compressor offers three levels. It does not stop at a byte count. A long or colorful PDF can stay above 100 KB at every level.'
    },
    {
      question: 'Which level is closest to 100 KB?',
      answer: 'Strong. It compresses the page images further, so text is no longer selectable and fine print can look soft. Try it on a short scan, then check the size.'
    },
    {
      question: 'What if the portal still says the file is too large?',
      answer: 'Remove extra pages, crop wide margins, or start from a smaller scan. Then compress again and read the new size.'
    },
    {
      question: 'Will the text stay selectable at 100 KB?',
      answer: 'Usually not. Reaching a cap that small means Medium or Strong, and those levels turn each page into an image.'
    },
    {
      question: 'Do I need an account?',
      answer: 'No. Free use allows 5 documents a day and 20 MB per file. Files are temporary.'
    }
  ]
};

const compress200kbCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF to 200KB — Free & Online | One2PDF',
  seoDescription: 'Reduce a PDF toward a 200 KB limit for an application form or school upload. Check the size after compression. Free on One2PDF.',
  seoH2: 'A 200 KB cap on an application or school upload',
  seoP1: 'Application forms and school portals often refuse a PDF above 200 KB: a certificate, a one-page letter, or a photo of a signed form. The file you have is larger than the box allows. Compress it here, on the same tool as Compress PDF, and use the reported size as the check.',
  seoP2: 'Start with Medium if the page is a scan. Medium turns each page into a JPEG and keeps more detail than Strong. Strong goes further and is the better try when Medium is still over 200 KB. High leaves the text selectable, which matters if the portal reads the text, but High seldom lands a photo-PDF under 200 KB. A multi-page color packet is a poor fit for this cap.',
  seoP3: 'The result is a smaller PDF, not a file locked at 200 KB. Open the download and read the size before you submit the form. Free use allows 5 documents a day and 20 MB per file. Pass and Pro raise the per-file cap. The original is deleted when processing ends, and the result is purged within about 15 minutes if you do not download it.',
  howTitle: 'How to compress a PDF toward 200 KB',
  howSteps: [
    'Add the PDF the form would not accept',
    'Try Medium first, then Strong if the file is still over 200 KB',
    'Submit only after the downloaded file is under the portal’s cap'
  ],
  faqTitle: 'Questions about compressing a PDF to 200 KB',
  faq: [
    {
      question: 'Is 200 KB a common upload limit?',
      answer: 'Yes for short forms, certificates and some school portals. It is tight for anything longer than a couple of pages.'
    },
    {
      question: 'Can I keep selectable text and still get under 200 KB?',
      answer: 'Only when the PDF is already close to that size. High keeps selectable text and usually shrinks a photo-heavy file only a little.'
    },
    {
      question: 'What does Strong change?',
      answer: 'Each page becomes a more compressed image. You cannot select the text, and small type can look blurry. Use it when Medium missed 200 KB.'
    },
    {
      question: 'Does a 10-page scan fit in 200 KB?',
      answer: 'Often no. Keep the page the form actually asks for, then compress that page.'
    },
    {
      question: 'Are files kept?',
      answer: 'No. The original is deleted after processing. The result lasts until you download it, or about 15 minutes.'
    }
  ]
};

const compress500kbCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF to 500KB — Free & Online | One2PDF',
  seoDescription: 'Compress a PDF toward a 500 KB job-board or university upload limit. Compare the result before you submit. Free on One2PDF.',
  seoH2: 'Job boards and university forms that stop at 500 KB',
  seoP1: 'A job board, a university application or a certificate upload often states a 500 KB maximum. A CV exported from a word processor may already be under that. A scanned diploma or a photo pasted into the PDF usually is not. This page is the Compress PDF tool, with the 500 KB check written out.',
  seoP2: 'If the document is mostly text, try High first so the recruiter or the registrar can still copy a sentence. If the size barely moves, the weight is in the images: switch to Medium. Medium replaces every page with a JPEG, so the text is no longer selectable, and it is the level that most often brings a one- or two-page scan under 500 KB. Strong is the next step when Medium is still over the line. A long portfolio will not fit in 500 KB.',
  seoP3: 'Read the size One2PDF reports after compression. Do not upload a file that is still over 500 KB and hope the portal rounds it down. Free use allows 5 documents a day and 20 MB per file. The original is deleted when processing ends. The compressed PDF is removed after download, or within about 15 minutes.',
  howTitle: 'How to compress a PDF toward 500 KB',
  howSteps: [
    'Upload the CV, certificate or scan the form rejected',
    'Choose High for a text PDF, or Medium for a scan',
    'Download and confirm the file is under 500 KB, then submit it'
  ],
  faqTitle: 'Questions about compressing a PDF to 500 KB',
  faq: [
    {
      question: 'Should a CV stay as selectable text?',
      answer: 'Yes, if it fits. High keeps the text selectable. Use Medium only when High leaves the file over 500 KB.'
    },
    {
      question: 'Will a scanned diploma reach 500 KB?',
      answer: 'A single page often does on Medium. Several color pages may need Strong, or you may need to send one page at a time.'
    },
    {
      question: 'What if both Medium and Strong stay above 500 KB?',
      answer: 'The scan is too dense for that cap. Crop margins, start from a smaller photo, or split the document.'
    },
    {
      question: 'Is 500 KB the same as 0.5 MB?',
      answer: 'Yes. Portals phrase the same limit either way. For a 1 MB rule, use Compress PDF to 1MB.'
    },
    {
      question: 'Do I need an account?',
      answer: 'No. Five documents a day and 20 MB per file are free. Larger uploads need Pass or Pro, up to 100 MB.'
    }
  ]
};

const compress1mbCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF to 1MB — Free & Online | One2PDF',
  seoDescription: 'Compress a PDF to 1MB for a portal that rejects larger uploads. Check the size after each level. Free on One2PDF.',
  seoH2: 'Portals that reject a PDF over 1 MB',
  seoP1: '“Maximum file size: 1 MB” is a common line on tax portals, insurance claims, permit applications and client upload boxes. The PDF opens on your computer and fails on theirs. Compress PDF to 1MB uses the same compressor as the main Compress PDF page. The difference is the limit you are trying to clear.',
  seoP2: 'A text report that is only a little over 1 MB can clear the cap on High, and the text stays selectable. A scan or a PDF full of photos usually needs Medium: each page becomes a JPEG, with more detail than Strong. If Medium is still above 1 MB, try Strong and look at a page before you send it. Photos get softer, and you cannot search the text. A file that is already under 1 MB does not need this page.',
  seoP3: 'One2PDF shows the size before and after. That number is the check, not a promise that every PDF will land under 1 MB. An already optimized file can refuse to shrink. Free use allows 5 documents a day and 20 MB per file. The original is deleted when processing ends. The result is deleted after download, or within about 15 minutes if it stays on the server.',
  howTitle: 'How to compress a PDF toward 1 MB',
  howSteps: [
    'Upload the PDF the portal called too large',
    'Use High when the file is mostly text and only slightly over 1 MB',
    'If it is still too big, use Medium, then Strong, and upload only a file that shows under 1 MB'
  ],
  faqTitle: 'Questions about compressing a PDF to 1 MB',
  faq: [
    {
      question: 'Can you compress a PDF to 1 MB exactly?',
      answer: 'The tool reduces the file. It does not pin the output at 1,048,576 bytes. Compare the downloaded size with the portal’s 1 MB rule.'
    },
    {
      question: 'Which level should I try first for a 1 MB cap?',
      answer: 'High, if the recipient must copy the text and the file is close to 1 MB. Medium, if the PDF is a scan.'
    },
    {
      question: 'Why is my PDF still over 1 MB?',
      answer: 'It may already be compressed, or it may contain many large images. Strong goes further by compressing those page images more. Some files never reach 1 MB.'
    },
    {
      question: 'Is 1 MB the same limit as an email attachment?',
      answer: 'Not usually. Mailboxes often allow 10 MB or 25 MB for the whole message. Use Compress PDF for Email when the problem is the mailbox, and this page when the form says 1 MB.'
    },
    {
      question: 'How long is the file kept?',
      answer: 'Until you download it, or about 15 minutes. The original is removed when compression finishes.'
    }
  ]
};

const compress2mbCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF to 2MB — Free & Online | One2PDF',
  seoDescription: 'Reduce a PDF toward a 2 MB attachment or tender-portal limit. Keep selectable text when the file allows it. Free on One2PDF.',
  seoH2: 'A 2 MB ceiling on a portal or an attachment',
  seoP1: 'Tender platforms, company intranets and some email gateways reject one PDF above 2 MB even when the mailbox itself allows more. A slide deck exported to PDF, a photo report or a scanned contract often sits between 2 MB and 15 MB. This page is Compress PDF, aimed at that 2 MB line.',
  seoP2: 'You have more room here than on a 100 KB or 500 KB form. Try High first. High rewrites the document, leaves the text selectable, and can bring a lightly illustrated file under 2 MB. If the size stays above 2 MB, the images are the weight: Medium turns every page into a JPEG and usually clears 2 MB on a short photo PDF. Strong is for the file that is still over 2 MB after Medium. Expect softer pictures and text you cannot select.',
  seoP3: 'Check the reported size against 2 MB before you replace the original. A PDF that is already optimized may shrink only a little at High. Free use allows 5 documents a day and 20 MB per file, so a file you are trying to bring down to 2 MB still has to start within that upload cap unless you use Pass or Pro, up to 100 MB. The original is deleted when processing ends. The result is removed after download, or within about 15 minutes.',
  howTitle: 'How to compress a PDF toward 2 MB',
  howSteps: [
    'Upload the PDF that crossed the 2 MB line',
    'Choose High if the reader must copy the text',
    'Move to Medium or Strong only if the result is still over 2 MB, then send the smaller file'
  ],
  faqTitle: 'Questions about compressing a PDF to 2 MB',
  faq: [
    {
      question: 'Is 2 MB enough for a scanned contract?',
      answer: 'Often, on Medium, when the contract is a handful of pages. A long color scan can stay larger. Split it if the portal accepts several files.'
    },
    {
      question: 'Will High keep the text selectable under 2 MB?',
      answer: 'High always keeps selectable text. Whether the file also falls under 2 MB depends on how large the images were. Compare the size after the run.'
    },
    {
      question: 'What is the difference between 2 MB and 2,000 KB?',
      answer: 'For this kind of portal they mean the same ceiling. The page you want for a 1 MB rule is Compress PDF to 1MB.'
    },
    {
      question: 'Can I compress a file larger than 20 MB down to 2 MB?',
      answer: 'On the free plan the upload itself stops at 20 MB. Pass and Pro accept up to 100 MB per file. The output size is still not guaranteed.'
    },
    {
      question: 'Are my files stored?',
      answer: 'No. Processing deletes the original. The compressed PDF is temporary.'
    }
  ]
};

const compressEmailCopy: PageSeoCopy = {
  seoTitle: 'Compress PDF for Email — Reduce PDF Size for Email | One2PDF',
  seoDescription: 'Reduce PDF size for email when an attachment bounces or the message is too large to send. Free compressor on One2PDF.',
  seoH2: 'Reduce PDF size for an email attachment',
  seoP1: 'Mail programs refuse a message when the attachment, or the whole message, crosses the provider’s limit. A common ceiling is about 10 MB or 20–25 MB for the entire email, not 1 MB for the PDF alone. If a web form told you “1 MB” or “2 MB”, use the page for that number. This page is for the file that will not leave your outbox.',
  seoP2: 'Start with High so the person who opens the PDF can still select and copy the text. High often trims a file that is only a little too big. If the message still bounces, use Medium. Medium and Strong turn each page into a JPEG, which is what actually shrinks a scan or a photo-heavy export, and the text is no longer selectable. Strong is the last step before you split the PDF and send it as two messages. A result under a named mailbox limit is not guaranteed.',
  seoP3: 'After compression, attach the new file and watch the size your mail app shows. The original PDF on your computer is unchanged until you replace it. Free use allows 5 documents a day and 20 MB per file. A larger attachment needs Pass or Pro, up to 100 MB. One2PDF deletes the upload when processing ends and removes the result after download, or within about 15 minutes.',
  howTitle: 'How to reduce a PDF for email',
  howSteps: [
    'Upload the PDF your mail app would not send',
    'Choose High first, so the recipient can still copy the text',
    'If the message still bounces, compress again at Medium or Strong and attach the smaller file'
  ],
  faqTitle: 'Questions about compressing a PDF for email',
  faq: [
    {
      question: 'What size should a PDF be for email?',
      answer: 'There is no single number. Many providers allow about 10 MB to 25 MB for the whole message, including the text of the email. Compress, then read the size your mail app reports.'
    },
    {
      question: 'How do I reduce PDF size for email without losing the text?',
      answer: 'Use the High level. It keeps the text selectable. Medium and Strong are smaller and turn pages into images.'
    },
    {
      question: 'The attachment is under 25 MB and it still fails. Why?',
      answer: 'The limit may apply to the whole message, a company gateway may be stricter, or the recipient’s inbox may be full. Splitting the PDF into two files is the next step.'
    },
    {
      question: 'Is this the same as compressing to 1 MB?',
      answer: 'No. Compress PDF to 1MB is for a portal that names 1 MB. Email limits are usually much higher. Use this page when the mail program rejects the message.'
    },
    {
      question: 'Do you keep the attachment?',
      answer: 'No. The file is deleted after processing, and the result is temporary.'
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
  {
    path: '/compress-pdf-to-100kb',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF to 100KB',
    lead: 'Shrink a short PDF toward a 100 KB form or portal limit, then check the file size.',
    copy: compress100kbCopy
  },
  {
    path: '/compress-pdf-to-200kb',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF to 200KB',
    lead: 'Reduce a PDF toward a 200 KB application or school-portal limit, then confirm the size.',
    copy: compress200kbCopy
  },
  {
    path: '/compress-pdf-to-500kb',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF to 500KB',
    lead: 'Compress a CV, certificate or short scan toward a 500 KB upload limit.',
    copy: compress500kbCopy
  },
  {
    path: '/compress-pdf-to-1mb',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF to 1MB',
    lead: 'Compress a PDF toward a 1 MB portal limit and check the size before you upload.',
    copy: compress1mbCopy
  },
  {
    path: '/compress-pdf-to-2mb',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF to 2MB',
    lead: 'Reduce a PDF toward a 2 MB tender, portal or attachment limit.',
    copy: compress2mbCopy
  },
  {
    path: '/compress-pdf-for-email',
    tool: 'compress',
    live: true,
    h1: 'Compress PDF for Email',
    lead: 'Reduce PDF size for email when the attachment is rejected or the message will not send.',
    copy: compressEmailCopy
  }
];

export type LiveToolVariant = ToolVariant & { h1: string; lead: string; copy: PageSeoCopy };

function isLiveVariant(variant: ToolVariant): variant is LiveToolVariant {
  return variant.live && Boolean(variant.h1 && variant.lead && variant.copy);
}

export function liveToolVariants(tool?: ToolVariant['tool']): LiveToolVariant[] {
  return TOOL_VARIANTS.filter((variant): variant is LiveToolVariant => (
    isLiveVariant(variant) && (tool === undefined || variant.tool === tool)
  ));
}

export type LiveJpgVariant = LiveToolVariant;

export function liveJpgVariants(): LiveJpgVariant[] {
  return liveToolVariants('jpg-to-pdf');
}

export function liveCompressVariants(): LiveToolVariant[] {
  return liveToolVariants('compress');
}

function variantForPath(pathname: string, tool: ToolVariant['tool']) {
  const bare = stripLocalePrefix(pathname.split(/[?#]/)[0] ?? pathname);
  return liveToolVariants(tool).find((variant) => variant.path === bare);
}

export function jpgVariantForPath(pathname: string): LiveJpgVariant | undefined {
  return variantForPath(pathname, 'jpg-to-pdf');
}

export function compressVariantForPath(pathname: string): LiveToolVariant | undefined {
  return variantForPath(pathname, 'compress');
}
