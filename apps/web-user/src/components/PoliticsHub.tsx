import React from 'react';
import { Award, Users, Megaphone } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getRoleLabel } from '../App';

interface PoliticsHubProps {
  politics: {
    politicalRole: string;
    partyName: string;
    partyRank: string;
    politicalReputation: number;
    hasVotedThisTerm: boolean;
  };
  onVote: (partyName: string) => void;
}

export const PoliticsHub: React.FC<PoliticsHubProps> = ({ politics }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CUMHURBASKANI': return 'linear-gradient(135deg, hsl(var(--accent-gold)) 0%, #d97706 100%)';
      case 'BAKAN': return 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, #4f46e5 100%)';
      case 'MILLETVEKILI': return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
      case 'BELEDIYE_BASKANI': return 'linear-gradient(135deg, hsl(var(--accent-cyan)) 0%, #0891b2 100%)';
      case 'MUHTAR': return 'linear-gradient(135deg, hsl(var(--accent-emerald)) 0%, #059669 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      {/* Political Status Card */}
      <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-gold))', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'white' }}>
          <Award style={{ color: 'hsl(var(--accent-gold))' }} /> Siyasi Statü & İtibar
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Mevcut Siyasi Rol</span>
            <div style={{ 
              marginTop: '0.35rem', 
              padding: '0.5rem 1rem', 
              background: getRoleBadgeColor(politics.politicalRole),
              borderRadius: '8px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              width: 'fit-content',
              fontSize: '1rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {getRoleLabel(politics.politicalRole)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Siyasi İtibar (Reputation)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--accent-cyan))', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                ⭐ {politics.politicalReputation} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'hsl(var(--text-muted))' }}>puan</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Bulunduğu Parti</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginTop: '0.25rem' }}>
                <Users size={16} style={{ marginRight: '0.35rem', color: 'hsl(var(--accent-purple))' }} /> 
                {politics.partyName}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Rütbe: {politics.partyRank}</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'hsl(var(--text-secondary))'
          }}>
            <Megaphone size={16} style={{ color: 'hsl(var(--accent-cyan))', flexShrink: 0, marginTop: '2px' }} />
            <span>
              Siyasi itibarınızı artırmak için meclis önergelerine katılabilir, yerel ihaleleri destekleyebilir veya aktif bir siyasi partide propaganda yapabilirsiniz.
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
