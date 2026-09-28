import { seoEs } from './esSeo';

export const esPricing = {
  eyebrow: 'Precios',
  seoTitle: 'Precios de One2PDF: gratis, pase de 7 días y Pro',
  seoDescription: 'Herramientas PDF gratis, un pase de 7 días por {weekPrice} o Pro desde {monthPrice} al mes ({yearPrice} al año).',
  title: 'Precios claros, sin letra pequeña',
  subtitle: 'Empiece gratis. Si necesita más, un pago único de 7 días o Pro.',
  popular: 'El más elegido',
  discover: 'Para probar',
  urgent: 'Para un envío de hoy',
  flexible: 'Mes a mes',
  bestValue: 'Mejor precio',
  freeName: 'Gratis',
  freePrice: '$0',
  freePeriod: '/ mes',
  freePitch: 'Las herramientas PDF esenciales, con un tope diario justo. Sin tarjeta.',
  freeNote: 'El OCR, los archivos de más de 20 MB y más créditos de IA están en los planes de pago.',
  freeIncludes: [
    'Todas las herramientas PDF esenciales',
    '{dailyJobs} documentos al día',
    'Archivos de hasta {freeSize}',
    '{freeAi} créditos de IA al mes (traducir y resumir)',
    'Anuncios ligeros, que no bloquean',
    'Archivos procesados y luego eliminados solos'
  ],
  freeCta: 'Seguir gratis',
  freeMicro: 'No hace falta tarjeta.',
  seeIncludedTools: 'Ver las herramientas incluidas',
  hideIncludedTools: 'Ocultar la lista',
  includedToolsTitle: 'Herramientas PDF esenciales incluidas',
  weekName: 'Pase de 7 días',
  weekTag: 'Un pago, sin suscripción',
  weekNoSubscription: 'Un pago. Sin suscripción.',
  weekPrice: '$1.99',
  weekPeriod: 'una vez',
  weekPitch: '¿Un archivo para hoy? Acceso de pago durante 7 días y luego se detiene. Sin cargo posterior.',
  weekIncludes: [
    'Un pago: {weekPrice}, cobrado una vez',
    'No se renueva solo',
    'Sin anuncios durante 7 días',
    'Archivos de hasta {paidSize}',
    'OCR incluido',
    'Procesos PDF ilimitados durante 7 días',
    'Traducir y resumir: {weekAi} créditos de IA para el pase (1 crédito por página)'
  ],
  weekCta: 'Desbloquear 7 días — {weekPrice}',
  weekMicro: 'Se detiene solo. Nada que cancelar.',
  monthName: 'Pro mensual',
  monthTag: 'Autónomos y volumen variable',
  monthPrice: '$3.99',
  monthPeriod: '/ mes',
  monthPitch: 'El plan flexible: usted decide, mes a mes.',
  monthIncludes: [
    'Sin anuncios',
    'Archivos de hasta {paidSize}',
    'OCR incluido',
    'Procesos PDF ilimitados',
    '{proAi} créditos de IA al mes (traducir y resumir)',
    'Cancele en un clic, cuando quiera'
  ],
  monthCta: 'Elegir Pro mensual',
  monthMicro: 'Sin permanencia. Cancele cuando quiera.',
  proToggleMonthly: 'Mensual',
  proToggleYearly: 'Anual',
  yearName: 'Pro anual',
  yearPrice: '$34.90',
  yearPeriod: '/ año',
  yearEquiv: 'equivale a {monthEquiv} / mes — {monthsFree} meses gratis frente al mensual',
  yearPitch: '¿Vuelve cada semana? Un pago al año, el mismo acceso Pro, sin sorpresa mensual.',
  yearIncludes: [
    'Todo lo del Pro mensual',
    'Archivos de hasta {paidSize}, OCR, sin anuncios',
    '{proAi} créditos de IA al mes, no un bloque anual',
    'Pague {paidMonths} meses y tenga 12',
    'Cancele cuando quiera: Pro sigue hasta el fin del periodo pagado'
  ],
  yearBadge: 'Mejor precio',
  yearCta: 'Ahorrar con el anual',
  yearMicro: 'La mejor cuota mensual. El mismo Pro.',
  trust: 'Pago 100 % seguro con Stripe (tarjeta, Apple Pay, Google Pay). One2PDF no guarda el número de su tarjeta.',
  faqTitle: 'Preguntas sobre los precios',
  faq: [
    {
      question: '¿El pase de 7 días se renueva solo?',
      answer: 'No. Es un pago único de {weekPrice}. A los 7 días el acceso Pro se detiene solo. No hay otro cargo ni nada que cancelar. Si todavía lo necesita, compre otro pase o pase a Pro.'
    },
    {
      question: '¿Los pagos son seguros?',
      answer: 'Sí. Todos los pagos pasan por Stripe, el mismo procesador que usan miles de empresas. One2PDF no ve ni guarda el número de su tarjeta. Puede pagar con tarjeta, Apple Pay o Google Pay.'
    },
    {
      question: '¿Puedo dejar Pro cuando quiera?',
      answer: 'Sí. Los planes mensual ({monthPrice}) y anual ({yearPrice}) se cancelan en un clic desde el portal de Stripe. Sin penalización. Después vuelve a Gratis: {dailyJobs} documentos al día, archivos de hasta {freeSize}, {freeAi} créditos de IA al mes y anuncios ligeros.'
    },
    {
      question: 'Ya pagué. ¿Cómo entro?',
      answer: 'Entre en su cuenta de One2PDF con el correo y la contraseña del pago. El pase de 7 días o el acceso Pro se restaura en ese dispositivo. En Mi cuenta ve los días que quedan y cuántos documentos ha procesado.'
    },
    {
      question: '¿Cómo funcionan los créditos de IA?',
      answer: 'Traducir cuesta 1 crédito por página tratada, hasta {translateCap} páginas. Resumir cuesta 1 crédito por página, con un máximo de {summarizeCap} créditos por archivo (los PDF más largos se recortan antes del modelo). Un trabajo fallido no conserva los créditos. Gratis: {freeAi} / mes. Pase de 7 días: {weekAi} para el pase. Pro mensual y anual: {proAi} por mes natural.'
    }
  ],
  paying: 'Redirigiendo al pago…',
  payFail: 'No se ha podido iniciar el pago.',
  canceled: 'Pago cancelado. Puede intentarlo de nuevo cuando quiera.',
  successTitle: 'Ya está en One2PDF Pro',
  successText: 'Su cuenta Pro está lista.',
  successBenefitsTitle: 'Sus ventajas Pro',
  successStatus: 'Activo',
  successRenews: 'Se renueva el {date}',
  successCta: 'Empezar a usar One2PDF Pro',
  successManage: 'Gestionar la suscripción',
  successVerifying: 'Comprobando el pago…',
  successSeoTitle: 'Bienvenido a One2PDF Pro',
  successSeoDescription: 'Su pago de One2PDF Pro está confirmado. Use todas las herramientas PDF sin el límite diario.',
  successBenefitsPass: [
    'Sin anuncios',
    'Archivos de hasta 100 MB',
    'OCR incluido',
    'Sin límite diario de documentos',
    '100 créditos de IA durante 7 días',
    'Cancele o gestione cuando quiera'
  ],
  successBenefitsPro: [
    'Sin anuncios',
    'Archivos de hasta 100 MB',
    'OCR incluido',
    'Sin límite diario de documentos',
    '500 créditos de IA al mes',
    'Cancele o gestione cuando quiera'
  ],
  successPeriodWeek: '7 días · pago único',
  successPeriodMonth: 'Mensual',
  successPeriodYear: 'Anual',
  successUnverified: 'Stripe no ha podido confirmar este pago. Si acaba de pagar, espere un momento e inténtelo de nuevo.',
  successFailTitle: 'Pago no confirmado',
  activeAccess: 'El acceso Pro ya está activo en este dispositivo.',
  alreadyActive: 'Pase ya activo — ver mi cuenta',
  restoreBanner: '¿Ya pagó? No vuelva a pagar. Entre con el correo usado en el pago.',
  manage: 'Gestionar la suscripción',
  logout: 'Cerrar sesión',
  accountPro: 'Pro',
  myAccount: 'Mi cuenta'
};

