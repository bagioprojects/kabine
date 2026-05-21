import React from 'react';
import { X, Shield, Scroll, MessageSquare, Cookie, Scale } from 'lucide-react';

export type ComplianceDocType = 'terms' | 'privacy' | 'cookie' | 'kvkk' | 'support';

interface ComplianceModalProps {
  docType: ComplianceDocType;
  onClose: () => void;
  onSelectDoc: (type: ComplianceDocType) => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ docType, onClose, onSelectDoc }) => {
  const docs = {
    terms: {
      title: 'Kullanım Sözleşmesi ve Hizmet Koşulları',
      icon: <Scroll size={20} className="text-amber-500" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <p><strong>Son Güncelleme: 20 Mayıs 2026</strong></p>
          <p>
            KABİNE (bundan böyle "Simülasyon" veya "Oyun" olarak anılacaktır) platformuna hoş geldiniz. 
            Bu web sitesine veya mobil uygulamaya erişerek ya da kayıt olarak, aşağıdaki hizmet koşullarını, 
            kuralları ve yasal bildirimleri kayıtsız şartsız kabul etmiş sayılırsınız.
          </p>
          
          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>1. Sanal Ekonomi ve Sorumluluk Reddi</h3>
          <p style={{ borderLeft: '3px solid #fbbf24', paddingLeft: '0.75rem', background: 'rgba(251, 191, 36, 0.05)', padding: '0.5rem' }}>
            <strong>KRİTİK UYARI:</strong> KABİNE simülasyonu içerisinde yer alan tüm para birimleri (₺ / Türk Lirası simülasyon karşılığı), 
            merkez bankası faiz oranları, tahviller, hisse senetleri, şirketler, fabrikalar, emtialar (kömür, petrol, altın vb.) 
            ve mülkler <strong>TAMAMEN VIRTUAL (SANAL)</strong> olup, hiçbir gerçek dünya finansal değeri, karşılığı veya hukuki statüsü bulunmamaktadır. 
            Simülasyondaki bakiye ve varlıklar hiçbir şekilde gerçek paralara, emtialara veya haklara dönüştürülemez, ticarete konu edilemez. 
            Platformda yapılan işlemler hiçbir şekilde yatırım tavsiyesi niteliği taşımaz.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>2. Kullanıcı Hesapları ve Güvenlik</h3>
          <p>
            Kullanıcılar kayıt esnasında benzersiz bir kullanıcı adı ve güvenli şifre belirlemekle yükümlüdür. 
            Hesap güvenliğinden ve şifre gizliliğinden tamamen kullanıcının kendisi sorumludur. Üçüncü şahıslara devredilen veya 
            paylaşılan hesapların sorumluluğu kullanıcıya aittir. BAGIO LABS, yetkisiz hesap kullanımlarından doğacak zararlardan sorumlu tutulamaz.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>3. Davranış Kuralları ve Adil Oyun</h3>
          <p>
            KABİNE, çok oyunculu bir siyaset, borsa ve askeri jeostrateji oyunudur. Platform üzerinde diğer oyunculara yönelik hakaret, 
            tehdit, nefret söylemi, siyasi provokasyonlar, sistem açıklarını (bug/exploit) suistimal etme ve hile kullanımı kesinlikle yasaktır. 
            Yasaklanan eylemleri gerçekleştiren kullanıcıların hesapları, önceden bildirilmeksizin süresiz olarak askıya alınabilir veya silinebilir.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>4. Değişiklik Hakları</h3>
          <p>
            BAGIO LABS, simülasyon dengelerini, oyun kurallarını, emtia fiyat mekanizmalarını ve bu kullanım koşullarını dilediği zaman 
            güncelleme, değiştirme veya kaldırma hakkını saklı tutar.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Gizlilik Politikası',
      icon: <Shield size={20} className="text-amber-500" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <p><strong>Son Güncelleme: 20 Mayıs 2026</strong></p>
          <p>
            Gizliliğiniz bizim için son derece önemlidir. Bu Gizlilik Politikası, KABİNE simülasyonunu kullanırken 
            toplanan, saklanan ve işlenen verilerin kapsamını ve sınırlarını açıklamaktadır.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>1. Toplanan Bilgiler</h3>
          <p>
            Oyun deneyiminin ve hesap bütünlüğünün sağlanması için yalnızca aşağıdaki temel veriler toplanmaktadır:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li><strong>Kullanıcı Adı:</strong> Hesabınıza erişim sağlamanız için kullanılır.</li>
            <li><strong>Karakter Adı ve Soyadı:</strong> Oyun içerisindeki siyasi, ekonomik ve askeri kimliğiniz için kullanılır.</li>
            <li><strong>Telefon Numarası:</strong> Hesap doğrulama, şifre kurtarma ve çift hesap açılmasının (multi-accounting) engellenmesi amacıyla saklanır.</li>
            <li><strong>IP Adresi:</strong> Güvenlik denetimleri ve sunucu saldırılarının önlenmesi amacıyla geçici olarak loglanır.</li>
          </ul>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>2. Verilerin Saklanması ve Şifreleme</h3>
          <p>
            Giriş şifreniz, tek yönlü kriptografik hashing algoritmaları kullanılarak veri tabanımızda şifrelenmiş olarak saklanır. 
            Şifreniz hiçbir BAGIO LABS personeli veya yöneticisi tarafından görüntülenemez.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>3. Üçüncü Taraflarla Paylaşım</h3>
          <p>
            Toplanan veriler hiçbir koşulda reklam ajansları, veri pazarlamacıları veya diğer üçüncü taraf ticari kuruluşlarla 
            satılmaz veya paylaşılmaz. Verileriniz yalnızca yasal mercilerin resmi talebi halinde kanunlara uygun olarak paylaşılabilir.
          </p>
        </div>
      )
    },
    cookie: {
      title: 'Çerez Politikası (Cookie Policy)',
      icon: <Cookie size={20} className="text-amber-500" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <p><strong>Son Güncelleme: 20 Mayıs 2026</strong></p>
          <p>
            KABİNE platformu, tarayıcınızda veya cihazınızda sorunsuz ve hızlı bir oturum açma deneyimi sunabilmek amacıyla 
            yalnızca zorunlu çerezleri (cookies) ve yerel depolama (Local Storage) birimlerini kullanır.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>1. Çerezlerin Kullanım Amacı</h3>
          <p>
            Platformda kullanılan çerezler ve yerel depolama anahtarları şunlardır:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li><strong>politic_token:</strong> Oturumunuzun açık kalmasını sağlamak ve sunucu isteklerinizi doğrulamak için kullanılır.</li>
            <li><strong>politic_user_state:</strong> Sayfa yenilendiğinde oyun içi karakter verilerinizin (bakiye, konum, rol vb.) anında yüklenmesi amacıyla yerel bellekte saklanır.</li>
            <li><strong>Theme Preference:</strong> Karanlık veya aydınlık arayüz temasını hatırlamak için kullanılır.</li>
          </ul>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>2. Google ve Reklam Çerezleri</h3>
          <p>
            Platformumuzda reklam veren üçüncü taraf izleme çerezleri veya pazarlama çerezleri yer almamaktadır. Google arama 
            kriterleri gereği, bu çerezlerin yalnızca oyun altyapısının çalışması için zorunlu olduğu beyan edilir.
          </p>
        </div>
      )
    },
    kvkk: {
      title: 'KVKK Aydınlatma Metni',
      icon: <Scale size={20} className="text-amber-500" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <p><strong>Son Güncelleme: 20 Mayıs 2026</strong></p>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla BAGIO LABS tarafından, 
            KABİNE platformuna üye olan vatandaşlarımızın verilerinin toplanma ve işlenme şartları aşağıda sunulmuştur.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>1. Veri İşleme Amaçları</h3>
          <p>
            Kişisel verileriniz; oyun platformunun çalıştırılması, sahte hesap (bot/multi) denetiminin yapılması, 
            hesap şifrenizin güvenliğinin sağlanması ve talep ettiğiniz destek hizmetlerinin sunulması amacıyla 
            KVKK'nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde işlenmektedir.
          </p>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>2. İlgili Kişi Hakları (Madde 11)</h3>
          <p>
            KVKK'nın 11. maddesi kapsamında tüm üyelerimiz; kişisel verilerinin işlenip işlenmediğini öğrenme, 
            işlenmişse bilgi talep etme, verilerin düzeltilmesini veya silinmesini isteme haklarına sahiptir. 
            Bu haklarınızı kullanmak için <strong>support@bagiolabs.com</strong> adresine e-posta gönderebilirsiniz.
          </p>
        </div>
      )
    },
    support: {
      title: 'Destek ve İletişim Karargahı',
      icon: <MessageSquare size={20} className="text-amber-500" />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <p>
            KABİNE simülasyonu içerisinde yaşadığınız teknik aksaklıklar, borsa entegrasyon hataları, fatura/ödeme bildirimleri 
            veya hesap sorunları için destek ekibimizle 7/24 iletişime geçebilirsiniz.
          </p>

          <div style={{
            background: 'rgba(251, 191, 36, 0.05)',
            border: '1.5px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '0.5rem'
          }}>
            <h4 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 800 }}>İletişim Kanalları</h4>
            <p style={{ margin: '0.25rem 0' }}><strong>E-Posta:</strong> support@bagiolabs.com</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Yanıt Süresi:</strong> En geç 24 iş saati içerisinde dönüş sağlanır.</p>
          </div>

          <h3 style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.75rem 0 0.25rem 0', fontWeight: 800 }}>Raporlama Politikası</h3>
          <p>
            Oyun içi hata bildirimlerinde (bug) hatayı gösteren ekran görüntülerini, hata kodunu ve kullandığınız cihaz bilgisini 
            iletmeniz, çözüm sürecini büyük ölçüde hızlandıracaktır.
          </p>
        </div>
      )
    }
  };

  const currentDoc = docs[docType];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(5, 7, 13, 0.90)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.98) 0%, rgba(8, 10, 18, 0.99) 100%)',
        border: '2px solid #d97706',
        borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(217, 119, 6, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scaleIn 0.25s ease-out'
      }}>
        {/* Style injection for animations */}
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .compliance-link {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.85rem;
            font-weight: 700;
            display: flex;
            alignItems: center;
            gap: 0.5rem;
            border: 1px solid transparent;
            text-align: left;
            width: 100%;
            background: transparent;
            color: #94a3b8;
          }
          .compliance-link:hover {
            background: rgba(251, 191, 36, 0.05);
            color: #fbbf24;
          }
          .compliance-link-active {
            background: rgba(217, 119, 6, 0.15) !important;
            border-color: rgba(251, 191, 36, 0.3) !important;
            color: #fbbf24 !important;
            boxShadow: inset 0 0 10px rgba(217, 119, 6, 0.1);
          }
          .doc-scrollable::-webkit-scrollbar {
            width: 6px;
          }
          .doc-scrollable::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.15);
          }
          .doc-scrollable::-webkit-scrollbar-thumb {
            background: rgba(245, 158, 11, 0.3);
            border-radius: 3px;
          }
          .doc-scrollable::-webkit-scrollbar-thumb:hover {
            background: rgba(245, 158, 11, 0.5);
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(251, 191, 36, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24' }}>
            {currentDoc.icon}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
              {currentDoc.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              e.currentTarget.style.color = '#f59e0b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Dual Column Layout on Desktop) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          minHeight: 0
        }} className="modal-body-wrapper">
          {/* Sidebar Tabs */}
          <div style={{
            width: '200px',
            borderRight: '1px solid rgba(251, 191, 36, 0.15)',
            background: 'rgba(8, 10, 18, 0.5)',
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            overflowY: 'auto'
          }} className="sidebar-compliance-tabs">
            <button
              onClick={() => onSelectDoc('terms')}
              className={`compliance-link ${docType === 'terms' ? 'compliance-link-active' : ''}`}
            >
              <Scroll size={16} />
              Kullanım Koşulları
            </button>
            <button
              onClick={() => onSelectDoc('privacy')}
              className={`compliance-link ${docType === 'privacy' ? 'compliance-link-active' : ''}`}
            >
              <Shield size={16} />
              Gizlilik Politikası
            </button>
            <button
              onClick={() => onSelectDoc('cookie')}
              className={`compliance-link ${docType === 'cookie' ? 'compliance-link-active' : ''}`}
            >
              <Cookie size={16} />
              Çerez Politikası
            </button>
            <button
              onClick={() => onSelectDoc('kvkk')}
              className={`compliance-link ${docType === 'kvkk' ? 'compliance-link-active' : ''}`}
            >
              <Scale size={16} />
              KVKK Aydınlatma
            </button>
            <button
              onClick={() => onSelectDoc('support')}
              className={`compliance-link ${docType === 'support' ? 'compliance-link-active' : ''}`}
            >
              <MessageSquare size={16} />
              Destek ve İletişim
            </button>
          </div>

          {/* Content Pane */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.15)'
          }} className="doc-scrollable">
            {currentDoc.content}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid rgba(251, 191, 36, 0.15)',
          background: 'rgba(8, 10, 18, 0.6)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 700
        }}>
          © 2026 BAGIO LABS • TÜM HAKLARI SAKLIDIR
        </div>
      </div>
    </div>
  );
};
