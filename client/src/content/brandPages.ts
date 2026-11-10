import { TOOL_CATALOG } from '../lib/toolCatalog';

const CHECK = '[À VÉRIFIER]';

export type Faq = { question: string; answer: string };

export type GuideSection = { heading: string; paragraphs: string[] };

export const ONE_NOTE_PAGE = {
  path: '/onenote-to-pdf',
  title: 'OneNote to PDF — Convert ONE Files to PDF Online | One2PDF',
  description: 'Export a OneNote notebook to PDF from Windows, Mac or the web, and what to do with a .one file when OneNote is not installed. Guide by One2PDF.',
  h1: 'OneNote to PDF',
  lead: 'One2PDF does not convert an uploaded .one or .onepkg file. OneNote can export a page, a section or a notebook to PDF. This page is the export guide, plus the One2PDF tools that help after the export.',
  sections: [
    {
      heading: 'Export to PDF from OneNote for Windows (desktop)',
      paragraphs: [
        'Open the notebook in the OneNote desktop app. Select the page, the section or the notebook you want.',
        'Use File, then Export. Choose the scope (page, section or notebook), choose PDF as the format, and export.',
        'Save the PDF, then open it to check that handwritten notes, printouts and images came through. A large notebook can produce a large PDF.'
      ]
    },
    {
      heading: 'Export from OneNote for Windows 10 and Windows 11',
      paragraphs: [
        'The OneNote app from the Microsoft Store does not use the same File menu as the desktop app.',
        'Open the page, open the share or more menu, and look for Export or Send a copy. Choose PDF when that option is listed.',
        'If the installed app has no PDF export, open the same notebook in OneNote on the web or in the desktop app and export from there.'
      ]
    },
    {
      heading: 'Export from OneNote on Mac',
      paragraphs: [
        'Open the notebook in OneNote for Mac. Select the page or section you want in the PDF.',
        'Use File, then Export. Choose PDF, choose the scope, and save the file.',
        'Check the PDF before you send it. Drawings and attached printouts do not always land on the page the way they look in OneNote.'
      ]
    },
    {
      heading: 'Export from OneNote on the web',
      paragraphs: [
        'Open the notebook at onenote.com (or from OneDrive) in a browser. You need access to that Microsoft account.',
        'Open the page menu or the notebook menu and choose Export, then PDF, when the menu offers it. The exact label depends on the current OneNote web app.',
        'The web export covers the pages OneNote can open in the browser. It does not open a loose .one file that was only saved on a disk.'
      ]
    },
    {
      heading: 'If you only have a .one or .onepkg file',
      paragraphs: [
        'A .one file is a OneNote section. A .onepkg file is a package of sections. Neither one is a PDF, and One2PDF cannot read them.',
        'Install OneNote, or open the file on a computer that already has it: double-click the .one file, or in OneNote use File, then Open, and pick the file. After the section opens, export to PDF with the steps above.',
        'If you cannot install OneNote, ask the person who sent the file for a PDF export. Printing to XPS on Windows and converting that XPS is a different product’s workaround. One2PDF does not convert XPS either.'
      ]
    }
  ] satisfies GuideSection[],
  howTitle: 'How to get a PDF out of OneNote',
  howSteps: [
    'Open the notebook in OneNote on Windows, Mac or the web',
    'Choose the page, section or notebook you want',
    'Export and choose PDF',
    'Open the PDF and check the pages',
    'Use One2PDF only after you have a PDF or images'
  ],
  linksTitle: 'After the export',
  links: [
    { href: '/merge', label: 'Merge PDF', text: 'Join several exported pages or sections into one file.' },
    { href: '/compress', label: 'Compress PDF', text: 'Reduce a notebook export that is too large to email.' },
    { href: '/images-to-pdf', label: 'Images to PDF', text: 'Build a PDF from screenshots when export is not available.' }
  ],
  faqTitle: 'Questions about OneNote to PDF',
  faq: [
    {
      question: 'Can I upload a .one file to One2PDF?',
      answer: 'No. One2PDF does not read .one or .onepkg files. Export to PDF from OneNote first, or open the file in OneNote and export it.'
    },
    {
      question: 'What is the difference between .one and .onepkg?',
      answer: 'A .one file is one OneNote section. A .onepkg file packages one or more sections. Both open in OneNote. Neither is converted by uploading it here.'
    },
    {
      question: 'Which OneNote app has File > Export?',
      answer: 'The desktop apps on Windows and Mac have File, then Export. The Windows 10 and Windows 11 Store app uses a share or more menu, and may not list PDF. OneNote on the web has its own export command when you are signed in.'
    },
    {
      question: 'What if the exported PDF is too large?',
      answer: 'Export a single section instead of the whole notebook, or run the PDF through Compress PDF. Compression can shrink images. Medium and strong compression turn pages into images, so the text is no longer selectable.'
    },
    {
      question: 'Can I make a PDF from screenshots of my notes?',
      answer: 'Yes. Save the screenshots as images and open Images to PDF. That is a fallback when you cannot export from OneNote. It is not the same as a text export.'
    }
  ] satisfies Faq[]
};

