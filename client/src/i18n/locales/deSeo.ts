import type { PageSeoCopy } from '../types';

/** German SEO copy. Not wired into sitemap, hreflang or prerender. */
export const seoDe = {
  wordToPdf: {
    seoTitle: 'Word in PDF umwandeln | One2PDF',
    seoDescription: 'Wandeln Sie eine Word-Datei (.doc, .docx) im Browser in ein PDF um, ohne Microsoft Word zu installieren.',
    seoH2: 'So wird aus einer Word-Datei ein PDF',
    seoP1: 'Ein Lebenslauf, ein Vertrag oder ein Bericht lässt sich zuverlässiger verschicken, wenn er als PDF vorliegt. Laden Sie .doc, .docx, .odt oder .rtf hoch, starten Sie die Umwandlung und laden Sie das PDF herunter.',
    seoP2: 'Layout, Schriften und Bilder bleiben so weit erhalten, dass das Dokument am Bildschirm und auf Papier lesbar ist. Praktisch für E-Mail, eine Bewerbung oder ein Formular, das PDF verlangt.',
    seoP3: 'Die Originaldatei wird nicht aufbewahrt. Das PDF steht zum Download bereit und wird danach gelöscht. Ohne Download entfernt One2PDF es spätestens nach 15 Minuten. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'Word in PDF umwandeln',
    howSteps: [
      'Word-Datei hochladen (.doc, .docx, .odt oder .rtf)',
      'Die Umwandlung im Browser starten',
      'Das PDF herunterladen'
    ],
    faqTitle: 'Fragen zu Word in PDF',
    faq: [
      {
        question: 'Muss Microsoft Word installiert sein?',
        answer: 'Nein. One2PDF wandelt .doc, .docx, .odt und .rtf im Browser um. Word auf dem Computer ist nicht nötig.'
      },
      {
        question: 'Ist die Umwandlung von Word in PDF kostenlos?',
        answer: 'Ja, ohne Konto. Der Gratisplan erlaubt 5 Dokumente pro Tag und Dateien bis 20 MB. Pass und Pro: kein tägliches Verarbeitungslimit, Dateien bis 100 MB.'
      },
      {
        question: 'Behält One2PDF meine Word-Datei?',
        answer: 'Nein. Das Original wird nach der Verarbeitung gelöscht. Das PDF kann einmal heruntergeladen werden und wird danach entfernt. Ohne Download geschieht das spätestens nach 15 Minuten.'
      }
    ]
  },
  pdfToWord: {
    seoTitle: 'PDF in Word umwandeln | One2PDF',
    seoDescription: 'Machen Sie aus einem PDF ein bearbeitbares Word-Dokument. Die Umwandlung läuft online, ohne Microsoft Word.',
    seoH2: 'So wird ein PDF in Word bearbeitbar',
    seoP1: 'Wenn der Text in einem PDF feststeckt, wandelt One2PDF ihn in DOC oder DOCX um. Datei hochladen, Umwandlung starten und das Ergebnis in Word öffnen.',
    seoP2: 'Text und ein brauchbares Layout werden wiederhergestellt, damit Sie korrigieren, kommentieren oder Absätze kopieren können. Ein reiner Scan braucht vorher OCR.',
    seoP3: 'Das Original-PDF wird nicht aufbewahrt. Die Word-Datei steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung sind Name und E-Mail nicht nötig.',
    howTitle: 'PDF in Word umwandeln',
    howSteps: [
      'Das PDF hochladen, das Sie bearbeiten möchten',
      'Die Umwandlung starten',
      'Die Word-Datei herunterladen und öffnen'
    ],
    faqTitle: 'Fragen zu PDF in Word',
    faq: [
      {
        question: 'Lässt sich die Word-Datei bearbeiten?',
        answer: 'Ja. Die Umwandlung stellt Text und ein nutzbares Layout wieder her. Komplexe Scans brauchen zuerst OCR, wenn das PDF nur ein Bild ist.'
      },
      {
        question: 'Brauche ich ein Konto für PDF in Word?',
        answer: 'Nein. Die kostenlose Nutzung verlangt weder Namen noch E-Mail. Ein Pro-Konto ist nur für zahlende Nutzer und verwendet E-Mail plus Passwort.'
      },
      {
        question: 'Werden die Dateien nach der Umwandlung gespeichert?',
        answer: 'Nein. Das Original-PDF wird am Ende des Vorgangs gelöscht. Das Word-Ergebnis verschwindet nach dem Download oder spätestens nach 15 Minuten, wenn Sie es nicht herunterladen.'
      }
    ]
  },
  excelToPdf: {
    seoTitle: 'Excel in PDF umwandeln | One2PDF',
    seoDescription: 'Fixieren Sie eine Excel-Arbeitsmappe als PDF, damit niemand die Zellen nachträglich ändert. Ohne Microsoft Excel.',
    seoH2: 'So wird aus Excel ein stabiles PDF',
    seoP1: 'Laden Sie .xls, .xlsx, .ods oder .csv hoch. Die Umwandlung friert Spalten, Summen und das Layout in einem PDF ein, das sich verschicken lässt.',
    seoP2: 'Geeignet für ein Angebot, einen Bericht oder eine Buchhaltung, die unverändert ankommen soll.',
    seoP3: 'Die Arbeitsmappe wird nicht aufbewahrt. Das PDF steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  pptToPdf: {
    seoTitle: 'PowerPoint in PDF umwandeln | One2PDF',
    seoDescription: 'Wandeln Sie eine PowerPoint-Präsentation in ein PDF um, das ohne PowerPoint geöffnet werden kann.',
    seoH2: 'So wird aus PowerPoint ein PDF',
    seoP1: 'Laden Sie .ppt, .pptx oder .odp hoch. Die Folien bleiben in ihrer Reihenfolge in einem PDF, das sich vorführen, drucken oder archivieren lässt.',
    seoP2: 'Praktisch für E-Mail, Schulungsunterlagen oder ein Dossier, das auf jedem Gerät gleich aussehen soll.',
    seoP3: 'Die Präsentation wird nicht aufbewahrt. Das PDF steht einen Moment zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  protect: {
    seoTitle: 'PDF mit Passwort schützen | One2PDF',
    seoDescription: 'Verschlüsseln Sie ein PDF, sodass es nur mit dem von Ihnen gewählten Passwort geöffnet werden kann.',
    seoH2: 'So schützen Sie ein PDF mit einem Passwort',
    seoP1: 'Laden Sie die Datei hoch, legen Sie ein Passwort fest, bestätigen Sie es und laden Sie das gesperrte PDF herunter. Ohne das Passwort lässt es sich nicht öffnen.',
    seoP2: 'Der Inhalt bleibt für Personen mit dem Passwort unverändert. Geeignet für Verträge, Gehaltsabrechnungen oder Ausweise.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das geschützte PDF wird nach dem Download gelöscht. Bewahren Sie das Passwort selbst auf: One2PDF kann es nicht wiederherstellen. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  toJpg: {
    seoTitle: 'PDF in JPG umwandeln | One2PDF',
    seoDescription: 'Exportieren Sie jede PDF-Seite als JPG. Mehrere Seiten kommen zusammen in einem ZIP.',
    seoH2: 'So wird ein PDF zu JPG-Bildern',
    seoP1: 'Laden Sie das PDF hoch und starten Sie die Umwandlung. Jede Seite wird ein JPG, brauchbar für Chat, Web oder eine Galerie.',
    seoP2: 'Mehrere Seiten werden in einem ZIP gebündelt. Eine einzelne Seite wird als Bild heruntergeladen.',
    seoP3: 'Das Ausgangs-PDF wird nicht aufbewahrt. Die Bilder werden nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  jpgToPdf: {
    seoTitle: 'JPG in PDF umwandeln | One2PDF',
    seoDescription: 'Fassen Sie JPG-, PNG- oder WebP-Fotos in einem PDF zusammen, in der Reihenfolge der Miniaturen.',
    seoH2: 'So werden Bilder zu einem PDF',
    seoP1: 'Laden Sie JPG, PNG oder WebP hoch, ziehen Sie die Miniaturen in die richtige Reihenfolge und erzeugen Sie ein Dokument zum Verschicken.',
    seoP2: 'Jedes Bild wird eine Seite. Geeignet für einen Handy-Scan, Screenshots oder ein Foto-Dossier.',
    seoP3: 'Die Bilder werden nicht aufbewahrt. Das PDF wird nach dem Download gelöscht oder spätestens nach 15 Minuten, wenn Sie es nicht herunterladen. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'JPG in PDF umwandeln',
    howSteps: [
      'JPG-, PNG- oder WebP-Bilder hochladen',
      'Die Miniaturen bei Bedarf umsortieren',
      'Das PDF herunterladen'
    ],
    faqTitle: 'Fragen zu JPG in PDF',
    faq: [
      {
        question: 'Kann ich mehrere Bilder in einem PDF bündeln?',
        answer: 'Ja. Laden Sie JPG, PNG oder WebP hoch, ordnen Sie die Miniaturen und erzeugen Sie ein PDF.'
      },
      {
        question: 'Muss ich ein Programm installieren?',
        answer: 'Nein. Die Umwandlung läuft im Browser.'
      },
      {
        question: 'Behält One2PDF meine Fotos?',
        answer: 'Nein. Sie werden nur für den Vorgang verarbeitet. Die Originale werden danach gelöscht. Das PDF verschwindet nach dem Download oder nach spätestens 15 Minuten.'
      }
    ]
  },
  edit: {
    seoTitle: 'PDF online bearbeiten | One2PDF',
    seoDescription: 'Setzen Sie Text, eine Zeichnung, ein Bild oder eine Unterschrift auf das PDF und exportieren Sie das Dokument. Ohne Adobe Acrobat.',
    seoH2: 'So bearbeiten Sie ein PDF im Browser',
    seoP1: 'Laden Sie die Datei hoch, fügen Sie Text hinzu, zeichnen Sie, setzen Sie ein Bild oder eine Unterschrift und exportieren Sie das geänderte Dokument.',
    seoP2: 'Die Vorschau zeigt jede Änderung seitenweise, bevor Sie herunterladen. Praktisch, um einen Scan zu kommentieren oder eine Datei zu unterschreiben.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das bearbeitete PDF steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  rotate: {
    seoTitle: 'PDF drehen | One2PDF',
    seoDescription: 'Richten Sie eine umgedrehte Seite oder einen seitlichen Scan aus. Drehen Sie eine Seite oder alle, in 90°-Schritten.',
    seoH2: 'So drehen Sie PDF-Seiten',
    seoP1: 'Laden Sie das PDF hoch und drehen Sie die angezeigte Seite oder alle Seiten um 90°. Danach laden Sie das korrigierte Dokument herunter.',
    seoP2: 'Geeignet für einen Handy-Scan oder eine Seite, die auf dem Kopf steht. Der Inhalt bleibt, nur die Ausrichtung ändert sich.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das gedrehte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'Ein PDF drehen',
    howSteps: [
      'Das PDF mit der schiefen Seite hochladen',
      'Die Seite oder alle Seiten um 90° drehen',
      'Das korrigierte PDF herunterladen'
    ],
    faqTitle: 'Fragen zum Drehen von PDF',
    faq: [
      {
        question: 'Kann ich nur eine Seite drehen?',
        answer: 'Ja. Wählen Sie die Seite und drehen Sie sie in 90°-Schritten. Sie können auch alle Seiten auf einmal drehen.'
      },
      {
        question: 'Ändert das Drehen den Inhalt?',
        answer: 'Nein. Text und Bilder bleiben. Nur die Ausrichtung der Seite ändert sich.'
      },
      {
        question: 'Wird die Datei gespeichert?',
        answer: 'Nein. Das Original wird nach der Verarbeitung gelöscht. Das Ergebnis verschwindet nach dem Download oder spätestens nach 15 Minuten.'
      }
    ]
  },
  watermark: {
    seoTitle: 'Wasserzeichen auf ein PDF setzen | One2PDF',
    seoDescription: 'Kennzeichnen Sie alle Seiten mit einem Text wie Vertraulich oder Entwurf. Deckkraft einstellen und das PDF herunterladen.',
    seoH2: 'So setzen Sie ein Wasserzeichen auf ein PDF',
    seoP1: 'Geben Sie den Text ein, wählen Sie Deckkraft und Ausrichtung und wenden Sie ihn auf alle Seiten an.',
    seoP2: 'Die Vorschau zeigt den Text, bevor Sie exportieren. Er bleibt lesbar, ohne den Inhalt vollständig zu verdecken.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das gekennzeichnete PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  pdfToExcel: {
    seoTitle: 'PDF in Excel umwandeln | One2PDF',
    seoDescription: 'Übernehmen Sie Tabellen aus einem PDF in eine Excel-Arbeitsmappe, um zu filtern oder neu zu rechnen. Ohne Microsoft Excel.',
    seoH2: 'So werden PDF-Tabellen zu Excel',
    seoP1: 'Laden Sie das PDF hoch und starten Sie die Umwandlung. Spalten und Zeilen werden so weit wiederhergestellt, wie das Layout es erlaubt.',
    seoP2: 'Praktisch für ein Angebot, einen Bericht oder Zahlen, die Sie filtern oder neu berechnen möchten.',
    seoP3: 'Das Original-PDF wird nicht aufbewahrt. Die Excel-Datei steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  pdfToPpt: {
    seoTitle: 'PDF in PowerPoint umwandeln | One2PDF',
    seoDescription: 'Machen Sie aus jeder PDF-Seite eine PowerPoint-Folie. Ohne Microsoft PowerPoint.',
    seoH2: 'So wird ein PDF zu Folien',
    seoP1: 'Laden Sie das PDF hoch. Jede Seite wird eine Folie in einer PPTX-Datei, die Sie kommentieren oder vorführen können.',
    seoP2: 'Geeignet, um ein Dossier, ein Skript oder ein Angebot in eine Besprechung zu übernehmen.',
    seoP3: 'Das Original-PDF wird nicht aufbewahrt. Die Präsentation steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  unlock: {
    seoTitle: 'PDF entsperren | One2PDF',
    seoDescription: 'Entfernen Sie das Öffnungspasswort eines PDF, wenn Sie es bereits kennen. Dateien mit unbekanntem Passwort werden nicht geöffnet.',
    seoH2: 'So entsperren Sie ein eigenes PDF',
    seoP1: 'Geben Sie das aktuelle Passwort ein. Das Ergebnis öffnet sich danach ohne Abfrage.',
    seoP2: 'One2PDF knackt keine unbekannten Passwörter. Nur Dokumente, deren Schlüssel Sie besitzen.',
    seoP3: 'Das Original wird nicht auf dem Server behalten. Das entsperrte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  ocr: {
    seoTitle: 'Text in einem gescannten PDF erkennen | One2PDF',
    seoDescription: 'Erkennen Sie den Text eines Scans und laden Sie ein PDF herunter, in dem sich der Text markieren lässt. OCR gibt es im 7-Tage-Pass oder mit Pro.',
    seoH2: 'So wird ein Scan durchsuchbar',
    seoP1: 'Laden Sie den Scan hoch und starten Sie die Erkennung. Das Ergebnis ist ein PDF, dessen Text sich markieren, suchen oder weiterverwenden lässt. OCR nutzt Tesseract und ist im 7-Tage-Pass oder mit Pro enthalten.',
    seoP2: 'Die Qualität hängt von der Schärfe des Scans ab. Danach können Sie den Text extrahieren, übersetzen oder zusammenfassen.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das OCR-PDF steht zum Download bereit und wird danach gelöscht. Für die gelegentliche Nutzung der übrigen Werkzeuge ist kein Konto nötig; OCR selbst verlangt Pass oder Pro.'
  },
  translate: {
    seoTitle: 'PDF übersetzen und das Layout behalten | One2PDF',
    seoDescription: 'Übersetzen Sie den Text eines PDF und lassen Sie ihn in seinen Bereichen. Zwei Modi: Layout behalten oder nur den Text. Verbraucht KI-Guthaben.',
    seoH2: 'So übersetzen Sie ein PDF, ohne es neu zu setzen',
    seoP1: 'One2PDF übersetzt den Text und setzt ihn in die ursprünglichen Bereiche zurück. Bilder, Logos und Tabellen bleiben. Wählen Sie Ausgangssprache, Zielsprache und dann Layout behalten oder nur Text.',
    seoP2: 'Das Layout ist nicht pixelgenau: manche Sprachen werden länger oder kürzer. Die Schriftgröße passt sich im Rahmen an. Ein Scan mit wenig markierbarem Text durchläuft zuerst OCR.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das übersetzte PDF wird nach dem Download gelöscht. Die sprachliche Übersetzung nutzt einen KI-Anbieter nur, wenn Sie dieses Werkzeug starten. Es gilt 1 Guthaben pro behandelter Seite.',
    howTitle: 'Ein PDF übersetzen',
    howSteps: [
      'Das PDF hochladen',
      'Ausgangssprache, Zielsprache und Ausgabe wählen',
      'Das übersetzte PDF herunterladen'
    ],
    faqTitle: 'Fragen zum Übersetzen von PDF',
    faq: [
      {
        question: 'Bleibt das Layout gleich?',
        answer: 'Soweit möglich: Bilder, Logos und Textbereiche bleiben. Eine längere Übersetzung kann die Schrift im Kasten etwas verkleinern, aber nicht bis zur Unlesbarkeit.'
      },
      {
        question: 'Bekomme ich ein PDF oder eine Textdatei?',
        answer: 'Das Hauptergebnis ist ein übersetztes PDF. Zusätzlich gibt es eine .txt-Datei. Der Modus „nur Text“ erzeugt ein Inhalts-PDF ohne den ursprünglichen Seitenaufbau.'
      },
      {
        question: 'Funktionieren Scans?',
        answer: 'Ja. Wenn zu wenig Text markierbar ist, führt One2PDF zuerst OCR mit Tesseract aus und übersetzt danach die erkannten Blöcke.'
      }
    ]
  },
  sign: {
    seoTitle: 'PDF online unterschreiben | One2PDF',
    seoDescription: 'Setzen Sie Name, Datum und einen sichtbaren Stempel auf das PDF und laden Sie das unterschriebene Dokument herunter. Ohne Ausdruck.',
    seoH2: 'So unterschreiben Sie ein PDF im Browser',
    seoP1: 'Laden Sie die Datei hoch, geben Sie den Namen ein, wählen Sie die Position des Stempels und laden Sie das signierte Dokument herunter.',
    seoP2: 'Die Vorschau zeigt Name, Datum und Grund auf der letzten Seite oder auf allen Seiten, bevor Sie exportieren.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das signierte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  pageNumbers: {
    seoTitle: 'Seitenzahlen in ein PDF setzen | One2PDF',
    seoDescription: 'Setzen Sie 1, 1/12 oder Seite 1 auf jedes Blatt. Position wählen und das nummerierte PDF herunterladen.',
    seoH2: 'So nummerieren Sie ein PDF',
    seoP1: 'Wählen Sie das Format und die Position. Die Nummern werden auf einmal auf alle Seiten gesetzt.',
    seoP2: 'Die Vorschau zeigt die Zahl oben oder unten, links, mittig oder rechts, bevor Sie exportieren.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das nummerierte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  crop: {
    seoTitle: 'PDF zuschneiden | One2PDF',
    seoDescription: 'Schneiden Sie weiße Ränder oder Scan-Kanten auf allen Seiten gleichzeitig ab. Ohne Programm.',
    seoH2: 'So schneiden Sie ein PDF zu',
    seoP1: 'Legen Sie die Ränder fest. Derselbe Zuschnitt gilt für alle Seiten. Der helle Bereich bleibt, der abgedunkelte wird entfernt.',
    seoP2: 'Praktisch bei einem Handy-Scan mit zu viel Rand oder einem Beleg, der über das Blatt hinausragt.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das zugeschnittene PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  deletePages: {
    seoTitle: 'Seiten aus einem PDF löschen | One2PDF',
    seoDescription: 'Entfernen Sie ein Deckblatt, ein leeres Blatt oder überzählige Anlagen. Mindestens eine Seite muss im Dokument bleiben.',
    seoH2: 'So löschen Sie Seiten aus einem PDF',
    seoP1: 'Klicken Sie die Seiten an, die weg sollen, und exportieren Sie das kürzere Dokument. Mindestens eine Seite muss übrig bleiben.',
    seoP2: 'Die Vorschau zeigt jedes Blatt, bevor es entfernt wird. Nicht ausgewählte Seiten behalten Reihenfolge und Inhalt.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das bereinigte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.'
  },
  reorder: {
    seoTitle: 'PDF-Seiten neu sortieren | One2PDF',
    seoDescription: 'Ziehen Sie die Miniaturen in die richtige Reihenfolge und laden Sie das PDF herunter.',
    seoH2: 'So bringen Sie PDF-Seiten in die richtige Folge',
    seoP1: 'Ziehen Sie die Miniaturen und speichern Sie die neue Reihenfolge. Nur die Folge ändert sich, nicht der Inhalt der Seiten.',
    seoP2: 'Praktisch, wenn ein Deckblatt in der Mitte liegt oder ein Scan die Seiten durcheinandergebracht hat.',
    seoP3: 'Das Original wird nicht aufbewahrt. Das sortierte PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'Seiten neu anordnen',
    howSteps: [
      'Das PDF hochladen',
      'Die Miniaturen in die richtige Reihenfolge ziehen',
      'Das aktualisierte PDF herunterladen'
    ],
    faqTitle: 'Fragen zum Sortieren von PDF-Seiten',
    faq: [
      {
        question: 'Ändert das Umsortieren den Seiteninhalt?',
        answer: 'Nein. Nur die Reihenfolge ändert sich. Text, Bilder und Qualität bleiben.'
      },
      {
        question: 'Kann ich eine einzelne Seite verschieben?',
        answer: 'Ja. Ziehen Sie die Miniatur an die gewünschte Stelle und speichern Sie.'
      },
      {
        question: 'Wird die Datei gespeichert?',
        answer: 'Nein. Das Original wird nach der Verarbeitung gelöscht. Das Ergebnis verschwindet nach dem Download oder spätestens nach 15 Minuten.'
      }
    ]
  },
  toPng: {
    seoTitle: 'PDF in PNG umwandeln | One2PDF',
    seoDescription: 'Exportieren Sie jede PDF-Seite als scharfes PNG. Mehrere Seiten kommen in einem ZIP.',
    seoH2: 'So wird ein PDF zu PNG-Bildern',
    seoP1: 'Jede Seite wird ein PNG, geeignet für Web und Bildschirm. Mehrere Seiten werden in einem Archiv gebündelt.',
    seoP2: 'PNG hält flächige Grafiken schärfer als ein stark komprimiertes JPG.',
    seoP3: 'Das Ausgangs-PDF wird verarbeitet und danach gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'PDF in PNG umwandeln',
    howSteps: [
      'Das PDF hochladen',
      'Die Umwandlung starten',
      'Die PNG-Dateien herunterladen'
    ],
    faqTitle: 'Fragen zu PDF in PNG',
    faq: [
      {
        question: 'Bekomme ich eine Datei oder mehrere?',
        answer: 'Eine Seite wird ein PNG. Mehrere Seiten kommen zusammen in einem ZIP.'
      },
      {
        question: 'Wofür eignet sich PNG?',
        answer: 'Für scharfe Flächen, Text und Screenshots. Für Fotos ist JPG oft kleiner.'
      },
      {
        question: 'Wird das PDF gespeichert?',
        answer: 'Nein. Es wird nur für die Umwandlung verarbeitet und danach gelöscht.'
      }
    ]
  },
  toText: {
    seoTitle: 'Text aus einem PDF holen | One2PDF',
    seoDescription: 'Ziehen Sie den markierbaren Text eines PDF in eine .txt-Datei. Bei einem Scan zuerst OCR ausführen.',
    seoH2: 'So extrahieren Sie Text aus einem PDF',
    seoP1: 'Das Werkzeug liest die Textebene und speichert den Inhalt als .txt. Sie können ihn einfügen, durchsuchen oder umschreiben.',
    seoP2: 'Ein reiner Scan ohne Textebene liefert wenig. Führen Sie zuerst OCR aus, wenn der Text nur ein Bild ist.',
    seoP3: 'Das PDF wird nicht aufbewahrt. Die Textdatei wird nach dem Download gelöscht, wenn Sie sie nicht behalten. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'Text aus einem PDF extrahieren',
    howSteps: [
      'Das PDF mit markierbarem Text hochladen',
      'Die Extraktion starten',
      'Die .txt-Datei herunterladen'
    ],
    faqTitle: 'Fragen zur Textextraktion',
    faq: [
      {
        question: 'Funktioniert das bei einem Scan?',
        answer: 'Nur wenn der Text bereits markierbar ist. Sonst zuerst OCR nutzen.'
      },
      {
        question: 'Welches Format bekomme ich?',
        answer: 'Eine einfache .txt-Datei, ohne das ursprüngliche Layout.'
      },
      {
        question: 'Wird der Inhalt gespeichert?',
        answer: 'Nein. Die Verarbeitung ist vorübergehend. Laden Sie die Datei herunter, wenn Sie sie behalten möchten.'
      }
    ]
  },
  summarize: {
    seoTitle: 'PDF zusammenfassen | One2PDF',
    seoDescription: 'Holen Sie eine kurze, ausführliche oder stichpunktartige Zusammenfassung. Verbraucht KI-Guthaben: 1 Guthaben pro Seite.',
    seoH2: 'So fassen Sie ein PDF zusammen',
    seoP1: 'Wählen Sie den Stil und die Sprache der Zusammenfassung. Es gilt 1 KI-Guthaben pro Seite, höchstens 20 Guthaben pro Datei. Längere PDFs werden vor dem Modell gekürzt.',
    seoP2: 'Ein Scan braucht zuerst eine Textebene. Führen Sie OCR aus, wenn sich nichts markieren lässt.',
    seoP3: 'Das Original wird nicht aufbewahrt. Die Zusammenfassung können Sie kopieren oder als .txt herunterladen. Ein fehlgeschlagener Vorgang behält das Guthaben nicht.',
    howTitle: 'Ein PDF zusammenfassen',
    howSteps: [
      'Das PDF hochladen',
      'Stil und Sprache wählen',
      'Die Zusammenfassung kopieren oder herunterladen'
    ],
    faqTitle: 'Fragen zum Zusammenfassen von PDF',
    faq: [
      {
        question: 'Wie wird das KI-Guthaben berechnet?',
        answer: '1 Guthaben pro Seite, höchstens 20 Guthaben pro Datei. Längere Dokumente werden vor der Zusammenfassung gekürzt. Ein fehlgeschlagener Vorgang verbraucht das Guthaben nicht.'
      },
      {
        question: 'Welche Stile gibt es?',
        answer: 'Kurz, ausführlich oder Stichpunkte. Die Sprache der Zusammenfassung können Sie getrennt vom Dokument wählen.'
      },
      {
        question: 'Funktioniert das bei einem Scan?',
        answer: 'Nur mit Textebene. Führen Sie zuerst OCR aus, wenn das PDF nur ein Bild ist.'
      }
    ]
  },
  htmlPdf: {
    seoTitle: 'HTML in PDF umwandeln | One2PDF',
    seoDescription: 'Wandeln Sie eine HTML-Seite oder eingefügten Code in ein PDF um. Sehr dynamisches HTML wird schlechter abgebildet als einfaches HTML.',
    seoH2: 'So wird HTML zu einem PDF',
    seoP1: 'Laden Sie eine .html-Datei hoch oder fügen Sie den Code ein. Die Umwandlung läuft auf dem Server.',
    seoP2: 'Einfaches HTML wird gut dargestellt. Seiten mit viel JavaScript können unvollständig bleiben.',
    seoP3: 'Das HTML wird nicht aufbewahrt. Das PDF wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.',
    howTitle: 'HTML in PDF umwandeln',
    howSteps: [
      'Eine .html-Datei hochladen oder HTML einfügen',
      'Die Umwandlung starten',
      'Das PDF herunterladen'
    ],
    faqTitle: 'Fragen zu HTML in PDF',
    faq: [
      {
        question: 'Kann ich HTML ohne Datei einfügen?',
        answer: 'Ja. Fügen Sie den Code in das Feld ein und erzeugen Sie das PDF.'
      },
      {
        question: 'Werden komplexe Webseiten unterstützt?',
        answer: 'Einfaches HTML wird gut dargestellt. Seiten mit viel JavaScript können unvollständig bleiben.'
      },
      {
        question: 'Brauche ich ein Konto?',
        answer: 'Nein für die gelegentliche Nutzung. Datei und Ergebnis sind vorübergehend.'
      }
    ]
  }
} satisfies Record<string, PageSeoCopy>;

