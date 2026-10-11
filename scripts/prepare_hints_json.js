import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curPath = path.resolve(__dirname, '../src/data/curriculum.json');
const cur = JSON.parse(fs.readFileSync(curPath, 'utf-8'));

function cleanForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/["'\u05F4\u05F3`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const items = [];
Object.keys(cur.labs).forEach(labId => {
  const lab = cur.labs[labId];
  (lab.challenges || []).forEach((ch, idx) => {
    const hint = ch.hint || ch.description || '';
    const inst = ch.instructions || ch.description || '';
    const raw = `רמז לאתגר ${ch.title}: ${hint} ההנחיה היא: ${inst}`;
    items.push({
      id: `${labId}_ch${idx + 1}`,
      text: cleanForSpeech(raw)
    });
  });
});

const outPath = path.resolve(__dirname, 'hint_items.json');
fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf-8');
console.log(`Generated ${items.length} items in ${outPath}`);
items.forEach(it => {
  console.log(`- ${it.id}: ${it.text.slice(0, 50)}...`);
});
