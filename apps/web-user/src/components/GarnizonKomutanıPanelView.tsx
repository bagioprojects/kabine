import React from 'react';
import { GlassCard } from './GlassCard';

interface GarnizonKomutanıPanelViewProps {
  activeKomutanTab: 'military' | 'alarm';
  alarmLevel: 'NORMAL' | 'SARI' | 'KIRMIZI';
  setAlarmLevel: React.Dispatch<React.SetStateAction<'NORMAL' | 'SARI' | 'KIRMIZI'>>;
  deployments: any[];
  setDeployments: React.Dispatch<React.SetStateAction<any[]>>;
  addLog: (msg: string) => void;
}

export const GarnizonKomutanıPanelView: React.FC<GarnizonKomutanıPanelViewProps> = ({
  activeKomutanTab,
  alarmLevel,
  setAlarmLevel,
  deployments,
  setDeployments,
  addLog
}) => {
  return (
    <GlassCard style={{ borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        🎖️ Garnizon Komutanı Askeri Karargahı
      </h2>

      {activeKomutanTab === 'military' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white' }}>🛡️ Sınır Güvenliği ve Askeri Sevk Bilgileri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deployments.map(dep => (
              <div key={dep.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ color: 'white' }}>{dep.border}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{dep.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Konuşlu Birlikler: {dep.forceSize}</div>
                <button
                  onClick={() => {
                    setDeployments(prev => prev.map(d => d.id === dep.id ? { ...d, forceSize: (parseInt(d.forceSize.replace(/[^0-9]/g, '')) + 500).toLocaleString('tr-TR') + ' Asker' } : d));
                    addLog(`🛡️ Askeri Karargah: ${dep.border} bölgesine ek takviye sevk edildi.`);
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: '0.5rem' }}
                >
                  Destek Birliği Sevk Et
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeKomutanTab === 'alarm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white' }}>🚨 Alarm Seviyesi Kontrol Odası</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['NORMAL', 'SARI', 'KIRMIZI'].map(level => (
              <button
                key={level}
                onClick={() => {
                  setAlarmLevel(level as any);
                  addLog(`🚨 ALARM SEVİYESİ GÜNCELLENDİ: ${level}`);
                }}
                className={alarmLevel === level ? 'btn-danger' : 'btn-secondary'}
                style={{ padding: '0.75rem', fontWeight: 700, flex: 1 }}
              >
                {level}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            Mevcut durum: <strong>{alarmLevel}</strong>. Sarı ve Kırmızı alarm durumlarında askeri güvenlik devriyeleri artırılır.
          </p>
        </div>
      )}
    </GlassCard>
  );
};
