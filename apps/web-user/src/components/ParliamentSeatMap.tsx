import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Play } from 'lucide-react';

interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  emoji: string;
}

const ALL_POSSIBLE_PARTIES: Party[] = [
  { id: 'akp', name: 'Adalet ve Kalkınma Partisi', shortName: 'AKP', color: '#f97316', emoji: '🍊' },
  { id: 'chp', name: 'Cumhuriyet Halk Partisi', shortName: 'CHP', color: '#ef4444', emoji: '🔴' },
  { id: 'dem', name: 'Halkların Eşitlik ve Demokrasi Partisi', shortName: 'DEM', color: '#a855f7', emoji: '🍇' },
  { id: 'mhp', name: 'Milliyetçi Hareket Partisi', shortName: 'MHP', color: '#06b6d4', emoji: '🌙' },
  { id: 'iyi', name: 'İYİ Parti', shortName: 'İYİ', color: '#eab308', emoji: '☀️' },
  { id: 'tip', name: 'Türkiye İşçi Partisi', shortName: 'TİP', color: '#be123c', emoji: '✊' },
  { id: 'yrp', name: 'Yeniden Refah Partisi', shortName: 'YRP', color: '#3b82f6', emoji: '🌟' },
  { id: 'zafer', name: 'Zafer Partisi', shortName: 'ZAFER', color: '#854d0e', emoji: '🏹' },
];

const TURKEY_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Mustafa', 'Süleyman', 'Ali', 'Hüseyin', 'Hasan', 'Kemal', 'Murat', 'Recep', 'Bülent', 'İlker', 'Serkan', 'Cem', 'Deniz', 'Can', 'Fatih', 'Hakan', 'Onur', 'Volkan', 'Yusuf', 'Ercan', 'Salih', 'Metin'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Koç', 'Kurt', 'Özcan', 'Tekin', 'Bulut', 'Yavuz', 'Güneş', 'Karahan', 'Sarı'];

function getStableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

interface Seat {
  id: number;
  row: number;
  angle: number;
  x: number;
  y: number;
  party: Party | null;
  repName: string;
}

interface ParliamentSeatMapProps {
  userProvince?: string;
  userRole?: string;
}

