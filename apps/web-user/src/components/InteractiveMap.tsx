import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Compass, Navigation, Landmark, Truck, AlertCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';

// Import our optimized districts GeoJSON
import turkiyeGeoJSON from '../data/turkiye-ilceler-geojson.json';

// Types for Turkey GeoJSON
interface GeoJSONFeature {
  type: string;
  properties: {
    province: string;
    district: string;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface ProvinceData {
  name: string;
  mayor: string;
  taxRate: number;
  securityIndex: number;
  logisticsFleets: number;
  region: string;
}

// Bounding box for Turkey projection
const minLng = 25.5;
const maxLng = 45.0;
const minLat = 35.5;
const maxLat = 42.5;

function project(lng: number, lat: number, width = 800, height = 350) {
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return [x, y];
}

function calculateDistanceKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
}

function getDistrictCoords(
  features: GeoJSONFeature[],
  provinceName: string,
  districtName: string
): { lng: number; lat: number } | null {
  const feature = features.find(
    f => f.properties.province === provinceName && f.properties.district === districtName
  );
  if (!feature) return null;

  let ring;
  if (feature.geometry.type === 'Polygon') {
    ring = feature.geometry.coordinates[0];
  } else {
    ring = feature.geometry.coordinates[0][0];
  }

  if (ring && ring.length > 0) {
    let sumX = 0, sumY = 0;
    ring.forEach((p: number[]) => {
      sumX += p[0];
      sumY += p[1];
    });
    return { lng: sumX / ring.length, lat: sumY / ring.length };
  }
  return null;
}


// Converts polygon coordinates to SVG path "d" attribute
function geometryToPath(geometry: any, width = 800, height = 350) {
  const projectPoint = (p: number[]) => {
    const x = ((p[0] - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - p[1]) / (maxLat - minLat)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring: number[][]) => {
      if (ring.length === 0) return '';
      return 'M ' + ring.map(projectPoint).join(' L ') + ' Z';
    }).join(' ');
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((poly: number[][][]) => {
      return poly.map((ring: number[][]) => {
        if (ring.length === 0) return '';
        return 'M ' + ring.map(projectPoint).join(' L ') + ' Z';
      }).join(' ');
    }).join(' ');
  }
  return '';
}

// Region colors optimized for Light Mode (crisp pastel shades)
const REGION_COLORS: { [key: string]: string } = {
  'marmara': '#9333ea',     // Purple
  'ege': '#0891b2',         // Cyan
  'akdeniz': '#d97706',     // Amber
  'ic_anadolu': '#059669',  // Emerald
  'karadeniz': '#2563eb',   // Cobalt Blue
  'dogu_anadolu': '#db2777', // Hot Pink
  'guneydogu': '#ea580c',   // Orange
};

const REGION_NAMES: { [key: string]: string } = {
  'marmara': 'Marmara Şehir Birliği',
  'ege': 'Ege Şehir Birliği',
  'akdeniz': 'Akdeniz Şehir Birliği',
  'ic_anadolu': 'İç Anadolu Şehir Birliği',
  'karadeniz': 'Karadeniz Şehir Birliği',
  'dogu_anadolu': 'Doğu Anadolu Şehir Birliği',
  'guneydogu': 'Güneydoğu Anadolu Şehir Birliği',
};

// Hardcoded official mayor names
const HARDCODED_PROVINCES: { [key: string]: Partial<ProvinceData> } = {
  'İstanbul': { mayor: 'Ekrem İmamoğlu', taxRate: 8, securityIndex: 78, logisticsFleets: 14, region: 'marmara' },
  'Ankara': { mayor: 'Mansur Yavaş', taxRate: 7, securityIndex: 86, logisticsFleets: 11, region: 'ic_anadolu' },
  'İzmir': { mayor: 'Cemil Tugay', taxRate: 7, securityIndex: 82, logisticsFleets: 9, region: 'ege' },
  'Bursa': { mayor: 'Mustafa Bozbey', taxRate: 6, securityIndex: 85, logisticsFleets: 8, region: 'marmara' },
  'Antalya': { mayor: 'Muhittin Böcek', taxRate: 6, securityIndex: 88, logisticsFleets: 7, region: 'akdeniz' },
  'Adana': { mayor: 'Zeydan Karalar', taxRate: 6, securityIndex: 74, logisticsFleets: 5, region: 'akdeniz' },
  'Mersin': { mayor: 'Vahap Seçer', taxRate: 5, securityIndex: 80, logisticsFleets: 6, region: 'akdeniz' },
  'Muğla': { mayor: 'Ahmet Aras', taxRate: 5, securityIndex: 89, logisticsFleets: 4, region: 'ege' },
  'Aydın': { mayor: 'Özlem Çerçioğlu', taxRate: 5, securityIndex: 84, logisticsFleets: 3, region: 'ege' },
  'Eskişehir': { mayor: 'Ayşe Ünlüce', taxRate: 5, securityIndex: 94, logisticsFleets: 4, region: 'ic_anadolu' },
  'Konya': { mayor: 'Uğur İbrahim Altay', taxRate: 5, securityIndex: 87, logisticsFleets: 8, region: 'ic_anadolu' },
  'Trabzon': { mayor: 'Ahmet Metin Genç', taxRate: 5, securityIndex: 88, logisticsFleets: 5, region: 'karadeniz' },
  'Samsun': { mayor: 'Halit Doğan', taxRate: 5, securityIndex: 83, logisticsFleets: 6, region: 'karadeniz' },
  'Rize': { mayor: 'Rahmi Metin', taxRate: 4, securityIndex: 90, logisticsFleets: 3, region: 'karadeniz' },
  'Diyarbakır': { mayor: 'Ayşe Serra Bucak', taxRate: 5, securityIndex: 75, logisticsFleets: 5, region: 'guneydogu' },
  'Gaziantep': { mayor: 'Fatma Şahin', taxRate: 6, securityIndex: 81, logisticsFleets: 8, region: 'guneydogu' },
  'Mardin': { mayor: 'Ahmet Türk', taxRate: 4, securityIndex: 80, logisticsFleets: 3, region: 'guneydogu' },
  'Çanakkale': { mayor: 'Muharrem Erkek', taxRate: 4, securityIndex: 92, logisticsFleets: 3, region: 'marmara' },
};

