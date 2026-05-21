import { useState, useEffect } from 'react';
import { io as socketIO } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { 
  User, 
  LogOut, 
  Terminal, 
  ShoppingBag, 
  Scale, 
  Activity, 
  AlertTriangle,
  Info,
  Compass,
  Briefcase,
  BookOpen,
  Users,
  Award,
  Coins,
  Heart,
  Pizza,
  Droplets,
  Zap,
  Smile,
  Wallet
} from 'lucide-react';
import { AuthLayout } from './components/AuthLayout';
import { ComplianceModal, type ComplianceDocType } from './components/ComplianceModal';
import { CharacterCreationScreen } from './components/CharacterCreationScreen';

import { FinancePortal } from './components/FinancePortal';
import { PoliticsHub } from './components/PoliticsHub';
import { GlassCard } from './components/GlassCard';
import { InteractiveMap } from './components/InteractiveMap';
import { EnterpriseManager } from './components/EnterpriseManager';
import { ConsoleView } from './components/ConsoleView';
import { MarketplaceView, type MarketplaceItem, VEHICLE_ITEMS } from './components/MarketplaceView';
import { PresidentPanelView } from './components/PresidentPanelView';
import { MilletvekiliPanelView } from './components/MilletvekiliPanelView';
import { GarnizonKomutanıPanelView } from './components/GarnizonKomutanıPanelView';
import { ParliamentSeatMap } from './components/ParliamentSeatMap';
import { WikiView } from './components/WikiView';
import { OrganizationView } from './components/OrganizationView';

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'VATANDAS': return 'VATANDAŞ';
    case 'MUHTAR': return 'MUHTAR';
    case 'BELEDIYE_BASKANI': return 'BELEDİYE BAŞKANI';
    case 'MILLETVEKILI': return 'MİLLETVEKİLİ';
    case 'BAKAN': return 'BAKAN';
    case 'CUMHURBASKANI': return 'CUMHURBAŞKANI';
    case 'GARNIZON_KOMUTANI': return 'GARNİZON KOMUTANI';
    default: return role || '';
  }
};

interface UserState {
  isLoggedIn: boolean;
  username: string;
  characterName: string;
  characterSurname: string;
  cash: number;
  bankCheckingBalance: number;
  bankSavingsBalance: number;
  creditScore: number;
  activeLoanDebt: number;
  taxDebt: number;
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
  happiness: number;
  isSick: boolean;
  politicalRole: string;
  partyName: string;
  partyRank: string;
  politicalReputation: number;
  hasVotedThisTerm: boolean;
  province: string;
  district: string;
  residenceProvince: string;
  residenceDistrict: string;
  isCharacterCreated?: boolean;
  avatarId?: string;
  isometricModelId?: string;
  backstoryId?: string;
  gender?: string | null;
  characterAge?: number;
  citizenId?: string;
  // Mobile app features integrated:
  politicalInfluence: number;
  coalMineLevel: number;
  autoFactoryLevel: number;
  defenseFactoryLevel: number;
  materials: {
    coal: number;
    iron_ore: number;
    steel: number;
    copper: number;
    aluminum: number;
    lithium: number;
    boron: number;
    petroleum: number;
    silicon: number;
  };
  ownedVehicles: string[];
  fuelLiters: number;
}

