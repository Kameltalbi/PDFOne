import { seoTr } from './trSeo';

const feature = (icon: string, tone: string, title: string, text: string) => ({ icon, tone, title, text });

export const trPricing = {
  eyebrow: 'Net fiyatlar',
  seoTitle: 'One2PDF fiyatları: ücretsiz, 7 günlük Pass ve Pro',
  seoDescription: 'Ücretsiz plan, yenilenmeyen {weekPrice} tutarında 7 günlük Pass, aylık Pro {monthPrice} veya yıllık {yearPrice}. Ödeme Stripe ile.',
  title: 'Ücretsiz, 7 gün veya Pro.',
  subtitle: 'Gizli taahhüt yok. 7 günlük Pass kendiliğinden biter. Pro’yu istediğinizde iptal edersiniz. Ödeme Stripe üzerinden geçer.',
  popular: 'En sık seçilen',
  discover: 'Denemek için',
  urgent: 'Bugünkü bir dosya için',
  flexible: 'Ay ay',
  bestValue: 'En iyi fiyat',
  freeName: 'Ücretsiz',
  freePrice: '$0',
  freePeriod: '/ ay',
  freePitch: 'Temel PDF araçları, adil bir günlük limitle. Kart gerekmez.',
  freeNote: 'OCR, 20 MB üstü dosyalar ve daha fazla YZ kredisi ücretli planlardadır.',
  freeIncludes: [
    'Tüm temel PDF araçları',
    'Günde {dailyJobs} belge',
    '{freeSize} boyutuna kadar dosyalar',
    'Ayda {freeAi} YZ kredisi (çevir ve özetle)',
    'Engellemeyen hafif reklam',
    'Dosyalar işlenir, sonra otomatik silinir'
  ],
  freeCta: 'Ücretsiz devam et',
  freeMicro: 'Kart gerekmez.',
  seeIncludedTools: 'Dahil araçları gör',
  hideIncludedTools: 'Listeyi gizle',
  includedToolsTitle: 'Dahil PDF araçları',
  weekName: '7 günlük Pass',
  weekTag: 'Tek ödeme, abonelik yok',
  weekNoSubscription: 'Tek ödeme. Abonelik yok.',
  weekPrice: '$1.99',
  weekPeriod: 'bir kez',
  weekPitch: 'Bugün bir dosya mı? 7 gün ücretli erişim, sonra biter. Sonraki çekim yok.',
  weekIncludes: [
    'Tek ödeme: {weekPrice}, bir kez çekilir',
    'Kendiliğinden yenilenmez',
    '7 gün reklamsız',
    '{paidSize} boyutuna kadar dosyalar',
    'OCR dahil',
    '7 gün sınırsız PDF işlemi',
    'Çevir ve özetle: Pass’te {weekAi} YZ kredisi (sayfa başına 1 kredi)'
  ],
  weekCta: '7 günü aç — {weekPrice}',
  weekMicro: 'Kendiliğinden biter. İptal edilecek bir şey yok.',
  monthName: 'Aylık Pro',
  monthTag: 'Değişken hacim için',
  monthPrice: '$3.99',
  monthPeriod: '/ ay',
  monthPitch: 'Esnek plan: ay ay siz karar verirsiniz.',
  monthIncludes: [
    'Reklamsız',
    '{paidSize} boyutuna kadar dosyalar',
    'OCR dahil',
    'Sınırsız PDF işlemi',
    'Ayda {proAi} YZ kredisi (çevir ve özetle)',
    'İstediğinizde tek tıkla iptal'
  ],
  monthCta: 'Aylık Pro’yu seç',
  monthMicro: 'Taahhüt yok. İstediğinizde iptal edin.',
  proToggleMonthly: 'Aylık',
  proToggleYearly: 'Yıllık',
  yearName: 'Yıllık Pro',
  yearPrice: '$34.90',
  yearPeriod: '/ yıl',
  yearEquiv: 'yani ayda {monthEquiv} — aylığa göre {monthsFree} ay bedava',
  yearPitch: 'Her hafta mı dönüyorsunuz? Yıllık tek ödeme, aynı Pro erişimi, aylık sürpriz yok.',
  yearIncludes: [
    'Aylık Pro’nun içerdiği her şey',
    '{paidSize} dosyalar, OCR, reklamsız',
    'Ayda {proAi} YZ kredisi — bir seferde yıllık stok değil',
    '{paidMonths} ay ödersiniz, 12 ay alırsınız',
    'İstediğinizde iptal: Pro, ödenen dönem bitene kadar kalır'
  ],
  yearBadge: 'En iyi fiyat',
  yearCta: 'Yıllık planla tasarruf edin',
  yearMicro: 'En iyi aylık fiyat. Aynı Pro.',
  trust: 'Ödeme %100 Stripe üzerinden (kart, Apple Pay, Google Pay). One2PDF kart numarasını saklamaz.',
  faqTitle: 'Fiyatlar hakkında sorular',
  faq: [
    {
      question: '7 günlük Pass kendiliğinden yenilenir mi?',
      answer: 'Hayır. {weekPrice} tutarında tek ödemedir. 7 gün sonra Pro erişimi kendiliğinden biter. Yeni çekim yok, iptal edilecek bir şey yok. Hâlâ gerekiyorsa başka bir Pass alın veya Pro’ya geçin.'
    },
    {
      question: 'Ödemeler güvenli mi?',
      answer: 'Evet. Tüm ödemeler Stripe üzerinden geçer. One2PDF kart numarasını görmez ve saklamaz. Kart, Apple Pay veya Google Pay ile ödeyebilirsiniz.'
    },
    {
      question: 'Pro’dan istediğim zaman çıkabilir miyim?',
      answer: 'Evet. Aylık ({monthPrice}) ve yıllık ({yearPrice}) Stripe portalında tek tıkla iptal edilir. Ceza yok. Sonra ücretsize dönersiniz: günde {dailyJobs} belge, {freeSize} dosyalar, ayda {freeAi} YZ kredisi, hafif reklam.'
    },
    {
      question: 'Ödedim — nasıl girerim?',
      answer: 'Satın almadaki e-posta ve parolayla giriş yapın. 7 günlük Pass veya Pro bu cihazda kullanılabilir olur. Hesabım’da kalan süreyi ve işlenen belgeleri görürsünüz.'
    },
    {
      question: 'YZ kredileri nasıl çalışır?',
      answer: 'Çeviri, işlenen sayfa başına 1 kredi, en fazla {translateCap} sayfa. Özet, sayfa başına 1 kredi, dosya başına en fazla {summarizeCap} kredi (daha uzun PDF’ler modelden önce kesilir). Başarısız işlem kredi tutmaz. Ücretsiz: ayda {freeAi}. 7 günlük Pass: Pass için {weekAi}. Aylık ve yıllık Pro: takvim ayı başına {proAi}.'
    }
  ],
  paying: 'Ödeme açılıyor…',
  payFail: 'Ödeme başlatılamadı.',
  canceled: 'Ödeme iptal edildi. İstediğinizde yeniden deneyebilirsiniz.',
  successTitle: 'Artık One2PDF Pro’dasınız',
  successText: 'Pro hesabınız hazır.',
  successBenefitsTitle: 'Pro avantajlarınız',
  successStatus: 'Etkin',
  successRenews: '{date} tarihinde yenilenir',
  successCta: 'One2PDF Pro’yu kullan',
  successManage: 'Aboneliği yönet',
  successVerifying: 'Ödeme doğrulanıyor…',
  successSeoTitle: 'One2PDF Pro’ya hoş geldiniz',
  successSeoDescription: 'One2PDF Pro ödemesi onaylandı. Tüm PDF araçlarını günlük limit olmadan kullanın.',
  successBenefitsPass: [
    'Reklamsız',
    '100 MB’a kadar dosyalar',
    'OCR dahil',
    'Günlük belge limiti yok',
    '7 gün için 100 YZ kredisi',
    'İstediğinizde iptal edin veya yönetin'
  ],
  successBenefitsPro: [
    'Reklamsız',
    '100 MB’a kadar dosyalar',
    'OCR dahil',
    'Günlük belge limiti yok',
    'Ayda 500 YZ kredisi',
    'İstediğinizde iptal edin veya yönetin'
  ],
  successPeriodWeek: '7 gün · tek ödeme',
  successPeriodMonth: 'Aylık',
  successPeriodYear: 'Yıllık',
  successUnverified: 'Stripe bu ödemeyi doğrulayamadı. Yeni ödediyseniz bir süre bekleyip yeniden deneyin.',
  successFailTitle: 'Ödeme doğrulanmadı',
  activeAccess: 'Pro erişimi bu cihazda zaten etkin.',
  alreadyActive: 'Pass zaten etkin — hesabımı gör',
  restoreBanner: 'Ödediniz mi? Yeniden ödemeyin. Ödemedeki e-posta ile giriş yapın.',
  manage: 'Aboneliği yönet',
  logout: 'Çıkış',
  accountPro: 'Pro',
  myAccount: 'Hesabım'
};