export const esUpgrade = {
  kicker: 'Archivo demasiado grande',
  title: 'Este archivo supera el límite gratuito',
  text: '« {name} » pesa {size}. El plan gratuito acepta hasta {limit}: el archivo no se ha subido. El pase y Pro aceptan archivos de hasta 100 MB:',
  limit: '20 MB',
  dismiss: 'Cerrar y elegir un archivo más pequeño',
  batchKicker: 'Procesamiento por lotes',
  batchTitle: 'El lote es una función Pro',
  batchText: 'Ha seleccionado {count} archivos a la vez. En el plan gratuito, añada un archivo cada vez: no se ha subido nada. Un pase de 7 días o Pro desbloquea el lote.',
  batchDismiss: 'Cerrar y añadir los archivos de uno en uno',
  premiumKicker: 'Función Pro',
  premiumTitle: '{feature} requiere Pro',
  premiumText: 'El OCR está disponible con el pase de 7 días o Pro. Las herramientas PDF esenciales (unir, comprimir, convertir, editar…) siguen gratis. Pase a un plan de pago para desbloquear el OCR:',
  creditsTitle: '{feature} usa créditos de IA',
  creditsText: '{feature} usa créditos de IA (1 crédito por página). Gratis incluye un cupo mensual; el pase de 7 días y Pro incluyen más. No es una herramienta solo de Pro:',
  creditsKicker: 'Créditos de IA',
  premiumDismiss: 'Volver a las herramientas gratis',
  featureOcr: 'OCR',
  featureTranslate: 'Traducción con IA',
  featureSummarize: 'Resumen con IA',
  alreadyPaid: 'Ya pagué — iniciar sesión'
};

