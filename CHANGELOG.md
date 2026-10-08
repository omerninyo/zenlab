# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