export const trUpgrade = {
  kicker: 'Dosya çok büyük',
  title: 'Bu dosya ücretsiz limiti aşıyor',
  text: '« {name} » {size} boyutunda. Ücretsiz plan {limit} kabul eder — dosya gönderilmedi. Pass ve Pro 100 MB’a kadar dosya kabul eder:',
  limit: '20 MB',
  dismiss: 'Kapatın ve daha küçük bir dosya seçin',
  batchKicker: 'Birden fazla dosya',
  batchTitle: 'Birden fazla dosyayı birlikte işlemek Pro özelliğidir',
  batchText: 'Bir seferde {count} dosya seçtiniz. Ücretsiz planda teker teker ekleyin — hiçbir şey gönderilmedi. 7 günlük Pass veya Pro toplu işlemeyi açar.',
  batchDismiss: 'Kapatın ve dosyaları teker teker ekleyin',
  premiumKicker: 'Pro özelliği',
  premiumTitle: '{feature} Pro ister',
  premiumText: 'OCR, 7 günlük Pass veya Pro ile kullanılabilir. Temel PDF araçları (birleştir, sıkıştır, dönüştür, düzenle…) ücretsiz kalır. OCR’ı açmak için plan değiştirin:',
  creditsTitle: '{feature} YZ kredisi kullanır',
  creditsText: '{feature} YZ kredisi kullanır (sayfa başına 1 kredi). Ücretsiz aylık bir bakiye içerir; 7 günlük Pass ve Pro daha fazlasını içerir. Yalnızca Pro aracı değildir:',
  creditsKicker: 'YZ kredileri',
  premiumDismiss: 'Ücretsiz araçlara dön',
  featureOcr: 'OCR',
  featureTranslate: 'YZ ile çeviri',
  featureSummarize: 'YZ ile özet',
  alreadyPaid: 'Ödedim — giriş yap'
};

