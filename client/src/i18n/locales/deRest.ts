import type { FeatureCopy } from '../types';
import { seoDe } from './deSeo';

const feature = (icon: string, tone: string, title: string, text: string): FeatureCopy => ({ icon, tone, title, text });

export const dePricing = {
  eyebrow: 'Klare Preise',
  seoTitle: 'One2PDF Preise: gratis, 7-Tage-Pass und Pro',
  seoDescription: 'Gratisplan, 7-Tage-Pass für {weekPrice} ohne Verlängerung, Pro monatlich {monthPrice} oder jährlich {yearPrice}. Zahlung über Stripe.',
  title: 'Gratis, 7 Tage oder Pro.',
  subtitle: 'Keine versteckte Bindung. Der 7-Tage-Pass endet von selbst. Pro können Sie jederzeit kündigen. Die Zahlung läuft über Stripe.',
  popular: 'Die häufigste Wahl',
  discover: 'Zum Ausprobieren',
  urgent: 'Für eine Datei von heute',
  flexible: 'Monat für Monat',
  bestValue: 'Bester Preis',
  freeName: 'Gratis',
  freePrice: '$0',
  freePeriod: '/ Monat',
  freePitch: 'Die wesentlichen PDF-Werkzeuge, mit einem fairen Tageslimit. Ohne Karte.',
  freeNote: 'OCR, Dateien über 20 MB und mehr KI-Guthaben gibt es in den kostenpflichtigen Plänen.',
  freeIncludes: [
    'Alle wesentlichen PDF-Werkzeuge',
    '{dailyJobs} Dokumente pro Tag',
    'Dateien bis {freeSize}',
    '{freeAi} KI-Guthaben pro Monat (Übersetzen und Zusammenfassen)',
    'Leichte Werbung, die nicht blockiert',
    'Dateien werden verarbeitet und danach automatisch gelöscht'
  ],
  freeCta: 'Kostenlos weiter',
  freeMicro: 'Keine Karte nötig.',
  seeIncludedTools: 'Enthaltene Werkzeuge anzeigen',
  hideIncludedTools: 'Liste ausblenden',
  includedToolsTitle: 'Enthaltene PDF-Werkzeuge',
  weekName: '7-Tage-Pass',
  weekTag: 'Eine Zahlung, kein Abo',
  weekNoSubscription: 'Eine Zahlung. Kein Abo.',
  weekPrice: '$1.99',
  weekPeriod: 'einmal',
  weekPitch: 'Eine Datei für heute? Bezahlter Zugang für 7 Tage, danach endet er. Keine Folgebelastung.',
  weekIncludes: [
    'Eine Zahlung: {weekPrice}, einmal berechnet',
    'Verlängert sich nicht von selbst',
    '7 Tage ohne Werbung',
    'Dateien bis {paidSize}',
    'OCR inklusive',
    'Unbegrenzte PDF-Vorgänge für 7 Tage',
    'Übersetzen und Zusammenfassen: {weekAi} KI-Guthaben für den Pass (1 Guthaben pro Seite)'
  ],
  weekCta: '7 Tage freischalten — {weekPrice}',
  weekMicro: 'Endet von selbst. Nichts zu kündigen.',
  monthName: 'Pro monatlich',
  monthTag: 'Für wechselndes Volumen',
  monthPrice: '$3.99',
  monthPeriod: '/ Monat',
  monthPitch: 'Der flexible Plan: Sie behalten die Kontrolle, Monat für Monat.',
  monthIncludes: [
    'Keine Werbung',
    'Dateien bis {paidSize}',
    'OCR inklusive',
    'Unbegrenzte PDF-Vorgänge',
    '{proAi} KI-Guthaben pro Monat (Übersetzen und Zusammenfassen)',
    'Jederzeit mit einem Klick kündbar'
  ],
  monthCta: 'Pro monatlich wählen',
  monthMicro: 'Keine Bindung. Kündigen, wann Sie möchten.',
  proToggleMonthly: 'Monatlich',
  proToggleYearly: 'Jährlich',
  yearName: 'Pro jährlich',
  yearPrice: '$34.90',
  yearPeriod: '/ Jahr',
  yearEquiv: 'das sind {monthEquiv} / Monat — {monthsFree} Monate gratis gegenüber monatlich',
  yearPitch: 'Sie kommen jede Woche wieder? Eine Jahreszahlung, derselbe Pro-Zugang, keine monatliche Überraschung.',
  yearIncludes: [
    'Alles aus dem monatlichen Pro',
    'Dateien bis {paidSize}, OCR, keine Werbung',
    '{proAi} KI-Guthaben pro Monat — kein Jahresvorrat auf einmal',
    '{paidMonths} Monate zahlen, 12 bekommen',
    'Jederzeit kündbar: Pro bleibt bis zum Ende des bezahlten Zeitraums'
  ],
  yearBadge: 'Bester Preis',
  yearCta: 'Mit dem Jahresplan sparen',
  yearMicro: 'Bester Monatspreis. Dieselbe Pro-Leistung.',
  trust: 'Zahlung zu 100 % über Stripe (Karten, Apple Pay, Google Pay). One2PDF speichert Ihre Kartennummer nicht.',
  faqTitle: 'Fragen zu den Preisen',
  faq: [
    {
      question: 'Verlängert sich der 7-Tage-Pass automatisch?',
      answer: 'Nein. Es ist eine einmalige Zahlung von {weekPrice}. Nach 7 Tagen endet der Pro-Zugang von selbst. Keine weitere Belastung, nichts zu kündigen. Wenn Sie ihn weiter brauchen, kaufen Sie einen neuen Pass oder wechseln Sie zu Pro.'
    },
    {
      question: 'Sind die Zahlungen sicher?',
      answer: 'Ja. Alle Zahlungen laufen über Stripe. One2PDF sieht oder speichert Ihre Kartennummer nicht. Sie können mit Karte, Apple Pay oder Google Pay zahlen.'
    },
    {
      question: 'Kann ich Pro jederzeit beenden?',
      answer: 'Ja. Monatlich ({monthPrice}) und jährlich ({yearPrice}) kündigen Sie mit einem Klick im Stripe-Portal. Keine Austrittsgebühr. Danach gilt wieder Gratis: {dailyJobs} Dokumente pro Tag, Dateien bis {freeSize}, {freeAi} KI-Guthaben pro Monat, leichte Werbung.'
    },
    {
      question: 'Ich habe schon gezahlt — wie melde ich mich an?',
      answer: 'Melden Sie sich mit der E-Mail und dem Passwort an, die Sie beim Kauf verwendet haben. Der 7-Tage-Pass oder Pro wird dann auf diesem Gerät wiederhergestellt. Unter Mein Konto sehen Sie die verbleibende Zeit und die verarbeiteten Dokumente.'
    },
    {
      question: 'Wie funktioniert das KI-Guthaben?',
      answer: 'Übersetzen kostet 1 Guthaben pro behandelter Seite, bis zu {translateCap} Seiten. Zusammenfassen kostet 1 Guthaben pro Seite, höchstens {summarizeCap} Guthaben pro Datei (längere PDF werden vorher gekürzt). Ein fehlgeschlagener Vorgang behält das Guthaben nicht. Gratis: {freeAi} / Monat. 7-Tage-Pass: {weekAi} für den Pass. Pro monatlich und jährlich: {proAi} pro Kalendermonat.'
    }
  ],
  paying: 'Weiterleitung zur Kasse…',
  payFail: 'Die Kasse konnte nicht gestartet werden.',
  canceled: 'Zahlung abgebrochen. Sie können es jederzeit erneut versuchen.',
  successTitle: 'Sie nutzen jetzt One2PDF Pro',
  successText: 'Ihr Pro-Konto ist bereit.',
  successBenefitsTitle: 'Ihre Pro-Vorteile',
  successStatus: 'Aktiv',
  successRenews: 'Verlängert sich am {date}',
  successCta: 'One2PDF Pro nutzen',
  successManage: 'Abo verwalten',
  successVerifying: 'Zahlung wird geprüft…',
  successSeoTitle: 'Willkommen bei One2PDF Pro',
  successSeoDescription: 'Ihre Zahlung für One2PDF Pro ist bestätigt. Nutzen Sie alle PDF-Werkzeuge ohne Tageslimit.',
  successBenefitsPass: [
    'Keine Werbung',
    'Dateien bis 100 MB',
    'OCR inklusive',
    'Kein tägliches Dokumentenlimit',
    '100 KI-Guthaben für 7 Tage',
    'Jederzeit kündbar oder verwaltbar'
  ],
  successBenefitsPro: [
    'Keine Werbung',
    'Dateien bis 100 MB',
    'OCR inklusive',
    'Kein tägliches Dokumentenlimit',
    '500 KI-Guthaben pro Monat',
    'Jederzeit kündbar oder verwaltbar'
  ],
  successPeriodWeek: '7 Tage · einmalige Zahlung',
  successPeriodMonth: 'Monatlich',
  successPeriodYear: 'Jährlich',
  successUnverified: 'Stripe konnte diese Zahlung nicht bestätigen. Wenn Sie gerade gezahlt haben, warten Sie einen Moment und versuchen Sie es erneut.',
  successFailTitle: 'Zahlung nicht bestätigt',
  activeAccess: 'Der Pro-Zugang ist auf diesem Gerät bereits aktiv.',
  alreadyActive: 'Pass bereits aktiv — mein Konto anzeigen',
  restoreBanner: 'Schon gezahlt? Nicht erneut bezahlen. Melden Sie sich mit der E-Mail der Zahlung an.',
  manage: 'Abo verwalten',
  logout: 'Abmelden',
  accountPro: 'Pro',
  myAccount: 'Mein Konto'
};