const PROVINCE_TO_REGION: { [key: string]: string } = {
  // Marmara
  'Edirne': 'marmara', 'Kırklareli': 'marmara', 'Tekirdağ': 'marmara', 'İstanbul': 'marmara',
  'Kocaeli': 'marmara', 'Sakarya': 'marmara', 'Bilecik': 'marmara', 'Yalova': 'marmara',
  'Bursa': 'marmara', 'Balıkesir': 'marmara', 'Çanakkale': 'marmara',
  // Ege
  'İzmir': 'ege', 'Manisa': 'ege', 'Aydın': 'ege', 'Muğla': 'ege',
  'Denizli': 'ege', 'Kütahya': 'ege', 'Afyonkarahisar': 'ege', 'Uşak': 'ege',
  // Akdeniz
  'Antalya': 'akdeniz', 'Isparta': 'akdeniz', 'Burdur': 'akdeniz', 'Mersin': 'akdeniz',
  'Adana': 'akdeniz', 'Hatay': 'akdeniz', 'Osmaniye': 'akdeniz', 'Kahramanmaraş': 'akdeniz',
  // İç Anadolu
  'Ankara': 'ic_anadolu', 'Eskişehir': 'ic_anadolu', 'Konya': 'ic_anadolu', 'Aksaray': 'ic_anadolu',
  'Karaman': 'ic_anadolu', 'Niğde': 'ic_anadolu', 'Nevşehir': 'ic_anadolu', 'Kırşehir': 'ic_anadolu',
  'Kırıkkale': 'ic_anadolu', 'Yozgat': 'ic_anadolu', 'Çankırı': 'ic_anadolu', 'Kayseri': 'ic_anadolu',
  'Sivas': 'ic_anadolu',
  // Karadeniz
  'Bolu': 'karadeniz', 'Düzce': 'karadeniz', 'Zonguldak': 'karadeniz', 'Karabük': 'karadeniz',
  'Bartın': 'karadeniz', 'Kastamonu': 'karadeniz', 'Çorum': 'karadeniz', 'Sinop': 'karadeniz',
  'Samsun': 'karadeniz', 'Amasya': 'karadeniz', 'Tokat': 'karadeniz', 'Ordu': 'karadeniz',
  'Giresun': 'karadeniz', 'Gümüşhane': 'karadeniz', 'Bayburt': 'karadeniz', 'Trabzon': 'karadeniz',
  'Rize': 'karadeniz', 'Artvin': 'karadeniz',
  // Doğu Anadolu
  'Malatya': 'dogu_anadolu', 'Erzincan': 'dogu_anadolu', 'Tunceli': 'dogu_anadolu', 'Elazığ': 'dogu_anadolu',
  'Bingöl': 'dogu_anadolu', 'Erzurum': 'dogu_anadolu', 'Muş': 'dogu_anadolu', 'Bitlis': 'dogu_anadolu',
  'Van': 'dogu_anadolu', 'Hakkari': 'dogu_anadolu', 'Şırnak': 'dogu_anadolu', 'Ağrı': 'dogu_anadolu',
  'Kars': 'dogu_anadolu', 'Ardahan': 'dogu_anadolu', 'Iğdır': 'dogu_anadolu',
  // Güneydoğu
  'Gaziantep': 'guneydogu', 'Kilis': 'guneydogu', 'Adıyaman': 'guneydogu', 'Şanlıurfa': 'guneydogu',
  'Diyarbakır': 'guneydogu', 'Mardin': 'guneydogu', 'Batman': 'guneydogu', 'Siirt': 'guneydogu',
};

const mayorsList = [
  'Ahmet Yıldırım', 'Mehmet Kaya', 'Mustafa Demir', 'Ali Öztürk', 'Hasan Şahin',
  'Ayşe Yıldız', 'Fatma Çelik', 'Zeynep Aydın', 'Süleyman Koç', 'Hüseyin Aslan'
];

