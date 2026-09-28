import type { BlogPost } from './blog';

/**
 * Italian articles published through getBlogPosts for the it locale only.
 */
export const ITALIAN_BLOG_DRAFTS: BlogPost[] = [
  {
    slug: 'comprimere-pdf-email',
    publishedIso: '2026-08-28',
    publishedLabel: '28 agosto 2026',
    seoTitle: 'PDF troppo grande per l’e-mail | One2PDF',
    seoDescription: 'Gmail o Outlook rifiutano un PDF sopra i 25 MB? Comprimilo online, senza installare un programma, e invialo.',
    keywords: 'comprimere PDF, PDF troppo grande, Gmail 25 MB',
    title: 'Come ridurre un PDF troppo grande da inviare per e-mail',
    excerpt: 'Gmail, Outlook o un modulo hanno rifiutato l’allegato. Ecco perché un PDF pesa tanto e come renderlo più leggero in pochi secondi, senza installare un programma.',
    body: [
      { type: 'p', text: 'Il fascicolo, il curriculum o il portfolio sono pronti, e l’invio si ferma: «Il file supera la dimensione massima (25 MB).» Gmail, Outlook e molti moduli tagliano lì. Nella maggior parte dei casi un PDF si riduce in pochi secondi, senza ristamparlo e senza renderlo illeggibile.' },
      { type: 'h2', text: 'Perché alcuni PDF diventano così pesanti' },
      { type: 'p', text: 'Un PDF non è «solo testo». Dietro ogni pagina ci sono immagini, font e, a volte, i livelli di una scansione. Meno questi elementi sono ottimizzati, più il file cresce, anche in un documento corto.' },
      { type: 'h3', text: 'Immagini ad alta risoluzione' },
      { type: 'p', text: 'Una scansione, una foto dal telefono o un’immagine senza compressione pesano più del testo. 300 dpi servono per la stampa e, in un’e-mail, spesso sono troppi. È la causa più frequente di un PDF che Gmail rifiuta.' },
      { type: 'h3', text: 'Pagine, grafici e font si sommano' },
      { type: 'p', text: 'Un report di 40 pagine, tabelle incollate, screenshot e più font incorporati gonfiano la struttura. Unire più PDF senza ridurli prima peggiora il risultato: le immagini a piena risoluzione si accumulano.' },
      { type: 'h2', text: 'La via più rapida, senza installazione' },
      { type: 'p', text: 'Per un invio occasionale non serve un programma da scrivania a pagamento. Uno strumento online basta nella maggior parte dei casi: riduce le immagini e ottimizza il file, con un risultato leggibile a schermo.' },
      { type: 'h3', text: 'Come comprimere un PDF grande su One2PDF' },
      {
        type: 'ol',
        items: [
          [
            'Apri lo ',
            { text: 'strumento per comprimere PDF', to: '/it/compress' },
            '.'
          ],
          'Trascina il documento nell’area di caricamento (computer o telefono).',
          'Lascia che lo strumento ottimizzi immagini e struttura. Scegli un livello più forte se il file resta sopra i 25 MB.',
          'Scarica il nuovo PDF, pronto per l’e-mail.'
        ]
      },
      { type: 'h2', text: 'Se il file resta troppo pesante' },
      { type: 'h3', text: 'Comprimere prima di unire' },
      {
        type: 'p',
        parts: [
          'Se devi riunire un contratto, gli allegati e una scansione, riduci prima ogni PDF e uniscili dopo. Un file già compresso si combina meglio di una pila di originali a piena risoluzione. Lo strumento ',
          { text: 'Unire PDF', to: '/it/merge' },
          ' rispetta l’ordine delle miniature.'
        ]
      },
      { type: 'h3', text: 'Partire da immagini pesanti' },
      {
        type: 'p',
        parts: [
          'Uno screenshot PNG o un JPEG da 8 MB non deve entrare nel PDF così com’è. Convertire prima le immagini, o comprimere il PDF dopo averlo composto, dà spesso un peso di partenza molto più basso per l’e-mail. ',
          { text: 'JPG in PDF', to: '/it/jpg-to-pdf' }
        ]
      },
      { type: 'p', text: 'Non lasciare che un tetto di 25 MB blocchi un curriculum, un fascicolo cliente o un invio ufficiale. Appena un modulo o una casella rifiuta l’allegato, un passaggio dalla compressione evita un secondo invio.' }
    ],
    cta: 'Comprimere PDF',
    ctaTo: '/it/compress'
  },
  {
    slug: 'privacy-pdf-online',
    publishedIso: '2026-09-02',
    publishedLabel: '2 settembre 2026',
    seoTitle: 'PDF online: non mandare i file a un server sconosciuto | One2PDF',
    seoDescription: 'Prima di usare uno strumento PDF gratis, guarda dove vanno i file e come scegliere un servizio trasparente.',
    keywords: 'privacy PDF, PDF online, cancellare file',
    title: 'PDF online: come evitare di mandare i file a un server sconosciuto',
    excerpt: 'Uno strumento PDF gratis nel browser è pratico. Vale la pena sapere cosa succede al file prima di caricare un contratto o un documento d’identità.',
    body: [
      { type: 'p', text: 'Hai un contratto, una fattura o un PDF clinico da convertire, unire o comprimere. Cerchi «convertire PDF online», clicchi il primo risultato, lasci il file… e non sai cosa gli succede.' },
      { type: 'p', text: 'È il problema centrale di quasi tutti gli strumenti PDF gratis online: il file va da qualche parte, e la maggior parte delle persone non ha tempo né formazione tecnica per verificare dove, né per quanto tempo resta lì.' },
      { type: 'p', text: 'Questa guida spiega cosa succede davvero quando usi uno strumento PDF online, perché non è automaticamente un problema — se scegli il servizio giusto — e cosa conviene confermare prima di affidare un documento sensibile.' },
      { type: 'h2', text: 'Perché quasi tutti gli strumenti funzionano con un invio' },
      { type: 'p', text: 'A differenza di ciò che alcuni siti suggeriscono, la grande maggioranza degli strumenti PDF online — compresi i più noti — non tratta il file «sul tuo dispositivo». Lo inviano a un server, eseguono l’operazione (conversione, unione, compressione, OCR) e restituiscono il risultato.' },
      { type: 'p', text: 'C’è una ragione semplice: alcune operazioni sono troppo pesanti per girare bene nel browser. Passare un PDF a Word o Excel con l’impaginazione originale richiede motori di conversione che il browser non esegue da solo. Lo stesso vale per il riconoscimento del testo (OCR) su una scansione.' },
      { type: 'p', text: 'Esistono strumenti che trattano tutto nel browser (WebAssembly). Spesso si limitano a operazioni semplici e possono essere più lenti o meno affidabili su file grandi o conversioni complesse.' },
      { type: 'p', text: 'La domanda giusta non è «il mio file viene inviato da qualche parte?» — la risposta è quasi sempre sì — ma «dove, per quanto tempo e da chi?».' },
      { type: 'h2', text: 'Cosa verificare prima di fidarti di uno strumento PDF' },
      { type: 'p', text: 'Prima di lasciare un documento sensibile su un convertitore online, dedica trenta secondi a questi punti:' },
      { type: 'h3', text: '1. La politica di cancellazione' },
      { type: 'p', text: 'Un servizio serio dice con chiarezza quanto tempo il file resta sui server dopo il trattamento — di preferenza minuti o poche ore, mai «a tempo indeterminato» o «non specificato». Questa informazione deve essere facile da trovare.' },
      { type: 'h3', text: '2. Dove sono i server e quale legge si applica' },
      { type: 'p', text: 'Un file trattato su un server nell’Unione europea rientra nel GDPR. Un file trattato in Canada può ricadere sotto la PIPEDA o, per i residenti del Québec, sotto la Legge 25. Questi quadri impongono doveri reali di raccolta, conservazione e cancellazione.' },
      { type: 'h3', text: '3. Cosa succede con le funzioni di IA' },
      { type: 'p', text: 'Sempre più strumenti PDF aggiungono riassunto o traduzione con intelligenza artificiale. È utile, ma spesso significa che un terzo (il fornitore di IA) riceve anche il contenuto. Un servizio trasparente deve dire quali funzioni passano da un fornitore di IA e quali non ci passano mai.' },
      { type: 'h3', text: '4. La chiarezza del percorso tecnico' },
      { type: 'p', text: 'Un servizio che spiega come tratta i file — quali strumenti, quali passaggi — ispira più fiducia di una scatola nera che dice solo «i tuoi file sono al sicuro».' },
      { type: 'h3', text: '5. Il modello di prezzi' },
      { type: 'p', text: 'Uno strumento con prezzi chiari, senza un periodo di prova che si trasforma in un abbonamento nascosto, merita in genere più fiducia di un servizio il cui modello poggia sulla confusione della fatturazione.' },
      { type: 'h2', text: 'Cosa fa One2PDF nella pratica' },
      { type: 'p', text: 'Su One2PDF abbiamo scelto la trasparenza invece di una promessa di marketing impossibile da verificare. Nella pratica:' },
      {
        type: 'ul',
        items: [
          'I file vengono trattati su un server sicuro — non diciamo il contrario.',
          'Il trattamento usa strumenti consolidati per unire, comprimere, proteggere e modificare; un motore di conversione per Word, Excel e PowerPoint; e l’OCR per i documenti scansionati.',
          'Riassumere e tradurre, che passano da un fornitore di IA, sono separati dal resto e partono solo se li avvii.',
          'Dopo che il file è stato trattato e scaricato, viene cancellato automaticamente dai server.',
          'Non serve una carta per provare, e nessun abbonamento inizia senza un’azione chiara da parte tua.'
        ]
      },
      { type: 'p', text: 'Non diciamo che niente esce dal computer — sarebbe falso. Preferiamo dire esattamente cosa succede, perché tu possa decidere con i fatti.' },
      { type: 'h2', text: 'In sintesi' },
      {
        type: 'ul',
        items: [
          'Quasi tutti gli strumenti PDF online inviano il file a un server. Questo, da solo, non è un allarme.',
          'La fiducia viene da tempi chiari, da un luogo di trattamento identificato e da una frase onesta sull’IA.',
          'Diffida di una promessa di «zero invio» che non si può dimostrare.'
        ]
      },
      {
        type: 'p',
        parts: [
          'Il testo completo è nell’',
          { text: 'informativa sulla privacy', to: '/privacy' },
          '. Resta in inglese finché non esiste una versione italiana rivista.'
        ]
      }
    ],
    cta: 'Vedi gli strumenti PDF',
    ctaTo: '/it/tools'
  }
];
