import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { StorageEngine } from '../../core/storage.js';
import { AudioEngine } from '../../core/audio.js';
import { LAB_METADATA } from '../../core/labMeta.js';
import {
  getFruitPBRTextures,
  createHebrewLabelSprite
} from '../engine/ProceduralTextures.js';
import { createZen3DRobot } from '../zen/Zen3DRobot.js';

/**
 * Playable Nintendo 2.5D Toy-Board Overworld ("מפת המסע 3D")
 *
 * Performance & Spatial Clarity Design:
 * - Bright Nintendo daylight/pastel palette with chunky, colorful tactile toy-block islands
 *   for the 4 Worlds (zero full-screen shader overdraw).
 * - Proximity- & Hover-Only Station Popups: Instead of 13 permanently open signs cluttering
 *   the screen, station title badges smoothly pop up ONLY when Zen approaches a station or
 *   when the player hovers over a station block.
 * - Zero runtime CanvasTexture allocations during movement or hover.
 */

const WORLD_ZONES = [
  {
    id: 'world1',
    title: 'עולם 1: שפת המכונה',
    color: '#f59e0b',
    islandColor: '#fef3c7',
    trimColor: '#fbbf24',
    center: [4.6, 0, -2.9],
    labs: ['lab1', 'lab2']
  },
  {
    id: 'world2',
    title: 'עולם 2: חשיבה בלשית וניווט',
    color: '#10b981',
    islandColor: '#d1fae5',
    trimColor: '#34d399',
    center: [-4.6, 0, -2.9],
    labs: ['lab3', 'lab4']
  },
  {
    id: 'world3',
    title: 'עולם 3: מחשב שלומד ורואה',
    color: '#0ea5e9',
    islandColor: '#e0f2fe',
    trimColor: '#38bdf8',
    center: [4.6, 0, 2.9],
    labs: ['lab5', 'lab6']
  },
  {
    id: 'world4',
    title: 'עולם 4: מוח מלאכותי ויצירת שפה',
    color: '#f43f5e',
    islandColor: '#ffe4e6',
    trimColor: '#fb7185',
    center: [-4.6, 0, 2.9],
    labs: ['lab7', 'lab8']
  }
];

const STATION_CONFIGS = [
  {
    id: 'lab1',
    number: 1,
    worldId: 'world1',
    title: 'תחנה 1: ציור בפיקסלים',
    subtext: 'ביטים של 0 ו-1',
    color: '#f59e0b',
    blockColor: '#fffbeb',
    position: [5.9, 0, -1.7]
  },
  {
    id: 'lab2',
    number: 2,
    worldId: 'world1',
    title: 'תחנה 2: לתכנת רובוט',
    subtext: 'אלגוריתם ולולאות',
    color: '#0284c7',
    blockColor: '#f0f9ff',
    position: [3.2, 0, -4.0]
  },
  {
    id: 'lab3',
    number: 3,
    worldId: 'world2',
    title: 'תחנה 3: עץ החלטות בלשי',
    subtext: 'שאלות כן / לא',
    color: '#059669',
    blockColor: '#ecfdf5',
    position: [-3.2, 0, -4.0]
  },
  {
    id: 'lab4',
    number: 4,
    worldId: 'world2',
    title: 'תחנה 4: הווייז של הרובוט',
    subtext: 'ניווט חכם A*',
    color: '#ea580c',
    blockColor: '#fff7ed',
    position: [-5.9, 0, -1.7]
  },
  {
    id: 'lab5',
    number: 5,
    worldId: 'world3',
    title: 'תחנה 5: איך מחשב לומד?',
    subtext: 'השכנים הקרובים k-NN',
    color: '#9333ea',
    blockColor: '#faf5ff',
    position: [5.9, 0, 1.7]
  },
  {
    id: 'lab6',
    number: 6,
    worldId: 'world3',
    title: 'תחנה 6: העיניים של המחשב',
    subtext: 'פילטרים וגילוי קצוות',
    color: '#0891b2',
    blockColor: '#ecfeff',
    position: [3.2, 0, 4.0]
  },
  {
    id: 'lab7',
    number: 7,
    worldId: 'world4',
    title: 'תחנה 7: נוירון חכם',
    subtext: 'משקלים וסף החלטה',
    color: '#e11d48',
    blockColor: '#fff1f2',
    position: [-3.2, 0, 4.0]
  },
  {
    id: 'lab8',
    number: 8,
    worldId: 'world4',
    title: 'תחנה 8: מודל שפה חכם',
    subtext: 'חיזוי המילה הבאה',
    color: '#ca8a04',
    blockColor: '#fefce8',
    position: [-5.9, 0, 1.7]
  }
];

