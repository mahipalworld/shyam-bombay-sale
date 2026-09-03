/**
 * Lightweight Canvas Confetti Generator
 * Zero external dependencies, highly optimized.
 */

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  shape: 'circle' | 'rect' | 'ribbon';
}

export const triggerConfetti = (options?: { duration?: number; particleCount?: number }) => {
  if (typeof window === 'undefined') return;

  const duration = options?.duration || 2500;
  const count = options?.particleCount || 100;
  const colors = ['#F95721', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FFD700'];

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const updateSize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  updateSize();

  const particles: ConfettiParticle[] = [];
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2.5;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
    const speed = Math.random() * 12 + 6;
    particles.push({
      x: startX + (Math.random() - 0.5) * 100,
      y: startY + (Math.random() - 0.5) * 50,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed - Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      alpha: 1,
      shape: Math.random() > 0.6 ? 'rect' : Math.random() > 0.3 ? 'circle' : 'ribbon',
    });
  }

  const startTime = performance.now();

  const render = (time: number) => {
    const elapsed = time - startTime;
    const progress = elapsed / duration;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(render);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  };

  requestAnimationFrame(render);
};
