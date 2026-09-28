import type { BlogPost } from './blog';

/**
 * German drafts only. Not imported by getBlogPosts, sitemap, hreflang or prerender.
 * Do not publish until German SEO routes are activated.
 */
export const GERMAN_BLOG_DRAFTS: BlogPost[] = [
  {
    slug: 'pdf-fuer-e-mail-verkleinern',
    publishedIso: '2026-08-28',
    publishedLabel: '28. August 2026',
    seoTitle: 'PDF zu groß für die E-Mail | One2PDF',
    seoDescription: 'Lehnen Gmail oder Outlook ein PDF über 25 MB ab? Komprimieren Sie es online, ohne ein Programm zu installieren, und senden Sie es.',
    keywords: 'PDF komprimieren, PDF zu groß, Gmail 25 MB',
    title: 'So verkleinern Sie ein PDF, das für die E-Mail zu groß ist',
    excerpt: 'Gmail, Outlook oder ein Formular haben den Anhang abgelehnt. Hier steht, warum ein PDF so schwer wird und wie Sie es in wenigen Sekunden leichter machen, ohne ein Programm zu installieren.',
    body: [
      { type: 'p', text: 'Der Vorgang ist fertig, der Lebenslauf oder die Mappe auch, und der Versand bricht ab: „Die Datei überschreitet die maximale Größe (25 MB).“ Gmail, Outlook und viele Formulare stoppen dort. Meist lässt sich ein PDF in wenigen Sekunden verkleinern, ohne es neu zu drucken und ohne es unlesbar zu machen.' },
      { type: 'h2', text: 'Warum manche PDF so schwer werden' },
      { type: 'p', text: 'Ein PDF ist nicht „nur Text“. Hinter jeder Seite stecken Bilder, Schriften und manchmal Ebenen eines Scans. Je weniger diese Elemente optimiert sind, desto größer wird die Datei, auch wenn das Dokument kurz ist.' },
      { type: 'h3', text: 'Bilder in hoher Auflösung' },
      { type: 'p', text: 'Ein Scan, ein Foto vom Telefon oder ein unkomprimiertes Bild machen den größten Teil des Gewichts aus. 300 dpi sind zum Drucken sinnvoll und für eine E-Mail oft zu viel. Das ist die häufigste Ursache für ein PDF, das Gmail ablehnt.' },
      { type: 'h3', text: 'Seiten, Grafiken und Schriften summieren sich' },
      { type: 'p', text: 'Ein Bericht mit 40 Seiten, eingefügte Tabellen, Screenshots und mehrere eingebettete Schriften blähen die Struktur auf. Mehrere PDF zusammenzufügen, ohne sie vorher zu verkleinern, verschlimmert das Ergebnis: Bilder in voller Auflösung stapeln sich.' },
      { type: 'h2', text: 'Der schnellste Weg, ohne Installation' },
      { type: 'p', text: 'Für einen einzelnen Versand brauchen Sie kein kostenpflichtiges Desktop-Programm. Ein Online-Werkzeug reicht in den meisten Fällen: es verkleinert die Bilder und optimiert die Datei, mit einem am Bildschirm lesbaren Ergebnis.' },
      { type: 'h3', text: 'So komprimieren Sie ein großes PDF in One2PDF' },
      {
        type: 'ol',
        items: [
          [
            'Öffnen Sie das ',
            { text: 'Werkzeug zum Komprimieren von PDF', to: '/de/compress' },
            '.'
          ],
          'Ziehen Sie das Dokument in den Upload-Bereich (Computer oder Telefon).',
          'Lassen Sie das Werkzeug Bilder und Struktur optimieren. Wählen Sie eine stärkere Stufe, wenn die Datei über 25 MB bleibt.',
          'Laden Sie das neue PDF herunter, bereit für die E-Mail.'
        ]
      },
      { type: 'h2', text: 'Wenn die Datei trotzdem zu schwer bleibt' },
      { type: 'h3', text: 'Erst komprimieren, dann zusammenfügen' },
      {
        type: 'p',
        parts: [
          'Wenn Sie einen Vertrag, Anlagen und einen Scan bündeln müssen, verkleinern Sie zuerst jedes PDF und fügen Sie sie danach zusammen. Eine bereits komprimierte Datei lässt sich leichter kombinieren als ein Stapel von Originalen in voller Auflösung. Das Werkzeug ',
          { text: 'PDF zusammenfügen', to: '/de/merge' },
          ' hält die Reihenfolge der Miniaturen.'
        ]
      },
      { type: 'h3', text: 'Fotos vorher verkleinern' },
      {
        type: 'p',
        parts: [
          'Wenn das PDF aus Handyfotos besteht, wandeln Sie sie mit ',
          { text: 'JPG in PDF', to: '/de/jpg-to-pdf' },
          ' um, nachdem die Bilder selbst kleiner sind. Ein Foto mit 12 Megapixeln muss für eine E-Mail nicht in Druckqualität vorliegen.'
        ]
      },
      { type: 'h2', text: 'Kurz gesagt' },
      {
        type: 'ul',
        items: [
          'Gmail und Outlook lehnen Anhänge über 25 MB oft ab.',
          'Bilder in hoher Auflösung sind die häufigste Ursache.',
          'Eine stärkere Komprimierung macht den Text unmarkierbar, lässt ihn aber lesbar.',
          'Das Original auf Ihrem Computer bleibt unverändert. One2PDF löscht die verarbeitete Datei nach dem Download oder spätestens nach 15 Minuten.'
        ]
      }
    ],
    cta: 'PDF komprimieren',
    ctaTo: '/de/compress'
  },
  {
    slug: 'datenschutz-pdf-online',
    publishedIso: '2026-08-28',
    publishedLabel: '28. August 2026',
    seoTitle: 'PDF online: Dateien nicht an einen unbekannten Server schicken | One2PDF',
    seoDescription: 'Bevor Sie ein kostenloses PDF-Werkzeug nutzen, prüfen Sie, wohin die Dateien gehen und wie Sie einen Dienst wählen.',
    keywords: 'PDF Datenschutz, PDF online, Dateien löschen',
    title: 'PDF online: so vermeiden Sie, Dateien an einen unbekannten Server zu schicken',
    excerpt: 'Ein kostenloses PDF-Werkzeug im Browser ist praktisch. Es lohnt sich zu wissen, was mit der Datei passiert, bevor Sie einen Vertrag oder einen Ausweis hochladen.',
    body: [
      { type: 'p', text: 'Zusammenfügen, komprimieren, umwandeln: die meisten Online-Werkzeuge laden die Datei auf einen Server, verarbeiten sie und geben ein Ergebnis zurück. Das ist der übliche Weg, kein Alarm für sich. Entscheidend ist, wie lange die Datei bleibt, wo sie verarbeitet wird und ob ein KI-Dienst ins Spiel kommt.' },
      { type: 'h2', text: 'Was beim Hochladen wirklich passiert' },
      { type: 'p', text: 'Der Browser sendet das PDF an den Dienst. Der Server führt die gewünschte Operation aus und stellt das Ergebnis zum Download bereit. Wer behauptet, nichts verlasse den Computer, muss das auch belegen können. One2PDF sagt das nicht.' },
      { type: 'h3', text: 'Wie lange die Datei bleibt' },
      { type: 'p', text: 'Bei One2PDF wird das Original gelöscht, sobald die Verarbeitung endet. Das Ergebnis können Sie einmal herunterladen, danach wird es entfernt. Ohne Download geschieht das spätestens nach 15 Minuten. One2PDF ist kein Speicher.' },
      { type: 'h3', text: 'Wann ein KI-Anbieter dazukommt' },
      { type: 'p', text: 'Zusammenfassen und Übersetzen laufen nur, wenn Sie diese Werkzeuge starten. Die übrigen PDF-Werkzeuge schicken das Dokument nicht automatisch an einen KI-Anbieter. OCR mit Tesseract und Office-Umwandlungen laufen auf der Infrastruktur von One2PDF.' },
      { type: 'h2', text: 'Woran Sie einen klaren Dienst erkennen' },
      {
        type: 'ul',
        items: [
          'Eine nachvollziehbare Löschfrist, nicht nur der Satz „wir respektieren Ihre Daten“.',
          'Eine Angabe, welche Vorgänge einen externen Anbieter brauchen.',
          'Ein Preismodell, das nicht still ein Abo startet.',
          'Eine Datenschutzseite, die den Ablauf beschreibt, statt ihn zu verstecken.'
        ]
      },
      { type: 'p', text: 'Wir behaupten nicht, dass nichts Ihren Rechner verlässt. Wir beschreiben, was passiert, damit Sie entscheiden können.' },
      { type: 'h2', text: 'Kurz gesagt' },
      {
        type: 'ul',
        items: [
          'Fast alle Online-PDF-Werkzeuge laden die Datei auf einen Server. Das allein ist kein Warnsignal.',
          'Vertrauen entsteht durch klare Fristen, einen benannten Ort der Verarbeitung und eine ehrliche Aussage zur KI.',
          'Misstrauen Sie einem Versprechen von „null Versand“, das sich nicht belegen lässt.'
        ]
      },
      {
        type: 'p',
        parts: [
          'Die vollständige Regelung steht in der ',
          { text: 'Datenschutzrichtlinie', to: '/privacy' },
          '. Sie bleibt auf Englisch, bis eine geprüfte deutsche Fassung vorliegt.'
        ]
      }
    ],
    cta: 'PDF-Werkzeuge ansehen',
    ctaTo: '/de/tools'
  }
];
