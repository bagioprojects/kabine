export interface IsometricObject {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  desc: string;
  nonBlocking?: boolean;
  flipX?: boolean;
  direction?: number;
}

export interface SpriteFrame {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  offsetX: number;
  offsetY: number;
  dw: number;
  dh: number;
}

export interface FurnitureItem {
  name: string;
  price: number;
  category: 'ofis' | 'dekorasyon' | 'konfor' | 'guvenlik';
  desc: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface GridPoint {
  x: number;
  y: number;
}

export const TILE_W = 60;
export const TILE_H = 30;
export const GRID_SIZE = 8;
