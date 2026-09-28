import { seoAr } from './arSeo';

const feature = (icon: string, tone: string, title: string, text: string) => ({ icon, tone, title, text });

export const arPricing = {
  eyebrow: 'أسعار واضحة',
  seoTitle: 'أسعار One2PDF: مجاني وPass لمدة 7 أيام وPro',
  seoDescription: 'الخطة المجانية، Pass لمدة 7 أيام بـ {weekPrice} دون تجديد تلقائي، Pro شهري {monthPrice} أو سنوي {yearPrice}. الدفع عبر Stripe.',
  title: 'مجاني أو 7 أيام أو Pro.',
  subtitle: 'بلا التزام مخفي. ينتهي Pass لمدة 7 أيام من تلقاء نفسه. تلغي Pro متى شئت. يمر الدفع عبر Stripe.',
  popular: 'الأكثر اختيارًا',
  discover: 'للتجربة',
  urgent: 'لملف اليوم',
  flexible: 'شهرًا بشهر',
  bestValue: 'أفضل سعر',
  freeName: 'مجاني',
  freePrice: '$0',
  freePeriod: '/ شهر',
  freePitch: 'أدوات PDF الأساسية بحد يومي عادل. بلا بطاقة.',
  freeNote: 'OCR والملفات فوق 20 MB ومزيد من أرصدة الذكاء الاصطناعي في الخطط المدفوعة.',
  freeIncludes: [
    'كل أدوات PDF الأساسية',
    '{dailyJobs} مستندات يوميًا',
    'ملفات حتى {freeSize}',
    '{freeAi} رصيد ذكاء اصطناعي شهريًا (ترجمة وتلخيص)',
    'إعلانات خفيفة غير معيقة',
    'تُعالَج الملفات ثم تُحذف تلقائيًا'
  ],
  freeCta: 'المتابعة مجانًا',
  freeMicro: 'لا حاجة لبطاقة.',
  seeIncludedTools: 'عرض الأدوات المشمولة',
  hideIncludedTools: 'إخفاء القائمة',
  includedToolsTitle: 'أدوات PDF المشمولة',
  weekName: 'Pass لمدة 7 أيام',
  weekTag: 'دفعة واحدة، بلا اشتراك',
  weekNoSubscription: 'دفعة واحدة. بلا اشتراك.',
  weekPrice: '$1.99',
  weekPeriod: 'مرة واحدة',
  weekPitch: 'ملف لليوم؟ وصول مدفوع 7 أيام ثم ينتهي. بلا سحب لاحق.',
  weekIncludes: [
    'دفعة واحدة: {weekPrice}، تُسحب مرة واحدة',
    'لا يتجدد تلقائيًا',
    '7 أيام بلا إعلانات',
    'ملفات حتى {paidSize}',
    'OCR مشمول',
    'معالجة PDF بلا حد لمدة 7 أيام',
    'ترجمة وتلخيص: {weekAi} رصيد ذكاء اصطناعي في الـ Pass (رصيد واحد لكل صفحة)'
  ],
  weekCta: 'فتح 7 أيام — {weekPrice}',
  weekMicro: 'ينتهي من تلقاء نفسه. لا شيء لإلغائه.',
  monthName: 'Pro شهري',
  monthTag: 'للحجم المتغيّر',
  monthPrice: '$3.99',
  monthPeriod: '/ شهر',
  monthPitch: 'خطة مرنة: تقرر شهرًا بشهر.',
  monthIncludes: [
    'بلا إعلانات',
    'ملفات حتى {paidSize}',
    'OCR مشمول',
    'معالجة PDF بلا حد',
    '{proAi} رصيد ذكاء اصطناعي شهريًا (ترجمة وتلخيص)',
    'إلغاء بنقرة واحدة متى شئت'
  ],
  monthCta: 'اختيار Pro الشهري',
  monthMicro: 'بلا التزام. ألغِ متى شئت.',
  proToggleMonthly: 'شهري',
  proToggleYearly: 'سنوي',
  yearName: 'Pro سنوي',
  yearPrice: '$34.90',
  yearPeriod: '/ سنة',
  yearEquiv: 'أي {monthEquiv} شهريًا — {monthsFree} أشهر مجانًا مقارنة بالشهري',
  yearPitch: 'تعود كل أسبوع؟ دفعة سنوية واحدة، نفس وصول Pro، بلا مفاجأة شهرية.',
  yearIncludes: [
    'كل ما يشمله Pro الشهري',
    'ملفات {paidSize}، OCR، بلا إعلانات',
    '{proAi} رصيد ذكاء اصطناعي شهريًا — وليس مخزونًا سنويًا دفعة واحدة',
    'تدفع {paidMonths} أشهر وتحصل على 12',
    'ألغِ متى شئت: يبقى Pro حتى نهاية الفترة المدفوعة'
  ],
  yearBadge: 'أفضل سعر',
  yearCta: 'وفّر بالخطة السنوية',
  yearMicro: 'أفضل سعر شهري. نفس Pro.',
  trust: 'الدفع 100٪ عبر Stripe (بطاقة، Apple Pay، Google Pay). لا يخزّن One2PDF رقم البطاقة.',
  faqTitle: 'أسئلة حول الأسعار',
  faq: [
    {
      question: 'هل يتجدد Pass لمدة 7 أيام تلقائيًا؟',
      answer: 'لا. دفعة واحدة بـ {weekPrice}. بعد 7 أيام ينتهي وصول Pro من تلقاء نفسه. بلا سحب جديد وبلا شيء لإلغائه. إن احتجت بعد ذلك اشترِ Passًا آخر أو انتقل إلى Pro.'
    },
    {
      question: 'هل المدفوعات آمنة؟',
      answer: 'نعم. تمر كل المدفوعات عبر Stripe. لا يرى One2PDF رقم البطاقة ولا يخزّنه. يمكنك الدفع ببطاقة أو Apple Pay أو Google Pay.'
    },
    {
      question: 'هل يمكنني مغادرة Pro متى شئت؟',
      answer: 'نعم. الشهري ({monthPrice}) والسنوي ({yearPrice}) يُلغَيان بنقرة في بوابة Stripe. بلا غرامة. بعدها تعود للمجاني: {dailyJobs} مستندات يوميًا، ملفات {freeSize}، {freeAi} رصيد ذكاء اصطناعي شهريًا، إعلانات خفيفة.'
    },
    {
      question: 'دفعت — كيف أدخل؟',
      answer: 'سجّل الدخول بالبريد وكلمة المرور من الشراء. يصبح Pass لمدة 7 أيام أو Pro متاحًا على هذا الجهاز. في حسابي ترى المدة المتبقية والمستندات المعالجة.'
    },
    {
      question: 'كيف تعمل أرصدة الذكاء الاصطناعي؟',
      answer: 'الترجمة: رصيد واحد لكل صفحة معالجة، حتى {translateCap} صفحة. التلخيص: رصيد واحد لكل صفحة، بحد أقصى {summarizeCap} رصيدًا لكل ملف (تُقطع ملفات PDF الأطول قبل النموذج). العملية الفاشلة لا تحتفظ بالرصيد. مجاني: {freeAi} شهريًا. Pass لمدة 7 أيام: {weekAi} للـ Pass. Pro الشهري والسنوي: {proAi} لكل شهر تقويمي.'
    }
  ],
  paying: 'جاري فتح الدفع…',
  payFail: 'تعذّر بدء الدفع.',
  canceled: 'أُلغي الدفع. يمكنك المحاولة مجددًا متى شئت.',
  successTitle: 'أنت الآن على One2PDF Pro',
  successText: 'حساب Pro جاهز.',
  successBenefitsTitle: 'مزايا Pro لديك',
  successStatus: 'نشط',
  successRenews: 'يُجدَّد في {date}',
  successCta: 'استخدم One2PDF Pro',
  successManage: 'إدارة الاشتراك',
  successVerifying: 'جاري التحقق من الدفع…',
  successSeoTitle: 'مرحبًا بك في One2PDF Pro',
  successSeoDescription: 'تأكيد دفع One2PDF Pro. استخدم كل أدوات PDF بلا حد يومي.',
  successBenefitsPass: [
    'بلا إعلانات',
    'ملفات حتى 100 MB',
    'OCR مشمول',
    'بلا حد يومي للمستندات',
    '100 رصيد ذكاء اصطناعي لمدة 7 أيام',
    'ألغِ أو أدِر متى شئت'
  ],
  successBenefitsPro: [
    'بلا إعلانات',
    'ملفات حتى 100 MB',
    'OCR مشمول',
    'بلا حد يومي للمستندات',
    '500 رصيد ذكاء اصطناعي شهريًا',
    'ألغِ أو أدِر متى شئت'
  ],
  successPeriodWeek: '7 أيام · دفعة واحدة',
  successPeriodMonth: 'شهري',
  successPeriodYear: 'سنوي',
  successUnverified: 'تعذّر على Stripe التحقق من هذا الدفع. إن كنت قد دفعت للتو فانتظر قليلًا ثم أعد المحاولة.',
  successFailTitle: 'لم يُؤكَّد الدفع',
  activeAccess: 'وصول Pro نشط بالفعل على هذا الجهاز.',
  alreadyActive: 'الـ Pass نشط بالفعل — عرض حسابي',
  restoreBanner: 'هل دفعت؟ لا تدفع مجددًا. سجّل الدخول بالبريد المستخدم في الدفع.',
  manage: 'إدارة الاشتراك',
  logout: 'تسجيل الخروج',
  accountPro: 'Pro',
  myAccount: 'حسابي'
};