/**
 * Tactile Nintendo Toy Sculpture for each station (`lab1`..`lab8`).
 * Zero heavy custom fragment shaders — uses clean, vibrant toy-plastic MeshStandardMaterial.
 */
function createStationToySculpture(labId, accentColor) {
  const root = new THREE.Group();
  root.name = `ToySculpture_${labId}`;
  const toyMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.25,
    metalness: 0.1
  });
  const whiteToyMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.05
  });

  if (labId === 'lab1') {
    const coords = [
      [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1],
      [-1, 2], [1, 2],
      [-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0],
      [-1, -1], [0, -1], [1, -1],
      [0, -2]
    ];
    const cubeGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    coords.forEach(([cx, cy]) => {
      const vox = new THREE.Mesh(cubeGeom, toyMat);
      vox.position.set(cx * 0.13, cy * 0.13 + 0.05, 0);
      root.add(vox);
    });
  } else if (labId === 'lab2') {
    const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.2, metalness: 0.3 });
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 10, 20), goldMat);
    bow.position.y = 0.16;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.36, 10), goldMat);
    shaft.position.y = -0.08;
    const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.05), goldMat);
    tooth1.position.set(0.06, -0.16, 0);
    root.add(bow, shaft, tooth1);
  } else if (labId === 'lab3') {
    const nodeGeom = new THREE.SphereGeometry(0.085, 12, 12);
    const rootNode = new THREE.Mesh(nodeGeom, toyMat);
    rootNode.position.set(0, 0.22, 0);
    const leftChild = new THREE.Mesh(nodeGeom, whiteToyMat);
    leftChild.position.set(-0.2, -0.05, 0);
    const rightChild = new THREE.Mesh(nodeGeom, whiteToyMat);
    rightChild.position.set(0.2, -0.05, 0);
    root.add(rootNode, leftChild, rightChild);
  } else if (labId === 'lab4') {
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), toyMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.028, 8, 24), whiteToyMat);
    ring.rotation.x = Math.PI / 2.6;
    root.add(planet, ring);
  } else if (labId === 'lab5') {
    const fruitTex = getFruitPBRTextures();
    const appleMat = new THREE.MeshStandardMaterial({
      map: fruitTex.appleTexture,
      roughness: 0.22,
      metalness: 0.05
    });
    const melonMat = new THREE.MeshStandardMaterial({
      map: fruitTex.melonTexture,
      roughness: 0.25,
      metalness: 0.05
    });
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), appleMat);
    apple.position.set(-0.18, 0.04, 0);
    const melon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), melonMat);
    melon.scale.set(1.18, 0.92, 1.0);
    melon.position.set(0.18, -0.02, 0);
    root.add(apple, melon);
  } else if (labId === 'lab6') {
    const cellGeom = new THREE.BoxGeometry(0.11, 0.11, 0.04);
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const cell = new THREE.Mesh(cellGeom, (r + c) % 2 === 0 ? toyMat : whiteToyMat);
        cell.position.set(c * 0.14, r * 0.14, 0);
        root.add(cell);
      }
    }
  } else if (labId === 'lab7') {
    const soma = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), toyMat);
    root.add(soma);
  } else {
    const cubeGeom = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    for (let i = -1; i <= 1; i++) {
      const cube = new THREE.Mesh(cubeGeom, i === 0 ? toyMat : whiteToyMat);
      cube.position.set(i * 0.2, Math.abs(i) * 0.06, 0);
      root.add(cube);
    }
  }

  return root;
}