export const trAccount = {
  seoTitle: 'One2PDF hesabım',
  seoDescription: 'One2PDF Pass’inizi, kalan süreyi ve işlenen belgeleri görün.',
  title: 'Hesabım',
  lead: 'Pass hesabınıza bağlıdır. Kalan süreyi görmek için giriş yapın.',
  emailLabel: 'E-posta',
  emailPlaceholder: 'E-posta',
  cta: 'Pass’imi geri yükle',
  working: 'Doğrulanıyor…',
  noPass: 'Bu e-posta için etkin Pass yok.',
  plan: 'Plan',
  validUntil: 'Geçerlilik',
  remaining: 'Kalan süre',
  daysLeft: '{count} gün kaldı',
  hoursLeft: '{count} sa kaldı',
  unlimitedTime: 'Bitiş tarihi yok',
  expired: 'Süresi doldu',
  used: 'İşlenen belgeler',
  usedToday: 'Bugün işlenen',
  remainingDocs: 'Bugün kalan belgeler',
  unlimitedDocs: 'Limit yok',
  freeLimit: 'Bugün {used} / {limit} ücretsiz belge',
  aiCredits: 'YZ kredileri',
  toolsCta: 'Araçları kullan',
  loginTitle: 'Pass’e giriş',
  loginLead: 'One2PDF hesabınızın e-postasını ve parolasını girin.',
  loginSeoTitle: 'One2PDF’ye giriş',
  loginSeoDescription: 'Pass’i ve PDF araçlarını geri almak için giriş yapın.',
  loginHint: '7 günlük Pass’i bağlamak için satın almadaki e-postayı kullanın.',
  authLoginTitle: 'Hesaba gir',
  authSignupTitle: 'Hesap oluştur',
  loginAsideTitle: 'Alanınıza girin',
  loginAsideText: 'One2PDF hesabına, Pass’e, toplu işlemlere ve PDF araçlarına erişmek için e-posta ve parola girin.',
  signupAsideTitle: 'Günlük iş için PDF araçları',
  signupAsideText: 'PDF birleştirmek, sıkıştırmak, dönüştürmek ve korumak için hesap oluşturun. Ödediyseniz aynı e-postayı kullanın — Pass kendiliğinden bağlanır.',
  signupSeoTitle: 'One2PDF hesabı oluştur',
  signupSeoDescription: 'E-posta ve parola ile One2PDF hesabı oluşturun. Ödenmiş bir Pass otomatik bağlanır.',
  namePlaceholder: 'Ad',
  emailEnter: 'E-postayı girin',
  passwordPlaceholder: 'Parola',
  loginCta: 'Giriş',
  signupCta: 'Kayıt ol',
  forgotPassword: 'Parolayı mı unuttunuz?',
  forgotHint: 'Parola sıfırlama e-postası henüz yok. Ödemedeki e-posta ile hesap oluşturun veya support@one2pdf.com adresine yazın.',
  noAccount: 'Henüz hesabınız yok mu?',
  createAccount: 'Hesap oluştur',
  hasAccount: 'Zaten hesabınız var mı?',
  signInLink: 'Giriş',
  seeTools: 'Tüm araçları gör',
  termsPrefix: 'Hesap oluşturarak şunu kabul edersiniz:',
  loginFail: 'E-posta veya parola hatalı.',
  signupFail: 'Hesap oluşturulamadı.'
};

export const trBlogPage = {
  title: 'One2PDF blogu',
  subtitle: 'PDF göndermek, küçültmek ve işlemek için pratik rehberler.',
  readMore: 'Yazıyı oku',
  back: 'Tüm yazılar',
  seoTitle: 'PDF blogu: rehberler ve öneriler | One2PDF',
  seoDescription: 'PDF sıkıştırmak, birleştirmek ve dönüştürmek için rehberler. E-posta, Gmail ve dosyalar, One2PDF blogunda.',
  publishedOn: '{date} tarihinde yayımlandı'
};

