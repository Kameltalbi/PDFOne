import type { FeatureCopy } from '../types';
import { seoPt } from './ptSeo';

const feature = (icon: string, tone: string, title: string, text: string): FeatureCopy => ({ icon, tone, title, text });

export const ptPricing = {
  eyebrow: 'Preços claros',
  seoTitle: 'Preços One2PDF: grátis, Passe de 7 dias e Pro',
  seoDescription: 'Plano gratuito, Passe de 7 dias por {weekPrice} sem renovação, Pro mensal {monthPrice} ou anual {yearPrice}. Pagamento com Stripe.',
  title: 'Grátis, 7 dias ou Pro.',
  subtitle: 'Sem compromisso escondido. O Passe de 7 dias termina sozinho. O Pro cancela-se quando quiser. O pagamento passa pelo Stripe.',
  popular: 'A escolha mais frequente',
  discover: 'Para experimentar',
  urgent: 'Para um ficheiro de hoje',
  flexible: 'Mês a mês',
  bestValue: 'Melhor preço',
  freeName: 'Grátis',
  freePrice: '$0',
  freePeriod: '/ mês',
  freePitch: 'As ferramentas PDF essenciais, com um limite diário justo. Sem cartão.',
  freeNote: 'OCR, ficheiros acima de 20 MB e mais créditos de IA estão nos planos pagos.',
  freeIncludes: [
    'Todas as ferramentas PDF essenciais',
    '{dailyJobs} documentos por dia',
    'Ficheiros até {freeSize}',
    '{freeAi} créditos de IA por mês (traduzir e resumir)',
    'Publicidade ligeira, que não bloqueia',
    'Ficheiros processados e depois apagados automaticamente'
  ],
  freeCta: 'Continuar grátis',
  freeMicro: 'Não é preciso cartão.',
  seeIncludedTools: 'Ver as ferramentas incluídas',
  hideIncludedTools: 'Ocultar a lista',
  includedToolsTitle: 'Ferramentas PDF incluídas',
  weekName: 'Passe de 7 dias',
  weekTag: 'Um pagamento, sem subscrição',
  weekNoSubscription: 'Um pagamento. Sem subscrição.',
  weekPrice: '$1.99',
  weekPeriod: 'uma vez',
  weekPitch: 'Um ficheiro para hoje? Acesso pago durante 7 dias, e depois termina. Sem cobrança seguinte.',
  weekIncludes: [
    'Um pagamento: {weekPrice}, cobrado uma vez',
    'Não se renova sozinho',
    '7 dias sem publicidade',
    'Ficheiros até {paidSize}',
    'OCR incluído',
    'Processamentos PDF sem limite durante 7 dias',
    'Traduzir e resumir: {weekAi} créditos de IA no Passe (1 crédito por página)'
  ],
  weekCta: 'Desbloquear 7 dias — {weekPrice}',
  weekMicro: 'Termina sozinho. Nada a cancelar.',
  monthName: 'Pro mensal',
  monthTag: 'Para um volume variável',
  monthPrice: '$3.99',
  monthPeriod: '/ mês',
  monthPitch: 'O plano flexível: mantém o controlo, mês após mês.',
  monthIncludes: [
    'Sem publicidade',
    'Ficheiros até {paidSize}',
    'OCR incluído',
    'Processamentos PDF sem limite',
    '{proAi} créditos de IA por mês (traduzir e resumir)',
    'Cancele com um clique, quando quiser'
  ],
  monthCta: 'Escolher Pro mensal',
  monthMicro: 'Sem fidelização. Cancele quando quiser.',
  proToggleMonthly: 'Mensal',
  proToggleYearly: 'Anual',
  yearName: 'Pro anual',
  yearPrice: '$34.90',
  yearPeriod: '/ ano',
  yearEquiv: 'ou seja {monthEquiv} / mês — {monthsFree} meses grátis face ao mensal',
  yearPitch: 'Volta todas as semanas? Um pagamento anual, o mesmo acesso Pro, sem surpresa mensal.',
  yearIncludes: [
    'Tudo o que o Pro mensal inclui',
    'Ficheiros até {paidSize}, OCR, sem publicidade',
    '{proAi} créditos de IA por mês — não um stock anual de uma vez',
    'Paga {paidMonths} meses e recebe 12',
    'Cancele quando quiser: o Pro mantém-se até ao fim do período pago'
  ],
  yearBadge: 'Melhor preço',
  yearCta: 'Poupar com o plano anual',
  yearMicro: 'Melhor preço mensal. O mesmo Pro.',
  trust: 'Pagamento 100 % via Stripe (cartões, Apple Pay, Google Pay). O One2PDF não guarda o número do cartão.',
  faqTitle: 'Perguntas sobre os preços',
  faq: [
    {
      question: 'O Passe de 7 dias renova-se sozinho?',
      answer: 'Não. É um pagamento único de {weekPrice}. Ao fim de 7 dias, o acesso Pro termina sozinho. Sem nova cobrança e sem nada a cancelar. Se ainda precisar, compre outro Passe ou passe a Pro.'
    },
    {
      question: 'Os pagamentos são seguros?',
      answer: 'Sim. Todos os pagamentos passam pelo Stripe. O One2PDF não vê nem guarda o número do cartão. Pode pagar com cartão, Apple Pay ou Google Pay.'
    },
    {
      question: 'Posso deixar o Pro quando quiser?',
      answer: 'Sim. O mensal ({monthPrice}) e o anual ({yearPrice}) cancelam-se com um clique no portal Stripe. Sem taxa de saída. Depois volta ao grátis: {dailyJobs} documentos por dia, ficheiros até {freeSize}, {freeAi} créditos de IA por mês, publicidade ligeira.'
    },
    {
      question: 'Já paguei — como inicio sessão?',
      answer: 'Inicie sessão com o e-mail e a palavra-passe usados na compra. O Passe de 7 dias ou o Pro fica então disponível neste dispositivo. Em A minha conta vê o tempo restante e os documentos processados.'
    },
    {
      question: 'Como funcionam os créditos de IA?',
      answer: 'Traduzir custa 1 crédito por página tratada, até {translateCap} páginas. Resumir custa 1 crédito por página, no máximo {summarizeCap} créditos por ficheiro (PDF mais longos são cortados antes do modelo). Um processo falhado não fica com os créditos. Grátis: {freeAi} / mês. Passe de 7 dias: {weekAi} para o Passe. Pro mensal e anual: {proAi} por mês de calendário.'
    }
  ],
  paying: 'A abrir o pagamento…',
  payFail: 'Não foi possível iniciar o pagamento.',
  canceled: 'Pagamento cancelado. Pode tentar de novo quando quiser.',
  successTitle: 'Está agora no One2PDF Pro',
  successText: 'A sua conta Pro está pronta.',
  successBenefitsTitle: 'As suas vantagens Pro',
  successStatus: 'Ativo',
  successRenews: 'Renova a {date}',
  successCta: 'Usar o One2PDF Pro',
  successManage: 'Gerir a subscrição',
  successVerifying: 'A confirmar o pagamento…',
  successSeoTitle: 'Bem-vindo ao One2PDF Pro',
  successSeoDescription: 'O pagamento do One2PDF Pro está confirmado. Use todas as ferramentas PDF sem limite diário.',
  successBenefitsPass: [
    'Sem publicidade',
    'Ficheiros até 100 MB',
    'OCR incluído',
    'Sem limite diário de documentos',
    '100 créditos de IA durante 7 dias',
    'Cancele ou gira quando quiser'
  ],
  successBenefitsPro: [
    'Sem publicidade',
    'Ficheiros até 100 MB',
    'OCR incluído',
    'Sem limite diário de documentos',
    '500 créditos de IA por mês',
    'Cancele ou gira quando quiser'
  ],
  successPeriodWeek: '7 dias · pagamento único',
  successPeriodMonth: 'Mensal',
  successPeriodYear: 'Anual',
  successUnverified: 'O Stripe não conseguiu confirmar este pagamento. Se acabou de pagar, espere um momento e tente de novo.',
  successFailTitle: 'Pagamento não confirmado',
  activeAccess: 'O acesso Pro já está ativo neste dispositivo.',
  alreadyActive: 'Passe já ativo — ver a minha conta',
  restoreBanner: 'Já pagou? Não pague outra vez. Inicie sessão com o e-mail usado no pagamento.',
  manage: 'Gerir a subscrição',
  logout: 'Terminar sessão',
  accountPro: 'Pro',
  myAccount: 'A minha conta'
};

