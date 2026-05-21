import React, { useState, useEffect, useRef } from 'react';
import { styles } from '../ModelManager.styles';
import { ModelAsset } from '../ModelManager.hooks';
import { FileText, Pencil, Trash2, Eye } from 'lucide-react';

interface ModelViewerWrapperProps {
  src: string;
  alt: string;
  textureUrl: string | null;
}

const ModelViewerWrapper: React.FC<ModelViewerWrapperProps> = ({ src, alt, textureUrl }) => {
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
        console.error("Error applying texture to model-viewer in card:", err);
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
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
};

interface AssetCardProps {
  asset: ModelAsset;
  onEdit: (asset: ModelAsset) => void;
  onDelete: (id: string, name: string) => void;
  onPreview: (asset: ModelAsset) => void;
}

export const AssetCard = React.memo<AssetCardProps>(({ asset, onEdit, onDelete, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        ...styles.assetCard,
        transform: isHovered ? 'translateY(-2px)' : 'none',
        borderColor: isHovered ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.assetCardPreview}>
        <div style={styles.assetFormatBadge}>
          <span>{asset.modelType.toUpperCase()}</span>
          {asset.modelType === 'glb' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(asset);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 2px',
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              title="Detaylı 3D Önizleme"
            >
              <Eye size={11} />
            </button>
          )}
        </div>

        {asset.modelType === 'glb' ? (
          isHovered ? (
            <ModelViewerWrapper
              src={`http://localhost:3000${asset.fileUrl}`}
              alt={asset.name}
              textureUrl={asset.textureUrl ? `http://localhost:3000${asset.textureUrl}` : null}
            />
          ) : (
            <div style={styles.hoverPromptContainer}>
              <div style={styles.assetLogo}>📦</div>
              <span style={styles.hoverPromptText}>Önizlemek için üzerine gelin</span>
            </div>
          )
        ) : (
          <div style={styles.assetLogo}>📦</div>
        )}
      </div>
      
      <div style={styles.assetCardDetails}>
        <h4 style={styles.assetNameText}>{asset.name}</h4>
        
        <div style={styles.assetSpecs}>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Hücre Alanı:</span>
            <span style={styles.specValue}>{asset.gridSizeX}x{asset.gridSizeY}</span>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Ölçek:</span>
            <span style={styles.specValue}>{asset.scale.toFixed(2)}</span>
          </div>
          <div style={styles.specItem}>
            <span style={styles.specLabel}>Model Dosya:</span>
            <a href={`http://localhost:3000${asset.fileUrl}`} target="_blank" rel="noreferrer" style={styles.fileLink}>
              <FileText size={11} style={{ marginRight: '2px' }} /> İndir
            </a>
          </div>
          {asset.textureUrl && (
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Kaplama:</span>
              <a href={`http://localhost:3000${asset.textureUrl}`} target="_blank" rel="noreferrer" style={styles.fileLink}>
                Görsel
              </a>
            </div>
          )}
        </div>

        <div style={styles.assetCardFooter}>
          <button 
            onClick={() => onEdit(asset)}
            style={styles.editAssetBtn}
          >
            <Pencil size={11} />
            Düzenle
          </button>
          <button 
            onClick={() => onDelete(asset.id, asset.name)}
            style={styles.deleteAssetBtn}
          >
            <Trash2 size={11} />
            Kaldır
          </button>
        </div>
      </div>
    </div>
  );
});