export interface ResidencyApplication {
  id: string;
  province: string;
  district: string;
  applicantName: string;
  applicantRole: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

const INITIAL_USER_STATE: UserState = {
  isLoggedIn: false,
  username: '',
  characterName: '',
  characterSurname: '',
  cash: 250000,
  bankCheckingBalance: 150000,
  bankSavingsBalance: 500000,
  creditScore: 620,
  activeLoanDebt: 0,
  taxDebt: 180,
  health: 85,
  hunger: 70,
  thirst: 65,
  energy: 80,
  happiness: 75,
  isSick: false,
  politicalRole: 'VATANDAS',
  partyName: 'Bağımsız',
  partyRank: 'Yok',
  politicalReputation: 15,
  hasVotedThisTerm: false,
  province: 'Ankara',
  district: 'Çankaya',
  residenceProvince: 'Ankara',
  residenceDistrict: 'Çankaya',
  isCharacterCreated: true,
  avatarId: '',
  isometricModelId: '',
  backstoryId: '',
  gender: null as string | null,
  characterAge: 25,
  citizenId: '',
  politicalInfluence: 840,
  coalMineLevel: 0,
  autoFactoryLevel: 0,
  defenseFactoryLevel: 0,
  materials: {
    coal: 10,
    iron_ore: 5,
    steel: 0,
    copper: 0,
    aluminum: 0,
    lithium: 0,
    boron: 0,
    petroleum: 0,
    silicon: 0
  },
  ownedVehicles: [],
  fuelLiters: 0
};



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

export const INITIAL_COMMODITIES: CommodityItem[] = [
  { id: 'coal', name: 'Kömür', symbol: 'COAL', category: 'Enerji & Yakıt', basePrice: 50, currentPrice: 50, description: 'Zonguldak Cumhuriyeti kaynaklı birincil enerji yakıtı.', emoji: '🪵', priceTrend: [48, 49, 51, 50, 49, 50] },
  { id: 'iron_ore', name: 'Demir Cevheri', symbol: 'IRON', category: 'Maden', basePrice: 80, currentPrice: 80, description: 'Sivas Cumhuriyeti kaynaklı çelik alaşım ana hammaddesi.', emoji: '🪨', priceTrend: [78, 81, 79, 80, 82, 80] },
  { id: 'steel', name: 'Çelik', symbol: 'STEEL', category: 'İşlenmiş Metal', basePrice: 200, currentPrice: 200, description: 'Karabük Cumhuriyeti eritme tesisleri ağır sanayi ürünü.', emoji: '⛓️', priceTrend: [195, 198, 202, 201, 199, 200] },
  { id: 'copper', name: 'Bakır', symbol: 'COPR', category: 'Metal', basePrice: 120, currentPrice: 120, description: 'Kastamonu Cumhuriyeti kaynaklı elektrik şebekesi hammaddesi.', emoji: '🔌', priceTrend: [118, 122, 121, 119, 120, 120] },
  { id: 'aluminum', name: 'ALUM', symbol: 'ALUM', category: 'Hafif Metal', basePrice: 150, currentPrice: 150, description: 'Konya Cumhuriyeti kaynaklı havacılık ve SİHA hafif gövde metali.', emoji: '🥈', priceTrend: [147, 149, 151, 150, 152, 150] },
  { id: 'lithium', name: 'Lityum', symbol: 'LITH', category: 'Nadir Toprak', basePrice: 350, currentPrice: 350, description: 'Eskişehir Cumhuriyeti kaynaklı batarya hücresi ana etken maddesi.', emoji: '🔋', priceTrend: [340, 345, 352, 348, 351, 350] },
  { id: 'boron', name: 'Bor', symbol: 'BOR', category: 'Stratejik Element', basePrice: 500, currentPrice: 500, description: 'Balıkesir Cumhuriyeti kaynaklı zırh kaplama ve yüksek ısı elementi.', emoji: '💎', priceTrend: [490, 495, 502, 501, 498, 500] },
  { id: 'petroleum', name: 'Petrol', symbol: 'PETR', category: 'Enerji & Kimya', basePrice: 280, currentPrice: 280, description: 'Batman Cumhuriyeti kaynaklı ham akaryakıt hammaddesi.', emoji: '🛢️', priceTrend: [275, 279, 283, 281, 280, 280] },
  { id: 'silicon', name: 'Silikon', symbol: 'SLCN', category: 'Yarı İletken', basePrice: 400, currentPrice: 400, description: 'Ankara Cumhuriyeti kaynaklı mikroçip ve radar kartı bileşeni.', emoji: '💾', priceTrend: [390, 395, 401, 399, 402, 400] }
];

const INITIAL_PENDING_LAWS = [
  {
    id: 99,
    title: '⚡ Acil Afet Fonu Bütçe Yasası (Test)',
    description: 'Meclis karar alma hızını ve arşivleme mekanizmasını test etmek üzere hazırlanan 30 saniyelik acil oylama tasarısı.',
    category: 'Reform',
    proposer: 'TBMM Meclis Başkanı',
    timestamp: Date.now() + 30 * 1000,
    voted: null,
    yesVotes: 0,
    noVotes: 0
  },
  {
    id: 1,
    title: 'Eyalet Teknoloji Teşvik Yasası',
    description: 'Bilişim ve yapay zeka alanında faaliyet gösteren şirketlerin eyalet genelinde kurumlar vergisinden %5 muaf tutulması.',
    category: 'Teşvik',
    proposer: 'Yalova Cumhuriyeti Milletvekili',
    timestamp: Date.now() + 23 * 60 * 60 * 1000 + 45 * 60 * 1000,
    voted: null,
    yesVotes: 145,
    noVotes: 98
  },
  {
    id: 2,
    title: 'Altyapı Finansman Reformu',
    description: 'Şehir devletleri arası ticareti canlandırmak adına otoyol ve demiryolu taşımacılık vergilerinin yarı yarıya düşürülmesi.',
    category: 'Altyapı',
    proposer: 'Ankara Cumhuriyeti Temsilcisi',
    timestamp: Date.now() + 18 * 60 * 60 * 1000 + 12 * 60 * 1000,
    voted: null,
    yesVotes: 198,
    noVotes: 72
  }
];

const INITIAL_ARCHIVED_LAWS = [
  {
    id: 344,
    proposalNo: '#344',
    date: '19.05.2026',
    title: 'Asgari Geçim ve Vergi Kanunu Tasarısı (Kabul Edildi)',
    description: 'Tüm işletmelerin yerel yönetimlere ödediği haftalık vergi barajı %8\'den %6\'ya düşürülmüş, vatandaşların sağlık barlarını koruyabilmesi için belediye çorba salonları fonlanmıştır. (Oylama Sonucu: Kabul 186 | Ret 114)',
    status: 'Kabul Edildi',
    outcomeColor: 'hsl(var(--accent-gold))'
  },
  {
    id: 343,
    proposalNo: '#343',
    date: '18.05.2026',
    title: 'İl Özel Lojistik Düzenleme Yasası (Kabul Edildi)',
    description: 'Otoban nakliye ihalelerinde KDV payı %12\'ye sabitlenerek nakliyecilerin eyaletler arası tır geçişlerinde vergi muafiyeti verilmesi uygun görülmüştür. (Oylama Sonucu: Kabul 220 | Ret 80)',
    status: 'Kabul Edildi',
    outcomeColor: 'hsl(var(--accent-cyan))'
  }
];
import { PROVINCE_LOOKUP, DISTRICT_LOOKUP } from './data/locationData';

function App() {
  const [user, setUser] = useState<UserState>(() => {
    const token = localStorage.getItem('politic_token');
    const saved = localStorage.getItem('politic_user_state');
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user state:', e);
      }
    }
    
    if (token) {
      return {
        ...INITIAL_USER_STATE,
        ...parsed,
        isLoggedIn: true,
        ownedVehicles: parsed?.ownedVehicles || [],
        fuelLiters: typeof parsed?.fuelLiters === 'number' ? parsed.fuelLiters : 0
      };
    }
    return INITIAL_USER_STATE;
  });

  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'market' | 'map' | 'laws' | 'enterprise' | 'console' | 'wiki' | 'organization'>('dashboard');
  const [activeComplianceDoc, setActiveComplianceDoc] = useState<ComplianceDocType | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('game-theme');
    if (saved === 'light') return 'light';
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('game-theme', theme);
  }, [theme]);

  const [activeLawsSubTab, setActiveLawsSubTab] = useState<'chamber' | 'pending' | 'history'>('chamber');
  const [topLevelTab, setTopLevelTab] = useState<'personal' | 'role'>('personal');
  const [logs, setLogs] = useState<string[]>(['Karakter simülasyonu başlatıldı.', 'Cumhuriyet Kapısı açıldı.']);
  const [activeTravel, setActiveTravel] = useState<{
    startProvince: string;
    startDistrict: string;
    targetProvince: string;
    targetDistrict: string;
    endTime: number;
    distance: number;
    mode: 'bus' | 'car' | 'plane';
  } | null>(() => {
    const saved = localStorage.getItem('active_travel');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
  const [commodities, setCommodities] = useState<CommodityItem[]>(INITIAL_COMMODITIES);

  const [pendingLaws, setPendingLaws] = useState<any[]>(() => {
    const existingStr = localStorage.getItem('pending_laws');
    let list = [];
    if (existingStr) {
      try {
        list = JSON.parse(existingStr);
      } catch (e) {
        list = INITIAL_PENDING_LAWS;
      }
    } else {
      list = INITIAL_PENDING_LAWS;
    }
    
    // For test purposes: always reset the 30-second law timestamp on initialization to give the user time to test
    list = list.map((law: any) => {
      if (law.id === 99 && law.voted === null) {
        return {
          ...law,
          timestamp: Date.now() + 30 * 1000
        };
      }
      return law;
    });
    localStorage.setItem('pending_laws', JSON.stringify(list));
    return list;
  });

  const [archivedLaws, setArchivedLaws] = useState<any[]>(() => {
    const existingStr = localStorage.getItem('archived_laws');
    if (existingStr) {
      try {
        return JSON.parse(existingStr);
      } catch (e) {
        return INITIAL_ARCHIVED_LAWS;
      }
    }
    localStorage.setItem('archived_laws', JSON.stringify(INITIAL_ARCHIVED_LAWS));
    return INITIAL_ARCHIVED_LAWS;
  });

  const fetchLaws = async () => {
    const token = localStorage.getItem('politic_token');
    if (!token) return;
    try {
      const res = await fetch('/api/v1/politics/laws', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.laws) {
        const pending = data.laws.filter((law: any) => !law.isApproved).map((law: any) => ({
          id: law.id,
          title: law.title,
          description: law.description,
          category: 'Kürsü',
          proposer: 'Milletvekili',
          timestamp: new Date(law.createdAt).getTime() + 24 * 60 * 60 * 1000, // Expires in 24 hours
          yesVotes: law.yesVotes,
          noVotes: law.noVotes,
          voted: law.voted
        }));
        
        const archived = data.laws.filter((law: any) => law.isApproved).map((law: any) => ({
          id: law.id,
          proposalNo: `#${law.id.slice(0, 4)}`,
          date: new Date(law.createdAt).toLocaleDateString('tr-TR'),
          title: law.title,
          description: law.description,
          status: 'Kabul Edildi',
          outcomeColor: 'hsl(var(--accent-emerald))',
          yesVotes: law.yesVotes,
          noVotes: law.noVotes,
          voted: law.voted
        }));
        
        setPendingLaws(pending);
        setArchivedLaws(archived);
      }
    } catch (err) {
      console.error('Error fetching laws:', err);
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      fetchLaws();
      window.addEventListener('pending_laws_updated', fetchLaws);
      return () => {
        window.removeEventListener('pending_laws_updated', fetchLaws);
      };
    }
  }, [user.isLoggedIn]);

  const [timeTicker, setTimeTicker] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTimeTicker(now);

      // Check for expired laws and archive them automatically
      const existingStr = localStorage.getItem('pending_laws');
      if (existingStr) {
        try {
          const currentPending = JSON.parse(existingStr);
          const expired = currentPending.filter((law: any) => law.timestamp <= now);
          
          if (expired.length > 0) {
            const nonExpired = currentPending.filter((law: any) => law.timestamp > now);
            
            // Get existing archive
            const currentArchivedStr = localStorage.getItem('archived_laws') || JSON.stringify(INITIAL_ARCHIVED_LAWS);
            let currentArchived = JSON.parse(currentArchivedStr);
            
            expired.forEach((law: any) => {
              let yes = law.yesVotes;
              let no = law.noVotes;
              if (law.voted === null) {
                // If user didn't vote, simulate representative votes
                yes = Math.floor(Math.random() * 120) + 100;
                no = Math.floor(Math.random() * 120) + 100;
              }
              
              const isAccepted = yes > no;
              const newArchiveItem = {
                id: law.id,
                proposalNo: `#${Math.floor(Math.random() * 400) + 350}`,
                date: new Date().toLocaleDateString('tr-TR'),
                title: `${law.title} (${isAccepted ? 'Kabul Edildi' : 'Reddedildi'})`,
                description: law.description + ` (Oylama Sonucu: Kabul ${yes} | Ret ${no}. Vatandaş Tercihi: ${law.voted === 'yes' ? 'Kabul' : law.voted === 'no' ? 'Ret' : 'Kararsız'})`,
                status: isAccepted ? 'Kabul Edildi' : 'Reddedildi',
                outcomeColor: isAccepted ? 'hsl(var(--accent-gold))' : 'hsl(var(--accent-red))'
              };
              
              currentArchived.unshift(newArchiveItem);
              addLog(`📜 Yasa Teklifi Arşivlendi: "${law.title}" meclis oylaması sonucu ${isAccepted ? 'KABUL' : 'RET'} olarak sonuçlandı.`);
            });
            
            localStorage.setItem('pending_laws', JSON.stringify(nonExpired));
            localStorage.setItem('archived_laws', JSON.stringify(currentArchived));
            setPendingLaws(nonExpired);
            setArchivedLaws(currentArchived);
          }
        } catch (e) {
          console.error('Error during auto archiving:', e);
        }
      }

      // Check for active travel progression
      const travelSaved = localStorage.getItem('active_travel');
      if (travelSaved) {
        try {
          const travel = JSON.parse(travelSaved);
          if (now >= travel.endTime) {
            setUser(prev => ({
              ...prev,
              province: travel.targetProvince,
              district: travel.targetDistrict
            }));
            localStorage.removeItem('active_travel');
            setActiveTravel(null);
            setTimeout(() => {
              const modeText = travel.mode === 'plane' ? '✈️ Uçak yolculuğu' : travel.mode === 'bus' ? '🚌 Otobüs yolculuğu' : '🚗 Araç yolculuğu';
              addLog(`${modeText} tamamlandı! ${travel.targetProvince} Cumhuriyeti, ${travel.targetDistrict} konumuna başarıyla ulaştınız.`);
              confetti({
                particleCount: 85,
                spread: 65,
                origin: { y: 0.6 }
              });
            }, 0);
          } else {
            setActiveTravel(travel);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // If activeTravel state is set but storage is empty, sync state to null
        setActiveTravel(null);
      }

      // Check for active moving progression
      const movingSaved = localStorage.getItem('active_moving');
      if (movingSaved) {
        try {
          const moving = JSON.parse(movingSaved);
          if (now >= moving.endTime) {
            setUser(prev => ({
              ...prev,
              residenceProvince: moving.targetProvince,
              residenceDistrict: moving.targetDistrict
            }));
            localStorage.removeItem('active_moving');
            setActiveMoving(null);
            setTimeout(() => {
              addLog(`🏠 İkametgah taşıma süreci tamamlandı! Artık resmi ikametgahınız: ${moving.targetProvince} Cumhuriyeti, ${moving.targetDistrict}. Şirketleriniz de bu bölgede faaliyete geçmiştir.`);
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
            }, 0);
          } else {
            setActiveMoving(moving);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setActiveMoving(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state whenever local storage updates (e.g. from ParliamentSeatMap modal)
  useEffect(() => {
    const handleSync = () => {
      const existingStr = localStorage.getItem('pending_laws');
      if (existingStr) {
        try {
          setPendingLaws(JSON.parse(existingStr));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('pending_laws_updated', handleSync);
    return () => window.removeEventListener('pending_laws_updated', handleSync);
  }, []);
  // Role-based state variables
  const [activePresidentTab, setActivePresidentTab] = useState<'decrees' | 'cabinet' | 'central_bank' | 'diplomacy' | 'budget' | 'residency' | 'reserves'>('decrees');
  const [activeMilletvekiliTab, setActiveMilletvekiliTab] = useState<'proposals' | 'citizens'>('proposals');
  const [activeKomutanTab, setActiveKomutanTab] = useState<'military' | 'alarm'>('military');

  // Residency applications state
  const [residencyApplications, setResidencyApplications] = useState<ResidencyApplication[]>(() => {
    const saved = localStorage.getItem('politic_residency_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Active moving (relocation timer) state
  const [activeMoving, setActiveMoving] = useState<{
    targetProvince: string;
    targetDistrict: string;
    startTime: number;
    endTime: number;
  } | null>(() => {
    const saved = localStorage.getItem('active_moving');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Simulating review of player's residency application by foreign government
  useEffect(() => {
    if (!user.isLoggedIn) return;
    const pendingApp = residencyApplications.find(app => 
      app.applicantName === `${user.characterName} ${user.characterSurname}` && 
      app.status === 'pending'
    );
    if (pendingApp) {
      const timer = setTimeout(() => {
        setResidencyApplications(prev => {
          const updated = prev.map(app => {
            if (app.id === pendingApp.id) {
              return { ...app, status: 'approved' as const };
            }
            return app;
          });
          localStorage.setItem('politic_residency_applications', JSON.stringify(updated));
          return updated;
        });

        const movingData = {
          targetProvince: pendingApp.province,
          targetDistrict: pendingApp.district,
          startTime: Date.now(),
          endTime: Date.now() + 15 * 60 * 1000 // 15 minutes
        };
        localStorage.setItem('active_moving', JSON.stringify(movingData));
        setActiveMoving(movingData);
        addLog(`✅ İkametgah Başvurusu Onaylandı: ${pendingApp.province} Cumhuriyeti Dışişleri Bakanı başvurunuzu onayladı! 15 dakikalık taşınma süreci başladı.`);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [residencyApplications, user.isLoggedIn, user.characterName, user.characterSurname]);

  // Cumhurbaşkanlığı Simülasyon Verileri
  const [treasuryBalance, setTreasuryBalance] = useState<number>(14820000);
  const [interestRate, setInterestRate] = useState<number>(15.0);
  const [inflationRate, setInflationRate] = useState<number>(12.5);
  const [cabinet, setCabinet] = useState({
    treasury: { name: 'Boş', integrity: 0, expertise: 0 },
    defense: { name: 'Boş', integrity: 0, expertise: 0 },
    logistics: { name: 'Boş', integrity: 0, expertise: 0 }
  });

  const [activeDecrees, setActiveDecrees] = useState<any[]>([
    { id: 1, title: 'Kalkınma Planı Teşvik Kararnamesi', date: '19.05.2026', status: 'İmzalandı', details: 'Sanayi ve tarım yatırımlarına devlet sübvansiyonu sağlanır.' }
  ]);

  const [budgetAllocation, setBudgetAllocation] = useState({
    education: 25,
    defense: 25,
    health: 25,
    science: 25
  });

  // Milletvekili Simülasyon Verileri
  const [billProposals, setBillProposals] = useState<any[]>([
    { id: 1, title: 'Asgari Ücretin Altın Endeksine Bağlanması Yasası', status: 'Tartışılıyor', votesYes: 140, votesNo: 95 },
    { id: 2, title: 'Zonguldak Kömür Madenlerinin Kamulaştırılması Yasası', status: 'Oylamada', votesYes: 180, votesNo: 172 }
  ]);

  // Komutan Simülasyon Verileri
  const [alarmLevel, setAlarmLevel] = useState<'NORMAL' | 'SARI' | 'KIRMIZI'>('NORMAL');
  const [deployments, setDeployments] = useState<any[]>([
    { id: 1, border: 'Yalova-İstanbul Sınırı', forceSize: '1,500 Asker', status: 'Devriye' },
    { id: 2, border: 'Batman Petrol Rafinerisi Çevresi', forceSize: '800 Asker', status: 'Güvenlik Barajı' }
  ]);

  useEffect(() => {
    if (user.isLoggedIn) {
      localStorage.setItem('politic_user_state', JSON.stringify(user));
    }
  }, [user]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('tr-TR');
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Real-time market WebSocket, Profile sync, and Heartbeat Loop
  useEffect(() => {
    if (!user.isLoggedIn) return;

    const token = localStorage.getItem('politic_token');
    
    // 1. Fetch profile if token exists to keep state fresh from PostgreSQL
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const u = data.data;
          setUser(prev => ({
            ...prev,
            isLoggedIn: true,
            username: u.username,
            characterName: u.characterName,
            characterSurname: u.characterSurname,
            cash: parseFloat(u.cash),
            bankCheckingBalance: parseFloat(u.bankCheckingBalance),
            bankSavingsBalance: parseFloat(u.bankSavingsBalance),
            creditScore: u.creditScore,
            activeLoanDebt: parseFloat(u.activeLoanDebt),
            taxDebt: parseFloat(u.taxDebt),
            health: u.health,
            hunger: u.hunger,
            thirst: u.thirst,
            energy: u.energy,
            happiness: u.happiness,
            isSick: u.isSick,
            politicalRole: u.politicalRole,
            politicalReputation: u.politicalReputation,
            hasVotedThisTerm: u.hasVotedThisTerm,
            province: PROVINCE_LOOKUP[u.currentProvinceId] || 'Ankara',
            district: DISTRICT_LOOKUP[u.currentDistrictId] || 'Çankaya',
            residenceProvince: PROVINCE_LOOKUP[u.citizenshipProvinceId] || 'Ankara',
            residenceDistrict: DISTRICT_LOOKUP[u.citizenshipDistrictId] || 'Çankaya',
            isCharacterCreated: u.isCharacterCreated,
            avatarId: u.avatarId,
            isometricModelId: u.isometricModelId,
            backstoryId: u.backstoryId,
            gender: u.gender,
            characterAge: u.characterAge,
            citizenId: u.citizenId,
            politicalInfluence: u.politicalInfluence !== undefined ? u.politicalInfluence : 840,
            coalMineLevel: u.coalMineLevel !== undefined ? u.coalMineLevel : 0,
            autoFactoryLevel: u.autoFactoryLevel !== undefined ? u.autoFactoryLevel : 0,
            defenseFactoryLevel: u.defenseFactoryLevel !== undefined ? u.defenseFactoryLevel : 0,
            materials: u.materials || prev.materials
          }));
        } else {
          // Token expired or invalid
          localStorage.removeItem('politic_token');
          setUser(prev => ({ ...prev, isLoggedIn: false }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();

    // 2. Setup WebSocket connection for live price stream
    const socket = socketIO();
    
    socket.emit('join:market');
    
    socket.on('commodity_prices_updated', (updatedCommodities: any[]) => {
      console.log('Received updated commodity prices via WebSocket:', updatedCommodities);
      setCommodities(prev => prev.map(c => {
        const match = updatedCommodities.find(uc => uc.id === c.id);
        if (match) {
          return {
            ...c,
            currentPrice: parseFloat(match.currentPrice),
            priceTrend: Array.isArray(match.priceTrend) ? match.priceTrend.map(parseFloat) : c.priceTrend
          };
        }
        return c;
      }));
    });

    // 3. Heartbeat Loop (every 60 seconds when tab is active)
    const heartbeatInterval = setInterval(async () => {
      const activeToken = localStorage.getItem('politic_token');
      if (activeToken && document.visibilityState === 'visible') {
        try {
          await fetch('/api/v1/users/heartbeat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken}`
            }
          });
          console.log('[Heartbeat] Pinged server successfully.');
        } catch (err) {
          console.error('[Heartbeat] Failed to ping:', err);
        }
      }
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(heartbeatInterval);
    };
  }, [user.isLoggedIn]);

  // Debounced Auto-Sync Economy to Backend
  useEffect(() => {
    if (!user.isLoggedIn || !user.isCharacterCreated) return;

    const token = localStorage.getItem('politic_token');
    if (!token) return;

    const syncTimeout = setTimeout(async () => {
      try {
        await fetch('/api/v1/users/sync-economy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            cash: user.cash,
            politicalInfluence: user.politicalInfluence,
            coalMineLevel: user.coalMineLevel,
            autoFactoryLevel: user.autoFactoryLevel,
            defenseFactoryLevel: user.defenseFactoryLevel,
            materials: user.materials
          })
        });
      } catch (err) {
        console.error('Failed to sync economy with backend:', err);
      }
    }, 2000); // Debounce sync by 2 seconds

    return () => clearTimeout(syncTimeout);
  }, [
    user.isLoggedIn,
    user.isCharacterCreated,
    user.cash,
    user.politicalInfluence,
    user.coalMineLevel,
    user.autoFactoryLevel,
    user.defenseFactoryLevel,
    user.materials
  ]);

  // Login Handler
  const handleLogin = (userData: { 
    username: string; 
    characterName: string; 
    characterSurname: string; 
    politicalRole: string;
    province?: string;
    residenceProvince?: string;
    residenceDistrict?: string;
    isCharacterCreated?: boolean;
    avatarId?: string;
    isometricModelId?: string;
    backstoryId?: string;
    gender?: string | null;
    characterAge?: number | null;
    politicalInfluence?: number;
    coalMineLevel?: number;
    autoFactoryLevel?: number;
    defenseFactoryLevel?: number;
    materials?: any;
    citizenId?: string;
  }) => {
    setUser(prev => ({
      ...prev,
      isLoggedIn: true,
      username: userData.username,
      characterName: userData.characterName,
      characterSurname: userData.characterSurname,
      politicalRole: userData.politicalRole,
      province: userData.province || prev.province,
      district: userData.residenceDistrict || prev.district,
      residenceProvince: userData.residenceProvince || userData.province || prev.residenceProvince,
      residenceDistrict: userData.residenceDistrict || prev.residenceDistrict,
      isCharacterCreated: userData.isCharacterCreated !== undefined ? userData.isCharacterCreated : true,
      avatarId: userData.avatarId || prev.avatarId,
      isometricModelId: userData.isometricModelId || prev.isometricModelId,
      backstoryId: userData.backstoryId || prev.backstoryId,
      gender: userData.gender !== undefined ? userData.gender : prev.gender,
      characterAge: userData.characterAge !== undefined && userData.characterAge !== null ? userData.characterAge : prev.characterAge,
      citizenId: userData.citizenId || prev.citizenId,
      politicalInfluence: userData.politicalInfluence !== undefined ? userData.politicalInfluence : prev.politicalInfluence,
      coalMineLevel: userData.coalMineLevel !== undefined ? userData.coalMineLevel : prev.coalMineLevel,
      autoFactoryLevel: userData.autoFactoryLevel !== undefined ? userData.autoFactoryLevel : prev.autoFactoryLevel,
      defenseFactoryLevel: userData.defenseFactoryLevel !== undefined ? userData.defenseFactoryLevel : prev.defenseFactoryLevel,
      materials: userData.materials || prev.materials
    }));
    addLog(`Vatandaş giriş yaptı: ${userData.characterName} ${userData.characterSurname}`);
  };

  const handleCharacterCreationComplete = async (data: {
    avatarId: string;
    isometricModelId: string;
    backstoryId: string;
    provinceId: number;
    districtId: number;
    gender: string;
    characterAge: number;
  }) => {
    const token = localStorage.getItem('politic_token');
    if (!token) return;

    const res = await fetch('/api/v1/users/setup-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (result.success) {
      const u = result.data;
      
      // Fire confetti!
      const canvasConfetti = (await import('canvas-confetti')).default;
      canvasConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setUser(prev => ({
        ...prev,
        isCharacterCreated: true,
        avatarId: u.avatarId,
        isometricModelId: u.isometricModelId,
        backstoryId: u.backstoryId,
        province: PROVINCE_LOOKUP[u.currentProvinceId] || 'Ankara',
        district: DISTRICT_LOOKUP[u.currentDistrictId] || 'Çankaya',
        residenceProvince: PROVINCE_LOOKUP[u.citizenshipProvinceId] || 'Ankara',
        residenceDistrict: DISTRICT_LOOKUP[u.citizenshipDistrictId] || 'Çankaya',
        gender: u.gender,
        characterAge: u.characterAge,
        citizenId: u.citizenId,
      }));

      addLog('Karakteriniz başarıyla oluşturuldu, hoş geldiniz!');
    } else {
      throw new Error(result.message || 'Karakter kaydedilemedi.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('politic_user_state');
    localStorage.removeItem('politic_token');
    setUser(INITIAL_USER_STATE);
    setActiveMenu('dashboard');
    setLogs(['Karakter simülasyonu kapatıldı.']);
  };

  // Update Balances
  const handleUpdateBalances = (newBalances: Partial<UserState>, logMessage: string) => {
    setUser(prev => ({
      ...prev,
      ...newBalances
    }));
    addLog(logMessage);
  };

  // Handle Vote
  const handleVote = (partyName: string) => {
    setUser(prev => ({
      ...prev,
      hasVotedThisTerm: true,
      politicalReputation: prev.politicalReputation + 10,
      politicalInfluence: prev.politicalInfluence + 50
    }));
    addLog(`Yüksek Seçim Kurulu sandığında oy kullanıldı. Tercih: ${partyName} (Nüfuz: +50)`);
  };

  // Handle Travel
  const handleTravel = (
    province: string,
    district: string,
    cost: number,
    energyCost: number,
    distanceKm: number,
    mode: 'bus' | 'car' | 'plane' = 'bus',
    fuelNeeded: number = 0
  ) => {
    setUser(prev => {
      const updated = {
        ...prev,
        cash: prev.cash - cost,
        energy: Math.max(0, prev.energy - energyCost)
      };
      if (mode === 'car') {
        updated.fuelLiters = Math.max(0, (prev.fuelLiters || 0) - fuelNeeded);
      }
      return updated;
    });

    if (distanceKm > 0) {
      const durationSeconds = Math.max(1, mode === 'plane' ? distanceKm * 0.2 : mode === 'bus' ? distanceKm * 2 : distanceKm * 1);
      const travelData = {
        startProvince: user.province,
        startDistrict: user.district,
        targetProvince: province,
        targetDistrict: district,
        endTime: Date.now() + durationSeconds * 1000,
        distance: distanceKm,
        mode
      };
      localStorage.setItem('active_travel', JSON.stringify(travelData));
      setActiveTravel(travelData);
      
      const modeEmoji = mode === 'plane' ? '✈️' : mode === 'bus' ? '🚌' : '🚗';
      const modeLabel = mode === 'plane' ? 'Uçak' : mode === 'bus' ? 'Otobüs' : 'Özel Araç';
      addLog(`${modeEmoji} ${province} Cumhuriyeti, ${district} konumuna ${modeLabel} yolculuğu başlatıldı. Mesafe: ${distanceKm} km. (Süre: ${Math.round(durationSeconds)} sn)`);
    } else {
      setUser(prev => ({
        ...prev,
        province,
        district
      }));
      addLog(`✈️ Zaten ${province} Cumhuriyeti, ${district} konumundasınız.`);
    }
  };

  // Gallery Purchase Handler
  const handleBuyVehicle = (vehicleId: string, price: number) => {
    if (user.cash < price) {
      setAlertMsg("Aracı satın almak için yeterli paranız yok!");
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }
    const vehicleNames: Record<string, string> = {
      classic_sahin: 'Tofaş Şahin',
      togg_suv: 'Togg T10X SUV',
      armored_suv: 'Zırhlı Off-Road SUV',
      vip_sedan: 'Ultra Lüks VIP Sedan'
    };
    const vehicleName = vehicleNames[vehicleId] || vehicleId;

    setUser(prev => {
      const owned = prev.ownedVehicles || [];
      if (owned.includes(vehicleId)) {
        setTimeout(() => {
          setAlertMsg("Bu araca zaten sahipsiniz!");
          setTimeout(() => setAlertMsg(null), 3000);
        }, 0);
        return prev;
      }
      const updated = {
        ...prev,
        cash: prev.cash - price,
        ownedVehicles: [...owned, vehicleId]
      };
      setTimeout(() => addLog(`🚗 Galeri: ${vehicleName} satın alındı! (Gider: -${price.toLocaleString('tr-TR')} ₺)`), 0);
      return updated;
    });
  };

  // Gas Station Purchase Handler
  const handleBuyFuel = (liters: number, pricePerLiter: number) => {
    const cost = Math.round(liters * pricePerLiter);
    if (user.cash < cost) {
      setAlertMsg("Benzin satın almak için yeterli paranız yok!");
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }
    setUser(prev => {
      const updated = {
        ...prev,
        cash: prev.cash - cost,
        fuelLiters: Math.round(((prev.fuelLiters || 0) + liters) * 100) / 100
      };
      setTimeout(() => addLog(`⛽ Benzin İstasyonu: ${liters} litre benzin alındı! (Gider: -${cost.toLocaleString('tr-TR')} ₺)`), 0);
      return updated;
    });
  };

  // Handle Travel Skip instantly by buying a plane ticket (₺500)
  const handleInstantTravelSkip = () => {
    if (!activeTravel) return;
    if (user.cash < 500) {
      setAlertMsg("Hızlı uçuş kartı almak için yeterli nakdiniz yok! (Gerekli: ₺500)");
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    const destinationProvince = activeTravel.targetProvince;
    const destinationDistrict = activeTravel.targetDistrict;

    setUser(prev => ({
      ...prev,
      cash: prev.cash - 500,
      province: destinationProvince,
      district: destinationDistrict
    }));

    localStorage.removeItem('active_travel');
    setActiveTravel(null);
    setTimeout(() => {
      addLog(`✈️ Hızlı Uçuş Kartı Kullanıldı: Seyahat süresi atlandı ve ${destinationProvince} Cumhuriyeti, ${destinationDistrict} konumuna anında ulaşıldı! (Gider: -500 ₺)`);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 0);
  };

  // Handle Move Residence
  const handleMoveResidence = (province: string, district: string, cost: number, energyCost: number) => {
    setUser(prev => ({
      ...prev,
      cash: prev.cash - cost,
      energy: Math.max(0, prev.energy - energyCost)
    }));

    const newApp: ResidencyApplication = {
      id: `res-app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      province,
      district,
      applicantName: `${user.characterName} ${user.characterSurname}`,
      applicantRole: user.politicalRole,
      status: 'pending',
      createdAt: Date.now()
    };

    if (user.politicalRole === 'CUMHURBASKANI' && province === user.province) {
      newApp.status = 'approved';
      const movingData = {
        targetProvince: province,
        targetDistrict: district,
        startTime: Date.now(),
        endTime: Date.now() + 15 * 60 * 1000
      };
      localStorage.setItem('active_moving', JSON.stringify(movingData));
      setActiveMoving(movingData);
      addLog(`👑 Cumhurbaşkanı kendi kararnamesiyle ikametgah taşıma iznini onayladı! 15 dakikalık taşınma süreci başladı.`);
    } else {
      addLog(`🏠 İkametgah taşıma başvurusu yapıldı: ${province} Cumhuriyeti, ${district} (Gider: -${cost} ₺, Enerji: -${energyCost}). Cumhurbaşkanı veya Dışişleri Bakanı onay süreci bekleniyor...`);
    }

    setResidencyApplications(prev => {
      const updated = [newApp, ...prev];
      localStorage.setItem('politic_residency_applications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleApproveResidency = (appId: string) => {
    setResidencyApplications(prev => {
      const updated = prev.map(app => {
        if (app.id === appId) {
          if (app.applicantName === `${user.characterName} ${user.characterSurname}`) {
            const movingData = {
              targetProvince: app.province,
              targetDistrict: app.district,
              startTime: Date.now(),
              endTime: Date.now() + 15 * 60 * 1000
            };
            localStorage.setItem('active_moving', JSON.stringify(movingData));
            setActiveMoving(movingData);
            addLog(`👑 Resmi ikametgah taşıma başvurunuz onaylandı! 15 dakikalık taşınma süreci başladı.`);
          } else {
            addLog(`🏛️ Cumhurbaşkanı, ${app.applicantName} isimli vatandaşın ${app.province} Cumhuriyeti, ${app.district} ilçesine taşınma başvurusunu onayladı.`);
          }
          return { ...app, status: 'approved' as const };
        }
        return app;
      });
      localStorage.setItem('politic_residency_applications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRejectResidency = (appId: string) => {
    setResidencyApplications(prev => {
      const updated = prev.map(app => {
        if (app.id === appId) {
          if (app.applicantName === `${user.characterName} ${user.characterSurname}`) {
            addLog(`❌ Resmi ikametgah taşıma başvurunuz reddedildi!`);
          } else {
            addLog(`🏛️ Cumhurbaşkanı, ${app.applicantName} isimli vatandaşın taşınma başvurusunu reddetti.`);
          }
          return { ...app, status: 'rejected' as const };
        }
        return app;
      });
      localStorage.setItem('politic_residency_applications', JSON.stringify(updated));
      return updated;
    });
  };

  // Buy item from store
  const handleBuyItem = (item: MarketplaceItem) => {
    if (user.cash < item.price) {
      setAlertMsg('Yetersiz nakit para!');
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    const updatedUser = { ...user };
    updatedUser.cash -= item.price;

    if (item.replenishType === 'hunger') {
      updatedUser.hunger = Math.min(100, updatedUser.hunger + item.replenishValue);
    } else if (item.replenishType === 'thirst') {
      updatedUser.thirst = Math.min(100, updatedUser.thirst + item.replenishValue);
    } else if (item.replenishType === 'energy') {
      updatedUser.energy = Math.min(100, updatedUser.energy + item.replenishValue);
    } else if (item.replenishType === 'health') {
      updatedUser.health = Math.min(100, updatedUser.health + item.replenishValue);
    } else if (item.replenishType === 'cure') {
      updatedUser.isSick = false;
      updatedUser.health = Math.min(100, updatedUser.health + item.replenishValue);
    }

    setUser(updatedUser);
    addLog(`Marketten ${item.name} satın alındı (${item.price} ₺).`);
  };

  // Emtia Borsası - Alım/Satım İşlemleri
  const handleBuyCommodity = (id: string, amount: number, price: number) => {
    const totalCost = Math.round(amount * price * 100) / 100;
    if (user.cash < totalCost) {
      setAlertMsg(`Yetersiz nakit para! Gerekli: ₺${totalCost.toLocaleString('tr-TR')}`);
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    setUser(prev => ({
      ...prev,
      cash: Math.round((prev.cash - totalCost) * 100) / 100,
      materials: {
        ...prev.materials,
        [id]: (prev.materials[id as keyof typeof prev.materials] || 0) + amount
      }
    }));
    addLog(`📈 Borsa: ${amount} birim ${id.toUpperCase()} satın alındı. (Birim Fiyatı: ${price} ₺, Toplam Gider: ${totalCost} ₺)`);
  };

  const handleSellCommodity = (id: string, amount: number, price: number) => {
    const currentAmount = user.materials[id as keyof typeof user.materials] || 0;
    if (currentAmount < amount) {
      setAlertMsg(`Yetersiz emtia envanteri! Mevcut: ${currentAmount} birim, İstenen: ${amount} birim`);
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    const totalRevenue = Math.round(amount * price * 100) / 100;
    setUser(prev => ({
      ...prev,
      cash: Math.round((prev.cash + totalRevenue) * 100) / 100,
      materials: {
        ...prev.materials,
        [id]: Math.max(0, currentAmount - amount)
      }
    }));
    addLog(`📉 Borsa: ${amount} birim ${id.toUpperCase()} satıldı. (Birim Fiyatı: ${price} ₺, Toplam Gelir: ${totalRevenue} ₺)`);
  };

  // Upgrade / Purchase Factory (Mobile App Feature!)
  const handleUpgradeFactory = (type: 'coal' | 'auto' | 'defense', cost: number, companyName?: string) => {
    if (user.cash < cost) {
      setAlertMsg('Yetersiz nakit para!');
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    setUser(prev => {
      const updated = { ...prev };
      updated.cash -= cost;
      if (type === 'coal') {
        updated.coalMineLevel += 1;
        setTimeout(() => {
          if (companyName) {
            addLog(`🏢 ${companyName} satın alındı/yükseltildi! (Seviye: ${updated.coalMineLevel}, Gider: -${cost} ₺)`);
          } else {
            addLog(`🏭 Zonguldak Kömür Madeni seviye ${updated.coalMineLevel} yükseltildi! (Gider: -${cost} ₺)`);
          }
        }, 0);
      } else if (type === 'auto') {
        updated.autoFactoryLevel += 1;
        setTimeout(() => {
          if (companyName) {
            addLog(`🏢 ${companyName} satın alındı/yükseltildi! (Seviye: ${updated.autoFactoryLevel}, Gider: -${cost} ₺)`);
          } else {
            addLog(`🚗 Kocaeli Otomotiv Fabrikası seviye ${updated.autoFactoryLevel} yükseltildi! (Gider: -${cost} ₺)`);
          }
        }, 0);
      } else if (type === 'defense') {
        updated.defenseFactoryLevel += 1;
        updated.politicalInfluence += 150;
        setTimeout(() => {
          if (companyName) {
            addLog(`🏢 ${companyName} satın alındı/yükseltildi! (Seviye: ${updated.defenseFactoryLevel}, Gider: -${cost} ₺, Nüfuz: +150)`);
          } else {
            addLog(`🛡️ Ankara Savunma Sanayii Üssü seviye ${updated.defenseFactoryLevel} yükseltildi! (Gider: -${cost} ₺, Nüfuz: +150)`);
          }
        }, 0);
      }
      return updated;
    });
  };



  // Vote on a pending law proposal
  const handleVoteLaw = async (lawId: string | number, voteType: 'yes' | 'no') => {
    const token = localStorage.getItem('politic_token');
    if (!token) return;

    try {
      const res = await fetch('/api/v1/politics/laws/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lawId, vote: voteType })
      });
      const data = await res.json();

      if (!data.success) {
        setAlertMsg(data.message || 'Oy verme başarısız.');
        setTimeout(() => setAlertMsg(null), 3000);
        return;
      }

      await fetchLaws();

      setUser(prev => ({
        ...prev,
        politicalReputation: prev.politicalReputation + 15,
        politicalInfluence: prev.politicalInfluence + 75
      }));

      if (voteType === 'yes') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        addLog(`Kanun Teklifi Oylaması: KABUL oyu kullanıldı. (Nüfuz: +75, İtibar: +15)`);
      } else {
        addLog(`Kanun Teklifi Oylaması: RET oyu kullanıldı. (Nüfuz: +75, İtibar: +15)`);
      }
    } catch (e) {
      console.error(e);
      setAlertMsg('Bağlantı hatası: Oy verilemedi.');
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  // Simulating Life ticks (depletion of hunger, thirst, energy & PASSIVE INCOME from factories)
  useEffect(() => {
    if (!user.isLoggedIn) return;

    const interval = setInterval(() => {
      setUser(prev => {
        let newHunger = Math.max(0, prev.hunger - 1);
        let newThirst = Math.max(0, prev.thirst - 2);
        let newEnergy = Math.max(0, prev.energy - 1);
        let newHealth = prev.health;
        let newIsSick = prev.isSick;

        // Random sickness chance if health is low or hunger/thirst is 0
        if (!newIsSick && (newHunger < 10 || newThirst < 10) && Math.random() < 0.25) {
          newIsSick = true;
          setTimeout(() => addLog('🚨 Uyarı: Yetersiz beslenme sebebiyle karakteriniz hastalandı!'), 0);
        }

        // Sickness drains health
        if (newIsSick) {
           newHealth = Math.max(0, newHealth - 3);
        }

        // Hunger / Thirst depletion drains health
        if (newHunger === 0 || newThirst === 0) {
          newHealth = Math.max(0, newHealth - 4);
        }

        // Pass out mechanic if health drops to 0
        if (newHealth === 0) {
          setTimeout(() => addLog('💔 Karakteriniz bayıldı! Devlet hastanesinde tedavi edilip taburcu edildiniz.'), 0);
          return {
            ...prev,
            cash: Math.max(0, prev.cash - 300), // Medical fees
            health: 50,
            hunger: 60,
            thirst: 60,
            energy: 60,
            isSick: false
          };
        }

        // passive income calculation
        let coalBonusMultiplier = 1;
        let subsidyBonus = 0;
        let decisionBonus = 0;
        try {
          const coalCompanyId = localStorage.getItem('owned_company_id_coal') || 'coal-default';
          const savedUpgrades = localStorage.getItem(`upgrades_${coalCompanyId}`);
          if (savedUpgrades) {
            const upgrades = JSON.parse(savedUpgrades);
            coalBonusMultiplier += (upgrades.machinery || 0) * 0.15;
            coalBonusMultiplier += (upgrades.logistics || 0) * 0.20;
            subsidyBonus += (upgrades.environment || 0) * 5;
          }
          const choice = localStorage.getItem(`decision_choice_${coalCompanyId}`);
          if (choice === 'A') {
            decisionBonus = 15;
          } else if (choice === 'C') {
            decisionBonus = -10;
          }
        } catch (e) {
          console.error(e);
        }

        const coalIncome = Math.round(prev.coalMineLevel * 25 * coalBonusMultiplier);
        const tickIncome = coalIncome + (prev.autoFactoryLevel * 80) + (prev.defenseFactoryLevel * 250) + subsidyBonus + decisionBonus;
        if (tickIncome > 0) {
          setTimeout(() => addLog(`💰 Fabrikalarınızdan pasif gelir elde edildi: +${tickIncome} ₺`), 0);
        }

        return {
          ...prev,
          cash: prev.cash + tickIncome,
          hunger: newHunger,
          thirst: newThirst,
          energy: newEnergy,
          health: newHealth,
          isSick: newIsSick
        };
      });
    }, 10000); // Ticks every 10 seconds

    return () => clearInterval(interval);
  }, [user.isLoggedIn]);

  if (!user.isLoggedIn) {
    return <AuthLayout onLoginSuccess={handleLogin} />;
  }

  if (user.isCharacterCreated === false) {
    return <CharacterCreationScreen onComplete={handleCharacterCreationComplete} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Travel Lock Overlay */}
      {activeTravel && (() => {
        const remainingSeconds = Math.max(0, Math.ceil((activeTravel.endTime - Date.now()) / 1000));
        const totalDuration = activeTravel.distance;
        const elapsedSeconds = Math.max(0, totalDuration - remainingSeconds);
        const percent = Math.min(100, Math.max(0, (elapsedSeconds / totalDuration) * 100));

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 15, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2.5rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.9) 0%, rgba(10, 12, 22, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(6, 182, 212, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Subtle background glow */}
              <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '140%',
                height: '140%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
              }} />

              {/* Title Block */}
              {(() => {
                const modeEmoji = activeTravel.mode === 'plane' ? '✈️' : activeTravel.mode === 'bus' ? '🚌' : '🚗';
                const modeLabel = activeTravel.mode === 'plane' ? 'Uçuş Gerçekleştiriliyor' : activeTravel.mode === 'bus' ? 'Otobüs Yolculuğu' : 'Özel Araç Seyahati';
                return (
                  <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{modeEmoji}</span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {modeLabel}...
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                      Şehir devletleri arasında güvenlik kontrolleri ve transit geçiş yapılıyor.
                    </p>
                  </div>
                );
              })()}

              {/* Destination/Departure Info Card */}
              <div style={{
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Başlangıç</span>
                  <strong style={{ fontSize: '0.9rem', color: 'white' }}>{activeTravel.startDistrict}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>{activeTravel.startProvince}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'hsl(var(--accent-cyan))' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{activeTravel.distance} km</span>
                  <span style={{ fontSize: '0.9rem', margin: '0.15rem 0' }}>➡️</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Hedef</span>
                  <strong style={{ fontSize: '0.9rem', color: 'white' }}>{activeTravel.targetDistrict}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>{activeTravel.targetProvince}</span>
                </div>
              </div>

              {/* Progress bar track & animating vehicle emoji */}
              <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  position: 'relative',
                  marginTop: '1.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {/* Glowing progress line */}
                  <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                    borderRadius: '3px',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                  }} />

                  {/* Animated emoji vehicle overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: `calc(${percent}% - 14px)`,
                    fontSize: '1.25rem',
                    transition: 'left 1s linear',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                  }}>
                    {activeTravel.mode === 'plane' ? '✈️' : activeTravel.mode === 'bus' ? '🚌' : '🚗'}
                  </div>
                </div>

                {/* Remaining Duration Clock */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Yolculuk Oranı: %{Math.round(percent)}</span>
                  <span style={{ color: 'hsl(var(--accent-gold))', fontWeight: 700 }}>
                    Kalan Süre: {remainingSeconds >= 60 
                      ? `${Math.floor(remainingSeconds / 60)} dk ${remainingSeconds % 60} sn` 
                      : `${remainingSeconds} sn`}
                  </span>
                </div>
              </div>

              {/* Premium instant skip option */}
              <div style={{ zIndex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={handleInstantTravelSkip}
                  className="btn-success"
                  disabled={user.cash < 500}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: user.cash >= 500 ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                    opacity: user.cash >= 500 ? 1 : 0.5,
                    cursor: user.cash >= 500 ? 'pointer' : 'not-allowed',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  ⚡ Hızlı Uçuş Kartı Kullan (₺500)
                </button>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                  {user.cash >= 500 
                    ? `500 ₺ ödeyerek bekleme süresini anında atlayabilirsiniz.` 
                    : `Hızlı uçuş için bakiye yetersiz. (Mevcut Nakit: ${Math.round(user.cash)} ₺)`}
                </span>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Floating Residency Relocation Progress Card */}
      {activeMoving && (() => {
        const remainingSeconds = Math.max(0, Math.ceil((activeMoving.endTime - Date.now()) / 1000));
        const totalDuration = 15 * 60; // 15 minutes = 900 seconds
        const elapsedSeconds = Math.max(0, totalDuration - remainingSeconds);
        const percent = Math.min(100, Math.max(0, (elapsedSeconds / totalDuration) * 100));
        
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        return (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 999,
            width: '320px',
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-purple))',
                fontSize: '1.2rem'
              }}>
                🏠
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>İkametgah Taşınıyor...</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  Hedef: {activeMoving.targetProvince}, {activeMoving.targetDistrict}
                </div>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'hsl(var(--accent-purple))' }}>
                {timeStr}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)',
                borderRadius: '3px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>

            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textAlign: 'center', fontStyle: 'italic' }}>
              Taşınma süresince şirketleriniz ve şahsi ikametgah kaydınız taşınma sürecindedir.
            </div>
          </div>
        );
      })()}
      
      {activeMenu !== 'wiki' && (
        <>
          {/* Premium Header */}
          <header className="glass-panel app-header" style={{
            margin: '1.5rem 1.5rem 0 1.5rem',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            gap: '0.75rem'
          }}>
            {/* Top Row: Identity, Navigation and Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Left Side: Citizen Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-cyan))'
              }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.characterName} {user.characterSurname}
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '4px', 
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'hsl(var(--accent-cyan))',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}>
                    {getRoleLabel(user.politicalRole)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: 'hsl(var(--accent-cyan))', fontWeight: 600 }}>📍 Konum:</span> {user.province} Cumhuriyeti, {user.district}
                  </div>
                  {user.citizenId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ color: 'hsl(var(--accent-cyan))', fontWeight: 600 }}>🪪 Kimlik No:</span> {user.citizenId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
              {topLevelTab === 'personal' ? (
                <>
                  <button 
                    className={activeMenu === 'dashboard' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('dashboard')}
                  >
                    <Activity size={16} /> Karargah
                  </button>
                  <button 
                    className={activeMenu === 'enterprise' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('enterprise')}
                  >
                    <Briefcase size={16} /> Şirket Yönetimi
                  </button>
                  <button 
                    className={activeMenu === 'market' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('market')}
                  >
                    <ShoppingBag size={16} /> Borsa & Market
                  </button>
                  <button 
                    className={activeMenu === 'map' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('map')}
                  >
                    <Compass size={16} /> Türkiye Haritası
                  </button>
                  <button 
                    className={activeMenu === 'laws' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('laws')}
                  >
                    <Scale size={16} /> Anayasa & Meclis
                  </button>
                  <button 
                    className={activeMenu === 'organization' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('organization')}
                  >
                    <Users size={16} /> Organizasyon
                  </button>
                  <button 
                    className={activeMenu === 'console' ? 'btn-primary' : 'btn-secondary'} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('console')}
                  >
                    <Terminal size={16} /> Konsol
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={() => setActiveMenu('wiki')}
                  >
                    <BookOpen size={16} /> Ansiklopedi
                  </button>
                </>
              ) : (
                // Role specific sub navigation
                user.politicalRole === 'CUMHURBASKANI' ? (
                  <>
                    <button
                      className={activePresidentTab === 'decrees' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('decrees')}
                    >
                      📜 Kararnameler
                    </button>
                    <button
                      className={activePresidentTab === 'cabinet' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('cabinet')}
                    >
                      👥 Kabine Atamaları
                    </button>
                    <button
                      className={activePresidentTab === 'central_bank' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('central_bank')}
                    >
                      🏦 Merkez Bankası
                    </button>
                    <button
                      className={activePresidentTab === 'diplomacy' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('diplomacy')}
                    >
                      🌐 Diplomasi Masası
                    </button>
                    <button
                      className={activePresidentTab === 'budget' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('budget')}
                    >
                      💰 Eyalet Bütçesi
                    </button>
                    <button
                      className={activePresidentTab === 'residency' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('residency')}
                    >
                      🏠 İkametgah Başvuruları
                    </button>
                    <button
                      className={activePresidentTab === 'reserves' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActivePresidentTab('reserves')}
                    >
                      📦 Devlet Deposu
                    </button>
                  </>
                ) : user.politicalRole === 'MILLETVEKILI' ? (
                  <>
                    <button
                      className={activeMilletvekiliTab === 'proposals' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActiveMilletvekiliTab('proposals')}
                    >
                      🏛️ Kanun Teklifleri
                    </button>
                    <button
                      className={activeMilletvekiliTab === 'citizens' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActiveMilletvekiliTab('citizens')}
                    >
                      📢 Halk Kürsüsü
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={activeKomutanTab === 'military' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActiveKomutanTab('military')}
                    >
                      🛡️ Askeri Karargah
                    </button>
                    <button
                      className={activeKomutanTab === 'alarm' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setActiveKomutanTab('alarm')}
                    >
                      🚨 Alarm Seviyesi
                    </button>
                  </>
                )
              )}
            </nav>

            {/* Right Side: Account Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Theme Toggle & Logout group */}
              <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.25rem' }}>
                <button 
                  onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
                  className="btn-secondary" 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  }}
                  title={theme === 'dark' ? 'Aydınlık Tema' : 'Karanlık Tema'}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    color: 'hsl(var(--accent-red))',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.1) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.05)';
                    e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.35)';
                  }}
                  title="Güvenli Çıkış"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

            {/* Bottom Row of Header: Horizontal Survival Stats & Assets HUD */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%', 
              paddingTop: '0.75rem', 
              flexWrap: 'wrap', 
              gap: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Left Group: Kondisyon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Activity size={14} style={{ color: 'hsl(var(--accent-cyan))' }} /> Kondisyon:
                  {user.isSick && (
                    <span className="status-critical-pulse" style={{ 
                      fontSize: '0.6rem', 
                      background: 'rgba(239, 68, 68, 0.2)', 
                      border: '1px solid rgba(239, 68, 68, 0.4)', 
                      color: 'hsl(var(--accent-red))', 
                      padding: '0.1rem 0.35rem', 
                      borderRadius: '4px', 
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      marginLeft: '0.5rem'
                    }}>
                      ⚠️ HASTALIK ETKİSİ
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Sağlık Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Heart size={14} style={{ color: 'hsl(var(--accent-red))', filter: 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.3))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Sağlık:</span>
                    <div style={{ width: '70px', height: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div 
                        className={user.health < 30 ? 'status-critical-pulse' : ''}
                        style={{ 
                          height: '100%', 
                          width: `${user.health}%`, 
                          background: user.health < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-emerald))', 
                          borderRadius: '4px',
                          boxShadow: `0 0 8px ${user.health < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-emerald))'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)', backgroundSize: '0.8rem 0.8rem', animation: 'progress-bar-stripes 1.5s linear infinite', opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: user.health < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-emerald))' }}>%{user.health}</span>
                  </div>

                  {/* Açlık Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Pizza size={14} style={{ color: 'hsl(var(--accent-gold))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Açlık:</span>
                    <div style={{ width: '70px', height: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div 
                        className={user.hunger < 30 ? 'status-critical-pulse' : ''}
                        style={{ 
                          height: '100%', 
                          width: `${user.hunger}%`, 
                          background: user.hunger < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-gold))', 
                          borderRadius: '4px',
                          boxShadow: `0 0 8px ${user.hunger < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-gold))'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)', backgroundSize: '0.8rem 0.8rem', animation: 'progress-bar-stripes 1.5s linear infinite', opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: user.hunger < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-gold))' }}>%{user.hunger}</span>
                  </div>

                  {/* Susuzluk Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Droplets size={14} style={{ color: 'hsl(var(--accent-cyan))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Susuzluk:</span>
                    <div style={{ width: '70px', height: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div 
                        className={user.thirst < 30 ? 'status-critical-pulse' : ''}
                        style={{ 
                          height: '100%', 
                          width: `${user.thirst}%`, 
                          background: user.thirst < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))', 
                          borderRadius: '4px',
                          boxShadow: `0 0 8px ${user.thirst < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)', backgroundSize: '0.8rem 0.8rem', animation: 'progress-bar-stripes 1.5s linear infinite', opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: user.thirst < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))' }}>%{user.thirst}</span>
                  </div>

                  {/* Enerji Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={14} style={{ color: 'hsl(var(--accent-cyan))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Enerji:</span>
                    <div style={{ width: '70px', height: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div 
                        className={user.energy < 30 ? 'status-critical-pulse' : ''}
                        style={{ 
                          height: '100%', 
                          width: `${user.energy}%`, 
                          background: user.energy < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))', 
                          borderRadius: '4px',
                          boxShadow: `0 0 8px ${user.energy < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)', backgroundSize: '0.8rem 0.8rem', animation: 'progress-bar-stripes 1.5s linear infinite', opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: user.energy < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))' }}>%{user.energy}</span>
                  </div>

                  {/* Mutluluk Widget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Smile size={14} style={{ color: 'hsl(var(--accent-purple))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>Mutluluk:</span>
                    <div style={{ width: '70px', height: '8px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div 
                        className={user.happiness < 30 ? 'status-critical-pulse' : ''}
                        style={{ 
                          height: '100%', 
                          width: `${user.happiness}%`, 
                          background: user.happiness < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-purple))', 
                          borderRadius: '4px',
                          boxShadow: `0 0 8px ${user.happiness < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-purple))'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)', backgroundSize: '0.8rem 0.8rem', animation: 'progress-bar-stripes 1.5s linear infinite', opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: user.happiness < 30 ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-purple))' }}>%{user.happiness}</span>
                  </div>

                  {/* Görsel Seperatör (Ayrım Çizgisi) */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 0.25rem' }} />

                  {/* Siyasi Nüfuz */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(6, 182, 212, 0.05)', 
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.02)'
                  }}>
                    <Award size={14} style={{ color: 'hsl(var(--accent-cyan))', filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.3))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>Nüfuz:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'white' }}>
                      {user.politicalInfluence} <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>PTS</span>
                    </span>
                  </div>

                  {/* Cüzdan Nakit */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(245, 158, 11, 0.05)', 
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.02)'
                  }}>
                    <Coins size={14} style={{ color: 'hsl(var(--accent-gold))', filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.3))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>Cüzdan:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'hsl(var(--accent-gold))' }}>
                      ₺{user.cash.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {/* Vadesiz Banka Hesabı */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(16, 185, 129, 0.05)', 
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.02)'
                  }}>
                    <Wallet size={14} style={{ color: 'hsl(var(--accent-emerald))', filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.3))' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>Vadesiz:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'hsl(var(--accent-emerald))' }}>
                      ₺{user.bankCheckingBalance.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Top-Level Tab Switcher (Kişisel vs Rol Paneli) */}
          {user.politicalRole !== 'VATANDAS' && (
            <div className="top-level-tab-bar" style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.75rem'
            }}>
              <button
                onClick={() => setTopLevelTab('personal')}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: topLevelTab === 'personal' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: topLevelTab === 'personal' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                  color: topLevelTab === 'personal' ? 'white' : 'hsl(var(--text-secondary))'
                }}
              >
                👤 Kişisel Seçenekler
              </button>
              <button
                onClick={() => setTopLevelTab('role')}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: topLevelTab === 'role' ? 'linear-gradient(135deg, hsl(var(--accent-gold)) 0%, #d97706 100%)' : 'transparent',
                  border: 'none',
                  color: 'white',
                  boxShadow: topLevelTab === 'role' ? '0 4px 15px rgba(217, 119, 6, 0.25)' : 'none'
                }}
              >
                👑 {user.politicalRole === 'CUMHURBASKANI' ? 'Cumhurbaşkanı Paneli' : user.politicalRole === 'MILLETVEKILI' ? 'Milletvekili Paneli' : 'Garnizon Komutanı Paneli'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Main Grid Content */}
      <main className="main-layout-grid" style={{
        flex: 1,
        padding: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Area: Tab panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {alertMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'hsl(var(--accent-red))',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <AlertTriangle size={16} />
              <span>{alertMsg}</span>
            </div>
          )}

          {topLevelTab === 'personal' && (
            <>
              {activeMenu === 'dashboard' && (
            <>
              {/* Row 0: Visual Game Assets Showcase (Garage and Kartel) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {/* Visual Garage Card */}
                <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(15, 23, 42, 0.1) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                      Garajım
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--accent-gold))', fontWeight: 700 }}>
                      ⛽ Toplam Yakıt: {user.fuelLiters} Lt
                    </span>
                  </div>

                  {user.ownedVehicles && user.ownedVehicles.length > 0 ? (
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {user.ownedVehicles.map((vehicleId) => {
                        const info = VEHICLE_ITEMS.find(v => v.id === vehicleId);
                        if (!info) return null;
                        return (
                          <div 
                            key={vehicleId} 
                            style={{ 
                              flexShrink: 0, 
                              width: '180px', 
                              background: 'rgba(0,0,0,0.2)', 
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '8px', 
                              padding: '0.75rem',
                              textAlign: 'center'
                            }}
                          >
                            <img 
                              src={info.imagePath} 
                              alt={info.name} 
                              style={{ width: '100%', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
                            />
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', marginTop: '0.5rem' }}>{info.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.15rem' }}>{info.speedText} • {info.tankCapacity} Lt</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)', padding: '1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>🛞</span>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>Henüz bir taşıtınız bulunmuyor.</p>
                      <button 
                        onClick={() => setActiveMenu('market')}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginTop: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: 'hsl(var(--accent-cyan))', borderRadius: '4px', fontWeight: 700 }}
                      >
                        Araç Galerisini Ziyaret Et
                      </button>
                    </div>
                  )}
                </GlassCard>

                {/* Industrial Kartel Card */}
                <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-gold))', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.1) 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                      🏢 Şirketlerim
                    </h3>
                    <button 
                      onClick={() => setActiveMenu('enterprise')}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'hsl(var(--accent-gold))', borderRadius: '4px', fontWeight: 700 }}
                    >
                      Şirketleri Yönet
                    </button>
                  </div>

                  {(!user.coalMineLevel && !user.autoFactoryLevel && !user.defenseFactoryLevel) ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '1.5rem 1rem', 
                      background: 'rgba(0,0,0,0.15)', 
                      border: '1px dashed rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>🏢</span>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        Henüz aktif bir şirketiniz bulunmamaktadır.
                      </div>
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem', maxWidth: '280px', lineHeight: '1.4' }}>
                        Şirketleri Yönet panelinden ilk madeninizi veya fabrikanızı kurarak üretime başlayabilirsiniz.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>⛏️</span>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', marginTop: '0.25rem' }}>Kömür Madeni</div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-gold))', fontWeight: 700 }}>Seviye {user.coalMineLevel || 0}</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>🚗</span>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', marginTop: '0.25rem' }}>Oto Fabrikası</div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-cyan))', fontWeight: 700 }}>Seviye {user.autoFactoryLevel || 0}</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', marginTop: '0.25rem' }}>Savunma Sanayii</div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-purple))', fontWeight: 700 }}>Seviye {user.defenseFactoryLevel || 0}</span>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Row 1: Finance Portal (Full Width) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <FinancePortal balances={user} onUpdateBalances={handleUpdateBalances} />
              </div>

              {/* Row 2: Politics Hub (Full Width) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <PoliticsHub politics={user} onVote={handleVote} />
              </div>
            </>
          )}

          {activeMenu === 'enterprise' && (
            <EnterpriseManager
              userCash={user.cash}
              coalMineLevel={user.coalMineLevel}
              autoFactoryLevel={user.autoFactoryLevel}
              defenseFactoryLevel={user.defenseFactoryLevel}
              onUpgradeFactory={handleUpgradeFactory}
              userProvince={user.province}
              userDistrict={user.district}
              onAddCash={(amount) => handleUpdateBalances({ cash: user.cash + amount }, `💰 Girişimci Destek Programı kapsamında devletten ₺${amount.toLocaleString('tr-TR')} kalkınma teşviği alındı!`)}
              onUpdateBalances={handleUpdateBalances}
              userPoliticalInfluence={user.politicalInfluence}
              userPoliticalReputation={user.politicalReputation}
              gender={user.gender}
              isometricModelId={user.isometricModelId}
            />
          )}

          {activeMenu === 'market' && (
            <MarketplaceView
              user={user}
              commodities={commodities}
              onBuyItem={handleBuyItem}
              onBuyCommodity={handleBuyCommodity}
              onSellCommodity={handleSellCommodity}
              onBuyVehicle={handleBuyVehicle}
              onBuyFuel={handleBuyFuel}
            />
          )}

          {activeMenu === 'map' && (
            <InteractiveMap
              currentProvince={user.province}
              currentDistrict={user.district}
              residenceProvince={user.residenceProvince}
              residenceDistrict={user.residenceDistrict}
              userRole={user.politicalRole}
              userCash={user.cash}
              userEnergy={user.energy}
              userOwnedVehicles={user.ownedVehicles || []}
              userFuelLiters={user.fuelLiters || 0}
              commodities={commodities}
              onTravel={handleTravel}
              onMoveResidence={handleMoveResidence}
            />
          )}

          {activeMenu === 'laws' && (
            <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card-header-flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', margin: 0 }}>
                  <Scale style={{ color: 'hsl(var(--accent-purple))' }} /> Anayasa ve Meclis Oturumu
                </h2>
                
                {/* Sub Menu Switcher */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', maxWidth: '100%' }}>
                  <button
                    onClick={() => setActiveLawsSubTab('chamber')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: 'none',
                      background: activeLawsSubTab === 'chamber' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: activeLawsSubTab === 'chamber' ? 'white' : 'hsl(var(--text-secondary))',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🏛️ 3D Meclis Salonu
                  </button>
                  <button
                    onClick={() => setActiveLawsSubTab('pending')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: 'none',
                      background: activeLawsSubTab === 'pending' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: activeLawsSubTab === 'pending' ? 'white' : 'hsl(var(--text-secondary))',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🗳️ Oylama Bekleyenler
                  </button>
                  <button
                    onClick={() => setActiveLawsSubTab('history')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: 'none',
                      background: activeLawsSubTab === 'history' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: activeLawsSubTab === 'history' ? 'white' : 'hsl(var(--text-secondary))',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📜 Geçmiş Kararlar
                  </button>
                </div>
              </div>

              {activeLawsSubTab === 'chamber' ? (
                <ParliamentSeatMap userProvince={user.province} userRole={user.politicalRole} />
              ) : activeLawsSubTab === 'pending' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingLaws.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                      🗳️ Şu anda oylama bekleyen herhangi bir kanun teklifi bulunmuyor. Meclis salonu üzerinden teklif sunabilirsiniz.
                    </div>
                  ) : (
                    pendingLaws.map(law => {
                      const diff = law.timestamp - timeTicker;
                      const isExpired = diff <= 0;
                      
                      let timeLeftStr = 'Süre Doldu';
                      if (!isExpired) {
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                        timeLeftStr = `${hours}s ${minutes}d ${seconds}s kaldı`;
                      }
                      
                      const hasVoted = law.voted !== null;
                      
                      return (
                        <div key={law.id} style={{
                          padding: '1.25rem',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderLeft: `4px solid ${hasVoted ? (law.voted === 'yes' ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))') : 'hsl(var(--accent-purple))'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                color: 'hsl(var(--accent-purple))',
                                border: '1px solid rgba(168, 85, 247, 0.2)',
                                fontWeight: 700
                              }}>
                                {law.category}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                Sunan: {law.proposer}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: isExpired ? 'hsl(var(--text-muted))' : 'hsl(var(--accent-gold))',
                              background: 'rgba(234, 179, 8, 0.06)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(234, 179, 8, 0.15)'
                            }}>
                              ⏱️ {timeLeftStr}
                            </div>
                          </div>

                          <div>
                            <h4 style={{ color: 'white', fontSize: '1rem', margin: 0, fontWeight: 700 }}>
                              {law.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '0.4rem', lineHeight: '1.4' }}>
                              {law.description}
                            </p>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            borderTop: '1px solid rgba(255,255,255,0.04)', 
                            paddingTop: '0.75rem', 
                            marginTop: '0.25rem',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}>
                            {hasVoted ? (
                              <>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                  <span style={{ color: 'hsl(var(--accent-emerald))', fontWeight: 700 }}>
                                    Kabul: {law.yesVotes} Oy
                                  </span>
                                  <span style={{ color: 'hsl(var(--accent-red))', fontWeight: 700 }}>
                                    Ret: {law.noVotes} Oy
                                  </span>
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  color: law.voted === 'yes' ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  {law.voted === 'yes' ? '👍 Kabul Oyunu Kullandınız' : '👎 Ret Oyunu Kullandınız'}
                                </div>
                              </>
                            ) : isExpired ? (
                              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>
                                🚫 Oylama süresi sona erdi.
                              </div>
                            ) : (
                              <>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                  {user.politicalRole === 'MILLETVEKILI' ? '* Karar için oyunuzu kullanın.' : '⚠️ Sadece milletvekilleri oy kullanabilir.'}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => {
                                      if (user.politicalRole !== 'MILLETVEKILI') {
                                        alert('Yasa tekliflerini yalnızca Milletvekilleri oylayabilir!');
                                        return;
                                      }
                                      handleVoteLaw(law.id, 'no');
                                    }}
                                    className="btn-danger" 
                                    style={{ 
                                      padding: '0.4rem 1rem', 
                                      fontSize: '0.75rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '0.25rem',
                                      opacity: user.politicalRole === 'MILLETVEKILI' ? 1 : 0.5,
                                      cursor: user.politicalRole === 'MILLETVEKILI' ? 'pointer' : 'not-allowed'
                                    }}
                                  >
                                    👎 Karşı Çık (Ret)
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (user.politicalRole !== 'MILLETVEKILI') {
                                        alert('Yasa tekliflerini yalnızca Milletvekilleri oylayabilir!');
                                        return;
                                      }
                                      handleVoteLaw(law.id, 'yes');
                                    }}
                                    className="btn-success" 
                                    style={{ 
                                      padding: '0.4rem 1rem', 
                                      fontSize: '0.75rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '0.25rem',
                                      opacity: user.politicalRole === 'MILLETVEKILI' ? 1 : 0.5,
                                      cursor: user.politicalRole === 'MILLETVEKILI' ? 'pointer' : 'not-allowed'
                                    }}
                                  >
                                    👍 Kabul Et (Onayla)
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {archivedLaws.map((law: any) => (
                    <div key={law.id || law.proposalNo} style={{
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${law.outcomeColor || 'hsl(var(--accent-gold))'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                        <span>Öneri No: {law.proposalNo}</span>
                        <span>Tarih: {law.date}</span>
                      </div>
                      <h4 style={{ color: 'white', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 700 }}>
                        {law.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '0.5rem', lineHeight: '1.4' }}>
                        {law.description}
                      </p>
                    </div>
                  ))}

                  <div style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'hsl(var(--text-muted))',
                    fontSize: '0.85rem'
                  }}>
                    <Info size={16} />
                    <span>Geçmiş dönemlerde kabul edilen veya reddedilen tüm kanun maddeleri meclis arşivinde saklanmaktadır.</span>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {activeMenu === 'organization' && (
            <OrganizationView
              userCash={user.cash}
              userInfluence={user.politicalInfluence}
              userReputation={user.politicalReputation}
              onUpdateBalances={handleUpdateBalances}
            />
          )}

          {activeMenu === 'console' && (
            <ConsoleView logs={logs} setLogs={setLogs} addLog={addLog} />
          )}

          {activeMenu === 'wiki' && (
            <WikiView onClose={() => setActiveMenu('dashboard')} />
          )}
        </>
      )}
      {topLevelTab === 'role' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {user.politicalRole === 'CUMHURBASKANI' && (
            <PresidentPanelView
              user={user}
              setUser={setUser}
              activePresidentTab={activePresidentTab}
              treasuryBalance={treasuryBalance}
              setTreasuryBalance={setTreasuryBalance}
              inflationRate={inflationRate}
              setInflationRate={setInflationRate}
              interestRate={interestRate}
              setInterestRate={setInterestRate}
              cabinet={cabinet}
              setCabinet={setCabinet}
              activeDecrees={activeDecrees}
              setActiveDecrees={setActiveDecrees}
              budgetAllocation={budgetAllocation}
              setBudgetAllocation={setBudgetAllocation}
              residencyApplications={residencyApplications}
              onApproveResidency={handleApproveResidency}
              onRejectResidency={handleRejectResidency}
              addLog={addLog}
            />
          )}

          {user.politicalRole === 'MILLETVEKILI' && (
            <MilletvekiliPanelView
              setUser={setUser}
              activeMilletvekiliTab={activeMilletvekiliTab}
              billProposals={billProposals}
              setBillProposals={setBillProposals}
              addLog={addLog}
            />
          )}

          {user.politicalRole === 'GARNIZON_KOMUTANI' && (
            <GarnizonKomutanıPanelView
              activeKomutanTab={activeKomutanTab}
              alarmLevel={alarmLevel}
              setAlarmLevel={setAlarmLevel}
              deployments={deployments}
              setDeployments={setDeployments}
              addLog={addLog}
            />
          )}
        </div>
      )}

        </div>

      </main>

      <footer style={{
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'hsl(var(--text-muted))',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontSize: '0.72rem',
          color: 'hsl(var(--text-secondary))',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '0.25rem'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('terms'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>HİZMET KOŞULLARI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('privacy'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>GİZLİLİK POLİTİKASI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('cookie'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>ÇEREZ POLİTİKASI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('kvkk'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>KVKK AYDINLATMA</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('support'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>DESTEK AL</a>
        </div>
        <p style={{ margin: 0 }}>
          © 2026 BAGIO LABS • KABİNE SÜRÜM 1.1 • Tüm hakları saklıdır.
        </p>
      </footer>

      {activeComplianceDoc && (
        <ComplianceModal 
          docType={activeComplianceDoc} 
          onClose={() => setActiveComplianceDoc(null)} 
          onSelectDoc={(type) => setActiveComplianceDoc(type)}
        />
      )}
    </div>
  );
}

export default App;
