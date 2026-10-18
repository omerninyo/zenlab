import * as THREE from 'three';

/**
 * Procedural PBR Texture & RTL Hebrew 3D Typography Engine for ZenLab 3D
 * Generates high-DPI CanvasTextures for modular sci-fi architecture,
 * organic fruit specimens (Station 5 k-NN), and crisp RTL Hebrew HUD sprites.
 */

let cachedLabPanelTextures = null;
let cachedFruitTextures = null;

function createCanvas(width, height) {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 1. Modular Sci-Fi Lab Panel PBR Textures
 * Returns `{ normalMap, roughnessMap, metalnessMap, emissiveMap }`
 * featuring beveled panel seams, micro-grid normal bump, and metallic trim.
 */
export function getLabPanelPBRTextures() {
  if (cachedLabPanelTextures) {
    return cachedLabPanelTextures;
  }

  const size = 512;
  const normalCanvas = createCanvas(size, size);
  const roughCanvas = createCanvas(size, size);
  const metalCanvas = createCanvas(size, size);
  const emissiveCanvas = createCanvas(size, size);

  if (!normalCanvas) {
    const dummy = new THREE.Texture();
    return {
      normalMap: dummy,
      roughnessMap: dummy,
      metalnessMap: dummy,
      emissiveMap: dummy
    };
  }

  // --- Normal Map (RGB tangent space: flat = 128, 128, 255) ---
  const nCtx = normalCanvas.getContext('2d');
  nCtx.fillStyle = 'rgb(128, 128, 255)';
  nCtx.fillRect(0, 0, size, size);

  // Micro-grid normal grooves every 32px
  nCtx.lineWidth = 2;
  for (let i = 0; i <= size; i += 32) {
    nCtx.strokeStyle = 'rgb(112, 112, 255)';
    nCtx.beginPath();
    nCtx.moveTo(i, 0);
    nCtx.lineTo(i, size);
    nCtx.stroke();

    nCtx.strokeStyle = 'rgb(144, 144, 255)';
    nCtx.beginPath();
    nCtx.moveTo(0, i);
    nCtx.lineTo(size, i);
    nCtx.stroke();
  }

  // Beveled outer & inner modular panel seams
  const drawBevelRect = (ctx, x, y, w, h, bevel = 6) => {
    // Top edge (tilted up: Y+)
    ctx.fillStyle = 'rgb(128, 185, 255)';
    ctx.fillRect(x, y, w, bevel);
    // Bottom edge (tilted down: Y-)
    ctx.fillStyle = 'rgb(128, 72, 255)';
    ctx.fillRect(x, y + h - bevel, w, bevel);
    // Left edge (tilted left: X-)
    ctx.fillStyle = 'rgb(72, 128, 255)';
    ctx.fillRect(x, y, bevel, h);
    // Right edge (tilted right: X+)
    ctx.fillStyle = 'rgb(185, 128, 255)';
    ctx.fillRect(x + w - bevel, y, bevel, h);
  };

  drawBevelRect(nCtx, 8, 8, size - 16, size - 16, 8);
  drawBevelRect(nCtx, 64, 64, size - 128, size - 128, 5);
  drawBevelRect(nCtx, 160, 160, size - 320, size - 320, 4);

  // Corner bolts normal detail
  const boltOffsets = [
    [32, 32],
    [size - 32, 32],
    [32, size - 32],
    [size - 32, size - 32]
  ];
  boltOffsets.forEach(([bx, by]) => {
    nCtx.fillStyle = 'rgb(100, 100, 255)';
    nCtx.beginPath();
    nCtx.arc(bx, by, 7, 0, Math.PI * 2);
    nCtx.fill();
  });

  // --- Roughness Map (Grayscale: darker = glossier, lighter = rougher) ---
  const rCtx = roughCanvas.getContext('2d');
  rCtx.fillStyle = '#52525b'; // Base satin roughness (~0.32)
  rCtx.fillRect(0, 0, size, size);

  // Polished inner bezel
  rCtx.strokeStyle = '#27272a';
  rCtx.lineWidth = 14;
  rCtx.strokeRect(64, 64, size - 128, size - 128);

  // Matte panel recessed grooves
  rCtx.strokeStyle = '#a1a1aa';
  rCtx.lineWidth = 4;
  rCtx.strokeRect(10, 10, size - 20, size - 20);

  // Subtle brushed metal micro-lines
  rCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < size; y += 4) {
    rCtx.fillRect(0, y, size, 1);
  }

  // --- Metalness Map (Grayscale: white = pure metal, black = dielectric) ---
  const mCtx = metalCanvas.getContext('2d');
  mCtx.fillStyle = '#d4d4d8'; // High metallic titanium base (~0.83)
  mCtx.fillRect(0, 0, size, size);

  // Dielectric dark seams
  mCtx.strokeStyle = '#27272a';
  mCtx.lineWidth = 6;
  mCtx.strokeRect(8, 8, size - 16, size - 16);
  mCtx.strokeRect(64, 64, size - 128, size - 128);

  // Pure chrome trim frame
  mCtx.strokeStyle = '#ffffff';
  mCtx.lineWidth = 8;
  mCtx.strokeRect(156, 156, size - 312, size - 312);

  // --- Emissive Map (Subtle glowing circuit conduits & corner telemetry LEDs) ---
  const eCtx = emissiveCanvas.getContext('2d');
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  eCtx.strokeStyle = '#0ea5e9';
  eCtx.lineWidth = 3;
  eCtx.strokeRect(68, 68, size - 136, size - 136);

  // Glowing corner status pips
  eCtx.fillStyle = '#38bdf8';
  boltOffsets.forEach(([bx, by]) => {
    eCtx.beginPath();
    eCtx.arc(bx, by, 4, 0, Math.PI * 2);
    eCtx.fill();
  });

  const makeTex = (canvas, isSRGB = false) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedLabPanelTextures = {
    normalMap: makeTex(normalCanvas, false),
    roughnessMap: makeTex(roughCanvas, false),
    metalnessMap: makeTex(metalCanvas, false),
    emissiveMap: makeTex(emissiveCanvas, true)
  };

  return cachedLabPanelTextures;
}