export const ptUpgrade = {
  kicker: 'Ficheiro demasiado grande',
  title: 'Este ficheiro ultrapassa o limite gratuito',
  text: '« {name} » tem {size}. O plano gratuito aceita até {limit} — o ficheiro não foi enviado. O Passe e o Pro aceitam ficheiros até 100 MB:',
  limit: '20 MB',
  dismiss: 'Fechar e escolher um ficheiro mais pequeno',
  batchKicker: 'Vários ficheiros',
  batchTitle: 'Processar vários ficheiros é uma função Pro',
  batchText: 'Selecionou {count} ficheiros de uma vez. No plano gratuito, acrescente um de cada vez — nada foi enviado. Um Passe de 7 dias ou o Pro desbloqueia o processamento em lote.',
  batchDismiss: 'Fechar e acrescentar os ficheiros um a um',
  premiumKicker: 'Função Pro',
  premiumTitle: '{feature} exige o Pro',
  premiumText: 'O OCR está disponível com um Passe de 7 dias ou com o Pro. As ferramentas PDF essenciais (juntar, comprimir, converter, editar…) continuam grátis. Mude de plano para desbloquear o OCR:',
  creditsTitle: '{feature} usa créditos de IA',
  creditsText: '{feature} usa créditos de IA (1 crédito por página). O grátis inclui um saldo mensal; o Passe de 7 dias e o Pro incluem mais. Não é uma ferramenta só para Pro:',
  creditsKicker: 'Créditos de IA',
  premiumDismiss: 'Voltar às ferramentas grátis',
  featureOcr: 'OCR',
  featureTranslate: 'Tradução com IA',
  featureSummarize: 'Resumo com IA',
  alreadyPaid: 'Já paguei — iniciar sessão'
};

