# Engineering Roadmap: ZenLab Interactive Platform

This roadmap defines the technical progression of the ZenLab universal educational workspace from core algorithmic and machine learning foundations to physical computing and multi-modal edge intelligence.

---

## Phase 1 & 2: Eight-Lab Master Curriculum Suite (Completed - v0.3.0)
- [x] **Repository Governance & Zero-PII Invariants**: Specifications, RFCs, MIT license, clean Git identity.
- [x] **Client-Side Infrastructure**: React + Vite SPA, Tailwind CSS, Lucide icon suite.
- [x] **Core Platform Engines**:
  - `src/core/audio.js`: Zero-dependency Web Audio API synthesizer (oscillators, ADSR envelope, mute toggle).
  - `src/core/storage.js`: Robust localStorage progress state manager with 24-star tracking and reset capability.
  - `src/core/canvas-particles.js`: Lightweight celebratory canvas particle explosion engine for challenge completion.
  - `src/services/ai.js`: Pluggable deterministic mock AI service (A*, BFS, 2D Convolution, Perceptron, Decision Trees, k-NN, Softmax) with Gemini API bridge.
  - `src/core/narration.js`: SpeechSynthesis and audio narrator engine with subtitles.
- [x] **Track 1: Classical Computational Thinking & Algorithms**:
  - [x] **Lab 1: Binary Pixels (`Lab1_BinaryPixels`)**: 8x8 toggle matrix, real-time 64-bit string synchronization, hex encoding, visual presets.
  - [x] **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot`)**: 6x6 grid maze, visual command queue (Step, Turn Left, Turn Right, Pick Key, Unlock Gate), step debugger.
  - [x] **Lab 3: Decision Tree Detective (`Lab3_DecisionTree`)**: Interactive binary tree builder, feature splits (CanFly, HasFur, Legs), purity and accuracy metrics.
  - [x] **Lab 4: State Space Pathfinder (`Lab4_Pathfinder`)**: 8x8 grid maze, obstacle traversal, step-by-step frontier comparison between BFS and A* Heuristic search.
- [x] **Track 2: Perception, Machine Learning & Modern Generative AI**:
  - [x] **Lab 5: Machine Learning Classifier (`Lab5_MachineLearningClassifier`)**: 2D scatter plot (Weight vs Size), training point insertion, dynamic decision boundary separator, k-NN inference.
  - [x] **Lab 6: Vision Kernel Studio (`Lab6_VisionKernels`)**: 3x3 convolution kernels (Sobel vertical/horizontal, sharpen, blur), interactive sliding window multiply-accumulate inspector.
  - [x] **Lab 7: The Perceptron Switch (`Lab7_Perceptron`)**: Single-layer artificial neuron, weight/bias sliders, 2D decision boundary on unit square, AND/OR logic gates, and the historic XOR limitation.
  - [x] **Lab 8: Language Model Predictor (`Lab8_LanguageModelPredictor`)**: Next-token prediction simulator, probability distribution bar chart, interactive Temperature slider, token generator.
- [x] **Collective Pedagogical & Architectural Memory**:
  - `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.md`: MoE benchmarks, AI4K12 3-5 five big ideas, Bruner's spiral, Zero-Syntax and Zero-PII mandates.
  - `docs/proposals/RFC_002_EIGHT_LAB_MASTER_SUITE.md`: Component contracts and deterministic engine specifications.
- [x] **Cloudflare Pages Production Deployment**: Optimized SPA build (`dist/`), `public/_redirects`, `wrangler.toml`, GitHub Actions CI/CD.

---

## Phase 3: Hardware & Teachable Machine Bridge (Upcoming)
- [ ] **Web Serial & Web Bluetooth Interop**:
  - Direct serial communication from browser to BBC micro:bit and Arduino Nano ESP32.
  - Telemetry streaming from onboard accelerometer/gyroscope into web classifier.
- [ ] **Teachable Machine Model Ingestion**:
  - Client-side TensorFlow.js model importer for custom image and pose models trained on Teachable Machine.
  - Edge execution of image recognition directly within browser sandbox with zero backend latency.
- [ ] **Classroom Broadcast & Sync Mode**:
  - WebRTC peer-to-peer classroom session sharing for teacher demonstrations without central server state.