export const trLegal = {
  privacyTitle: 'Gizlilik',
  privacyUpdated: 'Son güncelleme: Eylül 2026',
  privacyIntro: 'One2PDF belgelerinizi satmaz ve modelleri eğitmek için saklamaz.',
  privacyData: 'Bir araç kullandığınızda dosya, işlemin süresi boyunca sunucularımıza gönderilir (dönüştürme, sıkıştırma, OCR ve benzeri). Teknik bir çerez ücretsiz plan kotasını ve aboneyseniz Pro erişimini tutar.',
  privacyRetention: 'Orijinal dosya işlem bitince silinir. Sonuç bir indirme için hazır kalır, sonra kaldırılır. İndirilmeyen dosyalar en geç 15 dakikada silinir.',
  privacyThird: 'Ödemeler: Stripe. Kitle ölçümü: Google Analytics (gtag). Office dönüşümleri ve OCR: sunucularımızda. Özet ve çeviri: yalnızca o araçları kullanırsanız bir YZ sağlayıcısı.',
  privacyRights: 'Stripe e-postasına bağlı fatura verilerine erişim, düzeltme veya silme isteyebilirsiniz. İletişim sayfasından yazın.',
  contactTitle: 'İletişim',
  contactIntro: 'Soru, sorun veya Pro desteği mi? Yazın. İngilizce ve Fransızca yanıtlarız.',
  contactEmail: 'support@one2pdf.com',
  contactPriority: 'Yıllık Pro abonelerinin öncelikli e-posta desteği vardır.'
};

export const trToPng = {
  title: 'PDF’den PNG’ye',
  subtitle: 'Bir PDF’nin her sayfasını bir PNG görsele dönüştürün.',
  tip: 'Birden fazla sayfa bir ZIP’te gelir. PNG düz grafiği daha net tutar.',
  action: 'PNG’ye dönüştür',
  running: 'Dönüştürülüyor…',
  fail: 'Bu PDF PNG’ye dönüştürülemedi.',
  doneTitle: 'Dönüştürme tamamlandı',
  doneText: 'Sayfalar PNG olarak dışa aktarıldı.',
  reset: 'Başka bir dosyayı dönüştür',
  download: 'PNG dosyalarını indir',
  features: [
    feature('PNG', 'green', 'Sayfa başına bir görsel', 'Her sayfa web ve ekran için uygun bir PNG olur.'),
    feature('✓', 'blue', 'Otomatik ZIP', 'Birden fazla sayfa bir arşivde toplanır.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Kaynak PDF işlenir, sonra silinir.')
  ],
  ...seoTr.toPng
};

export const trToText = {
  title: 'PDF’den metne',
  subtitle: 'PDF’nin seçilebilir metnini çıkarın.',
  tip: 'Metin katmanı olan PDF’lerde çalışır. Taramada önce OCR yapın.',
  action: 'Metni çıkar',
  running: 'Çıkarılıyor…',
  fail: 'Metin çıkarılamadı.',
  doneTitle: 'Metin çıkarıldı',
  doneText: 'İçerik bir metin dosyasına kaydedildi.',
  reset: 'Başka bir dosyadan çıkar',
  download: 'Metni indir',
  features: [
    feature('TXT', 'blue', 'Düz metin', 'Yapıştırmak, aramak veya yeniden yazmak için içeriği alın.'),
    feature('★', 'green', 'Kurulum yok', 'Çıkarma tarayıcıda olur; sonra .txt indirirsiniz.'),
    feature('✧', 'purple', 'Taramalar', 'PDF yalnızca görüntüyse OCR aracını kullanın.')
  ],
  ...seoTr.toText
};

export const trUnlock = {
  title: 'PDF Kilidini Aç',
  subtitle: 'Size ait bir PDF’nin açılış parolasını kaldırın.',
  tip: 'Geçerli parolayı girin. O olmadan kilitli bir PDF açılmaz.',
  action: 'Kilidi aç',
  running: 'Kilit açılıyor…',
  fail: 'Bu PDF’nin kilidi açılamadı.',
  doneTitle: 'PDF kilidi açıldı',
  doneText: 'Dosya artık parola olmadan açılır.',
  reset: 'Başka bir dosyanın kilidini aç',
  password: 'Parola',
  passwordPh: 'Geçerli parola',
  features: [
    feature('🔓', 'orange', 'Serbest açılış', 'Sonuç PDF artık parola sormaz.'),
    feature('✓', 'blue', 'Sizin dosyanız', 'Yalnızca parolasını bildiğiniz bir belge kullanın.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Orijinal sunucuda kalmaz.')
  ],
  ...seoTr.unlock
};

export const trOcr = {
  title: 'PDF OCR',
  subtitle: 'Taranmış sayfaların metnini tanıyın ve kullanılabilir bir PDF alın. 7 günlük Pass veya Pro’ya dahildir.',
  tip: 'OCR, Tesseract kullanır. Kalite taramanın netliğine bağlıdır. 7 günlük Pass veya Pro’ya dahildir.',
  action: 'OCR’ı başlat',
  running: 'Tanınıyor…',
  fail: 'OCR çalıştırılamadı.',
  doneTitle: 'OCR tamamlandı',
  doneText: 'Metin tanındı. Oluşan PDF’yi indirin.',
  reset: 'Başka bir dosyayı işle',
  features: [
    feature('OCR', 'gold', 'Taranmış sayfalar', 'Bir belgenin görüntüsünü tanınmış metne dönüştürün.'),
    feature('★', 'green', 'Tarayıcı dili', 'Tanıma algılanan dili izler (TR, EN, FR, ES…).'),
    feature('✧', 'purple', 'Sonra çevir veya özetle', 'Metin varken diğer araçlar işe yarar.')
  ],
  ...seoTr.ocr
};

