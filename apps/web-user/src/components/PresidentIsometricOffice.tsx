import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Send, Users, ShieldAlert, Landmark, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useIsometricEngine } from './isometric/useIsometricEngine';
import { findPath } from './isometric/pathfinder';
import { FURNITURE_PRICES } from './isometric/constants';
import { FurniturePreview } from './isometric/FurniturePreview';
import type { IsometricObject } from './isometric/types';
import { GRID_SIZE, TILE_W, TILE_H } from './isometric/types';

interface PresidentIsometricOfficeProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  treasuryBalance: number;
  setTreasuryBalance: React.Dispatch<React.SetStateAction<number>>;
  inflationRate: number;
  setInflationRate: React.Dispatch<React.SetStateAction<number>>;
  addLog: (msg: string) => void;
}

interface ChatMessage {
  timestamp: string;
  sender: string;
  senderColor: string;
  text: string;
  isSystem?: boolean;
}

const OBJECTS: IsometricObject[] = [
  { id: 'office_desk', name: 'Makam Masası', x: 2, y: 2, color: '#7f1d1d', desc: 'Cumhurbaşkanlığı Makamı', flipX: true },
  { id: 'office_desk', name: 'Özel Kalem Masası', x: 5, y: 2, color: '#1e293b', desc: 'Sekreterya', flipX: true },
  { id: 'sofa', name: 'Külliye Bekleme Salonu', x: 1, y: 6, color: '#dc2626', desc: 'Misafir Koltuğu' },
  { id: 'safe', name: 'Devlet Sırrı Arşivi', x: 0, y: 1, color: '#475569', desc: 'Arşiv' },
  { id: 'plant', name: 'Asırlık Çınar Bonsai', x: 7, y: 1, color: '#15803d', desc: 'Tarihi Çınar' },
  { id: 'board', name: 'Ülke Kriz Radarı', x: 4, y: 0, color: '#f8fafc', desc: 'Kriz Masası', flipX: true }
];