/**
 * 2. Organic Fruit PBR Textures (Station 5 k-NN Classifier & Overworld Hologram)
 * Returns `{ appleTexture, appleNormalMap, melonTexture, melonNormalMap }`
 */
export function getFruitPBRTextures() {
  if (cachedFruitTextures) {
    return cachedFruitTextures;
  }

  const size = 512;
  const appleCanvas = createCanvas(size, size);
  const appleNormCanvas = createCanvas(size, size);
  const melonCanvas = createCanvas(size, size);
  const melonNormCanvas = createCanvas(size, size);

  if (!appleCanvas) {
    const dummy = new THREE.Texture();
    return {
      appleTexture: dummy,
      appleNormalMap: dummy,
      melonTexture: dummy,
      melonNormalMap: dummy
    };
  }

  // --- Apple Albedo (Glossy crimson-red with warm golden-amber speckles & vertical striations) ---
  const aCtx = appleCanvas.getContext('2d');
  const appleGrad = aCtx.createLinearGradient(0, 0, 0, size);
  appleGrad.addColorStop(0, '#991b1b');
  appleGrad.addColorStop(0.25, '#dc2626');
  appleGrad.addColorStop(0.65, '#ef4444');
  appleGrad.addColorStop(1, '#7f1d1d');
  aCtx.fillStyle = appleGrad;
  aCtx.fillRect(0, 0, size, size);

  // Soft vertical organic brush streaks
  for (let x = 0; x < size; x += 6) {
    const alpha = 0.04 + ((x * 17) % 10) * 0.008;
    aCtx.fillStyle = x % 12 === 0 ? `rgba(254, 202, 202, ${alpha})` : `rgba(127, 29, 29, ${alpha})`;
    aCtx.fillRect(x, 0, 4, size);
  }

  // Deterministic golden-yellow lenticel speckles
  for (let i = 0; i < 220; i++) {
    const sx = (i * 137.5) % size;
    const sy = ((i * 293.3) % (size - 40)) + 20;
    const r = 1.0 + (i % 3) * 0.65;
    aCtx.fillStyle = 'rgba(253, 224, 71, 0.45)';
    aCtx.beginPath();
    aCtx.arc(sx, sy, r, 0, Math.PI * 2);
    aCtx.fill();
  }

  // --- Apple Normal Map ---
  const anCtx = appleNormCanvas.getContext('2d');
  anCtx.fillStyle = 'rgb(128, 128, 255)';
  anCtx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 8) {
    anCtx.fillStyle = x % 16 === 0 ? 'rgb(123, 128, 255)' : 'rgb(133, 128, 255)';
    anCtx.fillRect(x, 0, 4, size);
  }

  // --- Watermelon Albedo (Alternating rich emerald & light lime jagged meridian stripes) ---
  const mCtx = melonCanvas.getContext('2d');
  const melonBg = mCtx.createLinearGradient(0, 0, 0, size);
  melonBg.addColorStop(0, '#14532d');
  melonBg.addColorStop(0.5, '#16a34a');
  melonBg.addColorStop(1, '#14532d');
  mCtx.fillStyle = melonBg;
  mCtx.fillRect(0, 0, size, size);

  // Light green rind stripes
  const stripeCount = 10;
  const stripeSpacing = size / stripeCount;
  for (let s = 0; s < stripeCount; s++) {
    const centerX = s * stripeSpacing + stripeSpacing * 0.5;
    mCtx.fillStyle = '#86efac';
    mCtx.beginPath();
    for (let y = 0; y <= size; y += 8) {
      const wave = Math.sin(y * 0.08 + s * 1.3) * 6 + Math.cos(y * 0.22 + s) * 3;
      const halfWidth = 10 + Math.sin(y * 0.05 + s * 2.0) * 3.5;
      const xLeft = centerX + wave - halfWidth;
      if (y === 0) mCtx.moveTo(xLeft, y);
      else mCtx.lineTo(xLeft, y);
    }
    for (let y = size; y >= 0; y -= 8) {
      const wave = Math.sin(y * 0.08 + s * 1.3) * 6 + Math.cos(y * 0.22 + s) * 3;
      const halfWidth = 10 + Math.sin(y * 0.05 + s * 2.0) * 3.5;
      const xRight = centerX + wave + halfWidth;
      mCtx.lineTo(xRight, y);
    }
    mCtx.closePath();
    mCtx.fill();

    // Dark forest-green border mottling along stripes
    mCtx.strokeStyle = '#052e16';
    mCtx.lineWidth = 3;
    mCtx.stroke();
  }

  // --- Watermelon Normal Map ---
  const mnCtx = melonNormCanvas.getContext('2d');
  mnCtx.fillStyle = 'rgb(128, 128, 255)';
  mnCtx.fillRect(0, 0, size, size);
  for (let s = 0; s < stripeCount; s++) {
    const centerX = s * stripeSpacing + stripeSpacing * 0.5;
    mnCtx.fillStyle = 'rgb(118, 128, 255)';
    mnCtx.fillRect(centerX - 12, 0, 12, size);
    mnCtx.fillStyle = 'rgb(138, 128, 255)';
    mnCtx.fillRect(centerX, 0, 12, size);
  }

  const makeTex = (canvas, isSRGB) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  cachedFruitTextures = {
    appleTexture: makeTex(appleCanvas, true),
    appleNormalMap: makeTex(appleNormCanvas, false),
    melonTexture: makeTex(melonCanvas, true),
    melonNormalMap: makeTex(melonNormCanvas, false)
  };

  return cachedFruitTextures;
}

