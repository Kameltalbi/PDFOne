import type { PageSeoCopy } from '../types';

/** Spanish SEO copy. Not wired into sitemap, hreflang or prerender. */
export const seoEs = {
  wordToPdf: {
    seoTitle: 'Convertir Word a PDF en línea | One2PDF',
    seoDescription: 'Pase un archivo Word (.doc, .docx) a PDF en el navegador, sin instalar Microsoft Word. El documento queda listo para enviar.',
    seoH2: 'Cómo convertir Word a PDF sin instalar nada',
    seoP1: 'Un CV, un contrato o un informe se abre igual en cualquier equipo si va en PDF. En One2PDF importe un .doc, .docx, .odt o .rtf, inicie la conversión y descargue el PDF.',
    seoP2: 'El resultado conserva la maquetación, las fuentes y las imágenes lo bastante como para leerlo en pantalla o imprimirlo. Sirve para un correo, una candidatura o un trámite que pide PDF.',
    seoP3: 'El archivo original no se conserva. El PDF se descarga y después se borra. Si no lo descarga, se elimina solo en un plazo máximo de 15 minutos. El uso ocasional no exige cuenta.',
    howTitle: 'Cómo convertir Word a PDF',
    howSteps: [
      'Suba su archivo Word (.doc, .docx, .odt o .rtf)',
      'Inicie la conversión en el navegador',
      'Descargue el PDF'
    ],
    faqTitle: 'Preguntas frecuentes sobre Word a PDF',
    faq: [
      {
        question: '¿Hace falta tener Microsoft Word instalado?',
        answer: 'No. One2PDF convierte .doc, .docx, .odt y .rtf en el navegador. No necesita Word en el ordenador.'
      },
      {
        question: '¿Convertir Word a PDF es gratis?',
        answer: 'Sí, sin crear una cuenta. El plan gratuito permite 5 documentos al día y archivos de hasta 20 MB. Pass y Pro: sin límite diario de procesos; tamaño máximo: 100 MB.'
      },
      {
        question: '¿One2PDF guarda mi archivo Word?',
        answer: 'No. El original se elimina al terminar el proceso. El PDF se puede descargar una vez y luego se borra. Si no lo descarga, se elimina solo en un plazo máximo de 15 minutos.'
      }
    ]
  },
  pdfToWord: {
    seoTitle: 'Convertir PDF a Word editable | One2PDF',
    seoDescription: 'Pase un PDF a un documento Word que pueda corregir. La conversión se hace en línea, sin instalar Microsoft Word.',
    seoH2: 'Cómo pasar un PDF a Word para editarlo',
    seoP1: 'Si el texto está encerrado en un PDF, One2PDF lo convierte a DOC o DOCX. Importe el archivo, inicie la conversión y abra el resultado en Word.',
    seoP2: 'La herramienta reconstruye el texto y una maquetación utilizable para corregir, comentar o copiar pasajes. Un escaneo que solo es una imagen puede necesitar OCR antes.',
    seoP3: 'El PDF original no se conserva. El archivo Word queda disponible para descargarlo y después se borra. El uso ocasional no pide nombre ni correo.',
    howTitle: 'Cómo convertir un PDF a Word',
    howSteps: [
      'Suba el PDF que quiere editar',
      'Inicie la conversión',
      'Descargue el archivo Word y ábralo'
    ],
    faqTitle: 'Preguntas frecuentes sobre PDF a Word',
    faq: [
      {
        question: '¿El archivo Word se puede editar?',
        answer: 'Sí. La conversión reconstruye el texto y una maquetación utilizable. Si el PDF es solo una imagen, pase antes por OCR.'
      },
      {
        question: '¿Hace falta una cuenta para convertir PDF a Word?',
        answer: 'No. El uso gratuito no pide nombre ni correo. La cuenta Pro es solo para quien paga, con correo y contraseña.'
      },
      {
        question: '¿Los archivos se guardan después de la conversión?',
        answer: 'No. El PDF original se elimina al terminar. El Word se borra tras la descarga, o solo en un plazo máximo de 15 minutos si no lo descarga.'
      }
    ]
  },
  excelToPdf: {
    seoTitle: 'Convertir Excel a PDF en línea | One2PDF',
    seoDescription: 'Fije un libro de Excel en un PDF estable para enviarlo sin que nadie cambie las celdas. Sin instalar Microsoft Excel.',
    seoH2: 'Cómo convertir Excel a PDF',
    seoP1: 'Importe un .xls, .xlsx, .ods o .csv. One2PDF genera un PDF listo para un presupuesto, un informe o un archivo contable.',
    seoP2: 'Columnas, totales y disposición quedan fijados para leerlos en pantalla o en papel, sin depender de Excel en el otro extremo.',
    seoP3: 'El libro original no se conserva. El PDF se descarga y luego se borra. Si no lo descarga, se elimina solo en 15 minutos como máximo. El uso ocasional no exige cuenta.'
  },
  pptToPdf: {
    seoTitle: 'Convertir PowerPoint a PDF | One2PDF',
    seoDescription: 'Pase una presentación PowerPoint a PDF para enviarla o archivarla sin que el destinatario tenga PowerPoint.',
    seoH2: 'Cómo convertir PowerPoint a PDF',
    seoP1: 'Importe un .ppt, .pptx o .odp. La conversión mantiene el orden de las diapositivas en un PDF que se puede proyectar, imprimir o guardar.',
    seoP2: 'Sirve para un correo, un material de formación o un dossier que debe abrirse igual en cualquier equipo.',
    seoP3: 'La presentación original no se conserva. El PDF queda un momento para descargarlo y después se borra. El uso ocasional no pide cuenta.'
  },
  protect: {
    seoTitle: 'Proteger un PDF con contraseña | One2PDF',
    seoDescription: 'Cifre un PDF para que solo se abra con la contraseña que usted elija. El proceso se hace en el navegador.',
    seoH2: 'Cómo proteger un PDF con contraseña',
    seoP1: 'Importe el archivo, escriba una contraseña, confírmela y descargue el PDF bloqueado. Quien no la conozca no puede abrirlo.',
    seoP2: 'El contenido no cambia para quien tiene la clave. Sirve para un contrato, una nómina o un documento que no debe abrirse sin control.',
    seoP3: 'El original no se conserva. El PDF protegido se descarga y después se borra. Guarde la contraseña: One2PDF no la recupera por usted. El uso ocasional no exige cuenta.'
  },
  toJpg: {
    seoTitle: 'Convertir PDF a JPG en línea | One2PDF',
    seoDescription: 'Exporte cada página de un PDF como imagen JPG. Si hay varias, se entregan juntas en un ZIP.',
    seoH2: 'Cómo convertir un PDF a JPG',
    seoP1: 'Importe el PDF e inicie la conversión. Cada página pasa a ser un JPG, útil para un chat, una web o una galería.',
    seoP2: 'Varias páginas se agrupan en un ZIP. Una sola página se descarga como imagen.',
    seoP3: 'El PDF de origen no se conserva. Las imágenes se descargan y después se borran. El uso ocasional no pide cuenta.'
  },
  jpgToPdf: {
    seoTitle: 'Convertir JPG a PDF en línea | One2PDF',
    seoDescription: 'Reúna fotos JPG, PNG o WebP en un solo PDF, en el orden de las miniaturas. Sin instalar un programa.',
    seoH2: 'Cómo convertir imágenes JPG a PDF',
    seoP1: 'Importe JPG, PNG o WebP, arrastre las miniaturas para fijar el orden y cree un documento listo para enviar.',
    seoP2: 'Cada imagen ocupa una página. Sirve para un escaneo del teléfono, capturas o un expediente de fotos.',
    seoP3: 'Las imágenes no se conservan. El PDF se descarga y después se borra, o solo en 15 minutos si no lo descarga. El uso ocasional no exige cuenta.',
    howTitle: 'Cómo convertir JPG a PDF',
    howSteps: [
      'Suba sus imágenes JPG, PNG o WebP',
      'Reordene las miniaturas si hace falta',
      'Descargue el PDF'
    ],
    faqTitle: 'Preguntas frecuentes sobre JPG a PDF',
    faq: [
      {
        question: '¿Puedo unir varias imágenes en un solo PDF?',
        answer: 'Sí. Importe JPG, PNG o WebP, arrastre las miniaturas al orden que quiera y cree un PDF.'
      },
      {
        question: '¿Hay que instalar un programa?',
        answer: 'No. La conversión se hace en el navegador.'
      },
      {
        question: '¿One2PDF guarda mis fotos?',
        answer: 'No. Se procesan de forma temporal. Los originales se eliminan al terminar. El PDF se borra tras la descarga, o en 15 minutos si no lo descarga.'
      }
    ]
  },
  edit: {
    seoTitle: 'Editar un PDF en línea | One2PDF',
    seoDescription: 'Añada texto, un dibujo, una imagen o una firma sobre el PDF y exporte el documento. Sin Adobe Acrobat.',
    seoH2: 'Cómo editar un PDF en el navegador',
    seoP1: 'Importe el archivo, coloque texto, dibuje, inserte una imagen o una firma y exporte. La vista previa muestra cada cambio antes de descargar.',
    seoP2: 'Sirve para anotar un contrato, corregir una línea o firmar a mano sin volver a imprimir.',
    seoP3: 'El original no se conserva. El PDF editado se descarga y después se borra. El uso ocasional no exige cuenta.'
  },
  rotate: {
    seoTitle: 'Girar PDF en línea gratis | One2PDF',
    seoDescription: 'Enderece una página al revés o un escaneo de lado. Gire una página o todas, de 90° en 90°, y descargue el PDF.',
    seoH2: 'Cómo girar las páginas de un PDF',
    seoP1: 'Importe el archivo y gire la página que lo necesite, o todas, a la izquierda o a la derecha. La vista previa muestra la nueva orientación antes de exportar.',
    seoP2: 'El giro queda guardado en el PDF descargado. El archivo original de su equipo no se modifica.',
    seoP3: 'El original enviado no se conserva. El PDF corregido se descarga y después se borra. El uso ocasional no pide cuenta.',
    howTitle: 'Cómo girar un PDF',
    howSteps: [
      'Suba su PDF',
      'Gire las páginas que lo necesiten',
      'Descargue el PDF corregido'
    ],
    faqTitle: 'Preguntas frecuentes sobre girar un PDF',
    faq: [
      {
        question: '¿Puedo girar solo una página?',
        answer: 'Sí. Seleccione la página y gírela 90° a la izquierda o a la derecha. Las demás no cambian, salvo que gire todas.'
      },
      {
        question: '¿El giro queda guardado en el archivo?',
        answer: 'Sí. El PDF descargado conserva la nueva orientación. El original no se almacena.'
      },
      {
        question: '¿Girar un PDF es gratis?',
        answer: 'Sí, sin crear una cuenta. El plan gratuito permite 5 documentos al día y archivos de hasta 20 MB. Pass y Pro: sin límite diario de procesos; tamaño máximo: 100 MB.'
      }
    ]
  },
  watermark: {
    seoTitle: 'Poner una marca de agua en un PDF | One2PDF',
    seoDescription: 'Marque todas las páginas con un texto como Confidencial o Borrador. Ajuste la opacidad y descargue el PDF.',
    seoH2: 'Cómo añadir una marca de agua a un PDF',
    seoP1: 'Importe el archivo, escriba el texto, elija la opacidad y aplíquelo en todas las páginas. La vista previa muestra el resultado antes de exportar.',
    seoP2: 'Puede ir en diagonal o repetido. Lo bastante visible para identificar el documento y lo bastante claro para seguir leyéndolo.',
    seoP3: 'El original no se conserva. El PDF con la marca se descarga y después se borra. El uso ocasional no exige cuenta.'
  },
  pdfToExcel: {
    seoTitle: 'Convertir PDF a Excel | One2PDF',
    seoDescription: 'Pase tablas de un PDF a un libro de Excel para filtrar o recalcular. Sin instalar Microsoft Excel.',
    seoH2: 'Cómo convertir un PDF a Excel',
    seoP1: 'Importe el PDF e inicie la conversión. El resultado es un libro con columnas y filas, en la medida en que la maquetación lo permite.',
    seoP2: 'Sirve para un presupuesto, un informe o cifras que quiere reutilizar. No reescribe cada celda a mano.',
    seoP3: 'El PDF original no se conserva. El Excel se descarga y después se borra. El uso ocasional no pide cuenta.'
  },
  pdfToPpt: {
    seoTitle: 'Convertir PDF a PowerPoint | One2PDF',
    seoDescription: 'Pase cada página de un PDF a una diapositiva PowerPoint. Sin instalar Microsoft PowerPoint.',
    seoH2: 'Cómo convertir un PDF a PowerPoint',
    seoP1: 'Importe el PDF. Cada página se convierte en una diapositiva de un PPTX, más fácil de anotar o proyectar.',
    seoP2: 'Sirve para recuperar un dossier, un curso o una presentación que solo tenía en PDF.',
    seoP3: 'El PDF original no se conserva. El PowerPoint se descarga y después se borra. El uso ocasional no exige cuenta.'
  },
  unlock: {
    seoTitle: 'Desbloquear un PDF | One2PDF',
    seoDescription: 'Quite la contraseña de apertura de un PDF si usted ya la conoce. No abre archivos cuya clave desconoce.',
    seoH2: 'Cómo quitar la contraseña de un PDF',
    seoP1: 'Importe un PDF del que conoce la contraseña, escríbala y descargue una copia que se abre sin pedirla.',
    seoP2: 'La herramienta no omite una contraseña desconocida. Solo usa la que usted indica para generar el PDF desbloqueado.',
    seoP3: 'El original no se conserva. El PDF desbloqueado se descarga y después se borra. El uso ocasional no pide cuenta.'
  },
  ocr: {
    seoTitle: 'OCR de un PDF escaneado | One2PDF',
    seoDescription: 'Reconozca el texto de un escaneo y descargue un PDF seleccionable. El OCR está en el Pass de 7 días o en Pro.',
    seoH2: 'Cómo hacer OCR de un PDF escaneado',
    seoP1: 'Importe el escaneo e inicie el reconocimiento. El PDF resultante permite seleccionar y buscar el texto. El OCR usa Tesseract y está disponible con el Pass de 7 días o Pro.',
    seoP2: 'La calidad depende de la nitidez del escaneo. Después puede extraer el texto, traducirlo o resumirlo.',
    seoP3: 'El original no se conserva. El PDF con OCR se descarga y después se borra. No hace falta instalar un programa.'
  },
  translate: {
    seoTitle: 'Traducir un PDF y conservar el diseño | One2PDF',
    seoDescription: 'Traduzca el texto de un PDF y déjelo en sus zonas. Dos modos: conservar el diseño o solo el texto. Usa créditos de IA.',
    seoH2: 'Cómo traducir un PDF en línea',
    seoP1: 'Elija el idioma de origen (o detección automática), el idioma de destino y el modo: conservar el diseño o solo el texto. Imágenes, logotipos y tablas se mantienen en el modo de diseño.',
    seoP2: 'El diseño no será idéntico al píxel: unos idiomas ocupan más y otros menos. Un escaneo con poco texto seleccionable pasa antes por OCR.',
    seoP3: 'El original no se conserva. El PDF traducido se descarga y después se borra. La traducción lingüística usa un proveedor de IA solo si ejecuta esta herramienta.',
    howTitle: 'Cómo traducir un PDF',
    howSteps: [
      'Importe el PDF que quiere traducir',
      'Elija el idioma de origen, el de destino y el modo de salida',
      'Descargue el PDF traducido'
    ],
    faqTitle: 'Preguntas frecuentes sobre traducir un PDF',
    faq: [
      {
        question: '¿El diseño queda idéntico?',
        answer: 'Se conserva en lo posible: imágenes, logotipos y zonas de texto siguen. Si la traducción es más larga, la fuente puede reducirse un poco dentro de su caja, sin llegar a un tamaño ilegible.'
      },
      {
        question: '¿Recibo un PDF o un archivo de texto?',
        answer: 'El resultado principal es un PDF traducido. También se ofrece un .txt. El modo solo texto produce un PDF de contenido sin reconstruir el diseño de la página.'
      },
      {
        question: '¿Funciona con escaneos?',
        answer: 'Sí. Si hay poco texto seleccionable, One2PDF hace OCR y después traduce los bloques detectados.'
      }
    ]
  },
  sign: {
    seoTitle: 'Firmar un PDF en línea | One2PDF',
    seoDescription: 'Añada su nombre, la fecha y un sello visible al PDF, y descargue el documento firmado. Sin imprimir.',
    seoH2: 'Cómo firmar un PDF en el navegador',
    seoP1: 'Importe el archivo, escriba su nombre, elija la posición del sello y descargue el PDF. Puede ir en la última página o en todas.',
    seoP2: 'La vista previa muestra el sello (nombre, fecha y motivo si lo indica) antes de exportar.',
    seoP3: 'El original no se conserva. El PDF firmado se descarga y después se borra. El uso ocasional no exige cuenta.'
  },
  pageNumbers: {
    seoTitle: 'Numerar las páginas de un PDF | One2PDF',
    seoDescription: 'Añada 1, 1/12 o Página 1 en cada hoja. Elija la posición y descargue el PDF numerado.',
    seoH2: 'Cómo numerar las páginas de un PDF',
    seoP1: 'Importe el archivo, elija el formato y la posición (arriba o abajo, izquierda, centro o derecha) y aplique los números en todas las páginas.',
    seoP2: 'La vista previa muestra el número antes de exportar. El resto del documento no se recompone.',
    seoP3: 'El original no se conserva. El PDF numerado se descarga y después se borra. El uso ocasional no pide cuenta.'
  },
  crop: {
    seoTitle: 'Recortar un PDF en línea | One2PDF',
    seoDescription: 'Corte márgenes blancos o bordes de un escaneo en todas las páginas a la vez. Sin instalar un programa.',
    seoH2: 'Cómo recortar un PDF',
    seoP1: 'Importe el archivo, indique los márgenes (iguales o por lado) y aplique el recorte a todas las páginas.',
    seoP2: 'La zona clara se conserva y los bordes oscurecidos se cortan. El contenido que queda sigue siendo legible.',
    seoP3: 'El original no se conserva. El PDF recortado se descarga y después se borra. El uso ocasional no exige cuenta.'
  },
  deletePages: {
    seoTitle: 'Eliminar páginas de un PDF | One2PDF',
    seoDescription: 'Quite una portada, una hoja en blanco o anexos de más. Debe quedar al menos una página en el documento.',
    seoH2: 'Cómo eliminar páginas de un PDF',
    seoP1: 'Importe el archivo, haga clic en las páginas que quiere quitar y exporte el documento más corto. La vista previa muestra cada hoja antes de borrar.',
    seoP2: 'Las páginas que no selecciona conservan su orden y su contenido. No hace falta reconstruir el archivo.',
    seoP3: 'El original no se conserva. El PDF resultante se descarga y después se borra. El uso ocasional no pide cuenta.'
  },
  reorder: {
    seoTitle: 'Reordenar páginas de un PDF | One2PDF',
    seoDescription: 'Arrastre las miniaturas para dejar las páginas en el orden correcto y descargue el PDF.',
    seoH2: 'Cómo reordenar las páginas de un PDF',
    seoP1: 'Importe el archivo, arrastre las miniaturas y descargue el documento en el orden que elija. Solo cambia el orden: el texto y las imágenes siguen igual.',
    seoP2: 'Sirve cuando una portada quedó en medio o un escaneo salió desordenado.',
    seoP3: 'El original no se conserva. El PDF reordenado se descarga y después se borra. El uso ocasional no exige cuenta.',
    howTitle: 'Cómo reordenar un PDF',
    howSteps: [
      'Suba el PDF que quiere reordenar',
      'Arrastre las miniaturas al orden correcto',
      'Descargue el PDF actualizado'
    ],
    faqTitle: 'Preguntas frecuentes sobre reordenar un PDF',
    faq: [
      {
        question: '¿Reordenar cambia el contenido de las páginas?',
        answer: 'No. Solo cambia el orden. El texto, las imágenes y la calidad se mantienen.'
      },
      {
        question: '¿Hace falta una cuenta?',
        answer: 'No. El uso ocasional no exige registrarse.'
      },
      {
        question: '¿Se guardan los archivos?',
        answer: 'No. El original se elimina al terminar. El resultado se borra tras la descarga, o en 15 minutos si no lo descarga.'
      }
    ]
  },
  toPng: {
    seoTitle: 'Convertir PDF a PNG en línea | One2PDF',
    seoDescription: 'Exporte cada página de un PDF como PNG nítido. Varias páginas se entregan en un ZIP.',
    seoH2: 'Cómo convertir un PDF a PNG',
    seoP1: 'Importe el PDF. Cada página se convierte en un PNG, útil para gráficos, colores planos o una página que quiere publicar.',
    seoP2: 'El PNG aguanta mejor que el JPG las zonas planas. Si hay varias páginas, van juntas en un ZIP.',
    seoP3: 'El PDF de origen no se conserva. Las imágenes se descargan y después se borran. El uso ocasional no pide cuenta.',
    howTitle: 'Cómo convertir un PDF a PNG',
    howSteps: [
      'Suba el PDF que quiere convertir',
      'Inicie la exportación a PNG',
      'Descargue la imagen o el ZIP'
    ],
    faqTitle: 'Preguntas frecuentes sobre PDF a PNG',
    faq: [
      {
        question: '¿En qué se diferencia el PNG del JPG?',
        answer: 'El PNG conviene más a gráficos, logotipos y colores planos. El JPG suele pesar menos en fotos.'
      },
      {
        question: '¿Varias páginas generan varios archivos?',
        answer: 'Sí. Cada página es un PNG. Si hay varias, se agrupan en un ZIP.'
      },
      {
        question: '¿Hay que instalar un programa?',
        answer: 'No. La conversión se hace en el navegador.'
      }
    ]
  },
  toText: {
    seoTitle: 'Extraer el texto de un PDF | One2PDF',
    seoDescription: 'Saque el texto seleccionable de un PDF a un archivo .txt. Si el PDF es un escaneo, haga antes el OCR.',
    seoH2: 'Cómo extraer el texto de un PDF',
    seoP1: 'Importe un PDF que ya tenga capa de texto e inicie la extracción. Descargue un .txt listo para pegar o archivar.',
    seoP2: 'En un escaneo que solo es imagen, use primero la herramienta OCR. Esta extracción lee el texto que ya existe en el archivo.',
    seoP3: 'El PDF original no se conserva. El .txt se descarga y después se borra. El uso ocasional no exige cuenta.',
    howTitle: 'Cómo extraer texto de un PDF',
    howSteps: [
      'Suba un PDF que contenga texto',
      'Inicie la extracción',
      'Descargue el archivo .txt'
    ],
    faqTitle: 'Preguntas frecuentes sobre PDF a texto',
    faq: [
      {
        question: '¿Funciona con un escaneo?',
        answer: 'Un escaneo de imagen necesita primero la herramienta OCR para crear una capa de texto.'
      },
      {
        question: '¿Qué formato obtengo?',
        answer: 'Un archivo de texto (.txt) con el contenido seleccionable del PDF.'
      },
      {
        question: '¿Se almacenan los archivos?',
        answer: 'No. El PDF y el resultado se procesan de forma temporal y luego se eliminan.'
      }
    ]
  },
  summarize: {
    seoTitle: 'Resumir un PDF en línea | One2PDF',
    seoDescription: 'Obtenga un resumen rápido, detallado o por puntos clave. Usa créditos de IA: 1 crédito por página.',
    seoH2: 'Cómo resumir un PDF',
    seoP1: 'Importe el archivo, elija el modo (rápido, detallado o puntos clave) y el idioma del resumen. Puede copiarlo o descargarlo.',
    seoP2: 'El resumen usa el texto del documento. En un escaneo, haga antes el OCR. Cada página consume 1 crédito de IA, con un máximo de 20 créditos por archivo.',
    seoP3: 'El original no se conserva. El resumen se descarga y después se borra, o solo en 15 minutos si no lo descarga.',
    howTitle: 'Cómo resumir un PDF',
    howSteps: [
      'Suba el PDF que quiere resumir',
      'Elija el modo y el idioma',
      'Copie o descargue el resumen'
    ],
    faqTitle: 'Preguntas frecuentes sobre resumir un PDF',
    faq: [
      {
        question: '¿Qué modos de resumen hay?',
        answer: 'Rápido (visión breve), Detallado (estructurado) y Puntos clave (lista).'
      },
      {
        question: '¿Funciona con un PDF escaneado?',
        answer: 'El resumen necesita texto. En un escaneo, use primero la herramienta OCR.'
      },
      {
        question: '¿Se guarda el resumen?',
        answer: 'No. El PDF y el resumen se procesan de forma temporal y se eliminan tras la descarga, o solos en 15 minutos.'
      }
    ]
  },
  htmlPdf: {
    seoTitle: 'Convertir HTML a PDF en línea | One2PDF',
    seoDescription: 'Pase una página HTML o un código pegado a PDF. El HTML muy dinámico se reproduce peor que el HTML simple.',
    seoH2: 'Cómo convertir HTML a PDF',
    seoP1: 'Importe un archivo .html o pegue el código, y descargue un PDF. La conversión se hace en el servidor.',
    seoP2: 'El HTML sencillo se representa bien. Las páginas con mucho JavaScript pueden salir incompletas.',
    seoP3: 'El HTML no se conserva. El PDF se descarga y después se borra. El uso ocasional no exige cuenta.',
    howTitle: 'Cómo convertir HTML a PDF',
    howSteps: [
      'Suba un archivo .html o pegue el HTML',
      'Inicie la conversión',
      'Descargue el PDF'
    ],
    faqTitle: 'Preguntas frecuentes sobre HTML a PDF',
    faq: [
      {
        question: '¿Puedo pegar HTML sin un archivo?',
        answer: 'Sí. Pegue el código en el cuadro y cree el PDF.'
      },
      {
        question: '¿Se admiten páginas web complejas?',
        answer: 'El HTML sencillo se representa bien. Las páginas con mucho JavaScript pueden quedar incompletas.'
      },
      {
        question: '¿Hace falta una cuenta?',
        answer: 'No para un uso ocasional. El archivo y el resultado son temporales.'
      }
    ]
  }
} satisfies Record<string, PageSeoCopy>;

