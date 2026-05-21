import React, { useState, useMemo } from 'react';
import { Shield, Award, Landmark, ChevronRight, ChevronLeft, Check, Sparkles, User, Briefcase } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { VideoBackgroundOverlay } from './VideoBackgroundOverlay';

import { DISTRICTS } from '../data/locationData';

const STARTING_PROVINCES = [
  { id: 34, name: 'İstanbul', description: 'Finans ve Küreselleşmiş Ticaret Cumhuriyeti', region: 'Marmara' },
  { id: 6, name: 'Ankara', description: 'Başkent ve Siyasi Bürokrasi Cumhuriyeti', region: 'İç Anadolu' },
  { id: 16, name: 'Bursa', description: 'Ağır Sanayi ve Otomotiv Havzası Cumhuriyeti', region: 'Marmara' },
  { id: 10, name: 'Balıkesir', description: 'Maden Kaynakları ve Stratejik Bor Cumhuriyeti', region: 'Marmara' },
  { id: 35, name: 'İzmir', description: 'Serbest Liman ve Ege Deniz Ticareti Cumhuriyeti', region: 'Ege' },
  { id: 7, name: 'Antalya', description: 'Küresel Turizm ve Akdeniz Tarım Cumhuriyeti', region: 'Akdeniz' },
  { id: 31, name: 'Hatay', description: 'Tarihi Lojistik ve Güney Kapısı Cumhuriyeti', region: 'Akdeniz' },
  { id: 61, name: 'Trabzon', description: 'Deniz Ticareti ve Karadeniz Tersane Cumhuriyeti', region: 'Karadeniz' },
  { id: 42, name: 'Konya', description: 'Tarım Havzası ve Hafif Alüminyum Metal Cumhuriyeti', region: 'İç Anadolu' },
  { id: 1, name: 'Adana', description: 'Bereketli Çukurova ve Sanayi Cumhuriyeti', region: 'Akdeniz' },
  { id: 41, name: 'Kocaeli', description: 'Liman Ağları ve Kimya Sanayi Cumhuriyeti', region: 'Marmara' }
];

interface CharacterCreationProps {
  onComplete: (data: {
    avatarId: string;
    isometricModelId: string;
    backstoryId: string;
    provinceId: number;
    districtId: number;
    gender: string;
    characterAge: number;
  }) => void;
}

