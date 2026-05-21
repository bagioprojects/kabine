import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  PanResponder,
  Animated
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Polygon,
  G,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Line,
  Image as SvgImage
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createStyles } from '../styles/screens/CityScreen.styles';
import { DISTRICTS } from '../data/locationData';
import axiosClient, { BASE_URL } from '../api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getBuildingParams = (buildingId: string, ry: number) => {
  switch (buildingId) {
    case 'city_hall':
      return {
        h: ry * 1.6,
        roof: '#eab308',
        right: '#facc15',
        left: '#ca8a04'
      };
    case 'finance_center':
      return {
        h: ry * 2.8,
        roof: '#0284c7',
        right: '#38bdf8',
        left: '#0369a1'
      };
    case 'industrial_zone':
      return {
        h: ry * 1.2,
        roof: '#059669',
        right: '#34d399',
        left: '#047857'
      };
    case 'media_plaza':
      return {
        h: ry * 2.0,
        roof: '#e11d48',
        right: '#fb7185',
        left: '#be123c'
      };
    case 'political_hq':
      return {
        h: ry * 1.5,
        roof: '#4f46e5',
        right: '#818cf8',
        left: '#3730a3'
      };
    case 'trade_port':
      return {
        h: ry * 1.3,
        roof: '#ea580c',
        right: '#f97316',
        left: '#c2410c'
      };
    default:
      return {
        h: ry * 1.5,
        roof: '#cbd5e1',
        right: '#e2e8f0',
        left: '#94a3b8'
      };
  }
};

/**
 * Deterministic HSL color triplet from any string (UUID, name, etc.).
 * Always returns the same result for the same input — no randomness.
 */
function deriveAssetColors(id: string): { roof: string; right: string; left: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(31, hash) + id.charCodeAt(i) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    roof:  `hsl(${hue}, 60%, 62%)`,
    right: `hsl(${hue}, 50%, 46%)`,
    left:  `hsl(${hue}, 50%, 30%)`,
  };
}

const STARTING_PROVINCES = [
  { id: 34, name: 'İstanbul', fullName: 'İstanbul Cumhuriyeti', description: 'Finans ve Küreselleşmiş Ticaret Devleti' },
  { id: 6, name: 'Ankara', fullName: 'Ankara Cumhuriyeti', description: 'Başkent ve Siyasi Bürokrasi Devleti' },
  { id: 16, name: 'Bursa', fullName: 'Bursa Cumhuriyeti', description: 'Ağır Sanayi ve Otomotiv Havzası Devleti' },
  { id: 10, name: 'Balıkesir', fullName: 'Balıkesir Cumhuriyeti', description: 'Maden Kaynakları ve Stratejik Bor Devleti' },
  { id: 35, name: 'İzmir', fullName: 'İzmir Cumhuriyeti', description: 'Serbest Liman ve Ege Deniz Ticareti Devleti' },
  { id: 7, name: 'Antalya', fullName: 'Antalya Cumhuriyeti', description: 'Küresel Turizm ve Akdeniz Tarım Devleti' },
  { id: 31, name: 'Hatay', fullName: 'Hatay Cumhuriyeti', description: 'Tarihi Lojistik ve Güney Kapısı Devleti' },
  { id: 61, name: 'Trabzon', fullName: 'Trabzon Cumhuriyeti', description: 'Deniz Ticareti ve Karadeniz Tersane Devleti' },
  { id: 42, name: 'Konya', fullName: 'Konya Cumhuriyeti', description: 'Tarım Havzası ve Hafif Alüminyum Metal Devleti' },
  { id: 1, name: 'Adana', fullName: 'Adana Cumhuriyeti', description: 'Bereketli Çukurova ve Sanayi Devleti' },
  { id: 41, name: 'Kocaeli', fullName: 'Kocaeli Cumhuriyeti', description: 'Liman Ağları ve Kimya Sanayi Devleti' }
];

// City stats mockup database
interface CityStats {
  population: string;
  security: string;
  industry: string;
  taxRevenue: string;
  politicalStability: string;
}

const CITY_STATS_DB: Record<number, CityStats> = {
  34: { population: '15.8M', security: '%72', industry: '%88', taxRevenue: '₺15.4M', politicalStability: '%64' },
  6: { population: '5.7M', security: '%89', industry: '%74', taxRevenue: '₺9.2M', politicalStability: '%81' },
  16: { population: '3.1M', security: '%82', industry: '%94', taxRevenue: '₺8.1M', politicalStability: '%73' },
  10: { population: '1.2M', security: '%85', industry: '%79', taxRevenue: '₺4.2M', politicalStability: '%76' },
  35: { population: '4.4M', security: '%78', industry: '%83', taxRevenue: '₺11.5M', politicalStability: '%68' },
  7: { population: '2.6M', security: '%80', industry: '%42', taxRevenue: '₺6.8M', politicalStability: '%70' },
  31: { population: '1.6M', security: '%65', industry: '%69', taxRevenue: '₺3.4M', politicalStability: '%59' },
  61: { population: '810K', security: '%87', industry: '%70', taxRevenue: '₺2.1M', politicalStability: '%79' },
  42: { population: '2.3M', security: '%91', industry: '%80', taxRevenue: '₺5.6M', politicalStability: '%84' },
  1: { population: '2.2M', security: '%74', industry: '%85', taxRevenue: '₺6.1M', politicalStability: '%67' },
  41: { population: '2.0M', security: '%79', industry: '%96', taxRevenue: '₺8.9M', politicalStability: '%72' },
};

interface Building {
  id: string;
  name: string;
  icon: string;
  color: string;
  stats: Record<string, string>;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  row: number; // 2x2 origin row
  col: number; // 2x2 origin col
}

type DistrictType = 'metropolitan' | 'industrial' | 'rural';

// In-Memory cache for loaded district map cells to enable instantaneous transitions
const MAP_CACHE: Record<number, any[]> = {};

