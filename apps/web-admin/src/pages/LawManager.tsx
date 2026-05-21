import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Check, 
  X, 
  CheckCircle2, 
  Percent 
} from 'lucide-react';

interface Law {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: string;
  status: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: string;
}

export default function LawManager() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Yeni Yasa Ekleme Modal Durumu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('TAX');
  const [newTargetValue, setNewTargetValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLaws();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLaws = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/laws', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setLaws(response.data.laws);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Yasa tasarıları yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Yeni Yasa Tasarısı Gönder
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newTargetValue) {
      alert('Tüm alanları doldurmanız gerekmektedir.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        '/api/v1/admin/laws',
        {
          title: newTitle,
          description: newDesc,
          category: newCategory,
          targetValue: newTargetValue,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMsg('Yeni kanun tasarısı TBMM Meclisine sunuldu.');
        fetchLaws();
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewTargetValue('');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yasa tasarısı oluşturulurken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Yasa Durumunu ve Oylarını Güncelle
  const handleUpdateStatus = async (id: string, status: string, yesVotes?: number, noVotes?: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `/api/v1/admin/laws/${id}`,
        { status, yesVotes, noVotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMsg(`Yasa tasarısı durumu "${status}" olarak güncellendi.`);
        fetchLaws();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Güncelleme sırasında hata oluştu.');
    }
  };

  // Basit SVG Oylama Pasta Grafiği Çizimi
  const renderVotePie = (yes: number, no: number) => {
    const total = yes + no;
    if (total === 0) {
      return (
        <div style={styles.piePlaceholder}>
          <Percent size={14} color="#94a3b8" />
          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>Henüz oy yok</span>
        </div>
      );
    }

    const yesPercent = Math.round((yes / total) * 100);
    const noPercent = 100 - yesPercent;

    return (
      <div style={styles.pieContainer}>
        {/* Yes/No Barları */}
        <div style={styles.voteBarWrapper}>
          <div style={styles.voteBarHeader}>
            <span style={{ ...styles.voteLabel, color: '#10b981' }}>EVET (%{yesPercent})</span>
            <span style={{ ...styles.voteLabel, color: '#ef4444' }}>HAYIR (%{noPercent})</span>
          </div>
          <div style={styles.voteBarBg}>
            <div style={{ ...styles.voteBarFillYes, width: `${yesPercent}%` }} />
            <div style={{ ...styles.voteBarFillNo, width: `${noPercent}%` }} />
          </div>
          <div style={styles.voteCounts}>
            <span>{yes} Oy</span>
            <span>{no} Oy</span>
          </div>
        </div>
      </div>
    );
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
          <h3 style={styles.title}>Meclis Kanun ve Yasa Yönetimi</h3>
          <p style={styles.subtitle}>TBMM meclisine sunulmuş yasa tekliflerini denetleyin, veto edin veya doğrudan kanunlaştırın.</p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} style={styles.addBtn}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          Yeni Yasa Teklif Et
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

      {/* Yasalar Listesi */}
      {loading ? (
        <div style={styles.loading}>Yasa tasarıları listeleniyor...</div>
      ) : laws.length === 0 ? (
        <div style={styles.emptyList}>Mecliste kayıtlı hiçbir yasa teklifi bulunamadı.</div>
      ) : (
        <div className="admin-grid-2">
          {laws.map((law) => {
            return (
              <div key={law.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: law.status === 'APPROVED' ? 'rgba(16,185,129,0.08)' : law.status === 'VETOED' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
                      color: law.status === 'APPROVED' ? '#10b981' : law.status === 'VETOED' ? '#ef4444' : '#3b82f6',
                      border: `1px solid ${law.status === 'APPROVED' ? '#10b981' : law.status === 'VETOED' ? '#ef4444' : '#3b82f6'}30`
                    }}>
                      {law.status === 'APPROVED' ? 'YASALAŞTI' : law.status === 'VETOED' ? 'VETO EDİLDİ' : 'OYLAMADA'}
                    </span>
                    <h4 style={styles.lawTitle}>{law.title}</h4>
                    <span style={styles.categoryBadge}>{law.category} - Hedef Değer: {law.targetValue}</span>
                  </div>
                  
                  <div style={styles.dateText}>
                    {new Date(law.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <p style={styles.desc}>{law.description}</p>

                {/* Oy Oranları Grafiği */}
                <div style={styles.pieSection}>
                  {renderVotePie(law.yesVotes, law.noVotes)}
                </div>

                {law.status === 'VOTING' && (
                  <>
                    <div style={styles.divider} />
                    
                    {/* Hızlı Oylama Simülasyonu */}
                    <div style={styles.voteSimSection}>
                      <span style={styles.simLabel}>Oy Simülasyonu:</span>
                      <button 
                        onClick={() => handleUpdateStatus(law.id, 'VOTING', law.yesVotes + 50, law.noVotes)}
                        style={styles.simBtn}
                      >
                        +50 Evet
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(law.id, 'VOTING', law.yesVotes, law.noVotes + 50)}
                        style={{ ...styles.simBtn, color: '#ef4444' }}
                      >
                        +50 Hayır
                      </button>
                    </div>

                    <div style={styles.divider} />

                    {/* Karar Düğmeleri */}
                    <div style={{
                      ...styles.actionButtons,
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <button 
                        onClick={() => handleUpdateStatus(law.id, 'APPROVED')} 
                        style={styles.approveBtn}
                      >
                        <Check size={14} style={{ marginRight: '6px' }} />
                        Doğrudan Kanunlaştır
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(law.id, 'VETOED')} 
                        style={styles.vetoBtn}
                      >
                        <X size={14} style={{ marginRight: '6px' }} />
                        Tasarıyı Veto Et
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Yasa Ekleme Modali */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{
            ...styles.modalCard,
            width: isMobile ? '90%' : '480px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Yasa Tasarısı Dikte Et</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <p style={styles.modalDesc}>
              Doğrudan TBMM oylama listesine dahil edilecek yeni bir yasa teklifi hazırlayın.
            </p>

            <form onSubmit={handleAddSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Yasa Teklifi Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: 2026 Zonguldak Kömür Teşvik Kanunu"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Kanun Detay ve Açıklamaları</label>
                <textarea
                  placeholder="Yasanın meclis ve borsa üzerindeki etkileri, hedeflenen maddeler..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div className="modal-grid-2">
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={styles.select}
                  >
                    <option value="TAX">Vergilendirme (TAX)</option>
                    <option value="BORDER">Gümrük & Sınır (BORDER)</option>
                    <option value="RESOURCE">Rezerv & Hammadde (RESOURCE)</option>
                    <option value="MILITARY">Ordu & Savunma (MILITARY)</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hedef/Değer</label>
                  <input
                    type="text"
                    placeholder="Örn: %18 KDV Oranı"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} style={styles.saveBtn}>
                {submitting ? 'Meclise Sunuluyor...' : 'Yasa Tasarısını Meclise Gönder'}
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
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
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
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  lawTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '8px 0 2px 0',
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
  },
  dateText: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  desc: {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '18px',
    margin: '16px 0',
    flex: 1,
  },
  pieSection: {
    marginBottom: '16px',
  },
  piePlaceholder: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '0 12px',
  },
  pieContainer: {
    width: '100%',
  },
  voteBarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  voteBarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  voteLabel: {
    fontSize: '10px',
    fontWeight: 'bold',
  },
  voteBarBg: {
    height: '10px',
    borderRadius: '5px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    display: 'flex',
  },
  voteBarFillYes: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  voteBarFillNo: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  voteCounts: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748b',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '12px 0',
  },
  voteSimSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  simLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
  },
  simBtn: {
    padding: '3px 8px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#10b981',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  approveBtn: {
    flex: 1,
    height: '38px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetoBtn: {
    flex: 1,
    height: '38px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '480px',
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
  textarea: {
    height: '80px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    resize: 'none',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  select: {
    height: '38px',
    padding: '0 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
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
