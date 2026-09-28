import type { PageSeoCopy } from '../types';

/** Turkish SEO copy. Not wired into sitemap, hreflang or prerender. */
export const seoTr = {
  wordToPdf: {
    seoTitle: 'Word’den PDF’ye çevir | One2PDF',
    seoDescription: 'Bir Word dosyasını (.doc, .docx) tarayıcıda PDF’ye dönüştürün. Microsoft Word kurmanız gerekmez.',
    seoH2: 'Word belgesini PDF yapmak',
    seoP1: 'Özgeçmiş, sözleşme veya rapor PDF olarak daha düzgün gider. .doc, .docx, .odt veya .rtf yükleyin, dönüştürmeyi başlatın ve PDF’yi indirin.',
    seoP2: 'Sayfa düzeni, yazı tipleri ve görseller ekranda okumak veya yazdırmak için yeterince korunur. E-posta, başvuru veya PDF isteyen bir form için uygundur.',
    seoP3: 'Orijinal dosya saklanmaz. PDF indirilmeye hazır kalır, sonra silinir. İndirmezseniz One2PDF en geç 15 dakikada kaldırır. Ara sıra kullanım hesap istemez.',
    howTitle: 'Word’den PDF’ye',
    howSteps: [
      'Word dosyasını yükleyin (.doc, .docx, .odt veya .rtf)',
      'Dönüştürmeyi tarayıcıda başlatın',
      'PDF’yi indirin'
    ],
    faqTitle: 'Word’den PDF’ye hakkında sorular',
    faq: [
      {
        question: 'Microsoft Word kurulu olmalı mı?',
        answer: 'Hayır. One2PDF .doc, .docx, .odt ve .rtf dosyalarını tarayıcıda dönüştürür. Bilgisayarınızda Word gerekmez.'
      },
      {
        question: 'Word’den PDF’ye çevirmek ücretsiz mi?',
        answer: 'Evet, hesapsız. Ücretsiz planda günde 5 belge ve dosya başına 20 MB vardır. Pass ve Pro: günlük işlem limiti yok; dosyalar 100 MB’a kadar.'
      },
      {
        question: 'One2PDF Word dosyamı saklar mı?',
        answer: 'Hayır. Orijinal, işlem bitince silinir. PDF bir kez indirilir, sonra kaldırılır. İndirmezseniz bu en geç 15 dakikada olur.'
      }
    ]
  },
  pdfToWord: {
    seoTitle: 'PDF’den Word’e çevir | One2PDF',
    seoDescription: 'Bir PDF’yi düzenlenebilir Word belgesine dönüştürün. İşlem çevrimiçi olur, Microsoft Word gerekmez.',
    seoH2: 'PDF’yi Word’de düzenlenebilir yapmak',
    seoP1: 'Metin bir PDF’nin içinde kilitliyse One2PDF onu DOC veya DOCX yapar. Dosyayı yükleyin, dönüştürmeyi başlatın ve sonucu Word’de açın.',
    seoP2: 'Metin ve kullanılabilir bir sayfa düzeni, düzeltmek, yorumlamak veya bölüm kopyalamak için yeniden kurulur. Yalnızca görüntü olan bir tarama önce OCR isteyebilir.',
    seoP3: 'Orijinal PDF saklanmaz. Word dosyası indirilmeye hazır kalır, sonra silinir. Ara sıra kullanım ad veya e-posta istemez.',
    howTitle: 'PDF’den Word’e',
    howSteps: [
      'Düzenlemek istediğiniz PDF’yi yükleyin',
      'Dönüştürmeyi başlatın',
      'Word dosyasını indirip açın'
    ],
    faqTitle: 'PDF’den Word’e hakkında sorular',
    faq: [
      {
        question: 'Word dosyası düzenlenebilir kalır mı?',
        answer: 'Evet. Dönüştürme metni ve kullanılabilir bir düzeni yeniden kurar. Karmaşık taramalar, PDF yalnızca görüntüyse OCR isteyebilir.'
      },
      {
        question: 'PDF’den Word’e çevirmek için hesap gerekir mi?',
        answer: 'Hayır. Ücretsiz kullanım ad veya e-posta istemez. Pro hesabı yalnızca ödeyen ve e-posta ile parola kullananlar içindir.'
      },
      {
        question: 'Dosyalar dönüştürmeden sonra saklanır mı?',
        answer: 'Hayır. Orijinal PDF sonunda silinir. Word sonucu indirdikten sonra kaybolur; indirmezseniz en geç 15 dakikada.'
      }
    ]
  },
  excelToPdf: {
    seoTitle: 'Excel’den PDF’ye çevir | One2PDF',
    seoDescription: 'Bir Excel sayfasını kimsenin hücreleri değiştiremeyeceği sabit bir PDF yapın. Microsoft Excel kurmanız gerekmez.',
    seoH2: 'Excel’den sabit bir PDF’ye geçmek',
    seoP1: '.xls, .xlsx, .ods veya .csv yükleyin. Dönüştürme sütunları, toplamları ve sayfa düzenini göndermeye hazır bir PDF’te sabitler.',
    seoP2: 'Değişmeden gitmesi gereken teklif, rapor veya muhasebe için uygundur.',
    seoP3: 'Orijinal sayfa saklanmaz. PDF indirilmeye hazır kalır, sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  pptToPdf: {
    seoTitle: 'PowerPoint’ten PDF’ye çevir | One2PDF',
    seoDescription: 'Bir PowerPoint sunusunu, alıcının PowerPoint’i olmasa da göndermek veya arşivlemek için PDF yapın.',
    seoH2: 'PowerPoint’i PDF yapmak',
    seoP1: '.ppt, .pptx veya .odp yükleyin. Slayt sırası, yansıtılabilen, yazdırılabilen veya saklanabilen bir PDF’te kalır.',
    seoP2: 'E-posta, eğitim materyali veya her cihazda aynı açılması gereken bir dosya için uygundur.',
    seoP3: 'Orijinal sunu saklanmaz. PDF kısa süre indirilebilir, sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  protect: {
    seoTitle: 'PDF Koru — parolalı PDF | One2PDF',
    seoDescription: 'Bir PDF’yi yalnızca seçtiğiniz parolayla açılsın diye şifreleyin. İşlem tarayıcıda olur.',
    seoH2: 'PDF’yi parola ile korumak',
    seoP1: 'Dosyayı yükleyin, bir parola yazın, onaylayın ve kilitli PDF’yi indirin. Parolayı bilmeyen açamaz.',
    seoP2: 'Anahtarı olan için içerik değişmez. Sözleşme, bordro veya kontrolsüz açılmaması gereken bir belge için uygundur.',
    seoP3: 'Orijinal saklanmaz. Korumalı PDF indirdikten sonra silinir. Parolayı saklayın: One2PDF onu geri getirmez. Ara sıra kullanım hesap istemez.'
  },
  toJpg: {
    seoTitle: 'PDF’den JPG’ye çevir | One2PDF',
    seoDescription: 'Bir PDF’nin her sayfasını JPG görsel olarak dışa aktarın. Birden fazla sayfa birlikte bir ZIP’te gelir.',
    seoH2: 'PDF’yi JPG yapmak',
    seoP1: 'PDF’yi yükleyin ve dönüştürmeyi başlatın. Her sayfa bir JPG olur; sohbet, site veya galeri için uygundur.',
    seoP2: 'Birden fazla sayfa bir ZIP’te toplanır. Tek sayfa görsel olarak iner.',
    seoP3: 'Kaynak PDF saklanmaz. Görseller indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  jpgToPdf: {
    seoTitle: 'JPG’den PDF’ye çevir | One2PDF',
    seoDescription: 'JPG, PNG veya WebP fotoğrafları küçük resim sırasıyla tek bir PDF’te birleştirin. Program kurmanız gerekmez.',
    seoH2: 'JPG görselleri PDF yapmak',
    seoP1: 'JPG, PNG veya WebP yükleyin, sırayı sabitlemek için küçük resimleri sürükleyin ve göndermeye hazır bir belge oluşturun.',
    seoP2: 'Her görsel bir sayfa olur. Telefondan tarama, ekran görüntüsü veya fotoğraf dosyası için uygundur.',
    seoP3: 'Görseller saklanmaz. PDF indirdikten sonra silinir; indirmezseniz en geç 15 dakikada. Ara sıra kullanım hesap istemez.',
    howTitle: 'JPG’den PDF’ye',
    howSteps: [
      'JPG, PNG veya WebP görselleri yükleyin',
      'Gerekirse küçük resimleri yeniden sıralayın',
      'PDF’yi indirin'
    ],
    faqTitle: 'JPG’den PDF’ye hakkında sorular',
    faq: [
      {
        question: 'Birden fazla görseli tek PDF’te birleştirebilir miyim?',
        answer: 'Evet. JPG, PNG veya WebP yükleyin, küçük resimleri sıralayın ve bir PDF oluşturun.'
      },
      {
        question: 'Program kurmak gerekir mi?',
        answer: 'Hayır. Dönüştürme tarayıcıda olur.'
      },
      {
        question: 'One2PDF fotoğraflarımı saklar mı?',
        answer: 'Hayır. Yalnızca işlem sırasında işlenirler. Orijinaller sonunda silinir. PDF indirdikten sonra veya en geç 15 dakikada kaybolur.'
      }
    ]
  },
  edit: {
    seoTitle: 'PDF düzenle — çevrimiçi | One2PDF',
    seoDescription: 'PDF’ye metin, çizim, görsel veya imza ekleyin ve belgeyi dışa aktarın. Adobe Acrobat gerekmez.',
    seoH2: 'PDF’yi tarayıcıda düzenlemek',
    seoP1: 'Dosyayı yükleyin, metin ekleyin, çizin, görsel veya imza koyun ve değiştirilmiş belgeyi dışa aktarın.',
    seoP2: 'Önizleme her değişikliği indirmeden önce sayfa sayfa gösterir. Tarama notlamak veya dosya imzalamak için uygundur.',
    seoP3: 'Orijinal saklanmaz. Düzenlenmiş PDF indirilmeye hazır kalır, sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  rotate: {
    seoTitle: 'PDF Döndür | One2PDF',
    seoDescription: 'Ters duran bir sayfayı veya yandan taramayı düzeltin. Bir sayfayı veya tümünü 90° adımlarla döndürün.',
    seoH2: 'PDF sayfalarını döndürmek',
    seoP1: 'PDF’yi yükleyin ve görünen sayfayı ya da tüm sayfaları 90° adımlarla döndürün. Sonra düzeltilmiş belgeyi indirin.',
    seoP2: 'Telefondan tarama veya ters sayfa için uygundur. İçerik kalır; yalnızca yön değişir.',
    seoP3: 'Orijinal saklanmaz. Döndürülmüş PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.',
    howTitle: 'PDF Döndür',
    howSteps: [
      'Eğri sayfalı PDF’yi yükleyin',
      'Sayfayı veya tüm sayfaları 90° döndürün',
      'Düzeltilmiş PDF’yi indirin'
    ],
    faqTitle: 'PDF döndürme hakkında sorular',
    faq: [
      {
        question: 'Yalnızca bir sayfayı döndürebilir miyim?',
        answer: 'Evet. Sayfayı seçin ve 90° adımlarla döndürün. Tüm sayfaları birlikte de döndürebilirsiniz.'
      },
      {
        question: 'Döndürmek içeriği değiştirir mi?',
        answer: 'Hayır. Metin ve görseller kalır. Yalnızca sayfa yönü değişir.'
      },
      {
        question: 'Dosya saklanır mı?',
        answer: 'Hayır. Orijinal işlem bitince silinir. Sonuç indirdikten sonra veya en geç 15 dakikada kaybolur.'
      }
    ]
  },
  watermark: {
    seoTitle: 'PDF’ye filigran ekle | One2PDF',
    seoDescription: 'Tüm sayfaları Gizli veya Taslak gibi bir metinle işaretleyin. Saydamlığı ayarlayın ve PDF’yi indirin.',
    seoH2: 'PDF’ye filigran koymak',
    seoP1: 'Metni yazın, saydamlığı ve yönü seçin, tüm sayfalara uygulayın.',
    seoP2: 'Önizleme metni dışa aktarmadan önce gösterir. İçeriği tamamen örtmeden okunur kalır.',
    seoP3: 'Orijinal saklanmaz. Filigranlı PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  pdfToExcel: {
    seoTitle: 'PDF’den Excel’e çevir | One2PDF',
    seoDescription: 'Bir PDF’teki tabloları süzmek veya yeniden hesaplamak için Excel sayfasına geçirin. Microsoft Excel kurmanız gerekmez.',
    seoH2: 'Tabloları PDF’ten Excel’e almak',
    seoP1: 'PDF’yi yükleyin ve dönüştürmeyi başlatın. Sütunlar ve satırlar, düzen elverdiği ölçüde yeniden kurulur.',
    seoP2: 'Teklif, rapor veya süzmek ya da yeniden hesaplamak istediğiniz sayılar için uygundur.',
    seoP3: 'Orijinal PDF saklanmaz. Excel dosyası indirilmeye hazır kalır, sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  pdfToPpt: {
    seoTitle: 'PDF’den PowerPoint’e çevir | One2PDF',
    seoDescription: 'Bir PDF’nin her sayfasını bir PowerPoint slaydı yapın. Microsoft PowerPoint kurmanız gerekmez.',
    seoH2: 'PDF’ten slaytlara geçmek',
    seoP1: 'PDF’yi yükleyin. Her sayfa, not alabileceğiniz veya yansıtabileceğiniz bir PPTX slaydı olur.',
    seoP2: 'Dosya, taslak veya teklifi toplantıya taşımak için uygundur.',
    seoP3: 'Orijinal PDF saklanmaz. Sunu indirilmeye hazır kalır, sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  unlock: {
    seoTitle: 'PDF Kilidini Aç | One2PDF',
    seoDescription: 'Açılış parolasını zaten biliyorsanız PDF’den kaldırın. Anahtarını bilmediğiniz dosyayı açmaz.',
    seoH2: 'Size ait bir PDF’nin kilidini açmak',
    seoP1: 'Geçerli parolayı girin. Sonuç bundan sonra parola sormadan açılır.',
    seoP2: 'One2PDF bilinmeyen parolaları bulmaz. Yalnızca anahtarına sahip olduğunuz belgeler.',
    seoP3: 'Orijinal sunucuda kalmaz. Kilidi açılmış PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  ocr: {
    seoTitle: 'PDF OCR — taranmış metni tanı | One2PDF',
    seoDescription: 'Bir taramanın metnini tanıyın ve seçilebilir bir PDF indirin. OCR, 7 günlük Pass veya Pro’dadır.',
    seoH2: 'Taramayı aranabilir yapmak',
    seoP1: 'Taramayı yükleyin ve tanımayı başlatın. Sonuç, metni seçilebilen, aranabilen veya yeniden kullanılabilen bir PDF’tir. OCR, Tesseract kullanır ve 7 günlük Pass veya Pro’ya dahildir.',
    seoP2: 'Kalite taramanın netliğine bağlıdır. Sonra metni çıkarabilir, çevirebilir veya özetleyebilirsiniz.',
    seoP3: 'Orijinal saklanmaz. OCR’lı PDF indirilmeye hazır kalır, sonra silinir. Diğer araçların ara sıra kullanımı hesap istemez; OCR’ın kendisi Pass veya Pro ister.'
  },
  translate: {
    seoTitle: 'PDF çevir — yerleşimi koru | One2PDF',
    seoDescription: 'Bir PDF’nin metnini çevirin ve özgün bölgelerde bırakın. İki yol: yerleşimi koruyun veya yalnızca metin. YZ kredisi kullanır.',
    seoH2: 'PDF’yi yeniden dizmeden çevirmek',
    seoP1: 'One2PDF metni çevirir ve özgün bölgelere geri koyar. Görseller, logolar ve tablolar kalır. Kaynak dili, hedef dili seçin, sonra yerleşimi koruyun veya yalnızca metin alın.',
    seoP2: 'Yerleşim piksel piksel aynı değildir: bazı diller uzar veya kısalır. Yazı boyutu kutu içinde uyum sağlar. Seçilebilir metni az olan bir tarama önce OCR’dan geçer.',
    seoP3: 'Orijinal saklanmaz. Çevrilmiş PDF indirdikten sonra silinir. Dil çevirisi, bu aracı başlatırsanız bir YZ sağlayıcısı kullanır. İşlenen sayfa başına 1 kredi sayılır.',
    howTitle: 'PDF çevir',
    howSteps: [
      'PDF’yi yükleyin',
      'Kaynak dili, hedef dili ve sonuç türünü seçin',
      'Çevrilmiş PDF’yi indirin'
    ],
    faqTitle: 'PDF çevirme hakkında sorular',
    faq: [
      {
        question: 'Sayfa düzeni aynı kalır mı?',
        answer: 'Olabildiğince: görseller, logolar ve metin bölgeleri kalır. Daha uzun bir çeviri kutudaki yazıyı biraz küçültebilir, okunmaz hale getirmeden.'
      },
      {
        question: 'PDF mi alırım, metin dosyası mı?',
        answer: 'Ana sonuç çevrilmiş bir PDF’tir. Bir .txt de vardır. Yalnızca metin modu, sayfanın özgün çizimini kurmadan bir içerik PDF’i üretir.'
      },
      {
        question: 'Taramalar çalışır mı?',
        answer: 'Evet. Seçilebilir metin azsa One2PDF önce Tesseract ile OCR yapar, sonra tanınan blokları çevirir.'
      }
    ]
  },
  sign: {
    seoTitle: 'PDF imzala | One2PDF',
    seoDescription: 'PDF’ye ad, tarih ve görünür bir mühür ekleyin, imzalı belgeyi indirin. Yazdırmadan.',
    seoH2: 'PDF’yi tarayıcıda imzalamak',
    seoP1: 'Dosyayı yükleyin, adı yazın, mühür konumunu seçin ve imzalı belgeyi indirin.',
    seoP2: 'Önizleme adı, tarihi ve gerekçeyi son sayfada veya tümünde, dışa aktarmadan önce gösterir.',
    seoP3: 'Orijinal saklanmaz. İmzalı PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  pageNumbers: {
    seoTitle: 'PDF’ye sayfa numarası ekle | One2PDF',
    seoDescription: 'Her sayfaya 1, 1/12 veya Sayfa 1 koyun. Konumu seçin ve numaralı PDF’yi indirin.',
    seoH2: 'PDF numaralamak',
    seoP1: 'Biçimi ve konumu seçin. Numaralar tüm sayfalara bir seferde uygulanır.',
    seoP2: 'Önizleme numarayı dışa aktarmadan önce üstte veya altta, solda, ortada veya sağda gösterir.',
    seoP3: 'Orijinal saklanmaz. Numaralı PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  crop: {
    seoTitle: 'PDF kırp | One2PDF',
    seoDescription: 'Beyaz kenar boşluklarını veya bir taramanın kenarlarını tüm sayfalarda birlikte kesin. Program gerekmez.',
    seoH2: 'PDF kırmak',
    seoP1: 'Kenar boşluklarını belirleyin. Aynı kırpma tüm sayfalar için geçerlidir. Açık bölge kalır; koyu bölge çıkar.',
    seoP2: 'Kenarı fazla olan bir telefon taraması veya sayfayı aşan bir fiş için uygundur.',
    seoP3: 'Orijinal saklanmaz. Kırpılmış PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  deletePages: {
    seoTitle: 'PDF’den sayfa sil | One2PDF',
    seoDescription: 'Kapak, boş sayfa veya fazla ekleri çıkarın. Belgede en az bir sayfa kalmalıdır.',
    seoH2: 'PDF’den sayfa silmek',
    seoP1: 'Çıkarmak istediğiniz sayfalara tıklayın ve daha kısa belgeyi dışa aktarın. En az bir sayfa kalmalıdır.',
    seoP2: 'Önizleme her sayfayı çıkarmadan önce gösterir. Seçilmeyen sayfalar sıra ve içeriği korur.',
    seoP3: 'Orijinal saklanmaz. Temizlenmiş PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.'
  },
  reorder: {
    seoTitle: 'PDF sayfa sırasını değiştir | One2PDF',
    seoDescription: 'Küçük resimleri doğru sıraya sürükleyin ve PDF’yi indirin.',
    seoH2: 'PDF sayfalarını doğru sıraya koymak',
    seoP1: 'Küçük resimleri sürükleyin ve yeni sırayı kaydedin. Yalnızca sıra değişir, sayfa içeriği değil.',
    seoP2: 'Kapak ortaya düştüğünde veya bir tarama sayfaları karıştırdığında uygundur.',
    seoP3: 'Orijinal saklanmaz. Yeniden sıralanmış PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.',
    howTitle: 'Sayfaları yeniden sırala',
    howSteps: [
      'PDF’yi yükleyin',
      'Küçük resimleri doğru sıraya sürükleyin',
      'Güncellenmiş PDF’yi indirin'
    ],
    faqTitle: 'Sayfa sırası hakkında sorular',
    faq: [
      {
        question: 'Yeniden sıralamak sayfa içeriğini değiştirir mi?',
        answer: 'Hayır. Yalnızca sıra değişir. Metin, görseller ve kalite kalır.'
      },
      {
        question: 'Tek bir sayfayı taşıyabilir miyim?',
        answer: 'Evet. Küçük resmi doğru yere sürükleyin ve kaydedin.'
      },
      {
        question: 'Dosya saklanır mı?',
        answer: 'Hayır. Orijinal işlem bitince silinir. Sonuç indirdikten sonra veya en geç 15 dakikada kaybolur.'
      }
    ]
  },
  toPng: {
    seoTitle: 'PDF’den PNG’ye çevir | One2PDF',
    seoDescription: 'Bir PDF’nin her sayfasını net bir PNG olarak dışa aktarın. Birden fazla sayfa bir ZIP’te gelir.',
    seoH2: 'PDF’yi PNG yapmak',
    seoP1: 'Her sayfa web ve ekran için uygun bir PNG olur. Birden fazla sayfa bir arşivde toplanır.',
    seoP2: 'PNG, düz grafiği çok sıkıştırılmış bir JPG’den daha net tutar.',
    seoP3: 'Kaynak PDF işlenir, sonra silinir. Ara sıra kullanım hesap istemez.',
    howTitle: 'PDF’den PNG’ye',
    howSteps: [
      'PDF’yi yükleyin',
      'Dönüştürmeyi başlatın',
      'PNG dosyalarını indirin'
    ],
    faqTitle: 'PDF’den PNG’ye hakkında sorular',
    faq: [
      {
        question: 'Tek dosya mı alırım, birden fazla mı?',
        answer: 'Bir sayfa bir PNG olur. Birden fazla sayfa birlikte bir ZIP’te gelir.'
      },
      {
        question: 'PNG ne işe yarar?',
        answer: 'Net alanlar, metin ve ekran görüntüleri için. Fotoğraflarda JPG genellikle daha küçüktür.'
      },
      {
        question: 'PDF saklanır mı?',
        answer: 'Hayır. Yalnızca dönüştürme için işlenir, sonra silinir.'
      }
    ]
  },
  toText: {
    seoTitle: 'PDF’den metin çıkar | One2PDF',
    seoDescription: 'Bir PDF’nin seçilebilir metnini .txt dosyasına geçirin. Taramaysa önce OCR yapın.',
    seoH2: 'PDF’den metin çıkarmak',
    seoP1: 'Araç metin katmanını okur ve içeriği .txt olarak kaydeder. Yapıştırabilir, arayabilir veya yeniden yazabilirsiniz.',
    seoP2: 'Metin katmanı olmayan bir tarama az döner. Metin yalnızca görüntüyse önce OCR yapın.',
    seoP3: 'PDF saklanmaz. Metin dosyasını tutmak istiyorsanız indirin. Ara sıra kullanım hesap istemez.',
    howTitle: 'PDF’den metin çıkar',
    howSteps: [
      'Seçilebilir metinli PDF’yi yükleyin',
      'Çıkarmayı başlatın',
      '.txt dosyasını indirin'
    ],
    faqTitle: 'Metin çıkarma hakkında sorular',
    faq: [
      {
        question: 'Taramada çalışır mı?',
        answer: 'Yalnızca metin zaten seçilebilirse. Aksi halde önce OCR kullanın.'
      },
      {
        question: 'Hangi biçimi alırım?',
        answer: 'Özgün sayfa düzeni olmayan düz bir .txt dosyası.'
      },
      {
        question: 'İçerik saklanır mı?',
        answer: 'Hayır. İşlem geçicidir. Saklamak istiyorsanız dosyayı indirin.'
      }
    ]
  },
  summarize: {
    seoTitle: 'PDF özetle | One2PDF',
    seoDescription: 'Kısa, ayrıntılı veya madde madde bir özet alın. YZ kredisi kullanır: sayfa başına 1 kredi.',
    seoH2: 'PDF özetlemek',
    seoP1: 'Özetin biçemini ve dilini seçin. Sayfa başına 1 YZ kredisi sayılır, dosya başına en fazla 20 kredi. Daha uzun PDF’ler modelden önce kesilir.',
    seoP2: 'Bir taramanın önce metin katmanına ihtiyacı vardır. Hiçbir şey seçilemiyorsa OCR yapın.',
    seoP3: 'Orijinal saklanmaz. Özeti kopyalayabilir veya .txt olarak indirebilirsiniz. Başarısız bir işlem kredileri tutmaz.',
    howTitle: 'PDF özetle',
    howSteps: [
      'PDF’yi yükleyin',
      'Biçemi ve dili seçin',
      'Özeti kopyalayın veya indirin'
    ],
    faqTitle: 'PDF özetleme hakkında sorular',
    faq: [
      {
        question: 'YZ kredileri nasıl hesaplanır?',
        answer: 'Sayfa başına 1 kredi, dosya başına en fazla 20 kredi. Daha uzun belgeler özetten önce kesilir. Başarısız bir işlem kredi harcamaz.'
      },
      {
        question: 'Hangi biçemler var?',
        answer: 'Kısa, ayrıntılı veya ana maddeler. Özet dili belgenin dilinden farklı olabilir.'
      },
      {
        question: 'Taramada çalışır mı?',
        answer: 'Yalnızca metin katmanı varsa. PDF yalnızca görüntüyse önce OCR yapın.'
      }
    ]
  },
  htmlPdf: {
    seoTitle: 'HTML’den PDF’ye çevir | One2PDF',
    seoDescription: 'Bir HTML sayfasını veya yapıştırılan kodu PDF yapın. Çok dinamik HTML, sade HTML’den daha kötü çıkar.',
    seoH2: 'HTML’i PDF yapmak',
    seoP1: 'Bir .html dosyası yükleyin veya kodu yapıştırın. Dönüştürme sunucuda çalışır.',
    seoP2: 'Sade HTML iyi temsil edilir. Çok JavaScript’li sayfalar eksik çıkabilir.',
    seoP3: 'HTML saklanmaz. PDF indirdikten sonra silinir. Ara sıra kullanım hesap istemez.',
    howTitle: 'HTML’den PDF’ye',
    howSteps: [
      'Bir .html dosyası yükleyin veya HTML yapıştırın',
      'Dönüştürmeyi başlatın',
      'PDF’yi indirin'
    ],
    faqTitle: 'HTML’den PDF’ye hakkında sorular',
    faq: [
      {
        question: 'Dosya olmadan HTML yapıştırabilir miyim?',
        answer: 'Evet. Kodu kutuya yapıştırın ve PDF oluşturun.'
      },
      {
        question: 'Karmaşık web sayfaları desteklenir mi?',
        answer: 'Sade HTML iyi temsil edilir. Çok JavaScript’li sayfalar eksik kalabilir.'
      },
      {
        question: 'Hesap gerekir mi?',
        answer: 'Ara sıra kullanım için hayır. Dosya ve sonuç geçicidir.'
      }
    ]
  }
} satisfies Record<string, PageSeoCopy>;