const PresidentIsometricOfficeComponent: React.FC<PresidentIsometricOfficeProps> = ({
  user,
  setUser,
  treasuryBalance,
  setTreasuryBalance,
  inflationRate,
  setInflationRate,
  addLog
}) => {
  // Bubble Refs for communication with the renderer
  const bossBubbleRef = useRef<string>("");
  const staffABubbleRef = useRef<string>("");
  const staffBBubbleRef = useRef<string>("");
  
  const bossBubbleTimerRef = useRef<any>(null);
  const staffBBubbleTimerRef = useRef<any>(null);

  // Initialize engine hook
  const {
    canvasRef,
    containerRef,
    dimensions,
    isFullScreen,
    setIsFullScreen,
    isMobile,
    isEditingLayout,
    setIsEditingLayout,
    selectedObject,
    setSelectedObject,
    isMovingObject,
    setIsMovingObject,
    officeObjects,
    setOfficeObjects,
    storeCategory,
    setStoreCategory,
    spriteSheet,
    saveLayout,
    cancelLayout,
    charXRef,
    charYRef,
    walkPathRef
  } = useIsometricEngine({
    officeType: 'president',
    companyId: 'president-default',
    initialObjects: OBJECTS,
    staffACoord: { x: 6, y: 2 },
    staffBCoord: { x: 1, y: 5 },
    bossBubbleRef,
    staffABubbleRef,
    staffBBubbleRef,
    gender: user?.gender,
    isometricModelId: user?.isometricModelId
  });

  // President Specific UI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [showPresidentModal, setShowPresidentModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'upgrades' | 'decisions'>('upgrades');
  const [upgrades, setUpgrades] = useState({ intel: 0, centralBank: 0, diplomacy: 0, afad: 0 });
  const [decisionMade, setDecisionMade] = useState(false);

  // Load upgrades on mount
  useEffect(() => {
    const saved = localStorage.getItem('president_upgrades');
    if (saved) setUpgrades(JSON.parse(saved));
    
    const dec = localStorage.getItem('president_decision_made');
    if (dec === 'true') setDecisionMade(true);

    bossBubbleRef.current = "Cumhurbaşkanlığı Külliyesine Hoş Geldiniz!";
    if (bossBubbleTimerRef.current) clearTimeout(bossBubbleTimerRef.current);
    bossBubbleTimerRef.current = setTimeout(() => { bossBubbleRef.current = ""; }, 5000);
    setChatMessages([
      { timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), sender: 'Sistem', senderColor: '#94a3b8', text: "Külliye Makam Odası kanalı aktif edildi.", isSystem: true }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const buyUpgrade = (key: 'intel' | 'centralBank' | 'diplomacy' | 'afad') => {
    const currentLvl = upgrades[key];
    const maxLvl = (key === 'intel' || key === 'afad') ? 3 : 5;
    if (currentLvl >= maxLvl) return;

    let cost = 0;
    let label = '';
    if (key === 'intel') { cost = currentLvl * 500000 + 250000; label = 'İstihbarat Ağı Genişletmesi'; }
    if (key === 'centralBank') { cost = currentLvl * 300000 + 200000; label = 'Merkez Bankası Dijitalleşmesi'; }
    if (key === 'diplomacy') { cost = currentLvl * 400000 + 150000; label = 'Diplomasi Masası Modernizasyonu'; }
    if (key === 'afad') { cost = currentLvl * 1000000 + 500000; label = 'Acil Durum Müdahale Fonu'; }

    if (treasuryBalance < cost) {
      alert(`Hazine Yetersiz! Bu yatırım için hazinede en az ₺${cost.toLocaleString('tr-TR')} olmalıdır.`);
      return;
    }

    const nextUpgrades = { ...upgrades, [key]: currentLvl + 1 };
    setUpgrades(nextUpgrades);
    localStorage.setItem('president_upgrades', JSON.stringify(nextUpgrades));

    setTreasuryBalance((prev: number) => prev - cost);

    let logMessage = `👑 Devlet Yatırımı: ${label} seviye ${currentLvl + 1}'e yükseltildi! (-₺${cost.toLocaleString('tr-TR')} Hazine)`;
    if (key === 'intel') {
      setUser((prev: any) => ({ ...prev, politicalInfluence: prev.politicalInfluence + 200 }));
      logMessage += ` (+200 Nüfuz, Güvenlik Endeksi arttı)`;
    } else if (key === 'centralBank') {
      logMessage += ` (+%15 Hazine Vergi Geliri verimliliği)`;
    } else if (key === 'diplomacy') {
      setUser((prev: any) => ({ ...prev, politicalReputation: prev.politicalReputation + 100 }));
      logMessage += ` (+100 Küresel İtibar, Dış ticaret güçlendi)`;
    } else if (key === 'afad') {
      setUser((prev: any) => ({ ...prev, politicalInfluence: prev.politicalInfluence + 500 }));
      logMessage += ` (+500 Nüfuz, Olası isyanlar önlendi)`;
    }
    addLog(logMessage);
  };

  const makeDecision = (choice: 'A' | 'B' | 'C') => {
    if (decisionMade) return;

    if (choice === 'A') {
      setTreasuryBalance((prev: number) => prev + 500000);
      setUser((prev: any) => ({ ...prev, politicalInfluence: Math.max(0, prev.politicalInfluence - 300) }));
      addLog('👑 Kriz Kararı: Sert kemer sıkma politikası uygulandı. Vergiler artırıldı. (+₺500.000 Hazine, -300 Nüfuz / Halk Desteği düştü)');
    } else if (choice === 'B') {
      setInflationRate((prev: number) => prev + 5.0);
      setUser((prev: any) => ({ ...prev, politicalInfluence: prev.politicalInfluence + 400, politicalReputation: Math.max(0, prev.politicalReputation - 100) }));
      addLog('👑 Kriz Kararı: Merkez Bankasından karşılıksız para basılıp teşvik dağıtıldı! (+400 Nüfuz, -100 İtibar, Enflasyon +%5.0 arttı)');
    } else if (choice === 'C') {
      setTreasuryBalance((prev: number) => prev + 2000000);
      setUser((prev: any) => ({ ...prev, politicalInfluence: Math.max(0, prev.politicalInfluence - 150) }));
      addLog('👑 Kriz Kararı: Şirketlerden bir kerelik Acil Varlık Vergisi tahsil edildi! (+₺2.000.000 Hazine, Şirketler tepkili, -150 Nüfuz)');
    }

    localStorage.setItem('president_decision_choice', choice);
    localStorage.setItem('president_decision_made', 'true');
    setDecisionMade(true);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      sender: user.username || 'Cumhurbaşkanı',
      senderColor: '#f59e0b',
      text: inputText.trim()
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputText('');

    bossBubbleRef.current = newMsg.text;
    if (bossBubbleTimerRef.current) clearTimeout(bossBubbleTimerRef.current);
    bossBubbleTimerRef.current = setTimeout(() => { bossBubbleRef.current = ""; }, 4000);

    setTimeout(() => {
      const lower = newMsg.text.toLowerCase();
      let replyText = "";
      if (lower.includes('merhaba') || lower.includes('selam')) {
        replyText = "Arz ederim Sayın Cumhurbaşkanım, devletin tüm kurumları talimatlarınızı bekliyor.";
      } else if (lower.includes('hazine') || lower.includes('para') || lower.includes('bütçe')) {
        replyText = `Hazine durumumuz şu an ₺${treasuryBalance.toLocaleString('tr-TR')}. Ek vergi paketleri masanızda.`;
      } else if (lower.includes('kriz') || lower.includes('halk')) {
        replyText = "İstihbarat raporlarına göre halk genel olarak sadık, ancak enflasyondan şikayetçi efendim.";
      } else {
        replyText = "Emredersiniz Sayın Cumhurbaşkanım. İlgili bakanlıklara talimatınızı iletiyorum.";
      }
      
      const replyMsg = {
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        sender: 'Özel Kalem Müdürü',
        senderColor: '#38bdf8',
        text: replyText
      };
      setChatMessages(prev => [...prev, replyMsg]);
      staffBBubbleRef.current = replyText;
      if (staffBBubbleTimerRef.current) clearTimeout(staffBBubbleTimerRef.current);
      staffBBubbleTimerRef.current = setTimeout(() => { staffBBubbleRef.current = ""; }, 4000);
    }, 1500);
  };

  // Custom Click Handler linking the click on Makam Masası & Kriz Radarı to modal triggers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const scaleFactor = Math.min(width / 550, height / 350);
    const translateX = (width - 550 * scaleFactor) / 2;
    const translateY = (height - 350 * scaleFactor) / 2;

    const mouseX = (rawX - translateX) / scaleFactor;
    const mouseY = (rawY - translateY) / scaleFactor;

    const virtualWidth = 550;
    const virtualHeight = 350;
    const centerX = virtualWidth / 2;
    const centerY = virtualHeight / 2.8;

    const u = (mouseX - centerX) / (TILE_W / 2);
    const v = (mouseY - centerY) / (TILE_H / 2);
    const clickX = Math.round((u + v) / 2);
    const clickY = Math.round((v - u) / 2);

    if (clickX >= 0 && clickX < GRID_SIZE && clickY >= 0 && clickY < GRID_SIZE) {
      if (isEditingLayout) {
        const found = officeObjects.find(obj => obj.x === clickX && obj.y === clickY);
        if (found) {
          setSelectedObject(found);
          setIsMovingObject(false);
        } else if (selectedObject && isMovingObject) {
          const isOccupied = officeObjects.some(obj => obj !== selectedObject && obj.x === clickX && obj.y === clickY);
          const isStaff = (clickX === 6 && clickY === 2) || (clickX === 1 && clickY === 5);
          if (!isOccupied && !isStaff) {
            setOfficeObjects(prev => prev.map(obj => {
              if (obj.x === selectedObject.x && obj.y === selectedObject.y && obj.id === selectedObject.id) {
                return { ...obj, x: clickX, y: clickY };
              }
              return obj;
            }));
            setSelectedObject({ ...selectedObject, x: clickX, y: clickY });
            setIsMovingObject(false);
          }
        } else {
          setSelectedObject(null);
        }
        return;
      }

      const currentX = Math.round(charXRef.current);
      const currentY = Math.round(charYRef.current);

      // Makam Masası Click Detection
      if ((clickX === 3 && clickY === 2) || (clickX === 2 && clickY === 2)) {
        const neighbors = [{ x: 3, y: 3 }, { x: 4, y: 2 }, { x: 3, y: 1 }];
        for (const n of neighbors) {
          const path = findPath(currentX, currentY, n.x, n.y, GRID_SIZE, officeObjects, (gx, gy) => (gx === 6 && gy === 2) || (gx === 1 && gy === 5));
          if (path.length > 0) {
            walkPathRef.current = path;
            break;
          }
        }
        setShowPresidentModal(true);
        setActiveModalTab('upgrades');
        return;
      }

      // Kriz Radarı Click Detection
      if (clickX === 4 && clickY === 0) {
        const neighbors = [{ x: 4, y: 1 }, { x: 3, y: 0 }, { x: 5, y: 0 }];
        for (const n of neighbors) {
          const path = findPath(currentX, currentY, n.x, n.y, GRID_SIZE, officeObjects, (gx, gy) => (gx === 6 && gy === 2) || (gx === 1 && gy === 5));
          if (path.length > 0) {
            walkPathRef.current = path;
            break;
          }
        }
        setShowPresidentModal(true);
        setActiveModalTab('decisions');
        return;
      }

      const isStaff = (clickX === 6 && clickY === 2) || (clickX === 1 && clickY === 5);
      const isObstacle = officeObjects.some(obj => obj.x === clickX && obj.y === clickY && !obj.nonBlocking) || isStaff;

      if (!isObstacle) {
        const path = findPath(currentX, currentY, clickX, clickY, GRID_SIZE, officeObjects, (gx, gy) => (gx === 6 && gy === 2) || (gx === 1 && gy === 5));
        if (path.length > 0) walkPathRef.current = path;
      }
    }
  };

  const handleRotate = () => {
    if (!selectedObject) return;
    setOfficeObjects(prev => prev.map(obj => {
      if (obj.x === selectedObject.x && obj.y === selectedObject.y && obj.id === selectedObject.id) {
        const currentDir = typeof obj.direction === 'number' ? obj.direction : (obj.flipX ? 1 : 0);
        const nextDir = (currentDir + 1) % 4;
        return { ...obj, direction: nextDir, flipX: (nextDir === 1 || nextDir === 3) };
      }
      return obj;
    }));
    setSelectedObject(prev => {
      if (!prev) return null;
      const currentDir = typeof prev.direction === 'number' ? prev.direction : (prev.flipX ? 1 : 0);
      const nextDir = (currentDir + 1) % 4;
      return { ...prev, direction: nextDir, flipX: (nextDir === 1 || nextDir === 3) };
    });
  };

  const handleToggleMove = () => {
    setIsMovingObject(prev => !prev);
  };

  const handleDelete = () => {
    if (!selectedObject) return;
    const itemPrice = FURNITURE_PRICES[selectedObject.id]?.price || 0;
    const refund = Math.floor(itemPrice / 2);
    
    setOfficeObjects(prev => prev.filter(obj => !(obj.x === selectedObject.x && obj.y === selectedObject.y && obj.id === selectedObject.id)));
    setSelectedObject(null);
    setIsMovingObject(false);

    if (refund > 0) {
      setUser((prev: any) => ({ ...prev, cash: prev.cash + refund }));
      addLog(`🗑️ Makam Odası: Eşya kaldırıldı, 50% iade yapıldı (+₺${refund.toLocaleString('tr-TR')} Kişisel Nakit)`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Title Header */}
      {!isFullScreen && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', zIndex: 10 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 800 }}>
              🏛️ Cumhurbaşkanlığı Makam Odası
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.15rem', margin: 0 }}>
              Cumhurbaşkanlığı makam odasını dekore edin, kriz radarını yönetin ve stratejik kararlar alın.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (isEditingLayout) {
                  saveLayout();
                  addLog('🛠️ Külliye Makam Odası düzenlemesi başarıyla kaydedildi!');
                } else {
                  setIsEditingLayout(true);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: isEditingLayout ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)',
                border: isEditingLayout ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                boxShadow: isEditingLayout ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              {isEditingLayout ? '💾 Düzenlemeyi Kaydet' : '🛠️ Tasarım Modu'}
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isFullScreen ? 'Küçült' : 'Tam Ekran'}
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: isFullScreen ? 'fixed' : 'relative',
        top: isFullScreen ? 0 : 'auto',
        left: isFullScreen ? 0 : 'auto',
        width: isFullScreen ? '100vw' : '100%',
        height: isFullScreen ? '100vh' : 'auto',
        zIndex: isFullScreen ? 9999 : 1,
        background: '#450a0a',
        borderRadius: isFullScreen ? '0' : '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: isMobile && isFullScreen ? 'column' : 'row'
      }}>
        {/* Actions Bar (Only in Fullscreen) */}
        {isFullScreen && (
          <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (isEditingLayout) {
                  saveLayout();
                  addLog('🛠️ Külliye Makam Odası düzenlemesi başarıyla kaydedildi!');
                } else {
                  setIsEditingLayout(true);
                }
              }}
              style={{
                background: isEditingLayout ? 'rgba(34, 197, 94, 0.8)' : 'rgba(0,0,0,0.5)',
                border: isEditingLayout ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.2)',
                color: isEditingLayout ? '#4ade80' : 'white',
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.8rem', fontWeight: 600
              }}
            >
              {isEditingLayout ? '💾 Düzenlemeyi Kaydet' : '🛠️ Tasarım Modu'}
            </button>
            <button onClick={() => setIsFullScreen(false)} style={{
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.8rem', fontWeight: 600
            }}>
              <Minimize2 size={16} />
              Küçült
            </button>
          </div>
        )}

        {/* Canvas Area wrapper */}
        <div 
          ref={containerRef}
          style={{ 
            flex: isMobile && isFullScreen ? '1 1 60%' : '1 1 70%', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'stretch',
            minHeight: isFullScreen ? 'unset' : '330px',
            background: '#2d0505',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Canvas Wrapper */}
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden',
            padding: '10px'
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onClick={handleCanvasClick}
                style={{ 
                  cursor: isEditingLayout ? (isMovingObject ? 'cell' : 'pointer') : 'pointer', 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  display: 'block',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  userSelect: 'none'
                }}
              />

              {/* FLOATING ACTION TOOLTIP FOR SELECTED OBJECT */}
              {isEditingLayout && selectedObject && (
                (() => {
                  const canvas = canvasRef.current;
                  if (!canvas) return null;
                  
                  const width = canvas.clientWidth;
                  const height = canvas.clientHeight;
                  
                  const scaleFactor = Math.min(width / 550, height / 350);
                  const translateX = (width - 550 * scaleFactor) / 2;
                  const translateY = (height - 350 * scaleFactor) / 2;
                  
                  const centerX = 550 / 2;
                  const centerY = 350 / 2.8;
                  
                  const isoX = (selectedObject.x - selectedObject.y) * (TILE_W / 2);
                  const isoY = (selectedObject.x + selectedObject.y) * (TILE_H / 2);
                  
                  const x = (centerX + isoX) * scaleFactor + translateX;
                  const y = (centerY + isoY + TILE_H / 2) * scaleFactor + translateY;

                  return (
                    <div style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `${y - 45}px`,
                      transform: 'translateX(-50%)',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '30px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                      zIndex: 1010,
                      pointerEvents: 'auto',
                      whiteSpace: 'nowrap'
                    }}>
                      <button
                        title="90° Döndür"
                        onClick={(e) => { e.stopPropagation(); handleRotate(); }}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      >
                        🔄
                      </button>
                      <button
                        title={isMovingObject ? "Konumlandırmak için haritada boş yere tıklayın" : "Taşı"}
                        onClick={(e) => { e.stopPropagation(); handleToggleMove(); }}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: isMovingObject ? '#2563eb' : 'rgba(255,255,255,0.08)', 
                          border: isMovingObject ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if(!isMovingObject) e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={(e) => { if(!isMovingObject) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      >
                        🎯
                      </button>
                      <button
                        title="Sil"
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#991b1b', border: '1px solid #ef4444',
                          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#991b1b'}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Design Panel (if editing) OR Chat / Lobi Paneli (if not editing) */}
        {isEditingLayout ? (
          <div style={{
            flex: isMobile && isFullScreen ? '1 1 40%' : '1 1 30%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: isFullScreen ? '100%' : '350px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            {/* Sidebar Title */}
            <div style={{
              padding: '0.6rem 0.8rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🛒 Saray Eşya Mağazası
              </h4>
              <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fcd34d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                8x8 Grid
              </span>
            </div>

            {/* Category Tab Row */}
            <div style={{
              display: 'flex',
              gap: '0.2rem',
              padding: '0.4rem',
              background: 'rgba(10, 10, 12, 0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {[
                { key: 'tümü', label: '🔍 Tümü' },
                { key: 'ofis', label: '🏢 Ofis' },
                { key: 'dekorasyon', label: '🌿 Dekor' },
                { key: 'konfor', label: '🛋️ Konfor' },
                { key: 'guvenlik', label: '🛡️ Güvenlik' }
              ].map(cat => {
                const isActive = storeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setStoreCategory(cat.key as any)}
                    style={{
                      background: isActive ? `linear-gradient(135deg, rgba(245, 158, 11, 0.5) 0%, rgba(245, 158, 11, 0.8) 100%)` : 'rgba(255,255,255,0.03)',
                      border: isActive ? `1px solid #f59e0b` : '1px solid rgba(255,255,255,0.06)',
                      color: isActive ? '#020617' : '#94a3b8',
                      fontSize: '0.65rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 0 10px rgba(245, 158, 11, 0.3)` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable list of items */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              background: 'rgba(10, 10, 12, 0.2)'
            }}>
              {Object.entries(FURNITURE_PRICES)
                .filter(([_, item]) => storeCategory === 'tümü' || item.category === storeCategory)
                .map(([key, val]) => {
                  const userCash = user.cash || 0;
                  const canAfford = userCash >= val.price;
                  return (
                    <div
                      key={key}
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
                      }}
                    >
                      {/* Left: Render Image/Preview */}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        overflow: 'hidden'
                      }}>
                        <FurniturePreview id={key} spriteSheet={spriteSheet} />
                      </div>

                      {/* Middle: Details */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {val.name}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                          <span>💰</span>
                          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>₺{val.price.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>

                      {/* Right: Buy Button */}
                      <div>
                        <button
                          onClick={() => {
                            if (!canAfford) return;
                            const foundSpot = (() => {
                              for (let x = 0; x < GRID_SIZE; x++) {
                                for (let y = 0; y < GRID_SIZE; y++) {
                                  const isOccupied = officeObjects.some(obj => obj.x === x && obj.y === y);
                                  const isStaff = (x === 6 && y === 2) || (x === 1 && y === 5);
                                  if (!isOccupied && !isStaff) return { x, y };
                                }
                              }
                              return null;
                            })();

                            if (!foundSpot) {
                              alert('Makam Odasında boş yer kalmadı!');
                              return;
                            }

                            const newObj = {
                              id: key,
                              name: val.name,
                              x: foundSpot.x,
                              y: foundSpot.y,
                              color: '#f59e0b',
                              desc: 'Satın Alınan Eşya',
                              nonBlocking: key.includes('chair') || key === 'carpet',
                              flipX: false
                            };

                            setOfficeObjects(prev => [...prev, newObj]);
                            setSelectedObject(newObj);
                            setIsMovingObject(true);

                            setUser((prev: any) => ({ ...prev, cash: prev.cash - val.price }));
                            addLog(`🛠️ Makam Odası: Yeni ${val.name} satın alındı (-₺${val.price.toLocaleString('tr-TR')} Kişisel Nakit)`);
                          }}
                          disabled={!canAfford}
                          style={{
                            background: canAfford ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.04)',
                            border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.06)',
                            color: canAfford ? '#ffffff' : '#475569',
                            fontSize: '0.65rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            boxShadow: canAfford ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (canAfford) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canAfford) {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                            }
                          }}
                        >
                          {canAfford ? 'Satın Al' : 'Yetersiz'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Sidebar Action Buttons at the Bottom */}
            <div style={{
              padding: '0.6rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)'
            }}>
              <button
                onClick={() => {
                  saveLayout();
                  addLog('🛠️ Külliye Makam Odası düzenlemesi başarıyla kaydedildi!');
                }}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 16px rgba(34, 197, 94, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.3)'}
              >
                💾 Değişiklikleri Kaydet
              </button>
              <button
                onClick={cancelLayout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.7rem',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            flex: isMobile && isFullScreen ? '1 1 40%' : '1 1 30%',
            background: 'rgba(0,0,0,0.45)', borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', borderTop: isMobile && isFullScreen ? '1px solid rgba(255,255,255,0.08)' : 'none',
            height: isFullScreen ? '100%' : '350px'
          }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: '#f59e0b' }} />
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>Makam Ziyaretçileri</h3>
            </div>
            
            <div ref={chatContainerRef} style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(10, 5, 5, 0.4)' }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '2rem' }}>
                  Külliye sessiz... Alt taraftan talimat verebilirsiniz.
                  <br/>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(WASD veya Yön Tuşları ile yürüyebilirsiniz)</span>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: msg.senderColor }}>{msg.sender}</span>
                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{msg.timestamp}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0', borderLeft: `2px solid ${msg.senderColor}` }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Özel Kaleme talimat verin..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'white', fontSize: '0.8rem', outline: 'none' }}
              />
              <button onClick={handleSendMessage} style={{ background: '#dc2626', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cumhurbaşkanlığı Kriz & Karar Merkezi Modalı */}
      {showPresidentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <GlassCard style={{ width: '100%', maxWidth: '800px', background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
            
            <div style={{ background: 'linear-gradient(90deg, #312e81 0%, #4338ca 100%)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={24} style={{ color: '#fcd34d' }} /> Cumhurbaşkanlığı Kriz & Karar Merkezi
                </h3>
                <div style={{ color: '#a5b4fc', fontSize: '0.85rem', marginTop: '0.25rem' }}>Ulusal yatırım stratejilerini ve haftalık acil durum krizlerini yönetin.</div>
              </div>
              <button onClick={() => setShowPresidentModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <button onClick={() => setActiveModalTab('upgrades')} style={{ flex: 1, padding: '1rem', background: activeModalTab === 'upgrades' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', color: activeModalTab === 'upgrades' ? 'white' : '#818cf8', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeModalTab === 'upgrades' ? '3px solid #6366f1' : '3px solid transparent' }}>
                <Landmark size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Devlet Yatırımları
              </button>
              <button onClick={() => setActiveModalTab('decisions')} style={{ flex: 1, padding: '1rem', background: activeModalTab === 'decisions' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', color: activeModalTab === 'decisions' ? 'white' : '#818cf8', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeModalTab === 'decisions' ? '3px solid #6366f1' : '3px solid transparent' }}>
                <TrendingDown size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Stratejik Krizler (Olaylar)
              </button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '60vh' }}>
              {activeModalTab === 'upgrades' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[{ key: 'intel', title: 'İstihbarat Ağı Genişletmesi', desc: 'Siyasi Nüfuzu kalıcı olarak artırır (+200 Nüfuz).', max: 3, costFunc: (lvl: number) => lvl * 500000 + 250000 },
                    { key: 'centralBank', title: 'Merkez Bankası Dijitalleşmesi', desc: 'Devlet Vergi Toplama Hızını ve Hazinenin Nakit akışını iyileştirir.', max: 5, costFunc: (lvl: number) => lvl * 300000 + 200000 },
                    { key: 'diplomacy', title: 'Diplomasi Masası Modernizasyonu', desc: 'Dış ticareti ve Küresel İtibarı artırır (+100 İtibar).', max: 5, costFunc: (lvl: number) => lvl * 400000 + 150000 },
                    { key: 'afad', title: 'Acil Durum Müdahale Fonu', desc: 'Olası kriz ve isyan durumlarında halk desteğini garanti altına alır (+500 Nüfuz).', max: 3, costFunc: (lvl: number) => lvl * 1000000 + 500000 }
                  ].map((u) => {
                    const currentLvl = upgrades[u.key as keyof typeof upgrades];
                    const isMax = currentLvl >= u.max;
                    const cost = u.costFunc(currentLvl);
                    return (
                      <div key={u.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{u.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>{u.desc}</div>
                          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                            {Array.from({length: u.max}).map((_, idx) => (
                              <div key={idx} style={{ width: '40px', height: '6px', borderRadius: '3px', background: currentLvl > idx ? '#4f46e5' : 'rgba(255,255,255,0.1)' }} />
                            ))}
                          </div>
                        </div>
                        <button onClick={() => buyUpgrade(u.key as keyof typeof upgrades)} disabled={isMax} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: isMax ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: isMax ? '#64748b' : 'white', fontWeight: 800, fontSize: '0.9rem', cursor: isMax ? 'not-allowed' : 'pointer' }}>
                          {isMax ? 'MAX' : `₺${cost.toLocaleString('tr-TR')}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div>
                  {decisionMade ? (
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                      <h4 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Kriz Başarıyla Yönetildi</h4>
                      <p style={{ color: '#a5b4fc', fontSize: '0.9rem', margin: 0 }}>Bu haftaki ulusal kriz çözüldü ve devlet kayıtlarına işlendi. Bir sonraki stratejik raporlama bekleniyor.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🚨 Haftalık Gündem: Ekonomik Enflasyon Şoku</div>
                        <h4 style={{ color: 'white', margin: 0, fontSize: '1.05rem', lineHeight: '1.5' }}>
                          "Sayın Cumhurbaşkanım, Merkez Bankası rezervlerimiz kritik seviyeye indi ve enflasyon tırmanışta. Halk acil çözüm bekliyor. Nasıl bir yol haritası izleyelim?"
                        </h4>
                      </div>
                      
                      {[
                        { key: 'A', title: 'A) Sert Kemer Sıkma', desc: 'Hazineye ₺500.000 nakit girer, ancak halk desteği (-300 Nüfuz) düşer.' },
                        { key: 'B', title: 'B) Karşılıksız Para Bas ve Dağıt', desc: 'Halk desteği artar (+400 Nüfuz), fakat enflasyon %5 artar ve İtibar (-100) sarsılır.' },
                        { key: 'C', title: 'C) Acil Varlık Vergisi İlan Et', desc: 'Şirket sahiplerine ek vergi sal. Hazineye ₺2.000.000 girer, şirketler tepki gösterir (-150 Nüfuz).' }
                      ].map((c) => (
                        <div key={c.key} onClick={() => makeDecision(c.key as 'A'|'B'|'C')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.35rem' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                          <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>{c.title}</div>
                          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{c.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div style={{ color: '#94a3b8' }}>Hazine: <strong style={{ color: '#fcd34d' }}>₺{treasuryBalance.toLocaleString('tr-TR')}</strong></div>
              <div style={{ color: '#94a3b8' }}>Enflasyon: <strong style={{ color: '#ef4444' }}>%{inflationRate.toFixed(1)}</strong></div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export const PresidentIsometricOffice = React.memo(PresidentIsometricOfficeComponent);
