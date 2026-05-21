import React from 'react';
import { mapManagerStyles as styles } from '../MapManager.styles';
import { CustomMapData, DistrictListItem } from '../MapManager.constants';

// ─── Create Map Modal ────────────────────────────────────────────────────────

interface CreateMapModalProps {
  newMapName: string;
  setNewMapName: (v: string) => void;
  newMapGridSize: number;
  setNewMapGridSize: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CreateMapModal({
  newMapName, setNewMapName, newMapGridSize, setNewMapGridSize, onSubmit, onClose,
}: CreateMapModalProps) {
  return (
    <div style={styles.modalOverlay}>
      <form onSubmit={onSubmit} style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Yeni Harita Şablonu Oluştur</h3>

        <div style={styles.formGroup}>
          <label style={styles.label}>Harita Adı</label>
          <input
            type="text"
            placeholder="Örn: Organize Sanayi Bölgesi, Sahil Şeridi..."
            value={newMapName}
            onChange={(e) => setNewMapName(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Blok Sayısı (Izgara Boyutu)</label>
          <select
            value={newMapGridSize}
            onChange={(e) => setNewMapGridSize(Number(e.target.value))}
            style={styles.selectInput}
          >
            <option value={10}>10 x 10 Blok (Standart)</option>
            <option value={15}>15 x 15 Blok (Orta)</option>
            <option value={20}>20 x 20 Blok (Geniş)</option>
          </select>
        </div>

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>İptal Et</button>
          <button type="submit" style={styles.submitBtn}>Şablon Oluştur</button>
        </div>
      </form>
    </div>
  );
}

// ─── Assign Map Modal ────────────────────────────────────────────────────────

interface AssignMapModalProps {
  district: DistrictListItem;
  customMaps: CustomMapData[];
  assigningMapId: string;
  setAssigningMapId: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function AssignMapModal({
  district, customMaps, assigningMapId, setAssigningMapId, onSave, onClose,
}: AssignMapModalProps) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>{district.name} Haritasını Tanımla</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
          İlçe: <strong>{district.name} ({district.provinceName})</strong>
        </p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Atanacak Harita Şablonu</label>
          <select
            value={assigningMapId}
            onChange={(e) => setAssigningMapId(e.target.value)}
            style={styles.selectInput}
          >
            <option value="">Yok (Harita Devre Dışı)</option>
            {customMaps.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.gridSize}x{m.gridSize})</option>
            ))}
          </select>
        </div>

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.cancelBtn}>İptal</button>
          <button type="button" onClick={onSave} style={styles.submitBtn}>Atamayı Kaydet</button>
        </div>
      </div>
    </div>
  );
}