export type ComparisonRow = { feature: string; ours: string; theirs: string };

export type ComparisonPageCopy = {
  id: string;
  path: string;
  /** Routed only when true. Still noindex until the competitor cells are confirmed. */
  live: boolean;
  title: string;
  description: string;
  h1: string;
  disclaimer: string;
  competitor: string;
  rows: ComparisonRow[];
  chooseTitle: string;
  chooseOursTitle: string;
  chooseOurs: string[];
  chooseTheirsTitle: string;
  chooseTheirs: string[];
  faqTitle: string;
  faq: Faq[];
};

const toolCount = String(TOOL_CATALOG.length);

export const COMPARISONS: ComparisonPageCopy[] = [
  {
    id: 'online2pdf',
    path: '/one2pdf-vs-online2pdf',
    live: true,
    title: 'One2PDF vs Online2PDF — Feature Comparison | One2PDF',
    description: 'A factual comparison of One2PDF and Online2PDF. Competitor details stay marked until they are checked. One2PDF is not affiliated with Online2PDF.',
    h1: 'One2PDF vs Online2PDF',
    disclaimer: 'One2PDF is not affiliated with Online2PDF.',
    competitor: 'Online2PDF',
    rows: [
      { feature: 'Advertising', ours: 'Free pages show an empty box labeled Advertisement. No third-party ad is loaded in the current site.', theirs: CHECK },
      { feature: 'Account required', ours: 'No. The tools run without an account. An account is optional.', theirs: CHECK },
      { feature: 'How long files are kept', ours: 'The upload is deleted when processing finishes. The result is deleted after download, or within about 15 minutes if it is not downloaded.', theirs: CHECK },
      { feature: 'Number of tools', ours: `${toolCount} tools are listed on the tools page.`, theirs: CHECK },
      { feature: 'Edit PDF', ours: 'Yes. Edit PDF changes text and drawings on a page.', theirs: CHECK },
      { feature: 'Fill and sign', ours: 'Yes. Fill & Sign fills form fields and adds a signature image.', theirs: CHECK },
      { feature: 'Digital signature', ours: 'Yes. Digital signature adds a signature. It does not replace a qualified eIDAS certificate.', theirs: CHECK },
      { feature: 'OCR', ours: 'Yes. OCR reads a scanned page into text. It is a separate tool from PDF to Word.', theirs: CHECK },
      { feature: 'HEIC to PDF', ours: 'Yes. HEIC photos from an iPhone can be turned into a PDF.', theirs: CHECK },
      { feature: 'Summarize and translate', ours: 'Yes. Summarize PDF and Translate PDF are on the site. Translate is not offered for indexing.', theirs: CHECK },
      { feature: 'OneNote / .one conversion', ours: 'No upload conversion. The OneNote to PDF page explains how to export from OneNote.', theirs: CHECK },
      { feature: 'Languages', ours: 'English and French are in the language menu. Spanish, German, Portuguese, Italian, Turkish and Arabic pages also exist.', theirs: CHECK },
      { feature: 'Mobile interface', ours: 'The site is a responsive web app. There is no separate phone app.', theirs: CHECK }
    ],
    chooseTitle: 'When to choose which',
    chooseOursTitle: 'Choose One2PDF when',
    chooseOurs: [
      'You want to start without an account.',
      'You need edit, fill and sign, a digital signature, HEIC, OCR, or a written OneNote export guide in the same place.',
      'You already have a PDF or images. One2PDF does not open a .one file.'
    ],
    chooseTheirsTitle: 'Choose Online2PDF when',
    chooseTheirs: [
      `You already use their workflow and you have checked that it still matches your file. Specific limits, ads and file retention are ${CHECK}.`,
      'You need a conversion this site does not offer. Compare that claim on their page before you rely on it.',
      'A long-running product can be the right tool for a habit you already trust. We have not re-tested their current feature list.'
    ],
    faqTitle: 'Questions about the two sites',
    faq: [
      {
        question: 'Is One2PDF affiliated with Online2PDF?',
        answer: 'No. One2PDF is not affiliated with Online2PDF. The names are similar. The sites are not the same product.'
      },
      {
        question: 'Why does a search for one2pdf show another site?',
        answer: 'The names differ by two letters. A results page can show either site. This page states what One2PDF does, and leaves Online2PDF claims marked until they are checked.'
      },
      {
        question: 'Can One2PDF convert a OneNote .one file?',
        answer: 'No. Export the notebook to PDF from OneNote, then use One2PDF on that PDF. The steps are on the OneNote to PDF page.'
      },
      {
        question: 'Why do some cells say [À VÉRIFIER]?',
        answer: 'Those cells are facts about the other site. They stay unpublished until someone checks them. Nothing in those cells should be quoted as a claim.'
      }
    ]
  },
  {
    id: 'smallpdf',
    path: '/one2pdf-vs-smallpdf',
    live: false,
    title: 'One2PDF vs Smallpdf — Feature Comparison | One2PDF',
    description: 'Draft comparison. Not published.',
    h1: 'One2PDF vs Smallpdf',
    disclaimer: 'One2PDF is not affiliated with Smallpdf.',
    competitor: 'Smallpdf',
    rows: [],
    chooseTitle: 'When to choose which',
    chooseOursTitle: 'Choose One2PDF when',
    chooseOurs: [],
    chooseTheirsTitle: 'Choose Smallpdf when',
    chooseTheirs: [],
    faqTitle: 'Questions',
    faq: []
  },
  {
    id: 'ilovepdf',
    path: '/one2pdf-vs-ilovepdf',
    live: false,
    title: 'One2PDF vs iLovePDF — Feature Comparison | One2PDF',
    description: 'Draft comparison. Not published.',
    h1: 'One2PDF vs iLovePDF',
    disclaimer: 'One2PDF is not affiliated with iLovePDF.',
    competitor: 'iLovePDF',
    rows: [],
    chooseTitle: 'When to choose which',
    chooseOursTitle: 'Choose One2PDF when',
    chooseOurs: [],
    chooseTheirsTitle: 'Choose iLovePDF when',
    chooseTheirs: [],
    faqTitle: 'Questions',
    faq: []
  },
  {
    id: 'pdfcandy',
    path: '/one2pdf-vs-pdfcandy',
    live: false,
    title: 'One2PDF vs PDF Candy — Feature Comparison | One2PDF',
    description: 'Draft comparison. Not published.',
    h1: 'One2PDF vs PDF Candy',
    disclaimer: 'One2PDF is not affiliated with PDF Candy.',
    competitor: 'PDF Candy',
    rows: [],
    chooseTitle: 'When to choose which',
    chooseOursTitle: 'Choose One2PDF when',
    chooseOurs: [],
    chooseTheirsTitle: 'Choose PDF Candy when',
    chooseTheirs: [],
    faqTitle: 'Questions',
    faq: []
  }
];

