import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, '..');
const tutorDir = path.join(baseDir, 'public/audio/tutor');
const hintsDir = path.join(baseDir, 'public/audio/hints');

const tutorItems = JSON.parse(fs.readFileSync(path.join(__dirname, 'tutor_items.json'), 'utf-8'));
const hintItems = JSON.parse(fs.readFileSync(path.join(__dirname, 'hint_items.json'), 'utf-8'));

let errors = 0;

console.log('--- 1. Auditing 46 Tutor Audio Files ---');
tutorItems.forEach((item, idx) => {
  const filePath = path.join(tutorDir, `${item.id}.mp3`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing tutor audio: ${item.id}.mp3`);
    errors++;
  } else {
    const sz = fs.statSync(filePath).size;
    if (sz < 5000) {
      console.error(`⚠️ Tutor audio too small (${sz} bytes): ${item.id}.mp3`);
      errors++;
    }
  }
});
console.log(`Audited ${tutorItems.length} tutor audio files. Errors so far: ${errors}`);

console.log('\n--- 2. Auditing 24 Challenge Hint Audio Files ---');
hintItems.forEach((item, idx) => {
  const filePath = path.join(hintsDir, `${item.id}.mp3`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing hint audio: ${item.id}.mp3`);
    errors++;
  } else {
    const sz = fs.statSync(filePath).size;
    if (sz < 5000) {
      console.error(`⚠️ Hint audio too small (${sz} bytes): ${item.id}.mp3`);
      errors++;
    }
  }
});
console.log(`Audited ${hintItems.length} hint audio files. Total errors: ${errors}`);

if (errors === 0) {
  console.log('\n🎉 ALL 70 AUDIO FILES VERIFIED WITH 100% HEALTH!');
  process.exit(0);
} else {
  console.error(`\n💥 FAILED with ${errors} issues.`);
  process.exit(1);
}
