import * as THREE from 'three';
import { StorageEngine } from '../../core/storage.js';
import { AudioEngine } from '../../core/audio.js';
import { LAB_METADATA } from '../../core/labMeta.js';
import {
  createHologramMaterial,
  createForcefieldMaterial,
  createLaserPulseMaterial,
  createCircuitFloorMaterial,
  updateShaderTime
} from '../shaders/SciFiShaders.js';
import {
  getLabPanelPBRTextures,
  getFruitPBRTextures,
  createHebrewLabelSprite,
  updateHebrewLabelSprite
} from '../engine/ProceduralTextures.js';
import { createZen3DRobot } from '../zen/Zen3DRobot.js';

/**
 * Playable 3D Isometric Sci-Fi Laboratory Complex ("מפת המסע 3D")
 *
 * Features:
 * - 4 Themed Architectural World Zones connected by glowing laser energy bridges
 *   over an animated `createCircuitFloorMaterial` floor.
 * - 8 Interactive 3D Station Portals (`lab1`..`lab8`), each with:
 *   - Beveled octagonal PBR pedestal & glowing forcefield arch
 *   - Unique rotating 3D miniature hologram sculpture per station topic
 *   - 3 physical 3D Star Crystals above the arch synced to `labStars[labId]`
 *   - Crisp RTL Hebrew 3D label sign (`תחנה X: ...`)
 * - Playable 3D Zen Robot character controller (`WASD` / Arrow keys + click-to-fly
 *   floor navigation + direct portal click + cyan/gold thruster particle trail).
 */

const WORLD_ZONES = [
  {
    id: 'world1',
    title: 'עולם 1: שפת המכונה',
    subtitle: 'ביטים, פיקסלים ואלגוריתמים',
    color: '#fbbf24',
    center: [4.9, 0, -3.3],
    labs: ['lab1', 'lab2']
  },
  {
    id: 'world2',
    title: 'עולם 2: חשיבה בלשית וניווט',
    subtitle: 'עצי החלטות ומציאת מסלול חכם',
    color: '#10b981',
    center: [-4.9, 0, -3.3],
    labs: ['lab3', 'lab4']
  },
  {
    id: 'world3',
    title: 'עולם 3: מחשב שלומד ורואה',
    subtitle: 'סיווג k-NN וראיית מכונה',
    color: '#38bdf8',
    center: [4.9, 0, 3.3],
    labs: ['lab5', 'lab6']
  },
  {
    id: 'world4',
    title: 'עולם 4: מוח מלאכותי ויצירת שפה',
    subtitle: 'נוירונים ומודלי שפה (LLM)',
    color: '#f43f5e',
    center: [-4.9, 0, 3.3],
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
    position: [6.4, 0, -2.0]
  },
  {
    id: 'lab2',
    number: 2,
    worldId: 'world1',
    title: 'תחנה 2: לתכנת רובוט',
    subtext: 'אלגוריתם ולולאות',
    color: '#38bdf8',
    position: [3.4, 0, -4.6]
  },
  {
    id: 'lab3',
    number: 3,
    worldId: 'world2',
    title: 'תחנה 3: עץ החלטות בלשי',
    subtext: 'שאלות כן / לא',
    color: '#10b981',
    position: [-3.4, 0, -4.6]
  },
  {
    id: 'lab4',
    number: 4,
    worldId: 'world2',
    title: 'תחנה 4: הווייז של הרובוט',
    subtext: 'ניווט חכם A*',
    color: '#f97316',
    position: [-6.4, 0, -2.0]
  },
  {
    id: 'lab5',
    number: 5,
    worldId: 'world3',
    title: 'תחנה 5: איך מחשב לומד?',
    subtext: 'השכנים הקרובים k-NN',
    color: '#a855f7',
    position: [6.4, 0, 2.0]
  },
  {
    id: 'lab6',
    number: 6,
    worldId: 'world3',
    title: 'תחנה 6: העיניים של המחשב',
    subtext: 'פילטרים וגילוי קצוות',
    color: '#06b6d4',
    position: [3.4, 0, 4.6]
  },
  {
    id: 'lab7',
    number: 7,
    worldId: 'world4',
    title: 'תחנה 7: נוירון חכם',
    subtext: 'משקלים וסף החלטה',
    color: '#f43f5e',
    position: [-3.4, 0, 4.6]
  },
  {
    id: 'lab8',
    number: 8,
    worldId: 'world4',
    title: 'תחנה 8: מודל שפה חכם',
    subtext: 'חיזוי המילה הבאה',
    color: '#eab308',
    position: [-6.4, 0, 2.0]
  }
];