export const deUpgrade = {
  kicker: 'Datei zu groß',
  title: 'Diese Datei überschreitet das Gratislimit',
  text: '„{name}“ hat {size}. Der Gratisplan akzeptiert bis {limit} — die Datei wurde nicht hochgeladen. Pass und Pro akzeptieren Dateien bis 100 MB:',
  limit: '20 MB',
  dismiss: 'Schließen und eine kleinere Datei wählen',
  batchKicker: 'Stapelverarbeitung',
  batchTitle: 'Der Stapel ist eine Pro-Funktion',
  batchText: 'Sie haben {count} Dateien auf einmal gewählt. Im Gratisplan fügen Sie eine Datei nach der anderen hinzu — es wurde nichts hochgeladen. Ein 7-Tage-Pass oder Pro schaltet die Stapelverarbeitung frei.',
  batchDismiss: 'Schließen und Dateien einzeln hinzufügen',
  premiumKicker: 'Pro-Funktion',
  premiumTitle: '{feature} verlangt Pro',
  premiumText: 'OCR gibt es mit einem 7-Tage-Pass oder mit Pro. Die wesentlichen PDF-Werkzeuge (zusammenfügen, komprimieren, umwandeln, bearbeiten …) bleiben kostenlos. Wechseln Sie, um OCR freizuschalten:',
  creditsTitle: '{feature} verbraucht KI-Guthaben',
  creditsText: '{feature} verbraucht KI-Guthaben (1 Guthaben pro Seite). Gratis enthält ein monatliches Kontingent; der 7-Tage-Pass und Pro enthalten mehr. Das ist kein reines Pro-Werkzeug:',
  creditsKicker: 'KI-Guthaben',
  premiumDismiss: 'Zurück zu den kostenlosen Werkzeugen',
  featureOcr: 'OCR',
  featureTranslate: 'KI-Übersetzung',
  featureSummarize: 'KI-Zusammenfassung',
  alreadyPaid: 'Ich habe schon gezahlt — anmelden'
};

