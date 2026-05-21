import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

interface Commodity {
  id: string;
  name: string;
  symbol: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  priceTrend: number[];
  description: string;
}

export default function MarketManager() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommodities();

    // Sockets Bağlantısı
    const socket = io('http://localhost:3000');
    socket.emit('join:market');

    // Real-time fiyat güncellemesi dinleyicisi
    socket.on('market:price-update', (data: { commodityId: string; currentPrice: number; priceTrend: number[] }) => {
      setCommodities((prev) => 
        prev.map((c) => 
          c.id === data.commodityId 
            ? { ...c, currentPrice: data.currentPrice, priceTrend: data.priceTrend } 
            : c
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCommodities = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:3000/api/v1/admin/commodities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCommodities(response.data.commodities);
        // Input başlangıç değerleri
        const inputs: Record<string, number> = {};
        response.data.commodities.forEach((c: Commodity) => {
          inputs[c.id] = Number(c.currentPrice);
        });
        setPriceInputs(inputs);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Borsa verileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceInputChange = (id: string, value: number) => {
    setPriceInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Fiyat Manipülasyonu / Güncelleme
  const handleUpdatePrice = async (id: string) => {
    const newPrice = priceInputs[id];
    if (newPrice === undefined || newPrice <= 0) {
      alert('Lütfen geçerli bir fiyat girin.');
      return;
    }

    setUpdatingId(id);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `http://localhost:3000/api/v1/admin/commodities/${id}`,
        { currentPrice: newPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMsg(`"${response.data.commodity.name}" fiyatı ₺${newPrice} olarak güncellendi ve tüm sunucuya yayınlandı.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Fiyat güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Fiyat trendi SVG çizgi grafiği oluşturma
  const renderTrendLine = (trend: number[]) => {
    if (!trend || trend.length < 2) return null;
    const width = 160;
    const height = 40;
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min === 0 ? 1 : max - min;

    const points = trend.map((val, idx) => {
      const x = (idx / (trend.length - 1)) * width;
      const y = height - ((val - min) / range) * height * 0.7 - 5; // Üstten-alttan pay bırak
      return `${x},${y}`;
    }).join(' ');

    const lastVal = trend[trend.length - 1];
    const prevVal = trend[trend.length - 2];
    const isUp = lastVal >= prevVal;

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={isUp ? '#10b981' : '#ef4444'}
          strokeWidth="2.5"
          points={points}
        />
        {/* Son Nokta Spotu */}
        <circle
          cx={width}
          cy={height - ((lastVal - min) / range) * height * 0.7 - 5}
          r="4"
          fill={isUp ? '#10b981' : '#ef4444'}
        />
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      <div>
        <h3 style={styles.title}>Merkezi Borsa ve Emtia Manipülasyon Paneli</h3>
        <p style={styles.subtitle}>
          Emtia taban fiyatlarını ve anlık değerlerini değiştirerek serbest piyasa dengelerine doğrudan müdahale edin.
        </p>
      </div>

      {successMsg && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} color="#10b981" style={{ marginRight: '8px' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Borsa emtiaları listeleniyor...</div>
      ) : (
        <div className="admin-grid-3">
          {commodities.map((comm) => {
            const trend = comm.priceTrend || [];
            const lastVal = trend[trend.length - 1] || comm.currentPrice;
            const prevVal = trend[trend.length - 2] || comm.currentPrice;
            const isUp = lastVal >= prevVal;

            return (
              <div key={comm.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.symbolBadge}>{comm.symbol}</span>
                    <h4 style={styles.commName}>{comm.name}</h4>
                  </div>
                  <div style={styles.priceSection}>
                    <span style={styles.currentPriceText}>
                      ₺{Number(comm.currentPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ 
                      ...styles.trendText, 
                      color: isUp ? '#10b981' : '#ef4444',
                      backgroundColor: isUp ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'
                    }}>
                      {isUp ? <TrendingUp size={12} style={{ marginRight: '2px' }} /> : <TrendingDown size={12} style={{ marginRight: '2px' }} />}
                      {isUp ? 'Artışta' : 'Düşüşte'}
                    </span>
                  </div>
                </div>

                <p style={styles.desc}>{comm.description}</p>

                {/* SVG Grafik */}
                <div style={styles.chartWrapper}>
                  <div style={styles.chartHeader}>
                    <Activity size={12} color="#64748b" style={{ marginRight: '4px' }} />
                    <span style={styles.chartLabel}>Son Fiyat Trendi</span>
                  </div>
                  <div style={styles.svgContainer}>
                    {renderTrendLine(trend) || <span style={styles.noChartText}>Yeterli veri yok</span>}
                  </div>
                </div>

                <div style={styles.divider} />

                {/* Fiyat Değiştirme Formu */}
                <div style={styles.actionSection}>
                  <div style={styles.inputWrapper}>
                    <span style={styles.currencyPrefix}>₺</span>
                    <input
                      type="number"
                      value={priceInputs[comm.id] || 0}
                      onChange={(e) => handlePriceInputChange(comm.id, Number(e.target.value))}
                      style={styles.priceInput}
                    />
                  </div>
                  <button 
                    onClick={() => handleUpdatePrice(comm.id)}
                    disabled={updatingId === comm.id}
                    style={styles.updateBtn}
                  >
                    {updatingId === comm.id ? 'Güncelleniyor...' : 'Fiyatı Belirle'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbolBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  commName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '4px 0 0 0',
  },
  priceSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  currentPriceText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  trendText: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '6px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  desc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '18px',
    margin: '14px 0',
    flex: 1,
  },
  chartWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  chartLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  svgContainer: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noChartText: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '0 0 16px 0',
  },
  actionSection: {
    display: 'flex',
    gap: '12px',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  currencyPrefix: {
    position: 'absolute',
    left: '10px',
    top: '9px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  priceInput: {
    width: '100%',
    height: '36px',
    paddingLeft: '22px',
    paddingRight: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '600',
    outline: 'none',
  },
  updateBtn: {
    padding: '0 16px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#059669',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#dc2626',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
};
