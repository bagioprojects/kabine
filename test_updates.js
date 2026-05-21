const gridCells = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    gridCells.push({ row: r, col: c, type: 'grass', buildingId: null, isBuildingPivot: false, buildingAnchor: null });
  }
}

// 3x3 footprint
for (let dr = 0; dr < 3; dr++) {
  for (let dc = 0; dc < 3; dc++) {
    const isPivot = dr === 0 && dc === 0;
    const cell = gridCells.find(c => c.row === dr && c.col === dc);
    cell.type = 'building';
    cell.buildingId = '123';
    cell.isBuildingPivot = isPivot;
    cell.buildingAnchor = { row: 0, col: 0 };
    if (isPivot) {
      cell.sizeX = 3;
      cell.sizeY = 3;
    }
  }
}

let updatedCells = [...gridCells];
const selectedCell = gridCells.find(c => c.row === 0 && c.col === 0);
const updates = { sizeX: 2 };
const newSizeX = 2;
const newSizeY = 3;

const removeCellContent = (cells, r, c) => {
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
      return { ...cell, type: 'grass', buildingId: null, isBuildingPivot: false, buildingAnchor: null };
    }
    return cell;
  });
};

for (let dr = 0; dr < 3; dr++) {
  for (let dc = 0; dc < 3; dc++) {
    if (dr !== 0 || dc !== 0) {
      updatedCells = removeCellContent(updatedCells, selectedCell.row + dr, selectedCell.col + dc);
    }
  }
}

for (let dr = 0; dr < newSizeY; dr++) {
  for (let dc = 0; dc < newSizeX; dc++) {
    updatedCells = removeCellContent(updatedCells, selectedCell.row + dr, selectedCell.col + dc);
  }
}

updatedCells = updatedCells.map(cell => {
  const dr = cell.row - selectedCell.row;
  const dc = cell.col - selectedCell.col;
  if (dr >= 0 && dr < newSizeY && dc >= 0 && dc < newSizeX) {
    const isPivot = dr === 0 && dc === 0;
    return {
      ...cell,
      type: 'building',
      buildingId: selectedCell.buildingId,
      isBuildingPivot: isPivot,
      buildingAnchor: { row: selectedCell.row, col: selectedCell.col },
      ...(isPivot ? { ...selectedCell, ...updates } : {}),
    };
  }
  return cell;
});

console.log("Building cells in new grid:");
updatedCells.filter(c => c.type === 'building').forEach(c => console.log(c.row, c.col, c.sizeX, c.sizeY));