export const ptAccount = {
  seoTitle: 'A minha conta One2PDF',
  seoDescription: 'Veja o seu Passe One2PDF, o tempo restante e os documentos processados.',
  title: 'A minha conta',
  lead: 'O Passe está ligado à sua conta. Inicie sessão para ver o tempo restante.',
  emailLabel: 'E-mail',
  emailPlaceholder: 'E-mail',
  cta: 'Restaurar o meu Passe',
  working: 'A verificar…',
  noPass: 'Não há Passe ativo para este e-mail.',
  plan: 'Plano',
  validUntil: 'Válido até',
  remaining: 'Tempo restante',
  daysLeft: 'Faltam {count} dias',
  hoursLeft: 'Faltam {count} h',
  unlimitedTime: 'Sem data de fim',
  expired: 'Expirado',
  used: 'Documentos processados',
  usedToday: 'Processados hoje',
  remainingDocs: 'Documentos restantes hoje',
  unlimitedDocs: 'Sem limite',
  freeLimit: '{used} / {limit} documentos grátis hoje',
  aiCredits: 'Créditos de IA',
  toolsCta: 'Usar as ferramentas',
  loginTitle: 'Iniciar sessão no Passe',
  loginLead: 'Introduza o e-mail e a palavra-passe da sua conta One2PDF.',
  loginSeoTitle: 'Iniciar sessão no One2PDF',
  loginSeoDescription: 'Inicie sessão para recuperar o Passe e as ferramentas PDF.',
  loginHint: 'Use o mesmo e-mail da compra para associar o Passe de 7 dias.',
  authLoginTitle: 'Entrar na conta',
  authSignupTitle: 'Criar uma conta',
  loginAsideTitle: 'Entrar no seu espaço',
  loginAsideText: 'Introduza o e-mail e a palavra-passe para aceder à conta One2PDF, ao Passe, aos lotes e às ferramentas PDF.',
  signupAsideTitle: 'Ferramentas PDF para o trabalho do dia',
  signupAsideText: 'Crie uma conta para juntar, comprimir, converter e proteger PDF. Se já pagou, use o mesmo e-mail — o Passe associa-se sozinho.',
  signupSeoTitle: 'Criar uma conta One2PDF',
  signupSeoDescription: 'Crie uma conta One2PDF com e-mail e palavra-passe. Um Passe já pago associa-se automaticamente.',
  namePlaceholder: 'Nome',
  emailEnter: 'Introduza o e-mail',
  passwordPlaceholder: 'Palavra-passe',
  loginCta: 'Entrar',
  signupCta: 'Registar',
  forgotPassword: 'Esqueceu a palavra-passe?',
  forgotHint: 'Ainda não há e-mail para repor a palavra-passe. Crie uma conta com o e-mail do pagamento ou escreva para support@one2pdf.com.',
  noAccount: 'Ainda não tem conta?',
  createAccount: 'Criar uma conta',
  hasAccount: 'Já tem conta?',
  signInLink: 'Entrar',
  seeTools: 'Ver todas as ferramentas',
  termsPrefix: 'Ao criar uma conta, aceita a nossa',
  loginFail: 'E-mail ou palavra-passe incorretos.',
  signupFail: 'Não foi possível criar a conta.'
};

export const ptBlogPage = {
  title: 'Blog One2PDF',
  subtitle: 'Guias práticos para enviar, reduzir e tratar PDF no dia a dia.',
  readMore: 'Ler o artigo',
  back: 'Todos os artigos',
  seoTitle: 'Blog PDF: guias e conselhos | One2PDF',
  seoDescription: 'Guias para comprimir, juntar e converter PDF. E-mail, Gmail e ficheiros, no blog do One2PDF.',
  publishedOn: 'Publicado a {date}'
};