export const trSummarize = {
  title: 'PDF özetle',
  subtitle: 'Belgenin metninden net bir özet alın. YZ kredisi kullanır (sayfa başına 1 kredi).',
  tip: 'YZ kredisi kullanır (sayfa başına 1 kredi, dosya başına en fazla 20). Biçemi ve dili seçin, sonra özetleyin. Taramalar önce OCR ister.',
  action: 'PDF’yi özetle',
  running: 'PDF inceleniyor…',
  fail: 'Bu PDF özetlenemedi.',
  doneTitle: 'Özet hazır',
  doneText: 'Özeti okuyun, kopyalayın veya indirin.',
  reset: 'Başka bir PDF özetle',
  download: 'İndir',
  copy: 'Kopyala',
  copied: 'Kopyalandı',
  modeQuestion: 'Özeti nasıl istersiniz?',
  modeQuick: 'Kısa',
  modeQuickHint: 'Hızlı bir bakış.',
  modeDetailed: 'Ayrıntılı',
  modeDetailedHint: 'Yapılı ve eksiksiz.',
  modeKeyPoints: 'Ana maddeler',
  modeKeyPointsHint: 'Temel olgular liste halinde.',
  languageLabel: 'Özet dili',
  languageSame: 'Belgeyle aynı',
  langEn: 'English',
  langFr: 'Français',
  langEs: 'Español',
  langDe: 'Deutsch',
  langIt: 'Italiano',
  langPt: 'Português',
  langAr: 'العربية',
  resultMode: 'Mod',
  resultLanguage: 'Dil',
  documentLabel: 'Belge',
  features: [
    feature('☷', 'green', 'Üç mod', 'Kısa, ayrıntılı veya ana maddeler — ihtiyacınız olanı seçin.'),
    feature('★', 'blue', 'Metin gerekir', 'Taramada önce OCR yapın.'),
    feature('✧', 'teal', '.txt dosyası', 'Kopyalayın veya indirin; hiçbir şey saklanmaz.')
  ],
  ...seoTr.summarize
};

export const trTranslate = {
  title: 'PDF çevir',
  subtitle: 'Yerleşimi olabildiğince koruyan çevrilmiş bir PDF alın. YZ kredisi kullanır (işlenen sayfa başına 1 kredi).',
  tip: 'YZ kredisi kullanır (işlenen sayfa başına 1 kredi). Görseller, logolar ve tablolar kalır. Metin yerinde çevrilir. Yerleşim piksel piksel aynı kalmaz: bazı diller uzar veya kısalır.',
  action: 'PDF’yi çevir',
  running: 'Belge çevriliyor…',
  fail: 'Bu PDF çevrilemedi.',
  doneTitle: 'Çevrilmiş PDF hazır',
  doneText: 'Çevrilmiş PDF’yi indirin. Yalnızca metin gerekiyorsa bir metin dosyası da vardır.',
  reset: 'Başka bir dosyayı çevir',
  download: 'Çevrilmiş PDF’yi indir',
  downloadTxt: 'Çevrilmiş metni indir (.txt)',
  source: 'Kaynak',
  autoDetect: 'Otomatik algıla',
  target: 'Hedef',
  output: 'Sonuç',
  preserveLayout: 'Yerleşimi koru',
  preserveLayoutHint: 'Konumları, görselleri, tabloları ve görsel hiyerarşiyi olabildiğince tutun.',
  textOnly: 'Yalnızca metin',
  textOnlyHint: 'Sayfanın özgün çizimini kurmadan yalnızca çevrilmiş metin.',
  langFr: 'Français',
  langEn: 'English',
  langEs: 'Español',
  langPt: 'Português',
  langDe: 'Deutsch',
  langTr: 'Türkçe',
  langAr: 'العربية',
  langIt: 'Italiano',
  features: [
    feature('A文', 'orange', 'Çevrilmiş PDF', 'Ana sonuç bir PDF’tir: görseller kalır, metin kendi bölgelerinde değişir.'),
    feature('★', 'blue', 'Olabildiğince yerleşim', 'Daha uzun bir dil kutudan taşabilir; daha kısa bir dil boşluk bırakabilir. Yazı boyutu uyum sağlar.'),
    feature('✧', 'purple', 'Taramalar dahil', 'PDF’te seçilebilir metin azsa önce OCR, sonra çeviri çalışır.')
  ],
  ...seoTr.translate
};

