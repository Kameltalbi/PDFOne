import type { PageSeoCopy } from '../types';

/** Italian SEO copy. Not wired into sitemap, hreflang or prerender. */
export const seoIt = {
  wordToPdf: {
    seoTitle: 'Convertire Word in PDF | One2PDF',
    seoDescription: 'Trasforma un file Word (.doc, .docx) in PDF nel browser, senza installare Microsoft Word.',
    seoH2: 'Come convertire Word in PDF',
    seoP1: 'Un curriculum, un contratto o un report arrivano meglio in PDF. Carica .doc, .docx, .odt o .rtf, avvia la conversione e scarica il PDF.',
    seoP2: 'Impaginazione, font e immagini restano abbastanza fedeli da leggere a schermo o stampare. Serve per un’e-mail, una candidatura o un modulo che chiede il PDF.',
    seoP3: 'Il file originale non viene conservato. Il PDF resta disponibile per il download e poi viene eliminato. Senza download, One2PDF lo rimuove al massimo in 15 minuti. L’uso occasionale non richiede un account.',
    howTitle: 'Convertire Word in PDF',
    howSteps: [
      'Carica il file Word (.doc, .docx, .odt o .rtf)',
      'Avvia la conversione nel browser',
      'Scarica il PDF'
    ],
    faqTitle: 'Domande su Word in PDF',
    faq: [
      {
        question: 'Serve Microsoft Word installato?',
        answer: 'No. One2PDF converte .doc, .docx, .odt e .rtf nel browser. Non serve Word sul computer.'
      },
      {
        question: 'Convertire Word in PDF è gratis?',
        answer: 'Sì, senza account. Il piano gratuito consente 5 documenti al giorno e file fino a 20 MB. Pass e Pro: nessun limite giornaliero di elaborazioni; file fino a 100 MB.'
      },
      {
        question: 'One2PDF conserva il mio file Word?',
        answer: 'No. L’originale viene eliminato a fine elaborazione. Il PDF si può scaricare una volta e poi viene rimosso. Senza download, succede al massimo in 15 minuti.'
      }
    ]
  },
  pdfToWord: {
    seoTitle: 'Convertire PDF in Word | One2PDF',
    seoDescription: 'Trasforma un PDF in un documento Word modificabile. La conversione avviene online, senza Microsoft Word.',
    seoH2: 'Come rendere un PDF modificabile in Word',
    seoP1: 'Se il testo è chiuso in un PDF, One2PDF lo passa a DOC o DOCX. Carica il file, avvia la conversione e apri il risultato in Word.',
    seoP2: 'Il testo e un’impaginazione utilizzabile vengono ricostruiti per correggere, commentare o copiare brani. Una scansione che è solo un’immagine può aver bisogno dell’OCR prima.',
    seoP3: 'Il PDF originale non viene conservato. Il file Word resta disponibile per il download e poi viene eliminato. L’uso occasionale non chiede nome né e-mail.',
    howTitle: 'Convertire un PDF in Word',
    howSteps: [
      'Carica il PDF che vuoi modificare',
      'Avvia la conversione',
      'Scarica il file Word e aprilo'
    ],
    faqTitle: 'Domande su PDF in Word',
    faq: [
      {
        question: 'Il file Word resta modificabile?',
        answer: 'Sì. La conversione ricostruisce il testo e un’impaginazione utilizzabile. Le scansioni complesse possono richiedere l’OCR se il PDF è solo un’immagine.'
      },
      {
        question: 'Serve un account per convertire PDF in Word?',
        answer: 'No. L’uso gratuito non chiede nome né e-mail. L’account Pro serve solo a chi paga e usa e-mail e password.'
      },
      {
        question: 'I file restano salvati dopo la conversione?',
        answer: 'No. Il PDF originale viene eliminato alla fine. Il risultato Word sparisce dopo il download, o al massimo in 15 minuti se non lo scarichi.'
      }
    ]
  },
  excelToPdf: {
    seoTitle: 'Convertire Excel in PDF | One2PDF',
    seoDescription: 'Fissa un foglio Excel in un PDF stabile, così nessuno modifica le celle. Senza installare Microsoft Excel.',
    seoH2: 'Come passare da Excel a un PDF stabile',
    seoP1: 'Carica .xls, .xlsx, .ods o .csv. La conversione fissa colonne, totali e impaginazione in un PDF pronto da inviare.',
    seoP2: 'Serve per un preventivo, un report o una contabilità che deve arrivare senza modifiche.',
    seoP3: 'Il foglio originale non viene conservato. Il PDF resta disponibile per il download e poi viene eliminato. L’uso occasionale non richiede un account.'
  },
  pptToPdf: {
    seoTitle: 'Convertire PowerPoint in PDF | One2PDF',
    seoDescription: 'Trasforma una presentazione PowerPoint in PDF per inviarla o archiviarla senza che il destinatario abbia PowerPoint.',
    seoH2: 'Come convertire PowerPoint in PDF',
    seoP1: 'Carica .ppt, .pptx o .odp. L’ordine delle slide resta in un PDF che si può proiettare, stampare o conservare.',
    seoP2: 'Serve per un’e-mail, materiale di formazione o un dossier che deve aprirsi uguale su qualsiasi dispositivo.',
    seoP3: 'La presentazione originale non viene conservata. Il PDF resta un momento per il download e poi viene eliminato. L’uso occasionale non richiede un account.'
  },
  protect: {
    seoTitle: 'Proteggere PDF con password | One2PDF',
    seoDescription: 'Cifra un PDF perché si apra solo con la password che scegli. Il processo avviene nel browser.',
    seoH2: 'Come proteggere un PDF con password',
    seoP1: 'Carica il file, scrivi una password, confermala e scarica il PDF bloccato. Chi non la conosce non può aprirlo.',
    seoP2: 'Il contenuto non cambia per chi ha la chiave. Serve per un contratto, una busta paga o un documento che non deve aprirsi senza controllo.',
    seoP3: 'L’originale non viene conservato. Il PDF protetto viene eliminato dopo il download. Conserva la password: One2PDF non la recupera. L’uso occasionale non richiede un account.'
  },
  toJpg: {
    seoTitle: 'Convertire PDF in JPG | One2PDF',
    seoDescription: 'Esporta ogni pagina di un PDF come immagine JPG. Se ce ne sono più di una, arrivano insieme in uno ZIP.',
    seoH2: 'Come convertire un PDF in JPG',
    seoP1: 'Carica il PDF e avvia la conversione. Ogni pagina diventa un JPG, utile per una chat, un sito o una galleria.',
    seoP2: 'Più pagine si raggruppano in uno ZIP. Una sola pagina si scarica come immagine.',
    seoP3: 'Il PDF di origine non viene conservato. Le immagini vengono eliminate dopo il download. L’uso occasionale non richiede un account.'
  },
  jpgToPdf: {
    seoTitle: 'Convertire JPG in PDF | One2PDF',
    seoDescription: 'Riunisci foto JPG, PNG o WebP in un solo PDF, nell’ordine delle miniature. Senza installare un programma.',
    seoH2: 'Come convertire immagini JPG in PDF',
    seoP1: 'Carica JPG, PNG o WebP, trascina le miniature per fissare l’ordine e crea un documento pronto da inviare.',
    seoP2: 'Ogni immagine occupa una pagina. Serve per una scansione dal telefono, screenshot o un dossier di foto.',
    seoP3: 'Le immagini non vengono conservate. Il PDF viene eliminato dopo il download, o al massimo in 15 minuti se non lo scarichi. L’uso occasionale non richiede un account.',
    howTitle: 'Convertire JPG in PDF',
    howSteps: [
      'Carica immagini JPG, PNG o WebP',
      'Riordina le miniature se serve',
      'Scarica il PDF'
    ],
    faqTitle: 'Domande su JPG in PDF',
    faq: [
      {
        question: 'Posso unire più immagini in un solo PDF?',
        answer: 'Sì. Carica JPG, PNG o WebP, ordina le miniature e crea un PDF.'
      },
      {
        question: 'Serve installare un programma?',
        answer: 'No. La conversione avviene nel browser.'
      },
      {
        question: 'One2PDF conserva le mie foto?',
        answer: 'No. Vengono elaborate solo durante l’operazione. Gli originali vengono eliminati alla fine. Il PDF sparisce dopo il download o al massimo in 15 minuti.'
      }
    ]
  },
  edit: {
    seoTitle: 'Modificare PDF online | One2PDF',
    seoDescription: 'Aggiungi testo, un disegno, un’immagine o una firma al PDF ed esporta il documento. Senza Adobe Acrobat.',
    seoH2: 'Come modificare un PDF nel browser',
    seoP1: 'Carica il file, aggiungi testo, disegna, inserisci un’immagine o una firma ed esporta il documento modificato.',
    seoP2: 'L’anteprima mostra ogni modifica pagina per pagina, prima del download. Serve per annotare una scansione o firmare un file.',
    seoP3: 'L’originale non viene conservato. Il PDF modificato resta disponibile per il download e poi viene eliminato. L’uso occasionale non richiede un account.'
  },
  rotate: {
    seoTitle: 'Ruotare PDF online | One2PDF',
    seoDescription: 'Raddrizza una pagina capovolta o una scansione di lato. Ruota una pagina o tutte, di 90° in 90°.',
    seoH2: 'Come ruotare le pagine di un PDF',
    seoP1: 'Carica il PDF e ruota la pagina visibile o tutte le pagine a passi di 90°. Poi scarica il documento corretto.',
    seoP2: 'Serve per una scansione dal telefono o una pagina invertita. Il contenuto resta; cambia solo l’orientamento.',
    seoP3: 'L’originale non viene conservato. Il PDF ruotato viene eliminato dopo il download. L’uso occasionale non richiede un account.',
    howTitle: 'Ruotare un PDF',
    howSteps: [
      'Carica il PDF con la pagina storta',
      'Ruota la pagina o tutte le pagine di 90°',
      'Scarica il PDF corretto'
    ],
    faqTitle: 'Domande su ruotare PDF',
    faq: [
      {
        question: 'Posso ruotare una sola pagina?',
        answer: 'Sì. Scegli la pagina e ruotala di 90° in 90°. Puoi anche ruotare tutte le pagine insieme.'
      },
      {
        question: 'Ruotare cambia il contenuto?',
        answer: 'No. Testo e immagini restano. Cambia solo l’orientamento della pagina.'
      },
      {
        question: 'Il file viene conservato?',
        answer: 'No. L’originale viene eliminato a fine elaborazione. Il risultato sparisce dopo il download o al massimo in 15 minuti.'
      }
    ]
  },
  watermark: {
    seoTitle: 'Filigrana su un PDF | One2PDF',
    seoDescription: 'Contrassegna tutte le pagine con un testo come Riservato o Bozza. Regola l’opacità e scarica il PDF.',
    seoH2: 'Come mettere una filigrana su un PDF',
    seoP1: 'Scrivi il testo, scegli opacità e orientamento e applicalo a tutte le pagine.',
    seoP2: 'L’anteprima mostra il testo prima dell’esportazione. Resta leggibile senza coprire del tutto il contenuto.',
    seoP3: 'L’originale non viene conservato. Il PDF con filigrana viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  pdfToExcel: {
    seoTitle: 'Convertire PDF in Excel | One2PDF',
    seoDescription: 'Passa le tabelle di un PDF a un foglio Excel per filtrare o ricalcolare. Senza installare Microsoft Excel.',
    seoH2: 'Come passare le tabelle da PDF a Excel',
    seoP1: 'Carica il PDF e avvia la conversione. Colonne e righe vengono ricostruite per quanto l’impaginazione lo consente.',
    seoP2: 'Serve per un preventivo, un report o numeri che vuoi filtrare o ricalcolare.',
    seoP3: 'Il PDF originale non viene conservato. Il file Excel resta disponibile per il download e poi viene eliminato. L’uso occasionale non richiede un account.'
  },
  pdfToPpt: {
    seoTitle: 'Convertire PDF in PowerPoint | One2PDF',
    seoDescription: 'Trasforma ogni pagina di un PDF in una slide PowerPoint. Senza installare Microsoft PowerPoint.',
    seoH2: 'Come passare da un PDF alle slide',
    seoP1: 'Carica il PDF. Ogni pagina diventa una slide in un file PPTX che puoi annotare o proiettare.',
    seoP2: 'Serve per portare un dossier, una scaletta o una proposta in riunione.',
    seoP3: 'Il PDF originale non viene conservato. La presentazione resta disponibile per il download e poi viene eliminata. L’uso occasionale non richiede un account.'
  },
  unlock: {
    seoTitle: 'Sbloccare PDF | One2PDF',
    seoDescription: 'Togli la password di apertura da un PDF se la conosci già. Non apre file di cui non hai la chiave.',
    seoH2: 'Come sbloccare un PDF tuo',
    seoP1: 'Inserisci la password attuale. Il risultato si apre poi senza richiesta.',
    seoP2: 'One2PDF non scopre password sconosciute. Solo documenti di cui possiedi la chiave.',
    seoP3: 'L’originale non resta sul server. Il PDF sbloccato viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  ocr: {
    seoTitle: 'Riconoscere il testo in un PDF scansionato | One2PDF',
    seoDescription: 'Riconosci il testo di una scansione e scarica un PDF selezionabile. L’OCR è nel Pass di 7 giorni o nel Pro.',
    seoH2: 'Come rendere ricercabile una scansione',
    seoP1: 'Carica la scansione e avvia il riconoscimento. Il risultato è un PDF di cui si può selezionare, cercare o riusare il testo. L’OCR usa Tesseract ed è incluso nel Pass di 7 giorni o nel Pro.',
    seoP2: 'La qualità dipende dalla nitidezza della scansione. Poi puoi estrarre, tradurre o riassumere il testo.',
    seoP3: 'L’originale non viene conservato. Il PDF con OCR resta disponibile per il download e poi viene eliminato. L’uso occasionale degli altri strumenti non richiede un account; l’OCR in sé chiede Pass o Pro.'
  },
  translate: {
    seoTitle: 'Tradurre PDF e mantenere l’impaginazione | One2PDF',
    seoDescription: 'Traduci il testo di un PDF e lascialo nelle zone originali. Due modi: conservare l’impaginazione o solo il testo. Usa crediti IA.',
    seoH2: 'Come tradurre un PDF senza ricomporlo',
    seoP1: 'One2PDF traduce il testo e lo rimette nelle zone originali. Immagini, loghi e tabelle restano. Scegli la lingua di partenza, quella di arrivo e poi conserva l’impaginazione o solo testo.',
    seoP2: 'L’impaginazione non è identica al pixel: alcune lingue diventano più lunghe o più corte. La dimensione del carattere si adatta entro il limite. Una scansione con poco testo selezionabile passa prima dall’OCR.',
    seoP3: 'L’originale non viene conservato. Il PDF tradotto viene eliminato dopo il download. La traduzione linguistica usa un fornitore di IA solo se avvii questo strumento. Conta 1 credito per pagina trattata.',
    howTitle: 'Tradurre un PDF',
    howSteps: [
      'Carica il PDF',
      'Scegli la lingua di partenza, quella di arrivo e il tipo di risultato',
      'Scarica il PDF tradotto'
    ],
    faqTitle: 'Domande su tradurre PDF',
    faq: [
      {
        question: 'L’impaginazione resta uguale?',
        answer: 'Per quanto possibile: immagini, loghi e zone di testo restano. Una traduzione più lunga può ridurre un po’ il carattere nella casella, senza renderlo illeggibile.'
      },
      {
        question: 'Ricevo un PDF o un file di testo?',
        answer: 'Il risultato principale è un PDF tradotto. C’è anche un .txt. La modalità solo testo produce un PDF di contenuto senza ricostruire il disegno originale della pagina.'
      },
      {
        question: 'Le scansioni funzionano?',
        answer: 'Sì. Se c’è poco testo selezionabile, One2PDF fa prima l’OCR con Tesseract e poi traduce i blocchi riconosciuti.'
      }
    ]
  },
  sign: {
    seoTitle: 'Firmare PDF online | One2PDF',
    seoDescription: 'Aggiungi nome, data e un timbro visibile al PDF e scarica il documento firmato. Senza stampare.',
    seoH2: 'Come firmare un PDF nel browser',
    seoP1: 'Carica il file, scrivi il nome, scegli la posizione del timbro e scarica il documento firmato.',
    seoP2: 'L’anteprima mostra nome, data e motivo sull’ultima pagina o su tutte, prima dell’esportazione.',
    seoP3: 'L’originale non viene conservato. Il PDF firmato viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  pageNumbers: {
    seoTitle: 'Numerare le pagine di un PDF | One2PDF',
    seoDescription: 'Metti 1, 1/12 o Pagina 1 su ogni foglio. Scegli la posizione e scarica il PDF numerato.',
    seoH2: 'Come numerare un PDF',
    seoP1: 'Scegli il formato e la posizione. I numeri vengono applicati in una volta a tutte le pagine.',
    seoP2: 'L’anteprima mostra il numero in alto o in basso, a sinistra, al centro o a destra, prima dell’esportazione.',
    seoP3: 'L’originale non viene conservato. Il PDF numerato viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  crop: {
    seoTitle: 'Ritagliare PDF | One2PDF',
    seoDescription: 'Taglia margini bianchi o bordi di una scansione su tutte le pagine insieme. Senza programma.',
    seoH2: 'Come ritagliare un PDF',
    seoP1: 'Definisci i margini. Lo stesso ritaglio vale per tutte le pagine. La zona chiara resta; quella scura viene rimossa.',
    seoP2: 'Serve per una scansione dal telefono con troppo margine o uno scontrino che supera il foglio.',
    seoP3: 'L’originale non viene conservato. Il PDF ritagliato viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  deletePages: {
    seoTitle: 'Eliminare pagine da un PDF | One2PDF',
    seoDescription: 'Togli una copertina, un foglio bianco o allegati di troppo. Deve restare almeno una pagina nel documento.',
    seoH2: 'Come eliminare pagine da un PDF',
    seoP1: 'Clicca le pagine che vuoi togliere ed esporta il documento più corto. Deve restare almeno una pagina.',
    seoP2: 'L’anteprima mostra ogni foglio prima di rimuoverlo. Le pagine non scelte mantengono ordine e contenuto.',
    seoP3: 'L’originale non viene conservato. Il PDF ripulito viene eliminato dopo il download. L’uso occasionale non richiede un account.'
  },
  reorder: {
    seoTitle: 'Riordinare le pagine di un PDF | One2PDF',
    seoDescription: 'Trascina le miniature nell’ordine giusto e scarica il PDF.',
    seoH2: 'Come mettere le pagine di un PDF nell’ordine giusto',
    seoP1: 'Trascina le miniature e salva il nuovo ordine. Cambia solo la sequenza, non il contenuto delle pagine.',
    seoP2: 'Serve quando la copertina è finita in mezzo o una scansione ha mescolato le pagine.',
    seoP3: 'L’originale non viene conservato. Il PDF riordinato viene eliminato dopo il download. L’uso occasionale non richiede un account.',
    howTitle: 'Riordinare le pagine',
    howSteps: [
      'Carica il PDF',
      'Trascina le miniature nell’ordine giusto',
      'Scarica il PDF aggiornato'
    ],
    faqTitle: 'Domande su riordinare le pagine',
    faq: [
      {
        question: 'Riordinare cambia il contenuto della pagina?',
        answer: 'No. Cambia solo l’ordine. Testo, immagini e qualità restano.'
      },
      {
        question: 'Posso spostare una sola pagina?',
        answer: 'Sì. Trascina la miniatura nel punto giusto e salva.'
      },
      {
        question: 'Il file viene conservato?',
        answer: 'No. L’originale viene eliminato a fine elaborazione. Il risultato sparisce dopo il download o al massimo in 15 minuti.'
      }
    ]
  },
  toPng: {
    seoTitle: 'Convertire PDF in PNG | One2PDF',
    seoDescription: 'Esporta ogni pagina di un PDF come PNG nitido. Più pagine arrivano in uno ZIP.',
    seoH2: 'Come convertire un PDF in PNG',
    seoP1: 'Ogni pagina diventa un PNG, adatto al web e allo schermo. Più pagine si raggruppano in un archivio.',
    seoP2: 'Il PNG mantiene grafica piatta più nitida di un JPG molto compresso.',
    seoP3: 'Il PDF di origine viene elaborato e poi eliminato. L’uso occasionale non richiede un account.',
    howTitle: 'Convertire PDF in PNG',
    howSteps: [
      'Carica il PDF',
      'Avvia la conversione',
      'Scarica i file PNG'
    ],
    faqTitle: 'Domande su PDF in PNG',
    faq: [
      {
        question: 'Ricevo un file o più file?',
        answer: 'Una pagina diventa un PNG. Più pagine arrivano insieme in uno ZIP.'
      },
      {
        question: 'A cosa serve il PNG?',
        answer: 'Per aree nitide, testo e screenshot. Per le foto, il JPG di solito è più piccolo.'
      },
      {
        question: 'Il PDF viene conservato?',
        answer: 'No. Viene elaborato solo per la conversione e poi eliminato.'
      }
    ]
  },
  toText: {
    seoTitle: 'Estrarre testo da un PDF | One2PDF',
    seoDescription: 'Passa il testo selezionabile di un PDF a un file .txt. Se è una scansione, fai prima l’OCR.',
    seoH2: 'Come estrarre testo da un PDF',
    seoP1: 'Lo strumento legge il livello di testo e salva il contenuto come .txt. Puoi incollarlo, cercarlo o riscriverlo.',
    seoP2: 'Una scansione senza livello di testo restituisce poco. Fai prima l’OCR se il testo è solo un’immagine.',
    seoP3: 'Il PDF non viene conservato. Scarica il file di testo se vuoi tenerlo. L’uso occasionale non richiede un account.',
    howTitle: 'Estrarre testo da un PDF',
    howSteps: [
      'Carica il PDF con testo selezionabile',
      'Avvia l’estrazione',
      'Scarica il file .txt'
    ],
    faqTitle: 'Domande sull’estrazione del testo',
    faq: [
      {
        question: 'Funziona su una scansione?',
        answer: 'Solo se il testo è già selezionabile. Altrimenti usa prima l’OCR.'
      },
      {
        question: 'Che formato ricevo?',
        answer: 'Un file .txt semplice, senza l’impaginazione originale.'
      },
      {
        question: 'Il contenuto viene conservato?',
        answer: 'No. L’elaborazione è temporanea. Scarica il file se vuoi conservarlo.'
      }
    ]
  },
  summarize: {
    seoTitle: 'Riassumere PDF | One2PDF',
    seoDescription: 'Ottieni un riassunto breve, dettagliato o per punti. Usa crediti IA: 1 credito per pagina.',
    seoH2: 'Come riassumere un PDF',
    seoP1: 'Scegli lo stile e la lingua del riassunto. Conta 1 credito IA per pagina, al massimo 20 crediti per file. I PDF più lunghi vengono tagliati prima del modello.',
    seoP2: 'Una scansione ha prima bisogno di un livello di testo. Fai l’OCR se nulla è selezionabile.',
    seoP3: 'L’originale non viene conservato. Puoi copiare il riassunto o scaricarlo come .txt. Un processo fallito non trattiene i crediti.',
    howTitle: 'Riassumere un PDF',
    howSteps: [
      'Carica il PDF',
      'Scegli lo stile e la lingua',
      'Copia o scarica il riassunto'
    ],
    faqTitle: 'Domande su riassumere PDF',
    faq: [
      {
        question: 'Come si calcolano i crediti IA?',
        answer: '1 credito per pagina, al massimo 20 crediti per file. I documenti più lunghi vengono tagliati prima del riassunto. Un processo fallito non consuma i crediti.'
      },
      {
        question: 'Quali stili esistono?',
        answer: 'Breve, dettagliato o punti chiave. La lingua del riassunto può essere diversa da quella del documento.'
      },
      {
        question: 'Funziona su una scansione?',
        answer: 'Solo con un livello di testo. Fai prima l’OCR se il PDF è solo un’immagine.'
      }
    ]
  },
  htmlPdf: {
    seoTitle: 'Convertire HTML in PDF | One2PDF',
    seoDescription: 'Trasforma una pagina HTML o codice incollato in PDF. L’HTML molto dinamico si riproduce peggio dell’HTML semplice.',
    seoH2: 'Come convertire HTML in PDF',
    seoP1: 'Carica un file .html o incolla il codice. La conversione gira sul server.',
    seoP2: 'L’HTML semplice resta ben rappresentato. Le pagine con molto JavaScript possono uscire incomplete.',
    seoP3: 'L’HTML non viene conservato. Il PDF viene eliminato dopo il download. L’uso occasionale non richiede un account.',
    howTitle: 'Convertire HTML in PDF',
    howSteps: [
      'Carica un file .html o incolla l’HTML',
      'Avvia la conversione',
      'Scarica il PDF'
    ],
    faqTitle: 'Domande su HTML in PDF',
    faq: [
      {
        question: 'Posso incollare HTML senza file?',
        answer: 'Sì. Incolla il codice nella casella e crea il PDF.'
      },
      {
        question: 'Le pagine web complesse sono supportate?',
        answer: 'L’HTML semplice resta ben rappresentato. Le pagine con molto JavaScript possono restare incomplete.'
      },
      {
        question: 'Serve un account?',
        answer: 'No per l’uso occasionale. Il file e il risultato sono temporanei.'
      }
    ]
  }
} satisfies Record<string, PageSeoCopy>;