export const arUpgrade = {
  kicker: 'الملف كبير جدًا',
  title: 'هذا الملف يتجاوز الحد المجاني',
  text: '« {name} » حجمه {size}. تقبل الخطة المجانية {limit} — لم يُرسل الملف. يقبل Pass وPro ملفات حتى 100 MB:',
  limit: '20 MB',
  dismiss: 'أغلق واختر ملفًا أصغر',
  batchKicker: 'عدة ملفات',
  batchTitle: 'معالجة عدة ملفات معًا ميزة Pro',
  batchText: 'اخترت {count} ملفات دفعة واحدة. في الخطة المجانية أضفها واحدًا تلو الآخر — لم يُرسل شيء. Pass لمدة 7 أيام أو Pro يفتح المعالجة الجماعية.',
  batchDismiss: 'أغلق وأضف الملفات واحدًا تلو الآخر',
  premiumKicker: 'ميزة Pro',
  premiumTitle: '{feature} يتطلب Pro',
  premiumText: 'OCR متاح مع Pass لمدة 7 أيام أو Pro. أدوات PDF الأساسية (دمج، ضغط، تحويل، تحرير…) تبقى مجانية. غيّر الخطة لفتح OCR:',
  creditsTitle: '{feature} يستخدم رصيد الذكاء الاصطناعي',
  creditsText: '{feature} يستخدم رصيد الذكاء الاصطناعي (رصيد واحد لكل صفحة). يشمل المجاني رصيدًا شهريًا؛ Pass لمدة 7 أيام وPro يشملان أكثر. ليست أداة Pro فقط:',
  creditsKicker: 'أرصدة الذكاء الاصطناعي',
  premiumDismiss: 'العودة إلى الأدوات المجانية',
  featureOcr: 'OCR',
  featureTranslate: 'ترجمة بالذكاء الاصطناعي',
  featureSummarize: 'تلخيص بالذكاء الاصطناعي',
  alreadyPaid: 'دفعت — تسجيل الدخول'
};