export const mergeSeoDe = {
  seoTitle: 'PDF zusammenfügen | One2PDF',
  seoDescription: 'Fügen Sie mehrere PDF in einem Dokument zusammen, in der Reihenfolge der Miniaturen. Ohne Programm.',
  seoH2: 'So fügen Sie mehrere PDF zu einer Datei zusammen',
  seoP1: 'Laden Sie mindestens zwei PDF hoch, ziehen Sie die Miniaturen in die richtige Folge und fügen Sie sie zusammen. In wenigen Sekunden liegt ein Dokument zum Download bereit.',
  seoP2: 'Die Seiten bleiben, wie sie sind, ohne Wasserzeichen. Seitenzahlen können Sie danach mit dem Nummerierungswerkzeug ergänzen.',
  seoP3: 'Die Originale werden nicht aufbewahrt. Das zusammengefügte PDF wird nach dem Download gelöscht. Ohne Download entfernt One2PDF es spätestens nach 15 Minuten. Für die gelegentliche Nutzung ist kein Konto nötig.',
  howTitle: 'PDF-Dateien zusammenfügen',
  howSteps: [
    'Die PDF auswählen, die Sie zusammenfügen möchten',
    'Sie in die nötige Reihenfolge bringen',
    'Das zusammengefügte PDF herunterladen'
  ],
  faqTitle: 'Fragen zum Zusammenfügen von PDF',
  faq: [
    {
      question: 'Wie viele PDF kann ich auf einmal zusammenfügen?',
      answer: 'Sie können mehrere PDF hinzufügen und sie über die Miniaturen sortieren. Der Gratisplan hat ein tägliches Dokumentenlimit und 20 MB pro Datei. Pro schaltet die Stapelverarbeitung und größere Dateien frei.'
    },
    {
      question: 'Brauche ich ein Konto, um PDF zusammenzufügen?',
      answer: 'Nein. Die kostenlose Nutzung verlangt weder Namen noch E-Mail. Werkzeug wählen, Dateien hochladen, Ergebnis herunterladen.'
    },
    {
      question: 'Werden die Original-PDF gespeichert?',
      answer: 'Nein. Die Originale werden am Ende gelöscht. Die zusammengefügte Datei verschwindet nach dem Download oder spätestens nach 15 Minuten, wenn Sie sie nicht herunterladen.'
    }
  ]
} satisfies PageSeoCopy;

