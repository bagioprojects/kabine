import React, { useState, useEffect, useRef, memo } from 'react';

const DEFAULT_VIDEOS = [
  '/assets/videos/bg_video_1.mp4',
  '/assets/videos/bg_video_3.mp4',
  '/assets/videos/bg_video_2.mp4'
];

interface VideoBackgroundOverlayProps {
  videos?: string[];
  fadeDurationMs?: number;
  prewarmDurationMs?: number;
  /** 'multi-sequence': 3-video playlist, 10 cycles then static poster.
   *  'single-loop': first video only, loops infinitely. Default: 'multi-sequence' */
  mode?: 'multi-sequence' | 'single-loop';
  /** Custom fallback poster image URL. Defaults to login_bg or simulation_bg */
  posterSrc?: string;
}

export const VideoBackgroundOverlay: React.FC<VideoBackgroundOverlayProps> = memo(({ 
  videos = DEFAULT_VIDEOS,
  fadeDurationMs = 1500,
  prewarmDurationMs = 1000,
  mode = 'multi-sequence',
  posterSrc
}) => {
  // In single-loop mode only the first video is used
  const activeVideos = mode === 'single-loop' ? [videos[0]] : videos;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  
  // Video elementlerini hafızada tutuyoruz (DOM'a eklemiyoruz)
  const videoElementsRef = useRef<HTMLVideoElement[]>([]);
  const stateRef = useRef<{
    activeIndex: number;
    transitionState: 'idle' | 'prewarming' | 'fading' | 'finished';
    transitionProgress: number; // 0 to 1
    posterImage: HTMLImageElement | null;
    cycleCount: number;
  }>({
    activeIndex: 0,
    transitionState: 'idle',
    transitionProgress: 0,
    posterImage: null,
    cycleCount: 0
  });

  // Sunucu uyuşmazlığı engelleme & Blob yükleme
  useEffect(() => {
    setIsClient(true);
    let mounted = true;

    // Fallback HD WebP poster görselini yükle
    const img = new Image();
    img.src = posterSrc ?? (mode === 'single-loop' ? '/simulation_bg.webp' : '/assets/login_bg.webp');
    img.onload = () => {
      stateRef.current.posterImage = img;
    };

    const loadVideos = async () => {
      const validUrls: string[] = [];
      for (const src of activeVideos) {
        try {
          const res = await fetch(src);
          if (res.ok) {
            const blob = await res.blob();
            validUrls.push(URL.createObjectURL(blob));
          }
        } catch (e) {
          console.warn(`Video yüklenemedi (atlandı): ${src}`);
        }
      }

      if (mounted && validUrls.length > 0) {
        setBlobUrls(validUrls);

        // Bellekte video elementlerini oluştur
        videoElementsRef.current = validUrls.map((url) => {
          const video = document.createElement('video');
          video.src = url;
          video.muted = true;
          video.playsInline = true;
          video.loop = false; // Döngü ve geçişleri el ile kontrol edeceğiz
          video.controls = false;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          video.controlsList = 'nodownload';
          video.load();
          return video;
        });

        // İlk videoyu başlat
        if (videoElementsRef.current[0]) {
          videoElementsRef.current[0].play().catch(err => console.log('Autoplay engellendi:', err));
        }
      }
    };

    loadVideos();

    return () => {
      mounted = false;
      // Blob URL temizliği
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 60FPS Çizim ve State Makinesi Döngüsü
  useEffect(() => {
    if (blobUrls.length === 0) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cover oranlama çizim fonksiyonu
    const drawVideoCover = (video: HTMLVideoElement | HTMLImageElement, alpha: number) => {
      ctx.globalAlpha = alpha;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const targetWidth = ('videoWidth' in video ? video.videoWidth : video.width) || 1920;
      const targetHeight = ('videoHeight' in video ? video.videoHeight : video.height) || 1080;

      const videoRatio = targetWidth / targetHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > videoRatio) {
        drawHeight = canvasWidth / videoRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * videoRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Çözünürlük ayarı — single-loop modunda parent boyutuna göre, multi'de pencere boyutuna
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
      // Döngü sonlandıysa ekran yeniden boyutlandırıldığında resmi tekrar çiz
      if (stateRef.current.transitionState === 'finished' && stateRef.current.posterImage) {
        drawVideoCover(stateRef.current.posterImage, 1.0);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const renderLoop = () => {
      const state = stateRef.current;

      // Döngü bittiyse render'ı durdur (CPU kullanımını %0'a düşür)
      if (state.transitionState === 'finished') {
        if (state.posterImage) {
          drawVideoCover(state.posterImage, 1.0);
        }
        return;
      }

      const currentVideo = videoElementsRef.current[state.activeIndex];
      const nextIndex = (state.activeIndex + 1) % videoElementsRef.current.length;
      const nextVideo = videoElementsRef.current[nextIndex];

      // Arka plan temizleme
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!currentVideo) {
        // Videolar henüz hazır değilse posteri çiz
        if (state.posterImage) {
          drawVideoCover(state.posterImage, 1.0);
        }
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Zaman kontrolleri (Sadece birden fazla video varsa geçiş mantığı çalışır)
      if (videoElementsRef.current.length > 1) {
        const duration = currentVideo.duration || Infinity;
        const currentTime = currentVideo.currentTime || 0;
        const timeLeft = duration - currentTime;
        
        const fadeThreshold = fadeDurationMs / 1000;
        const prewarmThreshold = fadeThreshold + (prewarmDurationMs / 1000);

        // Son videodan ilk videoya geçiş (Cycle Sonu)
        const isCycleEnding = nextIndex === 0;

        // 10 tekrar bittiyse (cycleCount 9'a ulaştığında ve son videoda geçiş başladığında)
        const isLastCycleTransition = isCycleEnding && state.cycleCount >= 9;

        // 1. Aşama: Pre-Warming (Videoyu önden oynat, ama ekrana çizme)
        if (timeLeft <= prewarmThreshold && timeLeft > fadeThreshold && state.transitionState === 'idle') {
          state.transitionState = 'prewarming';
          if (!isLastCycleTransition && nextVideo) {
            nextVideo.currentTime = 0;
            nextVideo.play().catch(() => {});
          }
        }

        // 2. Aşama: Fading (İki görüntüyü harmanlayarak çiz)
        if (timeLeft <= fadeThreshold && state.transitionState !== 'fading') {
          state.transitionState = 'fading';
          if (!isLastCycleTransition && nextVideo && nextVideo.paused) {
            nextVideo.currentTime = 0;
            nextVideo.play().catch(() => {});
          }
        }

        if (state.transitionState === 'fading') {
          const progress = Math.min(1, Math.max(0, (fadeThreshold - timeLeft) / fadeThreshold));
          state.transitionProgress = progress;

          if (isLastCycleTransition) {
            // Son döngü bitişi: Video solarak kapanır, WebP fallback posteri çizilir
            drawVideoCover(currentVideo, 1 - progress);
            if (state.posterImage) {
              drawVideoCover(state.posterImage, progress);
            }

            if (progress >= 1.0 || currentVideo.ended || timeLeft <= 0) {
              currentVideo.pause();
              // Belleği boşaltmak için tüm video elementlerini durdur
              videoElementsRef.current.forEach(v => {
                v.pause();
                v.src = '';
                v.load();
              });
              state.transitionState = 'finished';
              state.transitionProgress = 0;
            }
          } else {
            // Normal geçiş: Aktif video solar, sonraki video belirir
            drawVideoCover(currentVideo, 1 - progress);
            if (nextVideo) {
              drawVideoCover(nextVideo, progress);
            }

            if (progress >= 1.0 || currentVideo.ended || timeLeft <= 0) {
              currentVideo.pause();
              state.activeIndex = nextIndex;
              state.transitionState = 'idle';
              state.transitionProgress = 0;

              if (isCycleEnding) {
                state.cycleCount += 1;
              }
            }
          }
        } else {
          // Normal oynatım
          drawVideoCover(currentVideo, 1.0);
        }
      } else {
        // Tek video döngüsü (loop)
        drawVideoCover(currentVideo, 1.0);
        if (currentVideo.ended || currentVideo.currentTime >= (currentVideo.duration - 0.1)) {
          if (mode === 'single-loop') {
            // Sonsuz döngü — bitince başa sar
            currentVideo.currentTime = 0;
            currentVideo.play().catch(() => {});
          } else {
            state.cycleCount += 1;
            if (state.cycleCount >= 10) {
              currentVideo.pause();
              state.transitionState = 'finished';
            } else {
              currentVideo.currentTime = 0;
              currentVideo.play().catch(() => {});
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [blobUrls, fadeDurationMs, prewarmDurationMs]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none', // Tıklamaları engeller
        userSelect: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()} // Sağ tık engeli
    />
  );
});

VideoBackgroundOverlay.displayName = 'VideoBackgroundOverlay';