function getProvinceMetadata(provinceName: string): ProvinceData {
  const hardcoded = HARDCODED_PROVINCES[provinceName];
  if (hardcoded) {
    return {
      name: provinceName,
      mayor: hardcoded.mayor || 'Bilinmiyor',
      taxRate: hardcoded.taxRate || 5,
      securityIndex: hardcoded.securityIndex || 80,
      logisticsFleets: hardcoded.logisticsFleets || 4,
      region: hardcoded.region || PROVINCE_TO_REGION[provinceName] || 'ic_anadolu'
    };
  }
  
  // Deterministic generator using string hash
  let hash = 0;
  for (let i = 0; i < provinceName.length; i++) {
    hash = provinceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const mayor = mayorsList[hash % mayorsList.length];
  const taxRate = 4 + (hash % 5); // 4% - 8%
  const securityIndex = 70 + (hash % 26); // 70% - 95%
  const logisticsFleets = 2 + (hash % 10); // 2 - 11
  const region = PROVINCE_TO_REGION[provinceName] || 'ic_anadolu';
  
  return {
    name: provinceName,
    mayor,
    taxRate,
    securityIndex,
    logisticsFleets,
    region
  };
}

export interface DistrictData {
  province: string;
  name: string;
  defensePower: number;
  schoolCount: number;
  hospitalCount: number;
  population: number;
  industrialCapacity: number;
  infrastructureLevel: number;
}

export function getDistrictMetadata(provinceName: string, districtName: string): DistrictData {
  const combinedName = `${provinceName}-${districtName}`;
  let hash = 0;
  for (let i = 0; i < combinedName.length; i++) {
    hash = combinedName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const population = 12000 + (hash % 688000);
  const schoolCount = 1;
  const hospitalCount = 1;
  const defensePower = 350 + (hash % 3500) + Math.round(population / 150);
  const industrialCapacity = 10 + (hash % 81);
  const infrastructureLevel = 45 + (hash % 51);

  return {
    province: provinceName,
    name: districtName,
    defensePower,
    schoolCount,
    hospitalCount,
    population,
    industrialCapacity,
    infrastructureLevel
  };
}

export function hasAirport(provinceName: string, districtName: string): boolean {
  const airports: Record<string, string[]> = {
    'Ankara': ['Çankaya', 'Merkez', 'Akyurt', 'Kızılcahamam'],
    'İstanbul': ['Arnavutköy', 'Pendik', 'Bakırköy', 'Kadıköy', 'Şişli', 'Beşiktaş'],
    'İzmir': ['Gaziemir', 'Merkez', 'Konak', 'Bornova'],
    'Yalova': ['Merkez', 'Çiftlikköy'],
    'Sivas': ['Merkez'],
    'Batman': ['Merkez'],
    'Eskişehir': ['Tepebaşı', 'Merkez', 'Odunpazarı'],
    'Kastamonu': ['Merkez'],
    'Karabük': ['Merkez'],
    'Zonguldak': ['Çaycuma', 'Merkez'],
    'Balıkesir': ['Edremit', 'Merkez', 'Ayvalık'],
    'Konya': ['Selçuklu', 'Merkez', 'Meram']
  };
  const list = airports[provinceName];
  return list ? list.includes(districtName) : false;
}

const features = (turkiyeGeoJSON as any).features as GeoJSONFeature[];

interface InteractiveMapProps {
  currentProvince: string;
  currentDistrict: string;
  residenceProvince: string;
  residenceDistrict: string;
  userRole: string;
  userCash: number;
  userEnergy: number;
  userOwnedVehicles?: string[];
  userFuelLiters?: number;
  commodities?: any[];
  onTravel: (province: string, district: string, cost: number, energyCost: number, distanceKm: number, mode: 'bus' | 'car' | 'plane', fuelNeeded: number) => void;
  onMoveResidence: (province: string, district: string, cost: number, energyCost: number) => void;
}

const InteractiveMapComponent: React.FC<InteractiveMapProps> = ({
  currentProvince,
  currentDistrict,
  residenceProvince,
  residenceDistrict,
  userRole,
  userCash,
  userEnergy,
  userOwnedVehicles = [],
  userFuelLiters = 0,
  commodities = [],
  onTravel,
  onMoveResidence
}) => {
  const [selectedProvinceKey, setSelectedProvinceKey] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<'bus' | 'car' | 'plane'>('bus');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; success: boolean } | null>(null);

  const selectedDistrictStats = useMemo(() => {
    if (!selectedProvinceKey || !selectedDistrict) return null;
    return getDistrictMetadata(selectedProvinceKey, selectedDistrict);
  }, [selectedProvinceKey, selectedDistrict]);

  const travelDistanceKm = useMemo(() => {
    if (!selectedProvinceKey || !selectedDistrict) return 0;
    if (selectedProvinceKey === currentProvince && selectedDistrict === currentDistrict) return 0;

    const currentCoords = getDistrictCoords(features, currentProvince, currentDistrict);
    const targetCoords = getDistrictCoords(features, selectedProvinceKey, selectedDistrict);

    if (currentCoords && targetCoords) {
      const distance = calculateDistanceKm(currentCoords.lng, currentCoords.lat, targetCoords.lng, targetCoords.lat);
      // Default to minimum 10 km for different districts to avoid instant 0s travel
      if (distance < 5) return 10;
      return distance;
    }
    return 150;
  }, [selectedProvinceKey, selectedDistrict, currentProvince, currentDistrict, features]);

  // Zoom & Pan states for manual and auto-focused mapping controls
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);
  
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent browser default zoom (like Ctrl+Wheel trackpad gesture)
      e.preventDefault();
      
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = 1.1;
      let nextScale;
      if (e.deltaY < 0) {
        nextScale = Math.min(15, zoomScale * zoomFactor);
      } else {
        nextScale = Math.max(1, zoomScale / zoomFactor);
      }

      if (nextScale !== zoomScale) {
        const scaleRatio = nextScale / zoomScale;
        const newX = mouseX - (mouseX - panOffset.x) * scaleRatio;
        const newY = mouseY - (mouseY - panOffset.y) * scaleRatio;

        setZoomScale(nextScale);
        setPanOffset({ x: newX, y: newY });
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoomScale, panOffset]);
  
  // Tooltip tracking
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ province: string; district: string; visible: boolean }>({
    province: '',
    district: '',
    visible: false
  });

  // Memoize path data computation so it only runs once and is lightning fast
  const districtPaths = useMemo(() => {
    return features.map(f => {
      const pathD = geometryToPath(f.geometry, 800, 350);
      const hasAir = hasAirport(f.properties.province, f.properties.district);
      let centroid = null;
      if (hasAir) {
        let ring;
        if (f.geometry.type === 'Polygon') {
          ring = f.geometry.coordinates[0];
        } else {
          ring = f.geometry.coordinates[0][0];
        }
        if (ring && ring.length > 0) {
          let sumX = 0, sumY = 0;
          ring.forEach((p: number[]) => {
            sumX += p[0];
            sumY += p[1];
          });
          const [cx, cy] = project(sumX / ring.length, sumY / ring.length, 800, 350);
          centroid = { x: cx, y: cy };
        }
      }
      return {
        province: f.properties.province,
        district: f.properties.district,
        pathD,
        hasAirport: hasAir,
        centroid
      };
    });
  }, [features]);

  // Pre-calculate province bounding boxes in SVG pixel coordinate space
  const provinceBounds = useMemo(() => {
    const bounds: { [key: string]: [number, number, number, number] } = {};
    
    features.forEach(f => {
      const prov = f.properties.province;
      if (!bounds[prov]) {
        bounds[prov] = [Infinity, Infinity, -Infinity, -Infinity];
      }
      
      const updateBounds = (p: number[]) => {
        const [x, y] = project(p[0], p[1]);
        if (x < bounds[prov][0]) bounds[prov][0] = x;
        if (y < bounds[prov][1]) bounds[prov][1] = y;
        if (x > bounds[prov][2]) bounds[prov][2] = x;
        if (y > bounds[prov][3]) bounds[prov][3] = y;
      };
      
      const geom = f.geometry;
      if (geom.type === 'Polygon') {
        geom.coordinates.forEach((ring: number[][]) => ring.forEach(updateBounds));
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly: number[][][]) => 
          poly.forEach((ring: number[][]) => ring.forEach(updateBounds))
        );
      }
    });
    
    return bounds;
  }, [features]);

  // Compute center coordinate of current location district for the pulse pin overlay
  const currentPinCoords = useMemo(() => {
    const currentFeature = features.find(
      f => f.properties.province === currentProvince && f.properties.district === currentDistrict
    );
    if (!currentFeature) return null;
    
    let ring;
    if (currentFeature.geometry.type === 'Polygon') {
      ring = currentFeature.geometry.coordinates[0];
    } else {
      ring = currentFeature.geometry.coordinates[0][0];
    }
    
    if (ring && ring.length > 0) {
      let sumX = 0, sumY = 0;
      ring.forEach((p: number[]) => {
        sumX += p[0];
        sumY += p[1];
      });
      return project(sumX / ring.length, sumY / ring.length);
    }
    return null;
  }, [currentProvince, currentDistrict, features]);

  // Compute center coordinate of active target district for targeting pulse pin
  const targetPinCoords = useMemo(() => {
    if (!selectedProvinceKey || !selectedDistrict) return null;
    const targetFeature = features.find(
      f => f.properties.province === selectedProvinceKey && f.properties.district === selectedDistrict
    );
    if (!targetFeature) return null;
    
    let ring;
    if (targetFeature.geometry.type === 'Polygon') {
      ring = targetFeature.geometry.coordinates[0];
    } else {
      ring = targetFeature.geometry.coordinates[0][0];
    }
    
    if (ring && ring.length > 0) {
      let sumX = 0, sumY = 0;
      ring.forEach((p: number[]) => {
        sumX += p[0];
        sumY += p[1];
      });
      return project(sumX / ring.length, sumY / ring.length);
    }
    return null;
  }, [selectedProvinceKey, selectedDistrict, features]);

  // Synchronize zoomScale and panOffset dynamically when selectedProvinceKey changes
  useEffect(() => {
    if (selectedProvinceKey && provinceBounds[selectedProvinceKey]) {
      const [minX, minY, maxX, maxY] = provinceBounds[selectedProvinceKey];
      const w = maxX - minX;
      const h = maxY - minY;
      const cx = minX + w / 2;
      const cy = minY + h / 2;
      
      const scale = Math.min(5.5, Math.min(800 / w, 350 / h) * 0.75);
      const tx = 400 - cx * scale;
      const ty = 175 - cy * scale;
      
      setZoomScale(scale);
      setPanOffset({ x: tx, y: ty });
    } else {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [selectedProvinceKey, provinceBounds]);

  const handleGoToCurrentLocation = () => {
    setSelectedProvinceKey(currentProvince);
    setSelectedDistrict(currentDistrict);
    
    // Explicitly re-center if already selected
    if (selectedProvinceKey === currentProvince && provinceBounds[currentProvince]) {
      const [minX, minY, maxX, maxY] = provinceBounds[currentProvince];
      const w = maxX - minX;
      const h = maxY - minY;
      const cx = minX + w / 2;
      const cy = minY + h / 2;
      
      const scale = Math.min(5.5, Math.min(800 / w, 350 / h) * 0.75);
      const tx = 400 - cx * scale;
      const ty = 175 - cy * scale;
      
      setZoomScale(scale);
      setPanOffset({ x: tx, y: ty });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragMoved(false);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const dx = Math.abs(newX - panOffset.x);
      const dy = Math.abs(newY - panOffset.y);
      if (dx > 4 || dy > 4) {
        setDragMoved(true);
      }
      
      setPanOffset({ x: newX, y: newY });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Split paths into active and background districts for proper layer overlapping
  const { backgroundPaths, activePaths } = useMemo(() => {
    if (!selectedProvinceKey) {
      return { backgroundPaths: districtPaths, activePaths: [] };
    }
    const active = districtPaths.filter(d => d.province === selectedProvinceKey);
    const background = districtPaths.filter(d => d.province !== selectedProvinceKey);
    return { backgroundPaths: background, activePaths: active };
  }, [selectedProvinceKey, districtPaths]);

  // Handles search filtering
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    const query = searchQuery.toLocaleLowerCase('tr-TR');
    
    // Find matching provinces (City States)
    const matchedProvinces = Array.from(new Set(features.map(f => f.properties.province)))
      .filter(p => p.toLocaleLowerCase('tr-TR').includes(query))
      .map(p => ({ type: 'province', province: p, name: p, label: `${p} Cumhuriyeti (Şehir Devleti)` }))
      .slice(0, 5);
      
    // Find matching districts
    const matchedDistricts = features
      .filter(f => f.properties.district.toLocaleLowerCase('tr-TR').includes(query))
      .map(f => {
        const hasAir = hasAirport(f.properties.province, f.properties.district);
        return {
          type: 'district',
          province: f.properties.province,
          district: f.properties.district,
          name: f.properties.district,
          label: `${f.properties.province} Cumhuriyeti / ${f.properties.district} (İlçe)${hasAir ? ' ✈️' : ''}`
        };
      })
      .slice(0, 5);
      
    setSearchSuggestions([...matchedProvinces, ...matchedDistricts]);
  }, [searchQuery, features]);

  const handleSuggestionClick = (suggestion: any) => {
    setSelectedProvinceKey(suggestion.province);
    if (suggestion.type === 'district') {
      setSelectedDistrict(suggestion.district);
    } else {
      setSelectedDistrict(null);
    }
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  // Dynamic pricing & cost calculations
  const travelCostDetails = useMemo(() => {
    const petroleumComm = commodities.find(c => c.id === 'petroleum') || { currentPrice: 280 };
    const fuelPricePerLiter = Math.round(petroleumComm.currentPrice * 0.15);
    const fuelNeeded = Math.round(travelDistanceKm * 0.08 * 10) / 10;
    
    // Otobüs: 2 kat ucuz, 2s/km. cost = (travelDistanceKm * 0.08 * fuelPricePerLiter) / 2. Min 25 ₺.
    const busCost = Math.max(25, Math.round((travelDistanceKm * 0.08 * fuelPricePerLiter) / 2));
    
    // Uçak: 3 kat pahalı, 0.2s/km. cost = (travelDistanceKm * 0.08 * fuelPricePerLiter) * 3. Min 150 ₺.
    const planeCost = Math.max(150, Math.round((travelDistanceKm * 0.08 * fuelPricePerLiter) * 3));
    
    // Özel Araç: cash cost = 0 (tüketilen yakıt). Yakıt = fuelNeeded.
    const carCost = 0;

    return {
      fuelPricePerLiter,
      fuelNeeded,
      bus: { cost: busCost, energy: 20, speed: 2, label: 'Otobüs' },
      car: { cost: carCost, energy: 15, speed: 1, label: 'Özel Araç', fuelNeeded },
      plane: { cost: planeCost, energy: 5, speed: 0.2, label: 'Uçak' }
    };
  }, [travelDistanceKm, commodities]);

  const { bus, car, plane, fuelNeeded } = travelCostDetails;

  const handleTravelClick = () => {
    if (!selectedProvinceKey || !selectedDistrict) return;
    
    const isSameLocation = selectedProvinceKey === currentProvince && selectedDistrict === currentDistrict;
    if (isSameLocation) {
      setFeedbackMsg({ text: 'Zaten bu konumdasınız!', success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    let travelCost = 0;
    let energyCost = 0;

    const departureHasAirport = hasAirport(currentProvince, currentDistrict);
    const destinationHasAirport = hasAirport(selectedProvinceKey || '', selectedDistrict || '');
    const hasPlaneAccess = departureHasAirport && destinationHasAirport;
    const hasOwnedVehicle = userOwnedVehicles && userOwnedVehicles.length > 0;

    if (travelMode === 'bus') {
      travelCost = bus.cost;
      energyCost = bus.energy;
    } else if (travelMode === 'car') {
      travelCost = car.cost;
      energyCost = car.energy;
      
      if (!hasOwnedVehicle) {
        setFeedbackMsg({ text: 'Seyahat edebilmek için galeri bölümünden bir araç satın almalısınız!', success: false });
        setTimeout(() => setFeedbackMsg(null), 4000);
        return;
      }
      if (userFuelLiters < fuelNeeded) {
        setFeedbackMsg({ text: `Yetersiz benzin! Gereken: ${fuelNeeded} lt, Garajınızda olan: ${userFuelLiters.toFixed(1)} lt. Lütfen galeriye gidip yakıt alın!`, success: false });
        setTimeout(() => setFeedbackMsg(null), 5000);
        return;
      }
    } else if (travelMode === 'plane') {
      travelCost = plane.cost;
      energyCost = plane.energy;
      
      if (!hasPlaneAccess) {
        setFeedbackMsg({ text: 'Uçak yolculuğu için hem kalkış hem varış noktasında havalimanı bulunmalıdır!', success: false });
        setTimeout(() => setFeedbackMsg(null), 5000);
        return;
      }
    }

    if (userCash < travelCost) {
      setFeedbackMsg({ text: `Yetersiz nakit! Seyahat ücreti: ${travelCost} ₺`, success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (userEnergy < energyCost) {
      setFeedbackMsg({ text: `Yetersiz enerji! Gereken: ${energyCost} enerji`, success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    onTravel(selectedProvinceKey, selectedDistrict, travelCost, energyCost, travelDistanceKm, travelMode, travelMode === 'car' ? fuelNeeded : 0);
    const modeEmoji = travelMode === 'plane' ? '✈️' : travelMode === 'bus' ? '🚌' : '🚗';
    const modeLabel = travelMode === 'plane' ? 'Uçak' : travelMode === 'bus' ? 'Otobüs' : 'Özel Araç';
    const durationSeconds = Math.round(Math.max(1, travelMode === 'plane' ? travelDistanceKm * 0.2 : travelMode === 'bus' ? travelDistanceKm * 2 : travelDistanceKm * 1));
    setFeedbackMsg({
      text: `${modeEmoji} ${selectedProvinceKey} Cumhuriyeti, ${selectedDistrict} konumuna ${modeLabel} yolculuğu başlatıldı! Süre: ${durationSeconds} sn`,
      success: true
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleMoveResidenceClick = () => {
    if (!selectedProvinceKey || !selectedDistrict) return;

    const isSameResidence = selectedProvinceKey === residenceProvince && selectedDistrict === residenceDistrict;
    if (isSameResidence) {
      setFeedbackMsg({ text: 'Zaten ikametgahınız bu konumda!', success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    // Cumhurbaşkanı kısıtlaması: Cumhurbaşkanı olduğu süre boyunca sadece cumhurbaşkanı olduğu devletin (residenceProvince) sınırları içerisindeki ilçelere ikametgah taşıyabilir.
    if (userRole === 'CUMHURBASKANI' && selectedProvinceKey !== residenceProvince) {
      setFeedbackMsg({
        text: `❌ Hata: Cumhurbaşkanı olarak resmi ikametgahınızı yönettiğiniz eyalet (${residenceProvince} Cumhuriyeti) dışına taşıyamazsınız! Diğer cumhuriyetleri sadece ziyaret edebilirsiniz.`,
        success: false
      });
      setTimeout(() => setFeedbackMsg(null), 6000);
      return;
    }

    const moveCost = 250;
    const energyCost = 30;

    if (userCash < moveCost) {
      setFeedbackMsg({ text: `Yetersiz nakit! İkametgah taşıma ücreti: ${moveCost} ₺`, success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (userEnergy < energyCost) {
      setFeedbackMsg({ text: `Yetersiz enerji! Gereken: ${energyCost} enerji`, success: false });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    onMoveResidence(selectedProvinceKey, selectedDistrict, moveCost, energyCost);
    setFeedbackMsg({ text: `İkametgah taşıma başvurunuz alındı! Dışişleri Bakanı veya Cumhurbaşkanı onay süreci başladı.`, success: true });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleDistrictHover = (e: React.MouseEvent, prov: string, dist: string) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX}px`;
      tooltipRef.current.style.top = `${e.clientY - 45}px`;
    }
    // Only trigger React state update if we moved to a different district or if it wasn't visible
    if (tooltip.district !== dist || tooltip.province !== prov || !tooltip.visible) {
      setTooltip({
        province: prov,
        district: dist,
        visible: true
      });
    }
  };

  // Province Metadata
  const selectedProvince = selectedProvinceKey ? getProvinceMetadata(selectedProvinceKey) : null;
  const regionName = selectedProvince ? REGION_NAMES[selectedProvince.region] : '';



  return (
    <div className="interactive-map-grid" style={{ alignItems: 'start', position: 'relative' }}>
      
      {/* Interactive Map Visual Panel */}
      <GlassCard className="glow-cyan" style={{ borderLeft: '4px solid hsl(var(--accent-cyan))', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Compass style={{ color: 'hsl(var(--accent-cyan))' }} /> İnteraktif Şehir Devletleri Haritası
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={12} style={{ color: 'hsl(var(--accent-cyan))' }} /> 
            Mevcut Konum: <strong style={{ color: 'white' }}>{currentProvince} Cumhuriyeti, {currentDistrict}</strong>
          </div>
        </div>

        {/* Search & Reset Header Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', position: 'relative', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'hsl(var(--text-muted))' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Şehir Devleti veya ilçe ara (örn: Seyhan, İzmir, Kadıköy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            {/* Search Suggestions Dropdown */}
            {searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(10, 15, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                zIndex: 50,
                marginTop: '4px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {searchSuggestions.map((s, idx) => (
                  <div
                     key={idx}
                     onClick={() => handleSuggestionClick(s)}
                     style={{
                       padding: '0.75rem 1rem',
                       borderBottom: idx < searchSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                       cursor: 'pointer',
                       fontSize: '0.85rem',
                       color: 'white',
                       transition: 'background 0.2s'
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                     🔍 {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleGoToCurrentLocation}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            📍 Konumuma Yakınlaş
          </button>
          
          {selectedProvinceKey && (
            <button
              onClick={() => { setSelectedProvinceKey(null); setSelectedDistrict(null); }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0 1rem' }}
            >
              <RefreshCw size={14} /> Haritayı Sıfırla
            </button>
          )}
        </div>

        {/* Premium LIGHT MODE Vector SVG Map Container */}
        <div 
          ref={containerRef}
          style={{
            background: 'var(--bg-map, #ffffff)', // Adapts to Dark and Light modes dynamically
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            padding: '0.5rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 40px rgba(15, 23, 42, 0.04)'
          }}
        >
          {selectedProvinceKey && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              📍 {selectedProvinceKey} Cumhuriyeti
            </div>
          )}

          <svg 
            viewBox="0 0 800 350"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            style={{ 
              width: '100%', 
              height: 'auto', 
              display: 'block',
              overflow: 'hidden',
              userSelect: 'none',
              cursor: isDragging ? 'grabbing' : zoomScale > 1 ? 'grab' : 'default'
            }}
          >
            <defs>
              {/* SVG Fractal Noise Filter to generate grain/parchment texture */}
              <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0" result="coloredNoise" />
                <feComposite in="coloredNoise" in2="SourceGraphic" operator="in" result="monoNoise" />
                <feBlend mode="multiply" in="SourceGraphic" in2="monoNoise" />
              </filter>
            </defs>

            <g 
              style={{ 
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
              }}
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`}
            >
              {/* Oceanic Graticule Lines (Grid) */}
              <g opacity="0.45" style={{ pointerEvents: 'none' }}>
                {Array.from({ length: 41 }).map((_, i) => {
                  const x = i * 20;
                  return (
                    <line
                      key={`grid-v-${i}`}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={350}
                      stroke="rgba(15, 23, 42, 0.045)"
                      strokeWidth={0.25}
                      strokeDasharray="2 3"
                    />
                  );
                })}
                {Array.from({ length: 18 }).map((_, i) => {
                  const y = i * 20;
                  return (
                    <line
                      key={`grid-h-${i}`}
                      x1={0}
                      y1={y}
                      x2={800}
                      y2={y}
                      stroke="rgba(15, 23, 42, 0.045)"
                      strokeWidth={0.25}
                      strokeDasharray="2 3"
                    />
                  );
                })}
              </g>
              {/* Layer 1: Background / Neighboring districts (rendered first, sits below active) */}
              {backgroundPaths.map((d, idx) => {
                const region = PROVINCE_TO_REGION[d.province] || 'ic_anadolu';
                const regionColor = REGION_COLORS[region];
                
                const fill = selectedProvinceKey ? `${regionColor}0a` : `${regionColor}25`;
                const stroke = selectedProvinceKey ? 'rgba(15, 23, 42, 0.08)' : 'rgba(15, 23, 42, 0.18)';
                const strokeWidth = selectedProvinceKey ? (0.25 / zoomScale) : 0.35;

                return (
                  <path
                    key={`bg-${idx}`}
                    d={d.pathD}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease', filter: 'url(#paper-grain)' }}
                    onClick={() => {
                      if (dragMoved) return;
                      setSelectedProvinceKey(d.province);
                      setSelectedDistrict(d.district);
                    }}
                    onMouseMove={(e) => handleDistrictHover(e, d.province, d.district)}
                    onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                    onMouseEnter={(e) => {
                      e.currentTarget.setAttribute('fill', `${regionColor}35`);
                      e.currentTarget.setAttribute('stroke', '#0f172a');
                      e.currentTarget.setAttribute('stroke-width', (0.85 / zoomScale).toString());
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.setAttribute('fill', fill);
                      e.currentTarget.setAttribute('stroke', stroke);
                      e.currentTarget.setAttribute('stroke-width', strokeWidth.toString());
                    }}
                  />
                );
              })}

              {/* Layer 2: Active Focused Province districts (rendered last, sits crisp on top with clear shadows) */}
              {activePaths.map((d, idx) => {
                const region = PROVINCE_TO_REGION[d.province] || 'ic_anadolu';
                const regionColor = REGION_COLORS[region];
                
                const isSelectedDistrict = selectedDistrict === d.district;
                
                const fill = isSelectedDistrict ? `${regionColor}e6` : `${regionColor}55`;
                const stroke = isSelectedDistrict ? '#0f172a' : '#1e293b';
                const strokeWidth = (isSelectedDistrict ? 1.4 : 0.8) / zoomScale;

                return (
                  <path
                    key={`active-${idx}`}
                    d={d.pathD}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ 
                      transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease',
                      filter: isSelectedDistrict 
                        ? 'url(#paper-grain) drop-shadow(0px 3px 6px rgba(15,23,42,0.35))' 
                        : 'url(#paper-grain)'
                    }}
                    onClick={() => {
                      if (dragMoved) return;
                      setSelectedDistrict(d.district);
                    }}
                    onMouseMove={(e) => handleDistrictHover(e, d.province, d.district)}
                    onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                    onMouseEnter={(e) => {
                      e.currentTarget.setAttribute('fill', `${regionColor}f2`);
                      e.currentTarget.setAttribute('stroke', '#0f172a');
                      e.currentTarget.setAttribute('stroke-width', (1.4 / zoomScale).toString());
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.setAttribute('fill', fill);
                      e.currentTarget.setAttribute('stroke', stroke);
                      e.currentTarget.setAttribute('stroke-width', strokeWidth.toString());
                    }}
                  />
                );
              })}
              
              {/* Layer 3: Airport Markers */}
              {districtPaths.map((d, idx) => {
                if (!d.hasAirport || !d.centroid) return null;
                const isFocusedProvince = d.province === selectedProvinceKey;
                const opacity = selectedProvinceKey ? (isFocusedProvince ? 1 : 0.25) : 0.65;
                
                return (
                  <g 
                    key={`airport-${idx}`} 
                    transform={`translate(${d.centroid.x}, ${d.centroid.y})`}
                    style={{ opacity, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}
                  >
                    {/* Glowing outer aura for airport */}
                    <circle 
                      r={7 / zoomScale} 
                      fill="rgba(6, 182, 212, 0.15)" 
                      stroke="rgba(6, 182, 212, 0.4)" 
                      strokeWidth={1 / zoomScale} 
                    />
                    {/* Inner core circle */}
                    <circle 
                      r={3 / zoomScale} 
                      fill="hsl(var(--accent-cyan))" 
                    />
                    {/* Airplane emoji label */}
                    <text
                      x={0}
                      y={-1 / zoomScale}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: `${10 / zoomScale}px`,
                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.4))',
                        userSelect: 'none'
                      }}
                    >
                      ✈️
                    </text>
                  </g>
                );
              })}

              {/* Character Marker at Current Location */}
              {currentPinCoords && (() => {
                const charIcon = userRole === 'CUMHURBASKANI' ? '👑' : userRole === 'MILLETVEKILI' ? '👔' : userRole === 'GARNIZON_KOMUTANI' ? '🎖️' : '🚶';
                return (
                  <g transform={`translate(${currentPinCoords[0]}, ${currentPinCoords[1]})`}>
                    {/* Pulsing ring background */}
                    <circle r={12 / zoomScale} fill="none" stroke="#10b981" strokeWidth={2 / zoomScale}>
                      <animate attributeName="r" values={`${6/zoomScale};${18/zoomScale};${6/zoomScale}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Small pulsing pin core */}
                    <circle r={4 / zoomScale} fill="#10b981" opacity="0.4" />
                    
                    {/* Emoji character center-aligned and scaled */}
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: `${18 / zoomScale}px`,
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    >
                      {charIcon}
                    </text>
                  </g>
                );
              })()}

              {/* Target Location Pulse Pin (Purple ring visual target indicator) */}
              {targetPinCoords && (
                <g transform={`translate(${targetPinCoords[0]}, ${targetPinCoords[1]})`}>
                  <circle r={8 / zoomScale} fill="none" stroke="hsl(var(--accent-purple))" strokeWidth={2 / zoomScale}>
                    <animate attributeName="r" values={`${4/zoomScale};${13/zoomScale};${4/zoomScale}`} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle r={4 / zoomScale} fill="hsl(var(--accent-purple))" />
                </g>
              )}

            </g>

            {/* Nautical Compass Rose decoration */}
            <g transform="translate(735, 275) scale(0.65)" opacity="0.14" style={{ pointerEvents: 'none' }}>
              <circle r="30" fill="none" stroke="#0f172a" strokeWidth="1" />
              <circle r="33" fill="none" stroke="#0f172a" strokeWidth="0.5" strokeDasharray="1 2" />
              <path d="M0,-35 L4,-5 L35,0 L4,4 L0,35 L-4,4 L-35,0 L-4,-5 Z" fill="#0f172a" />
              <path d="M0,-35 L0,0 L35,0 Z" fill="rgba(255,255,255,0.7)" />
              <path d="M0,35 L0,0 L-35,0 Z" fill="rgba(255,255,255,0.7)" />
              <text x="0" y="-38" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0f172a">N</text>
              <text x="38" y="3" dominantBaseline="middle" textAnchor="start" fontSize="9" fontWeight="900" fill="#0f172a">E</text>
              <text x="0" y="46" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0f172a">S</text>
              <text x="-48" y="3" dominantBaseline="middle" textAnchor="start" fontSize="9" fontWeight="900" fill="#0f172a">W</text>
            </g>
          </svg>

          {/* Floating Control Pad Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(15, 23, 42, 0.12)',
            borderRadius: '8px',
            padding: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            {/* Zoom In, Out, and Reset */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setZoomScale(prev => Math.min(10, prev * 1.25))}
                title="Yakınlaştır"
                style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                ＋
              </button>
              <button 
                onClick={() => setZoomScale(prev => Math.max(1, prev / 1.25))}
                title="Uzaklaştır"
                style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                －
              </button>
              <button 
                onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); setSelectedProvinceKey(null); setSelectedDistrict(null); }}
                title="Sıfırla"
                style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                🔄
              </button>
            </div>
            
            {/* Directional Panning Arrows */}
            {zoomScale > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '4px', marginTop: '4px', justifyItems: 'center' }}>
                <div></div>
                <button 
                  onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y + 40 }))}
                  title="Yukarı Taşı"
                  style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ⬆️
                </button>
                <div></div>
                
                <button 
                  onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x + 40 }))}
                  title="Sola Taşı"
                  style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ⬅️
                </button>
                <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold' }}>
                  {zoomScale.toFixed(1)}x
                </div>
                <button 
                  onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x - 40 }))}
                  title="Sağa Taşı"
                  style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ➡️
                </button>
                
                <div></div>
                <button 
                  onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y - 40 }))}
                  title="Aşağı Taşı"
                  style={{ width: '28px', height: '28px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ⬇️
                </button>
                <div></div>
              </div>
            )}
          </div>

          {/* Map Overlay Tip */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            fontSize: '0.75rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            pointerEvents: 'none',
            fontWeight: 500
          }}>
            ℹ️ Sürükleyerek haritada gezinebilir, sağ alttaki butonları kullanabilirsiniz.
          </div>
        </div>
      </GlassCard>

      {/* Side Action/Detail Panel */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Location Info Card */}
        <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem' }}>
            <Landmark size={18} style={{ color: 'hsl(var(--accent-purple))' }} /> Şehir Devleti Bilgi Kartı
          </h3>

          {selectedProvince ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seçili Şehir Devleti</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>{selectedProvince.name} Cumhuriyeti</div>
                <div style={{ fontSize: '0.75rem', color: REGION_COLORS[selectedProvince.region], fontWeight: 600 }}>{regionName}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Vali / Şehir Devleti Başkanı</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginTop: '0.15rem' }}>{selectedProvince.mayor}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Yerel KDV Oranı</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--accent-gold))', marginTop: '0.15rem' }}>%{selectedProvince.taxRate}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Güvenlik İndeksi</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selectedProvince.securityIndex}%`, background: 'hsl(var(--accent-cyan))' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--accent-cyan))' }}>%{selectedProvince.securityIndex}</span>
                </div>
              </div>



              {/* Seçili İlçe Detayları */}
              {selectedDistrictStats && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'white', fontSize: '0.85rem' }}>📍 {selectedDistrict} Detayları</strong>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-purple))', fontWeight: 600 }}>Aktif İlçe</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '0.7rem' }}>👥 Nüfus</span>
                      <strong style={{ color: 'white' }}>{selectedDistrictStats.population.toLocaleString('tr-TR')}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '0.7rem' }}>🛡️ Savunma Gücü</span>
                      <strong style={{ color: '#ef4444' }}>{selectedDistrictStats.defensePower.toLocaleString('tr-TR')} Asker</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '0.7rem' }}>🎓 Okul Sayısı</span>
                      <strong style={{ color: '#3b82f6' }}>{selectedDistrictStats.schoolCount} Okul</strong>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(var(--text-secondary))', display: 'block', fontSize: '0.7rem' }}>🏥 Hastane Sayısı</span>
                      <strong style={{ color: '#10b981' }}>{selectedDistrictStats.hospitalCount} Hastane</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>⚙️ Sanayi Kapasitesi</span>
                        <strong style={{ color: 'white' }}>%{selectedDistrictStats.industrialCapacity}</strong>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${selectedDistrictStats.industrialCapacity}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>🌐 Altyapı İndeksi</span>
                        <strong style={{ color: 'white' }}>%{selectedDistrictStats.infrastructureLevel}</strong>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${selectedDistrictStats.infrastructureLevel}%`, background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Travel and Residence Action Buttons */}
              {selectedDistrict && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {feedbackMsg && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      background: feedbackMsg.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${feedbackMsg.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      color: feedbackMsg.success ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {feedbackMsg.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      <span style={{ lineHeight: '1.3' }}>{feedbackMsg.text}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    
                    {travelDistanceKm > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        marginBottom: '0.4rem'
                      }}>
                        {/* Dynamic Travel Mode Grid */}
                        {(() => {
                          const departureHasAirport = hasAirport(currentProvince, currentDistrict);
                          const destinationHasAirport = hasAirport(selectedProvinceKey || '', selectedDistrict || '');
                          const hasPlaneAccess = departureHasAirport && destinationHasAirport;
                          const hasOwnedVehicle = userOwnedVehicles.length > 0;
                          
                          const modes = [
                            {
                              id: 'bus',
                              label: 'Otobüs',
                              emoji: '🚌',
                              cost: `${bus.cost} ₺`,
                              energy: `-${bus.energy} E.`,
                              time: `${Math.round(travelDistanceKm * 2)} sn`,
                              allowed: true,
                              reason: ''
                            },
                            {
                              id: 'car',
                              label: 'Özel Araç',
                              emoji: '🚗',
                              cost: '0 ₺',
                              energy: `-${car.energy} E.`,
                              time: `${Math.round(travelDistanceKm * 1)} sn`,
                              allowed: hasOwnedVehicle,
                              reason: !hasOwnedVehicle ? 'Araç Yok' : (userFuelLiters < car.fuelNeeded ? 'Yakıt Yetersiz' : ''),
                              extra: `Gereken: ${car.fuelNeeded.toFixed(1)} lt`
                            },
                            {
                              id: 'plane',
                              label: 'Uçak',
                              emoji: '✈️',
                              cost: `${plane.cost} ₺`,
                              energy: `-${plane.energy} E.`,
                              time: `${Math.round(travelDistanceKm * 0.2)} sn`,
                              allowed: hasPlaneAccess,
                              reason: !hasPlaneAccess ? 'Havalimanı Yok' : ''
                            }
                          ];

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase' }}>Seyahat Modu Seçin</span>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                {modes.map(m => {
                                  const isSelected = travelMode === m.id;
                                  const isDisabled = !m.allowed;
                                  
                                  return (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        if (!isDisabled) setTravelMode(m.id as any);
                                      }}
                                      style={{
                                        padding: '0.6rem 0.4rem',
                                        borderRadius: '8px',
                                        background: isSelected 
                                          ? 'rgba(6, 182, 212, 0.12)' 
                                          : (isDisabled ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)'),
                                        border: isSelected 
                                          ? '1px solid hsl(var(--accent-cyan))' 
                                          : (isDisabled ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(255,255,255,0.06)'),
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        opacity: isDisabled ? 0.4 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.2rem'
                                      }}
                                    >
                                      <span style={{ fontSize: '1.25rem' }}>{m.emoji}</span>
                                      <strong style={{ fontSize: '0.75rem', color: isSelected ? 'white' : 'hsl(var(--text-secondary))' }}>{m.label}</strong>
                                      <span style={{ fontSize: '0.65rem', color: isSelected ? 'hsl(var(--accent-cyan))' : 'hsl(var(--text-muted))' }}>{m.time}</span>
                                      
                                      {/* Custom indicator or status */}
                                      {isDisabled ? (
                                        <span style={{ fontSize: '0.55rem', color: '#ef4444', fontWeight: 700 }}>{m.reason}</span>
                                      ) : (
                                        <span style={{ fontSize: '0.6rem', color: 'hsl(var(--accent-gold))', fontWeight: 600 }}>{m.cost}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Travel summary card */}
                              <div style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.15)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                fontSize: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.3rem',
                                marginTop: '0.2rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'hsl(var(--text-secondary))' }}>📍 Toplam Mesafe:</span>
                                  <strong style={{ color: 'white' }}>{travelDistanceKm} km</strong>
                                </div>
                                {travelMode === 'car' && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'hsl(var(--text-secondary))' }}>⛽ Gerekli Benzin:</span>
                                    <strong style={{ color: userFuelLiters >= car.fuelNeeded ? 'hsl(var(--accent-gold))' : '#ef4444' }}>
                                      {car.fuelNeeded.toFixed(1)} / {userFuelLiters.toFixed(1)} Lt
                                    </strong>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'hsl(var(--text-secondary))' }}>⚡ Enerji Tüketimi:</span>
                                  <strong style={{ color: 'white' }}>{travelMode === 'bus' ? bus.energy : travelMode === 'car' ? car.energy : plane.energy} Enerji</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'hsl(var(--text-secondary))' }}>⏱️ Yolculuk Süresi:</span>
                                  <strong style={{ color: 'hsl(var(--accent-cyan))' }}>
                                    {travelMode === 'bus' ? Math.round(travelDistanceKm * 2) : travelMode === 'car' ? Math.round(travelDistanceKm * 1) : Math.round(travelDistanceKm * 0.2)} saniye
                                  </strong>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <button 
                      onClick={handleTravelClick}
                      className="btn-primary" 
                      style={{ padding: '0.65rem', fontSize: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      🚀 Yola Çık (
                      {travelMode === 'bus' 
                        ? `${bus.cost} ₺` 
                        : (travelMode === 'car' ? `${car.fuelNeeded.toFixed(1)} lt` : `${plane.cost} ₺`)}
                      )
                    </button>

                    <button 
                      onClick={handleMoveResidenceClick}
                      className="btn-success" 
                      style={{ 
                        padding: '0.65rem', 
                        fontSize: '0.85rem', 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.35rem',
                        background: 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, #7c3aed 100%)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      🏠 İkametgah Başvurusu Yap (250 ₺, -30 E.)
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'hsl(var(--text-muted))', textAlign: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <span style={{ fontSize: '0.85rem' }}>Bilgilerini görmek için haritadan veya arama çubuğundan bir Şehir Devleti seçin.</span>
            </div>
          )}
        </GlassCard>

        {/* Local Logistics Base Info */}
        {selectedProvince && (
          <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-emerald))', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'white', marginBottom: '0.5rem' }}>
              <Truck size={14} style={{ color: 'hsl(var(--accent-emerald))' }} /> Yerel Lojistik & Depo
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>Aktif Nakliye Filosu: <strong>{selectedProvince.logisticsFleets} Tır</strong></div>
              <div>Bölgesel Depo Hacmi: <strong>%42 (Kapasite: 50.000 ton)</strong></div>
              <div>En Yakın İthalat Limanı: <strong>{selectedProvince.region === 'marmara' || selectedProvince.region === 'ege' || selectedProvince.region === 'akdeniz' || selectedProvince.region === 'karadeniz' ? 'Mevcut' : 'Karayolu Lojistik Geçişi'}</strong></div>
            </div>
          </GlassCard>
        )}

      </aside>

      {/* Floating Tooltip HTML Overlay - LIGHT MODE DESIGN */}
      <div 
        ref={tooltipRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(15, 23, 42, 0.12)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          color: '#0f172a',
          zIndex: 9999,
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          display: tooltip.visible ? 'flex' : 'none',
          flexDirection: 'column',
          gap: '0.2rem',
          minWidth: '170px'
        }}
      >
        {tooltip.visible && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{tooltip.district}</strong>
              <span style={{ color: 'hsl(var(--accent-purple))', fontWeight: 600, fontSize: '0.7rem' }}>{tooltip.province} Cumhuriyeti</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>👥 Nüfus:</span>
              <strong style={{ color: '#0f172a' }}>
                {getDistrictMetadata(tooltip.province, tooltip.district).population.toLocaleString('tr-TR')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>🛡️ Savunma:</span>
              <strong style={{ color: '#ef4444' }}>
                {getDistrictMetadata(tooltip.province, tooltip.district).defensePower.toLocaleString('tr-TR')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ color: '#64748b' }}>🎓 Okul | 🏥 Hast.:</span>
              <strong style={{ color: '#3b82f6' }}>
                {getDistrictMetadata(tooltip.province, tooltip.district).schoolCount} | {getDistrictMetadata(tooltip.province, tooltip.district).hospitalCount}
              </strong>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export const InteractiveMap = React.memo(InteractiveMapComponent);