export const deAccount = {
  seoTitle: 'Mein One2PDF-Konto',
  seoDescription: 'Sehen Sie Ihren One2PDF-Pass, die verbleibende Zeit und die verarbeiteten Dokumente.',
  title: 'Mein Konto',
  lead: 'Ihr Pass hängt an Ihrem Konto. Melden Sie sich an, um die verbleibende Zeit zu sehen.',
  emailLabel: 'E-Mail',
  emailPlaceholder: 'E-Mail',
  cta: 'Meinen Pass wiederherstellen',
  working: 'Wird geprüft…',
  noPass: 'Kein aktiver Pass für diese E-Mail.',
  plan: 'Plan',
  validUntil: 'Gültig bis',
  remaining: 'Verbleibende Zeit',
  daysLeft: 'Noch {count} Tage',
  hoursLeft: 'Noch {count} Std.',
  unlimitedTime: 'Kein Enddatum',
  expired: 'Abgelaufen',
  used: 'Verarbeitete Dokumente',
  usedToday: 'Heute verarbeitet',
  remainingDocs: 'Heute noch verfügbare Dokumente',
  unlimitedDocs: 'Unbegrenzt',
  freeLimit: '{used} / {limit} Gratisdokumente heute',
  aiCredits: 'KI-Guthaben',
  toolsCta: 'Werkzeuge nutzen',
  loginTitle: 'Beim Pass anmelden',
  loginLead: 'Geben Sie E-Mail und Passwort Ihres One2PDF-Kontos ein.',
  loginSeoTitle: 'Bei One2PDF anmelden',
  loginSeoDescription: 'Melden Sie sich an, um Ihren Pass und die PDF-Werkzeuge wiederherzustellen.',
  loginHint: 'Verwenden Sie dieselbe E-Mail wie beim Kauf, damit der 7-Tage-Pass angehängt wird.',
  authLoginTitle: 'Beim Konto anmelden',
  authSignupTitle: 'Neues Konto anlegen',
  loginAsideTitle: 'In Ihrem Arbeitsbereich anmelden',
  loginAsideText: 'Geben Sie E-Mail und Passwort ein, um auf Ihr One2PDF-Konto, Ihren Pass, Stapel und die PDF-Werkzeuge zuzugreifen.',
  signupAsideTitle: 'PDF-Werkzeuge für die tägliche Arbeit',
  signupAsideText: 'Legen Sie ein Konto an, um PDF zusammenzufügen, zu komprimieren, umzuwandeln und zu schützen. Wenn Sie schon gezahlt haben, verwenden Sie dieselbe E-Mail — der Pass wird automatisch angehängt.',
  signupSeoTitle: 'Ein One2PDF-Konto anlegen',
  signupSeoDescription: 'Legen Sie ein One2PDF-Konto mit E-Mail und Passwort an. Ein bereits bezahlter Pass wird automatisch angehängt.',
  namePlaceholder: 'Name',
  emailEnter: 'E-Mail eingeben',
  passwordPlaceholder: 'Passwort',
  loginCta: 'Anmelden',
  signupCta: 'Registrieren',
  forgotPassword: 'Passwort vergessen?',
  forgotHint: 'Eine E-Mail zum Zurücksetzen gibt es noch nicht. Legen Sie ein Konto mit der Zahlungs-E-Mail an oder schreiben Sie an support@one2pdf.com.',
  noAccount: 'Noch kein Konto?',
  createAccount: 'Konto anlegen',
  hasAccount: 'Schon Mitglied?',
  signInLink: 'Anmelden',
  seeTools: 'Alle Werkzeuge anzeigen',
  termsPrefix: 'Mit dem Konto akzeptieren Sie unsere',
  loginFail: 'E-Mail oder Passwort ist falsch.',
  signupFail: 'Das Konto konnte nicht angelegt werden.'
};

export const deBlogPage = {
  title: 'One2PDF-Blog',
  subtitle: 'Praktische Hinweise zum Versenden, Verkleinern und Verarbeiten von PDF im Alltag.',
  readMore: 'Artikel lesen',
  back: 'Alle Artikel',
  seoTitle: 'PDF-Blog: Hinweise und Anleitungen | One2PDF',
  seoDescription: 'Anleitungen zum Komprimieren, Zusammenfügen und Umwandeln von PDF. E-Mail, Gmail und Dateien, im Blog von One2PDF.',
  publishedOn: 'Veröffentlicht am {date}'
};