export const ptLegal = {
  privacyTitle: 'Privacidade',
  privacyUpdated: 'Última atualização: setembro de 2026',
  privacyIntro: 'O One2PDF não vende os seus documentos nem os guarda para treinar modelos.',
  privacyData: 'Quando usa uma ferramenta, o ficheiro é enviado para os nossos servidores durante a operação (conversão, compressão, OCR e semelhantes). Um cookie técnico guarda a quota do plano gratuito e, se subscrever, o acesso Pro.',
  privacyRetention: 'O ficheiro original é apagado quando o processamento termina. O resultado fica disponível para uma transferência e depois é removido. Ficheiros não transferidos são apagados no máximo em 15 minutos.',
  privacyThird: 'Pagamentos: Stripe. Medição de audiência: Google Analytics (gtag). Conversões Office e OCR: nos nossos servidores. Resumir e traduzir: um fornecedor de IA só se usar essas ferramentas.',
  privacyRights: 'Pode pedir acesso, retificação ou apagamento dos dados de faturação ligados ao e-mail Stripe. Escreva-nos pela página de contacto.',
  contactTitle: 'Contacto',
  contactIntro: 'Dúvidas, incidentes ou apoio Pro? Escreva-nos. Respondemos em inglês e em francês.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'Os subscritores Pro anuais têm apoio por e-mail prioritário.'
};

export const ptToPng = {
  title: 'PDF para PNG',
  subtitle: 'Transforme cada página de um PDF numa imagem PNG.',
  tip: 'Várias páginas voltam num ZIP. O PNG mantém gráficos planos nítidos.',
  action: 'Converter para PNG',
  running: 'A converter…',
  fail: 'Não foi possível converter este PDF para PNG.',
  doneTitle: 'Conversão concluída',
  doneText: 'As páginas foram exportadas como PNG.',
  reset: 'Converter outro ficheiro',
  download: 'Transferir os ficheiros PNG',
  features: [
    feature('PNG', 'green', 'Uma imagem por página', 'Cada página torna-se um PNG, adequado à web e ao ecrã.'),
    feature('✓', 'blue', 'ZIP automático', 'Várias páginas agrupam-se num arquivo.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O PDF de origem é processado e depois apagado.')
  ],
  ...seoPt.toPng
};

export const ptToText = {
  title: 'PDF para texto',
  subtitle: 'Extraia o texto selecionável do PDF.',
  tip: 'Funciona em PDF com camada de texto. Numa digitalização, faça primeiro o OCR.',
  action: 'Extrair texto',
  running: 'A extrair…',
  fail: 'Não foi possível extrair o texto.',
  doneTitle: 'Texto extraído',
  doneText: 'O conteúdo foi guardado num ficheiro de texto.',
  reset: 'Extrair outro ficheiro',
  download: 'Transferir o texto',
  features: [
    feature('TXT', 'blue', 'Texto simples', 'Obtenha o conteúdo para colar, pesquisar ou reescrever.'),
    feature('★', 'green', 'Sem instalação', 'A extração corre no navegador; depois transfere o .txt.'),
    feature('✧', 'purple', 'Digitalizações', 'Se o PDF for só uma imagem, use a ferramenta OCR.')
  ],
  ...seoPt.toText
};

export const ptUnlock = {
  title: 'Desbloquear PDF',
  subtitle: 'Retire a palavra-passe de abertura de um PDF que lhe pertence.',
  tip: 'Introduza a palavra-passe atual. Sem ela, um PDF bloqueado não abre.',
  action: 'Desbloquear',
  running: 'A desbloquear…',
  fail: 'Não foi possível desbloquear este PDF.',
  doneTitle: 'PDF desbloqueado',
  doneText: 'O ficheiro abre agora sem palavra-passe.',
  reset: 'Desbloquear outro ficheiro',
  password: 'Palavra-passe',
  passwordPh: 'Palavra-passe atual',
  features: [
    feature('🔓', 'orange', 'Abertura livre', 'O PDF resultante já não pede palavra-passe.'),
    feature('✓', 'blue', 'O seu ficheiro', 'Use só um documento cuja palavra-passe conhece.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O original não fica no servidor.')
  ],
  ...seoPt.unlock
};

export const ptOcr = {
  title: 'OCR de PDF',
  subtitle: 'Reconheça o texto de páginas digitalizadas e obtenha um PDF utilizável. Incluído no Passe de 7 dias ou no Pro.',
  tip: 'O OCR usa Tesseract. A qualidade depende da nitidez da digitalização. Incluído no Passe de 7 dias ou no Pro.',
  action: 'Iniciar OCR',
  running: 'A reconhecer…',
  fail: 'Não foi possível executar o OCR.',
  doneTitle: 'OCR concluído',
  doneText: 'O texto foi reconhecido. Transfira o PDF gerado.',
  reset: 'Tratar outro ficheiro',
  features: [
    feature('OCR', 'gold', 'Páginas digitalizadas', 'Transforme a imagem de um documento em texto reconhecido.'),
    feature('★', 'green', 'Língua do navegador', 'O reconhecimento segue a língua detetada (PT, EN, FR, ES…).'),
    feature('✧', 'purple', 'Depois traduzir ou resumir', 'Quando o texto existe, as outras ferramentas tornam-se úteis.')
  ],
  ...seoPt.ocr
};