export const splitSeoDe = {
  seoTitle: 'PDF teilen | One2PDF',
  seoDescription: 'Extrahieren Sie Seiten oder trennen Sie jedes Blatt in ein eigenes PDF, gebündelt in einem ZIP. Ohne Programm.',
  seoH2: 'So teilen Sie ein PDF',
  seoP1: 'Laden Sie die Datei hoch und wählen Sie die Seiten per Klick oder mit einem Bereich wie 1-3, 5, 8. Danach starten Sie den Vorgang.',
  seoP2: 'Extrahieren fasst die gewählten Seiten in einem kürzeren PDF. Trennen exportiert jede Seite als eigene Datei in einem ZIP.',
  seoP3: 'Das Original wird nicht aufbewahrt. Das Ergebnis wird nach dem Download gelöscht. Für die gelegentliche Nutzung ist kein Konto nötig.',
  howTitle: 'Ein PDF teilen',
  howSteps: [
    'Das PDF hochladen',
    'Die Seiten zum Extrahieren oder Trennen auswählen',
    'Das Ergebnis herunterladen'
  ],
  faqTitle: 'Fragen zum Teilen von PDF',
  faq: [
    {
      question: 'Kann ich ein PDF in mehrere Dateien teilen?',
      answer: 'Ja. Trennen exportiert jede Seite als eigenes PDF in einem ZIP. Wenn Sie einige Seiten in einem Dokument behalten möchten, nutzen Sie Extrahieren.'
    },
    {
      question: 'Ist das Teilen kostenlos?',
      answer: 'Ja, ohne Konto für die gelegentliche Nutzung. Der Gratisplan erlaubt 5 Dokumente pro Tag und Dateien bis 20 MB.'
    },
    {
      question: 'Wird das Original gespeichert?',
      answer: 'Nein. Es wird nach der Verarbeitung gelöscht. Das Ergebnis verschwindet nach dem Download oder spätestens nach 15 Minuten.'
    }
  ]
} satisfies PageSeoCopy;