export const mergeSeoTr = {
  seoTitle: 'PDF Birleştir | One2PDF',
  seoDescription: 'Birden fazla PDF’yi küçük resim sırasıyla tek belgede birleştirin. Program kurmanız gerekmez.',
  seoH2: 'Birden fazla PDF’yi tek dosyada birleştirmek',
  seoP1: 'En az iki PDF yükleyin, küçük resimleri doğru sıraya sürükleyin ve birleştirin. Birkaç saniyede indireceğiniz bir belge olur.',
  seoP2: 'Sayfalar olduğu gibi kalır, filigran eklenmez. Gerekirse sonra sayfa numarası aracıyla numaralayabilirsiniz.',
  seoP3: 'Orijinaller saklanmaz. Birleşik PDF indirdikten sonra silinir. İndirmezseniz One2PDF en geç 15 dakikada kaldırır. Ara sıra kullanım hesap istemez.',
  howTitle: 'PDF dosyalarını birleştir',
  howSteps: [
    'Birleştirmek istediğiniz PDF’leri seçin',
    'İhtiyacınız olan sıraya koyun',
    'Birleşik PDF’yi indirin'
  ],
  faqTitle: 'PDF birleştirme hakkında sorular',
  faq: [
    {
      question: 'Bir seferde kaç PDF birleştirebilirim?',
      answer: 'Birden fazla PDF ekleyip küçük resimlerden sıralayabilirsiniz. Ücretsiz planda günlük belge limiti ve dosya başına 20 MB vardır. Pro toplu işlemeyi ve daha büyük dosyaları açar.'
    },
    {
      question: 'PDF birleştirmek için hesap gerekir mi?',
      answer: 'Hayır. Ücretsiz kullanım ad veya e-posta istemez. Aracı seçin, dosyaları yükleyin ve sonucu indirin.'
    },
    {
      question: 'Orijinal PDF’ler saklanır mı?',
      answer: 'Hayır. Orijinaller sonunda silinir. Birleşik dosya indirdikten sonra kaybolur; indirmezseniz en geç 15 dakikada.'
    }
  ]
} satisfies PageSeoCopy;