export const deLegal = {
  privacyTitle: 'Datenschutz',
  privacyUpdated: 'Letzte Aktualisierung: September 2026',
  privacyIntro: 'One2PDF verkauft Ihre Dokumente nicht und behält sie nicht, um Modelle zu trainieren.',
  privacyData: 'Wenn Sie ein Werkzeug nutzen, wird die Datei für die Dauer des Vorgangs an unsere Server gesendet (Umwandlung, Komprimierung, OCR und Ähnliches). Ein technisches Cookie speichert das Gratiskontingent und, falls Sie abonnieren, Ihren Pro-Zugang.',
  privacyRetention: 'Die Originaldatei wird gelöscht, sobald die Verarbeitung endet. Das Ergebnis steht für einen Download bereit und wird danach entfernt. Nicht heruntergeladene Dateien werden spätestens nach 15 Minuten gelöscht.',
  privacyThird: 'Zahlungen: Stripe. Reichweitenmessung: Google Analytics (gtag). Office-Umwandlungen und OCR: auf unseren Servern. Zusammenfassen und Übersetzen: ein KI-Anbieter nur, wenn Sie diese Werkzeuge nutzen.',
  privacyRights: 'Sie können Auskunft, Berichtigung oder Löschung der Abrechnungsdaten zu Ihrer Stripe-E-Mail verlangen. Schreiben Sie uns über die Kontaktseite.',
  contactTitle: 'Kontakt',
  contactIntro: 'Fragen, Störungen oder Pro-Support? Schreiben Sie uns. Wir antworten auf Englisch und Französisch.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'Jährliche Pro-Abonnenten erhalten bevorzugten E-Mail-Support.'
};

export const deToPng = {
  title: 'PDF in PNG',
  subtitle: 'Wandeln Sie jede PDF-Seite in ein PNG-Bild um.',
  tip: 'Mehrere Seiten kommen als ZIP zurück. PNG hält flächige Grafiken scharf.',
  action: 'In PNG umwandeln',
  running: 'Wird umgewandelt…',
  fail: 'Dieses PDF lässt sich nicht in PNG umwandeln.',
  doneTitle: 'Umwandlung abgeschlossen',
  doneText: 'Die Seiten wurden als PNG exportiert.',
  reset: 'Andere Datei umwandeln',
  download: 'PNG-Dateien herunterladen',
  features: [
    feature('PNG', 'green', 'Ein Bild pro Seite', 'Jede Seite wird ein PNG, geeignet für Web und Bildschirm.'),
    feature('✓', 'blue', 'Automatisches ZIP', 'Mehrere Seiten werden in einem Archiv gebündelt.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das Ausgangs-PDF wird verarbeitet und danach gelöscht.')
  ],
  ...seoDe.toPng
};

export const deToText = {
  title: 'PDF in Text',
  subtitle: 'Holen Sie den markierbaren Text aus Ihrem PDF.',
  tip: 'Funktioniert bei PDF mit Textebene. Bei einem Scan zuerst OCR ausführen.',
  action: 'Text extrahieren',
  running: 'Wird extrahiert…',
  fail: 'Der Text lässt sich nicht extrahieren.',
  doneTitle: 'Text extrahiert',
  doneText: 'Der Inhalt wurde in einer Textdatei gespeichert.',
  reset: 'Andere Datei extrahieren',
  download: 'Text herunterladen',
  features: [
    feature('TXT', 'blue', 'Klartext', 'Holen Sie den Inhalt zum Einfügen, Durchsuchen oder Umschreiben.'),
    feature('★', 'green', 'Ohne Installation', 'Die Extraktion läuft im Browser, danach laden Sie die .txt herunter.'),
    feature('✧', 'purple', 'Eingescannte Seiten', 'Wenn das PDF ein Bild ist, nutzen Sie das OCR-Werkzeug.')
  ],
  ...seoDe.toText
};

export const deUnlock = {
  title: 'PDF entsperren',
  subtitle: 'Entfernen Sie das Öffnungspasswort eines PDF, das Ihnen gehört.',
  tip: 'Geben Sie das aktuelle Passwort ein. Ohne dieses Passwort lässt sich ein gesperrtes PDF nicht öffnen.',
  action: 'Entsperren',
  running: 'Wird entsperrt…',
  fail: 'Dieses PDF lässt sich nicht entsperren.',
  doneTitle: 'PDF entsperrt',
  doneText: 'Die Datei öffnet sich jetzt ohne Passwort.',
  reset: 'Andere Datei entsperren',
  password: 'Passwort',
  passwordPh: 'Aktuelles Passwort',
  features: [
    feature('🔓', 'orange', 'Freies Öffnen', 'Das Ergebnis verlangt kein Passwort mehr.'),
    feature('✓', 'blue', 'Ihre Datei', 'Nur ein Dokument verwenden, dessen Passwort Sie kennen.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das Original bleibt nicht auf dem Server.')
  ],
  ...seoDe.unlock
};

export const deOcr = {
  title: 'PDF-OCR',
  subtitle: 'Erkennen Sie Text auf gescannten Seiten und holen Sie ein nutzbares PDF. Enthalten im 7-Tage-Pass oder in Pro.',
  tip: 'OCR nutzt Tesseract. Die Qualität hängt von der Schärfe des Scans ab. Enthalten im 7-Tage-Pass oder in Pro.',
  action: 'OCR starten',
  running: 'Wird erkannt…',
  fail: 'OCR konnte nicht ausgeführt werden.',
  doneTitle: 'OCR abgeschlossen',
  doneText: 'Der Text wurde erkannt. Laden Sie das erzeugte PDF herunter.',
  reset: 'Andere Datei verarbeiten',
  features: [
    feature('OCR', 'gold', 'Gescannte Seiten', 'Machen Sie aus einem Dokumentbild erkannten Text.'),
    feature('★', 'green', 'Browsersprache', 'Die Erkennung folgt der erkannten Sprache (DE, EN, FR, ES …).'),
    feature('✧', 'purple', 'Danach übersetzen oder zusammenfassen', 'Sobald Text vorhanden ist, werden die anderen Werkzeuge nützlich.')
  ],
  ...seoDe.ocr
};

