import React, { useRef, useEffect, useState } from 'react';
import { styles } from '../ModelManager.styles';
import { ModelAsset } from '../ModelManager.hooks';
import { X, Box, Camera } from 'lucide-react';

interface PreviewModalProps {
  asset: ModelAsset | null;
  onClose: () => void;
  onUpdateAsset?: (updated: ModelAsset) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ asset, onClose, onUpdateAsset }) => {
  const viewerRef = useRef<any>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!asset || !asset.textureUrl) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = async () => {
      if (!asset.textureUrl) return;
      try {
        const materials = viewer.model?.materials;
        if (materials && materials.length > 0) {
          const texture = await viewer.createTexture(`http://localhost:3000${asset.textureUrl}`);
          for (const mat of materials) {
            if (mat.pbrMetallicRoughness?.baseColorTexture) {
              await mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        }
      } catch (err) {
        console.error("Error applying texture to model-viewer inside preview:", err);
      }
    };

    viewer.addEventListener('load', handleLoad);
    return () => {
      viewer.removeEventListener('load', handleLoad);
    };
  }, [asset]);

  const handleCaptureSprite = async () => {
    if (!viewerRef.current || !asset) return;
    setCapturing(true);
    try {
      const base64Data = viewerRef.current.toDataURL('image/png');
      
      const formData = new FormData();
      formData.append('thumbnailUrl', base64Data);
      
      const response = await fetch(`http://localhost:3000/api/v1/admin/model-assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        if (onUpdateAsset) {
          onUpdateAsset(result.data);
        }
        alert('Mobil sprite başarıyla oluşturuldu ve kaydedildi!');
      } else {
        alert('Sprite kaydedilirken hata: ' + (result.error || result.message));
      }
    } catch (err: any) {
      console.error('Capture sprite error:', err);
      alert('Ekran görüntüsü alınırken hata oluştu: ' + err.message);
    } finally {
      setCapturing(false);
    }
  };

  if (!asset) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ ...styles.modalTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={18} color="#eab308" />
            3D Model Detaylı Önizleme: {asset.name}
          </h3>
          <button onClick={onClose} style={styles.catActionBtn}>
            <X size={18} color="#94a3b8" />
          </button>
        </div>
        <div style={styles.previewViewport}>
          {asset.modelType === 'glb' ? (
            // @ts-ignore
            <model-viewer
              ref={viewerRef}
              src={`http://localhost:3000${asset.fileUrl}`}
              alt={asset.name}
              auto-rotate
              camera-controls
              shadow-intensity="1.5"
              exposure="1.0"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
              <span style={{ fontSize: '48px' }}>📦</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>FBX/OBJ formatları tarayıcıda doğrudan önizlenemez.</span>
            </div>
          )}
        </div>
        <div style={styles.previewDetailsRow}>
          <div>
            <span style={styles.previewTitle}>{asset.name}</span>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              ID: {asset.id} | Kategori: {asset.category?.name || 'Bilinmeyen'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {asset.modelType === 'glb' && (
              <button
                onClick={handleCaptureSprite}
                disabled={capturing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: capturing ? '#1e293b' : '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: capturing ? 'not-allowed' : 'pointer',
                  boxShadow: capturing ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Camera size={12} />
                {capturing ? 'Kaydediliyor...' : 'Mobil Sprite Oluştur'}
              </button>
            )}
            <span style={styles.previewBadge}>
              Hücre Boyutu: {asset.gridSizeX}x{asset.gridSizeY}
            </span>
            <span style={styles.previewBadge}>
              Ölçek: {asset.scale.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
