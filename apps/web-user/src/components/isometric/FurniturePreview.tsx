import React, { useEffect, useRef } from 'react';
import { SPRITE_ATLAS } from './constants';

interface FurniturePreviewProps {
  id: string;
  spriteSheet: HTMLImageElement | null;
}

export const FurniturePreview: React.FC<FurniturePreviewProps> = ({ id, spriteSheet }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteSheet) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = SPRITE_ATLAS[id];
    if (s) {
      ctx.save();
      const scale = Math.min(canvas.width / (s.dw || 1), canvas.height / (s.dh || 1)) * 0.9;
      const dw = s.dw * scale;
      const dh = s.dh * scale;
      ctx.drawImage(
        spriteSheet,
        s.sx,
        s.sy,
        s.sw,
        s.sh,
        (canvas.width - dw) / 2,
        (canvas.height - dh) / 2,
        dw,
        dh
      );
      ctx.restore();
    }
  }, [id, spriteSheet]);

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={60}
      style={{
        display: 'block',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        margin: '0 auto',
      }}
    />
  );
};