export const deSummarize = {
  title: 'PDF zusammenfassen',
  subtitle: 'Holen Sie eine klare Zusammenfassung aus dem Dokumenttext. Verbraucht KI-Guthaben (1 Guthaben pro Seite).',
  tip: 'Verbraucht KI-Guthaben (1 Guthaben pro Seite, höchstens 20 pro Datei). Wählen Sie Stil und Sprache und fassen Sie dann zusammen. Gescannte PDF brauchen zuerst OCR.',
  action: 'PDF zusammenfassen',
  running: 'Ihr PDF wird ausgewertet…',
  fail: 'Dieses PDF lässt sich nicht zusammenfassen.',
  doneTitle: 'Zusammenfassung bereit',
  doneText: 'Lesen Sie die Zusammenfassung, kopieren Sie sie oder laden Sie sie herunter.',
  reset: 'Anderes PDF zusammenfassen',
  download: 'Herunterladen',
  copy: 'Kopieren',
  copied: 'Kopiert',
  modeQuestion: 'Wie soll die Zusammenfassung aussehen?',
  modeQuick: 'Kurz',
  modeQuickHint: 'Kurzer Überblick.',
  modeDetailed: 'Ausführlich',
  modeDetailedHint: 'Gegliedert und umfassend.',
  modeKeyPoints: 'Stichpunkte',
  modeKeyPointsHint: 'Die wesentlichen Punkte als Liste.',
  languageLabel: 'Sprache der Zusammenfassung',
  languageSame: 'Wie das Dokument',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'Modus',
  resultLanguage: 'Sprache',
  documentLabel: 'Dokument',
  features: [
    feature('☷', 'green', 'Drei Modi', 'Kurz, ausführlich oder Stichpunkte — je nachdem, was Sie brauchen.'),
    feature('★', 'blue', 'Text nötig', 'Bei einem Scan zuerst OCR ausführen.'),
    feature('✧', 'teal', '.txt-Datei', 'Kopieren oder herunterladen; nichts wird gespeichert.')
  ],
  ...seoDe.summarize
};

export const deTranslate = {
  title: 'PDF übersetzen',
  subtitle: 'Holen Sie ein übersetztes PDF, das das Layout möglichst behält. Verbraucht KI-Guthaben (1 Guthaben pro behandelter Seite).',
  tip: 'Verbraucht KI-Guthaben (1 Guthaben pro behandelter Seite). Bilder, Logos und Tabellen bleiben. Der Text wird an Ort und Stelle übersetzt. Das Layout ist nicht pixelgenau: manche Sprachen werden länger oder kürzer.',
  action: 'PDF übersetzen',
  running: 'Das Dokument wird übersetzt…',
  fail: 'Dieses PDF lässt sich nicht übersetzen.',
  doneTitle: 'Übersetztes PDF bereit',
  doneText: 'Laden Sie das übersetzte PDF herunter. Eine reine Textdatei gibt es zusätzlich, wenn Sie nur den Wortlaut brauchen.',
  reset: 'Andere Datei übersetzen',
  download: 'Übersetztes PDF herunterladen',
  downloadTxt: 'Übersetzten Text herunterladen (.txt)',
  source: 'Von',
  autoDetect: 'Automatisch erkennen',
  target: 'Nach',
  output: 'Ausgabe',
  preserveLayout: 'Layout behalten',
  preserveLayoutHint: 'Positionen, Bilder, Tabellen und die visuelle Gliederung so weit wie möglich behalten.',
  textOnly: 'Nur Text',
  textOnlyHint: 'Nur der übersetzte Wortlaut, ohne den ursprünglichen Seitenaufbau.',
  langFr: 'Français',
  langEn: 'English',
  langEs: 'Español',
  langPt: 'Português',
  langDe: 'Deutsch',
  langTr: 'Türkçe',
  langAr: 'العربية',
  langIt: 'Italiano',
  features: [
    feature('A文', 'orange', 'Übersetztes PDF', 'Das Hauptergebnis ist ein PDF: die Bilder bleiben, der Text wird in seinen Bereichen ersetzt.'),
    feature('★', 'blue', 'Layout soweit möglich', 'Deutsch kann einen Kasten überlaufen, Englisch kann Lücken lassen. Die Schriftgröße passt sich an.'),
    feature('✧', 'purple', 'Scans eingeschlossen', 'Wenn das PDF wenig markierbaren Text hat, läuft zuerst OCR, danach die Übersetzung.')
  ],
  ...seoDe.translate
};

