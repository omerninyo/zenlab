import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  getFruitPBRTextures,
  getBlueprintTileFaceTextures,
  createHebrewLabelSprite
} from '../engine/ProceduralTextures.js';
import { createZen3DRobot } from '../zen/Zen3DRobot.js';
import { AudioEngine } from '../../core/audio.js';
import { NarrationEngine } from '../../core/narration.js';
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
 * Nintendo 2.5D Toy-Board Station Director (`lab1`..`lab8`).
 *
 * Strict Performance & Spatial Clarity Design:
 * - ZERO background 3D clutter (removed floating 3D "מנעול לייזר", "גאדג׳ט חימום",
 *   "מקרן הולוגרמה", curved walls, data motes, and full-screen shader floor).
 * - Keeps ONLY the main puzzle toy-board and Zen the Robot on screen.
 * - ZERO dynamic CanvasTexture creation or redraws on hover, pointer move, or in `update()`.
 * - Designed for a locked 2.5D Front-On / Top-Down camera where rows, columns, and X/Y axes
 *   are 100% aligned.
 */
export function createStation3DDirector({ store } = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Station3DDirectorRoot';

  const fruitPbr = getFruitPBRTextures();
  const bpFaceTex = getBlueprintTileFaceTextures();
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
  const planeHitPoint = new THREE.Vector3();

  // Shared Tactile Nintendo Toy Materials
  const boardFrameMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.35,
    metalness: 0.1
  });

  const boardRimMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.28,
    metalness: 0.05
  });

  const goldToyMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#f59e0b',
    emissiveIntensity: 0.45,
    roughness: 0.22,
    metalness: 0.15
  });

  const cyanToyMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.1
  });

  const emeraldToyMat = new THREE.MeshStandardMaterial({
    color: '#10b981',
    emissive: '#059669',
    emissiveIntensity: 0.35,
    roughness: 0.24,
    metalness: 0.1
  });

  const roseToyMat = new THREE.MeshStandardMaterial({
    color: '#f43f5e',
    emissive: '#e11d48',
    emissiveIntensity: 0.35,
    roughness: 0.24,
    metalness: 0.1
  });

  // ===========================================================================
  // A. CLEAN STUDIO TOY-TABLE & LIVING 3D ZEN COMPANION (ZERO BACKGROUND CLUTTER)
  // ===========================================================================
  const roomGroup = new THREE.Group();
  roomGroup.name = 'CleanToyStudioStage';
  rootGroup.add(roomGroup);

  // Clean pastel shadow-catcher studio mat directly beneath the puzzle board
  const studioMatMesh = new THREE.Mesh(
    new RoundedBoxGeometry(11.6, 0.16, 8.6, 4, 0.12),
    new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.45,
      metalness: 0.02
    })
  );
  studioMatMesh.position.set(0, -0.08, 0.1);
  studioMatMesh.receiveShadow = true;
  roomGroup.add(studioMatMesh);

  // Living 3D Zen Companion positioned cleanly to the right of the toy board
  const companionZen = createZen3DRobot();
  companionZen.group.position.set(3.85, 0.35, 0.0);
  companionZen.group.rotation.y = -0.35;
  companionZen.group.scale.setScalar(0.88);
  companionZen.group.traverse((c) => {
    c.userData.isCompanionZen = true;
  });

  const zenBadgeSprite = createHebrewLabelSprite('זֶן הרובוט 🤖', {
    subtext: 'לחצו להקראת משימה',
    accentColor: '#fbbf24',
    scale: [1.65, 0.52]
  });
  zenBadgeSprite.position.set(-0.25, 2.35, 0);
  companionZen.group.add(zenBadgeSprite);
  roomGroup.add(companionZen.group);

  // ===========================================================================
  // B. THE 8 CENTERPIECE 2.5D NINTENDO TOY-BOARD MACHINES (`lab1`..`lab8`)
  // ===========================================================================
  const stationsContainer = new THREE.Group();
  stationsContainer.name = 'Stations3DContainer';
  rootGroup.add(stationsContainer);

  let activeLabId = getStoreSnapshot(store).activeLabId || 'lab1';
  let lastTotalStars = getStoreSnapshot(store).totalStars || 0;
  let celebrateUntil = 0;
  let activeDragState = null;

  // ---------------------------------------------------------------------------
  // STATION 1: 2.5D 8×8 Tactile Pixel Toy-Board with Column-Aligned Bit Weights
  // ---------------------------------------------------------------------------
  function buildStation1() {
    const group = new THREE.Group();
    group.name = 'Station1_BinaryVoxels';

    // Crisp White Outer Toy Rim + Slate Inner Well
    const outerRim = new THREE.Mesh(
      new RoundedBoxGeometry(6.95, 0.26, 6.95, 4, 0.12),
      boardRimMat
    );
    outerRim.position.set(0, 0.08, 0.25);
    outerRim.receiveShadow = true;
    group.add(outerRim);

    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(6.55, 0.3, 6.55, 4, 0.1),
      boardFrameMat
    );
    frame.position.set(0, 0.12, 0.25);
    frame.receiveShadow = true;
    group.add(frame);

    const voxels = [];
    const voxelGeo = new RoundedBoxGeometry(0.66, 0.36, 0.66, 3, 0.07);
    const faceDecalGeo = new THREE.PlaneGeometry(0.56, 0.56);

    const offMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.38,
      metalness: 0.08
    });
    const onMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.1
    });

    const heartDecalMat = new THREE.MeshBasicMaterial({
      map: bpFaceTex.heartFaceTex,
      transparent: true,
      depthWrite: false
    });
    const smileyDecalMat = new THREE.MeshBasicMaterial({
      map: bpFaceTex.smileyFaceTex,
      transparent: true,
      depthWrite: false
    });

    const spacing = 0.74;
    const startOffset = -((8 - 1) * spacing) / 2;
    const gridCenterZ = 0.25;

    for (let idx = 0; idx < 64; idx++) {
      const row = Math.floor(idx / 8);
      const col = idx % 8;
      const x = startOffset + col * spacing;
      const z = gridCenterZ + startOffset + row * spacing;

      const cellGroup = new THREE.Group();
      cellGroup.position.set(x, 0.26, z);

      const pillar = new THREE.Mesh(voxelGeo, offMat);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      pillar.userData = { station: 'lab1', bitIndex: idx, row, col };
      cellGroup.add(pillar);

      // Target guide rendered directly ON the top face of the tile (zero floating wireframes!)
      const faceGuide = new THREE.Mesh(faceDecalGeo, heartDecalMat);
      faceGuide.rotation.x = -Math.PI / 2;
      faceGuide.position.y = 0.185;
      faceGuide.visible = false;
      faceGuide.userData = { station: 'lab1', bitIndex: idx, row, col };
      pillar.add(faceGuide);

      group.add(cellGroup);
      voxels.push({
        idx,
        row,
        col,
        x,
        z,
        cellGroup,
        pillar,
        faceGuide,
        currentY: 0,
        bitVal: 0
      });
    }

    // 8 Bit-Weight Badges (`128, 64, 32, 16, 8, 4, 2, 1`) aligned in a neat horizontal row
    // directly above the 8 columns of the board!
    const weightBadges = [];
    const headerZ = gridCenterZ + startOffset - 0.68;
    for (let c = 0; c < 8; c++) {
      const wx = startOffset + c * spacing;
      const badgePedestal = new THREE.Mesh(
        new RoundedBoxGeometry(0.64, 0.18, 0.42, 3, 0.05),
        boardFrameMat.clone()
      );
      badgePedestal.position.set(wx, 0.26, headerZ);
      group.add(badgePedestal);

      // Static cached label texture — NEVER redrawn at runtime!
      const weightSprite = createHebrewLabelSprite(String(BINARY_WEIGHTS[c]), {
        accentColor: '#38bdf8',
        scale: [0.68, 0.34]
      });
      weightSprite.position.set(wx, 0.46, headerZ);
      group.add(weightSprite);

      weightBadges.push({ badgePedestal, weightSprite });
    }

    // Subtle Row Indicator Bar on the board surface
    const rowHighlightBar = new THREE.Mesh(
      new RoundedBoxGeometry(6.15, 0.06, 0.72, 2, 0.02),
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.28
      })
    );
    rowHighlightBar.position.set(0, 0.29, gridCenterZ + startOffset + 1 * spacing);
    group.add(rowHighlightBar);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l1 = state.lab1;
        if (!l1) return;
        const grid = l1.grid || [];
        const bpGrid = l1.blueprintGrid;
        const bpMode = l1.blueprintMode;
        const activeRow =
          l1.hoveredRow !== null && l1.hoveredRow !== undefined
            ? l1.hoveredRow
            : l1.selectedRow ?? 1;

        rowHighlightBar.position.z = THREE.MathUtils.lerp(
          rowHighlightBar.position.z,
          gridCenterZ + startOffset + activeRow * spacing,
          Math.min(1, dt * 16)
        );

        const activeDecalMat = bpMode === 'smiley' ? smileyDecalMat : heartDecalMat;

        for (let i = 0; i < 64; i++) {
          const v = voxels[i];
          const isLit = grid[i] === 1;
          const isBpTarget = Boolean(bpMode !== 'none' && bpGrid && bpGrid[i] === 1);
          const isHovered = l1.hoveredBit === i;

          const targetY = isLit ? 0.22 : 0.0;
          v.currentY = THREE.MathUtils.lerp(v.currentY, targetY, Math.min(1, dt * 18));
          v.pillar.position.y = v.currentY;

          if (v.bitVal !== (isLit ? 1 : 0)) {
            v.bitVal = isLit ? 1 : 0;
            v.pillar.material = isLit ? onMat : offMat;
          }

          if (isHovered) {
            v.pillar.scale.set(1.05, 1.05, 1.05);
          } else {
            v.pillar.scale.set(1, 1, 1);
          }

          // Render Heart / Smiley target directly ON the face of unlit target tiles
          v.faceGuide.visible = isBpTarget && !isLit;
          if (v.faceGuide.visible && v.faceGuide.material !== activeDecalMat) {
            v.faceGuide.material = activeDecalMat;
          }
        }

        // Highlight active column pedestals without touching any CanvasTexture!
        const rowData = l1.rowBytes?.[activeRow];
        const bits = rowData?.bits || [0, 0, 0, 0, 0, 0, 0, 0];
        for (let c = 0; c < 8; c++) {
          const bitOn = bits[c] === 1;
          const wb = weightBadges[c];
          wb.badgePedestal.material.color.set(bitOn ? '#fbbf24' : '#1e293b');
          wb.badgePedestal.position.y = bitOn ? 0.34 : 0.26;
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
  // STATION 2: 2.5D Obstacle Toy Chamber (6×6), Key, Gate & Algorithmic Zen
  // ---------------------------------------------------------------------------
  function buildStation2() {
    const group = new THREE.Group();
    group.name = 'Station2_RobotChamber';

    const board = curriculumData.labs.lab2.defaultBoard;
    const gridSize = 6;
    const spacing = 0.94;
    const startOffset = -((gridSize - 1) * spacing) / 2;
    const toWorld = (gx, gy) => ({
      x: startOffset + gx * spacing,
      z: startOffset + gy * spacing
    });

    const outerRim = new THREE.Mesh(new RoundedBoxGeometry(6.7, 0.26, 6.7, 4, 0.1), boardRimMat);
    outerRim.position.y = 0.08;
    group.add(outerRim);

    const basePlate = new THREE.Mesh(new RoundedBoxGeometry(6.3, 0.3, 6.3, 4, 0.08), boardFrameMat);
    basePlate.position.y = 0.12;
    basePlate.receiveShadow = true;
    group.add(basePlate);

    const tileGeo = new RoundedBoxGeometry(0.84, 0.1, 0.84, 3, 0.03);
    const tileMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.38,
      metalness: 0.08
    });

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const pos = toWorld(gx, gy);
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(pos.x, 0.28, pos.z);
        tile.receiveShadow = true;
        group.add(tile);
      }
    }

    // Tactile Toy Hazard Walls
    const wallGeo = new RoundedBoxGeometry(0.8, 0.65, 0.8, 4, 0.08);
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.35,
      metalness: 0.1
    });
    board.walls.forEach((w) => {
      const pos = toWorld(w.x, w.y);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(pos.x, 0.62, pos.z);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      const hazardTrim = new THREE.Mesh(
        new RoundedBoxGeometry(0.84, 0.1, 0.84, 2, 0.02),
        goldToyMat
      );
      hazardTrim.position.y = 0.26;
      wallMesh.add(hazardTrim);
      group.add(wallMesh);
    });

    // Rotating 3D Golden Key (`🔑`)
    const keyGroup = new THREE.Group();
    const keyPos = toWorld(board.key.x, board.key.y);
    keyGroup.position.set(keyPos.x, 0.82, keyPos.z);

    const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 14, 24), goldToyMat);
    const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 10), goldToyMat);
    keyShaft.position.y = -0.26;
    const keyTooth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.05), goldToyMat);
    keyTooth.position.set(0.07, -0.36, 0);
    keyGroup.add(keyRing, keyShaft, keyTooth);

    const keyLabel = createHebrewLabelSprite('🔑 מפתח', {
      accentColor: '#fbbf24',
      scale: [1.1, 0.38]
    });
    keyLabel.position.set(0, 0.52, 0);
    keyGroup.add(keyLabel);
    group.add(keyGroup);

    // Mechanical 3D Blast Gate
    const gateGroup = new THREE.Group();
    const gatePos = toWorld(board.gate.x, board.gate.y);
    gateGroup.position.set(gatePos.x, 0.32, gatePos.z);

    const gatePillarL = new THREE.Mesh(new RoundedBoxGeometry(0.16, 1.05, 0.22, 3, 0.03), boardRimMat);
    gatePillarL.position.set(-0.34, 0.52, 0);
    const gatePillarR = gatePillarL.clone();
    gatePillarR.position.set(0.34, 0.52, 0);
    gateGroup.add(gatePillarL, gatePillarR);

    const laserBarsGroup = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.64, 10),
        roseToyMat
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 0.28 + b * 0.26;
      laserBarsGroup.add(bar);
    }
    gateGroup.add(laserBarsGroup);

    const gateLabel = createHebrewLabelSprite('🔒 שער', {
      accentColor: '#fb7185',
      scale: [1.05, 0.38]
    });
    gateLabel.position.set(0, 1.32, 0);
    gateGroup.add(gateLabel);
    group.add(gateGroup);

    // Goal Pad
    const goalPos = toWorld(board.goal.x, board.goal.y);
    const goalGroup = new THREE.Group();
    goalGroup.position.set(goalPos.x, 0.34, goalPos.z);

    const goalRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 12, 28), emeraldToyMat);
    goalRing.rotation.x = Math.PI / 2;
    goalGroup.add(goalRing);

    const goalStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldToyMat);
    goalStar.position.y = 0.45;
    goalGroup.add(goalStar);

    const goalLabel = createHebrewLabelSprite('🏆 יעד', {
      accentColor: '#34d399',
      scale: [1.05, 0.38]
    });
    goalLabel.position.set(0, 1.02, 0);
    goalGroup.add(goalLabel);
    group.add(goalGroup);

    // Second 3D Zen Unit on the 6×6 Chamber Floor
    const mazeZen = createZen3DRobot();
    mazeZen.group.scale.setScalar(0.54);
    const startWorld = toWorld(board.start.x, board.start.y);
    mazeZen.group.position.set(startWorld.x, 0.34, startWorld.z);
    group.add(mazeZen.group);

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

        keyGroup.rotation.y = elapsedTime * 2.0;
        if (l2.hasKey) {
          keyGroup.position.set(
            mazeZen.group.position.x + Math.cos(elapsedTime * 3.0) * 0.42,
            1.45,
            mazeZen.group.position.z + Math.sin(elapsedTime * 3.0) * 0.42
          );
          keyGroup.scale.setScalar(0.68);
        } else {
          keyGroup.position.set(keyPos.x, 0.8 + Math.sin(elapsedTime * 2.5) * 0.06, keyPos.z);
          keyGroup.scale.setScalar(1.0);
        }

        const gateTargetY = l2.isGateUnlocked ? -0.95 : 0.0;
        laserBarsGroup.position.y = THREE.MathUtils.lerp(laserBarsGroup.position.y, gateTargetY, Math.min(1, dt * 8));
        laserBarsGroup.visible = laserBarsGroup.position.y > -0.85;

        goalStar.rotation.y = elapsedTime * 1.8;
      },
      onPointerDown() {
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 3: 2.5D Branching Toy Chute Sorter (Decision Tree)
  // ---------------------------------------------------------------------------
  function buildStation3() {
    const group = new THREE.Group();
    group.name = 'Station3_DecisionTreeSorter';

    const rootPos = new THREE.Vector3(0, 0.55, -2.1);
    const leftGatePos = new THREE.Vector3(1.95, 0.45, 0.0); // Yes (Right)
    const rightGatePos = new THREE.Vector3(-1.95, 0.45, 0.0); // No (Left)

    const leafPositions = {
      leafLL: new THREE.Vector3(2.9, 0.32, 2.1),
      leafLR: new THREE.Vector3(0.95, 0.32, 2.1),
      leafRL: new THREE.Vector3(-0.95, 0.32, 2.1),
      leafRR: new THREE.Vector3(-2.9, 0.32, 2.1)
    };

    const boardPlate = new THREE.Mesh(
      new RoundedBoxGeometry(7.6, 0.24, 6.4, 4, 0.1),
      boardFrameMat
    );
    boardPlate.position.set(0, 0.1, 0);
    boardPlate.receiveShadow = true;
    group.add(boardPlate);

    function addChuteTube(p0, p1, mat) {
      const mid = new THREE.Vector3().lerpVectors(p0, p1, 0.5);
      mid.y += 0.12;
      const curve = new THREE.CatmullRomCurve3([p0, mid, p1]);
      const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.09, 10, false);
      const mesh = new THREE.Mesh(tubeGeo, mat);
      group.add(mesh);
      return curve;
    }

    const curves = {
      rootToYes: addChuteTube(rootPos, leftGatePos, emeraldToyMat),
      rootToNo: addChuteTube(rootPos, rightGatePos, roseToyMat),
      yesToLL: addChuteTube(leftGatePos, leafPositions.leafLL, emeraldToyMat),
      yesToLR: addChuteTube(leftGatePos, leafPositions.leafLR, roseToyMat),
      noToRL: addChuteTube(rightGatePos, leafPositions.leafRL, emeraldToyMat),
      noToRR: addChuteTube(rightGatePos, leafPositions.leafRR, roseToyMat)
    };

    function createGateNode(pos, nodeKey, titleText, color) {
      const g = new THREE.Group();
      g.position.copy(pos);

      const body = new THREE.Mesh(
        new RoundedBoxGeometry(1.4, 0.42, 0.72, 4, 0.08),
        new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.1 })
      );
      body.castShadow = true;
      body.userData = { station: 'lab3', gateNode: nodeKey };
      g.add(body);

      const label = createHebrewLabelSprite(titleText, {
        subtext: 'לחצו להחלפת שאלה 🔄',
        accentColor: color,
        scale: [1.85, 0.58]
      });
      label.position.set(0, 0.56, 0);
      label.userData = { station: 'lab3', gateNode: nodeKey };
      g.add(label);

      group.add(g);
      return { group: g, body };
    }

    createGateNode(rootPos, 'rootAttr', 'צומת שורש (שאלה 1)', '#fbbf24');
    createGateNode(leftGatePos, 'leftAttr', 'ענף כן (ימין)', '#34d399');
    createGateNode(rightGatePos, 'rightAttr', 'ענף לא (שמאל)', '#fb7185');

    // 4 Glowing 3D Leaf Collection Pods
    const leafPods = {};
    const leafLabelsMap = {
      leafLL: 'סל 1 (כן ⬅ כן)',
      leafLR: 'סל 2 (כן ⬅ לא)',
      leafRL: 'סל 3 (לא ⬅ כן)',
      leafRR: 'סל 4 (לא ⬅ לא)'
    };
    Object.entries(leafPositions).forEach(([key, pos]) => {
      const podGroup = new THREE.Group();
      podGroup.position.copy(pos);

      const podBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.8, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.35 })
      );
      podGroup.add(podBase);

      const podRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.74, 0.055, 10, 24),
        cyanToyMat.clone()
      );
      podRim.rotation.x = Math.PI / 2;
      podRim.position.y = 0.15;
      podGroup.add(podRim);

      const podLabel = createHebrewLabelSprite(leafLabelsMap[key], {
        accentColor: '#38bdf8',
        scale: [1.45, 0.46]
      });
      podLabel.position.set(0, 0.65, 0);
      podGroup.add(podLabel);

      group.add(podGroup);
      leafPods[key] = { podGroup, podRim };
    });

    // Animal Capsule Launcher Pads
    const baseAnimals = curriculumData.labs.lab3.dataset;
    baseAnimals.forEach((animal, idx) => {
      const meta = ANIMAL_META[animal.id] || { emoji: '🐾', color: '#38bdf8' };
      const lx = (idx - 1.5) * 1.35;
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.44, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: meta.color, roughness: 0.25 })
      );
      pad.position.set(lx, 0.3, -2.95);
      pad.userData = { station: 'lab3', animalId: animal.id };

      const lbl = createHebrewLabelSprite(`${meta.emoji} ${animal.name}`, {
        accentColor: meta.color,
        scale: [1.15, 0.42]
      });
      lbl.position.set(0, 0.52, 0);
      lbl.userData = { station: 'lab3', animalId: animal.id };
      pad.add(lbl);

      group.add(pad);
    });

    const activeSlidingCapsule = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      goldToyMat
    );
    activeSlidingCapsule.visible = false;
    group.add(activeSlidingCapsule);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l3 = state.lab3;
        if (!l3) return;

        const leaves = l3.evaluation?.leafDetails || {};
        Object.entries(leafPods).forEach(([key, pod]) => {
          const detail = leaves[key];
          if (!detail) return;
          const isPure = detail.isPure && detail.count > 0;
          const color = detail.count === 0 ? '#64748b' : isPure ? '#10b981' : '#f59e0b';
          pod.podRim.material.color.set(color);
        });

        if (l3.slidingAnimal) {
          const { progress, isRootYes, leafKey } = l3.slidingAnimal;
          activeSlidingCapsule.visible = true;
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
          activeSlidingCapsule.position.y += 0.2;
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
  // STATION 4: 2.5D Toy City / Space Sector (8×8), A* vs BFS Waves & Ship
  // ---------------------------------------------------------------------------
  function buildStation4() {
    const group = new THREE.Group();
    group.name = 'Station4_PathfinderSector';

    const spacing = 0.74;
    const startOffset = -((8 - 1) * spacing) / 2;
    const toWorld = (gx, gy) => ({
      x: startOffset + gx * spacing,
      z: startOffset + gy * spacing
    });

    const outerRim = new THREE.Mesh(new RoundedBoxGeometry(6.8, 0.26, 6.8, 4, 0.1), boardRimMat);
    outerRim.position.y = 0.08;
    group.add(outerRim);

    const baseFrame = new THREE.Mesh(new RoundedBoxGeometry(6.4, 0.3, 6.4, 4, 0.08), boardFrameMat);
    baseFrame.position.y = 0.12;
    baseFrame.receiveShadow = true;
    group.add(baseFrame);

    const cells = [];
    const tileGeo = new RoundedBoxGeometry(0.66, 0.16, 0.66, 3, 0.04);
    const obstacleGeo = new RoundedBoxGeometry(0.58, 0.55, 0.58, 3, 0.06);
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.4,
      metalness: 0.1
    });

    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        const idx = gy * 8 + gx;
        const pos = toWorld(gx, gy);
        const tile = new THREE.Mesh(
          tileGeo,
          new THREE.MeshStandardMaterial({
            color: '#334155',
            roughness: 0.35,
            metalness: 0.08
          })
        );
        tile.position.set(pos.x, 0.28, pos.z);
        tile.receiveShadow = true;
        tile.userData = { station: 'lab4', gx, gy, idx };
        group.add(tile);

        const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
        obstacle.position.set(pos.x, 0.55, pos.z);
        obstacle.castShadow = true;
        obstacle.visible = false;
        obstacle.userData = { station: 'lab4', gx, gy, idx };
        group.add(obstacle);

        cells.push({ idx, gx, gy, x: pos.x, z: pos.z, tile, obstacle });
      }
    }

    const startWorld = toWorld(0, 0);
    const goalWorld = toWorld(7, 7);

    const startBeacon = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 16), cyanToyMat);
    startBeacon.position.set(startWorld.x, 0.62, startWorld.z);
    group.add(startBeacon);

    const goalBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldToyMat);
    goalBeacon.position.set(goalWorld.x, 0.68, goalWorld.z);
    group.add(goalBeacon);

    const shipGroup = new THREE.Group();
    const shipBody = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.52, 12), cyanToyMat);
    shipBody.rotation.x = Math.PI / 2;
    const shipWings = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.22), boardRimMat);
    shipGroup.add(shipBody, shipWings);
    shipGroup.position.set(startWorld.x, 0.72, startWorld.z);
    group.add(shipGroup);

    let pathTubeMesh = null;
    let lastPathSignature = '';

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

          c.obstacle.visible = isWall;

          if (isPath) {
            c.tile.material.color.set('#fbbf24');
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.38, Math.min(1, dt * 12));
          } else if (isVisited) {
            const waveColor = l4.algorithm === 'astar' ? '#38bdf8' : '#818cf8';
            c.tile.material.color.set(waveColor);
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.33, Math.min(1, dt * 12));
          } else {
            c.tile.material.color.set('#334155');
            c.tile.position.y = THREE.MathUtils.lerp(c.tile.position.y, 0.28, Math.min(1, dt * 12));
          }
        }

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
              return new THREE.Vector3(wp.x, 0.6, wp.z);
            });
            const curve = new THREE.CatmullRomCurve3(pts);
            const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.065, 10, false);
            pathTubeMesh = new THREE.Mesh(tubeGeo, goldToyMat);
            pathTubeMesh.userData.curve = curve;
            group.add(pathTubeMesh);
          }
        }

        if (pathTubeMesh && pathTubeMesh.userData.curve) {
          const u = (elapsedTime * 0.32) % 1.0;
          const pt = pathTubeMesh.userData.curve.getPointAt(u);
          const lookPt = pathTubeMesh.userData.curve.getPointAt(Math.min(1.0, u + 0.04));
          shipGroup.position.copy(pt);
          shipGroup.position.y += 0.12;
          shipGroup.lookAt(lookPt.x, lookPt.y + 0.12, lookPt.z);
        } else {
          shipGroup.position.set(startWorld.x, 0.72, startWorld.z);
        }

        goalBeacon.rotation.y = elapsedTime * 2.0;
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
  // STATION 5: Crystal-Clear 2.5D Nintendo k-NN Fruit Arena (Sweetness × Size)
  // ---------------------------------------------------------------------------
  function buildStation5() {
    const group = new THREE.Group();
    group.name = 'Station5_KNNFruitArena';

    const arenaWidth = 5.8;
    const toArenaPos = (px, py) => ({
      x: ((px - 50) / 100) * arenaWidth,
      z: ((50 - py) / 100) * arenaWidth
    });
    const fromArenaPos = (wx, wz) => ({
      x: Math.max(5, Math.min(95, Math.round((wx / arenaWidth) * 100 + 50))),
      y: Math.max(5, Math.min(95, Math.round(50 - (wz / arenaWidth) * 100)))
    });

    // Crisp White Outer Toy Rim + Slate Inner Arena Floor
    const outerRim = new THREE.Mesh(
      new RoundedBoxGeometry(6.8, 0.24, 6.8, 4, 0.1),
      boardRimMat
    );
    outerRim.position.y = 0.08;
    group.add(outerRim);

    const arenaFloor = new THREE.Mesh(
      new RoundedBoxGeometry(6.4, 0.28, 6.4, 4, 0.08),
      boardFrameMat
    );
    arenaFloor.position.y = 0.12;
    arenaFloor.receiveShadow = true;
    arenaFloor.userData = { station: 'lab5', isArenaFloor: true };
    group.add(arenaFloor);

    // Subtle Grid Lines on Arena Surface for 2.5D Spatial Alignment
    const gridHelper = new THREE.GridHelper(5.8, 10, '#475569', '#334155');
    gridHelper.position.y = 0.27;
    group.add(gridHelper);

    // Static Axis Labels Aligned with X (Sweetness) and Y (Size) Axes
    const xAxisLabel = createHebrewLabelSprite('ציר X: רמת מתיקות 🍬 (0 עד 100)', {
      accentColor: '#38bdf8',
      scale: [2.2, 0.48]
    });
    xAxisLabel.position.set(0, 0.38, 2.55);
    group.add(xAxisLabel);

    const yAxisLabel = createHebrewLabelSprite('ציר Y: גודל הפרי 📏', {
      accentColor: '#34d399',
      scale: [1.85, 0.5]
    });
    yAxisLabel.position.set(-3.55, 0.42, 0);
    group.add(yAxisLabel);

    // Fruit Toy Materials
    const appleMat = new THREE.MeshStandardMaterial({
      map: fruitPbr.appleTexture,
      roughness: 0.2,
      metalness: 0.05
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.3
    });
    const melonMat = new THREE.MeshStandardMaterial({
      map: fruitPbr.melonTexture,
      roughness: 0.22,
      metalness: 0.05
    });

    function createFruitMesh(label) {
      const fGroup = new THREE.Group();
      if (label === 'A') {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 16), appleMat);
        body.scale.set(1.0, 0.9, 1.0);
        body.position.y = 0.22;
        body.castShadow = true;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.025, 0.12, 8),
          new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })
        );
        stem.position.y = 0.45;
        const leaf = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.035, 0.08, 2, 0.01), leafMat);
        leaf.position.set(0.07, 0.46, 0);
        leaf.rotation.z = 0.35;
        fGroup.add(body, stem, leaf);
      } else {
        const melon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), melonMat);
        melon.scale.set(1.22, 0.92, 0.96);
        melon.position.y = 0.26;
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
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#fbbf24',
        emissiveIntensity: 0.75,
        roughness: 0.15,
        metalness: 0.15
      })
    );
    mysteryOrb.position.y = 0.36;
    mysteryOrb.castShadow = true;
    mysteryOrb.userData = { station: 'lab5', isMysteryOrb: true };
    mysteryGroup.add(mysteryOrb);

    const mysteryLabel = createHebrewLabelSprite('❓ פרי המסתורין (?)', {
      subtext: 'גררו על הלוח!',
      accentColor: '#fbbf24',
      scale: [1.65, 0.52]
    });
    mysteryLabel.position.set(0, 0.95, 0);
    mysteryLabel.userData = { station: 'lab5', isMysteryOrb: true };
    mysteryGroup.add(mysteryLabel);
    group.add(mysteryGroup);

    // Clean Translucent 3D Dome + Crisp Radius Ring for k-th Neighbor Radius
    const radiusSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    radiusSphere.position.y = 0.28;
    group.add(radiusSphere);

    const radiusRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.0, 48),
      new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        side: THREE.DoubleSide
      })
    );
    radiusRing.rotation.x = -Math.PI / 2;
    radiusRing.position.y = 0.29;
    group.add(radiusRing);

    // Up to 5 Distance Tether Beams to the k Nearest Fruits
    const tetherPool = [];
    const tetherMat = new THREE.MeshBasicMaterial({ color: '#fbbf24' });
    for (let i = 0; i < 5; i++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), tetherMat);
      beam.visible = false;
      group.add(beam);
      tetherPool.push({ beam });
    }

    // Two Tactile 3D Voting Pillars Aligned at the Top of the Board (Static Labels)
    const voteApplePillar = new THREE.Mesh(
      new RoundedBoxGeometry(0.7, 0.65, 0.48, 3, 0.06),
      roseToyMat
    );
    voteApplePillar.position.set(-1.55, 0.45, -2.85);
    const voteAppleLabel = createHebrewLabelSprite('🍎 תפוחים (A)', {
      accentColor: '#fb7185',
      scale: [1.4, 0.44]
    });
    voteAppleLabel.position.set(-1.55, 1.08, -2.85);
    group.add(voteApplePillar, voteAppleLabel);

    const voteMelonPillar = new THREE.Mesh(
      new RoundedBoxGeometry(0.7, 0.65, 0.48, 3, 0.06),
      emeraldToyMat
    );
    voteMelonPillar.position.set(1.55, 0.45, -2.85);
    const voteMelonLabel = createHebrewLabelSprite('🍉 אבטיחים (B)', {
      accentColor: '#34d399',
      scale: [1.4, 0.44]
    });
    voteMelonLabel.position.set(1.55, 1.08, -2.85);
    group.add(voteMelonPillar, voteMelonLabel);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l5 = state.lab5;
        if (!l5) return;

        const activeIds = new Set();
        (l5.points || []).forEach((pt) => {
          activeIds.add(pt.id);
          let entry = fruitInstances.get(pt.id);
          if (!entry) {
            const mesh = createFruitMesh(pt.label);
            const wp = toArenaPos(pt.x, pt.y);
            mesh.position.set(wp.x, 0.26, wp.z);
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
        mysteryGroup.position.set(qPos.x, 0.26, qPos.z);

        const cls = l5.classification || {
          predictedLabel: 'A',
          confidence: 100,
          nearestNeighbors: [],
          votes: {}
        };
        const isApplePred = cls.predictedLabel === 'A';
        mysteryOrb.material.emissive.set(isApplePred ? '#ef4444' : '#10b981');

        // Expand 3D Radius Dome + Ring to exact k-th neighbor distance
        const neighbors = cls.nearestNeighbors || [];
        const kthNeighbor = neighbors[neighbors.length - 1];
        let worldRadius = 0.75;
        if (kthNeighbor) {
          const nw = toArenaPos(kthNeighbor.x, kthNeighbor.y);
          worldRadius = Math.max(0.4, Math.hypot(nw.x - qPos.x, nw.z - qPos.z));
        }
        radiusSphere.position.set(qPos.x, 0.28, qPos.z);
        const lerpedR = THREE.MathUtils.lerp(radiusSphere.scale.x, worldRadius, Math.min(1, dt * 14));
        radiusSphere.scale.set(lerpedR, Math.min(1.1, lerpedR * 0.45), lerpedR);

        radiusRing.position.set(qPos.x, 0.29, qPos.z);
        radiusRing.scale.set(lerpedR, lerpedR, 1);

        // Update Tether Beams (Zero dynamic texture updates!)
        const pQuery = new THREE.Vector3(qPos.x, 0.52, qPos.z);
        for (let i = 0; i < 5; i++) {
          const tether = tetherPool[i];
          const nb = neighbors[i];
          if (nb) {
            const nw = toArenaPos(nb.x, nb.y);
            const pNb = new THREE.Vector3(nw.x, 0.48, nw.z);
            setCylBetweenPoints(tether.beam, pQuery, pNb, 0.028);
          } else {
            tether.beam.visible = false;
          }
        }

        // Scale 3D Voting Pillars
        const votesA = cls.votes?.A || 0;
        const votesB = cls.votes?.B || 0;
        const targetScaleA = 0.35 + votesA * 0.32;
        const targetScaleB = 0.35 + votesB * 0.32;
        voteApplePillar.scale.y = THREE.MathUtils.lerp(voteApplePillar.scale.y, targetScaleA, Math.min(1, dt * 10));
        voteApplePillar.position.y = 0.24 + voteApplePillar.scale.y * 0.4;
        voteMelonPillar.scale.y = THREE.MathUtils.lerp(voteMelonPillar.scale.y, targetScaleB, Math.min(1, dt * 10));
        voteMelonPillar.position.y = 0.24 + voteMelonPillar.scale.y * 0.4;
      },
      onPointerDown(intersects, state) {
        const orbHit = intersects.find((h) => h.object?.userData?.isMysteryOrb);
        if (orbHit) {
          activeDragState = { station: 'lab5', mode: 'dragMystery' };
          return true;
        }
        const floorHit = intersects.find((h) => h.object?.userData?.isArenaFloor);
        if (floorHit) {
          const pt = floorHit.point;
          const qPos = toArenaPos(state.lab5.testPoint.x, state.lab5.testPoint.y);
          if (Math.hypot(pt.x - qPos.x, pt.z - qPos.z) < 0.68) {
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
  // STATION 6: 2.5D Scanning Kernel Frame & 8×8 Feature Map Extruder (CNN)
  // ---------------------------------------------------------------------------
  function buildStation6() {
    const group = new THREE.Group();
    group.name = 'Station6_VisionScanner';

    const spacing = 0.5;
    const startOffset = -((8 - 1) * spacing) / 2;
    const leftCenterX = -2.35;
    const rightCenterX = 2.35;

    const leftBase = new THREE.Mesh(new RoundedBoxGeometry(4.3, 0.26, 4.3, 4, 0.08), boardFrameMat);
    leftBase.position.set(leftCenterX, 0.12, 0);
    const rightBase = leftBase.clone();
    rightBase.position.set(rightCenterX, 0.12, 0);
    group.add(leftBase, rightBase);

    const inputTiles = [];
    const outputPillars = [];
    const tileGeo = new RoundedBoxGeometry(0.42, 0.2, 0.42, 3, 0.04);
    const pillarGeo = new RoundedBoxGeometry(0.42, 0.9, 0.42, 3, 0.04);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = y * 8 + x;
        const lx = leftCenterX + startOffset + x * spacing;
        const rx = rightCenterX + startOffset + x * spacing;
        const wz = startOffset + y * spacing;

        const inTile = new THREE.Mesh(
          tileGeo,
          new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.35 })
        );
        inTile.position.set(lx, 0.28, wz);
        inTile.userData = { station: 'lab6', side: 'input', x, y, idx };
        group.add(inTile);
        inputTiles.push({ idx, x, y, lx, wz, mesh: inTile });

        const outPillar = new THREE.Mesh(
          pillarGeo,
          new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.25 })
        );
        outPillar.position.set(rx, 0.3, wz);
        outPillar.userData = { station: 'lab6', side: 'output', x, y, idx };
        group.add(outPillar);
        outputPillars.push({ idx, x, y, rx, wz, mesh: outPillar });
      }
    }

    const kernelFrame = new THREE.Mesh(
      new RoundedBoxGeometry(spacing * 3.05, 0.12, spacing * 3.05, 3, 0.03),
      goldToyMat
    );
    kernelFrame.position.set(leftCenterX, 0.52, 0);
    group.add(kernelFrame);

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
          it.mesh.material.color.set(isOn ? '#ffffff' : '#334155');
          it.mesh.position.y = isOn ? 0.36 : 0.26;

          const op = outputPillars[i];
          const val = outGrid[i] || 0;
          const targetH = 0.14 + val * 0.95;
          op.mesh.scale.y = THREE.MathUtils.lerp(op.mesh.scale.y, targetH, Math.min(1, dt * 12));
          op.mesh.position.y = 0.22 + op.mesh.scale.y * 0.45;
          op.mesh.material.color.set(val > 0.15 ? '#10b981' : '#334155');
        }

        const targetKx = leftCenterX + startOffset + insp.x * spacing;
        const targetKz = startOffset + insp.y * spacing;
        kernelFrame.position.x = THREE.MathUtils.lerp(kernelFrame.position.x, targetKx, Math.min(1, dt * 14));
        kernelFrame.position.z = THREE.MathUtils.lerp(kernelFrame.position.z, targetKz, Math.min(1, dt * 14));
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
  // STATION 7: 2.5D Smart Neuron Core, Weight Pipes & 4-Pedestal Truth Arena
  // ---------------------------------------------------------------------------
  function buildStation7() {
    const group = new THREE.Group();
    group.name = 'Station7_NeuronPerceptron';

    const baseBoard = new THREE.Mesh(
      new RoundedBoxGeometry(7.6, 0.24, 5.4, 4, 0.1),
      boardFrameMat
    );
    baseBoard.position.set(0, 0.1, 0);
    group.add(baseBoard);

    const pIn1 = new THREE.Vector3(-2.8, 0.85, -1.15);
    const pIn2 = new THREE.Vector3(-2.8, 0.85, 1.15);
    const pCore = new THREE.Vector3(-0.55, 0.95, 0);

    const gen1 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.65, 16), cyanToyMat);
    gen1.position.copy(pIn1);
    const gen1Label = createHebrewLabelSprite('קלט x₁ (w₁)', {
      accentColor: '#38bdf8',
      scale: [1.35, 0.44]
    });
    gen1Label.position.set(pIn1.x, 1.55, pIn1.z);

    const gen2 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.65, 16), cyanToyMat);
    gen2.position.copy(pIn2);
    const gen2Label = createHebrewLabelSprite('קלט x₂ (w₂)', {
      accentColor: '#38bdf8',
      scale: [1.35, 0.44]
    });
    gen2Label.position.set(pIn2.x, 1.55, pIn2.z);
    group.add(gen1, gen1Label, gen2, gen2Label);

    const pipe1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 12),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25 })
    );
    const pipe2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 12),
      new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25 })
    );
    group.add(pipe1, pipe2);

    const fusionCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({
        color: '#a855f7',
        emissive: '#7e22ce',
        emissiveIntensity: 0.35,
        roughness: 0.22
      })
    );
    fusionCore.position.copy(pCore);
    group.add(fusionCore);

    const coreLabel = createHebrewLabelSprite('ליבת הנוירון (Σ)', {
      accentColor: '#fbbf24',
      scale: [1.75, 0.5]
    });
    coreLabel.position.set(pCore.x, 1.85, pCore.z);
    group.add(coreLabel);

    const arenaCenterX = 1.95;
    const truthCoords = [
      { x1: 0, x2: 0, wx: arenaCenterX - 0.95, wz: 0.95 },
      { x1: 0, x2: 1, wx: arenaCenterX - 0.95, wz: -0.95 },
      { x1: 1, x2: 0, wx: arenaCenterX + 0.95, wz: 0.95 },
      { x1: 1, x2: 1, wx: arenaCenterX + 0.95, wz: -0.95 }
    ];

    const truthPedestals = truthCoords.map((tc) => {
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.42, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.35 })
      );
      ped.position.set(tc.wx, 0.32, tc.wz);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), emeraldToyMat.clone());
      orb.position.set(tc.wx, 0.72, tc.wz);
      const lbl = createHebrewLabelSprite(`(${tc.x1},${tc.x2})`, {
        accentColor: '#38bdf8',
        scale: [0.95, 0.38]
      });
      lbl.position.set(tc.wx, 1.2, tc.wz);
      group.add(ped, orb, lbl);
      return { ...tc, ped, orb };
    });

    const decisionPlane = new THREE.Mesh(
      new RoundedBoxGeometry(2.9, 0.75, 0.06, 2, 0.02),
      new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.55
      })
    );
    decisionPlane.position.set(arenaCenterX, 0.62, 0);
    group.add(decisionPlane);

    return {
      group,
      update(dt, elapsedTime, state) {
        const l7 = state.lab7;
        if (!l7) return;

        const r1 = Math.max(0.035, Math.min(0.2, Math.abs(l7.w1) * 0.085));
        const r2 = Math.max(0.035, Math.min(0.2, Math.abs(l7.w2) * 0.085));
        setCylBetweenPoints(pipe1, pIn1, pCore, r1);
        setCylBetweenPoints(pipe2, pIn2, pCore, r2);
        pipe1.material.color.set(l7.w1 >= 0 ? '#38bdf8' : '#f43f5e');
        pipe2.material.color.set(l7.w2 >= 0 ? '#38bdf8' : '#f43f5e');

        const results = l7.evaluation?.results || [];
        truthPedestals.forEach((tp, idx) => {
          const r = results[idx];
          if (!r) return;
          const isFired = l7.activation === 'step' ? r.output === 1 : r.output >= 0.5;
          tp.orb.material.color.set(isFired ? '#10b981' : '#475569');
          tp.orb.material.emissive.set(isFired ? '#059669' : '#000000');
          tp.orb.position.y = isFired ? 0.82 : 0.65;
        });

        const angle = Math.atan2(l7.w1 || 0.01, l7.w2 || 0.01);
        decisionPlane.rotation.y = THREE.MathUtils.lerp(decisionPlane.rotation.y, angle, Math.min(1, dt * 10));
        const shift = Math.max(-1.0, Math.min(1.0, -l7.bias * 0.48));
        decisionPlane.position.x = arenaCenterX + Math.cos(angle) * shift * 0.5;
        decisionPlane.position.z = Math.sin(angle) * shift * 0.5;
      },
      onPointerDown() {
        return false;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // STATION 8: 2.5D Token Reactor Core, 5 Probability Pillars & Story Train
  // ---------------------------------------------------------------------------
  function buildStation8() {
    const group = new THREE.Group();
    group.name = 'Station8_LLMTokenReactor';

    const baseBoard = new THREE.Mesh(
      new RoundedBoxGeometry(7.8, 0.24, 5.8, 4, 0.1),
      boardFrameMat
    );
    baseBoard.position.set(0, 0.1, 0.2);
    group.add(baseBoard);

    const reactorPos = new THREE.Vector3(0, 0.95, -1.55);
    const reactorGroup = new THREE.Group();
    reactorGroup.position.copy(reactorPos);

    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 24, 24),
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0284c7',
        emissiveIntensity: 0.4,
        roughness: 0.2
      })
    );
    coreSphere.userData = { station: 'lab8', isReactorCore: true };
    reactorGroup.add(coreSphere);

    const thermalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.045, 12, 32),
      goldToyMat
    );
    reactorGroup.add(thermalRing);

    const reactorLabel = createHebrewLabelSprite('ליבת טמפרטורה 🌡️ (לחצו להגרלה)', {
      accentColor: '#fbbf24',
      scale: [2.35, 0.55]
    });
    reactorLabel.position.set(0, 1.15, 0);
    reactorLabel.userData = { station: 'lab8', isReactorCore: true };
    reactorGroup.add(reactorLabel);
    group.add(reactorGroup);

    // 5 Probability Pillars & Word Cubes aligned in a clean row
    const wordSlots = [];
    for (let i = 0; i < 5; i++) {
      const slotX = (2 - i) * 1.38;
      const slotZ = 0.15;

      const pillar = new THREE.Mesh(
        new RoundedBoxGeometry(0.66, 0.9, 0.66, 3, 0.05),
        new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.35 })
      );
      pillar.position.set(slotX, 0.35, slotZ);
      pillar.userData = { station: 'lab8', slotIndex: i };

      const wordCube = new THREE.Mesh(
        new RoundedBoxGeometry(0.6, 0.6, 0.6, 4, 0.08),
        cyanToyMat.clone()
      );
      wordCube.position.set(slotX, 1.15, slotZ);
      wordCube.castShadow = true;
      wordCube.userData = { station: 'lab8', slotIndex: i };

      const slotBadge = createHebrewLabelSprite(`אפשרות ${i + 1}`, {
        accentColor: '#38bdf8',
        scale: [1.05, 0.38]
      });
      slotBadge.position.set(slotX, 1.72, slotZ);
      slotBadge.userData = { station: 'lab8', slotIndex: i };

      group.add(pillar, wordCube, slotBadge);
      wordSlots.push({ i, slotX, slotZ, pillar, wordCube, slotBadge });
    }

    // Story Train Track in the Foreground
    const trackRail = new THREE.Mesh(
      new RoundedBoxGeometry(6.8, 0.12, 0.58, 3, 0.03),
      boardRimMat
    );
    trackRail.position.set(0, 0.24, 2.05);
    group.add(trackRail);

    const trainWagons = [];
    for (let w = 0; w < 6; w++) {
      const wx = 2.4 - w * 0.96;
      const wagon = new THREE.Mesh(
        new RoundedBoxGeometry(0.78, 0.42, 0.5, 3, 0.05),
        goldToyMat
      );
      wagon.position.set(wx, 0.48, 2.05);
      wagon.visible = false;
      group.add(wagon);
      trainWagons.push({ wagon });
    }

    return {
      group,
      update(dt, elapsedTime, state) {
        const l8 = state.lab8;
        if (!l8) return;

        const temp = l8.temperature ?? 0.7;
        const tNorm = Math.min(1, temp / 1.5);
        coreSphere.material.color.set('#22d3ee').lerp(new THREE.Color('#f97316'), tNorm);
        thermalRing.rotation.z = elapsedTime * (0.6 + temp * 1.8);

        const dist = l8.tokenDistribution || [];
        wordSlots.forEach((slot, idx) => {
          const item = dist[idx];
          if (!item) {
            slot.pillar.visible = false;
            slot.wordCube.visible = false;
            slot.slotBadge.visible = false;
            return;
          }
          slot.pillar.visible = true;
          slot.wordCube.visible = true;
          slot.slotBadge.visible = true;

          const probH = Math.max(0.2, (item.probability / 100) * 1.25);
          slot.pillar.scale.y = THREE.MathUtils.lerp(slot.pillar.scale.y, probH, Math.min(1, dt * 10));
          slot.pillar.position.y = 0.22 + slot.pillar.scale.y * 0.45;
          slot.wordCube.position.y = 0.22 + slot.pillar.scale.y + 0.38;

          const isTop = item.probability >= 45;
          slot.wordCube.material.color.set(isTop ? '#fbbf24' : '#38bdf8');
          slot.slotBadge.position.y = slot.wordCube.position.y + 0.52;
        });

        const tokens = l8.generatedTokens || [];
        trainWagons.forEach((tw, idx) => {
          tw.wagon.visible = Boolean(tokens[idx]);
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
    const activeStationGroup = stationsMap[activeLabId]?.group;
    const targets = activeStationGroup
      ? [activeStationGroup, companionZen.group]
      : [companionZen.group];
    return raycaster.intersectObjects(targets, true);
  }

  function handlePointerDown(ndc, camera) {
    const state = getStoreSnapshot(store);
    if (state.activeLabId && state.activeLabId !== activeLabId) {
      setActiveStation(state.activeLabId);
    }

    const intersects = getIntersects(ndc, camera);
    if (intersects.length === 0) return false;

    // 1. Check Companion Zen Robot click
    const zenHit = intersects.find((h) => h.object?.userData?.isCompanionZen);
    if (zenHit) {
      AudioEngine.playZenChime();
      const ch = state.activeLabData?.challenges?.[0];
      if (ch?.instructions) {
        NarrationEngine.speak(ch.instructions, `/audio/hints/${activeLabId}_ch1.mp3`);
      }
      return false;
    }

    // 2. Dispatch to Active Centerpiece 2.5D Toy-Board Machine
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

    if ((state.totalStars || 0) > lastTotalStars) {
      lastTotalStars = state.totalStars || 0;
      celebrateUntil = elapsedTime + 2.5;
    }

    // Update Living 3D Zen Companion
    const isSpeaking = Boolean(NarrationEngine.getState().isPlaying);
    companionZen.setEquippedGadget(state.equippedGadget);
    companionZen.setMood(
      elapsedTime < celebrateUntil ? 'celebrating' : isSpeaking ? 'thinking' : 'happy'
    );
    companionZen.update(dt, elapsedTime, {
      isSpeaking,
      targetLookAt: camera ? camera.position : null
    });

    // Update ONLY the Active Station Machine (zero background work!)
    const currentStation = stationsMap[activeLabId];
    if (currentStation?.update) {
      currentStation.update(dt, elapsedTime, state);
    }
  }

  function syncWithStore() {
    const state = getStoreSnapshot(store);
    if (state.activeLabId && state.activeLabId !== activeLabId) {
      setActiveStation(state.activeLabId);
    }
  }

  let unsub = null;
  if (store && typeof store.subscribe === 'function') {
    unsub = store.subscribe(syncWithStore);
  }

  function dispose() {
    if (unsub) unsub();
    companionZen.dispose?.();
  }

  return {
    group: rootGroup,
    stationsMap,
    companionZen,
    setActiveStation,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    isDragging: () => Boolean(activeDragState),
    update,
    dispose
  };
}

export default createStation3DDirector;
