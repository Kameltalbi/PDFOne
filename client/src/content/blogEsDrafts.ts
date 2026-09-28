import type { BlogPost } from './blog';

/**
 * Spanish drafts only. Not imported by getBlogPosts, sitemap, hreflang or prerender.
 * Links point at future /es/ URLs and must not be published until PHASE ES-2.
 */
export const SPANISH_BLOG_DRAFTS: BlogPost[] = [
  {
    slug: 'comprimir-pdf-correo',
    publishedIso: '2026-08-28',
    publishedLabel: '28 de agosto de 2026',
    seoTitle: 'PDF demasiado grande para el correo | One2PDF',
    seoDescription: '¿Gmail u Outlook rechazan un PDF de más de 25 MB? Comprímalo en línea, sin instalar un programa, y envíelo.',
    keywords: 'comprimir PDF, PDF demasiado grande, Gmail 25 MB',
    title: 'Cómo reducir un PDF demasiado grande para enviarlo por correo',
    excerpt: 'Gmail, Outlook o un formulario rechazaron el adjunto. Aquí va por qué un PDF pesa tanto y cómo aligerarlo en unos segundos, sin instalar un programa.',
    body: [
      { type: 'p', text: 'Terminó un expediente, un CV o un portafolio, y el envío se corta: «El archivo supera el tamaño máximo (25 MB)». Gmail, Outlook y muchos formularios paran ahí. En general se puede aligerar un PDF en unos segundos, sin volver a imprimirlo y sin dejarlo ilegible.' },
      { type: 'h2', text: '¿Por qué algunos PDF pesan tanto?' },
      { type: 'p', text: 'Un PDF no es «solo texto». Detrás de cada página hay imágenes, fuentes y, a veces, capas de un escaneo. Cuanto menos optimizados están esos elementos, más crece el peso, aunque el documento sea corto.' },
      { type: 'h3', text: 'Imágenes en alta resolución' },
      { type: 'p', text: 'Un escaneo de un documento, una foto del teléfono o una imagen sin comprimir suman la mayor parte del peso. 300 ppp sirven para imprimir y suelen sobrar para un correo. Es la causa más habitual de un PDF demasiado grande para Gmail.' },
      { type: 'h3', text: 'Páginas, gráficos y fuentes que se acumulan' },
      { type: 'p', text: 'Un informe de 40 páginas, tablas pegadas, capturas y varias fuentes incrustadas hinchan la estructura. Unir varios PDF sin aligerarlos antes empeora el resultado: se apilan imágenes a resolución completa.' },
      { type: 'h2', text: 'La vía más rápida, sin instalar un programa' },
      { type: 'p', text: 'No hace falta una aplicación de escritorio de pago para un envío puntual. Un compresor de PDF en línea basta en la mayoría de los casos: reduce el peso de las imágenes y optimiza el archivo, con un resultado legible en pantalla.' },
      { type: 'h3', text: 'Cómo comprimir un PDF grande en One2PDF' },
      {
        type: 'ol',
        items: [
          [
            'Abra la ',
            { text: 'herramienta para comprimir PDF de One2PDF', to: '/es/compress' },
            '.'
          ],
          'Arrastre el documento a la zona de carga (ordenador o teléfono).',
          'Deje que la herramienta optimice las imágenes y la estructura. Elija un nivel más fuerte si el archivo sigue por encima de 25 MB.',
          'Descargue el PDF nuevo, listo para el correo.'
        ]
      },
      { type: 'h2', text: 'Si el archivo sigue siendo demasiado grande' },
      { type: 'h3', text: 'Comprimir antes de unir' },
      {
        type: 'p',
        parts: [
          'Si tiene que juntar un contrato, anexos y un escaneo, aligere cada PDF primero y únalos después. Los archivos ya comprimidos se combinan mejor que una pila de originales a resolución completa. ',
          { text: 'Unir PDF', to: '/es/merge' }
        ]
      },
      { type: 'h3', text: 'Empezar por las imágenes pesadas' },
      {
        type: 'p',
        parts: [
          'Una captura PNG o JPEG de 8 MB no tiene por qué entrar tal cual en el PDF. Pasar las imágenes a PDF, o comprimir el PDF después de montarlo, suele dejar un peso de partida mucho más bajo para el correo. ',
          { text: 'JPG a PDF', to: '/es/jpg-to-pdf' }
        ]
      },
      { type: 'p', text: 'Un tope de 25 MB no debería bloquear un CV, un dossier o un trámite. En cuanto un formulario o el buzón rechazan el adjunto, una pasada de compresión evita un segundo envío.' }
    ],
    cta: 'Comprimir un PDF gratis',
    ctaTo: '/es/compress'
  },
  {
    slug: 'privacidad-pdf-en-linea',
    publishedIso: '2026-09-02',
    publishedLabel: '2 de septiembre de 2026',
    seoTitle: 'PDF en línea: evitar enviar archivos a un servidor desconocido | One2PDF',
    seoDescription: 'Antes de usar una herramienta PDF gratis en línea, compruebe a dónde van los archivos y cómo elegir un servicio que lo explique.',
    keywords: 'privacidad PDF en línea, editar PDF, dónde van mis archivos PDF',
    title: 'PDF en línea: cómo evitar enviar sus archivos a un servidor desconocido',
    excerpt: 'Antes de usar una herramienta PDF gratis en línea, esto es lo que conviene comprobar para saber a dónde van los archivos y cómo elegir un servicio transparente.',
    body: [
      { type: 'p', text: 'Tiene un contrato, una factura o un PDF médico que convertir, unir o comprimir. Busca «convertir PDF en línea», abre el primer resultado, suelta el archivo… y no sabe qué pasa con él.' },
      { type: 'p', text: 'Ese es el problema de casi todas las herramientas PDF gratis en línea: el archivo va a algún sitio, y la mayoría de la gente no tiene tiempo ni formación para comprobar dónde, ni cuánto tiempo se queda.' },
      { type: 'p', text: 'Esta guía explica qué ocurre de verdad al usar una herramienta PDF en línea, por qué eso no es automáticamente un problema si elige el servicio adecuado, y qué conviene verificar antes de confiarle un documento sensible.' },
      { type: 'h2', text: 'Por qué casi todas las herramientas PDF en línea funcionan por subida' },
      { type: 'p', text: 'A diferencia de lo que algunos sitios dejan entender, la gran mayoría de las herramientas PDF en línea —incluidas las más conocidas— no tratan el archivo «en su dispositivo». Lo envían a un servidor, hacen la operación (conversión, unión, compresión, OCR) y devuelven el resultado.' },
      { type: 'p', text: 'Hay una razón sencilla: algunos trabajos son demasiado pesados para hacerse bien en el navegador. Pasar un PDF a Word o Excel conservando la maquetación exige motores de conversión que el navegador no ejecuta solo. Lo mismo ocurre con el OCR de un escaneo, que pide una capacidad de cálculo que pocos equipos personales ofrecen con rapidez.' },
      { type: 'p', text: 'Algunas herramientas sí procesan todo en el navegador (WebAssembly). Suelen limitarse a operaciones simples y pueden ser más lentas o menos fiables con archivos grandes o conversiones complejas.' },
      { type: 'p', text: 'La pregunta útil no es «¿se envía mi archivo a algún sitio?». La respuesta es casi siempre sí. La pregunta es «¿adónde, durante cuánto tiempo y quién lo trata?».' },
      { type: 'h2', text: 'Qué comprobar antes de confiar en una herramienta PDF' },
      { type: 'p', text: 'Antes de soltar un documento sensible en cualquier convertidor en línea, dedique medio minuto a estos puntos:' },
      { type: 'h3', text: '1. La política de eliminación de archivos' },
      { type: 'p', text: 'Un servicio serio dice con claridad cuánto tiempo permanece el archivo en sus servidores después del proceso: lo ideal, minutos u horas, nunca «indefinidamente» o «no indicado». Esa información debe encontrarse fácil, no enterrada en decenas de páginas de condiciones.' },
      { type: 'h3', text: '2. Dónde están los servidores y qué marco legal aplica' },
      { type: 'p', text: 'Un archivo tratado en un servidor de la Unión Europea queda cubierto por el RGPD, uno de los marcos de protección de datos más estrictos. Un archivo tratado en Canadá puede quedar bajo la PIPEDA o, para residentes de Quebec, la Ley 25. Esas normas imponen deberes reales de recogida, conservación y supresión, a diferencia de jurisdicciones más permisivas.' },
      { type: 'h3', text: '3. Qué pasa con las funciones de IA' },
      { type: 'p', text: 'Cada vez más herramientas PDF añaden resumen o traducción con inteligencia artificial. Es útil, pero a menudo significa que un tercero (el proveedor de IA) también recibe el contenido. Un servicio transparente debe decir qué funciones pasan por un proveedor de IA y cuáles no.' },
      { type: 'h3', text: '4. Transparencia del proceso técnico' },
      { type: 'p', text: 'Un servicio que explica cómo trata los archivos —qué herramientas y qué pasos— inspira más confianza que una caja negra que solo dice «sus archivos están seguros» sin un detalle comprobable.' },
      { type: 'h3', text: '5. El modelo de precios' },
      { type: 'p', text: 'Una herramienta con precios claros, y sin una prueba gratuita que se convierte en una suscripción oculta de 40 $ al mes, suele ser más fiable que un servicio cuyo modelo depende de confundir el cobro. Cómo le tratan en el precio dice mucho de cómo tratan los datos.' },
      { type: 'h2', text: 'Qué hace One2PDF en la práctica' },
      { type: 'p', text: 'En One2PDF se eligió explicar el proceso en lugar de una promesa de marketing que no se puede comprobar. En concreto:' },
      {
        type: 'ul',
        items: [
          'Sus archivos se procesan en un servidor seguro. No decimos lo contrario.',
          'El tratamiento usa herramientas establecidas para unir, comprimir, proteger y editar; un motor de conversión profesional para Word, Excel y PowerPoint; y OCR para documentos escaneados.',
          'Resumir y traducir, que pasan por un proveedor de IA externo, están separados del resto y solo se ejecutan si usted los usa.',
          'Cuando el archivo se ha procesado y descargado, se elimina solo de nuestros servidores.',
          'No hace falta tarjeta para probar, y ninguna suscripción empieza sin una acción clara suya.'
        ]
      },
      { type: 'p', text: 'No decimos que nada sale de su ordenador: sería falso. Preferimos explicar qué ocurre para que decida con los datos delante.' },
      { type: 'h2', text: 'En resumen' },
      {
        type: 'ul',
        items: [
          'Casi todas las herramientas PDF en línea funcionan subiendo el archivo a un servidor. Es lo habitual, no una alarma por sí sola.',
          'La prueba de confianza es la transparencia: tiempo de conservación, ubicación de los servidores, uso de IA y un modelo de precios claro.',
          'Desconfíe de quien promete «cero envío» sin poder demostrarlo, y fíese más de quien explica con honestidad cómo trabaja.'
        ]
      },
      {
        type: 'p',
        parts: [
          '¿Necesita convertir, unir o editar un PDF hoy? Pruebe One2PDF gratis, sin tarjeta, con eliminación automática de los archivos después del proceso. Consulte también la ',
          { text: 'política de privacidad', to: '/privacy' },
          '.'
        ]
      }
    ],
    cta: 'Probar One2PDF gratis',
    ctaTo: '/es/tools'
  }
];
