import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
import { AudioEngine } from '../../core/audio.js';
import { NarrationEngine } from '../../core/narration.js';
import { AIService, testTreeAttribute } from '../../services/ai.js';
import curriculumData from '../../data/curriculum.json';

const BINARY_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

const ANIMAL_META = {
  bat: { emoji: '🦇', color: '#818cf8' },
  eagle: { emoji: '🦅', color: '#fbbf24' },
  cat: { emoji: '🐱', color: '#f97316' },
  turtle: { emoji: '🐢', color: '#10b981' },
  dog: { emoji: '🐶', color: '#fb923c' },
  sparrow: { emoji: '🐦', color: '#38bdf8' },
  ostrich: { emoji: '🦩', color: '#f472b6' },
  lizard: { emoji: '🦎', color: '#34d399' }
};

const ATTR_CYCLE = ['canFly', 'hasFur', 'legs', 'hasShell'];
const ATTR_LABELS = {
  canFly: 'האם יכול לעוף? 🪽',
  hasFur: 'האם יש פרווה? 🐾',
  legs: 'האם יש 4 רגליים? 🦵',
  hasShell: 'האם יש שריון מגן? 🛡️'
};

function getStoreSnapshot(store) {
  if (!store) return {};
  if (typeof store.getState === 'function') return store.getState();
  if (typeof store.getSnapshot === 'function') return store.getSnapshot();
  return store.state || store;
}

function setCylBetweenPoints(mesh, pA, pB, radius = 0.04) {
  const dir = new THREE.Vector3().subVectors(pB, pA);
  const len = dir.length();
  if (len < 0.0001) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
  mesh.scale.set(radius, len, radius);
  const up = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(up, dir.normalize());
}

/**
 * Builds the 3D Laboratory Room Shell, 3 Diegetic Fixture Stations,
 * the Living 3D Zen Companion, and all 8 Centerpiece 3D Interactive Machines (`lab1`..`lab8`).
 */
