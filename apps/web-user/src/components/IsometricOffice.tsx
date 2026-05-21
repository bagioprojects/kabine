import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Send, Users } from 'lucide-react';
import { useIsometricEngine } from './isometric/useIsometricEngine';
import { findPath } from './isometric/pathfinder';
import { FURNITURE_PRICES } from './isometric/constants';
import { FurniturePreview } from './isometric/FurniturePreview';
import type { IsometricObject } from './isometric/types';
import { GRID_SIZE, TILE_W, TILE_H } from './isometric/types';

interface IsometricOfficeProps {
  userCash: number;
  totalIncome: number;
  userProvince: string;
  officeType: 'coal' | 'auto' | 'defense';
  onUpdateBalances?: (newBalances: any, logMessage: string) => void;
  userPoliticalInfluence?: number;
  userPoliticalReputation?: number;
  companyId?: string;
  gender?: string | null;
  isometricModelId?: string | null;
}

interface ChatMessage {
  timestamp: string;
  sender: string;
  senderColor: string;
  text: string;
  isSystem?: boolean;
}

const OBJECTS: IsometricObject[] = [
  { id: 'office_desk', name: 'Masa 1', x: 2, y: 2, color: '#1e293b', desc: 'Premium Desk', flipX: true },
  { id: 'office_chair', name: 'Koltuk 1', x: 3, y: 2, color: '#1e293b', desc: 'Ergonomic Chair', nonBlocking: true, flipX: true },
  { id: 'office_desk', name: 'Masa 2', x: 5, y: 2, color: '#1e293b', desc: 'Premium Desk', flipX: true },
  { id: 'office_chair', name: 'Koltuk 2', x: 6, y: 2, color: '#1e293b', desc: 'Ergonomic Chair', nonBlocking: true, flipX: true },
  { id: 'board', name: 'Planlama Panosu', x: 4, y: 0, color: '#f8fafc', desc: 'Strateji Tahtası', flipX: true }
];