export default function CityScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const safeInsets = useMemo(() => ({
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
    left: insets?.left ?? 0,
    right: insets?.right ?? 0
  }), [insets]);

  const styles = useMemo(() => createStyles(safeInsets, screenWidth, screenHeight), [safeInsets, screenWidth, screenHeight]);

  // View state: 'map' is 2D scrollable visual view, 'list' is text/stats list view
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Exact container layout dimensions from onLayout event (defaulting to screen bounds)
  const [containerDimensions, setContainerDimensions] = useState({
    width: screenWidth,
    height: screenHeight - 160
  });

  // Base canvas size definitions for our tiled isometric grid (1000x1100px)
  const baseWidth = 1000;
  const baseHeight = 1100;

  // Grid coordinates mapping parameters
  const tileWidth = 90;
  const tileHeight = 45;
  const gridRows = 10;
  const gridCols = 10;

  // Center alignment offset coordinates for the isometric diamond projection inside the 1000x1100px canvas
  const gridOffsetX = 500;
  const gridOffsetY = 160;

  // Dynamically calculate the absolute minimum zoom scale based on exact measured container height/width
  const dynamicMinScale = useMemo(() => {
    // Math.min allows the user to zoom out until the entire map (the largest side) fits on the screen
    return Math.min(
      containerDimensions.width / baseWidth,
      containerDimensions.height / baseHeight
    ) * 0.9; // 10% extra padding around the map when fully zoomed out
  }, [containerDimensions.width, containerDimensions.height]);

  // GPU-accelerated Animated values for diagonal panning and pinch zoom
  const scale = useRef(new Animated.Value(1.0)).current;
  const pan = useRef(new Animated.ValueXY({ x: -312, y: -200 })).current; // Center start horizontal/vertical

  // Real-time tracking references for gesture arithmetic
  const scaleRef = useRef<number>(1.0);
  const panRef = useRef<{ x: number; y: number }>({ x: -312, y: -200 });

  // On mount or container resize, ensure the initial position is within the new clamped boundaries
  useEffect(() => {
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      const clamped = clampPan(scaleRef.current, panRef.current.x, panRef.current.y);
      pan.setValue(clamped);
      panRef.current = clamped;
    }
  }, [containerDimensions.width, containerDimensions.height]);

  // References for multi-touch pinch calculations
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1.0);
  const lastPanRef = useRef<{ x: number; y: number }>({ x: -312, y: -200 });

  // Bind animated listeners to refs for type-safe real-time queries
  useEffect(() => {
    const scaleListenerId = scale.addListener(({ value }) => {
      scaleRef.current = value;
    });
    const panListenerId = pan.addListener((value) => {
      panRef.current = value;
    });

    return () => {
      scale.removeListener(scaleListenerId);
      pan.removeListener(panListenerId);
    };
  }, [scale, pan]);

  // Determine current active location (province & district) from database
  const activeProvinceId = user?.currentProvinceId || user?.citizenshipProvinceId || 34;
  const activeDistrictId = user?.currentDistrictId || user?.citizenshipDistrictId;

  const selectedProvince = useMemo(() => {
    return STARTING_PROVINCES.find(p => p.id === activeProvinceId) || STARTING_PROVINCES[0];
  }, [activeProvinceId]);

  // Find current district name
  const selectedDistrict = useMemo(() => {
    if (activeDistrictId) {
      const dist = DISTRICTS.find(d => d.id === activeDistrictId);
      if (dist) return dist;
    }
    // Fallback to first district of the active province
    const provinceDistricts = DISTRICTS.filter(d => d.provinceId === activeProvinceId);
    return provinceDistricts[0] || { id: 0, name: 'Merkez', provinceId: activeProvinceId };
  }, [activeProvinceId, activeDistrictId]);

  const stats = useMemo(() => {
    return CITY_STATS_DB[activeProvinceId] || CITY_STATS_DB[34];
  }, [activeProvinceId]);

  // Determine the district type procedurally to render "different worlds" (farklı dünyalar)
  const districtType = useMemo<DistrictType>(() => {
    const name = selectedDistrict.name.toLowerCase();
    if (name.includes('merkez') || name.includes('çankaya') || name.includes('kadıköy') || name.includes('konak') || name.includes('beşiktaş')) {
      return 'metropolitan';
    }
    // Deterministic hash based on ID
    const id = selectedDistrict.id;
    if (id % 3 === 0) return 'industrial';
    if (id % 3 === 1) return 'rural';
    return 'metropolitan';
  }, [selectedDistrict]);

  // Dynamically set React Navigation header options to match the current district name
  React.useLayoutEffect(() => {
    if (navigation && selectedDistrict) {
      const distName = (selectedDistrict.name || 'Merkez').toUpperCase();
      navigation.setOptions({
        title: `${distName} İLÇESİ (${districtType === 'metropolitan' ? 'Metropol' : districtType === 'industrial' ? 'Sanayi' : 'Kırsal'})`,
        headerTitleAlign: 'left',
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={[
                styles.headerSwitcherBtn,
                viewMode === 'map' && styles.headerSwitcherBtnActive
              ]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.headerSwitcherText,
                viewMode === 'map' && styles.headerSwitcherTextActive
              ]}>HARİTA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerSwitcherBtn,
                viewMode === 'list' && styles.headerSwitcherBtnActive
              ]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.headerSwitcherText,
                viewMode === 'list' && styles.headerSwitcherTextActive
              ]}>LİSTE</Text>
            </TouchableOpacity>
          </View>
        )
      });
    }
  }, [navigation, selectedDistrict, viewMode, styles, districtType]);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // Handle building selection
  const handleBuildingPress = (building: Building) => {
    setSelectedBuilding(building);
  };

  // Close detail modal
  const closeDetails = () => {
    setSelectedBuilding(null);
  };

  // Actions
  const handleAction = (actionName: string, buildingName: string) => {
    Alert.alert(
      `${buildingName} Yönetimi`,
      `"${actionName}" aksiyonu başarıyla tetiklendi. Simülasyon motoru güncelleniyor.`,
      [{ text: 'Tamam' }]
    );
  };

  // Return to Karargah (Dashboard) and restore Bottom Tab Bar
  const handleBackToMenu = () => {
    navigation.navigate('Dashboard');
  };

  // Reusable helper function to clamp coordinates to stay within screen boundaries
  const clampPan = (currentScale: number, targetX: number, targetY: number) => {
    const scaledWidth = baseWidth * currentScale;
    const scaledHeight = baseHeight * currentScale;

    let clampedX = targetX;
    let clampedY = targetY;

    if (scaledWidth <= containerDimensions.width) {
      // Map is smaller than container width, center it horizontally
      clampedX = (containerDimensions.width - scaledWidth) / 2;
    } else {
      // Map is larger, restrict panning to bounds
      const minX = -(scaledWidth - containerDimensions.width);
      clampedX = Math.max(minX, Math.min(0, targetX));
    }

    if (scaledHeight <= containerDimensions.height) {
      // Map is smaller than container height, center it vertically
      clampedY = (containerDimensions.height - scaledHeight) / 2;
    } else {
      // Map is larger, restrict panning to bounds
      const minY = -(scaledHeight - containerDimensions.height);
      clampedY = Math.max(minY, Math.min(0, targetY));
    }
    
    return { x: clampedX, y: clampedY };
  };

  // 100% Native 2D Panning & Pinch Zoom Gesture Responder
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
        pinchStartScaleRef.current = scaleRef.current;
      } else {
        lastPanRef.current = { x: panRef.current.x, y: panRef.current.y };
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;

      if (touches.length === 2 && pinchStartDistRef.current !== null) {
        // 1. PINCH ZOOM SCALING
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        
        const scaleFactor = currentDist / pinchStartDistRef.current;
        const targetScale = pinchStartScaleRef.current * scaleFactor;
        
        const newScale = Math.max(dynamicMinScale, Math.min(1.3, targetScale));
        scale.setValue(newScale);

        const clampedPan = clampPan(newScale, panRef.current.x, panRef.current.y);
        pan.setValue(clampedPan);
      } else if (touches.length === 1) {
        // 2. DIAGONAL 2D PANNING
        const currentScale = scaleRef.current;
        const targetX = lastPanRef.current.x + gestureState.dx;
        const targetY = lastPanRef.current.y + gestureState.dy;

        const clamped = clampPan(currentScale, targetX, targetY);
        pan.setValue(clamped);
      }
    },
    onPanResponderRelease: () => {
      pinchStartDistRef.current = null;
      
      const currentScale = scaleRef.current;
      const clamped = clampPan(currentScale, panRef.current.x, panRef.current.y);
      pan.setValue(clamped);
      
      lastPanRef.current = { x: clamped.x, y: clamped.y };
    },
    onPanResponderTerminate: () => {
      pinchStartDistRef.current = null;
      
      const currentScale = scaleRef.current;
      const clamped = clampPan(currentScale, panRef.current.x, panRef.current.y);
      pan.setValue(clamped);

      lastPanRef.current = { x: clamped.x, y: clamped.y };
    }
  }), [pan, dynamicMinScale, containerDimensions]);

  // Interactive buildings details. They occupy a 1x1 size on grid.
  const buildings: Building[] = useMemo(() => [], []);

  // Project screen coordinate for isometric cell (r, c)
  const getIsoCoords = (r: number, c: number) => {
    const x = (c - r) * (tileWidth / 2) + gridOffsetX;
    const y = (c + r) * (tileHeight / 2) + gridOffsetY;
    return { x, y };
  };

  const [modelAssets, setModelAssets] = useState<any[]>([]);

  // Fetch model assets
  useEffect(() => {
    const fetchModelAssets = async () => {
      try {
        const res = await axiosClient.get('/maps/model-assets');
        if (res.data.success) {
          setModelAssets(res.data.data);
        }
      } catch (err) {
        console.log('Error fetching model assets configuration:', err);
      }
    };
    fetchModelAssets();
  }, []);

  const getBuildingParamsLocal = (buildingId: string | undefined | null, ry: number, cellScale?: number) => {
    if (!buildingId) {
      return { h: ry * 1.5, roof: '#cbd5e1', right: '#e2e8f0', left: '#94a3b8' };
    }
    const staticB = buildings.find(b => b.id === buildingId);
    if (staticB) {
      return getBuildingParams(buildingId, ry);
    }
    const customB = modelAssets.find(b => b.id === buildingId);
    if (customB) {
      const scaleVal = cellScale !== undefined ? cellScale : (parseFloat(customB.scale) || 1.0);
      const dynamicColors = deriveAssetColors(customB.id);
      return {
        h: ry * 1.5 * scaleVal,
        roof: dynamicColors.roof,
        right: dynamicColors.right,
        left: dynamicColors.left
      };
    }
    return getBuildingParams(buildingId, ry);
  };

  const render3DPrismSVG = (r: number, c: number, sizeX: number, sizeY: number, h: number, colors: { left: string; right: string; roof: string }) => {
    const rx = tileWidth / 2;
    const ry = tileHeight / 2;
    
    const backCoords = getIsoCoords(r, c);
    const leftCoords = getIsoCoords(r + sizeY - 1, c);
    const rightCoords = getIsoCoords(r, c + sizeX - 1);
    const frontCoords = getIsoCoords(r + sizeY - 1, c + sizeX - 1);

    const bx = backCoords.x;
    const by = backCoords.y;
    const lx = leftCoords.x;
    const ly = leftCoords.y;
    const rx_val = rightCoords.x;
    const ry_val = rightCoords.y;
    const fx = frontCoords.x;
    const fy = frontCoords.y;

    const pointsLeft = `${lx - rx},${ly} ${fx},${fy + ry} ${fx},${fy + ry - h} ${lx - rx},${ly - h}`;
    const pointsRight = `${fx},${fy + ry} ${rx_val + rx},${ry_val} ${rx_val + rx},${ry_val - h} ${fx},${fy + ry - h}`;
    const pointsRoof = `${bx},${by - ry - h} ${rx_val + rx},${ry_val - h} ${fx},${fy + ry - h} ${lx - rx},${ly - h}`;

    return (
      <G key={`building-prism-${r}-${c}`}>
        <Polygon points={pointsLeft} fill={colors.left} />
        <Polygon points={pointsRight} fill={colors.right} />
        <Polygon points={pointsRoof} fill={colors.roof} />
      </G>
    );
  };

  // Deterministic LCG random generator based on district ID seed to generate reproducible custom worlds
  const makeRandom = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };

  const [gridCells, setGridCells] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);

  const getBuildingPivotToRenderAt = (r: number, c: number) => {
    return gridCells.find(cell => {
      if (cell.type !== 'building' || !cell.isBuildingPivot || !cell.buildingId) return false;
      const bAsset = modelAssets.find(a => a.id === cell.buildingId);
      let sizeX = cell.sizeX || bAsset?.gridSizeX || 1;
      let sizeY = cell.sizeY || bAsset?.gridSizeY || 1;
      
      return (cell.row + sizeY - 1 === r) && (cell.col + sizeX - 1 === c);
    });
  };

  const webViewHtml = useMemo(() => {
    const glbBuildings = gridCells.filter(cell => {
      if (cell.type !== 'building' || !cell.isBuildingPivot || !cell.buildingId) return false;
      const bAsset = modelAssets.find(a => a.id === cell.buildingId);
      return bAsset && bAsset.modelType === 'glb';
    });

    if (glbBuildings.length === 0) {
      return `<!DOCTYPE html><html><body style="background:transparent;margin:0;padding:0;"></body></html>`;
    }

    const rx = tileWidth / 2;
    const ry = tileHeight / 2;

    const elementsHtml = glbBuildings.map(cell => {
      const bAsset = modelAssets.find(a => a.id === cell.buildingId)!;
      
      const rotVal = cell.buildingRotation || 0;
      const isSwapped = rotVal === 90 || rotVal === 270;
      const defaultSizeX = cell.sizeX ?? (isSwapped ? bAsset.gridSizeY : bAsset.gridSizeX);
      const defaultSizeY = cell.sizeY ?? (isSwapped ? bAsset.gridSizeX : bAsset.gridSizeY);
      const sizeX = Math.max(1, defaultSizeX);
      const sizeY = Math.max(1, defaultSizeY);
      
      const left  = getIsoCoords(cell.row + sizeY - 1,  cell.col);
      const right = getIsoCoords(cell.row,              cell.col + sizeX - 1);

      const foLeft   = left.x  - rx;
      const foRight  = right.x + rx;

      const centerX  = (foLeft + foRight) / 2;
      const centerY  = (left.y + right.y) / 2;

      const containerW = foRight - foLeft;
      const containerH = 4000;

      const posX = centerX - containerW / 2;
      const posY = centerY - containerH / 2;

      const scaleVal = cell.scale ?? bAsset.scale ?? 1;
      const scaleX = cell.scaleX ?? 1;
      const scaleY = cell.scaleY ?? 1;
      const scaleZ = cell.scaleZ ?? 1;

      const fileUrlFull = resolveImageUrl(bAsset.fileUrl);
      const textureUrlFull = bAsset.textureUrl ? resolveImageUrl(bAsset.textureUrl) : '';

      return `
        <div class="model-container" style="left:${posX}px; top:${posY}px; width:${containerW}px; height:${containerH}px;">
          <model-viewer
            src="${fileUrlFull}"
            alt="${bAsset.name}"
            camera-orbit="225deg 60deg auto"
            field-of-view="5deg"
            min-field-of-view="5deg"
            max-field-of-view="5deg"
            bounds="tight"
            shadow-intensity="0"
            interaction-prompt="none"
            disable-zoom
            disable-pan
            disable-tap
            exposure="1.2"
            environment-image="neutral"
            data-rotation="${rotVal}"
            data-scale-val="${scaleVal}"
            data-scale-x="${scaleX}"
            data-scale-y="${scaleY}"
            data-scale-z="${scaleZ}"
            data-size-x="${sizeX}"
            data-size-y="${sizeY}"
            data-texture="${textureUrlFull}"
            style="width: 100%; height: 100%; display: block; background-color: transparent; --poster-color: transparent; --progress-bar-height: 0px; --progress-bar-color: transparent;"
          ></model-viewer>
        </div>
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: transparent !important;
            overflow: hidden;
          }
          .model-container {
            position: absolute;
            pointer-events: none;
            background-color: transparent !important;
          }
        </style>
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
        <script>
          const processedTexturesCache = new Map();

          function processTextureImage(url) {
            if (processedTexturesCache.has(url)) {
              return Promise.resolve(processedTexturesCache.get(url));
            }

            return new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                    resolve(url);
                    return;
                  }
                  ctx.drawImage(img, 0, 0);
                  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const data = imgData.data;

                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];

                    // Pure black shadow smoothing
                    if (r < 15 && g < 15 && b < 15) {
                      data[i] = 0;
                      data[i+1] = 0;
                      data[i+2] = 0;
                      data[i+3] = 90; // alpha approx 35%
                    }
                  }

                  ctx.putImageData(imgData, 0, 0);
                  const processedUrl = canvas.toDataURL('image/png');
                  processedTexturesCache.set(url, processedUrl);
                  resolve(processedUrl);
                } catch (err) {
                  console.error("Error processing texture image in canvas:", err);
                  resolve(url);
                }
              };
              img.onerror = () => {
                resolve(url);
              };
              img.src = url;
            });
          }

          window.addEventListener('DOMContentLoaded', () => {
            const viewers = document.querySelectorAll('model-viewer');
            viewers.forEach(viewer => {
              const rotationAngle = parseInt(viewer.getAttribute('data-rotation') || '0', 10);
              const scaleVal = parseFloat(viewer.getAttribute('data-scale-val') || '1');
              const scaleX = parseFloat(viewer.getAttribute('data-scale-x') || '1');
              const scaleY = parseFloat(viewer.getAttribute('data-scale-y') || '1');
              const scaleZ = parseFloat(viewer.getAttribute('data-scale-z') || '1');
              const sizeX = parseInt(viewer.getAttribute('data-size-x') || '1', 10);
              const sizeY = parseInt(viewer.getAttribute('data-size-y') || '1', 10);
              const textureUrl = viewer.getAttribute('data-texture');

              viewer.style.transform = 'scale(' + scaleVal + ')';
              viewer.style.transformOrigin = 'center center';
              viewer.setAttribute('scale', scaleX + ' ' + scaleY + ' ' + scaleZ);

              let dimsCalculated = false;
              let textureApplied = false;

              const applyTexture = async () => {
                if (!textureUrl) return true;
                try {
                  const materials = viewer.model?.materials;
                  if (materials && materials.length > 0) {
                    const processedUrl = await processTextureImage(textureUrl);
                    const texture = await viewer.createTexture(processedUrl);
                    for (const mat of materials) {
                      mat.setAlphaMode('BLEND');
                      if (mat.pbrMetallicRoughness?.baseColorTexture) {
                        await mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                      }
                    }
                    return true;
                  }
                } catch (err) {
                  console.error("Error applying texture in WebView:", err);
                  return true;
                }
                return false;
              };

              const computeDimensions = () => {
                if (dimsCalculated) return;
                try {
                  const center = viewer.getBoundingBoxCenter();
                  const dims = viewer.getDimensions();
                  if (center && dims && dims.x > 0 && dims.y > 0 && dims.z > 0) {
                    let baseModelWider = dims.x > dims.z;
                    let baseGridWider = sizeX > sizeY;
                    let correctedRotation = rotationAngle;
                    if (baseModelWider !== baseGridWider && dims.x !== dims.z && sizeX !== sizeY) {
                      correctedRotation = (rotationAngle + 90) % 360;
                    }

                    let worldX = center.x;
                    let worldZ = center.z;
                    if (correctedRotation === 90) {
                      worldX = -center.z;
                      worldZ = center.x;
                    } else if (correctedRotation === 180) {
                      worldX = -center.x;
                      worldZ = -center.z;
                    } else if (correctedRotation === 270) {
                      worldX = center.z;
                      worldZ = -center.x;
                    }

                    const targetX = worldX;
                    const targetY = center.y - dims.y / 2;
                    const targetZ = worldZ;
                    viewer.setAttribute('camera-target', targetX + 'm ' + targetY + 'm ' + targetZ + 'm');
                    viewer.setAttribute('orientation', '0deg 0deg ' + correctedRotation + 'deg');
                    dimsCalculated = true;
                  }
                } catch (err) {
                  // ignore
                }
              };

              const initModel = async () => {
                if (!textureApplied) {
                  textureApplied = await applyTexture();
                }
                if (!dimsCalculated) {
                  computeDimensions();
                }
              };

              viewer.addEventListener('load', initModel);
              viewer.addEventListener('scene-graph-ready', initModel);

              let interval = setInterval(() => {
                initModel();
                if ((textureApplied || !textureUrl) && dimsCalculated) {
                  clearInterval(interval);
                }
              }, 200);

              setTimeout(() => clearInterval(interval), 10000);
            });
          });
        </script>
      </head>
      <body style="background:transparent !important;">
        ${elementsHtml}
      </body>
      </html>
    `;
  }, [gridCells, modelAssets]);

  // Generate procedural grid fallback
  const generateProceduralGrid = () => {
    const cells = [];
    const rand = makeRandom(selectedDistrict.id);
    
    // Check if cell is covered by any building footprint (1x1 size)
    const getBuildingAtCell = (r: number, c: number) => {
      return buildings.find(b => r === b.row && c === b.col);
    };

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        let type: 'grass' | 'road' | 'forest' | 'building' = 'grass';
        let roadDirection: 'horizontal' | 'vertical' | 'cross' | null = null;
        let buildingData: Building | null = null;
        let isBuildingPivot = false;

        const b = getBuildingAtCell(r, c);
        if (b) {
          type = 'building';
          buildingData = b;
          isBuildingPivot = true;
        } else {
          // Road Layouts based on District Type
          if (districtType === 'metropolitan') {
            // High-density complex urban road grid
            if (r === 4 || c === 4 || r === 8 || c === 8) {
              type = 'road';
              if ((r === 4 || r === 8) && (c === 4 || c === 8)) {
                roadDirection = 'cross';
              } else if (r === 4 || r === 8) {
                roadDirection = 'horizontal';
              } else {
                roadDirection = 'vertical';
              }
            }
          } else if (districtType === 'industrial') {
            // Logistics-oriented heavy shipping roads
            if (r === 5 || c === 5) {
              type = 'road';
              if (r === 5 && c === 5) {
                roadDirection = 'cross';
              } else if (r === 5) {
                roadDirection = 'horizontal';
              } else {
                roadDirection = 'vertical';
              }
            }
          } else {
            // Rural: Single dusty winding dirt trail
            if (r === 5) {
              type = 'road';
              roadDirection = 'horizontal';
            }
          }

          // Forest & tree layout based on District Type
          if (type === 'grass') {
            const chance = rand();
            if (districtType === 'rural') {
              if (chance < 0.6) {
                type = 'forest';
              }
            } else if (districtType === 'industrial') {
              if (chance < 0.08) {
                type = 'forest';
              }
            } else {
              if (chance < 0.18) {
                type = 'forest';
              }
            }
          }
        }

        const { x, y } = getIsoCoords(r, c);

        cells.push({
          row: r,
          col: c,
          x,
          y,
          type,
          roadDirection,
          buildingId: buildingData?.id || null,
          buildingData,
          isBuildingPivot
        });
      }
    }
    return cells.sort((a, b) => (a.row + a.col) - (b.row + b.col));
  };

  // Fetch map database custom design or use procedural generator fallback with SWR caching
  useEffect(() => {
    let active = true;
    const districtId = selectedDistrict.id;

    const fetchDistrictMap = async () => {
      // 1. Check in-memory cache
      if (MAP_CACHE[districtId]) {
        if (active) {
          setGridCells(MAP_CACHE[districtId]);
          setLoadingMap(false);
        }
        // Perform background revalidation silently
        try {
          const response = await axiosClient.get(`/maps/${districtId}`);
          if (active && response.data.success && response.data.data) {
            const dbCells = response.data.data.gridCells;
            if (Array.isArray(dbCells) && dbCells.length > 0) {
              const mappedCells = dbCells.map((cell: any) => {
                const { x, y } = getIsoCoords(cell.row, cell.col);
                let buildingData = null;
                if (cell.type === 'building' && cell.buildingId) {
                  buildingData = buildings.find(b => b.id === cell.buildingId) || null;
                }
                return { ...cell, x, y, buildingData };
              });
              mappedCells.sort((a: any, b: any) => (a.row + a.col) - (b.row + b.col));
              MAP_CACHE[districtId] = mappedCells;
              await AsyncStorage.setItem(`politic_map_cache_${districtId}`, JSON.stringify(dbCells));
              if (active) {
                setGridCells(mappedCells);
              }
            }
          }
        } catch (err) {
          // Silent catch for background errors
        }
        return;
      }

      // 2. Check AsyncStorage cache
      try {
        const cachedData = await AsyncStorage.getItem(`politic_map_cache_${districtId}`);
        if (cachedData && active) {
          const parsedCells = JSON.parse(cachedData);
          if (Array.isArray(parsedCells) && parsedCells.length > 0) {
            const mappedCells = parsedCells.map((cell: any) => {
              const { x, y } = getIsoCoords(cell.row, cell.col);
              let buildingData = null;
              if (cell.type === 'building' && cell.buildingId) {
                buildingData = buildings.find(b => b.id === cell.buildingId) || null;
              }
              return { ...cell, x, y, buildingData };
            });
            mappedCells.sort((a: any, b: any) => (a.row + a.col) - (b.row + b.col));
            
            MAP_CACHE[districtId] = mappedCells;
            setGridCells(mappedCells);
            setLoadingMap(false);

            // Revalidate in background
            try {
              const response = await axiosClient.get(`/maps/${districtId}`);
              if (active && response.data.success && response.data.data) {
                const dbCells = response.data.data.gridCells;
                if (Array.isArray(dbCells) && dbCells.length > 0) {
                  const updatedMapped = dbCells.map((cell: any) => {
                    const { x, y } = getIsoCoords(cell.row, cell.col);
                    let bData = null;
                    if (cell.type === 'building' && cell.buildingId) {
                      bData = buildings.find(b => b.id === cell.buildingId) || null;
                    }
                    return { ...cell, x, y, buildingData: bData };
                  });
                  updatedMapped.sort((a: any, b: any) => (a.row + a.col) - (b.row + b.col));
                  MAP_CACHE[districtId] = updatedMapped;
                  await AsyncStorage.setItem(`politic_map_cache_${districtId}`, JSON.stringify(dbCells));
                  if (active) {
                    setGridCells(updatedMapped);
                  }
                }
              }
            } catch (err) {
              // Silent background error
            }
            return;
          }
        }
      } catch (err) {
        console.log('AsyncStorage map cache read error', err);
      }

      // 3. Network Fetch fallback
      if (active) {
        setLoadingMap(true);
      }

      try {
        const response = await axiosClient.get(`/maps/${districtId}`);
        if (active && response.data.success && response.data.data) {
          const dbCells = response.data.data.gridCells;
          if (Array.isArray(dbCells) && dbCells.length > 0) {
            const mappedCells = dbCells.map((cell: any) => {
              const { x, y } = getIsoCoords(cell.row, cell.col);
              let buildingData = null;
              if (cell.type === 'building' && cell.buildingId) {
                buildingData = buildings.find(b => b.id === cell.buildingId) || null;
              }
              return { ...cell, x, y, buildingData };
            });
            mappedCells.sort((a: any, b: any) => (a.row + a.col) - (b.row + b.col));
            
            MAP_CACHE[districtId] = mappedCells;
            await AsyncStorage.setItem(`politic_map_cache_${districtId}`, JSON.stringify(dbCells));
            
            if (active) {
              setGridCells(mappedCells);
              setLoadingMap(false);
            }
            return;
          }
        }
      } catch (err: any) {
        console.log('No custom map layout found or error, using procedural fallback.', err.message);
      }

      if (active) {
        const procedural = generateProceduralGrid();
        MAP_CACHE[districtId] = procedural;
        setGridCells(procedural);
        setLoadingMap(false);
      }
    };

    fetchDistrictMap();

    return () => {
      active = false;
    };
  }, [selectedDistrict.id, buildings, districtType]);

  // Dynamic active buildings placed on the map
  const activeBuildings = useMemo<Building[]>(() => {
    if (gridCells && gridCells.length > 0) {
      const found: Building[] = [];
      gridCells.forEach(cell => {
        if (cell.type === 'building' && cell.isBuildingPivot && cell.buildingId) {
          const staticB = buildings.find(b => b.id === cell.buildingId);
          if (staticB) {
            found.push({
              ...staticB,
              row: cell.row,
              col: cell.col
            });
          } else {
            const customB = modelAssets.find(ma => ma.id === cell.buildingId);
            found.push({
              id: cell.buildingId,
              name: customB?.name || 'Özel Model Yapısı',
              icon: '🏢',
              color: '#a855f7',
              stats: { 'Kategori': customB?.category?.name || 'Özel Yapı' },
              description: 'Sistem yöneticisi tarafından haritaya yerleştirilmiş özel 3D model binası.',
              primaryAction: 'Yönetim Konsolu',
              secondaryAction: 'Bilgi Al',
              row: cell.row,
              col: cell.col
            });
          }
        }
      });
      return found;
    }
    return [];
  }, [gridCells, modelAssets, buildings]);

  return (
    <View style={styles.container}>
      {/* Floating Slim Stats Bar below Header */}
      <View style={styles.statsBar}>
        <View style={styles.statsBarPill}>
          <Text style={styles.statsBarPillText}>{selectedProvince.fullName.toUpperCase()}</Text>
        </View>

        <View style={styles.compactStatsRow}>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatLabel}>Nüf:</Text>
            <Text style={styles.compactStatValue}>{stats.population}</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatLabel}>Güv:</Text>
            <Text style={[styles.compactStatValue, { color: '#10b981' }]}>{stats.security}</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatLabel}>İst:</Text>
            <Text style={styles.compactStatValue}>{stats.politicalStability}</Text>
          </View>
        </View>
      </View>

      {/* VIEW A: 2D SCROLLABLE MAP VIEW MODE */}
      {viewMode === 'map' && (
        loadingMap ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070f1e' }}>
            <Text style={{ color: '#38bdf8', fontSize: 16, fontWeight: 'bold' }}>Bölge Haritası Yükleniyor...</Text>
          </View>
        ) : (
          <View 
            {...panResponder.panHandlers}
            onLayout={(event) => {
              const { width: w, height: h } = event.nativeEvent.layout;
              setContainerDimensions({ width: w, height: h });
            }}
            style={{ flex: 1, overflow: 'hidden', backgroundColor: '#070f1e' }} // Space-age cyber base
          >
            {/* Animated Map View running fully on native UI thread at 60fps */}
            <Animated.View style={{
              width: baseWidth,
              height: baseHeight,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: scale }
              ]
            }}>
              
              {/* Dynamic Vector Isometric Render Canvas */}
              <Svg width={baseWidth} height={baseHeight} style={{ position: 'absolute' }}>
                <Defs>
                  <LinearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={districtType === 'rural' ? '#166534' : '#15803d'} />
                    <Stop offset="100%" stopColor={districtType === 'rural' ? '#15803d' : '#22c55e'} />
                  </LinearGradient>
                  <LinearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#065f46" />
                    <Stop offset="100%" stopColor="#0d9488" />
                  </LinearGradient>
                  
                  <LinearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={districtType === 'rural' ? '#78350f' : '#1e293b'} />
                    <Stop offset="100%" stopColor={districtType === 'rural' ? '#92400e' : '#334155'} />
                  </LinearGradient>
                  
                  <LinearGradient id="cityHallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#fef08a" />
                    <Stop offset="50%" stopColor="#eab308" />
                    <Stop offset="100%" stopColor="#ca8a04" />
                  </LinearGradient>
                  <LinearGradient id="financeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#bae6fd" />
                    <Stop offset="50%" stopColor="#0284c7" />
                    <Stop offset="100%" stopColor="#0369a1" />
                  </LinearGradient>
                  <LinearGradient id="industryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#34d399" />
                    <Stop offset="50%" stopColor="#059669" />
                    <Stop offset="100%" stopColor="#064e3b" />
                  </LinearGradient>
                  <LinearGradient id="mediaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#fda4af" />
                    <Stop offset="50%" stopColor="#e11d48" />
                    <Stop offset="100%" stopColor="#9f1239" />
                  </LinearGradient>
                  <LinearGradient id="politicsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#c7d2fe" />
                    <Stop offset="50%" stopColor="#4f46e5" />
                    <Stop offset="100%" stopColor="#312e81" />
                  </LinearGradient>
                  <LinearGradient id="marketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#ffedd5" />
                    <Stop offset="50%" stopColor="#ea580c" />
                    <Stop offset="100%" stopColor="#9a3412" />
                  </LinearGradient>
                </Defs>

                {/* Render Grid Cells sorted Y-depth */}
                {/* PASS 1: GROUND TILES */}
                {gridCells.map((cell) => {
                  const rx = tileWidth / 2;
                  const ry = tileHeight / 2;
                  const points = `${cell.x},${cell.y - ry} ${cell.x + rx},${cell.y} ${cell.x},${cell.y + ry} ${cell.x - rx},${cell.y}`;

                  return (
                    <G key={`cell-ground-${cell.row}-${cell.col}`}>
                      {cell.type === 'road' ? (
                        <G>
                          <Polygon points={points} fill="url(#roadGrad)" stroke={districtType === 'rural' ? '#451a03' : '#0f172a'} strokeWidth={0.5} />
                          {/* Center stripes depending on road link direction */}
                          {cell.roadDirection === 'horizontal' && (
                            <Path
                              d={`M ${cell.x - rx / 2} ${cell.y - ry / 2} L ${cell.x + rx / 2} ${cell.y + ry / 2}`}
                              stroke={districtType === 'rural' ? '#d97706' : '#ffffff'}
                              strokeWidth={1.2}
                              strokeDasharray={districtType === 'rural' ? undefined : "3,3"}
                            />
                          )}
                          {cell.roadDirection === 'vertical' && (
                            <Path
                              d={`M ${cell.x + rx / 2} ${cell.y - ry / 2} L ${cell.x - rx / 2} ${cell.y + ry / 2}`}
                              stroke={districtType === 'rural' ? '#d97706' : '#ffffff'}
                              strokeWidth={1.2}
                              strokeDasharray={districtType === 'rural' ? undefined : "3,3"}
                            />
                          )}
                          {cell.roadDirection === 'cross' && (
                            <G>
                              <Path d={`M ${cell.x - rx / 2} ${cell.y - ry / 2} L ${cell.x + rx / 2} ${cell.y + ry / 2}`} stroke={districtType === 'rural' ? '#b45309' : '#e2e8f0'} strokeWidth={1} />
                              <Path d={`M ${cell.x + rx / 2} ${cell.y - ry / 2} L ${cell.x - rx / 2} ${cell.y + ry / 2}`} stroke={districtType === 'rural' ? '#b45309' : '#e2e8f0'} strokeWidth={1} />
                            </G>
                          )}
                        </G>
                      ) : cell.type === 'building' ? (
                        <Polygon points={points} fill="#334155" stroke="#475569" strokeWidth={0.5} />
                      ) : (
                        // Standard Grass or Forest base tile
                        <Polygon points={points} fill={cell.type === 'forest' ? 'url(#forestGrad)' : 'url(#grassGrad)'} stroke={cell.type === 'forest' ? '#064e3b' : '#14532d'} strokeWidth={0.5} />
                      )}
                    </G>
                  );
                })}

                {/* PASS 2: HEIGHT ENTITIES & BUILDINGS */}
                {gridCells.map((cell) => {
                  const rx = tileWidth / 2;
                  const ry = tileHeight / 2;

                  return (
                    <G key={`cell-height-${cell.row}-${cell.col}`}>
                      {/* DRAW DECORATIVE ELEMENT LAYER (FORESTS & TREES) */}
                      {cell.type === 'forest' && (
                        <G>
                          {/* Shadow base for tree */}
                          <Ellipse cx={cell.x} cy={cell.y + 4} rx={10} ry={5} fill="rgba(0, 0, 0, 0.3)" />
                          {/* Wooden trunk */}
                          <Rect x={cell.x - 2} y={cell.y - 12} width={4} height={12} fill="#78350f" />
                          {/* Green Canopy (Overlapping Triangles for detailed Pine tree style) */}
                          <Polygon points={`${cell.x},${cell.y - 32} ${cell.x - 10},${cell.y - 12} ${cell.x + 10},${cell.y - 12}`} fill="#064e3b" />
                          <Polygon points={`${cell.x},${cell.y - 42} ${cell.x - 8},${cell.y - 20} ${cell.x + 8},${cell.y - 20}`} fill="#047857" />
                          <Polygon points={`${cell.x},${cell.y - 48} ${cell.x - 6},${cell.y - 28} ${cell.x + 6},${cell.y - 28}`} fill="#10b981" />
                          
                          {/* Smaller secondary oak-style tree for variety */}
                          <G transform="translate(14, -6)">
                            <Ellipse cx={cell.x - 28} cy={cell.y + 2} rx={7} ry={3.5} fill="rgba(0,0,0,0.3)" />
                            <Rect x={cell.x - 29} y={cell.y - 9} width={2} height={9} fill="#451a03" />
                            <Circle cx={cell.x - 28} cy={cell.y - 16} r={8} fill="#065f46" />
                            <Circle cx={cell.x - 25} cy={cell.y - 20} r={6} fill="#059669" />
                            <Circle cx={cell.x - 30} cy={cell.y - 18} r={5} fill="#34d399" />
                          </G>
                        </G>
                      )}

                      {/* DRAW DYNAMIC 3D BUILDINGS LAYER */}
                      {(() => {
                        const buildingPivot = getBuildingPivotToRenderAt(cell.row, cell.col);
                        if (!buildingPivot) return null;
                        
                        const params = getBuildingParamsLocal(buildingPivot.buildingId, ry, buildingPivot.scale);
                        const bAsset = modelAssets.find(a => a.id === buildingPivot.buildingId);
                        if (bAsset && bAsset.modelType === 'glb') {
                          return null;
                        }
                        
                        let sizeX = buildingPivot.sizeX || bAsset?.gridSizeX || 1;
                        let sizeY = buildingPivot.sizeY || bAsset?.gridSizeY || 1;
                        const hasSprite = !!bAsset?.thumbnailUrl;

                        return (
                          <G>
                            {hasSprite ? (
                              (() => {
                                const frontCoords = getIsoCoords(buildingPivot.row + sizeY - 1, buildingPivot.col + sizeX - 1);
                                const bottomX = frontCoords.x;
                                const bottomY = frontCoords.y + ry;
                                const imageWidth = (sizeX + sizeY) * (tileWidth / 2) * 1.5;
                                const imageHeight = imageWidth; // Assume square isometric sprites

                                return (
                                  <SvgImage
                                    href={{ uri: resolveImageUrl(bAsset.thumbnailUrl) }}
                                    x={bottomX - imageWidth / 2}
                                    y={bottomY - imageHeight}
                                    width={imageWidth}
                                    height={imageHeight}
                                    preserveAspectRatio="xMidYMax meet"
                                  />
                                );
                              })()
                            ) : (
                              <G>
                                {render3DPrismSVG(buildingPivot.row, buildingPivot.col, sizeX, sizeY, params.h, params)}

                            {buildingPivot.buildingId === 'city_hall' && (
                              <G>
                                <Ellipse cx={cell.x} cy={cell.y - params.h} rx={rx * 0.3} ry={ry * 0.3} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
                                <Line x1={cell.x} y1={cell.y - params.h} x2={cell.x} y2={cell.y - params.h - 6} stroke="#ca8a04" strokeWidth={1} />
                              </G>
                            )}

                            {buildingPivot.buildingId === 'finance_center' && (
                              <G opacity={0.6}>
                                <Line x1={cell.x - rx * 0.3} y1={cell.y - params.h * 0.4} x2={cell.x - rx * 0.3} y2={cell.y - params.h * 0.8} stroke="#38bdf8" strokeWidth={1} strokeDasharray="2,2" />
                                <Line x1={cell.x - rx * 0.6} y1={cell.y - params.h * 0.3} x2={cell.x - rx * 0.6} y2={cell.y - params.h * 0.7} stroke="#38bdf8" strokeWidth={1} strokeDasharray="2,2" />
                                <Line x1={cell.x + rx * 0.3} y1={cell.y - params.h * 0.4} x2={cell.x + rx * 0.3} y2={cell.y - params.h * 0.8} stroke="#38bdf8" strokeWidth={1} strokeDasharray="2,2" />
                                <Line x1={cell.x + rx * 0.6} y1={cell.y - params.h * 0.3} x2={cell.x + rx * 0.6} y2={cell.y - params.h * 0.7} stroke="#38bdf8" strokeWidth={1} strokeDasharray="2,2" />
                              </G>
                            )}

                            {buildingPivot.buildingId === 'media_plaza' && (
                              <G>
                                <Line x1={cell.x} y1={cell.y - params.h} x2={cell.x} y2={cell.y - params.h - 16} stroke="#ffffff" strokeWidth={1.5} />
                                <Circle cx={cell.x} cy={cell.y - params.h - 16} r={2} fill="#e11d48" />
                              </G>
                            )}

                            {buildingPivot.buildingId === 'industrial_zone' && (
                              <G>
                                <Rect x={cell.x - 3} y={cell.y - params.h - 8} width={2.5} height={8} fill="#94a3b8" />
                                <Ellipse cx={cell.x - 1.75} cy={cell.y - params.h - 8} rx={1.25} ry={0.6} fill="#047857" />
                              </G>
                            )}

                            {buildingPivot.buildingId === 'political_hq' && (
                              <G opacity={0.7}>
                                <Line x1={cell.x - rx * 0.2} y1={cell.y + ry * 0.2 - params.h * 0.3} x2={cell.x - rx * 0.2} y2={cell.y + ry * 0.2 - params.h * 0.7} stroke="#ffffff" strokeWidth={1.2} />
                                <Line x1={cell.x - rx * 0.5} y1={cell.y + ry * 0.5 - params.h * 0.3} x2={cell.x - rx * 0.5} y2={cell.y + ry * 0.5 - params.h * 0.7} stroke="#ffffff" strokeWidth={1.2} />
                                <Line x1={cell.x + rx * 0.2} y1={cell.y + ry * 0.2 - params.h * 0.3} x2={cell.x + rx * 0.2} y2={cell.y + ry * 0.2 - params.h * 0.7} stroke="#ffffff" strokeWidth={1.2} />
                              </G>
                            )}

                            {buildingPivot.buildingId === 'trade_port' && (
                              <G>
                                <Polygon points={`${cell.x - rx * 0.4},${cell.y - params.h * 0.5} ${cell.x + rx * 0.4},${cell.y - params.h * 0.5} ${cell.x},${cell.y - params.h * 0.2}`} fill="#fbbf24" opacity={0.8} />
                              </G>
                            )}
                              </G>
                            )}
                          </G>
                        );
                      })()}
                    </G>
                  );
                })}
              </Svg>

              <WebView
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: baseWidth,
                  height: baseHeight,
                  backgroundColor: 'transparent',
                }}
                transparent={true}
                opaque={false}
                originWhitelist={['*']}
                source={{ html: webViewHtml }}
                mixedContentMode="always"
                pointerEvents="none"
              />

              {/* INTERACTIVE CLICKABLE TOUCH OVERLAYS */}
              {activeBuildings.map((b) => {
                const isSelected = selectedBuilding?.id === b.id;
                
                const bAsset = modelAssets.find(a => a.id === b.id);
                const sizeX = bAsset?.gridSizeX || 1;
                const sizeY = bAsset?.gridSizeY || 1;

                // Find coordinates of building origin cell (back-most) and front-most cell
                const backCoords = getIsoCoords(b.row, b.col);
                const frontCoords = getIsoCoords(b.row + sizeY - 1, b.col + sizeX - 1);

                // Visual center of the multi-cell footprint
                const centerX = (backCoords.x + frontCoords.x) / 2;
                const centerY = (backCoords.y + frontCoords.y) / 2;

                // Position the footprint-sized hitbox exactly over the building structure
                const params = getBuildingParamsLocal(b.id, tileHeight / 2);
                const hitboxWidth = tileWidth * Math.max(sizeX, sizeY);
                const hitboxHeight = (tileHeight * Math.max(sizeX, sizeY)) + params.h;
                const hitTop = centerY - hitboxHeight / 2 + 10;
                const hitLeft = centerX - hitboxWidth / 2;

                return (
                  <TouchableOpacity
                    key={`hit-${b.id}`}
                    style={[
                      styles.buildingHotspot,
                      {
                        position: 'absolute',
                        top: hitTop,
                        left: hitLeft,
                        width: hitboxWidth,
                        height: hitboxHeight,
                        borderRadius: 16,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: '#38BDF8',
                        backgroundColor: 'transparent'
                      }
                    ]}
                    onPress={() => handleBuildingPress(b)}
                    activeOpacity={0.7}
                  />
                );
              })}
            </Animated.View>
          </View>
        )
      )}

      {/* VIEW B: LIST VIEW MODE */}
      {viewMode === 'list' && (
        loadingMap ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070f1e' }}>
            <Text style={{ color: '#38bdf8', fontSize: 16, fontWeight: 'bold' }}>Bölge Haritası Yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listViewContainer}
            contentContainerStyle={styles.listViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.listHeaderTitle}>Kamu Kuruluşları & Kompleksler</Text>
            
            {activeBuildings.map((building) => (
              <View key={building.id} style={styles.buildingCard}>
                <View style={[styles.cardIndicator, { backgroundColor: building.color }]} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardIcon}>{building.icon}</Text>
                      <Text style={styles.cardTitle}>{building.name}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cardBtn}
                      onPress={() => handleBuildingPress(building)}
                    >
                      <Text style={styles.cardBtnText}>YÖNET</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {building.description}
                  </Text>

                  <View style={styles.cardStatsRow}>
                    {Object.entries(building.stats).map(([label, val]) => (
                      <View key={label} style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>{label}</Text>
                        <Text style={styles.cardStatValue}>{val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )
      )}

      {/* ULTRA-PREMIUM FULL SCREEN MODAL */}
      <Modal
        visible={selectedBuilding !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetails}
      >
        {selectedBuilding && (
          <View style={styles.fullScreenModal}>
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={[styles.modalIconCircle, { borderColor: selectedBuilding.color, backgroundColor: `${selectedBuilding.color}15` }]}>
                    <Text style={styles.modalIconText}>{selectedBuilding.icon}</Text>
                  </View>
                  <Text style={styles.modalTitle} numberOfLines={1}>{selectedBuilding.name}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={closeDetails}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Contents */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalDescriptionBox}>
                  <Text style={styles.modalSectionLabel}>Bina Açıklaması</Text>
                  <Text style={styles.modalDescription}>{selectedBuilding.description}</Text>
                </View>

                <Text style={styles.modalSectionLabel}>Kurumsal Bilgiler & İstatistikler</Text>
                <View style={styles.modalStatsGrid}>
                  {Object.entries(selectedBuilding.stats).map(([label, val]) => (
                    <View key={label} style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>{label}</Text>
                      <Text style={[styles.modalStatValue, { color: selectedBuilding.color }]}>{val}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.modalActionTitle}>Kararnameler & Yönetimsel Kararlar</Text>
                <View style={styles.modalActionsBlock}>
                  <TouchableOpacity
                    style={[styles.modalBtnPrimary, { backgroundColor: selectedBuilding.color, borderColor: selectedBuilding.color }]}
                    onPress={() => handleAction(selectedBuilding.primaryAction, selectedBuilding.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.modalBtnPrimaryText,
                      { color: selectedBuilding.color === '#eab308' || selectedBuilding.color === '#ffedd5' ? '#0f172a' : '#ffffff' }
                    ]}>
                      {selectedBuilding.primaryAction.toUpperCase()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalBtnSecondary}
                    onPress={() => handleAction(selectedBuilding.secondaryAction, selectedBuilding.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnSecondaryText}>
                      {selectedBuilding.secondaryAction}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseFooterBtn}
                  onPress={closeDetails}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseFooterBtnText}>PANELLERİ KAPAT VE GERİ DÖN</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      {/* Floating Bottom Action Bar (Menu Return Button) */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToMenu}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonIcon}>◀</Text>
          <Text style={styles.backButtonText}>Karargaha Dön</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
