import type { Locale } from '../i18n/types';

export const COMPRESS_EMAIL_SLUG = 'reduire-taille-pdf-email';

export type BlogPost = {
  slug: string;
  publishedIso: string;
  publishedLabel: string;
  seoTitle: string;
  seoDescription: string;
  title: string;
  excerpt: string;
  intro: string;
  h2Why: string;
  whyLead: string;
  whyImagesTitle: string;
  whyImages: string;
  whyPagesTitle: string;
  whyPages: string;
  h2Solution: string;
  solutionLead: string;
  stepsTitle: string;
  step1Before: string;
  step1After: string;
  steps: string[];
  h2Bonus: string;
  bonusMergeTitle: string;
  bonusMerge: string;
  bonusImagesTitle: string;
  bonusImages: string;
  conclusion: string;
  cta: string;
  compressLabel: string;
};

const fr: BlogPost = {
  slug: COMPRESS_EMAIL_SLUG,
  publishedIso: '2026-08-28',
  publishedLabel: '28 août 2026',
  seoTitle: 'PDF trop lourd pour Gmail : que faire | One2PDF',
  seoDescription: 'Un PDF dépasse 25 Mo sur Gmail ou Outlook ? Compressez-le en ligne, sans logiciel, puis envoyez-le. Guide pratique sur One2PDF.',
  title: 'Comment réduire la taille d’un fichier PDF trop lourd pour l’envoyer par e-mail',
  excerpt: 'Gmail, Outlook ou un formulaire refusent votre pièce jointe ? Voici pourquoi un PDF pèse trop lourd, et comment l’alléger en quelques secondes sans installer de logiciel.',
  intro: 'Vous avez terminé un dossier, un CV ou un portfolio, mais au moment de l’envoyer le message tombe : « Le fichier dépasse la taille maximale autorisée (25 Mo) ». Gmail, Outlook et de nombreux formulaires administratifs coupent net. La bonne nouvelle : on peut souvent réduire le poids d’un PDF en quelques secondes, sans réimprimer le document et sans sacrifier la lisibilité.',
  h2Why: 'Pourquoi certains fichiers PDF deviennent-ils aussi lourds ?',
  whyLead: 'Un PDF n’est pas « juste du texte ». Derrière une page, le fichier embarque des images, des polices et parfois des calques hérités d’un scan. Plus ces éléments sont bruts, plus le poids grimpe — même si le document ne fait que quelques pages.',
  whyImagesTitle: 'Les images haute définition',
  whyImages: 'Un scan de pièce d’identité, un justificatif photographié au téléphone ou des photos non compressées pèsent très lourd. Une image à 300 dpi, utile à l’impression, est souvent excessive pour un envoi par e-mail. C’est la cause n°1 d’un PDF trop volumineux pour Gmail.',
  whyPagesTitle: 'Le cumul de pages, de graphiques et de polices',
  whyPages: 'Un rapport de 40 pages, des tableaux Excel collés, des captures d’écran et plusieurs polices embarquées alourdissent la structure interne. Fusionner plusieurs fichiers sans les alléger d’abord aggrave le problème : vous additionnez les images pleine résolution.',
  h2Solution: 'La solution la plus rapide, sans installer de logiciel',
  solutionLead: 'Inutile de télécharger un logiciel payant pour un envoi ponctuel. Un outil en ligne de compression de PDF suffit dans la grande majorité des cas : il réduit le poids des images et optimise le fichier, tout en gardant un rendu lisible à l’écran.',
  stepsTitle: 'Comment compresser un PDF trop lourd sur One2PDF',
  step1Before: 'Rendez-vous sur ',
  step1After: '.',
  steps: [
    'Glissez-déposez votre document directement dans la zone dédiée (ordinateur ou téléphone).',
    'Laissez l’outil optimiser les images et la structure du fichier en quelques secondes. Choisissez un niveau plus fort si le poids reste au-dessus de 25 Mo.',
    'Téléchargez votre nouveau PDF, prêt à être envoyé par e-mail.'
  ],
  h2Bonus: 'Astuces complémentaires si le fichier reste trop lourd',
  bonusMergeTitle: 'Compresser avant de fusionner',
  bonusMerge: 'Si vous devez regrouper un contrat, des annexes et un scan, allégez d’abord chaque PDF, puis fusionnez. Un fichier déjà compressé se combine plus facilement qu’une pile d’originaux pleine résolution.',
  bonusImagesTitle: 'Repartir d’images trop lourdes',
  bonusImages: 'Un PNG de capture d’écran ou un JPEG de 8 Mo n’a pas besoin de finir tel quel dans le PDF. Convertir d’abord les images en PDF via un convertisseur, ou compresser le PDF une fois assemblé, donne souvent un poids de départ beaucoup plus bas pour l’e-mail.',
  conclusion: 'Ne laissez plus un plafond de 25 Mo bloquer un CV, un dossier client ou une pièce administrative. Dès qu’un formulaire ou une boîte mail refuse la pièce jointe, un passage par la compression vous fait gagner le temps d’un second envoi — et évite WeTransfer « parce que ça ne passe pas ».',
  cta: 'Compresser un PDF gratuitement',
  compressLabel: 'l’outil de compression de PDF de One2PDF'
};

