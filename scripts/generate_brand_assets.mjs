/**
 * Brand Visual Asset Generator for ZenLab (Daylight v3.1+)
 *
 * Generates crisp RTL Daylight social OpenGraph banner (`og-image.png` 1200x630),
 * desktop/mobile PWA icons (`icon-512.png`, `icon-192.png`, `apple-touch-icon.png`),
 * separate safe-zone `icon-maskable-512.png`, and multi-size `favicon.ico` using
 * headless Google Chrome + ImageMagick. Zero external cloud calls or hardcoded paths.
 *
 * Usage: node scripts/generate_brand_assets.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const CHROME_BIN =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAGICK_BIN = process.env.MAGICK_BIN || '/opt/homebrew/bin/magick';

function loadMascotDataUrl() {
  const mascotPath = path.join(PUBLIC_DIR, 'illustrations', 'zen_wave.png');
  const base64 = fs.readFileSync(mascotPath).toString('base64');
  return `data:image/png;base64,${base64}`;
}

function buildOgHtml(mascotDataUrl) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@500;600;700;800&family=Rubik:wght@700;800;900&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 1200px;
      height: 630px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #F7F7F5;
      font-family: 'Heebo', system-ui, -apple-system, sans-serif;
      color: #3C3C3C;
    }
    .canvas {
      width: 1200px;
      height: 630px;
      padding: 48px;
      background:
        radial-gradient(circle at 12% 18%, #DDF4FF 0%, transparent 32%),
        radial-gradient(circle at 88% 85%, #FFF6D6 0%, transparent 36%),
        #F7F7F5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      width: 1104px;
      height: 534px;
      padding: 42px 50px;
      background: #FFFFFF;
      border: 3px solid #E5E5E5;
      border-radius: 36px;
      box-shadow: 0 8px 0 #E5E5E5;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
    }
    .text-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: nowrap;
    }
    .wordmark {
      font-family: 'Rubik', 'Heebo', sans-serif;
      font-weight: 900;
      font-size: 46px;
      line-height: 1;
      color: #58CC02;
      letter-spacing: -0.02em;
    }
    .tag-pill {
      padding: 8px 18px;
      border-radius: 999px;
      background: #DDF4FF;
      border: 2px solid #84D8FF;
      color: #1899D6;
      font-weight: 800;
      font-size: 16px;
      white-space: nowrap;
    }
    h1 {
      margin: 0;
      font-family: 'Rubik', 'Heebo', sans-serif;
      font-weight: 800;
      font-size: 42px;
      line-height: 1.18;
      color: #3C3C3C;
    }
    .subtitle {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.45;
      color: #4B4B4B;
    }
    .units-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 6px;
    }
    .unit-pill {
      padding: 13px 18px;
      border-radius: 16px;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap;
    }
    .u1 { background: #58CC02; box-shadow: 0 4px 0 #58A700; }
    .u2 { background: #1CB0F6; box-shadow: 0 4px 0 #1899D6; }
    .u3 { background: #FF9600; box-shadow: 0 4px 0 #E08200; }
    .u4 { background: #CE82FF; box-shadow: 0 4px 0 #A560E8; }

    .hero-col {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .speech-bubble {
      position: relative;
      padding: 10px 22px;
      background: #FFFFFF;
      border: 2px solid #E5E5E5;
      border-radius: 18px;
      color: #3C3C3C;
      font-weight: 800;
      font-size: 18px;
      white-space: nowrap;
    }
    .speech-bubble::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -8px;
      width: 12px;
      height: 12px;
      background: #FFFFFF;
      border-right: 2px solid #E5E5E5;
      border-bottom: 2px solid #E5E5E5;
      transform: translateX(-50%) rotate(45deg);
    }
    .mascot-stage {
      width: 240px;
      height: 240px;
      border-radius: 32px;
      background: #FFFDF2;
      border: 3px solid #FFC800;
      box-shadow: 0 6px 0 #E5A800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mascot-stage img {
      width: 205px;
      height: 205px;
      object-fit: contain;
    }
    .stars-badge {
      padding: 9px 18px;
      border-radius: 14px;
      background: #FFF6D6;
      border: 2px solid #FFC800;
      color: #B47800;
      font-weight: 800;
      font-size: 15px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="card">
      <div class="text-col">
        <div class="brand-row">
          <span class="wordmark">ZenLab</span>
          <span class="tag-pill">חינם ובקוד פתוח • גילאי 9–12</span>
        </div>
        <h1>מעבדת מדעי המחשב והבינה המלאכותית לילדים</h1>
        <p class="subtitle">
          8 תחנות משחק אינטראקטיביות בעברית עם הקראה קולית טבעית — מפיקסלים ורובוטים ועד רשתות נוירונים ומודלי שפה.
        </p>
        <div class="units-grid">
          <div class="unit-pill u1">1. פיקסלים ורובוטים</div>
          <div class="unit-pill u2">2. עצי החלטה וניווט חכם</div>
          <div class="unit-pill u3">3. למידת מכונה וראייה</div>
          <div class="unit-pill u4">4. נוירונים ומודלי שפה</div>
        </div>
      </div>

      <div class="hero-col">
        <div class="speech-bubble">שלום! אני זֶן</div>
        <div class="mascot-stage">
          <img src="${mascotDataUrl}" alt="זֶן" />
        </div>
        <div class="stars-badge">★ 24 כוכבי אתגר • ללא הרשמה</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildIconHtml(mascotDataUrl, { maskable = false } = {}) {
  if (maskable) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 512px;
      height: 512px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #FFFDF2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .safe-stage {
      width: 512px;
      height: 512px;
      background: radial-gradient(circle at 50% 45%, #FFFDF2 0%, #FFF6D6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      width: 340px;
      height: 340px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="safe-stage">
    <img src="${mascotDataUrl}" alt="ZenLab Maskable Icon" />
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 512px;
      height: 512px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #FFFDF2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-frame {
      width: 512px;
      height: 512px;
      padding: 18px;
      background: #FFC800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-inner {
      width: 476px;
      height: 476px;
      border-radius: 92px;
      background: #FFFDF2;
      border: 8px solid #E5A800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      width: 416px;
      height: 416px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="icon-frame">
    <div class="icon-inner">
      <img src="${mascotDataUrl}" alt="ZenLab Icon" />
    </div>
  </div>
</body>
</html>`;
}

async function renderHtmlToPng({ html, width, height, scaleFactor = 2, outRawPng, tmpDir, name }) {
  const htmlPath = path.join(tmpDir, `${name}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  const url = pathToFileURL(htmlPath).href;

  const userDataDir = path.join(tmpDir, `profile_${name}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  await execFileAsync(CHROME_BIN, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    `--force-device-scale-factor=${scaleFactor}`,
    '--virtual-time-budget=4500',
    `--screenshot=${outRawPng}`,
    url
  ]);
}

async function main() {
  if (!fs.existsSync(CHROME_BIN)) {
    throw new Error(`Google Chrome not found at ${CHROME_BIN}`);
  }
  if (!fs.existsSync(MAGICK_BIN)) {
    throw new Error(`ImageMagick not found at ${MAGICK_BIN}`);
  }

  const mascotDataUrl = loadMascotDataUrl();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zenlab-brand-'));

  try {
    // 1. Render OpenGraph 1200x630 banner (rendered 2x -> 2400x1260 then cropped/downsampled cleanly)
    const rawOg = path.join(tmpDir, 'og_raw.png');
    await renderHtmlToPng({
      html: buildOgHtml(mascotDataUrl),
      width: 1200,
      height: 630,
      scaleFactor: 2,
      outRawPng: rawOg,
      tmpDir,
      name: 'og'
    });

    const ogDest = path.join(PUBLIC_DIR, 'og-image.png');
    await execFileAsync(MAGICK_BIN, [
      rawOg,
      '-gravity',
      'NorthWest',
      '-crop',
      '2400x1260+0+0',
      '+repage',
      '-resize',
      '1200x630!',
      '-strip',
      '-define',
      'png:compression-level=9',
      ogDest
    ]);

    if (fs.statSync(ogDest).size >= 280000) {
      await execFileAsync(MAGICK_BIN, [
        ogDest,
        '-colors',
        '256',
        '-strip',
        '-define',
        'png:compression-level=9',
        ogDest
      ]);
    }

    // 2. Render standard icon (512x512, 192x192, 180x180, multi-size .ico)
    const rawIcon = path.join(tmpDir, 'icon_raw.png');
    await renderHtmlToPng({
      html: buildIconHtml(mascotDataUrl, { maskable: false }),
      width: 512,
      height: 512,
      scaleFactor: 2,
      outRawPng: rawIcon,
      tmpDir,
      name: 'icon'
    });

    const icon512 = path.join(PUBLIC_DIR, 'icon-512.png');
    const icon192 = path.join(PUBLIC_DIR, 'icon-192.png');
    const apple180 = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
    const faviconIco = path.join(PUBLIC_DIR, 'favicon.ico');

    await execFileAsync(MAGICK_BIN, [
      rawIcon,
      '-gravity',
      'NorthWest',
      '-crop',
      '1024x1024+0+0',
      '+repage',
      '-resize',
      '512x512!',
      '-strip',
      icon512
    ]);
    await execFileAsync(MAGICK_BIN, [icon512, '-resize', '192x192!', '-strip', icon192]);
    await execFileAsync(MAGICK_BIN, [icon512, '-resize', '180x180!', '-strip', apple180]);
    await execFileAsync(MAGICK_BIN, [
      icon512,
      '-define',
      'icon:auto-resize=48,32,16',
      faviconIco
    ]);

    // 3. Render dedicated maskable icon (512x512 with generous safe padding)
    const rawMaskable = path.join(tmpDir, 'maskable_raw.png');
    await renderHtmlToPng({
      html: buildIconHtml(mascotDataUrl, { maskable: true }),
      width: 512,
      height: 512,
      scaleFactor: 2,
      outRawPng: rawMaskable,
      tmpDir,
      name: 'maskable'
    });

    const iconMaskable = path.join(PUBLIC_DIR, 'icon-maskable-512.png');
    await execFileAsync(MAGICK_BIN, [
      rawMaskable,
      '-gravity',
      'NorthWest',
      '-crop',
      '1024x1024+0+0',
      '+repage',
      '-resize',
      '512x512!',
      '-strip',
      iconMaskable
    ]);

    for (const f of [
      'og-image.png',
      'icon-512.png',
      'icon-maskable-512.png',
      'icon-192.png',
      'apple-touch-icon.png',
      'favicon.ico'
    ]) {
      const sz = (fs.statSync(path.join(PUBLIC_DIR, f)).size / 1024).toFixed(1);
      console.log(`Generated public/${f} (${sz} KB)`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('Brand asset generation error:', err?.message || err);
  process.exit(1);
});
