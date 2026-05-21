import { useState, useEffect, useRef } from 'react';
import type { IsometricObject } from './types';
import { GRID_SIZE, TILE_W, TILE_H } from './types';
import { findPath } from './pathfinder';
import { drawScene } from './renderer';

interface UseIsometricEngineParams {
  officeType: 'coal' | 'auto' | 'defense' | 'president';
  companyId: string;
  initialObjects: IsometricObject[];
  staffACoord: { x: number; y: number };
  staffBCoord: { x: number; y: number };
  bossBubbleRef: React.MutableRefObject<string>;
  staffABubbleRef: React.MutableRefObject<string>;
  staffBBubbleRef: React.MutableRefObject<string>;
  gender?: string | null;
  isometricModelId?: string | null;
}

export function useIsometricEngine({
  officeType,
  companyId,
  initialObjects,
  staffACoord,
  staffBCoord,
  bossBubbleRef,
  staffABubbleRef,
  staffBBubbleRef,
  gender = null,
  isometricModelId = null,
}: UseIsometricEngineParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-performance Refs to bypass React renders (prevents virtual DOM lag at 60fps)
  const charXRef = useRef(3);
  const charYRef = useRef(3);
  const targetXRef = useRef(3);
  const targetYRef = useRef(3);
  const facingRef = useRef<'left' | 'right'>('right');
  const walkPathRef = useRef<{ x: number; y: number }[]>([]);

  const [spriteSheet, setSpriteSheet] = useState<HTMLImageElement | null>(null);
  const [chairBackImg, setChairBackImg] = useState<HTMLImageElement | null>(null);

  // Load Sprites
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/isometric.webp';
    img.onload = () => {
      setSpriteSheet(img);
    };

    const backImg = new Image();
    backImg.src = '/assets/chair_back.webp';
    backImg.onload = () => {
      setChairBackImg(backImg);
    };
  }, []);

  // Layout Editing States
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [selectedObject, setSelectedObject] = useState<IsometricObject | null>(null);
  const [isMovingObject, setIsMovingObject] = useState(false);
  const [storeCategory, setStoreCategory] = useState<'tümü' | 'ofis' | 'dekorasyon' | 'konfor' | 'guvenlik'>('tümü');
  const [officeObjects, setOfficeObjects] = useState<IsometricObject[]>([]);

  const officeObjectsRef = useRef<IsometricObject[]>([]);
  useEffect(() => {
    officeObjectsRef.current = officeObjects;
  }, [officeObjects]);

  // Load layout from localStorage with filtering for President's office
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`office_objects_${companyId}`);
      if (stored) {
        let loaded = JSON.parse(stored) as IsometricObject[];
        if (officeType === 'president') {
          loaded = loaded.filter(obj => obj.id !== 'chair' && obj.id !== 'office_chair' && obj.id !== 'chair_staff_a' && obj.id !== 'chair_staff_b');
        }
        setOfficeObjects(loaded);
      } else {
        let filteredInitial = initialObjects;
        if (officeType === 'president') {
          filteredInitial = filteredInitial.filter(obj => obj.id !== 'chair' && obj.id !== 'office_chair' && obj.id !== 'chair_staff_a' && obj.id !== 'chair_staff_b');
        }
        setOfficeObjects(filteredInitial);
      }
    } catch (e) {
      let filteredInitial = initialObjects;
      if (officeType === 'president') {
        filteredInitial = filteredInitial.filter(obj => obj.id !== 'chair' && obj.id !== 'office_chair' && obj.id !== 'chair_staff_a' && obj.id !== 'chair_staff_b');
      }
      setOfficeObjects(filteredInitial);
    }
  }, [companyId, initialObjects, officeType]);

  // Full Screen & Dimension States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 550, height: 350 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileMatch = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      setIsMobile(mobileMatch);
      if (mobileMatch && isFullScreen) {
        setDimensions({ width: window.innerWidth, height: window.innerHeight * 0.6 });
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isFullScreen]);

  // Adjust dimensions dynamically on screen mode / resize
  useEffect(() => {
    const handleResize = () => {
      if (isFullScreen) {
        setDimensions({
          width: window.innerWidth > 900 ? 900 : window.innerWidth - 32,
          height: window.innerHeight > 550 ? 550 : window.innerHeight - 180,
        });
      } else {
        const availWidth = window.innerWidth > 600 ? 550 : window.innerWidth - 32;
        const availHeight = window.innerWidth > 600 ? 350 : 280;
        setDimensions({ width: availWidth, height: availHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullScreen]);

  // High-performance RAF animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const speed = 2.5;

    const tick = () => {
      const charX = charXRef.current;
      const charY = charYRef.current;
      const tX = targetXRef.current;
      const tY = targetYRef.current;

      const dx = tX - charX;
      const dy = tY - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let moved = false;
      if (dist > 0.05) {
        charXRef.current += (dx / dist) * speed * 0.016;
        charYRef.current += (dy / dist) * speed * 0.016;
        facingRef.current = (dx - dy > 0) ? 'right' : 'left';
        moved = true;
      } else {
        charXRef.current = tX;
        charYRef.current = tY;
        if (walkPathRef.current.length > 0) {
          const next = walkPathRef.current.shift();
          if (next) {
            targetXRef.current = next.x;
            targetYRef.current = next.y;
          }
        }
      }

      const walkBob = moved ? Math.abs(Math.sin(Date.now() * 0.015) * 4) : 0;
      const rx = Math.round(charXRef.current);
      const ry = Math.round(charYRef.current);
      const isSitting = (rx === staffACoord.x && ry === staffACoord.y) || (rx === staffBCoord.x && ry === staffBCoord.y);

      drawScene(
        ctx,
        dimensions.width,
        dimensions.height,
        officeType,
        officeObjectsRef.current,
        charXRef.current,
        charYRef.current,
        facingRef.current,
        walkBob,
        isSitting,
        spriteSheet,
        chairBackImg,
        selectedObject,
        isMovingObject,
        isEditingLayout,
        bossBubbleRef.current,
        staffABubbleRef.current,
        staffBBubbleRef.current,
        tX,
        tY,
        staffACoord,
        staffBCoord,
        gender,
        isometricModelId
      );

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, selectedObject, isMovingObject, isEditingLayout, officeObjects, officeType, staffACoord, staffBCoord, spriteSheet, chairBackImg, gender, isometricModelId]);

  // Handle D-Pad key movement triggers
  const moveTowards = (dx: number, dy: number) => {
    walkPathRef.current = [];

    const charX = charXRef.current;
    const charY = charYRef.current;
    const targetX = targetXRef.current;
    const targetY = targetYRef.current;

    if (Math.abs(charX - targetX) > 0.15 || Math.abs(charY - targetY) > 0.15) return;

    const nextX = Math.max(0, Math.min(GRID_SIZE - 1, targetX + dx));
    const nextY = Math.max(0, Math.min(GRID_SIZE - 1, targetY + dy));

    const isStaff = (nextX === staffACoord.x && nextY === staffACoord.y) || (nextX === staffBCoord.x && nextY === staffBCoord.y);
    const isObstacle = officeObjectsRef.current.some(obj => obj.x === nextX && obj.y === nextY && !obj.nonBlocking) || isStaff;

    if (!isObstacle) {
      targetXRef.current = nextX;
      targetYRef.current = nextY;
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        moveTowards(-1, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        moveTowards(1, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveTowards(-1, 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveTowards(1, -1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [officeType, staffACoord, staffBCoord]);

  // Click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const scaleFactor = Math.min(width / 550, height / 350);
    const translateX = (width - 550 * scaleFactor) / 2;
    const translateY = (height - 350 * scaleFactor) / 2;

    const mouseX = (rawX - translateX) / scaleFactor;
    const mouseY = (rawY - translateY) / scaleFactor;

    const virtualWidth = 550;
    const virtualHeight = 350;
    const centerX = virtualWidth / 2;
    const centerY = virtualHeight / 2.8;

    const u = (mouseX - centerX) / (TILE_W / 2);
    const v = (mouseY - centerY) / (TILE_H / 2);
    const clickX = Math.round((u + v) / 2);
    const clickY = Math.round((v - u) / 2);

    if (clickX >= 0 && clickX < GRID_SIZE && clickY >= 0 && clickY < GRID_SIZE) {
      if (isEditingLayout) {
        const found = officeObjectsRef.current.find(obj => obj.x === clickX && obj.y === clickY);
        if (found) {
          setSelectedObject(found);
          setIsMovingObject(false);
        } else if (selectedObject && isMovingObject) {
          const isOccupied = officeObjectsRef.current.some(obj => obj !== selectedObject && obj.x === clickX && obj.y === clickY);
          const isStaff = (clickX === staffACoord.x && clickY === staffACoord.y) || (clickX === staffBCoord.x && clickY === staffBCoord.y);
          if (!isOccupied && !isStaff) {
            setOfficeObjects(prev => prev.map(obj => {
              if (obj.x === selectedObject.x && obj.y === selectedObject.y && obj.id === selectedObject.id) {
                return { ...obj, x: clickX, y: clickY };
              }
              return obj;
            }));
            setSelectedObject({ ...selectedObject, x: clickX, y: clickY });
            setIsMovingObject(false);
          }
        } else {
          setSelectedObject(null);
        }
        return;
      }

      const currentX = Math.round(charXRef.current);
      const currentY = Math.round(charYRef.current);

      // Staff desk/chair check for click targeting
      const isStaffClick = (clickX === staffACoord.x && clickY === staffACoord.y) || 
                          (clickX === (staffACoord.x - 1) && clickY === staffACoord.y) ||
                          (clickX === staffBCoord.x && clickY === staffBCoord.y) ||
                          (clickX === (staffBCoord.x - 1) && clickY === staffBCoord.y);

      if (isStaffClick) {
        // Walk to neighbors
        const staffBaseX = (clickX === staffACoord.x || clickX === (staffACoord.x - 1)) ? staffACoord.x : staffBCoord.x;
        const staffBaseY = (clickX === staffACoord.x || clickX === (staffACoord.x - 1)) ? staffACoord.y : staffBCoord.y;

        const neighbors = [
          { x: staffBaseX, y: staffBaseY + 1 },
          { x: staffBaseX + 1, y: staffBaseY },
          { x: staffBaseX, y: staffBaseY - 1 }
        ];

        for (const n of neighbors) {
          const path = findPath(
            currentX,
            currentY,
            n.x,
            n.y,
            GRID_SIZE,
            officeObjectsRef.current,
            (gx, gy) => (gx === staffACoord.x && gy === staffACoord.y) || (gx === staffBCoord.x && gy === staffBCoord.y)
          );
          if (path.length > 0) {
            walkPathRef.current = path;
            break;
          }
        }
        return;
      }

      let path = findPath(
        currentX,
        currentY,
        clickX,
        clickY,
        GRID_SIZE,
        officeObjectsRef.current,
        (gx, gy) => (gx === staffACoord.x && gy === staffACoord.y) || (gx === staffBCoord.x && gy === staffBCoord.y)
      );

      if (path.length === 0) {
        // Target is blocked/occupied, find the nearest reachable neighbor tile!
        const neighbors = [
          { x: clickX + 1, y: clickY },
          { x: clickX - 1, y: clickY },
          { x: clickX, y: clickY + 1 },
          { x: clickX, y: clickY - 1 },
          { x: clickX + 1, y: clickY + 1 },
          { x: clickX - 1, y: clickY - 1 },
          { x: clickX + 1, y: clickY - 1 },
          { x: clickX - 1, y: clickY + 1 }
        ].filter(n => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE);

        // Sort neighbors by distance to current player position
        neighbors.sort((a, b) => {
          const distA = Math.abs(a.x - currentX) + Math.abs(a.y - currentY);
          const distB = Math.abs(b.x - currentX) + Math.abs(b.y - currentY);
          return distA - distB;
        });

        for (const n of neighbors) {
          const neighborPath = findPath(
            currentX,
            currentY,
            n.x,
            n.y,
            GRID_SIZE,
            officeObjectsRef.current,
            (gx, gy) => (gx === staffACoord.x && gy === staffACoord.y) || (gx === staffBCoord.x && gy === staffBCoord.y)
          );
          if (neighborPath.length > 0) {
            path = neighborPath;
            break;
          }
        }
      }

      if (path.length > 0) {
        walkPathRef.current = path;
      }
    }
  };

  const saveLayout = () => {
    localStorage.setItem(`office_objects_${companyId}`, JSON.stringify(officeObjects));
    setIsEditingLayout(false);
    setSelectedObject(null);
    setIsMovingObject(false);
  };

  const cancelLayout = () => {
    try {
      const stored = localStorage.getItem(`office_objects_${companyId}`);
      if (stored) {
        setOfficeObjects(JSON.parse(stored));
      } else {
        setOfficeObjects(initialObjects);
      }
    } catch (e) {
      setOfficeObjects(initialObjects);
    }
    setIsEditingLayout(false);
    setSelectedObject(null);
    setIsMovingObject(false);
  };

  return {
    canvasRef,
    containerRef,
    dimensions,
    isFullScreen,
    setIsFullScreen,
    isMobile,
    isEditingLayout,
    setIsEditingLayout,
    selectedObject,
    setSelectedObject,
    isMovingObject,
    setIsMovingObject,
    officeObjects,
    setOfficeObjects,
    storeCategory,
    setStoreCategory,
    spriteSheet,
    saveLayout,
    cancelLayout,
    handleCanvasClick,
    moveTowards,
    charXRef,
    charYRef,
    targetXRef,
    targetYRef,
    facingRef,
    walkPathRef,
  };
}
