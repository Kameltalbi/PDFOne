import type { Messages } from '../types';
import { en } from './en';

export const it: Messages = {
  ...en,
  htmlTitle: 'One2PDF — Strumenti PDF',
  brand: 'One2PDF',
  common: { ...en.common, home: 'Home', tools: 'Strumenti', download: 'Scarica', downloadPdf: 'Scarica il PDF', login: 'Accedi', signup: 'Registrati', privacy: 'Privacy', contact: 'Contatto', seeAll: 'Vedi tutto', pricing: 'Prezzi', about: 'Chi siamo', getPro: 'Passa a Pro', footerTools: 'Strumenti', footerCompany: 'One2PDF', footerLegal: 'Note legali', menu: 'Apri il menu', closeMenu: 'Chiudi il menu', processingFailed: 'Elaborazione non riuscita. Riprova.', progressDone: '{progress} % completato', page: 'pagina', pages: 'pagine', fileTooLarge: '« {name} » supera {size}.', pdfOnly: 'Sono accettati solo file PDF.', imagesOnly: 'Sono accettate solo immagini JPG, PNG o WebP.', maxFiles: 'Massimo {count} file.', quotaReached: 'Il piano gratuito è limitato a 3 documenti al giorno. Passa a Pro per continuare.' },
  nav: { convert: 'Strumenti PDF', pdfTools: 'Strumenti PDF', fromPdf: 'Converti da PDF', toPdf: 'Converti in PDF', allTools: 'Tutti gli strumenti', edit: 'Modifica PDF', merge: 'Unisci PDF', split: 'Dividi', compress: 'Comprimi', protect: 'Proteggi' },
  tools: { ...en.tools, edit: 'Modifica PDF', merge: 'Unisci PDF', split: 'Dividi PDF', compress: 'Comprimi PDF', protect: 'Proteggi PDF', pdfToWord: 'PDF in Word', wordToPdf: 'Word in PDF', pdfToJpg: 'PDF in JPG', jpgToPdf: 'JPG in PDF', pdfToExcel: 'PDF in Excel', rotate: 'Ruota PDF', sign: 'Firma digitale', deletePages: 'Elimina pagine', reorderPages: 'Riordina pagine', badgeNew: 'Nuovo', badgeSoon: 'Presto', catalogTitle: 'Strumenti PDF online', catalogSubtitle: 'Modifica, converti e organizza i documenti con semplicità.', searchPlaceholder: 'Cerca uno strumento PDF…', popular: 'Strumenti PDF popolari', others: 'Altri strumenti PDF', emptyTitle: 'Nessuno strumento trovato', emptyText: 'Prova un’altra parola chiave.' },
  home: { ...en.home, seoTitle: 'Strumenti PDF online — Unisci, comprimi, converti | One2PDF', seoDescription: 'Unisci, comprimi, converti, dividi e gestisci i file PDF in pochi secondi. Gratis, senza creare un account.', eyebrow: 'SEMPLICE, VELOCE E SICURO', title: 'Tutto ciò che serve per lavorare con i PDF.', titleAccent: '', subtitle: 'Unisci, comprimi, converti, dividi e gestisci i file PDF in pochi secondi.', ctaEdit: 'Modifica un PDF', ctaTools: 'Scegli uno strumento PDF', trustInstall: 'Nessuna installazione richiesta.', trustSize: '20 MB in gratuito', trustDelete: 'File eliminati automaticamente', popularTitle: 'Strumenti PDF popolari', seeAllTools: 'Vedi tutti gli strumenti PDF →', processTitle: 'Come funziona', processText: 'Tre passaggi. Nessun software da installare.', processCta: 'Scegli uno strumento PDF', step1Title: 'Carica', step1Text: 'Scegli o trascina il file.', step2Title: 'Elabora', step2Text: 'One2PDF elabora il documento.', step3Title: 'Scarica', step3Text: 'Scarica il nuovo file.', value2Text: 'I file vengono elaborati temporaneamente. L’originale viene eliminato al termine dell’elaborazione. Un risultato non scaricato viene cancellato entro 15 minuti.', ctaTitle: 'Ti serve più potenza?', ctaText: 'Passa a One2PDF Pro per flussi PDF più avanzati.', ctaButton: 'Scopri One2PDF Pro', trustLine: 'Veloce · Sicuro · Facile da usare', proBenefits: ['Niente pubblicità', 'File oltre i 20 MB', 'Più file alla volta', 'Nessun limite giornaliero di documenti'] },
  about: {
    seoTitle: 'Chi siamo | One2PDF, strumenti PDF semplici',
    seoDescription: 'One2PDF è una piattaforma internazionale di strumenti PDF semplici e veloci. Gestita da 9545-8907 QUEBEC INC., Québec, Canada.',
    title: 'Chi siamo',
    lead: 'Semplice. Veloce. Sicuro. Accessibile.',
    p1: 'One2PDF è una piattaforma internazionale di strumenti PDF online. Unisci, comprimi, converti, dividi e gestisci i file nel browser — senza installare software e senza creare un account per l’uso gratuito.',
    p2: 'Il prodotto è pensato per il lavoro di tutti i giorni: un’interfaccia chiara, elaborazioni brevi e documenti che non vengono conservati dopo l’uso.',
    company: 'One2PDF è gestita da 9545-8907 QUEBEC INC., Québec, Canada.',
    cta: 'Vedi gli strumenti PDF'
  },
  merge: { ...en.merge, title: 'Unisci PDF', subtitle: 'Combina i file PDF in un unico documento, nell’ordine che preferisci.', selectFiles: '+ Seleziona file', orDrop: 'oppure trascina qui', preparing: 'Preparazione dell’anteprima…', mergedTitle: 'PDF uniti', mergedText: 'I file sono stati combinati in un unico documento.', mergeMore: 'Unisci altri file', needTwo: 'Aggiungi almeno 2 file PDF.', cannotMerge: 'Impossibile unire questi PDF.', pageNumbers: 'Aggiungi i numeri di pagina', merging: 'Unione in corso…', mergeCount: 'Unisci {count} file' },
  split: { ...en.split, title: 'Dividi PDF' },
  compress: { ...en.compress, title: 'Comprimi PDF', action: 'Comprimi il PDF' },
  protect: { ...en.protect, title: 'Proteggi PDF', password: 'Password', action: 'Proteggi il PDF' },
  toJpg: { ...en.toJpg, title: 'PDF in JPG' },
  jpgToPdf: { ...en.jpgToPdf, title: 'JPG in PDF' },
  convert: { ...en.convert, pdfToWordTitle: 'PDF in Word', wordToPdfTitle: 'Word in PDF', pdfToExcelTitle: 'PDF in Excel', excelToPdfTitle: 'Excel in PDF', pdfToPptTitle: 'PDF in PowerPoint', pptToPdfTitle: 'PowerPoint in PDF', action: 'Converti il file', invalidFile: 'Questo tipo di file non è accettato per questa conversione.' },
  toPng: { ...en.toPng, title: 'PDF in PNG' },
  toText: { ...en.toText, title: 'PDF in testo' },
  unlockPdf: { ...en.unlockPdf, title: 'Sblocca PDF' },
  ocrPdf: { ...en.ocrPdf, title: 'PDF OCR' },
  summarizePdf: { ...en.summarizePdf, title: 'Riassumi un PDF' },
  translatePdf: { ...en.translatePdf, title: 'Traduci il PDF' },
  htmlPdf: { ...en.htmlPdf, title: 'HTML in PDF' },
  upload: { ...en.upload, drop: 'Trascina i file qui o', browse: 'sfoglia', hintPdf: 'File PDF', remove: 'Rimuovi' },
  edit: { ...en.edit, title: 'Modifica PDF', select: 'Seleziona il file', resultTitle: 'Il tuo PDF è pronto!' }
};
