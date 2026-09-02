import type { Locale } from '../i18n/types';

export const COMPRESS_EMAIL_SLUG = 'reduire-taille-pdf-email';
export const PRIVACY_PDF_SLUG = 'confidentialite-pdf-en-ligne';

export type InlinePart = string | { text: string; to: string };

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'p'; parts: InlinePart[] }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: Array<string | InlinePart[]> };

export type BlogPost = {
  slug: string;
  publishedIso: string;
  publishedLabel: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  title: string;
  excerpt: string;
  body: BlogBlock[];
  cta: string;
  ctaTo: string;
};

const compressFr: BlogPost = {
  slug: COMPRESS_EMAIL_SLUG,
  publishedIso: '2026-08-28',
  publishedLabel: '28 août 2026',
  seoTitle: 'PDF trop lourd pour Gmail : que faire | One2PDF',
  seoDescription: 'Un PDF dépasse 25 Mo sur Gmail ou Outlook ? Compressez-le en ligne, sans logiciel, puis envoyez-le. Guide pratique sur One2PDF.',
  keywords: 'compresser PDF, PDF trop lourd, Gmail 25 Mo',
  title: 'Comment réduire la taille d’un fichier PDF trop lourd pour l’envoyer par e-mail',
  excerpt: 'Gmail, Outlook ou un formulaire refusent votre pièce jointe ? Voici pourquoi un PDF pèse trop lourd, et comment l’alléger en quelques secondes sans installer de logiciel.',
  body: [
    { type: 'p', text: 'Vous avez terminé un dossier, un CV ou un portfolio, mais au moment de l’envoyer le message tombe : « Le fichier dépasse la taille maximale autorisée (25 Mo) ». Gmail, Outlook et de nombreux formulaires administratifs coupent net. La bonne nouvelle : on peut souvent réduire le poids d’un PDF en quelques secondes, sans réimprimer le document et sans sacrifier la lisibilité.' },
    { type: 'h2', text: 'Pourquoi certains fichiers PDF deviennent-ils aussi lourds ?' },
    { type: 'p', text: 'Un PDF n’est pas « juste du texte ». Derrière une page, le fichier embarque des images, des polices et parfois des calques hérités d’un scan. Plus ces éléments sont bruts, plus le poids grimpe — même si le document ne fait que quelques pages.' },
    { type: 'h3', text: 'Les images haute définition' },
    { type: 'p', text: 'Un scan de pièce d’identité, un justificatif photographié au téléphone ou des photos non compressées pèsent très lourd. Une image à 300 dpi, utile à l’impression, est souvent excessive pour un envoi par e-mail. C’est la cause n°1 d’un PDF trop volumineux pour Gmail.' },
    { type: 'h3', text: 'Le cumul de pages, de graphiques et de polices' },
    { type: 'p', text: 'Un rapport de 40 pages, des tableaux Excel collés, des captures d’écran et plusieurs polices embarquées alourdissent la structure interne. Fusionner plusieurs fichiers sans les alléger d’abord aggrave le problème : vous additionnez les images pleine résolution.' },
    { type: 'h2', text: 'La solution la plus rapide, sans installer de logiciel' },
    { type: 'p', text: 'Inutile de télécharger un logiciel payant pour un envoi ponctuel. Un outil en ligne de compression de PDF suffit dans la grande majorité des cas : il réduit le poids des images et optimise le fichier, tout en gardant un rendu lisible à l’écran.' },
    { type: 'h3', text: 'Comment compresser un PDF trop lourd sur One2PDF' },
    {
      type: 'ol',
      items: [
        [
          'Rendez-vous sur ',
          { text: 'l’outil de compression de PDF de One2PDF', to: '/compress' },
          '.'
        ],
        'Glissez-déposez votre document directement dans la zone dédiée (ordinateur ou téléphone).',
        'Laissez l’outil optimiser les images et la structure du fichier en quelques secondes. Choisissez un niveau plus fort si le poids reste au-dessus de 25 Mo.',
        'Téléchargez votre nouveau PDF, prêt à être envoyé par e-mail.'
      ]
    },
    { type: 'h2', text: 'Astuces complémentaires si le fichier reste trop lourd' },
    { type: 'h3', text: 'Compresser avant de fusionner' },
    {
      type: 'p',
      parts: [
        'Si vous devez regrouper un contrat, des annexes et un scan, allégez d’abord chaque PDF, puis fusionnez. Un fichier déjà compressé se combine plus facilement qu’une pile d’originaux pleine résolution. ',
        { text: 'Fusionner des PDF', to: '/merge' }
      ]
    },
    { type: 'h3', text: 'Repartir d’images trop lourdes' },
    {
      type: 'p',
      parts: [
        'Un PNG de capture d’écran ou un JPEG de 8 Mo n’a pas besoin de finir tel quel dans le PDF. Convertir d’abord les images en PDF via un convertisseur, ou compresser le PDF une fois assemblé, donne souvent un poids de départ beaucoup plus bas pour l’e-mail. ',
        { text: 'JPG vers PDF', to: '/jpg-to-pdf' }
      ]
    },
    { type: 'p', text: 'Ne laissez plus un plafond de 25 Mo bloquer un CV, un dossier client ou une pièce administrative. Dès qu’un formulaire ou une boîte mail refuse la pièce jointe, un passage par la compression vous fait gagner le temps d’un second envoi — et évite WeTransfer « parce que ça ne passe pas ».' }
  ],
  cta: 'Compresser un PDF gratuitement',
  ctaTo: '/compress'
};

