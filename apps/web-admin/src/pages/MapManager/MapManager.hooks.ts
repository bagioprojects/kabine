import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// ── Pure helpers (outside hook, no re-creation on render) ──────────────────────

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

/**
 * Comprehensive grid sanitizer.
 * Fixes: orphan asset refs, out-of-bounds cells, broken anchors,
 * footprint overflow, duplicate pivots, type/field mismatches.
 * Always guarantees a complete gridSize×gridSize cell set.
 */
function sanitizeGridCells(
  cells: GridCell[],
  gSize: number
): GridCell[] {
  const inBounds = (r: number, c: number) => r >= 0 && r < gSize && c >= 0 && c < gSize;

  // Step 1: canonical grass grid — all cells guaranteed
  const canonical = new Map<string, GridCell>();
  for (let r = 0; r < gSize; r++) {
    for (let c = 0; c < gSize; c++) {
      canonical.set(`${r},${c}`, {
        row: r, col: c, type: 'grass',
        roadDirection: null, buildingId: null,
        isBuildingPivot: false, buildingAnchor: null,
        buildingRotation: 0,
      });
    }
  }

  // Step 2: apply road/forest/grass cells (non-building)
  for (const cell of cells) {
    if (!inBounds(cell.row, cell.col)) continue;
    if (cell.type === 'road' || cell.type === 'forest' || cell.type === 'grass') {
      canonical.set(`${cell.row},${cell.col}`, {
        row: cell.row, col: cell.col,
        type: cell.type,
        roadDirection: cell.type === 'road' ? (cell.roadDirection ?? 'horizontal') : null,
        buildingId: null, isBuildingPivot: false, buildingAnchor: null,
        buildingRotation: null,
      });
    }
  }

  // Step 3: collect valid building pivots
  type PivotInfo = {
    row: number; col: number; buildingId: string; rotation: 0 | 90 | 180 | 270;
    sizeX: number; sizeY: number;
    scale?: number; scaleX?: number; scaleY?: number; scaleZ?: number;
    isResizable?: boolean;
    actionType?: 'none' | 'navigate_map' | 'open_modal';
    actionTarget?: string;
  };
  const validPivots: PivotInfo[] = [];
  const occupiedByPivot = new Set<string>(); // tracks cells committed to a pivot

  for (const cell of cells) {
    if (
      cell.type !== 'building' ||
      !cell.isBuildingPivot ||
      !cell.buildingId ||
      !inBounds(cell.row, cell.col)
    ) continue;

    const rotVal = (cell.buildingRotation === 90 || cell.buildingRotation === 180 || cell.buildingRotation === 270) ? cell.buildingRotation : 0;
    
    // Instead of forcing asset's default sizes, we MUST use the cell's assigned sizes to keep custom resizing
    const cellSizeX = cell.sizeX ?? 1;
    const cellSizeY = cell.sizeY ?? 1;

    // Check entire footprint fits within grid and is not already occupied
    let ok = true;
    const footprintKeys: string[] = [];
    for (let dr = 0; dr < cellSizeY && ok; dr++) {
      for (let dc = 0; dc < cellSizeX && ok; dc++) {
        const kr = cell.row + dr;
        const kc = cell.col + dc;
        const key = `${kr},${kc}`;
        if (!inBounds(kr, kc) || occupiedByPivot.has(key)) ok = false;
        else footprintKeys.push(key);
      }
    }
    if (!ok) continue;

    footprintKeys.forEach(k => occupiedByPivot.add(k));
    validPivots.push({
      row: cell.row, col: cell.col, buildingId: cell.buildingId, rotation: rotVal,
      sizeX: cellSizeX, sizeY: cellSizeY,
      scale: cell.scale, scaleX: cell.scaleX, scaleY: cell.scaleY, scaleZ: cell.scaleZ,
      actionType: cell.actionType, actionTarget: cell.actionTarget
    });
  }

  // Step 4: apply valid pivots and their children to canonical grid
  for (const pivot of validPivots) {
    for (let dr = 0; dr < pivot.sizeY; dr++) {
      for (let dc = 0; dc < pivot.sizeX; dc++) {
        const r = pivot.row + dr;
        const c = pivot.col + dc;
        const isPivot = dr === 0 && dc === 0;
        canonical.set(`${r},${c}`, {
          row: r, col: c,
          type: 'building',
          roadDirection: null,
          buildingId: pivot.buildingId,
          isBuildingPivot: isPivot,
          buildingAnchor: { row: pivot.row, col: pivot.col },
          buildingRotation: pivot.rotation,
          ...(isPivot ? {
            sizeX: pivot.sizeX,
            sizeY: pivot.sizeY,
            scale: pivot.scale,
            scaleX: pivot.scaleX,
            scaleY: pivot.scaleY,
            scaleZ: pivot.scaleZ,
            actionType: pivot.actionType,
            actionTarget: pivot.actionTarget
          } : {})
        });
      }
    }
  }

  // Return sorted in row-major order
  return Array.from(canonical.values()).sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
}
import {
  GridCell,
  CustomMapData,
  DistrictListItem,
  ModelAsset,
  ModelCategory,
  ActiveTool,
  PickedUpItem,
  BuildingParams,
} from './MapManager.constants';

