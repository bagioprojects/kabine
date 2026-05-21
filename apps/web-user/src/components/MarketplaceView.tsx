import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

export interface CommodityItem {
  id: string;
  name: string;
  symbol: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  description: string;
  emoji: string;
  priceTrend: number[];
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  replenishType: 'hunger' | 'thirst' | 'energy' | 'health' | 'cure';
  replenishValue: number;
  emoji: string;
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: '1', name: 'Taze Ekmek', price: 15, replenishType: 'hunger', replenishValue: 20, emoji: '🍞' },
  { id: '2', name: 'Doğal Kaynak Suyu', price: 8, replenishType: 'thirst', replenishValue: 25, emoji: '💧' },
  { id: '3', name: 'Premium Enerji İçeceği', price: 45, replenishType: 'energy', replenishValue: 30, emoji: '⚡' },
  { id: '4', name: 'Halk Eczanesi İlaç', price: 150, replenishType: 'cure', replenishValue: 25, emoji: '💊' }
];

export interface VehicleShowroomItem {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  imagePath: string;
  speedText: string;
  efficiencyText: string;
  tankCapacity: number;
  description: string;
}

export const VEHICLE_ITEMS: VehicleShowroomItem[] = [
  {
    id: 'classic_sahin',
    name: 'Tofaş Şahin',
    category: 'Milli Efsane / Sedan',
    price: 8500,
    emoji: '🚗',
    imagePath: '/assets/classic_sahin.webp',
    speedText: '100 km/s',
    efficiencyText: '8 lt / 100 km',
    tankCapacity: 50,
    description: 'Türk otomotiv tarihinin nostaljik efsanesi. Ekonomik, samimi ve modifiyeye açık.'
  },
  {
    id: 'togg_suv',
    name: 'Togg T10X SUV',
    category: 'Elektrikli Akıllı SUV',
    price: 45000,
    emoji: '🚙',
    imagePath: '/assets/togg_suv.webp',
    speedText: '180 km/s',
    efficiencyText: 'Elektrikli Akıllı Tüketim',
    tankCapacity: 60,
    description: 'Yerli ve milli akıllı mobilite cihazı. Çevre dostu, sessiz ve üst düzey teknoloji.'
  },
  {
    id: 'armored_suv',
    name: 'Zırhlı Off-Road SUV',
    category: 'Askeri Taktik / SUV',
    price: 120000,
    emoji: '🛞',
    imagePath: '/assets/armored_suv.webp',
    speedText: '140 km/s (Zırhlı)',
    efficiencyText: '12 lt / 100 km',
    tankCapacity: 90,
    description: 'Yüksek korumalı balistik zırh kaplama. Zorlu iklim ve arazi koşullarında üstün performans.'
  },
  {
    id: 'vip_sedan',
    name: 'Ultra Lüks VIP Sedan',
    category: 'Makam / Prestij Sedan',
    price: 280000,
    emoji: '🏎️',
    imagePath: '/assets/vip_sedan.webp',
    speedText: '250 km/s',
    efficiencyText: '10 lt / 100 km',
    tankCapacity: 80,
    description: 'Milletvekilleri, bakanlar ve devlet başkanları için tasarlanmış prestij ve lüksün zirvesi.'
  }
];

