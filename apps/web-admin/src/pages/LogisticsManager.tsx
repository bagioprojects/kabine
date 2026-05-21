import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  MapPin, 
  X, 
  CheckCircle2, 
  Activity,
  Layers
} from 'lucide-react';

interface TruckData {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: string;
  currentProvinceId: number;
  currentDistrictId: number;
}

export default function LogisticsManager() {
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Yeni Tır Ekleme Modal Durumu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCapacity, setNewCapacity] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrucks();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/trucks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setTrucks(response.data.trucks);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tır filosu yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel || !newCapacity) {
      alert('Tüm alanları doldurmanız gerekmektedir.');
      return;
    }

    // Basit Plaka Doğrulaması
    const plateRegex = /^[0-9]{2}[A-Z\s]{1,3}[0-9]{2,4}$/i;
    if (!plateRegex.test(newPlate.replace(/\s+/g, ''))) {
      alert('Lütfen geçerli bir Türkiye plakası girin. Örn: 34ABC123');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        '/api/v1/admin/trucks',
        {
          plateNumber: newPlate.toUpperCase(),
          model: newModel,
          capacity: newCapacity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMsg('Yeni lojistik tırı başarıyla satın alındı ve filoya katıldı.');
        fetchTrucks();
        setIsAddModalOpen(false);
        setNewPlate('');
        setNewModel('');
        setNewCapacity(20);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tır eklenirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Üst Bar */}
      <div style={{
        ...styles.topBar,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '16px' : '0'
      }}>
        <div>
          <h3 style={styles.title}>Lojistik & Tır Filosu Denetimi</h3>
          <p style={styles.subtitle}>Cumhuriyetler arası emtia taşımacılığı yapan tır filosunu izleyin ve yeni tırlar ekleyin.</p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} style={styles.addBtn}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          Filoya Tır Ekle
        </button>
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

      {/* Tır Kartları Grid */}
      {loading ? (
        <div style={styles.loading}>Tır filosu listeleniyor...</div>
      ) : trucks.length === 0 ? (
        <div style={styles.emptyList}>Filoya kayıtlı hiçbir lojistik tırı bulunamadı.</div>
      ) : (
        <div className="admin-grid-3">
          {trucks.map((truck) => {
            return (
              <div key={truck.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.plateWrapper}>
                    <div style={styles.plateBlueBar}>TR</div>
                    <span style={styles.plateText}>{truck.plateNumber}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: truck.status === 'IDLE' ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
                    color: truck.status === 'IDLE' ? '#10b981' : '#3b82f6',
                    border: `1px solid ${truck.status === 'IDLE' ? '#10b981' : '#3b82f6'}30`
                  }}>
                    {truck.status === 'IDLE' ? 'GARAJDA (BOŞ)' : 'SEFERDE'}
                  </span>
                </div>

                <h4 style={styles.modelName}>{truck.model}</h4>
                
                <div style={styles.divider} />

                <div style={styles.detailsRow}>
                  <div style={styles.detailItem}>
                    <Layers size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <div>
                      <span style={styles.detailLabel}>Taşıma Kapasitesi</span>
                      <span style={styles.detailValue}>{truck.capacity} Ton</span>
                    </div>
                  </div>

                  <div style={styles.detailItem}>
                    <MapPin size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <div>
                      <span style={styles.detailLabel}>Konum Plakası</span>
                      <span style={styles.detailValue}>{truck.currentProvinceId} Eyaleti</span>
                    </div>
                  </div>
                </div>

                {truck.status !== 'IDLE' && (
                  <div style={styles.activeRouteAlert}>
                    <Activity size={12} color="#3b82f6" style={{ marginRight: '6px', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: '600' }}>
                      Eyaletler arası maden sevkiyatı yapılıyor.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Tır Ekleme Modali */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{
            ...styles.modalCard,
            width: isMobile ? '90%' : '400px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Filoya Yeni Tır Satın Al</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <p style={styles.modalDesc}>
              Borsalar ve fabrikalar arası yük taşımacılığında kullanılmak üzere yeni tır ekleyin.
            </p>

            <form onSubmit={handleAddSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tır Plakası</label>
                <input
                  type="text"
                  placeholder="Örn: 34ABC123"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tır Marka ve Modeli</label>
                <input
                  type="text"
                  placeholder="Örn: Scania S730 V8"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Maksimum Taşıma Kapasitesi (Ton)</label>
                <input
                  type="number"
                  placeholder="Örn: 24"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  style={styles.input}
                />
              </div>

              <button type="submit" disabled={submitting} style={styles.saveBtn}>
                {submitting ? 'Tır Satın Alınıyor...' : 'Tırı Satın Al ve Garaja Gönder'}
              </button>
            </form>
          </div>
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    height: '40px',
    padding: '0 16px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
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
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '2px solid #0f172a',
    borderRadius: '6px',
    overflow: 'hidden',
    height: '28px',
  },
  plateBlueBar: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold',
    width: '18px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateText: {
    padding: '0 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: '0.5px',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  modelName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '16px 0 0 0',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '16px 0',
  },
  detailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
  },
  detailLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  activeRouteAlert: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
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
  emptyList: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    width: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e2e8f0',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    marginBottom: '20px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    height: '38px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  saveBtn: {
    height: '42px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.2)',
  },
};