export const esAccount = {
  seoTitle: 'Mi cuenta de One2PDF',
  seoDescription: 'Vea su pase de One2PDF, el tiempo que queda y los documentos procesados.',
  title: 'Mi cuenta',
  lead: 'Su pase está vinculado a su cuenta. Entre para ver el tiempo que queda.',
  emailLabel: 'Correo',
  emailPlaceholder: 'Correo',
  cta: 'Restaurar mi pase',
  working: 'Comprobando…',
  noPass: 'No hay un pase activo para este correo.',
  plan: 'Plan',
  validUntil: 'Válido hasta',
  remaining: 'Tiempo restante',
  daysLeft: 'Quedan {count} días',
  hoursLeft: 'Quedan {count} h',
  unlimitedTime: 'Sin fecha de fin',
  expired: 'Caducado',
  used: 'Documentos procesados',
  usedToday: 'Procesados hoy',
  remainingDocs: 'Documentos que quedan hoy',
  unlimitedDocs: 'Ilimitados',
  freeLimit: '{used} / {limit} documentos gratis hoy',
  aiCredits: 'Créditos de IA',
  toolsCta: 'Usar las herramientas',
  loginTitle: 'Entrar en su pase',
  loginLead: 'Escriba el correo y la contraseña de su cuenta de One2PDF.',
  loginSeoTitle: 'Iniciar sesión en One2PDF',
  loginSeoDescription: 'Entre en su cuenta de One2PDF para restaurar el pase y las herramientas PDF.',
  loginHint: 'Use el mismo correo del pago para vincular el pase de 7 días.',
  authLoginTitle: 'Entrar en su cuenta',
  authSignupTitle: 'Crear una cuenta',
  loginAsideTitle: 'Entre en su espacio',
  loginAsideText: 'Escriba su correo y su contraseña para acceder a la cuenta, al pase, a los lotes y a las herramientas PDF.',
  signupAsideTitle: 'Herramientas PDF para trabajar',
  signupAsideText: 'Cree una cuenta para unir, comprimir, convertir y proteger PDF. Si ya pagó, use el mismo correo: el pase se vincula solo.',
  signupSeoTitle: 'Crear una cuenta de One2PDF',
  signupSeoDescription: 'Cree una cuenta de One2PDF con correo y contraseña. Un pase ya pagado se vincula solo.',
  namePlaceholder: 'Nombre',
  emailEnter: 'Escriba su correo',
  passwordPlaceholder: 'Contraseña',
  loginCta: 'Entrar',
  signupCta: 'Registrarse',
  forgotPassword: '¿Olvidó la contraseña?',
  forgotHint: 'El correo para restablecer la contraseña aún no está disponible. Cree una cuenta con el correo del pago, o escriba a support@one2pdf.com.',
  noAccount: '¿Todavía no tiene cuenta?',
  createAccount: 'Crear una cuenta',
  hasAccount: '¿Ya es miembro?',
  signInLink: 'Entrar',
  seeTools: 'Ver todas las herramientas',
  termsPrefix: 'Al crear una cuenta, acepta nuestra',
  loginFail: 'Correo o contraseña incorrectos.',
  signupFail: 'No se ha podido crear la cuenta.'
};

export const esBlogPage = {
  title: 'Blog de One2PDF',
  subtitle: 'Guías prácticas para enviar, aligerar y tratar PDF en el trabajo de cada día.',
  readMore: 'Leer el artículo',
  back: 'Todos los artículos',
  seoTitle: 'Blog PDF: guías prácticas | One2PDF',
  seoDescription: 'Guías para comprimir, unir y convertir PDF. Correo, Gmail y tratamiento de archivos, en el blog de One2PDF.',
  publishedOn: 'Publicado el {date}'
};

