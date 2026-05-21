import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Users, Award, Target } from 'lucide-react';

interface OrganizationViewProps {
  userCash: number;
  userInfluence: number;
  userReputation: number;
  onUpdateBalances: (updates: any, logMsg: string) => void;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({
  userCash,
  userInfluence,
  userReputation,
  onUpdateBalances
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'political' | 'corporate' | 'lobby'>('political');

  // Political Organization Structure State
  const [partyMembers] = useState([
    { name: 'Kemal Sunal (Siz)', role: 'Genel Başkan', power: 95, avatar: '👑' },
    { name: 'Adile Naşit', role: 'Genel Sekreter', power: 80, avatar: '👩‍💼' },
    { name: 'Şener Şen', role: 'Propaganda Sorumlusu', power: 75, avatar: '📢' },
    { name: 'Münir Özkul', role: 'Meclis Sözcüsü', power: 85, avatar: '👨‍⚖️' },
    { name: 'Halit Akçatepe', role: 'Genel Muhasip', power: 60, avatar: '📊' }
  ]);

  const [allianceStates] = useState([
    { province: 'Ankara', status: 'Müttefik', stability: 90, color: 'hsl(var(--accent-purple))' },
    { province: 'Zonguldak', status: 'Ticari Ortak', stability: 75, color: 'hsl(var(--accent-gold))' },
    { province: 'Yalova', status: 'Tarafsız', stability: 50, color: 'hsl(var(--accent-cyan))' }
  ]);

  // Corporate Holding State
  const [corporations, setCorporations] = useState([
    { name: 'Zonguldak Kömür A.Ş.', type: 'Maden & Enerji', efficiency: 92, active: true, color: 'hsl(var(--accent-gold))' },
    { name: 'Yalova Otomotiv Teknoloji', type: 'Otomotiv', efficiency: 85, active: true, color: 'hsl(var(--accent-cyan))' },
    { name: 'Ankara Savunma Sanayii', type: 'Savunma', efficiency: 78, active: false, color: 'hsl(var(--accent-purple))' }
  ]);

  // Lobby/Black Ops Actions
  const lobbyActions = [
    {
      id: 'social_media',
      title: 'Sosyal Medya Propagandası',
      desc: 'Trol ordularını ve haber kanallarını kullanarak siyasi popülaritenizi artırın.',
      cost: 50000,
      rewardText: '+200 Siyasi Nüfuz',
      icon: '📢',
      color: 'hsl(var(--accent-cyan))'
    },
    {
      id: 'strike_break',
      title: 'Fabrika Grevi Çözümü',
      desc: 'İşçi sendikalarıyla el altından anlaşarak holding üretim verimliliğini tırmandırın.',
      cost: 80000,
      rewardText: '+15% Üretim Verimliliği',
      icon: '⚡',
      color: 'hsl(var(--accent-gold))'
    },
    {
      id: 'parliament_lobby',
      title: 'Meclis Lobiciliği',
      desc: 'Milletvekillerine lüks akşam yemekleri ısmarlayarak yasa taslaklarına destek sağlayın.',
      cost: 120000,
      rewardText: '+40 Siyasi İtibar (Reputation)',
      icon: '🏛️',
      color: 'hsl(var(--accent-purple))'
    },
    {
      id: 'tax_cut_campaign',
      title: 'Vergi Muafiyeti Sözleşmesi',
      desc: 'Yerel bürokrasiyi fonlayarak şirketlerinizin vergi barajını 24 saatliğine yarıya indirin.',
      cost: 150000,
      rewardText: '+₺1.500/10sn Ekstra Gelir',
      icon: '📈',
      color: 'hsl(var(--accent-emerald))'
    }
  ];

  const handleExecuteLobby = (action: typeof lobbyActions[0]) => {
    if (userCash < action.cost) {
      alert(`Yetersiz Bakiye! Bu operasyon için kasada en az ₺${action.cost.toLocaleString('tr-TR')} bulunmalıdır.`);
      return;
    }

    let updates: any = { cash: userCash - action.cost };
    let logMsg = `🔥 Teşkilat Operasyonu: "${action.title}" gerçekleştirildi! (-₺${action.cost.toLocaleString('tr-TR')})`;

    if (action.id === 'social_media') {
      updates.politicalInfluence = userInfluence + 200;
      logMsg += ` (+200 Siyasi Nüfuz kazandınız)`;
    } else if (action.id === 'strike_break') {
      // Improve corporations efficiency
      setCorporations(prev => prev.map(c => ({ ...c, efficiency: Math.min(100, c.efficiency + 15) })));
      logMsg += ` (Tüm holding iştiraklerinin verimliliği %15 artırıldı)`;
    } else if (action.id === 'parliament_lobby') {
      updates.politicalReputation = userReputation + 40;
      logMsg += ` (+40 Siyasi İtibar kazandınız)`;
    } else if (action.id === 'tax_cut_campaign') {
      // Give static cash boost or similar
      updates.cash = userCash - action.cost + 60000; // Simulated immediate return
      logMsg += ` (Holding vergi yükü hafifletildi, acil hibe geri kazanıldı: +₺60.000)`;
    }

    onUpdateBalances(updates, logMsg);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid rgba(99, 102, 241, 0.15)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('political')}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            borderRadius: '8px',
            background: activeSubTab === 'political' ? 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, #4f46e5 100%)' : 'rgba(99, 102, 241, 0.08)',
            color: activeSubTab === 'political' ? 'white' : 'hsl(var(--text-primary))',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Users size={16} /> Siyasi Teşkilat
        </button>
        <button
          onClick={() => setActiveSubTab('corporate')}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            borderRadius: '8px',
            background: activeSubTab === 'corporate' ? 'linear-gradient(135deg, hsl(var(--accent-cyan)) 0%, #0891b2 100%)' : 'rgba(99, 102, 241, 0.08)',
            color: activeSubTab === 'corporate' ? 'white' : 'hsl(var(--text-primary))',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Award size={16} /> Şirket Karteli
        </button>
        <button
          onClick={() => setActiveSubTab('lobby')}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            borderRadius: '8px',
            background: activeSubTab === 'lobby' ? 'linear-gradient(135deg, hsl(var(--accent-emerald)) 0%, #059669 100%)' : 'rgba(99, 102, 241, 0.08)',
            color: activeSubTab === 'lobby' ? 'white' : 'hsl(var(--text-primary))',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Target size={16} /> Lobi & Operasyonlar
        </button>
      </div>

      {/* Sub Tabs Content */}
      {activeSubTab === 'political' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
          
          {/* Party Organization Tree Card */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: 800 }}>
                👑 Parti Teşkilatı Yönetim Şeması
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                Hükümet kabinesini ve parti kadrolarını yöneterek siyasi karar alma mekanizmasını elinizde tutun.
              </p>
            </div>

            {/* Visual Tree list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
              {partyMembers.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(99, 102, 241, 0.04)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    marginLeft: `${idx * 24}px`, // Tree hierarchy indentation
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Tree connector lines */}
                  {idx > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: '-14px',
                      top: '-20px',
                      width: '2px',
                      height: '38px',
                      background: 'rgba(99, 102, 241, 0.2)'
                    }} />
                  )}
                  {idx > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '18px',
                      width: '12px',
                      height: '2px',
                      background: 'rgba(99, 102, 241, 0.2)'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.4rem' }}>{member.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-purple))', fontWeight: 600 }}>{member.role}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Siyasi Etki</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--accent-emerald))' }}>%{member.power}</div>
                    </div>
                    <button
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.7rem',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '6px',
                        color: 'hsl(var(--accent-purple))',
                        fontWeight: 700
                      }}
                      onClick={() => alert(`${member.name} terfi ettirilemez. Maksimum yetki limitine ulaşıldı.`)}
                    >
                      Terfi Et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Alliance and Stability Side Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>🤝 Eyaletler Arası İttifak Koalisyonu</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {allianceStates.map((state, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{state.province} Cumhuriyeti</span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: `${state.color}20`,
                        color: state.color,
                        fontWeight: 700
                      }}>{state.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>Güven Kararlılığı:</span>
                      <strong style={{ color: 'hsl(var(--accent-emerald))' }}>%{state.stability}</strong>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }}>
                      <div style={{ width: `${state.stability}%`, height: '100%', background: 'hsl(var(--accent-emerald))', borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem' }}>🗳️</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>Milli Seçim Kampanyası</h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '0.15rem' }}>
                    Siyasi itibarınızı artırmak için parti içi mitingler organize edin ve yeni eyaletlere temsilci atayın.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {activeSubTab === 'corporate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Schematic of Kartel */}
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🏢 Holding İştirakleri ve Kartel Yapısı</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  Üç büyük ağır sanayi kolunda faaliyet gösteren şirketlerinizin üretim verilerini tek noktadan izleyin.
                </p>
              </div>
              <div style={{ fontSize: '2rem' }}>🏭</div>
            </div>

            {/* Industrial holding schematic grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {corporations.map((corp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: `1px solid rgba(99, 102, 241, 0.15)`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>{corp.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Sektör: {corp.type}</span>
                    </div>
                    {/* Status indicator pulse dot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: corp.active ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))',
                        boxShadow: corp.active ? '0 0 8px hsl(var(--accent-emerald))' : 'none',
                        animation: corp.active ? 'pulse 2s infinite' : 'none'
                      }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{corp.active ? 'AKTİF' : 'ASKA ALINDI'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'hsl(var(--text-secondary))' }}>Üretim Verimliliği:</span>
                    <strong style={{ color: corp.color }}>%{corp.efficiency}</strong>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${corp.efficiency}%`,
                      height: '100%',
                      background: corp.color,
                      borderRadius: '3px'
                    }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700 }}
                      onClick={() => alert(`${corp.name} optimizasyon paneli yükleniyor...`)}
                    >
                      İstatistikler
                    </button>
                    <button
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        background: corp.active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        border: corp.active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                        color: corp.active ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-emerald))',
                        borderRadius: '6px',
                        fontWeight: 700,
                        flex: 1
                      }}
                      onClick={() => {
                        setCorporations(prev => prev.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
                      }}
                    >
                      {corp.active ? 'Durdur' : 'Başlat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Holdings summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.2rem' }}>📈</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Toplam Kartel Değeri</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--accent-emerald))' }}>₺4,250,000</div>
              </div>
            </GlassCard>
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.2rem' }}>🛡️</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Endüstriyel Tekel Derecesi</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--accent-purple))' }}>Dominant Kartel (%72)</div>
              </div>
            </GlassCard>
          </div>
          
        </div>
      )}

      {activeSubTab === 'lobby' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🕵️ Teşkilat & Lobicilik Operasyon Dairesi</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Gizli fonlar aracılığıyla medya manipülasyonu, işçi grevi bastırma, vergi optimizasyonu ve meclis lobi operasyonlarını yönetin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {lobbyActions.map((action, idx) => (
              <GlassCard
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderTop: `4px solid ${action.color}`,
                  background: 'rgba(255,255,255,0.7)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.8rem' }}>{action.icon}</div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'hsl(var(--accent-gold))'
                  }}>
                    ₺{action.cost.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{action.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>{action.desc}</p>
                </div>

                <div style={{
                  background: `${action.color}10`,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: action.color,
                  fontWeight: 700,
                  textAlign: 'center',
                  marginTop: 'auto'
                }}>
                  Etki: {action.rewardText}
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${action.color} 0%, #1e1b4b 100%)`,
                    boxShadow: 'none'
                  }}
                  onClick={() => handleExecuteLobby(action)}
                >
                  Operasyonu Başlat
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};
