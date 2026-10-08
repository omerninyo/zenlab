/**
 * Audio Generation Script for ZenLab Platform
 * 
 * Generates studio-quality Hebrew narration audio files using:
 * 1. Google Gemini Flash TTS (Multimodal Audio Output) - Default with Ultra / AI Studio keys
 * 2. Google Cloud Text-to-Speech (Neural2 / WaveNet)
 * 3. ElevenLabs (Multilingual v2)
 * 
 * Usage:
 *   # Dry run:
 *   node scripts/generate_audio.js --dry-run
 * 
 *   # Generate with Google Gemini TTS:
 *   node scripts/generate_audio.js --api-key=YOUR_API_KEY
 * 
 *   # Generate with ElevenLabs:
 *   node scripts/generate_audio.js --provider=elevenlabs --api-key=YOUR_ELEVENLABS_API_KEY
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

const apiKeyArg = args.find(a => a.startsWith('--api-key='));
const rawApiKey = apiKeyArg 
  ? apiKeyArg.split('=')[1] 
  : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.ELEVENLABS_API_KEY);

const providerArg = args.find(a => a.startsWith('--provider='));
let provider = providerArg ? providerArg.split('=')[1].toLowerCase() : null;

// Auto-detect provider if not explicitly given
if (!provider) {
  if (isDryRun) {
    provider = 'dry-run';
  } else if (rawApiKey && (rawApiKey.startsWith('AQ.') || rawApiKey.startsWith('AIzaSy'))) {
    provider = 'gemini';
  } else {
    provider = 'gemini';
  }
}

const apiKey = rawApiKey;

const voiceIdArg = args.find(a => a.startsWith('--voice='));
// Gemini voice options: Puck, Charon, Kore, Fenrir, Aoede
const geminiVoice = voiceIdArg ? voiceIdArg.split('=')[1] : 'Puck';
// Google Cloud voice: he-IL-Neural2-A (Female) or he-IL-Wavenet-B (Male)
const googleVoiceName = voiceIdArg ? voiceIdArg.split('=')[1] : 'he-IL-Neural2-A';
// ElevenLabs voice
const elevenVoiceId = voiceIdArg ? voiceIdArg.split('=')[1] : '21m00Tcm4TlvDq8ikWAM';

console.log('====================================================');
console.log('🎙️  ZenLab Hebrew Narration Audio Generator');
console.log('====================================================');
console.log(`Provider: ${provider}`);
console.log(`Target Directory: ${OUTPUT_DIR}\n`);

// Determine file extension based on provider
const ext = provider === 'gemini' ? '.wav' : '.mp3';

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
    outputPath: path.join(OUTPUT_DIR, `${labId}${ext}`),
    publicSrc: `/audio/narration/${labId}${ext}`
  });
}

console.log(`Found ${tasks.length} labs with Hebrew narration.`);
console.log(`Total Characters across all 8 labs: ${totalChars} chars.`);
console.log(`- Google Gemini Ultra/Flash: Zero marginal cost with your Google subscription!`);
console.log(`- Google Cloud Free Quota (1,000,000/mo): Consumes ${(totalChars / 1000000 * 100).toFixed(2)}% of free tier!`);
console.log('----------------------------------------------------\n');

if (isDryRun || !apiKey) {
  console.log('📋 Dry-Run Breakdown:');
  tasks.forEach((t, i) => {
    console.log(`[${i + 1}/${tasks.length}] ${t.labId} (${t.title}): ${t.charCount} chars -> ${t.outputPath}`);
  });
  console.log('\n💡 To generate actual studio audio files with Google Gemini TTS:');
  console.log('  node scripts/generate_audio.js --api-key=YOUR_GOOGLE_KEY');
  console.log('\n💡 Or generate with Google Cloud TTS (Neural2 / WaveNet):');
  console.log('  node scripts/generate_audio.js --provider=google --api-key=YOUR_GCP_KEY');
  process.exit(0);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function synthesizeGemini(text, outFile) {
  const model = 'gemini-2.5-flash-preview-tts';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text }]
      }],
      generationConfig: {
        responseModalities: ['AUDIO']
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini TTS error (${response.status}): ${err}`);
  }

  const json = await response.json();
  const rawBase64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!rawBase64) {
    throw new Error(`No audio data returned in response: ${JSON.stringify(json).slice(0, 200)}`);
  }
  const pcmBuf = Buffer.from(rawBase64, 'base64');
  const wavBuf = pcmToWav(pcmBuf, 24000, 1, 16);
  fs.writeFileSync(outFile, wavBuf);
}

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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  let updatedCurriculum = false;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`[${i + 1}/${tasks.length}] Processing ${task.labId} (${task.title})...`);

    // Check if already generated
    if (fs.existsSync(task.outputPath) && fs.statSync(task.outputPath).size > 1000) {
      console.log(`  -> Already exists (${(fs.statSync(task.outputPath).size / 1024).toFixed(1)} KB), skipping generation.`);
      if (curriculum.labs[task.labId]?.media?.narration) {
        curriculum.labs[task.labId].media.narration.audioSrc = task.publicSrc;
        updatedCurriculum = true;
      }
      continue;
    }

    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!success && attempts < maxAttempts) {
      attempts++;
      try {
        if (provider === 'gemini') {
          await synthesizeGemini(task.text, task.outputPath);
        } else if (provider === 'elevenlabs') {
          await synthesizeElevenLabs(task.text, task.outputPath);
        } else if (provider === 'google') {
          await synthesizeGoogleCloud(task.text, task.outputPath);
        } else {
          throw new Error(`Unknown provider: ${provider}`);
        }

        console.log(`  -> Successfully saved: ${task.outputPath}`);
        success = true;

        if (curriculum.labs[task.labId]?.media?.narration) {
          curriculum.labs[task.labId].media.narration.audioSrc = task.publicSrc;
          updatedCurriculum = true;
        }

        // Polite delay for rate limits (3 RPM on preview TTS)
        if (provider === 'gemini' && i < tasks.length - 1) {
          console.log(`  ⏳ Waiting 20s to respect rate limits...`);
          await sleep(20000);
        }
      } catch (err) {
        if (err.message.includes('429') && attempts < maxAttempts) {
          console.log(`  ⚠️ Quota limit hit (429). Backing off for 25s before retry (attempt ${attempts}/${maxAttempts})...`);
          await sleep(25000);
        } else {
          console.error(`  ❌ Failed for ${task.labId}:`, err.message);
          break;
        }
      }
    }
  }

  if (updatedCurriculum) {
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2), 'utf8');
    console.log(`\n✅ Updated ${CURRICULUM_PATH} with audioSrc links!`);
  }

  console.log('\n✨ Generation process finished!');
}

run();