export const mergeSeoIt = {
  seoTitle: 'Unire PDF online | One2PDF',
  seoDescription: 'Unisci più PDF in un solo documento, nell’ordine delle miniature. Senza installare un programma.',
  seoH2: 'Come unire più PDF in un solo file',
  seoP1: 'Carica almeno due PDF, trascina le miniature nell’ordine giusto e uniscili. In pochi secondi hai un documento da scaricare.',
  seoP2: 'Le pagine restano come sono, senza filigrana. Se serve, puoi numerarle dopo con lo strumento dei numeri di pagina.',
  seoP3: 'Gli originali non vengono conservati. Il PDF unito viene eliminato dopo il download. Senza download, One2PDF lo rimuove al massimo in 15 minuti. L’uso occasionale non richiede un account.',
  howTitle: 'Unire file PDF',
  howSteps: [
    'Scegli i PDF che vuoi unire',
    'Mettili nell’ordine che ti serve',
    'Scarica il PDF unito'
  ],
  faqTitle: 'Domande su unire PDF',
  faq: [
    {
      question: 'Quanti PDF posso unire in una volta?',
      answer: 'Puoi aggiungere più PDF e riordinarli dalle miniature. Il piano gratuito ha un limite giornaliero di documenti e 20 MB per file. Il Pro sblocca l’elaborazione in blocco e file più grandi.'
    },
    {
      question: 'Serve un account per unire PDF?',
      answer: 'No. L’uso gratuito non chiede nome né e-mail. Scegli lo strumento, carica i file e scarica il risultato.'
    },
    {
      question: 'I PDF originali vengono conservati?',
      answer: 'No. Gli originali vengono eliminati alla fine. Il file unito sparisce dopo il download, o al massimo in 15 minuti se non lo scarichi.'
    }
  ]
} satisfies PageSeoCopy;

