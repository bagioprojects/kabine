import React from 'react';
import { styles } from '../ModelManager.styles';
import { ModelAsset, ModelCategory } from '../ModelManager.hooks';
import { RefreshCw, Save, Trash2, Info } from 'lucide-react';

interface EditModalProps {
  editingAsset: ModelAsset | null;
  categories: ModelCategory[];
  editAssetName: string;
  setEditAssetName: (val: string) => void;
  editCategoryId: string;
  setEditCategoryId: (val: string) => void;
  editGridSizeX: number;
  setEditGridSizeX: (val: number) => void;
  editGridSizeY: number;
  setEditGridSizeY: (val: number) => void;
  editScale: number;
  setEditScale: (val: number) => void;
  editIsResizable: boolean;
  setEditIsResizable: (val: boolean) => void;
  editThumbnailUrl: string;
  setEditThumbnailUrl: (val: string) => void;
  setEditModelFile: (file: File | null) => void;
  setEditTextureFile: (file: File | null) => void;
  removeTexture: boolean;
  setRemoveTexture: (val: boolean) => void;
  savingEdit: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  editingAsset,
  categories,
  editAssetName,
  setEditAssetName,
  editCategoryId,
  setEditCategoryId,
  editGridSizeX,
  setEditGridSizeX,
  editGridSizeY,
  setEditGridSizeY,
  editScale,
  setEditScale,
  editIsResizable,
  setEditIsResizable,
  editThumbnailUrl,
  setEditThumbnailUrl,
  setEditModelFile,
  setEditTextureFile,
  removeTexture,
  setRemoveTexture,
  savingEdit,
  onClose,
  onSubmit,
}) => {
  if (!editingAsset) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Modeli Düzenle: {editingAsset.name}</h3>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...styles.modalBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Kategori</label>
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                style={styles.select}
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Model Adı</label>
              <input
                type="text"
                value={editAssetName}
                onChange={(e) => setEditAssetName(e.target.value)}
                placeholder="Model Adı"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.gridParamsRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Grid Genişliği (X)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editGridSizeX}
                  onChange={(e) => setEditGridSizeX(Number(e.target.value))}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Grid Derinliği (Y)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editGridSizeY}
                  onChange={(e) => setEditGridSizeY(Number(e.target.value))}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Ölçek (Scale)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="10.0"
                  value={editScale}
                  onChange={(e) => setEditScale(Number(e.target.value))}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={{ ...styles.inputGroup, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="editIsResizable"
                checked={editIsResizable}
                onChange={(e) => setEditIsResizable(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#38bdf8' }}
              />
              <label htmlFor="editIsResizable" style={{ ...styles.label, marginBottom: 0, cursor: 'pointer' }}>
                Haritada Boyutlandırılabilir (Resizable)
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>İzometrik Sprite URL (thumbnailUrl)</label>
              <input
                type="text"
                value={editThumbnailUrl}
                onChange={(e) => setEditThumbnailUrl(e.target.value)}
                placeholder="Örn: https://example.com/sprite.png"
                style={styles.input}
              />
              <div style={styles.fileHint}>Mobil uygulamada görünmesi için 2.5D İzometrik PNG resmi URL'si.</div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Yeni Model Dosyası (Değiştirmek için seçin - .glb, .fbx, .obj)</label>
              <input
                type="file"
                accept=".glb,.fbx,.obj"
                onChange={(e) => setEditModelFile(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              <div style={styles.fileHint}>Mevcut modeli değiştirmek istemiyorsanız boş bırakın.</div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Yeni Kaplama Doku Dosyası (İsteğe Bağlı)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setEditTextureFile(e.target.files?.[0] || null);
                  setRemoveTexture(false);
                }}
                disabled={removeTexture}
                style={styles.fileInput}
              />
              <div style={styles.fileHint}>Mevcut dokuyu değiştirmek istemiyorsanız boş bırakın.</div>
            </div>

            {editingAsset.textureUrl && !removeTexture && (
              <button
                type="button"
                onClick={() => {
                  setRemoveTexture(true);
                  setEditTextureFile(null);
                }}
                style={styles.textureDeleteBtn}
              >
                <Trash2 size={12} />
                Mevcut Kaplamayı Kaldır
              </button>
            )}

            {removeTexture && (
              <div style={{ ...styles.alert, ...styles.alertError, marginTop: '8px' }}>
                <Info size={14} />
                <span>Mevcut kaplama görseli silinecek. Vazgeçmek için yeni kaplama dosyası seçebilirsiniz.</span>
              </div>
            )}
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              style={styles.modalCancelBtn}
              disabled={savingEdit}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              style={{
                ...styles.modalSubmitBtn,
                backgroundColor: savingEdit ? '#1e293b' : '#2563eb',
              }}
            >
              {savingEdit ? (
                <>
                  <RefreshCw className="animate-spin" size={14} style={{ marginRight: '6px', display: 'inline-block' }} />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={14} style={{ marginRight: '6px', display: 'inline-block' }} />
                  Güncelle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
