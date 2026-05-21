import React from 'react';
import { styles } from '../ModelManager.styles';
import { HelpCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.infoModalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ ...styles.modalTitle, display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
            <HelpCircle size={18} />
            Kaplama (Texture) Entegrasyon Rehberi
          </h3>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.infoSection}>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 10px 0' }}>
              Modelinizin düzgün renklerle, detaylarla ve kaplamalarla görünmesi için 3D yazılımlardan (örneğin Blender) doğru şekilde dışa aktarılması gerekmektedir. Eğer modeliniz düz beyaz veya renksiz gözüküyorsa aşağıdaki yöntemleri inceleyebilirsiniz.
            </p>

            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>
                <span style={{ fontSize: '14px' }}>📦</span> 1. Gömülü Kaplamalar (Embedded GLB)
              </h4>
              <p style={styles.infoCardText}>
                Model kaplamalarını tek bir <span style={styles.infoCode}>.glb</span> dosyasının içine gömmek en pratik yöntemdir. Blender'dan ihraç ederken:
                <br />
                <span style={{ display: 'block', margin: '4px 0 0 10px', color: '#fbbf24' }}>
                  • <strong>File &gt; Export &gt; glTF 2.0 (.glb)</strong> yolunu izleyin.
                  <br />
                  • Sağ paneldeki <strong>Data &gt; Images</strong> ayarını <strong>"Embed"</strong> (veya <strong>Automatic</strong>) olarak seçin.
                </span>
              </p>
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>
                <span style={{ fontSize: '14px' }}>🎨</span> 2. Uyumlu Materyal & Shader Kurulumu
              </h4>
              <p style={styles.infoCardText}>
                Oyun motorunun kaplamayı tanıyabilmesi için Blender materyalinde standart <strong>"Principled BSDF"</strong> shader'ı kullanılmalıdır:
                <br />
                <span style={{ display: 'block', margin: '4px 0 0 10px', color: '#fbbf24' }}>
                  • Shader Editöründe <strong>Image Texture</strong> düğümünün <strong>Color</strong> çıkışını, <strong>Principled BSDF</strong> düğümünün <strong>Base Color</strong> girişine bağlayın.
                  <br />
                  • Başka karmaşık shader düğümleri (mix shader, custom ramp vb.) glTF formatında desteklenmemektedir.
                </span>
              </p>
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>
                <span style={{ fontSize: '14px' }}>🖼️</span> 3. Harici Kaplama (Texture) Yükleme
              </h4>
              <p style={styles.infoCardText}>
                Kaplamaları dosya içine gömmekte sorun yaşıyorsanız, modeli dokusuz yükleyip görsel kaplamasını bu alandan <span style={styles.infoCode}>.png</span>, <span style={styles.infoCode}>.jpg</span> veya <span style={styles.infoCode}>.webp</span> olarak harici yükleyin.
                <br />
                <span style={{ display: 'block', margin: '4px 0 0 10px', color: '#fbbf24' }}>
                  • Sistem, 3D önizlemede ve şehir haritası üzerinde kaplamayı modelinize kodsal olarak giydirecek, böylece 3D haritada tam özellikleriyle görüntülenecektir.
                </span>
              </p>
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.modalSubmitBtn}>
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
