# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-10-08

### Added
- **Hybrid Learning Modules Architecture**:
  - Two-Phase Learning View across all micro-labs (`TheoryView` and `InteractiveView`) with sticky navigation switcher and persistent phase retention (`StorageEngine.setLabPhase`, `getLabPhase`).
  - Integrated `LabPhaseHeader` component featuring lab metadata, star achievement counters, phase switcher, and voiceover audio toggles.
  - Unified `TheoryView` coordinating concept cards, interactive SVG animations, media slot, scientific analogies, and key principles.
- **Interactive SVG Principle Animations**:
  - `SvgBinaryAnimation.jsx`: 8-bit bus, interactive bit toggling, electric switch states, pixel illumination, decimal sum, and hex encoding.
  - `SvgRobotAnimation.jsx`: FIFO execution queue, step sequencer, robot avatar tracking, and dynamic precondition gate unlocking (`hasKey === TRUE`).
  - `SvgClassifierAnimation.jsx`: 2D feature coordinates, draggable/clickable query point, expanding k-NN radius circle, Euclidean distance lines, and real-time majority voting tally.
  - `SvgLlmAnimation.jsx`: Token prediction pipeline, live Softmax distribution curve, interactive Temperature slider ($0.0 \le T \le 1.5$), and token sampling trigger.
- **Media Slot & Persistent Voiceover Engine**:
  - `src/core/narration.js`: Zero-dependency voiceover narration engine supporting HTML5 Audio with graceful fallback to browser Web Speech API (`window.speechSynthesis` in `he-IL`), variable playback rates (`1.0x`, `1.25x`, `1.5x`), and reactive event bus.
  - `src/components/LiteYouTubeEmbed.jsx`: Lightweight, on-demand sandboxed YouTube player (`youtube-nocookie.com`, `sandbox="allow-scripts allow-same-origin allow-presentation"`, zero telemetry prior to user interaction).
  - `src/components/AudioNarrationPlayer.jsx`: Audio player with play/pause, seek scrubber, speed cycle, waveform visualizer, and collapsible Hebrew transcript.
  - Global persistent voiceover listening toggle in top application header alongside sound effects mute switch.
- **Curriculum Enrichment (`src/data/curriculum.json`)**:
  - Added structured concept definitions (`badge`, `title`, `description`, `highlight`, `icon`), SVG animation configurations, and media metadata (voiceover transcripts and video descriptors) across all 4 labs.

### Verified
- Automated production build passed cleanly (`npm run build`, bundle size: 292 kB, gzip: 86 kB).
- Live browser inspection via Playwright confirmed responsive rendering across desktop (1280x800) and mobile (390x844) viewports.
- Verified phase transitions (`TheoryView` ↔ `InteractiveView`) across all 4 labs.
- Verified Zero browser console errors and zero warnings logged.
- Full native Hebrew RTL layout alignment and Web Audio sound feedback verified.
- Strict Zero-PII hygiene enforced across repository files and git log.

## [0.1.0] - 2026-10-08

### Added
- **Governance & Zero-PII Invariants**:
  - Master governance protocols codified in `.agent/rules.md` and mirrored in root `AGENTS.md`.
  - RFC specification `docs/proposals/RFC_001_CORE_ARCHITECTURE.md`.
  - Multi-phase project roadmap in `ROADMAP.md`.
  - Standard MIT License in `LICENSE` and sanitized `.env.example`.
  - Pre-flight environment audit persisted to `config/environment.json`.
- **Application Core Infrastructure**:
  - Modern Single Page Application (SPA) architecture with React 18, Vite 6, and Tailwind CSS.
  - Strict visual discipline: monochromatic dark-mode slate/neutral palette, zero chromatic clutter, Lucide icons exclusively with zero emojis in UI controls.
  - Native Hebrew Right-to-Left (RTL) layout with Heebo and Rubik typography.
  - SPA routing fallback in `public/_redirects` (`/* /index.html 200`) and Cloudflare Pages deployment configuration (`wrangler.toml`, `.github/workflows/deploy.yml`).
- **Core Platform Engines**:
  - `src/core/audio.js`: Zero-dependency Web Audio API procedural sound synthesizer (sine/triangle oscillators, ADSR envelopes, mute controller).
  - `src/core/storage.js`: Reactive `localStorage` state engine tracking completed challenges, accumulated stars, and user preferences.
  - `src/core/canvas-particles.js`: Lightweight HTML5 canvas particle explosion engine for celebratory feedback.
  - `src/services/ai.js`: Pluggable AI engine providing deterministic Softmax temperature scaling, k-NN Euclidean distance classification, and an optional Google Gemini API bridge.
  - `src/data/curriculum.json`: Complete separation of pedagogical Hebrew copy, challenge criteria, concept summaries, and glossaries.
- **Interactive Micro-Labs**:
  - **Lab 1: Binary Pixels (`Lab1_BinaryPixels.jsx`)**: 8x8 toggle matrix, real-time 64-bit binary stream, 8-byte hexadecimal encoding, graphic presets (Heart, Smiley, Sword), and custom initial symbol challenges.
  - **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot.jsx`)**: 6x6 grid maze, visual command queue (Forward, Turn Left, Turn Right, Pick Key, Unlock Gate), step-by-step playback with visual execution pointer, and deterministic collision/error traps.
  - **Lab 3: Machine Learning Classifier (`Lab3_MachineLearningClassifier.jsx`)**: 2D feature space scatter plot, interactive training point placement, draggable query object, dynamic Euclidean distance neighbor visualization, and $k$-hyperparameter control ($k \in \{1, 3, 5\}$).
  - **Lab 4: Language Model Predictor (`Lab4_LanguageModelPredictor.jsx`)**: Next-token prediction simulator, selectable context prompts, interactive Temperature slider ($0.0 \le T \le 1.5$), real-time probability distribution bar chart, and token-by-token sentence generator.

### Verified
- Automated production build passed cleanly (`npm run build`, bundle size: 241 kB gzip: 69 kB).
- Live browser inspection via Playwright confirmed responsive rendering across desktop (1280x800) and mobile (390x844) viewports.
- Zero browser console errors and zero warnings logged.
- Full native Hebrew RTL layout alignment and Web Audio sound feedback verified.
- Strict Zero-PII hygiene enforced across repository files and git log.