export const arAccount = {
  seoTitle: 'حسابي في One2PDF',
  seoDescription: 'اعرض Pass في One2PDF والمدة المتبقية والمستندات المعالجة.',
  title: 'حسابي',
  lead: 'الـ Pass مرتبط بحسابك. سجّل الدخول لرؤية المدة المتبقية.',
  emailLabel: 'البريد الإلكتروني',
  emailPlaceholder: 'البريد الإلكتروني',
  cta: 'استعادة الـ Pass',
  working: 'جاري التحقق…',
  noPass: 'لا يوجد Pass نشط لهذا البريد.',
  plan: 'الخطة',
  validUntil: 'صالح حتى',
  remaining: 'المدة المتبقية',
  daysLeft: 'تبقى {count} يومًا',
  hoursLeft: 'تبقى {count} س',
  unlimitedTime: 'بلا تاريخ انتهاء',
  expired: 'انتهت الصلاحية',
  used: 'المستندات المعالجة',
  usedToday: 'المعالج اليوم',
  remainingDocs: 'المستندات المتبقية اليوم',
  unlimitedDocs: 'بلا حد',
  freeLimit: '{used} / {limit} مستند مجاني اليوم',
  aiCredits: 'أرصدة الذكاء الاصطناعي',
  toolsCta: 'استخدم الأدوات',
  loginTitle: 'دخول الـ Pass',
  loginLead: 'أدخل البريد وكلمة المرور لحساب One2PDF.',
  loginSeoTitle: 'تسجيل الدخول إلى One2PDF',
  loginSeoDescription: 'سجّل الدخول لاستعادة الـ Pass وأدوات PDF.',
  loginHint: 'استخدم بريد الشراء لربط Pass لمدة 7 أيام.',
  authLoginTitle: 'دخول الحساب',
  authSignupTitle: 'إنشاء حساب',
  loginAsideTitle: 'ادخل إلى مساحتك',
  loginAsideText: 'أدخل البريد وكلمة المرور للوصول إلى حساب One2PDF والـ Pass والمعالجة الجماعية وأدوات PDF.',
  signupAsideTitle: 'أدوات PDF للعمل اليومي',
  signupAsideText: 'أنشئ حسابًا لدمج PDF وضغطه وتحويله وحمايته. إن دفعت فاستخدم نفس البريد — يُربط الـ Pass تلقائيًا.',
  signupSeoTitle: 'إنشاء حساب One2PDF',
  signupSeoDescription: 'أنشئ حساب One2PDF بالبريد وكلمة المرور. يُربط Pass مدفوع تلقائيًا.',
  namePlaceholder: 'الاسم',
  emailEnter: 'أدخل البريد',
  passwordPlaceholder: 'كلمة المرور',
  loginCta: 'تسجيل الدخول',
  signupCta: 'إنشاء حساب',
  forgotPassword: 'نسيت كلمة المرور؟',
  forgotHint: 'إعادة تعيين كلمة المرور بالبريد غير متاحة بعد. أنشئ حسابًا ببريد الدفع أو اكتب إلى support@one2pdf.com.',
  noAccount: 'ليس لديك حساب بعد؟',
  createAccount: 'إنشاء حساب',
  hasAccount: 'لديك حساب بالفعل؟',
  signInLink: 'تسجيل الدخول',
  seeTools: 'عرض كل الأدوات',
  termsPrefix: 'بإنشاء حساب فإنك توافق على:',
  loginFail: 'البريد أو كلمة المرور غير صحيحة.',
  signupFail: 'تعذّر إنشاء الحساب.'
};

export const arBlogPage = {
  title: 'مدونة One2PDF',
  subtitle: 'أدلة عملية لإرسال PDF وتقليصه ومعالجته.',
  readMore: 'اقرأ المقال',
  back: 'كل المقالات',
  seoTitle: 'مدونة PDF: أدلة ونصائح | One2PDF',
  seoDescription: 'أدلة لضغط PDF ودمجه وتحويله. البريد وGmail والملفات في مدونة One2PDF.',
  publishedOn: 'نُشر في {date}'
};

