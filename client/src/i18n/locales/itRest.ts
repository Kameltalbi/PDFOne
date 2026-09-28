import { seoIt } from './itSeo';

const feature = (icon: string, tone: string, title: string, text: string) => ({ icon, tone, title, text });

export const itPricing = {
  eyebrow: 'Prezzi chiari',
  seoTitle: 'Prezzi One2PDF: gratis, Pass di 7 giorni e Pro',
  seoDescription: 'Piano gratuito, Pass di 7 giorni a {weekPrice} senza rinnovo, Pro mensile {monthPrice} o annuale {yearPrice}. Pagamento con Stripe.',
  title: 'Gratis, 7 giorni o Pro.',
  subtitle: 'Nessun vincolo nascosto. Il Pass di 7 giorni termina da solo. Pro si annulla quando vuoi. Il pagamento passa da Stripe.',
  popular: 'La scelta più frequente',
  discover: 'Per provare',
  urgent: 'Per un file di oggi',
  flexible: 'Mese per mese',
  bestValue: 'Prezzo migliore',
  freeName: 'Gratis',
  freePrice: '$0',
  freePeriod: '/ mese',
  freePitch: 'Gli strumenti PDF essenziali, con un limite giornaliero equo. Senza carta.',
  freeNote: 'OCR, file oltre 20 MB e più crediti IA sono nei piani a pagamento.',
  freeIncludes: [
    'Tutti gli strumenti PDF essenziali',
    '{dailyJobs} documenti al giorno',
    'File fino a {freeSize}',
    '{freeAi} crediti IA al mese (tradurre e riassumere)',
    'Pubblicità leggera, che non blocca',
    'File elaborati e poi cancellati automaticamente'
  ],
  freeCta: 'Continua gratis',
  freeMicro: 'Non serve la carta.',
  seeIncludedTools: 'Vedi gli strumenti inclusi',
  hideIncludedTools: 'Nascondi l’elenco',
  includedToolsTitle: 'Strumenti PDF inclusi',
  weekName: 'Pass di 7 giorni',
  weekTag: 'Un pagamento, senza abbonamento',
  weekNoSubscription: 'Un pagamento. Senza abbonamento.',
  weekPrice: '$1.99',
  weekPeriod: 'una volta',
  weekPitch: 'Un file per oggi? Accesso a pagamento per 7 giorni, poi finisce. Nessun addebito successivo.',
  weekIncludes: [
    'Un pagamento: {weekPrice}, addebitato una volta',
    'Non si rinnova da solo',
    '7 giorni senza pubblicità',
    'File fino a {paidSize}',
    'OCR incluso',
    'Elaborazioni PDF senza limite per 7 giorni',
    'Tradurre e riassumere: {weekAi} crediti IA nel Pass (1 credito per pagina)'
  ],
  weekCta: 'Sblocca 7 giorni — {weekPrice}',
  weekMicro: 'Termina da solo. Niente da annullare.',
  monthName: 'Pro mensile',
  monthTag: 'Per un volume variabile',
  monthPrice: '$3.99',
  monthPeriod: '/ mese',
  monthPitch: 'Il piano flessibile: resti tu a decidere, mese dopo mese.',
  monthIncludes: [
    'Senza pubblicità',
    'File fino a {paidSize}',
    'OCR incluso',
    'Elaborazioni PDF senza limite',
    '{proAi} crediti IA al mese (tradurre e riassumere)',
    'Annulla con un clic, quando vuoi'
  ],
  monthCta: 'Scegli Pro mensile',
  monthMicro: 'Senza vincolo. Annulla quando vuoi.',
  proToggleMonthly: 'Mensile',
  proToggleYearly: 'Annuale',
  yearName: 'Pro annuale',
  yearPrice: '$34.90',
  yearPeriod: '/ anno',
  yearEquiv: 'cioè {monthEquiv} / mese — {monthsFree} mesi gratis rispetto al mensile',
  yearPitch: 'Ci torni ogni settimana? Un pagamento annuale, lo stesso accesso Pro, senza sorpresa mensile.',
  yearIncludes: [
    'Tutto ciò che include Pro mensile',
    'File fino a {paidSize}, OCR, senza pubblicità',
    '{proAi} crediti IA al mese — non una scorta annuale in una volta',
    'Paghi {paidMonths} mesi e ne ricevi 12',
    'Annulla quando vuoi: Pro resta fino alla fine del periodo pagato'
  ],
  yearBadge: 'Prezzo migliore',
  yearCta: 'Risparmia con il piano annuale',
  yearMicro: 'Miglior prezzo mensile. Lo stesso Pro.',
  trust: 'Pagamento al 100 % via Stripe (carte, Apple Pay, Google Pay). One2PDF non conserva il numero della carta.',
  faqTitle: 'Domande sui prezzi',
  faq: [
    {
      question: 'Il Pass di 7 giorni si rinnova da solo?',
      answer: 'No. È un pagamento unico di {weekPrice}. Dopo 7 giorni l’accesso Pro termina da solo. Nessun nuovo addebito e niente da annullare. Se ti serve ancora, prendi un altro Pass o passa a Pro.'
    },
    {
      question: 'I pagamenti sono sicuri?',
      answer: 'Sì. Tutti i pagamenti passano da Stripe. One2PDF non vede né conserva il numero della carta. Puoi pagare con carta, Apple Pay o Google Pay.'
    },
    {
      question: 'Posso lasciare Pro quando voglio?',
      answer: 'Sì. Il mensile ({monthPrice}) e l’annuale ({yearPrice}) si annullano con un clic nel portale Stripe. Nessuna penale. Poi torni al gratuito: {dailyJobs} documenti al giorno, file fino a {freeSize}, {freeAi} crediti IA al mese, pubblicità leggera.'
    },
    {
      question: 'Ho già pagato — come accedo?',
      answer: 'Accedi con l’e-mail e la password usate per l’acquisto. Il Pass di 7 giorni o Pro è poi disponibile su questo dispositivo. In Il mio account vedi il tempo restante e i documenti elaborati.'
    },
    {
      question: 'Come funzionano i crediti IA?',
      answer: 'Tradurre costa 1 credito per pagina trattata, fino a {translateCap} pagine. Riassumere costa 1 credito per pagina, al massimo {summarizeCap} crediti per file (i PDF più lunghi vengono tagliati prima del modello). Un processo fallito non trattiene i crediti. Gratis: {freeAi} / mese. Pass di 7 giorni: {weekAi} per il Pass. Pro mensile e annuale: {proAi} per mese di calendario.'
    }
  ],
  paying: 'Apertura del pagamento…',
  payFail: 'Impossibile avviare il pagamento.',
  canceled: 'Pagamento annullato. Puoi riprovare quando vuoi.',
  successTitle: 'Ora sei su One2PDF Pro',
  successText: 'Il tuo account Pro è pronto.',
  successBenefitsTitle: 'I tuoi vantaggi Pro',
  successStatus: 'Attivo',
  successRenews: 'Si rinnova il {date}',
  successCta: 'Usa One2PDF Pro',
  successManage: 'Gestisci l’abbonamento',
  successVerifying: 'Conferma del pagamento…',
  successSeoTitle: 'Benvenuto su One2PDF Pro',
  successSeoDescription: 'Il pagamento di One2PDF Pro è confermato. Usa tutti gli strumenti PDF senza limite giornaliero.',
  successBenefitsPass: [
    'Senza pubblicità',
    'File fino a 100 MB',
    'OCR incluso',
    'Senza limite giornaliero di documenti',
    '100 crediti IA per 7 giorni',
    'Annulla o gestisci quando vuoi'
  ],
  successBenefitsPro: [
    'Senza pubblicità',
    'File fino a 100 MB',
    'OCR incluso',
    'Senza limite giornaliero di documenti',
    '500 crediti IA al mese',
    'Annulla o gestisci quando vuoi'
  ],
  successPeriodWeek: '7 giorni · pagamento unico',
  successPeriodMonth: 'Mensile',
  successPeriodYear: 'Annuale',
  successUnverified: 'Stripe non è riuscito a confermare questo pagamento. Se hai appena pagato, aspetta un momento e riprova.',
  successFailTitle: 'Pagamento non confermato',
  activeAccess: 'L’accesso Pro è già attivo su questo dispositivo.',
  alreadyActive: 'Pass già attivo — vedi il mio account',
  restoreBanner: 'Hai già pagato? Non pagare di nuovo. Accedi con l’e-mail usata per il pagamento.',
  manage: 'Gestisci l’abbonamento',
  logout: 'Esci',
  accountPro: 'Pro',
  myAccount: 'Il mio account'
};