/**
 * Builds the unique 3D miniature hologram sculpture for each station (`lab1`..`lab8`).
 */
function createStationHologramSculpture(labId, accentColor) {
  const root = new THREE.Group();
  root.name = `Hologram_${labId}`;
  const holoMat = createHologramMaterial({
    color: accentColor,
    opacity: 0.78,
    scanlineScale: 48.0
  });

  if (labId === 'lab1') {
    // 1: 3D Voxel Heart
    const coords = [
      [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1],
      [-1, 2], [1, 2],
      [-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0],
      [-1, -1], [0, -1], [1, -1],
      [0, -2]
    ];
    const cubeGeom = new THREE.BoxGeometry(0.11, 0.11, 0.11);
    coords.forEach(([cx, cy]) => {
      const vox = new THREE.Mesh(cubeGeom, holoMat);
      vox.position.set(cx * 0.12, cy * 0.12 + 0.05, 0);
      root.add(vox);
    });
  } else if (labId === 'lab2') {
    // 2: 3D Maze Key
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 20), holoMat);
    bow.position.y = 0.16;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.36, 10), holoMat);
    shaft.position.y = -0.08;
    const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.045, 0.045), holoMat);
    tooth1.position.set(0.06, -0.16, 0);
    const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.045), holoMat);
    tooth2.position.set(0.045, -0.24, 0);
    root.add(bow, shaft, tooth1, tooth2);
  } else if (labId === 'lab3') {
    // 3: 3D Branching Decision Tree
    const nodeGeom = new THREE.SphereGeometry(0.075, 12, 12);
    const rootNode = new THREE.Mesh(nodeGeom, holoMat);
    rootNode.position.set(0, 0.24, 0);

    const leftChild = new THREE.Mesh(nodeGeom, holoMat);
    leftChild.position.set(-0.22, 0.0, 0);
    const rightChild = new THREE.Mesh(nodeGeom, holoMat);
    rightChild.position.set(0.22, 0.0, 0);

    const branchGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 8);
    const bLeft = new THREE.Mesh(branchGeom, holoMat);
    bLeft.position.set(-0.11, 0.12, 0);
    bLeft.rotation.z = -0.68;
    const bRight = new THREE.Mesh(branchGeom, holoMat);
    bRight.position.set(0.11, 0.12, 0);
    bRight.rotation.z = 0.68;

    const leafOffsets = [-0.32, -0.12, 0.12, 0.32];
    leafOffsets.forEach((lx) => {
      const leaf = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), holoMat);
      leaf.position.set(lx, -0.22, 0);
      root.add(leaf);
    });

    root.add(rootNode, leftChild, rightChild, bLeft, bRight);
  } else if (labId === 'lab4') {
    // 4: 3D Ringed Planet & Orbiting Ship
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), holoMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.022, 10, 28), holoMat);
    ring.rotation.x = Math.PI / 2.6;
    ring.rotation.y = 0.3;

    const ship = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.18, 6), holoMat);
    ship.position.set(0.32, 0.12, 0);
    ship.rotation.z = -Math.PI / 3;

    root.add(planet, ring, ship);
  } else if (labId === 'lab5') {
    // 5: 3D Apple & Watermelon Orbit
    const fruitTex = getFruitPBRTextures();
    const appleMat = new THREE.MeshStandardMaterial({
      map: fruitTex.appleTexture,
      normalMap: fruitTex.appleNormalMap,
      roughness: 0.25,
      metalness: 0.1,
      emissive: new THREE.Color('#dc2626'),
      emissiveIntensity: 0.35
    });
    const melonMat = new THREE.MeshStandardMaterial({
      map: fruitTex.melonTexture,
      normalMap: fruitTex.melonNormalMap,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color('#16a34a'),
      emissiveIntensity: 0.35
    });

    const centerSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), holoMat);
    const orbitTrack = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 8, 24), holoMat);
    orbitTrack.rotation.x = Math.PI / 2;

    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), appleMat);
    apple.position.set(-0.26, 0.04, 0);

    const melon = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), melonMat);
    melon.scale.set(1.15, 0.92, 1.0);
    melon.position.set(0.26, -0.04, 0);

    root.add(centerSphere, orbitTrack, apple, melon);
  } else if (labId === 'lab6') {
    // 6: 3D Scanning Laser Grid (3x3 Kernel + Sweep Beam)
    const cellGeom = new THREE.BoxGeometry(0.11, 0.11, 0.03);
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const cell = new THREE.Mesh(cellGeom, holoMat);
        cell.position.set(c * 0.14, r * 0.14, 0);
        root.add(cell);
      }
    }
    const scanBarMat = new THREE.MeshBasicMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0.9
    });
    const scanBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.06), scanBarMat);
    scanBar.name = 'ScanBar';
    root.add(scanBar);
  } else if (labId === 'lab7') {
    // 7: 3D Glowing Neuron Core & Synaptic Dendrites
    const soma = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), holoMat);
    root.add(soma);

    const dirs = [
      [1, 0.6, 0],
      [-1, 0.6, 0],
      [0.8, -0.7, 0.4],
      [-0.8, -0.7, -0.4],
      [0, 1, 0.5],
      [0, -1, -0.5]
    ];
    dirs.forEach(([dx, dy, dz]) => {
      const vec = new THREE.Vector3(dx, dy, dz).normalize();
      const dendrite = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.28, 8), holoMat);
      dendrite.position.copy(vec).multiplyScalar(0.20);
      dendrite.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);

      const synapse = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), holoMat);
      synapse.position.copy(vec).multiplyScalar(0.34);
      root.add(dendrite, synapse);
    });
  } else {
    // 8: 3D Orbiting Hebrew Token Cubes
    const corePrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), holoMat);
    root.add(corePrism);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), holoMat);
      cube.position.set(Math.cos(angle) * 0.28, (i - 1) * 0.08, Math.sin(angle) * 0.28);
      root.add(cube);
    }
  }

  return root;
}