export const arLegal = {
  privacyTitle: 'الخصوصية',
  privacyUpdated: 'آخر تحديث: سبتمبر 2026',
  privacyIntro: 'لا يبيع One2PDF مستنداتك ولا يحتفظ بها لتدريب النماذج.',
  privacyData: 'عند استخدام أداة يُرسل الملف إلى خوادمنا طوال مدة العملية (تحويل، ضغط، OCR وما شابه). ملف تعريف ارتباط تقني يحتفظ بحصة الخطة المجانية ووصول Pro إن كنت مشتركًا.',
  privacyRetention: 'يُحذف الملف الأصلي بعد انتهاء المعالجة. تبقى النتيجة جاهزة لتنزيل واحد ثم تُزال. الملفات غير المنزَّلة تُحذف خلال 15 دقيقة على الأكثر.',
  privacyThird: 'المدفوعات: Stripe. قياس الجمهور: Google Analytics (gtag). تحويلات Office وOCR: على خوادمنا. التلخيص والترجمة: مزوّد ذكاء اصطناعي فقط إن استخدمت تلك الأدوات.',
  privacyRights: 'يمكنك طلب الوصول إلى بيانات الفوترة المرتبطة ببريد Stripe أو تصحيحها أو حذفها. اكتب عبر صفحة الاتصال.',
  contactTitle: 'اتصل بنا',
  contactIntro: 'سؤال أو مشكلة أو دعم Pro؟ اكتب إلينا. نرد بالإنجليزية والفرنسية.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'مشتركو Pro السنوي يحصلون على دعم بريد ذي أولوية.'
};