export const splitSeoIt = {
  seoTitle: 'Dividere PDF online | One2PDF',
  seoDescription: 'Estrai pagine o separa ogni foglio nel suo PDF, dentro uno ZIP. Senza installare un programma.',
  seoH2: 'Come dividere un PDF',
  seoP1: 'Carica il file e scegli le pagine con un clic o con un intervallo come 1-3, 5, 8. Poi avvia l’operazione.',
  seoP2: 'Estrarre riunisce le pagine scelte in un PDF più corto. Separare esporta ogni pagina come file proprio, in uno ZIP.',
  seoP3: 'L’originale non viene conservato. Il risultato viene eliminato dopo il download. L’uso occasionale non richiede un account.',
  howTitle: 'Dividere un PDF',
  howSteps: [
    'Carica il PDF',
    'Seleziona le pagine da estrarre o separare',
    'Scarica il risultato'
  ],
  faqTitle: 'Domande su dividere PDF',
  faq: [
    {
      question: 'Posso dividere un PDF in più file?',
      answer: 'Sì. Separare esporta ogni pagina come PDF proprio, in uno ZIP. Per tenere alcune pagine in un solo documento, usa Estrai.'
    },
    {
      question: 'Dividere un PDF è gratis?',
      answer: 'Sì, senza account per l’uso occasionale. Il piano gratuito consente 5 documenti al giorno e file fino a 20 MB.'
    },
    {
      question: 'L’originale viene conservato?',
      answer: 'No. Viene eliminato a fine elaborazione. Il risultato sparisce dopo il download o al massimo in 15 minuti.'
    }
  ]
} satisfies PageSeoCopy;