export const itUpgrade = {
  kicker: 'File troppo grande',
  title: 'Questo file supera il limite gratuito',
  text: '« {name} » pesa {size}. Il piano gratuito accetta fino a {limit} — il file non è stato inviato. Pass e Pro accettano file fino a 100 MB:',
  limit: '20 MB',
  dismiss: 'Chiudi e scegli un file più piccolo',
  batchKicker: 'Più file',
  batchTitle: 'Elaborare più file insieme è una funzione Pro',
  batchText: 'Hai selezionato {count} file in una volta. Nel piano gratuito, aggiungine uno alla volta — niente è stato inviato. Un Pass di 7 giorni o Pro sblocca l’elaborazione in blocco.',
  batchDismiss: 'Chiudi e aggiungi i file uno alla volta',
  premiumKicker: 'Funzione Pro',
  premiumTitle: '{feature} richiede Pro',
  premiumText: 'L’OCR è disponibile con un Pass di 7 giorni o con Pro. Gli strumenti PDF essenziali (unire, comprimere, convertire, modificare…) restano gratis. Cambia piano per sbloccare l’OCR:',
  creditsTitle: '{feature} usa crediti IA',
  creditsText: '{feature} usa crediti IA (1 credito per pagina). Il gratuito include un saldo mensile; il Pass di 7 giorni e Pro ne includono di più. Non è uno strumento solo per Pro:',
  creditsKicker: 'Crediti IA',
  premiumDismiss: 'Torna agli strumenti gratis',
  featureOcr: 'OCR',
  featureTranslate: 'Traduzione con IA',
  featureSummarize: 'Riassunto con IA',
  alreadyPaid: 'Ho già pagato — accedi'
};

