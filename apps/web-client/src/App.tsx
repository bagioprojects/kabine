import { useState } from 'react';
import { InteractiveMap } from './components/InteractiveMap';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Truck, 
  Shield, 
  MapPin, 
  ChevronRight, 
  Building2, 
  Vote,
  Sparkles
} from 'lucide-react';

// Mock region state data: mapping OSM region ids to colors and owners
const initialRegionStates: Record<string, { color: string; owner: string; party: string; taxRate: number; stability: number }> = {
  "relation/1211489": { color: "#ef4444", owner: "Kızıl Tugaylar", party: "Kızıl Emek Partisi", taxRate: 12, stability: 85 }, // Karamürsel
  "relation/1211490": { color: "#3b82f6", owner: "Mavi Hilal", party: "Hürriyet Ligi", taxRate: 8, stability: 92 }, // Darıca
  "relation/1211491": { color: "#10b981", owner: "Yeşil Anadolu", party: "Anavatan Birlik", taxRate: 15, stability: 78 }, // Kandıra
  "relation/1211492": { color: "#eab308", owner: "Altın Lobi", party: "Refah Birliği", taxRate: 10, stability: 88 }, // Körfez
};

function App() {
  const [selectedRegion, setSelectedRegion] = useState<{ id: string; name: string } | null>(null);
  const [playerStats] = useState({
    cash: 184520,
    influence: 450,
    partyMembers: 124,
    activeTrucks: 3
  });

  const handleRegionClick = (id: string, name: string) => {
    setSelectedRegion({ id, name });
  };

  // Get details for selected region (or fallback to defaults)
  const regionDetails = selectedRegion 
    ? (initialRegionStates[selectedRegion.id] || { 
        color: "#1e293b", 
        owner: "Bağımsız Lobiciler", 
        party: "Yansızlar Meclisi", 
        taxRate: 5, 
        stability: 95 
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              POLITIC
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Jeopolitik Simülasyon</p>
          </div>
        </div>

        {/* Global Player Stats Bar */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">₺{playerStats.cash.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">{playerStats.influence} Nüfuz</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold text-sky-400">{playerStats.partyMembers} Üye</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <Truck className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">{playerStats.activeTrucks} Tır</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Map & Dashboard Operations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-sky-950/40 to-indigo-950/20 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">Milli Meclise Doğru Yüksel</h2>
              <p className="text-slate-400 text-sm max-w-lg">
                İlçeleri siyasi gücünle domine et, vergi topla, lojistik rotalarını genişlet ve kendi finans imparatorluğunu kur.
              </p>
            </div>
            <div className="absolute right-0 top-0 w-48 h-48 bg-sky-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* Map Container */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-850 p-4">
            <div className="flex justify-between items-center mb-4 px-2">
              <div>
                <h3 className="font-bold text-lg">Türkiye Hakimiyet Haritası</h3>
                <p className="text-xs text-slate-500">İlçeleri tıklayarak detaylı siyasi, ekonomik ve lojistik analizleri gör</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Canlı Sunucu</span>
              </div>
            </div>
            
            <div className="h-[460px]">
              <InteractiveMap 
                onRegionClick={handleRegionClick}
                regionStates={initialRegionStates}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Control / District Information */}
        <div className="space-y-6">
          {selectedRegion ? (
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-6 backdrop-blur-md">
              {/* Region Header */}
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Marmara Bölgesi</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-100">{selectedRegion.name}</h3>
                </div>
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: regionDetails?.color }} 
                />
              </div>

              {/* Dominance Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bölgesel Hakimiyet</h4>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Yönetici Güç:</span>
                    <span className="font-semibold text-slate-200">{regionDetails?.owner}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">İktidar Parti:</span>
                    <span className="font-semibold text-sky-400">{regionDetails?.party}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Eyalet Vergisi:</span>
                    <span className="font-semibold text-slate-200">%{regionDetails?.taxRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Stabilite:</span>
                    <span className="font-semibold text-slate-200">%{regionDetails?.stability}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Operations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operasyon Paneli</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button className="flex items-center justify-between p-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/30 rounded-xl transition duration-200 text-left">
                    <div className="flex items-center space-x-3">
                      <Vote className="w-5 h-5 text-sky-400" />
                      <div>
                        <p className="text-xs font-bold text-sky-400">Siyasi Propaganda Yap</p>
                        <p className="text-[10px] text-slate-400">Nüfuz ve parti üyesi kazan (-₺5,000)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sky-400" />
                  </button>

                  <button className="flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl transition duration-200 text-left">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-emerald-400">Tesis/Fabrika Kur</p>
                        <p className="text-[10px] text-slate-400">Sanayi üretimine başla (-₺25,000)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button className="flex items-center justify-between p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-xl transition duration-200 text-left">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold text-indigo-400">Lojistik Rotası Oluştur</p>
                        <p className="text-[10px] text-slate-400">Tır filoları göndererek ticaret yap</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Economic stats */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-400">Günlük İthalat / İhracat</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">+₺12,500</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[400px]">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 mb-4">
                <MapPin className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="font-bold text-slate-350">Seçili Bölge Yok</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mt-2">
                Ekonomik yatırımlar veya siyasi eylemler gerçekleştirmek için haritadan bir ilçe seçin.
              </p>
            </div>
          )}

          {/* Quick Actions / Active Missions */}
          <div className="bg-slate-900/20 border border-slate-850/50 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Görevler</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-850 text-[10px] font-bold text-sky-400 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-slate-300">Sanayi Girişimi</p>
                  <p className="text-xs text-slate-500">Marmara'da en az 1 adet demir çelik fabrikası kur.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-850 text-[10px] font-bold text-sky-400 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-slate-300">Siyasi Propaganda</p>
                  <p className="text-xs text-slate-500">Kandıra ilçesinde nüfuzunu %50 üzerine çıkar.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-650">
        © 2026 Politic. Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}

export default App;
