import React from 'react';
import { GlassCard } from './GlassCard';

interface MilletvekiliPanelViewProps {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  activeMilletvekiliTab: 'proposals' | 'citizens';
  billProposals: any[];
  setBillProposals: React.Dispatch<React.SetStateAction<any[]>>;
  addLog: (msg: string) => void;
}

export const MilletvekiliPanelView: React.FC<MilletvekiliPanelViewProps> = ({
  setUser,
  activeMilletvekiliTab,
  billProposals,
  setBillProposals,
  addLog
}) => {
  return (
    <GlassCard style={{ borderLeft: '4px solid #ec4899', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        👔 Milletvekili Yasama Paneli
      </h2>
      
      {activeMilletvekiliTab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white' }}>🏛️ Meclis Gündemindeki Kanun Teklifleri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {billProposals.map(bill => (
              <div key={bill.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'white' }}>{bill.title}</strong>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>{bill.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>Kabul Oyu: {bill.votesYes}</span>
                  <span>Ret Oyu: {bill.votesNo}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setBillProposals(prev => prev.map(b => b.id === bill.id ? { ...b, votesYes: b.votesYes + 1 } : b));
                      addLog(`🗳️ Kanun teklifine KABUL oyu verdiniz: "${bill.title}"`);
                    }}
                    className="btn-success"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Kabul Et (YES)
                  </button>
                  <button
                    onClick={() => {
                      setBillProposals(prev => prev.map(b => b.id === bill.id ? { ...b, votesNo: b.votesNo + 1 } : b));
                      addLog(`🗳️ Kanun teklifine RET oyu verdiniz: "${bill.title}"`);
                    }}
                    className="btn-danger"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Reddet (NO)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeMilletvekiliTab === 'citizens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white' }}>📢 Halk Kürsüsü ve Seçmen Görüşmeleri</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            Seçmenlerinizle bir araya gelerek siyasi itibarınızı ve parti nüfuzunuzu artırın.
          </p>
          <button
            onClick={() => {
              setUser((prev: any) => ({ ...prev, politicalInfluence: prev.politicalInfluence + 40, politicalReputation: prev.politicalReputation + 5 }));
              addLog('📢 Halk kürsüsünde konuşma yaptınız! Seçmenlerinizin desteği arttı. (+40 Nüfuz, +5 İtibar)');
            }}
            className="btn-primary"
            style={{ padding: '0.75rem', fontWeight: 700 }}
          >
            Miting & Basın Açıklaması Düzenle
          </button>
        </div>
      )}
    </GlassCard>
  );
};