export const mergeSeoEs = {
  seoTitle: 'Unir PDF en línea gratis | One2PDF',
  seoDescription: 'Junte varios PDF en un solo documento, en el orden de las miniaturas. Sin instalar un programa.',
  seoH2: 'Cómo unir varios PDF en un solo archivo',
  seoP1: 'Importe al menos dos PDF, arrastre las miniaturas para fijar el orden y únalos. En unos segundos tiene un solo documento para descargar.',
  seoP2: 'Las páginas se conservan tal cual, sin marca de agua. Si lo necesita, puede numerarlas después con la herramienta de números de página.',
  seoP3: 'Los originales no se conservan. El PDF unido se descarga y después se borra. Si no lo descarga, se elimina solo en 15 minutos como máximo. El uso ocasional no exige cuenta.',
  howTitle: 'Cómo unir archivos PDF',
  howSteps: [
    'Elija los PDF que quiere unir',
    'Póngalos en el orden que necesite',
    'Descargue el PDF unido'
  ],
  faqTitle: 'Preguntas frecuentes sobre unir PDF',
  faq: [
    {
      question: '¿Cuántos PDF puedo unir a la vez?',
      answer: 'Puede añadir varios PDF y reordenarlos con las miniaturas. El plan gratuito tiene un límite diario de documentos y un tope de 20 MB por archivo. Pro desbloquea el procesamiento por lotes y archivos más grandes.'
    },
    {
      question: '¿Hace falta una cuenta para unir PDF?',
      answer: 'No. El uso gratuito no pide nombre ni correo. Elija la herramienta, suba los archivos y descargue el resultado.'
    },
    {
      question: '¿Se guardan los PDF originales?',
      answer: 'No. Los originales se eliminan al terminar. El archivo unido se borra tras la descarga, o solo en 15 minutos si no lo descarga.'
    }
  ]
} satisfies PageSeoCopy;

