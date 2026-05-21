/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IsoTransformer  —  Isometric Coordinate Transformer
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Platform-agnostic, pure TypeScript utility.
 *  No React, no DOM, no side effects — importable in web, React Native, Node.
 *
 *  Isometric coordinate system used:
 *    ┌─────────────────────────────────────────────┐
 *    │       Back (row=0, col=0)                   │
 *    │      ╱  ╲                                   │
 *    │     ╱    ╲   Right (row=0, col=N)           │
 *    │    ╲    ╱                                   │
 *    │     ╲  ╱   Front (row=N, col=N)             │
 *    │  Left (row=N, col=0)                        │
 *    └─────────────────────────────────────────────┘
 *
 *  Grid → Screen:
 *    x = (col - row) * (tileWidth  / 2) + originX
 *    y = (col + row) * (tileHeight / 2) + originY
 *
 *  Screen → Grid (with floor-snapping):
 *    col = ⌊ dx/tileWidth  + dy/tileHeight ⌋
 *    row = ⌊ dy/tileHeight − dx/tileWidth  ⌋
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** A point in SVG / canvas / screen pixel space. */
export interface ScreenPoint {
  x: number;
  y: number;
}

/** A position in isometric grid space. */
export interface GridPoint {
  row: number;
  col: number;
}

/**
 * Tile configuration — the single source of truth for the isometric grid.
 * Change these values and every calculation updates automatically.
 */
export interface TileConfig {
  /** Width of one tile diamond in pixels (horizontal span). */
  tileWidth: number;
  /** Height of one tile diamond in pixels (vertical span ≈ tileWidth / 2 for classic 2:1 iso). */
  tileHeight: number;
  /** Canvas X offset for the top-back corner (row=0, col=0). */
  originX: number;
  /** Canvas Y offset for the top-back corner (row=0, col=0). */
  originY: number;
  /** Total number of rows/columns in the grid (assumed square). */
  gridSize: number;
}

/** The four diamond vertices + centre of a single tile. */
export interface TileDiamond {
  top:    ScreenPoint;
  right:  ScreenPoint;
  bottom: ScreenPoint;
  left:   ScreenPoint;
  center: ScreenPoint;
}

/** Axis-aligned bounding box for a building footprint in screen space. */
export interface FootprintBounds {
  x:      number;  // left edge
  y:      number;  // top edge (includes vertical height above base)
  width:  number;
  height: number;
}

// ─── Core Class ──────────────────────────────────────────────────────────────

export class IsoTransformer {
  /**
   * Grid cell → centre point on screen.
   * The returned point is the diamond centre (not a vertex).
   */
  static gridToScreen(grid: GridPoint, config: TileConfig): ScreenPoint {
    return {
      x: (grid.col - grid.row) * (config.tileWidth  / 2) + config.originX,
      y: (grid.col + grid.row) * (config.tileHeight / 2) + config.originY,
    };
  }

  /**
   * Screen pixel → nearest grid cell (floor-snapping).
   * Returns a clamped value so it's always within the grid.
   */
  static screenToGrid(screen: ScreenPoint, config: TileConfig): GridPoint {
    const dx = screen.x - config.originX;
    const dy = screen.y - config.originY;
    const tw = config.tileWidth;
    const th = config.tileHeight;
    const col = Math.floor(dx / tw + dy / th);
    const row = Math.floor(dy / th - dx / tw);
    return {
      row: Math.max(0, Math.min(config.gridSize - 1, row)),
      col: Math.max(0, Math.min(config.gridSize - 1, col)),
    };
  }

  /**
   * Returns the 4 diamond vertices + centre for a single tile.
   * Useful for drawing hit regions, outlines, highlights.
   */
  static getTileDiamond(grid: GridPoint, config: TileConfig): TileDiamond {
    const { x, y } = this.gridToScreen(grid, config);
    const rx = config.tileWidth  / 2;
    const ry = config.tileHeight / 2;
    return {
      top:    { x,      y: y - ry },
      right:  { x: x + rx, y      },
      bottom: { x,      y: y + ry },
      left:   { x: x - rx, y      },
      center: { x,      y         },
    };
  }

