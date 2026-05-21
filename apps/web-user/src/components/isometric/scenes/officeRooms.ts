import { GRID_SIZE } from '../types';
import { shadeColor } from '../constants';

export const themeColors = {
  coal: {
    wallLeft: '#4b5563', // steel grey panels
    wallRight: '#374151',
    floorAlt1: '#854d0e', // dark wood floor
    floorAlt2: '#78350f',
    jointColor: 'rgba(0,0,0,0.15)',
  },
  auto: {
    wallLeft: '#1e1b4b', // deep siber tech indigo
    wallRight: '#111827',
    floorAlt1: '#0f172a', // cyber black carbon
    floorAlt2: '#1e293b',
    jointColor: 'rgba(6, 182, 212, 0.25)', // glowing cyan
  },
  defense: {
    wallLeft: '#064e3b', // tactical army green / black
    wallRight: '#022c22',
    floorAlt1: '#020617', // radar dark grids
    floorAlt2: '#0f172a',
    jointColor: 'rgba(16, 185, 129, 0.3)', // glowing green grids
  },
  president: {
    wallLeft: '#7f1d1d', // president rich crimson
    wallRight: '#991b1b',
    floorAlt1: '#fafaf9', // marble white
    floorAlt2: '#e4e4e7',
    jointColor: 'rgba(212, 163, 89, 0.12)', // subtle gold joints
  }
};

