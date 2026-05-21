
// ─── Types ────────────────────────────────────────────────────────────────────

export interface GridCell {
  row: number;
  col: number;
  type: 'grass' | 'road' | 'forest' | 'building';
  roadDirection?: 'horizontal' | 'vertical' | 'cross' | null;
  buildingId?: string | null;
  isBuildingPivot?: boolean;
  buildingAnchor?: { row: number; col: number } | null;
  buildingRotation?: 0 | 90 | 180 | 270 | null;
  sizeX?: number;
  sizeY?: number;
  scale?: number; // legacy uniform scale fallback
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  actionType?: 'none' | 'navigate_map' | 'open_modal';
  actionTarget?: string;
}


export interface CustomMapData {
  id: string;
  name: string;
  gridSize: number;
  gridCells: GridCell[];
  createdAt: string;
  updatedAt: string;
}

export interface DistrictListItem {
  id: number;
  name: string;
  provinceId: number;
  provinceName: string;
  residentCount: number;
  mapStatus: string;
  assignedMapId: string | null;
  assignedMapName: string | null;
}

export interface ModelAsset {
  id: string;
  name: string;
  modelType: string;
  fileUrl: string;
  textureUrl: string | null;
  thumbnailUrl: string | null;
  gridSizeX: number;
  gridSizeY: number;
  scale: number;
  isResizable: boolean;
  categoryId: string;
  category: { id: string; name: string };
}

export interface ModelCategory {
  id: string;
  name: string;
}

export type ActiveTool = 'select' | 'place' | 'move' | 'remove';

export interface PickedUpItem {
  type: 'building' | 'road' | 'forest';
  buildingId?: string | null;
  roadDirection?: 'horizontal' | 'vertical' | 'cross' | null;
  sizeX?: number;
  sizeY?: number;
  originalPivot?: { row: number; col: number };
  buildingRotation?: 0 | 90 | 180 | 270 | null;
  clickOffset?: { row: number; col: number };
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  actionType?: 'none' | 'navigate_map' | 'open_modal';
  actionTarget?: string;
}


// ─── Building Visual Params ───────────────────────────────────────────────────
// NOTE: All building visuals are now driven by DB assets (ModelAsset).
// This function provides a generic fallback for any unrecognized IDs (legacy support).

export interface BuildingParams {
  h: number;
  roof: string;
  right: string;
  left: string;
  name: string;
  textureId?: string | null;
}

/** Generic fallback — only used when a buildingId doesn't match any DB asset */
export const getBuildingParams = (_buildingId: string, ry: number): BuildingParams => ({
  h: ry * 1.5,
  roof: '#4b5563',
  right: '#6b7280',
  left: '#374151',
  name: 'Bina',
  textureId: null,
});
