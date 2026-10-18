import * as THREE from 'three';

/**
 * Lightweight Static Texture & RTL Hebrew 3D Typography Engine for ZenLab 3D (Nintendo 2.5D Edition)
 *
 * CRITICAL PERFORMANCE INVARIANTS:
 * 1. ZERO per-frame or pointer-move CanvasTexture allocations or redraws.
 * 2. All 3D label textures are cached by key in `staticLabelTextureCache` with explicit `disposeStaticTextures()` cleanup.
 * 3. Exposes `window.__ZEN_CANVAS_ALLOCATIONS__` counter for automated verification that zero textures are allocated during gameplay/mouse movement.
 */

let cachedLabPanelTextures = null;
let cachedFruitTextures = null;
let cachedBlueprintTileTextures = null;
const staticLabelTextureCache = new Map();

if (typeof window !== 'undefined' && window.__ZEN_CANVAS_ALLOCATIONS__ === undefined) {
  window.__ZEN_CANVAS_ALLOCATIONS__ = 0;
}

function recordCanvasAllocation() {
  if (typeof window !== 'undefined') {
    window.__ZEN_CANVAS_ALLOCATIONS__ = (window.__ZEN_CANVAS_ALLOCATIONS__ || 0) + 1;
  }
}

function createCanvas(width, height) {
  if (typeof document === 'undefined') {
    return null;
  }
  recordCanvasAllocation();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 1. Lightweight Tactile Toy-Board Surface Textures
 * Cached once at initialization.
 */
export function getLabPanelPBRTextures() {
  if (cachedLabPanelTextures) {
    return cachedLabPanelTextures;
  }

  const size = 256;
  const normalCanvas = createCanvas(size, size);
  const roughCanvas = createCanvas(size, size);

  if (!normalCanvas) {
    const dummy = new THREE.Texture();
    return {
      normalMap: dummy,
      roughnessMap: dummy,
      metalnessMap: dummy,
      emissiveMap: dummy
    };
  }

  const nCtx = normalCanvas.getContext('2d');
  nCtx.fillStyle = 'rgb(128, 128, 255)';
  nCtx.fillRect(0, 0, size, size);

  // Subtle toy-block bevel border
  nCtx.strokeStyle = 'rgb(142, 142, 255)';
  nCtx.lineWidth = 4;
  nCtx.strokeRect(6, 6, size - 12, size - 12);

  const rCtx = roughCanvas.getContext('2d');
  rCtx.fillStyle = '#64748b';
  rCtx.fillRect(0, 0, size, size);

  const makeTex = (canvas, isSRGB = false) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  const normalMap = makeTex(normalCanvas, false);
  const roughnessMap = makeTex(roughCanvas, false);

  cachedLabPanelTextures = {
    normalMap,
    roughnessMap,
    metalnessMap: roughnessMap,
    emissiveMap: roughnessMap
  };

  return cachedLabPanelTextures;
}

/**
 * 2. Organic Fruit Toy Textures (Station 5 k-NN Classifier & Overworld)
 * Cached once at initialization.
 */
export function getFruitPBRTextures() {
  if (cachedFruitTextures) {
    return cachedFruitTextures;
  }

  const size = 256;
  const appleCanvas = createCanvas(size, size);
  const melonCanvas = createCanvas(size, size);

  if (!appleCanvas) {
    const dummy = new THREE.Texture();
    return {
      appleTexture: dummy,
      appleNormalMap: null,
      melonTexture: dummy,
      melonNormalMap: null
    };
  }

  // Bright Nintendo Toy Apple Albedo
  const aCtx = appleCanvas.getContext('2d');
  const appleGrad = aCtx.createLinearGradient(0, 0, 0, size);
  appleGrad.addColorStop(0, '#ef4444');
  appleGrad.addColorStop(0.5, '#f43f5e');
  appleGrad.addColorStop(1, '#be123c');
  aCtx.fillStyle = appleGrad;
  aCtx.fillRect(0, 0, size, size);

  // Cheerful golden speckles
  aCtx.fillStyle = 'rgba(254, 240, 138, 0.55)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 97.3) % size;
    const sy = ((i * 151.7) % (size - 24)) + 12;
    aCtx.beginPath();
    aCtx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    aCtx.fill();
  }

  // Bright Nintendo Toy Watermelon Albedo (Rich emerald + lime stripes)
  const mCtx = melonCanvas.getContext('2d');
  mCtx.fillStyle = '#16a34a';
  mCtx.fillRect(0, 0, size, size);

  const stripeCount = 8;
  const stripeSpacing = size / stripeCount;
  for (let s = 0; s < stripeCount; s++) {
    const centerX = s * stripeSpacing + stripeSpacing * 0.5;
    mCtx.fillStyle = '#86efac';
    mCtx.beginPath();
    for (let y = 0; y <= size; y += 8) {
      const wave = Math.sin(y * 0.1 + s) * 4;
      const xLeft = centerX + wave - 7;
      if (y === 0) mCtx.moveTo(xLeft, y);
      else mCtx.lineTo(xLeft, y);
    }
    for (let y = size; y >= 0; y -= 8) {
      const wave = Math.sin(y * 0.1 + s) * 4;
      const xRight = centerX + wave + 7;
      mCtx.lineTo(xRight, y);
    }
    mCtx.closePath();
    mCtx.fill();
  }

  const makeTex = (canvas) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedFruitTextures = {
    appleTexture: makeTex(appleCanvas),
    appleNormalMap: null,
    melonTexture: makeTex(melonCanvas),
    melonNormalMap: null
  };

  return cachedFruitTextures;
}