export const itAccount = {
  seoTitle: 'Il mio account One2PDF',
  seoDescription: 'Guarda il tuo Pass One2PDF, il tempo restante e i documenti elaborati.',
  title: 'Il mio account',
  lead: 'Il Pass è collegato al tuo account. Accedi per vedere il tempo restante.',
  emailLabel: 'E-mail',
  emailPlaceholder: 'E-mail',
  cta: 'Ripristina il mio Pass',
  working: 'Verifica in corso…',
  noPass: 'Nessun Pass attivo per questa e-mail.',
  plan: 'Piano',
  validUntil: 'Valido fino al',
  remaining: 'Tempo restante',
  daysLeft: 'Restano {count} giorni',
  hoursLeft: 'Restano {count} h',
  unlimitedTime: 'Senza data di fine',
  expired: 'Scaduto',
  used: 'Documenti elaborati',
  usedToday: 'Elaborati oggi',
  remainingDocs: 'Documenti rimasti oggi',
  unlimitedDocs: 'Senza limite',
  freeLimit: '{used} / {limit} documenti gratis oggi',
  aiCredits: 'Crediti IA',
  toolsCta: 'Usa gli strumenti',
  loginTitle: 'Accedi al Pass',
  loginLead: 'Inserisci l’e-mail e la password del tuo account One2PDF.',
  loginSeoTitle: 'Accedi a One2PDF',
  loginSeoDescription: 'Accedi per recuperare il Pass e gli strumenti PDF.',
  loginHint: 'Usa la stessa e-mail dell’acquisto per collegare il Pass di 7 giorni.',
  authLoginTitle: 'Entra nell’account',
  authSignupTitle: 'Crea un account',
  loginAsideTitle: 'Entra nel tuo spazio',
  loginAsideText: 'Inserisci e-mail e password per accedere all’account One2PDF, al Pass, ai lotti e agli strumenti PDF.',
  signupAsideTitle: 'Strumenti PDF per il lavoro di ogni giorno',
  signupAsideText: 'Crea un account per unire, comprimere, convertire e proteggere i PDF. Se hai già pagato, usa la stessa e-mail — il Pass si collega da solo.',
  signupSeoTitle: 'Crea un account One2PDF',
  signupSeoDescription: 'Crea un account One2PDF con e-mail e password. Un Pass già pagato si collega automaticamente.',
  namePlaceholder: 'Nome',
  emailEnter: 'Inserisci l’e-mail',
  passwordPlaceholder: 'Password',
  loginCta: 'Entra',
  signupCta: 'Registrati',
  forgotPassword: 'Password dimenticata?',
  forgotHint: 'Non c’è ancora un’e-mail per reimpostare la password. Crea un account con l’e-mail del pagamento oppure scrivi a support@one2pdf.com.',
  noAccount: 'Non hai ancora un account?',
  createAccount: 'Crea un account',
  hasAccount: 'Hai già un account?',
  signInLink: 'Entra',
  seeTools: 'Vedi tutti gli strumenti',
  termsPrefix: 'Creando un account, accetti la nostra',
  loginFail: 'E-mail o password non corretti.',
  signupFail: 'Impossibile creare l’account.'
};

export const itBlogPage = {
  title: 'Blog One2PDF',
  subtitle: 'Guide pratiche per inviare, ridurre e trattare i PDF ogni giorno.',
  readMore: 'Leggi l’articolo',
  back: 'Tutti gli articoli',
  seoTitle: 'Blog PDF: guide e consigli | One2PDF',
  seoDescription: 'Guide per comprimere, unire e convertire PDF. E-mail, Gmail e file, sul blog di One2PDF.',
  publishedOn: 'Pubblicato il {date}'
};