const compressEn: BlogPost = {
  slug: COMPRESS_EMAIL_SLUG,
  publishedIso: '2026-08-28',
  publishedLabel: '28 August 2026',
  seoTitle: 'PDF Too Large for Email? Compress It | One2PDF',
  seoDescription: 'Gmail or Outlook blocking a 25 MB PDF? Compress it online in seconds, with no software to install. A practical guide on One2PDF.',
  keywords: 'compress PDF, PDF too large, Gmail 25 MB',
  title: 'How to reduce a PDF that’s too large to send by email',
  excerpt: 'Gmail, Outlook or a form rejected your attachment? Here’s why PDFs get so heavy, and how to shrink one in seconds with no software to install.',
  body: [
    { type: 'p', text: 'You finished a pack, a CV or a portfolio — then the cutoff hits: “The file exceeds the maximum size (25 MB)”. Gmail, Outlook and many government forms stop the send. You can usually shrink a PDF in a few seconds without reprinting it and without wrecking readability.' },
    { type: 'h2', text: 'Why do some PDFs get so heavy?' },
    { type: 'p', text: 'A PDF is not “just text”. Behind each page sit images, fonts and sometimes scan layers. The less those assets are optimized, the faster the file size climbs — even on a short document.' },
    { type: 'h3', text: 'High-resolution images' },
    { type: 'p', text: 'ID scans, phone photos of receipts or uncompressed pictures add the most weight. 300 dpi is useful for print and often excessive for email. This is the number-one reason a PDF is too large for Gmail.' },
    { type: 'h3', text: 'Pages, charts and embedded fonts adding up' },
    { type: 'p', text: 'A 40-page report, pasted Excel tables, screenshots and several embedded fonts bloat the file structure. Merging several PDFs without shrinking them first makes it worse: you stack full-resolution images.' },
    { type: 'h2', text: 'The fastest fix — no software to install' },
    { type: 'p', text: 'You do not need a paid desktop app for a one-off send. An online PDF compressor is enough in most cases: it slims images and optimizes the file while keeping a readable result on screen.' },
    { type: 'h3', text: 'How to compress a large PDF on One2PDF' },
    {
      type: 'ol',
      items: [
        [
          'Open the ',
          { text: 'One2PDF PDF compression tool', to: '/compress' },
          '.'
        ],
        'Drag and drop your document into the drop zone (computer or phone).',
        'Let the tool optimize images and file structure in a few seconds. Pick a stronger level if the file is still over 25 MB.',
        'Download the new PDF, ready to send by email.'
      ]
    },
    { type: 'h2', text: 'Extra tips if the file is still too big' },
    { type: 'h3', text: 'Compress before you merge' },
    {
      type: 'p',
      parts: [
        'If you must combine a contract, annexes and a scan, shrink each PDF first, then merge. Compressed files combine more cleanly than a stack of full-resolution originals. ',
        { text: 'Merge PDFs', to: '/merge' }
      ]
    },
    { type: 'h3', text: 'Start from heavy images' },
    {
      type: 'p',
      parts: [
        'An 8 MB screenshot PNG or JPEG does not need to land in the PDF as-is. Turning images into PDF first, or compressing the PDF after assembly, often gives a much lower starting weight for email. ',
        { text: 'JPG to PDF', to: '/jpg-to-pdf' }
      ]
    },
    { type: 'p', text: 'Do not let a 25 MB cap block a CV, a client pack or an official upload. As soon as a form or mailbox rejects the attachment, a quick compression pass saves a second send — and avoids a file-share link “because it will not go through”.' }
  ],
  cta: 'Compress a PDF for free',
  ctaTo: '/compress'
};

