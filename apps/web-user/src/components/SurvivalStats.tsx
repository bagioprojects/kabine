import React from 'react';
import { Heart, Pizza, Droplets, Zap, Smile, ShieldAlert } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SurvivalStatsProps {
  stats: {
    health: number;
    hunger: number;
    thirst: number;
    energy: number;
    happiness: number;
    isSick: boolean;
  };
}

export const SurvivalStats: React.FC<SurvivalStatsProps> = ({ stats }) => {
  const getProgressColor = (val: number, type: 'energy' | 'happiness' | 'default') => {
    if (val < 30) return 'hsl(var(--accent-red))';
    if (val < 60) return 'hsl(var(--accent-gold))';
    if (type === 'energy') return 'hsl(var(--accent-cyan))';
    if (type === 'happiness') return 'hsl(var(--accent-purple))';
    return 'hsl(var(--accent-emerald))';
  };

  const statItems = [
    {
      label: 'Sağlık',
      value: stats.health,
      icon: <Heart size={20} className="text-red-500" style={{ color: 'hsl(var(--accent-red))' }} />,
      colorClass: getProgressColor(stats.health, 'default'),
      desc: stats.health < 30 ? 'Kritik Durum!' : 'Sağlıklı'
    },
    {
      label: 'Açlık',
      value: stats.hunger,
      icon: <Pizza size={20} style={{ color: 'hsl(var(--accent-gold))' }} />,
      colorClass: getProgressColor(stats.hunger, 'default'),
      desc: stats.hunger < 30 ? 'Çok Aç!' : 'Tok'
    },
    {
      label: 'Susuzluk',
      value: stats.thirst,
      icon: <Droplets size={20} style={{ color: 'hsl(var(--accent-cyan))' }} />,
      colorClass: getProgressColor(stats.thirst, 'default'),
      desc: stats.thirst < 30 ? 'Dehidre!' : 'Su Düzeyi İyi'
    },
    {
      label: 'Enerji',
      value: stats.energy,
      icon: <Zap size={20} style={{ color: 'hsl(var(--accent-cyan))' }} />,
      colorClass: getProgressColor(stats.energy, 'energy'),
      desc: stats.energy < 30 ? 'Bitkin!' : 'Dinamik'
    },
    {
      label: 'Mutluluk',
      value: stats.happiness,
      icon: <Smile size={20} style={{ color: 'hsl(var(--accent-purple))' }} />,
      colorClass: getProgressColor(stats.happiness, 'happiness'),
      desc: stats.happiness < 30 ? 'Depresif!' : 'Mutlu'
    }
  ];

  return (
    <GlassCard className="glow-cyan" style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative scanner line */}
      <div className="hud-scanline" />
      
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', letterSpacing: '0.02em' }}>
        <span>❤️</span> Vital Yaşam Göstergeleri
      </h2>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {statItems.map((item, idx) => {
          const isCritical = item.value < 30;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.02em' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>{item.desc}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: item.colorClass }}>
                    %{item.value}
                  </span>
                </div>
              </div>

              {/* Custom Premium Gamified Progress Bar */}
              <div style={{ 
                height: '12px', 
                background: 'rgba(0, 0, 0, 0.25)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '6px', 
                overflow: 'hidden', 
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)'
              }}>
                <div 
                  className={isCritical ? 'status-critical-pulse' : ''}
                  style={{ 
                    height: '100%', 
                    width: `${item.value}%`, 
                    background: item.colorClass, 
                    borderRadius: '6px', 
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 12px ${item.colorClass}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }} 
                >
                  {/* Glowing stripe overlay pattern that moves */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.12) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.12) 75%, transparent 75%, transparent)',
                    backgroundSize: '1rem 1rem',
                    animation: 'progress-bar-stripes 1.5s linear infinite',
                    opacity: 0.85
                  }} />
                </div>
              </div>
            </div>
          );
        })}

        {stats.isSick && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: 'hsl(var(--accent-red))',
            marginTop: '0.5rem'
          }}>
            <ShieldAlert size={20} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Hastalık Teşhisi:</strong> Karakteriniz hasta! İlaç almalı veya hastanede tedavi olmalısınız.
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
