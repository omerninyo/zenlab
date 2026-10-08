import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const VIDEOS_SRC = path.join(ROOT, 'media_source/videos');
const PODCASTS_SRC = path.join(ROOT, 'media_source/podcasts');
const VIDEOS_OUT = path.join(ROOT, 'public/videos');
const PODCASTS_OUT = path.join(ROOT, 'public/audio/explainers');

fs.mkdirSync(VIDEOS_OUT, { recursive: true });
fs.mkdirSync(PODCASTS_OUT, { recursive: true });

const VIDEO_MAP = [
  { in: '01_סוד_המסך__מציירים_במספרים.mp4', out: 'lab1.mp4' },
  { in: '02_מתכנתים_את_הרובוט_זן.mp4', out: 'lab2.mp4' },
  { in: '03_תעלומת_עץ_ההחלטות.mp4', out: 'lab3.mp4' },
  { in: '04_אלגוריתם_הניווט_איי-סטאר.mp4', out: 'lab4.mp4' },
  { in: '05_למידת_מכונה__איך_מחשבים_לומדים.mp4', out: 'lab5.mp4' },
  { in: '06_תעלומת_הראייה_הממוחשבת.mp4', out: 'lab6.mp4' },
  { in: '07_הנוירון_החכם.mp4', out: 'lab7.mp4' },
  { in: '08_הקסם_מאחורי_המסך.mp4', out: 'lab8.mp4' },
];

const PODCAST_MAP = [
  { in: '01_איך_המחשב_הופך_מספרים_לצבעים_במסך.m4a', out: 'lab1_podcast.m4a' },
  { in: '02_איך_אלגוריתם_מונע_מרובוט_להיתקע_בקיר.m4a', out: 'lab2_podcast.m4a' },
  { in: '03_עצי_החלטות_במשחק_עשרים_מי_יודע.m4a', out: 'lab3_podcast.m4a' },
  { in: '04_איך_אלגוריתם_A__מחשב_מסלול_בשבריר_שנייה.m4a', out: 'lab4_podcast.m4a' },
  { in: '05_איך_מחשב_לומד_מפיקסלים_ומהי_הטיה.m4a', out: 'lab5_podcast.m4a' },
  { in: '06_איך_ראייה_ממוחשבת_מזהה_קצוות.m4a', out: 'lab6_podcast.m4a' },
  { in: '07_איך_הנוירון_החכם_מקבל_החלטות.m4a', out: 'lab7_podcast.m4a' },
  { in: '08_איך_בינה_מלאכותית_מנחשת_את_המילה_הבאה.m4a', out: 'lab8_podcast.m4a' },
];

console.log('🚀 Starting Media Optimization (Videos & Podcasts)...\n');

// 1. Optimize Podcasts
console.log('🎙️ Optimizing Podcasts (Voice AAC mono 40k)...');
for (const item of PODCAST_MAP) {
  const inPath = path.join(PODCASTS_SRC, item.in);
  const outPath = path.join(PODCASTS_OUT, item.out);
  
  if (!fs.existsSync(inPath)) {
    console.warn(`  ⚠️ Input not found: ${item.in}`);
    continue;
  }
  
  const inSize = (fs.statSync(inPath).size / (1024 * 1024)).toFixed(1);
  const cmd = `ffmpeg -y -i "${inPath}" -c:a aac -b:a 40k -ac 1 "${outPath}" -loglevel error`;
  execSync(cmd);
  const outSize = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
  console.log(`  ✓ ${item.out}: ${inSize} MB -> ${outSize} MB`);
}

// 2. Optimize Videos
console.log('\n🎬 Optimizing Videos (720p HD, CRF 26, AAC 64k mono, faststart)...');
for (const item of VIDEO_MAP) {
  const inPath = path.join(VIDEOS_SRC, item.in);
  const outPath = path.join(VIDEOS_OUT, item.out);
  
  if (!fs.existsSync(inPath)) {
    console.warn(`  ⚠️ Input not found: ${item.in}`);
    continue;
  }
  
  const inSize = (fs.statSync(inPath).size / (1024 * 1024)).toFixed(1);
  const cmd = `ffmpeg -y -i "${inPath}" -c:v libx264 -crf 26 -preset faster -c:a aac -b:a 64k -ac 1 -movflags +faststart "${outPath}" -loglevel error`;
  execSync(cmd);
  const outSize = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
  console.log(`  ✓ ${item.out}: ${inSize} MB -> ${outSize} MB`);
}

console.log('\n✨ Media optimization complete!');
