import React from 'react';
import { Terminal } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ConsoleViewProps {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  addLog: (msg: string) => void;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({ logs, setLogs, addLog }) => {
  return (
    <GlassCard style={{
      background: 'rgba(10, 15, 25, 0.95)',
      borderLeft: '4px solid hsl(var(--accent-purple))',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      minHeight: '550px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Terminal style={{ color: 'hsl(var(--accent-purple))' }} /> Canlı Sistem Konsolu
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => {
              addLog("📡 Sistem tanılaması başlatıldı: Tüm servisler aktif.");
              addLog("📈 Yapay Zeka: Maden ve fabrika üretim verimlilikleri hesaplanıyor...");
            }} 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Servis Testi Çalıştır
          </button>
          <button 
            onClick={() => setLogs(['[Sistem] Konsol temizlendi.'])} 
            className="btn-danger" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Konsolu Temizle
          </button>
        </div>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
        Bu ekran, karakterinizin yaptığı seyahatleri, gerçekleştirdiğiniz borsa al-sat işlemlerini, 
        şehir devletlerinin (Cumhuriyetlerin) aldığı kararları ve simülasyonun arka plan olaylarını kaydeder.
      </p>

      {/* Terminal View */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.25rem',
        flex: 1,
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: '#10b981',
        maxHeight: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#64748b' }}>[Konsol Boş]</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{ 
              lineHeight: '1.4', 
              borderBottom: '1px solid rgba(16, 185, 129, 0.05)',
              paddingBottom: '0.35rem' 
            }}>
              <span style={{ color: '#06b6d4', marginRight: '0.5rem' }}>&gt;</span>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Tips Section */}
      <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', borderLeft: '3px solid hsl(var(--accent-gold))' }}>
        <strong>💡 Sistem İpucu:</strong> Karakterinizin hayatta kalma göstergelerini (Açlık, Su) takip etmeyi unutmayın. Eğer sıfırlanırlarsa sağlığınız azalmaya başlayacaktır. Borsa kazançlarınızla marketten gıda tedarik edebilirsiniz.
      </div>
    </GlassCard>
  );
};