export function createStation3DDirector({ store } = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Station3DDirectorRoot';

  const pbr = getLabPanelPBRTextures();
  const fruitPbr = getFruitPBRTextures();
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.35);
  const planeHitPoint = new THREE.Vector3();

  // Shared PBR Materials
  const darkAlloyMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.85,
    roughness: 0.26,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35)
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    metalness: 0.78,
    roughness: 0.22,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.25, 0.25)
  });

  const goldEmissiveMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#f59e0b',
    emissiveIntensity: 1.5,
    metalness: 0.82,
    roughness: 0.18
  });

  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0ea5e9',
    emissiveIntensity: 1.7,
    metalness: 0.5,
    roughness: 0.15
  });

  const emeraldEmissiveMat = new THREE.MeshStandardMaterial({
    color: '#34d399',
    emissive: '#10b981',
    emissiveIntensity: 1.6,
    metalness: 0.5,
    roughness: 0.18
  });

  const roseEmissiveMat = new THREE.MeshStandardMaterial({
    color: '#fb7185',
    emissive: '#e11d48',
    emissiveIntensity: 1.6,
    metalness: 0.5,
    roughness: 0.2
  });

  // ===========================================================================
  // A. MODULAR 3D SCI-FI LABORATORY ROOM SHELL & DIEGETIC FIXTURES
  // ===========================================================================
  const roomGroup = new THREE.Group();
  roomGroup.name = 'SciFiLabRoomShell';
  rootGroup.add(roomGroup);

  // 1. Circuit Floor
  const floorMat = createCircuitFloorMaterial({
    bgColor: '#040914',
    gridColor: '#1e293b',
    pulseColor: '#0ea5e9',
    gridScale: 1.15
  });
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(68, 68), floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.5;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // 2. Centerpiece Octagonal Beveled Workbench Dais
  const daisBaseGeo = new THREE.CylinderGeometry(5.6, 6.2, 0.48, 8);
  const daisBase = new THREE.Mesh(daisBaseGeo, darkAlloyMat);
  daisBase.position.y = -0.24;
  daisBase.receiveShadow = true;
  daisBase.castShadow = true;
  roomGroup.add(daisBase);

  const daisRimGeo = new THREE.TorusGeometry(5.75, 0.065, 16, 64);
  const daisRim = new THREE.Mesh(daisRimGeo, cyanEmissiveMat);
  daisRim.rotation.x = Math.PI / 2;
  daisRim.position.y = 0.01;
  roomGroup.add(daisRim);

  // 3. Curved Sci-Fi Back Wall with Glowing Vertical Light Ribs
  const backWallGeo = new THREE.CylinderGeometry(13.5, 13.5, 8.5, 32, 1, true, Math.PI * 0.68, Math.PI * 0.64);
  const backWallMat = new THREE.MeshStandardMaterial({
    color: '#09101f',
    metalness: 0.8,
    roughness: 0.34,
    normalMap: pbr.normalMap,
    side: THREE.DoubleSide
  });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, 3.6, 0);
  roomGroup.add(backWall);

  const ribGeo = new RoundedBoxGeometry(0.18, 7.6, 0.32, 3, 0.04);
  for (let i = -4; i <= 4; i++) {
    const angle = Math.PI + i * 0.21;
    const rx = Math.sin(angle) * 13.2;
    const rz = Math.cos(angle) * 13.2;
    const rib = new THREE.Mesh(ribGeo, i % 2 === 0 ? cyanEmissiveMat : titaniumMat);
    rib.position.set(rx, 3.4, rz);
    rib.lookAt(0, 3.4, 0);
    roomGroup.add(rib);
  }

  // 4. Ambient Floating Data Motes
  const moteCount = 90;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = (Math.random() - 0.5) * 24;
    motePositions[i * 3 + 1] = 0.4 + Math.random() * 7.5;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: '#38bdf8',
    size: 0.12,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dataMotes = new THREE.Points(moteGeo, moteMat);
  roomGroup.add(dataMotes);

  // 5. Three Clickable Diegetic 3D Room Fixtures
  const diegeticFixtures = [];

  function markDiegeticHierarchy(obj, actionKey) {
    obj.userData.diegeticAction = actionKey;
    obj.traverse((child) => {
      child.userData.diegeticAction = actionKey;
    });
  }

  // Fixture 1: In-World 3D Holographic Projector Screen (Back-Left)
  const holoProjectorGroup = new THREE.Group();
  holoProjectorGroup.position.set(-5.05, 0, -3.55);
  holoProjectorGroup.rotation.y = 0.42;

  const projPedestal = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.9, 1.1, 4, 0.1), darkAlloyMat);
  projPedestal.position.y = 0.05;
  projPedestal.castShadow = true;
  holoProjectorGroup.add(projPedestal);

  const projScreenMat = createHologramMaterial({ color: '#38bdf8', opacity: 0.72, scanlineScale: 38.0 });
  const projScreen = new THREE.Mesh(new RoundedBoxGeometry(3.2, 1.9, 0.08, 3, 0.03), projScreenMat);
  projScreen.position.set(0, 1.85, 0);
  holoProjectorGroup.add(projScreen);

  const projFrame = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.58, 32),
    goldEmissiveMat
  );
  projFrame.position.set(0, 1.85, 0.06);
  holoProjectorGroup.add(projFrame);

  const projLabel = createHebrewLabelSprite('📽️ מקרן הולוגרמה: סרטון, פודקאסט וסיור', {
    subtext: 'לחצו לפתיחת המסך התלת-ממדי',
    accentColor: '#38bdf8',
    scale: [2.85, 0.82]
  });
  projLabel.position.set(0, 3.2, 0);
  holoProjectorGroup.add(projLabel);

  markDiegeticHierarchy(holoProjectorGroup, 'holo_media');
  roomGroup.add(holoProjectorGroup);
  diegeticFixtures.push(holoProjectorGroup);

  // Fixture 2: 3D Warm-Up Gadget & Hologram Codex Pedestal (Back-Right)
  const codexPedestalGroup = new THREE.Group();
  codexPedestalGroup.position.set(5.05, 0, -3.55);
  codexPedestalGroup.rotation.y = -0.42;

  const codexBase = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.45, 1.0, 8), darkAlloyMat);
  codexBase.position.y = 0.08;
  codexBase.castShadow = true;
  codexPedestalGroup.add(codexBase);

  const codexCardsGroup = new THREE.Group();
  codexCardsGroup.position.y = 1.75;
  const codexCardMat = createHologramMaterial({ color: '#fbbf24', opacity: 0.78, scanlineScale: 42.0 });
  for (let c = 0; c < 3; c++) {
    const card = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.98, 0.06, 3, 0.02), codexCardMat);
    const angle = (c / 3) * Math.PI * 2;
    card.position.set(Math.cos(angle) * 0.75, (c - 1) * 0.12, Math.sin(angle) * 0.75);
    card.lookAt(0, 1.75, 0);
    codexCardsGroup.add(card);
  }
  codexPedestalGroup.add(codexCardsGroup);

  const codexLabel = createHebrewLabelSprite('🔬 גאדג׳ט חימום וקודקס מושגים', {
    subtext: 'נסו בעצמכם • כרטיסי קודקס הולוגרפיים',
    accentColor: '#fbbf24',
    scale: [2.85, 0.82]
  });
  codexLabel.position.set(0, 3.1, 0);
  codexPedestalGroup.add(codexLabel);

  markDiegeticHierarchy(codexPedestalGroup, 'warmup_codex');
  roomGroup.add(codexPedestalGroup);
  diegeticFixtures.push(codexPedestalGroup);

  // Fixture 3: 3D Laser Energy Lock Reactor (Mid-Left)
  const quizReactorGroup = new THREE.Group();
  quizReactorGroup.position.set(-4.35, 0, 0.85);
  quizReactorGroup.rotation.y = 0.62;

  const reactorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.75, 12), darkAlloyMat);
  reactorBase.position.y = 0.0;
  quizReactorGroup.add(reactorBase);

  const reactorCoreMat = createForcefieldMaterial({
    color: '#34d399',
    secondaryColor: '#38bdf8',
    opacity: 0.65
  });
  const reactorCore = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), reactorCoreMat);
  reactorCore.position.y = 1.55;
  quizReactorGroup.add(reactorCore);

  const reactorRings = [];
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72 + r * 0.16, 0.04, 16, 48),
      r === 0 ? goldEmissiveMat : r === 1 ? cyanEmissiveMat : emeraldEmissiveMat
    );
    ring.position.y = 1.55;
    quizReactorGroup.add(ring);
    reactorRings.push(ring);
  }

  const quizLabel = createHebrewLabelSprite('⚡ מנעול לייזר: חידון הבנה', {
    subtext: 'פצחו 3 מנעולי אנרגיה עם זֶן',
    accentColor: '#34d399',
    scale: [2.25, 0.68]
  });
  quizLabel.position.set(0.35, 2.75, 0);
  quizReactorGroup.add(quizLabel);

  markDiegeticHierarchy(quizReactorGroup, 'laser_quiz');
  roomGroup.add(quizReactorGroup);
  diegeticFixtures.push(quizReactorGroup);

  // 6. Living 3D Zen Companion beside the Workbench (Mid-Right)
  const companionZen = createZen3DRobot();
  companionZen.group.position.set(4.35, 0.35, 0.85);
  companionZen.group.rotation.y = -0.55;
  companionZen.group.scale.setScalar(1.0);
  companionZen.group.traverse((c) => {
    c.userData.isCompanionZen = true;
  });

  const zenSpeechSprite = createHebrewLabelSprite('זֶן מוכן למחקר! 🤖', {
    subtext: 'לחצו על זֶן להקראת משימה או עזרה',
    accentColor: '#fbbf24',
    scale: [2.25, 0.68]
  });
  zenSpeechSprite.position.set(-0.35, 2.85, 0);
  companionZen.group.add(zenSpeechSprite);
  roomGroup.add(companionZen.group);

  // Load `/models/lab_props.glb` asynchronously for high-detail Blender props
  const glbPropsCache = {
    apple: null,
    watermelon: null,
    holoBase: null,
    mechSwitch: null,
    logicArch: null
  };
  if (typeof window !== 'undefined' && window.location) {
    try {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        '/models/lab_props.glb',
        (gltf) => {
          if (!gltf || !gltf.scene) return;
          gltf.scene.traverse((child) => {
            if (child.name === 'Prop_Apple') glbPropsCache.apple = child.clone(true);
            if (child.name === 'Prop_Watermelon') glbPropsCache.watermelon = child.clone(true);
            if (child.name === 'Prop_HoloBase') glbPropsCache.holoBase = child.clone(true);
            if (child.name === 'Prop_MechanicalSwitch') glbPropsCache.mechSwitch = child.clone(true);
            if (child.name === 'Prop_LogicGateArch') glbPropsCache.logicArch = child.clone(true);
          });
        },
        undefined,
        () => {
          // Procedural meshes are already active if GLB is unavailable
        }
      );
    } catch {
      // Ignore loader error in headless environments
    }
  }

  // ===========================================================================
  // B. THE 8 CENTERPIECE 3D INTERACTIVE MACHINES (`lab1`..`lab8`)
  // ===========================================================================
  const stationsContainer = new THREE.Group();
  stationsContainer.name = 'Stations3DContainer';
  rootGroup.add(stationsContainer);

  let activeLabId = getStoreSnapshot(store).activeLabId || 'lab1';
  let lastTotalStars = getStoreSnapshot(store).totalStars || 0;
  let celebrateUntil = 0;
  let activeDragState = null;

  // ---------------------------------------------------------------------------
  // STATION 1: 3D 8×8 Hydraulic Voxel Hologram Table & Laser Byte-Decoder
  // ---------------------------------------------------------------------------
  function buildStation1() {
    const group = new THREE.Group();
    group.name = 'Station1_BinaryVoxels';

    const frame = new THREE.Mesh(new RoundedBoxGeometry(6.8, 0.36, 6.8, 4, 0.08), darkAlloyMat);
    frame.position.y = 0.12;
    frame.receiveShadow = true;
    group.add(frame);

    const voxels = [];
    const voxelGeo = new RoundedBoxGeometry(0.66, 0.56, 0.66, 4, 0.08);
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.1, 16);
    const ghostGeo = new THREE.BoxGeometry(0.64, 0.52, 0.64);
    const ghostEdgesGeo = new THREE.EdgesGeometry(ghostGeo);

    const offMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.72,
      roughness: 0.32,
      normalMap: pbr.normalMap
    });
    const onMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 1.85,
      metalness: 0.45,
      roughness: 0.16
    });
    const ghostLineMat = new THREE.LineBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.75
    });
    const beamMat = createHologramMaterial({ color: '#38bdf8', opacity: 0.48, scanlineScale: 30.0 });

    const spacing = 0.76;
    const startOffset = -((8 - 1) * spacing) / 2;

    for (let idx = 0; idx < 64; idx++) {
      const row = Math.floor(idx / 8);
      const col = idx % 8;
      const x = startOffset + col * spacing;
      const z = startOffset + row * spacing;

      const cellGroup = new THREE.Group();
      cellGroup.position.set(x, 0.3, z);

      const pillar = new THREE.Mesh(voxelGeo, offMat.clone());
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      pillar.userData = { station: 'lab1', bitIndex: idx, row, col };
      cellGroup.add(pillar);

      const topCap = new THREE.Mesh(
        new RoundedBoxGeometry(0.48, 0.08, 0.48, 2, 0.02),
        cyanEmissiveMat.clone()
      );
      topCap.position.y = 0.28;
      topCap.visible = false;
      topCap.userData = { station: 'lab1', bitIndex: idx, row, col };
      pillar.add(topCap);

      const laserBeam = new THREE.Mesh(beamGeo, beamMat);
      laserBeam.position.y = 0.75;
      laserBeam.visible = false;
      pillar.add(laserBeam);

      // Blueprint Ghost Wireframe Cube (NO auto-fill spoiler!)
      const ghostWire = new THREE.LineSegments(ghostEdgesGeo, ghostLineMat);
      ghostWire.position.set(x, 0.72, z);
      ghostWire.visible = false;
      group.add(ghostWire);

      group.add(cellGroup);
      voxels.push({
        idx,
        row,
        col,
        x,
        z,
        cellGroup,
        pillar,
        topCap,
        laserBeam,
        ghostWire,
        currentY: 0,
        velocityY: 0,
        bitVal: 0
      });
    }

    // 3D Laser Byte-Decoder Rig floating at the back of the table
    const decoderGroup = new THREE.Group();
    decoderGroup.position.set(0, 2.35, -3.95);
    group.add(decoderGroup);

    const decoderHeader = createHebrewLabelSprite('בייט שורה 2: 00000000 = 0 (0x00)', {
      subtext: 'מפענח לייזר בינארי (128 עד 1) • רחפו או לחצו על שורה',
      accentColor: '#38bdf8',
      scale: [4.2, 0.92]
    });
    decoderHeader.position.set(0, 0.95, 0);
    decoderGroup.add(decoderHeader);

    const weightNodes = [];
    const laserConduits = [];
    const conduitMat = createLaserPulseMaterial({ color: '#fbbf24', pulseColor: '#ffffff', speed: 5.0 });

    for (let c = 0; c < 8; c++) {
      const wx = startOffset + c * spacing;
      const nodeMesh = new THREE.Mesh(
        new RoundedBoxGeometry(0.58, 0.42, 0.28, 3, 0.05),
        darkAlloyMat.clone()
      );
      nodeMesh.position.set(wx, 0, 0);
      decoderGroup.add(nodeMesh);

      const weightSprite = createHebrewLabelSprite(String(BINARY_WEIGHTS[c]), {
        subtext: 'כבוי (0)',
        accentColor: '#64748b',
        scale: [1.08, 0.56]
      });
      weightSprite.position.set(wx, 0.04, 0.25);
      decoderGroup.add(weightSprite);
      weightNodes.push({ nodeMesh, weightSprite, weight: BINARY_WEIGHTS[c], x: wx });

      const conduit = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), conduitMat);
      conduit.visible = false;
      group.add(conduit);
      laserConduits.push(conduit);
    }

    // Row highlight bar
    const rowHighlightBar = new THREE.Mesh(
      new RoundedBoxGeometry(6.3, 0.08, 0.74, 2, 0.02),
      createForcefieldMaterial({ color: '#38bdf8', secondaryColor: '#fbbf24', opacity: 0.45 })
    );
    rowHighlightBar.position.set(0, 0.32, startOffset + 1 * spacing);
    group.add(rowHighlightBar);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l1 = state.lab1;
        if (!l1) return;
        const grid = l1.grid || [];
        const bpGrid = l1.blueprintGrid;
        const activeRow = l1.hoveredRow !== null && l1.hoveredRow !== undefined ? l1.hoveredRow : (l1.selectedRow ?? 1);

        rowHighlightBar.position.z = THREE.MathUtils.lerp(
          rowHighlightBar.position.z,
          startOffset + activeRow * spacing,
          Math.min(1, dt * 14)
        );

        for (let i = 0; i < 64; i++) {
          const v = voxels[i];
          const isLit = grid[i] === 1;
          const isBpTarget = Boolean(bpGrid && bpGrid[i] === 1);
          const isHovered = l1.hoveredBit === i;

          const targetY = isLit ? 0.44 : 0.0;
          // Spring physics for hydraulic voxel pillar
          const force = (targetY - v.currentY) * 140 - v.velocityY * 16;
          v.velocityY += force * Math.min(dt, 0.033);
          v.currentY += v.velocityY * Math.min(dt, 0.033);
          v.pillar.position.y = v.currentY;

          if (v.bitVal !== (isLit ? 1 : 0)) {
            v.bitVal = isLit ? 1 : 0;
            v.pillar.material.color.set(isLit ? '#fbbf24' : '#1e293b');
            v.pillar.material.emissive.set(isLit ? '#f59e0b' : '#000000');
            v.pillar.material.emissiveIntensity = isLit ? 1.65 : 0.0;
            v.topCap.visible = isLit;
            v.laserBeam.visible = isLit;
          }

          if (isHovered) {
            v.pillar.scale.set(1.06, 1.08, 1.06);
          } else {
            v.pillar.scale.set(1, 1, 1);
          }

          v.ghostWire.visible = isBpTarget && !isLit;
          if (v.ghostWire.visible) {
            v.ghostWire.position.y = 0.68 + Math.sin(elapsedTime * 3.5 + i * 0.2) * 0.05;
          }
        }

        // Update 3D Laser Byte-Decoder for activeRow
        const rowData = l1.rowBytes?.[activeRow] || {
          rowIndex: activeRow,
          bits: [0, 0, 0, 0, 0, 0, 0, 0],
          bitStr: '00000000',
          val: 0,
          hex: '0x00'
        };
        const bpName =
          l1.blueprintMode === 'heart'
            ? 'שבלונת לב ❤️'
            : l1.blueprintMode === 'smiley'
            ? 'שבלונת סמיילי 😊'
            : 'ציור חופשי 🎨';
        updateHebrewLabelSprite(
          decoderHeader,
          `בייט שורה ${activeRow + 1}: ${rowData.bitStr} = ${rowData.val} (${rowData.hex})`,
          `${bpName} • נורות דולקות: ${l1.litCount}/64`,
          rowData.val > 0 ? '#fbbf24' : '#38bdf8'
        );

        for (let c = 0; c < 8; c++) {
          const bitOn = rowData.bits[c] === 1;
          const wn = weightNodes[c];
          updateHebrewLabelSprite(
            wn.weightSprite,
            String(wn.weight),
            bitOn ? `+${wn.weight} (1)` : '0',
            bitOn ? '#fbbf24' : '#64748b'
          );
          wn.nodeMesh.material.emissive.set(bitOn ? '#0ea5e9' : '#000000');
          wn.nodeMesh.material.emissiveIntensity = bitOn ? 1.2 : 0;

          const conduit = laserConduits[c];
          if (bitOn && state.showXRay) {
            const voxelCell = voxels[activeRow * 8 + c];
            const pStart = new THREE.Vector3(
              voxelCell.x,
              0.55 + voxelCell.currentY,
              voxelCell.z
            );
            const pEnd = new THREE.Vector3(wn.x, 2.35, -3.95);
            setCylBetweenPoints(conduit, pStart, pEnd, 0.032);
          } else {
            conduit.visible = false;
          }
        }
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab1');
        if (!hit) return false;
        const { bitIndex, row } = hit.object.userData;
        const curVal = state.lab1.grid[bitIndex] === 1 ? 1 : 0;
        const nextPaintVal = curVal === 1 ? 0 : 1;
        state.lab1.setSelectedRow?.(row);
        state.lab1.setBit?.(bitIndex, nextPaintVal);
        activeDragState = { station: 'lab1', paintVal: nextPaintVal };
        return true;
      },
      onPointerMove(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab1');
        if (hit) {
          const { bitIndex, row } = hit.object.userData;
          if (state.lab1.hoveredBit !== bitIndex) state.lab1.setHoveredBit?.(bitIndex);
          if (state.lab1.hoveredRow !== row) state.lab1.setHoveredRow?.(row);
          if (activeDragState?.station === 'lab1') {
            state.lab1.setBit?.(bitIndex, activeDragState.paintVal);
            state.lab1.setSelectedRow?.(row);
          }
          return true;
        }
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 2: 3D Obstacle Chamber (6×6), Key, Blast Gate & Algorithmic Zen
  // ---------------------------------------------------------------------------
  function buildStation2() {
    const group = new THREE.Group();
    group.name = 'Station2_RobotChamber';

    const board = curriculumData.labs.lab2.defaultBoard;
    const gridSize = 6;
    const spacing = 0.96;
    const startOffset = -((gridSize - 1) * spacing) / 2;
    const toWorld = (gx, gy) => ({
      x: startOffset + gx * spacing,
      z: startOffset + gy * spacing
    });

    const basePlate = new THREE.Mesh(new RoundedBoxGeometry(6.6, 0.34, 6.6, 4, 0.08), darkAlloyMat);
    basePlate.position.y = 0.12;
    basePlate.receiveShadow = true;
    group.add(basePlate);

    const tileGeo = new RoundedBoxGeometry(0.86, 0.12, 0.86, 3, 0.03);
    const tileMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.65,
      roughness: 0.35
    });

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const pos = toWorld(gx, gy);
        const tile = new THREE.Mesh(tileGeo, tileMat.clone());
        tile.position.set(pos.x, 0.3, pos.z);
        tile.receiveShadow = true;
        group.add(tile);
      }
    }

    // Beveled Metallic Hazard Walls
    const wallGeo = new RoundedBoxGeometry(0.84, 0.92, 0.84, 4, 0.08);
    const wallHazardMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      metalness: 0.8,
      roughness: 0.28,
      normalMap: pbr.normalMap
    });
    board.walls.forEach((w) => {
      const pos = toWorld(w.x, w.y);
      const wallMesh = new THREE.Mesh(wallGeo, wallHazardMat);
      wallMesh.position.set(pos.x, 0.78, pos.z);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      const hazardTrim = new THREE.Mesh(
        new RoundedBoxGeometry(0.88, 0.12, 0.88, 2, 0.02),
        goldEmissiveMat
      );
      hazardTrim.position.y = 0.36;
      wallMesh.add(hazardTrim);
      group.add(wallMesh);
    });

    // Rotating 3D Golden Key (`🔑`)
    const keyGroup = new THREE.Group();
    const keyPos = toWorld(board.key.x, board.key.y);
    keyGroup.position.set(keyPos.x, 0.95, keyPos.z);

    const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 16, 32), goldEmissiveMat);
    const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 12), goldEmissiveMat);
    keyShaft.position.y = -0.3;
    const keyTooth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.06), goldEmissiveMat);
    keyTooth.position.set(0.08, -0.42, 0);
    keyGroup.add(keyRing, keyShaft, keyTooth);

    const keyLabel = createHebrewLabelSprite('🔑 מפתח זהב', {
      subtext: `(${board.key.x}, ${board.key.y})`,
      accentColor: '#fbbf24',
      scale: [1.5, 0.5]
    });
    keyLabel.position.set(0, 0.65, 0);
    keyGroup.add(keyLabel);
    group.add(keyGroup);

    // Mechanical 3D Blast Gate with Red Laser Bars
    const gateGroup = new THREE.Group();
    const gatePos = toWorld(board.gate.x, board.gate.y);
    gateGroup.position.set(gatePos.x, 0.35, gatePos.z);

    const gatePillarL = new THREE.Mesh(new RoundedBoxGeometry(0.18, 1.35, 0.24, 3, 0.03), titaniumMat);
    gatePillarL.position.set(-0.36, 0.65, 0);
    const gatePillarR = gatePillarL.clone();
    gatePillarR.position.set(0.36, 0.65, 0);
    gateGroup.add(gatePillarL, gatePillarR);

    const laserBarsGroup = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.68, 12),
        roseEmissiveMat
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 0.35 + b * 0.32;
      laserBarsGroup.add(bar);
    }
    gateGroup.add(laserBarsGroup);

    const gateLabel = createHebrewLabelSprite('🔒 שער לייזר', {
      subtext: `(${board.gate.x}, ${board.gate.y})`,
      accentColor: '#fb7185',
      scale: [1.5, 0.5]
    });
    gateLabel.position.set(0, 1.65, 0);
    gateGroup.add(gateLabel);
    group.add(gateGroup);

    // Glowing Emerald Goal Pad
    const goalPos = toWorld(board.goal.x, board.goal.y);
    const goalGroup = new THREE.Group();
    goalGroup.position.set(goalPos.x, 0.36, goalPos.z);

    const goalRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 16, 36), emeraldEmissiveMat);
    goalRing.rotation.x = Math.PI / 2;
    goalGroup.add(goalRing);

    const goalStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldEmissiveMat);
    goalStar.position.y = 0.55;
    goalGroup.add(goalStar);

    const goalLabel = createHebrewLabelSprite('🏆 משבצת היעד', {
      subtext: `(${board.goal.x}, ${board.goal.y})`,
      accentColor: '#34d399',
      scale: [1.6, 0.52]
    });
    goalLabel.position.set(0, 1.25, 0);
    goalGroup.add(goalLabel);
    group.add(goalGroup);

    // Second 3D Zen Unit on the 6×6 Chamber Floor
    const mazeZen = createZen3DRobot();
    mazeZen.group.scale.setScalar(0.56);
    const startWorld = toWorld(board.start.x, board.start.y);
    mazeZen.group.position.set(startWorld.x, 0.36, startWorld.z);
    group.add(mazeZen.group);

    // 3D Diegetic Command Pedestal Buttons in front of the Chamber
    const cmdButtons = [
      { cmd: 'FORWARD', label: '⬆️ צעד קדימה', x: -2.5, color: '#38bdf8' },
      { cmd: 'TURN_LEFT', label: '↩️ שמאלה', x: -1.5, color: '#818cf8' },
      { cmd: 'TURN_RIGHT', label: '↪️ ימינה', x: -0.5, color: '#818cf8' },
      { cmd: 'PICK_KEY', label: '🔑 אסוף מפתח', x: 0.5, color: '#fbbf24' },
      { cmd: 'UNLOCK_GATE', label: '🔓 פתח שער', x: 1.5, color: '#34d399' },
      { cmd: 'RUN', label: '▶️ הפעל רובוט', x: 2.5, color: '#10b981' }
    ];
    cmdButtons.forEach((btn) => {
      const pad = new THREE.Mesh(
        new RoundedBoxGeometry(0.84, 0.22, 0.55, 3, 0.04),
        darkAlloyMat.clone()
      );
      pad.position.set(btn.x, 0.25, 3.85);
      pad.userData = { station: 'lab2', cmdAction: btn.cmd };
      const lbl = createHebrewLabelSprite(btn.label, {
        accentColor: btn.color,
        scale: [0.95, 0.36]
      });
      lbl.position.set(0, 0.42, 0);
      lbl.userData = { station: 'lab2', cmdAction: btn.cmd };
      pad.add(lbl);
      group.add(pad);
    });

    const dirToRotY = {
      south: 0,
      east: Math.PI / 2,
      north: Math.PI,
      west: -Math.PI / 2
    };

    return {
      group,
      update(dt, elapsedTime, state) {
        const l2 = state.lab2;
        if (!l2) return;

        const targetWorld = toWorld(l2.robotPos.x, l2.robotPos.y);
        mazeZen.group.position.x = THREE.MathUtils.lerp(mazeZen.group.position.x, targetWorld.x, Math.min(1, dt * 10));
        mazeZen.group.position.z = THREE.MathUtils.lerp(mazeZen.group.position.z, targetWorld.z, Math.min(1, dt * 10));

        const targetRot = dirToRotY[l2.robotPos.dir] ?? Math.PI / 2;
        mazeZen.group.rotation.y = THREE.MathUtils.lerp(mazeZen.group.rotation.y, targetRot, Math.min(1, dt * 10));

        const mood =
          l2.status === 'success'
            ? 'celebrating'
            : l2.status === 'collision' || l2.status === 'error'
            ? 'error'
            : l2.isRunning
            ? 'thinking'
            : 'happy';
        mazeZen.setMood(mood);
        mazeZen.setEquippedGadget(state.equippedGadget);
        mazeZen.update(dt, elapsedTime, { isSpeaking: false });

        // Key animation (orbits Zen once collected!)
        keyGroup.rotation.y = elapsedTime * 2.4;
        if (l2.hasKey) {
          keyGroup.position.set(
            mazeZen.group.position.x + Math.cos(elapsedTime * 3.5) * 0.48,
            1.65 + Math.sin(elapsedTime * 4.0) * 0.08,
            mazeZen.group.position.z + Math.sin(elapsedTime * 3.5) * 0.48
          );
          keyGroup.scale.setScalar(0.72);
        } else {
          keyGroup.position.set(keyPos.x, 0.92 + Math.sin(elapsedTime * 2.8) * 0.08, keyPos.z);
          keyGroup.scale.setScalar(1.0);
        }

        // Retract Blast Gate laser bars when unlocked
        const gateTargetY = l2.isGateUnlocked ? -0.95 : 0.0;
        laserBarsGroup.position.y = THREE.MathUtils.lerp(laserBarsGroup.position.y, gateTargetY, Math.min(1, dt * 8));
        laserBarsGroup.visible = laserBarsGroup.position.y > -0.85;
        updateHebrewLabelSprite(
          gateLabel,
          l2.isGateUnlocked ? '🔓 השער פתוח!' : '🔒 שער לייזר נעול',
          `(${board.gate.x}, ${board.gate.y})`,
          l2.isGateUnlocked ? '#34d399' : '#fb7185'
        );

        goalStar.rotation.y = elapsedTime * 2.0;
        goalStar.position.y = 0.55 + Math.sin(elapsedTime * 3.2) * 0.08;
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab2');
        if (!hit) return false;
        const cmd = hit.object.userData.cmdAction;
        if (cmd === 'RUN') {
          state.lab2.runAlgorithm?.();
        } else if (cmd) {
          state.lab2.addCommand?.(cmd);
        }
        return true;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 3: 3D Branching Mechanical Chute / Decision Tree Conveyor Sorter
  // ---------------------------------------------------------------------------
  function buildStation3() {
    const group = new THREE.Group();
    group.name = 'Station3_DecisionTreeSorter';

    const rootPos = new THREE.Vector3(0, 2.75, -2.5);
    const leftGatePos = new THREE.Vector3(2.3, 1.55, -0.1); // Yes (כן - Right in RTL view)
    const rightGatePos = new THREE.Vector3(-2.3, 1.55, -0.1); // No (לא - Left in RTL view)

    const leafPositions = {
      leafLL: new THREE.Vector3(3.45, 0.42, 2.35),
      leafLR: new THREE.Vector3(1.15, 0.42, 2.35),
      leafRL: new THREE.Vector3(-1.15, 0.42, 2.35),
      leafRR: new THREE.Vector3(-3.45, 0.42, 2.35)
    };

    const yesChuteMat = createLaserPulseMaterial({ color: '#10b981', pulseColor: '#a7f3d0', speed: 3.5 });
    const noChuteMat = createLaserPulseMaterial({ color: '#f43f5e', pulseColor: '#fecdd3', speed: 3.5 });

    function addChuteTube(p0, p1, mat) {
      const mid = new THREE.Vector3().lerpVectors(p0, p1, 0.5);
      mid.y += 0.25;
      const curve = new THREE.CatmullRomCurve3([p0, mid, p1]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.11, 12, false);
      const mesh = new THREE.Mesh(tubeGeo, mat);
      group.add(mesh);
      return curve;
    }

    const curves = {
      rootToYes: addChuteTube(rootPos, leftGatePos, yesChuteMat),
      rootToNo: addChuteTube(rootPos, rightGatePos, noChuteMat),
      yesToLL: addChuteTube(leftGatePos, leafPositions.leafLL, yesChuteMat),
      yesToLR: addChuteTube(leftGatePos, leafPositions.leafLR, noChuteMat),
      noToRL: addChuteTube(rightGatePos, leafPositions.leafRL, yesChuteMat),
      noToRR: addChuteTube(rightGatePos, leafPositions.leafRR, noChuteMat)
    };

    // 3 Clickable 3D Splitter Gate Nodes
    function createGateNode(pos, nodeKey, titlePrefix, color) {
      const g = new THREE.Group();
      g.position.copy(pos);

      const body = new THREE.Mesh(
        new RoundedBoxGeometry(1.55, 0.56, 0.78, 4, 0.08),
        darkAlloyMat.clone()
      );
      body.castShadow = true;
      body.userData = { station: 'lab3', gateNode: nodeKey };
      g.add(body);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.04, 12, 32),
        color === '#fbbf24' ? goldEmissiveMat : color === '#34d399' ? emeraldEmissiveMat : roseEmissiveMat
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);

      const label = createHebrewLabelSprite(titlePrefix, {
        subtext: 'לחצו להחלפת שאלת פיצול 🔄',
        accentColor: color,
        scale: [2.35, 0.72]
      });
      label.position.set(0, 0.68, 0);
      label.userData = { station: 'lab3', gateNode: nodeKey };
      g.add(label);

      group.add(g);
      return { group: g, body, label };
    }

    const rootGate = createGateNode(rootPos, 'rootAttr', 'צומת שורש', '#fbbf24');
    const leftGate = createGateNode(leftGatePos, 'leftAttr', 'ענף כן (ימין)', '#34d399');
    const rightGate = createGateNode(rightGatePos, 'rightAttr', 'ענף לא (שמאל)', '#fb7185');

    // 4 Glowing 3D Leaf Collection Pods
    const leafPods = {};
    Object.entries(leafPositions).forEach(([key, pos]) => {
      const podGroup = new THREE.Group();
      podGroup.position.copy(pos);

      const podBase = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.98, 0.36, 16), darkAlloyMat.clone());
      podBase.receiveShadow = true;
      podGroup.add(podBase);

      const podRim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 12, 32), cyanEmissiveMat.clone());
      podRim.rotation.x = Math.PI / 2;
      podRim.position.y = 0.18;
      podGroup.add(podRim);

      const podLabel = createHebrewLabelSprite('עלה', {
        subtext: 'ריק',
        accentColor: '#38bdf8',
        scale: [1.95, 0.68]
      });
      podLabel.position.set(0, 1.05, 0);
      podGroup.add(podLabel);

      group.add(podGroup);
      leafPods[key] = { podGroup, podRim, podLabel };
    });

    // Animal Capsule Launcher Pads + Active Sliding 3D Capsule
    const launcherPads = [];
    const baseAnimals = curriculumData.labs.lab3.dataset;
    baseAnimals.forEach((animal, idx) => {
      const meta = ANIMAL_META[animal.id] || { emoji: '🐾', color: '#38bdf8' };
      const lx = (idx - 1.5) * 1.45;
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.52, 0.25, 16),
        darkAlloyMat.clone()
      );
      pad.position.set(lx, 0.22, -4.1);
      pad.userData = { station: 'lab3', animalId: animal.id };

      const capsuleOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 20, 20),
        new THREE.MeshStandardMaterial({
          color: meta.color,
          emissive: meta.color,
          emissiveIntensity: 0.85,
          roughness: 0.18,
          metalness: 0.3
        })
      );
      capsuleOrb.position.y = 0.35;
      capsuleOrb.userData = { station: 'lab3', animalId: animal.id };
      pad.add(capsuleOrb);

      const lbl = createHebrewLabelSprite(`${meta.emoji} ${animal.name}`, {
        subtext: 'שגר במגלשה ▶',
        accentColor: meta.color,
        scale: [1.35, 0.48]
      });
      lbl.position.set(0, 0.85, 0);
      lbl.userData = { station: 'lab3', animalId: animal.id };
      pad.add(lbl);

      group.add(pad);
      launcherPads.push({ pad, capsuleOrb, animal });
    });

    const activeSlidingCapsule = new THREE.Group();
    const slidingSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 24, 24),
      goldEmissiveMat.clone()
    );
    const slidingLabel = createHebrewLabelSprite('🦇 עטלף', {
      accentColor: '#fbbf24',
      scale: [1.4, 0.5]
    });
    slidingLabel.position.y = 0.62;
    activeSlidingCapsule.add(slidingSphere, slidingLabel);
    activeSlidingCapsule.visible = false;
    group.add(activeSlidingCapsule);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l3 = state.lab3;
        if (!l3) return;

        updateHebrewLabelSprite(
          rootGate.label,
          `שורש: ${ATTR_LABELS[l3.rootAttr] || l3.rootAttr}`,
          `דיוק העץ: ${l3.evaluation?.accuracy ?? 0}% • לחצו להחלפה`,
          '#fbbf24'
        );
        updateHebrewLabelSprite(
          leftGate.label,
          `כן -> ${ATTR_LABELS[l3.leftAttr] || l3.leftAttr}`,
          'לחצו להחלפת שאלת המשך',
          '#34d399'
        );
        updateHebrewLabelSprite(
          rightGate.label,
          `לא -> ${ATTR_LABELS[l3.rightAttr] || l3.rightAttr}`,
          'לחצו להחלפת שאלת המשך',
          '#fb7185'
        );

        const leaves = l3.evaluation?.leafDetails || {};
        Object.entries(leafPods).forEach(([key, pod]) => {
          const detail = leaves[key];
          if (!detail) return;
          const names = (detail.items || [])
            .map((it) => `${ANIMAL_META[it.id]?.emoji || '🐾'}${it.name}`)
            .join(', ');
          const isPure = detail.isPure && detail.count > 0;
          const color = detail.count === 0 ? '#64748b' : isPure ? '#34d399' : '#fbbf24';
          pod.podRim.material.color.set(color);
          pod.podRim.material.emissive.set(color);
          updateHebrewLabelSprite(
            pod.podLabel,
            names || 'ריק (0)',
            `${detail.path} • ${isPure ? '100% טהור ✨' : detail.count === 0 ? 'אין חיות' : 'מעורב ⚠️'}`,
            color
          );
        });

        // Animate sliding animal capsule along the 3D tubes
        if (l3.slidingAnimal) {
          const { animal, progress, isRootYes, leafKey } = l3.slidingAnimal;
          activeSlidingCapsule.visible = true;
          const meta = ANIMAL_META[animal.id] || { emoji: '🐾', color: '#fbbf24' };
          updateHebrewLabelSprite(slidingLabel, `${meta.emoji} ${animal.name}`, '', meta.color);

          let pos;
          if (progress < 0.5) {
            const t = progress * 2;
            const c1 = isRootYes ? curves.rootToYes : curves.rootToNo;
            pos = c1.getPointAt(Math.min(1, Math.max(0, t)));
          } else {
            const t = (progress - 0.5) * 2;
            const c2 =
              leafKey === 'leafLL'
                ? curves.yesToLL
                : leafKey === 'leafLR'
                ? curves.yesToLR
                : leafKey === 'leafRL'
                ? curves.noToRL
                : curves.noToRR;
            pos = c2.getPointAt(Math.min(1, Math.max(0, t)));
          }
          activeSlidingCapsule.position.copy(pos);
          activeSlidingCapsule.position.y += 0.22;
        } else {
          activeSlidingCapsule.visible = false;
        }
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab3');
        if (!hit) return false;
        const { gateNode, animalId } = hit.object.userData;
        if (gateNode) {
          const cur = state.lab3[gateNode] || 'canFly';
          const nextAttr = ATTR_CYCLE[(ATTR_CYCLE.indexOf(cur) + 1) % ATTR_CYCLE.length];
          if (gateNode === 'rootAttr') state.lab3.setRootAttr?.(nextAttr);
          if (gateNode === 'leftAttr') state.lab3.setLeftAttr?.(nextAttr);
          if (gateNode === 'rightAttr') state.lab3.setRightAttr?.(nextAttr);
          return true;
        }
        if (animalId) {
          state.lab3.launchAnimalCapsule?.(animalId);
          return true;
        }
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 4: 3D Holographic Space Sector (8×8), A* vs BFS Waves & Spline Ship
  // ---------------------------------------------------------------------------
  function buildStation4() {
    const group = new THREE.Group();
    group.name = 'Station4_PathfinderSector';

    const spacing = 0.78;
    const startOffset = -((8 - 1) * spacing) / 2;
    const toWorld = (gx, gy) => ({
      x: startOffset + gx * spacing,
      z: startOffset + gy * spacing
    });

    const baseFrame = new THREE.Mesh(new RoundedBoxGeometry(6.9, 0.32, 6.9, 4, 0.08), darkAlloyMat);
    baseFrame.position.y = 0.12;
    baseFrame.receiveShadow = true;
    group.add(baseFrame);

    const cells = [];
    const tileGeo = new RoundedBoxGeometry(0.68, 0.18, 0.68, 3, 0.04);
    const asteroidGeo = new THREE.DodecahedronGeometry(0.34, 1);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.75,
      metalness: 0.25,
      normalMap: pbr.normalMap
    });

    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        const idx = gy * 8 + gx;
        const pos = toWorld(gx, gy);
        const tile = new THREE.Mesh(
          tileGeo,
          new THREE.MeshStandardMaterial({
            color: '#0f172a',
            metalness: 0.7,
            roughness: 0.28
          })
        );
        tile.position.set(pos.x, 0.3, pos.z);
        tile.receiveShadow = true;
        tile.userData = { station: 'lab4', gx, gy, idx };
        group.add(tile);

        const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
        asteroid.position.set(pos.x, 0.65, pos.z);
        asteroid.scale.set(1.1, 1.35, 1.0);
        asteroid.castShadow = true;
        asteroid.visible = false;
        asteroid.userData = { station: 'lab4', gx, gy, idx };
        group.add(asteroid);

        cells.push({ idx, gx, gy, x: pos.x, z: pos.z, tile, asteroid, currentHeight: 0.3 });
      }
    }

    // Start & Goal Beacons
    const startWorld = toWorld(0, 0);
    const goalWorld = toWorld(7, 7);

    const startBeacon = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 16), cyanEmissiveMat);
    startBeacon.position.set(startWorld.x, 0.72, startWorld.z);
    group.add(startBeacon);

    const goalBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldEmissiveMat);
    goalBeacon.position.set(goalWorld.x, 0.78, goalWorld.z);
    group.add(goalBeacon);

    // 3D Spacecraft flying along shortest path spline
    const shipGroup = new THREE.Group();
    const shipBody = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 12), cyanEmissiveMat);
    shipBody.rotation.x = Math.PI / 2;
    const shipWings = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.24), titaniumMat);
    shipGroup.add(shipBody, shipWings);
    shipGroup.position.set(startWorld.x, 0.85, startWorld.z);
    group.add(shipGroup);

    // Golden shortest-path spline tube
    let pathTubeMesh = null;
    let lastPathSignature = '';
    const pathTubeMat = createLaserPulseMaterial({ color: '#fbbf24', pulseColor: '#ffffff', speed: 5.5 });

    // Hover f = g + h vector tethers & label
    const gTether = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), cyanEmissiveMat);
    const hTether = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), goldEmissiveMat);
    gTether.visible = false;
    hTether.visible = false;
    group.add(gTether, hTether);

    const heuristicBanner = createHebrewLabelSprite('ווייז רובוטי: מצפן חכם (A*) מול מכ״ם (BFS)', {
      subtext: 'לחצו על משבצות להצבת אסטרואידים תלת-ממדיים ☄️',
      accentColor: '#38bdf8',
      scale: [4.2, 0.9]
    });
    heuristicBanner.position.set(0, 2.55, -3.65);
    group.add(heuristicBanner);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l4 = state.lab4;
        if (!l4) return;

        const visitedSlice = (l4.solution?.visitedOrder || []).slice(0, l4.currentStepIndex);
        const visitedSet = new Set(visitedSlice.map((p) => `${p.x},${p.y}`));
        const showFullPath =
          l4.currentStepIndex >= (l4.solution?.visitedOrder?.length || 999) &&
          (l4.solution?.path?.length || 0) > 0;
        const pathSet = new Set(
          showFullPath ? l4.solution.path.map((p) => `${p.x},${p.y}`) : []
        );

        for (let i = 0; i < 64; i++) {
          const c = cells[i];
          const isWall = l4.grid[i] === 1;
          const key = `${c.gx},${c.gy}`;
          const isPath = pathSet.has(key);
          const isVisited = visitedSet.has(key);

          c.asteroid.visible = isWall;
          if (isWall) {
            c.asteroid.rotation.y = elapsedTime * 0.4 + i;
          }

          if (isPath) {
            c.tile.material.color.set('#fbbf24');
            c.tile.material.emissive.set('#f59e0b');
            c.tile.material.emissiveIntensity = 1.6;
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.44, Math.min(1, dt * 12));
          } else if (isVisited) {
            const waveColor = l4.algorithm === 'astar' ? '#38bdf8' : '#818cf8';
            c.tile.material.color.set(waveColor);
            c.tile.material.emissive.set(waveColor);
            c.tile.material.emissiveIntensity = 0.95;
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.37, Math.min(1, dt * 12));
          } else {
            c.tile.material.color.set('#0f172a');
            c.tile.material.emissive.set('#000000');
            c.tile.material.emissiveIntensity = 0;
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.3, Math.min(1, dt * 12));
          }
        }

        // Rebuild 3D Spline Tube when path changes
        const pathSig = showFullPath
          ? l4.solution.path.map((p) => `${p.x},${p.y}`).join(';')
          : '';
        if (pathSig !== lastPathSignature) {
          lastPathSignature = pathSig;
          if (pathTubeMesh) {
            group.remove(pathTubeMesh);
            pathTubeMesh.geometry.dispose();
            pathTubeMesh = null;
          }
          if (showFullPath && l4.solution.path.length >= 2) {
            const pts = l4.solution.path.map((p) => {
              const wp = toWorld(p.x, p.y);
              return new THREE.Vector3(wp.x, 0.72, wp.z);
            });
            const curve = new THREE.CatmullRomCurve3(pts);
            const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.075, 12, false);
            pathTubeMesh = new THREE.Mesh(tubeGeo, pathTubeMat);
            pathTubeMesh.userData.curve = curve;
            group.add(pathTubeMesh);
          }
        }

        // Fly 3D Spacecraft along the golden spline path
        if (pathTubeMesh && pathTubeMesh.userData.curve) {
          const u = (elapsedTime * 0.32) % 1.0;
          const pt = pathTubeMesh.userData.curve.getPointAt(u);
          const lookPt = pathTubeMesh.userData.curve.getPointAt(Math.min(1.0, u + 0.04));
          shipGroup.position.copy(pt);
          shipGroup.position.y += 0.14;
          shipGroup.lookAt(lookPt.x, lookPt.y + 0.14, lookPt.z);
        } else {
          shipGroup.position.set(startWorld.x, 0.85 + Math.sin(elapsedTime * 3) * 0.06, startWorld.z);
        }

        goalBeacon.rotation.y = elapsedTime * 2.2;

        // Hover f = g + h vector tethers
        const hov = l4.hoveredCell;
        if (hov && state.showXRay) {
          const g = Math.abs(hov.x - l4.start.x) + Math.abs(hov.y - l4.start.y);
          const h = Math.abs(l4.goal.x - hov.x) + Math.abs(l4.goal.y - hov.y);
          const f = g + h;
          const hw = toWorld(hov.x, hov.y);
          const pHov = new THREE.Vector3(hw.x, 0.65, hw.z);
          setCylBetweenPoints(gTether, new THREE.Vector3(startWorld.x, 0.65, startWorld.z), pHov, 0.025);
          setCylBetweenPoints(hTether, pHov, new THREE.Vector3(goalWorld.x, 0.65, goalWorld.z), 0.025);
          updateHebrewLabelSprite(
            heuristicBanner,
            `משבצת (${hov.x},${hov.y}): ציון כולל f = ${f} (צעדים g=${g} + מצפן h=${h})`,
            `נסרקו: A*=${l4.lastAstarCount ?? '-'} משבצות | BFS=${l4.lastBfsCount ?? '-'} משבצות`,
            '#fbbf24'
          );
        } else {
          gTether.visible = false;
          hTether.visible = false;
          updateHebrewLabelSprite(
            heuristicBanner,
            l4.algorithm === 'astar' ? 'אלגוריתם פעיל: מצפן חכם A* (f = g + h)' : 'אלגוריתם פעיל: גלי מכ״ם BFS',
            `מכשולים: ${l4.wallCount} • נסרקו: A*=${l4.lastAstarCount ?? '-'} | BFS=${l4.lastBfsCount ?? '-'}`,
            l4.algorithm === 'astar' ? '#38bdf8' : '#818cf8'
          );
        }
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab4');
        if (!hit) return false;
        const { gx, gy, idx } = hit.object.userData;
        const nextVal = state.lab4.grid[idx] === 1 ? 0 : 1;
        state.lab4.toggleWall?.(gx, gy, nextVal);
        activeDragState = { station: 'lab4', paintVal: nextVal };
        return true;
      },
      onPointerMove(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab4');
        if (hit) {
          const { gx, gy } = hit.object.userData;
          state.lab4.setHoveredCell?.({ x: gx, y: gy });
          if (activeDragState?.station === 'lab4') {
            state.lab4.toggleWall?.(gx, gy, activeDragState.paintVal);
          }
          return true;
        }
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 5: Full-Screen 3D Holographic k-NN Fruit Arena (Sweetness × Size)
  // ---------------------------------------------------------------------------
  function buildStation5() {
    const group = new THREE.Group();
    group.name = 'Station5_KNNFruitArena';

    const arenaWidth = 6.8;
    const toArenaPos = (px, py) => ({
      x: ((px - 50) / 100) * arenaWidth,
      z: ((50 - py) / 100) * arenaWidth
    });
    const fromArenaPos = (wx, wz) => ({
      x: Math.max(5, Math.min(95, Math.round((wx / arenaWidth) * 100 + 50))),
      y: Math.max(5, Math.min(95, Math.round(50 - (wz / arenaWidth) * 100)))
    });

    // Beveled Arena Floor
    const arenaFloor = new THREE.Mesh(
      new RoundedBoxGeometry(7.4, 0.3, 7.4, 4, 0.08),
      darkAlloyMat.clone()
    );
    arenaFloor.position.y = 0.15;
    arenaFloor.receiveShadow = true;
    arenaFloor.userData = { station: 'lab5', isArenaFloor: true };
    group.add(arenaFloor);

    // Axis Rails & 3D Hebrew Axis Labels
    const xAxisLabel = createHebrewLabelSprite('ציר X: רמת מתיקות 🍬 (0 עד 100)', {
      accentColor: '#38bdf8',
      scale: [2.5, 0.58]
    });
    xAxisLabel.position.set(0, 0.68, 2.95);
    group.add(xAxisLabel);

    const yAxisLabel = createHebrewLabelSprite('ציר Y: גודל הפרי 📏', {
      accentColor: '#34d399',
      scale: [2.2, 0.62]
    });
    yAxisLabel.position.set(-4.15, 0.65, 0);
    group.add(yAxisLabel);

    // Fruit PBR Materials
    const appleMat = new THREE.MeshStandardMaterial({
      map: fruitPbr.appleTexture,
      normalMap: fruitPbr.appleNormalMap,
      roughness: 0.16,
      metalness: 0.08
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.3,
      metalness: 0.05
    });
    const melonMat = new THREE.MeshStandardMaterial({
      map: fruitPbr.melonTexture,
      normalMap: fruitPbr.melonNormalMap,
      roughness: 0.2,
      metalness: 0.06
    });

    function createFruitMesh(label) {
      const fGroup = new THREE.Group();
      if (label === 'A') {
        // Glossy Red Apple (`🍎`)
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 20), appleMat);
        body.scale.set(1.0, 0.9, 1.0);
        body.position.y = 0.26;
        body.castShadow = true;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.03, 0.14, 8),
          new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })
        );
        stem.position.y = 0.52;
        const leaf = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.04, 0.09, 2, 0.01), leafMat);
        leaf.position.set(0.08, 0.53, 0);
        leaf.rotation.z = 0.35;
        fGroup.add(body, stem, leaf);
      } else {
        // Striped Green Watermelon (`🍉`)
        const melon = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 20), melonMat);
        melon.scale.set(1.24, 0.94, 0.96);
        melon.position.y = 0.31;
        melon.castShadow = true;
        fGroup.add(melon);
      }
      return fGroup;
    }

    const fruitInstances = new Map();
    const fruitsContainer = new THREE.Group();
    group.add(fruitsContainer);

    // Draggable Glowing 3D Mystery Orb (`?`)
    const mysteryGroup = new THREE.Group();
    const mysteryOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 28, 28),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#fbbf24',
        emissiveIntensity: 1.8,
        roughness: 0.12,
        metalness: 0.35
      })
    );
    mysteryOrb.position.y = 0.42;
    mysteryOrb.castShadow = true;
    mysteryOrb.userData = { station: 'lab5', isMysteryOrb: true };
    mysteryGroup.add(mysteryOrb);

    const mysteryLabel = createHebrewLabelSprite('❓ פרי המסתורין (?)', {
      subtext: 'גררו אותי על הלוח!',
      accentColor: '#fbbf24',
      scale: [2.25, 0.7]
    });
    mysteryLabel.position.set(0, 1.22, 0);
    mysteryLabel.userData = { station: 'lab5', isMysteryOrb: true };
    mysteryGroup.add(mysteryLabel);
    group.add(mysteryGroup);

    // Volumetric 3D Forcefield Sphere (`createForcefieldMaterial`) expanding to k-th neighbor radius
    const forcefieldMat = createForcefieldMaterial({
      color: '#38bdf8',
      secondaryColor: '#fbbf24',
      opacity: 0.32
    });
    const radiusSphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 36, 28), forcefieldMat);
    radiusSphere.position.y = 0.35;
    group.add(radiusSphere);

    const radiusRing = new THREE.Mesh(
      new THREE.RingGeometry(0.96, 1.0, 64),
      goldEmissiveMat
    );
    radiusRing.rotation.x = -Math.PI / 2;
    radiusRing.position.y = 0.32;
    group.add(radiusRing);

    // Up to 5 Glowing 3D Distance Laser Tethers + 3D Distance Badges (`d=...`)
    const tetherPool = [];
    const laserMat = createLaserPulseMaterial({ color: '#fbbf24', pulseColor: '#ffffff', speed: 4.5 });
    for (let i = 0; i < 5; i++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), laserMat);
      beam.visible = false;
      const distSprite = createHebrewLabelSprite('d=12.4', {
        accentColor: '#38bdf8',
        scale: [1.05, 0.38]
      });
      distSprite.visible = false;
      group.add(beam, distSprite);
      tetherPool.push({ beam, distSprite });
    }

    // Two 3D Holographic Voting Pillars at Back of Arena (`🍎 תפוח` vs `🍉 אבטיח`)
    const voteApplePillar = new THREE.Mesh(
      new RoundedBoxGeometry(0.9, 1.0, 0.9, 4, 0.08),
      roseEmissiveMat.clone()
    );
    voteApplePillar.position.set(-2.2, 0.8, -4.15);
    const voteAppleLabel = createHebrewLabelSprite('🍎 תפוחים: 0 קולות', {
      subtext: 'מחלקה A',
      accentColor: '#fb7185',
      scale: [2.3, 0.72]
    });
    voteAppleLabel.position.set(-2.2, 2.35, -4.15);
    group.add(voteApplePillar, voteAppleLabel);

    const voteMelonPillar = new THREE.Mesh(
      new RoundedBoxGeometry(0.9, 1.0, 0.9, 4, 0.08),
      emeraldEmissiveMat.clone()
    );
    voteMelonPillar.position.set(2.2, 0.8, -4.15);
    const voteMelonLabel = createHebrewLabelSprite('🍉 אבטיחים: 0 קולות', {
      subtext: 'מחלקה B',
      accentColor: '#34d399',
      scale: [2.3, 0.72]
    });
    voteMelonLabel.position.set(2.2, 2.35, -4.15);
    group.add(voteMelonPillar, voteMelonLabel);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l5 = state.lab5;
        if (!l5) return;

        // Sync 3D Fruits with `l5.points`
        const activeIds = new Set();
        (l5.points || []).forEach((pt) => {
          activeIds.add(pt.id);
          let entry = fruitInstances.get(pt.id);
          if (!entry) {
            const mesh = createFruitMesh(pt.label);
            const wp = toArenaPos(pt.x, pt.y);
            mesh.position.set(wp.x, 0.3, wp.z);
            mesh.scale.setScalar(0.1);
            fruitsContainer.add(mesh);
            entry = { mesh, scale: 0.1, pt };
            fruitInstances.set(pt.id, entry);
          }
          const wp = toArenaPos(pt.x, pt.y);
          entry.mesh.position.x = wp.x;
          entry.mesh.position.z = wp.z;
          entry.scale = THREE.MathUtils.lerp(entry.scale, 1.0, Math.min(1, dt * 12));
          entry.mesh.scale.setScalar(entry.scale);
          entry.mesh.rotation.y = elapsedTime * 0.6 + (pt.id % 10);
        });

        Array.from(fruitInstances.keys()).forEach((id) => {
          if (!activeIds.has(id)) {
            const entry = fruitInstances.get(id);
            fruitsContainer.remove(entry.mesh);
            fruitInstances.delete(id);
          }
        });

        // Position Mystery Orb
        const qPos = toArenaPos(l5.testPoint.x, l5.testPoint.y);
        mysteryGroup.position.set(qPos.x, 0.3, qPos.z);
        mysteryOrb.position.y = 0.44 + Math.sin(elapsedTime * 3.8) * 0.06;

        const cls = l5.classification || {
          predictedLabel: 'A',
          confidence: 100,
          nearestNeighbors: [],
          votes: {}
        };
        const isApplePred = cls.predictedLabel === 'A';
        mysteryOrb.material.emissive.set(isApplePred ? '#ef4444' : '#10b981');
        updateHebrewLabelSprite(
          mysteryLabel,
          isApplePred ? `❓ זיהוי: תפוח אדום 🍎 (${cls.confidence}%)` : `❓ זיהוי: אבטיח ירוק 🍉 (${cls.confidence}%)`,
          `k=${l5.kValue} שכנים קרובים • מתיקות ${l5.testPoint.x}, גודל ${l5.testPoint.y}`,
          isApplePred ? '#fb7185' : '#34d399'
        );

        // Expand Volumetric 3D Forcefield Sphere to exact k-th neighbor distance
        const neighbors = cls.nearestNeighbors || [];
        const kthNeighbor = neighbors[neighbors.length - 1];
        let worldRadius = 0.85;
        if (kthNeighbor) {
          const nw = toArenaPos(kthNeighbor.x, kthNeighbor.y);
          worldRadius = Math.max(0.45, Math.hypot(nw.x - qPos.x, nw.z - qPos.z));
        }
        radiusSphere.position.set(qPos.x, 0.35, qPos.z);
        const lerpedR = THREE.MathUtils.lerp(radiusSphere.scale.x, worldRadius, Math.min(1, dt * 12));
        radiusSphere.scale.set(lerpedR, Math.min(2.2, lerpedR * 0.68), lerpedR);

        radiusRing.position.set(qPos.x, 0.32, qPos.z);
        radiusRing.scale.set(lerpedR, lerpedR, 1);

        // Update Laser Tethers & 3D Distance Badges
        const pQuery = new THREE.Vector3(qPos.x, 0.65, qPos.z);
        for (let i = 0; i < 5; i++) {
          const tether = tetherPool[i];
          const nb = neighbors[i];
          if (nb) {
            const nw = toArenaPos(nb.x, nb.y);
            const pNb = new THREE.Vector3(nw.x, 0.58, nw.z);
            setCylBetweenPoints(tether.beam, pQuery, pNb, 0.035);
            if (state.showXRay) {
              tether.distSprite.visible = true;
              tether.distSprite.position.lerpVectors(pQuery, pNb, 0.55);
              tether.distSprite.position.y += 0.26 + (i % 3) * 0.25;
              updateHebrewLabelSprite(
                tether.distSprite,
                `d=${Math.round(nb.distance)}`,
                nb.label === 'A' ? '🍎 תפוח' : '🍉 אבטיח',
                nb.label === 'A' ? '#fb7185' : '#34d399'
              );
            } else {
              tether.distSprite.visible = false;
            }
          } else {
            tether.beam.visible = false;
            tether.distSprite.visible = false;
          }
        }

        // Update 3D Voting Pillars
        const votesA = cls.votes?.A || 0;
        const votesB = cls.votes?.B || 0;
        const targetScaleA = 0.4 + votesA * 0.38;
        const targetScaleB = 0.4 + votesB * 0.38;
        voteApplePillar.scale.y = THREE.MathUtils.lerp(voteApplePillar.scale.y, targetScaleA, Math.min(1, dt * 10));
        voteApplePillar.position.y = 0.3 + voteApplePillar.scale.y * 0.5;
        voteMelonPillar.scale.y = THREE.MathUtils.lerp(voteMelonPillar.scale.y, targetScaleB, Math.min(1, dt * 10));
        voteMelonPillar.position.y = 0.3 + voteMelonPillar.scale.y * 0.5;

        updateHebrewLabelSprite(
          voteAppleLabel,
          `🍎 תפוחים: ${votesA} קולות`,
          `סה״כ בלוח: ${(l5.points || []).filter((p) => p.label === 'A').length}`,
          '#fb7185'
        );
        updateHebrewLabelSprite(
          voteMelonLabel,
          `🍉 אבטיחים: ${votesB} קולות`,
          `סה״כ בלוח: ${(l5.points || []).filter((p) => p.label === 'B').length}`,
          '#34d399'
        );
      },
      onPointerDown(intersects, state, ray) {
        const orbHit = intersects.find((h) => h.object?.userData?.isMysteryOrb);
        if (orbHit) {
          activeDragState = { station: 'lab5', mode: 'dragMystery' };
          return true;
        }
        const floorHit = intersects.find((h) => h.object?.userData?.isArenaFloor);
        if (floorHit) {
          const pt = floorHit.point;
          const qPos = toArenaPos(state.lab5.testPoint.x, state.lab5.testPoint.y);
          if (Math.hypot(pt.x - qPos.x, pt.z - qPos.z) < 0.72) {
            activeDragState = { station: 'lab5', mode: 'dragMystery' };
            return true;
          }
          const coords = fromArenaPos(pt.x, pt.z);
          state.lab5.addPoint?.(coords.x, coords.y, state.lab5.selectedClass);
          return true;
        }
        return false;
      },
      onPointerMove(intersects, state, ray) {
        if (activeDragState?.station === 'lab5' && activeDragState.mode === 'dragMystery') {
          if (ray.ray.intersectPlane(groundPlane, planeHitPoint)) {
            const coords = fromArenaPos(planeHitPoint.x, planeHitPoint.z);
            state.lab5.moveTestPoint?.(coords.x, coords.y);
            return true;
          }
        }
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 6: 3D Scanning Laser Rig & 8×8 Feature Map Extruder (CNN)
  // ---------------------------------------------------------------------------
  function buildStation6() {
    const group = new THREE.Group();
    group.name = 'Station6_VisionScanner';

    const spacing = 0.54;
    const startOffset = -((8 - 1) * spacing) / 2;
    const leftCenterX = -2.55;
    const rightCenterX = 2.55;

    const leftBase = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.28, 4.6, 4, 0.06), darkAlloyMat);
    leftBase.position.set(leftCenterX, 0.14, 0);
    const rightBase = leftBase.clone();
    rightBase.position.set(rightCenterX, 0.14, 0);
    group.add(leftBase, rightBase);

    const inputTiles = [];
    const outputPillars = [];
    const tileGeo = new RoundedBoxGeometry(0.46, 0.24, 0.46, 3, 0.04);
    const pillarGeo = new RoundedBoxGeometry(0.46, 1.0, 0.46, 3, 0.04);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = y * 8 + x;
        const lx = leftCenterX + startOffset + x * spacing;
        const rx = rightCenterX + startOffset + x * spacing;
        const wz = startOffset + y * spacing;

        const inTile = new THREE.Mesh(tileGeo, darkAlloyMat.clone());
        inTile.position.set(lx, 0.32, wz);
        inTile.userData = { station: 'lab6', side: 'input', x, y, idx };
        group.add(inTile);
        inputTiles.push({ idx, x, y, lx, wz, mesh: inTile });

        const outPillar = new THREE.Mesh(pillarGeo, emeraldEmissiveMat.clone());
        outPillar.position.set(rx, 0.35, wz);
        outPillar.userData = { station: 'lab6', side: 'output', x, y, idx };
        group.add(outPillar);
        outputPillars.push({ idx, x, y, rx, wz, mesh: outPillar });
      }
    }

    // 3×3 Overhead Laser Scanner Frame on the Input Grid
    const kernelFrame = new THREE.Mesh(
      new RoundedBoxGeometry(spacing * 3.05, 0.14, spacing * 3.05, 3, 0.03),
      goldEmissiveMat
    );
    kernelFrame.position.set(leftCenterX, 0.62, 0);
    group.add(kernelFrame);

    // 9 Volumetric Laser Rays from 3×3 Kernel Window to Inspected Output Pillar
    const convRays = [];
    const rayMat = createLaserPulseMaterial({ color: '#34d399', pulseColor: '#fef08a', speed: 5.0 });
    for (let k = 0; k < 9; k++) {
      const rayMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), rayMat);
      group.add(rayMesh);
      convRays.push(rayMesh);
    }

    const scannerBanner = createHebrewLabelSprite('ראייה ממוחשבת: סורק פילטר 3×3 ומפת קצוות', {
      subtext: 'לחצו על משבצת לנעילת עדשת הלייזר ובדיקת 9 השכנים',
      accentColor: '#34d399',
      scale: [4.3, 0.9]
    });
    scannerBanner.position.set(0, 2.55, -2.9);
    group.add(scannerBanner);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l6 = state.lab6;
        if (!l6) return;

        const inGrid = l6.inputGrid || [];
        const outGrid = l6.convolutionResult?.outputGrid || [];
        const insp = l6.inspectedCell || { x: 3, y: 3 };

        for (let i = 0; i < 64; i++) {
          const it = inputTiles[i];
          const isOn = inGrid[i] === 1;
          it.mesh.material.color.set(isOn ? '#f8fafc' : '#1e293b');
          it.mesh.material.emissive.set(isOn ? '#38bdf8' : '#000000');
          it.mesh.material.emissiveIntensity = isOn ? 0.85 : 0;
          it.mesh.position.y = isOn ? 0.42 : 0.28;

          const op = outputPillars[i];
          const val = outGrid[i] || 0;
          const targetH = 0.16 + val * 1.15;
          op.mesh.scale.y = THREE.MathUtils.lerp(op.mesh.scale.y, targetH, Math.min(1, dt * 12));
          op.mesh.position.y = 0.25 + op.mesh.scale.y * 0.5;
          op.mesh.material.color.set(val > 0.15 ? '#34d399' : '#0f172a');
          op.mesh.material.emissive.set(val > 0.15 ? '#10b981' : '#000000');
          op.mesh.material.emissiveIntensity = val * 1.9;
        }

        // Move 3×3 Kernel Frame to `inspectedCell`
        const targetKx = leftCenterX + startOffset + insp.x * spacing;
        const targetKz = startOffset + insp.y * spacing;
        kernelFrame.position.x = THREE.MathUtils.lerp(kernelFrame.position.x, targetKx, Math.min(1, dt * 14));
        kernelFrame.position.z = THREE.MathUtils.lerp(kernelFrame.position.z, targetKz, Math.min(1, dt * 14));
        kernelFrame.position.y = 0.65 + Math.sin(elapsedTime * 4.0) * 0.04;

        // Connect 9 laser rays from 3×3 neighborhood to inspected output pillar
        const outTarget = outputPillars[insp.y * 8 + insp.x];
        const pApex = new THREE.Vector3(
          outTarget.rx,
          0.35 + outTarget.mesh.scale.y,
          outTarget.wz
        );

        let rayIdx = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const rayMesh = convRays[rayIdx++];
            const nx = Math.max(0, Math.min(7, insp.x + kx));
            const ny = Math.max(0, Math.min(7, insp.y + ky));
            const inCell = inputTiles[ny * 8 + nx];
            if (state.showXRay) {
              setCylBetweenPoints(
                rayMesh,
                new THREE.Vector3(inCell.lx, 0.55, inCell.wz),
                pApex,
                0.018
              );
            } else {
              rayMesh.visible = false;
            }
          }
        }

        const detail = l6.inspectedDetail;
        updateHebrewLabelSprite(
          scannerBanner,
          `פילטר: ${l6.currentKernel?.name || l6.activeKernelKey} • משבצת נבדקת (${insp.x},${insp.y})`,
          detail
            ? `סכום מכפלות 9 שכנים: Σ = ${Math.round(detail.sum * 100) / 100} ➔ עוצמת פלט: ${detail.clamped}`
            : 'לחצו על משבצת לבדיקת 9 השכנים בעדשת ה-3×3',
          '#34d399'
        );
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab6');
        if (!hit) return false;
        const { side, x, y, idx } = hit.object.userData;
        state.lab6.inspectCell?.(x, y);
        if (side === 'input') {
          state.lab6.togglePixel?.(idx);
        }
        return true;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 7: 3D Smart Neuron Fusion Core, Plasma Pipes & Truth Plane Arena
  // ---------------------------------------------------------------------------
  function buildStation7() {
    const group = new THREE.Group();
    group.name = 'Station7_NeuronPerceptron';

    // Left: Input Generators x1, x2 -> Plasma Pipes -> Central Fusion Core
    const pIn1 = new THREE.Vector3(-3.3, 1.35, -1.35);
    const pIn2 = new THREE.Vector3(-3.3, 1.35, 1.35);
    const pCore = new THREE.Vector3(-0.65, 1.45, 0);

    const gen1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.85, 16), cyanEmissiveMat.clone());
    gen1.position.copy(pIn1);
    const gen1Label = createHebrewLabelSprite('קלט x₁', {
      subtext: 'משקל w₁ = 0.5',
      accentColor: '#38bdf8',
      scale: [1.65, 0.55]
    });
    gen1Label.position.set(pIn1.x, 2.2, pIn1.z);

    const gen2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.85, 16), cyanEmissiveMat.clone());
    gen2.position.copy(pIn2);
    const gen2Label = createHebrewLabelSprite('קלט x₂', {
      subtext: 'משקל w₂ = 0.5',
      accentColor: '#38bdf8',
      scale: [1.65, 0.55]
    });
    gen2Label.position.set(pIn2.x, 2.2, pIn2.z);
    group.add(gen1, gen1Label, gen2, gen2Label);

    const pipeMat1 = createLaserPulseMaterial({ color: '#38bdf8', pulseColor: '#ffffff', speed: 4.5 });
    const pipeMat2 = createLaserPulseMaterial({ color: '#38bdf8', pulseColor: '#ffffff', speed: 4.5 });
    const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 16), pipeMat1);
    const pipe2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 16), pipeMat2);
    group.add(pipe1, pipe2);

    const coreMat = createForcefieldMaterial({
      color: '#a855f7',
      secondaryColor: '#fbbf24',
      opacity: 0.72
    });
    const fusionCore = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), coreMat);
    fusionCore.position.copy(pCore);
    group.add(fusionCore);

    const coreLabel = createHebrewLabelSprite('ליבת הנוירון (Σ)', {
      subtext: 'סף שכנוע b = 0.0',
      accentColor: '#fbbf24',
      scale: [2.5, 0.75]
    });
    coreLabel.position.set(pCore.x, 2.65, pCore.z);
    group.add(coreLabel);

    // Right: 3D 4-Pedestal Truth Arena `(0,0), (0,1), (1,0), (1,1)`
    const arenaCenterX = 2.25;
    const truthCoords = [
      { x1: 0, x2: 0, wx: arenaCenterX - 1.05, wz: 1.05 },
      { x1: 0, x2: 1, wx: arenaCenterX - 1.05, wz: -1.05 },
      { x1: 1, x2: 0, wx: arenaCenterX + 1.05, wz: 1.05 },
      { x1: 1, x2: 1, wx: arenaCenterX + 1.05, wz: -1.05 }
    ];

    const truthPedestals = truthCoords.map((tc) => {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.55, 16), darkAlloyMat.clone());
      ped.position.set(tc.wx, 0.28, tc.wz);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), emeraldEmissiveMat.clone());
      orb.position.set(tc.wx, 0.82, tc.wz);
      const lbl = createHebrewLabelSprite(`(${tc.x1},${tc.x2})`, {
        subtext: 'פלט: 0',
        accentColor: '#38bdf8',
        scale: [1.3, 0.48]
      });
      lbl.position.set(tc.wx, 1.42, tc.wz);
      const arc = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 8),
        createLaserPulseMaterial({ color: '#fbbf24', pulseColor: '#ffffff', speed: 6.5 })
      );
      group.add(ped, orb, lbl, arc);
      return { ...tc, ped, orb, lbl, arc };
    });

    // Tilting 3D Laser Decision Boundary Plane (`w1*x1 + w2*x2 + b = 0`)
    const decisionPlane = new THREE.Mesh(
      new RoundedBoxGeometry(3.4, 1.25, 0.06, 2, 0.02),
      createForcefieldMaterial({ color: '#38bdf8', secondaryColor: '#fbbf24', opacity: 0.48 })
    );
    decisionPlane.position.set(arenaCenterX, 0.78, 0);
    group.add(decisionPlane);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l7 = state.lab7;
        if (!l7) return;

        // Scale plasma pipe diameters with |w1| and |w2|
        const r1 = Math.max(0.035, Math.min(0.24, Math.abs(l7.w1) * 0.095));
        const r2 = Math.max(0.035, Math.min(0.24, Math.abs(l7.w2) * 0.095));
        setCylBetweenPoints(pipe1, pIn1, pCore, r1);
        setCylBetweenPoints(pipe2, pIn2, pCore, r2);
        pipeMat1.uniforms.uColor.value.set(l7.w1 >= 0 ? '#38bdf8' : '#f43f5e');
        pipeMat2.uniforms.uColor.value.set(l7.w2 >= 0 ? '#38bdf8' : '#f43f5e');

        updateHebrewLabelSprite(gen1Label, 'קלט x₁', `משקל w₁ = ${l7.w1}`, l7.w1 >= 0 ? '#38bdf8' : '#fb7185');
        updateHebrewLabelSprite(gen2Label, 'קלט x₂', `משקל w₂ = ${l7.w2}`, l7.w2 >= 0 ? '#38bdf8' : '#fb7185');
        updateHebrewLabelSprite(
          coreLabel,
          `שער ${l7.selectedGate} • דיוק: ${l7.currentAccuracy}%`,
          `w₁=${l7.w1}, w₂=${l7.w2}, סף b=${l7.bias}`,
          l7.currentAccuracy === 100 ? '#34d399' : '#fbbf24'
        );

        fusionCore.scale.setScalar(1.0 + Math.sin(elapsedTime * 4.0) * 0.06);

        // Update 4 Truth Pedestals & Electrical Arcs
        const results = l7.evaluation?.results || [];
        truthPedestals.forEach((tp, idx) => {
          const r = results[idx];
          if (!r) return;
          const targetVal =
            l7.selectedGate === 'AND'
              ? r.targetAnd
              : l7.selectedGate === 'OR'
              ? r.targetOr
              : r.targetXor;
          const isFired = l7.activation === 'step' ? r.output === 1 : r.output >= 0.5;
          const isCorrect = (isFired ? 1 : 0) === targetVal;

          tp.orb.material.color.set(isFired ? '#34d399' : '#334155');
          tp.orb.material.emissive.set(isFired ? '#10b981' : '#000000');
          tp.orb.material.emissiveIntensity = isFired ? 1.8 : 0;
          tp.orb.position.y = isFired ? 0.94 + Math.sin(elapsedTime * 5 + idx) * 0.05 : 0.72;

          updateHebrewLabelSprite(
            tp.lbl,
            `(${tp.x1},${tp.x2}) ➔ ${isFired ? 'דולק (1)' : 'כבוי (0)'}`,
            `z=${r.z} • ${isCorrect ? 'מדויק ✓' : 'שגוי ✗'}`,
            isCorrect ? '#34d399' : '#fb7185'
          );

          if (isFired) {
            setCylBetweenPoints(tp.arc, pCore, new THREE.Vector3(tp.wx, 0.9, tp.wz), 0.025);
          } else {
            tp.arc.visible = false;
          }
        });

        // Tilt & position 3D Decision Boundary Plane according to w1, w2, bias
        const angle = Math.atan2(l7.w1 || 0.01, l7.w2 || 0.01);
        decisionPlane.rotation.y = THREE.MathUtils.lerp(decisionPlane.rotation.y, angle, Math.min(1, dt * 10));
        const shift = Math.max(-1.2, Math.min(1.2, -l7.bias * 0.55));
        decisionPlane.position.x = arenaCenterX + Math.cos(angle) * shift * 0.5;
        decisionPlane.position.z = Math.sin(angle) * shift * 0.5;
      },
      onPointerDown() {
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 8: 3D Token Reactor Core, Probability Pillars & 3D Story Train
  // ---------------------------------------------------------------------------
  function buildStation8() {
    const group = new THREE.Group();
    group.name = 'Station8_LLMTokenReactor';

    const reactorPos = new THREE.Vector3(0, 1.55, -1.65);

    // Central Cryo-to-Plasma Temperature Reactor Core
    const reactorGroup = new THREE.Group();
    reactorGroup.position.copy(reactorPos);

    const coreSphereMat = createForcefieldMaterial({
      color: '#38bdf8',
      secondaryColor: '#f97316',
      opacity: 0.78
    });
    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32), coreSphereMat);
    coreSphere.userData = { station: 'lab8', isReactorCore: true };
    reactorGroup.add(coreSphere);

    const thermalRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 48), cyanEmissiveMat.clone());
    const thermalRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.04, 16, 48), goldEmissiveMat.clone());
    reactorGroup.add(thermalRing1, thermalRing2);

    const reactorLabel = createHebrewLabelSprite('ליבת טמפרטורה: T = 0.7 🌡️', {
      subtext: 'לחצו על הליבה להגרלת מילה או על קוביית מילה!',
      accentColor: '#fbbf24',
      scale: [3.2, 0.82]
    });
    reactorLabel.position.set(0, 1.75, 0);
    reactorLabel.userData = { station: 'lab8', isReactorCore: true };
    reactorGroup.add(reactorLabel);
    group.add(reactorGroup);

    // 5 Hovering 3D Hebrew Word Cubes atop 3D Probability Pillars
    const wordSlots = [];
    for (let i = 0; i < 5; i++) {
      const slotX = (2 - i) * 1.52; // RTL ordering: highest index on left, first on right
      const slotZ = -0.05;

      const pillar = new THREE.Mesh(
        new RoundedBoxGeometry(0.72, 1.0, 0.72, 3, 0.05),
        darkAlloyMat.clone()
      );
      pillar.position.set(slotX, 0.4, slotZ);
      pillar.userData = { station: 'lab8', slotIndex: i };

      const wordCube = new THREE.Mesh(
        new RoundedBoxGeometry(0.68, 0.68, 0.68, 4, 0.08),
        cyanEmissiveMat.clone()
      );
      wordCube.position.set(slotX, 1.4, slotZ);
      wordCube.castShadow = true;
      wordCube.userData = { station: 'lab8', slotIndex: i };

      const wordSprite = createHebrewLabelSprite('מילה', {
        subtext: '0%',
        accentColor: '#38bdf8',
        scale: [1.45, 0.62]
      });
      wordSprite.position.set(slotX, 2.22, slotZ);
      wordSprite.userData = { station: 'lab8', slotIndex: i };

      const tractorBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 10),
        createLaserPulseMaterial({ color: '#fbbf24', pulseColor: '#ffffff', speed: 6.0 })
      );
      tractorBeam.visible = false;

      group.add(pillar, wordCube, wordSprite, tractorBeam);
      wordSlots.push({ i, slotX, slotZ, pillar, wordCube, wordSprite, tractorBeam, token: '' });
    }

    // Physical 3D Story Train on a Glowing Track in the Foreground (`z = 2.35`)
    const trackRail = new THREE.Mesh(
      new RoundedBoxGeometry(7.2, 0.12, 0.65, 3, 0.03),
      darkAlloyMat
    );
    trackRail.position.set(0, 0.22, 2.35);
    group.add(trackRail);

    const storyBanner = createHebrewLabelSprite('רכבת הסיפור התלת-ממדית 🚂', {
      subtext: 'בחרו מילים כדי לבנות סיפור של 4 מילים ברצף',
      accentColor: '#34d399',
      scale: [4.8, 0.92]
    });
    storyBanner.position.set(0, 1.55, 2.35);
    group.add(storyBanner);

    const trainWagons = [];
    for (let w = 0; w < 6; w++) {
      const wx = 2.6 - w * 1.05; // RTL train right-to-left
      const wagon = new THREE.Mesh(
        new RoundedBoxGeometry(0.88, 0.46, 0.56, 3, 0.05),
        goldEmissiveMat.clone()
      );
      wagon.position.set(wx, 0.54, 2.35);
      wagon.visible = false;
      const wagonLbl = createHebrewLabelSprite('', {
        accentColor: '#fbbf24',
        scale: [1.05, 0.42]
      });
      wagonLbl.position.set(0, 0.48, 0);
      wagon.add(wagonLbl);
      group.add(wagon);
      trainWagons.push({ wagon, wagonLbl });
    }

    return {
      group,
      update(dt, elapsedTime, state) {
        const l8 = state.lab8;
        if (!l8) return;

        const temp = l8.temperature ?? 0.7;
        const tNorm = Math.min(1, temp / 1.5);
        const coreColor = new THREE.Color('#22d3ee').lerp(new THREE.Color('#f97316'), tNorm);
        coreSphereMat.uniforms.uColor.value.copy(coreColor);
        thermalRing1.material.color.copy(coreColor);
        thermalRing1.material.emissive.copy(coreColor);

        const spinSpeed = 0.8 + temp * 3.2;
        thermalRing1.rotation.x = elapsedTime * spinSpeed;
        thermalRing1.rotation.y = elapsedTime * spinSpeed * 0.7;
        thermalRing2.rotation.y = -elapsedTime * spinSpeed * 0.9;
        thermalRing2.rotation.z = elapsedTime * spinSpeed * 0.5;

        const tempModeText =
          temp <= 0.05
            ? '❄️ מדויק וצפוי (Greedy 100%)'
            : temp >= 0.8
            ? '🔥 פרץ דמיון ויצירתיות גבוהה!'
            : '⚖️ מאוזן';
        updateHebrewLabelSprite(
          reactorLabel,
          `ליבת טמפרטורה: T = ${temp.toFixed(1)} • ${tempModeText}`,
          'לחצו על הליבה להגרלת מילה או לחצו על קוביית מילה!',
          temp >= 0.8 ? '#f97316' : '#38bdf8'
        );

        const dist = l8.tokenDistribution || [];
        wordSlots.forEach((slot, idx) => {
          const item = dist[idx];
          if (!item) {
            slot.pillar.visible = false;
            slot.wordCube.visible = false;
            slot.wordSprite.visible = false;
            slot.tractorBeam.visible = false;
            return;
          }
          slot.pillar.visible = true;
          slot.wordCube.visible = true;
          slot.wordSprite.visible = true;
          slot.token = item.token;

          const probH = Math.max(0.22, (item.probability / 100) * 1.45);
          slot.pillar.scale.y = THREE.MathUtils.lerp(slot.pillar.scale.y, probH, Math.min(1, dt * 10));
          slot.pillar.position.y = 0.2 + slot.pillar.scale.y * 0.5;

          slot.wordCube.position.y =
            0.2 + slot.pillar.scale.y + 0.45 + Math.sin(elapsedTime * 3.0 + idx) * 0.06;
          slot.wordCube.rotation.y = elapsedTime * 0.8 + idx * 0.5;

          const isTop = item.probability >= 45;
          slot.wordCube.material.color.set(isTop ? '#fbbf24' : '#38bdf8');
          slot.wordCube.material.emissive.set(isTop ? '#f59e0b' : '#0ea5e9');

          slot.wordSprite.position.y = slot.wordCube.position.y + 0.66;
          updateHebrewLabelSprite(
            slot.wordSprite,
            `"${item.token}"`,
            `סיכוי: ${item.probability}%`,
            isTop ? '#fbbf24' : '#38bdf8'
          );

          if (isTop && state.showXRay) {
            setCylBetweenPoints(
              slot.tractorBeam,
              reactorPos,
              new THREE.Vector3(slot.slotX, slot.wordCube.position.y, slot.slotZ),
              0.025
            );
          } else {
            slot.tractorBeam.visible = false;
          }
        });

        // Update 3D Story Train Wagons
        const tokens = l8.generatedTokens || [];
        const fullSentence = [l8.activePrompt?.initialText || '', ...tokens].join(' ');
        updateHebrewLabelSprite(
          storyBanner,
          fullSentence,
          `מילים שנבחרו ברכבת הסיפור: ${tokens.length}/4`,
          tokens.length >= 4 ? '#34d399' : '#fbbf24'
        );

        trainWagons.forEach((tw, idx) => {
          const tok = tokens[idx];
          if (tok) {
            tw.wagon.visible = true;
            updateHebrewLabelSprite(tw.wagonLbl, tok, `#${idx + 1}`, '#fbbf24');
          } else {
            tw.wagon.visible = false;
          }
        });
      },
      onPointerDown(intersects, state) {
        const hit = intersects.find((h) => h.object?.userData?.station === 'lab8');
        if (!hit) return false;
        if (hit.object.userData.isReactorCore) {
          state.lab8.sampleNextToken?.();
          return true;
        }
        const slotIdx = hit.object.userData.slotIndex;
        if (slotIdx !== undefined) {
          const item = state.lab8.tokenDistribution?.[slotIdx];
          if (item?.token) {
            state.lab8.appendToken?.(item.token);
            return true;
          }
        }
        return false;
      }
    };
  }

  // Instantiate all 8 3D Stations
  const stationsMap = {
    lab1: buildStation1(),
    lab2: buildStation2(),
    lab3: buildStation3(),
    lab4: buildStation4(),
    lab5: buildStation5(),
    lab6: buildStation6(),
    lab7: buildStation7(),
    lab8: buildStation8()
  };

  Object.entries(stationsMap).forEach(([id, st]) => {
    st.group.visible = id === activeLabId;
    stationsContainer.add(st.group);
  });

  function setActiveStation(labId) {
    if (!stationsMap[labId]) return;
    activeLabId = labId;
    Object.entries(stationsMap).forEach(([id, st]) => {
      st.group.visible = id === activeLabId;
    });
  }

  function getIntersects(ndc, camera) {
    if (!ndc || !camera) return [];
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(rootGroup.children, true);
  }

  function handlePointerDown(ndc, camera) {
    const state = getStoreSnapshot(store);
    if (state.activeLabId && state.activeLabId !== activeLabId) {
      setActiveStation(state.activeLabId);
    }

    const intersects = getIntersects(ndc, camera);
    if (intersects.length === 0) return false;

    // 1. Check Diegetic 3D Room Fixtures (Hologram Projector, Warmup Codex, Laser Quiz)
    const diegeticHit = intersects.find((h) => h.object?.userData?.diegeticAction);
    if (diegeticHit) {
      const targetSubView = diegeticHit.object.userData.diegeticAction;
      AudioEngine.playCollect();
      state.setActiveSubView?.(targetSubView);
      return false;
    }

    // 2. Check Companion Zen Robot click
    const zenHit = intersects.find((h) => h.object?.userData?.isCompanionZen);
    if (zenHit) {
      AudioEngine.playZenChime();
      const ch = state.activeLabData?.challenges?.[0];
      if (ch?.instructions) {
        NarrationEngine.speak(ch.instructions, `/audio/hints/${activeLabId}_ch1.mp3`);
      }
      return false;
    }

    // 3. Dispatch to Active Centerpiece 3D Machine
    const currentStation = stationsMap[activeLabId];
    if (currentStation?.onPointerDown) {
      return Boolean(currentStation.onPointerDown(intersects, state, raycaster));
    }
    return false;
  }

  function handlePointerMove(ndc, camera) {
    const state = getStoreSnapshot(store);
    const intersects = getIntersects(ndc, camera);
    const currentStation = stationsMap[activeLabId];
    if (currentStation?.onPointerMove) {
      return Boolean(currentStation.onPointerMove(intersects, state, raycaster));
    }
    return false;
  }

  function handlePointerUp() {
    activeDragState = null;
    return false;
  }

  function update(dt, elapsedTime, camera) {
    const state = getStoreSnapshot(store);
    if (state.activeLabId && state.activeLabId !== activeLabId) {
      setActiveStation(state.activeLabId);
    }

    // Celebrate when player earns a new star!
    if ((state.totalStars || 0) > lastTotalStars) {
      lastTotalStars = state.totalStars || 0;
      celebrateUntil = elapsedTime + 2.8;
    }

    // Animate Diegetic Room Fixtures
    updateShaderTime(rootGroup, elapsedTime);
    codexCardsGroup.rotation.y = elapsedTime * 0.65;
    projFrame.rotation.z = elapsedTime * 0.9;
    reactorRings.forEach((ring, i) => {
      ring.rotation.x = elapsedTime * (0.8 + i * 0.35);
      ring.rotation.y = elapsedTime * (0.6 - i * 0.25);
    });

    // Subtle floating data motes
    dataMotes.rotation.y = elapsedTime * 0.04;

    // Update Living 3D Zen Companion
    const isSpeaking = Boolean(NarrationEngine.getState().isPlaying);
    companionZen.setEquippedGadget(state.equippedGadget);
    companionZen.setMood(elapsedTime < celebrateUntil ? 'celebrating' : isSpeaking ? 'thinking' : 'happy');
    companionZen.update(dt, elapsedTime, {
      isSpeaking,
      targetLookAt: camera ? camera.position : null
    });

    const labStarsCount = state.labStars?.[activeLabId] || 0;
    updateHebrewLabelSprite(
      zenSpeechSprite,
      isSpeaking ? '🔊 זֶן מסביר כעת...' : `${state.activeLabMeta?.shortLabel || 'מעבדה'} • ⭐ ${labStarsCount}/3`,
      'לחצו על זֶן להקראת המשימה בקול',
      isSpeaking ? '#38bdf8' : '#fbbf24'
    );

    // Update Active Station Machine
    const currentStation = stationsMap[activeLabId];
    if (currentStation?.update) {
      currentStation.update(dt, elapsedTime, state);
    }
  }

  function syncWithStore() {
    const state = getStoreSnapshot(store);
    if (state.activeLabId && state.activeLabId !== activeLabId && stationsMap[state.activeLabId]) {
      setActiveStation(state.activeLabId);
    }
    const currentStation = stationsMap[activeLabId];
    if (currentStation?.update) {
      currentStation.update(0.016, 0, state);
    }
  }

  function dispose() {
    activeDragState = null;
    companionZen?.dispose?.();
    rootGroup.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose?.();
      }
    });
  }

  return {
    group: rootGroup,
    setActiveStation,
    update,
    syncWithStore,
    dispose,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    isDragging: () => Boolean(activeDragState)
  };
}

export default createStation3DDirector;