export const DIALOGUES_THEMED: { [key in 'coal' | 'auto' | 'defense']: { [key: string]: string[] } } = {
  coal: {
    desk: [
      "Kömür santrallerimizin bütçe planlamasını yapıyorum.",
      "Kapasite artış raporları onay bekliyor.",
      "Enerji tarifelerini gözden geçiriyorum."
    ],
    chair: [
      "Enerji imparatorluğunun koltuğu burası!",
      "Eyalet şebekesini tıkır tıkır besliyoruz.",
      "Üretim hedeflerimizi büyütüyoruz."
    ],
    desk_staff_a: [
      "Maden Mühendisi: 'Efendim, 3. damarda yüksek kaliteli rezerv bulduk!'",
      "Maden Mühendisi: 'Bant havalandırma sistemleri kararlı çalışıyor.'",
      "Maden Mühendisi: 'Basınç valflerini optimize ettim patron!'"
    ],
    desk_staff_b: [
      "Sekreter: 'Termik jeneratörlerimiz %92 verimle çalışıyor.'",
      "Sekreter: 'Eyalet demiryolu sevkiyatı yola çıktı patron.'",
      "Sekreter: 'Kazan sıcaklıkları güvenli sınırlar içinde.'"
    ],
    water: [
      "Maden tozunun üzerine soğuk bir su iyi gider.",
      "Çalışanlar için temiz su sebili devrede.",
      "İçelim, zihnimiz açılsın."
    ],
    sofa: [
      "Yorgun madencilerin çay molası köşesi.",
      "Deri Chesterfield koltukta dinlenmek harika.",
      "Bir yudum çay, sonra yine şantiyeye."
    ],
    plant: [
      "Maden havasını temizleyen dayanıklı kaktüsler.",
      "Ofise oksijen veren yeşil dostumuz.",
      "Demir varilde yetişen özel bir bitki."
    ],
    safe: [
      "Kömür kârları bu ağır çelik kasada güvende!",
      "Eski usul mekanik kilit asla şaşmaz."
    ],
    board: [
      "Günlük enerji üretim grafiğimiz zirvede!",
      "Güç şebekesi voltaj grafiği stabil."
    ]
  },
  auto: {
    desk: [
      "Yeni elektrikli modelin bütçesini çıkarıyorum.",
      "Robotik montaj hattı planlaması hazır.",
      "Otomotiv piyasa analizlerini yapıyorum."
    ],
    chair: [
      "Geleceğin otomotiv devi bu koltuktan yönetiliyor.",
      "Hız ve inovasyon bizim işimiz.",
      "Elektrikli araç vizyonumuzu çiziyorum."
    ],
    desk_staff_a: [
      "Yazılımcı: 'Otopilot yazılımının 2.4 yamasını derledim.'",
      "Yazılımcı: 'Batarya yönetim kodu 100% stabil patron.'",
      "Yazılımcı: 'Simülasyon testlerimiz başarıyla tamamlandı.'"
    ],
    desk_staff_b: [
      "Sekreter: 'Yeni aerodinamik kasa çizimlerini bitirdim.'",
      "Sekreter: 'Karbon fiber alaşım siparişleri geçildi.'",
      "Sekreter: 'Üretim robotlarının bakım raporları tamam.'"
    ],
    water: [
      "RGB aydınlatmalı akıllı sebilden bir bardak su.",
      "Ofis içi dehidrasyon uyarısı aktif, su için.",
      "Yüksek siber enerjiyi suyla tazeleyelim."
    ],
    sofa: [
      "Fütüristik spor koltukta kısa bir beyin fırtınası.",
      "Ergonomik gaming koltuğunda kahve molası.",
      "Biraz uzanıp yeni jant tasarımlarını düşüneyim."
    ],
    plant: [
      "Topraksız tarım (Hydroponic) saksı bitkisi.",
      "Mavi neon besleme ışıklı özel botanik.",
      "Kendi kendini sulayan akıllı yapraklar."
    ],
    safe: [
      "Biyometrik kasadaki patent belgelerimiz güvende!",
      "Lazer korumalı çelik kasa kilitli."
    ],
    board: [
      "Aylık üretilen araç sayımız rekor kırıyor!",
      "Robotik montaj hattı hız eğrileri olumlu."
    ]
  },
  defense: {
    desk: [
      "Milli SİHA bütçesini kontrol ediyorum.",
      "Gelişmiş radar ihalesi şartnamesi hazır.",
      "Devlet savunma sözleşmelerini imzalıyorum."
    ],
    chair: [
      "Milli savunma karargahının başındayım.",
      "Ülkemizin güvenliği ve teknolojisi buradan sorulur.",
      "Yeni nesil hava savunma vizyonunu onaylıyorum."
    ],
    desk_staff_a: [
      "Yazılımcı: 'Güdüm yapay zekası testlerini tamamladı.'",
      "Yazılımcı: 'Radar karıştırma algoritmaları aktif.'",
      "Yazılımcı: 'Siber güvenlik duvarı sızdırmaz durumda patron!'"
    ],
    desk_staff_b: [
      "Sekreter: 'Uydu takipleri ve koordinatlar güncellendi.'",
      "Sekreter: 'Sinyal işlemcileri 24/7 taramada.'",
      "Sekreter: 'Milli radar bileşenleri montaja hazır.'"
    ],
    water: [
      "Askeri disiplinle çalışan sebilden buz gibi su.",
      "Gözetleme nöbetinde su içmek zihni açar.",
      "Taktik su rezervi devrede."
    ],
    sofa: [
      "Taktik dinlenme odasında kısa bir mola.",
      "Stealth siyah zırhlı koltuk takımı.",
      "Bir sonraki operasyon planı öncesi dinlenme."
    ],
    plant: [
      "Hover pad üzerinde uçan anti-gravitasyonel Bonsai.",
      "Ofise yeşil kamuflaj havası veren özel bitki.",
      "Sisin içinden yükselen manyetik yeşillik."
    ],
    safe: [
      "Kuantum şifreli savunma kasamız devrede!",
      "Devlet sırrı niteliğindeki tasarımlar korunuyor."
    ],
    board: [
      "Aktif radar tarama ekranı: Koordinatlar temiz.",
      "Üretilen SİHA ve İHA teslimat grafikleri."
    ]
  }
};

