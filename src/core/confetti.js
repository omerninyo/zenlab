/**
 * Zen Design System - Geometric Micro-Confetti
 * Pure Canvas, zero-dependency celebration particle effect.
 * Emits elegant champagne-gold and cinema-slate geometric squares upon milestone completion.
 */

export function fireChampagneConfetti() {
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#ca8a04', '#eab308', '#facc15', '#0f172a', '#38bdf8', '#10b981'];
  const particleCount = 45;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 8 - 4,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      gravity: 0.22,
      opacity: 1
    });
  }

  let animationFrame;
  const startTime = Date.now();

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > 2400) {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity = Math.max(0, 1 - elapsed / 2200);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      // Draw rectangular confetti (Zen 2.0 geometry)
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    });

    animationFrame = requestAnimationFrame(render);
  }

  render();
}