export const splitSeoEs = {
  seoTitle: 'Dividir PDF en línea gratis | One2PDF',
  seoDescription: 'Extraiga páginas o separe cada hoja en su propio PDF, dentro de un ZIP. Sin instalar un programa.',
  seoH2: 'Cómo dividir un PDF',
  seoP1: 'Importe el archivo y elija las páginas con un clic o con un rango como 1-3, 5, 8. Después inicie la operación.',
  seoP2: 'Extraer reúne las páginas elegidas en un PDF más corto. Separar exporta cada página como archivo propio, en un ZIP.',
  seoP3: 'El original no se conserva. El resultado se descarga y después se borra. El uso ocasional no exige cuenta.',
  howTitle: 'Cómo dividir un PDF',
  howSteps: [
    'Suba el PDF',
    'Seleccione las páginas para extraer o separar',
    'Descargue el resultado'
  ],
  faqTitle: 'Preguntas frecuentes sobre dividir un PDF',
  faq: [
    {
      question: '¿Puedo dividir un PDF en varios archivos?',
      answer: 'Sí. Separar exporta cada página como PDF propio, en un ZIP. Para quedarse con unas páginas en un solo documento, use Extraer.'
    },
    {
      question: '¿Dividir un PDF es gratis?',
      answer: 'Sí, sin crear una cuenta. El plan gratuito está limitado a 5 documentos al día y 20 MB por archivo. Traducir y resumir usan créditos de IA mensuales. El OCR está en los planes de pago.'
    },
    {
      question: '¿One2PDF guarda el original después de dividir?',
      answer: 'No. El original se elimina al terminar. El resultado se borra tras la descarga, o en 15 minutos si no lo descarga.'
    }
  ]
} satisfies PageSeoCopy;