export const itLegal = {
  privacyTitle: 'Privacy',
  privacyUpdated: 'Ultimo aggiornamento: settembre 2026',
  privacyIntro: 'One2PDF non vende i tuoi documenti e non li conserva per addestrare modelli.',
  privacyData: 'Quando usi uno strumento, il file viene inviato ai nostri server per la durata dell’operazione (conversione, compressione, OCR e simili). Un cookie tecnico memorizza la quota del piano gratuito e, se ti abboni, l’accesso Pro.',
  privacyRetention: 'Il file originale viene cancellato al termine dell’elaborazione. Il risultato resta disponibile per un download e poi viene rimosso. I file non scaricati vengono cancellati al massimo in 15 minuti.',
  privacyThird: 'Pagamenti: Stripe. Misurazione del pubblico: Google Analytics (gtag). Conversioni Office e OCR: sui nostri server. Riassumere e tradurre: un fornitore di IA solo se usi quegli strumenti.',
  privacyRights: 'Puoi chiedere accesso, rettifica o cancellazione dei dati di fatturazione collegati all’e-mail Stripe. Scrivici dalla pagina di contatto.',
  contactTitle: 'Contatto',
  contactIntro: 'Dubbi, problemi o supporto Pro? Scrivici. Rispondiamo in inglese e in francese.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'Gli abbonati Pro annuali hanno supporto e-mail prioritario.'
};


export const itToPng = {
  title: 'PDF in PNG',
  subtitle: 'Trasforma ogni pagina di un PDF in un’immagine PNG.',
  tip: 'Più pagine arrivano in uno ZIP. Il PNG mantiene la grafica piatta più nitida.',
  action: 'Converti in PNG',
  running: 'Conversione in corso…',
  fail: 'Impossibile convertire questo PDF in PNG.',
  doneTitle: 'Conversione completata',
  doneText: 'Le pagine sono state esportate come PNG.',
  reset: 'Converti un altro file',
  download: 'Scarica i file PNG',
  features: [
    feature('PNG', 'green', 'Un’immagine per pagina', 'Ogni pagina diventa un PNG, adatto al web e allo schermo.'),
    feature('✓', 'blue', 'ZIP automatico', 'Più pagine si raggruppano in un archivio.'),
    feature('✧', 'teal', 'File temporanei', 'Il PDF di origine viene elaborato e poi cancellato.')
  ],
  ...seoIt.toPng
};

export const itToText = {
  title: 'PDF in testo',
  subtitle: 'Estrai il testo selezionabile del PDF.',
  tip: 'Funziona sui PDF con un livello di testo. Su una scansione, fai prima l’OCR.',
  action: 'Estrai il testo',
  running: 'Estrazione in corso…',
  fail: 'Impossibile estrarre il testo.',
  doneTitle: 'Testo estratto',
  doneText: 'Il contenuto è stato salvato in un file di testo.',
  reset: 'Estrai un altro file',
  download: 'Scarica il testo',
  features: [
    feature('TXT', 'blue', 'Testo semplice', 'Ottieni il contenuto da incollare, cercare o riscrivere.'),
    feature('★', 'green', 'Senza installazione', 'L’estrazione avviene nel browser; poi scarichi il .txt.'),
    feature('✧', 'purple', 'Scansioni', 'Se il PDF è solo un’immagine, usa lo strumento OCR.')
  ],
  ...seoIt.toText
};

export const itUnlock = {
  title: 'Sbloccare PDF',
  subtitle: 'Togli la password di apertura da un PDF che ti appartiene.',
  tip: 'Inserisci la password attuale. Senza di essa, un PDF bloccato non si apre.',
  action: 'Sblocca',
  running: 'Sblocco in corso…',
  fail: 'Impossibile sbloccare questo PDF.',
  doneTitle: 'PDF sbloccato',
  doneText: 'Il file si apre ora senza password.',
  reset: 'Sblocca un altro file',
  password: 'Password',
  passwordPh: 'Password attuale',
  features: [
    feature('🔓', 'orange', 'Apertura libera', 'Il PDF risultante non chiede più la password.'),
    feature('✓', 'blue', 'Il tuo file', 'Usa solo un documento di cui conosci la password.'),
    feature('✧', 'teal', 'File temporanei', 'L’originale non resta sul server.')
  ],
  ...seoIt.unlock
};

export const itOcr = {
  title: 'OCR di PDF',
  subtitle: 'Riconosci il testo delle pagine scansionate e ottieni un PDF utilizzabile. Incluso nel Pass di 7 giorni o nel Pro.',
  tip: 'L’OCR usa Tesseract. La qualità dipende dalla nitidezza della scansione. Incluso nel Pass di 7 giorni o nel Pro.',
  action: 'Avvia l’OCR',
  running: 'Riconoscimento in corso…',
  fail: 'Impossibile eseguire l’OCR.',
  doneTitle: 'OCR completato',
  doneText: 'Il testo è stato riconosciuto. Scarica il PDF generato.',
  reset: 'Tratta un altro file',
  features: [
    feature('OCR', 'gold', 'Pagine scansionate', 'Trasforma l’immagine di un documento in testo riconosciuto.'),
    feature('★', 'green', 'Lingua del browser', 'Il riconoscimento segue la lingua rilevata (IT, EN, FR, ES…).'),
    feature('✧', 'purple', 'Poi traduci o riassumi', 'Quando il testo esiste, gli altri strumenti diventano utili.')
  ],
  ...seoIt.ocr
};

