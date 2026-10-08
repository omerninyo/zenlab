/**
 * Google Veo 3.1 Video Generation CLI for ZenLab Platform
 * 
 * Generates custom 3D animated educational videos for 5th graders using Google Veo 3.1:
 * - Aspect Ratio: 16:9
 * - Duration: 6 seconds (loopable educational concept visual)
 * - Output: public/videos/lab<id>.mp4
 * - Automatic linking into src/data/curriculum.json (media.video.localSrc)
 * 
 * Usage:
 *   # Dry-run inspect prompts and targets:
 *   node scripts/generate_video.js --dry-run
 * 
 *   # Generate for a specific lab (e.g. lab1):
 *   node scripts/generate_video.js --lab=lab1 --api-key=YOUR_API_KEY
 * 
 *   # Generate for all 8 labs:
 *   node scripts/generate_video.js --all --api-key=YOUR_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CURRICULUM_PATH = path.join(ROOT_DIR, 'src/data/curriculum.json');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/videos');

const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));

// High-impact, elementary child-friendly 3D animation prompts for Google Veo
const LAB_VIDEO_PROMPTS = {
  lab1: {
    title: 'ציור בפיקסלים וביטים',
    prompt: 'A cheerful friendly 3D cartoon robot discovering a colorful glowing pixel grid in a clean bright elementary classroom, vibrant colors, Pixar style 3D animation, camera gently orbits as pixels light up with binary 0 and 1.'
  },
  lab2: {
    title: 'לתכנת רובוט חכם',
    prompt: 'A cute little explorer robot navigating a playful maze with yellow coins on the floor, solving steps one by one, cheerful 3D Pixar style animation, bright daylight, smooth movement.'
  },
  lab3: {
    title: 'עץ החלטות בלשי',
    prompt: 'A magical glowing digital tree with branching paths in a modern science laboratory, each branch glowing with yes or no choices, cartoon detective magnifying glass, friendly 3D animation.'
  },
  lab4: {
    title: 'הווייז של הרובוט (A*)',
    prompt: 'A neon-lit futuristic city grid from an isometric perspective, showing a glowing green shortest path forming between two points, avoiding red obstacles, clean tech 3D animation.'
  },
  lab5: {
    title: 'איך מחשב לומד בעצמו?',
    prompt: 'A curious animated robot sorting colorful fruits into baskets, learning patterns as friendly holographic light beams compare apples and oranges, warm inviting 3D style.'
  },
  lab6: {
    title: 'ראייה ממוחשבת והעיניים של המחשב',
    prompt: 'A robotic digital camera scanning an object, drawing crisp illuminated neon contour lines around shapes in a clean modern classroom, friendly educational 3D animation.'
  },
  lab7: {
    title: 'נוירון חכם: מתג שמקשיב ומחליט',
    prompt: 'A glowing friendly stylized brain neuron cell lighting up and transmitting soft electrical impulses to neighboring connections, beautiful warm colors, educational 3D visualization.'
  },
  lab8: {
    title: 'מודל שפה חכם: איך המחשב מנחש מילים?',
    prompt: 'Holographic glowing letters and friendly words floating in a circle around an animated robot, words connecting with light beams as a sentence builds itself, cheerful 3D animation.'
  }
};

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isAll = args.includes('--all');
const labArg = args.find(a => a.startsWith('--lab='));
const targetLab = labArg ? labArg.split('=')[1].toLowerCase() : (isAll ? 'all' : 'lab1');

const apiKeyArg = args.find(a => a.startsWith('--api-key='));
const apiKey = apiKeyArg 
  ? apiKeyArg.split('=')[1] 
  : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

console.log('====================================================');
console.log('🎬  ZenLab Google Veo 3.1 Video Generator');
console.log('====================================================');
console.log(`Target: ${targetLab === 'all' ? 'All 8 Labs' : targetLab}`);
console.log(`Target Directory: ${OUTPUT_DIR}\n`);

if (isDryRun || !apiKey) {
  console.log('📋 Dry-Run Veo Video Production Specs:');
  Object.entries(LAB_VIDEO_PROMPTS).forEach(([id, meta], idx) => {
    console.log(`[${idx + 1}/8] ${id} (${meta.title}):`);
    console.log(`  Target File: ${path.join(OUTPUT_DIR, `${id}.mp4`)}`);
    console.log(`  Prompt: "${meta.prompt}"\n`);
  });
  console.log('💡 To start generation with Google Veo:');
  console.log('  node scripts/generate_video.js --lab=lab1 --api-key=YOUR_API_KEY');
  console.log('  node scripts/generate_video.js --all --api-key=YOUR_API_KEY');
  console.log('\n📌 Note: Google Veo 3.1 requires an active Vertex AI / Gemini API project with video generation quota.');
  process.exit(0);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateVeoVideo(labId, promptMeta) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${apiKey}`;
  const outFile = path.join(OUTPUT_DIR, `${labId}.mp4`);
  const publicSrc = `/videos/${labId}.mp4`;

  console.log(`🚀 Sending prompt to Google Veo 3.1 for ${labId}...`);
  console.log(`   "${promptMeta.prompt.slice(0, 80)}..."`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: promptMeta.prompt }],
      parameters: {
        aspectRatio: '16:9',
        sampleCount: 1,
        durationSeconds: 6
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Veo API error (${res.status}): ${errText}`);
  }

  const operation = await res.json();
  console.log(`  -> Operation started: ${operation.name || 'predictLongRunning'}`);
  console.log(`  ⏳ Polling Veo video generation progress (this typically takes 60-90s)...`);

  let completed = false;
  let pollAttempts = 0;
  let videoUri = null;

  while (!completed && pollAttempts < 30) {
    pollAttempts++;
    await sleep(8000);

    const opUrl = `https://generativelanguage.googleapis.com/v1beta/${operation.name}?key=${apiKey}`;
    const pollRes = await fetch(opUrl);
    if (!pollRes.ok) {
      console.log(`     Polling attempt ${pollAttempts}... waiting`);
      continue;
    }

    const opData = await pollRes.json();
    if (opData.done) {
      completed = true;
      if (opData.error) {
        throw new Error(`Veo generation failed: ${JSON.stringify(opData.error)}`);
      }
      videoUri = opData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      break;
    } else {
      console.log(`     Generation in progress... (${pollAttempts * 8}s elapsed)`);
    }
  }

  if (!videoUri) {
    throw new Error('Video generation timed out or returned no download URI.');
  }

  console.log(`  📥 Downloading generated MP4 video from ${videoUri}...`);
  const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  fs.writeFileSync(outFile, videoBuffer);
  console.log(`  ✅ Successfully saved video to: ${outFile}`);

  // Link in curriculum.json
  if (curriculum.labs[labId]?.media?.video) {
    curriculum.labs[labId].media.video.localSrc = publicSrc;
    fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2), 'utf8');
    console.log(`  🔗 Updated curriculum.json with localSrc: ${publicSrc}`);
  }
}

async function run() {
  const labIds = targetLab === 'all' ? Object.keys(LAB_VIDEO_PROMPTS) : [targetLab];

  for (const labId of labIds) {
    const promptMeta = LAB_VIDEO_PROMPTS[labId];
    if (!promptMeta) {
      console.error(`Unknown lab id: ${labId}`);
      continue;
    }

    try {
      await generateVeoVideo(labId, promptMeta);
    } catch (err) {
      console.error(`❌ Error generating video for ${labId}:`, err.message);
      if (err.message.includes('429')) {
        console.log('\n💡 Quota Note: Veo 3.1 video generation is currently restricted to Vertex AI / paid billing projects.');
        console.log('   In the meantime, ZenLab uses the Built-in Interactive Hebrew Explainer Tour (`HebrewExplainerTour.jsx`) which runs 100% locally with zero quotas!');
        break;
      }
    }
  }
}

run();
