import type { BlogPost } from './blog';

/**
 * Turkish articles published through getBlogPosts for the tr locale only.
 */
export const TURKISH_BLOG_DRAFTS: BlogPost[] = [
  {
    slug: 'pdf-eposta-sikistir',
    publishedIso: '2026-08-28',
    publishedLabel: '28 Ağustos 2026',
    seoTitle: 'E-posta için çok büyük PDF | One2PDF',
    seoDescription: 'Gmail veya Outlook 25 MB üstü bir PDF’yi reddediyor mu? Program kurmadan çevrimiçi sıkıştırın ve gönderin.',
    keywords: 'PDF sıkıştır, çok büyük PDF, Gmail 25 MB',
    title: 'E-posta ile gönderilemeyecek kadar büyük bir PDF nasıl küçültülür',
    excerpt: 'Gmail, Outlook veya bir form eki reddetti. Bir PDF’nin neden bu kadar ağırlaştığını ve program kurmadan saniyeler içinde nasıl hafifletileceğini anlatıyoruz.',
    body: [
      { type: 'p', text: 'Dosya, özgeçmiş veya portfolyo hazır, gönderim şurada duruyor: «Dosya en büyük boyutu aşıyor (25 MB).» Gmail, Outlook ve birçok form orada keser. Çoğu durumda bir PDF, yeniden yazdırmadan ve okunmaz hale gelmeden birkaç saniyede küçülür.' },
      { type: 'h2', text: 'Bazı PDF’ler neden bu kadar ağır olur' },
      { type: 'p', text: 'Bir PDF «yalnızca metin» değildir. Her sayfanın arkasında görseller, yazı tipleri ve bazen bir taramanın katmanları vardır. Bu öğeler ne kadar az iyileştirilirse dosya o kadar büyür, kısa bir belgede bile.' },
      { type: 'h3', text: 'Yüksek çözünürlüklü görseller' },
      { type: 'p', text: 'Bir tarama, telefondan bir fotoğraf veya sıkıştırılmamış bir görsel metinden daha ağırdır. 300 dpi yazdırmak için işe yarar; e-postada çoğu zaman fazladır. Gmail’in reddettiği PDF’nin en sık nedeni budur.' },
      { type: 'h3', text: 'Sayfalar, grafikler ve yazı tipleri toplanır' },
      { type: 'p', text: '40 sayfalık bir rapor, yapıştırılmış tablolar, ekran görüntüleri ve gömülü yazı tipleri yapıyı şişirir. Birkaç PDF’yi önce küçültmeden birleştirmek sonucu kötüleştirir: tam çözünürlüklü görseller üst üste biner.' },
      { type: 'h2', text: 'En hızlı yol, kurulum yok' },
      { type: 'p', text: 'Tek seferlik bir gönderim için ücretli bir masaüstü programı gerekmez. Çevrimiçi bir araç çoğu durumda yeter: görselleri küçültür, dosyayı iyileştirir, ekranda okunur bir sonuç bırakır.' },
      { type: 'h3', text: 'One2PDF’de büyük bir PDF nasıl sıkıştırılır' },
      {
        type: 'ol',
        items: [
          [
            '',
            { text: 'PDF sıkıştırma aracını', to: '/tr/compress' },
            ' açın.'
          ],
          'Belgeyi yükleme alanına bırakın (bilgisayar veya telefon).',
          'Aracın görselleri ve yapıyı iyileştirmesine izin verin. Dosya 25 MB üstünde kalırsa daha güçlü bir düzey seçin.',
          'E-postaya hazır yeni PDF’yi indirin.'
        ]
      },
      { type: 'h2', text: 'Dosya hâlâ çok ağırsa' },
      { type: 'h3', text: 'Birleştirmeden önce sıkıştırın' },
      {
        type: 'p',
        parts: [
          'Bir sözleşme, ekler ve bir taramayı bir araya getirecekseniz önce her PDF’yi küçültün, sonra birleştirin. Zaten sıkıştırılmış bir dosya, tam çözünürlüklü orijinaller yığınından daha iyi birleşir. ',
          { text: 'PDF Birleştir', to: '/tr/merge' },
          ' aracı küçük resim sırasını korur.'
        ]
      },
      { type: 'h3', text: 'Ağır görsellerden başlamak' },
      {
        type: 'p',
        parts: [
          'Bir PNG ekran görüntüsü veya 8 MB’lık bir JPEG PDF’ye olduğu gibi girmek zorunda değildir. Görselleri önce dönüştürmek veya PDF’yi oluşturduktan sonra sıkıştırmak, e-posta için çoğu zaman çok daha düşük bir başlangıç boyutu verir. ',
          { text: 'JPG’den PDF’ye', to: '/tr/jpg-to-pdf' }
        ]
      },
      { type: 'p', text: '25 MB tavanının bir özgeçmişi, müşteri dosyasını veya resmi bir gönderimi durdurmasına izin vermeyin. Bir form veya kutu eki reddettiği anda sıkıştırmadan geçmek ikinci bir gönderimi önler.' }
    ],
    cta: 'PDF Sıkıştır',
    ctaTo: '/tr/compress'
  },
  {
    slug: 'gizlilik-pdf-online',
    publishedIso: '2026-09-02',
    publishedLabel: '2 Eylül 2026',
    seoTitle: 'Çevrimiçi PDF: dosyaları bilinmeyen bir sunucuya göndermeyin | One2PDF',
    seoDescription: 'Ücretsiz bir PDF aracı kullanmadan önce dosyaların nereye gittiğine ve şeffaf bir hizmeti nasıl seçeceğinize bakın.',
    keywords: 'PDF gizliliği, çevrimiçi PDF, dosya silme',
    title: 'Çevrimiçi PDF: dosyaları bilinmeyen bir sunucuya göndermekten nasıl kaçınılır',
    excerpt: 'Tarayıcıda ücretsiz bir PDF aracı pratiktir. Bir sözleşme veya kimlik belgesi yüklemeden önce dosyaya ne olduğunu bilmek gerekir.',
    body: [
      { type: 'p', text: 'Dönüştürülecek, birleştirilecek veya sıkıştırılacak bir sözleşmeniz, faturanız veya klinik bir PDF’niz var. «PDF çevir çevrimiçi» diye ararsınız, ilk sonuca tıklarsınız, dosyayı bırakırsınız… ve ona ne olduğunu bilmezsiniz.' },
      { type: 'p', text: 'Neredeyse tüm ücretsiz çevrimiçi PDF araçlarının temel sorunu budur: dosya bir yere gider ve çoğu kişinin nereye gittiğini, ne kadar kaldığını denetleyecek zamanı veya teknik bilgisi yoktur.' },
      { type: 'p', text: 'Bu rehber, çevrimiçi bir PDF aracı kullandığınızda gerçekte ne olduğunu, doğru hizmeti seçerseniz bunun kendiliğinden bir sorun olmadığını ve hassas bir belgeyi emanet etmeden önce neyi doğrulamanız gerektiğini anlatır.' },
      { type: 'h2', text: 'Neredeyse tüm araçlar neden bir gönderimle çalışır' },
      { type: 'p', text: 'Bazı sitelerin ima ettiğinin aksine, çevrimiçi PDF araçlarının büyük çoğunluğu — en bilinenler dahil — dosyayı «cihazınızda» işlemez. Bir sunucuya gönderir, işlemi yapar (dönüştürme, birleştirme, sıkıştırma, OCR) ve sonucu geri verir.' },
      { type: 'p', text: 'Basit bir nedeni vardır: bazı işlemler tarayıcıda iyi çalışmak için fazla ağırdır. Bir PDF’yi özgün yerleşimiyle Word veya Excel’e geçirmek, tarayıcının tek başına çalıştırmadığı dönüştürme motorları ister. Taranmış belgede metin tanıma (OCR) için de aynı şey geçerlidir.' },
      { type: 'p', text: 'Her şeyi tarayıcıda işleyen araçlar vardır (WebAssembly). Çoğu zaman basit işlemlerle sınırlıdır ve büyük dosyalarda veya karmaşık dönüşümlerde daha yavaş ya da daha az güvenilir olabilir.' },
      { type: 'p', text: 'Doğru soru «dosyam bir yere gönderiliyor mu?» değildir — yanıt neredeyse her zaman evettir — «nereye, ne kadar süre ve kim tarafından?».' },
      { type: 'h2', text: 'Bir PDF aracına güvenmeden önce neye bakmalı' },
      { type: 'p', text: 'Hassas bir belgeyi çevrimiçi bir dönüştürücüye bırakmadan önce bu noktalara otuz saniye ayırın:' },
      { type: 'h3', text: '1. Silme politikası' },
      { type: 'p', text: 'Ciddi bir hizmet, dosyanın işlemden sonra sunucularda ne kadar kaldığını açık söyler — tercihen dakikalar veya birkaç saat, asla «süresiz» veya «belirtilmemiş». Bu bilgi kolay bulunmalıdır.' },
      { type: 'h3', text: '2. Sunucular nerede ve hangi yasa geçerli' },
      { type: 'p', text: 'Avrupa Birliği’ndeki bir sunucuda işlenen dosya GDPR kapsamına girer. Kanada’da işlenen bir dosya PIPEDA’ya veya Québec sakinleri için Kanun 25’e girebilir. Bu çerçeveler toplama, saklama ve silme konusunda gerçek yükümlülükler koyar.' },
      { type: 'h3', text: '3. YZ işlevlerinde ne olur' },
      { type: 'p', text: 'Giderek daha fazla PDF aracı yapay zekâ ile özet veya çeviri ekler. Yararlıdır ama çoğu zaman bir üçüncü tarafın (YZ sağlayıcısı) içeriği de aldığı anlamına gelir. Şeffaf bir hizmet, hangi işlevlerin bir YZ sağlayıcısından geçtiğini ve hangilerinin hiç geçmediğini söylemelidir.' },
      { type: 'h3', text: '4. Teknik yolun açıklığı' },
      { type: 'p', text: 'Dosyaları nasıl işlediğini anlatan bir hizmet — hangi araçlar, hangi adımlar — yalnızca «dosyalarınız güvende» diyen kapalı bir kutudan daha çok güven verir.' },
      { type: 'h3', text: '5. Fiyat modeli' },
      { type: 'p', text: 'Fiyatları net olan, deneme süresinin gizli aboneliğe dönüşmediği bir araç, modeli fatura karışıklığına dayanan bir hizmetten genellikle daha çok güveni hak eder.' },
      { type: 'h2', text: 'One2PDF pratikte ne yapar' },
      { type: 'p', text: 'One2PDF’de doğrulanamayan bir pazarlama vaadi yerine şeffaflığı seçtik. Pratikte:' },
      {
        type: 'ul',
        items: [
          'Dosyalar güvenli bir sunucuda işlenir — aksini söylemiyoruz.',
          'İşlem birleştirmek, sıkıştırmak, korumak ve düzenlemek için yerleşik araçlar; Word, Excel ve PowerPoint için bir dönüştürme motoru; taranmış belgeler için OCR kullanır.',
          'Bir YZ sağlayıcısından geçen özet ve çeviri diğerlerinden ayrıdır ve yalnızca siz başlatırsanız çalışır.',
          'Dosya işlenip indirildikten sonra sunuculardan otomatik silinir.',
          'Denemek için kart gerekmez ve hiçbir abonelik sizden net bir eylem olmadan başlamaz.'
        ]
      },
      { type: 'p', text: 'Hiçbir şeyin bilgisayardan çıkmadığını söylemiyoruz — bu yanlış olur. Ne olduğunu tam olarak söylemeyi yeğleriz; böylece olgularla karar verirsiniz.' },
      { type: 'h2', text: 'Kısaca' },
      {
        type: 'ul',
        items: [
          'Neredeyse tüm çevrimiçi PDF araçları dosyayı bir sunucuya gönderir. Bu tek başına alarm değildir.',
          'Güven, net sürelerden, belirli bir işlem yerinden ve YZ hakkında dürüst bir cümleden gelir.',
          'Kanıtlanamayan bir «sıfır gönderim» vaadine güvenmeyin.'
        ]
      },
      {
        type: 'p',
        parts: [
          'Tam metin ',
          { text: 'gizlilik politikasındadır', to: '/privacy' },
          '. Gözden geçirilmiş bir Türkçe sürüm olana kadar İngilizce kalır.'
        ]
      }
    ],
    cta: 'PDF araçlarını gör',
    ctaTo: '/tr/tools'
  }
];
