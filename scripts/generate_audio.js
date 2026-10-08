/**
 * Audio Generation Script for ZenLab Platform
 * 
 * Generates studio-quality Hebrew narration MP3 files using:
 * 1. ElevenLabs (Multilingual v2)
 * 2. Google Cloud Text-to-Speech (Neural2 / WaveNet)
 * 
 * Usage:
 *   # Dry run (inspect character counts and free tier usage):
 *   node scripts/generate_audio.js --dry-run
 * 
 *   # Generate with ElevenLabs:
 *   node scripts/generate_audio.js --provider=elevenlabs --api-key=YOUR_ELEVENLABS_API_KEY
 * 
 *   # Generate with Google Cloud TTS:
 *   node scripts/generate_audio.js --provider=google --api-key=YOUR_GOOGLE_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CURRICULUM_PATH = path.join(ROOT_DIR, 'src/data/curriculum.json');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/audio/narration');

const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const providerArg = args.find(a => a.startsWith('--provider='));
const provider = providerArg ? providerArg.split('=')[1].toLowerCase() : (isDryRun ? 'dry-run' : 'google');

const apiKeyArg = args.find(a => a.startsWith('--api-key='));
const apiKey = apiKeyArg 
  ? apiKeyArg.split('=')[1] 
  : (provider === 'google' ? (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) : process.env.ELEVENLABS_API_KEY);

const voiceIdArg = args.find(a => a.startsWith('--voice='));
// Default Google Cloud voice: he-IL-Neural2-A (Female high-fidelity neural model)
// Other popular choices: he-IL-Wavenet-B (Male), he-IL-Wavenet-C (Female)
const googleVoiceName = voiceIdArg ? voiceIdArg.split('=')[1] : 'he-IL-Neural2-A';
// Default ElevenLabs voice (e.g. Rachel / multilingual friendly voice)
const elevenVoiceId = voiceIdArg ? voiceIdArg.split('=')[1] : '21m00Tcm4TlvDq8ikWAM';

console.log('====================================================');
console.log('🎙️  ZenLab Hebrew Narration Audio Generator');
console.log('====================================================');
console.log(`Provider: ${provider}`);
console.log(`Target Directory: ${OUTPUT_DIR}\n`);

// 1. Gather all texts
const tasks = [];
let totalChars = 0;

for (const [labId, labData] of Object.entries(curriculum.labs)) {
  const text = labData.media?.narration?.transcript;
  if (!text) continue;
  totalChars += text.length;
  tasks.push({
    labId,
    title: labData.title,
    text,
    charCount: text.length,
    outputPath: path.join(OUTPUT_DIR, `${labId}.mp3`),
    publicSrc: `/audio/narration/${labId}.mp3`
  });
}

console.log(`Found ${tasks.length} labs with Hebrew narration.`);
console.log(`Total Characters across all 8 labs: ${totalChars} chars.`);
console.log(`- ElevenLabs Free Quota (10,000/mo): Consumes ${(totalChars / 10000 * 100).toFixed(1)}% of free tier!`);
console.log(`- Google Cloud Free Quota (1,000,000/mo): Consumes ${(totalChars / 1000000 * 100).toFixed(2)}% of free tier!`);
console.log('----------------------------------------------------\n');

if (isDryRun || !apiKey) {
  console.log('📋 Dry-Run Breakdown:');
  tasks.forEach((t, i) => {
    console.log(`[${i + 1}/${tasks.length}] ${t.labId} (${t.title}): ${t.charCount} chars -> ${t.outputPath}`);
  });
  console.log('\n💡 To generate actual studio MP3 files with Google Cloud TTS (Neural2 / WaveNet):');
  console.log('  node scripts/generate_audio.js --api-key=YOUR_GOOGLE_KEY');
  console.log('  (Options: --voice=he-IL-Neural2-A [default female], --voice=he-IL-Wavenet-B [male], --voice=he-IL-Wavenet-C [female])');
  console.log('\n💡 Or generate with ElevenLabs:');
  console.log('  node scripts/generate_audio.js --provider=elevenlabs --api-key=YOUR_ELEVENLABS_KEY');
  process.exit(0);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function synthesizeElevenLabs(text, outFile) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.1,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error (${response.status}): ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outFile, Buffer.from(arrayBuffer));
}

async function synthesizeGoogleCloud(text, outFile) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'he-IL',
        name: googleVoiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.94,
        pitch: 1.04
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Cloud TTS error (${response.status}): ${err}`);
  }

  const json = await response.json();
  const buffer = Buffer.from(json.audioContent, 'base64');
  fs.writeFileSync(outFile, buffer);
}

async function run() {
  let updatedCurriculum = false;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`[${i + 1}/${tasks.length}] Generating audio for ${task.labId} (${task.title})...`);

    try {
      if (provider === 'elevenlabs') {
        await synthesizeElevenLabs(task.text, task.outputPath);
      } else if (provider === 'google') {
        await synthesizeGoogleCloud(task.text, task.outputPath);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      console.log(`  -> Successfully saved: ${task.outputPath}`);

      // Link in curriculum.json
      if (curriculum.labs[task.labId]?.media?.narration) {
        curriculum.labs[task.labId].media.narration.audioSrc = task.publicSrc;
        updatedCurriculum = true;
      }
    } catch (err) {
      console.error(`  ❌ Failed for ${task.labId}:`, err.message);
    }
  }

  if (updatedCurriculum) {
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2), 'utf8');
    console.log(`\n✅ Updated ${CURRICULUM_PATH} with audioSrc links!`);
  }

  console.log('\n✨ Generation finished!');
}

run();