export function createOverworld3DScene({ store = StorageEngine, onSelectStation } = {}) {
  const group = new THREE.Group();
  group.name = 'Overworld3DComplex';

  const raycaster = new THREE.Raycaster();

  // --- Shared Nintendo Toy Materials ---
  const baseBoardMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.38,
    metalness: 0.04
  });

  const bridgeToyMat = new THREE.MeshStandardMaterial({
    color: '#bae6fd',
    roughness: 0.3,
    metalness: 0.05
  });

  const starEarnedMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#f59e0b',
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.3
  });

  const starLockedMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.5,
    metalness: 0.1
  });

  // --- 1. Clean Bright Toy-Table Base Plane (Zero Shader Overdraw) ---
  const floorMesh = new THREE.Mesh(
    new RoundedBoxGeometry(20.5, 0.3, 14.5, 4, 0.12),
    baseBoardMat
  );
  floorMesh.name = 'Overworld_Floor';
  floorMesh.position.y = -0.18;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Subtle outer wooden/gold toy frame rim
  const boardRim = new THREE.Mesh(
    new RoundedBoxGeometry(21.1, 0.24, 15.1, 4, 0.12),
    new THREE.MeshStandardMaterial({ color: '#93c5fd', roughness: 0.4, metalness: 0.05 })
  );
  boardRim.position.y = -0.25;
  group.add(boardRim);

  // --- 2. Central Hub Pad ---
  const nexusBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.9, 0.24, 24),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, metalness: 0.05 })
  );
  nexusBase.position.y = 0.06;
  nexusBase.receiveShadow = true;
  group.add(nexusBase);

  const nexusRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.055, 12, 32),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25 })
  );
  nexusRing.rotation.x = Math.PI / 2;
  nexusRing.position.y = 0.19;
  group.add(nexusRing);

  // --- 3. Four Colorful Nintendo Toy-Block World Islands ---
  const zoneGroups = {};

  WORLD_ZONES.forEach((zone) => {
    const zGroup = new THREE.Group();
    zGroup.name = `Zone_${zone.id}`;
    zGroup.position.set(zone.center[0], zone.center[1], zone.center[2]);
    group.add(zGroup);
    zoneGroups[zone.id] = zGroup;

    // Chunky Rounded Toy Island Block
    const zoneIsland = new THREE.Mesh(
      new RoundedBoxGeometry(6.2, 0.28, 4.9, 4, 0.12),
      new THREE.MeshStandardMaterial({
        color: zone.islandColor,
        roughness: 0.35,
        metalness: 0.02
      })
    );
    zoneIsland.position.y = 0.04;
    zoneIsland.receiveShadow = true;
    zGroup.add(zoneIsland);

    // Tactile Colored Trim Border
    const zoneTrim = new THREE.Mesh(
      new RoundedBoxGeometry(6.36, 0.18, 5.06, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: zone.trimColor,
        roughness: 0.3,
        metalness: 0.05
      })
    );
    zoneTrim.position.y = -0.02;
    zGroup.add(zoneTrim);

    // Bridge from Central Hub to World Island
    const startVec = new THREE.Vector3(0, 0.05, 0);
    const endVec = new THREE.Vector3(zone.center[0], 0.05, zone.center[2]);
    const bridgeDelta = new THREE.Vector3().subVectors(endVec, startVec);
    const bridgeLen = bridgeDelta.length();
    const bridgeMid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

    const bridgeMesh = new THREE.Mesh(
      new RoundedBoxGeometry(0.65, 0.12, bridgeLen, 2, 0.04),
      bridgeToyMat
    );
    bridgeMesh.position.copy(bridgeMid);
    bridgeMesh.lookAt(endVec);
    group.add(bridgeMesh);
  });

  // --- 4. Eight Tactile Toy-Block Station Portals (`lab1`..`lab8`) ---
  const portals = [];
  const portalByLabId = {};
  const interactiveHitMeshes = [];

  const initialStars = store?.getState?.()?.labStars || StorageEngine.getState()?.labStars || {};

  STATION_CONFIGS.forEach((cfg) => {
    const portalGroup = new THREE.Group();
    portalGroup.name = `Portal_${cfg.id}`;
    portalGroup.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
    portalGroup.userData = { labId: cfg.id, isPortalGroup: true };
    group.add(portalGroup);

    // 4a. Chunky Toy Block Pedestal
    const pedestal = new THREE.Mesh(
      new RoundedBoxGeometry(2.1, 0.42, 2.1, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: cfg.blockColor,
        roughness: 0.28,
        metalness: 0.04
      })
    );
    pedestal.position.y = 0.22;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    pedestal.userData = { labId: cfg.id };
    portalGroup.add(pedestal);
    interactiveHitMeshes.push(pedestal);

    const ringColorMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: 0.25,
      metalness: 0.1
    });

    const activationRing = new THREE.Mesh(
      new RoundedBoxGeometry(2.22, 0.24, 2.22, 4, 0.08),
      ringColorMat
    );
    activationRing.position.y = 0.16;
    activationRing.userData = { labId: cfg.id };
    portalGroup.add(activationRing);

    // 4b. Clean Toy Arch Frame
    const archMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.085, 12, 28, Math.PI),
      ringColorMat
    );
    archMesh.position.y = 0.92;
    archMesh.castShadow = true;
    archMesh.userData = { labId: cfg.id };
    portalGroup.add(archMesh);
    interactiveHitMeshes.push(archMesh);

    // Generous Invisible Hitbox for Easy Clicking
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitboxMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 2.4, 12),
      hitboxMat
    );
    hitboxMesh.position.y = 1.2;
    hitboxMesh.userData = { labId: cfg.id, isPortalHitbox: true };
    portalGroup.add(hitboxMesh);
    interactiveHitMeshes.push(hitboxMesh);

    // 4c. Tactile 3D Toy Sculpture
    const hologramSculpture = createStationToySculpture(cfg.id, cfg.color);
    hologramSculpture.position.set(0, 0.96, 0.12);
    portalGroup.add(hologramSculpture);

    // 4d. Three Physical 3D Star Crystals above the Arch
    const starCrystals = [];
    const starCountEarned = Number(initialStars[cfg.id] || 0);
    const starOffsets = [
      [-0.34, 1.88, 0],
      [0, 1.98, 0],
      [0.34, 1.88, 0]
    ];
    starOffsets.forEach(([sx, sy, sz], idx) => {
      const isEarned = idx < starCountEarned;
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        isEarned ? starEarnedMat : starLockedMat
      );
      crystal.position.set(sx, sy, sz);
      crystal.userData = { starIndex: idx, isEarned };
      portalGroup.add(crystal);
      starCrystals.push(crystal);
    });

    // 4e. Proximity / Hover-Only Popup Sign — hidden by default, pops up ONLY when Zen is near or hovered!
    const labelText = cfg.title;
    const labelSprite = createHebrewLabelSprite(labelText, {
      subtext: `${cfg.subtext} • לחצו לכניסה ▶`,
      accentColor: cfg.color,
      scale: [2.45, 0.76]
    });
    labelSprite.position.set(0, 2.42, 0);
    labelSprite.visible = false;
    labelSprite.userData.labId = cfg.id;
    portalGroup.add(labelSprite);

    const portalRecord = {
      id: cfg.id,
      number: cfg.number,
      worldId: cfg.worldId,
      title: labelText,
      subtext: cfg.subtext,
      color: cfg.color,
      group: portalGroup,
      position: new THREE.Vector3(cfg.position[0], cfg.position[1], cfg.position[2]),
      activationRing,
      ringColorMat,
      hologramSculpture,
      starCrystals,
      labelSprite,
      popupScale: 0,
      burstTimer: 0,
      isHovered: false
    };

    portals.push(portalRecord);
    portalByLabId[cfg.id] = portalRecord;
  });

  // --- 5. Playable 3D Zen Robot Character ---
  const zenRobot = createZen3DRobot();
  zenRobot.group.position.set(0, 0.22, 0.55);
  group.add(zenRobot.group);

  const targetMarkerMat = new THREE.MeshBasicMaterial({
    color: '#0284c7',
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const targetMarkerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.42, 24),
    targetMarkerMat
  );
  targetMarkerRing.rotation.x = -Math.PI / 2;
  targetMarkerRing.position.y = 0.04;
  group.add(targetMarkerRing);

  // --- 6. Keyboard (`WASD` / Arrow Keys) & Pointer Navigation State ---
  const keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  let moveTarget = null;
  let pendingPortalId = null;
  let hoveredPortalId = null;
  let portalTriggerCooldown = 0.6;
  let selectedWorldFilter = 'all';

  const onKeyDown = (e) => {
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const code = e.code || e.key;
    if (code === 'KeyW' || code === 'ArrowUp') keysPressed.up = true;
    if (code === 'KeyS' || code === 'ArrowDown') keysPressed.down = true;
    if (code === 'KeyA' || code === 'ArrowLeft') keysPressed.left = true;
    if (code === 'KeyD' || code === 'ArrowRight') keysPressed.right = true;
  };

  const onKeyUp = (e) => {
    const code = e.code || e.key;
    if (code === 'KeyW' || code === 'ArrowUp') keysPressed.up = false;
    if (code === 'KeyS' || code === 'ArrowDown') keysPressed.down = false;
    if (code === 'KeyA' || code === 'ArrowLeft') keysPressed.left = false;
    if (code === 'KeyD' || code === 'ArrowRight') keysPressed.right = false;
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  function syncState(stateObj) {
    const starsMap =
      stateObj?.labStars ||
      store?.getState?.()?.labStars ||
      StorageEngine.getState()?.labStars ||
      {};

    portals.forEach((p) => {
      const count = Number(starsMap[p.id] || 0);
      p.starCrystals.forEach((crystal, idx) => {
        const earned = idx < count;
        crystal.userData.isEarned = earned;
        crystal.material = earned ? starEarnedMat : starLockedMat;
      });
    });
  }

  let unsubStore = null;
  if (store && typeof store.subscribe === 'function') {
    unsubStore = store.subscribe(syncState);
  } else if (StorageEngine && typeof StorageEngine.subscribe === 'function') {
    unsubStore = StorageEngine.subscribe(syncState);
  }

  function triggerStationPortal(labId) {
    const portal = portalByLabId[labId];
    if (!portal) return;

    portal.burstTimer = 0.55;
    portalTriggerCooldown = 1.0;
    zenRobot.setMood('celebrating');
    AudioEngine.playStep();

    if (typeof onSelectStation === 'function') {
      onSelectStation(labId);
    }
  }

  function prepareRaycaster(ndcOrRaycaster, camera) {
    if (!ndcOrRaycaster) return null;
    if (ndcOrRaycaster.isRaycaster) {
      return ndcOrRaycaster;
    }
    if (camera && typeof ndcOrRaycaster.x === 'number' && typeof ndcOrRaycaster.y === 'number') {
      raycaster.setFromCamera(ndcOrRaycaster, camera);
      return raycaster;
    }
    return null;
  }

  function handlePointerMove(ndcOrRaycaster, camera) {
    const rc = prepareRaycaster(ndcOrRaycaster, camera);
    if (!rc) return null;

    const hits = rc.intersectObjects(interactiveHitMeshes, true);
    let hitLabId = null;
    for (let i = 0; i < hits.length; i++) {
      let obj = hits[i].object;
      while (obj) {
        if (obj.userData && obj.userData.labId) {
          hitLabId = obj.userData.labId;
          break;
        }
        obj = obj.parent;
      }
      if (hitLabId) break;
    }

    hoveredPortalId = hitLabId;
    portals.forEach((p) => {
      p.isHovered = p.id === hoveredPortalId;
    });

    return hitLabId;
  }

  function handlePointerDown(ndcOrRaycaster, camera) {
    const rc = prepareRaycaster(ndcOrRaycaster, camera);
    if (!rc) return false;

    const portalHits = rc.intersectObjects(interactiveHitMeshes, true);
    for (let i = 0; i < portalHits.length; i++) {
      let obj = portalHits[i].object;
      while (obj) {
        if (obj.userData && obj.userData.labId) {
          const clickedLabId = obj.userData.labId;
          const portal = portalByLabId[clickedLabId];
          if (portal) {
            moveTarget = new THREE.Vector3(portal.position.x, 0.22, portal.position.z + 0.55);
            pendingPortalId = clickedLabId;
            targetMarkerRing.position.set(portal.position.x, 0.04, portal.position.z);
            targetMarkerMat.color.set(portal.color);
            targetMarkerMat.opacity = 0.9;
            triggerStationPortal(clickedLabId);
            return true;
          }
        }
        obj = obj.parent;
      }
    }

    const floorHits = rc.intersectObject(floorMesh, false);
    if (floorHits.length > 0) {
      const pt = floorHits[0].point;
      const clampedX = THREE.MathUtils.clamp(pt.x, -8.5, 8.5);
      const clampedZ = THREE.MathUtils.clamp(pt.z, -6.2, 6.2);
      moveTarget = new THREE.Vector3(clampedX, 0.22, clampedZ);
      pendingPortalId = null;
      targetMarkerRing.position.set(clampedX, 0.04, clampedZ);
      targetMarkerMat.color.set('#0284c7');
      targetMarkerMat.opacity = 0.85;
      AudioEngine.playClick();
      return true;
    }

    return false;
  }

  function handlePointerUp() {
    return false;
  }

  function focusWorld(worldId = 'all') {
    selectedWorldFilter = worldId || 'all';
    portals.forEach((p) => {
      const isMatch = selectedWorldFilter === 'all' || p.worldId === selectedWorldFilter;
      p.group.visible = true;
      p.group.scale.setScalar(isMatch ? 1.0 : 0.8);
    });
  }

  function teleportZenToStation(labId) {
    const portal = portalByLabId[labId];
    if (!portal) return;
    zenRobot.group.position.set(portal.position.x, 0.22, portal.position.z + 0.85);
    moveTarget = null;
  }

  function update(dt = 0.016, elapsedTime = 0) {
    const safeDt = Math.min(dt || 0.016, 0.05);
    if (portalTriggerCooldown > 0) {
      portalTriggerCooldown = Math.max(0, portalTriggerCooldown - safeDt);
    }

    const moveSpeed = 5.4;
    let vx = 0;
    let vz = 0;

    const hasKeyboardInput =
      keysPressed.up || keysPressed.down || keysPressed.left || keysPressed.right;

    if (hasKeyboardInput) {
      moveTarget = null;
      pendingPortalId = null;
      if (keysPressed.up) vz -= 1;
      if (keysPressed.down) vz += 1;
      if (keysPressed.left) vx -= 1;
      if (keysPressed.right) vx += 1;

      const len = Math.hypot(vx, vz) || 1;
      vx = (vx / len) * moveSpeed;
      vz = (vz / len) * moveSpeed;
    } else if (moveTarget) {
      const dx = moveTarget.x - zenRobot.group.position.x;
      const dz = moveTarget.z - zenRobot.group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.14) {
        const speedFactor = Math.min(moveSpeed, Math.max(1.8, dist * 3.5));
        vx = (dx / dist) * speedFactor;
        vz = (dz / dist) * speedFactor;
      } else {
        moveTarget = null;
        if (pendingPortalId && portalTriggerCooldown <= 0) {
          const targetId = pendingPortalId;
          pendingPortalId = null;
          triggerStationPortal(targetId);
        }
      }
    }

    if (Math.hypot(vx, vz) > 0.01) {
      zenRobot.group.position.x = THREE.MathUtils.clamp(
        zenRobot.group.position.x + vx * safeDt,
        -8.5,
        8.5
      );
      zenRobot.group.position.z = THREE.MathUtils.clamp(
        zenRobot.group.position.z + vz * safeDt,
        -6.2,
        6.2
      );

      const desiredAngle = Math.atan2(vx, vz);
      let angleDiff = desiredAngle - zenRobot.group.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      zenRobot.group.rotation.y += angleDiff * Math.min(1.0, safeDt * 10.0);
    }

    if (targetMarkerMat.opacity > 0) {
      targetMarkerRing.rotation.z = elapsedTime * 2.0;
      if (!moveTarget) {
        targetMarkerMat.opacity = Math.max(0, targetMarkerMat.opacity - safeDt * 1.8);
      }
    }

    // Update Station Toy Portals & Proximity/Hover Popups
    let lookTarget = null;
    portals.forEach((p, idx) => {
      p.hologramSculpture.rotation.y = elapsedTime * 0.9 + idx * 0.5;

      const distToZen = Math.hypot(
        zenRobot.group.position.x - p.position.x,
        zenRobot.group.position.z - p.position.z
      );

      // Show full popup sign ONLY when hovered or when Zen is near (`distToZen < 2.6`)
      const isNearOrHovered = p.isHovered || distToZen < 2.6;
      const targetPopup = isNearOrHovered ? 1.0 : 0.0;
      p.popupScale = THREE.MathUtils.lerp(p.popupScale, targetPopup, Math.min(1, safeDt * 12));

      if (p.popupScale > 0.05) {
        p.labelSprite.visible = true;
        p.labelSprite.scale.set(2.45 * p.popupScale, 0.76 * p.popupScale, 1);
      } else {
        p.labelSprite.visible = false;
      }

      if (p.isHovered) {
        lookTarget = p.position;
      }

      if (distToZen < 0.92 && portalTriggerCooldown <= 0 && hasKeyboardInput) {
        triggerStationPortal(p.id);
      }
    });

    zenRobot.update(safeDt, elapsedTime, {
      velocity: { x: vx, y: 0, z: vz },
      targetLookAt: lookTarget
    });
  }

  function dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
    if (unsubStore) {
      unsubStore();
    }
    zenRobot.dispose();
  }

  return {
    group,
    scene: group,
    zenRobot,
    portals,
    portalByLabId,
    cameraPosition: new THREE.Vector3(0, 14.2, 13.6),
    cameraTarget: new THREE.Vector3(0, 0.2, 0.3),
    update,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    focusWorld,
    teleportZenToStation,
    triggerStationPortal,
    syncState,
    dispose
  };
}