export const compressSeoEs = {
  seoTitle: 'Comprimir PDF en línea gratis | One2PDF',
  seoDescription: 'Reduzca el peso de un PDF demasiado grande y descargue un archivo más ligero, todavía legible. Sin instalar un programa.',
  seoH2: 'Cómo comprimir un PDF',
  seoP1: 'Importe el archivo, elija un nivel (alta, media o fuerte) y comprima. En unos segundos obtiene un PDF más pequeño, listo para descargar.',
  seoP2: 'Alta conserva el texto. Media y fuerte reducen más las imágenes: el texto deja de ser seleccionable porque las páginas pasan a imagen. Útil cuando Gmail, Outlook o un formulario rechazan un adjunto de más de 25 MB.',
  seoP3: 'El original no se conserva. El resultado se descarga y después se borra. Si no lo descarga, se elimina solo en 15 minutos como máximo. El uso ocasional no exige cuenta.',
  howTitle: 'Cómo comprimir un PDF',
  howSteps: [
    'Suba el PDF que pesa demasiado',
    'Elija un nivel de compresión',
    'Descargue el archivo más ligero'
  ],
  faqTitle: 'Preguntas frecuentes sobre comprimir un PDF',
  faq: [
    {
      question: '¿Cómo comprimir un PDF demasiado grande para el correo?',
      answer: 'Gmail y Outlook suelen rechazar adjuntos de más de 25 MB. En One2PDF, importe el PDF, elija un nivel (alta, media o fuerte) y comprima. Descargue el archivo más ligero: sigue siendo legible y, en general, cabe en el límite de envío.'
    },
    {
      question: '¿Comprimir un PDF baja la calidad?',
      answer: 'Alta mantiene el texto y las imágenes lo más cerca posible del original. Media y fuerte reducen más las imágenes y pueden suavizar fotos o escaneos. El texto sigue siendo legible. Use alta para un CV o un contrato, y un nivel más fuerte si el archivo debe pasar un tope estricto.'
    },
    {
      question: '¿One2PDF guarda mi archivo después de comprimir?',
      answer: 'No. El PDF se procesa durante la operación. El original se elimina; el resultado se puede descargar una vez y luego se borra. Los archivos no descargados se purgan solos en 15 minutos. El uso ocasional no exige cuenta.'
    }
  ]
} satisfies PageSeoCopy;