export const itSummarize = {
  title: 'Riassumi un PDF',
  subtitle: 'Ottieni un riassunto chiaro dal testo del documento. Usa crediti IA (1 credito per pagina).',
  tip: 'Usa crediti IA (1 credito per pagina, al massimo 20 per file). Scegli lo stile e la lingua e poi riassumi. Le scansioni hanno prima bisogno dell’OCR.',
  action: 'Riassumi il PDF',
  running: 'Analisi del PDF…',
  fail: 'Impossibile riassumere questo PDF.',
  doneTitle: 'Riassunto pronto',
  doneText: 'Leggi il riassunto, copialo o scaricalo.',
  reset: 'Riassumi un altro PDF',
  download: 'Scarica',
  copy: 'Copia',
  copied: 'Copiato',
  modeQuestion: 'Come vuoi il riassunto?',
  modeQuick: 'Breve',
  modeQuickHint: 'Una visione rapida.',
  modeDetailed: 'Dettagliato',
  modeDetailedHint: 'Strutturato e completo.',
  modeKeyPoints: 'Punti chiave',
  modeKeyPointsHint: 'I fatti essenziali in elenco.',
  languageLabel: 'Lingua del riassunto',
  languageSame: 'La stessa del documento',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'Modalità',
  resultLanguage: 'Lingua',
  documentLabel: 'Documento',
  features: [
    feature('☷', 'green', 'Tre modalità', 'Breve, dettagliato o punti chiave — scegli quello che ti serve.'),
    feature('★', 'blue', 'Serve il testo', 'Su una scansione, fai prima l’OCR.'),
    feature('✧', 'teal', 'File .txt', 'Copia o scarica; niente resta salvato.')
  ],
  ...seoIt.summarize
};

export const itTranslate = {
  title: 'Traduci il PDF',
  subtitle: 'Ottieni un PDF tradotto che conserva l’impaginazione per quanto possibile. Usa crediti IA (1 credito per pagina trattata).',
  tip: 'Usa crediti IA (1 credito per pagina trattata). Immagini, loghi e tabelle restano. Il testo viene tradotto sul posto. L’impaginazione non resta identica al pixel: alcune lingue diventano più lunghe o più corte.',
  action: 'Traduci il PDF',
  running: 'Traduzione del documento…',
  fail: 'Impossibile tradurre questo PDF.',
  doneTitle: 'PDF tradotto pronto',
  doneText: 'Scarica il PDF tradotto. C’è anche un file di solo testo, se ti serve solo quello.',
  reset: 'Traduci un altro file',
  download: 'Scarica il PDF tradotto',
  downloadTxt: 'Scarica il testo tradotto (.txt)',
  source: 'Da',
  autoDetect: 'Rileva automaticamente',
  target: 'A',
  output: 'Risultato',
  preserveLayout: 'Conserva l’impaginazione',
  preserveLayoutHint: 'Mantieni posizioni, immagini, tabelle e la gerarchia visiva per quanto possibile.',
  textOnly: 'Solo testo',
  textOnlyHint: 'Solo il testo tradotto, senza ricostruire il disegno originale della pagina.',
  langFr: 'Français',
  langEn: 'English',
  langEs: 'Español',
  langPt: 'Português',
  langDe: 'Deutsch',
  langTr: 'Türkçe',
  langAr: 'العربية',
  langIt: 'Italiano',
  features: [
    feature('A文', 'orange', 'PDF tradotto', 'Il risultato principale è un PDF: le immagini restano, il testo viene sostituito nelle sue zone.'),
    feature('★', 'blue', 'Impaginazione per quanto possibile', 'Una lingua più lunga può uscire dalla casella; una più corta può lasciare spazi. La dimensione del carattere si adatta.'),
    feature('✧', 'purple', 'Scansioni incluse', 'Se il PDF ha poco testo selezionabile, prima parte l’OCR e poi la traduzione.')
  ],
  ...seoIt.translate
};

export const itHtml = {
  title: 'HTML in PDF',
  subtitle: 'Trasforma una pagina HTML in PDF con un clic.',
  tip: 'Importa un file .html o incolla l’HTML. Le pagine con molto JavaScript si riproducono peggio.',
  action: 'Crea il PDF',
  running: 'Conversione in corso…',
  fail: 'Impossibile convertire questo HTML.',
  doneTitle: 'PDF creato',
  doneText: 'L’HTML è stato convertito in PDF.',
  reset: 'Converti altro HTML',
  empty: 'Incolla l’HTML o scegli un file.',
  pastePh: '<h1>Titolo</h1><p>Il tuo contenuto…</p>',
  useHtml: 'Usa questo HTML',
  features: [
    feature('</>', 'purple', 'File o incolla', 'Trascina un file .html o incolla il codice.'),
    feature('⌘', 'gold', 'Online', 'La conversione gira sui nostri server — senza installare un programma.'),
    feature('✧', 'teal', 'File temporanei', 'L’HTML non resta sul server.')
  ],
  ...seoIt.htmlPdf
};