export const esLegal = {
  privacyTitle: 'Política de privacidad',
  privacyUpdated: 'Última actualización: septiembre de 2026',
  privacyIntro: 'One2PDF prioriza la privacidad: no vendemos sus documentos ni los conservamos para entrenar modelos.',
  privacyData: 'Cuando usa una herramienta, el archivo se envía a nuestros servidores durante el trabajo (conversión, compresión, OCR, etc.). Una cookie técnica guarda la cuota del plan gratuito y, si se suscribe, su acceso Pro.',
  privacyRetention: 'El archivo original se elimina al terminar el proceso. El resultado está disponible para una sola descarga y luego se borra. Los archivos no descargados se purgan solos en un plazo máximo de 15 minutos.',
  privacyThird: 'Pagos: Stripe. Medición de audiencia: Google Analytics (gtag). Conversiones de Office y OCR: en nuestros servidores. Resumir y traducir: un proveedor de IA solo si usa esas herramientas.',
  privacyRights: 'Puede pedir acceso, corrección o supresión de los datos de facturación ligados al correo de Stripe. Escríbanos a la dirección de la página de contacto.',
  contactTitle: 'Contacto',
  contactIntro: '¿Preguntas, incidencias o soporte Pro? Escríbanos. Respondemos en inglés y en francés.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'Los suscriptores Pro anuales tienen soporte prioritario por correo.'
};

export const esToPng = {
  title: 'PDF a PNG',
  subtitle: 'Convierta cada página del PDF en una imagen PNG.',
  tip: 'Varias páginas se entregan en un ZIP. El PNG mantiene nítidas las zonas planas.',
  action: 'Convertir a PNG',
  running: 'Convirtiendo…',
  fail: 'No se puede convertir este PDF a PNG.',
  doneTitle: 'Conversión terminada',
  doneText: 'Las páginas se han exportado como PNG.',
  reset: 'Convertir otro archivo',
  download: 'Descargar los PNG',
  features: [
    { icon: 'PNG', tone: 'green', title: 'Una imagen por página', text: 'Cada página pasa a PNG, útil para la web y las capturas.' },
    { icon: '✓', tone: 'blue', title: 'ZIP automático', text: 'Varias páginas se agrupan en un archivo.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El PDF de origen se procesa y luego se elimina.' }
  ],
  ...seoEs.toPng
};

export const esToText = {
  title: 'PDF a texto',
  subtitle: 'Extraiga el texto seleccionable de su PDF.',
  tip: 'Funciona en PDF con capa de texto. Si es un escaneo, haga antes el OCR.',
  action: 'Extraer el texto',
  running: 'Extrayendo…',
  fail: 'No se puede extraer el texto.',
  doneTitle: 'Texto extraído',
  doneText: 'El contenido se ha guardado en un archivo de texto.',
  reset: 'Extraer otro archivo',
  download: 'Descargar el texto',
  features: [
    { icon: 'TXT', tone: 'blue', title: 'Texto plano', text: 'Obtenga el contenido para pegarlo, indexarlo o reescribirlo.' },
    { icon: '★', tone: 'green', title: 'Sin instalación', text: 'La extracción se hace en el navegador y luego descarga el .txt.' },
    { icon: '✧', tone: 'purple', title: 'Escaneos', text: 'Si el PDF es una imagen, use la herramienta OCR.' }
  ],
  ...seoEs.toText
};

export const esUnlock = {
  title: 'Desbloquear PDF',
  subtitle: 'Quite la contraseña de apertura de un PDF que ya es suyo.',
  tip: 'Escriba la contraseña actual. Un PDF bloqueado no se abre sin ella.',
  action: 'Desbloquear',
  running: 'Desbloqueando…',
  fail: 'No se puede desbloquear este PDF.',
  doneTitle: 'PDF desbloqueado',
  doneText: 'El archivo ahora se abre sin contraseña.',
  reset: 'Desbloquear otro archivo',
  password: 'Contraseña',
  passwordPh: 'Contraseña actual',
  features: [
    { icon: '🔓', tone: 'orange', title: 'Apertura libre', text: 'El PDF resultante ya no pide contraseña.' },
    { icon: '✓', tone: 'blue', title: 'Su archivo', text: 'Use solo un documento cuya contraseña conoce.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El original no se conserva en el servidor.' }
  ],
  ...seoEs.unlock
};

export const esOcr = {
  title: 'PDF OCR',
  subtitle: 'Reconozca el texto de páginas escaneadas y obtenga un PDF utilizable. Disponible con el pase de 7 días o Pro.',
  tip: 'El OCR usa Tesseract. La calidad depende de la nitidez del escaneo. Disponible con el pase de 7 días o Pro.',
  action: 'Ejecutar OCR',
  running: 'Reconociendo…',
  fail: 'No se puede ejecutar el OCR.',
  doneTitle: 'OCR terminado',
  doneText: 'El texto se ha reconocido. Descargue el PDF generado.',
  reset: 'Procesar otro archivo',
  features: [
    { icon: 'OCR', tone: 'gold', title: 'Páginas escaneadas', text: 'Convierte una imagen de documento en texto reconocido.' },
    { icon: '★', tone: 'green', title: 'Idioma del navegador', text: 'El reconocimiento sigue el idioma detectado (ES, EN, FR…).' },
    { icon: '✧', tone: 'purple', title: 'Luego traducir o resumir', text: 'Cuando ya hay texto, las otras herramientas sirven.' }
  ],
  ...seoEs.ocr
};

