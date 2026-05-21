import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { PresidentIsometricOffice } from './PresidentIsometricOffice';

interface PresidentPanelViewProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  activePresidentTab: 'decrees' | 'cabinet' | 'central_bank' | 'diplomacy' | 'budget' | 'residency' | 'reserves';
  treasuryBalance: number;
  setTreasuryBalance: React.Dispatch<React.SetStateAction<number>>;
  inflationRate: number;
  setInflationRate: React.Dispatch<React.SetStateAction<number>>;
  interestRate: number;
  setInterestRate: React.Dispatch<React.SetStateAction<number>>;
  cabinet: any;
  setCabinet: React.Dispatch<React.SetStateAction<any>>;
  activeDecrees: any[];
  setActiveDecrees: React.Dispatch<React.SetStateAction<any[]>>;
  budgetAllocation: any;
  setBudgetAllocation: React.Dispatch<React.SetStateAction<any>>;
  residencyApplications?: any[];
  onApproveResidency?: (appId: string) => void;
  onRejectResidency?: (appId: string) => void;
  addLog: (msg: string) => void;
}

export const PresidentPanelView: React.FC<PresidentPanelViewProps> = ({
  user,
  setUser,
  activePresidentTab,
  treasuryBalance,
  setTreasuryBalance,
  inflationRate,
  setInflationRate,
  interestRate,
  setInterestRate,
  cabinet,
  setCabinet,
  activeDecrees,
  setActiveDecrees,
  budgetAllocation,
  setBudgetAllocation,
  residencyApplications = [],
  onApproveResidency,
  onRejectResidency,
  addLog
}) => {
  const [isViewingOffice, setIsViewingOffice] = useState(false);
  const [reserves, setReserves] = useState<any[]>([]);
  const [loadingReserves, setLoadingReserves] = useState(false);
  const [transacting, setTransacting] = useState<string | null>(null);
  const [actionAmount, setActionAmount] = useState<number>(100);

  const fetchReserves = async () => {
    setLoadingReserves(true);
    try {
      const token = localStorage.getItem('politic_token');
      const res = await fetch('http://localhost:3000/api/v1/economy/reserves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReserves(data.reserves);
      }
    } catch (err) {
      console.error('Error fetching reserves:', err);
    } finally {
      setLoadingReserves(false);
    }
  };

  useEffect(() => {
    if (activePresidentTab === 'reserves') {
      fetchReserves();
    }
  }, [activePresidentTab]);

  const handleManageReserve = async (commodityId: string, action: 'deposit' | 'withdraw' | 'buy' | 'sell') => {
    setTransacting(commodityId + '-' + action);
    try {
      const token = localStorage.getItem('politic_token');
      const res = await fetch('http://localhost:3000/api/v1/economy/reserves/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          commodityId,
          amount: actionAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`📦 Devlet Deposu: ${commodityId} ürünü için '${action}' işlemi başarıyla gerçekleştirildi. Miktar: ${actionAmount}`);
        await fetchReserves();
        if (data.data && data.data.presidentCash !== undefined) {
          setUser((prev: any) => ({ ...prev, cash: data.data.presidentCash }));
        }
      } else {
        addLog(`❌ Devlet Deposu Hatası: ${data.message}`);
        alert(data.message);
      }
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Bağlantı Hatası: ${err.message}`);
    } finally {
      setTransacting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Status header banner */}
      <GlassCard style={{
        borderLeft: '4px solid hsl(var(--accent-gold))',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            👑 Cumhurbaşkanı Yönetim Kabinesi
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '0.25rem', marginBottom: 0 }}>
            {user.province} Cumhuriyeti ve bağlı 81 şehir devletinin makro-ekonomik, yasama, bütçe ve ulusal güvenlik stratejilerini belirleyin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Devlet Hazinesi</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'hsl(var(--accent-gold))', fontFamily: 'var(--font-display)' }}>
              ₺{treasuryBalance.toLocaleString('tr-TR')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Enflasyon</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-display)' }}>
              %{inflationRate.toFixed(1)}
            </div>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          {!isViewingOffice ? (
            <button
              onClick={() => setIsViewingOffice(true)}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              🚪 Makam Odasına Gir
            </button>
          ) : (
            <button
              onClick={() => setIsViewingOffice(false)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ← Ana Panele Dön
            </button>
          )}
        </div>
      </GlassCard>

      {isViewingOffice ? (
        <PresidentIsometricOffice
          user={user}
          setUser={setUser}
          treasuryBalance={treasuryBalance}
          setTreasuryBalance={setTreasuryBalance}
          inflationRate={inflationRate}
          setInflationRate={setInflationRate}
          addLog={addLog}
        />
      ) : (
        <>
          {/* SUBTAB 1: DECREES */}
          {activePresidentTab === 'decrees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
          {/* Active Decrees History */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📜</span> İmzalanan Cumhurbaşkanlığı Kararnameleri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeDecrees.map(dec => (
                <div key={dec.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'white', fontSize: '0.95rem' }}>{dec.title}</strong>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{dec.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.3', margin: 0 }}>{dec.details}</p>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>İmza Tarihi: {dec.date}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Issue Decree Panel */}
          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✍️</span> Yeni Kararname Yayınla
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
              Aşağıdaki hazır şablonlardan bir kararname seçip imzalayarak ulusal ölçekte yürürlüğe sokabilirsiniz.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  if (treasuryBalance < 250000) {
                    addLog('❌ Bütçe Yetersiz: Vergi muafiyeti kararnamesi için hazinede ₺250.000 bulunmalıdır!');
                    return;
                  }
                  setTreasuryBalance(prev => prev - 250000);
                  setUser((prev: any) => ({ ...prev, taxDebt: Math.max(0, prev.taxDebt - 150), politicalInfluence: prev.politicalInfluence + 100 }));
                  setActiveDecrees((prev: any[]) => [{
                    id: prev.length + 1,
                    title: 'Genel Vatandaş Vergi Affı Kararnamesi',
                    date: new Date().toLocaleDateString('tr-TR'),
                    status: 'İmzalandı',
                    details: 'Tüm vatandaşların birikmiş vergi borçlarında 150 ₺ indirim yapıldı. Gider devlet hazinesinden karşılandı.'
                  }, ...prev]);
                  addLog('👑 Cumhurbaşkanı vergi affı kararnamesini imzaladı! Vatandaşların vergi yükü hafifletildi.');
                }}
                className="btn-success"
                style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}
              >
                <strong>💸 Vatandaş Vergi Affı</strong>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Maliyet: -₺250,000 Hazine | Etki: -150 ₺ Vergi Borcu, +100 Nüfuz</span>
              </button>

              <button
                onClick={() => {
                  if (treasuryBalance < 400000) {
                    addLog('❌ Bütçe Yetersiz: Maden teşviki için hazinede ₺400.000 bulunmalıdır!');
                    return;
                  }
                  setTreasuryBalance(prev => prev - 400000);
                  setUser((prev: any) => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      coal: prev.materials.coal + 50,
                      iron_ore: prev.materials.iron_ore + 25
                    },
                    politicalInfluence: prev.politicalInfluence + 150
                  }));
                  setActiveDecrees((prev: any[]) => [{
                    id: prev.length + 1,
                    title: 'Milli Madencilik Sübvansiyon Kararnamesi',
                    date: new Date().toLocaleDateString('tr-TR'),
                    status: 'İmzalandı',
                    details: 'Devlet maden işletmelerine ve özel madencilere yakıt yardımı yapıldı. Envantere 50 Kömür, 25 Demir eklendi.'
                  }, ...prev]);
                  addLog('👑 Cumhurbaşkanı madencilik sübvansiyon kararnamesini imzaladı! Maden üretimi teşvik edildi.');
                }}
                className="btn-primary"
                style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.25rem' }}
              >
                <strong>⛏️ Madencilik Teşvik Paketi</strong>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Maliyet: -₺400,000 Hazine | Etki: +50 Kömür, +25 Demir, +150 Nüfuz</span>
              </button>

              <button
                onClick={() => {
                  setInflationRate(prev => Math.max(5, prev - 1.5));
                  setUser((prev: any) => ({ ...prev, politicalInfluence: prev.politicalInfluence + 80 }));
                  setActiveDecrees((prev: any[]) => [{
                    id: prev.length + 1,
                    title: 'Enflasyonla Mücadele Kararnamesi',
                    date: new Date().toLocaleDateString('tr-TR'),
                    status: 'İmzalandı',
                    details: 'Temel gıda maddelerinde KDV oranı %1\'e indirildi ve fiyat denetimleri sıkılaştırıldı.'
                  }, ...prev]);
                  addLog('👑 Cumhurbaşkanı gıda KDV oranını düşüren enflasyonla mücadele kararnamesini imzaladı!');
                }}
                className="btn-secondary"
                style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.25rem' }}
              >
                <strong>📉 Enflasyon Karşıtı KDV İndirimi</strong>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Maliyet: Ücretsiz | Etki: Enflasyon -%1.5, +80 Nüfuz</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* SUBTAB 2: CABINET */}
      {activePresidentTab === 'cabinet' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
          {/* Active Ministers */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👥</span> Mevcut Bakanlar Kurulu
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              <GlassCard style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '2rem' }}>💼</div>
                <h4 style={{ color: 'white', margin: 0 }}>Maliye Bakanı</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-gold))', margin: '0.25rem 0' }}>{cabinet.treasury.name}</p>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                  Uzmanlık: %{cabinet.treasury.expertise} | Güven: %{cabinet.treasury.integrity}
                </div>
                {cabinet.treasury.name !== 'Boş' && (
                  <button
                    onClick={() => setCabinet((prev: any) => ({ ...prev, treasury: { name: 'Boş', integrity: 0, expertise: 0 } }))}
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.75rem', width: '100%' }}
                  >
                    Görevden Al
                  </button>
                )}
              </GlassCard>

              <GlassCard style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '2rem' }}>⚔️</div>
                <h4 style={{ color: 'white', margin: 0 }}>Savunma Bakanı</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-purple))', margin: '0.25rem 0' }}>{cabinet.defense.name}</p>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                  Uzmanlık: %{cabinet.defense.expertise} | Güven: %{cabinet.defense.integrity}
                </div>
                {cabinet.defense.name !== 'Boş' && (
                  <button
                    onClick={() => setCabinet((prev: any) => ({ ...prev, defense: { name: 'Boş', integrity: 0, expertise: 0 } }))}
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.75rem', width: '100%' }}
                  >
                    Görevden Al
                  </button>
                )}
              </GlassCard>

              <GlassCard style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '2rem' }}>🚚</div>
                <h4 style={{ color: 'white', margin: 0 }}>Ulaştırma Bakanı</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-cyan))', margin: '0.25rem 0' }}>{cabinet.logistics.name}</p>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                  Uzmanlık: %{cabinet.logistics.expertise} | Güven: %{cabinet.logistics.integrity}
                </div>
                {cabinet.logistics.name !== 'Boş' && (
                  <button
                    onClick={() => setCabinet((prev: any) => ({ ...prev, logistics: { name: 'Boş', integrity: 0, expertise: 0 } }))}
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.75rem', width: '100%' }}
                  >
                    Görevden Al
                  </button>
                )}
              </GlassCard>
            </div>
          </GlassCard>

          {/* Simulated Candidates */}
          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📋</span> Bakan Adayları
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Prof. Dr. Özgür Demirtaş', expertise: 95, integrity: 88, role: 'treasury', roleName: 'Maliye' },
                { name: 'Org. Hulusi Akar', expertise: 90, integrity: 85, role: 'defense', roleName: 'Savunma' },
                { name: 'Binali Yıldırım', expertise: 85, integrity: 70, role: 'logistics', roleName: 'Ulaştırma' },
                { name: 'Dr. Selin Sayek Böke', expertise: 92, integrity: 90, role: 'treasury', roleName: 'Maliye' }
              ].map((cand, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'white' }}>{cand.name}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                      Tercih: {cand.roleName} | Uzm: %{cand.expertise} | Güven: %{cand.integrity}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCabinet((prev: any) => ({
                        ...prev,
                        [cand.role]: { name: cand.name, integrity: cand.integrity, expertise: cand.expertise }
                      }));
                      addLog(`👥 Cumhurbaşkanı, ${cand.name} isimli adayı ${cand.roleName} Bakanı olarak atadı.`);
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Ata
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* SUBTAB 3: CENTRAL BANK */}
      {activePresidentTab === 'central_bank' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏦</span> Para Politikası Kurulu (PPK)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
              Milli politika faizini değiştirerek enflasyonu kontrol edebilir ya da piyasaya yeni para emisyonu sağlayabilirsiniz.
            </p>

            {/* Slider interest rate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Politika Faizi Oranı (Haftalık Repo)</span>
                <strong style={{ color: 'hsl(var(--accent-cyan))', fontSize: '1.1rem' }}>%{interestRate.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={interestRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setInterestRate(val);
                  setInflationRate(12.5 + (20 - val) * 0.4);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                💡 Faiz oranını artırmak enflasyonu düşürür ancak vatandaşın kredi maliyetlerini artırır.
              </span>
            </div>
          </GlassCard>

          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-red))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💵</span> Hazine Emisyon Odası
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
              Hazinedeki fonları acil durumlar için artırmak amacıyla yeni para basabilirsiniz. Dikkat: Para basmak enflasyon oranını artırır!
            </p>

            <button
              onClick={() => {
                setTreasuryBalance((prev: number) => prev + 1000000);
                setInflationRate((prev: number) => prev + 2.5);
                addLog('⚠️ UYARI: Merkez Bankası ₺1.000.000 değerinde yeni para bastı! Enflasyon %2.5 arttı.');
              }}
              className="btn-danger"
              style={{ padding: '0.75rem', fontWeight: 700, width: '100%' }}
            >
              🖨️ ₺1,000,000 Para Bas (Emisyon)
            </button>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
              (Harekete geçildiğinde enflasyon kalıcı olarak yükselir ve vergi yükü artar.)
            </span>
          </GlassCard>
        </div>
      )}

      {/* SUBTAB 4: DIPLOMACY */}
      {activePresidentTab === 'diplomacy' && (
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🌐</span> Komşu Şehir Devletleri Diplomasi Tablosu
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            Yalova Cumhuriyeti dışındaki diğer bağımsız cumhuriyetlerin güvenlik ve finans durumunu izleyin.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-secondary))' }}>
                  <th style={{ padding: '0.75rem' }}>Cumhuriyet Adı</th>
                  <th style={{ padding: '0.75rem' }}>GSYİH Oranı</th>
                  <th style={{ padding: '0.75rem' }}>Ordu Gücü</th>
                  <th style={{ padding: '0.75rem' }}>İlişki Seviyesi</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Diplomatik Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'İstanbul Cumhuriyeti', gdp: '₺450,000,000', army: '120,000 Aktif', status: 'Dostane', id: 'ist' },
                  { name: 'Ankara Cumhuriyeti', gdp: '₺320,000,000', army: '95,000 Aktif', status: 'Müttefik', id: 'ank' },
                  { name: 'İzmir Cumhuriyeti', gdp: '₺280,000,000', army: '75,000 Aktif', status: 'Nötr', id: 'izm' },
                  { name: 'Hakkari Cumhuriyeti', gdp: '₺15,000,000', army: '10,000 Aktif', status: 'Gergin', id: 'hak' }
                ].map((rep, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{rep.name}</td>
                    <td style={{ padding: '0.75rem' }}>{rep.gdp}</td>
                    <td style={{ padding: '0.75rem' }}>{rep.army}</td>
                    <td style={{ padding: '0.75rem', color: rep.status === 'Gergin' ? '#ef4444' : '#10b981' }}>{rep.status}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => addLog(`🤝 ${rep.name} ile ticari serbestlik anlaşması taslağı imzalandı.`)}
                        className="btn-success"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Anlaşma İmzala
                      </button>
                      <button
                        onClick={() => addLog(`🚫 ${rep.name} cumhuriyetine ihracat ambargosu konuldu!`)}
                        className="btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Ambargo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* SUBTAB 5: BUDGET */}
      {activePresidentTab === 'budget' && (
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-gold))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💰</span> Ulusal Bütçe Dağılım Paneli
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            Hazinedeki ₺{treasuryBalance.toLocaleString('tr-TR')} değerindeki bütçeyi ulusal departmanlara paylaştırın.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'education', label: '🎓 Eğitim ve İnovasyon', val: budgetAllocation.education },
              { key: 'defense', label: '🛡️ Milli Savunma ve Ordu', val: budgetAllocation.defense },
              { key: 'health', label: '🏥 Sağlık ve Sosyal Hizmetler', val: budgetAllocation.health },
              { key: 'science', label: '🚀 Bilim ve Uzay Sanayii', val: budgetAllocation.science }
            ].map((dept) => (
              <div key={dept.key} style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{dept.label}</span>
                  <strong>%{dept.val} (₺{Math.round(treasuryBalance * dept.val / 100).toLocaleString('tr-TR')})</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dept.val}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBudgetAllocation((prev: any) => ({
                      ...prev,
                      [dept.key]: val
                    }));
                  }}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            ))}

            {/* Validation warning if budget allocation is not 100% */}
            {(() => {
              const total = budgetAllocation.education + budgetAllocation.defense + budgetAllocation.health + budgetAllocation.science;
              if (total !== 100) {
                return (
                  <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', color: 'hsl(var(--accent-gold))', fontSize: '0.85rem' }}>
                    ⚠️ Bütçeyi onaylayabilmek için toplam dağılım %100 olmalıdır. Şu anki toplam: <strong>%{total}</strong>
                  </div>
                );
              }
              return null;
            })()}

            <button
              onClick={() => {
                const total = budgetAllocation.education + budgetAllocation.defense + budgetAllocation.health + budgetAllocation.science;
                if (total !== 100) {
                  addLog(`❌ Hata: Toplam bütçe dağılımı %100 olmalıdır! (Şu an: %${total})`);
                  return;
                }
                addLog('✅ Cumhurbaşkanı bütçe dağılım reformunu onayladı. Yatırımlar aktarılmaya başlandı.');
              }}
              className="btn-primary"
              disabled={budgetAllocation.education + budgetAllocation.defense + budgetAllocation.health + budgetAllocation.science !== 100}
              style={{ padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem', opacity: (budgetAllocation.education + budgetAllocation.defense + budgetAllocation.health + budgetAllocation.science !== 100) ? 0.5 : 1, cursor: (budgetAllocation.education + budgetAllocation.defense + budgetAllocation.health + budgetAllocation.science !== 100) ? 'not-allowed' : 'pointer' }}
            >
              Bütçeyi Yürürlüğe Sok (Dağıtımı Onayla)
            </button>
          </div>
        </GlassCard>
      )}

      {/* SUBTAB 6: RESIDENCY APPLICATIONS */}
      {activePresidentTab === 'residency' && (
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏠</span> Vatandaş İkametgah Başvuruları
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
            {user.province} Cumhuriyeti sınırları içerisindeki ilçelere yerleşmek veya buradaki şirket/ofislerini taşımak isteyen vatandaşların ikametgah başvurularını inceleyin, onaylayın veya reddedin.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {(() => {
              const relevantApps = (residencyApplications || []).filter(app => app.province === user.province);
              if (relevantApps.length === 0) {
                return (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                    🏠 Cumhuriyeti sınırlarına yapılmış bekleyen ikametgah taşıma başvurusu bulunmamaktadır.
                  </div>
                );
              }

              return relevantApps.map((app) => (
                <div key={app.id} style={{
                  padding: '1.25rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderLeft: `4px solid ${app.status === 'approved' ? 'hsl(var(--accent-emerald))' : app.status === 'rejected' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-purple))'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'white', fontSize: '1rem' }}>{app.applicantName}</strong>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: app.applicantRole === 'CUMHURBASKANI' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: app.applicantRole === 'CUMHURBASKANI' ? 'hsl(var(--accent-gold))' : 'hsl(var(--text-secondary))',
                        fontWeight: 700
                      }}>
                        {app.applicantRole === 'CUMHURBASKANI' ? 'Cumhurbaşkanı' : app.applicantRole === 'MILLETVEKILI' ? 'Milletvekili' : 'Vatandaş'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      Hedef İlçe: <span style={{ color: 'white', fontWeight: 600 }}>{app.district}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                      Başvuru Tarihi: {new Date(app.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => onApproveResidency?.(app.id)}
                          className="btn-success"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => onRejectResidency?.(app.id)}
                          className="btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                          Reddet
                        </button>
                      </>
                    ) : (
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: app.status === 'approved' ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))',
                        padding: '0.25rem 0.75rem',
                        background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '6px'
                      }}>
                        {app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </GlassCard>
      )}

      {activePresidentTab === 'reserves' && (
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-gold))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>📦</span> Devlet Emtia Rezervleri Deposu
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
                Cumhuriyetin stratejik güvenliği ve sanayi hammadde ihtiyaçları için 9 temel emtiayı depolayın, satın alın veya piyasaya satın.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>İşlem Miktarı:</span>
              <input
                type="number"
                value={actionAmount}
                onChange={(e) => setActionAmount(Math.max(1, parseInt(e.target.value) || 0))}
                style={{
                  width: '80px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={fetchReserves}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                disabled={loadingReserves}
              >
                🔄 Yenile
              </button>
            </div>
          </div>

          {loadingReserves ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              Depo kayıtları yükleniyor...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-secondary))' }}>
                      <th style={{ padding: '0.75rem' }}>Emtia Adı</th>
                      <th style={{ padding: '0.75rem' }}>Kategori</th>
                      <th style={{ padding: '0.75rem' }}>Borsa Fiyatı</th>
                      <th style={{ padding: '0.75rem' }}>Mevcut Rezerv</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Rezerv Depo İşlemleri (Cumhurbaşkanı Yetkisi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reserves.map((item) => {
                      return (
                        <tr key={item.commodityId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong style={{ color: '#fff' }}>{item.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{item.symbol}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--text-secondary))' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'hsl(var(--accent-gold))', fontWeight: 600 }}>
                            ₺{item.currentPrice.toLocaleString('tr-TR')}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <strong style={{ fontSize: '1rem', color: 'hsl(var(--accent-cyan))' }}>
                              {item.amount.toLocaleString('tr-TR')} Ton
                            </strong>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleManageReserve(item.commodityId, 'deposit')}
                                className="btn-success"
                                disabled={!!transacting}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                title="Kendi envanterinizden devlet deposuna aktarın"
                              >
                                {transacting === `${item.commodityId}-deposit` ? 'Aktarılıyor...' : 'Depola (Koy)'}
                              </button>
                              <button
                                onClick={() => handleManageReserve(item.commodityId, 'withdraw')}
                                className="btn-primary"
                                disabled={!!transacting}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                title="Devlet deposundan envanterinize çekin"
                              >
                                {transacting === `${item.commodityId}-withdraw` ? 'Çekiliyor...' : 'Envantere Çek'}
                              </button>
                              <button
                                onClick={() => handleManageReserve(item.commodityId, 'buy')}
                                className="btn-success"
                                disabled={!!transacting}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid #10b981' }}
                                title="Borsa fiyatından hazine bütçesiyle satın alıp depoya ekle"
                              >
                                {transacting === `${item.commodityId}-buy` ? 'Satın Alınıyor...' : 'Satın Al'}
                              </button>
                              <button
                                onClick={() => handleManageReserve(item.commodityId, 'sell')}
                                className="btn-danger"
                                disabled={!!transacting}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                title="Depodaki miktarı borsada satıp geliri hazineye ekle"
                              >
                                {transacting === `${item.commodityId}-sell` ? 'Satılıyor...' : 'Borsada Sat'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </GlassCard>
      )}
        </>
      )}
    </div>
  );
};
