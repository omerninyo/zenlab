import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { NarrationEngine } from '../../core/narration.js';
import { StorageEngine } from '../../core/storage.js';
import { getLabPanelPBRTextures } from '../engine/ProceduralTextures.js';

const GADGET_STORAGE_KEY = 'zenlab_equipped_gadget_v1';
const GADGET_TIERS = [
  { id: 'default', minStars: 0 },
  { id: 'visor_cyber', minStars: 2 },
  { id: 'ears_plasma', minStars: 5 },
  { id: 'crown_radar', minStars: 9 },
  { id: 'halo_neural', minStars: 15 }
];

function resolveEquippedZenGadget(totalStars = 0) {
  if (typeof window === 'undefined') return 'default';
  try {
    const saved = window.localStorage.getItem(GADGET_STORAGE_KEY);
    if (saved) {
      const found = GADGET_TIERS.find((g) => g.id === saved);
      if (found && totalStars >= found.minStars) return saved;
    }
    const unlocked = GADGET_TIERS.filter((g) => totalStars >= g.minStars);
    return unlocked[unlocked.length - 1]?.id || 'default';
  } catch {
    return 'default';
  }
}

/**
 * Living 3D Zen Robot Character Controller (`Zen3DRobot.js`)
 *
 * Features:
 * - Immediate procedural multi-part beveled PBR mesh construction:
 *   Titanium torso, chest reactor core, articulated head, glowing visor with
 *   8-bar 3D audio equalizer waveform & expressive 3D eyes, antenna stalk + orb,
 *   floating articulated hands, thruster cone + multi-ring plasma particles,
 *   and all 4 Workshop Upgrade meshes (`Upgrade_visor_cyber`, `Upgrade_ears_plasma`,
 *   `Upgrade_crown_radar`, `Upgrade_halo_neural`).
 * - Asynchronous `/models/zen_robot.glb` enhancement via `GLTFLoader`.
 * - Real-time voice-sync with `NarrationEngine.getState().isPlaying`.
 * - Expressive mood physics (`happy`, `thinking`, `celebrating`, `error`).
 */

let cachedGltfGeometries = null;
let gltfLoadPromise = null;

function loadZenGltfGeometries() {
  if (cachedGltfGeometries) {
    return Promise.resolve(cachedGltfGeometries);
  }
  if (gltfLoadPromise) {
    return gltfLoadPromise;
  }
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  gltfLoadPromise = new Promise((resolve) => {
    try {
      const loader = new GLTFLoader();
      loader.load(
        '/models/zen_robot.glb',
        (gltf) => {
          const map = {};
          if (gltf && gltf.scene) {
            gltf.scene.traverse((child) => {
              if (child.isMesh && child.name && child.geometry) {
                const geom = child.geometry.clone();
                geom.computeBoundingBox();
                geom.center();
                geom.computeVertexNormals();
                map[child.name] = geom;
              }
            });
          }
          cachedGltfGeometries = map;
          resolve(map);
        },
        undefined,
        () => {
          // Graceful procedural fallback if GLB fetch fails
          resolve(null);
        }
      );
    } catch {
      resolve(null);
    }
  });

  return gltfLoadPromise;
}