export function drawRoom(
  ctx: CanvasRenderingContext2D,
  officeType: 'coal' | 'auto' | 'defense' | 'president',
  p00: { x: number; y: number },
  p80: { x: number; y: number },
  p08: { x: number; y: number },
  wallHeight: number,
  getIsoScreenPos: (gx: number, gy: number) => { x: number; y: number }
) {
  const theme = themeColors[officeType];

  // 1. Render Left Wall
  ctx.fillStyle = theme.wallLeft;
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p80.x, p80.y);
  ctx.lineTo(p80.x, p80.y - wallHeight);
  ctx.lineTo(p00.x, p00.y - wallHeight);
  ctx.closePath();
  ctx.fill();

  // Wall Panel Grid Lines (Vertical columns on wall)
  if (officeType === 'president') {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
  } else {
    ctx.strokeStyle = officeType === 'defense' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
  }

  for (let i = 1; i < GRID_SIZE; i++) {
    const wallPoint = getIsoScreenPos(i, 0);
    ctx.beginPath();
    ctx.moveTo(wallPoint.x, wallPoint.y);
    ctx.lineTo(wallPoint.x, wallPoint.y - wallHeight);
    ctx.stroke();
  }

  // 3D Wall Thickness Top Face (gives thickness to Left Wall)
  const wallThickness = 6;
  const dyW = wallThickness * Math.sin(Math.PI / 6); // ~3px
  const dxW = wallThickness * Math.cos(Math.PI / 6); // ~5px

  ctx.fillStyle = shadeColor(theme.wallLeft, 18);
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y - wallHeight);
  ctx.lineTo(p80.x, p80.y - wallHeight);
  ctx.lineTo(p80.x - dxW, p80.y - wallHeight - dyW);
  ctx.lineTo(p00.x - dxW, p00.y - wallHeight - dyW);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left Wall Skirting Board (Baseboard) at the bottom
  const baseboardH = 6;
  if (officeType === 'president') {
    ctx.fillStyle = '#450a0a';
  } else {
    ctx.fillStyle = officeType === 'coal' ? '#3e2723' : officeType === 'auto' ? '#06b6d4' : '#059669';
  }
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p80.x, p80.y);
  ctx.lineTo(p80.x, p80.y - baseboardH);
  ctx.lineTo(p00.x, p00.y - baseboardH);
  ctx.closePath();
  ctx.fill();

  if (officeType === 'president') {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p00.x, p00.y - baseboardH);
    ctx.lineTo(p80.x, p80.y - baseboardH);
    ctx.stroke();
  }

  // 2. Render Right Wall
  ctx.fillStyle = theme.wallRight;
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p08.x, p08.y);
  ctx.lineTo(p08.x, p08.y - wallHeight);
  ctx.lineTo(p00.x, p00.y - wallHeight);
  ctx.closePath();
  ctx.fill();

  // 3D Wall Thickness Top Face (gives thickness to Right Wall)
  ctx.fillStyle = shadeColor(theme.wallRight, 18);
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y - wallHeight);
  ctx.lineTo(p08.x, p08.y - wallHeight);
  ctx.lineTo(p08.x + dxW, p08.y - wallHeight - dyW);
  ctx.lineTo(p00.x + dxW, p00.y - wallHeight - dyW);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right Wall Skirting Board (Baseboard) at the bottom
  if (officeType === 'president') {
    ctx.fillStyle = '#450a0a';
  } else {
    ctx.fillStyle = officeType === 'coal' ? '#2d1510' : officeType === 'auto' ? '#0891b2' : '#047857';
  }
  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p08.x, p08.y);
  ctx.lineTo(p08.x, p08.y - baseboardH);
  ctx.lineTo(p00.x, p00.y - baseboardH);
  ctx.closePath();
  ctx.fill();

  if (officeType === 'president') {
    ctx.beginPath();
    ctx.moveTo(p00.x, p00.y - baseboardH);
    ctx.lineTo(p08.x, p08.y - baseboardH);
    ctx.stroke();
  }

  // Right Wall Details (Door or Turkish Flag)
  if (officeType === 'president') {
    // Turkish Flag on the wall
    const p03 = getIsoScreenPos(0, 3);
    const p07 = getIsoScreenPos(0, 7);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(p03.x, p03.y - 90);
    ctx.lineTo(p07.x, p07.y - 70);
    ctx.lineTo(p07.x, p07.y - 20);
    ctx.lineTo(p03.x, p03.y - 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crescent and Star (Gold-tinted/White)
    const flagCenterX = (p03.x + p07.x) / 2;
    const flagCenterY = (p03.y + p07.y) / 2 - 55;
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.arc(flagCenterX, flagCenterY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#991b1b'; // matches wall shadow
    ctx.beginPath();
    ctx.arc(flagCenterX + 2.5, flagCenterY, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fafafa';
    ctx.font = '10px sans-serif';
    ctx.fillText('★', flagCenterX + 4, flagCenterY + 3);
  } else {
    // Standard Door
    const doorStartY = 3.0; // grid y
    const doorEndY = 5.0;   // grid y
    const doorH = 80;       // height of door in pixels

    const dLeft = getIsoScreenPos(0, doorStartY);
    const dRight = getIsoScreenPos(0, doorEndY);

    // Door Frame
    ctx.fillStyle = officeType === 'coal' ? '#1c1917' : officeType === 'auto' ? '#0f172a' : '#020617';
    ctx.beginPath();
    ctx.moveTo(dLeft.x - 2, dLeft.y + 1);
    ctx.lineTo(dRight.x + 2, dRight.y - 1);
    ctx.lineTo(dRight.x + 2, dRight.y - doorH - 2);
    ctx.lineTo(dLeft.x - 2, dLeft.y - doorH - 2);
    ctx.closePath();
    ctx.fill();

    // Door Inner (Glass/Wood)
    ctx.fillStyle = officeType === 'coal' ? '#451a03' : officeType === 'auto' ? 'rgba(6, 182, 212, 0.15)' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(dLeft.x, dLeft.y);
    ctx.lineTo(dRight.x, dRight.y);
    ctx.lineTo(dRight.x, dRight.y - doorH);
    ctx.lineTo(dLeft.x, dLeft.y - doorH);
    ctx.closePath();
    ctx.fill();

    // Door Handle
    const handleMid = getIsoScreenPos(0, doorStartY + 0.3);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(handleMid.x, handleMid.y - doorH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