export const esSummarize = {
  title: 'Resumir un PDF',
  subtitle: 'Obtenga un resumen claro a partir del texto del documento. Usa créditos de IA (1 crédito por página).',
  tip: 'Usa créditos de IA (1 crédito por página, con un máximo de 20 por archivo). Elija el estilo y el idioma, y luego resuma. Los PDF escaneados necesitan OCR antes.',
  action: 'Resumir PDF',
  running: 'Analizando su PDF…',
  fail: 'No se puede resumir este PDF.',
  doneTitle: 'Resumen listo',
  doneText: 'Revise el resumen, y luego cópielo o descárguelo.',
  reset: 'Resumir otro PDF',
  download: 'Descargar',
  copy: 'Copiar',
  copied: 'Copiado',
  modeQuestion: '¿Cómo quiere el resumen?',
  modeQuick: 'Rápido',
  modeQuickHint: 'Una visión breve y concisa.',
  modeDetailed: 'Detallado',
  modeDetailedHint: 'Estructurado y más completo.',
  modeKeyPoints: 'Puntos clave',
  modeKeyPointsHint: 'Los datos esenciales en viñetas.',
  languageLabel: 'Idioma del resumen',
  languageSame: 'El mismo del documento',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'Modo',
  resultLanguage: 'Idioma',
  documentLabel: 'Documento',
  features: [
    { icon: '☷', tone: 'green', title: 'Tres modos', text: 'Rápido, detallado o puntos clave: elija lo que necesita.' },
    { icon: '★', tone: 'blue', title: 'Hace falta texto', text: 'En un escaneo, haga antes el OCR.' },
    { icon: '✧', tone: 'teal', title: 'Archivo .txt', text: 'Copie o descargue. No se almacena nada.' }
  ],
  ...seoEs.summarize
};

export const esTranslate = {
  title: 'Traducir el PDF',
  subtitle: 'Obtenga un PDF traducido que conserva el diseño original en lo posible. Usa créditos de IA (1 crédito por página tratada).',
  tip: 'Usa créditos de IA (1 crédito por página tratada). Imágenes, logotipos y tablas se mantienen. El texto se traduce en su sitio. El diseño no será idéntico al píxel: unos idiomas ocupan más y otros menos.',
  action: 'Traducir PDF',
  running: 'Traduciendo el documento…',
  fail: 'No se puede traducir este PDF.',
  doneTitle: 'PDF traducido listo',
  doneText: 'Descargue el PDF traducido. También hay un archivo de solo texto si solo necesita el redactado.',
  reset: 'Traducir otro archivo',
  download: 'Descargar el PDF traducido',
  downloadTxt: 'Descargar el texto traducido (.txt)',
  source: 'De',
  autoDetect: 'Detectar solo',
  target: 'A',
  output: 'Salida',
  preserveLayout: 'Conservar el diseño',
  preserveLayoutHint: 'Mantener posiciones, imágenes, tablas y jerarquía visual en lo posible.',
  textOnly: 'Solo texto',
  textOnlyHint: 'Solo el redactado traducido, sin reconstruir el diseño de la página.',
  langFr: 'Francés',
  langEn: 'Inglés',
  langEs: 'Español',
  langPt: 'Portugués',
  langDe: 'Alemán',
  langTr: 'Turco',
  langAr: 'Árabe',
  langIt: 'Italiano',
  features: [
    { icon: 'A文', tone: 'orange', title: 'PDF traducido', text: 'El resultado principal es un PDF: lo visual se queda y el texto se sustituye en sus zonas.' },
    { icon: '★', tone: 'blue', title: 'Diseño en lo posible', text: 'El alemán puede desbordar una caja; el inglés puede dejar huecos. El tamaño de fuente se adapta.' },
    { icon: '✧', tone: 'purple', title: 'Escaneos incluidos', text: 'Si hay poco texto seleccionable, el OCR se ejecuta solo y luego la traducción.' }
  ],
  ...seoEs.translate
};