export function createZen3DRobot(options = {}) {
  const group = new THREE.Group();
  group.name = 'Zen3DRobotRoot';

  // Inner floating rig so root `group.position` can be driven by navigation/physics
  // without losing hover oscillation or celebration hops.
  const hoverRig = new THREE.Group();
  hoverRig.name = 'Zen_HoverRig';
  group.add(hoverRig);

  const pbr = getLabPanelPBRTextures();

  // --- Shared PBR Materials ---
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e2e8f0'),
    metalness: 0.78,
    roughness: 0.24,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.25, 0.25)
  });

  const darkChassisMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1e293b'),
    metalness: 0.82,
    roughness: 0.32,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.2, 0.2)
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    emissive: new THREE.Color('#d97706'),
    emissiveIntensity: 0.35,
    metalness: 0.88,
    roughness: 0.18
  });

  const visorScreenMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#020617'),
    emissive: new THREE.Color('#082f49'),
    emissiveIntensity: 0.55,
    metalness: 0.2,
    roughness: 0.12
  });

  const coreEmissiveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 2.2,
    metalness: 0.1,
    roughness: 0.15
  });

  const antennaOrbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    emissive: new THREE.Color('#fbbf24'),
    emissiveIntensity: 1.8,
    metalness: 0.2,
    roughness: 0.15
  });

  const eyeEmissiveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 2.0,
    roughness: 0.1
  });

  // --- 1. Torso (`Zen_Torso`) & Chest Reactor Core (`Zen_ChestCore`) ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.95, 0);
  hoverRig.add(torsoGroup);

  const torsoGeom = new THREE.CylinderGeometry(0.29, 0.23, 0.56, 16);
  const torsoMesh = new THREE.Mesh(torsoGeom, titaniumMat);
  torsoMesh.name = 'Zen_Torso';
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // Beveled shoulder collar ring
  const collarMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.032, 12, 24),
    darkChassisMat
  );
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.y = 0.27;
  torsoGroup.add(collarMesh);

  // Chest Reactor Core (`Zen_ChestCore`)
  const chestCoreBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20),
    goldTrimMat
  );
  chestCoreBezel.rotation.x = Math.PI / 2;
  chestCoreBezel.position.set(0, 0.03, 0.255);
  torsoGroup.add(chestCoreBezel);

  const chestCoreMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.06, 20),
    coreEmissiveMat
  );
  chestCoreMesh.name = 'Zen_ChestCore';
  chestCoreMesh.rotation.x = Math.PI / 2;
  chestCoreMesh.position.set(0, 0.03, 0.265);
  torsoGroup.add(chestCoreMesh);

  // --- 2. Thruster Cone (`Zen_Thruster`) & Plasma Ring Particles ---
  const thrusterGroup = new THREE.Group();
  thrusterGroup.position.set(0, 0.48, 0);
  hoverRig.add(thrusterGroup);

  const thrusterMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.28, 16),
    darkChassisMat
  );
  thrusterMesh.name = 'Zen_Thruster';
  thrusterMesh.rotation.x = Math.PI;
  thrusterMesh.castShadow = true;
  thrusterGroup.add(thrusterMesh);

  const plasmaRings = [];
  for (let i = 0; i < 3; i++) {
    const ringMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? '#38bdf8' : '#fbbf24',
      transparent: true,
      opacity: 0.75 - i * 0.2,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.18 - i * 0.035, 0.018, 10, 24),
      ringMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.16 - i * 0.11;
    thrusterGroup.add(ring);
    plasmaRings.push(ring);
  }

  // --- 3. Floating Articulated Hands (`Zen_Hand_L`, `Zen_Hand_R`) ---
  const handGeom = new THREE.CapsuleGeometry(0.085, 0.16, 8, 16);
  const handL = new THREE.Mesh(handGeom, titaniumMat);
  handL.name = 'Zen_Hand_L';
  handL.position.set(-0.48, 0.96, 0.06);
  handL.castShadow = true;
  hoverRig.add(handL);

  const handLCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.016, 8, 16),
    goldTrimMat
  );
  handLCuff.rotation.x = Math.PI / 2;
  handL.add(handLCuff);

  const handR = new THREE.Mesh(handGeom.clone(), titaniumMat);
  handR.name = 'Zen_Hand_R';
  handR.position.set(0.48, 0.96, 0.06);
  handR.castShadow = true;
  hoverRig.add(handR);

  const handRCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.016, 8, 16),
    goldTrimMat
  );
  handRCuff.rotation.x = Math.PI / 2;
  handR.add(handRCuff);

  // --- 4. Articulated Head (`Zen_Head`), Visor (`Zen_Visor`) & 8-Bar 3D Audio Waveform ---
  const headGroup = new THREE.Group();
  headGroup.name = 'Zen_HeadGroup';
  headGroup.position.set(0, 1.56, 0);
  hoverRig.add(headGroup);

  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.44, 0.48),
    titaniumMat
  );
  headMesh.name = 'Zen_Head';
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // Metallic gold head bezel trim
  const headRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.46, 0.42),
    goldTrimMat
  );
  headRim.position.set(0, 0, -0.02);
  headGroup.add(headRim);

  // Glowing Visor Glass (`Zen_Visor`)
  const visorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.28, 0.06),
    visorScreenMat
  );
  visorMesh.name = 'Zen_Visor';
  visorMesh.position.set(0, 0.0, 0.23);
  headGroup.add(visorMesh);

  // Expressive 3D Eyes inside Visor
  const eyesGroup = new THREE.Group();
  eyesGroup.position.set(0, 0.03, 0.268);
  headGroup.add(eyesGroup);

  const eyeGeom = new THREE.SphereGeometry(0.052, 16, 12);
  eyeGeom.scale(1.0, 1.15, 0.35);
  const leftEye = new THREE.Mesh(eyeGeom, eyeEmissiveMat);
  leftEye.position.set(-0.125, 0, 0);
  const rightEye = new THREE.Mesh(eyeGeom, eyeEmissiveMat);
  rightEye.position.set(0.125, 0, 0);
  eyesGroup.add(leftEye, rightEye);

  // 8-Bar 3D Audio Waveform Segments across Zen's Visor
  const waveformGroup = new THREE.Group();
  waveformGroup.name = 'Zen_VisorWaveform';
  waveformGroup.position.set(0, -0.065, 0.272);
  headGroup.add(waveformGroup);

  const waveformBars = [];
  const barCount = 8;
  const barSpacing = 0.052;
  const startX = -((barCount - 1) * barSpacing) / 2;

  for (let i = 0; i < barCount; i++) {
    const barMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(i % 2 === 0 ? '#38bdf8' : '#fbbf24'),
      emissive: new THREE.Color(i % 2 === 0 ? '#38bdf8' : '#fbbf24'),
      emissiveIntensity: 2.4,
      roughness: 0.1
    });
    const barMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.04, 0.018),
      barMat
    );
    barMesh.position.set(startX + i * barSpacing, 0, 0);
    waveformGroup.add(barMesh);
    waveformBars.push(barMesh);
  }

  // --- 5. Antenna Stalk (`Zen_AntennaStalk`) & Glowing Orb (`Zen_AntennaOrb`) ---
  const antennaGroup = new THREE.Group();
  antennaGroup.position.set(0, 0.24, 0);
  headGroup.add(antennaGroup);

  const antennaStalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.035, 0.22, 12),
    goldTrimMat
  );
  antennaStalk.name = 'Zen_AntennaStalk';
  antennaStalk.position.y = 0.10;
  antennaGroup.add(antennaStalk);

  const antennaOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    antennaOrbMat
  );
  antennaOrb.name = 'Zen_AntennaOrb';
  antennaOrb.position.y = 0.24;
  antennaGroup.add(antennaOrb);

  // --- 6. All 4 Workshop Upgrade Meshes ---
  // 6a. `Upgrade_visor_cyber` (2+ Stars: Cyan Cyber X-Ray Visor Frame)
  const upgradeVisorCyber = new THREE.Group();
  upgradeVisorCyber.name = 'Upgrade_visor_cyber';
  const cyberVisorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#22d3ee'),
    emissive: new THREE.Color('#06b6d4'),
    emissiveIntensity: 1.8,
    metalness: 0.5,
    roughness: 0.15,
    transparent: true,
    opacity: 0.85
  });
  const cyberFrameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.16, 0.10),
    cyberVisorMat
  );
  cyberFrameMesh.position.set(0, 0.03, 0.255);
  upgradeVisorCyber.add(cyberFrameMesh);
  headGroup.add(upgradeVisorCyber);

  // 6b. `Upgrade_ears_plasma` (5+ Stars: Magnetic Plasma Wing Thrusters)
  const upgradeEarsPlasma = new THREE.Group();
  upgradeEarsPlasma.name = 'Upgrade_ears_plasma';
  const plasmaWingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#818cf8'),
    emissive: new THREE.Color('#4f46e5'),
    emissiveIntensity: 1.4,
    metalness: 0.75,
    roughness: 0.2
  });
  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.42, 0.08),
    plasmaWingMat
  );
  leftWing.position.set(-0.42, 0.06, -0.14);
  leftWing.rotation.z = 0.28;

  const rightWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.42, 0.08),
    plasmaWingMat
  );
  rightWing.position.set(0.42, 0.06, -0.14);
  rightWing.rotation.z = -0.28;

  upgradeEarsPlasma.add(leftWing, rightWing);
  torsoGroup.add(upgradeEarsPlasma);

  // 6c. `Upgrade_crown_radar` (9+ Stars: Golden Star Navigator Crown)
  const upgradeCrownRadar = new THREE.Group();
  upgradeCrownRadar.name = 'Upgrade_crown_radar';
  const crownMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fbbf24'),
    emissive: new THREE.Color('#f59e0b'),
    emissiveIntensity: 1.35,
    metalness: 0.9,
    roughness: 0.14
  });
  const crownBase = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.035, 12, 24),
    crownMat
  );
  crownBase.rotation.x = Math.PI / 2;
  crownBase.position.set(0, 0.27, 0);
  upgradeCrownRadar.add(crownBase);

  for (let p = 0; p < 5; p++) {
    const angle = (p / 5) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), crownMat);
    spike.position.set(Math.cos(angle) * 0.24, 0.33, Math.sin(angle) * 0.24);
    upgradeCrownRadar.add(spike);
  }
  headGroup.add(upgradeCrownRadar);

  // 6d. `Upgrade_halo_neural` (15+ Stars: Floating Neural Master Halo)
  const upgradeHaloNeural = new THREE.Group();
  upgradeHaloNeural.name = 'Upgrade_halo_neural';
  const haloMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#34d399'),
    emissive: new THREE.Color('#10b981'),
    emissiveIntensity: 2.1,
    metalness: 0.4,
    roughness: 0.15
  });
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.026, 14, 36),
    haloMat
  );
  haloRing.rotation.x = Math.PI / 2 - 0.18;
  haloRing.position.set(0, 0.56, 0);
  upgradeHaloNeural.add(haloRing);

  for (let n = 0; n < 4; n++) {
    const a = (n / 4) * Math.PI * 2;
    const nodeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), goldTrimMat);
    nodeOrb.position.set(Math.cos(a) * 0.44, 0.56 + Math.sin(a) * 0.075, Math.sin(a) * 0.44);
    upgradeHaloNeural.add(nodeOrb);
  }
  headGroup.add(upgradeHaloNeural);

  // Asynchronously enhance procedural parts with beveled geometries from `/models/zen_robot.glb`
  loadZenGltfGeometries().then((geomMap) => {
    if (!geomMap) return;
    if (geomMap.Zen_Torso) torsoMesh.geometry = geomMap.Zen_Torso;
    if (geomMap.Zen_Head) headMesh.geometry = geomMap.Zen_Head;
    if (geomMap.Zen_Thruster) thrusterMesh.geometry = geomMap.Zen_Thruster;
    if (geomMap.Zen_AntennaOrb) antennaOrb.geometry = geomMap.Zen_AntennaOrb;
  });

  // --- Controller State ---
  let currentMood = options.mood || 'happy';
  let moodTimer = 0;
  let equippedGadget =
    options.equippedGadget ||
    resolveEquippedZenGadget(StorageEngine.getState()?.totalStars || 0);

  function setEquippedGadget(gadgetId) {
    equippedGadget = gadgetId || 'default';
    const totalStars = StorageEngine.getState()?.totalStars || 0;

    const showAll = equippedGadget === 'all';
    const isVisor = showAll || equippedGadget === 'visor_cyber';
    const isEars =
      showAll ||
      equippedGadget === 'ears_plasma' ||
      equippedGadget === 'halo_neural' ||
      (totalStars >= 5 && equippedGadget !== 'default');
    const isCrown =
      showAll ||
      equippedGadget === 'crown_radar' ||
      (totalStars >= 9 && (equippedGadget === 'crown_radar' || equippedGadget === 'halo_neural'));
    const isHalo = showAll || equippedGadget === 'halo_neural';

    upgradeVisorCyber.visible = Boolean(isVisor);
    upgradeEarsPlasma.visible = Boolean(isEars);
    upgradeCrownRadar.visible = Boolean(isCrown);
    upgradeHaloNeural.visible = Boolean(isHalo);
  }

  function setMood(mood) {
    if (!mood) return;
    currentMood = mood;
    moodTimer = 0;

    if (mood === 'celebrating') {
      eyeEmissiveMat.color.set('#fbbf24');
      eyeEmissiveMat.emissive.set('#fbbf24');
      coreEmissiveMat.color.set('#fbbf24');
      coreEmissiveMat.emissive.set('#fbbf24');
      antennaOrbMat.color.set('#fde047');
      antennaOrbMat.emissive.set('#fde047');
    } else if (mood === 'error') {
      eyeEmissiveMat.color.set('#f43f5e');
      eyeEmissiveMat.emissive.set('#f43f5e');
      coreEmissiveMat.color.set('#f43f5e');
      coreEmissiveMat.emissive.set('#f43f5e');
      antennaOrbMat.color.set('#f43f5e');
      antennaOrbMat.emissive.set('#f43f5e');
    } else if (mood === 'thinking') {
      eyeEmissiveMat.color.set('#a855f7');
      eyeEmissiveMat.emissive.set('#a855f7');
      coreEmissiveMat.color.set('#818cf8');
      coreEmissiveMat.emissive.set('#818cf8');
      antennaOrbMat.color.set('#818cf8');
      antennaOrbMat.emissive.set('#818cf8');
    } else {
      eyeEmissiveMat.color.set('#38bdf8');
      eyeEmissiveMat.emissive.set('#38bdf8');
      coreEmissiveMat.color.set('#38bdf8');
      coreEmissiveMat.emissive.set('#38bdf8');
      antennaOrbMat.color.set('#fbbf24');
      antennaOrbMat.emissive.set('#fbbf24');
    }
  }

  // Initialize gadget & mood
  setEquippedGadget(equippedGadget);
  setMood(currentMood);

  // Subscribe to global gadget changes & star unlocks
  let unsubStorage = null;
  const onGadgetEvent = (e) => {
    if (e?.detail?.gadgetId) {
      setEquippedGadget(e.detail.gadgetId);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('zen-gadget-change', onGadgetEvent);
    unsubStorage = StorageEngine.subscribe((state) => {
      setEquippedGadget(resolveEquippedZenGadget(state.totalStars || 0));
    });
  }

  /**
   * Per-frame animation & telemetry update
   * @param {number} dt - Delta time in seconds
   * @param {number} elapsedTime - Total elapsed clock time in seconds
   * @param {Object} [state] - `{ isSpeaking, velocity, targetLookAt }`
   */
  function update(dt = 0.016, elapsedTime = 0, state = {}) {
    const safeDt = Math.min(dt || 0.016, 0.1);
    moodTimer += safeDt;

    const isSpeaking =
      state.isSpeaking !== undefined
        ? Boolean(state.isSpeaking)
        : Boolean(NarrationEngine.getState()?.isPlaying);

    const velocity = state.velocity || { x: 0, y: 0, z: 0 };
    const vx = velocity.x || 0;
    const vz = velocity.z || 0;
    const speed = Math.hypot(vx, vz);

    // 1. Smooth hover oscillation (`Math.sin(elapsedTime * 3.0)`)
    let hoverY = Math.sin(elapsedTime * 3.0) * 0.085;
    let extraSpinY = 0;
    let shudderX = 0;

    // 2. Physical mood reactions (`celebrating` vs `error`)
    if (currentMood === 'celebrating') {
      hoverY += Math.abs(Math.sin(elapsedTime * 7.5)) * 0.22;
      extraSpinY = Math.sin(elapsedTime * 4.5) * 0.45;
    } else if (currentMood === 'error') {
      shudderX = Math.sin(elapsedTime * 38.0) * 0.055 * Math.exp(-moodTimer * 1.5);
    }

    hoverRig.position.y = hoverY;
    hoverRig.position.x = shudderX;

    // 3. Velocity-based forward pitch and banking roll
    const targetPitch = THREE.MathUtils.clamp(speed * 0.065, 0, 0.32);
    const targetRoll = THREE.MathUtils.clamp(-vx * 0.045, -0.26, 0.26);

    hoverRig.rotation.x = THREE.MathUtils.lerp(hoverRig.rotation.x, targetPitch, safeDt * 8.0);
    hoverRig.rotation.z = THREE.MathUtils.lerp(hoverRig.rotation.z, targetRoll, safeDt * 8.0);
    hoverRig.rotation.y = THREE.MathUtils.lerp(hoverRig.rotation.y, extraSpinY, safeDt * 6.0);

    // 4. Floating hands counter-oscillation
    handL.position.y = 0.96 + Math.sin(elapsedTime * 3.6 + 1.0) * 0.045;
    handR.position.y = 0.96 + Math.sin(elapsedTime * 3.6 + 2.4) * 0.045;
    handL.rotation.x = Math.sin(elapsedTime * 2.5) * 0.15 - targetPitch * 0.6;
    handR.rotation.x = -Math.sin(elapsedTime * 2.5) * 0.15 - targetPitch * 0.6;

    // 5. Head subtle tracking / curiosity tilt
    if (state.targetLookAt && state.targetLookAt.isVector3) {
      const dx = state.targetLookAt.x - group.position.x;
      const dz = state.targetLookAt.z - group.position.z;
      const desiredYaw = Math.atan2(dx, dz) - group.rotation.y;
      const clampedYaw = THREE.MathUtils.clamp(desiredYaw, -0.55, 0.55);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, clampedYaw, safeDt * 6.0);
    } else {
      headGroup.rotation.y = Math.sin(elapsedTime * 1.7) * 0.12;
    }
    headGroup.rotation.z = Math.sin(elapsedTime * 2.1) * 0.04;

    // 6. Thruster plasma ring pulsing
    for (let i = 0; i < plasmaRings.length; i++) {
      const ring = plasmaRings[i];
      const wave = (elapsedTime * (3.2 + speed * 0.5) + i * 0.33) % 1.0;
      const scale = 1.0 - wave * 0.45 + (speed > 0.1 ? 0.2 : 0);
      ring.scale.set(scale, scale, 1);
      ring.position.y = -0.12 - wave * 0.32;
      ring.material.opacity = (1.0 - wave) * 0.78;
    }

    // 7. Upgrade animations (Neural Halo rotation)
    if (upgradeHaloNeural.visible) {
      upgradeHaloNeural.rotation.y = elapsedTime * 1.4;
    }

    // 8. Voice-Sync 8-Bar 3D Audio Waveform & Antenna Orb Pulse
    if (isSpeaking) {
      for (let i = 0; i < waveformBars.length; i++) {
        const bar = waveformBars[i];
        const freq1 = Math.sin(elapsedTime * 18.0 + i * 1.15);
        const freq2 = Math.cos(elapsedTime * 27.0 - i * 0.85);
        const amp = 0.6 + 1.85 * Math.abs(freq1 * 0.65 + freq2 * 0.35);
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, amp, safeDt * 18.0);
        bar.material.emissiveIntensity = 2.0 + amp * 0.9;
      }

      const orbPulse = 1.0 + 0.28 * Math.sin(elapsedTime * 16.0);
      antennaOrb.scale.setScalar(orbPulse);
      antennaOrbMat.emissiveIntensity = 2.6 + Math.sin(elapsedTime * 16.0) * 1.2;
      coreEmissiveMat.emissiveIntensity = 2.4 + Math.sin(elapsedTime * 12.0) * 0.8;
    } else {
      // Calm idle breathing bar baseline
      for (let i = 0; i < waveformBars.length; i++) {
        const bar = waveformBars[i];
        const idleAmp = 0.28 + 0.14 * Math.sin(elapsedTime * 3.5 + i * 0.7);
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, idleAmp, safeDt * 10.0);
        bar.material.emissiveIntensity = 1.2;
      }

      const idleOrb = 1.0 + 0.06 * Math.sin(elapsedTime * 3.2);
      antennaOrb.scale.setScalar(idleOrb);
      antennaOrbMat.emissiveIntensity = 1.6 + 0.3 * Math.sin(elapsedTime * 3.2);
      coreEmissiveMat.emissiveIntensity = 1.9 + 0.3 * Math.sin(elapsedTime * 3.0);
    }
  }

  function dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('zen-gadget-change', onGadgetEvent);
    }
    if (unsubStorage) {
      unsubStorage();
    }
  }

  return {
    group,
    hoverRig,
    headGroup,
    torsoGroup,
    setEquippedGadget,
    getEquippedGadget: () => equippedGadget,
    setMood,
    getMood: () => currentMood,
    update,
    dispose
  };
}
