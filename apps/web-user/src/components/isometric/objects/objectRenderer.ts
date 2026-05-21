import type { IsometricObject } from '../types';
import { TILE_W, TILE_H } from '../types';
import { SPRITE_ATLAS } from '../constants';

export function drawIsometricObject(
  ctx: CanvasRenderingContext2D,
  item: any,
  selectedObject: IsometricObject | null,
  isEditingLayout: boolean,
  spriteSheet: HTMLImageElement | null,
  chairBackImg: HTMLImageElement | null
) {
  const obj = item.ref;
  if (!obj) return;

  // Selection Highlight
  if (
    isEditingLayout &&
    selectedObject &&
    selectedObject.x === obj.x &&
    selectedObject.y === obj.y &&
    selectedObject.id === obj.id
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(item.screenX, item.screenY - TILE_H / 2);
    ctx.lineTo(item.screenX + TILE_W / 2, item.screenY);
    ctx.lineTo(item.screenX, item.screenY + TILE_H / 2);
    ctx.lineTo(item.screenX - TILE_W / 2, item.screenY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pulsing Ring
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.08;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(item.screenX, item.screenY, (TILE_W / 2) * pulse, (TILE_H / 2) * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Sprite Sheet Rendering
  const sprite = SPRITE_ATLAS[obj.id];
  if (sprite && spriteSheet) {
    const direction = typeof obj.direction === 'number' ? obj.direction : (obj.flipX ? 1 : 0);
    const isBackChair =
      (obj.id === 'chair' ||
        obj.id === 'office_chair' ||
        obj.id === 'chair_staff_a' ||
        obj.id === 'chair_staff_b') &&
      (direction === 2 || direction === 3);

    if (isBackChair && chairBackImg) {
      ctx.save();
      const dw = 50;
      const dh = 50;
      const offsetX = -25;
      const offsetY = -45;

      if (direction === 3) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          chairBackImg,
          0,
          0,
          chairBackImg.width,
          chairBackImg.height,
          -(item.screenX + offsetX) - dw,
          item.screenY + offsetY,
          dw,
          dh
        );
      } else {
        ctx.drawImage(
          chairBackImg,
          0,
          0,
          chairBackImg.width,
          chairBackImg.height,
          item.screenX + offsetX,
          item.screenY + offsetY,
          dw,
          dh
        );
      }
      ctx.restore();
    } else {
      ctx.save();
      const flip = direction === 1 || direction === 3 || obj.flipX;
      if (flip) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          spriteSheet,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          -(item.screenX + sprite.offsetX) - sprite.dw,
          item.screenY + sprite.offsetY,
          sprite.dw,
          sprite.dh
        );
      } else {
        ctx.drawImage(
          spriteSheet,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          item.screenX + sprite.offsetX,
          item.screenY + sprite.offsetY,
          sprite.dw,
          sprite.dh
        );
      }
      ctx.restore();
    }
  }
}
