# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2026-10-08

### Added
- **Full-Curriculum Interactive Glossary Modal (`src/components/GlossaryModal.jsx`)**:
  - Searchable by term or definition keyword across all 8 micro-labs.
  - Filter by lab category pills ("All Concepts", "Lab 1: Pixels" ... "Lab 8: Language Model").
  - Accessible via top navigation header (`BookOpen` icon).
- **Classroom Settings & Progress Management Modal (`src/components/ClassroomSettingsModal.jsx`)**:
  - One-click classroom progress reset with safety confirmation dialog (`StorageEngine.resetProgress`).
  - Client-side JSON backup download (`StorageEngine.exportStateJSON`) and restore file picker (`StorageEngine.importStateJSON`).
  - Auditory synthesizer toggle and live sound test trigger (`AudioEngine.playSuccess`).
  - Strict Zero-PII privacy guarantee statement.
- **Security & Privacy Infrastructure for Cloudflare Pages**:
  - `public/_headers`: Enforced security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and child privacy permissions policy disabling camera/mic/geolocation).
  - `index.html`: Enhanced metadata with OpenGraph (`og:title`, `og:description`), Twitter Card tags, theme color (`#020617`), and mobile web app capabilities.
- **Pedagogical Discovery Worksheets & Global Competitive Benchmark**:
  - `docs/STUDENT_WORKSHEET_HE.md` & `docs/STUDENT_WORKSHEET.md`: Printable 2-page student discovery inquiry sheets with 24-star coloring tracker, reflection questions, and ethics dilemmas.
  - `docs/research/COMPETITIVE_BENCHMARK_AND_INNOVATION.he.md` & `.md`: In-depth analysis comparing ZenLab with Code.org, Scratch/MIT RAISE, Teachable Machine, Machine Learning for Kids, and Israeli MOE frameworks.

### Changed
- `src/App.jsx`: Header actions enhanced with Glossary and Settings modals; version bumped to `v0.3.2`.
- `src/core/storage.js`: Added `exportStateJSON` and `importStateJSON` methods, hardened deep-state reset.