interface MarketplaceViewProps {
  user: any;
  commodities: CommodityItem[];
  onBuyItem: (item: MarketplaceItem) => void;
  onBuyCommodity: (commodityId: string, amount: number, currentPrice: number) => void;
  onSellCommodity: (commodityId: string, amount: number, currentPrice: number) => void;
  onBuyVehicle?: (vehicleId: string, price: number) => void;
  onBuyFuel?: (liters: number, pricePerLiter: number) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  user,
  commodities,
  onBuyItem,
  onBuyCommodity,
  onSellCommodity,
  onBuyVehicle,
  onBuyFuel
}) => {
  const [marketSubTab, setMarketSubTab] = useState<'supermarket' | 'borsa' | 'gallery'>('borsa');
  const [selectedBorsaCommodityId, setSelectedBorsaCommodityId] = useState<string>('coal');
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const selectedComm = commodities.find(c => c.id === selectedBorsaCommodityId) || commodities[0];
  const userInvAmount = user.materials[selectedComm.id] || 0;
  const totalCost = Math.round(tradeAmount * selectedComm.currentPrice * 100) / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Borsa & Market Subtab Selection */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem'
      }}>
        <button
          onClick={() => setMarketSubTab('borsa')}
          className={marketSubTab === 'borsa' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          📈 Milli Emtia Borsası (Al-Sat)
        </button>
        <button
          onClick={() => setMarketSubTab('supermarket')}
          className={marketSubTab === 'supermarket' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          🛒 Karakter Süpermarketi
        </button>
        <button
          onClick={() => setMarketSubTab('gallery')}
          className={marketSubTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          🚗 Araç Galerisi & Yakıt
        </button>
      </div>

      {marketSubTab === 'supermarket' && (
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-emerald))' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white' }}>
            <span>🛒</span> Karakter Süpermarketi
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
            Açlık, susuzluk ve enerji göstergelerinizi yenilemek için marketten alışveriş yapın. Nakit paranız doğrudan cüzdandan düşülür.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {MARKETPLACE_ITEMS.map((item, idx) => (
              <GlassCard key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{item.emoji}</div>
                <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--accent-emerald))', fontWeight: 600 }}>
                  +{item.replenishValue} {item.replenishType === 'hunger' ? 'Açlık' : item.replenishType === 'thirst' ? 'Su' : item.replenishType === 'energy' ? 'Enerji' : 'Sağlık'}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                  {item.price} ₺
                </div>
                <button 
                  onClick={() => onBuyItem(item)}
                  className="btn-success" 
                  style={{ padding: '0.5rem', width: '100%', marginTop: '0.5rem', fontSize: '0.85rem' }}
                >
                  Satın Al
                </button>
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      )}

      {marketSubTab === 'borsa' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* Borsa Commodity Prices List */}
          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏢 Milli Emtia Borsası Tahtası
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                ● Canlı Veri (10s)
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {commodities.map((item) => {
                const isUp = item.priceTrend[item.priceTrend.length - 1] >= item.priceTrend[item.priceTrend.length - 2];
                
                // Sparkline values
                const minVal = Math.min(...item.priceTrend);
                const maxVal = Math.max(...item.priceTrend);
                const spread = maxVal - minVal || 1;
                const points = item.priceTrend.map((val, idx) => {
                  const x = (idx / (item.priceTrend.length - 1)) * 70;
                  const y = 22 - ((val - minVal) / spread) * 16;
                  return `${x},${y}`;
                }).join(' ');

                const isSelected = item.id === selectedBorsaCommodityId;

                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSelectedBorsaCommodityId(item.id);
                      setTradeAmount(1);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid hsl(var(--accent-cyan))' : '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="glass-panel-interactive"
                  >
                    {/* Left: Emoji + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '200px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                          {item.symbol} • {item.category}
                        </div>
                      </div>
                    </div>

                    {/* Center: Sparkline */}
                    <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                      <svg width="70" height="25" style={{ overflow: 'visible' }}>
                        <polyline
                          fill="none"
                          stroke={isUp ? '#10b981' : '#ef4444'}
                          strokeWidth="1.5"
                          points={points}
                        />
                      </svg>
                    </div>

                    {/* Right: Info */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                        {item.currentPrice.toFixed(2)} ₺
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isUp ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.1rem' }}>
                        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{((item.currentPrice - item.basePrice) / item.basePrice * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Right Side Stack: Portfolio & Order Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '380px' }}>
            {/* Kişisel Emtia Portföyü */}
            <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
                💼 Emtia Rezerv Portföyü
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
                {commodities.map((c) => {
                  const amount = user.materials[c.id] || 0;
                  return (
                    <div key={c.id} style={{
                      padding: '0.5rem',
                      background: amount > 0 ? 'rgba(168, 85, 247, 0.06)' : 'rgba(255,255,255,0.01)',
                      border: amount > 0 ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.15rem',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      <span style={{ fontSize: '1.3rem' }}>{c.emoji}</span>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: amount > 0 ? 'hsl(var(--accent-purple))' : 'hsl(var(--text-muted))' }}>
                        {amount.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Borsa Order Execution Panel */}
            <GlassCard style={{ borderLeft: `4px solid ${tradeType === 'buy' ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))'}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚖️ Emir Giriş Paneli
            </h3>

            {/* Trade Type Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '8px' }}>
              <button
                onClick={() => setTradeType('buy')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  background: tradeType === 'buy' ? 'hsl(var(--accent-emerald))' : 'transparent',
                  color: 'white',
                  borderRadius: '6px'
                }}
              >
                AL (BUY)
              </button>
              <button
                onClick={() => setTradeType('sell')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  background: tradeType === 'sell' ? 'hsl(var(--accent-red))' : 'transparent',
                  color: 'white',
                  borderRadius: '6px'
                }}
              >
                SAT (SELL)
              </button>
            </div>

            {/* Selected Commodity Display */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Seçili Emtia:</span>
                <strong style={{ color: 'white' }}>{selectedComm.emoji} {selectedComm.name} ({selectedComm.symbol})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Anlık Fiyat:</span>
                <strong style={{ color: 'hsl(var(--accent-gold))' }}>{selectedComm.currentPrice.toFixed(2)} ₺</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Envanteriniz:</span>
                <strong style={{ color: '#06b6d4' }}>{userInvAmount} birim</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Nakit Cüzdan:</span>
                <strong style={{ color: '#10b981' }}>{user.cash.toFixed(2)} ₺</strong>
              </div>
            </div>

            {/* Commodity Technical Profile */}
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px dashed rgba(255,255,255,0.08)',
              fontSize: '0.75rem',
              lineHeight: '1.4',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ fontWeight: 700, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                📖 Stratejik Kaynak Profili
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Çıkarıldığı Şehir:</span>
                <strong style={{ color: 'hsl(var(--accent-gold))' }}>{
                  selectedComm.id === 'coal' ? 'Zonguldak Cumhuriyeti' :
                  selectedComm.id === 'iron_ore' ? 'Sivas Cumhuriyeti' :
                  selectedComm.id === 'steel' ? 'Karabük Cumhuriyeti (Eritme)' :
                  selectedComm.id === 'copper' ? 'Kastamonu Cumhuriyeti' :
                  selectedComm.id === 'aluminum' ? 'Konya Cumhuriyeti' :
                  selectedComm.id === 'lithium' ? 'Eskişehir Cumhuriyeti' :
                  selectedComm.id === 'boron' ? 'Balıkesir Cumhuriyeti' :
                  selectedComm.id === 'petroleum' ? 'Batman Cumhuriyeti' :
                  'Ankara Cumhuriyeti'
                }</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Kategori:</span>
                <span style={{ 
                  color: 'white', 
                  fontSize: '0.7rem', 
                  padding: '0.05rem 0.35rem', 
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {selectedComm.category}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>⚙️ Kullanım Amacı:</span>
                <span style={{ color: 'white' }}>{
                  selectedComm.id === 'coal' ? 'Enerji santrallerini besler, demir-çelik eritme tesislerinde ısı kaynağı olarak kullanılır.' :
                  selectedComm.id === 'iron_ore' ? 'Çelik alaşımının ana hammaddesidir. Sanayi parçaları ve askeri mühimmat üretiminde kullanılır.' :
                  selectedComm.id === 'steel' ? 'Fabrika yükseltmeleri, ağır sanayi ve savunma sanayii gövde zırhlarında kullanılır.' :
                  selectedComm.id === 'copper' ? 'Güç trafoları, elektrik şebekeleri ve mikroçip devre kartlarında kullanılır.' :
                  selectedComm.id === 'aluminum' ? 'Hafif gövde yapısıyla otomobil gövdeleri ve İHA/SİHA kaplamalarında kullanılır.' :
                  selectedComm.id === 'lithium' ? 'Pil ve enerji depolama hücresi üretimi, elektrikli araç bataryaları için kritiktir.' :
                  selectedComm.id === 'boron' ? 'Isı korumalı tank zırhları, nükleer reaktör çubukları ve roket yakıtlarında kullanılır.' :
                  selectedComm.id === 'petroleum' ? 'Rafinerilerde akaryakıt, sentetik plastik hammaddesi ve asfalt üretmek amacıyla rafine edilir.' :
                  'Mikroişlemciler, otomasyon kartları, radar donanımları ve yarı iletken çiplerin ana maddesidir.'
                }</span>
              </div>
            </div>

            {/* Trade Amount Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                İşlem Miktarı (Birim)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="1"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ flex: 1, padding: '0.5rem' }}
                />
                <button 
                  onClick={() => {
                    if (tradeType === 'buy') {
                      const maxBuy = Math.floor(user.cash / selectedComm.currentPrice);
                      setTradeAmount(Math.max(1, maxBuy));
                    } else {
                      setTradeAmount(Math.max(1, Math.floor(userInvAmount)));
                    }
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                >
                  MAKS
                </button>
              </div>
              
              {/* Quick Add Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                {[5, 10, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setTradeAmount(prev => prev + val)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Total cost and execution */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                  Toplam Tutar:
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'white' }}>
                  {totalCost.toLocaleString('tr-TR')} ₺
                </strong>
              </div>

              {tradeType === 'buy' ? (
                <button
                  onClick={() => onBuyCommodity(selectedComm.id, tradeAmount, selectedComm.currentPrice)}
                  className="btn-success"
                  style={{ padding: '0.75rem', width: '100%', fontWeight: 700 }}
                >
                  Alım Talebi Gönder (BUY)
                </button>
              ) : (
                <button
                  onClick={() => onSellCommodity(selectedComm.id, tradeAmount, selectedComm.currentPrice)}
                  className="btn-danger"
                  style={{ padding: '0.75rem', width: '100%', fontWeight: 700 }}
                >
                  Satış Talebi Gönder (SELL)
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.3' }}>
              ⚠️ Borsa fiyatları serbest piyasa koşullarına göre dalgalanmaktadır. Lütfen yatırımlarınızı kontrol ederek yapınız.
            </span>

          </GlassCard>
        </div>
      </div>
      )}
      {marketSubTab === 'gallery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Benzinlik Refueling Station Widget */}
          {(() => {
            const petroleumComm = commodities.find(c => c.id === 'petroleum') || { currentPrice: 280 };
            const fuelPricePerLiter = Math.round(petroleumComm.currentPrice * 0.15);
            const userOwned = user.ownedVehicles || [];
            const maxCapacity = userOwned.length > 0
              ? Math.max(...userOwned.map((id: string) => VEHICLE_ITEMS.find(v => v.id === id)?.tankCapacity || 50))
              : 50;
            const currentFuel = user.fuelLiters || 0;
            const missingFuel = Math.max(0, maxCapacity - currentFuel);
            
            return (
              <GlassCard style={{
                borderLeft: '4px solid hsl(var(--accent-gold))',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(20, 15, 5, 0.1) 100%)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))' }}>⛽</div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                      Milli Petrol A.Ş. Benzin İstasyonu
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                      Borsa petrol endeksine bağlı güncel yakıt fiyatı: <strong style={{ color: 'hsl(var(--accent-gold))' }}>{fuelPricePerLiter} ₺ / Litre</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        ⛽ Depo Durumu: {currentFuel.toFixed(1)} / {maxCapacity} Litre
                      </span>
                      <div style={{ width: '120px', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (currentFuel / maxCapacity) * 100)}%`,
                          height: '100%',
                          background: currentFuel < 10 ? '#ef4444' : 'hsl(var(--accent-gold))',
                          borderRadius: '4px',
                          boxShadow: '0 0 6px rgba(245, 158, 11, 0.4)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[5, 10, 20].map(liters => (
                    <button
                      key={liters}
                      onClick={() => onBuyFuel && onBuyFuel(liters, fuelPricePerLiter)}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      +{liters} Litre ({(liters * fuelPricePerLiter)} ₺)
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      if (missingFuel > 0 && onBuyFuel) {
                        onBuyFuel(Math.round(missingFuel * 10) / 10, fuelPricePerLiter);
                      }
                    }}
                    disabled={missingFuel <= 0.1}
                    className="btn-primary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: missingFuel <= 0.1 ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Depoyu Doldur (+{missingFuel.toFixed(1)} lt)
                  </button>
                </div>
              </GlassCard>
            );
          })()}

          {/* Showroom Vehicles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '0.5rem'
          }}>
            {VEHICLE_ITEMS.map((vehicle) => {
              const isOwned = (user.ownedVehicles || []).includes(vehicle.id);
              
              return (
                <GlassCard
                  key={vehicle.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: isOwned ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isOwned ? '0 8px 24px rgba(16, 185, 129, 0.08)' : 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="glass-panel-interactive"
                >
                  {isOwned && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      zIndex: 1
                    }}>
                      ✓ GARAJINIZDA
                    </div>
                  )}

                  {/* Vehicle visual card */}
                  <div style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <img
                      src={vehicle.imagePath}
                      alt={vehicle.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))'
                      }}
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 800, margin: '0 0 0.15rem 0' }}>
                    {vehicle.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>
                    {vehicle.category}
                  </span>

                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '0 0 1rem 0', flexGrow: 1 }}>
                    {vehicle.description}
                  </p>

                  {/* Metrics Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.15)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}>
                    <div>
                      <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Maks Hız</span>
                      <strong style={{ color: 'white' }}>{vehicle.speedText}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Tüketim</span>
                      <strong style={{ color: 'hsl(var(--accent-cyan))' }}>{vehicle.efficiencyText}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--text-muted))', display: 'block' }}>Depo</span>
                      <strong style={{ color: 'hsl(var(--accent-gold))' }}>{vehicle.tankCapacity} Lt</strong>
                    </div>
                  </div>

                  {/* Price and Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Anahtar Teslim Fiyatı</span>
                      <strong style={{ fontSize: '1.25rem', color: 'white' }}>
                        {vehicle.price.toLocaleString('tr-TR')} ₺
                      </strong>
                    </div>
                    <button
                      onClick={() => onBuyVehicle && onBuyVehicle(vehicle.id, vehicle.price)}
                      disabled={isOwned}
                      className={isOwned ? "btn-secondary" : "btn-success"}
                      style={{
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        opacity: isOwned ? 0.6 : 1,
                        cursor: isOwned ? 'default' : 'pointer'
                      }}
                    >
                      {isOwned ? "Garajda" : "Satın Al"}
                    </button>
                  </div>

                </GlassCard>
              );
            })}
          </div>

        </div>
      )}
      
      </div>
  );
};
