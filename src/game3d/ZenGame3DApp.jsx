import React, { useEffect } from 'react';
import { useZenGameStore, ZenGameStore } from './useZenGameStore.js';
import ZenGame3DCanvas from './ZenGame3DCanvas.jsx';
import DiegeticHUD from './DiegeticHUD.jsx';
import DiegeticLessonModal from './DiegeticLessonModal.jsx';
import ZenRadioFloatingPlayer from './ZenRadioFloatingPlayer.jsx';

/**
 * Fullscreen (100vw x 100vh) AA 3D Sci-Fi Game Experience for ZenLab 3D.
 * Combines the WebGL2 3D Canvas (Overworld + 8 Physical Station Sandboxes),
 * the minimal RTL Diegetic HUD (<12% screen area), the Holographic Lesson
 * Projector / Codex / Laser Quiz Modal, and the floating Zen Radio Player.
 */
export default function ZenGame3DApp({
  onSwitchToClassic2D,
  onOpenCertificate,
  onOpenGlossary
}) {
  const store = useZenGameStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const stationParam = params.get('station') || params.get('lab');
      const subviewParam = params.get('subview') || params.get('stage');
      if (stationParam && /^lab[1-8]$/.test(stationParam)) {
        ZenGameStore.enterStation(stationParam, subviewParam || 'sandbox');
      } else if (params.get('scene') === 'overworld') {
        ZenGameStore.returnToOverworld();
      }
    } catch {
      // Ignore URL parse errors
    }
  }, []);

  return (
    <div
      dir="rtl"
      data-testid="zenlab-3d-root"
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#060b16] text-slate-100 font-sans select-none"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* 1. Fullscreen 3D WebGL2 Game Engine Viewport */}
      <ZenGame3DCanvas />

      {/* 2. Minimal Diegetic Sci-Fi HUD Overlay (<12% screen area) */}
      <DiegeticHUD
        onSwitchToClassic2D={onSwitchToClassic2D}
        onOpenCertificate={onOpenCertificate}
        onOpenGlossary={onOpenGlossary}
      />

      {/* 3. Floating "Zen Radio" Podcast Player */}
      <ZenRadioFloatingPlayer />

      {/* 4. Diegetic Holographic Projector, Warm-up Codex & 3-Lock Laser Quiz Modal */}
      {store.sceneMode === 'station' && store.activeSubView !== 'sandbox' && (
        <DiegeticLessonModal />
      )}
    </div>
  );
}
