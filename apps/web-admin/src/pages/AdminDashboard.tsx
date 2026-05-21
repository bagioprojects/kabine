import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Users, 
  Coins, 
  Truck, 
  Archive, 
  MapPin, 
  Activity, 
  Building2, 
  ShieldAlert 
} from 'lucide-react';

interface Stats {
  totalPlayers: number;
  totalMoneyInCirculation: number;
  totalTrucks: number;
  totalReserves: number;
}

// 11 Cumhuriyet eyalet renk tanımlamaları
const CUMHURIYET_RENKLERI: Record<number, string> = {
  77: '#3b82f6', // Yalova - Mavi
  6: '#10b981',  // Ankara - Yeşil
  34: '#8b5cf6', // İstanbul - Mor
  78: '#f59e0b', // Karabük - Turuncu
  37: '#ec4899', // Kastamonu - Pembe
  72: '#0ea5e9', // Batman - Gök Mavisi
  67: '#64748b', // Zonguldak - Kömür Grisi
  26: '#14b8a6', // Eskişehir - Teal
  10: '#f43f5e', // Balıkesir - Kırmızı
  58: '#eab308', // Sivas - Altın Sarısı
  42: '#a855f7'  // Konya - Eflatun
};

const CUMHURIYET_ISIMLERI: Record<number, string> = {
  77: 'Yalova Cumhuriyeti',
  6: 'Ankara Cumhuriyeti',
  34: 'İstanbul Cumhuriyeti',
  78: 'Karabük Cumhuriyeti',
  37: 'Kastamonu Cumhuriyeti',
  72: 'Batman Cumhuriyeti',
  67: 'Zonguldak Cumhuriyeti',
  26: 'Eskişehir Cumhuriyeti',
  10: 'Balıkesir Cumhuriyeti',
  58: 'Sivas Cumhuriyeti',
  42: 'Konya Cumhuriyeti'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Seçili İlçe Bilgileri
  const [selectedRegion, setSelectedRegion] = useState<{ id: string; name: string } | null>(null);
  const [regionDetails, setRegionDetails] = useState<any>(null);

  useEffect(() => {
    fetchStats();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionClick = (id: string, name: string) => {
    setSelectedRegion({ id, name });
    
    // İlçe ID'sinden (varsa plaka kodunu) çekmeye çalışalım
    // Örneğin ID formatı: "TR.77.01" ise plaka 77'dir.
    let plaka = 77; // varsayılan
    const parts = id.split('.');
    if (parts.length >= 2) {
      const parsedPlaka = parseInt(parts[1]);
      if (!isNaN(parsedPlaka)) plaka = parsedPlaka;
    } else {
      // Eğer düz sayısal ise plaka kodunu anlamaya çalışalım
      const numId = parseInt(id);
      if (!isNaN(numId) && numId > 0 && numId <= 81) plaka = numId;
    }

    const cumhuriyetName = CUMHURIYET_ISIMLERI[plaka] || 'Bağımsız Bölge';
    const cumhuriyetColor = CUMHURIYET_RENKLERI[plaka] || '#64748b';

    // Bölge detaylarını simüle ederek zenginleştirelim
    setRegionDetails({
      cumhuriyetName,
      cumhuriyetColor,
      population: Math.floor(Math.random() * 8500) + 1500,
      activeFactories: Math.floor(Math.random() * 12) + 1,
      taxRate: `%${Math.floor(Math.random() * 10) + 12}`,
      securityLevel: `%${Math.floor(Math.random() * 30) + 65}`,
      resources: [
        { name: 'Kömür', amount: Math.floor(Math.random() * 5000) + 200 },
        { name: 'Demir', amount: Math.floor(Math.random() * 3000) + 100 },
        { name: 'Çelik', amount: Math.floor(Math.random() * 1000) + 50 },
      ]
    });
  };

  if (loading) {
    return <div style={styles.loading}>Veriler yükleniyor, lütfen bekleyin...</div>;
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <ShieldAlert size={48} color="#ef4444" />
        <h3 style={{ color: '#ef4444', marginTop: '16px' }}>Hata Oluştu</h3>
        <p style={{ color: '#64748b' }}>{error}</p>
        <button onClick={fetchStats} style={styles.retryBtn}>Yeniden Dene</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Üst Kartlar */}
      <div className="admin-grid-4">
        <div style={styles.card}>
          <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div>
            <span style={styles.cardLabel}>Kayıtlı Oyuncu</span>
            <h3 style={styles.cardValue}>{stats?.totalPlayers?.toLocaleString('tr-TR') || 0}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Coins size={24} color="#10b981" />
          </div>
          <div>
            <span style={styles.cardLabel}>Dolaşımdaki Para</span>
            <h3 style={styles.cardValue}>₺{stats?.totalMoneyInCirculation?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Truck size={24} color="#f59e0b" />
          </div>
          <div>
            <span style={styles.cardLabel}>Aktif Tır Seferleri</span>
            <h3 style={styles.cardValue}>{stats?.totalTrucks?.toLocaleString('tr-TR') || 0}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.cardIconWrapper, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Archive size={24} color="#8b5cf6" />
          </div>
          <div>
            <span style={styles.cardLabel}>Toplam Devlet Rezervi</span>
            <h3 style={styles.cardValue}>{stats?.totalReserves?.toLocaleString('tr-TR') || 0} Ton</h3>
          </div>
        </div>
      </div>

      {/* Harita ve Detaylar Yan Yana */}
      <div className="admin-flex-row-to-col">
        {/* Harita Panel */}
        <div style={styles.mapCard}>
          <div style={styles.cardHeader}>
            <Activity size={18} color="#3b82f6" style={{ marginRight: '8px' }} />
            <h3 style={styles.cardTitle}>Türkiye İlçe Hakimiyet ve Yoğunluk Haritası</h3>
          </div>
          <p style={styles.cardSubtitle}>
            Herhangi bir ilçenin üzerine tıklayarak anlık demografik ve hammadde durumunu analiz edebilirsiniz.
          </p>
          <div style={styles.mapWrapper}>
            <InteractiveMap onRegionClick={handleRegionClick} />
          </div>
        </div>

        {/* Seçili İlçe Bilgi Panel */}
        <div style={{
          ...styles.detailsCard,
          width: isMobile ? '100%' : '380px',
          minHeight: isMobile ? 'auto' : '600px'
        }}>
          {selectedRegion ? (
            <div style={styles.detailsContainer}>
              <div style={styles.detailsHeader}>
                <MapPin size={24} color={regionDetails?.cumhuriyetColor || '#3b82f6'} />
                <div>
                  <h3 style={styles.detailsTitle}>{selectedRegion.name}</h3>
                  <span style={{ 
                    ...styles.detailsBadge, 
                    backgroundColor: `${regionDetails?.cumhuriyetColor}15`, 
                    color: regionDetails?.cumhuriyetColor,
                    border: `1px solid ${regionDetails?.cumhuriyetColor}30`
                  }}>
                    {regionDetails?.cumhuriyetName}
                  </span>
                </div>
              </div>

              <div style={styles.divider} />

              {/* İstatistikler */}
              <div style={styles.grid2}>
                <div style={styles.infoBox}>
                  <Users size={16} color="#64748b" style={{ marginRight: '6px' }} />
                  <div>
                    <span style={styles.infoLabel}>Bölge Oyuncuları</span>
                    <span style={styles.infoValue}>{regionDetails?.population?.toLocaleString('tr-TR')}</span>
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <Building2 size={16} color="#64748b" style={{ marginRight: '6px' }} />
                  <div>
                    <span style={styles.infoLabel}>Aktif Fabrikalar</span>
                    <span style={styles.infoValue}>{regionDetails?.activeFactories} Adet</span>
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <Coins size={16} color="#64748b" style={{ marginRight: '6px' }} />
                  <div>
                    <span style={styles.infoLabel}>Vergi Oranı</span>
                    <span style={styles.infoValue}>{regionDetails?.taxRate}</span>
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <Activity size={16} color="#64748b" style={{ marginRight: '6px' }} />
                  <div>
                    <span style={styles.infoLabel}>Asayiş Seviyesi</span>
                    <span style={{ ...styles.infoValue, color: '#10b981' }}>{regionDetails?.securityLevel}</span>
                  </div>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Hammadde Rezerv Durumları */}
              <h4 style={styles.sectionHeading}>Bölgesel Hammadde Rezervleri</h4>
              <div style={styles.resourceList}>
                {regionDetails?.resources.map((res: any, idx: number) => (
                  <div key={idx} style={styles.resourceItem}>
                    <span style={styles.resourceName}>{res.name}</span>
                    <div style={styles.progressBarBg}>
                      <div style={{ 
                        ...styles.progressBarFill, 
                        width: `${Math.min(100, (res.amount / 5200) * 100)}%`,
                        backgroundColor: regionDetails?.cumhuriyetColor
                      }} />
                    </div>
                    <span style={styles.resourceAmount}>{res.amount} Ton</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📍</div>
              <h4 style={styles.emptyTitle}>Bölge Seçilmedi</h4>
              <p style={styles.emptyDesc}>
                Detayları ve stratejik hammadde rezervlerini incelemek için soldaki Türkiye haritasından bir ilçe seçin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '600',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  retryBtn: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)',
  },
  cardIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  cardValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '4px 0 0 0',
  },
  mapSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  mapCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '6px 0 20px 0',
  },
  mapWrapper: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  detailsCard: {
    width: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  emptyDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px',
    lineHeight: '18px',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  detailsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  detailsBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '6px',
    marginTop: '6px',
    display: 'inline-block',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '20px 0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '12px',
  },
  infoLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '600',
    display: 'block',
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: '2px',
  },
  sectionHeading: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0 0 16px 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  resourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  resourceName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    width: '60px',
  },
  progressBarBg: {
    flex: 1,
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease-out',
  },
  resourceAmount: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    width: '70px',
  },
};