export function liveComparison(id: string) {
  return COMPARISONS.find((page) => page.live && page.id === id);
}

export type AlternativeSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  href?: string;
  hrefLabel?: string;
};

export const ALTERNATIVES_PAGE = {
  path: '/alternatives',
  title: 'Free alternatives to popular PDF tools | One2PDF',
  description: 'How One2PDF compares as a free alternative for everyday PDF work. Competitor details stay marked until they are checked.',
  h1: 'Free alternatives to popular PDF tools',
  lead: 'One2PDF is a browser tool for PDF files: merge, compress, convert, edit, fill and sign, and more. You can start without an account. Facts about other products below are not filled in yet.',
  sections: [
    {
      id: 'online2pdf',
      heading: 'Online2PDF',
      paragraphs: [
        `Online2PDF is a separate site. One2PDF is not affiliated with it. What that site currently charges, requires, or keeps on its servers is ${CHECK}.`,
        'One2PDF does not convert an uploaded OneNote .one file. It does edit PDFs, fill and sign, add a digital signature, read scans with OCR, and turn HEIC photos into a PDF.',
        'Read the comparison page before you treat any cell about that site as fact.'
      ],
      href: '/one2pdf-vs-online2pdf',
      hrefLabel: 'Open the comparison'
    },
    {
      id: 'smallpdf',
      heading: 'Smallpdf',
      paragraphs: [
        `Pricing, account rules and file retention for this product are ${CHECK}.`,
        'One2PDF lets you merge, compress, convert and edit in the browser without an account. The result file is temporary.'
      ]
    },
    {
      id: 'ilovepdf',
      heading: 'iLovePDF',
      paragraphs: [
        `Pricing, account rules and file retention for this product are ${CHECK}.`,
        'One2PDF covers the same kind of everyday PDF jobs and adds fill and sign, a digital signature, HEIC to PDF, and summarize on the same site.'
      ]
    },
    {
      id: 'pdfcandy',
      heading: 'PDF Candy',
      paragraphs: [
        `Pricing, ads and file retention for this product are ${CHECK}.`,
        'One2PDF does not load a third-party ad. Free pages do show an empty box labeled Advertisement. Tools run without an account, and files are deleted after processing.'
      ]
    }
  ] as AlternativeSection[],
  faqTitle: 'Questions',
  faq: [
    {
      question: 'Is One2PDF affiliated with these products?',
      answer: 'No. One2PDF is not affiliated with Online2PDF, Smallpdf, iLovePDF or PDF Candy.'
    },
    {
      question: 'Do I need an account to try One2PDF?',
      answer: 'No. The tools run without an account. Creating an account is optional.'
    },
    {
      question: 'Are the notes about other products final?',
      answer: 'No. Anything marked [À VÉRIFIER] is not a published fact. Those pages stay out of Google until the cells are checked.'
    },
    {
      question: 'Does One2PDF convert OneNote files?',
      answer: 'No. The OneNote to PDF page explains how to export from OneNote. After that, you can merge or compress the PDF here.'
    }
  ] satisfies Faq[]
};