const en: BlogPost = {
  slug: COMPRESS_EMAIL_SLUG,
  publishedIso: '2026-08-28',
  publishedLabel: '28 August 2026',
  seoTitle: 'PDF Too Large for Email? Compress It | One2PDF',
  seoDescription: 'Gmail or Outlook blocking a 25 MB PDF? Compress it online in seconds, with no software to install. A practical guide on One2PDF.',
  title: 'How to reduce a PDF that’s too large to send by email',
  excerpt: 'Gmail, Outlook or a form rejected your attachment? Here’s why PDFs get so heavy, and how to shrink one in seconds with no software to install.',
  intro: 'You finished a pack, a CV or a portfolio — then the cutoff hits: “The file exceeds the maximum size (25 MB)”. Gmail, Outlook and many government forms stop the send. You can usually shrink a PDF in a few seconds without reprinting it and without wrecking readability.',
  h2Why: 'Why do some PDFs get so heavy?',
  whyLead: 'A PDF is not “just text”. Behind each page sit images, fonts and sometimes scan layers. The less those assets are optimized, the faster the file size climbs — even on a short document.',
  whyImagesTitle: 'High-resolution images',
  whyImages: 'ID scans, phone photos of receipts or uncompressed pictures add the most weight. 300 dpi is useful for print and often excessive for email. This is the number-one reason a PDF is too large for Gmail.',
  whyPagesTitle: 'Pages, charts and embedded fonts adding up',
  whyPages: 'A 40-page report, pasted Excel tables, screenshots and several embedded fonts bloat the file structure. Merging several PDFs without shrinking them first makes it worse: you stack full-resolution images.',
  h2Solution: 'The fastest fix — no software to install',
  solutionLead: 'You do not need a paid desktop app for a one-off send. An online PDF compressor is enough in most cases: it slims images and optimizes the file while keeping a readable result on screen.',
  stepsTitle: 'How to compress a large PDF on One2PDF',
  step1Before: 'Open the ',
  step1After: '.',
  steps: [
    'Drag and drop your document into the drop zone (computer or phone).',
    'Let the tool optimize images and file structure in a few seconds. Pick a stronger level if the file is still over 25 MB.',
    'Download the new PDF, ready to send by email.'
  ],
  h2Bonus: 'Extra tips if the file is still too big',
  bonusMergeTitle: 'Compress before you merge',
  bonusMerge: 'If you must combine a contract, annexes and a scan, shrink each PDF first, then merge. Compressed files combine more cleanly than a stack of full-resolution originals.',
  bonusImagesTitle: 'Start from heavy images',
  bonusImages: 'An 8 MB screenshot PNG or JPEG does not need to land in the PDF as-is. Turning images into PDF first, or compressing the PDF after assembly, often gives a much lower starting weight for email.',
  conclusion: 'Do not let a 25 MB cap block a CV, a client pack or an official upload. As soon as a form or mailbox rejects the attachment, a quick compression pass saves a second send — and avoids a file-share link “because it will not go through”.',
  cta: 'Compress a PDF for free',
  compressLabel: 'One2PDF PDF compression tool'
};

export function getBlogPosts(locale: Locale): BlogPost[] {
  return [locale === 'fr' ? fr : en];
}

export function getBlogPost(locale: Locale, slug: string): BlogPost | undefined {
  return getBlogPosts(locale).find((post) => post.slug === slug);
}