export const trHtml = {
  title: 'HTML’den PDF’ye',
  subtitle: 'Bir HTML sayfasını tek tıkla PDF yapın.',
  tip: 'Bir .html dosyası içe aktarın veya HTML yapıştırın. Çok JavaScript’li sayfalar daha kötü temsil edilir.',
  action: 'PDF oluştur',
  running: 'Dönüştürülüyor…',
  fail: 'Bu HTML dönüştürülemedi.',
  doneTitle: 'PDF oluşturuldu',
  doneText: 'HTML, PDF’ye dönüştürüldü.',
  reset: 'Başka HTML dönüştür',
  empty: 'HTML yapıştırın veya bir dosya seçin.',
  pastePh: '<h1>Başlık</h1><p>İçeriğiniz…</p>',
  useHtml: 'Bu HTML’i kullan',
  features: [
    feature('</>', 'purple', 'Dosya veya yapıştır', 'Bir .html bırakın veya kodu yapıştırın.'),
    feature('⌘', 'gold', 'Çevrimiçi', 'Dönüştürme sunucularımızda çalışır — program kurmanız gerekmez.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'HTML sunucuda kalmaz.')
  ],
  ...seoTr.htmlPdf
};

export const trExtractPages = {
  title: 'Sayfaları çıkar',
  subtitle: 'Yalnızca gereken sayfaları yeni bir PDF’te tutun.',
  tip: 'Sayfaları seçin veya 1-3, 7 gibi bir aralık yazın.',
  action: 'Sayfaları çıkar',
  running: 'Çıkarılıyor…',
  fail: 'Bu sayfalar çıkarılamadı.',
  doneTitle: 'Sayfalar çıkarıldı',
  doneText: 'Seçilen sayfalar yeni bir PDF’te.',
  reset: 'Başka bir dosyadan çıkar',
  invalidRange: 'Geçerli bir sayfa aralığı belirtin.',
  features: [
    feature('▤', 'green', 'Tek dosya', 'Seçilen sayfalar sırayla tek bir PDF olur.'),
    feature('★', 'blue', 'Kurulum yok', 'Sayfaları tarayıcıda seçin, sonra indirin.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Orijinal sunucuda kalmaz.')
  ],
  seoTitle: 'PDF’den sayfa çıkar | One2PDF',
  seoDescription: 'Seçtiğiniz sayfaları tutun ve yeni bir PDF indirin. Tarayıcıda, ara sıra kullanım için hesapsız.',
  seoH2: 'PDF’den sayfa çıkarmak',
  seoP1: 'Daha uzun bir belgenin 2 ile 5. sayfalarına mı ihtiyacınız var? Program kurmadan yeni bir PDF’ye geçirin.',
  seoP2: 'Sayfaları seçin, onaylayın ve sonucu indirin. Orijinal dosya işlem bitince silinir.',
  seoP3: 'Ücretsiz planda ara sıra kullanım için hesap gerekmez.'
};

export const trExtractImages = {
  title: 'Görselleri çıkar',
  subtitle: 'Bir PDF’ye gömülü görselleri alın ve indirin.',
  tip: 'Dosyada kayıtlı görsellerle çalışır; yalnızca metin taraması olan bir sayfayla değil.',
  action: 'Görselleri çıkar',
  running: 'Çıkarılıyor…',
  fail: 'Bu PDF’ten görsel çıkarılamadı.',
  doneTitle: 'Görseller çıkarıldı',
  doneText: 'Belgede bulunan görselleri indirin.',
  reset: 'Başka bir dosyadan çıkar',
  download: 'Görselleri indir',
  features: [
    feature('🖼', 'purple', 'Gömülü dosyalar', 'PDF’te kayıtlı fotoğraf ve grafikleri alın.'),
    feature('★', 'blue', 'ZIP veya tek dosya', 'Tek görsel doğrudan iner; birden fazlası ZIP’te gelir.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'İndirmeden sonra hiçbir şey saklanmaz.')
  ],
  seoTitle: 'PDF’den görsel çıkar | One2PDF',
  seoDescription: 'Bir PDF’ye gömülü görselleri indirin. Tarayıcıda, ara sıra kullanım için hesapsız.',
  seoH2: 'PDF’den görsel çıkarmak',
  seoP1: 'Bir PDF çoğu zaman fotoğraf, logo veya tarama içerir. One2PDF gömülü görselleri kaydedebilmeniz için listeler.',
  seoP2: 'Belge yalnızca taranmış bir metin sayfasıysa OCR veya PDF’den JPG’ye kullanın.',
  seoP3: 'Orijinal dosya işlem bitince silinir.'
};

export const trFlatten = {
  title: 'PDF’i düzleştir',
  subtitle: 'Form alanlarını artık düzenlenemeyen sabit içeriğe dönüştürün.',
  tip: 'Bir formu doldurduktan sonra kullanın; alanlar değiştirilebilir kalmasın.',
  action: 'Düzleştir',
  running: 'Düzleştiriliyor…',
  fail: 'Bu PDF düzleştirilemedi.',
  doneTitle: 'PDF düzleştirildi',
  doneText: 'Form alanları artık sayfanın parçası.',
  reset: 'Başka bir dosyayı düzleştir',
  features: [
    feature('▣', 'orange', 'Sabit alanlar', 'Değerler görünür kalır ama artık düzenlenmez.'),
    feature('★', 'blue', 'Doldurduktan sonra', 'Form tamamlanınca düzleştirin.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Orijinal saklanmaz.')
  ],
  seoTitle: 'PDF formunu düzleştir | One2PDF',
  seoDescription: 'Bir PDF formunun alanlarını artık düzenlenemez olsun diye sabitleyin. Tarayıcıda.',
  seoH2: 'PDF düzleştirmek',
  seoP1: 'Düzleştirmek form alanlarını sayfaya gömer. Alan kişi değerleri görür ama değiştiremez.',
  seoP2: 'Dosyada bir PDF formu olmalıdır. Alanı olmayan bir PDF bu şekilde düzleşmez.',
  seoP3: 'İşlem geçicidir: orijinal işlem sonunda silinir.'
};

export const trHeaderFooter = {
  title: 'Üstbilgi ve altbilgi',
  subtitle: 'Her sayfanın üstüne veya altına kısa bir satır ekleyin.',
  tip: 'Metni kısa tutun. İsterseniz sayfa numaraları altbilgiye gidebilir.',
  action: 'Uygula',
  running: 'Uygulanıyor…',
  fail: 'Üstbilgi veya altbilgi eklenemedi.',
  doneTitle: 'Üstbilgi ve altbilgi eklendi',
  doneText: 'Metin tüm sayfalara uygulandı.',
  reset: 'Başka bir dosyayı düzenle',
  header: 'Üstbilgi',
  headerPh: 'Gizli',
  footer: 'Altbilgi',
  footerPh: 'Şirket adı',
  numbers: 'Altbilgiye sayfa numarası ekle',
  color: 'Renk',
  empty: 'Bir üstbilgi, bir altbilgi belirtin veya sayfa numaralarını açın.',
  features: [
    feature('HF', 'blue', 'Tüm sayfalar', 'Aynı üstbilgi ve altbilgi dosyanın tamamı için geçerlidir.'),
    feature('★', 'green', 'İsteğe bağlı numaralar', 'Gerekirse altbilgiye 1 / n koyun.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Orijinal işlemden sonra silinir.')
  ],
  seoTitle: 'PDF üstbilgi ve altbilgi | One2PDF',
  seoDescription: 'Bir PDF’nin her sayfasına üstbilgi, altbilgi veya sayfa numarası ekleyin. Tarayıcıda.',
  seoH2: 'PDF’ye üstbilgi ve altbilgi koymak',
  seoP1: 'Her sayfanın üstünde veya altında kısa bir satır belgeyi işaretlemek için yeter.',
  seoP2: 'Metni yazın, isterseniz sayfa numarası ekleyin ve sonucu indirin.',
  seoP3: 'Program kurmanız gerekmez. Orijinal dosya saklanmaz.'
};

export const trFillForm = {
  title: 'PDF formu doldur',
  subtitle: 'Etkileşimli bir PDF’nin alanlarını tamamlayın ve sonucu indirin.',
  tip: 'Burada yalnızca form alanlı PDF’ler doldurulur. Değerleri sabitlemek için sonra düzleştirin.',
  inspecting: 'Form alanları okunuyor…',
  action: 'Formu kaydet',
  running: 'Kaydediliyor…',
  fail: 'Bu form doldurulamadı.',
  doneTitle: 'Form dolduruldu',
  doneText: 'Değerleriniz PDF’ye yazıldı.',
  reset: 'Başka bir dosyayı doldur',
  checked: 'İşaretli',
  choose: 'Seç',
  flatten: 'Kaydettikten sonra alanları düzleştir',
  features: [
    feature('☑', 'green', 'Etkileşimli alanlar', 'Metin, kutular ve listeler otomatik algılanır.'),
    feature('★', 'blue', 'İsterseniz düzleştirin', 'Yanıtları sonradan değiştirilemesin diye kapatın.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'İndirmeden sonra hiçbir şey saklanmaz.')
  ],
  seoTitle: 'PDF formu çevrimiçi doldur | One2PDF',
  seoDescription: 'Etkileşimli bir PDF’nin alanlarını tarayıcıda doldurun ve sonucu indirin. Ara sıra kullanım için hesapsız.',
  seoH2: 'PDF formu doldurmak',
  seoP1: 'PDF’te form alanları varsa One2PDF onları listeler; yanıtları yazdırmadan yazarsınız.',
  seoP2: 'Sonra formu düzleştirebilirsiniz: değerler görünür kalır ama artık düzenlenmez.',
  seoP3: 'Orijinal dosya işlem bitince silinir.'
};

export const trFillSign = {
  title: 'PDF doldur ve imzala',
  subtitle: 'Metin, tarih, işaret ve imzanızı doğrudan PDF’ye ekleyin.',
  select: 'Bir PDF seçin',
  orDrop: 'PDF’yi buraya bırakın veya bir dosya seçin',
  trust: [
    'Basit ve hızlı',
    'Tarayıcıda çalışır',
    'Dosyalar işlemden sonra silinir'
  ],
  cannotOpen: 'Bu PDF açılmıyor veya korumalı.',
  fail: 'Doldurulmuş PDF oluşturulamadı.',
  running: 'PDF hazırlanıyor…',
  doneTitle: 'PDF hazır',
  doneText: 'Belge dolduruldu ve imzalandı. Şimdi indirin.',
  reset: 'Başka bir PDF doldur',
  download: 'İndir',
  undo: 'Geri al',
  redo: 'Yinele',
  toolsAria: 'Doldurma ve imzalama araçları',
  pagesAria: 'Belge sayfaları',
  selectTool: 'Seç',
  text: 'Metin',
  signature: 'İmza',
  initials: 'Parafe',
  date: 'Tarih',
  checkbox: 'Kutu',
  check: 'Onay',
  cross: 'Çarpı',
  circle: 'Daire',
  draw: 'Çiz',
  defaultText: 'Metin',
  size: 'Boyut',
  bold: 'Kalın',
  delete: 'Sil',
  duplicate: 'Çoğalt',
  choose: 'Seç',
  signatureTitle: 'İmza ekle',
  initialsTitle: 'Parafe ekle',
  drawTab: 'Çiz',
  typeTab: 'Yaz',
  importTab: 'Yükle',
  typePlaceholder: 'Adınız',
  chooseImage: 'Bir görsel seçin',
  importHint: 'PNG veya JPG. İmza yalnızca bu oturumda kalır.',
  clearPad: 'Temizle',
  cancel: 'İptal',
  useStamp: 'Kullan',
  reuseLast: 'Sonuncuyu kullan',
  features: [
    feature('T', 'orange', 'Metin ve tarihler', 'Metni veya bugünün tarihini tam yerine koyun.'),
    feature('〰', 'blue', 'Basit imza', 'Bir imza çizin, yazın veya yükleyin ve yerine taşıyın.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'PDF, diğer One2PDF araçlarında olduğu gibi işlemden sonra silinir.')
  ],
  seoTitle: 'PDF doldur ve imzala | One2PDF',
  seoDescription: 'PDF’ye metin, tarih, işaret ve imzanızı ekleyin, belgeyi indirin. Yazdırmadan.',
  seoH2: 'PDF doldurmak ve imzalamak',
  seoP1: 'Bir PDF içe aktarın — sözleşme, teklif, sertifika veya form — ve metin, tarih ile imzayı durmaları gereken yere koyun.',
  seoP2: 'Dosyada etkileşimli alanlar varsa onları da doldurabilirsiniz. Normal bir PDF her zaman öğeleri üstüne koyarak tamamlanır.',
  seoP3: 'Orijinal belge saklanmaz. Bir imza çalışma oturumuyla sınırlıdır ve bir modeli eğitmek için kullanılmaz.',
  howTitle: 'PDF doldur ve imzala',
  howSteps: [
    'PDF’yi seçin veya bırakın',
    'Metin, işaret veya imza ekleyin',
    'Tamamlanan belgeyi indirin'
  ],
  faqTitle: 'Doldurma ve imzalama hakkında sorular',
  faq: [
    {
      question: 'Özel bir PDF formu gerekir mi?',
      answer: 'Hayır. Herhangi bir PDF’yi metin, tarih ve imza ile tamamlayabilirsiniz. Etkileşimli alanlar zaten varsa kullanılır.'
    },
    {
      question: 'İmzam saklanır mı?',
      answer: 'Hayır. Burada oluşturulan bir imza kural olarak geçerli çalışma oturumuyla sınırlı kalır.'
    },
    {
      question: 'Dosyalar indirmeden sonra kalır mı?',
      answer: 'Hayır. Diğer One2PDF araçlarında olduğu gibi dosya geçici işlenir ve indirmeden sonra silinir.'
    }
  ]
};

export const trHeic = {
  title: 'HEIC’ten PDF’ye',
  subtitle: 'iPhone fotoğraflarını (HEIC/HEIF) gönderilebilir bir PDF yapın.',
  tip: 'iPhone HEIC dosyaları dönüştürülür, sonra PDF’ye konur.',
  tipMixed: 'JPG, PNG ve WebP aynı dosyada HEIC ile karışabilir.',
  action: 'PDF’ye dönüştür',
  running: 'Dönüştürülüyor…',
  fail: 'Bu görseller PDF’ye dönüştürülemedi.',
  doneTitle: 'PDF hazır',
  doneText: 'Fotoğraflarınız bir PDF’te birleştirildi.',
  reset: 'Başka fotoğraflar dönüştür',
  features: [
    feature('HEIC', 'orange', 'iPhone fotoğrafları', 'HEIC/HEIF görseller bir PDF’nin sayfaları olur.'),
    feature('★', 'blue', 'Birden fazla fotoğraf', 'Birden fazla görsel ekleyin; sıra korunur.'),
    feature('✧', 'teal', 'Geçici dosyalar', 'Orijinaller dönüştürmeden sonra silinir.')
  ],
  seoTitle: 'HEIC’i PDF’ye çevir | One2PDF',
  seoDescription: 'iPhone HEIC fotoğraflarını tarayıcıda PDF yapın. Ara sıra kullanım için hesapsız.',
  seoH2: 'HEIC fotoğrafları PDF yapmak',
  seoP1: 'iPhone’lar fotoğrafları çoğu zaman HEIC olarak saklar. Her cihazda açılan bir PDF’ye dönüştürün.',
  seoP2: 'Bir veya daha fazla fotoğraf ekleyin, dönüştürün ve indirin. JPG ve PNG aynı listeye girebilir.',
  seoP3: 'Dosyalar geçici işlenir, sonra silinir.'
};
