# ZenLab: Interactive Computer Science & AI Educational Workspace

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/platform-Cloudflare%20Pages-orange.svg)]()

ZenLab is an open-source, client-side educational platform designed to teach foundational computer science, algorithmic reasoning, and artificial intelligence principles interactively.

The platform runs 100% in the browser with zero backend requirements, zero telemetry, and full native Right-to-Left (RTL) Hebrew language support.

> 🇮🇱 **Full Hebrew Documentation**: A complete Hebrew guide is available at [`README.he.md`](README.he.md).
> 📋 **Pedagogical Resources**: [Teacher's Lesson Guide](docs/TEACHERS_GUIDE_HE.md) &bull; [Student Discovery Worksheet](docs/STUDENT_WORKSHEET.md) ([עברית](docs/STUDENT_WORKSHEET_HE.md)) &bull; [Global Competitive Benchmark](docs/research/COMPETITIVE_BENCHMARK_AND_INNOVATION.md).

---

## Interactive Eight-Lab Master Suite

The curriculum is structured into two parallel cognitive tracks designed for Grade 5 (Ages 10–11):

### Track 1: Classical Computational Thinking & Algorithms
1. **Lab 1: Binary Pixels (`Lab1_BinaryPixels`)**:
   - *Core Concept*: Binary encoding of images, bits, bytes, and hexadecimal data representation.
   - *Features*: 8x8 toggle matrix, real-time 64-bit binary and hex streaming, graphic presets, and symbol challenges.
2. **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot`)**:
   - *Core Concept*: Deterministic sequence execution, preconditions, and logic debugging.
   - *Features*: 6x6 grid maze, visual command queue (Forward, Turn Left, Turn Right, Pick Key, Unlock Gate), step debugger.
3. **Lab 3: Decision Tree Detective (`Lab3_DecisionTree`)**:
   - *Core Concept*: Hierarchical branching, conditionals (`if-then-else`), feature splitting, and information purity.
   - *Features*: Interactive tree builder, feature splits (CanFly, HasFur, Legs), real-time purity bar, and animal test tracer.
4. **Lab 4: State Space Pathfinder (`Lab4_Pathfinder`)**:
   - *Core Concept*: Graph search, state space exploration, obstacles, and heuristic algorithms (BFS vs. A*).
   - *Features*: 8x8 grid maze, obstacle wall builder, step-by-step frontier comparison showing explored nodes count and shortest path.

### Track 2: Perception, Machine Learning & Modern Generative AI
5. **Lab 5: Machine Learning Classifier (`Lab5_MachineLearningClassifier`)**:
   - *Core Concept*: Supervised classification in 2D feature space, k-Nearest Neighbors (k-NN), and decision boundaries.
   - *Features*: Interactive sample placement, draggable test item, Euclidean distance neighborhood visualization, and $k$ adjustments.
6. **Lab 6: Vision Kernel Studio (`Lab6_VisionKernels`)**:
   - *Core Concept*: 2D image convolutions, $3 \times 3$ kernel matrices, multiply-accumulate (MAC) math, and edge detection.
   - *Features*: 8x8 pixel canvas with presets (vertical stripes, squares, cross), Sobel/sharpen/blur filters, and interactive pixel inspector.
7. **Lab 7: The Perceptron Switch (`Lab7_Perceptron`)**:
   - *Core Concept*: Single-layer artificial neuron, synapse weights, threshold bias, linear separability, and logic gates.
   - *Features*: $w_1, w_2, b$ sliders, dynamic decision boundary on unit square, AND/OR gate training, and the historic XOR limitation.
8. **Lab 8: Language Model Predictor (`Lab8_LanguageModelPredictor`)**:
   - *Core Concept*: Next-token prediction in LLMs, Softmax temperature scaling, and sampling dynamics.
   - *Features*: Context prompts, interactive Temperature slider ($0.0 \le T \le 1.5$), real-time probability bar chart, and autoregressive generation.

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

> **Detailed Guide**: For detailed step-by-step instructions, testing checklists, and troubleshooting in Hebrew, refer to [**`docs/RUN_LOCALLY.md`**](docs/RUN_LOCALLY.md).

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