export const itExtractPages = {
  title: 'Estrai pagine',
  subtitle: 'Tieni solo le pagine che ti servono, in un PDF nuovo.',
  tip: 'Seleziona le pagine o scrivi un intervallo come 1-3, 7.',
  action: 'Estrai le pagine',
  running: 'Estrazione in corso…',
  fail: 'Impossibile estrarre queste pagine.',
  doneTitle: 'Pagine estratte',
  doneText: 'Le pagine scelte sono in un PDF nuovo.',
  reset: 'Estrai un altro file',
  invalidRange: 'Indica un intervallo di pagine valido.',
  features: [
    feature('▤', 'green', 'Un solo file', 'Le pagine scelte diventano un solo PDF, nell’ordine.'),
    feature('★', 'blue', 'Senza installazione', 'Scegli le pagine nel browser e poi scarica.'),
    feature('✧', 'teal', 'File temporanei', 'L’originale non resta sul server.')
  ],
  seoTitle: 'Estrarre pagine da un PDF | One2PDF',
  seoDescription: 'Tieni le pagine che scegli e scarica un PDF nuovo. Nel browser, senza account per l’uso occasionale.',
  seoH2: 'Come estrarre pagine da un PDF',
  seoP1: 'Ti servono le pagine da 2 a 5 di un documento più lungo? Passale in un PDF nuovo, senza installare un programma.',
  seoP2: 'Scegli le pagine, conferma e scarica il risultato. Il file originale viene cancellato a fine elaborazione.',
  seoP3: 'Per l’uso occasionale nel piano gratuito non serve un account.'
};

export const itExtractImages = {
  title: 'Estrai immagini',
  subtitle: 'Recupera le immagini incorporate in un PDF e scaricale.',
  tip: 'Funziona con le immagini salvate nel file, non con una pagina che è solo una scansione di testo.',
  action: 'Estrai le immagini',
  running: 'Estrazione in corso…',
  fail: 'Impossibile estrarre immagini da questo PDF.',
  doneTitle: 'Immagini estratte',
  doneText: 'Scarica le immagini trovate nel documento.',
  reset: 'Estrai un altro file',
  download: 'Scarica le immagini',
  features: [
    feature('🖼', 'purple', 'File incorporati', 'Recupera foto e grafica salvate nel PDF.'),
    feature('★', 'blue', 'ZIP o un solo file', 'Un’immagine si scarica direttamente; più immagini arrivano in uno ZIP.'),
    feature('✧', 'teal', 'File temporanei', 'Dopo il download non resta niente salvato.')
  ],
  seoTitle: 'Estrarre immagini da un PDF | One2PDF',
  seoDescription: 'Scarica le immagini incorporate in un PDF. Nel browser, senza account per l’uso occasionale.',
  seoH2: 'Come estrarre immagini da un PDF',
  seoP1: 'Un PDF contiene spesso foto, loghi o scansioni. One2PDF elenca le immagini incorporate perché tu possa salvarle.',
  seoP2: 'Se il documento è solo una pagina di testo scansionato, usa l’OCR o PDF in JPG.',
  seoP3: 'Il file originale viene cancellato quando l’elaborazione termina.'
};

export const itFlatten = {
  title: 'Appiattisci PDF',
  subtitle: 'Trasforma i campi di un modulo in contenuto fisso, che non si può più modificare.',
  tip: 'Usalo dopo aver compilato un modulo, perché i campi non restino modificabili.',
  action: 'Appiattisci',
  running: 'Appiattimento in corso…',
  fail: 'Impossibile appiattire questo PDF.',
  doneTitle: 'PDF appiattito',
  doneText: 'I campi del modulo fanno ora parte della pagina.',
  reset: 'Appiattisci un altro file',
  features: [
    feature('▣', 'orange', 'Campi fissi', 'I valori restano visibili, ma non si modificano più.'),
    feature('★', 'blue', 'Dopo la compilazione', 'Appiattisci il modulo quando è completo.'),
    feature('✧', 'teal', 'File temporanei', 'L’originale non resta salvato.')
  ],
  seoTitle: 'Appiattire un modulo PDF | One2PDF',
  seoDescription: 'Fissa i campi di un modulo PDF perché non siano più modificabili. Nel browser.',
  seoH2: 'Come appiattire un PDF',
  seoP1: 'Appiattire incorpora i campi del modulo nella pagina. Chi riceve vede i valori, ma non può cambiarli.',
  seoP2: 'Il file deve contenere un modulo PDF. Un PDF senza campi non si appiattisce in questo modo.',
  seoP3: 'L’elaborazione è temporanea: l’originale viene cancellato a fine operazione.'
};

