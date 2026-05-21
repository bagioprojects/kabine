import type { SpriteFrame, FurnitureItem } from './types';

export const SPRITE_ATLAS: Record<string, SpriteFrame> = {
  safe: { sx: 0, sy: 0, sw: 500, sh: 500, offsetX: -60, offsetY: -100, dw: 120, dh: 120 },
  office_desk: { sx: 500, sy: 0, sw: 500, sh: 500, offsetX: -45, offsetY: -75, dw: 90, dh: 90 },
  desk: { sx: 500, sy: 0, sw: 500, sh: 500, offsetX: -45, offsetY: -75, dw: 90, dh: 90 },
  desk_staff_a: { sx: 500, sy: 0, sw: 500, sh: 500, offsetX: -45, offsetY: -75, dw: 90, dh: 90 },
  desk_staff_b: { sx: 500, sy: 0, sw: 500, sh: 500, offsetX: -45, offsetY: -75, dw: 90, dh: 90 },
  chair: { sx: 1000, sy: 0, sw: 500, sh: 500, offsetX: -25, offsetY: -45, dw: 50, dh: 50 },
  office_chair: { sx: 1000, sy: 0, sw: 500, sh: 500, offsetX: -25, offsetY: -45, dw: 50, dh: 50 },
  chair_staff_a: { sx: 1000, sy: 0, sw: 500, sh: 500, offsetX: -25, offsetY: -45, dw: 50, dh: 50 },
  chair_staff_b: { sx: 1000, sy: 0, sw: 500, sh: 500, offsetX: -25, offsetY: -45, dw: 50, dh: 50 },
  board: { sx: 1500, sy: 0, sw: 500, sh: 500, offsetX: -60, offsetY: -120, dw: 120, dh: 120 },
  plant: { sx: 0, sy: 500, sw: 500, sh: 500, offsetX: -50, offsetY: -110, dw: 100, dh: 100 },
  sofa: { sx: 500, sy: 500, sw: 500, sh: 500, offsetX: -80, offsetY: -80, dw: 160, dh: 160 },
  water: { sx: 1500, sy: 500, sw: 500, sh: 500, offsetX: -25, offsetY: -80, dw: 50, dh: 100 },
  water_dispenser: { sx: 1500, sy: 500, sw: 500, sh: 500, offsetX: -25, offsetY: -80, dw: 50, dh: 100 },
  table_glass: { sx: 1000, sy: 500, sw: 500, sh: 500, offsetX: -40, offsetY: -50, dw: 80, dh: 80 },
  desk_reception: { sx: 0, sy: 1000, sw: 500, sh: 500, offsetX: -60, offsetY: -90, dw: 120, dh: 120 },
  bookshelf: { sx: 500, sy: 1000, sw: 500, sh: 500, offsetX: -50, offsetY: -100, dw: 100, dh: 120 },
  monitor: { sx: 1000, sy: 1000, sw: 500, sh: 500, offsetX: -30, offsetY: -75, dw: 60, dh: 75 },
  plant_small: { sx: 1500, sy: 1000, sw: 500, sh: 500, offsetX: -25, offsetY: -50, dw: 50, dh: 70 },
  printer: { sx: 0, sy: 1500, sw: 500, sh: 500, offsetX: -30, offsetY: -60, dw: 60, dh: 70 },
  stool_orange: { sx: 500, sy: 1500, sw: 500, sh: 500, offsetX: -25, offsetY: -40, dw: 50, dh: 50 },
  clock: { sx: 1000, sy: 1500, sw: 500, sh: 500, offsetX: -20, offsetY: -100, dw: 40, dh: 60 },
  lamp: { sx: 1500, sy: 1500, sw: 500, sh: 500, offsetX: -25, offsetY: -110, dw: 50, dh: 120 }
};

export const FURNITURE_PRICES: Record<string, FurnitureItem> = {
  office_desk: { name: 'Masaüstü Lüks Masa', price: 4000, category: 'ofis', desc: 'Monitörlü ve çekmeceli çalışma masası.' },
  desk_reception: { name: 'L Resepsiyon Masası', price: 5000, category: 'ofis', desc: 'Büyük L şeklinde karşılama bankosu.' },
  office_chair: { name: 'Ergonomik Ofis Koltuğu', price: 1000, category: 'ofis', desc: '360 derece dönebilen konforlu çalışma koltuğu.' },
  chair: { name: 'Turuncu Ofis Koltuğu', price: 1000, category: 'ofis', desc: 'Modern tasarımlı turuncu çalışma koltuğu.' },
  stool_orange: { name: 'Puf Tabure', price: 450, category: 'ofis', desc: 'Turuncu renkli, pratik puf tabure.' },
  monitor: { name: 'Ekstra Monitör', price: 1500, category: 'ofis', desc: 'Masaya monte edilebilen geniş çalışma ekranı.' },
  printer: { name: 'Fotokopi & Yazıcı', price: 2500, category: 'ofis', desc: 'Çok fonksiyonlu ofis tipi lazer yazıcı.' },
  board: { name: 'Planlama Beyaz Tahtası', price: 1200, category: 'ofis', desc: 'Üzerine yazı yazılabilen sunum ve analiz tahtası.' },
  plant: { name: 'Uzun Saksı Bitkisi', price: 500, category: 'dekorasyon', desc: 'Ofis havasını tazeleyen büyük yeşil yapraklı saksı.' },
  plant_small: { name: 'Küçük Masa Bitkisi', price: 250, category: 'dekorasyon', desc: 'Çalışma masası üzerine konulabilen minyatür saksı.' },
  clock: { name: 'Modern Duvar Saati', price: 300, category: 'dekorasyon', desc: 'Zamanı takip etmek için tasarlanmış şık duvar saati.' },
  lamp: { name: 'Ayaklı Zemin Lambası', price: 750, category: 'dekorasyon', desc: 'Ofisin köşelerini aydınlatan modern lambader.' },
  sofa: { name: 'Lüks Üçlü Koltuk', price: 1500, category: 'konfor', desc: 'Geniş, turuncu renkli misafir bekleme koltuğu.' },
  table_glass: { name: 'Cam Orta Sehpa', price: 900, category: 'konfor', desc: 'Cam yüzeyli, çelik iskeletli orta sehpa.' },
  water: { name: 'Damacanalı Su Sebili', price: 800, category: 'konfor', desc: 'Sıcak ve soğuk su çıkışlı modern su sebili.' },
  bookshelf: { name: 'Klasik Kitaplık & Arşiv', price: 1800, category: 'ofis', desc: 'Evrak ve kitaplar için geniş ahşap kitaplık.' },
  safe: { name: 'Çelik Arşiv Kasası', price: 3000, category: 'guvenlik', desc: 'Kıymetli evrak ve paraları korumak için çelik kasa.' }
};

export const shadeColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x100 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};
