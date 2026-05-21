/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MapEditorCanvas  —  Isometric SVG Map Editor
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ARCHITECTURE (MVC / Component separation):
 *    MapEditorCanvas  ← this file (View)
 *    MapManager.hooks ← all state & game logic (Controller)
 *    IsoTransformer   ← coordinate math engine (Model)
 *
 *  RENDERING STRATEGY:
 *    Layer 1 (SVG base)  → grass, road, forest tiles
 *    Layer 2 (SVG)       → placed buildings  (GLB: foreignObject model-viewer)
 *    Layer 3 (SVG top)   → ghost preview (always rendered last → always on top)
 *    Layer 4 (SVG top)   → footprint hover highlight
 *
 *  PIVOT RULE (item 2):
 *    Every model's visual base is aligned to the BOTTOM-CENTER of the isometric
 *    diamond. foreignObject is sized so its BOTTOM EDGE = front-diamond Y-vertex.
 *    `camera-target="0m 0m 0m"` focuses model-viewer on the model's world origin.
 *
 *  GHOST PREVIEW (item 3):
 *    Rendered in a SEPARATE pass after sortedCells.map(), so it is ALWAYS on top.
 *    For GLB models: semi-transparent foreignObject + model-viewer (opacity 0.6).
 *    For non-GLB   : semi-transparent SVG prism (opacity 0.55).
 *    Snapping       : preview jumps cell-by-cell following hoveredCell grid coords.
 *
 *  MULTI-TILE ANCHOR (item 4):
 *    NW (top-left) corner = anchor. Footprint fills (anchor → anchor+sizeY-1, anchor+sizeX-1).
 *    Ghost footprint outline covers the FULL multi-tile area from the NW anchor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import React, { useRef, useEffect, type CSSProperties } from 'react';
import { mapManagerStyles as styles } from '../MapManager.styles';
import { GridCell, ModelAsset, BuildingParams, PickedUpItem } from '../MapManager.constants';
import { Layers, Move, RotateCw, Check, Trash2 } from 'lucide-react';
import { IsoTransformer, TileConfig } from '../../../utils/IsoTransformer';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_TILES        = new Set(['road_h', 'road_v', 'road_x', 'forest', 'grass']);

// ─── MapGLBViewer (Item 3 & Dynamic Texture Loading) ─────────────────────────

const processedTexturesCache = new Map<string, string>();