export const itHeaderFooter = {
  title: 'Intestazione e piè di pagina',
  subtitle: 'Aggiungi una riga breve in alto o in basso su ogni pagina.',
  tip: 'Tieni il testo breve. I numeri di pagina possono andare nel piè di pagina, se vuoi.',
  action: 'Applica',
  running: 'Applicazione in corso…',
  fail: 'Impossibile aggiungere l’intestazione o il piè di pagina.',
  doneTitle: 'Intestazione e piè di pagina aggiunti',
  doneText: 'Il testo è stato applicato a tutte le pagine.',
  reset: 'Modifica un altro file',
  header: 'Intestazione',
  headerPh: 'Riservato',
  footer: 'Piè di pagina',
  footerPh: 'Nome dell’azienda',
  numbers: 'Aggiungi i numeri di pagina nel piè di pagina',
  color: 'Colore',
  empty: 'Indica un’intestazione, un piè di pagina o attiva i numeri di pagina.',
  features: [
    feature('HF', 'blue', 'Tutte le pagine', 'La stessa intestazione e lo stesso piè di pagina valgono per tutto il file.'),
    feature('★', 'green', 'Numeri facoltativi', 'Metti 1 / n nel piè di pagina se ti serve.'),
    feature('✧', 'teal', 'File temporanei', 'L’originale viene cancellato dopo l’elaborazione.')
  ],
  seoTitle: 'Intestazione e piè di pagina in un PDF | One2PDF',
  seoDescription: 'Aggiungi un’intestazione, un piè di pagina o i numeri di pagina a ogni foglio di un PDF. Nel browser.',
  seoH2: 'Come mettere intestazione e piè di pagina in un PDF',
  seoP1: 'Una riga breve in alto o in basso su ogni pagina basta per contrassegnare un documento.',
  seoP2: 'Scrivi il testo, aggiungi i numeri di pagina se vuoi e scarica il risultato.',
  seoP3: 'Non serve installare un programma. Il file originale non resta salvato.'
};

export const itFillForm = {
  title: 'Compila un modulo PDF',
  subtitle: 'Completa i campi di un PDF interattivo e scarica il risultato.',
  tip: 'Qui si compilano solo i PDF con campi modulo. Appiattisci dopo per fissare i valori.',
  inspecting: 'Lettura dei campi del modulo…',
  action: 'Salva il modulo',
  running: 'Salvataggio in corso…',
  fail: 'Impossibile compilare questo modulo.',
  doneTitle: 'Modulo compilato',
  doneText: 'I tuoi valori sono stati scritti nel PDF.',
  reset: 'Compila un altro file',
  checked: 'Selezionato',
  choose: 'Scegli',
  flatten: 'Appiattisci i campi dopo il salvataggio',
  features: [
    feature('☑', 'green', 'Campi interattivi', 'Testo, caselle e elenchi vengono rilevati automaticamente.'),
    feature('★', 'blue', 'Appiattisci se vuoi', 'Chiudi le risposte perché non si possano cambiare dopo.'),
    feature('✧', 'teal', 'File temporanei', 'Dopo il download non resta niente salvato.')
  ],
  seoTitle: 'Compilare un modulo PDF online | One2PDF',
  seoDescription: 'Compila i campi di un PDF interattivo nel browser e scarica il risultato. Senza account per l’uso occasionale.',
  seoH2: 'Come compilare un modulo PDF',
  seoP1: 'Se il PDF ha campi modulo, One2PDF li elenca perché tu possa scrivere le risposte senza stampare.',
  seoP2: 'Poi puoi appiattire il modulo: i valori restano visibili, ma non si modificano più.',
  seoP3: 'Il file originale viene cancellato quando l’elaborazione termina.'
};