export const esHtml = {
  title: 'HTML a PDF',
  subtitle: 'Convierta una página HTML en PDF en un clic.',
  tip: 'Importe un archivo .html o pegue el HTML. Las páginas con mucho JavaScript se reproducen peor.',
  action: 'Crear PDF',
  running: 'Convirtiendo…',
  fail: 'No se puede convertir este HTML.',
  doneTitle: 'PDF creado',
  doneText: 'El HTML se ha convertido a PDF.',
  reset: 'Convertir más HTML',
  empty: 'Pegue HTML o elija un archivo.',
  pastePh: '<h1>Título</h1><p>Su contenido…</p>',
  useHtml: 'Usar este HTML',
  features: [
    { icon: '</>', tone: 'purple', title: 'Archivo o texto pegado', text: 'Suelte un .html o pegue el código.' },
    { icon: '⌘', tone: 'gold', title: 'En línea', text: 'Se convierte en nuestros servidores. No hay un programa que instalar.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El HTML no se conserva en el servidor.' }
  ],
  ...seoEs.htmlPdf
};

export const esExtractPages = {
  title: 'Extraer páginas',
  subtitle: 'Quédese solo con las páginas que necesita, en un PDF nuevo.',
  tip: 'Seleccione las páginas que quiere conservar, o escriba un rango como 1-3, 7.',
  action: 'Extraer páginas',
  running: 'Extrayendo…',
  fail: 'No se pueden extraer estas páginas.',
  doneTitle: 'Páginas extraídas',
  doneText: 'Las páginas seleccionadas están en un PDF nuevo.',
  reset: 'Extraer otro archivo',
  invalidRange: 'Indique un rango de páginas válido.',
  features: [
    { icon: '▤', tone: 'green', title: 'Un solo archivo', text: 'Las páginas elegidas forman un PDF, en orden.' },
    { icon: '★', tone: 'blue', title: 'Sin instalación', text: 'Elija las páginas en el navegador y descargue.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El original no se conserva en el servidor.' }
  ],
  seoTitle: 'Extraer páginas de un PDF | One2PDF',
  seoDescription: 'Conserve las páginas que elija y descargue un PDF nuevo. En el navegador, sin cuenta para un uso ocasional.',
  seoH2: 'Cómo extraer páginas de un PDF',
  seoP1: '¿Solo necesita de la página 2 a la 5? Extráigalas a un PDF nuevo, sin instalar un programa.',
  seoP2: 'Seleccione las páginas, confirme y descargue. El archivo original se elimina al terminar el proceso.',
  seoP3: 'El uso ocasional del plan gratuito no exige cuenta.'
};

