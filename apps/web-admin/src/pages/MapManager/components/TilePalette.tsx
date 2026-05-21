import React, { useRef, useEffect } from 'react';
import { mapManagerStyles as styles } from '../MapManager.styles';
import { ModelAsset, ModelCategory, ActiveTool, PickedUpItem, GridCell } from '../MapManager.constants';
import { Plus, Info, Package, Wrench, MousePointerClick } from 'lucide-react';

// PaletteGLBViewer component definition ...
interface PaletteGLBViewerProps {
  src: string;
  alt: string;
  textureUrl: string | null;
}

const PaletteGLBViewer: React.FC<PaletteGLBViewerProps> = ({ src, alt, textureUrl }) => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let active = true;

    const applyTexture = async () => {
      if (!textureUrl) return;
      try {
        const materials = viewer.model?.materials;
        if (materials && materials.length > 0) {
          const texture = await viewer.createTexture(textureUrl);
          if (!active) return;
          for (const mat of materials) {
            if (mat.pbrMetallicRoughness?.baseColorTexture) {
              await mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        }
      } catch (err) {
        console.error("Error applying texture in PaletteGLBViewer:", err);
      }
    };

    // Apply immediately if already loaded
    if (viewer.loaded || (viewer.model && viewer.model.materials && viewer.model.materials.length > 0)) {
      applyTexture();
    }

    const handleLoad = () => {
      applyTexture();
    };

    viewer.addEventListener('load', handleLoad);
    return () => {
      active = false;
      viewer.removeEventListener('load', handleLoad);
    };
  }, [textureUrl, src]);

  return (
    // @ts-ignore
    <model-viewer
      ref={viewerRef}
      src={src}
      alt={alt}
      auto-rotate
      camera-controls
      shadow-intensity="1"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

// Base (infrastructure) tiles — always available
const BASE_TILES = [
  { id: 'grass',  label: 'Temiz Çimen',  desc: 'Çorak yeşil arazi.',           color: '#15803d' },
  { id: 'road_h', label: 'Yatay Yol',    desc: 'Sol-alt → sağ-üst yol şeridi.',color: '#334155' },
  { id: 'road_v', label: 'Dikey Yol',    desc: 'Sol-üst → sağ-alt yol şeridi.',color: '#475569' },
  { id: 'road_x', label: 'Kavşak',       desc: 'Dört yönlü yol bağlantısı.',   color: '#1e293b' },
  { id: 'forest', label: 'Ağaç / Orman', desc: 'Çam ve Meşe ağaç grubu.',      color: '#065f46' },
];

interface TilePaletteProps {
  activeTool: ActiveTool;
  setActiveTool: (t: ActiveTool) => void;
  setPickedUpItem: (v: PickedUpItem | null) => void;
  pickedUpItem: PickedUpItem | null;
  activeTileType: string;
  setActiveTileType: (v: string) => void;
  activePaletteCategory: string;
  setActivePaletteCategory: (v: string) => void;
  modelCategories: ModelCategory[];
  modelAssets: ModelAsset[];
  selectedCell: GridCell | null;
  setSelectedCell: (v: GridCell | null) => void;
  updateSelectedCellProperties: (updates: Partial<GridCell>) => void;
}

export function TilePalette({
  activeTool, setActiveTool, setPickedUpItem,
  pickedUpItem, activeTileType, setActiveTileType,
  activePaletteCategory, setActivePaletteCategory,
  modelCategories, modelAssets,
  selectedCell, setSelectedCell,
  updateSelectedCellProperties,
}: TilePaletteProps) {
  const [activeDetailTab, setActiveDetailTab] = React.useState<'dimensions' | 'properties'>('dimensions');

  return (
    <div style={styles.paletteCard}>
      <h4 style={styles.sectionHeading}>Düzenleme Modu</h4>

      {/* ── TOOL BUTTONS ─────────────────────────────────────────────── */}
      <div style={styles.toolGrid}>
        {[
          { key: 'select', label: 'Seç',    icon: <MousePointerClick size={13} style={{ marginRight: '3px' }} /> },
          { key: 'place',  label: 'Ekle',   icon: <Plus   size={13} style={{ marginRight: '3px' }} /> },
        ].map(btn => (
          <button
            key={btn.key}
            onClick={() => { setActiveTool(btn.key as ActiveTool); setPickedUpItem(null); }}
            style={{
              ...styles.toolBtn,
              backgroundColor: activeTool === btn.key
                ? (btn.key === 'select' ? '#a855f7' : '#2563eb')
                : '#1e293b',
              color: '#ffffff',
              borderColor: activeTool === btn.key
                ? (btn.key === 'select' ? '#c084fc' : '#3b82f6')
                : 'rgba(255,255,255,0.06)',
            }}
          >
            {btn.icon}{btn.label}
          </button>
        ))}
      </div>

      {/* Select mode hints & details */}
      {activeTool === 'select' && selectedCell && (() => {
        const isBuilding = selectedCell.type === 'building';
        const bAsset = isBuilding && selectedCell.buildingId
          ? modelAssets.find(a => a.id === selectedCell.buildingId)
          : null;
        
        const titleName = bAsset
          ? bAsset.name
          : selectedCell.type === 'road'
            ? 'Yol Şeridi'
            : selectedCell.type === 'forest'
              ? 'Orman / Ağaçlık'
              : 'Çimenlik Alan';

        const currentScale = selectedCell.scale ?? bAsset?.scale ?? 1;
        const currentSizeX = selectedCell.sizeX ?? bAsset?.gridSizeX ?? 1;
        const currentSizeY = selectedCell.sizeY ?? bAsset?.gridSizeY ?? 1;

        return (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Tab Headers */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '8px' }}>
              <button
                onClick={() => setActiveDetailTab('dimensions')}
                style={{
                  flex: 1, padding: '6px', fontSize: '11px', fontWeight: 'bold', borderRadius: '6px',
                  backgroundColor: activeDetailTab === 'dimensions' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  color: activeDetailTab === 'dimensions' ? '#e9d5ff' : '#94a3b8',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Boyutlar
              </button>
              <button
                onClick={() => setActiveDetailTab('properties')}
                style={{
                  flex: 1, padding: '6px', fontSize: '11px', fontWeight: 'bold', borderRadius: '6px',
                  backgroundColor: activeDetailTab === 'properties' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  color: activeDetailTab === 'properties' ? '#e9d5ff' : '#94a3b8',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Özellikler
              </button>
            </div>

            {/* TAB 1: Boyutlar */}
            {activeDetailTab === 'dimensions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {selectedCell.type === 'building' ? '🏢' : selectedCell.type === 'road' ? '🛣️' : '🌲'}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {titleName}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Koordinat (Hücre): X:{selectedCell.col} Y:{selectedCell.row}
                    </span>
                  </div>
                </div>

                {isBuilding && bAsset ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Kapladığı Izgara (Tile) Alanı {bAsset.isResizable === false && '(Sabit)'}:
                        </span>
                        {bAsset.isResizable !== false ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                              <span style={{ fontSize: '10px' }}>X (Genişlik):</span>
                              <input
                                type="number" min="1" max="10"
                                value={currentSizeX}
                                onChange={(e) => updateSelectedCellProperties({ sizeX: parseInt(e.target.value) || 1 })}
                                style={{ flex: 1, width: '0', padding: '4px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }}
                              />
                            </div>
                            <span style={{ color: '#64748b', fontSize: '10px' }}>çarpı</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                              <span style={{ fontSize: '10px' }}>Y (Derinlik):</span>
                              <input
                                type="number" min="1" max="10"
                                value={currentSizeY}
                                onChange={(e) => updateSelectedCellProperties({ sizeY: parseInt(e.target.value) || 1 })}
                                style={{ flex: 1, width: '0', padding: '4px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, padding: '4px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                              {currentSizeX}
                            </div>
                            <span style={{ color: '#64748b', fontSize: '10px' }}>çarpı</span>
                            <div style={{ flex: 1, padding: '4px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                              {currentSizeY}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Yön (Rotation):</span>
                        <span style={{ color: '#eab308', fontWeight: 'bold' }}>{selectedCell.buildingRotation || 0}°</span>
                      </div>
                    </div>

                    {/* Scale Adjustment */}
                    <div style={{ marginTop: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                        <span>Genel Ölçek (Scale)</span>
                        <input
                          type="number" min="0.1" max="5" step="0.01"
                          value={currentScale}
                          onChange={(e) => updateSelectedCellProperties({ scale: parseFloat(e.target.value) || 1 })}
                          style={{ width: '60px', padding: '3px 6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '4px', textAlign: 'right' }}
                        />
                      </div>
                      <input
                        type="range" min="0.5" max="3" step="0.01"
                        value={currentScale}
                        onChange={(e) => updateSelectedCellProperties({ scale: parseFloat(e.target.value) })}
                        style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                      />
                      
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Esnetme (Non-Uniform Scale)</span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: '#f87171', textAlign: 'center' }}>X (Genişlik)</span>
                            <input
                              type="number" min="0.1" max="5" step="0.01"
                              value={selectedCell.scaleX ?? 1}
                              onChange={(e) => updateSelectedCellProperties({ scaleX: parseFloat(e.target.value) || 1 })}
                              style={{ width: '100%', padding: '3px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '4px', textAlign: 'center' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: '#4ade80', textAlign: 'center' }}>Y (Yükseklik)</span>
                            <input
                              type="number" min="0.1" max="5" step="0.01"
                              value={selectedCell.scaleY ?? 1}
                              onChange={(e) => updateSelectedCellProperties({ scaleY: parseFloat(e.target.value) || 1 })}
                              style={{ width: '100%', padding: '3px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '4px', textAlign: 'center' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '9px', color: '#60a5fa', textAlign: 'center' }}>Z (Derinlik)</span>
                            <input
                              type="number" min="0.1" max="5" step="0.01"
                              value={selectedCell.scaleZ ?? 1}
                              onChange={(e) => updateSelectedCellProperties({ scaleZ: parseFloat(e.target.value) || 1 })}
                              style={{ width: '100%', padding: '3px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '4px', textAlign: 'center' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                    Bu nesne boyutlandırılamaz.
                  </span>
                )}
              </div>
            )}

            {/* TAB 2: Özellikler */}
            {activeDetailTab === 'properties' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Interaction Setup */}
                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#e9d5ff', display: 'block', marginBottom: '8px' }}>Etkileşim Tetikleyicisi</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Eylem Türü (Tıklayınca):</span>
                      <select
                        value={selectedCell.actionType || 'none'}
                        onChange={(e) => updateSelectedCellProperties({ actionType: e.target.value as any, actionTarget: '' })}
                        style={{ width: '100%', padding: '6px', fontSize: '11px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '6px', outline: 'none' }}
                      >
                        <option value="none">Hiçbiri (Sadece Dekor)</option>
                        <option value="navigate_map">Başka Haritaya/Bölgeye Git</option>
                        <option value="open_modal">Bilgi/Yönetim Ekranı Aç</option>
                      </select>
                    </div>

                    {(selectedCell.actionType === 'navigate_map' || selectedCell.actionType === 'open_modal') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {selectedCell.actionType === 'navigate_map' ? 'Hedef Harita ID:' : 'Açılacak Ekran ID/Adı:'}
                        </span>
                        <input
                          type="text"
                          placeholder={selectedCell.actionType === 'navigate_map' ? "Örn: map_123" : "Örn: market_menu"}
                          value={selectedCell.actionTarget || ''}
                          onChange={(e) => updateSelectedCellProperties({ actionTarget: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '11px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '6px', outline: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Common Action */}
            <button
              onClick={() => setSelectedCell(null)}
              style={{
                marginTop: '4px', padding: '6px', borderRadius: '6px', fontSize: '11px',
                backgroundColor: 'transparent', border: 'none',
                color: '#64748b', cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              Seçimi Kapat
            </button>
          </div>
        );
      })()}

      {activeTool === 'select' && !selectedCell && (
        <div style={styles.infoBox}>
          <Info size={14} style={{ color: '#a855f7', marginRight: '6px', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Seçmek, döndürmek veya taşımak istediğiniz bir nesneye tıklayın.
          </span>
        </div>
      )}

      {/* Move mode hint */}
      {activeTool === 'move' && (
        <div style={styles.infoBox}>
          <Info size={14} style={{ color: '#60a5fa', marginRight: '6px', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {pickedUpItem
              ? `Taşınıyor: ${pickedUpItem.buildingId ? 'Bina/Model' : 'Yol / Ağaç'}. Hedef hücreye tıklayın.`
              : 'Taşımak istediğiniz nesneye tıklayarak alın.'}
          </span>
        </div>
      )}

      {/* ── PLACE PALETTE ────────────────────────────────────────────── */}
      {activeTool === 'place' && (
        <>
          <div style={styles.divider} />

          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {/* Always show base infrastructure tab */}
            <button
              onClick={() => { setActivePaletteCategory('base'); setActiveTileType('road_h'); }}
              style={{
                padding: '5px 11px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold',
                backgroundColor: activePaletteCategory === 'base' ? '#2563eb' : 'rgba(255,255,255,0.04)',
                color: activePaletteCategory === 'base' ? '#ffffff' : '#94a3b8',
                border: `1px solid ${activePaletteCategory === 'base' ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Wrench size={11} /> Altyapı & Doğa
            </button>

            {/* DB categories */}
            {modelCategories.map(cat => {
              const count = modelAssets.filter(a => a.categoryId === cat.id).length;
              const isActive = activePaletteCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActivePaletteCategory(cat.id);
                    const catAssets = modelAssets.filter(a => a.categoryId === cat.id);
                    // Select first DB asset in this category (no hardcoded fallback)
                    setActiveTileType(catAssets.length > 0 ? catAssets[0].id : '');
                  }}
                  style={{
                    padding: '5px 11px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold',
                    backgroundColor: isActive ? '#a855f7' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    border: `1px solid ${isActive ? '#c084fc' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}
                >
                  <Package size={11} />
                  {cat.name}
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* ── BASE TILES ────────────────────────────── */}
          {activePaletteCategory === 'base' && (
            <>
              <h4 style={styles.sectionHeading}>Altyapı ve Araziler</h4>
              <div style={styles.tileList}>
                {BASE_TILES.map(tile => (
                  <div
                    key={tile.id}
                    onClick={() => setActiveTileType(tile.id)}
                    style={{
                      ...styles.tileSelector,
                      backgroundColor: activeTileType === tile.id ? 'rgba(59, 130, 246, 0.10)' : 'transparent',
                      borderColor: activeTileType === tile.id ? '#2563eb' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ ...styles.colorPreview, backgroundColor: tile.color }} />
                    <div>
                      <span style={styles.tileName}>{tile.label}</span>
                      <p style={styles.tileDesc}>{tile.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── DB CATEGORY ASSETS (only from DB, no hardcoded buildings) ── */}
          {activePaletteCategory !== 'base' && (() => {
            const cat = modelCategories.find(c => c.id === activePaletteCategory);
            const catAssets = modelAssets.filter(a => a.categoryId === activePaletteCategory);

            return (
              <>
                <h4 style={styles.sectionHeading}>{cat?.name || 'Modeller'}</h4>
                <div style={{ ...styles.tileList, maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
                  {catAssets.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                      Bu kategoride henüz model yüklenmemiş.<br />
                      <span style={{ color: '#64748b' }}>Model Yönetimi sayfasından ekleyebilirsiniz.</span>
                    </div>
                  ) : (
                    catAssets.map(a => {
                      const isSelected = activeTileType === a.id;
                      return (
                        <div
                          key={a.id}
                          onClick={() => setActiveTileType(a.id)}
                          style={{
                            ...styles.tileSelector,
                            backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.10)' : 'transparent',
                            borderColor: isSelected ? '#a855f7' : 'rgba(255,255,255,0.04)',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: '0',
                            padding: '10px',
                          }}
                        >
                          {/* Asset info row */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* Texture thumbnail or icon */}
                            {a.textureUrl ? (
                              <img
                                src={a.textureUrl}
                                alt={a.name}
                                style={{
                                  width: '36px', height: '36px', borderRadius: '6px',
                                  objectFit: 'cover', flexShrink: 0,
                                  border: '1px solid rgba(255,255,255,0.08)',
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '6px',
                                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', flexShrink: 0,
                              }}>
                                📦
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={styles.tileName}>{a.name}</span>
                              <p style={{ ...styles.tileDesc, margin: '2px 0 0 0' }}>
                                {a.modelType.toUpperCase()} · {a.gridSizeX}x{a.gridSizeY} hücre · ölçek {a.scale}
                              </p>
                            </div>
                          </div>

                          {/* model-viewer preview when selected & GLB */}
                          {isSelected && a.modelType === 'glb' && (
                            <div style={{
                              height: '140px',
                              backgroundColor: 'rgba(2, 8, 20, 0.9)',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              marginTop: '10px',
                              border: '1px solid rgba(168, 85, 247, 0.2)',
                            }}>
                              <PaletteGLBViewer
                                src={a.fileUrl}
                                alt={a.name}
                                textureUrl={a.textureUrl || null}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
