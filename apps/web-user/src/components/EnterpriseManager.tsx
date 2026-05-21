import React, { useState, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Briefcase, Landmark, Shield, HardHat, Zap, MapPin } from 'lucide-react';
import districtsData from '../data/turkiye-ilceler-optimized.json';
import { IsometricOffice } from './IsometricOffice';

interface EnterpriseManagerProps {
  userCash: number;
  coalMineLevel: number;
  autoFactoryLevel: number;
  defenseFactoryLevel: number;
  onUpgradeFactory: (type: 'coal' | 'auto' | 'defense', cost: number, companyName?: string) => void;
  userProvince: string;
  userDistrict: string;
  onAddCash: (amount: number) => void;
  onUpdateBalances?: (newBalances: any, logMessage: string) => void;
  userPoliticalInfluence: number;
  userPoliticalReputation: number;
  gender?: string | null;
  isometricModelId?: string | null;
}

const EnterpriseManagerComponent: React.FC<EnterpriseManagerProps> = ({
  userCash,
  coalMineLevel,
  autoFactoryLevel,
  defenseFactoryLevel,
  onUpgradeFactory,
  userProvince,
  userDistrict,
  onAddCash,
  onUpdateBalances,
  userPoliticalInfluence,
  userPoliticalReputation,
  gender = null,
  isometricModelId = null
}) => {
  const [activeTab, setActiveTab] = useState<'my_companies' | 'market'>('my_companies');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');

  // Multi-office room isolation: Track which office rooms are unlocked/owned
  const ownedTypes = useMemo(() => {
    const types: ('coal' | 'auto' | 'defense')[] = [];
    if (coalMineLevel > 0) types.push('coal');
    if (autoFactoryLevel > 0) types.push('auto');
    if (defenseFactoryLevel > 0) types.push('defense');
    return types;
  }, [coalMineLevel, autoFactoryLevel, defenseFactoryLevel]);

  const [selectedOfficeType, setSelectedOfficeType] = useState<'coal' | 'auto' | 'defense'>('coal');
  const [viewingOffice, setViewingOffice] = useState<boolean>(false);

  // Auto-switch office if current choice is not owned
  React.useEffect(() => {
    if (ownedTypes.length > 0 && !ownedTypes.includes(selectedOfficeType)) {
      setSelectedOfficeType(ownedTypes[0]);
    }
  }, [ownedTypes, selectedOfficeType]);



  // Calculations
  const activeFactoryCount = (coalMineLevel > 0 ? 1 : 0) + (autoFactoryLevel > 0 ? 1 : 0) + (defenseFactoryLevel > 0 ? 1 : 0);
  const hasNoCompany = coalMineLevel === 0 && autoFactoryLevel === 0 && defenseFactoryLevel === 0;

  // Extract districts of the user's province from optimized JSON
  const districts = useMemo(() => {
    const provinceInfo = (districtsData as any)[userProvince];
    if (provinceInfo && provinceInfo.districts) {
      return Object.keys(provinceInfo.districts);
    }
    return [userDistrict];
  }, [userProvince, userDistrict]);

  // Generate companies for sale in the user's residency state
  const marketCompanies = useMemo(() => {
    const list: any[] = [];
    districts.forEach((dist, idx) => {
      // 1. Coal Mine type
      list.push({
        id: `coal-${dist}-${idx}`,
        name: `${dist} Madencilik & Enerji A.Ş.`,
        district: dist,
        type: 'coal' as const,
        price: 1500 + (idx * 150) + (dist.length * 20),
        income: 25,
        desc: `${dist} ilçesindeki stratejik kömür ve termal enerji yataklarını işleten yerel maden şirketi.`,
        icon: <HardHat size={20} style={{ color: 'hsl(var(--accent-gold))' }} />,
        accent: 'hsl(var(--accent-gold))'
      });

      // 2. Auto Factory type
      list.push({
        id: `auto-${dist}-${idx}`,
        name: `${dist} Otomotiv Sanayi A.Ş.`,
        district: dist,
        type: 'auto' as const,
        price: 4000 + (idx * 300) + (dist.length * 40),
        income: 80,
        desc: `${dist} Organize Sanayi Bölgesinde yerli montaj, parça ve batarya üretim hattı.`,
        icon: <Zap size={20} style={{ color: 'hsl(var(--accent-cyan))' }} />,
        accent: 'hsl(var(--accent-cyan))'
      });

      // 3. Defense Factory type
      list.push({
        id: `defense-${dist}-${idx}`,
        name: `${dist} Havacılık ve Savunma Teknolojileri`,
        district: dist,
        type: 'defense' as const,
        price: 10000 + (idx * 600) + (dist.length * 80),
        income: 250,
        desc: `${dist} sınırlarında kurulu İHA test alanı, komuta kontrol ve milli savunma üretim tesisi.`,
        icon: <Shield size={20} style={{ color: 'hsl(var(--accent-purple))' }} />,
        accent: 'hsl(var(--accent-purple))'
      });
    });
    return list;
  }, [districts]);

  // Filtered market companies based on district selection
  const filteredMarketCompanies = useMemo(() => {
    if (selectedDistrictFilter === 'all') return marketCompanies;
    return marketCompanies.filter(c => c.district === selectedDistrictFilter);
  }, [marketCompanies, selectedDistrictFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Navigation Tabs and Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', margin: 0 }}>
            <Briefcase style={{ color: 'hsl(var(--accent-cyan))' }} /> {userProvince} Sanayi ve Şirket Yönetimi
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem', margin: 0 }}>
            Resmi ikametgahınız: <strong style={{ color: 'white' }}>{userProvince} Cumhuriyeti, {userDistrict}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setActiveTab('my_companies')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'my_companies' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: activeTab === 'my_companies' ? 'white' : 'hsl(var(--text-secondary))',
              fontWeight: 700,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            🏢 Şirketlerim ({activeFactoryCount})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'market' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: activeTab === 'market' ? 'white' : 'hsl(var(--text-secondary))',
              fontWeight: 700,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            🛒 Satılık Şirketler ({marketCompanies.length})
          </button>
        </div>
      </div>

      {/* Government Grant / Subsidy Banner */}
      {userCash < 150000 && (
        <GlassCard style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(139, 92, 246, 0.08))',
          borderLeft: '4px solid hsl(var(--accent-gold))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.55rem' }}>💰</span>
            <div>
              <h4 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                Kalkınma ve Girişimcilik Teşvik Hibesi
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>
                {userProvince} Cumhuriyeti Kalkınma Ajansı, sanayiyi canlandırmak isteyen vatandaşlara <strong>₺500.000</strong> hibe desteği sağlıyor.
              </p>
            </div>
          </div>
          <button
            onClick={() => onAddCash(500000)}
            className="btn-success"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, hsl(var(--accent-gold)), #d97706)',
              border: 'none',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)',
              cursor: 'pointer'
            }}
          >
            💸 Hibeyi Talep Et (+₺500.000)
          </button>
        </GlassCard>
      )}

      <div className="main-layout-grid" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Dynamic Tab Render */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeTab === 'my_companies' ? (
            <>
              {hasNoCompany ? (
                /* Prominent Warning Card if no company owned */
                <GlassCard style={{ 
                  background: 'rgba(239, 68, 68, 0.03)', 
                  borderLeft: '4px solid hsl(var(--accent-red))',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.25rem'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <Briefcase size={32} style={{ color: 'hsl(var(--accent-red))' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 800, margin: 0 }}>
                      ⚠️ Aktif Bir Şirketiniz Bulunmamaktadır!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', maxWidth: '550px', lineHeight: '1.5', marginTop: '0.5rem', marginInline: 'auto' }}>
                      Şu anda {userProvince} Cumhuriyeti sınırları içinde sahip olduğunuz bir üretim tesisi veya şirket bulunmuyor. Ekonomik güç kazanıp pasif gelir elde etmek için hemen bir şirket satın almalısınız.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="btn-primary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, hsl(var(--accent-cyan)), hsl(var(--accent-purple)))',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    🛒 {userProvince} Eyaletindeki Satılık Şirketleri Gör
                  </button>
                </GlassCard>
              ) : (
                /* Manage Existing Factories */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {!viewingOffice ? (
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
                        🏭 Sahip Olduğunuz Varlıklar & Şirketler
                      </h3>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                        gap: '1.25rem' 
                      }}>
                        {/* Coal mine card */}
                        {coalMineLevel > 0 && (
                          <GlassCard style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.45) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            minHeight: '200px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(245, 158, 11, 0.2)'
                                }}>
                                  <HardHat size={22} style={{ color: '#f59e0b' }} />
                                </div>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: '#f59e0b',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}>
                                  Seviye {coalMineLevel}
                                </span>
                              </div>
                              <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                                {localStorage.getItem('owned_company_name_coal') || 'Maden & Enerji A.Ş.'}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                Zonguldak Kömür İşletmeleri Operasyon ve Yatırım Merkezi
                              </p>
                              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pasif Gelir:</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>+₺{coalMineLevel * 25} / 10sn</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOfficeType('coal');
                                setViewingOffice(true);
                              }}
                              style={{
                                marginTop: '1.5rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#000',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              🚪 Ofise Gir
                            </button>
                          </GlassCard>
                        )}

                        {/* Auto factory card */}
                        {autoFactoryLevel > 0 && (
                          <GlassCard style={{
                            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(15, 23, 42, 0.45) 100%)',
                            border: '1px solid rgba(6, 182, 212, 0.15)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            minHeight: '200px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'rgba(6, 182, 212, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(6, 182, 212, 0.2)'
                                }}>
                                  <Zap size={22} style={{ color: '#06b6d4' }} />
                                </div>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  background: 'rgba(6, 182, 212, 0.15)',
                                  color: '#06b6d4',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}>
                                  Seviye {autoFactoryLevel}
                                </span>
                              </div>
                              <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                                {localStorage.getItem('owned_company_name_auto') || 'Otomotiv Teknoloji Sanayi A.Ş.'}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                Organize Sanayi Bölgesinde yerli montaj, parça ve batarya üretim hattı
                              </p>
                              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pasif Gelir:</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>+₺{autoFactoryLevel * 80} / 10sn</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOfficeType('auto');
                                setViewingOffice(true);
                              }}
                              style={{
                                marginTop: '1.5rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                color: '#000',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              🚪 Ofise Gir
                            </button>
                          </GlassCard>
                        )}

                        {/* Defense factory card */}
                        {defenseFactoryLevel > 0 && (
                          <GlassCard style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.45) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            minHeight: '200px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'rgba(139, 92, 246, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(139, 92, 246, 0.2)'
                                }}>
                                  <Shield size={22} style={{ color: '#8b5cf6' }} />
                                </div>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  background: 'rgba(139, 92, 246, 0.15)',
                                  color: '#8b5cf6',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}>
                                  Seviye {defenseFactoryLevel}
                                </span>
                              </div>
                              <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                                {localStorage.getItem('owned_company_name_defense') || 'Havacılık ve Savunma Teknolojileri'}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                İHA test alanı, komuta kontrol ve milli savunma üretim tesisi
                              </p>
                              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pasif Gelir:</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>+₺{defenseFactoryLevel * 250} / 10sn</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOfficeType('defense');
                                setViewingOffice(true);
                              }}
                              style={{
                                marginTop: '1.5rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              🚪 Ofise Gir
                            </button>
                          </GlassCard>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Back button and title */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                        <button
                          onClick={() => setViewingOffice(false)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          ← Şirketlerime Dön
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Konum: <strong style={{ color: '#cbd5e1' }}>{selectedOfficeType === 'coal' ? 'Maden & Enerji Ofisi' : selectedOfficeType === 'auto' ? 'Otomotiv Ofisi' : 'Savunma Sanayi Ofisi'}</strong>
                        </span>
                      </div>

                      <IsometricOffice
                        userCash={userCash}
                        totalIncome={selectedOfficeType === 'coal' ? coalMineLevel * 25 : selectedOfficeType === 'auto' ? autoFactoryLevel * 80 : defenseFactoryLevel * 250}
                        userProvince={userProvince}
                        officeType={selectedOfficeType}
                        onUpdateBalances={onUpdateBalances}
                        userPoliticalInfluence={userPoliticalInfluence}
                        userPoliticalReputation={userPoliticalReputation}
                        companyId={localStorage.getItem(`owned_company_id_${selectedOfficeType}`) || `${selectedOfficeType}-default`}
                        gender={gender}
                        isometricModelId={isometricModelId}
                      />
                    </>
                  )}

                </div>
              )}
            </>
          ) : (
            /* Marketplace for Companies (Restricted to residency state/province districts) */
            <GlassCard className="glow-purple" style={{ borderLeft: '4px solid hsl(var(--accent-purple))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', margin: 0, fontWeight: 700 }}>
                    🛒 {userProvince} Cumhuriyeti Satılık Şirketler Portföyü
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '0.2rem', margin: 0 }}>
                    Sadece resmi ikametgahınızın bulunduğu eyaletteki tüm ilçelerde yer alan satılık tesisleri görebilirsiniz.
                  </p>
                </div>
              </div>

              {/* District Filter Buttons */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem', maxWidth: '100%' }}>
                <button
                  onClick={() => setSelectedDistrictFilter('all')}
                  style={{
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    background: selectedDistrictFilter === 'all' ? 'hsl(var(--accent-purple))' : 'rgba(255,255,255,0.02)',
                    color: 'white',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  📍 Tüm İlçeler ({districts.length})
                </button>
                {districts.map(dist => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistrictFilter(dist)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      background: selectedDistrictFilter === dist ? 'hsl(var(--accent-purple))' : 'rgba(255,255,255,0.02)',
                      color: 'white',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔍 {dist}
                  </button>
                ))}
              </div>

              {/* Companies List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredMarketCompanies.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    Bu ilçede satılık şirket bulunmuyor.
                  </div>
                ) : (
                  filteredMarketCompanies.map(c => {
                    const isAffordable = userCash >= c.price;
                    return (
                      <GlassCard
                        key={c.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.01)',
                          borderLeft: `3px solid ${c.accent}`,
                          padding: '1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '240px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {c.icon}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
                              {c.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <MapPin size={12} style={{ color: 'hsl(var(--accent-purple))' }} />
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                Konum: {userProvince} Cumhuriyeti, {c.district}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '0.4rem', maxWidth: '400px', margin: 0, lineHeight: '1.3' }}>
                              {c.desc}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '200px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Pasif Gelir</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--accent-emerald))' }}>
                              +₺{c.income} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--text-muted))' }}>/ 10s</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              try {
                                localStorage.setItem(`owned_company_id_${c.type}`, c.id);
                                localStorage.setItem(`owned_company_name_${c.type}`, c.name);
                              } catch (e) {
                                console.error('Failed to save company ID to localStorage:', e);
                              }
                              onUpgradeFactory(c.type, c.price, c.name);
                              setActiveTab('my_companies');
                            }}
                            disabled={!isAffordable}
                            className="btn-success"
                            style={{
                              padding: '0.6rem 1.25rem',
                              fontSize: '0.85rem',
                              opacity: isAffordable ? 1 : 0.5,
                              cursor: isAffordable ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.1rem',
                              minWidth: '110px'
                            }}
                          >
                            <span>Satın Al</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>₺{c.price.toLocaleString('tr-TR')}</span>
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })
                )}
              </div>
            </GlassCard>
          )}

        </div>

        {/* Right Side Summary Panel */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Financial Summary */}


          {/* State Subsidy Card */}
          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-gold))' }}>
            <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'white', marginBottom: '0.5rem', margin: 0, fontWeight: 700 }}>
              <Landmark size={14} style={{ color: 'hsl(var(--accent-gold))' }} /> KOSGEB Yerel Yatırım Desteği
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.3', margin: 0, marginTop: '0.5rem' }}>
              İkamet ettiğiniz {userProvince} sınırları içindeki yatırımlarınızda özel vergi indirimi ve devlet sübvansiyonu uygulanır. Diğer eyaletlerden şirket alımları sınır kısıtlamalarına tabidir.
            </p>
          </GlassCard>

        </aside>

      </div>
    </div>
  );
};

export const EnterpriseManager = React.memo(EnterpriseManagerComponent);