export const arToPng = {
  title: 'من PDF إلى PNG',
  subtitle: 'حوّل كل صفحة من PDF إلى صورة PNG.',
  tip: 'الصفحات المتعددة تأتي في ZIP. يحافظ PNG على الرسوم المسطحة أوضح.',
  action: 'تحويل إلى PNG',
  running: 'جاري التحويل…',
  fail: 'تعذّر تحويل هذا PDF إلى PNG.',
  doneTitle: 'اكتمل التحويل',
  doneText: 'صُدّرت الصفحات كـ PNG.',
  reset: 'تحويل ملف آخر',
  download: 'تنزيل ملفات PNG',
  features: [
    feature('PNG', 'green', 'صورة لكل صفحة', 'تصبح كل صفحة PNG مناسبًا للويب والشاشة.'),
    feature('✓', 'blue', 'ZIP تلقائي', 'تُجمع الصفحات المتعددة في أرشيف واحد.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'يُعالَج PDF المصدر ثم يُحذف.')
  ],
  ...seoAr.toPng
};

export const arToText = {
  title: 'من PDF إلى نص',
  subtitle: 'استخرج النص القابل للتحديد من PDF.',
  tip: 'يعمل على ملفات PDF ذات طبقة نص. للمسح نفّذ OCR أولًا.',
  action: 'استخراج النص',
  running: 'جاري الاستخراج…',
  fail: 'تعذّر استخراج النص.',
  doneTitle: 'تم استخراج النص',
  doneText: 'حُفظ المحتوى في ملف نصي.',
  reset: 'استخراج من ملف آخر',
  download: 'تنزيل النص',
  features: [
    feature('TXT', 'blue', 'نص بسيط', 'احصل على المحتوى للصق أو البحث أو إعادة الكتابة.'),
    feature('★', 'green', 'بلا تثبيت', 'يتم الاستخراج في المتصفح ثم تنزّل .txt.'),
    feature('✧', 'purple', 'عمليات المسح', 'إذا كان PDF صورة فقط فاستخدم أداة OCR.')
  ],
  ...seoAr.toText
};

export const arUnlock = {
  title: 'إلغاء قفل PDF',
  subtitle: 'أزل كلمة مرور الفتح من PDF تملكه.',
  tip: 'أدخل كلمة المرور الحالية. لا يُفتح PDF مقفول بدونها.',
  action: 'إلغاء القفل',
  running: 'جاري إلغاء القفل…',
  fail: 'تعذّر إلغاء قفل هذا PDF.',
  doneTitle: 'أُلغي قفل PDF',
  doneText: 'يفتح الملف الآن دون كلمة مرور.',
  reset: 'إلغاء قفل ملف آخر',
  password: 'كلمة المرور',
  passwordPh: 'كلمة المرور الحالية',
  features: [
    feature('🔓', 'orange', 'فتح حر', 'لم يعد PDF الناتج يطلب كلمة مرور.'),
    feature('✓', 'blue', 'ملفك', 'استخدم فقط مستندًا تعرف كلمة مروره.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يبقى الأصل على الخادم.')
  ],
  ...seoAr.unlock
};

export const arOcr = {
  title: 'OCR لـ PDF',
  subtitle: 'تعرّف على نص الصفحات الممسوحة واحصل على PDF قابل للاستخدام. مشمول في Pass لمدة 7 أيام أو Pro.',
  tip: 'يستخدم OCR أداة Tesseract. تعتمد الجودة على وضوح المسح. مشمول في Pass لمدة 7 أيام أو Pro.',
  action: 'بدء OCR',
  running: 'جاري التعرف…',
  fail: 'تعذّر تشغيل OCR.',
  doneTitle: 'اكتمل OCR',
  doneText: 'تُعرّف على النص. نزّل PDF الناتج.',
  reset: 'معالجة ملف آخر',
  features: [
    feature('OCR', 'gold', 'صفحات ممسوحة', 'حوّل صورة مستند إلى نص معرَّف.'),
    feature('★', 'green', 'لغة المتصفح', 'يتبع التعرف اللغة المكتشفة (AR، EN، FR، ES…).'),
    feature('✧', 'purple', 'ثم ترجم أو لخّص', 'عندما يوجد نص تصبح الأدوات الأخرى مفيدة.')
  ],
  ...seoAr.ocr
};

export const arSummarize = {
  title: 'تلخيص PDF',
  subtitle: 'احصل على ملخص واضح من نص المستند. يستخدم رصيد الذكاء الاصطناعي (رصيد واحد لكل صفحة).',
  tip: 'يستخدم رصيد الذكاء الاصطناعي (رصيد واحد لكل صفحة، بحد أقصى 20 لكل ملف). اختر الأسلوب واللغة ثم لخّص. عمليات المسح تحتاج OCR أولًا.',
  action: 'تلخيص PDF',
  running: 'جاري فحص PDF…',
  fail: 'تعذّر تلخيص هذا PDF.',
  doneTitle: 'الملخص جاهز',
  doneText: 'اقرأ الملخص أو انسخه أو نزّله.',
  reset: 'تلخيص PDF آخر',
  download: 'تنزيل',
  copy: 'نسخ',
  copied: 'تم النسخ',
  modeQuestion: 'كيف تريد الملخص؟',
  modeQuick: 'قصير',
  modeQuickHint: 'نظرة سريعة.',
  modeDetailed: 'مفصّل',
  modeDetailedHint: 'منظَّم وشامل.',
  modeKeyPoints: 'نقاط رئيسية',
  modeKeyPointsHint: 'حقائق أساسية في قائمة.',
  languageLabel: 'لغة الملخص',
  languageSame: 'نفس لغة المستند',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'الوضع',
  resultLanguage: 'اللغة',
  documentLabel: 'المستند',
  features: [
    feature('☷', 'green', 'ثلاثة أوضاع', 'قصير أو مفصّل أو نقاط رئيسية — اختر ما تحتاجه.'),
    feature('★', 'blue', 'يتطلب نصًا', 'للمسح نفّذ OCR أولًا.'),
    feature('✧', 'teal', 'ملف .txt', 'انسخ أو نزّل؛ لا يُحفظ شيء.')
  ],
  ...seoAr.summarize
};

export const arTranslate = {
  title: 'ترجمة PDF',
  subtitle: 'احصل على PDF مترجم يحافظ على التخطيط قدر الإمكان. يستخدم رصيد الذكاء الاصطناعي (رصيد واحد لكل صفحة معالجة).',
  tip: 'يستخدم رصيد الذكاء الاصطناعي (رصيد واحد لكل صفحة معالجة). تبقى الصور والشعارات والجداول. يُترجم النص في مكانه. التخطيط ليس مطابقًا بكسلًا بكسل: بعض اللغات تطول أو تقصر.',
  action: 'ترجمة PDF',
  running: 'جاري ترجمة المستند…',
  fail: 'تعذّر ترجمة هذا PDF.',
  doneTitle: 'PDF المترجم جاهز',
  doneText: 'نزّل PDF المترجم. إن احتجت النص فقط يتوفر أيضًا ملف نصي.',
  reset: 'ترجمة ملف آخر',
  download: 'تنزيل PDF المترجم',
  downloadTxt: 'تنزيل النص المترجم (.txt)',
  source: 'المصدر',
  autoDetect: 'اكتشاف تلقائي',
  target: 'الهدف',
  output: 'النتيجة',
  preserveLayout: 'الحفاظ على التخطيط',
  preserveLayoutHint: 'احتفظ بالمواضع والصور والجداول والتسلسل البصري قدر الإمكان.',
  textOnly: 'نص فقط',
  textOnlyHint: 'النص المترجم فقط دون إعادة رسم الصفحة الأصلية.',
  langFr: 'Français',
  langEn: 'English',
  langEs: 'Español',
  langPt: 'Português',
  langDe: 'Deutsch',
  langTr: 'Türkçe',
  langAr: 'العربية',
  langIt: 'Italiano',
  features: [
    feature('A文', 'orange', 'PDF مترجم', 'النتيجة الرئيسية PDF: تبقى الصور ويتغير النص في مناطقه.'),
    feature('★', 'blue', 'تخطيط قدر الإمكان', 'لغة أطول قد تفيض من الصندوق؛ لغة أقصر قد تترك فراغًا. يتكيّف حجم الخط.'),
    feature('✧', 'purple', 'يشمل المسح', 'إن قل النص القابل للتحديد في PDF يعمل OCR أولًا ثم الترجمة.')
  ],
  ...seoAr.translate
};

export const arHtml = {
  title: 'من HTML إلى PDF',
  subtitle: 'حوّل صفحة HTML إلى PDF بنقرة واحدة.',
  tip: 'استورد ملف .html أو الصق HTML. الصفحات بكثير من JavaScript تُمثَّل أسوأ.',
  action: 'إنشاء PDF',
  running: 'جاري التحويل…',
  fail: 'تعذّر تحويل هذا HTML.',
  doneTitle: 'تم إنشاء PDF',
  doneText: 'حُوّل HTML إلى PDF.',
  reset: 'تحويل HTML آخر',
  empty: 'الصق HTML أو اختر ملفًا.',
  pastePh: '<h1>عنوان</h1><p>محتواك…</p>',
  useHtml: 'استخدم هذا HTML',
  features: [
    feature('</>', 'purple', 'ملف أو لصق', 'أسقط .html أو الصق الرمز.'),
    feature('⌘', 'gold', 'عبر الإنترنت', 'يعمل التحويل على خوادمنا — بلا برنامج للتثبيت.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يبقى HTML على الخادم.')
  ],
  ...seoAr.htmlPdf
};

export const arExtractPages = {
  title: 'استخراج الصفحات',
  subtitle: 'احتفظ فقط بالصفحات المطلوبة في PDF جديد.',
  tip: 'اختر الصفحات أو اكتب نطاقًا مثل 1-3, 7.',
  action: 'استخراج الصفحات',
  running: 'جاري الاستخراج…',
  fail: 'تعذّر استخراج هذه الصفحات.',
  doneTitle: 'تم استخراج الصفحات',
  doneText: 'الصفحات المحددة في PDF جديد.',
  reset: 'استخراج من ملف آخر',
  invalidRange: 'حدّد نطاق صفحات صالحًا.',
  features: [
    feature('▤', 'green', 'ملف واحد', 'تصبح الصفحات المحددة PDFًا واحدًا بالترتيب.'),
    feature('★', 'blue', 'بلا تثبيت', 'اختر الصفحات في المتصفح ثم نزّل.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يبقى الأصل على الخادم.')
  ],
  seoTitle: 'استخراج صفحات من PDF | One2PDF',
  seoDescription: 'احتفظ بالصفحات التي اخترتها ونزّل PDF جديدًا. في المتصفح، دون حساب للاستخدام العرضي.',
  seoH2: 'استخراج صفحات من PDF',
  seoP1: 'تحتاج الصفحات من 2 إلى 5 من مستند أطول؟ انقلها إلى PDF جديد دون تثبيت برنامج.',
  seoP2: 'اختر الصفحات، أكّد، ونزّل النتيجة. يُحذف الملف الأصلي بعد انتهاء المعالجة.',
  seoP3: 'الخطة المجانية لا تتطلب حسابًا للاستخدام العرضي.'
};

export const arExtractImages = {
  title: 'استخراج الصور',
  subtitle: 'استخرج الصور المضمّنة في PDF ونزّلها.',
  tip: 'يعمل مع الصور المخزَّنة في الملف وليس مع صفحة هي مسح نص فقط.',
  action: 'استخراج الصور',
  running: 'جاري الاستخراج…',
  fail: 'تعذّر استخراج صور من هذا PDF.',
  doneTitle: 'تم استخراج الصور',
  doneText: 'نزّل الصور الموجودة في المستند.',
  reset: 'استخراج من ملف آخر',
  download: 'تنزيل الصور',
  features: [
    feature('🖼', 'purple', 'ملفات مضمّنة', 'استرجع الصور والرسوم المخزَّنة في PDF.'),
    feature('★', 'blue', 'ZIP أو ملف واحد', 'صورة واحدة تُنزَّل مباشرة؛ عدة صور تأتي في ZIP.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يُحفظ شيء بعد التنزيل.')
  ],
  seoTitle: 'استخراج صور من PDF | One2PDF',
  seoDescription: 'نزّل الصور المضمّنة في PDF. في المتصفح، دون حساب للاستخدام العرضي.',
  seoH2: 'استخراج صور من PDF',
  seoP1: 'غالبًا يحتوي PDF على صور أو شعارات أو مسح. يسرد One2PDF الصور المضمّنة لتتمكن من حفظها.',
  seoP2: 'إن كان المستند صفحة نص ممسوحة فقط فاستخدم OCR أو PDF إلى JPG.',
  seoP3: 'يُحذف الملف الأصلي بعد انتهاء المعالجة.'
};

export const arFlatten = {
  title: 'تسطيح PDF',
  subtitle: 'حوّل حقول النموذج إلى محتوى ثابت لم يعد قابلًا للتحرير.',
  tip: 'استخدمه بعد ملء نموذج حتى لا تبقى الحقول قابلة للتغيير.',
  action: 'تسطيح',
  running: 'جاري التسطيح…',
  fail: 'تعذّر تسطيح هذا PDF.',
  doneTitle: 'تم تسطيح PDF',
  doneText: 'أصبحت حقول النموذج جزءًا من الصفحة.',
  reset: 'تسطيح ملف آخر',
  features: [
    feature('▣', 'orange', 'حقول ثابتة', 'تبقى القيم ظاهرة لكن لم تعد قابلة للتحرير.'),
    feature('★', 'blue', 'بعد الملء', 'سطّح عند اكتمال النموذج.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يُحفظ الأصل.')
  ],
  seoTitle: 'تسطيح نموذج PDF | One2PDF',
  seoDescription: 'ثبّت حقول نموذج PDF بحيث لم تعد قابلة للتحرير. في المتصفح.',
  seoH2: 'تسطيح PDF',
  seoP1: 'يدمج التسطيح حقول النموذج في الصفحة. يرى المستلم القيم لكن لا يغيّرها.',
  seoP2: 'يجب أن يحتوي الملف على نموذج PDF. PDF بلا حقول لا يُسطَّح بهذه الطريقة.',
  seoP3: 'المعالجة مؤقتة: يُحذف الأصل في نهاية العملية.'
};

export const arHeaderFooter = {
  title: 'رأس وتذييل',
  subtitle: 'أضف سطرًا قصيرًا أعلى أو أسفل كل صفحة.',
  tip: 'أبقِ النص قصيرًا. يمكن وضع أرقام الصفحات في التذييل إن أردت.',
  action: 'تطبيق',
  running: 'جاري التطبيق…',
  fail: 'تعذّر إضافة رأس أو تذييل.',
  doneTitle: 'أُضيف الرأس والتذييل',
  doneText: 'طُبّق النص على كل الصفحات.',
  reset: 'تحرير ملف آخر',
  header: 'الرأس',
  headerPh: 'سري',
  footer: 'التذييل',
  footerPh: 'اسم الشركة',
  numbers: 'إضافة أرقام صفحات في التذييل',
  color: 'اللون',
  empty: 'حدّد رأسًا أو تذييلًا أو فعّل أرقام الصفحات.',
  features: [
    feature('HF', 'blue', 'كل الصفحات', 'نفس الرأس والتذييل ينطبقان على الملف كله.'),
    feature('★', 'green', 'أرقام اختيارية', 'ضع 1 / n في التذييل إن لزم.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'يُحذف الأصل بعد المعالجة.')
  ],
  seoTitle: 'رأس وتذييل PDF | One2PDF',
  seoDescription: 'أضف رأسًا أو تذييلًا أو أرقام صفحات إلى كل صفحة من PDF. في المتصفح.',
  seoH2: 'وضع رأس وتذييل على PDF',
  seoP1: 'سطر قصير أعلى أو أسفل كل صفحة يكفي لتمييز المستند.',
  seoP2: 'اكتب النص، أضف أرقام صفحات إن أردت، ونزّل النتيجة.',
  seoP3: 'لا حاجة لتثبيت برنامج. لا يُحفظ الملف الأصلي.'
};

export const arFillForm = {
  title: 'ملء نموذج PDF',
  subtitle: 'أكمل حقول PDF تفاعلي ونزّل النتيجة.',
  tip: 'هنا تُملأ فقط ملفات PDF ذات حقول نموذج. سطّح لاحقًا لتثبيت القيم.',
  inspecting: 'جاري قراءة حقول النموذج…',
  action: 'حفظ النموذج',
  running: 'جاري الحفظ…',
  fail: 'تعذّر ملء هذا النموذج.',
  doneTitle: 'تم ملء النموذج',
  doneText: 'كُتبت قيمك في PDF.',
  reset: 'ملء ملف آخر',
  checked: 'محدَّد',
  choose: 'اختر',
  flatten: 'تسطيح الحقول بعد الحفظ',
  features: [
    feature('☑', 'green', 'حقول تفاعلية', 'يُكتشف النص والمربعات والقوائم تلقائيًا.'),
    feature('★', 'blue', 'تسطيح اختياري', 'أقفل الإجابات حتى لا تُعدَّل لاحقًا.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'لا يُحفظ شيء بعد التنزيل.')
  ],
  seoTitle: 'ملء نموذج PDF عبر الإنترنت | One2PDF',
  seoDescription: 'املأ حقول PDF تفاعلي في المتصفح ونزّل النتيجة. دون حساب للاستخدام العرضي.',
  seoH2: 'ملء نموذج PDF',
  seoP1: 'إن وُجدت حقول نموذج في PDF يسردها One2PDF لتكتب الإجابات دون طباعة.',
  seoP2: 'يمكنك بعد ذلك تسطيح النموذج: تبقى القيم ظاهرة لكن لم تعد قابلة للتحرير.',
  seoP3: 'يُحذف الملف الأصلي بعد انتهاء المعالجة.'
};

export const arFillSign = {
  title: 'ملء وتوقيع PDF',
  subtitle: 'أضف نصًا وتاريخًا وعلامة وتوقيعك مباشرة على PDF.',
  select: 'اختر PDF',
  orDrop: 'أسقط PDF هنا أو اختر ملفًا',
  trust: [
    'بسيط وسريع',
    'يعمل في المتصفح',
    'تُحذف الملفات بعد المعالجة'
  ],
  cannotOpen: 'لا يُفتح هذا PDF أو هو محمي.',
  fail: 'تعذّر إنشاء PDF المعبأ.',
  running: 'جاري تجهيز PDF…',
  doneTitle: 'PDF جاهز',
  doneText: 'مُلئ المستند ووُقّع. نزّله الآن.',
  reset: 'ملء PDF آخر',
  download: 'تنزيل',
  undo: 'تراجع',
  redo: 'إعادة',
  toolsAria: 'أدوات الملء والتوقيع',
  pagesAria: 'صفحات المستند',
  selectTool: 'تحديد',
  text: 'نص',
  signature: 'توقيع',
  initials: 'أحرف أولى',
  date: 'تاريخ',
  checkbox: 'مربع',
  check: 'صح',
  cross: 'خطأ',
  circle: 'دائرة',
  draw: 'رسم',
  defaultText: 'نص',
  size: 'الحجم',
  bold: 'عريض',
  delete: 'حذف',
  duplicate: 'تكرار',
  choose: 'اختر',
  signatureTitle: 'إضافة توقيع',
  initialsTitle: 'إضافة أحرف أولى',
  drawTab: 'رسم',
  typeTab: 'كتابة',
  importTab: 'رفع',
  typePlaceholder: 'اسمك',
  chooseImage: 'اختر صورة',
  importHint: 'PNG أو JPG. يبقى التوقيع في هذه الجلسة فقط.',
  clearPad: 'مسح',
  cancel: 'إلغاء',
  useStamp: 'استخدام',
  reuseLast: 'استخدام الأخير',
  features: [
    feature('T', 'orange', 'نص وتواريخ', 'ضع النص أو تاريخ اليوم في موضعه الدقيق.'),
    feature('〰', 'blue', 'توقيع بسيط', 'ارسم توقيعًا أو اكتبه أو ارفعه ثم انقله إلى موضعه.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'يُحذف PDF بعد المعالجة كما في أدوات One2PDF الأخرى.')
  ],
  seoTitle: 'ملء وتوقيع PDF | One2PDF',
  seoDescription: 'أضف نصًا وتاريخًا وعلامة وتوقيعك إلى PDF ونزّل المستند. دون طباعة.',
  seoH2: 'ملء PDF وتوقيعه',
  seoP1: 'استورد PDF — عقد أو عرض أو شهادة أو نموذج — وضع النص والتاريخ والتوقيع حيث يجب أن تكون.',
  seoP2: 'إن وُجدت حقول تفاعلية يمكنك ملؤها أيضًا. PDF العادي يُكمَّل دائمًا بوضع العناصر فوقه.',
  seoP3: 'لا يُحفظ المستند الأصلي. التوقيع يقتصر على جلسة العمل ولا يُستخدم لتدريب نموذج.',
  howTitle: 'ملء وتوقيع PDF',
  howSteps: [
    'اختر PDF أو أسقطه',
    'أضف نصًا أو علامة أو توقيعًا',
    'نزّل المستند المكتمل'
  ],
  faqTitle: 'أسئلة حول الملء والتوقيع',
  faq: [
    {
      question: 'هل أحتاج نموذج PDF خاصًا؟',
      answer: 'لا. يمكنك إكمال أي PDF بنص وتاريخ وتوقيع. تُستخدم الحقول التفاعلية إن وُجدت أصلًا.'
    },
    {
      question: 'هل يُحفظ توقيعي؟',
      answer: 'لا. التوقيع المنشأ هنا يبقى كقاعدة في جلسة العمل الحالية فقط.'
    },
    {
      question: 'هل تبقى الملفات بعد التنزيل؟',
      answer: 'لا. كما في أدوات One2PDF الأخرى يُعالَج الملف مؤقتًا ويُحذف بعد التنزيل.'
    }
  ]
};

export const arHeic = {
  title: 'من HEIC إلى PDF',
  subtitle: 'حوّل صور iPhone (HEIC/HEIF) إلى PDF قابل للإرسال.',
  tip: 'تُحوَّل ملفات HEIC من iPhone ثم تُوضع في PDF.',
  tipMixed: 'يمكن خلط JPG وPNG وWebP مع HEIC في نفس الملف.',
  action: 'تحويل إلى PDF',
  running: 'جاري التحويل…',
  fail: 'تعذّر تحويل هذه الصور إلى PDF.',
  doneTitle: 'PDF جاهز',
  doneText: 'دُمجت صورك في PDF.',
  reset: 'تحويل صور أخرى',
  features: [
    feature('HEIC', 'orange', 'صور iPhone', 'تصبح صور HEIC/HEIF صفحات في PDF.'),
    feature('★', 'blue', 'عدة صور', 'أضف أكثر من صورة؛ يُحفظ الترتيب.'),
    feature('✧', 'teal', 'ملفات مؤقتة', 'تُحذف الأصول بعد التحويل.')
  ],
  seoTitle: 'تحويل HEIC إلى PDF | One2PDF',
  seoDescription: 'حوّل صور iPhone بصيغة HEIC إلى PDF في المتصفح. دون حساب للاستخدام العرضي.',
  seoH2: 'تحويل صور HEIC إلى PDF',
  seoP1: 'غالبًا يحفظ iPhone الصور كـ HEIC. حوّلها إلى PDF يُفتح على أي جهاز.',
  seoP2: 'أضف صورة أو أكثر، حوّل، ونزّل. يمكن إدخال JPG وPNG في نفس القائمة.',
  seoP3: 'تُعالَج الملفات مؤقتًا ثم تُحذف.'
};
