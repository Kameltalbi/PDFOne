const PREFIXES = ['fr', 'es', 'de', 'pt', 'it', 'tr', 'ar'];

const EXACT = {
  '/blog/reduire-taille-pdf-email': '/blog/how-to-reduce-pdf-size-for-email'
};

const LOCALIZED_ALIASES = {
  '/pdf-to-pptx': '/pdf-to-ppt',
  '/pptx-to-pdf': '/ppt-to-pdf'
};

const ENGLISH_ONLY = [
  '/png-to-pdf',
  '/images-to-pdf',
  '/onenote-to-pdf',
  '/one2pdf-vs-online2pdf',
  '/alternatives'
];

function buildRedirects() {
  const map = { ...EXACT };
  for (const [from, to] of Object.entries(LOCALIZED_ALIASES)) {
    map[from] = to;
    for (const prefix of PREFIXES) map[`/${prefix}${from}`] = `/${prefix}${to}`;
  }
  for (const path of ENGLISH_ONLY) {
    for (const prefix of PREFIXES) map[`/${prefix}${path}`] = path;
  }
  return map;
}

const REDIRECTS = buildRedirects();

export function permanentRedirect(pathname) {
  const path = (pathname.split(/[?#]/)[0] ?? pathname).replace(/\/+$/, '') || '/';
  return REDIRECTS[path] ?? null;
}

export function redirectEntries() {
  return Object.entries(REDIRECTS);
}

export function nginxRedirectConf() {
  const lines = [
    '# Application 301s for one2pdf.com.',
    '# Include this file inside the HTTPS server block that already serves the apex host.',
    '# Do not also redirect /png-to-pdf to /jpg-to-pdf: /png-to-pdf is now its own page.',
    '# http to https and www to the apex host stay in the main server block, as a single hop.',
    ''
  ];
  for (const [from, to] of redirectEntries()) {
    lines.push(`location = ${from} { return 301 https://one2pdf.com${to}; }`);
  }
  lines.push('');
  return lines.join('\n');
}
