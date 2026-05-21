export interface PathNode {
  x: number;
  y: number;
  path: { x: number; y: number }[];
}

export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  gridSize: number,
  obstacles: { x: number; y: number; nonBlocking?: boolean }[],
  additionalBlocked?: (x: number, y: number) => boolean
): { x: number; y: number }[] {
  if (startX === endX && startY === endY) return [];

  const queue: PathNode[] = [{ x: startX, y: startY, path: [] }];
  const visited = new Set<string>();
  visited.add(`${startX},${startY}`);

  const isBlocked = (gx: number, gy: number) => {
    if (gx < 0 || gx >= gridSize || gy < 0 || gy >= gridSize) return true;
    if (additionalBlocked && additionalBlocked(gx, gy)) return true;
    
    return obstacles.some(obj => obj.x === gx && obj.y === gy && !obj.nonBlocking);
  };

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    if (x === endX && y === endY) return path;

    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    for (const d of directions) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && !isBlocked(nx, ny)) {
        visited.add(key);
        queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
      }
    }
  }

  return [];
}