export const deHtml = {
  title: 'HTML in PDF',
  subtitle: 'Wandeln Sie eine HTML-Seite mit einem Klick in ein PDF um.',
  tip: 'Laden Sie eine .html-Datei hoch oder fügen Sie HTML ein. Seiten mit viel JavaScript werden schlechter dargestellt.',
  action: 'PDF erzeugen',
  running: 'Wird umgewandelt…',
  fail: 'Dieses HTML lässt sich nicht umwandeln.',
  doneTitle: 'PDF erzeugt',
  doneText: 'Das HTML wurde in ein PDF umgewandelt.',
  reset: 'Weiteres HTML umwandeln',
  empty: 'HTML einfügen oder eine Datei wählen.',
  pastePh: '<h1>Titel</h1><p>Ihr Inhalt…</p>',
  useHtml: 'Dieses HTML verwenden',
  features: [
    feature('</>', 'purple', 'Datei oder Einfügen', 'Legen Sie eine .html-Datei ab oder fügen Sie den Code ein.'),
    feature('⌘', 'gold', 'Online', 'Umwandlung auf unseren Servern — ohne Installation.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'HTML bleibt nicht auf dem Server.')
  ],
  ...seoDe.htmlPdf
};

export const deExtractPages = {
  title: 'Seiten extrahieren',
  subtitle: 'Behalten Sie nur die Seiten, die Sie brauchen, in einem neuen PDF.',
  tip: 'Wählen Sie die Seiten oder geben Sie einen Bereich wie 1-3, 7 ein.',
  action: 'Seiten extrahieren',
  running: 'Wird extrahiert…',
  fail: 'Diese Seiten lassen sich nicht extrahieren.',
  doneTitle: 'Seiten extrahiert',
  doneText: 'Die ausgewählten Seiten liegen in einem neuen PDF.',
  reset: 'Andere Datei extrahieren',
  invalidRange: 'Geben Sie einen gültigen Seitenbereich ein.',
  features: [
    feature('▤', 'green', 'Eine Datei', 'Die gewählten Seiten werden ein PDF, in der richtigen Folge.'),
    feature('★', 'blue', 'Ohne Installation', 'Seiten im Browser wählen und dann herunterladen.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das Original bleibt nicht auf dem Server.')
  ],
  seoTitle: 'PDF-Seiten extrahieren | One2PDF',
  seoDescription: 'Behalten Sie die Seiten, die Sie wählen, und laden Sie ein neues PDF herunter. Im Browser, ohne Konto für die gelegentliche Nutzung.',
  seoH2: 'So extrahieren Sie Seiten aus einem PDF',
  seoP1: 'Brauchen Sie die Seiten 2 bis 5 aus einem längeren Dokument? Ziehen Sie sie in ein neues PDF, ohne Software zu installieren.',
  seoP2: 'Wählen Sie die Seiten, bestätigen Sie und laden Sie das Ergebnis herunter. Die Originaldatei wird nach der Verarbeitung gelöscht.',
  seoP3: 'Für die gelegentliche Nutzung im Gratisplan ist kein Konto nötig.'
};

export const deExtractImages = {
  title: 'Bilder extrahieren',
  subtitle: 'Holen Sie die im PDF eingebetteten Bilder und laden Sie sie herunter.',
  tip: 'Funktioniert bei Bildern, die in der Datei gespeichert sind, nicht bei einer Seite, die nur ein Textscan ist.',
  action: 'Bilder extrahieren',
  running: 'Wird extrahiert…',
  fail: 'Aus diesem PDF lassen sich keine Bilder extrahieren.',
  doneTitle: 'Bilder extrahiert',
  doneText: 'Laden Sie die im Dokument gefundenen Bilder herunter.',
  reset: 'Andere Datei extrahieren',
  download: 'Bilder herunterladen',
  features: [
    feature('🖼', 'purple', 'Eingebettete Dateien', 'Holen Sie Fotos und Grafiken, die im PDF gespeichert sind.'),
    feature('★', 'blue', 'ZIP oder Einzeldatei', 'Ein Bild wird direkt geladen; mehrere kommen als ZIP.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Nach dem Download bleibt nichts gespeichert.')
  ],
  seoTitle: 'Bilder aus einem PDF extrahieren | One2PDF',
  seoDescription: 'Laden Sie die in einem PDF eingebetteten Bilder herunter. Im Browser, ohne Konto für die gelegentliche Nutzung.',
  seoH2: 'So holen Sie Bilder aus einem PDF',
  seoP1: 'Ein PDF enthält oft Fotos, Logos oder Scans. One2PDF listet die eingebetteten Bilder, damit Sie sie speichern können.',
  seoP2: 'Wenn das Dokument nur eine gescannte Textseite ist, nutzen Sie OCR oder PDF in JPG.',
  seoP3: 'Die Originaldatei wird gelöscht, sobald die Verarbeitung endet.'
};

export const deFlatten = {
  title: 'PDF flachlegen',
  subtitle: 'Machen Sie Formularfelder zu festem Inhalt, der sich nicht mehr ändern lässt.',
  tip: 'Nutzen Sie das, nachdem Sie ein Formular ausgefüllt haben, damit die Felder nicht mehr bearbeitbar sind.',
  action: 'Flachlegen',
  running: 'Wird fixiert…',
  fail: 'Dieses PDF lässt sich nicht flachlegen.',
  doneTitle: 'PDF flachgelegt',
  doneText: 'Die Formularfelder sind jetzt Teil der Seite.',
  reset: 'Andere Datei flachlegen',
  features: [
    feature('▣', 'orange', 'Feste Felder', 'Die Werte bleiben sichtbar, lassen sich aber nicht mehr ändern.'),
    feature('★', 'blue', 'Nach dem Ausfüllen', 'Legen Sie das Formular flach, sobald es vollständig ist.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das Original wird nicht gespeichert.')
  ],
  seoTitle: 'PDF-Formular fixieren | One2PDF',
  seoDescription: 'Fixieren Sie die Felder eines PDF-Formulars, damit sie sich nicht mehr bearbeiten lassen. Im Browser.',
  seoH2: 'So legen Sie ein PDF flach',
  seoP1: 'Beim Flachlegen werden die Formularfelder in die Seite übernommen. Empfänger sehen die Werte, können sie aber nicht ändern.',
  seoP2: 'Die Datei muss ein PDF-Formular enthalten. Ein PDF ohne Felder lässt sich so nicht fixieren.',
  seoP3: 'Die Verarbeitung ist vorübergehend: das Original wird am Ende des Vorgangs gelöscht.'
};

export const deHeaderFooter = {
  title: 'Kopf- und Fußzeile',
  subtitle: 'Setzen Sie eine kurze Zeile oben oder unten auf jede Seite.',
  tip: 'Halten Sie den Text kurz. Seitenzahlen können Sie optional in die Fußzeile setzen.',
  action: 'Übernehmen',
  running: 'Wird angewendet…',
  fail: 'Kopf- oder Fußzeile konnte nicht gesetzt werden.',
  doneTitle: 'Kopf- und Fußzeile gesetzt',
  doneText: 'Der Text wurde auf jede Seite angewendet.',
  reset: 'Andere Datei bearbeiten',
  header: 'Kopfzeile',
  headerPh: 'Vertraulich',
  footer: 'Fußzeile',
  footerPh: 'Firmenname',
  numbers: 'Seitenzahlen in der Fußzeile',
  color: 'Farbe',
  empty: 'Geben Sie eine Kopfzeile, eine Fußzeile oder Seitenzahlen an.',
  features: [
    feature('HF', 'blue', 'Jede Seite', 'Dieselbe Kopf- und Fußzeile gilt für die ganze Datei.'),
    feature('★', 'green', 'Optionale Nummern', 'Setzen Sie 1 / n in die Fußzeile, wenn Sie sie brauchen.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das Original wird nach der Verarbeitung gelöscht.')
  ],
  seoTitle: 'Kopf- und Fußzeile in ein PDF setzen | One2PDF',
  seoDescription: 'Setzen Sie eine Kopfzeile, eine Fußzeile oder Seitenzahlen auf jedes Blatt eines PDF. Im Browser.',
  seoH2: 'So ergänzen Sie Kopf- und Fußzeile',
  seoP1: 'Eine kurze Zeile oben oder unten auf jeder Seite reicht, um ein Dokument zu kennzeichnen.',
  seoP2: 'Geben Sie den Text ein, ergänzen Sie bei Bedarf Seitenzahlen und laden Sie das Ergebnis herunter.',
  seoP3: 'Keine Software nötig. Die Originaldatei wird nicht behalten.'
};

export const deFillForm = {
  title: 'PDF-Formular ausfüllen',
  subtitle: 'Füllen Sie die Felder eines interaktiven PDF im Browser aus und laden Sie das Ergebnis herunter.',
  tip: 'Nur PDF mit Formularfeldern lassen sich hier ausfüllen. Legen Sie sie danach flach, um die Werte zu fixieren.',
  inspecting: 'Formularfelder werden gelesen…',
  action: 'Formular speichern',
  running: 'Wird gespeichert…',
  fail: 'Dieses Formular lässt sich nicht ausfüllen.',
  doneTitle: 'Formular ausgefüllt',
  doneText: 'Ihre Angaben wurden in das PDF geschrieben.',
  reset: 'Andere Datei ausfüllen',
  checked: 'Aktiviert',
  choose: 'Wählen',
  flatten: 'Felder nach dem Speichern flachlegen',
  features: [
    feature('☑', 'green', 'Interaktive Felder', 'Text, Kontrollkästchen und Listen werden automatisch erkannt.'),
    feature('★', 'blue', 'Optional flachlegen', 'Sperren Sie die Antworten, damit sie später nicht mehr geändert werden.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Nach dem Download wird nichts gespeichert.')
  ],
  seoTitle: 'PDF-Formular online ausfüllen | One2PDF',
  seoDescription: 'Füllen Sie die Felder eines interaktiven PDF im Browser aus und laden Sie das Ergebnis herunter.',
  seoH2: 'So füllen Sie ein PDF-Formular aus',
  seoP1: 'Wenn das PDF Formularfelder enthält, listet One2PDF sie, damit Sie Antworten eintippen können, ohne zu drucken.',
  seoP2: 'Danach können Sie das Formular flachlegen, damit die Werte sichtbar bleiben, aber nicht mehr bearbeitbar sind.',
  seoP3: 'Die Originaldatei wird gelöscht, sobald die Verarbeitung endet.'
};

export const deFillSign = {
  title: 'PDF ausfüllen und unterschreiben',
  subtitle: 'Setzen Sie Text, Daten, Häkchen und Ihre Unterschrift direkt auf das PDF.',
  select: 'Ein PDF wählen',
  orDrop: 'PDF hier ablegen oder eine Datei wählen',
  trust: [
    'Einfach und schnell',
    'Läuft direkt im Browser',
    'Ihre Dateien werden nach der Verarbeitung gelöscht'
  ],
  cannotOpen: 'Dieses PDF lässt sich nicht öffnen oder ist geschützt.',
  fail: 'Das ausgefüllte PDF konnte nicht erzeugt werden.',
  running: 'PDF wird vorbereitet…',
  doneTitle: 'Ihr PDF ist bereit',
  doneText: 'Das Dokument wurde ausgefüllt und unterschrieben. Laden Sie es jetzt herunter.',
  reset: 'Anderes PDF ausfüllen',
  download: 'Herunterladen',
  undo: 'Rückgängig',
  redo: 'Wiederholen',
  toolsAria: 'Werkzeuge zum Ausfüllen und Unterschreiben',
  pagesAria: 'Dokumentseiten',
  selectTool: 'Auswählen',
  text: 'Text',
  signature: 'Unterschrift',
  initials: 'Initialen',
  date: 'Datum',
  checkbox: 'Kontrollkästchen',
  check: 'Häkchen',
  cross: 'Kreuz',
  circle: 'Kreis',
  draw: 'Zeichnen',
  defaultText: 'Text',
  size: 'Größe',
  bold: 'Fett',
  delete: 'Löschen',
  duplicate: 'Duplizieren',
  choose: 'Wählen',
  signatureTitle: 'Unterschrift hinzufügen',
  initialsTitle: 'Initialen hinzufügen',
  drawTab: 'Zeichnen',
  typeTab: 'Tippen',
  importTab: 'Hochladen',
  typePlaceholder: 'Ihr Name',
  chooseImage: 'Ein Bild wählen',
  importHint: 'PNG oder JPG. Die Unterschrift bleibt nur in dieser Sitzung.',
  clearPad: 'Leeren',
  cancel: 'Abbrechen',
  useStamp: 'Übernehmen',
  reuseLast: 'Letzte verwenden',
  features: [
    feature('T', 'orange', 'Text und Datum', 'Setzen Sie Text oder das heutige Datum genau an die richtige Stelle.'),
    feature('〰', 'blue', 'Einfache Unterschrift', 'Zeichnen, tippen oder laden Sie eine Unterschrift hoch und schieben Sie sie an den Platz.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Das PDF wird nach der Verarbeitung gelöscht, wie bei den anderen One2PDF-Werkzeugen.')
  ],
  seoTitle: 'PDF ausfüllen und unterschreiben | One2PDF',
  seoDescription: 'Setzen Sie Text, Daten, Häkchen und Ihre Unterschrift auf das PDF und laden Sie das Dokument herunter. Ohne Ausdruck.',
  seoH2: 'So füllen und unterschreiben Sie ein PDF',
  seoP1: 'Laden Sie ein PDF hoch — Vertrag, Angebot, Bescheinigung oder Formular — und setzen Sie Text, Datum und Unterschrift dorthin, wo sie hingehören.',
  seoP2: 'Wenn die Datei schon interaktive Felder hat, können Sie auch diese ausfüllen. Ein gewöhnliches PDF lässt sich immer ergänzen, indem Sie Elemente darauf setzen.',
  seoP3: 'Das Original wird nicht aufbewahrt. Eine Unterschrift bleibt auf die Arbeitssitzung beschränkt und wird nicht zum Trainieren eines Modells verwendet.',
  howTitle: 'Ein PDF ausfüllen und unterschreiben',
  howSteps: [
    'Das PDF wählen oder ablegen',
    'Text, Häkchen oder eine Unterschrift setzen',
    'Das fertige Dokument herunterladen'
  ],
  faqTitle: 'Fragen zum Ausfüllen und Unterschreiben',
  faq: [
    {
      question: 'Brauche ich ein besonderes Formular-PDF?',
      answer: 'Nein. Sie können jedes PDF mit Text, Datum und Unterschrift ergänzen. Interaktive Felder werden genutzt, wenn sie schon vorhanden sind.'
    },
    {
      question: 'Wird meine Unterschrift gespeichert?',
      answer: 'Nein. Eine hier erzeugte Unterschrift bleibt standardmäßig auf die aktuelle Arbeitssitzung beschränkt.'
    },
    {
      question: 'Bleiben die Dateien nach dem Download erhalten?',
      answer: 'Nein. Wie bei den anderen One2PDF-Werkzeugen wird die Datei nur vorübergehend verarbeitet und nach dem Download gelöscht.'
    }
  ]
};

export const deHeic = {
  title: 'HEIC in PDF',
  subtitle: 'Wandeln Sie iPhone-Fotos (HEIC/HEIF) in ein PDF um, das Sie verschicken können.',
  tip: 'HEIC-Dateien vom iPhone werden umgewandelt und dann im PDF platziert.',
  tipMixed: 'JPG, PNG und WebP können mit HEIC in derselben Datei gemischt werden.',
  action: 'In PDF umwandeln',
  running: 'Wird umgewandelt…',
  fail: 'Diese Bilder lassen sich nicht in ein PDF umwandeln.',
  doneTitle: 'PDF bereit',
  doneText: 'Ihre Fotos wurden in einem PDF zusammengefasst.',
  reset: 'Weitere Fotos umwandeln',
  features: [
    feature('HEIC', 'orange', 'iPhone-Fotos', 'HEIC/HEIF-Bilder werden zu Seiten in einem PDF.'),
    feature('★', 'blue', 'Mehrere Fotos', 'Fügen Sie mehr als ein Bild hinzu; die Reihenfolge bleibt.'),
    feature('✧', 'teal', 'Temporäre Dateien', 'Die Originale werden nach der Umwandlung gelöscht.')
  ],
  seoTitle: 'HEIC in PDF umwandeln | One2PDF',
  seoDescription: 'Wandeln Sie HEIC-Fotos vom iPhone im Browser in ein PDF um. Ohne Konto für die gelegentliche Nutzung.',
  seoH2: 'So werden HEIC-Fotos zu einem PDF',
  seoP1: 'iPhones speichern Fotos oft als HEIC. Wandeln Sie sie in ein PDF um, das sich auf jedem Gerät öffnen lässt.',
  seoP2: 'Fügen Sie ein oder mehrere Fotos hinzu, wandeln Sie um und laden Sie herunter. JPG und PNG können dazugemischt werden.',
  seoP3: 'Die Dateien werden vorübergehend verarbeitet und danach gelöscht.'
};
