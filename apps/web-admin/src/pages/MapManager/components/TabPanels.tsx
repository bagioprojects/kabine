import React from 'react';
import { mapManagerStyles as styles } from '../MapManager.styles';
import { CustomMapData, DistrictListItem } from '../MapManager.constants';
import { ChevronLeft, ChevronRight, RefreshCw, Search, Sparkles, Map, Copy, Check } from 'lucide-react';

// ─── Cities Tab ───────────────────────────────────────────────────────────────

interface CitiesTabProps {
  cities: DistrictListItem[];
  loadingCities: boolean;
  citiesSearch: string;
  setCitiesSearch: (v: string) => void;
  citiesPage: number;
  setCitiesPage: (v: number) => void;
  citiesTotalPages: number;
  citiesTotalCount: number;
  handleSearchSubmit: (e: React.FormEvent) => void;
  openAssignModal: (d: DistrictListItem) => void;
}

export function CitiesTab({
  cities, loadingCities, citiesSearch, setCitiesSearch,
  citiesPage, setCitiesPage, citiesTotalPages, citiesTotalCount,
  handleSearchSubmit, openAssignModal,
}: CitiesTabProps) {
  return (
    <div style={styles.tableCard}>
      <div style={styles.tableToolbar}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchContainer}>
            <Search size={18} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="İlçe adı veya bağlı olduğu devlet ile ara..."
              value={citiesSearch}
              onChange={(e) => setCitiesSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button type="submit" style={styles.searchBtn}>Filtrele</button>
        </form>
        <div style={styles.resultCount}>Toplam: <strong>{citiesTotalCount}</strong> İlçe</div>
      </div>

      <div className="table-responsive">
        {loadingCities ? (
          <div style={styles.loadingSpinnerContainer}>
            <RefreshCw className="animate-spin" size={32} color="#3b82f6" />
            <span style={{ marginTop: '12px', color: '#94a3b8' }}>Veriler sorgulanıyor...</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>İlçe Adı</th>
                <th style={styles.th}>Bağlı Olduğu Devlet</th>
                <th style={styles.th}>İkametgah Eden Üye</th>
                <th style={styles.th}>Harita Durumu</th>
                <th style={styles.th}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {cities.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Arama sonucuna uygun ilçe bulunamadı.
                  </td>
                </tr>
              ) : (
                cities.map(d => (
                  <tr key={d.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{d.name}</td>
                    <td style={styles.td}>{d.provinceName}</td>
                    <td style={styles.td}>
                      <span style={styles.residenceCountBadge}>👥 {d.residentCount}</span>
                    </td>
                    <td style={styles.td}>
                      {d.assignedMapId ? (
                        <span style={styles.statusHasMap}>Haritası Var ({d.assignedMapName})</span>
                      ) : d.mapStatus.includes('Özel') ? (
                        <span style={styles.statusCustomMap}>Özel Harita</span>
                      ) : (
                        <span style={styles.statusNoMap}>Yok</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => openAssignModal(d)} style={styles.assignActionBtn}>
                        Harita Tanımla
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {citiesTotalPages > 1 && (
        <div style={styles.paginationContainer}>
          <button
            disabled={citiesPage === 1 || loadingCities}
            onClick={() => setCitiesPage(citiesPage - 1)}
            style={{ ...styles.pageBtn, opacity: (citiesPage === 1 || loadingCities) ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Önceki
          </button>
          <span style={styles.pageIndicator}>Sayfa {citiesPage} / {citiesTotalPages}</span>
          <button
            disabled={citiesPage === citiesTotalPages || loadingCities}
            onClick={() => setCitiesPage(citiesPage + 1)}
            style={{ ...styles.pageBtn, opacity: (citiesPage === citiesTotalPages || loadingCities) ? 0.4 : 1 }}
          >
            Sonraki <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Maps Tab ────────────────────────────────────────────────────────────────

interface MapsTabProps {
  customMaps: CustomMapData[];
  loadingMaps: boolean;
  enterDesignMode: (m: CustomMapData) => void;
  handleDeleteMap: (id: string) => void;
}

export function MapsTab({ customMaps, loadingMaps, enterDesignMode, handleDeleteMap }: MapsTabProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={styles.mapsGrid}>
      {loadingMaps ? (
        <div style={{ ...styles.loadingSpinnerContainer, gridColumn: '1 / -1', minHeight: '300px' }}>
          <RefreshCw className="animate-spin" size={32} color="#3b82f6" />
          <span style={{ marginTop: '12px', color: '#94a3b8' }}>Şablonlar yükleniyor...</span>
        </div>
      ) : customMaps.length === 0 ? (
        <div style={styles.emptyMapsBox}>
          <Sparkles size={48} color="#eab308" style={{ marginBottom: '16px' }} />
          <h3>Kayıtlı Harita Şablonu Bulunmuyor</h3>
          <p>Hemen sağ üstten "Harita Oluştur" diyerek izometrik tasarım yapmaya başlayın.</p>
        </div>
      ) : (
        customMaps.map(m => (
          <div key={m.id} style={{
            ...styles.mapCard,
            background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)',
            border: '1px solid rgba(148,163,184,0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
              <Map size={100} />
            </div>

            <div style={styles.mapCardHeader}>
              <div style={{
                ...styles.mapCardIcon,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                width: '40px', height: '40px',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37,99,235,0.3)'
              }}>
                <Map size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ ...styles.mapCardName, fontSize: '16px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    ID: {m.id.split('-')[0]}...
                  </div>
                  <button 
                    onClick={() => handleCopyId(m.id)}
                    title="Tam ID'yi Kopyala"
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px', 
                      display: 'flex', alignItems: 'center', color: copiedId === m.id ? '#10b981' : '#64748b',
                      transition: 'color 0.2s'
                    }}
                  >
                    {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  {copiedId === m.id && <span style={{ fontSize: '10px', color: '#10b981' }}>Kopyalandı</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', margin: '16px 0', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grid Boyutu</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>{m.gridSize}x{m.gridSize}</span>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Obje Sayısı</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>{m.gridCells?.filter(c => c.type !== 'grass' && c.isBuildingPivot !== false).length || 0}</span>
              </div>
            </div>

            <div style={{ ...styles.mapCardFooter, gap: '8px', marginTop: 'auto' }}>
              <button 
                onClick={() => enterDesignMode(m)} 
                style={{
                  ...styles.designBtn,
                  flex: 2,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Tasarla
              </button>
              <button 
                onClick={() => handleDeleteMap(m.id)} 
                style={{
                  ...styles.deleteBtn,
                  flex: 1,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  padding: '10px',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              >
                Sil
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