export const CharacterCreationScreen: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [characterAge, setCharacterAge] = useState<number>(25);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedBackstory, setSelectedBackstory] = useState<string | null>(null);

  // 1. Isometric Characters models definitions (4 Male, 4 Female)
  const ISOMETRIC_MODELS = [
    {
      id: 'char_diplomat_male',
      name: 'Diplomat / Politikacı (Erkek)',
      gender: 'male',
      description: 'Zarif bir takım elbise, rozet ve karizma. Siyasi entrikalarda ve ikna yeteneğinde üstündür.',
      color: 'hsl(var(--accent-cyan))',
      svg: (color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 40 80 L 40 100 L 46 100 L 48 85 L 52 85 L 54 100 L 60 100 L 60 80 Z" fill="#1b1c22" />
          <path d="M 35 45 L 65 45 L 60 80 L 40 80 Z" fill="#2d303b" />
          <path d="M 46 45 L 50 58 L 54 45 Z" fill="#f8fafc" />
          <path d="M 49 48 L 51 48 L 52 70 L 50 75 L 48 70 Z" fill="#991b1b" />
          <path d="M 35 45 L 46 45 L 48 65 Z" fill="#1e293b" />
          <path d="M 65 45 L 54 45 L 52 65 Z" fill="#1e293b" />
          <rect x="47" y="38" width="6" height="8" fill="#e2b49a" />
          <circle cx="50" cy="30" r="12" fill="#e2b49a" />
          <path d="M 38 27 Q 45 15 62 27 C 62 27 50 18 38 27 Z" fill="#171717" />
          <path d="M 42 22 Q 50 14 58 22 Z" fill="#404040" />
          <rect x="42" y="27" width="7" height="4" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="51" y="27" width="7" height="4" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="49" y1="29" x2="51" y2="29" stroke={color} strokeWidth="1.5" />
          <polygon points="58,54 61,54 62,57 59,59 57,56" fill="#fbbf24" />
        </svg>
      )
    },
    {
      id: 'char_diplomat_female',
      name: 'Diplomat / Politikacı (Kadın)',
      gender: 'female',
      description: 'Zarif bir ceket-etek kombini, inci kolye ve asalet. Hitabeti ve diploması becerileriyle öne çıkar.',
      color: 'hsl(var(--accent-cyan))',
      svg: (color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 38 80 L 32 98 L 68 98 L 62 80 Z" fill="#334155" />
          <path d="M 42 98 L 41 103 L 46 103 Z" fill="#0f172a" />
          <path d="M 58 98 L 59 103 L 54 103 Z" fill="#0f172a" />
          <path d="M 35 45 L 65 45 L 62 80 L 38 80 Z" fill="#475569" />
          <path d="M 44 45 L 50 56 L 56 45 Z" fill="#fbcfe8" />
          <circle cx="50" cy="48" r="1.5" fill="#f8fafc" />
          <circle cx="47" cy="49" r="1.5" fill="#f8fafc" />
          <circle cx="53" cy="49" r="1.5" fill="#f8fafc" />
          <circle cx="59" cy="55" r="2.5" fill="#fbbf24" />
          <rect x="47" y="38" width="6" height="8" fill="#fbcfe8" />
          <circle cx="50" cy="30" r="12" fill="#fbcfe8" />
          <path d="M 38 28 Q 50 14 62 28 Z" fill="#291305" />
          <circle cx="50" cy="16" r="5" fill="#291305" />
          <path d="M 40 24 Q 50 20 60 24" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
          <rect x="42" y="27" width="7" height="4" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="51" y="27" width="7" height="4" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="49" y1="29" x2="51" y2="29" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'char_soldier_male',
      name: 'Asker / Garnizon Subayı (Erkek)',
      gender: 'male',
      description: 'Resmi garnizon üniforması, askeri madalyalar ve çelik gibi duruş. Güvenlik ve savunmada etkilidir.',
      color: 'hsl(var(--accent-red))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 39 80 L 37 100 L 44 100 L 47 84 L 53 84 L 56 100 L 63 100 L 61 80 Z" fill="#1b241d" />
          <path d="M 35 100 L 44 100 L 43 104 L 34 104 Z" fill="#090d0a" />
          <path d="M 56 100 L 65 100 L 66 104 L 57 104 Z" fill="#090d0a" />
          <path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#2d3a2e" />
          <rect x="30" y="42" width="10" height="4" rx="1" fill="#d97706" />
          <rect x="60" y="42" width="10" height="4" rx="1" fill="#d97706" />
          <rect x="38" y="72" width="24" height="6" fill="#451a03" />
          <rect x="49" y="71" width="6" height="8" fill="#fbbf24" stroke="#451a03" strokeWidth="1" />
          <rect x="47" y="38" width="6" height="8" fill="#e2b49a" />
          <circle cx="50" cy="30" r="12" fill="#e2b49a" />
          <path d="M 37 22 Q 50 14 63 22 L 61 25 L 39 25 Z" fill="#1b241d" />
          <path d="M 37 22 L 63 22" stroke="#d97706" strokeWidth="2" />
          <path d="M 43 25 Q 50 30 57 25" fill="#090d0a" />
          <polygon points="46,42 48,42 47,46" fill="#991b1b" />
          <polygon points="54,42 52,42 53,46" fill="#991b1b" />
        </svg>
      )
    },
    {
      id: 'char_soldier_female',
      name: 'Asker / Garnizon Subayı (Kadın)',
      gender: 'female',
      description: 'Zarif askeri üniforma, disiplinli duruş ve toplu saçlar. Taktik zeka ve operasyonel başarıda liderdir.',
      color: 'hsl(var(--accent-red))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 39 80 L 37 100 L 44 100 L 47 84 L 53 84 L 56 100 L 63 100 L 61 80 Z" fill="#1b241d" />
          <path d="M 35 100 L 44 100 L 43 104 L 34 104 Z" fill="#090d0a" />
          <path d="M 56 100 L 65 100 L 66 104 L 57 104 Z" fill="#090d0a" />
          <path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#14532d" />
          <rect x="30" y="42" width="10" height="4" rx="1" fill="#d97706" />
          <rect x="60" y="42" width="10" height="4" rx="1" fill="#d97706" />
          <rect x="38" y="72" width="24" height="6" fill="#451a03" />
          <rect x="47" y="38" width="6" height="8" fill="#e2b49a" />
          <circle cx="50" cy="30" r="12" fill="#e2b49a" />
          <path d="M 37 22 Q 50 14 63 22 L 61 25 L 39 25 Z" fill="#1b241d" />
          <path d="M 37 22 L 63 22" stroke="#d97706" strokeWidth="2" />
          <path d="M 50 35 L 53 50 L 47 50 Z" fill="#291305" />
        </svg>
      )
    },
    {
      id: 'char_industrialist_male',
      name: 'Sanayici / Baron (Erkek)',
      gender: 'male',
      description: 'Zengin kürk yaka ceket, ağır maden kösteği ve altın saat zinciri. Ağır sanayi ve lojistikte liderdir.',
      color: 'hsl(var(--accent-orange))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 40 80 L 40 100 L 46 100 L 48 85 L 52 85 L 54 100 L 60 100 L 60 80 Z" fill="#2d1500" />
          <path d="M 32 45 L 68 45 L 61 80 L 39 80 Z" fill="#1c0f05" />
          <path d="M 32 45 C 32 45 42 35 50 48 C 58 35 68 45 68 45 C 68 45 55 58 50 52 C 45 58 32 45 32 45 Z" fill="#7c2d12" />
          <path d="M 43 65 Q 48 72 52 65" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <rect x="47" y="38" width="6" height="8" fill="#dfab8f" />
          <circle cx="50" cy="30" r="12" fill="#dfab8f" />
          <path d="M 38 22 C 38 10 62 10 62 22 Z" fill="#1c0f05" />
          <ellipse cx="50" cy="22" rx="16" ry="3" fill="#1c0f05" />
          <path d="M 40 32 Q 50 42 60 32 L 56 36 Q 50 43 44 36 Z" fill="#3f1a05" />
        </svg>
      )
    },
    {
      id: 'char_industrialist_female',
      name: 'Sanayici / Baron (Kadın)',
      gender: 'female',
      description: 'Zarif kadife ceket, altın küpeler ve lüks görünümlü kürk etol. Finans ve sanayi yatırımlarında uzmandır.',
      color: 'hsl(var(--accent-orange))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 38 80 L 32 98 L 68 98 L 62 80 Z" fill="#2d1500" />
          <path d="M 32 45 L 68 45 L 61 80 L 39 80 Z" fill="#1e3a8a" />
          <path d="M 32 45 C 32 45 42 35 50 46 C 58 35 68 45 68 45 C 68 45 55 54 50 50 C 45 54 32 45 32 45 Z" fill="#d97706" />
          <rect x="47" y="38" width="6" height="8" fill="#dfab8f" />
          <circle cx="50" cy="30" r="12" fill="#dfab8f" />
          <path d="M 40 22 C 40 18 60 18 60 22 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <path d="M 38 26 Q 50 16 62 26" stroke="#b45309" strokeWidth="4" fill="none" />
          <circle cx="37" cy="34" r="2.5" fill="#fbbf24" />
          <circle cx="63" cy="34" r="2.5" fill="#fbbf24" />
        </svg>
      )
    },
    {
      id: 'char_researcher_male',
      name: 'Teknokrat / Araştırmacı (Erkek)',
      gender: 'male',
      description: 'Holografik veri tableti, teknolojik gözlükler ve lab yeleği. Bilim ve veri üretiminde öncüdür.',
      color: 'hsl(var(--accent-purple))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 40 80 L 40 100 L 46 100 L 48 85 L 52 85 L 54 100 L 60 100 L 60 80 Z" fill="#1e1b4b" />
          <path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#312e81" />
          <line x1="39" y1="50" x2="39" y2="75" stroke="#818cf8" strokeWidth="2.5" />
          <line x1="61" y1="50" x2="61" y2="75" stroke="#818cf8" strokeWidth="2.5" />
          <rect x="47" y="38" width="6" height="8" fill="#fbcfe8" />
          <circle cx="50" cy="30" r="12" fill="#fbcfe8" />
          <path d="M 38 25 Q 50 12 62 25 L 62 21 Q 50 10 38 21 Z" fill="#4338ca" />
          <rect x="52" y="58" width="16" height="12" rx="1" fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth="1.5" />
          <line x1="55" y1="62" x2="65" y2="62" stroke="#818cf8" strokeWidth="1" />
          <line x1="55" y1="66" x2="61" y2="66" stroke="#818cf8" strokeWidth="1" />
        </svg>
      )
    },
    {
      id: 'char_researcher_female',
      name: 'Teknokrat / Araştırmacı (Kadın)',
      gender: 'female',
      description: 'Holografik veri tableti, pembe/mor veri gözlükleri, beyaz laboratuvar önlüğü ve akıllı duruş.',
      color: 'hsl(var(--accent-purple))',
      svg: (_color: string) => (
        <svg viewBox="0 0 100 120" className="isometric-svg" style={{ width: '100px', height: '120px' }}>
          <ellipse cx="50" cy="105" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
          <path d="M 38 80 L 32 98 L 68 98 L 62 80 Z" fill="#1e1b4b" />
          <path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 45 45 L 50 65 L 55 45 Z" fill="#6b21a8" />
          <rect x="47" y="38" width="6" height="8" fill="#fbcfe8" />
          <circle cx="50" cy="30" r="12" fill="#fbcfe8" />
          <path d="M 38 25 Q 50 12 62 25 Z" fill="#701a75" />
          <path d="M 38 25 L 36 40 L 40 40 Z" fill="#701a75" />
          <path d="M 62 25 L 64 40 L 60 40 Z" fill="#701a75" />
          <rect x="52" y="58" width="16" height="12" rx="1" fill="rgba(236, 72, 153, 0.4)" stroke="#ec4899" strokeWidth="1.5" />
          <line x1="55" y1="62" x2="65" y2="62" stroke="#ec4899" strokeWidth="1" />
          <line x1="55" y1="66" x2="61" y2="66" stroke="#ec4899" strokeWidth="1" />
        </svg>
      )
    }
  ];

  // 2. Profile Avatars definitions
  const AVATARS = [
    { id: 'avatar_1', name: 'Zabit Portresi', color: '#991b1b', role: 'Militer', desc: 'Savaş gazisi kalkan rozetli gazi portresi.' },
    { id: 'avatar_2', name: 'Bürokrat Portresi', color: '#0369a1', role: 'Politik', desc: 'Monokl gözlüklü diplomat portresi.' },
    { id: 'avatar_3', name: 'Baron Portresi', color: '#854d0e', role: 'Ekonomi', desc: 'Maden kösteği ve papyonlu tüccar portresi.' },
    { id: 'avatar_4', name: 'Teknokrat Portresi', color: '#5b21b6', role: 'Bilim', desc: 'Neon gözlüklü analist portresi.' },
    { id: 'avatar_5', name: 'Gazi Kadın Portresi', color: '#9d174d', role: 'Militer', desc: 'Madalyalı ordu lideri kadın portresi.' },
    { id: 'avatar_6', name: 'Bakan Portresi', color: '#0f766e', role: 'Politik', desc: 'Resmi yakalı meclis sözcüsü kadın portresi.' },
    { id: 'avatar_7', name: 'Mimar Portresi', color: '#065f46', role: 'Sanayi', desc: 'Koruyucu vizörlü ağır sanayi kurucusu.' },
    { id: 'avatar_8', name: 'Bilgin Portresi', color: '#3730a3', role: 'Bilim', desc: 'Holografik mercekli veri analisti kadın.' }
  ];

  // 3. Backstories
  const BACKSTORIES = [
    {
      id: 'story_veteran',
      title: 'Vatansever Kıdemli Muharip',
      icon: <Shield className="w-8 h-8 text-red-500" />,
      tag: 'Askeri & Düzen',
      description: 'Cumhuriyetin toprak bütünlüğü ve devlet otoritesinin korunması sizin için kutsal bir görevdir. Cephede ve sınırlarda geçen yılların ardından şimdi yönetim masasında ülkenize hizmet etmeye kararlısınız.'
    },
    {
      id: 'story_capitalist',
      title: 'Seçkin Ağır Sanayici',
      icon: <Briefcase className="w-8 h-8 text-amber-500" />,
      tag: 'Finans & Üretim',
      description: 'Serbest piyasanın, hammaddenin ve demir çelik fabrikalarının gücüne inanıyorsunuz. Amacınız milli sanayi üretimini uçurmak, ticaret filoları kurmak ve sermayeyi yönetmektir.'
    },
    {
      id: 'story_union_leader',
      title: 'Halkçı Sendika Temsilcisi',
      icon: <User className="w-8 h-8 text-teal-500" />,
      tag: 'Sosyal Siyaset',
      description: 'Fabrika atölyelerinden ve maden tünellerinden gelen bir halk liderisiniz. Emek sömürüsüne karşı durmak, refahı adilce paylaşmak ve güçlü bir işçi koalisyonu kurmak için yola çıktınız.'
    },
    {
      id: 'story_technocrat',
      title: 'Teknokrat Veri Araştırmacısı',
      icon: <Landmark className="w-8 h-8 text-indigo-500" />,
      tag: 'Bilim & Planlama',
      description: 'Geri kalmışlığı alt etmenin tek yolunun rasyonel veri, mikroçip üretimi ve teknolojik bağımsızlık olduğunu savunuyorsunuz. Devlet planlamasını akıl ve bilim eksenine oturtmak istiyorsunuz.'
    }
  ];

  // Districts list for active province
  const currentDistricts = useMemo(() => {
    if (!selectedProvinceId) return [];
    return DISTRICTS.filter(d => d.provinceId === selectedProvinceId).map(d => d.name);
  }, [selectedProvinceId]);

  // Filtered isometric models based on step 1 gender
  const filteredModels = useMemo(() => {
    if (!gender) return [];
    return ISOMETRIC_MODELS.filter(m => m.gender === gender);
  }, [gender, ISOMETRIC_MODELS]);

  const stepLabels = [
    "Kimlik & Konum",
    "3D Görünüm",
    "Profil Portresi",
    "Siyasi Öykü"
  ];

  // Actions
  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!gender) {
        setError('Lütfen cinsiyetinizi seçiniz.');
        return;
      }
      if (!characterAge || characterAge < 18) {
        setError('Karakter yaşı en az 18 olmalıdır.');
        return;
      }
      if (!selectedProvinceId) {
        setError('Lütfen yaşamak istediğiniz Cumhuriyeti seçiniz.');
        return;
      }
      if (!selectedDistrict) {
        setError('Lütfen yaşayacağınız ikametgah ilçesini seçiniz.');
        return;
      }
    }
    if (step === 2) {
      if (!selectedModel) {
        setError('Lütfen karakterinizin izometrik 3D görünümünü seçiniz.');
        return;
      }
    }
    if (step === 3) {
      if (!selectedAvatar) {
        setError('Lütfen bir profil portresi seçiniz.');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!selectedBackstory) {
      setError('Lütfen karakter hikayenizi seçiniz.');
      return;
    }

    const match = DISTRICTS.find(d => d.provinceId === selectedProvinceId && d.name === selectedDistrict);
    if (!match) {
      setError('Seçilen ilçe coğrafi veri tabanında bulunamadı.');
      return;
    }

    setSubmitting(true);
    try {
      await onComplete({
        avatarId: selectedAvatar!,
        isometricModelId: selectedModel!,
        backstoryId: selectedBackstory!,
        provinceId: selectedProvinceId!,
        districtId: match.id,
        gender: gender!,
        characterAge: characterAge
      });
    } catch (err: any) {
      setError(err.message || 'Karakter kaydı esnasında bir sunucu hatası oluştu.');
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="char-creation-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
        color: '#1e293b',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        backgroundColor: '#0f172a'
      }}
    >
      {/* Infinite loop video background — only bg_video_1, sonsuz döngü */}
      <VideoBackgroundOverlay
        mode="single-loop"
        videos={['/assets/videos/bg_video_1.mp4']}
        posterSrc="/simulation_bg.webp"
        fadeDurationMs={800}
      />
      {/* Koyu overlay katmanı — okunabilirliği artırır */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45))',
        zIndex: 1, pointerEvents: 'none'
      }} />
      <div style={{ width: '100%', maxWidth: '800px', zIndex: 2, position: 'relative' }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '99px', marginBottom: '0.6rem' }}>
            <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
            <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#dc2626', fontWeight: 'bold' }}>NÜFUS VE SİCİL MÜDÜRLÜĞÜ</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, color: '#ffffff', letterSpacing: '0.5px', textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
            VATANDAŞLIK BAŞVURUSU
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0.4rem', fontSize: '1rem', fontWeight: '500', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            Cumhuriyet topraklarındaki sicilinizi, resmi ikametinizi ve kimliğinizi oluşturun.
          </p>
        </div>

        {/* Stepper Progress bar with high-contrast labels */}
        <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '3px', background: 'rgba(255,255,255,0.15)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '16px', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '3px', background: '#ef4444', transition: 'width 0.3s ease', zIndex: 0 }} />
            
            {[1, 2, 3, 4].map(s => {
              const isCompleted = s < step;
              const isActive = s === step;
              return (
                <div 
                  key={s}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 1,
                    flex: 1
                  }}
                >
                  <div 
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isCompleted ? '#22c55e' : isActive ? '#ef4444' : 'rgba(15, 23, 42, 0.6)',
                      border: isCompleted ? '2px solid #22c55e' : isActive ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      boxShadow: isActive ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-white" /> : s}
                  </div>
                  <span 
                    style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.75rem', 
                      fontWeight: isActive ? 'bold' : '500', 
                      color: isActive ? '#ffffff' : isCompleted ? '#4ade80' : 'rgba(255,255,255,0.65)', 
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {stepLabels[s - 1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{ padding: '0.8rem 1.2rem', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fca5a5', fontSize: '0.9rem', zIndex: 2 }}>
            <span style={{ fontWeight: 'bold' }}>⚠️ Hata:</span> {error}
          </div>
        )}

        {/* Wizard Step Contents */}
        <GlassCard style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.85)', background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(25px)', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.6)' }}>
          
          {/* Step 1: Demographics (Gender/Age) & Location (State/District) */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
                <User className="w-5 h-5 text-red-600" />
                Adım 1: Kimlik & İkametgah Kaydı
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="backstory-grid-responsive">
                {/* Left side: Demographics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Gender Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Cinsiyetiniz</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div 
                        onClick={() => {
                          setGender('male');
                          setSelectedModel(null); // Reset model selection on gender switch
                        }}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: gender === 'male' ? 'rgba(14, 165, 233, 0.12)' : '#f8fafc',
                          border: gender === 'male' ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          color: gender === 'male' ? '#0369a1' : '#475569',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Erkek
                      </div>
                      <div 
                        onClick={() => {
                          setGender('female');
                          setSelectedModel(null); // Reset model selection on gender switch
                        }}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: gender === 'female' ? 'rgba(236, 72, 153, 0.12)' : '#f8fafc',
                          border: gender === 'female' ? '2px solid #db2777' : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          color: gender === 'female' ? '#be185d' : '#475569',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Kadın
                      </div>
                    </div>
                  </div>

                  {/* Character Age */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Karakter Yaşı</label>
                      <span style={{ fontSize: '1rem', color: '#059669', fontWeight: 'bold' }}>{characterAge} Yaş</span>
                    </div>
                    <input 
                      type="range" 
                      min="18" 
                      max="90" 
                      value={characterAge}
                      onChange={(e) => setCharacterAge(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#dc2626',
                        background: '#cbd5e1',
                        height: '6px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block', fontWeight: '500' }}>* Karakter yaşı 18 yaşından büyük seçilmelidir.</span>
                  </div>
                </div>

                {/* Right side: Republic State & District (Residency) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* Republic Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Devlet (Cumhuriyet)</label>
                    <select 
                      value={selectedProvinceId || ''} 
                      onChange={(e) => {
                        setSelectedProvinceId(Number(e.target.value));
                        setSelectedDistrict(''); // Reset district on province change
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        outline: 'none'
                      }}
                    >
                      <option value="" disabled>-- Bir Cumhuriyet Eyaleti Seçin --</option>
                      {STARTING_PROVINCES.map(p => (
                        <option key={p.id} value={p.id}>{p.name} Cumhuriyeti</option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>İkametgah İlçesi</label>
                    <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvinceId}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: selectedProvinceId ? '#ffffff' : '#f1f5f9',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        color: selectedProvinceId ? '#0f172a' : '#94a3b8',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        outline: 'none',
                        cursor: selectedProvinceId ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <option value="" disabled>
                        {!selectedProvinceId ? 'Önce Cumhuriyeti Seçiniz' : '-- Yaşayacağınız İlçeyi Seçin --'}
                      </option>
                      {currentDistricts.map(d => (
                        <option key={d} value={d}>{d} İlçesi</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Isometric Character selection (Filtered by Gender) */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
                <Sparkles className="w-5 h-5 text-red-600" />
                Adım 2: 3D İzometrik Karakter Görünümü
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.2rem' }}>
                {filteredModels.map(m => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      style={{
                        padding: '1.2rem',
                        background: isSelected ? 'rgba(220, 38, 38, 0.04)' : '#ffffff',
                        border: isSelected ? `2.5px solid #dc2626` : '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.25s ease',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        boxShadow: isSelected ? '0 8px 24px rgba(220, 38, 38, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                      className="character-card-hover"
                    >
                      <div style={{ minHeight: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                        {m.svg(m.color)}
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0.5rem 0 0.3rem 0', color: isSelected ? '#0f172a' : '#334155' }}>
                        {m.name}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', height: '56px', overflow: 'hidden', margin: 0 }}>
                        {m.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Portrait Avatar Selection */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
                <User className="w-5 h-5 text-red-600" />
                Adım 3: Siyasi Profil Portresi
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                Gazete manşetlerinde, kimlik sicilinizde ve meclis oylamalarında görüntülenecek resmi profil resminizi seçin.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }} className="avatar-grid-responsive">
                {AVATARS.map(av => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      style={{
                        padding: '1rem 0.8rem',
                        background: isSelected ? 'rgba(220, 38, 38, 0.04)' : '#ffffff',
                        border: isSelected ? '2px solid #dc2626' : '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 8px 24px rgba(220, 38, 38, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div 
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%', 
                          background: `linear-gradient(135deg, ${av.color}aa 0%, #f1f5f9 100%)`, 
                          margin: '0 auto 0.6rem auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '2.5px solid #ffffff' : '1px solid #cbd5e1',
                          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold', margin: '0 0 0.15rem 0', color: '#0f172a' }}>{av.name}</h4>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: av.color, fontWeight: '700' }}>{av.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Backstory Selection */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
                <Award className="w-5 h-5 text-red-600" />
                Adım 4: Karakter Köken Öyküsü
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: '500' }}>
                Siyasi ve iktisadi geçmişiniz, ideolojinizi ve simülasyondaki başlangıç hedeflerinizi tayin eder.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="backstory-grid-responsive">
                {BACKSTORIES.map(bs => {
                  const isSelected = selectedBackstory === bs.id;
                  return (
                    <div
                      key={bs.id}
                      onClick={() => setSelectedBackstory(bs.id)}
                      style={{
                        padding: '1.2rem',
                        background: isSelected ? 'rgba(220, 38, 38, 0.04)' : '#ffffff',
                        border: isSelected ? '2.5px solid #dc2626' : '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 8px 24px rgba(220, 38, 38, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start', marginBottom: '0.6rem' }}>
                        <div style={{ padding: '0.4rem', background: '#f1f5f9', borderRadius: '6px' }}>
                          {bs.icon}
                        </div>
                        <div>
                          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 'bold' }}>{bs.tag}</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.1rem 0 0 0', color: '#0f172a' }}>
                            {bs.title}
                          </h3>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>
                        {bs.description}
                      </p>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc2626', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.5rem' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                className="btn-hover-opacity"
              >
                <ChevronLeft className="w-4 h-4" /> Geri
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.4rem',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)',
                  transition: 'background 0.2s ease'
                }}
              >
                İleri <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.8rem',
                  background: submitting ? 'rgba(220, 38, 38, 0.5)' : '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                  transition: 'background 0.2s ease'
                }}
              >
                {submitting ? 'Karakter Kaydediliyor...' : 'Karakteri Oluştur ve Başla!'} <Sparkles className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Embedded Mobile CSS Styles to avoid layouts breaking on smaller screens */}
      <style>{`
        @media (max-width: 640px) {
          .avatar-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .backstory-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .char-creation-overlay {
            padding: 1rem !important;
            justify-content: start !important;
          }
        }
      `}</style>
    </div>
  );
};
