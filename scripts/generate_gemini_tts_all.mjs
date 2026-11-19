/**
 * Google Gemini 3.8 Natural Hebrew Studio TTS Batch Producer
 *
 * Generates all 136 static pedagogical audio clips as compact, crisp mono MP3s
 * using Google Gemini (`gemini-3.8-flash-tts` -> `Puck`) + ffmpeg normalization.
 *
 * CRITICAL INVARIANT:
 * - Never prepend English style prompts to `contents[0].parts[0].text` because
 *   `gemini-3.8-flash-tts` speaks prefixed English text literally.
 * - Pass strictly pure, phonetically normalized Hebrew text only.
 *
 * Usage: node scripts/generate_gemini_tts_all.mjs [--force]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { registerHooks } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  cleanHebrewForSpeech,
  wrapPcmInWav,
  GEMINI_LIVE_TTS_MODELS,
  synthesizeGeminiLiveWav
} from '../src/core/speechUtils.js';

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) {
      return {
        format: 'module',
        shortCircuit: true,
        source: `export default ${fs.readFileSync(new URL(url), 'utf8')};`
      };
    }
    return nextLoad(url, context);
  }
});

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const VOICE_NAME = 'Puck';
const TTS_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-preview-tts'
];
const exhaustedRestModels = new Set();
const CONCURRENCY = 3;
const MANIFEST_PATH = path.join(__dirname, '.tts_gemini_manifest.json');
const FORCE_ALL = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

function loadApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const devVarsPath = path.join(ROOT, '.dev.vars');
  if (fs.existsSync(devVarsPath)) {
    const raw = fs.readFileSync(devVarsPath, 'utf8');
    const match = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  throw new Error('Missing GEMINI_API_KEY in environment or .dev.vars');
}

function resolveFfmpeg() {
  const candidates = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg'];
  for (const bin of candidates) {
    if (bin === 'ffmpeg' || fs.existsSync(bin)) return bin;
  }
  return 'ffmpeg';
}

function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

function parseWavHeader(bytes) {
  if (
    bytes.byteLength > 44 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46
  ) {
    return bytes;
  }
  return wrapPcmInWav(bytes, 24000, 1, 16);
}

async function synthesizeViaGeminiLive(apiKey, normalizedText) {
  let lastErr = null;
  for (const liveModel of GEMINI_LIVE_TTS_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await synthesizeGeminiLiveWav({
          apiKey,
          text: normalizedText,
          model: liveModel,
          voiceName: VOICE_NAME,
          timeoutMs: 35000
        });
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }
  throw lastErr || new Error('All Gemini Live TTS models failed');
}

async function synthesizeWithCascade(apiKey, normalizedText) {
  let lastErr = null;
  for (const model of TTS_MODELS) {
    if (exhaustedRestModels.has(model)) continue;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: normalizedText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: VOICE_NAME }
                }
              }
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const rawBytes = new Uint8Array(Buffer.from(inlineData.data, 'base64'));
            const mime = String(inlineData.mimeType || '').toLowerCase();
            const rateMatch = mime.match(/rate=(\d+)/);
            const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
            const wavBytes =
              mime.includes('wav')
                ? parseWavHeader(rawBytes)
                : wrapPcmInWav(rawBytes, sampleRate, 1, 16);
            return { wavBytes, model };
          }
          lastErr = new Error(`${model}: empty audio inlineData`);
          break;
        }

        const errText = await res.text().catch(() => '');
        lastErr = new Error(`${model} HTTP ${res.status}: ${errText.slice(0, 160)}`);
        if (
          res.status === 429 &&
          (errText.includes('GenerateRequestsPerDay') || errText.includes('"retryDelay": "7'))
        ) {
          exhaustedRestModels.add(model);
          break;
        }
        if (res.status === 429 || res.status === 503 || res.status === 500) {
          const waitMs = 2000 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        break;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }

  try {
    return await synthesizeViaGeminiLive(apiKey, normalizedText);
  } catch (liveErr) {
    throw liveErr || lastErr || new Error('All Gemini TTS models failed');
  }
}

async function buildAudioItems() {
  const curriculum = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src/data/curriculum.json'), 'utf8')
  );
  const { LAB_METADATA } = await import('../src/core/labMeta.js');
  const { CURATED_TUTOR_KNOWLEDGE } = await import('../src/core/tutorEngine.js');

  const items = [];

  // 1. Overview Narrations (8)
  for (let i = 1; i <= 8; i++) {
    const labId = `lab${i}`;
    const transcript = curriculum.labs?.[labId]?.media?.narration?.transcript;
    if (transcript) {
      items.push({ relPath: `audio/narration/${labId}.mp3`, text: transcript });
    }
  }

  // 2. Challenge Hints (24)
  for (let i = 1; i <= 8; i++) {
    const labId = `lab${i}`;
    const challenges = curriculum.labs?.[labId]?.challenges || [];
    challenges.forEach((ch, idx) => {
      items.push({
        relPath: `audio/hints/${labId}_ch${idx + 1}.mp3`,
        text: ch.hint || ch.description || ch.instructions
      });
    });
  }

  // 3. Tutor Knowledge Welcome & 4 Q&A per view (45)
  for (const key of ['home', 'lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8']) {
    const block = CURATED_TUTOR_KNOWLEDGE[key];
    if (!block) continue;
    items.push({ relPath: `audio/tutor/${key}_welcome.mp3`, text: block.welcome });
    block.prompts.forEach((promptText, qIdx) => {
      const ans = block.answers?.[promptText];
      if (ans) {
        items.push({ relPath: `audio/tutor/${key}_q${qIdx}.mp3`, text: ans });
      }
    });
  }

  // 4. Home Steps (2)
  items.push({
    relPath: 'audio/steps/home_welcome.mp3',
    text: 'שלום! אני זֶן. בואו נגלה יחד איך מחשבים ובינה מלאכותית פועלים — צעד אחר צעד!'
  });
  items.push({
    relPath: 'audio/steps/home_complete.mp3',
    text: 'כל הכבוד! סיימתם את כל 8 התחנות ואספתם 24 כוכבים. תעודת ההצטיינות שלכם מוכנה!'
  });

  // 5. Station Step 0 Mascot Intros (8) — exact strings from Station1..8
  const STATION_INTROS = {
    lab1: 'בתוך כל מסך יש מיליוני נקודות אור שנקראות פיקסלים. כל נקודה היא כמו מתג קטן: 0 זה כבוי, ו-1 זה דולק!',
    lab2: 'רובוט לא מנחש לבד — הוא מבצע בדיוק את רשימת הפקודות שאתם מכינים לו צעד אחר צעד!',
    lab3: 'כדי לזהות חיה ב-2 שאלות בלבד, מתחילים בשאלה שמחלקת את החיות לשתי קבוצות שוות!',
    lab4: 'במקום לחפש באקראי, המצפן החכם מחשב בכל משבצת שני מספרים: כמה צעדים כבר צעדנו (g) וכמה צעדים נשארו ליעד (h).',
    lab5: 'במקום לכתוב למחשב חוקים קבועים, מניחים לו דוגמאות לפי תכונות — מתיקות וגודל. פירות דומים יושבים קרוב זה לזה!',
    lab6: 'מצלמה מעבירה למחשב טבלה ענקית של מספרים. בעזרת פילטר בגודל 3×3, המחשב סורק כל פיקסל ושכניו ומגלה איפה מסתתרים קווים וצורות!',
    lab7: 'דמיינו שאתם מחליטים אם לצאת לשחק כדורגל: כל רמז מקבל משקל חשיבות, ואם עוברים את הסף — הנוירון נדלק ואומר כן!',
    lab8: 'מכירים את 3 המילים המוצעות מעל המקלדת בטלפון? מודלי שפה עובדים באותה שיטה בדיוק — ניחוש המילה הבאה מילה אחר מילה!'
  };
  for (const [labId, text] of Object.entries(STATION_INTROS)) {
    items.push({ relPath: `audio/steps/${labId}_intro.mp3`, text });
  }

  // 6. Extra bespoke intermediate Mascot / Hint clips (3)
  items.push({
    relPath: 'audio/steps/lab1_step2.mp3',
    text: 'לכל מתג בשורה יש משקל משלו — בדיוק כפול מזה שלימינו! כשמדליקים כמה מתגים, המחשב פשוט מחבר אותם.'
  });
  items.push({
    relPath: 'audio/steps/lab1_step2_hint.mp3',
    text: 'כדי להגיע בדיוק ל-10, הדליקו את המתג שמעליו כתוב 8 ואת המתג שמעליו כתוב 2.'
  });
  items.push({
    relPath: 'audio/steps/lab3_step5.mp3',
    text: 'עם 4 חיות הגענו ל-100%, אבל ברגע שמצטרפות חיות חדשות כמו יען או פינגווין, 2 שאלות כבר לא מספיקות!'
  });

  // 7. Mission Header Instructions (24)
  for (let i = 1; i <= 8; i++) {
    const labId = `lab${i}`;
    const challenges = curriculum.labs?.[labId]?.challenges || [];
    challenges.forEach((ch, idx) => {
      items.push({
        relPath: `audio/steps/${labId}_inst${idx + 1}.mp3`,
        text: ch.instructions
      });
    });
  }

  // 8. Quiz Questions matching exact `miniQuiz` indices used in Station1..8 (14)
  const QUIZ_SPECS = [
    ['lab1_quiz1', 'lab1', 1],
    ['lab2_quiz1', 'lab2', 0],
    ['lab2_quiz2', 'lab2', 2],
    ['lab3_quiz1', 'lab3', 1],
    ['lab4_quiz1', 'lab4', 0],
    ['lab4_quiz2', 'lab4', 2],
    ['lab5_quiz1', 'lab5', 0],
    ['lab5_quiz2', 'lab5', 2],
    ['lab6_quiz1', 'lab6', 1],
    ['lab6_quiz2', 'lab6', 2],
    ['lab7_quiz1', 'lab7', 1],
    ['lab7_quiz2', 'lab7', 2],
    ['lab8_quiz1', 'lab8', 1],
    ['lab8_quiz2', 'lab8', 2]
  ];
  for (const [slug, labId, qIdx] of QUIZ_SPECS) {
    const q = LAB_METADATA[labId]?.miniQuiz?.[qIdx];
    if (q?.question) {
      items.push({ relPath: `audio/steps/${slug}.mp3`, text: q.question });
    }
  }

  // 9. Real-World Step Mascot Messages (8) — exact strings from Station1..8
  const REALWORLD_MSGS = {
    lab1: 'עכשיו כשאתם יודעים מה זה פיקסל וביט, שימו לב איפה המחשב משתמש בזה כל יום:',
    lab2: 'בדיוק כמו שהרובוט ביצע את ההוראות שלכם במבוך, מכונות ומשחקים סביבנו עוקבים אחרי אלגוריתמים כל יום:',
    lab3: 'מעצי שאלות של כן ולא בונים היום מערכות אבחון, משחקי ניחוש וממליצי תוכן חכמים:',
    lab4: 'מהנסיעה המשפחתית עם Waze ועד רכבי מחקר בכוכב מאדים — אלגוריתמי ניווט מוצאים דרכים מהירות בכל רגע:',
    lab5: 'אלגוריתם השכנים הקרובים (k-NN) עוזר למחשבים להמליץ על מוזיקה, למיין יבול חקלאי ולעזור לרופאים:',
    lab6: 'הפילטרים שסורקים 9 פיקסלים הם אבן הבניין של פתיחת טלפון עם פנים ורכבים בטיחותיים:',
    lab7: 'כשמחברים המון נוירונים יחד בשכבות, הם מזהים ספאם ב-Gmail, מתרגמים שפות ומפעילים מוח מלאכותי:',
    lab8: 'עכשיו אתם מבינים איך פועלים צ׳אטבוטים ושיחות AI — וזוכרים שתמיד כדאי לאמת עובדות:'
  };
  for (const [labId, text] of Object.entries(REALWORLD_MSGS)) {
    items.push({ relPath: `audio/steps/${labId}_realworld.mp3`, text });
  }

  return items;
}

async function main() {
  const apiKey = loadApiKey();
  const ffmpegBin = resolveFfmpeg();
  const items = await buildAudioItems();

  let manifest = {};
  if (!FORCE_ALL && fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch {
      manifest = {};
    }
  }

  console.log(`Prepared ${items.length} audio items using voice '${VOICE_NAME}' (${TTS_MODELS[0]}).`);

  if (DRY_RUN) {
    items.slice(0, 6).forEach((it) => {
      console.log(`DRY ${it.relPath} => ${cleanHebrewForSpeech(it.text).slice(0, 90)}`);
    });
    console.log(`Total items verified: ${items.length}`);
    return;
  }

  const tmpDir = path.join(ROOT, '.tts_tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let cursor = 0;

  async function worker(workerId) {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      const item = items[idx];
      const outPath = path.join(ROOT, 'public', item.relPath);
      const cleanText = cleanHebrewForSpeech(item.text);
      const hash = sha256(`${VOICE_NAME}::${cleanText}`);

      if (
        !FORCE_ALL &&
        manifest[item.relPath] === hash &&
        fs.existsSync(outPath) &&
        fs.statSync(outPath).size > 4096
      ) {
        skipped++;
        continue;
      }

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const tmpWav = path.join(tmpDir, `w${workerId}_${idx}.wav`);

      const { wavBytes, model } = await synthesizeWithCascade(apiKey, cleanText);
      fs.writeFileSync(tmpWav, wavBytes);

      await execFileAsync(ffmpegBin, [
        '-y',
        '-i',
        tmpWav,
        '-ac',
        '1',
        '-ar',
        '44100',
        '-codec:a',
        'libmp3lame',
        '-qscale:a',
        '4',
        outPath
      ]);

      try {
        fs.unlinkSync(tmpWav);
      } catch {
        // ignore temp cleanup failure
      }

      manifest[item.relPath] = hash;
      generated++;
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`[${generated + skipped}/${items.length}] OK ${item.relPath} (${sizeKb} KB via ${model})`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Done! Generated: ${generated}, Up-to-date skipped: ${skipped}, Total: ${items.length}`);
}

main().catch((err) => {
  console.error('TTS generation error:', err?.message || err);
  process.exit(1);
});