export const itFillSign = {
  title: 'Compila e firma un PDF',
  subtitle: 'Aggiungi testo, date, segni e la tua firma direttamente sul PDF.',
  select: 'Scegli un PDF',
  orDrop: 'Trascina il PDF qui o scegli un file',
  trust: [
    'Semplice e veloce',
    'Funziona nel browser',
    'I file vengono cancellati dopo l’elaborazione'
  ],
  cannotOpen: 'Questo PDF non si apre oppure è protetto.',
  fail: 'Impossibile generare il PDF compilato.',
  running: 'Preparazione del PDF…',
  doneTitle: 'Il PDF è pronto',
  doneText: 'Il documento è stato compilato e firmato. Scaricalo ora.',
  reset: 'Compila un altro PDF',
  download: 'Scarica',
  undo: 'Annulla',
  redo: 'Ripeti',
  toolsAria: 'Strumenti per compilare e firmare',
  pagesAria: 'Pagine del documento',
  selectTool: 'Seleziona',
  text: 'Testo',
  signature: 'Firma',
  initials: 'Iniziali',
  date: 'Data',
  checkbox: 'Casella',
  check: 'Spunta',
  cross: 'Croce',
  circle: 'Cerchio',
  draw: 'Disegna',
  defaultText: 'Testo',
  size: 'Dimensione',
  bold: 'Grassetto',
  delete: 'Elimina',
  duplicate: 'Duplica',
  choose: 'Scegli',
  signatureTitle: 'Aggiungi la firma',
  initialsTitle: 'Aggiungi le iniziali',
  drawTab: 'Disegna',
  typeTab: 'Scrivi',
  importTab: 'Carica',
  typePlaceholder: 'Il tuo nome',
  chooseImage: 'Scegli un’immagine',
  importHint: 'PNG o JPG. La firma resta solo in questa sessione.',
  clearPad: 'Cancella',
  cancel: 'Annulla',
  useStamp: 'Usa',
  reuseLast: 'Usa l’ultima',
  features: [
    feature('T', 'orange', 'Testo e date', 'Metti il testo o la data di oggi esattamente nel punto giusto.'),
    feature('〰', 'blue', 'Firma semplice', 'Disegna, scrivi o carica una firma e spostala al suo posto.'),
    feature('✧', 'teal', 'File temporanei', 'Il PDF viene cancellato dopo l’elaborazione, come negli altri strumenti One2PDF.')
  ],
  seoTitle: 'Compilare e firmare PDF online | One2PDF',
  seoDescription: 'Aggiungi testo, date, segni e la tua firma al PDF e scarica il documento. Senza stampare.',
  seoH2: 'Come compilare e firmare un PDF',
  seoP1: 'Importa un PDF — contratto, preventivo, certificato o modulo — e metti testo, data e firma dove devono stare.',
  seoP2: 'Se il file ha già campi interattivi, puoi compilare anche quelli. Un PDF normale si completa sempre posizionando gli elementi sopra.',
  seoP3: 'Il documento originale non resta salvato. Una firma resta limitata alla sessione di lavoro e non serve ad addestrare un modello.',
  howTitle: 'Compilare e firmare un PDF',
  howSteps: [
    'Scegli o trascina il PDF',
    'Aggiungi testo, segni o una firma',
    'Scarica il documento completato'
  ],
  faqTitle: 'Domande su compilare e firmare',
  faq: [
    {
      question: 'Mi serve un modulo PDF speciale?',
      answer: 'No. Puoi completare qualsiasi PDF con testo, data e firma. I campi interattivi si usano quando esistono già.'
    },
    {
      question: 'La mia firma viene conservata?',
      answer: 'No. Una firma creata qui resta, di norma, limitata alla sessione di lavoro corrente.'
    },
    {
      question: 'I file restano dopo il download?',
      answer: 'No. Come negli altri strumenti One2PDF, il file viene elaborato in modo temporaneo e cancellato dopo il download.'
    }
  ]
};

export const itHeic = {
  title: 'HEIC in PDF',
  subtitle: 'Trasforma le foto dell’iPhone (HEIC/HEIF) in un PDF da inviare.',
  tip: 'I file HEIC dell’iPhone vengono convertiti e poi messi nel PDF.',
  tipMixed: 'JPG, PNG e WebP si possono mescolare con HEIC nello stesso file.',
  action: 'Converti in PDF',
  running: 'Conversione in corso…',
  fail: 'Impossibile convertire queste immagini in PDF.',
  doneTitle: 'PDF pronto',
  doneText: 'Le tue foto sono state riunite in un PDF.',
  reset: 'Converti altre foto',
  features: [
    feature('HEIC', 'orange', 'Foto iPhone', 'Le immagini HEIC/HEIF diventano pagine di un PDF.'),
    feature('★', 'blue', 'Più foto', 'Aggiungi più di un’immagine; l’ordine resta.'),
    feature('✧', 'teal', 'File temporanei', 'Gli originali vengono cancellati dopo la conversione.')
  ],
  seoTitle: 'Convertire HEIC in PDF | One2PDF',
  seoDescription: 'Trasforma le foto HEIC dell’iPhone in un PDF, nel browser. Senza account per l’uso occasionale.',
  seoH2: 'Come convertire foto HEIC in PDF',
  seoP1: 'Gli iPhone salvano spesso le foto in HEIC. Convertile in un PDF che si apre su qualsiasi dispositivo.',
  seoP2: 'Aggiungi una o più foto, converti e scarica. JPG e PNG possono entrare nello stesso elenco.',
  seoP3: 'I file vengono elaborati in modo temporaneo e poi cancellati.'
};
