import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  VignetteEffect,
  ToneMappingEffect,
  ToneMappingMode
} from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import RAPIER from '@dimforge/rapier3d-compat';

import { ZenGameStore } from './useZenGameStore.js';
import { createOverworld3DScene } from './overworld/Overworld3DScene.js';
import { createStation3DDirector } from './stations/Stations3D.js';

const OVERWORLD_CAM_POS = new THREE.Vector3(0, 13.8, 15.8);
const OVERWORLD_CAM_TARGET = new THREE.Vector3(0, 0.4, 0);

const STATION_CAM_POS = new THREE.Vector3(0, 6.2, 9.2);
const STATION_CAM_TARGET = new THREE.Vector3(0, 0.9, -0.4);

/**
 * Full-Screen AA WebGL2 3D Canvas & Post-Processing Pipeline for ZenLab 3D.
 * Orchestrates Overworld3DScene and Stations3D with PMREM reflections,
 * 3-point shadow-mapped studio lighting, N8AO + Mipmap Bloom + ACES Filmic
 * post-processing, Rapier3D physics readiness, and OrbitControls.
 */
export function ZenGame3DCanvas({ className = '', style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let isDisposed = false;
    let animationFrameId = null;

    // --- 1. Asynchronous Rapier3D Physics Engine Initialization ---
    let rapierWorld = null;
    if (typeof window !== 'undefined' && window.__ZEN_RAPIER_READY__ === undefined) {
      window.__ZEN_RAPIER_READY__ = false;
    }

    RAPIER.init()
      .then(() => {
        if (isDisposed) return;
        try {
          rapierWorld = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
          if (typeof window !== 'undefined') {
            window.__ZEN_RAPIER_READY__ = true;
          }
        } catch {
          // Ignore fallback if WASM world creation is unsupported in environment
        }
      })
      .catch(() => {
        // Fallback gracefully if WASM fails to initialize in restricted headless runners
      });

    // --- 2. WebGL2 Renderer Setup ---
    const initialWidth = container.clientWidth || window.innerWidth || 1280;
    const initialHeight = container.clientHeight || window.innerHeight || 720;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      });
    } catch {
      // Fallback for restricted software WebGL contexts
      renderer = new THREE.WebGLRenderer({ antialias: true });
    }

    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const canvas = renderer.domElement;
    const origSetPointerCapture = canvas.setPointerCapture?.bind(canvas);
    if (origSetPointerCapture) {
      canvas.setPointerCapture = (pointerId) => {
        try {
          origSetPointerCapture(pointerId);
        } catch {
          // Ignore synthetic pointerId capture errors during automated tests
        }
      };
    }
    const origReleasePointerCapture = canvas.releasePointerCapture?.bind(canvas);
    if (origReleasePointerCapture) {
      canvas.releasePointerCapture = (pointerId) => {
        try {
          origReleasePointerCapture(pointerId);
        } catch {
          // Ignore synthetic pointerId release errors during automated tests
        }
      };
    }
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';
    container.innerHTML = '';
    container.appendChild(canvas);

    // --- 3. Scene, PMREM Studio Environment & Fog ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060b16');
    scene.fog = new THREE.FogExp2('#060b16', 0.018);

    let envMapTexture = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnvironment = new RoomEnvironment();
      envMapTexture = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;
      scene.environment = envMapTexture;
      roomEnvironment.dispose?.();
      pmremGenerator.dispose();
    } catch {
      // Continue gracefully if PMREM fails on legacy/headless context
    }

    // --- 4. Camera & OrbitControls ---
    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 120);
    const initialState = ZenGameStore.getState();
    const initialMode = initialState.sceneMode === 'station' ? 'station' : 'overworld';

    camera.position.copy(initialMode === 'station' ? STATION_CAM_POS : OVERWORLD_CAM_POS);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minPolarAngle = 0.18;
    controls.minDistance = 4.5;
    controls.maxDistance = 24.0;
    controls.enablePan = false;
    controls.target.copy(initialMode === 'station' ? STATION_CAM_TARGET : OVERWORLD_CAM_TARGET);
    controls.update();

    // Smooth camera transition state when switching between Overworld and Station
    const desiredCamPos = camera.position.clone();
    const desiredCamTarget = controls.target.clone();
    let cameraTransitionTimer = 0;

    const onUserControlStart = () => {
      // Stop automatic camera transition if user manually grabs OrbitControls
      cameraTransitionTimer = 0;
    };
    controls.addEventListener('start', onUserControlStart);

    // --- 5. 3-Point Studio Lighting Rig + Shadow Maps ---
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.85);
    hemiLight.position.set(0, 18, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#f8fafc', 2.2);
    keyLight.position.set(8.5, 16.0, 9.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.left = -14;
    keyLight.shadow.camera.right = 14;
    keyLight.shadow.camera.top = 14;
    keyLight.shadow.camera.bottom = -14;
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 42.0;
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
    cyanRimLight.position.set(-10.0, 8.5, -9.0);
    scene.add(cyanRimLight);

    const purpleFillLight = new THREE.DirectionalLight('#c084fc', 0.9);
    purpleFillLight.position.set(-7.5, 6.0, 8.5);
    scene.add(purpleFillLight);

    // --- 6. Instantiate Overworld & Station 3D Directors ---
    const overworld = createOverworld3DScene({
      store: ZenGameStore,
      onSelectStation: (labId) => {
        ZenGameStore.enterStation(labId);
      }
    });

    const stationDirector = createStation3DDirector({
      store: ZenGameStore
    });

    scene.add(overworld.group);
    scene.add(stationDirector.group);

    let activeSceneMode = initialMode;
    let activeLabId = initialState.activeLabId || 'lab1';
    let activeWorldId = initialState.selectedWorld || initialState.activeWorldId || 'all';

    overworld.group.visible = activeSceneMode === 'overworld';
    stationDirector.group.visible = activeSceneMode === 'station';
    if (overworld.focusWorld) {
      overworld.focusWorld(activeWorldId);
    }

    // Subscribe to ZenGameStore for sceneMode, activeLabId, and selectedWorld transitions
    const unsubStore = ZenGameStore.subscribe((state) => {
      const nextMode = state.sceneMode === 'station' ? 'station' : 'overworld';
      const nextLabId = state.activeLabId || 'lab1';
      const nextWorldId = state.selectedWorld || state.activeWorldId || 'all';

      if (nextWorldId !== activeWorldId) {
        activeWorldId = nextWorldId;
        if (overworld.focusWorld) {
          overworld.focusWorld(activeWorldId);
        }
      }

      if (nextMode !== activeSceneMode || (nextMode === 'station' && nextLabId !== activeLabId)) {
        activeSceneMode = nextMode;
        activeLabId = nextLabId;

        overworld.group.visible = activeSceneMode === 'overworld';
        stationDirector.group.visible = activeSceneMode === 'station';

        if (activeSceneMode === 'station') {
          stationDirector.setActiveStation(activeLabId);
          desiredCamPos.copy(STATION_CAM_POS);
          desiredCamTarget.copy(STATION_CAM_TARGET);
          if (overworld.teleportZenToStation) {
            overworld.teleportZenToStation(activeLabId);
          }
        } else {
          desiredCamPos.copy(OVERWORLD_CAM_POS);
          desiredCamTarget.copy(OVERWORLD_CAM_TARGET);
        }
        cameraTransitionTimer = 0.85;
      }
    });

    // --- 7. AA Post-Processing Pipeline (postprocessing + n8ao) ---
    let composer = null;
    let n8aoPass = null;
    let usePostProcessing = true;

    try {
      composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType
      });

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      try {
        n8aoPass = new N8AOPostPass(scene, camera, initialWidth, initialHeight);
        if (n8aoPass.configuration) {
          n8aoPass.configuration.aoRadius = 1.2;
          n8aoPass.configuration.distanceFalloff = 2.0;
          n8aoPass.configuration.intensity = 2.2;
        }
        composer.addPass(n8aoPass);
      } catch {
        n8aoPass = null;
      }

      const bloomEffect = new BloomEffect({
        intensity: 1.15,
        luminanceThreshold: 0.72,
        luminanceSmoothing: 0.25,
        mipmapBlur: true
      });

      const vignetteEffect = new VignetteEffect({
        darkness: 0.42,
        offset: 0.32
      });

      const toneMappingEffect = new ToneMappingEffect({
        mode: ToneMappingMode.ACES_FILMIC
      });

      const effectPass = new EffectPass(camera, bloomEffect, vignetteEffect, toneMappingEffect);
      composer.addPass(effectPass);
    } catch {
      usePostProcessing = false;
    }

    // --- 8. Raycast Pointer Event Routing (Overworld + Stations) ---
    const getNormalizedDeviceCoords = (event) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || initialWidth;
      const height = rect.height || initialHeight;
      return {
        x: ((event.clientX - rect.left) / width) * 2 - 1,
        y: -((event.clientY - rect.top) / height) * 2 + 1
      };
    };

    let pointerDownClient = { x: 0, y: 0 };

    const handlePointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      pointerDownClient = { x: event.clientX, y: event.clientY };
      const ndc = getNormalizedDeviceCoords(event);

      if (activeSceneMode === 'station') {
        const handled = stationDirector.handlePointerDown(ndc, camera);
        if (stationDirector.isDragging()) {
          controls.enabled = false;
          canvas.style.cursor = 'grabbing';
        } else if (handled) {
          canvas.style.cursor = 'pointer';
        }
      } else {
        // In overworld mode, check if user clicked directly on a portal first
        const hoveredPortal = overworld.handlePointerMove(ndc, camera);
        if (hoveredPortal) {
          overworld.handlePointerDown(ndc, camera);
        }
      }
    };

    const handlePointerMove = (event) => {
      const ndc = getNormalizedDeviceCoords(event);

      if (activeSceneMode === 'station') {
        const res = stationDirector.handlePointerMove(ndc, camera);
        if (res?.dragging || stationDirector.isDragging()) {
          controls.enabled = false;
          canvas.style.cursor = 'grabbing';
        } else if (res?.hovered) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'grab';
        }
      } else {
        const hoveredPortalId = overworld.handlePointerMove(ndc, camera);
        canvas.style.cursor = hoveredPortalId ? 'pointer' : 'grab';
      }
    };

    const handlePointerUp = (event) => {
      const ndc = getNormalizedDeviceCoords(event);

      if (activeSceneMode === 'station') {
        stationDirector.handlePointerUp(ndc, camera);
        controls.enabled = true;
        canvas.style.cursor = 'grab';
      } else {
        overworld.handlePointerUp(ndc, camera);
        // If user clicked the floor without dragging the camera, fly Zen there
        const moveDist = Math.hypot(
          event.clientX - pointerDownClient.x,
          event.clientY - pointerDownClient.y
        );
        const hoveredPortal = overworld.handlePointerMove(ndc, camera);
        if (moveDist < 7 && !hoveredPortal) {
          overworld.handlePointerDown(ndc, camera);
        }
        controls.enabled = true;
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // --- 9. Responsive Viewport Resize ---
    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        try {
          composer.setSize(w, h);
        } catch {
          // Ignore composer resize error on fallback context
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // --- 10. 60fps Render & Simulation Loop + E2E Diagnostics ---
    let lastTime = performance.now();
    let elapsedTime = 0;
    let fpsCounter = 60;

    const updateDiagnostics = (dt) => {
      if (typeof window === 'undefined') return;
      const instantFps = dt > 0.0001 ? 1 / dt : 60;
      fpsCounter = fpsCounter * 0.9 + instantFps * 0.1;
      const st = ZenGameStore.getState();

      window.__ZEN_3D_DIAGNOSTICS__ = {
        fps: Math.round(fpsCounter),
        sceneMode: st.sceneMode,
        activeLabId: st.activeLabId,
        activeWorldId: st.activeWorldId,
        activeModal: st.activeModal,
        rapierReady: Boolean(window.__ZEN_RAPIER_READY__),
        postProcessingActive: Boolean(usePostProcessing && composer),
        n8aoActive: Boolean(n8aoPass),
        rendererInfo: {
          geometries: renderer.info?.memory?.geometries || 0,
          textures: renderer.info?.memory?.textures || 0,
          calls: renderer.info?.render?.calls || 0,
          triangles: renderer.info?.render?.triangles || 0
        }
      };
    };

    const animate = (now) => {
      if (isDisposed) return;
      animationFrameId = window.requestAnimationFrame(animate);

      const rawDt = (now - lastTime) * 0.001;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
      elapsedTime += dt;

      // Step Rapier3D physics world if ready
      if (rapierWorld) {
        try {
          rapierWorld.step();
        } catch {
          // Ignore step errors
        }
      }

      // Smooth camera transition between Overworld and Station viewports
      if (cameraTransitionTimer > 0) {
        cameraTransitionTimer = Math.max(0, cameraTransitionTimer - dt);
        const lerpAlpha = 1 - Math.exp(-5.8 * dt);
        camera.position.lerp(desiredCamPos, lerpAlpha);
        controls.target.lerp(desiredCamTarget, lerpAlpha);
      }

      controls.update();

      // Update active 3D scene director
      if (activeSceneMode === 'station') {
        stationDirector.update(dt, elapsedTime, camera);
      } else {
        overworld.update(dt, elapsedTime);
      }

      // Render frame via AA EffectComposer (with automatic fallback to WebGLRenderer)
      if (usePostProcessing && composer) {
        try {
          composer.render(dt);
        } catch {
          usePostProcessing = false;
          renderer.render(scene, camera);
        }
      } else {
        renderer.render(scene, camera);
      }

      updateDiagnostics(dt);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    // --- 11. Cleanup on Unmount ---
    return () => {
      isDisposed = true;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      unsubStore?.();
      controls.removeEventListener('start', onUserControlStart);
      controls.dispose();

      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      overworld.dispose?.();
      stationDirector.dispose?.();

      if (envMapTexture) {
        envMapTexture.dispose();
      }
      if (composer) {
        composer.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="zen-game-3d-canvas"
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#060b16] ${className}`}
      style={{ width: '100vw', height: '100vh', ...style }}
    />
  );
}

export default ZenGame3DCanvas;