  /**
   * Returns the SVG `points` attribute string for a tile diamond.
   * e.g. `"500,110 545,125 500,140 455,125"`
   */
  static getTilePoints(grid: GridPoint, config: TileConfig): string {
    const { top, right, bottom, left } = this.getTileDiamond(grid, config);
    return `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;
  }

  /**
   * Returns the SVG polygon points string for a multi-cell footprint outline.
   * Useful for drawing hover highlights over large buildings.
   */
  static getFootprintPoints(
    pivot: GridPoint,
    sizeX: number,
    sizeY: number,
    config: TileConfig,
  ): string {
    const rx = config.tileWidth  / 2;
    const ry = config.tileHeight / 2;
    const back  = this.gridToScreen(pivot, config);
    const left  = this.gridToScreen({ row: pivot.row + sizeY - 1, col: pivot.col }, config);
    const right = this.gridToScreen({ row: pivot.row, col: pivot.col + sizeX - 1 }, config);
    const front = this.gridToScreen({ row: pivot.row + sizeY - 1, col: pivot.col + sizeX - 1 }, config);
    return [
      `${back.x},${back.y - ry}`,
      `${right.x + rx},${right.y}`,
      `${front.x},${front.y + ry}`,
      `${left.x - rx},${left.y}`,
    ].join(' ');
  }

  /**
   * Axis-aligned bounding box for a building footprint in screen space.
   * Includes `buildingHeight` upward (buildings rise above the base).
   * Add `padding` for a comfortable visual margin.
   *
   * Use this to size/position an HTML overlay (foreignObject, div, etc.)
   * that wraps a 3D model viewer over the building.
   */
  static getFootprintBounds(
    pivot: GridPoint,
    sizeX: number,
    sizeY: number,
    config: TileConfig,
    buildingHeight: number = 0,
    padding: number = 0,
  ): FootprintBounds {
    const rx = config.tileWidth  / 2;
    const ry = config.tileHeight / 2;

    const back  = this.gridToScreen(pivot, config);
    const left  = this.gridToScreen({ row: pivot.row + sizeY - 1, col: pivot.col }, config);
    const right = this.gridToScreen({ row: pivot.row, col: pivot.col + sizeX - 1 }, config);
    const front = this.gridToScreen({ row: pivot.row + sizeY - 1, col: pivot.col + sizeX - 1 }, config);

    const minX = left.x - rx - padding;
    const maxX = right.x + rx + padding;
    const minY = back.y  - ry - buildingHeight - padding;
    const maxY = front.y + ry + padding;

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /**
   * Check whether a grid point falls within the grid bounds.
   */
  static inBounds(grid: GridPoint, config: TileConfig): boolean {
    return grid.row >= 0 && grid.row < config.gridSize
        && grid.col >= 0 && grid.col < config.gridSize;
  }

  /**
   * Returns true if the entire sizeX×sizeY footprint fits inside the grid.
   */
  static footprintFits(
    pivot: GridPoint,
    sizeX: number,
    sizeY: number,
    config: TileConfig,
  ): boolean {
    return (
      pivot.row >= 0 &&
      pivot.col >= 0 &&
      pivot.row + sizeY - 1 < config.gridSize &&
      pivot.col + sizeX - 1 < config.gridSize
    );
  }

  /**
   * Convenience: build a TileConfig from grid/canvas parameters.
   */
  static makeConfig(
    tileWidth: number,
    gridSize: number,
    originX: number,
    originY: number,
  ): TileConfig {
    return {
      tileWidth,
      tileHeight: tileWidth / 2,   // classic 2:1 isometric ratio
      originX,
      originY,
      gridSize,
    };
  }
}

// ─── React Hook ──────────────────────────────────────────────────────────────

/**
 * `useIsoTransformer` — thin React hook that binds a TileConfig to all
 * IsoTransformer methods, so you don't have to pass `config` everywhere.
 *
 * @example
 * const iso = useIsoTransformer({ tileWidth: 90, tileHeight: 45, originX: 500, originY: 125, gridSize: 10 });
 * const { x, y } = iso.gridToScreen({ row: 2, col: 3 });
 */
export function useIsoTransformer(config: TileConfig) {
  return {
    config,
    gridToScreen:      (g: GridPoint) => IsoTransformer.gridToScreen(g, config),
    screenToGrid:      (s: ScreenPoint) => IsoTransformer.screenToGrid(s, config),
    getTileDiamond:    (g: GridPoint) => IsoTransformer.getTileDiamond(g, config),
    getTilePoints:     (g: GridPoint) => IsoTransformer.getTilePoints(g, config),
    getFootprintPoints:(pivot: GridPoint, sx: number, sy: number) => IsoTransformer.getFootprintPoints(pivot, sx, sy, config),
    getFootprintBounds:(pivot: GridPoint, sx: number, sy: number, h?: number, pad?: number) => IsoTransformer.getFootprintBounds(pivot, sx, sy, config, h, pad),
    inBounds:          (g: GridPoint) => IsoTransformer.inBounds(g, config),
    footprintFits:     (pivot: GridPoint, sx: number, sy: number) => IsoTransformer.footprintFits(pivot, sx, sy, config),
  };
}