export const ptSummarize = {
  title: 'Resumir um PDF',
  subtitle: 'Obtenha um resumo claro a partir do texto do documento. Usa créditos de IA (1 crédito por página).',
  tip: 'Usa créditos de IA (1 crédito por página, no máximo 20 por ficheiro). Escolha o estilo e a língua e depois resuma. Digitalizações precisam primeiro de OCR.',
  action: 'Resumir o PDF',
  running: 'A analisar o PDF…',
  fail: 'Não foi possível resumir este PDF.',
  doneTitle: 'Resumo pronto',
  doneText: 'Leia o resumo, copie-o ou transfira-o.',
  reset: 'Resumir outro PDF',
  download: 'Transferir',
  copy: 'Copiar',
  copied: 'Copiado',
  modeQuestion: 'Como quer o resumo?',
  modeQuick: 'Curto',
  modeQuickHint: 'Uma visão breve.',
  modeDetailed: 'Detalhado',
  modeDetailedHint: 'Estruturado e completo.',
  modeKeyPoints: 'Pontos-chave',
  modeKeyPointsHint: 'Os factos essenciais em lista.',
  languageLabel: 'Língua do resumo',
  languageSame: 'A mesma do documento',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'Modo',
  resultLanguage: 'Língua',
  documentLabel: 'Documento',
  features: [
    feature('☷', 'green', 'Três modos', 'Curto, detalhado ou pontos-chave — escolha o que precisa.'),
    feature('★', 'blue', 'Texto necessário', 'Numa digitalização, faça primeiro o OCR.'),
    feature('✧', 'teal', 'Ficheiro .txt', 'Copie ou transfira; nada fica guardado.')
  ],
  ...seoPt.summarize
};

export const ptTranslate = {
  title: 'Traduzir PDF',
  subtitle: 'Obtenha um PDF traduzido que conserva a disposição tanto quanto possível. Usa créditos de IA (1 crédito por página tratada).',
  tip: 'Usa créditos de IA (1 crédito por página tratada). Imagens, logótipos e tabelas ficam. O texto é traduzido no sítio. A disposição não fica idêntica ao pixel: algumas línguas ficam mais longas ou mais curtas.',
  action: 'Traduzir o PDF',
  running: 'A traduzir o documento…',
  fail: 'Não foi possível traduzir este PDF.',
  doneTitle: 'PDF traduzido pronto',
  doneText: 'Transfira o PDF traduzido. Há também um ficheiro só de texto, se precisar apenas do texto.',
  reset: 'Traduzir outro ficheiro',
  download: 'Transferir o PDF traduzido',
  downloadTxt: 'Transferir o texto traduzido (.txt)',
  source: 'De',
  autoDetect: 'Detetar automaticamente',
  target: 'Para',
  output: 'Resultado',
  preserveLayout: 'Conservar a disposição',
  preserveLayoutHint: 'Manter posições, imagens, tabelas e a hierarquia visual tanto quanto possível.',
  textOnly: 'Só texto',
  textOnlyHint: 'Apenas o texto traduzido, sem reconstruir o desenho original da página.',
  langFr: 'Français',
  langEn: 'English',
  langEs: 'Español',
  langPt: 'Português',
  langDe: 'Deutsch',
  langTr: 'Türkçe',
  langAr: 'العربية',
  langIt: 'Italiano',
  features: [
    feature('A文', 'orange', 'PDF traduzido', 'O resultado principal é um PDF: as imagens ficam, o texto é substituído nas suas zonas.'),
    feature('★', 'blue', 'Disposição tanto quanto possível', 'Uma língua mais longa pode transbordar a caixa; uma mais curta pode deixar espaços. O tamanho da letra adapta-se.'),
    feature('✧', 'purple', 'Digitalizações incluídas', 'Se o PDF tiver pouco texto selecionável, corre primeiro o OCR e depois a tradução.')
  ],
  ...seoPt.translate
};