const API_BASE = 'http://localhost:3000/api/v1/admin';

function getAdminHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
}

export function useMapManager() {
  const [activeTab, setActiveTab] = useState<'cities' | 'maps'>('cities');

  // ── Cities Tab ──────────────────────────────────────────────────────────────
  const [cities, setCities] = useState<DistrictListItem[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesSearch, setCitiesSearch] = useState('');
  const [citiesPage, setCitiesPage] = useState(1);
  const [citiesTotalPages, setCitiesTotalPages] = useState(1);
  const [citiesTotalCount, setCitiesTotalCount] = useState(0);

  // ── Maps Tab ────────────────────────────────────────────────────────────────
  const [customMaps, setCustomMaps] = useState<CustomMapData[]>([]);
  const [loadingMaps, setLoadingMaps] = useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapGridSize, setNewMapGridSize] = useState(10);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningDistrict, setAssigningDistrict] = useState<DistrictListItem | null>(null);
  const [assigningMapId, setAssigningMapId] = useState('');

  // ── Editor ──────────────────────────────────────────────────────────────────
  const [editingMap, setEditingMap] = useState<CustomMapData | null>(null);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [savingMap, setSavingMap] = useState(false);

  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [activeTileType, setActiveTileType] = useState('road_h');
  const [activeRotation, setActiveRotation] = useState<0 | 90 | 180 | 270>(0);
  const [pickedUpItem, setPickedUpItem] = useState<PickedUpItem | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);

  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'building' | 'road' | 'nature'>('all');

  const cellMatchesFilter = useCallback((cell: GridCell): boolean => {
    if (activeLayerFilter === 'all') return true;
    if (activeLayerFilter === 'building') return cell.type === 'building';
    if (activeLayerFilter === 'road') return cell.type === 'road';
    if (activeLayerFilter === 'nature') return cell.type === 'forest';
    return false;
  }, [activeLayerFilter]);

  // Reset selectedCell if filter changes and selected cell no longer matches
  useEffect(() => {
    if (selectedCell) {
      if (!cellMatchesFilter(selectedCell)) {
        setSelectedCell(null);
      }
    }
  }, [activeLayerFilter, cellMatchesFilter, selectedCell]);

  // Reset rotation and selection when tool or tile type changes
  useEffect(() => {
    setActiveRotation(0);
    setSelectedCell(null);
  }, [activeTool, activeTileType]);




  // ── Model Assets ─────────────────────────────────────────────────────────────
  const [modelAssets, setModelAssets] = useState<ModelAsset[]>([]);
  const [modelCategories, setModelCategories] = useState<ModelCategory[]>([]);
  const [activePaletteCategory, setActivePaletteCategory] = useState('base');

  // ── Derived editor grid params ───────────────────────────────────────────────
  const gridSize = editingMap ? editingMap.gridSize : 10;
  const tileWidth = gridSize === 10 ? 90 : gridSize === 15 ? 60 : 45;
  const tileHeight = tileWidth / 2;
  const gridOffsetX = 500;
  const gridOffsetY = 125;

  // ── Alert auto-clear ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  // ── Fetch models & categories ────────────────────────────────────────────────
  const fetchModelsAndCategories = useCallback(async () => {
    try {
      const [catsRes, assetsRes] = await Promise.all([
        axios.get(`${API_BASE}/model-categories`, { headers: getAdminHeaders() }),
        axios.get(`${API_BASE}/model-assets`,     { headers: getAdminHeaders() }),
      ]);
      if (catsRes.data.success)   setModelCategories(catsRes.data.data);
      if (assetsRes.data.success) setModelAssets(assetsRes.data.data);
    } catch (err) {
      console.error('Model veya kategori çekilemedi:', err);
    }
  }, []);

  const scaleUpdateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateModelAssetScale = useCallback((assetId: string, newScale: number) => {
    const asset = modelAssets.find(a => a.id === assetId);
    if (!asset) return;
    
    // Anında (Instant) UI Güncellemesi
    setModelAssets(prev => prev.map(a => a.id === assetId ? { ...a, scale: newScale } : a));

    if (scaleUpdateTimerRef.current) clearTimeout(scaleUpdateTimerRef.current);

    scaleUpdateTimerRef.current = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('name', asset.name);
        formData.append('categoryId', asset.categoryId);
        formData.append('gridSizeX', String(asset.gridSizeX));
        formData.append('gridSizeY', String(asset.gridSizeY));
        formData.append('scale', String(newScale));

        await axios.put(`${API_BASE}/model-assets/${assetId}`, formData, {
          headers: getAdminHeaders(),
        });
      } catch (err) {
        console.error('Scale update failed:', err);
        setAlertMsg({ text: 'Ölçek kaydedilemedi.', type: 'error' });
      }
    }, 500); // 500ms bekleme süresi (debounce)
  }, [modelAssets]);

  useEffect(() => { fetchModelsAndCategories(); }, [fetchModelsAndCategories]);

  // ── Fetch districts ──────────────────────────────────────────────────────────
  const fetchDistricts = useCallback(async () => {
    setLoadingCities(true);
    try {
      const res = await axios.get(`${API_BASE}/districts`, {
        headers: getAdminHeaders(),
        params: { page: citiesPage, limit: 20, search: citiesSearch || undefined },
      });
      if (res.data.success && res.data.data) {
        setCities(res.data.data.items);
        setCitiesTotalPages(res.data.data.totalPages);
        setCitiesTotalCount(res.data.data.total);
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ text: 'İlçeler listelenirken hata oluştu.', type: 'error' });
    } finally {
      setLoadingCities(false);
    }
  }, [citiesPage, citiesSearch]);

  // ── Fetch custom maps ────────────────────────────────────────────────────────
  const fetchCustomMaps = useCallback(async () => {
    setLoadingMaps(true);
    try {
      const res = await axios.get(`${API_BASE}/custom-maps`, { headers: getAdminHeaders() });
      if (res.data.success) setCustomMaps(res.data.data);
    } catch (err) {
      console.error(err);
      setAlertMsg({ text: 'Harita şablonları çekilemedi.', type: 'error' });
    } finally {
      setLoadingMaps(false);
    }
  }, []);

  // Initial load + tab/page changes
  useEffect(() => {
    if (activeTab === 'cities') fetchDistricts();
    else fetchCustomMaps();
  }, [activeTab, citiesPage, fetchDistricts, fetchCustomMaps]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCitiesPage(1);
    fetchDistricts();
  }, [fetchDistricts]);

  const handleCreateMap = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapName.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/custom-maps`,
        { name: newMapName, gridSize: newMapGridSize },
        { headers: getAdminHeaders() }
      );
      if (res.data.success) {
        setAlertMsg({ text: 'Harita şablonu başarıyla oluşturuldu!', type: 'success' });
        fetchCustomMaps();
        setIsCreateModalOpen(false);
        setNewMapName('');
      }
    } catch (err: any) {
      setAlertMsg({ text: err.response?.data?.message || 'Şablon oluşturulurken hata.', type: 'error' });
    }
  }, [newMapName, newMapGridSize, fetchCustomMaps]);

  const handleDeleteMap = useCallback(async (id: string) => {
    if (!window.confirm('Bu harita şablonunu silmek istediğinize emin misiniz? Bu şablona atanmış tüm ilçeler "Yok" durumuna dönecektir.')) return;
    try {
      const res = await axios.delete(`${API_BASE}/custom-maps/${id}`, { headers: getAdminHeaders() });
      if (res.data.success) {
        setAlertMsg({ text: 'Şablon silindi.', type: 'success' });
        fetchCustomMaps();
      }
    } catch {
      setAlertMsg({ text: 'Şablon silinirken hata oluştu.', type: 'error' });
    }
  }, [fetchCustomMaps]);

  const openAssignModal = useCallback((district: DistrictListItem) => {
    setAssigningDistrict(district);
    setAssigningMapId(district.assignedMapId || '');
    setIsAssignModalOpen(true);
  }, []);

  const handleSaveAssignment = useCallback(async () => {
    if (!assigningDistrict) return;
    try {
      const res = await axios.post(`${API_BASE}/maps/assign`,
        { districtId: assigningDistrict.id, customMapId: assigningMapId || null },
        { headers: getAdminHeaders() }
      );
      if (res.data.success) {
        setAlertMsg({ text: 'Harita ilçeye tanımlandı!', type: 'success' });
        fetchDistricts();
        setIsAssignModalOpen(false);
      }
    } catch {
      setAlertMsg({ text: 'Harita tanımlanırken hata oluştu.', type: 'error' });
    }
  }, [assigningDistrict, assigningMapId, fetchDistricts]);

  const enterDesignMode = useCallback((mapData: CustomMapData) => {
    setEditingMap(mapData);
    // Sanitize on load to eliminate any legacy orphan/corrupted cells
    const sanitized = sanitizeGridCells(mapData.gridCells, mapData.gridSize);
    setGridCells(sanitized);
    setPickedUpItem(null);
  }, [modelAssets]);

  const exitDesignMode = useCallback(() => {
    setEditingMap(null);
    fetchCustomMaps();
  }, [fetchCustomMaps]);

  const handleSaveDesign = useCallback(async () => {
    if (!editingMap) return;
    setSavingMap(true);
    try {
      // Sanitize before save — guarantees clean data is persisted
      const cleanCells = sanitizeGridCells(gridCells, editingMap.gridSize);
      setGridCells(cleanCells); // update local state too

      const res = await axios.put(
        `${API_BASE}/custom-maps/${editingMap.id}`,
        { gridCells: cleanCells },
        { headers: getAdminHeaders() }
      );
      if (res.data.success) {
        setAlertMsg({ text: 'Harita tasarımı başarıyla kaydedildi!', type: 'success' });
        setEditingMap(prev => prev ? { ...prev, gridCells: cleanCells } : prev);
      }
    } catch {
      setAlertMsg({ text: 'Kaydederken sunucu hatası oluştu.', type: 'error' });
    } finally {
      setSavingMap(false);
    }
  }, [editingMap, gridCells, modelAssets]);

  // ── Isometric helpers ────────────────────────────────────────────────────────

  const getIsoCoords = useCallback((r: number, c: number) => {
    const x = (c - r) * (tileWidth / 2) + gridOffsetX;
    const y = (c + r) * (tileHeight / 2) + gridOffsetY;
    return { x, y };
  }, [tileWidth, tileHeight]);

  const checkFootprintFit = useCallback(
    (cells: GridCell[], r: number, c: number, sizeX: number, sizeY: number, ignorePivot?: { row: number; col: number }): boolean => {
      for (let dr = 0; dr < sizeY; dr++) {
        for (let dc = 0; dc < sizeX; dc++) {
          const currR = r + dr;
          const currC = c + dc;
          if (currR < 0 || currR >= gridSize || currC < 0 || currC >= gridSize) return false;
          const cell = cells.find(cell => cell.row === currR && cell.col === currC);
          if (!cell) return false;
          if (ignorePivot) {
            const isOwnCell = (cell.row === ignorePivot.row && cell.col === ignorePivot.col) ||
              (cell.buildingAnchor && cell.buildingAnchor.row === ignorePivot.row && cell.buildingAnchor.col === ignorePivot.col);
            if (isOwnCell) continue;
          }
          if (cell.type !== 'grass') return false;
        }
      }
      return true;
    },
    [gridSize]
  );

  const getBuildingParamsLocal = useCallback((buildingId: string | undefined | null, ry: number): BuildingParams => {
    // No buildingId → generic grey block
    if (!buildingId) return { h: ry * 1.5, roof: '#4b5563', right: '#6b7280', left: '#374151', name: 'Bina', textureId: null };

    const customB = modelAssets.find(b => b.id === buildingId);
    if (customB) {
      // Derive a unique, stable color from the asset's UUID — no texture patterns
      const colors = deriveAssetColors(customB.id);
      const scaleVal = Math.max(0.3, Math.min(5, parseFloat(String(customB.scale)) || 1.0));
      return {
        h: ry * 1.5 * scaleVal,
        roof:  colors.roof,
        right: colors.right,
        left:  colors.left,
        name: customB.name,
        textureId: null, // Texture patterns are unreliable on isometric SVG — disabled
      };
    }
    // Unrecognised buildingId (should not happen after sanitization)
    return { h: ry * 1.5, roof: '#4b5563', right: '#6b7280', left: '#374151', name: 'Bina', textureId: null };
  }, [modelAssets]);

  /**
   * Returns the building pivot whose FRONT CORNER (SE corner) is at (r, c).
   * This is used by the canvas to render the 3D building visual at the
   * correct isometric z-order position (front cell rendered last = on top).
   *
   * MULTI-TILE ANCHOR (item 4): anchor = NW corner (pivot cell).
   * Front corner = (pivot.row + sizeY - 1, pivot.col + sizeX - 1).
   */
  const getBuildingPivotToRenderAt = useCallback((r: number, c: number) => {
    for (const cell of gridCells) {
      if (!cell.isBuildingPivot || !cell.buildingId || cell.type !== 'building') continue;
      const bAsset = modelAssets.find(a => a.id === cell.buildingId);
      const rotVal = cell.buildingRotation || 0;
      const isSwapped = rotVal === 90 || rotVal === 270;
      const sizeX = Math.max(1, isSwapped ? bAsset?.gridSizeY || 1 : bAsset?.gridSizeX || 1);
      const sizeY = Math.max(1, isSwapped ? bAsset?.gridSizeX || 1 : bAsset?.gridSizeY || 1);
      if (cell.row + sizeY - 1 === r && cell.col + sizeX - 1 === c) return cell;
    }
    return undefined;
  }, [gridCells, modelAssets]);

  const removeCellContent = useCallback((cells: GridCell[], r: number, c: number): GridCell[] => {
    const targetCell = cells.find(cell => cell.row === r && cell.col === c);
    if (!targetCell) return cells;
    let pivotRow = r;
    let pivotCol = c;
    if (targetCell.type === 'building' && targetCell.buildingAnchor) {
      pivotRow = targetCell.buildingAnchor.row;
      pivotCol = targetCell.buildingAnchor.col;
    }
    return cells.map(cell => {
      const isPart = (cell.row === pivotRow && cell.col === pivotCol) ||
        (cell.buildingAnchor && cell.buildingAnchor.row === pivotRow && cell.buildingAnchor.col === pivotCol);
      if (isPart || (cell.row === r && cell.col === c)) {
        return { ...cell, type: 'grass' as const, buildingId: null, isBuildingPivot: false, buildingAnchor: null, roadDirection: null, buildingRotation: null };
      }
      return cell;
    });
  }, []);

  const rotateSelectedCell = useCallback(() => {
    if (!selectedCell || selectedCell.type !== 'building') return;
    const pivotR = selectedCell.buildingAnchor?.row ?? selectedCell.row;
    const pivotC = selectedCell.buildingAnchor?.col ?? selectedCell.col;

    setGridCells(prev => {
      const currentCell = prev.find(c => c.row === pivotR && c.col === pivotC);
      if (!currentCell) return prev;

      const oldRot = currentCell.buildingRotation || 0;
      const newRot = ((oldRot + 90) % 360) as 0 | 90 | 180 | 270;

      const bAsset = modelAssets.find(a => a.id === currentCell.buildingId);
      if (bAsset) {
        const isSwapped = newRot === 90 || newRot === 270;
        
        // Preserve user's custom size if any
        const baseSizeX = currentCell.sizeX ?? (isSwapped ? bAsset.gridSizeY : bAsset.gridSizeX);
        const baseSizeY = currentCell.sizeY ?? (isSwapped ? bAsset.gridSizeX : bAsset.gridSizeY);

        // Calculate NEW dimensions based on rotation difference
        // If they rotated by 90/270 degrees, we swap the current footprint dimensions
        const rotDiff = Math.abs(newRot - oldRot);
        let newSizeX = baseSizeX;
        let newSizeY = baseSizeY;
        
        if (rotDiff === 90 || rotDiff === 270) {
           newSizeX = baseSizeY;
           newSizeY = baseSizeX;
        }

        const sizeX = Math.max(1, newSizeX);
        const sizeY = Math.max(1, newSizeY);

        if (!checkFootprintFit(prev, pivotR, pivotC, sizeX, sizeY, { row: pivotR, col: pivotC })) {
          setAlertMsg({ text: 'Döndürülemez — yeni konum çakışıyor veya sınır dışı!', type: 'error' });
          return prev;
        }

        let updated = removeCellContent(prev, pivotR, pivotC);

        updated = updated.map(cell => {
          const dr = cell.row - pivotR;
          const dc = cell.col - pivotC;
          if (dr >= 0 && dr < sizeY && dc >= 0 && dc < sizeX) {
            const isPivot = dr === 0 && dc === 0;
            return {
              ...cell,
              type: 'building' as const,
              buildingId: currentCell.buildingId!,
              isBuildingPivot: isPivot,
              buildingAnchor: { row: pivotR, col: pivotC },
              roadDirection: null,
              buildingRotation: newRot,
              ...(isPivot ? {
                sizeX,
                sizeY,
                scale: currentCell.scale,
                scaleX: currentCell.scaleX,
                scaleY: currentCell.scaleY,
                scaleZ: currentCell.scaleZ,
                actionType: currentCell.actionType,
                actionTarget: currentCell.actionTarget,
              } : {})
            };
          }
          return cell;
        });

        const newSelected = updated.find(c => c.row === pivotR && c.col === pivotC);
        if (newSelected) setSelectedCell(newSelected);

        return updated;
      }
      return prev;
    });
  }, [selectedCell, modelAssets, checkFootprintFit, removeCellContent]);

  const moveSelectedCell = useCallback(() => {
    if (!selectedCell) return;
    const r = selectedCell.row;
    const c = selectedCell.col;
    const target = gridCells.find(cell => cell.row === r && cell.col === c);
    if (!target || target.type === 'grass') return;

    if (target.type === 'building') {
      const pivotR = target.buildingAnchor?.row ?? r;
      const pivotC = target.buildingAnchor?.col ?? c;
      const bAsset = modelAssets.find(a => a.id === target.buildingId);
      setPickedUpItem({
        type: 'building',
        buildingId:   target.buildingId,
        sizeX:        Math.max(1, bAsset?.gridSizeX || 1),
        sizeY:        Math.max(1, bAsset?.gridSizeY || 1),
        originalPivot: { row: pivotR, col: pivotC },
        buildingRotation: target.buildingRotation || 0,
      });
      setGridCells(prev => removeCellContent(prev, pivotR, pivotC));
    } else if (target.type === 'road') {
      setPickedUpItem({ type: 'road', roadDirection: target.roadDirection });
      setGridCells(prev => prev.map(cell =>
        cell.row === r && cell.col === c
          ? { ...cell, type: 'grass' as const, roadDirection: null }
          : cell
      ));
    } else if (target.type === 'forest') {
      setPickedUpItem({ type: 'forest' });
      setGridCells(prev => prev.map(cell =>
        cell.row === r && cell.col === c
          ? { ...cell, type: 'grass' as const }
          : cell
      ));
    }
    setSelectedCell(null);
    setActiveTool('move');
  }, [selectedCell, gridCells, modelAssets, removeCellContent]);

  const removeSelectedCell = useCallback(() => {
    if (!selectedCell) return;
    setGridCells(prev => removeCellContent(prev, selectedCell.row, selectedCell.col));
    setSelectedCell(null);
  }, [selectedCell, removeCellContent]);

  const updateSelectedCellProperties = useCallback((updates: Partial<GridCell>) => {
    if (!selectedCell) return;

    // Check if we are resizing the footprint
    if (updates.sizeX !== undefined || updates.sizeY !== undefined) {
      const bAsset = selectedCell.buildingId ? modelAssets.find(a => a.id === selectedCell.buildingId) : null;
      if (!bAsset) return;

      const currentSizeX = selectedCell.sizeX ?? bAsset.gridSizeX;
      const currentSizeY = selectedCell.sizeY ?? bAsset.gridSizeY;
      
      const newSizeX = updates.sizeX ?? currentSizeX;
      const newSizeY = updates.sizeY ?? currentSizeY;

      // If size actually changed
      if (newSizeX !== currentSizeX || newSizeY !== currentSizeY) {
        let updatedCells = [...gridCells];
        
        // 1. Temporarily remove the old footprint entirely to check if the new footprint fits
        // (We only remove the anchors, not the pivot itself just yet, or we remove all and recreate)
        for (let dr = 0; dr < currentSizeY; dr++) {
          for (let dc = 0; dc < currentSizeX; dc++) {
            if (dr !== 0 || dc !== 0) {
              updatedCells = removeCellContent(updatedCells, selectedCell.row + dr, selectedCell.col + dc);
            }
          }
        }

        // 2. Check if the NEW footprint fits
        const fits = checkFootprintFit(updatedCells, selectedCell.row, selectedCell.col, newSizeX, newSizeY, { row: selectedCell.row, col: selectedCell.col });
        
        if (!fits) {
          setAlertMsg({ text: 'Boyut genişletilemiyor — etraftaki alan dolu veya sınır dışı!', type: 'error' });
          return; // Abort the size change
        }

        // 3. It fits! Now clear the new footprint area (which is confirmed empty or grass) and apply the new anchors
        for (let dr = 0; dr < newSizeY; dr++) {
          for (let dc = 0; dc < newSizeX; dc++) {
            updatedCells = removeCellContent(updatedCells, selectedCell.row + dr, selectedCell.col + dc);
          }
        }

        // Re-add the pivot and new anchors
        updatedCells = updatedCells.map(cell => {
          const dr = cell.row - selectedCell.row;
          const dc = cell.col - selectedCell.col;
          if (dr >= 0 && dr < newSizeY && dc >= 0 && dc < newSizeX) {
            const isPivot = dr === 0 && dc === 0;
            return {
              ...cell,
              type: 'building' as const,
              buildingId: selectedCell.buildingId,
              isBuildingPivot: isPivot,
              buildingAnchor: { row: selectedCell.row, col: selectedCell.col },
              roadDirection: null,
              buildingRotation: selectedCell.buildingRotation,
              ...(isPivot ? {
                ...selectedCell, // Retain existing custom properties (scale, etc.)
                ...updates,      // Apply new updates (sizeX, sizeY, etc.)
              } : {}),
            };
          }
          return cell;
        });

        setGridCells(updatedCells);
        setSelectedCell(prev => prev ? { ...prev, ...updates } : null);
        return; // We handled the footprint update!
      }
    }

    // Normal property update (e.g. scale only)
    setGridCells(prev => prev.map(c => 
      c.row === selectedCell.row && c.col === selectedCell.col ? { ...c, ...updates } : c
    ));
    setSelectedCell(prev => prev ? { ...prev, ...updates } : null);
  }, [selectedCell, gridCells, modelAssets, removeCellContent, checkFootprintFit]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;

    if (activeTool === 'select') {

      const clicked = gridCells.find(cell => cell.row === r && cell.col === c);
      if (clicked && clicked.type !== 'grass' && cellMatchesFilter(clicked)) {
        if (clicked.type === 'building' && clicked.buildingAnchor) {
          const pivot = gridCells.find(cell => cell.row === clicked.buildingAnchor!.row && cell.col === clicked.buildingAnchor!.col);
          setSelectedCell(pivot || clicked);
        } else {
          setSelectedCell(clicked);
        }
      } else {
        setSelectedCell(null);
      }
      return;
    }

    let updatedCells = [...gridCells];
    let sizeX = 1;
    let sizeY = 1;
    let isBuilding = false;

    if (activeTool === 'place') {
      const customAsset = modelAssets.find(a => a.id === activeTileType);
      if (customAsset) {
        const isSwapped = activeRotation === 90 || activeRotation === 270;
        sizeX = Math.max(1, isSwapped ? customAsset.gridSizeY : customAsset.gridSizeX);
        sizeY = Math.max(1, isSwapped ? customAsset.gridSizeX : customAsset.gridSizeY);
        isBuilding = true;
      } else if (!['road_h', 'road_v', 'road_x', 'forest', 'grass'].includes(activeTileType)) {
        isBuilding = true;
      }

      if (isBuilding) {
        if (!checkFootprintFit(updatedCells, r, c, sizeX, sizeY)) {
          setAlertMsg({ text: 'Buraya bina yerleştirilemez — alan dolu veya sınır dışı!', type: 'error' });
          return;
        }
        for (let dr = 0; dr < sizeY; dr++)
          for (let dc = 0; dc < sizeX; dc++)
            updatedCells = removeCellContent(updatedCells, r + dr, c + dc);

        updatedCells = updatedCells.map(cell => {
          const dr = cell.row - r;
          const dc = cell.col - c;
          if (dr >= 0 && dr < sizeY && dc >= 0 && dc < sizeX) {
            const isPivot = dr === 0 && dc === 0;
            return {
              ...cell,
              type:            'building' as const,
              buildingId:      activeTileType,
              isBuildingPivot: isPivot,
              buildingAnchor:  { row: r, col: c },
              roadDirection:   null,
              buildingRotation: activeRotation,
              ...(isPivot ? {
                sizeX: customAsset?.gridSizeX,
                sizeY: customAsset?.gridSizeY,
                scale: customAsset?.scale,
              } : {}),
            };
          }
          return cell;
        });

      } else if (activeTileType.startsWith('road_')) {
        const dir = activeTileType === 'road_h' ? 'horizontal'
                  : activeTileType === 'road_v' ? 'vertical' : 'cross';
        updatedCells = removeCellContent(updatedCells, r, c);
        updatedCells = updatedCells.map(cell =>
          cell.row === r && cell.col === c
            ? { ...cell, type: 'road' as const, roadDirection: dir }
            : cell
        );
      } else if (activeTileType === 'forest') {
        updatedCells = removeCellContent(updatedCells, r, c);
        updatedCells = updatedCells.map(cell =>
          cell.row === r && cell.col === c
            ? { ...cell, type: 'forest' as const }
            : cell
        );
      } else if (activeTileType === 'grass') {
        updatedCells = removeCellContent(updatedCells, r, c);
      }
      setGridCells(updatedCells);

    } else if (activeTool === 'remove') {
      const clicked = gridCells.find(cell => cell.row === r && cell.col === c);
      if (clicked && cellMatchesFilter(clicked)) {
        setGridCells(removeCellContent(updatedCells, r, c));
      }

    } else if (activeTool === 'move') {
      if (!pickedUpItem) {
        const target = gridCells.find(cell => cell.row === r && cell.col === c);
        if (!target || target.type === 'grass' || !cellMatchesFilter(target)) return;

        if (target.type === 'building') {
          const pivotR = target.buildingAnchor?.row ?? r;
          const pivotC = target.buildingAnchor?.col ?? c;
          const bAsset = modelAssets.find(a => a.id === target.buildingId);
          const pivotCell = gridCells.find(x => x.row === pivotR && x.col === pivotC);
          const customSizeX = pivotCell?.sizeX ?? (bAsset?.gridSizeX || 1);
          const customSizeY = pivotCell?.sizeY ?? (bAsset?.gridSizeY || 1);

          setPickedUpItem({
            type: 'building',
            buildingId:   target.buildingId,
            sizeX:        Math.max(1, customSizeX),
            sizeY:        Math.max(1, customSizeY),
            originalPivot: { row: pivotR, col: pivotC },
            buildingRotation: target.buildingRotation || 0,
            scale: pivotCell?.scale,
            scaleX: pivotCell?.scaleX,
            scaleY: pivotCell?.scaleY,
            scaleZ: pivotCell?.scaleZ,
            actionType: pivotCell?.actionType,
            actionTarget: pivotCell?.actionTarget,
          });
          setGridCells(removeCellContent(updatedCells, pivotR, pivotC));
        } else if (target.type === 'road') {
          setPickedUpItem({ type: 'road', roadDirection: target.roadDirection });
          setGridCells(updatedCells.map(cell =>
            cell.row === r && cell.col === c
              ? { ...cell, type: 'grass' as const, roadDirection: null }
              : cell
          ));
        } else if (target.type === 'forest') {
          setPickedUpItem({ type: 'forest' });
          setGridCells(updatedCells.map(cell =>
            cell.row === r && cell.col === c
              ? { ...cell, type: 'grass' as const }
              : cell
          ));
        }

      } else {
        if (pickedUpItem.type === 'building' && pickedUpItem.buildingId) {
          const rotVal = (pickedUpItem.buildingRotation === 90 || pickedUpItem.buildingRotation === 180 || pickedUpItem.buildingRotation === 270) ? pickedUpItem.buildingRotation : 0;
          const isSwapped = rotVal === 90 || rotVal === 270;
          const pickedSizeX = Math.max(1, isSwapped ? pickedUpItem.sizeY || 1 : pickedUpItem.sizeX || 1);
          const pickedSizeY = Math.max(1, isSwapped ? pickedUpItem.sizeX || 1 : pickedUpItem.sizeY || 1);

          // TAŞIMA HATASI (SLIP FIX): Drop işlemini de ofsetli noktaya (ghostRow, ghostCol) yap.
          const ghostRow = r - (pickedUpItem.clickOffset?.row || 0);
          const ghostCol = c - (pickedUpItem.clickOffset?.col || 0);

          if (!checkFootprintFit(updatedCells, ghostRow, ghostCol, pickedSizeX, pickedSizeY, pickedUpItem.originalPivot)) {
            setAlertMsg({ text: 'Buraya yerleştirilemez — alan dolu!', type: 'error' });
            return;
          }
          for (let dr = 0; dr < pickedSizeY; dr++)
            for (let dc = 0; dc < pickedSizeX; dc++)
              updatedCells = removeCellContent(updatedCells, ghostRow + dr, ghostCol + dc);
          updatedCells = updatedCells.map(cell => {
            const dr = cell.row - ghostRow;
            const dc = cell.col - ghostCol;
            if (dr >= 0 && dr < pickedSizeY && dc >= 0 && dc < pickedSizeX) {
              const isPivot = dr === 0 && dc === 0;
              return {
                ...cell,
                type:            'building' as const,
                buildingId:      pickedUpItem.buildingId!,
                isBuildingPivot: isPivot,
                buildingAnchor:  { row: ghostRow, col: ghostCol },
                roadDirection:   null,
                buildingRotation: rotVal,
                ...(isPivot ? {
                  sizeX: pickedUpItem.sizeX,
                  sizeY: pickedUpItem.sizeY,
                  scale: pickedUpItem.scale,
                  scaleX: pickedUpItem.scaleX,
                  scaleY: pickedUpItem.scaleY,
                  scaleZ: pickedUpItem.scaleZ,
                  actionType: pickedUpItem.actionType,
                  actionTarget: pickedUpItem.actionTarget,
                } : {})
              };
            }
            return cell;
          });
          setGridCells(updatedCells);
          setPickedUpItem(null);
          const newPivot = updatedCells.find(cell => cell.row === ghostRow && cell.col === ghostCol) || null;
          setSelectedCell(newPivot);
          setActiveTool('select');

        } else if (pickedUpItem.type === 'road') {
          updatedCells = removeCellContent(updatedCells, r, c);
          setGridCells(updatedCells.map(cell =>
            cell.row === r && cell.col === c
              ? { ...cell, type: 'road' as const, roadDirection: pickedUpItem.roadDirection }
              : cell
          ));
          setPickedUpItem(null);

        } else if (pickedUpItem.type === 'forest') {
          updatedCells = removeCellContent(updatedCells, r, c);
          setGridCells(updatedCells.map(cell =>
            cell.row === r && cell.col === c
              ? { ...cell, type: 'forest' as const }
              : cell
          ));
          setPickedUpItem(null);
        }
      }
    }
  }, [activeTool, activeTileType, activeRotation, gridCells, gridSize, modelAssets, pickedUpItem, checkFootprintFit, removeCellContent, cellMatchesFilter]);

  /**
   * Isometric painter-algorithm sort:
   * Primary key:   row + col   (tiles farther back rendered first)
   * Secondary key: col         (same depth: left-to-right)
   * This ensures correct visual layering without z-fighting.
   */
  const sortedCells = useMemo(() => {
    return [...gridCells].sort((a, b) => {
      const depthDiff = (a.row + a.col) - (b.row + b.col);
      return depthDiff !== 0 ? depthDiff : a.col - b.col;
    });
  }, [gridCells]);

  // Keydown listener for 'R' to rotate building
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return; // ignore while typing
        }
        if (activeTool === 'place') {
          setActiveRotation(prev => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
        } else if (activeTool === 'move' && pickedUpItem && pickedUpItem.type === 'building') {
          setPickedUpItem(prev => {
            if (!prev) return null;
            const newRot = (((prev.buildingRotation || 0) + 90) % 360) as 0 | 90 | 180 | 270;
            return {
              ...prev,
              buildingRotation: newRot,
            };
          });
        } else if (activeTool === 'select') {
          rotateSelectedCell();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, pickedUpItem, rotateSelectedCell]);

  return {
    // Tab state
    activeTab, setActiveTab,
    // Cities
    cities, loadingCities, citiesSearch, setCitiesSearch,
    citiesPage, setCitiesPage, citiesTotalPages, citiesTotalCount,
    handleSearchSubmit,
    // Custom Maps
    customMaps, loadingMaps, fetchCustomMaps,
    // Create Map Modal
    isCreateModalOpen, setIsCreateModalOpen, newMapName, setNewMapName, newMapGridSize, setNewMapGridSize,
    handleCreateMap, handleDeleteMap,
    // Assign Modal
    isAssignModalOpen, setIsAssignModalOpen, assigningDistrict, assigningMapId, setAssigningMapId,
    openAssignModal, handleSaveAssignment,
    // Editor
    editingMap, enterDesignMode, exitDesignMode,
    gridCells, setGridCells, sortedCells,
    savingMap, handleSaveDesign,
    activeTool, setActiveTool,
    activeTileType, setActiveTileType,
    activeRotation, setActiveRotation,
    pickedUpItem, setPickedUpItem,
    hoveredCell, setHoveredCell,
    selectedCell, setSelectedCell,
    rotateSelectedCell, moveSelectedCell, removeSelectedCell,
    updateSelectedCellProperties,
    alertMsg,
    activeLayerFilter, setActiveLayerFilter,

    // Models
    modelAssets, modelCategories,
    activePaletteCategory, setActivePaletteCategory,
    updateModelAssetScale,
    // Helpers
    gridSize, tileWidth, tileHeight,
    getIsoCoords, checkFootprintFit,
    getBuildingParamsLocal, getBuildingPivotToRenderAt,
    handleCellClick,
  };
}