const ParliamentSeatMapComponent: React.FC<ParliamentSeatMapProps> = ({ userProvince = 'Yalova', userRole = 'VATANDAS' }) => {
  const [selectedProvince, setSelectedProvince] = useState<string>(userProvince);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [showSimulatedResult, setShowSimulatedResult] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const [activeSpeech, setActiveSpeech] = useState<string>(
    'Meclis askıya alındı. İlk genel seçim geri sayımı bekleniyor.'
  );

  const [showLawModal, setShowLawModal] = useState<boolean>(false);
  const [lawTitle, setLawTitle] = useState<string>('');
  const [lawDescription, setLawDescription] = useState<string>('');
  const [lawCategory, setLawCategory] = useState<string>('Teşvik');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmitLaw = async () => {
    if (!lawTitle.trim() || !lawDescription.trim()) {
      alert('Lütfen yasa başlığı ve gerekçesini doldurunuz.');
      return;
    }

    const token = localStorage.getItem('politic_token');
    if (!token) {
      alert('Yasa teklif etmek için giriş yapmalısınız.');
      return;
    }

    try {
      const res = await fetch('/api/v1/politics/laws/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: lawTitle,
          content: lawDescription,
          parliamentId: 'default-tbmm'
        })
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Yasa teklifi sunulurken bir hata oluştu.');
        return;
      }

      setSubmitStatus('Kanun teklifiniz başarıyla meclis başkanlığına sunuldu! Oylama Bekleyenler sekmesinden takip edip onaylayabilir veya reddedebilirsiniz.');
      setLawTitle('');
      setLawDescription('');

      // Trigger state synchronization event so other components (like App.tsx) know to reload pending laws
      window.dispatchEvent(new Event('pending_laws_updated'));

      setTimeout(() => {
        setShowLawModal(false);
        setSubmitStatus(null);
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Bağlantı hatası: Teklif sunulamadı.');
    }
  };

  // Countdown timer logic
  useEffect(() => {
    let target = localStorage.getItem('first_election_target');
    if (!target) {
      const newTarget = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('first_election_target', newTarget.toString());
      target = newTarget.toString();
    }

    const targetTime = parseInt(target, 10);

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft('0 Gün 0 Saat 0 Dakika 0 Saniye (Seçim Günü Geldi!)');
        return;
      }
      
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimeLeft(`${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniye`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine active parties in the selected city-state (province)
  const activeParties = useMemo(() => {
    const hash = getStableHash(selectedProvince);
    const shuffled = [...ALL_POSSIBLE_PARTIES];
    // Stable shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (hash + i) % (i + 1);
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    const count = 3 + (hash % 3); // 3 to 5 parties active
    return shuffled.slice(0, count);
  }, [selectedProvince]);

  // Determine bot president name for selected city-state
  const botPresident = useMemo(() => {
    const hash = getStableHash(selectedProvince);
    const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(hash * 7) % LAST_NAMES.length];
    return `${firstName} ${lastName}`;
  }, [selectedProvince]);

  // Seat allocations for simulation view
  const simulatedPartySeats = useMemo(() => {
    const hash = getStableHash(selectedProvince);
    const seatAllocation: { [partyId: string]: number } = {};
    
    // Generate weights
    let totalWeight = 0;
    const weights = activeParties.map((p, idx) => {
      const w = 15 + ((hash * (idx + 1)) % 75);
      totalWeight += w;
      return { partyId: p.id, weight: w };
    });

    let assignedSeats = 0;
    weights.forEach((w, idx) => {
      if (idx === weights.length - 1) {
        seatAllocation[w.partyId] = 300 - assignedSeats; // Representing 300 seats for map
      } else {
        const seats = Math.round((w.weight / totalWeight) * 300);
        seatAllocation[w.partyId] = seats;
        assignedSeats += seats;
      }
    });

    return seatAllocation;
  }, [selectedProvince, activeParties]);

  // Generate seats in a beautiful 3D Hemicycle layout
  const seats = useMemo(() => {
    const generatedSeats: Seat[] = [];
    const rows = 8;
    const seatsPerRow = [18, 24, 30, 36, 42, 46, 50, 54]; // Sum is 300 seats
    
    const tempPositions: { row: number; angleIndex: number; totalInRow: number; angle: number }[] = [];

    for (let r = 0; r < rows; r++) {
      const count = seatsPerRow[r];
      for (let s = 0; s < count; s++) {
        const angle = 15 + (s / (count - 1)) * 150;
        tempPositions.push({ row: r, angleIndex: s, totalInRow: count, angle });
      }
    }

    // Sort positions by angle (Left to Right)
    tempPositions.sort((a, b) => b.angle - a.angle);

    // Build party assignments based on simulation view or empty
    const partyAssignment: (Party | null)[] = [];
    
    if (showSimulatedResult) {
      activeParties.forEach(party => {
        const allocated = simulatedPartySeats[party.id] || 0;
        for (let i = 0; i < allocated; i++) {
          partyAssignment.push(party);
        }
      });
      // Pad/trim
      while (partyAssignment.length < tempPositions.length) {
        partyAssignment.push(activeParties[0]);
      }
      if (partyAssignment.length > tempPositions.length) {
        partyAssignment.splice(tempPositions.length);
      }
    } else {
      // Empty seats by default
      for (let i = 0; i < tempPositions.length; i++) {
        partyAssignment.push(null);
      }
    }

    tempPositions.forEach((pos, idx) => {
      const party = partyAssignment[idx];
      const radius = 110 + pos.row * 24;
      const angleRad = (pos.angle * Math.PI) / 180;
      
      const x = radius * Math.cos(angleRad);
      const y = radius * Math.sin(angleRad);

      const districtList = [
        'Merkez',
        'Çınarcık',
        'Altınova',
        'Armutlu',
        'Çiftlikköy',
        'Termal',
        'Hürriyet',
        'Cumhuriyet',
        'Yıldız',
        'Yenişehir'
      ];
      const randomDistrict = districtList[Math.floor((pos.angle + pos.row) % districtList.length)];

      generatedSeats.push({
        id: idx + 1,
        row: pos.row,
        angle: pos.angle,
        x,
        y,
        party,
        repName: party 
          ? `${party.shortName} Temsilcisi (${selectedProvince} - ${randomDistrict})`
          : `Boş Sandalye (Milletvekili Seçimi Bekleniyor)`
      });
    });

    return generatedSeats;
  }, [selectedProvince, showSimulatedResult, activeParties, simulatedPartySeats]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Selector and Countdown Panel */}
      <GlassCard className="parliament-header-grid" style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', padding: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.4rem', fontWeight: 600 }}>
            🏛️ Görüntülenecek Şehir Devleti Meclisi
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedParty(null);
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {TURKEY_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p} Cumhuriyeti
              </option>
            ))}
          </select>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            👑 <strong>Geçici Cumhurbaşkanı (Bot):</strong>{' '}
            <span style={{ color: 'hsl(var(--accent-gold))', fontWeight: 700 }}>
              {botPresident} (Vekaleten)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.3rem' }}>
            🗳️ İlk Genel Seçimlere Kalan Geri Sayım
          </span>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'hsl(var(--accent-red))',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            width: 'fit-content'
          }}>
            ⏱️ {timeLeft}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.4rem' }}>
            * Seçim gününe kadar tüm meclis koltukları boş kalacaktır.
          </span>
        </div>
      </GlassCard>

      {/* Main Split Layout: Seating Map on Left, Party Projections on Right */}
      <div className="parliament-layout-grid">
        
        {/* Left Panel: 3D Seating Map */}
        <GlassCard className="parliament-left-panel" style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '4px solid hsl(var(--accent-gold))' }}>
          
          {/* 3D Scene Wrapper */}
          <div className="parliament-chamber-wrapper">
            {/* Tilted Floor Grid */}
            <div className="parliament-floor-grid" style={{
              position: 'absolute',
              bottom: '-20px',
              transform: 'rotateX(55deg) scale(var(--floor-scale, 1))',
              transformStyle: 'preserve-3d',
              background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.4) 0%, rgba(0, 0, 0, 0.8) 80%)',
              border: '2px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '50% 50% 0 0',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9)',
            }}>
              
              {/* Elevated circular marble rostrum base platform (Kürsü Kaidesi) */}
              <div style={{
                position: 'absolute',
                left: 'calc(50% - 25px)',
                bottom: '32px',
                width: '50px',
                height: '25px',
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '50%',
                transform: 'translateZ(6px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.7)',
                zIndex: 15
              }} />

              {/* Assembly Podium (Meclis Kürsüsü - High quality matte obsidian slate) */}
              <div style={{
                position: 'absolute',
                left: 'calc(50% - 15px)',
                bottom: '38px',
                width: '30px',
                height: '38px',
                background: 'linear-gradient(180deg, #27272a 0%, #09090b 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '3px 3px 2px 2px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.8)',
                transform: 'translateZ(20px) rotateX(-12deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: '12px',
                zIndex: 25
              }}>
                {/* Subtle Gold Crescent Emblem */}
                <div style={{ 
                  fontSize: '0.6rem', 
                  color: '#d97706',
                  opacity: 0.9,
                  fontWeight: 'bold',
                  marginTop: '1px'
                }}>
                  ☪
                </div>
                
                {/* Tiny Rostrum Microphone */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '4px',
                  width: '1px',
                  height: '8px',
                  background: '#3f3f46',
                  transform: 'rotateZ(-20deg)',
                  transformStyle: 'preserve-3d'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-1px',
                    width: '2px',
                    height: '2px',
                    background: '#18181b',
                    borderRadius: '50%'
                  }} />
                </div>

                {/* Micro Turkish flag on front of rostrum */}
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: 'calc(50% - 7px)',
                  width: '14px',
                  height: '9px',
                  backgroundColor: '#e11d48',
                  borderRadius: '1px',
                  border: '0.5px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '4px',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }}>
                  🇹🇷
                </div>
              </div>

              {/* Speaker Board (Meclis Başkanlık Divanı) behind podium */}
              <div style={{
                position: 'absolute',
                left: 'calc(50% - 65px)',
                bottom: '5px',
                width: '130px',
                height: '25px',
                background: 'linear-gradient(to top, #1e293b, #334155)',
                border: '1.5px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                transform: 'translateZ(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.55rem',
                color: '#94a3b8',
                fontWeight: 800,
                gap: '0.25rem'
              }}>
                🏛️ MECLİS BAŞKANLIĞI
              </div>

              {/* Render realistic 3D Desk-and-Chair Seating Components */}
              {seats.map((seat) => {
                const isDimmed = selectedParty !== null && seat.party && seat.party.id !== selectedParty;
                const isHovered = hoveredSeat?.id === seat.id;
                const isOccupied = seat.party !== null;
                
                const pxX = 270 + (seat.x * 0.85); // Scale slightly down to fit grid area
                const pxY = 420 - (seat.y * 0.85);

                return (
                  <div
                    key={seat.id}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    style={{
                      position: 'absolute',
                      left: `${pxX - 7}px`,
                      top: `${pxY - 7}px`,
                      width: '14px',
                      height: '14px',
                      transform: `translateZ(${isHovered ? '20px' : '4px'}) rotateX(-55deg)`,
                      transformStyle: 'preserve-3d',
                      cursor: 'pointer',
                      opacity: isDimmed ? 0.15 : 1,
                      transition: 'transform 0.15s ease, opacity 0.2s ease',
                      zIndex: isHovered ? 50 : 10
                    }}
                  >
                    {/* The Desk (Sıra Önü) */}
                    <div style={{
                      position: 'absolute',
                      top: '3px',
                      left: '0px',
                      width: '14px',
                      height: '5px',
                      background: isOccupied ? `${seat.party!.color}ee` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isOccupied ? seat.party!.color : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: isOccupied 
                        ? `0 0 6px ${seat.party!.color}88, inset 0 0 2px rgba(255,255,255,0.5)`
                        : 'none',
                      borderRadius: '1.5px',
                      transform: 'translateZ(3px)',
                      transition: 'all 0.2s'
                    }} />
                    
                    {/* The Chair Backrest (Koltuk Arkalığı) */}
                    <div style={{
                      position: 'absolute',
                      top: '9px',
                      left: '2px',
                      width: '10px',
                      height: '9px',
                      background: isOccupied ? seat.party!.color : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isOccupied ? seat.party!.color : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isOccupied 
                        ? `0 0 8px ${seat.party!.color}aa`
                        : 'none',
                      borderRadius: '2px 2px 0 0',
                      transform: 'rotateX(90deg) translateZ(4px)',
                      transformOrigin: 'bottom',
                      transition: 'all 0.2s'
                    }} />

                    {/* Seat Stem / Connection leg (Koltuk Ayağı) */}
                    <div style={{
                      position: 'absolute',
                      top: '9px',
                      left: '6px',
                      width: '2px',
                      height: isHovered ? '24px' : '8px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateZ(-4px)',
                      pointerEvents: 'none',
                      transition: 'all 0.15s ease'
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Hover Tooltip Panel */}
          {hoveredSeat && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1.5px solid ${hoveredSeat.party ? hoveredSeat.party.color : 'rgba(255,255,255,0.15)'}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 10px ${hoveredSeat.party ? hoveredSeat.party.color : '#ffffff'}11`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              width: '280px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                  SIRA: {hoveredSeat.row + 1} | SEAT: #{hoveredSeat.id}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '3px',
                  background: hoveredSeat.party ? hoveredSeat.party.color : '#475569',
                  color: 'white',
                  fontWeight: 700
                }}>
                  {hoveredSeat.party ? hoveredSeat.party.shortName : 'BOŞ'}
                </span>
              </div>
              <strong style={{ color: 'white', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                {hoveredSeat.repName}
              </strong>
              {hoveredSeat.party && (
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  Grup: {hoveredSeat.party.name}
                </span>
              )}
            </div>
          )}

          {/* Assembly Live Status bar */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            left: hoveredSeat ? '315px' : '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            transition: 'all 0.2s ease',
            fontSize: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: showSimulatedResult ? '#ef4444' : '#64748b', animation: showSimulatedResult ? 'ping 1.5s infinite' : 'none' }} />
              <strong>Gündem:</strong>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>
                {showSimulatedResult 
                  ? 'Simüle edilmiş genel seçim meclis dağılımı yansıtılıyor.' 
                  : activeSpeech}
              </span>
            </div>
            {showSimulatedResult && (
              <button 
                onClick={() => {
                  const items = [
                    'Teşvik Yasası Taslakları inceleniyor.',
                    'Halk Kürsüsü Önergeleri derleniyor.',
                    'Eyalet Altyapı Finansmanı gözden geçiriliyor.'
                  ];
                  setActiveSpeech(items[Math.floor(Math.random() * items.length)]);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.15rem'
                }}
              >
                <Play size={10} /> Değiştir
              </button>
            )}
          </div>
        </GlassCard>

        {/* Right Panel: Parties & Projections */}
        <GlassCard className="parliament-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid hsl(var(--accent-purple))', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'white', margin: 0, fontWeight: 700 }}>
              🗳️ Siyasi Partiler
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>
              Seçim barajı ve projeksiyon dağılımı
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {activeParties.map(p => {
              const isSelected = selectedParty === p.id;
              const seatCount = showSimulatedResult ? (simulatedPartySeats[p.id] || 0) * 2 : 0;
              return (
                <div
                  key={p.id}
                  onClick={() => showSimulatedResult && setSelectedParty(isSelected ? null : p.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? p.color : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: isSelected ? `0 0 12px ${p.color}33` : 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: showSimulatedResult ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>{p.shortName}</div>
                      <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', display: 'block' }}>
                        {showSimulatedResult ? 'Tahmini Sandalye' : 'Seçime Katılıyor'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: showSimulatedResult ? p.color : '#64748b', fontSize: '1rem' }}>
                      {seatCount}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                      {showSimulatedResult 
                        ? `${((seatCount / 600) * 100).toFixed(1)}%` 
                        : '0%'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setShowSimulatedResult(!showSimulatedResult)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: showSimulatedResult 
                  ? 'linear-gradient(135deg, hsl(var(--accent-cyan)) 0%, #0891b2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              {showSimulatedResult ? '⚡ Boş Meclise Dön' : '⚡ Seçim Projeksiyonu Simüle Et'}
            </button>

            <button
              onClick={() => {
                if (userRole !== 'MILLETVEKILI') {
                  alert('Yasa tekliflerini yalnızca Milletvekilleri sunabilir!');
                  return;
                }
                setShowLawModal(true);
              }}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: userRole === 'MILLETVEKILI'
                  ? 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, #4f46e5 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: userRole === 'MILLETVEKILI' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: userRole === 'MILLETVEKILI' ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: userRole === 'MILLETVEKILI' ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                textAlign: 'center',
                boxShadow: userRole === 'MILLETVEKILI' ? '0 4px 12px rgba(168, 85, 247, 0.2)' : 'none'
              }}
            >
              📜 Kürsüye Kanun Teklifi Sun
            </button>

            <p style={{ fontSize: '0.65rem', color: '#64748b', margin: '0.2rem 0 0 0', textAlign: 'center', lineHeight: '1.3' }}>
              Teklif ettiğiniz yasa tasarıları oylamaya sunulmak üzere "Oylama Bekleyenler" sekmesine aktarılır.
            </p>
          </div>
        </GlassCard>
        
      </div>

      {/* Modal for Proposing a Law */}
      {showLawModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <GlassCard style={{
            width: '100%',
            maxWidth: '500px',
            borderLeft: '4px solid hsl(var(--accent-purple))',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
                📜 Yeni Kanun Teklifi Sun
              </h3>
              <button 
                onClick={() => { setShowLawModal(false); setSubmitStatus(null); }}
                style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
              Meclis Başkanlık Divanı'na sunulacak ve temsilcilerin oylamasına sunulacak yeni bir yasa tasarısı hazırlayın.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Yasa Başlığı</label>
              <input 
                type="text" 
                placeholder="Örn: Eyalet Ticaret Alanları Vergi Muafiyeti Kanunu" 
                value={lawTitle}
                onChange={(e) => setLawTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Yasa Türü / Kategori</label>
              <select 
                value={lawCategory}
                onChange={(e) => setLawCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Teşvik">Teşvik</option>
                <option value="Vergi">Vergi</option>
                <option value="Altyapı">Altyapı</option>
                <option value="Sosyal Yardım">Sosyal Yardım</option>
                <option value="Reform">Reform</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Gerekçe ve Detaylı Açıklama</label>
              <textarea 
                placeholder="Bu yasanın eyalete sağlayacağı faydalar ve yasa maddeleri..." 
                value={lawDescription}
                onChange={(e) => setLawDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  color: 'white', 
                  padding: '0.75rem',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  resize: 'none'
                }}
              />
            </div>

            {submitStatus && (
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                color: 'hsl(var(--accent-emerald))', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                {submitStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => { setShowLawModal(false); setSubmitStatus(null); }}
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.6rem' }}
              >
                İptal Et
              </button>
              <button 
                onClick={handleSubmitLaw}
                className="btn-primary" 
                style={{ flex: 2, padding: '0.6rem' }}
              >
                Kürsüye Sun 🗳️
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export const ParliamentSeatMap = React.memo(ParliamentSeatMapComponent);
