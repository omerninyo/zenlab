# RFC 001: Core Architecture & Pedagogical Engine Specification

- **Status**: Accepted
- **Author**: Code & AI Explorer Team
- **Created**: 2026-10-08
- **Scope**: Platform Architecture, State Schema, Curriculum Specification, Component Contracts

---

## 1. Executive Summary

ZenLab is an open-source, client-side educational platform designed to teach core computer science and artificial intelligence principles interactively. The system operates strictly client-side as a Single Page Application (SPA), guaranteeing high responsiveness, zero backend operating costs, full offline capability, and high security with zero PII exposure.

---

## 2. Architectural Pillars

```
+--------------------------------------------------------------------------+
|                            Vite + React SPA                              |
+--------------------------------------------------------------------------+
|  Routing / Navigation  |  Hebrew Typography & RTL   |  Lucide Icons     |
+--------------------------------------------------------------------------+
|                              Core Engines                                |
|  - Audio Synthesizer (Web Audio API)                                    |
|  - Progress & Star Manager (LocalStorage)                               |
|  - Celebration Particle System (HTML5 Canvas)                           |
|  - Pluggable AI Service (Deterministic Mock & Gemini API Bridge)         |
+--------------------------------------------------------------------------+
|                           Micro-Lab Modules                              |
|  [Lab 1: Binary Pixels]           [Lab 2: Algorithmic Robot]             |
|  [Lab 3: ML Classifier]           [Lab 4: LLM Next-Token Predictor]      |
+--------------------------------------------------------------------------+
|                       Curriculum Data Layer                              |
|  - src/data/curriculum.json (RTL Hebrew Copy, Concepts, Challenges)     |
+--------------------------------------------------------------------------+
```

---

## 3. Data Schema & Curriculum Specification

All user-facing pedagogical copy, interactive challenge descriptions, hints, and instructional steps reside strictly in `src/data/curriculum.json`. UI components render layout and manage state, maintaining strict separation of concerns.

### 3.1 Curriculum JSON Schema

```typescript
interface CurriculumData {
  version: string;
  metadata: {
    title: string;
    description: string;
    locale: "he-IL";
    direction: "rtl";
  };
  labs: Record<string, LabCurriculum>;
}

interface LabCurriculum {
  id: string; // "lab1", "lab2", "lab3", "lab4"
  title: string;
  subtitle: string;
  badge: string;
  conceptExplanation: {
    summary: string;
    keyPoints: string[];
    realWorldAnalogy: string;
  };
  challenges: Challenge[];
  presets?: Record<string, any>;
  glossary: Array<{ term: string; definition: string }>;
}

interface Challenge {
  id: string;
  title: string;
  instructions: string;
  hint: string;
  successMessage: string;
  targetCriteria: Record<string, any>;
  rewardStars: number;
}
```

---

## 4. Core Engine Contracts

### 4.1 Audio Engine (`src/core/audio.js`)

A zero-external-dependency audio synthesizer leveraging the native browser Web Audio API (`AudioContext`). It provides distinct sound feedback cues without loading external MP3/WAV assets:

```javascript
export const AudioEngine = {
  // State
  isMuted: boolean,
  toggleMute(): boolean,
  
  // Tonal feedback triggers
  playTone(frequency: number, duration: number, type: OscillatorType): void,
  playToggle(on: boolean): void,
  playStep(): void,
  playCollect(): void,
  playSuccess(): void,
  playError(): void,
  playToken(): void
};
```

### 4.2 Storage & Progress Engine (`src/core/storage.js`)

Manages client-side persistence of completed challenges, earned stars, lab state, and audio preferences.

```javascript
interface ProgressState {
  completedChallenges: Record<string, boolean>; // { "lab1_challenge1": true }
  labStars: Record<string, number>;             // { "lab1": 3, "lab2": 2 }
  totalStars: number;
  isMuted: boolean;
  activeLabId: string;
}

export const StorageEngine = {
  getState(): ProgressState,
  completeChallenge(labId: string, challengeId: string, stars: number): ProgressState,
  setMuted(muted: boolean): void,
  resetProgress(): void
};
```

### 4.3 Deterministic AI Service (`src/services/ai.js`)

Decouples UI components from external AI vendors. Operates out-of-the-box in deterministic mock mode, with an optional runtime bridge to Google Gemini API via `VITE_GEMINI_API_KEY`:

```javascript
export const AIService = {
  // Returns next-token probabilities given a prompt and temperature
  async predictNextTokens(context: string, temperature: number): Promise<{
    tokens: Array<{ token: string; probability: number }>;
    chosenToken: string;
    explanation: string;
  }>,

  // Performs 2D classification given training points and a query coordinate
  classifyPoint(
    trainPoints: Array<{ x: number; y: number; label: string }>,
    queryPoint: { x: number; y: number },
    k?: number
  ): {
    predictedLabel: string;
    confidence: number;
    nearestNeighbors: Array<{ x: number; y: number; label: string; distance: number }>;
  }
};
```

---

## 5. Micro-Lab Component Specifications

### 5.1 Lab 1: Binary Pixels (`Lab1_BinaryPixels.jsx`)
- **Visuals**: Interactive 8x8 toggle matrix, monochromatic contrast styling.
- **Data Binding**: Bi-directional binding between grid cells and a 64-character binary string (`0100...`) and hexadecimal representation.
- **Challenges**: Match pre-defined binary pixel art (Heart, Smiley, Sword, Custom letter initial).
- **Feedback**: Web Audio tick on toggle, celebratory particle burst on challenge match.

### 5.2 Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot.jsx`)
- **Visuals**: 6x6 grid with Start, Obstacles (walls), Collectible Key, Gate, and Goal tile.
- **Controls**: Command queue block builder (`forward`, `turnLeft`, `turnRight`, `pickKey`, `unlockGate`).
- **Execution**: Asynchronous step-by-step playback with visual indicator of the currently executing command.
- **Error Handling**: Deterministic detection of boundary collisions, wall hits, or attempting to pass locked gates without keys.

### 5.3 Lab 3: Machine Learning Classifier (`Lab3_MachineLearningClassifier.jsx`)
- **Visuals**: 2D coordinate space (normalized X: Size, Y: Weight) displaying two distinct classes (e.g., "Apple" vs "Watermelon" or "Drone" vs "Bird").
- **Interactivity**: Click to add training points, drag query test point, adjust k-nearest neighbors slider ($k=1, 3, 5$).
- **Visual Boundary**: Real-time canvas/SVG decision boundary calculation illustrating how the classifier partitions feature space.
- **Confidence Metric**: Dynamic percentage indicator calculated from class proportion among nearest neighbors.

### 5.4 Lab 4: Language Model Predictor (`Lab4_LanguageModelPredictor.jsx`)
- **Visuals**: Token stream display, next-token candidate probability bar chart, temperature slider ($T \in [0.0, 1.5]$).
- **Dynamics**: When $T=0$, deterministic greedy selection (always highest probability). When $T > 0$, stochastic sampling modulated by softmax temperature scaling:
  $$P(w_i) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$
- **Interaction**: Step-by-step token generation showing model probability redistribution at each word.

---

## 6. Public Release & Zero-PII Invariant Verification

All contributions must verify that:
1. No local directory strings or developer identities exist in source files.
2. Build outputs strictly to `dist/`.
3. Routing fallbacks in `public/_redirects` enable direct navigation to `/` and sub-routes without Cloudflare Pages 404 errors.