export const splitSeoTr = {
  seoTitle: 'PDF Böl | One2PDF',
  seoDescription: 'Sayfaları çıkarın veya her sayfayı kendi PDF’i olarak bir ZIP içine ayırın. Program kurmanız gerekmez.',
  seoH2: 'PDF bölmek',
  seoP1: 'Dosyayı yükleyin ve sayfaları tıklayarak veya 1-3, 5, 8 gibi bir aralıkla seçin. Sonra işlemi başlatın.',
  seoP2: 'Çıkar, seçilen sayfaları daha kısa bir PDF’te toplar. Ayır, her sayfayı kendi dosyası olarak bir ZIP’e aktarır.',
  seoP3: 'Orijinal saklanmaz. Sonuç indirdikten sonra silinir. Ara sıra kullanım hesap istemez.',
  howTitle: 'PDF Böl',
  howSteps: [
    'PDF’yi yükleyin',
    'Çıkarılacak veya ayrılacak sayfaları seçin',
    'Sonucu indirin'
  ],
  faqTitle: 'PDF bölme hakkında sorular',
  faq: [
    {
      question: 'Bir PDF’yi birden fazla dosyaya bölebilir miyim?',
      answer: 'Evet. Ayır, her sayfayı kendi PDF’i olarak bir ZIP’e aktarır. Bazı sayfaları tek belgede tutmak için Çıkar’ı kullanın.'
    },
    {
      question: 'PDF bölmek ücretsiz mi?',
      answer: 'Evet, ara sıra kullanım için hesapsız. Ücretsiz planda günde 5 belge ve dosya başına 20 MB vardır.'
    },
    {
      question: 'Orijinal saklanır mı?',
      answer: 'Hayır. İşlem bitince silinir. Sonuç indirdikten sonra veya en geç 15 dakikada kaybolur.'
    }
  ]
} satisfies PageSeoCopy;

