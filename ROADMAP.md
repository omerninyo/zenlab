# Engineering Roadmap: ZenLab Interactive Platform

This roadmap defines the technical progression of the ZenLab universal educational workspace from core algorithmic and machine learning foundations to physical computing and multi-modal edge intelligence.

---

## Phase 1: Core Pedagogical Engine & Foundational Micro-Labs (Current)
- [x] **Repository Governance & Zero-PII Invariants**: Specifications, RFCs, MIT license, clean Git identity.
- [x] **Client-Side Infrastructure**: React + Vite SPA, Tailwind CSS, Lucide icon suite.
- [x] **Core Platform Engines**:
  - `src/core/audio.js`: Zero-dependency Web Audio API synthesizer (oscillators, ADSR envelope, mute toggle).
  - `src/core/storage.js`: Robust localStorage progress state manager with star tracking and reset capability.
  - `src/core/canvas-particles.js`: Lightweight celebratory canvas particle explosion engine for challenge completion.
  - `src/services/ai.js`: Pluggable deterministic mock AI service with seamless Gemini API fallback/hook.
- [x] **Foundational Micro-Labs**:
  - **Lab 1: Binary Pixels (`Lab1_BinaryPixels`)**: 8x8 toggle matrix, real-time 64-bit string synchronization, hex encoding, visual presets (heart, smiley, sword), custom initial challenge.
  - **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot`)**: 6x6 grid maze, visual command queue (Step, Turn Left, Turn Right, Pick Key, Unlock Gate), step-by-step debugger playback, deterministic logic error traps.
  - **Lab 3: Machine Learning Classifier (`Lab3_MachineLearningClassifier`)**: 2D scatter plot (Weight vs Size), interactive training point insertion, dynamic decision boundary separator, real-time inference with confidence score.
  - **Lab 4: Language Model Predictor (`Lab4_LanguageModelPredictor`)**: Next-token prediction simulator, dynamic probability distribution bar chart, interactive Temperature slider, token-by-token sequence generator.
- [x] **Cloudflare Pages Production Deployment**: Optimized SPA build, `public/_redirects`, `wrangler.toml`, GitHub Actions CI/CD.

---

## Phase 2: Advanced Labs & Multi-Modal Extensions
- [ ] **Lab 5: Neural Network Visualizer**: Single-layer perceptron weights, bias adjustments, forward pass activation animations.
- [ ] **Lab 6: Computer Vision Kernel Convolutions**: Interactive 3x3 filter matrix (edge detection, blur, sharpen) applied to user-drawn or sample pixel grids.
- [ ] **Lab 7: Audio Frequency Spectrogram**: Web Audio microphone Fourier transform analyzer (FFT) for sound classification.
- [ ] **Lab 8: Prompt Engineering & Hallucination Sandbox**: Exploration of system prompt constraints, context windows, and hallucination boundary detection.
- [ ] **Curriculum Expansion**: Multi-tier difficulty progression (Beginner, Intermediate, Advanced) with downloadable completion certificate.

---

## Phase 3: Hardware & Teachable Machine Bridge
- [ ] **Web Serial & Web Bluetooth Interop**:
  - Direct serial communication from browser to BBC micro:bit and Arduino Nano ESP32.
  - Telemetry streaming from onboard accelerometer/gyroscope into web classifier.
- [ ] **Teachable Machine Model Ingestion**:
  - Client-side TensorFlow.js model importer for custom image and pose models trained on Teachable Machine.
  - Edge execution of image recognition directly within browser sandbox with zero backend latency.
- [ ] **Classroom Broadcast & Sync Mode**:
  - WebRTC peer-to-peer classroom session sharing for teacher demonstrations without central server state.