function processTextureImage(url: string): Promise<string> {
  if (processedTexturesCache.has(url)) {
    return Promise.resolve(processedTexturesCache.get(url)!);
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

        // Loop over pixels and make pure black pixels (RGB < 15) semi-transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];

          // If pixel is pure black or extremely dark
          if (r < 15 && g < 15 && b < 15) {
            // Convert to semi-transparent black
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 0;
            data[i+3] = 90; // Alpha = 90 (approx 35% opacity)
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

interface MapGLBViewerProps {
  src: string;
  alt: string;
  textureUrl: string | null;
  rotationAngle: number;
  opacity?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  sizeX: number;
  sizeY: number;
}

const MapGLBViewer: React.FC<MapGLBViewerProps> = ({
  src, alt, textureUrl, rotationAngle, opacity = 1, scale = 1, scaleX = 1, scaleY = 1, scaleZ = 1, sizeX, sizeY
}) => {
  const viewerRef = useRef<any>(null);
  const [processedTextureUrl, setProcessedTextureUrl] = React.useState<string | null>(null);
  const [modelDims, setModelDims] = React.useState<{ x: number; y: number; z: number } | null>(null);
  const [modelCenter, setModelCenter] = React.useState<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      setProcessedTextureUrl(null);
      return;
    }
    let active = true;
    processTextureImage(textureUrl).then((resUrl) => {
      if (active) {
        setProcessedTextureUrl(resUrl);
      }
    });
    return () => {
      active = false;
    };
  }, [textureUrl]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let active = true;
    let dimsCalculated = false;

    const computeDimensions = () => {
      if (dimsCalculated) return;
      try {
        const center = viewer.getBoundingBoxCenter();
        const dims = viewer.getDimensions();
        if (center && dims && dims.x > 0 && dims.y > 0 && dims.z > 0) {
          setModelCenter({ x: center.x, y: center.y, z: center.z });
          setModelDims({ x: dims.x, y: dims.y, z: dims.z });
          dimsCalculated = true;
        }
      } catch (err) {
        // ignore
      }
    };

    const applyTexture = async () => {
      try {
        const materials = viewer.model?.materials;
        if (materials && materials.length > 0) {
          // Texture sadece bir kere oluşturulsun
          const texture = processedTextureUrl ? await viewer.createTexture(processedTextureUrl) : null;
          if (!active) return false;
          
          for (const mat of materials) {
            // Şeffaflık ayarları (Ghost preview için)
            mat.setAlphaMode(opacity < 1 ? 'BLEND' : 'OPAQUE');
            
            if (texture && mat.pbrMetallicRoughness?.baseColorTexture) {
              await mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
            
            // Renk faktörünün alfa (saydamlık) kanalını güncelle
            if (mat.pbrMetallicRoughness?.baseColorFactor) {
              const c = mat.pbrMetallicRoughness.baseColorFactor;
              mat.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], opacity]);
            }
          }
          return true;
        }
      } catch (err) {
        console.error("Error applying texture in MapGLBViewer:", err);
        return true;
      }
      return false;
    };

    let pollInterval: any = null;
    let pollCount = 0;
    let textureApplied = false;

    const startPolling = (maxPolls = 20) => {
      if (pollInterval) clearInterval(pollInterval);
      pollCount = 0;
      pollInterval = setInterval(async () => {
        if (!active) {
          clearInterval(pollInterval);
          return;
        }
        
        if (!textureApplied) {
          textureApplied = await applyTexture();
        }
        
        if (!dimsCalculated) {
          computeDimensions();
        }
        
        pollCount++;
        
        if ((textureApplied || !processedTextureUrl) && dimsCalculated) {
          clearInterval(pollInterval);
        } else if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }, 100);
    };

    startPolling(50);

    const handleLoadEvent = async () => {
      startPolling(50);
      computeDimensions();
    };

    viewer.addEventListener('load', handleLoadEvent);
    viewer.addEventListener('scene-graph-ready', handleLoadEvent);

    if (viewer.loaded || (viewer.model && viewer.model.materials && viewer.model.materials.length > 0)) {
      handleLoadEvent();
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      viewer.removeEventListener('load', handleLoadEvent);
      viewer.removeEventListener('scene-graph-ready', handleLoadEvent);
    };
  }, [processedTextureUrl, src, rotationAngle]);

  const { cameraTarget, visualRotation } = React.useMemo(() => {
    if (!modelDims || !modelCenter) {
      return { cameraTarget: 'auto auto auto', visualRotation: rotationAngle };
    }

    // Otomatik Yön Düzeltmesi (Asimetrik ızgaralarda 90 derece döndürme)
    let baseModelWider = modelDims.x > modelDims.z;
    let baseGridWider = sizeX > sizeY;
    let correctedRotation = rotationAngle;
    if (baseModelWider !== baseGridWider && modelDims.x !== modelDims.z && sizeX !== sizeY) {
      correctedRotation = (rotationAngle + 90) % 360;
    }

    // World-space model pivot hesaplaması (Kaymaları önler)
    let worldX = modelCenter.x;
    let worldZ = modelCenter.z;
    if (correctedRotation === 90) {
      worldX = -modelCenter.z;
      worldZ = modelCenter.x;
    } else if (correctedRotation === 180) {
      worldX = -modelCenter.x;
      worldZ = -modelCenter.z;
    } else if (correctedRotation === 270) {
      worldX = modelCenter.z;
      worldZ = -modelCenter.x;
    }

    const targetX = worldX;
    const targetY = modelCenter.y - modelDims.y / 2;
    const targetZ = worldZ;
    const targetStr = `${targetX}m ${targetY}m ${targetZ}m`;

    return { cameraTarget: targetStr, visualRotation: correctedRotation };
  }, [modelDims, modelCenter, rotationAngle, sizeX, sizeY]);

  const orientation = `0deg 0deg ${visualRotation}deg`;
  
  // The uniform 'scale' is applied via CSS transform to avoid breaking camera auto-framing zoom.
  // The non-uniform 'scaleX', 'scaleY', 'scaleZ' are applied directly to the 3D mesh so it stretches physically.
  const meshScale = `${scaleX} ${scaleY} ${scaleZ}`;

  return (
    // @ts-ignore model-viewer web component
    <model-viewer
      key={src}
      ref={viewerRef}
      src={src}
      alt={alt}
      // auto-framing için radius "auto" bırakıldı. Yaw ve Pitch sabit (225deg, 60deg).
      camera-orbit="225deg 60deg auto"
      camera-target={cameraTarget}
      field-of-view="5deg"
      min-field-of-view="5deg"
      max-field-of-view="5deg"
      bounds="tight"
      orientation={orientation}
      scale={meshScale}
      disable-zoom
      disable-pan
      shadow-intensity="0"
      environment-image="neutral"
      exposure="1.2"
      reveal="auto"
      loading="eager"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        opacity: opacity,
        pointerEvents: 'none',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        '--poster-color': 'transparent',
        '--progress-bar-height': '0px',
        '--progress-bar-color': 'transparent',
      } as CSSProperties}
    />
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapEditorCanvasProps {
  gridSize:    number;
  tileWidth:   number;
  tileHeight:  number;
  sortedCells: GridCell[];
  activeTool:  string;
  activeTileType: string;
  activeRotation: number;
  pickedUpItem: PickedUpItem | null;
  hoveredCell: { row: number; col: number } | null;
  setHoveredCell: (v: { row: number; col: number } | null) => void;
  modelAssets: ModelAsset[];
  getIsoCoords:             (r: number, c: number) => { x: number; y: number };
  checkFootprintFit:        (cells: GridCell[], r: number, c: number, sX: number, sY: number, ignorePivot?: { row: number; col: number }) => boolean;
  getBuildingParamsLocal:   (id: string | null | undefined, ry: number) => BuildingParams;
  getBuildingPivotToRenderAt: (r: number, c: number) => GridCell | undefined;
  handleCellClick:          (r: number, c: number) => void;
  selectedCell:             GridCell | null;
  setSelectedCell:          (v: GridCell | null) => void;
  activeLayerFilter:        'all' | 'building' | 'road' | 'nature';
  setActiveLayerFilter:     (f: 'all' | 'building' | 'road' | 'nature') => void;
  rotateSelectedCell?:      () => void;
  moveSelectedCell?:        () => void;
  removeSelectedCell?:      () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MapEditorCanvas({
  gridSize, tileWidth, tileHeight,
  sortedCells, activeTool, activeTileType,
  activeRotation, pickedUpItem,
  hoveredCell, setHoveredCell,
  modelAssets,
  getIsoCoords, checkFootprintFit,
  getBuildingParamsLocal, getBuildingPivotToRenderAt,
  handleCellClick,
  selectedCell,
  setSelectedCell,
  activeLayerFilter,
  setActiveLayerFilter,
  rotateSelectedCell,
  moveSelectedCell,
  removeSelectedCell,
}: MapEditorCanvasProps) {

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hoveredBtn, setHoveredBtn] = React.useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const [svgDims, setSvgDims] = React.useState({ width: 1000, height: 700 });

  useEffect(() => {
    const updateDims = () => {
      if (svgRef.current) {
        setSvgDims({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight,
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && svgRef.current) {
      observer = new ResizeObserver(() => {
        updateDims();
      });
      observer.observe(svgRef.current);
    }
    
    const timer = setTimeout(updateDims, 100);
    
    return () => {
      window.removeEventListener('resize', updateDims);
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const viewBoxWidth = 1000;
  const viewBoxHeight = 700;

  const { scale, offsetX, offsetY } = React.useMemo(() => {
    const w = svgDims.width || viewBoxWidth;
    const h = svgDims.height || viewBoxHeight;
    const aspectSvg = viewBoxWidth / viewBoxHeight;
    const aspectClient = w / h;

    let s = 1;
    let dx = 0;
    let dy = 0;

    if (aspectClient > aspectSvg) {
      s = h / viewBoxHeight;
      dx = (w - viewBoxWidth * s) / 2;
    } else {
      s = w / viewBoxWidth;
      dy = (h - viewBoxHeight * s) / 2;
    }

    return { scale: s, offsetX: dx, offsetY: dy };
  }, [svgDims]);

  // Stop drawing when mouse is released anywhere
  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const cellMatchesFilterCanvas = React.useCallback((cell: GridCell): boolean => {
    if (activeLayerFilter === 'all') return true;
    if (activeLayerFilter === 'building') return cell.type === 'building';
    if (activeLayerFilter === 'road') return cell.type === 'road';
    if (activeLayerFilter === 'nature') return cell.type === 'forest';
    return false;
  }, [activeLayerFilter]);


  // Half-tile dimensions (tile vertex offsets)
  const rx = tileWidth  / 2;
  const ry = tileHeight / 2;

  // IsoTransformer config — single source of truth for coordinate math
  const isoConfig: TileConfig = {
    tileWidth, tileHeight, originX: 500, originY: 125, gridSize,
  };

  // ── COORDINATE HELPERS ──────────────────────────────────────────────────────

  /** SVG polygon `points` string for the footprint outline of a multi-tile building. */
  const getFootprintPoints = (r: number, c: number, sX: number, sY: number) =>
    IsoTransformer.getFootprintPoints({ row: r, col: c }, sX, sY, isoConfig);

  /**
   * PIVOT BOTTOM-CENTER (item 2):
   * Returns the foreignObject bounding box so the container's BOTTOM EDGE aligns
   * with the front-diamond vertex — the model's visual base sits on the grid.
   *
   *   ┌──────────────────────┐  ← fo.y  (top)
   *   │   model-viewer       │
   *   │   (3D model body)    │
   *   │          ╱ ╲         │
   *   │         ╱ △ ╲        │  ← footprint diamond center
   *   └────────╱─────╲───────┘  ← fo.y + fo.height = front diamond bottom vertex
   */
  const getGLBViewerBounds = (
    pivotRow: number, pivotCol: number,
    sizeX: number, sizeY: number,
    _buildingPrismH?: number,
  ) => {
    const left  = getIsoCoords(pivotRow + sizeY - 1,  pivotCol);
    const right = getIsoCoords(pivotRow,              pivotCol + sizeX - 1);

    // Footprint horizontal extents
    const foLeft   = left.x  - rx;
    const foRight  = right.x + rx;

    // Center of the footprint diamond
    const centerX  = (foLeft + foRight) / 2;
    const centerY  = (left.y + right.y) / 2;

    // TAM SIĞDIRMA KURALI (FOOLPROOF FIT):
    // Modelin piksel genişliği tam olarak footprint genişliğine eşitlenir.
    const containerW = foRight - foLeft;
    // Yükseklik devasa bırakılır ki auto-framing yüksekliği sınır olarak alıp modeli küçültmesin.
    const containerH = 4000;

    return {
      x:      centerX - containerW / 2,
      y:      centerY - containerH / 2,
      width:  containerW,
      height: containerH,
    };
  };

  // ── SVG PRISM RENDERER (fallback for non-GLB, also used for ghost prism) ───

  const renderSVGPrism = (
    pivotRow: number, pivotCol: number,
    sizeX: number, sizeY: number,
    h: number,
    colors: { left: string; right: string; roof: string },
  ) => {
    const back  = getIsoCoords(pivotRow,             pivotCol);
    const left  = getIsoCoords(pivotRow + sizeY - 1, pivotCol);
    const right = getIsoCoords(pivotRow,             pivotCol + sizeX - 1);
    const front = getIsoCoords(pivotRow + sizeY - 1, pivotCol + sizeX - 1);

    const pLeft  = `${left.x - rx},${left.y} ${front.x},${front.y + ry} ${front.x},${front.y + ry - h} ${left.x - rx},${left.y - h}`;
    const pRight = `${front.x},${front.y + ry} ${right.x + rx},${right.y} ${right.x + rx},${right.y - h} ${front.x},${front.y + ry - h}`;
    const pRoof  = `${back.x},${back.y - ry - h} ${right.x + rx},${right.y - h} ${front.x},${front.y + ry - h} ${left.x - rx},${left.y - h}`;

    return (
      <g>
        <polygon points={pLeft}  fill={colors.left}  />
        <polygon points={pRight} fill={colors.right} />
        <polygon points={pRoof}  fill={colors.roof}  />
        {/* Subtle edge highlights for depth */}
        <polyline
          points={`${left.x - rx},${left.y - h} ${front.x},${front.y + ry - h} ${right.x + rx},${right.y - h}`}
          fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={0.6}
        />
        <polyline
          points={`${front.x},${front.y + ry} ${front.x},${front.y + ry - h}`}
          fill="none" stroke="rgba(0,0,0,0.30)" strokeWidth={0.6}
        />
      </g>
    );
  };

  // ── DERIVED VALUES ──────────────────────────────────────────────────────────

  /** Active tile's footprint size (swapped if rotated 90/270) */
  const activeTileSize = (() => {
    let assetId = activeTileType;
    let rot = activeRotation;
    if (activeTool === 'move' && pickedUpItem && pickedUpItem.type === 'building') {
      assetId = pickedUpItem.buildingId || '';
      rot = pickedUpItem.buildingRotation || 0;
    }
    const asset = modelAssets.find(a => a.id === assetId);
    if (!asset) return { x: 1, y: 1 };
    
    const isSwapped = rot === 90 || rot === 270;
    return {
      x: Math.max(1, isSwapped ? asset.gridSizeY : asset.gridSizeX),
      y: Math.max(1, isSwapped ? asset.gridSizeX : asset.gridSizeY),
    };
  })();

  const getCellFootprint = (r: number, c: number) => {
    const cell = sortedCells.find(cl => cl.row === r && cl.col === c);
    if (!cell) return null;
    if (cell.type === 'building' && cell.buildingId) {
      const pivotR = cell.buildingAnchor?.row ?? r;
      const pivotC = cell.buildingAnchor?.col ?? c;
      const pivotCell = sortedCells.find(cl => cl.row === pivotR && cl.col === pivotC);
      const bAsset = modelAssets.find(a => a.id === cell.buildingId);
      if (pivotCell && bAsset) {
        const rotVal = pivotCell.buildingRotation || 0;
        const isSwapped = rotVal === 90 || rotVal === 270;
        
        const defaultSizeX = pivotCell.sizeX ?? (isSwapped ? bAsset.gridSizeY : bAsset.gridSizeX);
        const defaultSizeY = pivotCell.sizeY ?? (isSwapped ? bAsset.gridSizeX : bAsset.gridSizeY);
        
        const sizeX = Math.max(1, defaultSizeX);
        const sizeY = Math.max(1, defaultSizeY);
        return { row: pivotR, col: pivotC, sizeX, sizeY };
      }
    }
    return { row: r, col: c, sizeX: 1, sizeY: 1 };
  };

  /**
   * GHOST PREVIEW / SNAPPING (item 3):
   * Whether the entire NW-anchored footprint fits within the grid at hoveredCell.
   */
  const hoveredFootprintFits =
    hoveredCell != null &&
    activeTool === 'place' &&
    checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, activeTileSize.x, activeTileSize.y);

  interface OverlayItem {
    id: string;
    row: number;
    col: number;
    sizeX: number;
    sizeY: number;
    height: number;
    rotation: number;
    fileUrl: string;
    textureUrl: string | null;
    name: string;
    scale: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
    opacity?: number;
    isGhost?: boolean;
  }

  const overlayItems = React.useMemo<OverlayItem[]>(() => {
    const items: OverlayItem[] = [];

    // 1. Yerleştirilmiş GLB binalarını ekle
    sortedCells.forEach(cell => {
      if (!cell.isBuildingPivot || !cell.buildingId || cell.type !== 'building') return;
      const bAsset = modelAssets.find(a => a.id === cell.buildingId);
      if (!bAsset || bAsset.modelType !== 'glb') return;

      const params = getBuildingParamsLocal(cell.buildingId, ry);
      const rotVal = cell.buildingRotation || 0;
      const isSwapped = rotVal === 90 || rotVal === 270;
      
      // cell.sizeX/Y are absolute grid dimensions set by user.
      // bAsset.gridSizeX/Y are unrotated model dimensions, so we swap them if rotated.
      const defaultSizeX = cell.sizeX ?? (isSwapped ? bAsset.gridSizeY : bAsset.gridSizeX);
      const defaultSizeY = cell.sizeY ?? (isSwapped ? bAsset.gridSizeX : bAsset.gridSizeY);
      
      const sizeX = Math.max(1, defaultSizeX);
      const sizeY = Math.max(1, defaultSizeY);
      
      const currentScale = cell.scale ?? bAsset.scale ?? 1;

      items.push({
        id: `model-${cell.row}-${cell.col}`,
        row: cell.row,
        col: cell.col,
        sizeX,
        sizeY,
        height: params.h,
        rotation: rotVal,
        fileUrl: bAsset.fileUrl,
        textureUrl: bAsset.textureUrl,
        name: bAsset.name,
        scale: currentScale,
        scaleX: cell.scaleX,
        scaleY: cell.scaleY,
        scaleZ: cell.scaleZ,
        opacity: 1,
      });
    });

    // 2. Ghost preview (Place veya Move durumunda)
    if (hoveredCell) {
      if (activeTool === 'place') {
        const ghostAsset = modelAssets.find(a => a.id === activeTileType);
        if (ghostAsset && ghostAsset.modelType === 'glb') {
          const params = getBuildingParamsLocal(activeTileType, ry);
          const rotVal = activeRotation;
          const isSwapped = rotVal === 90 || rotVal === 270;
          const sizeX = Math.max(1, isSwapped ? ghostAsset.gridSizeY : ghostAsset.gridSizeX);
          const sizeY = Math.max(1, isSwapped ? ghostAsset.gridSizeX : ghostAsset.gridSizeY);
          const fits = checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, sizeX, sizeY);

          items.push({
            id: 'ghost-place',
            row: hoveredCell.row,
            col: hoveredCell.col,
            sizeX,
            sizeY,
            height: params.h,
            rotation: rotVal,
            fileUrl: ghostAsset.fileUrl,
            textureUrl: ghostAsset.textureUrl,
            name: ghostAsset.name,
            scale: ghostAsset.scale || 1,
            opacity: fits ? 0.6 : 0.35,
            isGhost: true,
          });
        }
      } else if (activeTool === 'move' && pickedUpItem && pickedUpItem.type === 'building' && pickedUpItem.buildingId) {
        const ghostAsset = modelAssets.find(a => a.id === pickedUpItem.buildingId);
        if (ghostAsset && ghostAsset.modelType === 'glb') {
          const params = getBuildingParamsLocal(pickedUpItem.buildingId, ry);
          const rotVal = pickedUpItem.buildingRotation || 0;
          const isSwapped = rotVal === 90 || rotVal === 270;
          const sizeX = Math.max(1, isSwapped ? ghostAsset.gridSizeY : ghostAsset.gridSizeX);
          const sizeY = Math.max(1, isSwapped ? ghostAsset.gridSizeX : ghostAsset.gridSizeY);
          
          // TAŞIMA HATASI (SLIP FIX): Tıklanan (tutan) nokta pivot değilse, hayaleti (ghost) offsetle.
          const ghostRow = hoveredCell.row - (pickedUpItem.clickOffset?.row || 0);
          const ghostCol = hoveredCell.col - (pickedUpItem.clickOffset?.col || 0);
          
          const fits = checkFootprintFit(sortedCells, ghostRow, ghostCol, sizeX, sizeY, pickedUpItem.originalPivot);

          items.push({
            id: 'ghost-move',
            row: ghostRow,
            col: ghostCol,
            sizeX,
            sizeY,
            height: params.h,
            rotation: rotVal,
            fileUrl: ghostAsset.fileUrl,
            textureUrl: ghostAsset.textureUrl,
            name: ghostAsset.name,
            scale: ghostAsset.scale || 1,
            opacity: fits ? 0.6 : 0.35,
            isGhost: true,
          });
        }
      }
    }

    // 3. Sıralama: Derinliğe göre (arkadan öne)
    return items.sort((a, b) => {
      const depthA = (a.row + a.sizeY - 1) + (a.col + a.sizeX - 1);
      const depthB = (b.row + b.sizeY - 1) + (b.col + b.sizeX - 1);
      if (depthA !== depthB) return depthA - depthB;
      return (a.col + a.sizeX - 1) - (b.col + b.sizeX - 1);
    });
  }, [sortedCells, modelAssets, hoveredCell, activeTool, activeTileType, activeRotation, pickedUpItem, checkFootprintFit, ry]);

  // ── GHOST PREVIEW RENDERER ─────────────────────────────────────────────────
  // Rendered AFTER sortedCells.map() so it's always on top (correct z-order).

  const renderGhostPreview = () => {
    if (!hoveredCell) return null;

    // ── PLACE TOOL GHOST PREVIEW ──
    if (activeTool === 'place') {
      const { x, y } = getIsoCoords(hoveredCell.row, hoveredCell.col);
      const points   = `${x},${y - ry} ${x + rx},${y} ${x},${y + ry} ${x - rx},${y}`;

      // ── Base tiles (road, forest, grass) ──────────────────────────────────────
      if (BASE_TILES.has(activeTileType)) {
        const fits = checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, 1, 1);
        const fillOpacity = fits ? 0.55 : 0.45;
        return (
          <g opacity={fillOpacity} style={{ pointerEvents: 'none' }}>
            {activeTileType === 'road_h' && (
              <g>
                <polygon points={points} fill={fits ? "url(#roadGradWeb)" : "#ef4444"} stroke={fits ? "#0f172a" : "#b91c1c"} strokeWidth={0.5} />
                {fits && <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`} stroke="#fff" strokeWidth={1.5} strokeDasharray="3,3" />}
              </g>
            )}
            {activeTileType === 'road_v' && (
              <g>
                <polygon points={points} fill={fits ? "url(#roadGradWeb)" : "#ef4444"} stroke={fits ? "#0f172a" : "#b91c1c"} strokeWidth={0.5} />
                {fits && <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`} stroke="#fff" strokeWidth={1.5} strokeDasharray="3,3" />}
              </g>
            )}
            {activeTileType === 'road_x' && (
              <g>
                <polygon points={points} fill={fits ? "url(#roadGradWeb)" : "#ef4444"} stroke={fits ? "#0f172a" : "#b91c1c"} strokeWidth={0.5} />
                {fits && <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />}
                {fits && <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />}
              </g>
            )}
            {activeTileType === 'forest' && (
              <g>
                <polygon points={points} fill={fits ? "url(#forestGradWeb)" : "#ef4444"} stroke={fits ? "#064e3b" : "#b91c1c"} strokeWidth={0.5} />
                {fits && <ellipse cx={x} cy={y + 4} rx={6} ry={3} fill="rgba(0,0,0,0.3)" />}
                {fits && <rect x={x - 1} y={y - 6} width={2} height={6} fill="#78350f" />}
                {fits && <polygon points={`${x},${y - 18} ${x - 6},${y - 6} ${x + 6},${y - 6}`} fill="#064e3b" />}
              </g>
            )}
            {activeTileType === 'grass' && (
              <polygon points={points} fill="url(#grassGradWeb)" stroke="#14532d" strokeWidth={0.5} />
            )}
          </g>
        );
      }

      // ── Building ghost preview ─────────────────────────────────────────────────
      const ghostAsset = modelAssets.find(a => a.id === activeTileType);
      if (!ghostAsset) return null;
      const params = getBuildingParamsLocal(activeTileType, ry);

      const rotVal = activeRotation;
      const isSwapped = rotVal === 90 || rotVal === 270;
      const sizeX = Math.max(1, isSwapped ? ghostAsset.gridSizeY : ghostAsset.gridSizeX);
      const sizeY = Math.max(1, isSwapped ? ghostAsset.gridSizeX : ghostAsset.gridSizeY);

      // GLB model-viewer ghost (rendered in HTML overlay now, only draw red prism here if footprint doesn't fit)
      if (ghostAsset.modelType === 'glb') {
        return (
          <g style={{ pointerEvents: 'none' }}>
            {/* If footprint does not fit, overlay a glowing red prism to visually turn it red */}
            {!hoveredFootprintFits && (
              <g opacity={0.45}>
                {renderSVGPrism(
                  hoveredCell.row, hoveredCell.col,
                  sizeX, sizeY,
                  params.h,
                  { left: '#b91c1c', right: '#ef4444', roof: '#f87171' }
                )}
              </g>
            )}
          </g>
        );
      }

      // Fallback SVG prism ghost (non-GLB or footprint doesn't fit)
      const ghostOpacity = hoveredFootprintFits ? 0.55 : 0.30;
      const prismColors = hoveredFootprintFits ? params : { left: '#b91c1c', right: '#ef4444', roof: '#f87171' };
      return (
        <g opacity={ghostOpacity} style={{ pointerEvents: 'none' }}>
          {renderSVGPrism(
            hoveredCell.row, hoveredCell.col,
            sizeX, sizeY,
            params.h, prismColors,
          )}
        </g>
      );
    }

    // ── MOVE TOOL GHOST PREVIEW ──
    if (activeTool === 'move' && pickedUpItem) {
      if (pickedUpItem.type === 'building' && pickedUpItem.buildingId) {
        const ghostAsset = modelAssets.find(a => a.id === pickedUpItem.buildingId);
        if (!ghostAsset) return null;
        const params = getBuildingParamsLocal(pickedUpItem.buildingId, ry);

        const rotVal = pickedUpItem.buildingRotation || 0;
        const isSwapped = rotVal === 90 || rotVal === 270;
        const sizeX = Math.max(1, isSwapped ? ghostAsset.gridSizeY : ghostAsset.gridSizeX);
        const sizeY = Math.max(1, isSwapped ? ghostAsset.gridSizeX : ghostAsset.gridSizeY);

        const fits = checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, sizeX, sizeY, pickedUpItem.originalPivot);

        if (ghostAsset.modelType === 'glb') {
          return (
            <g style={{ pointerEvents: 'none' }}>
              {!fits && (
                <g opacity={0.45}>
                  {renderSVGPrism(
                    hoveredCell.row, hoveredCell.col,
                    sizeX, sizeY,
                    params.h,
                    { left: '#b91c1c', right: '#ef4444', roof: '#f87171' }
                  )}
                </g>
              )}
            </g>
          );
        }

        // Fallback SVG prism ghost
        const prismColors = fits ? params : { left: '#b91c1c', right: '#ef4444', roof: '#f87171' };
        return (
          <g opacity={fits ? 0.55 : 0.30} style={{ pointerEvents: 'none' }}>
            {renderSVGPrism(
              hoveredCell.row, hoveredCell.col,
              sizeX, sizeY,
              params.h, prismColors,
            )}
          </g>
        );
      }

      if (pickedUpItem.type === 'road') {
        const { x, y } = getIsoCoords(hoveredCell.row, hoveredCell.col);
        const points = `${x},${y - ry} ${x + rx},${y} ${x},${y + ry} ${x - rx},${y}`;
        const fits = checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, 1, 1);
        const roadDir = pickedUpItem.roadDirection;
        return (
          <g opacity={0.55} style={{ pointerEvents: 'none' }}>
            <polygon points={points} fill={fits ? "url(#roadGradWeb)" : "#ef4444"} stroke={fits ? "#0f172a" : "#b91c1c"} strokeWidth={0.5} />
            {fits && roadDir === 'horizontal' && (
              <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`} stroke="#fff" strokeWidth={1.5} strokeDasharray="3,3" />
            )}
            {fits && roadDir === 'vertical' && (
              <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`} stroke="#fff" strokeWidth={1.5} strokeDasharray="3,3" />
            )}
            {fits && roadDir === 'cross' && (
              <g>
                <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />
                <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />
              </g>
            )}
          </g>
        );
      }

      if (pickedUpItem.type === 'forest') {
        const { x, y } = getIsoCoords(hoveredCell.row, hoveredCell.col);
        const points = `${x},${y - ry} ${x + rx},${y} ${x},${y + ry} ${x - rx},${y}`;
        const fits = checkFootprintFit(sortedCells, hoveredCell.row, hoveredCell.col, 1, 1);
        return (
          <g opacity={0.55} style={{ pointerEvents: 'none' }}>
            <polygon points={points} fill={fits ? "url(#forestGradWeb)" : "#ef4444"} stroke={fits ? "#064e3b" : "#b91c1c"} strokeWidth={0.5} />
            {fits && <ellipse cx={x} cy={y + 4} rx={6} ry={3} fill="rgba(0,0,0,0.3)" />}
            {fits && <rect x={x - 1} y={y - 6} width={2} height={6} fill="#78350f" />}
            {fits && <polygon points={`${x},${y - 18} ${x - 6},${y - 6} ${x + 6},${y - 6}`} fill="#064e3b" />}
          </g>
        );
      }
    }

    return null;
  };


  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div style={styles.canvasCard}>
      <div style={{ ...styles.canvasHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#3b82f6" />
          <h3 style={styles.canvasTitle}>
            İzometrik {gridSize}×{gridSize} Harita Editörü
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
            Seçim & Etkileşim Filtresi:
          </span>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'building', label: 'Bina' },
              { id: 'road', label: 'Yol' },
              { id: 'nature', label: 'Doğa' },
            ].map(f => {
              const isActive = activeLayerFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveLayerFilter(f.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? 'bold' : '500',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: isActive ? '#38bdf8' : '#64748b',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ ...styles.canvasWrapper, position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="700"
          viewBox="0 0 1000 700"
          style={{ backgroundColor: '#040b17', display: 'block' }}
        >
          {/* ── GRADIENT DEFINITIONS ──────────────────────────────────────── */}
          <defs>
            <linearGradient id="grassGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#166534" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="forestGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#065f46" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="roadGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* ══════════════════════════════════════════════════════════════════
           *  LAYER 1 + 2: BASE TILES + PLACED BUILDINGS
           *  sortedCells are sorted by (row+col) ascending — isometric painter order.
           * ══════════════════════════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════════════════════════
           *  PASS 1: GROUND TILES (Grass, Roads, Forest floor, Building bases)
           *  Renders all flat polygons first. Clicks, drags and hovers are handled here.
           * ══════════════════════════════════════════════════════════════════ */}
          {sortedCells.map((cell) => {
            const { x, y } = getIsoCoords(cell.row, cell.col);
            const tilePts  = `${x},${y - ry} ${x + rx},${y} ${x},${y + ry} ${x - rx},${y}`;

            return (
              <g
                key={`cell-ground-${cell.row}-${cell.col}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Sadece sürükleme gerektirmeyen tek tıklama eylemleri için onClick tetiklenir
                  if (activeTool === 'select' || activeTool === 'move') {
                    handleCellClick(cell.row, cell.col);
                  }
                }}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    e.stopPropagation();
                    // Sürükleme veya anlık yerleştirme/silme eylemleri için onMouseDown tetiklenir
                    if (activeTool === 'place' || activeTool === 'remove') {
                      setIsDrawing(true);
                      handleCellClick(cell.row, cell.col);
                    }
                  }
                }}
                onMouseEnter={() => {
                  setHoveredCell({ row: cell.row, col: cell.col });
                  if (isDrawing && activeTool === 'place') {
                    // Check size to see if it fits, preventing annoying collision warning alert pops on drag
                    const customAsset = modelAssets.find(a => a.id === activeTileType);
                    const isSwapped = activeRotation === 90 || activeRotation === 270;
                    const sizeX = customAsset ? Math.max(1, isSwapped ? customAsset.gridSizeY : customAsset.gridSizeX) : 1;
                    const sizeY = customAsset ? Math.max(1, isSwapped ? customAsset.gridSizeX : customAsset.gridSizeY) : 1;
                    if (checkFootprintFit(sortedCells, cell.row, cell.col, sizeX, sizeY)) {
                      handleCellClick(cell.row, cell.col);
                    }
                  }
                }}
                onMouseLeave={() => setHoveredCell(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* ── Base tile polygon ─────────────────────────────────── */}
                {cell.type === 'road' ? (
                  <g>
                    <polygon points={tilePts} fill="url(#roadGradWeb)" stroke="url(#roadGradWeb)" strokeWidth={1.2} strokeLinejoin="miter" />
                    {cell.roadDirection === 'horizontal' && (
                      <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`}
                        stroke="#ffffff" strokeWidth={1.5} strokeDasharray="3,3" />
                    )}
                    {cell.roadDirection === 'vertical' && (
                      <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`}
                        stroke="#ffffff" strokeWidth={1.5} strokeDasharray="3,3" />
                    )}
                    {cell.roadDirection === 'cross' && (
                      <g>
                        <path d={`M ${x - rx / 2} ${y - ry / 2} L ${x + rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />
                        <path d={`M ${x + rx / 2} ${y - ry / 2} L ${x - rx / 2} ${y + ry / 2}`} stroke="#e2e8f0" strokeWidth={1} />
                      </g>
                    )}
                  </g>
                ) : cell.type === 'forest' ? (
                  <g>
                    <polygon points={tilePts} fill="url(#forestGradWeb)" stroke="url(#forestGradWeb)" strokeWidth={1.2} strokeLinejoin="miter" />
                    <polygon points={tilePts} fill="none" stroke="rgba(10, 35, 15, 0.2)" strokeWidth={0.8} strokeLinejoin="miter" style={{ pointerEvents: 'none' }} />
                  </g>
                ) : cell.type === 'building' ? (
                  /* Render base as grass so there are no ugly dark triangles peeking out */
                  <g>
                    <polygon points={tilePts} fill="url(#grassGradWeb)" stroke="url(#grassGradWeb)" strokeWidth={1.2} strokeLinejoin="miter" />
                    <polygon points={tilePts} fill="none" stroke="rgba(10, 35, 15, 0.2)" strokeWidth={0.8} strokeLinejoin="miter" style={{ pointerEvents: 'none' }} />
                  </g>
                ) : (
                  <g>
                    <polygon points={tilePts} fill="url(#grassGradWeb)" stroke="url(#grassGradWeb)" strokeWidth={1.2} strokeLinejoin="miter" />
                    <polygon points={tilePts} fill="none" stroke="rgba(10, 35, 15, 0.2)" strokeWidth={0.8} strokeLinejoin="miter" style={{ pointerEvents: 'none' }} />
                  </g>
                )}
              </g>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════════
           *  PASS 2: HEIGHT ENTITIES (Trees, Buildings)
           *  Renders all 3D features on top of the ground layers.
           *  pointerEvents: 'none' ensures all mouse clicks pass to the ground tiles.
           * ══════════════════════════════════════════════════════════════════ */}
          {sortedCells.map((cell) => {
            const { x, y } = getIsoCoords(cell.row, cell.col);

            // Check if this cell is the "front corner" of any building pivot
            const buildingPivot = getBuildingPivotToRenderAt(cell.row, cell.col);
            const bAsset = buildingPivot
              ? modelAssets.find(a => a.id === buildingPivot.buildingId)
              : undefined;
            const isGlb = bAsset?.modelType === 'glb';

            return (
              <g
                key={`height-${cell.row}-${cell.col}`}
                style={{ pointerEvents: 'none' }}
              >
                {/* ── Forest tree ───────────────────────────────────────── */}
                {cell.type === 'forest' && (
                  <g style={{ pointerEvents: 'none' }}>
                    <ellipse cx={x} cy={y + 4} rx={6} ry={3} fill="rgba(0,0,0,0.3)" />
                    <rect x={x - 1} y={y - 6} width={2} height={6} fill="#78350f" />
                    <polygon points={`${x},${y - 18} ${x - 6},${y - 6} ${x + 6},${y - 6}`} fill="#064e3b" />
                    <polygon points={`${x},${y - 24} ${x - 4},${y - 10} ${x + 4},${y - 10}`} fill="#047857" />
                  </g>
                )}

                {/* ── Non-GLB building: SVG isometric prism ─────────────── */}
                {buildingPivot && !isGlb && (() => {
                  const params = getBuildingParamsLocal(buildingPivot.buildingId, ry);
                  const sizeX  = bAsset?.gridSizeX || 1;
                  const sizeY  = bAsset?.gridSizeY || 1;
                  return (
                    <g style={{ pointerEvents: 'none' }}>
                      {renderSVGPrism(buildingPivot.row, buildingPivot.col, sizeX, sizeY, params.h, params)}
                      {bAsset && (
                        <text
                          x={x} y={y - params.h - 6}
                          textAnchor="middle" fontSize={7}
                          fill="rgba(255,255,255,0.65)"
                          style={{ pointerEvents: 'none', userSelect: 'none' } as CSSProperties}
                        >
                          {bAsset.name.length > 14 ? bAsset.name.slice(0, 13) + '…' : bAsset.name}
                        </text>
                      )}
                    </g>
                  );
                })()}

                {/* ── GLB building: Rendered in HTML overlay now ── */}
              </g>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════════
           *  LAYER 3: GHOST PREVIEW
           *  Rendered AFTER all cells → always on top (SVG paint order).
           *  Ghost snaps cell-by-cell (item 3).
           *  For multi-tile buildings, footprint shows full NW-anchor area (item 4).
           * ══════════════════════════════════════════════════════════════════ */}
          {renderGhostPreview()}

          {/* ══════════════════════════════════════════════════════════════════
           *  LAYER 4: FOOTPRINT HOVER HIGHLIGHT
           *  Green glow = placement valid, Red glow = invalid / occupied.
           *  For multi-tile buildings the polygon covers the full footprint
           *  from the NW anchor — matching the multi-tile anchor rule (item 4).
           * ══════════════════════════════════════════════════════════════════ */}
          {hoveredCell && activeTool === 'place' && (
            <polygon
              points={getFootprintPoints(
                hoveredCell.row, hoveredCell.col,
                activeTileSize.x, activeTileSize.y,
              )}
              fill={hoveredFootprintFits ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.10)'}
              stroke={hoveredFootprintFits ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              style={{
                pointerEvents: 'none',
                filter: hoveredFootprintFits
                  ? 'drop-shadow(0 0 6px #10b981)'
                  : 'drop-shadow(0 0 6px #ef4444)',
              } as CSSProperties}
            />
          )}

          {/* Move footprint highlight */}
          {hoveredCell && activeTool === 'move' && pickedUpItem && (() => {
            const rotVal = (pickedUpItem.type === 'building' && pickedUpItem.buildingRotation) || 0;
            const isSwapped = rotVal === 90 || rotVal === 270;
            const sizeX = pickedUpItem.type === 'building'
              ? Math.max(1, isSwapped ? pickedUpItem.sizeY || 1 : pickedUpItem.sizeX || 1)
              : 1;
            const sizeY = pickedUpItem.type === 'building'
              ? Math.max(1, isSwapped ? pickedUpItem.sizeX || 1 : pickedUpItem.sizeY || 1)
              : 1;

            const ghostRow = hoveredCell.row - (pickedUpItem.clickOffset?.row || 0);
            const ghostCol = hoveredCell.col - (pickedUpItem.clickOffset?.col || 0);

            const fits = checkFootprintFit(
              sortedCells,
              ghostRow,
              ghostCol,
              sizeX,
              sizeY,
              pickedUpItem.type === 'building' ? pickedUpItem.originalPivot : undefined
            );

            return (
              <polygon
                key={`hover-move-${ghostRow}-${ghostCol}`}
                points={getFootprintPoints(
                  ghostRow,
                  ghostCol,
                  sizeX,
                  sizeY
                )}
                fill={fits ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.10)'}
                stroke={fits ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                style={{
                  pointerEvents: 'none',
                  filter: fits
                    ? 'drop-shadow(0 0 6px #10b981)'
                    : 'drop-shadow(0 0 6px #ef4444)',
                } as CSSProperties}
              />
            );
          })()}
          {/* Dinamik Neon Hover Vurgulayıcı (Unified Premium Outline) */}
          {hoveredCell && activeTool !== 'place' && (() => {
            const cell = sortedCells.find(c => c.row === hoveredCell.row && c.col === hoveredCell.col);
            if (!cell || !cellMatchesFilterCanvas(cell)) return null;

            // Grass is not interactive for select/remove/move, so don't highlight it
            if (cell.type === 'grass' && activeTool !== 'place') return null;

            const fp = getCellFootprint(hoveredCell.row, hoveredCell.col);
            const row = fp ? fp.row : hoveredCell.row;
            const col = fp ? fp.col : hoveredCell.col;
            const sizeX = fp ? fp.sizeX : 1;
            const sizeY = fp ? fp.sizeY : 1;

            const color = activeTool === 'select' ? '#c084fc' // purple
                        : activeTool === 'remove' ? '#ef4444' // red
                        : activeTool === 'move' ? '#f59e0b' // amber
                        : '#0ea5e9'; // sky-blue

            const fill = activeTool === 'select' ? 'rgba(168, 85, 247, 0.06)'
                       : activeTool === 'remove' ? 'rgba(239, 68, 68, 0.08)'
                       : activeTool === 'move' ? 'rgba(245, 158, 11, 0.08)'
                       : 'rgba(56, 189, 248, 0.06)';

            return (
              <polygon
                key={`hover-gen-${row}-${col}`}
                points={getFootprintPoints(row, col, sizeX, sizeY)}
                fill={fill}
                stroke={color}
                strokeWidth={2}
                style={{
                  pointerEvents: 'none',
                  filter: `drop-shadow(0 0 6px ${color})`,
                } as CSSProperties}
              />
            );
          })()}

          {/* Selected cell footprint glow and floating action menu */}
          {selectedCell && (() => {
            const fp = getCellFootprint(selectedCell.row, selectedCell.col);
            if (!fp) return null;

            const right = getIsoCoords(fp.row, fp.col + fp.sizeX - 1);
            const left = getIsoCoords(fp.row + fp.sizeY - 1, fp.col);
            const centerY = (left.y + right.y) / 2;

            const menuWidth = 150;
            const menuHeight = 40;
            const menuX = right.x + rx + 8;
            const menuY = centerY - menuHeight / 2;

            return (
              <g key={`selected-cell-group-${fp.row}-${fp.col}`}>
                <polygon
                  points={getFootprintPoints(fp.row, fp.col, fp.sizeX, fp.sizeY)}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  style={{
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 10px #3b82f6) drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))',
                  } as CSSProperties}
                />
                {activeTool === 'select' && selectedCell.type === 'building' && (
                  <foreignObject
                    key={`selected-menu-${fp.row}-${fp.col}-${selectedCell.buildingRotation || 0}`}
                    x={menuX}
                    y={menuY}
                    width={menuWidth}
                    height={menuHeight}
                    style={{ overflow: 'visible' } as CSSProperties}
                  >
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                      pointerEvents: 'auto',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (moveSelectedCell) moveSelectedCell();
                        }}
                        onMouseEnter={() => setHoveredBtn('move')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: hoveredBtn === 'move' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.06)',
                          border: hoveredBtn === 'move' ? '1px solid rgba(59, 130, 246, 0.45)' : '1px solid rgba(59, 130, 246, 0.15)',
                          color: hoveredBtn === 'move' ? '#60a5fa' : '#93c5fd',
                          cursor: 'pointer',
                          transform: hoveredBtn === 'move' ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          outline: 'none',
                          boxShadow: hoveredBtn === 'move' ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none',
                        }}
                        title="Taşı"
                      >
                        <Move size={12} style={{ transition: 'transform 0.2s' }} />
                        Taşı
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (rotateSelectedCell) rotateSelectedCell();
                        }}
                        onMouseEnter={() => setHoveredBtn('rotate')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: hoveredBtn === 'rotate' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.06)',
                          border: hoveredBtn === 'rotate' ? '1px solid rgba(234, 179, 8, 0.45)' : '1px solid rgba(234, 179, 8, 0.15)',
                          color: hoveredBtn === 'rotate' ? '#facc15' : '#fde047',
                          cursor: 'pointer',
                          transform: hoveredBtn === 'rotate' ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          outline: 'none',
                          boxShadow: hoveredBtn === 'rotate' ? '0 0 12px rgba(234, 179, 8, 0.3)' : 'none',
                        }}
                        title="Döndür"
                      >
                        <RotateCw size={12} style={{ transform: hoveredBtn === 'rotate' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        Döndür
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCell(null);
                        }}
                        onMouseEnter={() => setHoveredBtn('confirm')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: hoveredBtn === 'confirm' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.06)',
                          border: hoveredBtn === 'confirm' ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(16, 185, 129, 0.15)',
                          color: hoveredBtn === 'confirm' ? '#34d399' : '#a7f3d0',
                          cursor: 'pointer',
                          transform: hoveredBtn === 'confirm' ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          outline: 'none',
                          boxShadow: hoveredBtn === 'confirm' ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                        }}
                        title="Onayla"
                      >
                        <Check size={12} />
                        Onayla
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (removeSelectedCell) removeSelectedCell();
                        }}
                        onMouseEnter={() => setHoveredBtn('remove')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: hoveredBtn === 'remove' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.06)',
                          border: hoveredBtn === 'remove' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(239, 68, 68, 0.15)',
                          color: hoveredBtn === 'remove' ? '#f87171' : '#fca5a5',
                          cursor: 'pointer',
                          transform: hoveredBtn === 'remove' ? 'scale(1.06)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          outline: 'none',
                          boxShadow: hoveredBtn === 'remove' ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none',
                        }}
                        title="Kaldır"
                      >
                        <Trash2 size={12} />
                        Kaldır
                      </button>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })()}
        </svg>

        {/* HTML Overlay Katmanı: 3D GLB binalarının SVG elemanları tarafından diagonal kesilmesini önler */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Mouse tıklamalarının altındaki SVG katmanına geçebilmesi için
            overflow: 'hidden',
          }}
        >
          {overlayItems.map(item => {
            const fo = getGLBViewerBounds(item.row, item.col, item.sizeX, item.sizeY, item.height);
            
            // SVG koordinatlarını ekran üzerindeki fiziksel piksellere dönüştür
            const physX = offsetX + fo.x * scale;
            const physY = offsetY + fo.y * scale;
            const physW = fo.width * scale;
            const physH = fo.height * scale;

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${physX}px`,
                  top: `${physY}px`,
                  width: `${physW}px`,
                  height: `${physH}px`,
                  pointerEvents: 'none',
                }}
              >
                <MapGLBViewer
                  src={item.fileUrl}
                  alt={item.name}
                  textureUrl={item.textureUrl || null}
                  rotationAngle={item.rotation}
                  opacity={item.opacity}
                  scale={item.scale}
                  scaleX={item.scaleX}
                  scaleY={item.scaleY}
                  scaleZ={item.scaleZ}
                  sizeX={item.sizeX}
                  sizeY={item.sizeY}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