export const compressSeoTr = {
  seoTitle: 'PDF Sıkıştır | One2PDF',
  seoDescription: 'Çok büyük bir PDF’nin boyutunu küçültün ve hâlâ okunabilir, daha hafif bir dosya indirin. Program kurmanız gerekmez.',
  seoH2: 'PDF sıkıştırmak',
  seoP1: 'Dosyayı yükleyin, bir düzey seçin (yüksek, orta veya güçlü) ve sıkıştırmayı başlatın. Birkaç saniyede indireceğiniz daha küçük bir PDF olur.',
  seoP2: 'Yüksek metni korur. Orta ve güçlü görselleri daha çok küçültür: sayfalar görsele döndüğü için metin artık seçilemez. Gmail, Outlook veya bir form eki reddettiğinde işe yarar.',
  seoP3: 'Orijinal saklanmaz. Sonuç indirilir, sonra silinir. İndirmezseniz One2PDF en geç 15 dakikada kaldırır. Ara sıra kullanım hesap istemez.',
  howTitle: 'PDF Sıkıştır',
  howSteps: [
    'Çok ağır olan PDF’yi yükleyin',
    'Bir sıkıştırma düzeyi seçin',
    'Daha hafif dosyayı indirin'
  ],
  faqTitle: 'PDF sıkıştırma hakkında sorular',
  faq: [
    {
      question: 'E-posta için çok büyük bir PDF nasıl sıkıştırılır?',
      answer: 'Gmail ve Outlook çoğu zaman 25 MB üstü ekleri reddeder. One2PDF’de PDF’yi yükleyin, bir düzey seçin (yüksek, orta veya güçlü) ve sıkıştırın. Daha hafif dosya okunur kalır ve genellikle gönderim sınırına girer.'
    },
    {
      question: 'PDF sıkıştırmak kaliteyi düşürür mü?',
      answer: 'Yüksek, metin ve görselleri özgününe olabildiğince yakın tutar. Orta ve güçlü görselleri daha çok küçültür; fotoğraf veya taramayı yumuşatabilir. Metin okunur kalır. Özgeçmiş veya sözleşme için yükseği, sıkı bir boyut sınırı varsa daha güçlü bir düzeyi kullanın.'
    },
    {
      question: 'One2PDF sıkıştırmadan sonra dosyamı saklar mı?',
      answer: 'Hayır. PDF yalnızca işlem sırasında işlenir. Orijinal silinir; sonuç bir kez indirilir, sonra kaldırılır. İndirilmeyen dosyalar en geç 15 dakikada kaybolur. Ara sıra kullanım hesap istemez.'
    }
  ]
} satisfies PageSeoCopy;
