# Engineering Roadmap: ZenLab Universal Educational Platform
## Multi-Year Technical & Pedagogical Evolution: Web SPA, Native iPadOS, Lesson Plans, and Physical Computing

**Document ID:** `ZEN-ROADMAP-EN-2026`  
**Current Version:** `v0.7.17` (Updated: October 2026)  
**Team:** Code & AI Explorer Team (`team@learnai.internal`)  
**Governance:** Zero-PII Strict Compliance • 10th Man Red Team Protocol • MIT License  

This document serves as the **Central Source of Truth** for all collective memory, architectural decisions, comparative research, and strategic roadmaps for the ZenLab project.

---

```mermaid
flowchart LR
    P1["Phases 1-2: Core 8 Web Labs\n(Completed v0.7.17)"] --> P3["Phase 3: Classroom Lesson Plans Suite\n(Completed docs/lesson_plans/)"]
    P3 --> P4["Phase 4: Native iPad App\n(100% Apple HIG & SwiftUI)"]
    P4 --> P5["Phase 5: Native Android App\n(Jetpack Compose & Material 3)"]
    P5 --> P6["Phase 6: Physical Computing & Edge AI\n(micro:bit & Teachable Machine)"]
```

---

## Phases 1 & 2: Client Infrastructure & 8 Core Web Labs (Completed - v0.7.17)

### A. Core Platform Engines & Zen 2.0 Design System
- [x] **Zero-PII Compliance & Git Hygiene**: Absolute prohibition of personal names, emails, or absolute machine paths in code and commits.
- [x] **Zen 2.0 Design Tokens**: Deep Slate (`#090D16`), zero neon clutter, `lucide-react` icons strictly for system UI, native Hebrew RTL typography (Heebo/Rubik).
- [x] **Web Audio API Engine (`src/core/audio.js`)**: Real-time sine wave synthesis, **debounced Pentatonic Zen Chimes** (C5, E5, G5, C6) preventing auditory overload.
- [x] **Physics Star Particle Animation (`src/core/starEffects.js`)**: Gentle floating star particles launching upon challenge completion to `#zen-stars-header-badge`.
- [x] **Reactive Local Storage Engine (`src/core/storage.js`)**: 24-star tracking, custom animals persistence, and state reset capabilities.
- [x] **Speech Synthesis Narration (`src/core/narration.js`)**: Built-in audio mission reading for 5th-grade emergent readers.
- [x] **Dynamic Mission Guide Banner (`LabMissionGuide.jsx`)**: Step-by-step guidance across all 8 labs with expandable hint drawer.
- [x] **Offline PWA & Service Worker (`public/sw.js`)**: Production-grade caching strategy enabling 100% offline classroom use.
- [x] **Edge AI Tutor (`functions/api/tutor.js`)**: Serverless Gemini edge function answering Hebrew pedagogical queries.