export const HOME_PROOF = ['No signup', 'Files deleted automatically'];

export const HOME_BEYOND = {
  label: 'Beyond conversion',
  title: 'More than convert and compress',
  text: 'Merge and compress are here. These tools sit next to them.',
  links: [
    { href: '/edit-pdf', label: 'Edit PDF' },
    { href: '/fill-sign-pdf', label: 'Fill & Sign' },
    { href: '/sign', label: 'Digital signature' },
    { href: '/heic-to-pdf', label: 'HEIC to PDF' },
    { href: '/summarize', label: 'Summarize PDF' },
    { href: '/translate', label: 'Translate PDF' },
    { href: '/onenote-to-pdf', label: 'OneNote to PDF' }
  ]
};

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function oneNoteArticleHtml() {
  const page = ONE_NOTE_PAGE;
  const parts = [
    `<p>${esc(page.lead)}</p>`,
    ...page.sections.flatMap((section) => [
      `<h2>${esc(section.heading)}</h2>`,
      ...section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`)
    ]),
    `<h2>${esc(page.howTitle)}</h2>`,
    `<ol>${page.howSteps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>`,
    `<h2>${esc(page.linksTitle)}</h2>`,
    `<ul>${page.links.map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a> — ${esc(link.text)}</li>`).join('')}</ul>`,
    `<h2>${esc(page.faqTitle)}</h2>`,
    ...page.faq.flatMap((item) => [`<h3>${esc(item.question)}</h3>`, `<p>${esc(item.answer)}</p>`])
  ];
  return parts.join('\n');
}

export function comparisonArticleHtml(page: ComparisonPageCopy) {
  const head = `<p>${esc(page.disclaimer)}</p><table><thead><tr><th>Feature</th><th>One2PDF</th><th>${esc(page.competitor)}</th></tr></thead><tbody>${page.rows.map((row) => `<tr><th scope="row">${esc(row.feature)}</th><td>${esc(row.ours)}</td><td>${esc(row.theirs)}</td></tr>`).join('')}</tbody></table>`;
  const choose = `<h2>${esc(page.chooseTitle)}</h2><h3>${esc(page.chooseOursTitle)}</h3><ul>${page.chooseOurs.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><h3>${esc(page.chooseTheirsTitle)}</h3><ul>${page.chooseTheirs.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  const faq = `<h2>${esc(page.faqTitle)}</h2>${page.faq.map((item) => `<h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p>`).join('')}`;
  return `${head}\n${choose}\n${faq}`;
}

export function alternativesArticleHtml() {
  const page = ALTERNATIVES_PAGE;
  const sections = page.sections.map((section) => {
    const link = section.href ? `<p><a href="${esc(section.href)}">${esc(section.hrefLabel ?? section.href)}</a></p>` : '';
    return `<h2>${esc(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${link}`;
  }).join('\n');
  const faq = `<h2>${esc(page.faqTitle)}</h2>${page.faq.map((item) => `<h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p>`).join('')}`;
  return `<p>${esc(page.lead)}</p>\n${sections}\n${faq}`;
}

export function homeExtraHtml(subtitle: string) {
  const proof = `<p>${HOME_PROOF.map(esc).join(' · ')}</p>`;
  const beyond = `<h2>${esc(HOME_BEYOND.title)}</h2><p>${esc(HOME_BEYOND.text)}</p><ul>${HOME_BEYOND.links.map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('')}</ul>`;
  return `${proof}<p>${esc(subtitle)}</p>${beyond}`;
}