### Verified
- Automated build passed cleanly (`npm run build` in 4.05s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.

## [0.3.1] - 2026-10-08

### Added
- **Full Hebrew Documentation Parity & Institutional Memory**:
  - `README.he.md`: Complete Hebrew project overview, pedagogical scope, and Cloudflare Pages deployment instructions.
  - `ROADMAP.he.md`: Hebrew engineering and educational roadmap spanning Phase 1 to Phase 3.
  - `CHANGELOG.he.md`: Synchronized Hebrew release notes across all releases.
  - `docs/TEACHERS_GUIDE_HE.md`: Comprehensive 45-minute modular classroom lesson plans, interactive discussion prompts, and evaluation rubric for educators.
  - `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.he.md`: Institutional research codifying Israeli Ministry of Education (MOE) AI Competency Rubric, AI4K12 3–5 framework, Piaget/Bruner cognitive progressions, and Zero-Syntax guidelines.
  - `docs/proposals/RFC_001_CORE_ARCHITECTURE.he.md` & `RFC_002_EIGHT_LAB_MASTER_SUITE.he.md`: Hebrew translations of core architecture proposals and laboratory contracts.
- **Student Achievement Certificate Modal (`src/components/CertificateModal.jsx`)**:
  - Client-side printable achievement certificate featuring personalized student name input, total stars tally (up to 24), rank title, and `@media print` optimized layout.
- **Track Navigation Filter & Welcome Banner (`src/App.jsx`)**:
  - Track filter pills ("All (8)", "Track 1: Algorithms (4)", "Track 2: AI (4)").
  - Grade 5 friendly welcome guide banner explaining progression, stars, and certificate.

### Changed
- `src/core/storage.js`: Extended default state to support all 8 labs across completion and phase persistence, and added `recordChallengeCompletion` alias.

### Verified
- Automated build passed cleanly (`npm run build` in 3.97s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.

## [0.3.0] - 2026-10-08

### Added
- **Eight-Lab Master Curriculum Suite for Grade 5 (Ages 10–11)**:
  - Reorganized curriculum into two parallel cognitive tracks across 8 comprehensive labs (24 total achievement stars):
    - **Track 1: Classical Computational Thinking & Algorithms**:
      - `Lab1_BinaryPixels`: 8x8 toggle matrix, 64-bit binary stream, hex encoding, and pixel presets.
      - `Lab2_AlgorithmicRobot`: 6x6 maze, FIFO command queue, preconditions, and step debugger.
      - `Lab3_DecisionTree` (New): Interactive binary decision tree builder, feature splits (CanFly, HasFur, Legs), live leaf purity gauge, and single-animal path tracer.
      - `Lab4_Pathfinder` (New): 8x8 grid maze, obstacle traversal, step-by-step playback comparing Breadth-First Search (BFS) vs. A* Heuristic search.
    - **Track 2: Perception, Machine Learning & Modern Generative AI**:
      - `Lab5_MachineLearningClassifier`: 2D feature space, k-NN distance, dynamic decision boundary separator.
      - `Lab6_VisionKernels` (New): 2D convolutions with 3x3 kernel filters (Sobel vertical/horizontal, sharpen, blur), sliding window multiply-accumulate inspector, and feature map generator.
      - `Lab7_Perceptron` (New): Artificial neuron mathematical model with $w_1, w_2, \text{bias}$ direct manipulators, 2D decision boundary on unit square, logic gates (AND, OR), and the historic XOR limitation.
      - `Lab8_LanguageModelPredictor`: Next-token prediction, Softmax probability distribution bar chart, interactive Temperature slider, and autoregression.
- **Interactive SVG Principle Animations for All New Labs**:
  - `SvgDecisionTreeAnimation.jsx`: Interactive branching flow with dynamic animal selection, highlighted active paths, and leaf classification.
  - `SvgPathfinderAnimation.jsx`: Frontier wave expansion vs. heuristic targeting, live step counter, and shortest path reconstruction.
  - `SvgKernelAnimation.jsx`: 3x3 sliding frame over an 8x8 input matrix, real-time dot product summation, and feature map intensity shading.
  - `SvgPerceptronAnimation.jsx`: Biological/artificial neuron diagram with live input toggles, synapse weight scaling, summation node $\Sigma$, and output signal trigger.
- **Algorithmic Engine Expansions (`src/services/ai.js`)**:
  - `solvePathfinder`: Deterministic implementation of Breadth-First Search and A* Heuristic search with Manhattan distance.
  - `computeConvolution`: 2D image convolution with zero-padding and step breakdown.
  - `evaluatePerceptron`: Linear model calculation, step/sigmoid activation, and logic gate accuracy scoring.
  - `evaluateDecisionTree`: Tree traversal, group splitting, and leaf purity evaluation.
- **Collective Memory & Pedagogical Research Documentation**:
  - `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.md`: Exhaustive institutional memory detailing Israeli Ministry of Education (MOE) AI Competency Rubric, AI4K12 National Guidelines (Five Big Ideas for Grades 3–5), cognitive theories (Piaget and Bruner), and child-centered UI/UX requirements.
  - `docs/proposals/RFC_002_EIGHT_LAB_MASTER_SUITE.md`: Architectural specification for the 8 micro-labs, data contracts, and deterministic execution engines.

### Changed
- Migrated previous `Lab3_MachineLearningClassifier` and `Lab4_LanguageModelPredictor` to `Lab5` and `Lab8` to establish a clean cognitive progression.
- Updated `src/App.jsx` navigation bar with 8 interactive lab tabs, Lucide icons, and 24-star progress tracker.
- Enriched `src/data/curriculum.json` with Hebrew pedagogical explanations, 3-star challenges, and glossaries for all 8 labs.

### Verified
- Automated build passed cleanly (`npm run build` in 4.06s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.


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
