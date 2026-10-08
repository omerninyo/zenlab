# ZenLab: Interactive Computer Science & AI Educational Workspace

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/platform-Cloudflare%20Pages-orange.svg)]()

ZenLab is an open-source, client-side educational platform designed to teach foundational computer science, algorithmic reasoning, and artificial intelligence principles interactively.

The platform runs 100% in the browser with zero backend requirements, zero telemetry, and full native Right-to-Left (RTL) Hebrew language support.

---

## Interactive Micro-Labs

### 1. Binary Pixels (`Lab1_BinaryPixels`)
- **Core Concept**: Binary encoding of images, bits, bytes, and hexadecimal data representation.
- **Features**: 8x8 toggle matrix, real-time 64-bit binary and hex streaming, graphic presets (Heart, Smiley, Sword), and custom initial symbol challenges.

### 2. Algorithmic Robot (`Lab2_AlgorithmicRobot`)
- **Core Concept**: Deterministic algorithmic execution, sequence order, preconditions, and logic debugging.
- **Features**: 6x6 grid maze, visual command queue (Forward, Turn Left, Turn Right, Pick Key, Unlock Gate), step-by-step playback with visual execution pointer, and explicit collision/error traps.

### 3. Machine Learning Classifier (`Lab3_MachineLearningClassifier`)
- **Core Concept**: Supervised classification in 2D feature space, k-Nearest Neighbors (k-NN), decision boundaries, and confidence metrics.
- **Features**: Interactive training sample placement, draggable test item, Euclidean distance neighborhood visualization, and dynamic $k$-hyperparameter adjustment ($k \in \{1, 3, 5\}$).

### 4. Language Model Predictor (`Lab4_LanguageModelPredictor`)
- **Core Concept**: Next-token probability prediction in Large Language Models (LLMs), Softmax temperature scaling, and sampling dynamics.
- **Features**: Selectable pedagogical context prompts, interactive Temperature slider ($0.0 \le T \le 1.5$), real-time probability distribution bar chart, and token-by-token sentence generator.

---

## Core System Architecture

```text
+-----------------------------------------------------------------------+
|                           Vite + React SPA                            |
+-----------------------------------------------------------------------+
|  Routing / Navigation  |  Hebrew Typography & RTL  |   Lucide Icons   |
+-----------------------------------------------------------------------+
|                            Core Engines                               |
|  - Web Audio API Synthesizer (Zero asset dependencies)                |
|  - Reactive LocalStorage State & Star Manager                         |
|  - Canvas Particle Celebration Engine                                 |
|  - Pluggable AI Service (Deterministic Mock + Gemini Bridge)          |
+-----------------------------------------------------------------------+
|                       Curriculum Data Layer                           |
|  - src/data/curriculum.json (Pedagogical copy, criteria, glossary)     |
+-----------------------------------------------------------------------+
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Local Development
```bash
# Clone repository
git clone https://github.com/omerninyo/zenlab.git
cd zenlab

# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## Cloudflare Pages Deployment

This project is optimized for direct hosting on Cloudflare Pages as a Single Page Application (SPA).

1. **SPA Route Fallback**: Included in [`public/_redirects`](public/_redirects) (`/* /index.html 200`).
2. **Build Configuration**:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Automated CI/CD**: See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Manual CLI Deployment via Wrangler
```bash
npx wrangler pages deploy dist --project-name=zenlab
```

---

## Governance & Zero-PII Policy

- **Strict Zero-PII**: No personal names, personal email addresses, private API keys, or absolute local machine paths are committed.
- **License**: Released under the [MIT License](LICENSE).
- **Author Identity**: Code & AI Explorer Team.
- **Governance Directives**: See [`.agent/rules.md`](.agent/rules.md) and [`AGENTS.md`](AGENTS.md).