const privacyFr: BlogPost = {
  slug: PRIVACY_PDF_SLUG,
  publishedIso: '2026-09-02',
  publishedLabel: '2 septembre 2026',
  seoTitle: 'PDF en ligne : comment éviter d’envoyer vos fichiers à un serveur inconnu | One2PDF',
  seoDescription: 'Avant d’utiliser un outil PDF gratuit en ligne, voici ce qu’il faut vérifier pour savoir où vont vraiment vos fichiers — et comment choisir un service transparent.',
  keywords: 'confidentialité PDF en ligne, éditer PDF en sécurité, où vont mes fichiers PDF, outil PDF sans risque',
  title: 'PDF en ligne : comment éviter d’envoyer vos fichiers à un serveur inconnu',
  excerpt: 'Avant d’utiliser un outil PDF gratuit en ligne, voici ce qu’il faut vérifier pour savoir où vont vraiment vos fichiers — et comment choisir un service transparent.',
  body: [
    { type: 'p', text: 'Vous avez un contrat, une facture ou un dossier médical en PDF à convertir, fusionner ou compresser. Vous tapez « convertir PDF en ligne » dans Google, vous cliquez sur le premier résultat, vous glissez votre fichier… et vous ne savez absolument pas ce qu’il devient.' },
    { type: 'p', text: 'C’est le problème central de presque tous les outils PDF gratuits en ligne : votre fichier part quelque part, et la plupart des utilisateurs n’ont ni le temps ni les compétences techniques pour vérifier où, ni pendant combien de temps il y reste.' },
    { type: 'p', text: 'Ce guide explique ce qui se passe réellement quand vous utilisez un outil PDF en ligne, pourquoi ce n’est pas forcément un problème — à condition de choisir le bon service — et ce qu’il faut vérifier avant de faire confiance à un outil avec un document sensible.' },
    { type: 'h2', text: 'Pourquoi presque tous les outils PDF en ligne fonctionnent par upload' },
    { type: 'p', text: 'Contrairement à ce que certains sites laissent entendre, la grande majorité des outils PDF en ligne — y compris les plus connus — ne traitent pas votre fichier « sur votre appareil ». Ils l’envoient sur un serveur, effectuent l’opération demandée (conversion, fusion, compression, OCR), puis vous renvoient le résultat.' },
    { type: 'p', text: 'C’est vrai pour une raison simple : certaines opérations sont beaucoup trop lourdes pour être exécutées correctement dans un navigateur. Convertir un PDF vers un fichier Word ou Excel fidèle à la mise en page originale demande des moteurs de conversion professionnels (comme LibreOffice) que votre navigateur ne peut pas faire tourner seul. Idem pour la reconnaissance de texte (OCR) sur un document scanné, qui nécessite une puissance de calcul que peu d’appareils personnels peuvent offrir rapidement.' },
    { type: 'p', text: 'Il existe quelques outils qui traitent réellement tout dans le navigateur (technologie WebAssembly), mais ils sont souvent limités aux opérations simples — et parfois plus lents ou moins fiables sur les gros fichiers ou les conversions complexes.' },
    { type: 'p', text: 'La vraie question n’est donc pas « est-ce que mon fichier est envoyé quelque part ? » — la réponse est presque toujours oui — mais « où, pour combien de temps, et par qui ? »' },
    { type: 'h2', text: 'Ce qu’il faut vérifier avant de faire confiance à un outil PDF' },
    { type: 'p', text: 'Avant de glisser un document sensible dans n’importe quel convertisseur en ligne, prenez trente secondes pour vérifier ces points :' },
    { type: 'h3', text: '1. La politique de suppression des fichiers' },
    { type: 'p', text: 'Un service sérieux indique clairement combien de temps votre fichier reste sur ses serveurs après traitement — idéalement quelques minutes à quelques heures, jamais « indéfiniment » ou « non précisé ». Cette information doit être facile à trouver, pas enterrée dans 40 pages de conditions d’utilisation.' },
    { type: 'h3', text: '2. La localisation des serveurs et le cadre légal' },
    { type: 'p', text: 'Un fichier traité sur un serveur situé dans l’Union européenne est soumis au RGPD, l’un des cadres de protection des données les plus stricts au monde. Un fichier traité au Canada peut relever de la LPRPDE (PIPEDA) ou, pour les résidents du Québec, de la Loi 25. Ces cadres imposent des obligations réelles sur la collecte, la conservation et la suppression des données — contrairement à des juridictions plus permissives.' },
    { type: 'h3', text: '3. Ce qui se passe avec les fonctionnalités IA' },
    { type: 'p', text: 'De plus en plus d’outils PDF ajoutent des fonctions de résumé ou de traduction propulsées par l’intelligence artificielle. C’est utile, mais cela signifie souvent qu’un tiers supplémentaire (le prestataire IA) reçoit aussi le contenu de votre document. Un service transparent doit préciser clairement quelles fonctionnalités passent par un tiers IA, et lesquelles ne le font jamais.' },
    { type: 'h3', text: '4. La transparence du pipeline technique' },
    { type: 'p', text: 'Un service qui explique concrètement comment il traite vos fichiers — quels outils, quelles étapes — inspire plus confiance qu’une boîte noire qui se contente de dire « vos fichiers sont en sécurité » sans donner de détails vérifiables.' },
    { type: 'h3', text: '5. Le modèle économique' },
    { type: 'p', text: 'Un outil qui affiche des tarifs clairs, sans essai gratuit qui se transforme en abonnement caché à 40 $/mois, est généralement plus digne de confiance qu’un service dont le modèle repose sur la confusion tarifaire. La façon dont un service vous traite sur le prix en dit souvent long sur la façon dont il traite vos données.' },
    { type: 'h2', text: 'Ce que fait concrètement One2PDF' },
    { type: 'p', text: 'Chez One2PDF, on a fait le choix de la transparence plutôt que de la promesse marketing invérifiable. Concrètement :' },
    {
      type: 'ul',
      items: [
        'Vos fichiers sont traités sur un serveur sécurisé — on ne prétend pas le contraire.',
        'Le traitement repose sur des outils reconnus : pdf-lib pour la fusion, la compression, la protection et l’édition ; LibreOffice pour les conversions Word, Excel et PowerPoint (pour une fidélité de mise en page bien supérieure à des convertisseurs légers) ; Tesseract pour l’OCR sur les documents scannés.',
        'Les fonctionnalités de résumé et de traduction, qui passent par un prestataire IA tiers, sont clairement séparées du reste et activées uniquement si vous les utilisez.',
        'Une fois votre fichier traité et téléchargé, il est supprimé automatiquement de nos serveurs.',
        'Aucune carte bancaire n’est requise pour essayer, et aucun abonnement ne se déclenche sans action claire de votre part.'
      ]
    },
    { type: 'p', text: 'On ne prétend pas être une boîte magique où rien ne quitte votre ordinateur — ce serait faux. On préfère vous dire exactement ce qui se passe, pour que vous puissiez décider en connaissance de cause.' },
    { type: 'h2', text: 'En résumé' },
    {
      type: 'ul',
      items: [
        'Presque tous les outils PDF en ligne fonctionnent par upload vers un serveur — c’est normal, pas un signal d’alarme en soi.',
        'Le vrai critère de confiance, c’est la transparence : durée de conservation, localisation des serveurs, usage de l’IA, et clarté du modèle tarifaire.',
        'Méfiez-vous des outils qui promettent « zéro envoi » sans pouvoir le prouver techniquement — et à l’inverse, faites confiance aux services qui expliquent honnêtement leur fonctionnement.'
      ]
    },
    {
      type: 'p',
      parts: [
        'Besoin de convertir, fusionner ou éditer un PDF aujourd’hui ? Essayez One2PDF gratuitement — sans carte bancaire, avec suppression automatique de vos fichiers après traitement. Consultez aussi notre ',
        { text: 'politique de confidentialité', to: '/privacy' },
        '.'
      ]
    }
  ],
  cta: 'Essayer One2PDF gratuitement',
  ctaTo: '/tools'
};

