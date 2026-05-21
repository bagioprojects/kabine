# Geliştirme ve Güncelleme Kayıtları (Updates Registry)

Bu dosya, Şehir Devletleri Simülasyonu projesinde yapılan tüm majör geliştirmeleri, mimari kararları ve düzeltmeleri kayıt numaralarıyla (Update ID) kronolojik olarak listeler.

---

### [UPD-001] Rol Bazlı Menü ve Navigasyon Switcher
- **Açıklama**: Vatandaş dışındaki roller (Cumhurbaşkanı, Milletvekili, Komutan) için Kişisel Seçenekler ve Rol Panellerini ayıran üst navigasyon tab yapısı entegre edildi.
- **Tarih**: 19.05.2026

### [UPD-002] Oturum Kalıcılığı ve Sayfa Yenileme Koruması
- **Açıklama**: Vite dev server HMR (Hot Module Replacement) güncellemelerinde ya da manuel tarayıcı yenilemelerinde kullanıcının oturumunun kapanmasını önlemek için `localStorage` tabanlı durum koruması (`politic_user_state`) yazıldı.
- **Tarih**: 19.05.2026

### [UPD-003] Cumhurbaşkanı Yönetim Paneli
- **Açıklama**: Cumhurbaşkanı rolü için 5 farklı yönetim modülü (Kararnameler, Bakanlar Kurulu, Merkez Bankası Para Basma ve Faiz Ayarı, Komşu Ülkeler Diplomasi Masası, Bakanlık Bütçe Dağılım Sürgüleri) eklendi.
- **Tarih**: 19.05.2026

### [UPD-004] Harita Üzerinde Rol Karakteri İkonu
- **Açıklama**: Haritadaki statik sinyal pini yerine kullanıcının o anki siyasi rolünü temsil eden vektörel emoji pini (`👑` / `👔` / `🎖️` / `🚶`) eklendi.
- **Tarih**: 19.05.2026

### [UPD-005] Akıllı Touchpad / Tekerlek Yakınlaştırma
- **Açıklama**: Harita alanında trackpad ile pinch-to-zoom yaparken Chrome varsayılan sayfa yakınlaştırma hareketi engellendi. Yakınlaştırma, fare imlecinin durduğu noktaya göre merkezlenecek şekilde premium koordinat hesaplamasıyla güncellendi.
- **Tarih**: 19.05.2026

### [UPD-006] Canlı Konsol Günlükleri Sayfası
- **Açıklama**: Ekran alanını daraltan yan log paneli kaldırılarak, header navigasyonuna retro-yeşil temalı terminal ekranına giden özel bir buton ("Konsol") eklendi.
- **Tarih**: 19.05.2026

### [UPD-007] Milli Emtia Borsası Terminali
- **Açıklama**: 9 hammadde için 10 saniyede bir canlı dalgalanan fiyat tahtası, SVG kıvılcım grafikleri (sparkline), hızlı emir miktarı butonları (+5, +10, MAKS vb.) ve cüzdan/envanter denetimi içeren modern borsa terminali entegre edildi.
- **Tarih**: 19.05.2026

### [UPD-008] Hammadde Veritabanı Modelleri ve Malzeme Listesi
- **Açıklama**: Ana dizine `materials_list.md` eklenerek stratejik malzemeler belgelendi. Backend tarafında TypeORM tabanlı `Commodity` ve `UserMaterial` tabloları hazırlandı.
- **Tarih**: 19.05.2026

### [UPD-009] Haritada Mevcut Konuma Odaklanma Desteği
- **Açıklama**: İnteraktif harita paneline **Konumuma Yakınlaş** butonu eklendi. Tıklandığında kullanıcının o an bulunduğu il ve ilçe sınırları otomatik hesaplanıp harita oraya kaydırılır ve yakınlaştırılır.
- **Tarih**: 19.05.2026

### [UPD-010] MVC Mimarisi Klasör ve Bileşen Ayrışımı
- **Açıklama**: `App.tsx` dosyasındaki devasa sayfa render blokları (`MarketplaceView`, `PresidentPanelView`, `MilletvekiliPanelView`, `GarnizonKomutanıPanelView`, `ConsoleView`) bağımsız React bileşenleri olarak `src/components/` klasörüne taşındı. `App.tsx` temiz ve okunabilir bir ana yönlendirici (orchestrator) haline getirildi.
- **Tarih**: 19.05.2026

### [UPD-011] İlçe Bazlı Dinamik Güç ve Altyapı Veritabanı
- **Açıklama**: İnteraktif Türkiye Haritasındaki her bir ilçe (~970 ilçe) için benzersiz ve kararlı veriler (Nüfus, Savunma Birlikleri Gücü, Okul Sayısı, Hastane Sayısı, Sanayi Kapasitesi, Altyapı İndeksi) üreten deterministik hash algoritması entegre edildi. Harita üzerinde fareyle gezinirken anlık tooltip'te ve sol taraftaki ilçe detay bilgi kartında bu veriler görsel göstergelerle listelenmektedir.
- **Tarih**: 19.05.2026

### [UPD-012] Kişisel Emtia Portföyü ve Stratejik Kaynak Profili
- **Açıklama**: Milli Emtia Borsası sekmesinde kullanıcının sahip olduğu tüm 9 hammaddenin anlık miktarlarını gösteren modern 3x3 kart tasarımlı "Emtia Rezerv Portföyü" eklendi. Ayrıca seçilen hammaddenin projedeki stratejik rolünü, kullanım alanını ve çıkarıldığı orijinal Şehir Cumhuriyeti bilgisini içeren teknik bir profil paneli eklendi.
- **Tarih**: 19.05.2026

### [UPD-013] Harita Tooltip Düzeltmesi ve Seyahat/İkametgah Kılavuzu
- **Açıklama**: İnteraktif Türkiye Haritasındaki ilçelerin üstüne gelindiğinde tooltip'teki kısaltılmış eyalet adı (`Cum.`) yerine tam adı (`X Cumhuriyeti`) formatına geçiş yapıldı. Harita detay ekranına "Seyahat vs İkametgah Kılavuzu" eklenerek ziyaret ve ikametgah sistemlerinin mekanikleri, Cumhurbaşkanı kısıtlamalarıyla beraber görselleştirildi.
- **Tarih**: 19.05.2026

### [UPD-014] Harita Detay Ekranından İlçe Listesinin Kaldırılması
- **Açıklama**: İnteraktif Türkiye Haritasında ilçeler görsel olarak harita üzerinde tıklanabilir ve seçilebilir olduğundan, sağ bilgi kartındaki (sidebar) gereksiz "Eyalet İlçeleri" listesi kaldırılarak ekran alanı sadeleştirildi.
- **Tarih**: 19.05.2026

### [UPD-015] Seyahat vs İkametgah Kılavuzunun Kaldırılması
- **Açıklama**: Ekranı sadeleştirmek ve gereksiz metin kalabalığını önlemek amacıyla harita detay ekranındaki "Seyahat vs İkametgah Kılavuzu" bölümü tamamen kaldırıldı.
- **Tarih**: 19.05.2026

### [UPD-016] Tüm İlçelerde Okul ve Hastane Sayılarının Sabitlenmesi
- **Açıklama**: Proje gereksinimleri uyarınca haritadaki tüm ilçeler için hesaplanan dinamik okul sayısı ve hastane sayısı başlangıç değeri 1 olarak sabitlendi.
- **Tarih**: 19.05.2026

### [Refactor/Feature] [UPD-017] 3D Meclis Oturma Düzeni Haritalaması
- **Açıklama**: Anayasa ve Meclis Kararları sekmesinde, partilerin milletvekili dağılımlarına göre dizilmiş (soldan sağa siyasi yelpaze uyumlu) 300 interaktif meclis sandalyeli 3D (perspektif) bir hemicycle meclis salonu haritası eklendi. Ortasında Türk bayraklı Meclis Kürsüsü ve Meclis Başkanlık Divanı bulunmakta olup, canlı gündem durum bilgisi ile partilere göre filtreleme özellikleri içermektedir.
- **Tarih**: 19.05.2026

### [UPD-018] 3D Meclis Salonu Görsel İyileştirmesi ve Seçim Geri Sayım Mekanikleri
- **Açıklama**: 
  1. 3D Meclis kılavuz kılçığı ve "EGEMENLİK KAYITSIZ ŞARTSIZ MİLLETİNDİR" mottosu kaldırıldı.
  2. Sandalye tasarımı gerçekçi 3D masa-sıra-koltuk modeliyle (CSS preserve-3d) zenginleştirildi.
  3. 81 şehir devletinin meclisini seçmek için dropdown menü eklendi; her şehir devleti için isme bağlı stabil hash ile 3-5 adet yerel parti ve benzersiz geçici "Bot Cumhurbaşkanı" ismi dinamik olarak üretildi.
  4. Tüm meclis sıraları boş (inaktif/gümüş) koltuk durumuna getirildi ve ilk genel seçimlere kalan süre 1 haftalık (7 gün) gerçek zamanlı geri sayım sayacına bağlandı (seçim sonrası durumu simüle etmek için test butonu eklendi).
- **Tarih**: 19.05.2026

### [UPD-019] Meclis Kürsüsü Tasarım İyileştirmesi ve Yan Panel Düzeni
- **Açıklama**: 
  1. **3D Kürsü Yenilemesi**: Kırmızı ahşap kutu kürsü yerine mermer/slayt zeminli, altın yaldızlı detaylara (`#d97706`), `🌙✨` altın hilal-yıldız amblemine, ince metal mikrofon hattına ve dairesel kaide platformuna sahip ultra lüks bir 3D kürsü tasarımı entegre edildi.
  2. **Sağ Panel Düzeni**: Partilerin dağılım kartları, meclis salonunun üstünden alınarak meclis salonu ile yan yana duracak şekilde sağ tarafa (320px genişlikte dikey sütun olarak) konumlandırıldı. Böylece daha kompakt ve profesyonel bir panel görünümü elde edildi.
- **Tarih**: 19.05.2026

### [UPD-020] Mobil Uyumluluk (Responsive CSS) Geliştirmeleri
- **Açıklama**:
  1. **Header Mobil Uyum**: Mobil cihazlarda (768px altı) başlık (header) yapısı dikey hizalandı ve sayfa butonları yatayda kaydırılabilir (`overflow-x: auto`) modern bir tab bar haline getirilerek ekran taşmaları önlendi.
  2. **Top-Level Sekmeler**: Kişisel ve Rol Paneli sekmeleri mobil cihazlarda tam genişlik kaplayacak ve esneyecek şekilde güncellendi.
  3. **3D Meclis Salonu Ölçeklendirmesi**: Meclis sayfasındaki 3D hemicycle meclis salonu, mobil ekranların genişlik limitine göre CSS `--floor-scale` değişkeni ile orantılı olarak küçülecek (0.55x - 0.8x arası) şekilde esnekleştirildi.
  4. **Kürsü ve Paneller**: Meclis ve partilerin yerleşim sütunları 1024px altındaki ekranlarda otomatik olarak alt alta yerleşecek (stacked) şekilde düzenlendi.
- **Tarih**: 19.05.2026

### [UPD-021] Yasa Tasarısı Sunma ve Oylama (Meclis Karar Mekanizması)
- **Açıklama**:
  1. **Yasa Sunma Butonu**: 3D Meclis Salonunun yanındaki sağ aksiyon paneline **"📜 Kürsüye Kanun Teklifi Sun"** adında lüks bir mor gradyanlı buton yerleştirildi.
  2. **Yasa Tasarısı Modalı**: Butona basıldığında açılan; yasa başlığı, yasa kategorisi (Teşvik, Vergi, Altyapı vb.) ve gerekçeli açıklama girmeye olanak sağlayan modern bir pop-up formu eklendi. Sunulan yasa tasarıları `localStorage` üzerinde kaydedilerek oylama havuzuna gönderilmektedir.
  3. **Oylama Bekleyenler Sekmesi**: "Anayasa ve Meclis Oturumu" kartına yeni bir **"🗳️ Oylama Bekleyenler"** sekmesi eklendi. Burada oylama bekleyen tüm yasa tasarıları listelenmektedir.
  4. **24 Saatlik Geri Sayım & Canlı Oylama**: Her yasa teklifi için 24 saatlik gerçek zamanlı geri sayım sayacı eklendi. Sekmede **"👍 Kabul Et (Onayla)"** ve **"👎 Karşı Çık (Ret)"** oylama butonları sunuldu. Kullanıcı oy kullandığında oy durumu kaydedilerek meclis temsilcilerinin simüle oyları (Kabul/Ret) gösterilmekte ve kabul oylarında konfeti efekti tetiklenmektedir.
- **Tarih**: 19.05.2026

### [UPD-022] Otomatik Yasa Arşivleme Mekanizması ve Test Senaryosu
- **Açıklama**:
  1. **30 Saniyelik Test Yasası**: Sayfa yüklendiğinde otomatik olarak 30 saniyelik bir geri sayımla başlayan **"⚡ Acil Afet Fonu Bütçe Yasası (Test)"** teklifi sisteme entegre edildi. Bu sayede kullanıcının arşivleme geçişini test edebilmesi için pratik bir oylama senaryosu oluşturuldu.
  2. **Otomatik Arşivleme Modülü**: `App.tsx` içerisindeki her saniye tetiklenen zamanlayıcı modülüne yasa kontrol mekanizması eklendi. Geri sayımı sıfıra ulaşan pending yasalar otomatik olarak sonlandırılmakta, meclis oylamaları hesaplanarak **"Geçmiş Kararlar" (Meclis Arşivi)** sekmesine taşınmakta ve durumları `localStorage` üzerinden kalıcı hale getirilmektedir.
  3. **Dinamik Arşiv Görünümü**: "Geçmiş Kararlar" sekmesindeki statik yapı kaldırılarak, arşive aktarılan yasaların dinamik olarak listelenmesi ve oylama sonuçlarının burada sergilenmesi sağlandı.
- **Tarih**: 19.05.2026

### [UPD-023] Şirket Yönetim Uyarı Bannerı ve Eyalet Bazlı Satılık Şirketler Pazarı
- **Açıklama**:
  1. **Şirket Yok Uyarı Bannerı**: Şirket Yönetim sekmesinde kullanıcının hiç şirketi bulunmuyor ise belirgin ve dikkat çekici, lüks kırmızı-turuncu gradyanlı bir uyarı kartı ("⚠️ Aktif Bir Şirketiniz Bulunmamaktadır!") ve satılık şirketler pazarına yönlendiren call-to-action butonu yerleştirildi.
  2. **Eyalet Sınırları İçinde Satılık Şirket Pazarı**: "Satılık Şirketler" sekmesine geçildiğinde, kullanıcının ikametgahının bulunduğu bağımsız devletin (örn: Yalova Cumhuriyeti) tüm ilçelerini (`turkiye-ilceler-optimized.json` verisi dinamik filtrelenerek) kapsayan, sadece o eyalet sınırları içindeki satılık şirket ve fabrikaları listeleyen bir emlak/pazar sayfası geliştirildi.
  3. **İlçe Bazlı Filtreleme**: Kullanıcıların eyalet içindeki ilçelere göre (örn: Yalova için Merkez, Çınarcık, Armutlu vb.) satılık şirketleri filtreleyebileceği premium buton çubuğu eklendi.
  4. **Satın Alım Entegrasyonu**: Satın alınan şirketin tipi ve ismi `App.tsx` üzerindeki yükseltme ve cüzdan sistemine bağlanarak satın alma loglarının şirket ismini dinamik yansıtması sağlandı.
- **Tarih**: 20.05.2026

### [UPD-024] Şirket Yönetiminde 2D İzometrik Ofis Simülasyonu & Çok Oyunculu Lobi
- **Açıklama**:
  1. **İzometrik Ofis Görünümü & Yüksek Kaliteli Grafikler**: Ofis zemini ahşap parke dokusuyla (maun rengi herringbone) kaplandı. Duvarlara animasyonlu gökdelenlerin ve parıldayan ışıkların yer aldığı bir eyalet manzaralı pencere, diğer duvara ise renkli kitaplar ve altın kupaların bulunduğu bir kitaplık eklendi.
  2. **Yüksek Kaliteli (High-Fidelity) Çalışma Masaları**: Masalar sadece düz kutu olmaktan çıkarılıp premium görsel detaylarla donatıldı:
     - **Patron Masası:** Cilalı koyu maun yüzey, altın neon şerit çerçeve, metalik ayaklar, kavisli OLED ekran ve sıcak sarı ışık veren masa lambası ile donatıldı.
     - **Yazılımcı Masası:** Karbon fiber koyu slate yüzey, açık mavi siber neon şerit çerçeve, RGB klavye arka aydınlatması ve çift siber geliştirici ekranı ile donatıldı.
     - **Finansçı Masası:** Parlatılmış beyaz mermer yüzey, altın kenarlar, kırmızı ve mavi dosya klasörleri, hesap makineleri ve yeşil borsa grafikli ekran ile donatıldı.
  3. **Çok Oyunculu Lobi Simülasyonu (Ziyaretçiler)**: Milletvekilleri, valiler, bakanlar ve yatırımcılar lobinizi canlı olarak ziyaret etmeye başladı. 15-20 saniyede bir yeni oyuncular "🟢 Ahmet_Tycoon katıldı" şeklinde sisteme bağlanarak ofis içinde (sofa, sebil, masalar gibi boş alanlarda) serbestçe yürüyüp durmaktadır.
  4. **Canlı Sohbet Paneli ve Yapay Zeka Cevapları**: Ofisin sağ tarafına tam entegre bir lobi sohbet konsolu yerleştirildi. Kullanıcı sohbete "merhaba", "işler nasıl", "kodlar ne durumda" gibi mesajlar yazdığında, ofisteki aktif ziyaretçiler veya çalışanlar (Yazılımcı, Finansçı) 1 saniye içinde akıllı ve duruma özel cevaplar verir.
  5. **Makam Koltuğuna Oturma Mekanizması**: Patron masasının arkasındaki lüks CEO koltuğuna `(x:3, y:2)` yürüdüğünüzde karakteriniz otomatik olarak oturma pozisyonuna geçer (bacaklar masanın/koltuğun altında kalacak şekilde gizlenir, gövde hizalanır ve oturma durumuna özel konuşma balonu çıkar).
  6. **Mobil Tam Ekran & Dokunmatik D-Pad**: Cihaz duyarlılığı en üst düzeye çıkarıldı. Bilgisayarda veya mobilde tek tıkla viewport'u kaplayan "Tam Ekran Oyna" modu eklendi. Ekranın sağ alt köşesine mobil kullanıcıların karakteri kolayca yönetebilmesi için şık bir dokunmatik D-Pad paneli yerleştirildi.