const AUTO_REPLIES_THEMED: { [key in 'coal' | 'auto' | 'defense']: { [key: string]: string[] } } = {
  coal: {
    merhaba: [
      "Merhaba patron! Kömür madeni üretimi son hız devam ediyor.",
      "Hoş geldiniz efendim, eyaletimizin elektrik gücü sizsiniz.",
      "Selamlar! Maden ocaklarında işler yolunda gidiyor."
    ],
    selam: [
      "Selamlar patron! Tonaj hedeflerini yakaladık.",
      "Aleykümselam efendim, şantiyelerimiz tıkır tıkır işliyor."
    ],
    is: [
      "Maden mühendisleri 4. galeriye giriyor, rezerv zengin.",
      "Operatörler kazan basınçlarını en yüksek verimde tutuyor."
    ],
    kod: [
      "Yazılımcı: 'PLC otomasyon yazılımlarımız sorunsuz çalışıyor.'",
      "Yazılımcı: 'Sensör ağından gelen verileri sisteme kaydettim.'"
    ],
    para: [
      "Ton başına kâr marjımız eyaletteki en iyi seviyede.",
      "Madencilik gelirleri bütçemizi dolduruyor patron."
    ]
  },
  auto: {
    merhaba: [
      "Merhaba Sayın CEO! Yeni elektrikli araç prototipi montaj hattında.",
      "Hoş geldiniz efendim! Otomotiv fabrikasında robotlar iş başında.",
      "Selamlar! Otopilot test sürüşlerimiz sorunsuz ilerliyor."
    ],
    selam: [
      "Selamlar patron! Batarya şarj verimliliği %98'e ulaştı.",
      "Aleykümselam CEO'muz, sipariş teslimatları zamanında yapılıyor."
    ],
    is: [
      "Robot kollar gövde montajını 45 saniyede tamamlıyor.",
      "Boya hattındaki mikro pürüz testlerini geçtik efendim."
    ],
    kod: [
      "Yazılımcı: 'Akıllı şarj istasyonu yazılım güncellemesi tamamlandı.'",
      "Yazılımcı: 'Araç içi eğlence paneli kodlarını optimize ettim.'"
    ],
    para: [
      "Araç başına kâr marjımız %22 civarında, harika gidiyoruz.",
      "Kişisel cüzdanınıza aktarılacak temettüler hazırlandı efendim."
    ]
  },
  defense: {
    merhaba: [
      "Merhaba Komutanım! Hava savunma radarlarımız devrede.",
      "Hoş geldiniz efendim! Askeri SİHA projemiz son test aşamasında.",
      "Selamlar! Siber savunma kalkanımız tam güç çalışıyor."
    ],
    selam: [
      "Selamlar patron! Elektro-optik kameralar sorunsuz odaklanıyor.",
      "Aleykümselam komutanım! Mühimmat depoları tam kapasite dolu."
    ],
    is: [
      "Radar tarama sistemlerimiz 400km menzilde aktif tarama yapıyor.",
      "Güdüm sistemlerinin kalibrasyon testlerini başarıyla tamamladık."
    ],
    kod: [
      "Yazılımcı: 'Siber saldırı önleme yazılımımız sızdırmaz durumda.'",
      "Yazılımcı: 'Yapay zeka hedef tanıma algoritmaları güncellendi.'"
    ],
    para: [
      "Devlet siparişlerinden gelen ödemeler hesabımıza geçti efendim.",
      "Savunma bütçesi ve nakit akışımız güvende patron."
    ]
  }
};

