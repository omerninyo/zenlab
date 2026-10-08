# Advanced Hebrew TTS & GenAI Video Pipeline Specification

> **Research & Engineering Document**: Enhancing Audio-Visual Pedagogy for Elementary CS & AI  
> **Version**: 1.0.0 | **Date**: October 2026 | **Author**: Code & AI Explorer Team (`team@learnai.internal`)

---

## 1. Executive Summary & Goals

Built-in browser Web Speech API voices (such as legacy "Carmit" on Windows or uncalibrated robotic synthesizers) lack the natural prosody and intonation required to sustain engagement for 10-year-old learners. Furthermore, standard English video embeds create a linguistic and cognitive barrier for Israeli elementary students.

This engineering specification establishes a dual audio-visual upgrade:
1. **Studio-Grade Hebrew Speech Synthesis** using neural TTS providers (**ElevenLabs Multilingual v2** and **Google Cloud Text-to-Speech Neural2**).
2. **Static Pre-Rendering Architecture**: Batch generating `.mp3` files into `public/audio/narration/` for zero runtime latency, zero API secret leakage, offline classroom resilience, and Cloudflare Pages compatibility.
3. **Zero-Cost Implementation Math**: The complete 8-lab narration text contains exactly **2,360 characters**, representing 23.6% of ElevenLabs' free monthly tier (10,000 chars) and 0.24% of Google Cloud's free tier (1,000,000 chars).
4. **GenAI Video Generation Pathways**: Structured roadmaps for character-led AI avatars (HeyGen / D-ID) and programmatic code-to-video rendering (Remotion).

---

## 2. TTS Provider Evaluation for Hebrew

| Feature | Browser Web Speech | Google Cloud TTS (`he-IL-Neural2-A`) | ElevenLabs (`eleven_multilingual_v2`) |
| :--- | :--- | :--- | :--- |
| **Intonation Quality** | Moderate to low (hardware-dependent) | High (Neural2 wave generation) | Ultra-natural human studio grade |
| **Hebrew Dialect & Phonation** | Inconsistent across OS | Standard, clear, calibrated | Deep prosody with child-friendly warmth |
| **Monthly Free Quota** | Unlimited (client-side) | 1,000,000 characters/mo | 10,000 characters/mo |
| **ZenLab Total Suite (8 Labs)**| 0 chars | **0.24% of free quota** | **23.6% of free quota** |
| **Infrastructure Cost** | $0.00 | **$0.00** | **$0.00** |
| **Runtime Latency** | 0ms | 0ms (pre-rendered) | 0ms (pre-rendered) |

---

## 3. Automation Tooling: `scripts/generate_audio.js`

A standalone Node.js CLI script automates the complete pipeline:
- Scans `src/data/curriculum.json` for all lab transcripts.
- Calculates exact character counts and displays quota projections via `--dry-run`.
- Synthesizes and writes `.mp3` files to `public/audio/narration/<labId>.mp3`.
- Automatically links generated paths into the `audioSrc` field of `curriculum.json`.

### Execution Examples:
```bash
# Dry run verification:
node scripts/generate_audio.js --dry-run

# ElevenLabs generation:
node scripts/generate_audio.js --provider=elevenlabs --api-key=YOUR_ELEVENLABS_KEY

# Google Cloud TTS generation:
node scripts/generate_audio.js --provider=google --api-key=YOUR_GOOGLE_KEY
```

---

## 4. Multi-Tier Narration Playback Architecture

The client-side audio player (`src/core/narration.js`) implements a resilient 3-tier cascade:
1. **Tier 1 (Primary)**: High-fidelity static HTML5 audio playback (`audioSrc`). Instant playback with progress tracking and waveform visualization.
2. **Tier 2 (Neural Fallback)**: Intelligent Web Speech voice selection filtering for natural voices (`Google עברית`, `Microsoft Hila Natural`, `Carmit Enhanced`).
3. **Tier 3 (Phonetic Expansion)**: Technical acronyms are automatically converted into phonetically legible Hebrew strings (e.g. `CPU` -> "סי-פי-יוּ", `AI` -> "איי-איי").

---

## 5. GenAI Video Generation Architecture

To replace English YouTube embeds with native Hebrew visuals:
1. **Interactive In-App Tour (`HebrewExplainerTour.jsx`)**: Already implemented as the primary media tab. Features 4 interactive vector scenes per lab with synchronous voiceover and subtitle highlighting.
2. **AI Avatar Videos (HeyGen / D-ID)**: Rendering a friendly robot persona ("Zen") narrating the 45-second core takeaway in fluent Hebrew. The resulting `.mp4` files are placed in `public/videos/` and played via the updated `LiteYouTubeEmbed` component supporting `localSrc`.
3. **Programmatic Remotion Pipeline**: Compiling ZenLab's React SVG components into 60fps videos combined with pre-rendered speech audio, providing full open-source independence.