const privacyEn: BlogPost = {
  slug: PRIVACY_PDF_SLUG,
  publishedIso: '2026-09-02',
  publishedLabel: '2 September 2026',
  seoTitle: 'Online PDFs: how to avoid sending files to an unknown server | One2PDF',
  seoDescription: 'Before you use a free online PDF tool, here is what to check so you know where your files actually go — and how to pick a transparent service.',
  keywords: 'online PDF privacy, edit PDF safely, where do my PDF files go, safe PDF tool',
  title: 'Online PDFs: how to avoid sending your files to an unknown server',
  excerpt: 'Before you use a free online PDF tool, here is what to check so you know where your files actually go — and how to pick a transparent service.',
  body: [
    { type: 'p', text: 'You have a contract, an invoice or a medical PDF to convert, merge or compress. You search “convert PDF online”, click the first result, drop your file… and you have no idea what happens to it.' },
    { type: 'p', text: 'That is the core problem with almost every free online PDF tool: your file goes somewhere, and most people have neither the time nor the technical background to check where, or how long it stays there.' },
    { type: 'p', text: 'This guide explains what actually happens when you use an online PDF tool, why that is not automatically a problem — if you pick the right service — and what to verify before you trust a tool with a sensitive document.' },
    { type: 'h2', text: 'Why almost every online PDF tool works by upload' },
    { type: 'p', text: 'Unlike what some sites imply, the vast majority of online PDF tools — including the best-known ones — do not process your file “on your device”. They send it to a server, run the job (conversion, merge, compression, OCR), then send the result back.' },
    { type: 'p', text: 'There is a simple reason: some jobs are far too heavy to run well in a browser. Turning a PDF into a Word or Excel file that keeps the original layout needs professional conversion engines (such as LibreOffice) that your browser cannot run on its own. The same is true for text recognition (OCR) on a scanned document, which needs computing power few personal devices can offer quickly.' },
    { type: 'p', text: 'A few tools really do process everything in the browser (WebAssembly). They are often limited to simple jobs — and can be slower or less reliable on large files or complex conversions.' },
    { type: 'p', text: 'So the real question is not “is my file sent somewhere?” — the answer is almost always yes — but “where, for how long, and by whom?”' },
    { type: 'h2', text: 'What to check before you trust a PDF tool' },
    { type: 'p', text: 'Before you drop a sensitive document into any online converter, take thirty seconds to check these points:' },
    { type: 'h3', text: '1. The file-deletion policy' },
    { type: 'p', text: 'A serious service states clearly how long your file stays on its servers after processing — ideally minutes to a few hours, never “indefinitely” or “not specified”. That information should be easy to find, not buried in 40 pages of terms.' },
    { type: 'h3', text: '2. Server location and legal framework' },
    { type: 'p', text: 'A file processed on a server in the European Union is covered by GDPR, one of the strictest data-protection frameworks in the world. A file processed in Canada may fall under PIPEDA or, for Quebec residents, Law 25. These rules create real duties on collection, retention and deletion — unlike more permissive jurisdictions.' },
    { type: 'h3', text: '3. What happens with AI features' },
    { type: 'p', text: 'More and more PDF tools add summarize or translate features powered by artificial intelligence. Useful, but it often means an extra third party (the AI provider) also receives your document. A transparent service must say clearly which features go through an AI provider, and which never do.' },
    { type: 'h3', text: '4. Technical pipeline transparency' },
    { type: 'p', text: 'A service that explains how it actually processes your files — which tools, which steps — is more trustworthy than a black box that only says “your files are safe” with no verifiable detail.' },
    { type: 'h3', text: '5. The business model' },
    { type: 'p', text: 'A tool with clear prices, and no free trial that turns into a hidden $40/month subscription, is usually more trustworthy than a service whose model depends on confusing billing. How a service treats you on price often says a lot about how it treats your data.' },
    { type: 'h2', text: 'What One2PDF actually does' },
    { type: 'p', text: 'At One2PDF, we chose transparency over an unverifiable marketing claim. In practice:' },
    {
      type: 'ul',
      items: [
        'Your files are processed on a secure server — we do not pretend otherwise.',
        'Processing uses established tools: pdf-lib for merge, compress, protect and edit; LibreOffice for Word, Excel and PowerPoint conversions (for layout fidelity well above lightweight converters); Tesseract for OCR on scanned documents.',
        'Summarize and translate, which go through a third-party AI provider, are clearly separated from the rest and run only if you use them.',
        'Once your file is processed and downloaded, it is deleted automatically from our servers.',
        'No card is required to try the product, and no subscription starts without a clear action from you.'
      ]
    },
    { type: 'p', text: 'We do not claim to be a magic box where nothing leaves your computer — that would be false. We would rather tell you exactly what happens, so you can decide with the facts.' },
    { type: 'h2', text: 'In short' },
    {
      type: 'ul',
      items: [
        'Almost every online PDF tool works by uploading to a server — that is normal, not an alarm by itself.',
        'The real trust test is transparency: retention time, server location, AI use, and a clear pricing model.',
        'Be wary of tools that promise “zero upload” without being able to prove it technically — and trust services that explain honestly how they work.'
      ]
    },
    {
      type: 'p',
      parts: [
        'Need to convert, merge or edit a PDF today? Try One2PDF for free — no card, with automatic file deletion after processing. See also our ',
        { text: 'privacy policy', to: '/privacy' },
        '.'
      ]
    }
  ],
  cta: 'Try One2PDF for free',
  ctaTo: '/tools'
};

function postsFor(locale: Locale): BlogPost[] {
  return locale === 'fr' ? [privacyFr, compressFr] : [privacyEn, compressEn];
}

export function getBlogPosts(locale: Locale): BlogPost[] {
  return postsFor(locale);
}

export function getBlogPost(locale: Locale, slug: string): BlogPost | undefined {
  return postsFor(locale).find((post) => post.slug === slug);
}

export function mergeBlogPosts(locale: Locale, remote: BlogPost[]): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  for (const post of postsFor(locale)) bySlug.set(post.slug, post);
  for (const post of remote) bySlug.set(post.slug, post);
  return [...bySlug.values()].sort((a, b) => b.publishedIso.localeCompare(a.publishedIso));
}