/**
 * Internal helper to draw rounded rectangle on 2D canvas context
 */
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

/**
 * Internal helper to render RTL Hebrew text + subtext onto a label canvas
 */
function renderHebrewLabelCanvas(canvas, text, subtext, accentColor, bgColor) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.direction = 'rtl';

  const pad = 16;
  const rx = pad;
  const ry = pad;
  const rw = w - pad * 2;
  const rh = h - pad * 2;
  const radius = 28;

  // Outer glow & background fill
  ctx.save();
  drawRoundedRect(ctx, rx, ry, rw, rh, radius);
  ctx.fillStyle = bgColor || 'rgba(2, 6, 23, 0.88)';
  ctx.shadowColor = accentColor || '#fbbf24';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.restore();

  // Subtle top glass highlight bar
  ctx.save();
  drawRoundedRect(ctx, rx + 4, ry + 4, rw - 8, rh * 0.42, radius - 4);
  const glassGrad = ctx.createLinearGradient(0, ry, 0, ry + rh * 0.5);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = glassGrad;
  ctx.fill();
  ctx.restore();

  // Glowing sci-fi border
  ctx.save();
  drawRoundedRect(ctx, rx, ry, rw, rh, radius);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = accentColor || '#fbbf24';
  ctx.stroke();

  // Corner tech brackets
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#ffffff';
  const cornerLen = 22;
  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(rx + rw - cornerLen, ry);
  ctx.lineTo(rx + rw - 6, ry);
  ctx.stroke();
  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(rx + 6, ry + rh);
  ctx.lineTo(rx + cornerLen, ry + rh);
  ctx.stroke();
  ctx.restore();

  // Typography rendering (RTL Hebrew)
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const hasSubtext = Boolean(subtext && String(subtext).trim().length > 0);
  const mainY = hasSubtext ? h * 0.40 : h * 0.51;

  // Dynamic font sizing so long strings never clip
  const mainStr = String(text ?? '');
  const baseMainSize = hasSubtext ? 44 : 50;
  const fontSize = mainStr.length > 26 ? Math.max(28, Math.floor(baseMainSize * (24 / mainStr.length))) : baseMainSize;

  ctx.font = `800 ${fontSize}px Heebo, Rubik, system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#f8fafc';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 6;
  ctx.fillText(mainStr, w / 2, mainY, rw - 36);

  if (hasSubtext) {
    const subStr = String(subtext);
    const subSize = subStr.length > 34 ? 24 : 30;
    ctx.font = `700 ${subSize}px Heebo, Rubik, monospace, system-ui, sans-serif`;
    ctx.fillStyle = accentColor || '#fbbf24';
    ctx.shadowBlur = 4;
    ctx.fillText(subStr, w / 2, h * 0.72, rw - 36);
  }

  ctx.restore();
}

/**
 * 3. Create 3D RTL Hebrew Label Sprite
 * Renders razor-sharp RTL Hebrew typography with a glowing sci-fi border onto a high-DPI
 * CanvasTexture and returns a `THREE.Sprite` with `userData` for dynamic updates.
 */
export function createHebrewLabelSprite(
  text = '',
  {
    subtext = '',
    accentColor = '#fbbf24',
    bgColor = 'rgba(2, 6, 23, 0.88)',
    scale = [2.4, 0.75],
    depthTest = false
  } = {}
) {
  const width = 768;
  const height = 240;
  const canvas = createCanvas(width, height);

  if (canvas) {
    canvas.dir = 'rtl';
    renderHebrewLabelCanvas(canvas, text, subtext, accentColor, bgColor);
  }

  const texture = canvas ? new THREE.CanvasTexture(canvas) : new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: Boolean(depthTest)
  });

  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 25;

  const sx = Array.isArray(scale) ? (scale[0] ?? 2.4) : typeof scale === 'number' ? scale : 2.4;
  const sy = Array.isArray(scale) ? (scale[1] ?? 0.75) : typeof scale === 'number' ? scale * 0.32 : 0.75;
  sprite.scale.set(sx, sy, 1);

  const labelMeta = {
    isHebrewLabel: true,
    canvas,
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
 * 4. Dynamically Update Existing Hebrew Label Sprite
 * Efficiently redraws the canvas texture only when text, subtext, or accentColor changes.
 */
export function updateHebrewLabelSprite(sprite, text, subtext = '', accentColor = null) {
  const meta = sprite?._hebrewLabelMeta || sprite?.userData;
  if (!sprite || !meta || !meta.canvas) return sprite;

  // Support calling updateHebrewLabelSprite(sprite, text, { subtext, accentColor, bgColor })
  let resolvedSubtext = subtext;
  let resolvedAccent = accentColor;
  let resolvedBg = meta.bgColor;

  if (subtext && typeof subtext === 'object') {
    resolvedSubtext = subtext.subtext ?? meta.subtext ?? '';
    resolvedAccent = subtext.accentColor ?? meta.accentColor ?? '#fbbf24';
    resolvedBg = subtext.bgColor ?? meta.bgColor;
  } else {
    resolvedSubtext = subtext !== undefined ? String(subtext) : meta.subtext;
    resolvedAccent = accentColor || meta.accentColor || '#fbbf24';
  }

  const nextText = String(text ?? '');
  if (
    meta.text === nextText &&
    meta.subtext === resolvedSubtext &&
    meta.accentColor === resolvedAccent &&
    meta.bgColor === resolvedBg
  ) {
    return sprite;
  }

  meta.text = nextText;
  meta.subtext = resolvedSubtext;
  meta.accentColor = resolvedAccent;
  meta.bgColor = resolvedBg;

  renderHebrewLabelCanvas(
    meta.canvas,
    nextText,
    resolvedSubtext,
    resolvedAccent,
    resolvedBg
  );

  if (meta.texture) {
    meta.texture.needsUpdate = true;
  }

  return sprite;
}