export const ptHtml = {
  title: 'HTML para PDF',
  subtitle: 'Transforme uma página HTML num PDF com um clique.',
  tip: 'Importe um ficheiro .html ou cole o HTML. Páginas com muito JavaScript ficam pior representadas.',
  action: 'Criar PDF',
  running: 'A converter…',
  fail: 'Não foi possível converter este HTML.',
  doneTitle: 'PDF criado',
  doneText: 'O HTML foi convertido em PDF.',
  reset: 'Converter mais HTML',
  empty: 'Cole HTML ou escolha um ficheiro.',
  pastePh: '<h1>Título</h1><p>O seu conteúdo…</p>',
  useHtml: 'Usar este HTML',
  features: [
    feature('</>', 'purple', 'Ficheiro ou colar', 'Largue um ficheiro .html ou cole o código.'),
    feature('⌘', 'gold', 'Online', 'A conversão corre nos nossos servidores — sem instalar um programa.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O HTML não fica no servidor.')
  ],
  ...seoPt.htmlPdf
};

export const ptExtractPages = {
  title: 'Extrair páginas',
  subtitle: 'Fique só com as páginas de que precisa, num PDF novo.',
  tip: 'Selecione as páginas ou escreva um intervalo como 1-3, 7.',
  action: 'Extrair páginas',
  running: 'A extrair…',
  fail: 'Não foi possível extrair estas páginas.',
  doneTitle: 'Páginas extraídas',
  doneText: 'As páginas escolhidas estão num PDF novo.',
  reset: 'Extrair outro ficheiro',
  invalidRange: 'Indique um intervalo de páginas válido.',
  features: [
    feature('▤', 'green', 'Um ficheiro', 'As páginas escolhidas tornam-se um só PDF, pela ordem.'),
    feature('★', 'blue', 'Sem instalação', 'Escolha as páginas no navegador e depois transfira.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O original não fica no servidor.')
  ],
  seoTitle: 'Extrair páginas de um PDF | One2PDF',
  seoDescription: 'Fique com as páginas que escolher e transfira um PDF novo. No navegador, sem conta para uso ocasional.',
  seoH2: 'Como extrair páginas de um PDF',
  seoP1: 'Precisa das páginas 2 a 5 de um documento mais longo? Passe-as para um PDF novo, sem instalar um programa.',
  seoP2: 'Escolha as páginas, confirme e transfira o resultado. O ficheiro original é apagado no fim do processamento.',
  seoP3: 'Para uso ocasional no plano gratuito não é precisa conta.'
};