export const IsometricOffice: React.FC<IsometricOfficeProps> = ({
  userCash,
  totalIncome,
  userProvince,
  officeType,
  onUpdateBalances,
  userPoliticalInfluence = 0,
  userPoliticalReputation = 0,
  companyId = 'default',
  gender = null,
  isometricModelId = null
}) => {
  // Bubble Refs for communication with the renderer
  const bossBubbleRef = useRef<string>("");
  const staffABubbleRef = useRef<string>("");
  const staffBBubbleRef = useRef<string>("");
  
  const bossBubbleTimerRef = useRef<any>(null);
  const staffABubbleTimerRef = useRef<any>(null);
  const staffBBubbleTimerRef = useRef<any>(null);

  // Initialize engine hook
  const {
    canvasRef,
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
    saveLayout: engineSaveLayout,
    cancelLayout,
    charXRef,
    charYRef,
    walkPathRef
  } = useIsometricEngine({
    officeType,
    companyId,
    initialObjects: OBJECTS,
    staffACoord: { x: 3, y: 2 },
    staffBCoord: { x: 6, y: 2 },
    bossBubbleRef,
    staffABubbleRef,
    staffBBubbleRef,
    gender,
    isometricModelId
  });

  // Dialog & Modal state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [showConsultantModal, setShowConsultantModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'upgrades' | 'decisions'>('upgrades');
  const [upgrades, setUpgrades] = useState({ machinery: 0, logistics: 0, safety: 0, environment: 0 });
  const [decisionMade, setDecisionMade] = useState(false);

  // Load state and setup initial bubble message on mount
  useEffect(() => {
    const savedUpgrades = localStorage.getItem(`office_upgrades_${companyId}`);
    if (savedUpgrades) setUpgrades(JSON.parse(savedUpgrades));
    const savedDecision = localStorage.getItem(`office_decision_${companyId}`);
    if (savedDecision === 'true') setDecisionMade(true);

    const capitalizedType = officeType === 'coal' ? 'Maden & Enerji' : officeType === 'auto' ? 'Otomotiv Teknoloji' : 'Savunma Sanayii Karargah';
    bossBubbleRef.current = `${userProvince} ${capitalizedType} Ofisine Hoş Geldiniz!`;
    if (bossBubbleTimerRef.current) clearTimeout(bossBubbleTimerRef.current);
    bossBubbleTimerRef.current = setTimeout(() => { bossBubbleRef.current = ""; }, 5000);
    setChatMessages([
      { timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), sender: 'Sistem', senderColor: '#94a3b8', text: `${capitalizedType} Lobi kanalı aktif edildi.`, isSystem: true }
    ]);
  }, [officeType, userProvince, companyId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const buyUpgrade = (key: keyof typeof upgrades) => {
    const currentLvl = upgrades[key];
    const maxLvl = (key === 'safety' || key === 'environment') ? 3 : 5;
    if (currentLvl >= maxLvl) return;

    let cost = 0;
    if (key === 'machinery') cost = currentLvl * 5000 + 4000;
    if (key === 'logistics') cost = currentLvl * 8000 + 6000;
    if (key === 'safety') cost = currentLvl * 10000 + 10000;
    if (key === 'environment') cost = currentLvl * 15000 + 15000;

    if (userCash < cost) {
      alert(`Yetersiz Bakiye! Bu yatırım için cüzdanınızda en az ₺${cost.toLocaleString('tr-TR')} olmalıdır.`);
      return;
    }

    const nextUpgrades = { ...upgrades, [key]: currentLvl + 1 };
    setUpgrades(nextUpgrades);
    localStorage.setItem(`office_upgrades_${companyId}`, JSON.stringify(nextUpgrades));

    if (onUpdateBalances) {
      let logMessage = `🏭 Şirket Yatırımı: ${key === 'machinery' ? 'Ağır İş Makinesi' : key === 'logistics' ? 'Demiryolu Ağı' : key === 'safety' ? 'İş Güvenliği' : 'Karbon Filtre'} seviye ${currentLvl + 1}'e yükseltildi! (-₺${cost.toLocaleString('tr-TR')})`;
      let stateUpdate: any = { cash: userCash - cost };
      
      if (key === 'machinery') {
        stateUpdate.totalIncome = totalIncome + 100;
        logMessage += ` (+₺100 Pasif Gelir/10sn)`;
      } else if (key === 'logistics') {
        stateUpdate.totalIncome = totalIncome + 150;
        logMessage += ` (+₺150 Pasif Gelir/10sn)`;
      } else if (key === 'safety') {
        stateUpdate.politicalInfluence = userPoliticalInfluence + 50;
        stateUpdate.politicalReputation = userPoliticalReputation + 10;
        logMessage += ` (+50 Nüfuz, +10 İtibar)`;
      } else if (key === 'environment') {
        stateUpdate.politicalInfluence = userPoliticalInfluence + 100;
        stateUpdate.politicalReputation = userPoliticalReputation + 20;
        stateUpdate.totalIncome = totalIncome + 50;
        logMessage += ` (+100 Nüfuz, +20 İtibar, +₺50 Pasif Gelir/10sn)`;
      }
      onUpdateBalances(stateUpdate, logMessage);
    }
  };

  const makeDecision = (choice: 'A' | 'B' | 'C') => {
    if (decisionMade || !onUpdateBalances) return;

    if (choice === 'A') {
      const updated = {
        cash: userCash,
        totalIncome: totalIncome + 150,
        politicalInfluence: Math.max(0, userPoliticalInfluence - 50)
      };
      onUpdateBalances(updated, '🏭 Danışman Kararı: Maden sahasında güvenlik güçleri desteğiyle çalışma başlatıldı. (+₺15 Pasif Gelir/10sn, -50 Siyasi Nüfuz)');
    } else if (choice === 'B') {
      const updated = {
        cash: Math.max(0, userCash - 25000),
        politicalInfluence: userPoliticalInfluence + 150,
        politicalReputation: userPoliticalReputation + 30
      };
      onUpdateBalances(updated, '🏭 Danışman Kararı: Ağaçlandırma sözü ve filtre yatırımı yapıldı. (-₺25.000, +150 Siyasi Nüfuz, +30 İtibar)');
    } else if (choice === 'C') {
      const updated = {
        cash: Math.max(0, userCash - 10000),
        politicalInfluence: userPoliticalInfluence + 250,
        totalIncome: Math.max(0, totalIncome - 100)
      };
      onUpdateBalances(updated, '🏭 Danışman Kararı: Maden sahası projesi askıya alındı, yeşil enerji Ar-Ge bütçesi ayrıldı. (-₺10.000, +250 Siyasi Nüfuz, -₺10 Pasif Gelir/10sn)');
    }

    localStorage.setItem(`office_decision_${companyId}`, 'true');
    setDecisionMade(true);
    setShowConsultantModal(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      timestamp,
      sender: 'Siz (Patron)',
      senderColor: '#3b82f6',
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
      let replySender = "Danışman";
      let replyColor = "#f59e0b";

      const replies = AUTO_REPLIES_THEMED[officeType];

      if (lower.includes('merhaba') || lower.includes('selam')) {
        replyText = replies.merhaba[Math.floor(Math.random() * replies.merhaba.length)];
      } else if (lower.includes('iş') || lower.includes('is') || lower.includes('durum')) {
        replyText = replies.is[Math.floor(Math.random() * replies.is.length)];
      } else if (lower.includes('kod') || lower.includes('yazılım') || lower.includes('teknoloji')) {
        replyText = replies.kod[Math.floor(Math.random() * replies.kod.length)];
      } else if (lower.includes('para') || lower.includes('gelir') || lower.includes('finans')) {
        replyText = replies.para[Math.floor(Math.random() * replies.para.length)];
      } else {
        replySender = "Sekreter";
        replyColor = "#ec4899";
        replyText = "Anlaşıldı efendim. İlgili dosyaları masanıza bıraktım, talimatlarınızı bekliyoruz.";
      }

      const replyMsg = {
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        sender: replySender,
        senderColor: replyColor,
        text: replyText
      };
      setChatMessages(prev => [...prev, replyMsg]);

      if (replySender === "Danışman") {
        staffABubbleRef.current = replyText;
        if (staffABubbleTimerRef.current) clearTimeout(staffABubbleTimerRef.current);
        staffABubbleTimerRef.current = setTimeout(() => { staffABubbleRef.current = ""; }, 4000);
      } else {
        staffBBubbleRef.current = replyText;
        if (staffBBubbleTimerRef.current) clearTimeout(staffBBubbleTimerRef.current);
        staffBBubbleTimerRef.current = setTimeout(() => { staffBBubbleRef.current = ""; }, 4000);
      }
    }, 1200);
  };

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
          const isStaff = (clickX === 3 && clickY === 2) || (clickX === 6 && clickY === 2);
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

      // Danışman Click Detection (chair at 3,2 or desk at 2,2)
      if ((clickX === 3 && clickY === 2) || (clickX === 2 && clickY === 2)) {
        const neighbors = [
          { x: 3, y: 3 },
          { x: 4, y: 2 },
          { x: 3, y: 1 }
        ];
        for (const n of neighbors) {
          const path = findPath(currentX, currentY, n.x, n.y, GRID_SIZE, officeObjects, (gx, gy) => (gx === 3 && gy === 2) || (gx === 6 && gy === 2));
          if (path.length > 0) {
            walkPathRef.current = path;
            break;
          }
        }
        setShowConsultantModal(true);
        return;
      }

      const path = findPath(currentX, currentY, clickX, clickY, GRID_SIZE, officeObjects, (gx, gy) => (gx === 3 && gy === 2) || (gx === 6 && gy === 2));
      if (path.length > 0) {
        walkPathRef.current = path;
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

    if (refund > 0 && onUpdateBalances) {
      onUpdateBalances({ cash: userCash + refund }, `🗑️ Ofis Tasarımı: Eşya kaldırıldı, 50% iade yapıldı (+₺${refund.toLocaleString('tr-TR')})`);
    }
  };

  const saveLayout = () => {
    engineSaveLayout();
    if (onUpdateBalances) {
      onUpdateBalances({ cash: userCash }, '🛠️ Ofis düzenlemesi başarıyla kaydedildi!');
    }
  };

  const getSelectedObjectScreenPos = () => {
    if (!selectedObject) return null;
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
    
    return { x, y };
  };

  const containerStyle: React.CSSProperties = isFullScreen ? {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: '#0a0d16',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    boxSizing: 'border-box',
    overflow: 'hidden'
  } : {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderLeft: `4px solid ${officeType === 'coal' ? 'hsl(var(--accent-gold))' : officeType === 'auto' ? 'hsl(var(--accent-cyan))' : 'hsl(var(--accent-purple))'}`,
    padding: '1rem'
  };

  const capitalizedType = officeType === 'coal' ? 'Maden & Enerji' : officeType === 'auto' ? 'Otomotiv Teknoloji' : 'Savunma Sanayii Karargah';
  const themeAccentColor = officeType === 'coal' ? 'hsl(var(--accent-gold))' : officeType === 'auto' ? 'hsl(var(--accent-cyan))' : 'hsl(var(--accent-purple))';

  return (
    <div style={containerStyle}>
      {isFullScreen ? (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      ) : null}

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', zIndex: 10 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 800 }}>
            🏢 {userProvince} {capitalizedType} Ofisi {isFullScreen ? '(Tam Ekran)' : ''}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.15rem', margin: 0 }}>
            Her şirkete özel tema, duvar renkleri, animasyonlu arka planlar ve lüks mobilyalar.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => {
              if (isEditingLayout) {
                saveLayout();
              } else {
                setIsEditingLayout(true);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: isEditingLayout ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
              background: isEditingLayout ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
              color: isEditingLayout ? '#4ade80' : 'white',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            {isEditingLayout ? '💾 Düzenlemeyi Kaydet' : '🛠️ Tasarım Modu'}
          </button>

          {!isMobile && (
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s'
              }}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 size={13} style={{ color: 'hsl(var(--accent-red))' }} />
                  <span>Pencere Modu</span>
                </>
              ) : (
                <>
                  <Maximize2 size={13} style={{ color: themeAccentColor }} />
                  <span>Tam Ekran Oyna</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Split Canvas / (Chat OR Design Panel) */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 800 ? 'column' : 'row',
        gap: '1.25rem',
        flex: 1,
        width: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Canvas Area */}
        <div style={{ 
          position: 'relative', 
          flex: 1.6,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'stretch',
          background: 'rgba(10, 15, 30, 0.7)', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          overflow: 'hidden',
          minHeight: isFullScreen ? 'unset' : '330px',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6)'
        }}>
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
                  const pos = getSelectedObjectScreenPos();
                  if (!pos) return null;
                  return (
                    <div style={{
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y - 45}px`,
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

        {/* Right Side: Design Panel (if editing) OR Chat Console (if not editing) */}
        {isEditingLayout ? (
          <div style={{
            flex: 0.9,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: isFullScreen ? 'calc(100% - 10px)' : '350px',
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
                🛒 Mobilya Mağazası
              </h4>
              <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
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
                      background: isActive ? `linear-gradient(135deg, ${themeAccentColor}88 0%, ${themeAccentColor}bb 100%)` : 'rgba(255,255,255,0.03)',
                      border: isActive ? `1px solid ${themeAccentColor}` : '1px solid rgba(255,255,255,0.06)',
                      color: isActive ? '#020617' : '#94a3b8',
                      fontSize: '0.65rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 0 10px ${themeAccentColor}44` : 'none'
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
                                  const isStaff = (x === 3 && y === 2) || (x === 6 && y === 2);
                                  if (!isOccupied && !isStaff) return { x, y };
                                }
                              }
                              return null;
                            })();

                            if (!foundSpot) {
                              alert('Ofiste boş yer kalmadı!');
                              return;
                            }

                            const newObj = {
                              id: key,
                              name: val.name,
                              x: foundSpot.x,
                              y: foundSpot.y,
                              color: '#3b82f6',
                              desc: 'Satın Alınan Eşya',
                              nonBlocking: key.includes('chair') || key === 'carpet',
                              flipX: false
                            };

                            setOfficeObjects(prev => [...prev, newObj]);
                            setSelectedObject(newObj);
                            setIsMovingObject(true);

                            if (onUpdateBalances) {
                              onUpdateBalances({ cash: userCash - val.price }, `🛠️ Ofis Tasarımı: Yeni ${val.name} satın alındı (-₺${val.price.toLocaleString('tr-TR')})`);
                            }
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
                }}
                style={{
                  background: `linear-gradient(135deg, #22c55e 0%, #15803d 100%)`,
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
            flex: 0.9,
            background: 'rgba(0,0,0,0.45)', borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', borderTop: isMobile && isFullScreen ? '1px solid rgba(255,255,255,0.08)' : 'none',
            height: isFullScreen ? '100%' : '350px'
          }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: '#3b82f6' }} />
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>Ofis Ziyaretçileri</h3>
            </div>
            
            <div ref={chatContainerRef} style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(10, 5, 5, 0.4)' }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '2rem' }}>
                  Lobi sessiz... Alt taraftan talimat verebilirsiniz.
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
                placeholder="Çalışanlara talimat verin..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'white', fontSize: '0.8rem', outline: 'none' }}
              />
              <button onClick={handleSendMessage} style={{ background: '#3b82f6', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Danışman Modeli */}
        {showConsultantModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 11, 20, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '650px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.03)'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {officeType === 'coal' ? (
                      <>🏭 Maden & Enerji Şirketi Danışmanlığı</>
                    ) : officeType === 'auto' ? (
                      <>🚗 Otomotiv Teknoloji Danışmanlığı</>
                    ) : (
                      <>🛡️ Savunma Sanayii Danışmanlığı</>
                    )}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {officeType === 'coal' ? 'Zonguldak Kömür İşletmeleri Operasyon ve Yatırım Merkezi' : 'Geliştirme ve Stratejik Kararlar'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowConsultantModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '70vh' }}>
                {officeType !== 'coal' ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                    <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Bu Danışmanlık Menüsü Yapım Aşamasında</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '350px', margin: '0 auto' }}>
                      Şu an sadece <strong>Maden & Enerji Şirketi</strong> danışman menüsü ve geliştirmeleri aktiftir. Diğer ofisler yakında hizmete girecektir!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                      <button
                        onClick={() => setActiveModalTab('upgrades')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeModalTab === 'upgrades' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                          color: activeModalTab === 'upgrades' ? '#000' : '#cbd5e1',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        📈 Geliştirme & Yatırım
                      </button>
                      <button
                        onClick={() => setActiveModalTab('decisions')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: activeModalTab === 'decisions' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                          color: activeModalTab === 'decisions' ? '#000' : '#cbd5e1',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        ⚡ Haftalık Kararlar
                      </button>
                    </div>

                    {/* Tab Contents */}
                    {activeModalTab === 'upgrades' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Heavy machinery upgrade card */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>Ağır İş Makinesi Modernizasyonu</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Kömür çıkarma ve işleme hızını arttırır. (+%15 pasif gelir bonusu)</div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div 
                                  key={lvl} 
                                  style={{ 
                                    width: '24px', 
                                    height: '6px', 
                                    borderRadius: '3px', 
                                    background: upgrades.machinery >= lvl ? '#f59e0b' : 'rgba(255,255,255,0.1)' 
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => buyUpgrade('machinery')}
                            disabled={upgrades.machinery >= 5}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: upgrades.machinery >= 5 ? 'rgba(255,255,255,0.05)' : '#f59e0b',
                              color: upgrades.machinery >= 5 ? '#64748b' : '#000',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: upgrades.machinery >= 5 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {upgrades.machinery >= 5 ? 'MAX' : `₺${(upgrades.machinery * 5000 + 4000).toLocaleString('tr-TR')}`}
                          </button>
                        </div>

                        {/* Rail / logistics upgrade card */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>Demiryolu ve Lojistik Ağı</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Eyaletler arası nakliye ve sevk hızını arttırır. (+%20 pasif gelir bonusu)</div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div 
                                  key={lvl} 
                                  style={{ 
                                    width: '24px', 
                                    height: '6px', 
                                    borderRadius: '3px', 
                                    background: upgrades.logistics >= lvl ? '#f59e0b' : 'rgba(255,255,255,0.1)' 
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => buyUpgrade('logistics')}
                            disabled={upgrades.logistics >= 5}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: upgrades.logistics >= 5 ? 'rgba(255,255,255,0.05)' : '#f59e0b',
                              color: upgrades.logistics >= 5 ? '#64748b' : '#000',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: upgrades.logistics >= 5 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {upgrades.logistics >= 5 ? 'MAX' : `₺${(upgrades.logistics * 8000 + 6000).toLocaleString('tr-TR')}`}
                          </button>
                        </div>

                        {/* Occupational safety card */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>İş Sağlığı ve Güvenliği Yatırımı</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Maden kazası riskini sıfırlar ve siyasi itibar kazandırır. (+50 Nüfuz, +10 İtibar)</div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                              {[1, 2, 3].map((lvl) => (
                                <div 
                                  key={lvl} 
                                  style={{ 
                                    width: '40px', 
                                    height: '6px', 
                                    borderRadius: '3px', 
                                    background: upgrades.safety >= lvl ? '#f59e0b' : 'rgba(255,255,255,0.1)' 
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => buyUpgrade('safety')}
                            disabled={upgrades.safety >= 3}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: upgrades.safety >= 3 ? 'rgba(255,255,255,0.05)' : '#f59e0b',
                              color: upgrades.safety >= 3 ? '#64748b' : '#000',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: upgrades.safety >= 3 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {upgrades.safety >= 3 ? 'MAX' : `₺${(upgrades.safety * 10000 + 10000).toLocaleString('tr-TR')}`}
                          </button>
                        </div>

                        {/* Carbon filter / green investment card */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>Karbon Filtreleme ve Çevre Yatırımı</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Devlet teşviki alınmasını sağlar. (+100 Nüfuz, +20 İtibar, +₺5/10sn pasif teşvik)</div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                              {[1, 2, 3].map((lvl) => (
                                <div 
                                  key={lvl} 
                                  style={{ 
                                    width: '40px', 
                                    height: '6px', 
                                    borderRadius: '3px', 
                                    background: upgrades.environment >= lvl ? '#f59e0b' : 'rgba(255,255,255,0.1)' 
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => buyUpgrade('environment')}
                            disabled={upgrades.environment >= 3}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: upgrades.environment >= 3 ? 'rgba(255,255,255,0.05)' : '#f59e0b',
                              color: upgrades.environment >= 3 ? '#64748b' : '#000',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: upgrades.environment >= 3 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {upgrades.environment >= 3 ? 'MAX' : `₺${(upgrades.environment * 15000 + 15000).toLocaleString('tr-TR')}`}
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div>
                        {decisionMade ? (
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.05)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            borderRadius: '10px',
                            padding: '1.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                            <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>Karar Alındı</h4>
                            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
                              Bu haftaki stratejik karar başarıyla alındı ve uygulamaya konuldu. Şirketinizin operasyonel ve siyasi etkileri aktif hale getirilmiştir. Bir sonraki karar haftalık güncellemede açılacaktır!
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '10px',
                              padding: '1rem'
                            }}>
                              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maden Sahası Protestoları</div>
                              <h4 style={{ color: '#f8fafc', margin: '0.5rem 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                "Efendim, yeni açacağımız maden sahasında yerel halk ve çevreciler protesto gösterisi başlattı. Ne talimat veriyorsunuz?"
                              </h4>
                            </div>

                            {/* Choice A */}
                            <div 
                              onClick={() => makeDecision('A')}
                              style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            >
                              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>A) Güvenlik güçlerini çağır ve projeyi hızlandır</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Maliyet: ₺0 | Gelir: +₺15 / 10sn | Nüfuz: -50 Puan</div>
                            </div>

                            {/* Choice B */}
                            <div 
                              onClick={() => makeDecision('B')}
                              style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            >
                              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>B) Bölgede ağaçlandırma sözü ver ve filtre yatırımı yap</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Maliyet: ₺25.000 | Nüfuz: +150 Puan | İtibar: +30 Puan</div>
                            </div>

                            {/* Choice C */}
                            <div 
                              onClick={() => makeDecision('C')}
                              style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            >
                              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>C) Projeyi askıya al ve temiz enerji Ar-Ge'sine bütçe kaydır</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Maliyet: ₺10.000 | Nüfuz: +250 Puan | Gelir: -₺10 / 10sn</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)',
                fontSize: '0.75rem'
              }}>
                <div style={{ color: '#94a3b8' }}>
                  Cüzdan Nakit: <strong style={{ color: '#f59e0b' }}>₺{userCash.toLocaleString('tr-TR')}</strong>
                </div>
                <div style={{ color: '#94a3b8' }}>
                  Siyasi Nüfuz: <strong style={{ color: '#06b6d4' }}>{userPoliticalInfluence} Puan</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
