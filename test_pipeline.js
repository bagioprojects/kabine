const cells = [];
for (let r=0; r<5; r++) {
  for(let c=0; c<5; c++) {
    cells.push({ row: r, col: c, type: 'grass' });
  }
}

// 1. handleCellClick (add)
const r = 2; const c = 2;
const assetSizeX = 3; const assetSizeY = 3;
let gridCells = [...cells];
for (let dr = 0; dr < assetSizeY; dr++) {
  for (let dc = 0; dc < assetSizeX; dc++) {
    const isPivot = dr === 0 && dc === 0;
    const targetCell = gridCells.find(x => x.row === r + dr && x.col === c + dc);
    if (targetCell) {
      targetCell.type = 'building';
      targetCell.buildingId = '123';
      targetCell.isBuildingPivot = isPivot;
      targetCell.buildingAnchor = { row: r, col: c };
      targetCell.buildingRotation = 0;
      if (isPivot) {
        targetCell.sizeX = assetSizeX;
        targetCell.sizeY = assetSizeY;
        targetCell.scale = 1;
      }
    }
  }
}

let selectedCell = gridCells.find(x => x.row === r && x.col === c);

// 2. updateSelectedCellProperties (scale only)
const updates = { scale: 2.5 };
const newSizeX = updates.sizeX ?? selectedCell.sizeX;
const newSizeY = updates.sizeY ?? selectedCell.sizeY;

// It's a normal update
gridCells = gridCells.map(c => 
  c.row === selectedCell.row && c.col === selectedCell.col ? { ...c, ...updates } : c
);
selectedCell = { ...selectedCell, ...updates };

// 3. deselectCell (Onayla button)
selectedCell = null;

// 4. sanitizeGridCells (On save / load)
const inBounds = (r, c) => r >= 0 && r < 5 && c >= 0 && c < 5;
const canonical = new Map();
const validPivots = [];

for (const cell of gridCells) {
  if (cell.type !== 'building' || !cell.isBuildingPivot) continue;
  const cellSizeX = cell.sizeX ?? 1;
  const cellSizeY = cell.sizeY ?? 1;
  
  validPivots.push({
    row: cell.row, col: cell.col, buildingId: cell.buildingId,
    sizeX: cellSizeX, sizeY: cellSizeY, scale: cell.scale
  });
}

console.log(validPivots);
