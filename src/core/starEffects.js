/**
 * Star Float Effect for ZenLab
 * 
 * Provides an organic, elegant floating star particle animation
 * when a student earns an achievement or completes a challenge.
 * Zero external libraries, lightweight, and hardware-accelerated.
 */
import { AudioEngine } from './audio.js';

export function triggerStarFloat(originPoint = null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const targetBadge = document.getElementById('zen-stars-header-badge');
  let targetX = 30;
  let targetY = 24;

  if (targetBadge) {
    const rect = targetBadge.getBoundingClientRect();
    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
  }

  // Default origin: center-bottom of viewport if not provided
  const startX = originPoint?.x ?? window.innerWidth / 2;
  const startY = originPoint?.y ?? window.innerHeight * 0.65;

  const starEl = document.createElement('div');
  starEl.style.position = 'fixed';
  starEl.style.left = `${startX}px`;
  starEl.style.top = `${startY}px`;
  starEl.style.zIndex = '9999';
  starEl.style.pointerEvents = 'none';
  starEl.style.transform = 'translate(-50%, -50%) scale(0.4)';
  starEl.style.transition = 'transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.85s ease-in';
  starEl.style.opacity = '1';
  starEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9999px; background: rgba(251, 191, 36, 0.2); border: 1.5px solid rgba(245, 158, 11, 0.8); box-shadow: 0 0 16px rgba(251, 191, 36, 0.5);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  `;

  document.body.appendChild(starEl);

  // Play peaceful chime
  AudioEngine.playZenChime();

  // Force reflow
  starEl.getBoundingClientRect();

  // Animate to target
  requestAnimationFrame(() => {
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    starEl.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(1.1)`;
  });

  setTimeout(() => {
    // Arrival impact at badge
    if (targetBadge) {
      targetBadge.classList.add('scale-115', 'ring-2', 'ring-amber-400');
      setTimeout(() => {
        targetBadge.classList.remove('scale-115', 'ring-2', 'ring-amber-400');
      }, 350);
    }
    starEl.style.opacity = '0';
    setTimeout(() => {
      starEl.remove();
    }, 200);
  }, 850);
}

// Global auto-listener for challenges
if (typeof window !== 'undefined') {
  window.addEventListener('zen-challenge-completed', (e) => {
    const origin = e.detail?.origin || null;
    triggerStarFloat(origin);
  });
}