- **Tarih**: 20.05.2026


### [UPD-025] Bakiye Yetersizliği İçin Girişimci Teşvik Fonu
- **Açıklama**:
  1. **Başlangıç Bakiyeleri Yükseltildi**: Yeni kayıt olan hesapların daha rahat şirket satın alabilmesi amacıyla `INITIAL_USER_STATE` cüzdan nakit tutarı `₺250.000`'e, banka hesap bakiyeleri ise toplamda `₺650.000`'e yükseltildi.
  2. **Girişimcilik ve Kalkınma Teşvik Hibesi**: Mevcut/eski hesapların bakiye sıkıntısı çekmesi durumunda, Şirket Yönetimi sayfasının en üstünde dinamik olarak beliren bir hibe kartı eklendi.
  3. **Hibe Butonu Entegrasyonu**: Bakiyesi `₺150.000`'den az olan kullanıcılara tek tıkla `₺500.000` karşılıksız devlet teşvik hibesi aktarabilme imkanı sunuldu. Bu işlem hem bütçeyi günceller hem de sisteme resmi log kaydı ekler.
- **Tarih**: 20.05.2026


### [UPD-026] Şirketlere Özel İzole Temalı Ofis Odaları & Yüksek Kaliteli Mobilya Modelleri
- **Açıklama**:
  1. **Şirket Tipi Seçim Paneli**: Şirket Yönetiminde kullanıcının sahip olduğu her şirket için tamamen izole bir oda tahsis edildi. Sahip olunan şirketlerin ofisleri arasında geçiş yapmayı sağlayan şık, kenarlıkları şirket türünün renginde parıldayan bir **Aktif Şirket Ofisi** seçim paneli entegre edildi.
  2. **Her Şirkete Özel Görsel Kimlik ve Duvar/Zemin Temaları**:
     - **Enerji & Maden (Kömür):** Endüstriyel çelik grisi duvar panelleri, sıcak maun herringbone ahşap parke zemin, bacasından dumanlar çıkan fabrika silüetli turuncu gün batımı manzaralı pencere.
     - **Otomotiv Teknoloji:** Derin siber mor duvarlar, açık mavi siber neon şeritli koyu karbon zemin, gökdelenler ve neon ışıklar içeren mavi-pembe siber akşam manzaralı pencere.
     - **Savunma Sanayii Karargahı:** Taktik zeytin yeşili ve siyah zırhlı askeri duvarlar, parıldayan yeşil radar ızgarası şeklinde çizgili zemin, askeri radar taraması yapan ve kırmızı İHA simgeleri barındıran gözetleme penceresi.
  3. **Yapay Zeka Personel ve Diyalog Özelleştirmeleri**:
     - Çalışan personeller (Mühendis, Geliştirici, Analist) ve lobiyi ziyaret eden diğer politikacılar artık seçtiğiniz şirketin konusuna göre (SİHA'lar, elektrikli araçlar, kömür kazan basınçları vb.) konuşur ve sohbet konsolundaki mesajlarınıza o şirket tipinin jargonuna uygun akıllı cevaplar verir.
  4. **Yüksek Kaliteli ve Tematik Mobilya Çizimleri (Canvas-Level Art)**:
     - **Makam Masaları:** Maden için bakır perçinli döküm masa ve gaz lambası; Otomotiv için kavisli neon şeritli karbon masa; Savunma için üzerinde **holografik uçan SİHA drone modeli** havada dalgalanan yeşil neon taktik savaş istasyonu.
     - **Kasalar:** Maden için pirinç kadranlı döküm demir kasa; Otomotiv için kırmızı/yeşil lazer taramalı biyometrik parmak izi okuyuculu kasa; Savunma için kuantum koruma kalkanı çizgilerine sahip askeri koruma hücresi.
     - **Dinlenme Alanları (Sofa):** Maden için kapitone Chesterfield kahverengi deri koltuk; Otomotiv için beyaz deri ve turuncu dikişli ralli/yarış koltuğu; Savunma için kırmızı uyarı ışıklı stealth askeri zırhlı koltuklar.
     - **Ofis Bitkileri:** Maden için paslı varilde yetişen kaktüsler; Otomotiv için hydroponic (topraksız) bio-ışıklı mavi su tüplü bitki; Savunma için **levitasyon (hover) pedi üzerinde havada uçan anti-gravitasyonel Bonsai ağacı**.
     - **Veri Tahtası (Board):** Maden için bakır analog basınç saatleri; Otomotiv için kıvrımlı motor/tork grafik paneli; Savunma için aktif yeşil radar tarama ekranı.
     - **Su Sebili:** İçinde su seviyesinin ve kabarcıkların (bubble anim) yukarı doğru hareket ettiği gerçekçi cam tanklı sebil.
- **Tarih**: 20.05.2026

### [UPD-027] Çok Modlu Yolculuk, Araç Galerisi, Akaryakıt İstasyonu ve İkametgah Başvuruları Mimarisi
- **Açıklama**:
  1. **Çok Modlu Yolculuk (Otobüs, Araç, Uçak)**: Havalimanı olan bölgeler arasında 5 kat hızlı uçak seyahati (0.2s/km), araç sahipliği gerektiren özel araç seyahati (1s/km) ve daha ekonomik otobüs seyahati (2s/km) entegre edildi. Mesafe hesaplamaları için Haversine formülü kullanıldı.
  2. **Araç Galerisi & Benzin İstasyonu**: Tofaş Şahin, Togg, Zırhlı SUV, VIP Sedan gibi araçların satın alınabileceği Premium Araç Galerisi sekmesi ve dinamik petrol endeksine bağlı benzin ikmal istasyonu eklendi.
  3. **Vektörel Havalimanı İşaretçileri (✈️)**: Havalimanına sahip olan ilçelerin SVG harita koordinatları üzerine, yakınlaştırma seviyesine göre orantılı şekilde yeniden boyutlandırılan (`scale(zoomScale)`) vektörel uçak emojili neon işaretçiler ve arama listesinde uçak simgeleri eklendi.
  4. **İkametgah Taşıma Başvuru & Onay Süreci**: İkametgah değiştirme butonu, anında taşıma yerine resmi başvuru sistemine dönüştürüldü. Vatandaşların başvuruları simüle edilen dışişleri bakanlıklarınca 15 saniye içinde onaylanmakta ve 15 dakikalık (`activeMoving`) gerçek zamanlı taşınma süreci başlamaktadır. Süreç boyunca ekranda modern bir yüzen cam kart (floating card) ile geri sayım ve ilerleme çubuğu gösterilir.
  5. **Cumhurbaşkanı Onay Paneli**: Cumhurbaşkanlarına, kendi eyaletlerine yapılan ikametgah taşıma başvurularını anlık olarak inceleyip **Onaylama (Approve)** veya **Reddetme (Reject)** yetkisi veren yeni bir yönetim sekmesi eklendi.
- **Tarih**: 20.05.2026

### [UPD-028] Cumhurbaşkanlığı Külliyesi (Makam Odası) İzometrik Ofisi ve Kriz Yönetimi
- **Açıklama**:
  1. **İzometrik Makam Odası**: Cumhurbaşkanı rolündeki kullanıcılar için `PresidentPanelView` paneline "🚪 Makam Odasına Gir" butonu eklendi. Bu sayede klasik tab görünümünden çıkılıp tam ekran, lüks kırmızı kadife duvarlı, altın yaldızlı detaylara ve mermer/ahşap zemin kaplamalarına sahip 2D izometrik Külliye ofisine geçiş yapıldı.
  2. **Yüksek Kaliteli Külliye Mobilyaları**: Oymalı klasik ahşap Makam Masası, Devlet Sırrı Çelik Arşivi (Kasa), altın varaklı sedir (sofa) ve devasa bir Türk Bayrağı odanın atmosferini tamamlayacak şekilde konumlandırıldı.
  3. **Personel ve Özel Kalem Zekası**: Ofis içinde Cumhurbaşkanı karakterine ek olarak "Özel Kalem Müdürü" ve "Koruma Şefi" yerleştirildi. Lobi sohbet paneli üzerinden girilen "hazine", "kriz" veya "selam" gibi anahtar kelimelere Özel Kalem'den saniyeler içinde "Emredersiniz Sayın Cumhurbaşkanım" şeklinde akıllı dönütler alınması sağlandı.
  4. **Cumhurbaşkanlığı Kriz & Karar Merkezi (Modal)**: Masaya tıklandığında açılan özel yönetim modalı ile **Devlet Yatırımları** (İstihbarat Ağı, MB Dijitalleşmesi, Diplomasi Masası, AFAD Fonu) yapılarak pasif devlet çarpanları kalıcı artırılabilir hale getirildi. Ayrıca **Stratejik Krizler** (örn: Ekonomik Enflasyon Şoku) üzerinden zor kararlar verilip Hazine, Nüfuz, İtibar ve Enflasyon dengeleri dinamik yönetildi.
- **Tarih**: 20.05.2026

### [UPD-029] Cumhurbaşkanı Makam Odası Koltuk ve Karakter Senkronizasyon İyileştirmesi
- **Açıklama**:
  1. **Makam Koltuğu Kaldırıldı**: Cumhurbaşkanı'nın Makam Odasındaki desk arkası sandalyesi (Makam Koltuğu) kaldırıldı.
  2. **Karakter Senkronizasyonu**: Cumhurbaşkanı Makam Odasındaki oyuncu karakteri çizim motoru, şirketlerin izometrik ofis alanındaki karakter (`IsometricOffice.tsx` içindeki koyu lacivert takım elbiseli, kırmızı kravatlı, altın haleli model) ile tamamen senkronize edildi. Böylece karakterin her iki ortamda da aynı görünmesi sağlandı.
  3. **Ayakta Duruş Desteği**: Masa arkasına geçen karakterin oturma durumuna girmesi engellenerek, masasının arkasında ayakta, heybetli bir şekilde durması sağlandı.
- **Tarih**: 20.05.2026

### [UPD-030] Şirket Ofisleri ve Cumhurbaşkanı Makam Odası İçin İnteraktif Mobilya Tasarım & Yerleşim Modu (Grid Editor)
- **Açıklama**:
  1. **İnteraktif Tasarım Modu Entegrasyonu**: Şirket Yönetimindeki ve Cumhurbaşkanlığı Makam Odasındaki izometrik ofis alanına girildiğinde sağ üst köşede aktif olan **🛠️ Tasarım Modu** butonu eklendi.
  2. **Eşya Seçme ve Konum Belirleme (Move)**: Tasarım modu açıkken herhangi bir eşyaya tıklandığında eşya seçilir ve grid tabanında parıldayan neon mavi bir seçim halesi (isometric diamond overlay) ile etrafında dalgalanan dairesel bir halka belirir. **Taşı (Move)** modu aktifleştirilip haritada boş bir kareye tıklanarak eşyaların yerleri dinamik olarak değiştirilebilir.
  3. **90 Derece Döndürme & Yön Değişimi (Rotate)**: Seçilen eşyanın yönü **🔄 90° Döndür** butonu ile 90 derecelik izometrik açıyla (x-ekseni flip edilerek) anında değiştirilebilir.
  4. **Eşya Ekleme & Satın Alma Modülü (Buy & Add)**: Ofise yeni eşyalar katmak için drop-up sepet menüsü eklendi. Kullanıcılar cüzdanlarındaki nakit parayla Süs Bitkisi (₺500), Su Sebili (₺800), Koltuk (₺1000), Planlama Panosu (₺1200), Konforlu Sedir (₺1500), Kitaplık (₺2000), Çelik Arşiv Kasası (₺3000) ve Çalışma Masası (₺4000) satın alabilirler. Satın alınan eşya boş bir alana otomatik yerleştirilir ve oyuncu doğrudan konumlandırma moduna sokulur.
  5. **Silme ve %50 Geri Ödeme (Refund)**: Gereksiz veya yanlış yerleştirilen eşyalar **Sil** butonuyla kaldırılabilir. Kaldırılan her eşyanın orijinal değerinin yarısı (%50 amortisman iadesi) oyuncunun cüzdan bakiyesine nakit olarak anında geri ödenir.
  6. **Cumhurbaşkanlığı Makam Odası & Şirket Ofis Kalıcılığı**: Yapılan tüm düzenlemeler Şirketler için şirkete özel (`office_objects_${companyId}`), Cumhurbaşkanlığı Makam Odası için ise Külliye'ye özel (`president_office_objects`) olarak `localStorage` üzerinde kaydedilir.
- **Tarih**: 20.05.2026

### [Bugfix] [UPD-031] İzometrik Ofis Hata Düzeltmeleri ve Sayfa Çökmesi Çözümleri
- **Açıklama**:
  1. **Arayüz & JSX Sözdizimi Düzeltmeleri**: `IsometricOffice.tsx` ve `PresidentIsometricOffice.tsx` dosyalarındaki kapanmamış div etiketleri, eksik parantezler ve hatalı yerleştirilmiş stil özellikleri giderilerek derleme aşamasındaki `JSX element has no corresponding closing tag` ve `Unexpected token` hataları tamamen çözüldü.
  2. **Kategori Filtreleme Tür Uyumsuzluğu**: Eşya marketindeki kategori sekmelerinde `'all'` kelimesi yerine Türkçe veri yapısına uygun `'tümü'` kelimesi getirilerek karşılaştırma hatası (`TS2367`) giderildi.
  3. **Kullanılmayan Değişkenlerin Temizlenmesi**: TypeScript'in strict modu (`noUnusedLocals`, `noUnusedParameters`) kapsamında hata veren tüm kullanılmayan değişkenler ve fonksiyonlar (`containerRef`, `targetXRef`, `targetYRef`, `getSelectedObjectScreenPos`) kaldırıldı veya `void` ile susturuldu.
  4. **Derleme ve Sayfa Kararlılığı**: `tsc` derleyicisinden başarıyla geçen kodlar sayesinde uygulamadaki beyaz ekran çökmesi sorunu kalıcı olarak çözüldü.
- **Tarih**: 20.05.2026

### [Feature] [UPD-032] Milli Ansiklopedi (Oyun Kılavuzu & Wiki) Sayfası
- **Açıklama**:
  1. **Lüks GitBook/Wiki Tasarımı**: API dokümantasyonu standartlarında, sol panelinde arama motoru ve kategorize edilmiş kılavuz konu ağacı (Ağaç Ağacı), sağ panelinde ise glassmorphic GitBook stili makale okuyucusu barındıran modern bir **Milli Ansiklopedi** arayüzü (`WikiView.tsx`) geliştirildi.
  2. **Kılavuz İçeriği ve Detaylı Anlatımlar**:
     - **Cumhurbaşkanı Seçimleri**: 10 gün ikametgah şartı, 7 günde 3 saat aktiflik eşiği (Visibility API ile arka plan kontrolü), 15 gün adaylık şartı ve seçmen kütüğü detayları.
     - **Milli Emtia Borsası**: 9 adet stratejik mineralin (Kömür, Demir, Çelik, Bakır, Alüminyum, Lityum, Bor, Petrol, Silisyum) köken eyaletleri ve borsa dalgalanma mekanizmaları.
     - **Şirketler & Fabrikalar**: Enerji, Otomotiv ve Savunma tipindeki şirketler için özelleştirilmiş 2D izometrik ofis odaları, lobi yapay zeka personelleriyle sohbet konsolu ve interaktif Tasarım Modu kullanımı.
     - **Göç & Seyahat**: Otobüs, Özel Araç ve Hızlı Uçuş seyahat seçeneklerinin farkları ile 15 dakikalık ikametgah taşıma onayı bürokrasi aşamaları.
     - **TBMM & Yasama**: 3D Hemicycle koltuk haritası düzeni, altın yaldız süslemeli 3D Meclis Kürsüsü ve yasa tasarılarının 24 saatlik canlı oylama süreçleri.
  3. **Navigasyon Entegrasyonu**: Ana kullanıcı paneli (`App.tsx`) başlık menüsüne **📚 Ansiklopedi** butonu entegre edilerek tüm vatandaşların bu kılavuza kolayca erişmesi sağlandı.
- **Tarih**: 20.05.2026

### [Feature] [UPD-033] Çok Kanallı Teşkilat & Organizasyon Dairesi Sekmesi
- **Açıklama**: 
  1. **Teşkilat Navigasyonu**: Header menüsüne ve yönlendirme döngüsüne **"Teşkilat"** seçeneği eklendi.
  2. **Parti Teşkilatı Yönetim Şeması**: Genel başkandan başlayıp sekreter, propaganda sorumlusu ve muhasibe uzanan hiyerarşik bağ çizgileri içeren interaktif bir siyasi ağaç yapısı oluşturuldu.
  3. **Holding İştirakleri**: Zonguldak Kömür, Yalova Otomotiv ve Ankara Savunma şirketlerinin anlık verimlilik değerlerini, durum göstergelerini ve üretim akışlarını özetleyen holding karteli paneli geliştirildi.
  4. **Lobi & Operasyonlar**: Sosyal Medya Propagandası, Fabrika Grevi Çözümü, Meclis Lobiciliği ve Vergi Muafiyeti Sözleşmesi gibi bakiye karşılığında itibar, nüfuz ve verimlilik sağlayan operasyon paneli entegre edildi.
- **Tarih**: 20.05.2026

### [Feature] [UPD-034] Aydınlık ve Karanlık Tema (Light Theme / Color Options) Entegrasyonu
- **Açıklama**:
  1. **Aydınlık Tema Desteği**: Kullanıcı isteği doğrultusunda, tüm arayüzü canlandıracak modern, oyunsu ve kontrastı yüksek aydınlık tema (`data-theme="light"`) geliştirildi.
  2. **Tema Seçici Buton**: Header barın sağ tarafına cüzdan ve nüfuz bilgilerinin yanına konumlandırılan, `☀️` ve `🌙` emojileriyle görselleştirilmiş anlık tema geçiş anahtarı eklendi.
  3. **Tema Değişkenleri & CSS Overrides**: `index.css` dosyasında aydınlık moda özel renk paleti tanımlandı. Yazı renklerinin, butonların, form elemanlarının ve cam panellerin aydınlık temada kusursuz okunabilir olması için otomatik CSS ezme (accessibility override) kuralları yazıldı. Temanın tarayıcı yenilendiğinde kaybolmaması için `localStorage` kalıcılığı sağlandı.
- **Tarih**: 20.05.2026

### [Visual] [UPD-035] Karargah (Dashboard) Görsel Zenginleştirme: Araç Filosu ve Endüstriyel Kartel
- **Açıklama**:
  1. **Milli Garajım**: Oyuncuların sahip olduğu Tofaş Şahin, Togg, Zırhlı SUV gibi araçları görselleri, hız ve yakıt kapasite bilgileriyle birlikte listelediği zengin bir garaj gösterimi ana sayfaya (Dashboard) "Satır 0" olarak yerleştirildi.
  2. **Endüstriyel Şirket Karteli**: Maden, otomobil ve savunma fabrikalarının seviye bilgilerini ve görsel durumlarını özetleyen, doğrudan kartel yönetim sayfasına bağlantılı holding kartı eklendi.
- **Tarih**: 20.05.2026

### [Bugfix] [UPD-036] TypeScript Strict Derleme ve Kullanılmayan Değişken Hataları Çözümleri
- **Açıklama**: `OrganizationView.tsx` ve `App.tsx` bileşenlerindeki kullanılmayan kütüphane importları, state parametreleri (`setPartyMembers`, `setAllianceStates`, `userProvince` props) temizlendi. Projenin strict TypeScript kuralları altındaki `tsc` build derlemesini hatasız tamamlaması garanti altına alındı.
- **Tarih**: 20.05.2026

### [Visual/Theme] [UPD-037] Aydınlık Mod (Light Mode) Kontrast Yeniden Tasarımı ve İnteraktif Harita Tema Senkronizasyonu
- **Açıklama**:
  1. **Akıllı CSS Öznitelik Filtreleri ile Kontrast Çözümü**: Satır içi (inline) kodlanmış `color: 'white'`, `rgba(0,0,0,0.45)` ve `#cbd5e1` gibi koyu/açık kontrast uyuşmazlıkları yaratan stillerin tamamı, aydınlık modda (`data-theme="light"`) akıllı CSS öznitelik seçicileri kullanılarak otomatik olarak ezildi. Yazıların beyaz kartlar üzerinde yüksek kontrastla ve göz yormadan okunabilmesi sağlandı.
  2. **Dinamik SVG Harita Arka Planı**: İnteraktif Harita bileşenindeki (`InteractiveMap.tsx`) sert kodlanmış saf beyaz (`#ffffff`) SVG zemin rengi kaldırıldı; yerine `--bg-map` CSS değişkeni entegre edildi. Böylece harita alanı aydınlık modda temiz beyaz, karanlık modda ise bütünlüğü bozmayacak şekilde koyu mavi-lacivert zemin rengine dinamik olarak bürünmektedir.
  3. **Pozitif/Negatif Bakiye ve Trend Renkleri**: Maden/emtia borsası artış-azalış yeşilleri, sarıları ve kırmızıları aydınlık modda okunabilirlik sınırları dahilinde daha doygun orman yeşili, zengin kehribar sarısı ve canlı kan kırmızı tonlarına dönüştürüldü.
- **Tarih**: 20.05.2026

### [Performance/Visual/HUD] [UPD-038] İnteraktif Harita Performans İyileştirmesi, RPG HUD Tasarımı ve Yaşam Göstergeleri Oyunsallaştırması
- **Açıklama**:
  1. **İnteraktif Harita Performans İyileştirmesi**: Türkiye Haritasında fareyle gezinirken (hover/mousemove) anlık koordinat güncellemesinin her pikselde tüm harita bileşenini baştan aşağı yeniden çizmesi (full re-render) sorunu çözüldü. Koordinat takibi React `state` yapısından çıkarılıp doğrudan DOM `ref` (`tooltipRef`) atamasına geçirildi; tooltip kutusunun görünürlüğü ise `display: 'none'/'flex'` ile yönetilerek harita hareketlerindeki takılma ve donmalar tamamen giderildi.
  2. **RPG HUD Tarzı Header Tasarımı**: 
     - Header'dan `🏠 İkametgah` bilgisi kaldırılarak sadece güncel `📍 Konum` bilgisi tutuldu.
     - Siyasi Nüfuz ve Cüzdan Nakit göstergeleri siberpunk/siyasi RPG oyunlarındaki HUD barları şeklinde yeniden tasarlandı; özel cyan ve gold tonlarında neon parlamalı çerçeveler, sol kenar durum göstergeleri ve monospace dijital fontlar eklendi.
     - Çıkış butonu, siber-kırmızı neon auralı ve yumuşak geçişli bir acil çıkış anahtarı olarak görselleştirildi.
  3. **Vital Yaşam Barlarının Oyunsallaştırılması**: `SurvivalStats.tsx` bileşenindeki düz çizgisel yaşam göstergeleri; siber-radar tarama çizgisi (`hud-scanline`), 12px kalınlığında kanal oluğu, hareketli siber-çizgili desen animasyonu (`progress-bar-stripes`) ve can/açlık seviyeleri %30'un altına indiğinde devreye giren kırmızı durum uyarı nabzı (`status-critical-pulse`) ile zenginleştirildi.
  4. **Bankacılık Konsolu Görselleştirmesi**: `FinancePortal.tsx` ana bakiye kartlarına neon durum kenarlıkları (Checking: Cyan, Savings: Emerald, Cash: Gold, Credit Score: Purple) ve periyodik olarak parıldayan yeşil durum LED'leri (`pulsing-dot`) entegre edilerek finansal işlemler konsol hissi verecek şekilde güncellendi.
- **Tarih**: 20.05.2026

### [Visual/Layout/HUD] [UPD-039] Yaşam Göstergelerinin Header HUD'a Taşınması ve Karargah Temizliği
- **Açıklama**:
  1. **Yaşam Göstergelerinin Header'a Taşınması**: Karakter yaşam göstergeleri (Sağlık, Açlık, Susuzluk, Enerji, Mutluluk) yatay olarak yan yana dizilecek şekilde premium header bölümünün alt satırına yerleştirildi. Her bir gösterge animasyonlu çizgili dolgusu, neon parlamaları, monospace dijital yüzdeleri ve kritik durumlarda yanıp sönen RPG uyarı efektleriyle oyun HUD'ı havasına kavuşturuldu. Ayrıca hastalık etkisi altındaki oyuncular için "⚠️ HASTALIK ETKİSİ" uyarısı da bu alana dinamik olarak entegre edildi.
  2. **Yüksek Seçim Kurulu (YSK Sandığı) Kartının Kaldırılması**: Cumhurbaşkanlığı seçimleri için oy pusulası içeren sandık kartı, meclis ve seçim süreçleri meclis oturumlarının konusu olduğundan şahsi Karargah sayfasından kaldırıldı. Siyasi Statü & İtibar kartı ise genişletilerek korunması sağlandı.
  3. **Karargah ve Son Gelişmeler Bölümünün Kaldırılması**: Karargah sayfasındaki asgari ücret haberleri ve bakanlar kurulunu toplama butonunu içeren "Karargah ve Son Gelişmeler" kartı kaldırıldı. Şirket/Borsa/Harita gibi asli menü seçeneklerine odaklanılması sağlandı.
  4. **Sayfa Düzeni ve Full-Width Optimizasyonu**: SurvivalStats ve Son Gelişmeler kartlarının çıkarılmasıyla birlikte Karargah (dashboard) üzerindeki Bankacılık Konsolu (FinancePortal) ve Siyasi Durum (PoliticsHub) bileşenleri 1 sütunlu tam ekran (1fr grid) genişliğine çekilerek modern ve dengeli bir sayfa hiyerarşisi elde edildi.
- **Tarih**: 20.05.2026

### [Visual/Layout/HUD] [UPD-040] HUD Basitleştirmesi, Finansal Varlıkların ve Nüfuzun Yatay Şeride Entegrasyonu
- **Açıklama**:
  1. **HUD Etki ve Finans Göstergelerinin Taşınması**: Siyasi Nüfuz (PTS) ve Cüzdan Nakit (₺) göstergeleri, header üst satırındaki büyük hantal yapısından kurtarılarak alt satırdaki yatay şeridin sağ tarafına yerleştirildi. Böylece üst bilgi alanı tamamen temizlenerek sadece sayfa sekmeleri, tema değiştirici ve güvenli çıkış butonuna ayrıldı.
  2. **Banka Vadesiz Hesap Göstergesi**: Oyuncunun bankadaki vadesiz hesabına ait anlık bakiye bilgisi (Vadesiz: ₺...) yeşil neon vurgulu bir mini RPG göstergesi olarak yatay şeridin sağ ucuna entegre edildi.
  3. **Yatay HUD Düzeni ve Etiket Revizyonu**: Yatay HUD etiket ismi "Hayati Durum" yerine daha kapsamlı bir RPG terimi olan "Kondisyon" olarak güncellendi. Sol tarafta kondisyon göstergeleri (Sağlık, Açlık vb.), sağ tarafta ise finansal durum ve nüfuz göstergeleri yer alacak şekilde `space-between` hizalamasıyla dengelendi.
- **Tarih**: 20.05.2026

### [Integration/Backend/API] [UPD-041] İstemci-Sunucu Entegrasyonu, Canlı Borsa WebSockets Yayını ve Meclis Veritabanı Geçişi
- **Açıklama**:
  1. **Gerçek Zamanlı Emtia Borsası**: İstemci tarafındaki yapay/statik fiyat dalgalanma zamanlayıcısı tamamen kaldırıldı. Sunucu tarafında `marketWorker.ts` arka plan servisi kurulup PostgreSQL veritabanındaki emtiaların fiyatları her 10 saniyede bir dalgalandırılacak ve güncel fiyatlar `Socket.io` aracılığıyla `'commodity_prices_updated'` odasına canlı olarak yayınlanacak şekilde entegre edildi. İstemci (`App.tsx`) bu yayına bağlanarak borsa fiyatlarını anlık ve senkronize olarak günceller.
  2. **JWT-Tabanlı Kimlik Doğrulama ve Profil Senkronizasyonu**: `AuthLayout.tsx` üzerindeki sahte/statik giriş kontrolleri, sunucudaki `/users/register` ve `/users/login` uç noktalarına yönlendirildi. Başarılı girişte elde edilen JWT token yerel depolamada saklanır. Sayfa yenilendiğinde veya oturum açıkken sunucudan `/users/me` API isteği ile güncel karakter verileri (nakit, banka hesapları, nüfuz, itibar, sağlık vb.) çekilerek React durumuyla senkronize edilir.
  3. **Aktif Kalp Atışı (Heartbeat)**: Oyuncunun oyunda aktif kaldığını sunucuya bildiren kalp atışı pingi (`POST /users/heartbeat`) 60 saniyede bir gönderilecek şekilde entegre edildi.
  4. **Meclis Yasa Tasarıları ve Karar Mekanizması**: Yasa tasarısı önerme (`/politics/laws/propose`) ve mecliste oylama yapma (`/politics/laws/vote`) eylemleri local storage tabanlı sahte veriler yerine sunucudaki PostgreSQL veritabanı tablolarına bağlandı. Mükerrer oy kullanılmasını engelleyen veritabanı kısıtları eklendi.
- **Tarih**: 20.05.2026

### [Feature/Visual] [UPD-042] Giriş Ekranı Yenilemesi ve Kabine Rebranding Çalışması
- **Açıklama**:
  1. **Oyun Rebranding & AAA-Kalite Logo**: Eski geçici "T.C. Simülasyonu" başlıkları kaldırılarak oyunun adı **"KABİNE"** olarak güncellendi. Alt başlık; siyaset, holding yönetimi, şirketler, borsa, emtialar ve savaş alanlarını kapsayacak şekilde daha öz ve net olan **"SİYASET • EKONOMİ • JEOSTRATEJİ"** kelimeleriyle değiştirildi. Lucide ikon kütüphanesinden kalma basit kalkan yerine, 3 altın yıldız (Siyaset, Ekonomi, Jeostrateji), çift dairesel pusula çizgileri ve ortasında kırmızı gradyanlı kalkan içinde altın ay-yıldız barındıran **Özel SVG Kabine Strateji Amblemi (Coat of Arms)** tasarlanarak entegre edildi. Ay-yıldızın yamuk ve dengesiz duruşunu engellemek amacıyla, crescent (hilal) ve star (yıldız) geometrisi matematiksel olarak baştan hesaplanarak kalkanın görsel ağırlık merkezine (`translate(1.8, 0.5)`) kusursuz simetri ile ortalandı. Ayrıca logoya cilalı altın gradyanları (`url(#gold-metal)`), neon kırmızı parıltı filtreleri (`url(#neon-glow)`) ve birbirinin tersi yönünde dönen çift siber-pusula halka animasyonu eklenerek AAA oyun kalitesinde yaşayan bir arayüz görseli elde edildi.
  2. **Giriş Ekranı Performans & Kod Optimizasyonu**: Sayfanın yavaş yüklenmesini/kasmasını önlemek ve klavyeden yazı yazarken oluşan input gecikmelerini (typing lag) sıfıra indirmek için şu derin optimizasyonlar sağlandı:
     - **Preload (Ön yükleme) Entegrasyonu**: `index.html` dosyasına `hd_tactic_map.png` için `fetchpriority="high"` içeren görsel ön yükleme etiketi eklendi. Bu sayede tarayıcı, React bundle'ının yüklenip çalışmasını beklemeden arka plan haritasını ilk aşamada paralel olarak indirmeye başlayarak First Paint ve LCP (Largest Contentful Paint) hızını en üst düzeye çıkardı.
     - **Durum İzolasyonu (Isolated Rendering)**: Giriş ekranındaki harita pingleri ve radar taraması gibi 2.5-3 saniyede bir güncellenen dinamik durumlar (state updates) bağımsız ve memoized bir subcomponent olan `TacticalMapOverlay` içine taşındı. Böylece, arka plandaki animasyon güncellemeleri sırasında form alanlarının, kullanıcı adı/şifre girdilerinin ve logo bileşeninin gereksiz yere baştan çizilmesi (re-render) tamamen engellendi; klavye tepkime süresi kusursuz ve anlık hale getirildi.
     - **Dinamik Modül Yükleme (Code Splitting)**: İlk yükleme esnasında bundle boyutunu şişiren `canvas-confetti` kütüphanesi statik importtan çıkarıldı. Artık bu kütüphane sadece kullanıcı giriş/kayıt işlemlerini başarıyla tamamladığında dinamik import (`await import('canvas-confetti')`) yöntemiyle yüklenecek ve ilk sayfa yükleme süresi belirgin şekilde kısalacaktır.
  3. **Uyumlu Tab Menü Renkleri**: Giriş yap/Kayıt ol butonlarının bulunduğu tab menüdeki renk uyumsuzlukları giderildi. Uyumsuz kırmızı butonlar yerine stratejik tema ile tam uyumlu **Altın/Kehribar ve Koyu Slate** renk paletine geçildi: Aktif tab altın yaldız çerçeve (`#fbbf24`), içe doğru hafif altın gölge ve altın metinle vurgulanırken, inaktif tab arka plansız saydam ve gri metin olarak tasarlandı.
  4. **Taktiksel Giriş Alanları & Tema Çakışması Giderimi**: Sıradan beyaz girdi kutuları yerine siber-askeri temaya uygun yarı saydam koyu gri (`rgba(15, 23, 42, 0.95)`) ve altın çerçeveli modern borsa terminali stili girdi alanları tasarlandı. Light modun `:root[data-theme="light"] input` stilinin (`background: #ffffff !important`) bu tasarımı bozmasını önlemek için CSS seçici özgüllüğü (specificity) `:root[data-theme="light"] input.strategy-input` seviyesine yükseltilerek inputların her iki temada da tamamen karanlık ve premium kalması sağlandı.
  5. **Ultra HD Savaş ve Ekonomi Haritası Arka Planı (Masaüstü & Mobil Uyumlu)**: Eski düşük çözünürlüklü ortaçağ haritası kaldırılarak yerine; modern jeostratejik dünya savaşı cephelerini, radar dalgalarını, detaylı sınır çizgilerini ve finans borsa grafiklerini barındıran **Ultra HD 8K çözünürlüklü modern askeri/ekonomik harekat merkezi arka plan tasarımı** (`hd_tactic_map.png`) yerleştirildi. Mobil tarayıcılarda resmi bulanıklaştıran ve çözünürlüğü bozan CSS `fixed` arka plan ilişkisi kaldırılarak yerine, donanım hızlandırmalı, bağımsız bir katmanda çalışan HD arka plan konteyneri tasarlandı. Mobil ekranlar için haritanın en detaylı kısmını merkeze getiren akıllı konumlandırma medyaları (`@media (max-width: 768px) { .tactic-bg { background-position: 65% center !important; } }`) eklendi.
  6. **Harita Üzerinde Canlı Savaş ve Ticaret Animasyonları**: Harita görünümüne askeri karargah havası katmak için:
     - Sürekli aşağı doğru tarama yapan yeşil-kırmızı siber **Radar Sweep** çizgisi,
     - Haritanın rastgele koordinatlarında her 2.5 saniyede bir tetiklenen ve genişleyerek kaybolan kırmızı **Taktiksel Çatışma (Combat) Pingleri** ve altın sarısı **Borsa/Ticaret (Trade) Pingleri** eklendi.
     - Animasyonların donma yaratmaması için CPU yormayan, donanım hızlandırmalı GPU tabanlı transform/opacity CSS animasyonları kullanıldı.
  7. **Hızlı Giriş Seçenekleri ve Sosyal Buton Hataları**: "Veya Şunlarla Bağlan" başlığı **"HIZLI GİRİŞ SEÇENEKLERİ"** olarak güncellendi. Hatalı olan, hover edildiğinde buton içinde kaymaya neden olan Google, Facebook, Apple butonları kaldırılıp yerine mükemmel ortalanmış vektörel SVGs yerleştirildi; `padding: 0` ve `inline-flex` atamasıyla kayma hataları giderildi.
  8. **Temizlik ve Netlik**: Ana aksiyon buton metinleri "Giriş Yap" ve "Kaydol" / "Kayıt Ol" olarak sadeleştirildi. Sağ üst köşedeki hızlı giriş widget'ı ve geliştirici test girişi ipuçları kaldırılarak sadeleştirilmiş, kararlı bir giriş deneyimi sunuldu.
  9. **Responsive Footer ve Telif Yazısı**: Mobil veya tablet (ekran genişliği <= 1024px) üzerinden girildiğinde footer'daki "Hizmet Koşulları • Gizlilik Politikası • Destek Al" link grubu gizlendi (masaüstünde gösterilmeye devam ediyor). Telif yazısı ise "© 2026 BAGIO LABS • KABİNE SÜRÜM 1.1" olarak güncellendi.
- **Tarih**: 20.05.2026

### [Feature/Responsive] [UPD-060] Admin Paneli Mobil Uyumluluk (Responsive CSS) ve Scrollbar İyileştirmeleri
- **Açıklama**:
  1. **Global Admin Tasarım Sistemi (`index.css`)**: `web-admin` projesi için premium koyu tonlu scrollbar stilleri ve grid/flex düzenini yöneten `admin-grid-4`, `admin-grid-3`, `admin-grid-2`, `admin-flex-row-to-col` ve `table-responsive` helper CSS sınıfları geliştirildi, `main.tsx` üzerinden uygulamaya dahil edildi.
  2. **Yönetici Düzeni (`AdminLayout.tsx`)**: Üst menü ve sidebar, mobil ekran boyutları için bir Hamburger menü ve açılır-kapanır (drawer overlay) menü yapısıyla tamamen yeniden tasarlandı. "Oyuncu Yönetimi" sayfa başlığı "Vatandaşlar" olarak güncellendi.
  3. **Vatandaş Yönetim Ekranı (`UserManager.tsx`)**: Vatandaş tablosunun yatay taşma (scroll) stili, premium gizli scrollbar ile sarmalanarak responsive yapıldı. Bilgi düzenleme modalı ve arama alanları mobil ekranlarda dikey sıralanacak şekilde optimize edildi.
  4. **Yönetim Paneli Dashboard (`AdminDashboard.tsx`)**: Özet istatistik kartları ve Türkiye haritası/detay alanları dikey yığılmalı responsive gride geçirildi.
  5. **Borsa, Yasalar ve Lojistik Panelleri (`MarketManager.tsx`, `LawManager.tsx`, `LogisticsManager.tsx`)**: Kart listesi 3'lü/2'li grid stili responsive yapılarak taşmalar önlendi. Modallerin mobilde %90 ekran genişliği kaplaması sağlandı.
  6. **İnteraktif Türkiye Haritası (`InteractiveMap.tsx`)**: Tailwind bağımlılığı temizlenerek tamamen responsive inline stillerle modifiye edildi. Mobilde yükseklik 350px olarak sınırlandırıldı.
  7. **Canlıya Geçiş Kılavuzu (`docs/production-deployment.md`)**: Canlı sunucuda Nginx Reverse Proxy mimarisi, port gizleme güvenlik önlemleri ve SSL/TLS kurulum yönergelerini içeren detaylı bir dokümantasyon oluşturuldu.
- **Tarih**: 20.05.2026
### [Feature] [UPD-043] Cumhurbaşkanlığı Devlet Emtia Deposu ve Rezerv Yönetimi
- **Açıklama**:
  1. **Yönetim Modülü**: Cumhurbaşkanı yönetim paneline yeni bir **"📦 Devlet Deposu"** sekmesi entegre edildi.
  2. **Emtia Rezerv Listeleme**: 9 temel stratejik hammaddenin (Kömür, Demir vb.) anlık borsa fiyatları ve devlet deposundaki mevcut stok durumları listelendi.
  3. **Cumhurbaşkanlığı İşlem Yetkileri**: Cumhurbaşkanının doğrudan devlet deposunu yönetebilmesi için 4 temel aksiyon entegre edildi:
     - **Depola (Koy)**: Kendi envanterindeki emtiayı devlet deposuna teslim eder.
     - **Envantere Çek**: Devlet deposundaki stratejik rezervi kendi envanterine çeker.
     - **Satın Al**: Borsa fiyatı üzerinden hazine bütçesiyle piyasadan mal alıp depoya yükler.
     - **Borsada Sat**: Depodaki rezervleri piyasada nakde çevirerek elde edilen geliri doğrudan hazineye aktarır.
- **Tarih**: 20.05.2026

### [Feature] [UPD-044] Hukuki Uyumluluk ve Yasal Belgeler Entegrasyonu (Compliance Modals)
- **Açıklama**:
  1. **Yasal Belgeler Modülü**: Google ve uluslararası platformlarca zorunlu tutulan tüm hukuki belgeleri barındıran `ComplianceModal` bileşeni geliştirildi.
  2. **Kapsamlı İçerik**: Modül şu belgeleri Türkçe ve hukuki standartlara uygun dilde içerir:
     - **Hizmet Koşulları**: Sanal ekonomi uyarısı (bakiye ve emtiaların gerçek hayatta hiçbir karşılığı olmadığını ve yatırım tavsiyesi olmadığını belirten kritik beyan).
     - **Gizlilik Politikası**: Kullanıcı adı, karakter ismi, telefon numarası ve IP adresi saklama ilkeleri.
     - **Çerez Politikası**: Oturum takibi için local storage / session cookie kullanımlarının teknik beyanı.
     - **KVKK Aydınlatma Metni**: 6698 sayılı KVKK kapsamındaki veri hakları ve support kanalı.
     - **Destek ve İletişim**: Teknik arıza ve geri bildirimler için `support@bagiolabs.com` iletişim adresi.
  3. **Kolay Erişim ve Linkleme**: Belgeler hem giriş/kayıt arayüzü (`AuthLayout.tsx`) hem de ana dashboard (`App.tsx`) footer'ına entegre edilerek tek tıkla açılabilir, pürüzsüz geçişli (tab) tek bir şık modalda birleştirildi.
- **Tarih**: 20.05.2026

### [Visual/Fix] [UPD-045] KABİNE SVG Logo Ayyıldız Düzeltmesi ve Form Elemanları Sadeleştirmesi
- **Açıklama**:
  1. **SVG Masking ile Hilal ve Yıldız Çözümü**: KABİNE logosundaki kalkanın içinde yer alan hilal (crescent moon) ve yıldız (star) geometrisinin bazı tarayıcılarda kaybolması/sıfır genişliğe düşmesi sorunu giderildi. SVG maskesi (`<mask id="crescent-mask">`) tanımlanarak, iki basit çemberin kesişimiyle (beyaz çember ve sağdan kesen siyah çember) mükemmel bir hilal elde edildi. `transform="translate"` kayması kaldırılarak kalkanın merkezine doğrudan absolute koordinatlarla oturtuldu.
  2. **Giriş ve Kayıt Metin Kutusu Sadeleştirmesi**: Form elemanları daha yalın ve amaca yönelik hale getirildi:
     - **Giriş Yap**: "Kullanıcı Giriş Adı" yerine "Kullanıcı Adı" etiketi ve "Kullanıcı Adınız" placeholder'ı yerleştirildi. Şifre alanı "Şifreniz" olarak kısaltıldı.
     - **Kayıt Ol**: Telefon, Karakter Adı ve Karakter Soyadı girdi alanları sırasıyla "Telefon Numaranız", "Karakter Adınız" ve "Karakter Soyadınız" placeholder'ları ile daha temiz ve doğrudan bir hale getirildi.
- **Tarih**: 20.05.2026

### [Feature] [UPD-046] Giriş/Kayıt Sisteminin İşlevselleştirilmesi ve "yalova" Test Cumhurbaşkanı Entegrasyonu
- **Açıklama**:
  1. **Otomatik Cumhurbaşkanı Seeding**: Veritabanı ilk kez açıldığında, "yalova" isimli test kullanıcısı şifresi "yalova" olacak şekilde, Yalova ilinde (Province ID = 2) ve doğrudan `PoliticalRole.CUMHURBASKANI` yetkileriyle otomatik olarak seed edilir.
  2. **Giriş Bypass & Otomatik Kayıt**: Giriş ekranında "yalova" kullanıcı adı girildiğinde şifre doğrulama aşaması bypass edilmiştir (kolay test için). Ayrıca kullanıcı veritabanında henüz mevcut değilse veritabanına otomatik olarak Cumhurbaşkanı nitelikleriyle anında kaydedilir ve doğrudan giriş yaptırılır.
  3. **Varsayılan Sade Vatandaş Rolü**: "yalova" haricindeki diğer tüm yeni kayıt olan kullanıcıların `PoliticalRole.VATANDAS` (Sade Vatandaş) olarak Ankara ilinde (Province ID = 1) başlaması garanti altına alınmıştır.
  4. **Dinamik İl Ataması**: Kayıt esnasında `AuthLayout.tsx` üzerindeki Ankara il ataması hardcoded olmaktan çıkarılarak, backend'in döndürdüğü `currentProvinceId` ve `citizenshipProvinceId` değerlerine göre dinamik olarak haritalandırılmıştır.
- **Tarih**: 20.05.2026

### [Security/Feature] [UPD-047] Kimlik Doğrulama Mantıksal Açıkları ve Girdi Normalizasyonlarının Giderilmesi
- **Açıklama**:
  1. **Case-Insensitivity & Boşluk Düzeltmeleri**: Giriş ve kayıt ekranlarında kullanıcı adının PostgreSQL üzerindeki case-sensitivity (büyük/küçük harf duyarlılığı) nedeniyle mükerrer hesap oluşturma veya `yalova` kelime kontrolünü bypass etme riski giderildi. Kullanıcı adları hem istemci (`AuthLayout.tsx`) hem sunucu (`AuthController.ts` ve `AuthService.ts`) katmanlarında otomatik olarak küçük harfe (`.toLowerCase()`) dönüştürülüp boşlukları temizlenerek (`.trim()`) işlenmektedir.
  2. **Telefon Numarası Normalizasyonu**: Kullanıcıların telefon numaralarındaki boşluk, parantez veya ülke kodu farklılıklarından ötürü benzersizlik kuralını aşmalarını engellemek için, numaralar sadece rakamlardan oluşacak şekilde temizlenerek (`replace(/\D/g, '')`) normalize edildi.
  3. **Strict Regex Validasyonları**:
     - Kullanıcı adı doğrulaması: 3-20 karakter, yalnızca küçük harf, rakam, alt çizgi (_) veya tire (-).
     - Karakter isim/soyisim doğrulaması: Yalnızca Türkçe/İngilizce harfler ve boşluklar (2-30 karakter).
     - Şifre doğrulaması: Minimum 6 karakter sınırı hem istemci hem sunucuda zorunlu kılındı.
- **Tarih**: 20.05.2026

### [Feature] [UPD-048] Karakter Özelleştirme ve Adım Adım Oluşturma Sihirbazı Entegrasyonu
- **Açıklama**:
  1. **Veri Modeli Genişletmesi**: `User.ts` tablosuna karakter detayları için `isCharacterCreated`, `avatarId`, `isometricModelId` ve `backstoryId` kolonları eklendi.
  2. **setupCharacter API Uç Noktası**: `UserController` ve `userRoutes` bünyesinde korumalı `/setup-character` POST endpoint'i hayata geçirildi. Kullanıcı verileri kaydedilirken başlangıç eyalet ve ilçesine göre `currentProvinceId`/`currentDistrictId` değerleri dinamik olarak güncellenir.
  3. **4 Adımlı Karakter Oluşturma Sihirbazı**: `CharacterCreationScreen.tsx` bileşeni eklendi.
     - **1. Adım (Isometric Karakter)**: 3D mekan tasarımlarında kullanılacak 4 adet özelleştirilmiş SVG karakter modeli (Diplomat, Asker, Sanayici, Teknokrat) seçilebilir kılındı.
     - **2. Adım (Profil Portresi)**: Meclis ve kimlik kartında yer alacak 8 farklı politik/militer/sanayi portresi eklendi.
     - **3. Adım (Siyasi Geçmiş/Köken)**: Başlangıç ideolojisini belirleyecek 4 adet hikaye kökeni (Vatansever Muharip, Seçkin Sanayici, Sendika Temsilcisi, Teknokrat Veri Araştırmacısı) eklendi.
     - **4. Adım (Başlangıç Yerleşimi)**: 6 farklı eyalet (Ankara, Yalova, İstanbul, İzmir, Bursa, Antalya) ve bunlara ait ilçeler arasından seçim yapabilme imkanı sunuldu.
  4. **Akış Yönlendirmesi**: `App.tsx` üzerinden kullanıcı giriş yaptığında eğer `isCharacterCreated` değeri `false` ise doğrudan karakter oluşturma ekranına yönlendirilir. İşlem tamamlandığında konfeti eşliğinde ana oyuna geçiş sağlanır.
- **Tarih**: 20.05.2026

### [Visual/Fix] [UPD-049] Kayıt Ekranı Sosyal Giriş Butonlarının Kaldırılması
- **Açıklama**: 
  1. Kullanıcı deneyimini sadeleştirmek ve karmaşayı azaltmak amacıyla kayıt ol ekranındaki (Register) sosyal/hızlı giriş seçenekleri ve ilgili başlık yazısı tamamen kaldırıldı.
  2. Hızlı giriş seçenekleri yalnızca giriş (Login) ekranında kalacak şekilde koşullandırıldı.
- **Tarih**: 20.05.2026

### [Security/Optimization/MVC] [UPD-050] Güvenli MVC WebP Resim Yükleme Hattı ve Görsel Optimizasyonları
- **Açıklama**:
  1. **Görsel Dönüşümü ve Optimizasyonu**: Proje bünyesindeki tüm statik `.png` dosyaları `sharp` kullanılarak sıkıştırılmış yüksek kaliteli `.webp` formatına dönüştürüldü ve orijinal PNG dosyaları silindi. Kod tabanındaki (MarketplaceView, useIsometricEngine, AuthLayout) tüm statik görsel referansları güncellendi.
  2. **Güvenlik Kontrolleriyle imageUploadMiddleware**: Sunucuya yüklenen resimler için `multer` bellek depolama (in-memory) yapısıyla çalışan ara yazılım geliştirildi. 5MB boyut sınırı ve MIME türü denetiminin yanı sıra, yüklenen dosyaların ilk baytları incelenerek (Magic Bytes imzaları) sadece gerçek PNG, JPEG, WEBP ve GIF resimleri kabul edildi (dosya uzantısı taklit eden zararlı yazılımlar engellendi).
  3. **Metadata Temizleme ve ImageUploadService**: Sharp motoru kullanılarak resimlerin tüm EXIF/JFIF gizli metadata/konum bilgileri temizlendi, dikey yönlendirme (auto-rotate) yapıldı ve kriptografik benzersiz isimler (UUID) atanarak WebP formatına dönüştürüldü.
  4. **MVC Yapısında Controller & Routes**: Resim yükleme işlemleri için `ImageUploadController` ve `/api/v1/images/upload` rotasını barındıran `imageRoutes` yazıldı, `app.ts` üzerinde statik olarak `/uploads` yoluyla dışarıya servis edildi.
  5. **Helmet Cross-Origin Ayarı**: Tarayıcıların farklı portlardan (`5173`/`5174`) bu yüklenen resimleri sorunsuzca çekip render edebilmesi amacıyla Express `helmet` politikası `crossOriginResourcePolicy: { policy: "cross-origin" }` olarak yapılandırıldı.
- **Tarih**: 20.05.2026

### [UPD-051] 81 İl ve 923 İlçe Dinamik Entegrasyonu ve Karakter Oluşturma Eyalet Sınırlandırması
- **Açıklama**:
  1. **Dinamik Coğrafi Veri Sistemi**: Türkiye'nin 81 ilini (resmi plaka ID'leri ile) ve 923 ilçesini (1-923 benzersiz sıralı ID'leri ile) içeren `locationData.ts` modülü üretildi ve hem frontend (`apps/web-user/src/data`) hem de backend (`services/core-api/src/utils`) dizinlerine yerleştirildi.
  2. **Lookup Güncellemeleri**: `App.tsx` içerisindeki statik eyalet/ilçe lookupları kaldırıldı, yerlerine coğrafi veri tabanındaki tüm kayıtları tanıyan dinamik lookuplar bağlandı.
  3. **Karakter Oluşturma & 11 Devlet Sınırlandırması**: `CharacterCreationScreen.tsx` üzerinde başlangıç konumu olarak sadece kullanıcının seçebileceği 11 şehir cumhuriyeti (İstanbul, Ankara, Bursa, Balıkesir, İzmir, Antalya, Hatay, Trabzon, Konya, Adana, Kocaeli) listelenecek şekilde kısıtlandı.
  4. **Mobil/Premium Kaydırılabilir İlçe Seçim Listesi**: Çok sayıda ilçesi olan şehirlerde listeleme yapıldığında kartların aşağı doğru aşırı taşmasını önlemek amacıyla ilçe listesine max-height (350px) ve şık bir kaydırma çubuğu (`overflow-y: auto`, `custom-scrollbar`) entegre edildi.
  5. **Tohumlama ve Rezerv Entegrasyonu**: `database.ts` tohumlama servisi güncellenerek 81 eyaletin tamamı için 9 farklı hammadde maden rezerv kayıtları (StateReserve) oluşturuldu. Özel `yalova` test kullanıcısının varsayılan konumu Yalova Cumhuriyeti (77) ve Yalova Merkez (898) olarak ayarlandı.
  6. **Auth Servisi Güncellemesi**: Yeni kayıt olan sade vatandaşların Ankara Cumhuriyeti (6) ve Çankaya ilçesinde (60) başlaması, `yalova` hesabının ise Yalova (77) ve Merkez (898) olarak açılması sağlandı.
- **Tarih**: 20.05.2026

### [UPD-052] Gelişmiş Video Arka Plan Döngüsü, Telefon prefix Kilidi ve XML/XSS/XXE Güvenlik Filtreleri
- **Açıklama**:
  1. **Çoklu Video Sıralı Geçiş ve Döngü Sınırı**: Giriş ekranı (`AuthLayout.tsx`) arka planında oynayan videolar sırasıyla `bg_video_1` ➔ `bg_video_3` ➔ `bg_video_2` olarak yapılandırıldı. Video geçişleri 10 tur döngüyle sınırlandırıldı ve bitiminde sinematik crossfade ile yüksek kaliteli `login_bg.webp` fallback posterine geçiş sağlandı. Geçiş tamamlandığında bellek temizliği yapılarak CPU kullanımı %0'a düşürüldü.
  2. **Karakter Seçim/Step Ekranı Video Arka Planı**: `CharacterCreationScreen.tsx` üzerindeki statik `simulation_bg.png` arka planı kaldırıldı. Yerine `VideoBackgroundOverlay` bileşeni `single-loop` modunda entegre edilerek `bg_video_1.mp4` dosyası sonsuz ve takılmasız bir Canvas döngüsünde çalıştırıldı. Fallback posteri olarak HD `simulation_bg.webp` tanımlandı.
  3. **Telefon Alanında Sabit +90 Öneki ve 10 Hane Sınırı**: 
     - Frontend tarafında `+90` ibaresi textbox içerisinde sabit, değiştirilemez bir prefix olarak kilitlendi.
     - Giriş alanında kullanıcının yalnızca 10 hane girebilmesini sağlayan karakter sınırı (`slice(0, 10)`) ve sayısal filtreleme (`replace(/\D/g, '')`) yapıldı.
     - Backend tarafında `/users/register` rotasında ve TypeORM veritabanı model katmanında (`@BeforeInsert` / `@BeforeUpdate` tetikleyicileri ile) numaranın tam olarak `905xxxxxxxxx` (12 hane) formatında olması kalıcı kurallarla garanti altına alındı.
  4. **XML, XXE, DTD ve XSS Güvenlik Açıklarının Kapatılması**:
     - Express backend uygulamasına global `securitySanitizer` ara yazılımı (middleware) eklendi. Gelen tüm `req.body`, `req.query` ve `req.params` içerisindeki string alanlar recursive (özyinelemeli) olarak XML deklarasyonları (`<?xml`), DTD tanımları (`<!DOCTYPE`, `<!ENTITY`, `<!ELEMENT`), harici sistem çağrıları (`SYSTEM`, `PUBLIC`), XML ad alanları (`xmlns`) ve tehlikeli XSS/HTML betiklerinden (`<script>`, inline olay tetikleyicileri) temizlendi.
     - Frontend tarafında veriler API'ye iletilmeden önce `containsXmlOrXss` süzgeciyle denetlenerek tehlikeli veriler erken aşamada bloke edildi.
- **Tarih**: 20.05.2026

### [UPD-053] React Native Expo Mobil Uyumluluk, Giriş Video Arka Planları ve Karakter Kurulum Sihirbazı
- **Açıklama**:
  1. **Expo Bağımlılık ve Konfigürasyon Yapılandırması**:
     - 0 byte olan boş `app.json` dosyası doldurularak geçerli bir Expo 50 yapılandırması sağlandı.
     - `npx expo-doctor` uyumsuzlukları giderildi: Çakışan `@types/react-native` paketi kaldırıldı. `react-native-svg` sürümü Expo SDK 50 ile tam uyumlu olan `14.1.0` sürümüne çekildi.
     - Mobil yerel video oynatma için `expo-av` ve yerel oturum kalıcılığı için `@react-native-async-storage/async-storage` modülleri yüklendi.
     - Yerel push bildirimleri için `expo-notifications` ve interaktif yerel harita çizimi için `react-native-maps` modülleri projeye yüklendi.
     - `npx expo-doctor` testleri 15/15 başarı oranıyla tamamlandı.
  2. **Varlıkların (Assets) Mobil Projeye Kopyalanması**:
     - Web kullanıcısında yer alan `bg_video_1.mp4`, `bg_video_2.mp4`, `bg_video_3.mp4`, `login_bg.webp` ve `simulation_bg.webp` medya varlıkları, mobil uygulamanın `./src/assets/videos` ve `./src/assets/images` klasörlerine kopyalanarak paket içine gömüldü.
  3. **Mobil Auth ve WebSocket/Network Altyapısı**:
     - `axiosClient.ts` ve `socketClient.ts` dosyaları AsyncStorage ve Android emülatör özel köprü IP adresi (`10.0.2.2:3000`) ile yapılandırıldı. Sockets üzerinde `transports: ['websocket']` zorlanarak mobil ağlarda maksimum hız ve minimum gecikme sağlandı.
     - Giriş, kayıt ve kullanıcı profili durum takibini yöneten global `AuthContext.tsx` mobil sürümü yazıldı.
  4. **Mobil Giriş Ekranı (AuthScreen.tsx)**:
     - Arka planda sırasıyla `bg_video_1` ➔ `bg_video_3` ➔ `bg_video_2` videoları akıcı geçişlerle oynatıldı.
     - 10 tur döngü sınırı aşıldığında crossfade ile statik `login_bg.webp` görseline geçilerek donanım yükü sıfıra indirildi.
     - Telefon numarası alanında sabit `+90` öneki (prefix) kilitlendi, sadece rakam girişi ve tam olarak 10 karakter sınırı frontend düzeyinde uygulandı.
     - XML ve XSS saldırılarına karşı girdi denetleyici güvenlik filtresi submit aşamasına eklendi.
  5. **Mobil Karakter Kurulum Ekranı (CharacterCreationScreen.tsx)**:
     - Yeni kayıt olan ve karakteri bulunmayan kullanıcılar için 4 adımlı kurulum sihirbazı kodlandı.
     - Arka planda yalnızca `bg_video_1.mp4` videosu sonsuz döngüde oynatılacak şekilde tasarlandı. Fallback olarak `simulation_bg.webp` kullanıldı.
     - Cinsiyet, yaş, 11 büyük şehir cumhuriyeti ve bunlara bağlı dinamik ilçe seçimi (`locationData.ts` entegrasyonu ile), geçmiş hikayesi (backstory) ve avatar seçimi yaptırıldı. Kurulum tamamlandığında `/users/setup-character` API'sine istek gönderilerek profil güncellendi.
  6. **EAS Build APK Yapılandırması**:
     - Android platformunda geliştirme ve test süreçleri için doğrudan APK üretilmesini sağlayan `eas.json` yapılandırma dosyası oluşturuldu. `preview` ve `development-apk` profilleri üzerinde `buildType: "apk"` kuralı kilitlendi.
- **Tarih**: 20.05.2026

### [Feature] [UPD-054] Web Yönetici (Admin) Paneli Geliştirmeleri ve TypeScript Derleme Entegrasyonu
- **Açıklama**:
  1. **Backend Admin Altyapısı**: `User.model`'e `isAdmin` kolonu eklenerek `AdminController`, `adminMiddleware` ve `adminRoutes` Express API rotaları tamamlandı. `database.ts` içinde varsayılan `yalova` test kullanıcısı yönetici yetkileriyle tohumlandı.
  2. **Yönetici Giriş Sayfası (AdminLogin.tsx)**: +90 kilitli telefon kodu, güvenlik filtreleri ve yerel depolama token yönetimini barındıran premium giriş paneli oluşturuldu.
  3. **Yönetici Düzeni (AdminLayout.tsx)**: Sidebar, Header ve yetkilendirilmiş korumalı rotaları (ProtectedRoute) içeren ana admin arayüz yapısı kuruldu.
  4. **Yönetim Paneli Dashboard (AdminDashboard.tsx)**: Genel istatistik kartları ve SVG tabanlı interaktif eyalet-ilçe tıklama haritası entegre edildi.
  5. **Oyuncu Yönetimi (UserManager.tsx)**: Vatandaşların bakiyelerini, NP seviyelerini, rollerini ve ban/silme eylemlerini yöneten gelişmiş listeleyici ve düzenleme modalı kuruldu.
  6. **Borsa & Emtia Manipülasyonu (MarketManager.tsx)**: Emtia fiyatlarının değiştirilmesini sağlayan formlar, SVG trend grafikleri ve anlık WebSocket (`Socket.io`) yayın entegrasyonu tamamlandı.
  7. **Meclis ve Yasa Onay/Veto (LawManager.tsx)**: TBMM'ye sunulan yasa tekliflerini listeleyen, oylama oranlarını simüle eden ve onaylama/veto mekanizmasını yöneten modüller eklendi.
  8. **Lojistik ve Tır Filosu (LogisticsManager.tsx)**: Taşımacılık yapan tırları listeleyen ve filoya yeni tır ekleme imkanı sunan yönetim sayfası oluşturuldu.
  9. **TypeScript & Derleme Yapılandırması**: web-admin projesinin TypeScript derlemesini tamamlayabilmesi için eksik olan `tsconfig.json` ve `index.html` dosyaları oluşturuldu. TypeScript tip hataları, kullanılmayan Lucide ikon importları temizlenerek giderildi ve derleme testi başarıyla tamamlandı.
- **Tarih**: 20.05.2026

### [Feature] [UPD-055] Yönetici Girişi, Üyelik Kısıtlamaları, Yalova Yasağı ve MVC Refactoring
- **Açıklama**:
  1. **Yönetici Giriş Sistemi (Kullanıcı Adı & Şifre)**: Admin panel girişi, telefon numarası yerine kullanıcı adı (`admin`) ve şifre (`123456`) tabanlı çalışacak şekilde yeniden yapılandırıldı. `AdminLogin.tsx` form alanı buna göre güncellendi.
  2. **Üyelik Türü Kısıtlaması (Role Authorization)**: Sadece `isAdmin: true` olan kullanıcıların admin paneline girmesine izin verildi. Normal üyelerin (`demouser` dahil) admin paneline erişimi backend `/admin/login` ve `adminMiddleware` seviyesinde `403 Forbidden` ile engellendi.
  3. **Yalova Kullanıcı Adı Yasağı**: `yalova` isimli test kullanıcısı (ve şifresiz giriş bypass mekanizmaları) veritabanı tohumlamasından, kayıt (`AuthService.registerUser`, `AuthController.register`) ve giriş logic'lerinden tamamen kaldırılarak yasaklandı.
  4. **Demo Üyeliklerin Seeding Yapılandırması**: Eski tüm demo test hesapları kaldırılarak veritabanına kayıt koşullarına tam uyumlu 2 adet demo hesap tohumlandı:
     - **Yönetici (Admin)**: Kullanıcı adı: `admin`, Şifre: `123456`, Telefon: `905000000001`, `isAdmin: true`
     - **Vatandaş (Normal)**: Kullanıcı adı: `demouser`, Şifre: `123456`, Telefon: `905000000002`, `isAdmin: false`
  5. **MVC Servis Katmanı Refactoring (Clean Code)**:
     - `AdminService.ts` [NEW] katmanı oluşturularak, admin kontrolcüsünde bulunan tüm TypeORM veritabanı işlemleri ve iş mantığı buraya taşındı.
     - `AdminController.ts` sadece HTTP istek/cevap yönetimini yapacak şekilde sadeleştirildi.
     - `adminRoutes.ts` üzerinde `/login` API ucu middleware korumalarından muaf tutularak en üste eklendi.
  6. **Güvenlik Sıkılaştırması**: SQL Injection'a karşı TypeORM parametrik metot kullanımı doğrulandı. XSS ve XXE'ye karşı sunucu tarafında global `securitySanitizer` ve istemcide girdi filtreleri uygulandı. Yetkisiz token ve yetki kısıtlama testleri başarıyla tamamlandı.
- **Tarih**: 20.05.2026

### [Feature] [UPD-056] Vatandaş Kimlik Numarası (citizenId) Entegrasyonu
- **Açıklama**:
  1. **Veritabanı Modeli (`User.ts`)**: Her vatandaşın (karakterin) kendine özgü, 7 haneli benzersiz bir kimlik numarasına sahip olması amacıyla `User` tablosuna `citizenId` kolonu eklendi.
  2. **Dinamik Üretim Mantığı (`UserController.ts`)**: Karakter kurulum sihirbazının son onay aşamasında, `1000000` ile `9999999` arasında rastgele 7 haneli benzersiz sayılar üretilip veritabanında doğrulanarak kullanıcıya `citizenId` olarak atandı.
  3. **Tohumlama Verileri (`database.ts`)**: Demo hesapların kimlik numaraları `admin` için `1000001`, `demouser` için `1000002` olarak sabit tohumlandı.
  4. **Kullanıcı Paneli (`web-user`)**: Profil state yapısına `citizenId` eklendi ve Premium Header üzerinde `🪪 Kimlik No: XXXXXXX` şeklinde gösterim sağlandı.
  5. **Yönetici Paneli (`web-admin`)**: Oyuncu listesinde karakter adının hemen altında kimlik numaralarının listelenmesi sağlandı.
  6. **Mobil Arayüz (`mobile-game`)**: `AuthContext.tsx` içindeki yerel `User` tip tanımına `citizenId` alanı eklenerek veri yapısı backend ile uyumlu hale getirildi.
- **Tarih**: 20.05.2026

### [Feature/Security] [UPD-057] Mobil Uygulama EAS Build Hataları Çözümleri ve Özel Admin Alt Yolu (/websc-admin/) Yapılandırması
- **Açıklama**:
  1. **EAS Build EBUSY Dosya Kilidi Çözümü**: Mobil uygulamadaki `.gitignore` dosyası güncellenerek `android/`, `.gradle/`, `ios/`, `.expo/` ve `build/` dizinleri yoksayılanlar listesine eklendi. Yerelde çalışan ve kilitleri tutan Gradle Daemon'ları durduruldu. Git reposu temizlendi. Bu sayede EAS CLI paketleme yaparken dosya kilitlenme (EBUSY) hatası alması tamamen çözüldü.
  2. **Logo ve Splash Screen Görsel Tasarımları**: Mobil uygulamanın `app.json` dosyasında bulunmayan ikon ve splash screen yapılandırması için AI motoru ile özel tasarlanmış lüks logolu `icon.png` ve `splash.png` varlıkları üretilip `src/assets/images` dizinine yerleştirildi.
  3. **Güvenli ve Özel Admin Alt Yolu (/websc-admin/)**: Admin panelini daha güvenli ve tahmin edilemez hale getirmek için yerel ve canlı yönlendirmeler `/websc-admin/` alt yoluna taşındı. `apps/web-admin/vite.config.ts` dosyasına `base: '/websc-admin/'` ve `apps/web-admin/src/App.tsx` dosyasındaki `BrowserRouter` bileşenine `basename="/websc-admin"` eklenerek, admin paneline sadece bu özel URL üzerinden (`http://localhost:5173/websc-admin/`) erişim sağlanması garanti altına alındı.
- **Tarih**: 20.05.2026

- **Tarih**: 20.05.2026

### [Feature/Security/Config] [UPD-058] Admin Kullanıcı Engeli ve Kesin Port Sabitlemeleri
- **Açıklama**:
  1. **Admin Giriş Engeli (`AuthService.ts`)**: `AuthService.loginUser` metodunda güncelleme yapıldı. Eğer giriş yapan kullanıcının `isAdmin` yetkisi `true` ise vatandaş oyununa girişi engellenerek `"Yöneticiler vatandaş oyununa giriş yapamaz! Lütfen admin panelini kullanın."` hatası fırlatıldı.
  2. **Kesin Port ve Çakışma Önleme (`vite.config.ts`):** 
     - Vatandaş Oyunu (`web-user`) portu **`5173`** olarak kilitlendi ve `strictPort: true` tanımlandı.
     - Yönetici Paneli (`web-admin`) portu **`5174`** olarak kilitlendi ve `strictPort: true` tanımlandı.
     - Böylece iki dev sunucusunun da aynı portu (5173 veya 5174) çakışarak açması veya birbirlerinin arayüzlerini yüklemesi kesin olarak engellendi.
  3. **Boş main.tsx ve Alt Yol Script Yolu Hatası Çözümü (`web-admin`):**
     - Boş (0 byte) olan `apps/web-admin/src/main.tsx` dosyası doldurularak React uygulaması DOM root elementine bağlandı. Bu sayede admin panelinin tarayıcıda render edilememesi sorunu çözüldü.
     - `apps/web-admin/index.html` içindeki mutlak `/src/main.tsx` script yolu, base path ile uyumlu olacak şekilde göreceli (`src/main.tsx`) olarak güncellendi.
- **Tarih**: 20.05.2026

### [Bugfix] [UPD-059] Windows Altında Expo CLI 'node:sea' Klasör Oluşturma Hatası (ENOENT) Çözümü
- **Açıklama**: Windows dosya sisteminde iki nokta üst üste (`:`) karakteri geçersiz olduğundan, Node.js v20/v21+ sürümlerindeki built-in modüller listesinde yer alan `node:sea` modülü için Metro externals klasörü oluşturmaya çalışırken (`mkdir`) oluşan `ENOENT` hatası, `@expo/cli` paketinin derlenmiş `externals.js` dosyasında `:` içeren modüllerin filtrelenerek devre dışı bırakılmasıyla kalıcı olarak çözüldü.
- **Tarih**: 20.05.2026

### [Feature/Visual/Fix] [UPD-061] Mobil Giriş/Kayıt Ekranı İyileştirmeleri, Kesintisiz Müzik Entegrasyonu ve Arayüz Optimizasyonu
- **Açıklama**:
  1. **Google Sign-In Geçici Devre Dışı Bırakma & Hata Çözümü**: `@react-native-google-signin/google-signin` kütüphanesinin statik import mantığı dinamik `require` sarmalamasına taşınmış olsa dahi, eski dev-client ve Expo Go derlemelerinde Metro bundler'ın modülü bulamayarak `"requiring unknown module"` hatası vermesini engellemek amacıyla tüm `require('@react-native-google-signin/google-signin')` çağrıları **geçici olarak yorum satırına (comment-out)** alındı. Yeni yerel build (APK/IPA) alındıktan sonra bu satırlar tekrar aktif edilecektir.
  2. **Cam Tasarımı ve Renk Uyumlaştırması (Glassmorphism)**: 
     - Giriş kartı arka planı Slate-900 ailesinden `rgba(15, 23, 42, 0.85)` yapılarak arka plandaki HD videonun ışık dalgalanmalarının pürüzsüz süzülmesi sağlandı.
     - Kart kenarlarından sızıp köşe kararmalarına yol açan yüksek gölgelendirmeler düşürüldü (`shadowOpacity: 0.25`, `shadowRadius: 12`, `elevation: 6`).
     - Girdi kutuları, telefon alanları ve sosyal butonlar `rgba(8, 10, 18, 0.7)` kömür rengiyle içe gömülü (inset) bir tasarıma kavuşturuldu.
     - Tüm altın kenarlıklar tek renk tonuna (`rgba(217, 119, 6, 0.5)`) eşitlendi.
  3. **Kesintisiz Sakin Oyun Müziği Entegrasyonu**: Huzurlu ve gürültüsüz, loopable bir enstrümantal arka plan müziği (`background_music.mp3`) `expo-av` kütüphanesinin `Audio` API'siyle `AuthScreen` döngüsüne entegre edildi. Giriş ve Kayıt sekmeleri arasında kesintisiz çalma sağlanırken, ana oyuna geçişte (unmount) otomatik olarak durdurulup bellekten temizlenecek şekilde programlandı.
  4. **Sekme İkonlarının Temizlenmesi**: Kullanıcı talebi doğrultusunda, giriş kartı tab menüsündeki "GİRİŞ YAP" ve "KAYIT OL" metinlerinin hemen yanında duran SVG ikonları kaldırıldı.
  5. **Tıklama/Dokunma Olayları ve pointerEvents Çözümü**: Arka plan ve radar overlay katmanlarının (`background`, `video`, `spotlightOverlay`, `radarOverlay`, `overlay`) `position: 'absolute'` yapısından ötürü dokunma olaylarını (touch events) yutup butonların ve form alanlarının tıklanmasını engellemesi sorunu giderildi. Tüm arka plan görsel (`Image`) ve video (`Video`) bileşenleri, TypeScript tip kurallarına tam uyumlu ve dokunma olaylarına karşı tamamen geçirgen olan **`<View pointerEvents="none" style={styles.background}>`** sarmalayıcısı içine alınarak en üst katmandaki interaktif elemanların dokunuşları alması garanti altına alındı.
  7. **Yerel Ağ Bağlantısı ve API IP Güncellemesi (`axiosClient.ts`)**: Mobil cihazlardan (fiziki veya emülatör) yapılan isteklerin bilgisayarınızdaki backend servisine (port 3000) erişebilmesi için `10.0.2.2` olan IP adresi, bilgisayarınızın yerel Wi-Fi IP adresi olan **`192.168.1.3`** olarak güncellendi. Bu sayede ağ erişim/bağlantı (Network Timeout) hataları giderilerek kayıt ve giriş işlemleri aktif hale getirildi.
  8. **Google Password Manager Autofill Engeli (`AuthScreen.tsx`)**: Giriş ve Kayıt formundaki kullanıcı adı ve şifre girdi alanlarının tarayıcı gibi davranıp Google Şifre Yöneticisi pop-up'larını tetiklemesini önlemek amacıyla, ilgili TextInput bileşenlerine `autoComplete="off"`, `importantForAutofill="no"` ve `textContentType="none"` parametreleri eklendi.
  9. **Karakter Ekranı Başlığı Güncellemesi (`CharacterCreationScreen.tsx`)**: "KARAKTER KURULUM AŞAMASI" olan başlık, talep doğrultusunda daha dinamik ve net olan **"KARAKTER OLUŞTUR"** metniyle güncellendi.
  10. **Karakter Oluşturma Ekranı Adım 1 Sadeleştirilmesi, Türkçeleştirilmesi ve Taşma Düzeltmesi (`CharacterCreationScreen.tsx`)**:
      - Alt kısımdaki yaşa bağlı detaylı yetenek stat barları ve bilgilendirme kartı arayüz karmaşıklığını azaltmak amacıyla kaldırıldı.
      - Başlangıç karakter yaşı **18** olarak ayarlandı.
      - Cinsiyet seçimi kartlarındaki politik unvanlar kaldırılarak sadece **ERKEK** ve **KADIN** olarak sadeleştirildi.
  11. **Siyasi Görüş Seçimi ve Veri Tabanı / API Entegrasyonu**:
      - `User` veri tabanı modeline `politicalIdeologyId` (integer, nullable) kolonu eklendi.
      - Express API `UserController.ts` üzerindeki `/users/setup-character` endpoint'i güncellenerek seçilen ideolojinin doğrulanması ve veri tabanına kaydedilmesi sağlandı.
      - 10 farklı siyasi görüş belirlendi: *Sosyal Demokrasi (1)*, *Muhafazakarlık (2)*, *Milliyetçilik (3)*, *Liberalizm (4)*, *Sosyalizm (5)*, *Avrasyacılık (6)*, *Merkez Sağ (7)*, *Yeşiller / Çevrecilik (8)*, *Teknokrasi (9)*, *Federalizm (10)*.
      - Mobil arayüzde yaş seçicisinin hemen altına aynı şık konsol yapısında ("◀ Siyasi Görüş Adı ▶") **Siyasi Görüş** seçici alanı eklendi.
  12. **3D Karakter Avatarları ve Premium Neon Çerçeve Tasarımları**:
      - Gemini ile üretilen, birebir aynı siber/neon arka plana sahip 3D Erkek ve 3D Kadın politikacı karakter avatarları `assets/images/` dizinine eklendi.
      - Cinsiyet kartları (`genderCard`) fütüristik parıltı, neon sarısı gölge efekti ve `overflow: 'hidden'` parametreleriyle zenginleştirildi; görsellerin taşması kesin olarak engellendi.
- **Tarih**: 20.05.2026

### [UPD-062] Karakter Oluşturma Ekranı Performans, Visual Stepper ve Simetrik Tasarım İyileştirmeleri
- **Açıklama**:
  1. **Visual Stepper (Görsel Adım Takipçisi)**: "ADIM X / 4" şeklindeki düz metin göstergesi yerine, üst kısımda yer alan boşluğu dolduracak şık, dairesel maskeli 4 adımdan oluşan altın sarısı neon çizgili bir görsel stepper entegre edildi.
  2. **Performans Optimizasyonu (Background Media Memoization)**: Sıkça tetiklenen form re-render işlemlerinde ağır `expo-av` `<Video>` oynatıcısının kasmaması için arka plan medya katmanı `BackgroundMedia` adında statik bir `React.memo` bileşenine taşındı. Etkileşim hızı native uygulama seviyesine çıkarıldı.
  3. **Simetrik ve Büyük Bölüm Başlıkları**: Tüm adımlardaki "Cinsiyet Seçimi", "Karakter Yaşı", "Siyasi Görüş" gibi bölüm başlıkları (sectionTitle) büyütüldü ve responsive olarak modal/card alanının tam ortasına hizalandı (symmetrical alignment). İlk başlıklar haricindeki başlıklara otomatik dikey boşluk (spacers) entegre edildi.
  4. **Kutu Genişletme ve responsive Uyum**: Modal kart yüksekliği (`maxHeight`) dikey boşlukları azaltmak ve içeriği rahat sığdırmak için `%82` (küçük ekranlar için `%90`) seviyesine çıkarıldı.
  5. **Cinsiyet Seçim Görselleri Düzeltmesi**: Aktif cinsiyet kartında oluşan saydam sarı arka plan çökmesi giderildi. Kartın köşesindeki sarı tik rozeti ve aktif durumdaki yazı sararması kaldırılarak sadece dış çerçeve çizgisinin sararması sağlandı.
- **Tarih**: 20.05.2026

### [UPD-063] İkametgah Seç Ekranı Revizyonları ve Devlet/İlçe Akış Tasarımı
- **Açıklama**:
  1. **Header Güncellemesi**: Üst başlık "CUMHURİYET KİMLİĞİ" ifadesinden, kullanıcının talebiyle fütüristik/siber temadaki **"KARAKTER OLUŞTUR"** ifadesine geri çevrildi.
  2. **İkametgah Seç Başlığı ve Açıklamaları**: Step 2 başlığı "İkametgah Seç" olarak değiştirildi. Açıklama metinlerindeki tüm "Cumhuriyet" ifadeleri temizlendi; "Geleceğinizi inşa etmek ve yaşamak istediğiniz devleti belirleyin" ve "sınırları içerisinde yaşayacağınız ilçeyi seçin" şeklinde yaşanacak devlete atıfta bulunan açıklamalar eklendi.
  3. **Devlet İsimlerinin Güncellenmesi**: Eyalet/Devlet listesindeki (`STARTING_PROVINCES`) isimler "Ankara Cumhuriyeti", "Bursa Cumhuriyeti", "İstanbul Cumhuriyeti" şeklinde güncellendi ve yanlarındaki Marmara, Ege gibi bölge isimleri kaldırıldı.
  4. **Adım-2 Tam Ekran Arayüz Bölünmesi (State/District Flow)**: Devlet ve ilçe seçimi ekranlarının aynı anda görünmesi engellendi. Devlet seçilmemişken tüm modal yüksekliğini kaplayan "Devletinizi Seçin" listesi gösterilir. Devlet seçildiğinde ise devlet listesi gizlenir ve sadece "Yerleşim Bölgesi (İlçe)" listesi gösterilir.
  5. **Dinamik Yükseklik ve Responsive Yayılım (`flex: 1` Entegrasyonu)**: Devlet ve İlçe listelerindeki sabit `maxHeight` sınırlandırmaları kaldırılarak `flex: 1` düzenine geçildi. Bu sayede listeler responsive olarak ekranın alt sınırına, devam et / geri butonlarının çok az üstüne kadar uzanarak ekran alanını tam verimlilikle kullanır.
  6. **Devlet Seçimine Dön Butonu Entegrasyonu**: İlçe listesinin en üstüne "◀ Farklı Bir Devlet Seç" butonu yerleştirilerek kullanıcının seçtiği devleti sıfırlayıp bir önceki devlet listesine dönmesi sağlandı.
  7. **Geri/İleri Git-Gel Kayıt Güvenliği**: Karakter kurulum adımları arasında geri-ileri yapılıp veriler değiştirilse dahi, `handleNext` metodunun ilgili adımı backend taslağına (`update-character-draft`) kaydetmesi ve en son `handleFinish` (`setup-character`) aşamasında tüm güncel form verilerini veri tabanına yazması garantilendi.
- **Tarih**: 20.05.2026
 
### [UPD-064] Karakter Oluşturma Step 3 İzometrik Karakter Seçimi ve Önizleme Entegrasyonu
- **Açıklama**:
  1. **İzometrik Karakter Seçimi (Step 3)**: Karakter Özgeçmiş Hikayesi adımı askıya alınarak yerine 4 kadın, 4 erkek (seçilen cinsiyete göre dinamik filtrelenen) yüksek kaliteli vektörel SVG izometrik karakterin seçilebileceği arayüz entegre edildi.
  2. **Model State ve Uyum Kontrolü**: Kullanıcının seçtiği cinsiyete bağlı olarak izometrik karakter listesi dinamik olarak filtrelenmekte ve cinsiyet değiştiğinde otomatik olarak geçerli cinsiyetin varsayılan ilk karakterine atanmaktadır.
  3. **Backend ve Taslak Entegrasyonu**: Step 3 devam etme eyleminde backend `update-character-draft` API'sine `isometricModelId` gönderimi sağlandı. Setup-character aşamasında `backstoryId` askıya alındığı için varsayılan olarak `'story_veteran'` gönderilip seçilen izometrik model veritabanına kaydedildi.
  4. **Önizleme ve Kurulum Özeti (Step 4)**: Kurulum özeti ekranında seçilen izometrik görünümün adı listelenip kartın alt kısmında seçilen modelin SVG'si altın sarısı neon çerçeveli bir önizleme kutusunda sergilenmektedir.
- **Tarih**: 20.05.2026

### [UPD-065] Karakter Oluşturma Ekranı Hata Bildirimleri İçin Premium Neon Kırmızı Modal Tasarımı
- **Açıklama**:
  1. **Neon Kırmızı Hata Modalı**: Hataların veya eksik doldurulan alan uyarısının düz metin yerine, siberpunk/askeri temayla uyumlu `rgba(15, 23, 42, 0.96)` slate arka planlı, neon kırmızı kenarlıklı (`#ef4444`) ve gölgeli özel bir React Native `<Modal>` bileşeni içerisinde gösterilmesi sağlandı.
  2. **Yumuşak Geçiş Animasyonu**: Hata modalı açılırken yumuşak bir fade animasyonu ile ekranı kaplayan yarı saydam koyu bir overlay tabakasının (`rgba(2, 6, 23, 0.85)`) üzerinde belirmesi sağlandı.
  3. **Kapatma Butonu ve Durum Yönetimi**: Kullanıcı modal altındaki 'TAMAM' butonuna dokunduğunda hata durumu (`setError(null)`) sıfırlanarak modalın akıcı şekilde kapanması sağlandı.
- **Tarih**: 20.05.2026

### [UPD-066] Şehir Ekranı Çökme Hatalarının Çözümü ve SWR (Bellek + AsyncStorage) Harita Önbellek Sistemi
- **Açıklama**:
  1. **React Native SVG Çökme Sorununun Giderilmesi**: `CityScreen.tsx` dosyasının altında tanımlı olan ve platform seviyesinde yerel görünüm hiyerarşisi uyumsuzluğuna (ClassCastException vb.) yol açan özel JavaScript `<Line>` fonksiyonu kaldırıldı. Yerine `react-native-svg` kütüphanesinin orijinal yerel `<Line>` bileşeni import edilip entegre edilerek şehir ekranının açılışta çökmesi kesin olarak engellendi.
  2. **Güvenli Arayüz Kenar Boşluğu (SafeAreaInsets) Yapılandırması**: `useSafeAreaInsets` kancasından (hook) dönen değerlerin ekran ilk yüklendiğinde `null` veya `undefined` olabilme ihtimaline karşı `safeInsets` nesnesi oluşturuldu ve `createStyles` fonksiyonuna varsayılan fallback değerleri (`insets?.top ?? 0`, `insets?.bottom ?? 0`) eklenerek stil kaynaklı olası çökme riskleri ortadan kaldırıldı.
  3. **Güvenli Navigasyon Yapılandırması**: `navigation.setOptions` çağrısı, bileşenin navigasyon bağlamı olmadan render edilmesi senaryolarına karşı `navigation` ve `selectedDistrict` kontrolleri ile sarmalandı.
  4. **900+ Şehir İçin Instant SWR (Stale-While-Revalidate) Önbellek Stratejisi**:
     - **In-Memory Cache (`MAP_CACHE`)**: Yüklenen harita verileri bellek üzerinde geçici olarak tutularak, aynı oturumda ilçeler arası geçişte haritaların bekleme olmadan anında (0ms) render edilmesi sağlandı.
     - **Persistent Storage Cache (`AsyncStorage`)**: Harita hücre verileri cihaz yerel depolama birimine (`politic_map_cache_{id}`) kaydedilerek, uygulama kapatılıp açılsa dahi ilk karede anlık yükleme yapılması sağlandı.
     - **Background Revalidation (Arka Plan Güncelleme)**: Önbellekten veri yüklendikten hemen sonra sessizce sunucuya API isteği gönderilerek haritanın en güncel versiyonu çekildi. Eğer bir güncelleme varsa hem hafıza/disk önbellekleri güncellendi hem de ekrandaki hücreler yenilendi. Böylece kullanıcı hiçbir yükleme animasyonu (loading spinner) görmeden her zaman güncel haritaya en hızlı şekilde erişmiş oldu.
- **Tarih**: 20.05.2026

### [UPD-067] MapManager Admin Paneli MVC Ayrışımı (2160 Satır → Modüler Mimari)
- **Açıklama**: `web-admin` uygulamasındaki monolitik `MapManager.tsx` dosyası (81KB, 2160 satır), `ModelManager` ile aynı MVC mimarisi kullanılarak tam anlamıyla modüler bir yapıya kavuşturuldu.
  1. **`MapManager.constants.ts`**: Tüm type tanımları (`GridCell`, `CustomMapData`, `DistrictListItem`, `ModelAsset`, `BuildingInfo`, `PickedUpItem` vb.), `BUILDINGS` statik verisi ve `getBuildingParams` saf fonksiyon buraya taşındı.
  2. **`MapManager.styles.ts`**: `styles` nesnesi `mapManagerStyles` adıyla export edildi; kapsama sahip tüm stil tanımları (container, editor, modal, tablo, harita kartı vb.) buraya merkezi olarak çıkarıldı.
  3. **`MapManager.hooks.ts` (`useMapManager`)**: Tüm state yönetimi, API çağrıları (`fetchDistricts`, `fetchCustomMaps`, `fetchModelsAndCategories`), editör iş mantığı (`handleCellClick`, `checkFootprintFit`, `removeCellContent`, `getBuildingParamsLocal`, `getBuildingPivotToRenderAt`) ve izometrik hesaplama yardımcıları `useCallback`/`useMemo` ile optimize edilmiş custom hook'a taşındı.
  4. **`components/TabPanels.tsx`**: `CitiesTab` (arama+tablo+sayfalama) ve `MapsTab` (grid kart görünümü) sub-component'lere ayrıldı.
  5. **`components/Modals.tsx`**: Harita oluşturma (`CreateMapModal`) ve ilçeye harita atama (`AssignMapModal`) modalları ayrı bileşenlere çıkarıldı.
  6. **`components/TilePalette.tsx`**: Editör sol paneli — araç seçici (Ekle/Taşı/Kaldır), kategori filtreleri (Altyapı & Doğa + DB kategorileri), statik/özel model listeleri ve 3D model viewer preview ayrı bileşen oldu.
  7. **`components/MapEditorCanvas.tsx`**: İzometrik SVG harita tuvali — 3D prism render, forest ağaç render, hover highlight, placement preview ve tüm cell mantığı tek React bileşenine toplandı.
  8. **`index.tsx`**: Yalnızca orkestrасyon — hook'tan gelen değerleri sub-component'lere dağıtan, render moduna (edit/list) göre şube yapan saf view katmanı.
- **Teknik**: TypeScript `--noEmit` kontrolü sıfır hata geçti. Vite 420ms'de hazır. Eski `MapManager.tsx` silindi.
- **Tarih**: 21.05.2026

### [UPD-068] Core-API Sunucu Baglanma ve Kritik Hata Duzeltmeleri
- **Aciklama**: Web admin panelinde hicbir verinin yuklenmemesine yol acan kok nedenler tespit edilip giderildi.
  1. **API Sunucu Baslatma**: core-api (	s-node-dev) PostgreSQL ve Redis (Docker containerlar) ayakta olmasina ragmen baslatilmamisti. Sunucu baslatildi; tum endpoint'ler gercek veri dondurmege basladi.
  2. **AdminRoutes Duplikasyon Temizligi**: dminRoutes.ts dosyasina tum route bloklari iki kez yazilmisti. Tek, temiz versiyon olarak yeniden olusturuldu.
  3. **Model Guncelleme Middleware Hatasi**: modelUploadMiddleware her PUT isteginde modelFile zorunlu kabul ediyordu. modelUpdateMiddleware eklendi - modifiedFile opsiyonel.
  4. **MapManager Ilce Yukleme Sorunu**: useEffect dependency array'inde etchDistricts ve etchCustomMaps eksikti. Duzeltildi.
- **Tarih**: 21.05.2026

### [UPD-069] ModelManager Admin Sayfasi Yeniden Tasarim
- **Aciklama**: /websc-admin/models sayfasi kapsamli sekilde yeniden tasarlandi.
  1. **Kategori Tab Bar**: Kategoriler ust kisimda tab sekmeleri olarak gosteriyor.
  2. **Model Listesi (Alt Alan)**: Paginated 10 model/sayfa, arama kutusu, toplam sayim.
  3. **Model Ekle Butonu Modal**: Upload formu modal icinde, header'da yan yana Kategori Ekle ve Model Ekle butonlari.
  4. **Profesyonel Sayfalama**: Sliding window, ilk/son atlama, aktif glow animasyonu.
  5. **Clean Code MVC**: Hooks tamamen yeniden yazildi, dogruIssuedependency array'ler.
- **Tarih**: 21.05.2026

### [UPD-070] Harita Editörü İnteraktif Bina Seçimi, Çoklu Materyal Doku Desteği, Döndürme ve Gelişmiş Seçim Eylemleri
- **Açıklama**:
  1. **Çoklu Materyal Doku Entegrasyonu**: GLB modellerinin tek beyaz veya renksiz gözükmesini önlemek amacıyla, tüm `model-viewer` kullanan bileşenlerde (`PreviewModal.tsx`, `AssetCard.tsx`, `MapEditorCanvas.tsx` ve `TilePalette.tsx`) modelin tüm materyal katmanları asenkron olarak taranarak dokular (texture) eksiksiz uygulandı.
  2. **İnteraktif Seçim Aracı (`Select Tool`)**: Harita editörüne yeni bir "Seç" (select) aracı eklendi. Kullanıcılar harita üzerindeki herhangi bir nesneye tıkladığında o nesnenin kapladığı tüm izometrik koordinatlar (bina ayak izi) otomatik algılanıp mavi neon renkle parlayarak vurgulanır.
  3. **Bina Döndürme (`Rotate`)**: Seçilen bir bina klavyeden "R" tuşuna basılarak veya sidebar'daki "Döndür" butonuna tıklanarak 0°, 90°, 180° ve 270° açılarla kendi pivot noktası etrafında döndürülebilir.
  4. **Seçim Detayları ve Aksiyon Paneli**: Sidebar'da seçilen hücrenin tipi, koordinatları, adı, boyutu, yönü ve dokulu 3D modeli listelenir. Ayrıca seçili nesneyi hareket ettiren ("Taşı") veya silen ("Kaldır") işlevler entegre edildi.
- **Tarih**: 21.05.2026

### [UPD-071] Harita Editörü Çakışma Hologramı, Toplu Sürükleyerek Çizim, Sınır Koruması ve Katman Filtreleri
- **Açıklama**:
  1. **Çakışma Kontrolü & Kırmızı Hologram (Collision Matrix Tinting)**: Ekleme modunda farenin ucundaki hayalet önizleme (Ghost Preview), çakışma durumunda (`hoveredFootprintFits === false`) kırmızı boyanacak şekilde güncellendi. GLB modellerinin üstüne yarı saydam, parlayan kırmızı 3D SVG prizması giydirilerek görsel çakışma bildirimi zenginleştirildi; altyapı yollarının taban poligonları ise dolgusu kırmızı olacak şekilde kırmızı alarm moduna geçirildi. Çakışma durumunda tıklayarak yerleştirme engellendi.
  2. **Toplu Sürükleyerek Çizim (Marquee / Drag-to-Draw)**: Fare sol tuşuna basılı tutularak izometrik harita üzerinde sürükleme yapıldığında (fırça tarzı) yollar ve ağaçlar kesintisiz çizilebiliyor. Sürükleme esnasında çakışma denetimi (`checkFootprintFit`) aktif olarak çalıştırılarak, mevcut binaların üstünün ezilmesi önlendi ve hata tostu popupları susturuldu. Global `mouseup` dinleyicisi eklenerek çizimin kararlı şekilde sonlanması sağlandı.
  3. **Sınır Koruyucu & SVG Boşluk Tıklaması (Bounding Box)**: SVG dışı siyah boşluklara tıklandığında seçili olan hücrenin seçimi kaldırılıyor. Harita hücrelerine tıklama olaylarında `e.stopPropagation()` kullanılarak olay yayılımı engellendi ve seçimin kendi kendine iptal olması önlendi.
  4. **Seçim & Etkileşim Katman Filtresi (Layer Filter)**: Sol menüye Tümü, Bina, Yol ve Doğa seçeneklerinden oluşan neon mavi vurgulu bir buton grubu entegre edildi. Filtre seçildiğinde kullanıcı sadece seçili katmana ait nesneleri seçebilir, taşıyabilir veya kaldırabilir. Diğer katman nesneleriyle etkileşime girilemez.
  5. **Dinamik Neon Hover Vurgulayıcı (Tile Highlighter)**: Fareyle harita üzerinde gezerken, seçili araca göre renk değiştiren (Seç için neon mor, Sil için neon kırmızı, Taşı için neon turuncu, varsayılan için neon mavi) ve hover edilen nesnenin tam ayak izini (footprint) kaplayan neon SVG elmas vurgulayıcısı eklendi. Bu vurgulayıcı aktif katman filtresiyle tam senkronize çalışmaktadır.
- **Tarih**: 21.05.2026

### [UPD-072] İzometrik Katman Taşma (Z-Order) Çözümü, Güvenilir Doku Yükleme ve Mobil Görsel Temizleme
- **Açıklama**:
  1. **İki Aşamalı Çizim Modeli (Two-Pass Rendering)**: Haritadaki düz zemin kaplamalarının (çim, yollar, orman zeminleri ve bina taban alanları) 3D bina modellerinin/ağaçların üstüne taşmasını (overlap) engellemek amacıyla render mantığı iki bağımsız aşamaya bölündü:
     - **Birinci Aşama (Zemin Katmanı)**: Tüm flat/zemin poligonları öncelikli olarak çizilir. Clicks, drags ve hover gibi tüm fare etkileşimleri bu katmanda toplanır.
     - **İkinci Aşama (3D Yapı Katmanı)**: Ağaçlar ve 3D GLB bina modelleri/prizmalar zemin katmanının tamamen üstüne çizilir. Bu katmana `pointer-events: none` uygulanarak tıklamaların doğrudan zemin katmanına geçmesi sağlanır.
     - Bu sistem hem `MapEditorCanvas.tsx` (web-admin) hem de `CityScreen.tsx` (mobile-game) üzerinde uygulanarak derinlik sıralaması (painter's algorithm Z-order) kusursuz hale getirildi.
  2. **Güvenilir Doku Yükleme (Robust 3D Texture Loading)**: `model-viewer` tabanlı 3D önizleme bileşenlerinin (`MapEditorCanvas.tsx`'te `MapGLBViewer`, `TilePalette.tsx`'te `PaletteGLBViewer` ve `AssetCard.tsx`'te `ModelViewerWrapper`) re-render veya önbellek (cache) sebebiyle gri/texturesiz yüklenmesi hatası kalıcı olarak giderildi. Bileşenlerin `useEffect` bloğu ilk çalıştığında modelin zaten yüklenmiş (`viewer.loaded` veya `viewer.model` materyalleri mevcut) olup olmadığı kontrol edilerek texture anında uygulandı. Yükleme aşamasındakiler için ise `'load'` olayı güvenli dinleyici olarak korunmaya devam edildi.
  3. **Mobil Şehir Ekranı Görsel Temizliği (Mock Buildings Cleanup)**: Mobil şehir görünümünde (`CityScreen.tsx`) veritabanında tanımlanmamış olan statik/sahte başlangıç binaları (Belediye Sarayı, Finans Merkezi vb.) ve bunlara bağlı prosedürel harita yerleşimleri tamamen temizlendi. Şehir ekranının yalnızca veritabanından dinamik olarak çekilen modelleri (`modelAssets`) ve bunlara ait parametreleri listelemesi sağlandı.
- **Tarih**: 21.05.2026

### [UPD-073] Harita Editörü İzometrik Tile Taşması, Saydam Gölge Entegrasyonu, Akıcı Önizleme ve Kayan Pill Menü
- **Açıklama**:
  1. **İzometrik Tile Taşması Düzeltmesi (Tile Gap Overflow)**: SVG zemin poligonlarındaki (çim, yollar, orman zeminleri ve bina taban alanları) antialiasing kökenli subpixel boşluklar ve ince çizgiler, kenarlık kalınlığı `strokeWidth={1.2}` yapılarak ve `strokeLinejoin="miter"` birleştirme yöntemi entegre edilerek tamamen kapatıldı. Komşu karoların kusursuz bir şekilde birleşmesi sağlandı.
  2. **Saydam Gölge Entegrasyonu (Dynamic Texture Preprocessing)**: GLB bina modellerinin sağ alt köşesinde oluşan uyumsuz, katı siyah gölgenin giderilmesi için Canvas tabanlı doku işleyici (`processTextureImage`) geliştirildi. Model dokusu sunucudan çekildiğinde dinamik olarak bir canvas üzerine çizilerek gölgeyi temsil eden saf siyah pikseller (RGB < 15) yumuşak ve saydam bir gölge rengine (Alpha = 90) dönüştürülür. Model-viewer bileşeninde `alphaMode="BLEND"` modu aktif edilerek gölgenin zemindeki yolların ve çimlerin üzerinde gerçekçi bir şekilde süzülmesi sağlandı.
  3. **model-viewer Doku Bozulması ve Anlık Rotasyon Çözümü**: Binanın döndürülmesi (Rotate) sırasında oluşan dokunun beyazlaşması ve model-viewer'ın kendini sıfırlaması hatası giderildi. `<model-viewer>` bileşenine `key={src}` atanarak React'in her rotasyon açısı değişiminde tüm bileşeni yeniden oluşturup (remount) sıfırlaması önlendi. Değişen rotasyon açısı `orientation` özelliği üzerinden anlık yansıtılırken, Three.js'in dokuyu temizlemesini engellemek için 100ms aralıklarla çalışan kararlı bir denetim-uygulama döngüsü (`checkAndApply`) entegre edildi.
  4. **Akıcı Saydam Önizleme (Stable Ghost Preview Keys)**: Taşıma ve Ekleme araçlarıyla haritada gezinirken (Ghost Preview) modelin yanıp sönmesi (flicker) ve her karo geçişinde ağdan yeniden yüklenmesi sorunu giderildi. Önizleme bileşenlerinin `<foreignObject>` ve `<MapGLBViewer>` kapsayıcılarına kararlı React anahtarları (`key="ghost-preview-fo-place"`, `key="ghost-preview-fo-move"`) tanımlanarak DOM yapısının korunması ve önizlemenin fareyi akıcı, saydam şekilde takip etmesi sağlandı.
  5. **Kayan Glassmorphic Pill Menü (Premium Action Menu)**: Seçim modunda binanın sağ tarafında beliren eylem menüsü modern, minimalist ve fütüristik bir tasarıma kavuşturuldu. Menü, `backdropFilter: 'blur(16px)'`, koyu saydam slate rengi ve ince beyaz kenarlıklı bir "glassmorphic pill" (cam hap) olarak güncellendi. "Taşı" ve "Döndür" butonları hover durumlarında (`onMouseEnter`/`onMouseLeave`) parıldama, büyüme (scale) ve ikon rotasyonu gibi mikro-animasyonlarla zenginleştirildi. Menünün binayla birlikte dönüp doğru konumlanması için rotasyon açısı React anahtarına dahil edildi.
- **Tarih**: 21.05.2026

### [UPD-074] Harita Editörü Zemin Hizalama (Dikey Kayma) ve Katmanlama Hatası Düzeltmeleri
- **Açıklama**:
  1. **Matematiksel Dikey Kayma Telafisi (`offsetY`)**: 3D GLB modellerin `model-viewer`'ın otomatik sığdırma (framing) davranışı nedeniyle zemine batması ve mor seçim kutusunun binanın ortasında kalması hatası çözüldü. `<foreignObject>` bileşeninin dikey konumu (`y`), model yüksekliğinin yarısı (`buildingPrismH / 2`) kadar yukarı ötelenerek model tabanının zemin diamond merkezine sıfıra sıfır oturması sağlandı.
  2. **Orjin Kilitlemesi (`camera-target`)**: `MapGLBViewer`'ın kararsız ve gecikmeli asenkron bounding box hesaplamaları kaldırılarak, kameranın odak noktası `"0m 0m 0m"` (orjin) değerine sabitlendi.
  3. **Katmanlama ve Z-Order Düzeltmesi (`isolation`/`transform`)**: SVG içindeki normal poligonlar (yollar) ile 3D model-viewer içeren HTML elemanlarının tarayıcı donanım ivmeli katmanlama (compositing) hatalarını engellemek için, tüm `<foreignObject>` elemanlarına CSS `transform: 'translateZ(0)'` ve `isolation: 'isolate'` kuralları eklenerek yol karolarının binayı maskelemesi kalıcı olarak önlendi.
- **Tarih**: 21.05.2026

### [UPD-075] Harita Editörü Sabit Kamera Uzaklığı (Radius), 3D Model Dinamik Ölçekleme (Scale) ve Taban Hizalaması
- **Açıklama**:
  1. **Sabit Kamera Uzaklığı Kilidi (`radius: 5m`)**: model-viewer'ın model boyutuna veya ölçeğine göre kamerayı otomatik yakınlaştırıp uzaklaştıran `radius: auto` (otomatik sığdırma) mekanizması devre dışı bırakıldı. Kamera mesafesi `5m` olarak sabitlendi. Böylece 3D sahne boyutları ile 2D SVG izometrik ızgarası (Grid) arasındaki ölçek ilişkisi sabitlendi.
  2. **Dinamik Ölçekleme (`scale` parametresi)**: Veritabanında (Model Yönetimi panelinde) tanımlanmış olan ve daha önce haritada göz ardı edilen `scale` alanı sisteme bağlandı. ModelAsset tablosundaki `scale` değeri prop zinciriyle `MapGLBViewer` bileşenine aktarılarak `<model-viewer>`'ın `scale` özelliğine (`scale="X Y Z"`) dinamik olarak yansıtıldı. Artık model scale değişiklikleri haritada anında görselleşmektedir.
  3. **Merkezlenmiş Taban Hizalaması (`offsetY: 0`)**: `camera-target="0m 0m 0m"` ve sabit `5m` kamera yarıçapı kullanıldığında, modelin taban merkezi doğrudan `<model-viewer>` tuvalinin tam ortasına hizalanır. Bu sebeple, önceki adımda eklenen yapay dikey kaydırma telafisi (`offsetY = buildingPrismH / 2`) sıfırlanarak (`offsetY = 0`) modelin taban merkezinin ızgaradaki diamond footprint alanının merkezine sıfıra sıfır, dikey ve yatayda kusursuz oturması sağlandı.
- **Tarih**: 21.05.2026

### [UPD-076] İzometrik Kesilme (Z-Order), Taşıma/Yerleştirme ve Rotasyon Doku Kaybı Hatalarının Çözümü
- **Açıklama**:
  1. **İzometrik Kesilme ve Katmanlama Çözümü (Stacking Context Cleanup)**: SVG içindeki normal zemin karolarının (yol/çim) 3D GLB modelleri diagonal olarak kesmesini engellemek için, tüm 4 `<foreignObject>` etiketinden tarayıcıyı donanım ivmeli ayrı katmanlamaya zorlayan `transform: 'translateZ(0)'` ve `isolation: 'isolate'` CSS özellikleri kaldırıldı. Böylece modeller standart SVG çizim sırasına (paint order) sadık kalınarak zemin karolarının tamamen üstünde hatasız şekilde render edilir.
  2. **Taşıma/Sürükleme ve Tıklama Engelinin Çözümü (`pointer-events: none`)**: Taşıma aracıyla model taşınırken hayalet önizleme (Ghost Preview) modelinin kaybolması/flicker yapması ve boş alanlara tıklanamaması sorunu giderildi. `<model-viewer>` bileşenine ait shadow DOM'un tıklama olaylarını yutmasını engellemek için `MapGLBViewer` içindeki `<model-viewer>`'a `pointerEvents: 'none'` stili uygulandı. Bu sayede tüm tıklama ve hover olayları sorunsuz şekilde zemin koordinat karolarına iletilir.
  3. **Rotasyon Esnasında Doku Kaybı Çözümü (Robust Rotation Texture Polling)**: model-viewer orientation parametresi değiştiğinde scene-graph'ın asenkron olarak yeniden derlenip dokuları sıfırlaması hatası giderildi. Texture polling döngüsü güncellenerek; her rotasyon açısı, model kaynağı veya doku adresi değiştiğinde ilk başarılı uygulamada durmak yerine 1 saniye boyunca 100ms aralıklarla (10 kez) ve ilk yüklemede 15 kez dokunun kesintisiz olarak zorla uygulanması sağlandı.
- **Tarih**: 21.05.2026

### [UPD-078] Bina Hizalama, Eksen Takası, Döndürme Doku Sabitleme ve Taşıma Sonrası Otomatik Seçim
- **Açıklama**:
  1. **Kamera Açı Düzeltmesi**: `ISO_CAMERA_ORBIT` değeri `'225deg 55deg 15m'` yerine tam 2:1 izometrik izdüşüme karşılık gelen `'225deg 60deg 15m'` olarak güncellendi. Böylece modellerin kenarları zemin diamond çizgilerine tam paralel hale getirildi.
  2. **Eksen Takası Hizalaması**: `MapGLBViewer` bileşeninde `rotationAngle = 0` iken modelin X boyutunun `row` (`sizeY`), Z boyutunun `col` (`sizeX`) ile eşleşmesi sağlandı. 90/270 derece döndürüldüğünde en-boy takası tersine çevrilerek binaların haritada mor footprint sınırlarına tam oturması sağlandı.
  3. **Rotasyon Doku Sabitleme**: model-viewer bileşeninde döndürme sonrasında dokuların beyaz kalması/kaybolması sorunu, texture polling `useEffect` bağımlılıklarına `rotationAngle` eklenerek çözüldü.
  4. **Taşıma Sonrası Otomatik Seçim**: Taşıma aracı (Move Tool) ile bir bina yerleştirildikten sonra harita editörünün otomatik olarak Seçim moduna dönmesi ve yerleştirilen binayı seçili hale getirerek Onayla/Döndür/Taşı menüsünü anında göstermesi sağlandı.
- **Tarih**: 21.05.2026

### [UPD-079] Bina Model Boyutlarının (Scale) Doğru Hesaplanması ve Arayüz Bilgilerinin Temizlenmesi
- **Açıklama**:
  1. **Hazır Yüklenmiş Modeller için Boyut Algılama**: `MapGLBViewer` bileşeni yüklenirken veya yeniden render edilirken, tarayıcı önbelleğinde zaten yüklü olan modeller için `load` olayının tetiklenmeme problemi, bileşen ilk yüklendiğinde `viewer.loaded` kontrolü eklenerek çözüldü. Bu sayede model boyutları (`modelDims`) her zaman doğru okunur ve `autoScale` değerinin `1` (varsayılan devasa boyut) kalması engellenir.
  2. **İzometrik Projeksiyon Ölçek Çarpanı (`Math.sqrt(2)`)**: 3D sahnede 45 derece döndürülmüş kamerayla izometrik grid diyagonallerinin izdüşümüne tam olarak uyması için, grid birim uzunluğu hesaplamasına `Math.sqrt(2)` düzeltme faktörü entegre edildi. Modeller 2D diamond zemin karolarına taşma olmadan tam oturacak şekilde ölçeklendirildi.
  3. **Yön ve Döndürme Kılavuz Metinlerinin Kaldırılması**: Döndürme özelliği modele tıklandığında çıkan modern cam eylem menüsüne taşındığından, harita editörünün üst kısmındaki "Yön: 0°" ve "[R] Döndür" şeklindeki eski statik/gereksiz metin panelleri arayüzden temizlendi.
- **Tarih**: 21.05.2026

### [UPD-080] Model Boyutlandırma (Scale) Bug Çözümleri, Kamera Limitleme ve Taşıma Aracı Bug Düzeltmesi
- **Açıklama**:
  1. **Kesintisiz Boyut Algılama (Polling `modelDims`)**: `<model-viewer>`'ın asenkron yüklenme mekanizması ve önbellek davranışı yüzünden `load` olayının tetiklenmediği durumlarda `modelDims` verisinin null kalarak `autoScale = 1` şeklinde modeli devasa boyutta render etmesi engellendi. `MapGLBViewer` bileşenine `viewer.getDimensions()` değerini 20 kez (2 saniye boyunca) tarayan polling mantığı eklenerek boyutsal verilerin kesinlikle alınması sağlandı ve modelin grid alanını kaplaması garanti altına alındı.
  2. **Kamera Mesafesi Limitleme (`min/max-camera-orbit`)**: `<model-viewer>`'ın büyük/boyutsuz modelleri render ederken kamerayı otomatik olarak 400x400 konteynere sığdırmak için `15m` sınırından çok daha uzaklara (`50m` gibi) iterek ekranda 6x6 gibi devasa yer kaplamasına neden olan davranışı durduruldu. `min-camera-orbit="auto auto 15m"` ve `max-camera-orbit="auto auto 15m"` ayarlarıyla kameranın 15m'de kilitli kalması sağlandı. Boyut hesaplanamazsa bile fallback `autoScale` 0.1 yapılarak modelin ekrandan taşması önlendi.
  3. **Taşıma Aracı (Move Tool) İzometrik Çakışma Bug Düzeltmesi**: Haritada bina taşıma aracıyla modelin kendi ayak izi üzerinde gezinirken ya da boş alanlara (`grass`) yerleştirilmeye çalışıldığında kaybolması / taşınamaması hatası düzeltildi. Geçici önizleme hücrelerinin (tempCells) tipi yanlışlıkla `'empty'` yapıldığı için `checkFootprintFit` denetiminin başarısız olduğu anlaşıldı ve `'grass'` olarak güncellenerek taşıma işleminin kusursuz onaylanması sağlandı.
- **Tarih**: 21.05.2026
### [UPD-081] Bina Döndürme (Rotation) İşleminde Boyut Sıçraması (Scale Fluctuation) Çözümü
- **Açıklama**:
  1. **Rotasyon-Bağımsız (Rotation-Invariant) Bounding Box Algoritması**: Binaları 90 veya 270 derece döndürürken boyutlarının aniden küçülüp büyümesi (sıçraması) hatası matematiksel olarak çözüldü. Sorunun kaynağı, `<model-viewer>` bileşeninin döndürme sonrası `getDimensions()` fonksiyonundan "World" (dünya) koordinatlarında döndürülmüş bounding box değerlerini döndürmesiydi. Bu değerleri tekrar manuel olarak takas (swap) etmek boyut formülünü bozuyordu.
  2. **Maksimum/Minimum Eşleştirme Sistemi**: Manuel eksen takası tamamen kaldırılarak yerine "Maksimum/Minimum" eşleştirme algoritması geliştirildi. Modelin fiziksel boyutlarının (X ve Z) en büyüğü, yerleştirileceği ızgara (footprint) alanının en büyük kenarına; en küçüğü ise en küçük kenarına oranlanarak (`scaleMax` ve `scaleMin`) otomatik boyutlandırılması sağlandı. Bu sayede model hangi açıya döndürülürse döndürülsün, kapladığı tile alanına her zaman kusursuz ve sabit bir ölçekle (dalgalanma olmadan) oturur.
- **Tarih**: 21.05.2026
### [UPD-082] 3D Model Yön Uyumsuzluğu, Taşkınlık (Overflow) ve Merkezleme Bug'ının Çözümü
- **Açıklama**:
  1. **Kusursuz Yön Eşleştirme (Strict World AABB Mapping)**: Bir önceki güncellemede eklenen rotasyondan bağımsız ölçeklendirme algoritması, eğer modelin kendi içerisindeki X ve Z yönü, kullanıcının ayarladığı grid yönüyle zıt ise (çapraz hizalanmışsa) modelin grid sınırlarından taşmasına (overflow) neden oluyordu. Bu da modelin "büyük" gözükmesine yol açıyordu. `<model-viewer>`'ın döndürme sonrasında her zaman anlık "Dünya (World) Bounding Box" boyutlarını verdiği kesinleşti. Bu sayede manuel eksen takası veya maksimum/minimum zorlaması tamamen kaldırılarak, boyutlar doğrudan eşleştirildi: Grid 3D Z ekseni (sizeX) ile Model Z ekseni, Grid 3D X ekseni (sizeY) ile Model X ekseni eşleştirilerek modelin hangi açıda olursa olsun ayak izinden taşması kalıcı olarak engellendi.
  2. **Modelin Ayak İzine Merkezlenmesi (Footprint Center Math Fix)**: Binaların diamond ızgarada her zaman sağ alt uca (bottom tip) yapışık durmasına neden olan matematiksel hata düzeltildi. İzometrik alanın merkez noktası bulunurken `tileWidth / 2` yerine `tileWidth / 4` kullanılması gerekiyordu (vektörün yarısı hesabı). Bu düzeltmeyle 400x400'lük konteyner tam olarak ayak izinin ortasına hizalandı ve binalar mükemmel bir simetriyle ızgaranın ortasına oturdu.
- **Tarih**: 21.05.2026
### [UPD-083] Döndürme (Rotation) İşleminde Gri Ekran (WebGL Crash) ve Modül Küçülmesi Çözümü
- **Açıklama**:
  1. **Memory Leak ve WebGL Crash Çözümü (Gri Ekran Hatası)**: Binalar döndürüldüğünde ortaya çıkan "gri ekran" hatasının kök nedeni tespit edildi. Döndürme işlemi sırasında boyutları yeniden hesaplayan 100ms'lik döngü (polling), her çalıştığında `viewer.createTexture()` fonksiyonunu asenkron olarak tekrar tekrar çağırıyordu. Bu durum saniyeler içinde onlarca yeni doku nesnesi oluşturarak WebGL belleğini taşırıp (Memory Leak) tarayıcının 3D motorunu çökertiyordu (Context Lost - Gri Ekran). Döngü mantığı düzeltilerek, doku uygulandıktan sonra (`textureApplied = true`) texture oluşturma işleminin tamamen durdurulması ve boyutlar alındığında döngünün anında sonlandırılması (`clearInterval`) sağlandı.
  2. **Modül Küçülmesi (Fallback Boyut Hatası) Çözümü**: WebGL motoru çöktüğünde `getDimensions()` fonksiyonu başarısız oluyor ve `modelDims` verisi okunamadığı için sistem acil durum (fallback) ölçeği olan `0.1` değerini uyguluyordu. Bu da modellerin sahnede aniden "küçücük" olmasına yol açıyordu. Bellek sızıntısı ve çökme hatası giderildiği için boyut okuma işlemleri artık kesintisiz çalışmakta ve modelin eski görkemli boyutu 1.0 ölçeğinde korunmaktadır.
- **Tarih**: 21.05.2026