/**
 * 3. Pre-baked Tile Face Blueprint Decal Textures for Station 1 (Heart / Smiley target faces)
 * Rendered directly ON the top face of target tiles (zero floating wireframes!).
 */
export function getBlueprintTileFaceTextures() {
  if (cachedBlueprintTileTextures) {
    return cachedBlueprintTileTextures;
  }

  const size = 128;
  const heartCanvas = createCanvas(size, size);
  const smileyCanvas = createCanvas(size, size);

  if (!heartCanvas) {
    const dummy = new THREE.Texture();
    return { heartFaceTex: dummy, smileyFaceTex: dummy };
  }

  const drawTargetFace = (ctx, ringColor, symbol) => {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);

    // Crisp dashed target inlay border on the tile face
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 8;
    ctx.setLineDash([14, 8]);
    ctx.strokeRect(12, 12, size - 24, size - 24);
    ctx.setLineDash([]);

    // Center dot/icon on the tile face
    ctx.font = '700 42px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = ringColor;
    ctx.fillText(symbol, size / 2, size / 2 + 2);
  };

  drawTargetFace(heartCanvas.getContext('2d'), '#fb7185', '♥');
  drawTargetFace(smileyCanvas.getContext('2d'), '#38bdf8', '★');

  const makeFaceTex = (canvas) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedBlueprintTileTextures = {
    heartFaceTex: makeFaceTex(heartCanvas),
    smileyFaceTex: makeFaceTex(smileyCanvas)
  };

  return cachedBlueprintTileTextures;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function renderHebrewLabelCanvas(canvas, text, subtext, accentColor, bgColor) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.direction = 'rtl';

  const pad = 10;
  const rx = pad;
  const ry = pad;
  const rw = w - pad * 2;
  const rh = h - pad * 2;
  const radius = 24;

  // High-contrast Nintendo Toy Badge Pill Background
  ctx.save();
  drawRoundedRect(ctx, rx, ry, rw, rh, radius);
  ctx.fillStyle = bgColor || 'rgba(15, 23, 42, 0.94)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = accentColor || '#fbbf24';
  ctx.stroke();
  ctx.restore();

  // Crisp RTL Hebrew Typography
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const hasSubtext = Boolean(subtext && String(subtext).trim().length > 0);
  const mainY = hasSubtext ? h * 0.40 : h * 0.52;

  const mainStr = String(text ?? '');
  const baseMainSize = hasSubtext ? 34 : 42;
  const fontSize =
    mainStr.length > 24 ? Math.max(22, Math.floor(baseMainSize * (22 / mainStr.length))) : baseMainSize;

  ctx.font = `800 ${fontSize}px Heebo, Rubik, system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(mainStr, w / 2, mainY, rw - 24);

  if (hasSubtext) {
    const subStr = String(subtext);
    const subSize = subStr.length > 32 ? 20 : 24;
    ctx.font = `700 ${subSize}px Heebo, Rubik, monospace, system-ui, sans-serif`;
    ctx.fillStyle = accentColor || '#fbbf24';
    ctx.fillText(subStr, w / 2, h * 0.73, rw - 24);
  }

  ctx.restore();
}

/**
 * 4. Create Static Cached 3D RTL Hebrew Label Sprite
 * Uses `staticLabelTextureCache` so identical labels never allocate duplicate GPU textures.
 */
export function createHebrewLabelSprite(
  text = '',
  {
    subtext = '',
    accentColor = '#fbbf24',
    bgColor = 'rgba(15, 23, 42, 0.94)',
    scale = [2.2, 0.68],
    depthTest = false
  } = {}
) {
  const cacheKey = `${text}||${subtext}||${accentColor}||${bgColor}`;
  let texture = staticLabelTextureCache.get(cacheKey);

  if (!texture) {
    const width = 512;
    const height = 160;
    const canvas = createCanvas(width, height);
    if (canvas) {
      canvas.dir = 'rtl';
      renderHebrewLabelCanvas(canvas, text, subtext, accentColor, bgColor);
    }
    texture = canvas ? new THREE.CanvasTexture(canvas) : new THREE.Texture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    staticLabelTextureCache.set(cacheKey, texture);
  }

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: Boolean(depthTest)
  });

  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 20;

  const sx = Array.isArray(scale) ? (scale[0] ?? 2.2) : typeof scale === 'number' ? scale : 2.2;
  const sy = Array.isArray(scale) ? (scale[1] ?? 0.68) : typeof scale === 'number' ? scale * 0.32 : 0.68;
  sprite.scale.set(sx, sy, 1);

  const labelMeta = {
    isHebrewLabel: true,
    texture,
    text: String(text ?? ''),
    subtext: String(subtext ?? ''),
    accentColor,
    bgColor,
    baseScale: [sx, sy]
  };

  sprite._hebrewLabelMeta = labelMeta;
  sprite.userData = { ...labelMeta };

  return sprite;
}

/**
 * 5. NO-OP / Cached-Only Label Updater
 * Prevents ANY runtime or per-frame CanvasTexture allocation or GPU upload during mouse movement or animation.
 * If a pre-cached static texture exists for the requested state, swaps the material map reference; otherwise no-ops.
 */
export function updateHebrewLabelSprite(sprite, text, subtext = '', accentColor = null) {
  if (!sprite) return sprite;
  const meta = sprite._hebrewLabelMeta || sprite.userData;
  if (!meta) return sprite;

  const resolvedSubtext =
    subtext && typeof subtext === 'object'
      ? subtext.subtext ?? meta.subtext ?? ''
      : subtext !== undefined
      ? String(subtext)
      : meta.subtext;
  const resolvedAccent =
    subtext && typeof subtext === 'object'
      ? subtext.accentColor ?? meta.accentColor ?? '#fbbf24'
      : accentColor || meta.accentColor || '#fbbf24';
  const resolvedBg =
    subtext && typeof subtext === 'object'
      ? subtext.bgColor ?? meta.bgColor
      : meta.bgColor;

  const nextText = String(text ?? '');
  if (
    meta.text === nextText &&
    meta.subtext === resolvedSubtext &&
    meta.accentColor === resolvedAccent
  ) {
    return sprite;
  }

  const cacheKey = `${nextText}||${resolvedSubtext}||${resolvedAccent}||${resolvedBg}`;
  const existingTex = staticLabelTextureCache.get(cacheKey);
  if (existingTex && sprite.material) {
    sprite.material.map = existingTex;
    meta.text = nextText;
    meta.subtext = resolvedSubtext;
    meta.accentColor = resolvedAccent;
  }
  return sprite;
}

/**
 * 6. Explicit GPU Texture Cache Disposal
 */
export function disposeStaticTextures() {
  staticLabelTextureCache.forEach((tex) => {
    tex.dispose?.();
  });
  staticLabelTextureCache.clear();
}
