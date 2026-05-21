import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Shield, 
  Coins, 
  MapPin, 
  Briefcase, 
  FileText, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface WikiArticle {
  id: string;
  category: 'election' | 'economy' | 'residency' | 'enterprise' | 'parliament';
  title: string;
  emoji: string;
  summary: string;
  content: React.ReactNode;
}

export function WikiView({ onClose }: { onClose?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState('election-rules');

  const articles: WikiArticle[] = [
    {
      id: 'election-rules',
      category: 'election',
      title: 'Cumhurbaşkanı Seçimleri & Adaylık',
      emoji: '👑',
      summary: 'Oy kullanma şartları, adaylık kıdem barajları, seçmen listesi denetimleri ve seçim güvenliği kuralları.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Şehir devletleri simülasyonunda cumhurbaşkanlığı seçimleri, demokratik meşruiyet ve eyalet bazlı makro yönetim gücünün temelidir. Seçimler tamamen **gerçek oyuncuların** katılımıyla gerçekleşir ve adil bir yarış olması için katı anayasal kurallara bağlanmıştır.
          </p>

          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.15rem' }} />
            <div>
              <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.25rem' }}>Seçim Turizmi ve İstismarı Engelleme Önlemi</strong>
              <span style={{ fontSize: '0.85rem', color: '#fca5a5', lineHeight: '1.5' }}>
                Seçim dönemlerinde başka eyaletlerden anlık seçmen ithal edilmesini önlemek amacıyla 10 gün ikametgah şartı ve aktiflik barajı getirilmiştir.
              </span>
            </div>
          </div>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem 0' }}>🗳️ Oy Kullanma Şartları (Vatandaşlar İçin)</h4>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>
              <strong>10 Gün İkametgah Zorunluluğu:</strong> Seçimin yapılacağı eyaletin sınırları içindeki herhangi bir ilçede oy kullanabilmek için en az <strong>10 gündür</strong> resmi ikametgah kaydınız bulunmalıdır.
            </li>
            <li>
              <strong>Aktiflik & Çevrimiçi Süre Eşiği:</strong> Oy verme butonuna basıldığı an, sistem son 7 gün içinde oyunda en az <strong>3 saat aktif çevrimiçi</strong> olduğunuzu doğrulamalıdır. Bu sayaç, sekme arka plandayken (`VisibilityState: hidden`) çalışmaz; aktif oy süresini esas alır.
            </li>
          </ul>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>🎗️ Cumhurbaşkanı Adaylık Şartları</h4>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Bir eyalette Cumhurbaşkanı adayı olabilmek için liyakat ve eyalete bağlılık kriterlerini karşılamanız gerekir:
          </p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>En az <strong>15 gündür</strong> o eyalette kesintisiz resmi ikametgah sahibi olmak.</li>
            <li>Karakter profilinizde en az <strong>1000 Siyasi Nüfuz (Political Influence)</strong> puanına sahip olmak.</li>
            <li>Eyalet sınırları içinde en az 1 adet faal şirket veya fabrikaya sahip olmak (ekonomik bağlılık kanıtı).</li>
          </ol>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>📋 Seçmen Listesi ve Sınır Karantinası</h4>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Her eyaletin seçmen kütüğü (Seçmen Listesi) meclis binasında tüm adayların ve vatandaşların denetimine açıktır. Adayların ikamet süreleri ve aktiflik durumları şeffafça izlenebilir. Ayrıca, seçim oylamasına son **24 saat kala** ikametgah taşıma başvuruları askıya alınarak eyalet sınırları dondurulur.
          </p>
        </div>
      )
    },
    {
      id: 'commodity-exchange',
      category: 'economy',
      title: 'Milli Emtia Borsası & Madenler',
      emoji: '🪙',
      summary: '9 stratejik kaynağın detayları, emtia borsasındaki canlı dalgalanma kuralları ve endüstriyel kullanım alanları.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Milli Emtia Borsası, eyaletler arası ticaretin ve sanayinin kalbidir. Oyunda yer alan 9 adet hammadde, şehir devletlerinin coğrafi konumlarına göre çıkarılır, borsa terminalinde 10 saniyede bir canlı dalgalanan fiyatlarla işlem görür.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <th style={{ padding: '0.5rem' }}>Emtia / Simge</th>
                <th style={{ padding: '0.5rem' }}>Köken Ülke</th>
                <th style={{ padding: '0.5rem' }}>Kategori</th>
                <th style={{ padding: '0.5rem' }}>Stratejik Kullanım Alanı</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '🪵 Kömür (COAL)', state: 'Zonguldak Cum.', cat: 'Enerji', desc: 'Ağır sanayi eritme fırınları yakıtı' },
                { name: '🪨 Demir (IRON)', state: 'Sivas Cum.', cat: 'Maden', desc: 'Çelik alaşımları ve gövde yapıları' },
                { name: '⛓️ Çelik (STEEL)', state: 'Karabük Cum.', cat: 'Ağır Sanayi', desc: 'Bina, araç ve savunma sanayii iskeletleri' },
                { name: '🔌 Bakır (COPR)', state: 'Kastamonu Cum.', cat: 'Metal', desc: 'Elektrik şebekeleri ve yarı iletken hatları' },
                { name: '🥈 Alüminyum (ALUM)', state: 'Konya Cum.', cat: 'Hafif Metal', desc: 'Havacılık gövdeleri ve İHA kanat kaplamaları' },
                { name: '🔋 Lityum (LITH)', state: 'Eskişehir Cum.', cat: 'Nadir Toprak', desc: 'Elektrikli araç batarya hücresi ana maddesi' },
                { name: '💎 Bor (BOR)', state: 'Balıkesir Cum.', cat: 'Stratejik', desc: 'Isıya dayanıklı zırh kaplama ve jet yakıtı' },
                { name: '🛢️ Petrol (PETR)', state: 'Batman Cum.', cat: 'Kimya', desc: 'Akaryakıt, yağlama ve plastik hammaddesi' },
                { name: '💾 Silikon (SLCN)', state: 'Ankara Cum.', cat: 'Yarı İletken', desc: 'Mikroçip, akıllı radar kartları, yazılım donanımı' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#e2e8f0' }}>{row.name}</td>
                  <td style={{ padding: '0.5rem' }}>{row.state}</td>
                  <td style={{ padding: '0.5rem' }}>{row.cat}</td>
                  <td style={{ padding: '0.5rem' }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem 0' }}>📈 Borsa Dalgalanma Mekanizmaları</h4>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>
              <strong>10 Saniyelik Ticker:</strong> Tüm hammadde fiyatları küresel arz-talep dengesine ve rastgele makroekonomik olaylara bağlı olarak %2.5 oranında aşağı/yukarı yönlü anlık dalgalanır.
            </li>
            <li>
              <strong>Bütçe ve Depo Kontrolü:</strong> Satın alımlar cüzdan nakit bakiyenizi azaltır. Hammaddeleriniz şahsi envanterinizde depolanır ve fabrikalarda hammadde olarak işlenmek üzere kullanılabilir.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'residency-travel',
      category: 'residency',
      title: 'İkametgah Sistemi & Çok Modlu Seyahat',
      emoji: '✈️',
      summary: 'Ulaşım araçları (Otobüs, Araç, Uçak), ikamet taşıma bürokrasisi ve Cumhurbaşkanı onay paneli.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Simülasyon haritası üzerinde seyahat etmek ve ikametgahınızı doğru eyalete taşımak, ticaretinizi ve siyasi haklarınızı doğrudan etkiler.
          </p>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem 0' }}>🚗 Seyahat Seçenekleri</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>🚌 Otobüs Seyahati</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>En ucuz ulaşım yöntemidir. KM başına 2 saniye sürer. Enerji tüketimi yüksektir.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>🚗 Özel Araç</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Galeri üzerinden bir araca (Şahin, Togg vb.) ve akaryakıta sahip olmayı gerektirir. KM başına 1 saniye sürer.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>✈️ Uçuş (Hızlı)</strong>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sadece havalimanı işareti (`✈️`) olan eyaletler arasında yapılabilir. KM başına 0.2 saniyedir (5 kat hızlı).</span>
            </div>
          </div>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>🏠 İkametgah Başvuru ve Taşınma Süreci</h4>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>
              <strong>Resmi Başvuru:</strong> İkametgahınızı değiştirmek istediğiniz eyalet ve ilçeyi seçerek başvuruda bulunursunuz.
            </li>
            <li>
              <strong>Cumhurbaşkanı Onayı:</strong> İlgili eyaletin Cumhurbaşkanı kendi yönetim panelindeki "İkametgah Başvuruları" kısmından başvurunuzu inceleyip onaylar ya da reddeder.
            </li>
            <li>
              <strong>15 Dakikalık Taşınma Süreci:</strong> Başvurunuz onaylandığı an **15 dakikalık (900 saniye) taşınma süreci** başlar. Bu esnada sol alttaki geri sayım kartı üzerinden durumunuzu izleyebilirsiniz. Taşınma bitene kadar şirketleriniz inaktif kalır.
            </li>
          </ol>
        </div>
      )
    },
    {
      id: 'enterprises-management',
      category: 'enterprise',
      title: 'Şirketler, Tematik Ofisler & Personel',
      emoji: '💼',
      summary: 'Enerji, Otomotiv ve Savunma fabrikalarının yönetimi, 2D izometrik ofisler ve yapay zeka personeller.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Şirket Yönetimi, pasif nakit akışı ve siyasi güç elde etmenin ana motorudur. Oyunda 3 farklı şirket türü bulunur ve her biri kendine özgü izometrik ofis tasarımıyla gelir.
          </p>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem 0' }}>🏢 Şirket Türleri & Temalar</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.05)', borderLeft: '3px solid #f97316' }}>
              <strong style={{ color: 'white', display: 'block' }}>⚡ Enerji & Maden (Kömür Ofisi)</strong>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Maun herringbone zeminler, bakır perçinli döküm masalar ve turuncu gün batımı manzaralı dumanı tüten fabrika pencereleri. Jargon: Kömür kazan basınçları, grid yük analizleri.</span>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.05)', borderLeft: '3px solid #a855f7' }}>
              <strong style={{ color: 'white', display: 'block' }}>🚗 Otomotiv & Teknoloji (Siber Ofis)</strong>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Karbon fiber neon ışıklı zeminler, biyometrik lazer tarayıcılı kasalar ve neon gökdelen manzaralı pencereler. Jargon: Elektrikli motor verimliliği, tork grafikleri, hydroponic bitkiler.</span>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.05)', borderLeft: '3px solid #22c55e' }}>
              <strong style={{ color: 'white', display: 'block' }}>🛡️ Savunma Sanayii Karargahı (Taktik Ofis)</strong>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Zeytin yeşili zırhlı askeri duvarlar, radar ızgarası zemin, üzerinde **dalgalanan holografik SİHA drone** bulunan taktik masalar ve havada uçan anti-gravitasyonel Bonsai bitkileri.</span>
            </div>
          </div>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>🤖 Yapay Zeka Personel Sohbet Konsolu</h4>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Ofislerin sağ panelinde yer alan lobi sohbet konsoluna mesaj yazdığınızda, ofisteki çalışanlar (Yazılımcı, Finansçı, Mühendis) veya lobiyi ziyaret eden diğer bürokratlar şirketinizin türüne göre sektörel jargonla akıllı ve canlı cevaplar verir.
          </p>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>🛠️ Ofis Tasarım Modu (Grid Editor)</h4>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Ofislerinizin iç mimarı sizsiniz. Sağ üstteki **🛠️ Tasarım Modu** butonunu açarak:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>Eşyaları seçip grid üzerinde boş bir yere **Taşıyabilir (Move)**,</li>
            <li>Seçilen eşyayı **90 Derece Döndürebilir (Rotate)**,</li>
            <li>Market sepetinden yeni eşyalar satın alıp ekleyebilir,</li>
            <li>Kullanılmayan eşyaları silip **%50 amortisman iadesini (Refund)** anında cüzdanınıza alabilirsiniz.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'parliament-legislative',
      category: 'parliament',
      title: 'TBMM Meclis Düzeni & Yasama Süreci',
      emoji: '🏛️',
      summary: '3D Hemicycle meclis koltuk haritası, yasa tasarısı teklif etme, oylama ve meclis arşivi.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Anayasa ve Meclis Oturumu sekmesi, şehir devletlerinin yasama organıdır. Burada partilerin sandalye güçleri ve milletvekilleri meclisin 3D oturma düzeninde yansıtılır.
          </p>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem 0' }}>🗳️ Yasa Tasarısı Sunma ve 24 Saatlik Canlı Oylama</h4>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <li>
              <strong>Kanun Teklifi Sunma:</strong> Milletvekilleri mor gradyanlı **📜 Kürsüye Kanun Teklifi Sun** butonunu kullanarak yasa başlığı, kategorisi ve gerekçesini girerek teklif sunarlar.
            </li>
            <li>
              <strong>Canlı Oylama:</strong> Sunulan teklifler doğrudan oylama havuzuna düşer ve 24 saatlik gerçek zamanlı geri sayım sayacı başlar. Tüm vatandaşlar bu süre zarfında "Kabul" veya "Ret" oyu kullanabilir.
            </li>
            <li>
              <strong>Otomatik Arşivleme:</strong> Süresi dolan tasarılar, sistem tarafından meclis vekillerinin simüle oyları da katılarak hesaplanır. Sonuç "Kabul Edildi" ya da "Reddedildi" olarak **Meclis Arşivine (Geçmiş Kararlar)** kaldırılır.
            </li>
          </ol>

          <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', margin: '1.25rem 0 0.5rem 0' }}>🏛️ Lüks 3D Kürsü & Oturma Düzeni</h4>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            TBMM salonunda partilerin meclisteki sandalye dağılımlarına göre yerleştirilmiş 300 interaktif 3D sandalye bulunur. Salonun merkezinde mermer sütun kaideli, altın yaldız detaylı, mikrofonlu ve dairesel platformlu lüks bir **3D Meclis Kürsüsü** yer alır.
          </p>
        </div>
      )
    }
  ];

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedArticle = articles.find(art => art.id === selectedArticleId) || articles[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'election': return <Shield size={16} style={{ color: '#fbbf24' }} />;
      case 'economy': return <Coins size={16} style={{ color: '#10b981' }} />;
      case 'residency': return <MapPin size={16} style={{ color: '#3b82f6' }} />;
      case 'enterprise': return <Briefcase size={16} style={{ color: '#ec4899' }} />;
      case 'parliament': return <FileText size={16} style={{ color: '#8b5cf6' }} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'election': return 'Seçimler';
      case 'economy': return 'Ekonomi & Borsa';
      case 'residency': return 'Göç & Seyahat';
      case 'enterprise': return 'Şirketler';
      case 'parliament': return 'Meclis';
      default: return 'Genel';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 800 }}>
            📚 Milli Ansiklopedi (Oyun Kılavuzu)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Şehir Devletleri Simülasyonu oyun mekanikleri, anayasa kuralları ve kaynak kılavuzu.
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            ← Karargaha Dön
          </button>
        )}
      </div>

      {/* Main split view container */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Left Side: Sidebar navigation tree */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Search bar */}
          <GlassCard style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)' }}>
            <Search size={16} style={{ color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Konularda ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </GlassCard>

          {/* List of articles */}
          <GlassCard style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, maxHeight: '550px', overflowY: 'auto' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', padding: '0.25rem 0.5rem', letterSpacing: '0.05em' }}>Kılavuz İçindekiler</span>
            {filteredArticles.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '2rem 0' }}>Aranan kelimeyle eşleşen makale bulunamadı.</div>
            ) : (
              filteredArticles.map((art) => {
                const isSelected = art.id === selectedArticleId;
                return (
                  <div 
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{art.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'white' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {art.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                        {getCategoryIcon(art.category)}
                        {getCategoryLabel(art.category)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </GlassCard>
        </div>

        {/* Right Side: Article Reader (GitBook style docs view) */}
        <div style={{ flex: '3 3 550px', display: 'flex' }}>
          <GlassCard style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, background: 'rgba(10,12,22,0.4)' }}>
            
            {/* Header info path */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <BookOpen size={12} />
              <span>Ansiklopedi</span>
              <span>/</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {getCategoryIcon(selectedArticle.category)}
                {getCategoryLabel(selectedArticle.category)}
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '1.6rem', color: 'white', fontWeight: 800, margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{selectedArticle.emoji}</span>
              {selectedArticle.title}
            </h2>

            {/* Summary Block */}
            <p style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(6, 182, 212, 0.4)' }}>
              {selectedArticle.summary}
            </p>

            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />

            {/* Content body */}
            <div style={{ fontSize: '0.95rem', color: '#e2e8f0', flex: 1 }}>
              {selectedArticle.content}
            </div>

            {/* Footer timestamp simulated */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '1.5rem' }}>
              <Clock size={12} />
              <span>Son Güncelleme: 20 Mayıs 2026, 13:44 • Veri tabanı sürümü: v1.4.2</span>
            </div>
            
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