### B. Track 1: Computational Thinking & Algorithms
- [x] **Lab 1: Binary Pixels (`Lab1_BinaryPixels`)**: 8x8 toggle matrix, 64-bit string synchronization, Hex representation, presets, and **high-res 512x512 PNG image export**.
- [x] **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot`)**: 6x6 grid maze, FIFO command queue, key/gate mechanics, and **interactive Single-Step debugging execution**.
- [x] **Lab 3: Decision Tree Detective (`Lab3_DecisionTree`)**: Interactive binary tree builder, feature splits, purity metrics, and **custom animal sandbox modal (pigeonhole principle aware)**.
- [x] **Lab 4: State Space Pathfinder (`Lab4_Pathfinder`)**: 8x8 grid maze, obstacle placement, BFS vs. A* Heuristic comparison with heuristic tie-breaking (15 nodes explored vs. 64 in BFS).

### C. Track 2: Perception, Machine Learning & Modern Generative AI
- [x] **Lab 5: Machine Learning Classifier (`Lab5_MachineLearningClassifier`)**: 2D feature space, training points, smooth query point drag, k-NN algorithm, and training bias analysis.
- [x] **Lab 6: Vision Kernel Studio (`Lab6_VisionKernels`)**: 3x3 convolution kernels (Sobel vertical/horizontal magnitude, sharpen, blur), and sliding window pixel inspector.
- [x] **Lab 7: The Perceptron Switch (`Lab7_Perceptron`)**: Single-layer artificial neuron, weight/bias sliders, 2D linear decision boundary, AND/OR logic gates, and historic XOR failure.
- [x] **Lab 8: Language Model Predictor (`Lab8_LanguageModelPredictor`)**: Next-token prediction, Softmax probability distribution, Temperature slider (0.0 to 1.5), and sentence generation.
- [x] **Printable Certificate of Excellence (`CertificateModal`)**: Official printable award based on stars earned (up to 24 stars) with zero data collection.

---

## Phase 3: Classroom Curriculum & Lesson Plans Suite (Completed in `docs/lesson_plans/`)

Transforming ZenLab from a 2-hour solo experience into an **8-to-12 week structured school curriculum**:
- [x] **Comprehensive 8-Lesson Plan Suite (45-min & 90-min double period)**:
  - `01_PIXELS_AND_BINARY.md` (Lab 1)
  - `02_ALGORITHMIC_ROBOT.md` (Lab 2)
  - `03_DECISION_TREE.md` (Lab 3)
  - `04_PATHFINDER_A_STAR.md` (Lab 4)
  - `05_KNN_CLASSIFIER.md` (Lab 5)
  - `06_VISION_CONVOLUTION.md` (Lab 6)
  - `07_NEURON_PERCEPTRON.md` (Lab 7)
  - `08_LLM_TOKENIZER.md` (Lab 8)
- [x] **Every Lesson Plan Includes**:
  - 7-minute Unplugged physical activity.
  - Minute-by-minute teacher classroom script.
  - Guided solutions for all 3 ZenLab challenges.
  - Creative sandbox extension.
  - 4 common student misconceptions and resolutions.
  - Differentiated learning (scaffolding vs. gifted extensions).
  - Printable double-sided student worksheet.
  - 4-tier assessment rubric.
  - Family AI Quest.
- [ ] **Teacher Portal UI in Web App**:
  - Dedicated "מדריכי הוראה לכיתה" navigation tab for one-click viewing and printing of lesson plans and worksheets.

---

## Phase 4: Native iPad & iOS Application (100% Apple Native)

Strategic expansion to deliver a premium, Apple HIG-compliant app for school iPad carts:
- [x] **Competitive Market Study & FMEA Failure Mode Analysis** (`docs/research/NATIVE_APPS_FEASIBILITY_AND_MARKET_STUDY.he.md`).
- [x] **RFC 003 Native Architecture Specification** (`docs/proposals/RFC_003_NATIVE_APPLE_AND_ANDROID_ARCHITECTURE.he.md`).
- [x] **Minimum OS & Hardware Target (iPadOS 17.0 Minimum Target)**:
  - Broad backward compatibility starting with **iPad 7th gen (2019)**, ensuring 100% support for the thousands of **iPad 8th gen (2020) and iPad 9th gen (2021)** carts deployed across Israeli schools (Geffen / Digital Israel).
  - Unlocks modern Swift 6 capabilities: native `SwiftData` for local-first storage and `@Observable` macro without legacy Combine boilerplate.
- [ ] **Phase 0: Monorepo Foundation (`ios/ZenLab`)**:
  - Shared declarative contract `shared/curriculum.json` (Single Source of Truth).
  - Clean Xcode project using Swift Package Manager (SPM) only.
- [ ] **Phase 1: Apple HIG Core Frameworks**:
  - `NavigationSplitView` on iPad (collapsing to `NavigationStack` on iPhone, native on Apple Silicon Mac).
  - Liquid Glass (`.ultraThinMaterial`) and SF Symbols 6.
  - `AVAudioEngine` for low-latency pentatonic synthesis respecting silent switch (`.ambient`).
  - `CoreHaptics` for tactile switch feedback and challenge completion pulses.
  - `SwiftData` Local-First storage with opportunistic, non-blocking `CloudKit` sync (solving shared school iPad MDM constraints).
  - Computational LTR canvas locked with natural Hebrew RTL surrounding UI.
- [ ] **Phase 2: 8 Labs in SwiftUI & Metal Canvas**:
  - Hardware-accelerated 120fps Metal Canvas for pixel grids, pathfinding, and neural boundaries.
  - Dynamic Server-Driven Curriculum (SDC) synchronization over Cloudflare Edge.
- [ ] **Phase 3: Apple On-Device AI Integration (Zero-Cloud, 100% Zero-PII)**:
  - **NaturalLanguage Framework**:
    - `NLTokenizer`: Real-time on-device Hebrew tokenization for free-text sentences in Lab 8 (0ms latency).
    - `NLEmbedding`: Pre-trained on-device Hebrew vector embeddings for semantic word distances in Lab 5.
  - **Core ML & Apple Neural Engine (ANE)**:
    - Lab 6: Compare manual $3\times3$ Sobel convolution with high-speed Core ML CNN inference executing on the ANE in 1.2ms.
    - Lab 7: Demonstrate solving XOR limitation using a bundled deep neural network model.
  - **Vision Framework**:
    - Contour and shape recognition converting student finger/Apple Pencil drawings directly into $8\times8$ binary grids (Lab 1).
  - **App Intents & Siri**:
    - Voice commands for classroom management and lab resets ("Hey Siri, reset the robot maze in ZenLab").
- [ ] **Phase 4: App Store & Apple School Manager (VPP) Deployment**:
  - Nominal pricing ($1.99–$2.99 with 50% educational volume discount) to cover developer fees.
  - Mathematical Parental Gate and strict Kids Category (Guideline 1.3 / 5.1.4) compliance.

---

## Phase 5: Native Android Application (Jetpack Compose & Material 3)

Subsequent translation to Android:
- [ ] `android/` project using Kotlin and Jetpack Compose.
- [ ] Material 3 Surfaces and RenderEffect/Blur (Android 12+).
- [ ] `Room Database` matching SwiftData schema for local-first storage.
- [ ] Low-latency audio synthesis via `AudioTrack` or `Oboe (C++)`.

---

## Phase 6: Physical Computing & Teachable Machine Bridge (Future)

- [ ] **Hardware Interoperability (Web Serial & Web Bluetooth)**:
  - Direct connection to **BBC micro:bit** and **Arduino Nano ESP32**.
  - Live sensor streaming (accelerometer, light sensor, buttons) directly into the ML classifier.
- [ ] **Teachable Machine Model Ingestion**:
  - TensorFlow.js client-side importer for custom image and pose models trained on Google Teachable Machine.
- [ ] **Classroom Broadcast & Sync Mode**:
  - Peer-to-peer (WebRTC) screen and canvas synchronization from teacher display to student devices without central server overhead.