export const ptExtractImages = {
  title: 'Extrair imagens',
  subtitle: 'Recupere as imagens incorporadas num PDF e transfira-as.',
  tip: 'Funciona com imagens guardadas no ficheiro, não com uma página que é só uma digitalização de texto.',
  action: 'Extrair imagens',
  running: 'A extrair…',
  fail: 'Não foi possível extrair imagens deste PDF.',
  doneTitle: 'Imagens extraídas',
  doneText: 'Transfira as imagens encontradas no documento.',
  reset: 'Extrair outro ficheiro',
  download: 'Transferir as imagens',
  features: [
    feature('🖼', 'purple', 'Ficheiros incorporados', 'Recupere fotos e gráficos guardados no PDF.'),
    feature('★', 'blue', 'ZIP ou um só ficheiro', 'Uma imagem transfere-se diretamente; várias vêm num ZIP.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'Depois da transferência não fica nada guardado.')
  ],
  seoTitle: 'Extrair imagens de um PDF | One2PDF',
  seoDescription: 'Transfira as imagens incorporadas num PDF. No navegador, sem conta para uso ocasional.',
  seoH2: 'Como extrair imagens de um PDF',
  seoP1: 'Um PDF contém muitas vezes fotos, logótipos ou digitalizações. O One2PDF lista as imagens incorporadas para as poder guardar.',
  seoP2: 'Se o documento for só uma página de texto digitalizada, use o OCR ou PDF para JPG.',
  seoP3: 'O ficheiro original é apagado quando o processamento termina.'
};

export const ptFlatten = {
  title: 'Achatar PDF',
  subtitle: 'Transforme os campos de um formulário em conteúdo fixo, que já não se pode editar.',
  tip: 'Use isto depois de preencher um formulário, para os campos deixarem de ser alteráveis.',
  action: 'Achatar',
  running: 'A achatar…',
  fail: 'Não foi possível achatar este PDF.',
  doneTitle: 'PDF achatado',
  doneText: 'Os campos do formulário fazem agora parte da página.',
  reset: 'Achatar outro ficheiro',
  features: [
    feature('▣', 'orange', 'Campos fixos', 'Os valores continuam visíveis, mas já não se editam.'),
    feature('★', 'blue', 'Depois de preencher', 'Achate o formulário quando estiver completo.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O original não fica guardado.')
  ],
  seoTitle: 'Achatar um formulário PDF | One2PDF',
  seoDescription: 'Fixe os campos de um formulário PDF para deixarem de ser editáveis. No navegador.',
  seoH2: 'Como achatar um PDF',
  seoP1: 'Achatar incorpora os campos do formulário na página. Quem recebe vê os valores, mas não os pode alterar.',
  seoP2: 'O ficheiro tem de conter um formulário PDF. Um PDF sem campos não se achata desta forma.',
  seoP3: 'O processamento é temporário: o original é apagado no fim da operação.'
};

export const ptHeaderFooter = {
  title: 'Cabeçalho e rodapé',
  subtitle: 'Acrescente uma linha curta no topo ou no fundo de cada página.',
  tip: 'Mantenha o texto curto. Os números de página podem ir no rodapé, se quiser.',
  action: 'Aplicar',
  running: 'A aplicar…',
  fail: 'Não foi possível acrescentar o cabeçalho ou o rodapé.',
  doneTitle: 'Cabeçalho e rodapé acrescentados',
  doneText: 'O texto foi aplicado a todas as páginas.',
  reset: 'Editar outro ficheiro',
  header: 'Cabeçalho',
  headerPh: 'Confidencial',
  footer: 'Rodapé',
  footerPh: 'Nome da empresa',
  numbers: 'Acrescentar números de página no rodapé',
  color: 'Cor',
  empty: 'Indique um cabeçalho, um rodapé ou ative os números de página.',
  features: [
    feature('HF', 'blue', 'Todas as páginas', 'O mesmo cabeçalho e rodapé valem para o ficheiro inteiro.'),
    feature('★', 'green', 'Números opcionais', 'Coloque 1 / n no rodapé se precisar.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O original é apagado depois do processamento.')
  ],
  seoTitle: 'Cabeçalho e rodapé num PDF | One2PDF',
  seoDescription: 'Acrescente um cabeçalho, um rodapé ou números de página a cada folha de um PDF. No navegador.',
  seoH2: 'Como pôr cabeçalho e rodapé num PDF',
  seoP1: 'Uma linha curta no topo ou no fundo de cada página chega para marcar um documento.',
  seoP2: 'Escreva o texto, acrescente números de página se quiser e transfira o resultado.',
  seoP3: 'Não é preciso instalar um programa. O ficheiro original não fica guardado.'
};

export const ptFillForm = {
  title: 'Preencher um formulário PDF',
  subtitle: 'Complete os campos de um PDF interativo e transfira o resultado.',
  tip: 'Só PDF com campos de formulário se preenchem aqui. Achate depois para fixar os valores.',
  inspecting: 'A ler os campos do formulário…',
  action: 'Guardar o formulário',
  running: 'A guardar…',
  fail: 'Não foi possível preencher este formulário.',
  doneTitle: 'Formulário preenchido',
  doneText: 'Os seus valores foram escritos no PDF.',
  reset: 'Preencher outro ficheiro',
  checked: 'Marcado',
  choose: 'Escolher',
  flatten: 'Achatar os campos depois de guardar',
  features: [
    feature('☑', 'green', 'Campos interativos', 'Texto, caixas de verificação e listas são detetados automaticamente.'),
    feature('★', 'blue', 'Achatar se quiser', 'Feche as respostas para não poderem ser alteradas depois.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'Depois da transferência não fica nada guardado.')
  ],
  seoTitle: 'Preencher um formulário PDF online | One2PDF',
  seoDescription: 'Preencha os campos de um PDF interativo no navegador e transfira o resultado. Sem conta para uso ocasional.',
  seoH2: 'Como preencher um formulário PDF',
  seoP1: 'Se o PDF tiver campos de formulário, o One2PDF lista-os para escrever as respostas sem imprimir.',
  seoP2: 'Depois pode achatar o formulário: os valores ficam visíveis, mas já não se editam.',
  seoP3: 'O ficheiro original é apagado quando o processamento termina.'
};

export const ptFillSign = {
  title: 'Preencher e assinar um PDF',
  subtitle: 'Acrescente texto, datas, marcas e a sua assinatura diretamente no PDF.',
  select: 'Escolher um PDF',
  orDrop: 'Largue o PDF aqui ou escolha um ficheiro',
  trust: [
    'Simples e rápido',
    'Funciona no navegador',
    'Os ficheiros são apagados depois do processamento'
  ],
  cannotOpen: 'Este PDF não abre ou está protegido.',
  fail: 'Não foi possível gerar o PDF preenchido.',
  running: 'A preparar o PDF…',
  doneTitle: 'O PDF está pronto',
  doneText: 'O documento foi preenchido e assinado. Transfira-o agora.',
  reset: 'Preencher outro PDF',
  download: 'Transferir',
  undo: 'Anular',
  redo: 'Refazer',
  toolsAria: 'Ferramentas para preencher e assinar',
  pagesAria: 'Páginas do documento',
  selectTool: 'Selecionar',
  text: 'Texto',
  signature: 'Assinatura',
  initials: 'Iniciais',
  date: 'Data',
  checkbox: 'Caixa de verificação',
  check: 'Visto',
  cross: 'Cruz',
  circle: 'Círculo',
  draw: 'Desenhar',
  defaultText: 'Texto',
  size: 'Tamanho',
  bold: 'Negrito',
  delete: 'Eliminar',
  duplicate: 'Duplicar',
  choose: 'Escolher',
  signatureTitle: 'Acrescentar a assinatura',
  initialsTitle: 'Acrescentar as iniciais',
  drawTab: 'Desenhar',
  typeTab: 'Escrever',
  importTab: 'Carregar',
  typePlaceholder: 'O seu nome',
  chooseImage: 'Escolher uma imagem',
  importHint: 'PNG ou JPG. A assinatura fica só nesta sessão.',
  clearPad: 'Limpar',
  cancel: 'Cancelar',
  useStamp: 'Usar',
  reuseLast: 'Usar a última',
  features: [
    feature('T', 'orange', 'Texto e datas', 'Coloque texto ou a data de hoje exatamente no sítio certo.'),
    feature('〰', 'blue', 'Assinatura simples', 'Desenhe, escreva ou carregue uma assinatura e mova-a para o lugar.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'O PDF é apagado depois do processamento, como nas outras ferramentas One2PDF.')
  ],
  seoTitle: 'Preencher e assinar PDF online | One2PDF',
  seoDescription: 'Acrescente texto, datas, marcas e a sua assinatura ao PDF e transfira o documento. Sem imprimir.',
  seoH2: 'Como preencher e assinar um PDF',
  seoP1: 'Importe um PDF — contrato, orçamento, certificado ou formulário — e coloque texto, data e assinatura onde devem ficar.',
  seoP2: 'Se o ficheiro já tiver campos interativos, também os pode preencher. Um PDF normal completa-se sempre ao colocar elementos por cima.',
  seoP3: 'O documento original não fica guardado. Uma assinatura limita-se à sessão de trabalho e não serve para treinar um modelo.',
  howTitle: 'Preencher e assinar um PDF',
  howSteps: [
    'Escolha ou largue o PDF',
    'Acrescente texto, marcas ou uma assinatura',
    'Transfira o documento concluído'
  ],
  faqTitle: 'Perguntas sobre preencher e assinar',
  faq: [
    {
      question: 'Preciso de um formulário PDF especial?',
      answer: 'Não. Pode completar qualquer PDF com texto, data e assinatura. Os campos interativos são usados quando já existem.'
    },
    {
      question: 'A minha assinatura fica guardada?',
      answer: 'Não. Uma assinatura criada aqui fica, por defeito, limitada à sessão de trabalho atual.'
    },
    {
      question: 'Os ficheiros ficam depois da transferência?',
      answer: 'Não. Como nas outras ferramentas One2PDF, o ficheiro é processado de forma temporária e apagado depois da transferência.'
    }
  ]
};

export const ptHeic = {
  title: 'HEIC para PDF',
  subtitle: 'Transforme fotos do iPhone (HEIC/HEIF) num PDF que pode enviar.',
  tip: 'Os ficheiros HEIC do iPhone são convertidos e depois colocados no PDF.',
  tipMixed: 'JPG, PNG e WebP podem misturar-se com HEIC no mesmo ficheiro.',
  action: 'Converter para PDF',
  running: 'A converter…',
  fail: 'Não foi possível converter estas imagens para PDF.',
  doneTitle: 'PDF pronto',
  doneText: 'As suas fotos foram reunidas num PDF.',
  reset: 'Converter outras fotos',
  features: [
    feature('HEIC', 'orange', 'Fotos do iPhone', 'Imagens HEIC/HEIF tornam-se páginas de um PDF.'),
    feature('★', 'blue', 'Várias fotos', 'Acrescente mais do que uma imagem; a ordem mantém-se.'),
    feature('✧', 'teal', 'Ficheiros temporários', 'Os originais são apagados depois da conversão.')
  ],
  seoTitle: 'Converter HEIC para PDF | One2PDF',
  seoDescription: 'Transforme fotos HEIC do iPhone num PDF, no navegador. Sem conta para uso ocasional.',
  seoH2: 'Como converter fotos HEIC para PDF',
  seoP1: 'Os iPhone guardam muitas vezes as fotos em HEIC. Converta-as num PDF que abre em qualquer equipamento.',
  seoP2: 'Acrescente uma ou várias fotos, converta e transfira. JPG e PNG podem entrar na mesma lista.',
  seoP3: 'Os ficheiros são processados de forma temporária e depois apagados.'
};
