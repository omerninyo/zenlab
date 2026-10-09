# ZenLab: Interactive Computer Science & AI Educational Workspace

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Platform: Cloudflare Pages](https://img.shields.io/badge/platform-Cloudflare%20Pages-orange.svg)]()
[![Privacy: Zero--PII](https://img.shields.io/badge/privacy-Strict%20Zero--PII-emerald.svg)](SECURITY.md)
[![Design System: Zen 2.0](https://img.shields.io/badge/design%20system-Zen%202.0-yellow.svg)](design-system/README.md)
[![Target: Grade 5 (Ages 10-11)](https://img.shields.io/badge/curriculum-Grade%205%20MoE%20&%20AI4K12-indigo.svg)](docs/wiki/Pedagogical-Framework.md)
[![Language: Hebrew RTL](https://img.shields.io/badge/language-Hebrew%20(RTL)%20Native-blueviolet.svg)](README.he.md)

**A tactile, browser-native learning laboratory designed to demystify computer hardware, algorithms, and artificial intelligence for elementary school students.**

[🌐 Live Deployment](https://zenlab.pages.dev) &bull; [🇮🇱 מדריך מלא בעברית](README.he.md) &bull; [📚 Master Wiki](docs/wiki/Home.md) ([עברית](docs/wiki/Home.he.md)) &bull; [💬 Discussions](https://github.com/omerninyo/zenlab/discussions) &bull; [🎨 Zen 2.0 Design Kit](design-system/README.md)

</div>

---

## 💡 About ZenLab

**ZenLab** is an open-source, client-side educational platform engineered specifically for Grade 5 students (ages 10–11). It bridges the gap between passive syntax block-coding (like Scratch) and black-box AI tools by providing **transparent, manipulable microworlds** where children directly interact with the mathematical and algorithmic foundations of computing.

### Key Highlights
- **100% Client-Side SPA**: Zero backend servers, zero databases, zero cloud dependencies. Runs entirely inside the modern browser.
- **Strict Zero-PII & Child Privacy**: No accounts, no logins, no tracking cookies. All learning progress stays locally inside the student's browser `localStorage`.
- **Procedural Sound Synthesis**: Native Web Audio API generates harmonious audio feedback without downloading heavy audio files.
- **Zen 2.0 Design Framework**: Apple Liquid Glass aesthetics, Radix Slate scale, and crisp tactile cards calibrated for children without chromatic clutter.
- **Full Native RTL & Hebrew Copy**: Culturally calibrated Hebrew pedagogy aligned with the Israeli Ministry of Education (אגף מדעים / מדעי המחשב) and global AI4K12 standards.
- **Inclusive Language Standard**: Unambiguous plural address (`לחצו`, `גררו`, `שלכם`) protecting female student engagement and preventing speech synthesis (TTS) mispronunciations.

---

## 🧪 The Eight-Lab Master Suite

The curriculum is structured into two parallel cognitive tracks designed for 5th graders:

### Track 1: Classical Computational Thinking & Algorithms
| Module | Concept | Interactive Principle Simulation | Hands-on Sandbox |
| :--- | :--- | :--- | :--- |
| **Lab 1: Binary Pixels** | Bits, Bytes, RGB, Hex, Logic Gates | **Binary Scale & Half-Adder**: Toggle 8 bits to compute base-10/hex values; test AND, OR, NOT, and XOR circuits. | **8x8 Matrix Canvas**: Draw shapes, inspect real-time bit streams, and solve row-addressing challenges. |
| **Lab 2: Algorithmic Robot** | Sequencing, Preconditions, CPU Cycle | **CPU Instruction Pipeline**: Visual Conveyor belt showing Fetch $\to$ Decode $\to$ Execute stages with PC, ALU, and ACC. | **6x6 Maze Arena**: Build command sequences (Forward, Turn, Pick Key, Unlock Gate) to reach the goal star. |
| **Lab 3: Decision Tree Detective** | Binary Branching, Entropy, Purity | **Interactive Tree Splitter**: Trace animals through yes/no questions down to classification leaves. | **Animal Classifier**: Pick features to balance splits, watch the real-time Purity Meter, and achieve 100% accuracy. |
| **Lab 4: State Space Pathfinder** | Graphs, Heuristics, Shortest Paths | **Blind vs. Smart Search ($A^*$)**: Compare radial breadth-first search against a smart compass vector (Waze analogy). | **8x8 Obstacle Maze**: Draw wall barriers with your mouse or finger, test algorithms, and count explored nodes. |

### Track 2: Perception, Machine Learning & Modern Generative AI
| Module | Concept | Interactive Principle Simulation | Hands-on Sandbox |
| :--- | :--- | :--- | :--- |
| **Lab 5: Machine Learning Classifier** | 2D Feature Space, k-NN, Bias | **k-Nearest Neighbors Circle**: Drag a test fruit to expand a neighborhood radius and watch majority voting. | **2D Feature Plane**: Place training points (weight vs. size), tune hyperparameter $k$, and investigate dataset bias. |
| **Lab 6: Vision Kernel Studio** | 2D Image Convolutions, Edge Filters | **3x3 Moving Filter**: Slide a convolution kernel across pixels to see multiply-accumulate edge detection live. | **8x8 Filter Canvas**: Apply Sobel vertical/horizontal, sharpen, and blur kernels to detect custom shape contours. |
| **Lab 7: The Perceptron Switch** | Artificial Neurons, Weights, XOR | **Neuron Activation Gauge**: Adjust inputs, synapse weights, and bias threshold to see when the neuron fires. | **2D Decision Boundary**: Tilt the separation line on a coordinate plane; discover why a single neuron fails XOR. |
| **Lab 8: Language Model Predictor** | Next-Token Prediction, Temperature, Attention | **Softmax Temperature Gauge**: Flatten or sharpen probability bars; explore word-connection attention maps. | **Sentence Autocomplete**: Predict text word-by-word, test temperatures from 0.0 to 1.5, and learn to fact-check AI. |

---

## 📚 Complete Wiki & Educational Documentation

Comprehensive pedagogical guides, lesson plans, and research are available in our [`docs/wiki/`](docs/wiki/Home.md):
- [**Pedagogical Framework**](docs/wiki/Pedagogical-Framework.md) ([עברית](docs/wiki/Pedagogical-Framework.he.md)): Israeli MoE standards, AI4K12 5 Big Ideas, Piagetian Constructionism.
- [**Curriculum Master Index**](docs/wiki/Curriculum-Master-Index.md) ([עברית](docs/wiki/Curriculum-Master-Index.he.md)): Exhaustive breakdown of all 8 labs, analogies, and solutions.
- [**Teacher's Classroom Guide**](docs/wiki/Teachers-Classroom-Guide.md) ([עברית](docs/wiki/Teachers-Classroom-Guide.he.md)): 45-minute lesson workflows, pair programming, rubrics.
- [**Architecture & Tech Stack**](docs/wiki/Architecture-and-Tech-Stack.md) ([עברית](docs/wiki/Architecture-and-Tech-Stack.he.md)): Technical architecture, storage engine, sound synthesis.
- [**Student Discovery Worksheet**](docs/STUDENT_WORKSHEET.md) ([עברית](docs/STUDENT_WORKSHEET_HE.md)): Printable classroom discovery sheet.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

```bash
# 1. Clone repository
git clone https://github.com/omerninyo/zenlab.git
cd zenlab

# 2. Install dependencies
npm install

# 3. Start local development server (with instant HMR)
npm run dev

# 4. Open in browser at http://localhost:5173
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ☁️ Cloudflare Pages Deployment

ZenLab is ready for zero-configuration deployment to Cloudflare Pages:

1. **SPA Routing**: Pre-configured in [`public/_redirects`](public/_redirects) (`/* /index.html 200`).
2. **Automated CI/CD**: Workflow configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
3. **Manual CLI Deploy**:
   ```bash
   npx wrangler pages deploy dist --project-name=zenlab
   ```

---

## 🤝 Community & Contributing

We welcome contributions from educators, developers, and researchers!
- **Contributing Guidelines**: See [`CONTRIBUTING.md`](CONTRIBUTING.md) ([עברית](CONTRIBUTING.he.md)).
- **Code of Conduct**: Review our kid-safe educational community standards in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
- **Issue Templates**: Report bugs or propose features using our [GitHub Issue Forms](https://github.com/omerninyo/zenlab/issues).
- **Discussions**: Ask questions or share lesson plans in [GitHub Discussions](https://github.com/omerninyo/zenlab/discussions).
- **Security & Privacy**: Read our Zero-PII policy in [`SECURITY.md`](SECURITY.md).

---

## 📄 License & Attribution

- **License**: Released under the permissive [MIT License](LICENSE).
- **Author Identity**: Code & AI Explorer Team (`team@learnai.internal`).
- **Icons**: [Lucide Icons](https://lucide.dev) (ISC License).
