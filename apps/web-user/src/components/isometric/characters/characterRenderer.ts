export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  item: any,
  officeType: 'coal' | 'auto' | 'defense' | 'president',
  facing: 'left' | 'right',
  isMoving: boolean,
  gender: string | null,
  isometricModelId: string | null
) {
  const cx = item.screenX;
  const cy = item.screenY;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.25, 1.25); // Scale character by 25%
  ctx.translate(-cx, -cy);

  if (item.type === 'employee') {
    drawEmployeeNPC(ctx, item, cx, cy, officeType);
  } else if (item.type === 'character') {
    drawPlayerModel(ctx, item, cx, cy, officeType, facing, isMoving, gender, isometricModelId);
  }

  ctx.restore();
}

function drawEmployeeNPC(
  ctx: CanvasRenderingContext2D,
  item: any,
  ex: number,
  ey: number,
  officeType: string
) {
  const theme = item.theme;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(ex, ey + 2, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!item.isSitting) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(ex - 3, ey - 10, 2, 10);
    ctx.fillRect(ex + 1, ey - 10, 2, 10);
  }

  const torsoBaseY = item.isSitting ? ey + 3 : ey - 6;
  ctx.fillStyle = theme.base;
  ctx.beginPath();
  ctx.arc(ex, torsoBaseY - 14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(ex - 7, torsoBaseY - 14, 14, 12);
  ctx.beginPath();
  ctx.arc(ex, torsoBaseY - 2, 7, 0, Math.PI * 2);
  ctx.fill();

  const headY = torsoBaseY - 17;
  ctx.fillStyle = theme.head;
  ctx.beginPath();
  ctx.arc(ex, headY, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Staff-specific hairstyles & outfits
  if (item.id === 'staff_b') {
    // Secretary Auburn Hair
    ctx.fillStyle = officeType === 'president' ? '#451a03' : '#b45309';
    ctx.beginPath();
    ctx.arc(ex, headY - 1, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(ex - 6, headY - 1, 2.5, 10);
    ctx.fillRect(ex + 3.5, headY - 1, 2.5, 10);
    ctx.beginPath();
    ctx.arc(ex, headY - 3, 5.8, 0, Math.PI * 2);
    ctx.fill();

    if (item.isSitting) {
      ctx.beginPath();
      ctx.arc(ex, headY, 5.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Staff A (Helmet or brown hair)
    if (theme.helmet) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ex, headY - 2, 6.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(ex - 8, headY - 2, 16, 2.5);
      if (item.isSitting) {
        ctx.beginPath();
        ctx.arc(ex, headY - 1, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(ex, headY - 2, 6, Math.PI, 0);
      ctx.fill();

      if (item.isSitting) {
        ctx.beginPath();
        ctx.arc(ex, headY, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (theme.glasses && !item.isSitting) {
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(ex - 4, headY - 1, 8, 2);
  }
  if (item.id === 'staff_a' && officeType === 'president' && !item.isSitting) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(ex - 4.5, headY - 2, 9, 2.5); // bodyguard sunglasses
  }
  if (theme.headset) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, headY - 1, 6.5, Math.PI, 0);
    ctx.stroke();
    if (!item.isSitting) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(ex + 4, headY + 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Title Pill
  const title = item.dialogue;
  ctx.font = 'bold 9px sans-serif';
  const textWidth = ctx.measureText(title).width;

  ctx.fillStyle = officeType === 'president' ? 'rgba(69, 10, 10, 0.8)' : 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.roundRect(ex - textWidth / 2 - 5, headY - 21, textWidth + 10, 14, 4);
  ctx.fill();

  ctx.fillStyle =
    officeType === 'president'
      ? '#f59e0b'
      : officeType === 'auto'
      ? '#38bdf8'
      : officeType === 'defense'
      ? '#34d399'
      : '#fcd34d';
  ctx.textAlign = 'center';
  ctx.fillText(title, ex, headY - 11);
}

function drawPlayerModel(
  ctx: CanvasRenderingContext2D,
  item: any,
  cx: number,
  cy: number,
  officeType: string,
  facing: 'left' | 'right',
  isMoving: boolean,
  gender: string | null,
  isometricModelId: string | null
) {
  // Base shadow
  if (!item.isSitting) {
    const pulseSize = 12 + Math.sin(Date.now() * 0.007) * 2;
    ctx.fillStyle = officeType === 'president' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, item.origScreenY || cy, pulseSize, pulseSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = officeType === 'president' ? 'rgba(245, 158, 11, 0.7)' : 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, item.origScreenY || cy, 13, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Standing legs
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 5.5, cy - 16, 4, 14);
    ctx.fillRect(cx + 1.5, cy - 16, 4, 14);
  }

  // Model-specific values
  const modelId = isometricModelId || 'char_diplomat';
  const isFemale = gender === 'female' || modelId.endsWith('_female');

  // Arms and skin
  const handSwing = isMoving && !item.isSitting ? Math.sin(Date.now() * 0.012) * 4 : 0;
  const skinColor = isFemale ? '#fbcfe8' : '#fed7aa'; // female has slightly pinkish light skin

  // Draw Torso
  ctx.save();
  if (modelId.includes('diplomat')) {
    // Suit torso
    ctx.fillStyle = isFemale ? '#475569' : '#2d303b'; // female is slate grey, male is dark navy
    ctx.fillRect(cx - 7, cy - 26, 14, 13);
    
    // Shirt V
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 26);
    ctx.lineTo(cx + 3, cy - 26);
    ctx.lineTo(cx, cy - 20);
    ctx.closePath();
    ctx.fill();

    // Tie or necklace
    if (!isFemale) {
      ctx.fillStyle = '#991b1b'; // Red tie
      ctx.fillRect(cx - 1, cy - 20, 2, 6);
    } else {
      ctx.fillStyle = '#fbbf24'; // Gold necklace
      ctx.beginPath();
      ctx.arc(cx, cy - 22, 2.5, 0, Math.PI);
      ctx.stroke();
    }
  } else if (modelId.includes('soldier')) {
    // Soldier torso
    ctx.fillStyle = isFemale ? '#14532d' : '#2d3a2e'; // dark olive vs army green
    ctx.fillRect(cx - 7, cy - 26, 14, 13);
    
    // Epaulets/Badges
    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx - 8, cy - 27, 3, 2);
    ctx.fillRect(cx + 5, cy - 27, 3, 2);

    // Belt
    ctx.fillStyle = '#451a03';
    ctx.fillRect(cx - 7.5, cy - 16, 15, 3.5);
  } else if (modelId.includes('industrialist')) {
    // Heavy coat or elegant velvet
    ctx.fillStyle = isFemale ? '#1e3a8a' : '#1c0f05';
    ctx.fillRect(cx - 8, cy - 26, 16, 13);

    if (!isFemale) {
      // Fur collar
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 24, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gold chain
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 18, 3, 0, Math.PI * 0.7);
      ctx.stroke();
    } else {
      // Elegant gold buttons
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy - 22, 1.5, 0, Math.PI * 2);
      ctx.arc(cx, cy - 18, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Researcher
    ctx.fillStyle = isFemale ? '#f8fafc' : '#312e81'; // White lab coat vs Blue vest
    ctx.fillRect(cx - 7, cy - 26, 14, 13);
    if (!isFemale) {
      // Neon lights
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(cx - 6, cy - 24, 2, 8);
      ctx.fillRect(cx + 4, cy - 24, 2, 8);
    } else {
      // Purple dress under lab coat
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(cx - 3, cy - 26, 6, 13);
    }
  }
  ctx.restore();

  // Arms and Hands
  ctx.fillStyle = modelId.includes('researcher') && isFemale ? '#f8fafc' : modelId.includes('industrialist') && isFemale ? '#1e3a8a' : modelId.includes('soldier') ? '#2d3a2e' : '#1e3a8a';
  ctx.fillRect(cx - 10, cy - 26 + handSwing, 3, 8);
  ctx.fillRect(cx + 7, cy - 26 - handSwing, 3, 8);

  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(cx - 8.5, cy - 17 + handSwing, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 8.5, cy - 17 - handSwing, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Head and Face
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(cx, cy - 36, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Hair & Hats
  ctx.save();
  if (modelId.includes('diplomat')) {
    if (!isFemale) {
      // Slick back dark hair
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.arc(cx, cy - 39, 8, Math.PI, 0);
      ctx.fill();
    } else {
      // Neat high bun brown hair
      ctx.fillStyle = '#291305';
      ctx.beginPath();
      ctx.arc(cx, cy - 39, 8, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - 43, 4, 0, Math.PI * 2); // Bun
      ctx.fill();
    }
  } else if (modelId.includes('soldier')) {
    // Visor Cap / Garrison cap
    ctx.fillStyle = '#1b241d';
    ctx.beginPath();
    ctx.arc(cx, cy - 39, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 9, cy - 40, 18, 2.5); // Cap rim
    if (isFemale) {
      // Ponytail dangling
      ctx.fillStyle = '#291305';
      ctx.fillRect(cx - 2, cy - 34, 4, 10);
    }
  } else if (modelId.includes('industrialist')) {
    if (!isFemale) {
      // Bowler Hat
      ctx.fillStyle = '#1c0f05';
      ctx.beginPath();
      ctx.arc(cx, cy - 40, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 10, cy - 40, 20, 2); // Brim
      // Beard
      ctx.fillStyle = '#3f1a05';
      ctx.beginPath();
      ctx.arc(cx, cy - 33, 5, 0, Math.PI);
      ctx.fill();
    } else {
      // Wavy blonde/chestnut hair
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(cx, cy - 39, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 8.5, cy - 39, 3, 10);
      ctx.fillRect(cx + 5.5, cy - 39, 3, 10);
    }
  } else {
    // Researcher
    if (!isFemale) {
      // Short modern blue/purple hair
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.arc(cx, cy - 39, 8, Math.PI, 0);
      ctx.fill();
    } else {
      // Long purple hair
      ctx.fillStyle = '#701a75';
      ctx.beginPath();
      ctx.arc(cx, cy - 39, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 8.5, cy - 39, 2.5, 12);
      ctx.fillRect(cx + 6, cy - 39, 2.5, 12);
    }
  }
  ctx.restore();

  // Face Details / Glasses
  ctx.fillStyle = '#020617';
  if (facing === 'right') {
    ctx.beginPath();
    ctx.arc(cx + 2.5, cy - 37, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 37, 2, 0, Math.PI * 2);
    ctx.fill();

    // Glasses/Visor overlay
    if (modelId.includes('diplomat') || modelId.includes('researcher')) {
      ctx.strokeStyle = modelId.includes('researcher') ? '#00f0ff' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 1.5, cy - 38);
      ctx.lineTo(cx + 7, cy - 36);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 37, 2, 0, Math.PI * 2);
    ctx.arc(cx - 2.5, cy - 37, 2, 0, Math.PI * 2);
    ctx.fill();

    // Glasses/Visor overlay
    if (modelId.includes('diplomat') || modelId.includes('researcher')) {
      ctx.strokeStyle = modelId.includes('researcher') ? '#00f0ff' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 38);
      ctx.lineTo(cx - 1.5, cy - 36);
      ctx.stroke();
    }
  }

  // Hologram tablet for Researcher
  if (modelId.includes('researcher') && !item.isSitting) {
    ctx.fillStyle = isFemale ? 'rgba(236, 72, 153, 0.4)' : 'rgba(6, 182, 212, 0.4)';
    ctx.strokeStyle = isFemale ? '#ec4899' : '#06b6d4';
    ctx.lineWidth = 1;
    ctx.fillRect(cx - 5, cy - 20, 10, 7);
    ctx.strokeRect(cx - 5, cy - 20, 10, 7);
  }

  // Sitting adjustment
  if (item.isSitting) {
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 20, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 20, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