export const compressSeoDe = {
  seoTitle: 'PDF komprimieren | One2PDF',
  seoDescription: 'Verkleinern Sie ein zu großes PDF und laden Sie eine leichtere, weiterhin lesbare Datei herunter. Ohne Programm.',
  seoH2: 'So komprimieren Sie ein PDF',
  seoP1: 'Laden Sie die Datei hoch, wählen Sie eine Stufe (hoch, mittel oder stark) und starten Sie die Komprimierung. In wenigen Sekunden liegt ein kleineres PDF zum Download bereit.',
  seoP2: 'Hoch behält den Text. Mittel und stark verkleinern Bilder stärker: der Text ist danach nicht mehr markierbar, weil die Seiten zu Bildern werden. Nützlich, wenn Gmail, Outlook oder ein Formular einen Anhang ablehnen.',
  seoP3: 'Das Original wird nicht aufbewahrt. Das Ergebnis wird heruntergeladen und danach gelöscht. Ohne Download entfernt One2PDF es spätestens nach 15 Minuten. Für die gelegentliche Nutzung ist kein Konto nötig.',
  howTitle: 'Ein PDF komprimieren',
  howSteps: [
    'Das zu schwere PDF hochladen',
    'Eine Komprimierungsstufe wählen',
    'Die leichtere Datei herunterladen'
  ],
  faqTitle: 'Fragen zum Komprimieren von PDF',
  faq: [
    {
      question: 'Wie komprimiere ich ein PDF, das für die E-Mail zu groß ist?',
      answer: 'Gmail und Outlook lehnen Anhänge über 25 MB oft ab. Laden Sie das PDF in One2PDF hoch, wählen Sie eine Stufe (hoch, mittel oder stark) und komprimieren Sie. Die leichtere Datei bleibt lesbar und passt in der Regel unter das Versandlimit.'
    },
    {
      question: 'Verschlechtert das Komprimieren die Qualität?',
      answer: 'Hoch hält Text und Bilder möglichst nah am Original. Mittel und stark verkleinern Bilder stärker und können Fotos oder Scans etwas weicher machen. Der Text bleibt lesbar. Nutzen Sie Hoch für einen Lebenslauf oder Vertrag und eine stärkere Stufe, wenn ein striktes Größenlimit gilt.'
    },
    {
      question: 'Behält One2PDF meine Datei nach dem Komprimieren?',
      answer: 'Nein. Das PDF wird nur für den Vorgang verarbeitet. Das Original wird gelöscht; das Ergebnis kann einmal heruntergeladen werden und wird danach entfernt. Nicht heruntergeladene Dateien verschwinden spätestens nach 15 Minuten. Für die gelegentliche Nutzung ist kein Konto nötig.'
    }
  ]
} satisfies PageSeoCopy;