export function createOverworld3DScene({ store = StorageEngine, onSelectStation } = {}) {
  const group = new THREE.Group();
  group.name = 'Overworld3DComplex';

  const pbr = getLabPanelPBRTextures();
  const raycaster = new THREE.Raycaster();

  // --- Shared Architectural Materials ---
  const platformMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0f172a'),
    metalness: 0.78,
    roughness: 0.28,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35)
  });

  const bezelTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    metalness: 0.85,
    roughness: 0.22
  });

  const starEarnedMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    emissive: new THREE.Color('#f59e0b'),
    emissiveIntensity: 2.2,
    metalness: 0.85,
    roughness: 0.12
  });

  const starLockedMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    emissive: new THREE.Color('#0f172a'),
    emissiveIntensity: 0.2,
    metalness: 0.5,
    roughness: 0.45,
    transparent: true,
    opacity: 0.65
  });

  // --- 1. Animated Sci-Fi Circuit Floor ---
  const floorMaterial = createCircuitFloorMaterial({
    bgColor: '#040914',
    gridColor: '#1e293b',
    pulseColor: '#0ea5e9',
    gridScale: 1.0
  });
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(56, 56), floorMaterial);
  floorMesh.name = 'Overworld_Floor';
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.05;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // --- 2. Central Command Nexus Plaza ---
  const nexusGroup = new THREE.Group();
  nexusGroup.name = 'CommandNexus';
  group.add(nexusGroup);

  const nexusBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.15, 2.35, 0.24, 8),
    platformMat
  );
  nexusBase.position.y = 0.08;
  nexusBase.receiveShadow = true;
  nexusGroup.add(nexusBase);

  const nexusRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    emissive: new THREE.Color('#f59e0b'),
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.2
  });
  const nexusRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.045, 12, 32),
    nexusRingMat
  );
  nexusRing.rotation.x = Math.PI / 2;
  nexusRing.position.y = 0.21;
  nexusGroup.add(nexusRing);

  const nexusLabel = createHebrewLabelSprite('מרכז הפיקוד ZenLab 3D', {
    subtext: 'הזיזו את זֶן (WASD / חצים) או לחצו על תחנה כדי להיכנס',
    accentColor: '#38bdf8',
    scale: [3.6, 0.92]
  });
  nexusLabel.position.set(0, 3.25, -0.4);
  nexusGroup.add(nexusLabel);

  // --- 3. Four Themed Architectural World Zones & Glowing Energy Bridges ---
  const zoneGroups = {};
  const bridgeLaserMat = createLaserPulseMaterial({
    color: '#38bdf8',
    pulseColor: '#fde047',
    speed: 3.5,
    opacity: 0.85
  });

  WORLD_ZONES.forEach((zone) => {
    const zGroup = new THREE.Group();
    zGroup.name = `Zone_${zone.id}`;
    zGroup.position.set(zone.center[0], zone.center[1], zone.center[2]);
    group.add(zGroup);
    zoneGroups[zone.id] = zGroup;

    // Beveled Zone Plaza Platform
    const zonePlat = new THREE.Mesh(
      new THREE.CylinderGeometry(3.35, 3.6, 0.18, 8),
      platformMat
    );
    zonePlat.position.y = 0.04;
    zonePlat.receiveShadow = true;
    zGroup.add(zonePlat);

    // Zone Accent Rim
    const zoneRimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(zone.color),
      emissive: new THREE.Color(zone.color),
      emissiveIntensity: 1.15,
      metalness: 0.7,
      roughness: 0.25
    });
    const zoneRim = new THREE.Mesh(
      new THREE.TorusGeometry(3.38, 0.038, 8, 8),
      zoneRimMat
    );
    zoneRim.rotation.x = Math.PI / 2;
    zoneRim.position.y = 0.14;
    zGroup.add(zoneRim);

    // Decorative Sci-Fi Telemetry Pillar on outer corner of Zone
    const pillarSignX = Math.sign(zone.center[0]) * 2.55;
    const pillarSignZ = Math.sign(zone.center[2]) * 2.15;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 2.2, 8),
      bezelTrimMat
    );
    pillar.position.set(pillarSignX, 1.1, pillarSignZ);
    pillar.castShadow = true;
    zGroup.add(pillar);

    const pillarCap = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      zoneRimMat
    );
    pillarCap.position.set(pillarSignX, 2.38, pillarSignZ);
    zGroup.add(pillarCap);

    // Floating RTL Hebrew World Zone Banner Sign
    const zoneLabel = createHebrewLabelSprite(zone.title, {
      subtext: zone.subtitle,
      accentColor: zone.color,
      scale: [3.1, 0.84]
    });
    zoneLabel.position.set(pillarSignX * 0.45, 3.1, pillarSignZ * 0.55);
    zGroup.add(zoneLabel);

    // Glowing Energy Bridge connecting Central Nexus `(0,0,0)` to Zone Center
    const startVec = new THREE.Vector3(0, 0.11, 0);
    const endVec = new THREE.Vector3(zone.center[0], 0.11, zone.center[2]);
    const bridgeDelta = new THREE.Vector3().subVectors(endVec, startVec);
    const bridgeLen = bridgeDelta.length();
    const bridgeMid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

    const bridgeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.04, bridgeLen),
      bridgeLaserMat
    );
    bridgeMesh.position.copy(bridgeMid);
    bridgeMesh.lookAt(endVec);
    group.add(bridgeMesh);
  });

  // --- 4. Eight Physical Interactive 3D Station Portals (`lab1`..`lab8`) ---
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

    // 4a. Beveled Octagonal Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.34, 0.28, 8),
      platformMat
    );
    pedestal.position.y = 0.14;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    pedestal.userData = { labId: cfg.id };
    portalGroup.add(pedestal);
    interactiveHitMeshes.push(pedestal);

    const ringColorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.color),
      emissive: new THREE.Color(cfg.color),
      emissiveIntensity: 1.65,
      metalness: 0.75,
      roughness: 0.2
    });
    const activationRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.045, 12, 32),
      ringColorMat
    );
    activationRing.rotation.x = Math.PI / 2;
    activationRing.position.y = 0.29;
    portalGroup.add(activationRing);

    // 4b. Glowing Portal Arch Frame + Volumetric Forcefield Disc
    const archMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.075, 14, 32, Math.PI),
      bezelTrimMat
    );
    archMesh.position.y = 1.05;
    archMesh.castShadow = true;
    archMesh.userData = { labId: cfg.id };
    portalGroup.add(archMesh);
    interactiveHitMeshes.push(archMesh);

    const archGlowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.032, 12, 32, Math.PI),
      ringColorMat
    );
    archGlowRing.position.y = 1.05;
    portalGroup.add(archGlowRing);

    const forcefieldMat = createForcefieldMaterial({
      color: cfg.color,
      secondaryColor: '#fbbf24',
      opacity: 0.34
    });
    const forcefieldDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.84, 32),
      forcefieldMat
    );
    forcefieldDisc.position.set(0, 1.05, 0);
    forcefieldDisc.userData = { labId: cfg.id };
    portalGroup.add(forcefieldDisc);
    interactiveHitMeshes.push(forcefieldDisc);

    // Invisible generous click hitbox cylinder so children / touchscreens can click effortlessly
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitboxMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 2.7, 12),
      hitboxMat
    );
    hitboxMesh.position.y = 1.35;
    hitboxMesh.userData = { labId: cfg.id, isPortalHitbox: true };
    portalGroup.add(hitboxMesh);
    interactiveHitMeshes.push(hitboxMesh);

    // 4c. Unique Rotating 3D Miniature Hologram Sculpture
    const hologramSculpture = createStationHologramSculpture(cfg.id, cfg.color);
    hologramSculpture.position.set(0, 1.12, 0.14);
    portalGroup.add(hologramSculpture);

    // 4d. Three Physical 3D Star Crystals above the Arch
    const starCrystals = [];
    const starCountEarned = Number(initialStars[cfg.id] || 0);
    const starOffsets = [
      [-0.38, 2.15, 0],
      [0, 2.26, 0],
      [0.38, 2.15, 0]
    ];
    starOffsets.forEach(([sx, sy, sz], idx) => {
      const isEarned = idx < starCountEarned;
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.125, 0),
        isEarned ? starEarnedMat : starLockedMat
      );
      crystal.position.set(sx, sy, sz);
      crystal.userData = { starIndex: idx, isEarned };
      portalGroup.add(crystal);
      starCrystals.push(crystal);
    });

    // 4e. Crisp RTL Hebrew 3D Label Sign (`תחנה X: ...`)
    const metaTitle = LAB_METADATA[cfg.id]?.shortLabel || cfg.title;
    const labelText = cfg.title.includes('תחנה') ? cfg.title : `תחנה ${cfg.number}: ${metaTitle}`;
    const labelSprite = createHebrewLabelSprite(labelText, {
      subtext: `${cfg.subtext} • ★ ${starCountEarned}/3`,
      accentColor: cfg.color,
      scale: [2.55, 0.78]
    });
    labelSprite.position.set(0, 2.72, 0);
    labelSprite.userData.labId = cfg.id;
    portalGroup.add(labelSprite);
    interactiveHitMeshes.push(labelSprite);

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
      forcefieldMat,
      hologramSculpture,
      starCrystals,
      labelSprite,
      burstTimer: 0,
      isHovered: false
    };

    portals.push(portalRecord);
    portalByLabId[cfg.id] = portalRecord;
  });

  // --- 5. Playable 3D Zen Robot Character & Thruster Particle Trail ---
  const zenRobot = createZen3DRobot();
  zenRobot.group.position.set(0, 0.22, 0.55);
  group.add(zenRobot.group);

  // Target destination marker ring on floor when clicking to move
  const targetMarkerMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const targetMarkerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.42, 24),
    targetMarkerMat
  );
  targetMarkerRing.rotation.x = -Math.PI / 2;
  targetMarkerRing.position.y = 0.03;
  group.add(targetMarkerRing);

  // Pooled 3D Thruster Trail Particles (Cyan & Gold)
  const TRAIL_POOL_SIZE = 28;
  const trailParticles = [];
  const trailGeom = new THREE.SphereGeometry(0.075, 8, 8);
  for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? '#38bdf8' : '#fbbf24',
      transparent: true,
      opacity: 0.0
    });
    const pMesh = new THREE.Mesh(trailGeom, pMat);
    pMesh.visible = false;
    group.add(pMesh);
    trailParticles.push({
      mesh: pMesh,
      life: 0,
      maxLife: 0.55,
      velocity: new THREE.Vector3()
    });
  }
  let trailSpawnCursor = 0;
  let trailSpawnAccumulator = 0;

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
  let portalTriggerCooldown = 0.6; // Grace period on initial spawn
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

  /**
   * Synchronizes the 3 physical 3D Star Crystals and Hebrew label subtext on all 8 portals
   */
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
      updateHebrewLabelSprite(
        p.labelSprite,
        p.title,
        `${p.subtext} • ★ ${count}/3`,
        p.color
      );
    });
  }

  let unsubStore = null;
  if (store && typeof store.subscribe === 'function') {
    unsubStore = store.subscribe(syncState);
  } else if (StorageEngine && typeof StorageEngine.subscribe === 'function') {
    unsubStore = StorageEngine.subscribe(syncState);
  }

  /**
   * Triggers a portal energy burst, celebrates with Zen, and invokes `onSelectStation(labId)`
   */
  function triggerStationPortal(labId) {
    const portal = portalByLabId[labId];
    if (!portal) return;

    portal.burstTimer = 0.65;
    portalTriggerCooldown = 1.1;
    zenRobot.setMood('celebrating');
    AudioEngine.playStep();

    if (typeof onSelectStation === 'function') {
      onSelectStation(labId);
    }
  }

  /**
   * Helper to configure raycaster from flexible arguments `(ndc, camera)` or `(raycaster)`
   */
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

  /**
   * Pointer hover handler: highlights hovered 3D station portal and updates Zen's gaze
   */
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

  /**
   * Pointer click/tap handler:
   * - Clicking a Station Portal flies Zen toward the portal, triggers an energy burst,
   *   and launches the selected station (`onSelectStation(labId)`).
   * - Clicking anywhere on the 3D floor flies Zen smoothly to that coordinate.
   */
  function handlePointerDown(ndcOrRaycaster, camera) {
    const rc = prepareRaycaster(ndcOrRaycaster, camera);
    if (!rc) return false;

    // 1. Check station portals first
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

    // 2. Otherwise check 3D laboratory floor for click-to-fly navigation
    const floorHits = rc.intersectObject(floorMesh, false);
    if (floorHits.length > 0) {
      const pt = floorHits[0].point;
      const clampedX = THREE.MathUtils.clamp(pt.x, -9.5, 9.5);
      const clampedZ = THREE.MathUtils.clamp(pt.z, -7.2, 7.2);
      moveTarget = new THREE.Vector3(clampedX, 0.22, clampedZ);
      pendingPortalId = null;
      targetMarkerRing.position.set(clampedX, 0.04, clampedZ);
      targetMarkerMat.color.set('#38bdf8');
      targetMarkerMat.opacity = 0.85;
      AudioEngine.playClick();
      return true;
    }

    return false;
  }

  function handlePointerUp() {
    return false;
  }

  /**
   * Filters or highlights a specific World Zone (`all` | `world1`..`world4`)
   */
  function focusWorld(worldId = 'all') {
    selectedWorldFilter = worldId || 'all';
    portals.forEach((p) => {
      const isMatch = selectedWorldFilter === 'all' || p.worldId === selectedWorldFilter;
      p.group.visible = true;
      p.group.scale.setScalar(isMatch ? 1.0 : 0.78);
    });
  }

  /**
   * Teleports Zen directly to a station portal
   */
  function teleportZenToStation(labId) {
    const portal = portalByLabId[labId];
    if (!portal) return;
    zenRobot.group.position.set(portal.position.x, 0.22, portal.position.z + 0.85);
    moveTarget = null;
  }

  /**
   * Main 60fps simulation & animation loop
   */
  function update(dt = 0.016, elapsedTime = 0) {
    const safeDt = Math.min(dt || 0.016, 0.1);
    if (portalTriggerCooldown > 0) {
      portalTriggerCooldown = Math.max(0, portalTriggerCooldown - safeDt);
    }

    // 1. Update all custom GLSL shaders (`uTime`)
    updateShaderTime(group, elapsedTime);

    // 2. Compute Zen Robot velocity from WASD/Arrow keys or click-to-fly target
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

    // Apply velocity & clamp within laboratory plaza bounds
    if (Math.hypot(vx, vz) > 0.01) {
      zenRobot.group.position.x = THREE.MathUtils.clamp(
        zenRobot.group.position.x + vx * safeDt,
        -9.5,
        9.5
      );
      zenRobot.group.position.z = THREE.MathUtils.clamp(
        zenRobot.group.position.z + vz * safeDt,
        -7.2,
        7.2
      );

      // Smoothly rotate Zen toward travel direction
      const desiredAngle = Math.atan2(vx, vz);
      let angleDiff = desiredAngle - zenRobot.group.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      zenRobot.group.rotation.y += angleDiff * Math.min(1.0, safeDt * 10.0);

      // Spawn glowing cyan/gold thruster trail particles
      trailSpawnAccumulator += safeDt;
      if (trailSpawnAccumulator >= 0.045) {
        trailSpawnAccumulator = 0;
        const p = trailParticles[trailSpawnCursor];
        trailSpawnCursor = (trailSpawnCursor + 1) % TRAIL_POOL_SIZE;
        p.life = p.maxLife;
        p.mesh.visible = true;
        p.mesh.position.set(
          zenRobot.group.position.x + (Math.random() - 0.5) * 0.16,
          0.22 + Math.random() * 0.1,
          zenRobot.group.position.z + (Math.random() - 0.5) * 0.16
        );
        p.mesh.scale.setScalar(1.0);
        p.mesh.material.opacity = 0.85;
        p.velocity.set(-vx * 0.15, 0.35 + Math.random() * 0.25, -vz * 0.15);
      }
    }

    // Update thruster trail particles
    for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
      const p = trailParticles[i];
      if (p.life > 0) {
        p.life -= safeDt;
        if (p.life <= 0) {
          p.mesh.visible = false;
        } else {
          const ratio = p.life / p.maxLife;
          p.mesh.position.addScaledVector(p.velocity, safeDt);
          p.mesh.scale.setScalar(0.35 + ratio * 0.75);
          p.mesh.material.opacity = ratio * 0.8;
        }
      }
    }

    // Fade floor destination marker ring
    if (targetMarkerMat.opacity > 0) {
      targetMarkerRing.rotation.z = elapsedTime * 2.5;
      if (!moveTarget) {
        targetMarkerMat.opacity = Math.max(0, targetMarkerMat.opacity - safeDt * 1.8);
      }
    }

    // 3. Update all 8 Station Portals & check proximity activation ring
    let lookTarget = null;
    portals.forEach((p, idx) => {
      // Rotate miniature hologram sculpture
      p.hologramSculpture.rotation.y = elapsedTime * 1.15 + idx * 0.5;
      p.hologramSculpture.position.y = 1.12 + Math.sin(elapsedTime * 2.4 + idx) * 0.055;

      // Special animation for Lab 6 Scanning Laser Bar
      if (p.id === 'lab6') {
        const scanBar = p.hologramSculpture.getObjectByName('ScanBar');
        if (scanBar) {
          scanBar.position.y = Math.sin(elapsedTime * 3.2) * 0.18;
        }
      }

      // Rotate 3D Star Crystals
      p.starCrystals.forEach((crystal, sIdx) => {
        crystal.rotation.y = elapsedTime * 1.8 + sIdx * 1.1;
        const baseY = sIdx === 1 ? 2.26 : 2.15;
        crystal.position.y = baseY + Math.sin(elapsedTime * 3.0 + sIdx) * 0.03;
      });

      // Portal hover / burst visual feedback
      if (p.burstTimer > 0) {
        p.burstTimer = Math.max(0, p.burstTimer - safeDt);
        const burstScale = 1.0 + Math.sin((p.burstTimer / 0.65) * Math.PI) * 0.35;
        p.activationRing.scale.setScalar(burstScale);
        p.forcefieldMat.uniforms.uPulseIntensity.value = 2.2;
      } else {
        const hoverScale = p.isHovered ? 1.12 : 1.0 + Math.sin(elapsedTime * 2.5 + idx) * 0.025;
        p.activationRing.scale.setScalar(
          THREE.MathUtils.lerp(p.activationRing.scale.x, hoverScale, safeDt * 8.0)
        );
        p.forcefieldMat.uniforms.uPulseIntensity.value = p.isHovered ? 1.55 : 1.0;
      }

      if (p.isHovered) {
        lookTarget = p.position;
      }

      // Check if Zen walked into the portal's activation ring
      const distToZen = Math.hypot(
        zenRobot.group.position.x - p.position.x,
        zenRobot.group.position.z - p.position.z
      );
      if (distToZen < 0.92 && portalTriggerCooldown <= 0 && hasKeyboardInput) {
        triggerStationPortal(p.id);
      }
    });

    // 4. Update Zen 3D Robot character controller
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
    cameraPosition: new THREE.Vector3(0, 13.8, 15.8),
    cameraTarget: new THREE.Vector3(0, 0.4, 0),
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
