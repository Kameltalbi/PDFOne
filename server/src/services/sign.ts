import fs from 'fs/promises';
import { createRequire } from 'node:module';
import { createCanvas } from '@napi-rs/canvas';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { P12Signer } from '@signpdf/signer-p12';
import forge from 'node-forge';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

const require = createRequire(import.meta.url);
type SignPdfApi = {
  sign: (pdf: Buffer | Uint8Array | string, signer: InstanceType<typeof P12Signer>, signingTime?: Date) => Promise<Buffer>;
};
const loaded = require('@signpdf/signpdf') as SignPdfApi & { default?: SignPdfApi };
const signpdf: SignPdfApi = loaded.default ?? loaded;

const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
type SignPosition = (typeof POSITIONS)[number];

const P12_PASSWORD = 'pdfone-sign';
const BOX_WIDTH = 228;
const BOX_HEIGHT = 78;

let cachedP12: Buffer | null = null;

function asPosition(value: unknown): SignPosition {
  return POSITIONS.includes(value as SignPosition) ? (value as SignPosition) : 'bottom-right';
}

function boxOrigin(position: SignPosition, pageWidth: number, pageHeight: number) {
  const margin = 16;
  const left = margin;
  const right = Math.max(margin, pageWidth - margin - BOX_WIDTH);
  const center = (pageWidth - BOX_WIDTH) / 2;
  const top = pageHeight - margin - BOX_HEIGHT;
  const bottom = margin;
  if (position === 'top-left') return { x: left, y: top };
  if (position === 'top-center') return { x: center, y: top };
  if (position === 'top-right') return { x: right, y: top };
  if (position === 'bottom-left') return { x: left, y: bottom };
  if (position === 'bottom-center') return { x: center, y: bottom };
  return { x: right, y: bottom };
}

function getSigningP12(): Buffer {
  if (cachedP12) return cachedP12;

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 3);
  const attrs = [
    { name: 'commonName', value: 'PDFOne Document Signing' },
    { name: 'organizationName', value: 'PDFOne' },
    { name: 'countryName', value: 'FR' }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true }
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], P12_PASSWORD, { algorithm: '3des' });
  cachedP12 = Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary');
  return cachedP12;
}

function wrapText(ctx: { measureText: (text: string) => { width: number } }, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines.slice(0, 2);
}

function renderStampPng(options: {
  name: string;
  reason: string;
  dateLabel: string;
  signedLabel: string;
  reasonLabel: string;
  date: string;
}): Buffer {
  const width = 912;
  const height = 312;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  ctx.fillStyle = '#dc2626';
  ctx.font = '700 32px sans-serif';
  ctx.fillText(options.signedLabel.slice(0, 48), 36, 56);

  ctx.fillStyle = '#111827';
  ctx.font = 'italic 700 58px serif';
  const name = options.name.slice(0, 64);
  ctx.fillText(name, 36, 140);

  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(36, 168);
  ctx.lineTo(width - 36, 168);
  ctx.stroke();

  ctx.fillStyle = '#4b5563';
  ctx.font = '28px sans-serif';
  ctx.fillText(`${options.dateLabel} : ${options.date}`, 36, 214);

  if (options.reason) {
    ctx.font = '26px sans-serif';
    const reasonLines = wrapText(ctx, `${options.reasonLabel} : ${options.reason}`, width - 72);
    reasonLines.forEach((line, index) => {
      ctx.fillText(line, 36, 258 + index * 32);
    });
  }

  return canvas.toBuffer('image/png');
}

export async function signPdf(
  filePath: string,
  options: {
    name: string;
    reason: string;
    position: string;
    scope: string;
    locale: string;
    signedLabel: string;
    dateLabel: string;
    reasonLabel: string;
  }
) {
  const name = options.name.trim().slice(0, 80);
  if (!name) {
    throw new Error('Indiquez le nom du signataire.');
  }

  const reason = options.reason.trim().slice(0, 120);
  const position = asPosition(options.position);
  const allPages = options.scope === 'all';
  const locale = (options.locale || 'fr').split(/[,;]/)[0].trim() || 'fr';
  const signedAt = new Date();
  const date = signedAt.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });

  try {
    const source = await loadPdf(await fs.readFile(filePath));
    const stamp = await source.embedPng(renderStampPng({
      name,
      reason,
      date,
      signedLabel: options.signedLabel.trim().slice(0, 48) || 'Signed',
      dateLabel: options.dateLabel.trim().slice(0, 24) || 'Date',
      reasonLabel: options.reasonLabel.trim().slice(0, 24) || 'Reason'
    }));

    const pages = source.getPages();
    const targets = allPages ? pages : [pages[pages.length - 1]];
    let widgetRect = [0, 0, BOX_WIDTH, BOX_HEIGHT];

    targets.forEach((page) => {
      const { width, height } = page.getSize();
      const { x, y } = boxOrigin(position, width, height);
      page.drawImage(stamp, { x, y, width: BOX_WIDTH, height: BOX_HEIGHT });
      widgetRect = [x, y, x + BOX_WIDTH, y + BOX_HEIGHT];
    });

    const widgetPage = targets[targets.length - 1];
    pdflibAddPlaceholder({
      pdfPage: widgetPage,
      reason: reason || 'Digital signature',
      contactInfo: 'PDFOne',
      name,
      location: 'PDFOne',
      signingTime: signedAt,
      signatureLength: 16384,
      widgetRect,
      appName: 'PDFOne'
    });

    const withPlaceholder = Buffer.from(await source.save({ useObjectStreams: false }));
    const signer = new P12Signer(getSigningP12(), { passphrase: P12_PASSWORD });
    const signed = await signpdf.sign(withPlaceholder, signer, signedAt);
    return writeTemp(signed, 'signed', 'pdf');
  } catch (error) {
    console.error('Sign PDF error:', error);
    throw new Error(mapPdfError(error, 'Impossible de signer ce PDF.'));
  }
}
