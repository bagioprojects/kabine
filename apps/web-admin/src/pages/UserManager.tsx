import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  characterName: string;
  characterSurname: string;
  cash: number;
  bankCheckingBalance: number;
  bankSavingsBalance: number;
  politicalRole: string;
  politicalInfluence: number;
  isAdmin: boolean;
  createdAt: string;
  citizenId?: string | null;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Düzenleme Modal Durumu
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editCash, setEditCash] = useState(0);
  const [editChecking, setEditChecking] = useState(0);
  const [editSavings, setEditSavings] = useState(0);
  const [editInfluence, setEditInfluence] = useState(0);
  const [editRole, setEditRole] = useState('VATANDAS');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/v1/admin/users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    fetchUsers(value);
  };

  // Düzenleme Modalını Aç
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditCash(Number(user.cash));
    setEditChecking(Number(user.bankCheckingBalance));
    setEditSavings(Number(user.bankSavingsBalance));
    setEditInfluence(Number(user.politicalInfluence));
    setEditRole(user.politicalRole);
    setEditIsAdmin(user.isAdmin);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
  };

  // Düzenleme Formunu Gönder
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `/api/v1/admin/users/${selectedUser.id}`,
        {
          cash: editCash,
          bankCheckingBalance: editChecking,
          bankSavingsBalance: editSavings,
          politicalInfluence: editInfluence,
          politicalRole: editRole,
          isAdmin: editIsAdmin,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMsg('Kullanıcı bilgileri başarıyla güncellendi.');
        fetchUsers(search);
        closeEditModal();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Güncelleme sırasında hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Kullanıcı Sil
  const handleDeleteUser = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`"${name}" adlı karakter kaydını kalıcı olarak silmek istediğinize emin misiniz?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccessMsg('Kullanıcı başarıyla silindi.');
        fetchUsers(search);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Silme işlemi sırasında hata oluştu.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Başlık ve Arama */}
      <div style={{
        ...styles.topBar,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '16px' : '0'
      }}>
        <div>
          <h3 style={styles.title}>Vatandaş Veritabanı</h3>
          <p style={styles.subtitle}>Tüm vatandaşların bakiyelerini, siyasi yetkilerini ve rollerini denetleyin.</p>
        </div>

        <div style={{
          ...styles.searchWrapper,
          width: isMobile ? '100%' : '320px'
        }}>
          <input
            type="text"
            placeholder="Kullanıcı adı veya karakter adı ara..."
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          <Search size={18} color="#64748b" style={styles.searchIcon} />
        </div>
      </div>

      {successMsg && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} color="#10b981" style={{ marginRight: '8px' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={16} color="#ef4444" style={{ marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Oyuncu Tablosu */}
      <div className="table-responsive" style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>Vatandaş listesi yükleniyor...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyTable}>Kriterlere uygun hiçbir vatandaş kaydı bulunamadı.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Vatandaş Adı</th>
                <th style={styles.th}>Telefon</th>
                <th style={styles.th}>Siyasi Rol</th>
                <th style={styles.th}>Cüzdan Nakit</th>
                <th style={styles.th}>Banka Vadesiz</th>
                <th style={styles.th}>Nüfuz Puanı</th>
                <th style={styles.th}>Yönetici</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Eylemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#0f172a' }}>
                    {user.characterName} {user.characterSurname}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      <span style={styles.usernameTag}>@{user.username}</span>
                      {user.citizenId && (
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                          🪪 Kimlik No: {user.citizenId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>+{user.phoneNumber}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: user.politicalRole === 'CUMHURBASKANI' ? '#fef3c7' : '#f1f5f9',
                      color: user.politicalRole === 'CUMHURBASKANI' ? '#d97706' : '#475569',
                    }}>
                      {user.politicalRole}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>₺{Number(user.cash).toLocaleString('tr-TR')}</td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>₺{Number(user.bankCheckingBalance).toLocaleString('tr-TR')}</td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#3b82f6' }}>{user.politicalInfluence} NP</td>
                  <td style={styles.td}>
                    {user.isAdmin ? (
                      <span style={styles.adminTag}>
                        <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Evet
                      </span>
                    ) : (
                      <span style={styles.noAdminTag}>Hayır</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionGroup}>
                      <button 
                        onClick={() => openEditModal(user)} 
                        title="Bilgileri Düzenle" 
                        style={styles.editBtn}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, `${user.characterName} ${user.characterSurname}`)} 
                        title="Karakteri Kalıcı Sil" 
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Düzenleme Modali */}
      {selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={{
            ...styles.modalCard,
            width: isMobile ? '90%' : '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Karakter Verilerini Düzenle</h3>
              <button onClick={closeEditModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <p style={styles.modalDesc}>
              Seçili Vatandaş: <strong style={{ color: '#0f172a' }}>{selectedUser.characterName} {selectedUser.characterSurname} (@{selectedUser.username})</strong>
            </p>

            <form onSubmit={handleUpdateSubmit} style={styles.modalForm}>
              <div className="modal-grid-2">
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nakit Para (₺)</label>
                  <input
                    type="number"
                    value={editCash}
                    onChange={(e) => setEditCash(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Banka Vadesiz (₺)</label>
                  <input
                    type="number"
                    value={editChecking}
                    onChange={(e) => setEditChecking(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
              </div>

              <div className="modal-grid-2">
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Banka Vadeli (₺)</label>
                  <input
                    type="number"
                    value={editSavings}
                    onChange={(e) => setEditSavings(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Siyasi Nüfuz Puanı (NP)</label>
                  <input
                    type="number"
                    value={editInfluence}
                    onChange={(e) => setEditInfluence(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
              </div>

              <div className="modal-grid-2">
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Siyasi Rol</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    style={styles.select}
                  >
                    <option value="VATANDAS">VATANDAS</option>
                    <option value="MUHTAR">MUHTAR</option>
                    <option value="BELEDIYE_BASKANI">BELEDIYE_BASKANI</option>
                    <option value="MILLETVEKILI">MILLETVEKILI</option>
                    <option value="BAKAN">BAKAN</option>
                    <option value="CUMHURBASKANI">CUMHURBASKANI</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Yönetici (Admin) Yetkisi</label>
                  <div style={styles.switchWrapper}>
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={editIsAdmin}
                      onChange={(e) => setEditIsAdmin(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <label htmlFor="isAdmin" style={styles.checkboxLabel}>
                      {editIsAdmin ? 'Sistem Yetkisi Açık' : 'Sistem Yetkisi Kapalı'}
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} style={styles.saveBtn}>
                {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Veritabanına Yaz'}
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
  searchWrapper: {
    position: 'relative',
    width: '320px',
  },
  searchInput: {
    width: '100%',
    height: '40px',
    paddingLeft: '38px',
    paddingRight: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    outline: 'none',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '11px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.02)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '16px 20px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 20px',
    fontSize: '13px',
    color: '#475569',
    verticalAlign: 'middle',
  },
  usernameTag: {
    display: 'block',
    fontSize: '10px',
    color: '#94a3b8',
    marginTop: '2px',
    fontWeight: '500',
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  adminTag: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  noAdminTag: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  editBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid ' + 'rgba(239, 68, 68, 0.1)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    color: '#ef4444',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '600',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  emptyTable: {
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
    width: '500px',
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
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
  switchWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '38px',
    gap: '8px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0f172a',
    cursor: 'pointer',
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