export const compressSeoIt = {
  seoTitle: 'Comprimere PDF online | One2PDF',
  seoDescription: 'Riduci il peso di un PDF troppo grande e scarica un file più leggero, ancora leggibile. Senza installare un programma.',
  seoH2: 'Come comprimere un PDF',
  seoP1: 'Carica il file, scegli un livello (alto, medio o forte) e avvia la compressione. In pochi secondi hai un PDF più piccolo da scaricare.',
  seoP2: 'Alto conserva il testo. Medio e forte riducono di più le immagini: il testo non è più selezionabile perché le pagine diventano immagini. Utile quando Gmail, Outlook o un modulo rifiutano un allegato.',
  seoP3: 'L’originale non viene conservato. Il risultato si scarica e poi viene eliminato. Senza download, One2PDF lo rimuove al massimo in 15 minuti. L’uso occasionale non richiede un account.',
  howTitle: 'Comprimere un PDF',
  howSteps: [
    'Carica il PDF che pesa troppo',
    'Scegli un livello di compressione',
    'Scarica il file più leggero'
  ],
  faqTitle: 'Domande su comprimere PDF',
  faq: [
    {
      question: 'Come comprimere un PDF troppo grande per l’e-mail?',
      answer: 'Gmail e Outlook rifiutano spesso gli allegati sopra 25 MB. Su One2PDF, carica il PDF, scegli un livello (alto, medio o forte) e comprimi. Il file più leggero resta leggibile e, in genere, entra nel limite di invio.'
    },
    {
      question: 'Comprimere un PDF abbassa la qualità?',
      answer: 'Alto mantiene testo e immagini il più vicino possibile all’originale. Medio e forte riducono di più le immagini e possono ammorbidire foto o scansioni. Il testo resta leggibile. Usa alto per un curriculum o un contratto e un livello più forte se c’è un limite di dimensione rigoroso.'
    },
    {
      question: 'One2PDF conserva il mio file dopo la compressione?',
      answer: 'No. Il PDF viene elaborato solo durante l’operazione. L’originale viene eliminato; il risultato si può scaricare una volta e poi viene rimosso. I file non scaricati spariscono al massimo in 15 minuti. L’uso occasionale non richiede un account.'
    }
  ]
} satisfies PageSeoCopy;