export const esExtractImages = {
  title: 'Extraer imágenes',
  subtitle: 'Saque las imágenes incrustadas en un PDF y descárguelas.',
  tip: 'Funciona con imágenes guardadas en el archivo, no con una página que solo es un escaneo de texto.',
  action: 'Extraer imágenes',
  running: 'Extrayendo…',
  fail: 'No se pueden extraer imágenes de este PDF.',
  doneTitle: 'Imágenes extraídas',
  doneText: 'Descargue las imágenes encontradas en el documento.',
  reset: 'Extraer otro archivo',
  download: 'Descargar las imágenes',
  features: [
    { icon: '🖼', tone: 'purple', title: 'Archivos incrustados', text: 'Recupere fotos y gráficos guardados en el PDF.' },
    { icon: '★', tone: 'blue', title: 'ZIP o un solo archivo', text: 'Una imagen se descarga directa; varias van en un ZIP.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'No se conserva nada después de la descarga.' }
  ],
  seoTitle: 'Extraer imágenes de un PDF | One2PDF',
  seoDescription: 'Descargue las imágenes incrustadas en un PDF. En el navegador, sin cuenta para un uso ocasional.',
  seoH2: 'Cómo extraer imágenes de un PDF',
  seoP1: 'Un PDF suele contener fotos, logotipos o gráficos. One2PDF lista las imágenes incrustadas para que pueda guardarlas.',
  seoP2: 'Si el documento es solo una página escaneada de texto, use OCR o PDF a JPG.',
  seoP3: 'El archivo original se elimina al terminar el proceso.'
};

export const esFlatten = {
  title: 'Aplanar PDF',
  subtitle: 'Convierta los campos del formulario en contenido fijo que ya no se puede editar.',
  tip: 'Úselo después de rellenar un formulario, para que los campos no se puedan cambiar.',
  action: 'Aplanar',
  running: 'Aplanando…',
  fail: 'No se puede aplanar este PDF.',
  doneTitle: 'PDF aplanado',
  doneText: 'Los campos del formulario ya forman parte de la página.',
  reset: 'Aplanar otro archivo',
  features: [
    { icon: '▣', tone: 'orange', title: 'Campos fijos', text: 'Los valores se ven, pero ya no se editan.' },
    { icon: '★', tone: 'blue', title: 'Después de rellenar', text: 'Aplane cuando el formulario esté completo.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El original no se almacena.' }
  ],
  seoTitle: 'Aplanar un formulario PDF | One2PDF',
  seoDescription: 'Fije los campos de un formulario PDF para que ya no se puedan editar. En el navegador.',
  seoH2: 'Cómo aplanar un PDF',
  seoP1: 'Aplanar integra los campos del formulario en la página. Quien lo recibe ve los valores y no puede cambiarlos.',
  seoP2: 'El archivo debe contener un formulario PDF. Un PDF sin campos no se aplana de este modo.',
  seoP3: 'El proceso es temporal: el original se elimina al terminar.'
};

export const esHeaderFooter = {
  title: 'Encabezado y pie',
  subtitle: 'Añada una línea breve arriba o abajo de cada página.',
  tip: 'Manténgala corta. Puede añadir números de página en el pie.',
  action: 'Aplicar',
  running: 'Aplicando…',
  fail: 'No se puede añadir el encabezado o el pie.',
  doneTitle: 'Encabezado y pie añadidos',
  doneText: 'El texto se ha aplicado en todas las páginas.',
  reset: 'Editar otro archivo',
  header: 'Encabezado',
  headerPh: 'Confidencial',
  footer: 'Pie',
  footerPh: 'Nombre de la empresa',
  numbers: 'Añadir números de página en el pie',
  color: 'Color',
  empty: 'Escriba un encabezado, un pie o active los números de página.',
  features: [
    { icon: 'HF', tone: 'blue', title: 'Todas las páginas', text: 'El mismo encabezado y pie se aplican a todo el archivo.' },
    { icon: '★', tone: 'green', title: 'Números opcionales', text: 'Añada 1 / n en el pie si lo necesita.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El original se elimina después del proceso.' }
  ],
  seoTitle: 'Encabezado y pie en un PDF | One2PDF',
  seoDescription: 'Añada un encabezado, un pie o números de página en cada hoja de un PDF. En el navegador.',
  seoH2: 'Cómo añadir un encabezado y un pie a un PDF',
  seoP1: 'Una línea breve arriba o abajo de cada página basta para identificar un documento.',
  seoP2: 'Escriba el texto, active los números si quiere y descargue el resultado.',
  seoP3: 'No hay un programa que instalar. El archivo original no se conserva.'
};

export const esFillForm = {
  title: 'Rellenar formulario',
  subtitle: 'Complete los campos de un PDF interactivo y descárguelo.',
  tip: 'Solo se rellenan aquí los PDF que ya tienen campos. Aplane después si quiere fijar los valores.',
  inspecting: 'Leyendo los campos…',
  action: 'Guardar el formulario',
  running: 'Guardando…',
  fail: 'No se puede rellenar este formulario.',
  doneTitle: 'Formulario rellenado',
  doneText: 'Sus valores se han escrito en el PDF.',
  reset: 'Rellenar otro archivo',
  checked: 'Marcado',
  choose: 'Elegir',
  flatten: 'Aplanar los campos al guardar',
  features: [
    { icon: '☑', tone: 'green', title: 'Campos interactivos', text: 'Texto, casillas y listas se detectan solos.' },
    { icon: '★', tone: 'blue', title: 'Aplanar si quiere', text: 'Fije las respuestas para que no se puedan editar después.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'No se almacena nada después de la descarga.' }
  ],
  seoTitle: 'Rellenar un formulario PDF | One2PDF',
  seoDescription: 'Complete los campos de un formulario PDF interactivo en el navegador y descargue el resultado.',
  seoH2: 'Cómo rellenar un formulario PDF',
  seoP1: 'Si el PDF tiene campos de formulario, One2PDF los lista para que escriba las respuestas sin imprimir.',
  seoP2: 'Después puede aplanar el formulario: los valores se ven y ya no se editan.',
  seoP3: 'El archivo original se elimina al terminar el proceso.'
};

export const esFillSign = {
  title: 'Rellenar y firmar un PDF',
  subtitle: 'Añada texto, fechas, marcas y su firma directamente sobre el PDF.',
  select: 'Elegir un PDF',
  orDrop: 'Suelte el PDF aquí o elija un archivo',
  trust: [
    'Simple y rápido',
    'Funciona en el navegador',
    'Sus archivos se eliminan después del proceso'
  ],
  cannotOpen: 'Este PDF no se puede abrir o está protegido.',
  fail: 'No se puede generar el PDF completado.',
  running: 'Preparando el PDF…',
  doneTitle: 'Su PDF está listo',
  doneText: 'El documento se ha rellenado y firmado. Descárguelo ahora.',
  reset: 'Rellenar otro PDF',
  download: 'Descargar',
  undo: 'Deshacer',
  redo: 'Rehacer',
  toolsAria: 'Herramientas para rellenar y firmar',
  pagesAria: 'Páginas del documento',
  selectTool: 'Seleccionar',
  text: 'Texto',
  signature: 'Firma',
  initials: 'Iniciales',
  date: 'Fecha',
  checkbox: 'Casilla',
  check: 'Marca',
  cross: 'Cruz',
  circle: 'Círculo',
  draw: 'Dibujar',
  defaultText: 'Texto',
  size: 'Tamaño',
  bold: 'Negrita',
  delete: 'Eliminar',
  duplicate: 'Duplicar',
  choose: 'Elegir',
  signatureTitle: 'Añada su firma',
  initialsTitle: 'Añada sus iniciales',
  drawTab: 'Dibujar',
  typeTab: 'Escribir',
  importTab: 'Subir',
  typePlaceholder: 'Su nombre',
  chooseImage: 'Elegir una imagen',
  importHint: 'PNG o JPG. La firma solo dura esta sesión.',
  clearPad: 'Borrar',
  cancel: 'Cancelar',
  useStamp: 'Usar',
  reuseLast: 'Usar la última',
  features: [
    { icon: 'T', tone: 'orange', title: 'Texto y fechas', text: 'Coloque el texto o la fecha de hoy justo donde corresponde.' },
    { icon: '〰', tone: 'blue', title: 'Firma sencilla', text: 'Dibuje, escriba o suba una firma y muévala a su sitio.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'El PDF se elimina después del proceso, como en el resto de One2PDF.' }
  ],
  seoTitle: 'Rellenar y firmar un PDF en línea | One2PDF',
  seoDescription: 'Añada texto, fechas, marcas y su firma sobre el PDF, y descargue el documento. Sin imprimir.',
  seoH2: 'Cómo rellenar y firmar un PDF',
  seoP1: 'Importe un contrato, un presupuesto, un certificado o un formulario, y coloque texto, fechas y una firma donde correspondan.',
  seoP2: 'Si el archivo ya tiene campos interactivos, también puede rellenarlos. Un PDF normal se completa colocando elementos encima.',
  seoP3: 'El documento original no se conserva. Una firma creada aquí se limita a la sesión de trabajo y no se usa para entrenar un modelo.',
  howTitle: 'Cómo rellenar y firmar un PDF',
  howSteps: [
    'Elija o suelte su PDF',
    'Añada texto, marcas o una firma',
    'Descargue el documento completado'
  ],
  faqTitle: 'Preguntas frecuentes sobre rellenar y firmar',
  faq: [
    {
      question: '¿Hace falta un formulario PDF especial?',
      answer: 'No. Puede completar cualquier PDF añadiendo texto, fechas y una firma. Los campos interactivos se usan si ya existen.'
    },
    {
      question: '¿Se guarda mi firma?',
      answer: 'No. Por defecto, una firma creada en esta herramienta se limita a la sesión de trabajo actual.'
    },
    {
      question: '¿Se conservan los archivos después de descargar?',
      answer: 'No. Como en el resto de One2PDF, el archivo se procesa de forma temporal y se elimina después de la descarga.'
    }
  ]
};

export const esHeic = {
  title: 'HEIC a PDF',
  subtitle: 'Convierta fotos del iPhone (HEIC/HEIF) en un PDF que pueda enviar.',
  tip: 'Los archivos HEIC del iPhone se convierten y luego se colocan en el PDF.',
  tipMixed: 'JPG, PNG y WebP pueden mezclarse con HEIC en el mismo archivo.',
  action: 'Convertir a PDF',
  running: 'Convirtiendo…',
  fail: 'No se pueden convertir estas imágenes a PDF.',
  doneTitle: 'PDF listo',
  doneText: 'Sus fotos se han reunido en un PDF.',
  reset: 'Convertir otras fotos',
  features: [
    { icon: 'HEIC', tone: 'orange', title: 'Fotos del iPhone', text: 'Las imágenes HEIC/HEIF pasan a ser páginas de un PDF.' },
    { icon: '★', tone: 'blue', title: 'Varias fotos', text: 'Añada más de una imagen; conservan su orden.' },
    { icon: '✧', tone: 'teal', title: 'Archivos temporales', text: 'Los originales se eliminan después de la conversión.' }
  ],
  seoTitle: 'Convertir HEIC a PDF | One2PDF',
  seoDescription: 'Pase fotos HEIC del iPhone a un PDF en el navegador. Sin cuenta para un uso ocasional.',
  seoH2: 'Cómo convertir fotos HEIC a PDF',
  seoP1: 'El iPhone suele guardar las fotos en HEIC. Conviértalas a PDF para enviar un documento que cualquiera pueda abrir.',
  seoP2: 'Añada una o varias fotos, convierta y descargue. Puede mezclar JPG y PNG.',
  seoP3: 'Los archivos se procesan de forma temporal y luego se eliminan.'
};
