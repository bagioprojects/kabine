import type { IsometricObject } from './types';
import { TILE_W, TILE_H, GRID_SIZE } from './types';
import { drawRoom, themeColors } from './scenes/officeRooms';
import { drawIsometricObject } from './objects/objectRenderer';
import { drawCharacter } from './characters/characterRenderer';

export function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  officeType: 'coal' | 'auto' | 'defense' | 'president',
  officeObjects: IsometricObject[],
  charX: number,
  charY: number,
  facing: 'left' | 'right',
  walkBob: number,
  isSitting: boolean,
  spriteSheet: HTMLImageElement | null,
  chairBackImg: HTMLImageElement | null,
  selectedObject: IsometricObject | null,
  isMovingObject: boolean,
  isEditingLayout: boolean,
  bossBubbleText: string,
  staffABubbleText: string,
  staffBBubbleText: string,
  targetX: number,
  targetY: number,
  staffACoord: { x: number; y: number },
  staffBCoord: { x: number; y: number },
  gender: string | null = null,
  isometricModelId: string | null = null
) {
  ctx.clearRect(0, 0, width, height);
  void isMovingObject;

  // Dynamic Scale Factor to fit the 550x350 design to any screen size
  const scaleFactor = Math.min(width / 550, height / 350);
  const translateX = (width - 550 * scaleFactor) / 2;
  const translateY = (height - 350 * scaleFactor) / 2;

  ctx.save();
  ctx.translate(translateX, translateY);
  ctx.scale(scaleFactor, scaleFactor);

  // Virtual design dimensions
  const virtualWidth = 550;
  const virtualHeight = 350;
  const centerX = virtualWidth / 2;
  const centerY = virtualHeight / 2.8;

  const getIsoScreenPos = (gx: number, gy: number) => ({
    x: centerX + (gx - gy) * (TILE_W / 2),
    y: centerY + (gx + gy) * (TILE_H / 2)
  });

  const p00 = getIsoScreenPos(0, 0);
  const p80 = getIsoScreenPos(GRID_SIZE, 0);
  const p08 = getIsoScreenPos(0, GRID_SIZE);
  const wallHeight = 120;

  // 1 & 2. Draw Walls, baseboards and door/flag using modular drawRoom
  drawRoom(ctx, officeType, p00, p80, p08, wallHeight, getIsoScreenPos);

  // 3. Render Floor Grid
  const theme = themeColors[officeType];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const pt = getIsoScreenPos(x, y);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + TILE_W / 2, pt.y + TILE_H / 2);
      ctx.lineTo(pt.x, pt.y + TILE_H);
      ctx.lineTo(pt.x - TILE_W / 2, pt.y + TILE_H / 2);
      ctx.closePath();

      ctx.fillStyle = (x + y) % 2 === 0 ? theme.floorAlt1 : theme.floorAlt2;
      ctx.fill();

      if (officeType === 'coal') {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x - TILE_W / 4, pt.y + TILE_H / 4);
        ctx.lineTo(pt.x + TILE_W / 4, pt.y + TILE_H / 4 * 3);
        ctx.stroke();
      } else {
        ctx.strokeStyle = theme.jointColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Active Click/Movement Target Indicator
  const isMoving = Math.abs(charX - targetX) > 0.05 || Math.abs(charY - targetY) > 0.05;
  if (isMoving) {
    const targetPos = getIsoScreenPos(targetX, targetY);
    ctx.beginPath();
    ctx.ellipse(targetPos.x, targetPos.y + TILE_H / 2, TILE_W / 3, TILE_H / 3, 0, 0, Math.PI * 2);
    ctx.fillStyle =
      officeType === 'defense'
        ? 'rgba(16, 185, 129, 0.15)'
        : officeType === 'president'
        ? 'rgba(245, 158, 11, 0.15)'
        : 'rgba(6, 182, 212, 0.15)';
    ctx.fill();
    ctx.strokeStyle = officeType === 'defense' ? '#10b981' : officeType === 'president' ? '#f59e0b' : '#06b6d4';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Speech Bubble Drawing Function
  const drawSpeechBubble = (c: CanvasRenderingContext2D, cx: number, cy: number, text: string, strokeColor: string) => {
    c.font = 'bold 11px sans-serif';
    const padding = 10;
    const metrics = c.measureText(text);
    const textW = metrics.width;
    const bW = Math.max(140, textW + padding * 2);
    const bH = 28;
    const bx = cx - bW / 2;
    const by = cy - 75;

    c.fillStyle = 'rgba(15, 23, 42, 0.95)';
    c.strokeStyle = strokeColor;
    c.lineWidth = 1.5;

    const r = 8;
    c.beginPath();
    c.moveTo(bx + r, by);
    c.lineTo(bx + bW - r, by);
    c.quadraticCurveTo(bx + bW, by, bx + bW, by + r);
    c.lineTo(bx + bW, by + bH - r);
    c.quadraticCurveTo(bx + bW, by + bH, bx + bW - r, by + bH);
    c.lineTo(cx + 6, by + bH);
    c.lineTo(cx, by + bH + 7);
    c.lineTo(cx - 6, by + bH);
    c.lineTo(bx + r, by + bH);
    c.quadraticCurveTo(bx, by + bH, bx, by + bH - r);
    c.lineTo(bx, by + r);
    c.quadraticCurveTo(bx, by, bx + r, by);
    c.closePath();
    c.fill();
    c.stroke();

    c.fillStyle = '#ffffff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, cx, by + bH / 2);
  };

  // 4. Populate Depth-sorted Draw Queue
  const drawQueue: any[] = [];

  officeObjects.forEach(obj => {
    const pos = getIsoScreenPos(obj.x, obj.y);
    const isChair =
      obj.id === 'chair' || obj.id === 'chair_staff_a' || obj.id === 'chair_staff_b' || obj.id === 'office_chair';
    drawQueue.push({
      type: 'object',
      depth: obj.x + obj.y + (isChair ? -0.05 : 0),
      x: obj.x,
      y: obj.y,
      screenX: pos.x,
      screenY: pos.y + TILE_H / 2,
      ref: obj
    });
  });

  // Staff A Costume
  const staffAColors = {
    coal: { base: '#d97706', head: '#fed7aa', helmet: true },
    auto: { base: '#0284c7', head: '#fed7aa', glasses: true },
    defense: { base: '#166534', head: '#fed7aa', headset: true },
    president: { base: '#0f172a', head: '#fed7aa', glasses: true } // Bodyguard
  }[officeType];

  const staffAPos = getIsoScreenPos(staffACoord.x, staffACoord.y);
  drawQueue.push({
    type: 'employee',
    id: 'staff_a',
    depth: staffACoord.x + staffACoord.y + 0.1,
    x: staffACoord.x,
    y: staffACoord.y,
    screenX: staffAPos.x,
    screenY: staffAPos.y + TILE_H / 2 + 5,
    isSitting: true,
    theme: staffAColors,
    dialogue: officeType === 'president' ? 'Koruma Şefi' : 'Danışman'
  });

  // Staff B Costume
  const staffBColors = {
    coal: { base: '#be185d', head: '#fbcfe8', glasses: true },
    auto: { base: '#0891b2', head: '#fbcfe8', airpods: true },
    defense: { base: '#475569', head: '#fbcfe8', glasses: true },
    president: { base: '#be185d', head: '#fbcfe8', glasses: true } // Special Assistant
  }[officeType];

  const staffBPos = getIsoScreenPos(staffBCoord.x, staffBCoord.y);
  drawQueue.push({
    type: 'employee',
    id: 'staff_b',
    depth: staffBCoord.x + staffBCoord.y + 0.1,
    x: staffBCoord.x,
    y: staffBCoord.y,
    screenX: staffBPos.x,
    screenY: staffBPos.y + TILE_H / 2 + 5,
    isSitting: true,
    theme: staffBColors,
    dialogue: officeType === 'president' ? 'Özel Kalem Müdürü' : 'Sekreter'
  });

  // Player Character
  const charScreenPos = getIsoScreenPos(charX, charY);
  const finalScreenY = isSitting
    ? charScreenPos.y + TILE_H / 2 + 5
    : charScreenPos.y + TILE_H / 2 - walkBob;

  drawQueue.push({
    type: 'character',
    depth: isSitting ? charX + charY + 0.1 : charX + charY,
    x: charX,
    y: charY,
    screenX: charScreenPos.x,
    screenY: finalScreenY,
    origScreenY: charScreenPos.y + TILE_H / 2,
    isSitting: isSitting
  });

  // Depth-sorting
  drawQueue.sort((a, b) => a.depth - b.depth);

  // Draw queue execution
  drawQueue.forEach(item => {
    if (item.type === 'object') {
      drawIsometricObject(ctx, item, selectedObject, isEditingLayout, spriteSheet, chairBackImg);
    } else if (item.type === 'employee' || item.type === 'character') {
      drawCharacter(
        ctx,
        item,
        officeType,
        facing,
        isMoving,
        gender,
        isometricModelId
      );

      // Render Speech bubbles after drawing character/employees
      if (item.type === 'character' && bossBubbleText) {
        drawSpeechBubble(ctx, item.screenX, item.screenY + (item.isSitting ? 8 : 0), bossBubbleText, officeType === 'president' ? '#f59e0b' : '#06b6d4');
      } else if (item.type === 'employee') {
        let employeeBubble = '';
        if (item.id === 'staff_a' && staffABubbleText) employeeBubble = staffABubbleText;
        if (item.id === 'staff_b' && staffBBubbleText) employeeBubble = staffBBubbleText;
        if (employeeBubble) {
          drawSpeechBubble(ctx, item.screenX, item.screenY, employeeBubble, '#38bdf8');
        }
      }
    }
  });

  ctx.restore();
}
