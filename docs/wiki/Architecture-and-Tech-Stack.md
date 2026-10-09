# Technical Architecture & Stack Specification

> 🇮🇱 **גרסת הארכיטקטורה בעברית**: זמינה ב-[`Architecture-and-Tech-Stack.he.md`](Architecture-and-Tech-Stack.he.md).

---

## 1. High-Level Architectural Overview

ZenLab is engineered as a **Pure Client-Side Single Page Application (SPA)** with zero server-side runtime dependencies.

```text
+------------------------------------------------------------------------+
|                             VITE + REACT 18 SPA                        |
+------------------------------------------------------------------------+
|   Top Navigation Bar   |   Hebrew RTL Layout Engine   |  Lucide Icons  |
+------------------------------------------------------------------------+
|                               VIEWS                                    |
|   HomeDashboard        |   TheoryView (Video/Tour)    |  Lab Sandbox   |
+------------------------------------------------------------------------+
|                            CORE ENGINES                                |
|   StorageEngine        |   AudioEngine (Web Audio)    |  ZenAiTutor    |
+------------------------------------------------------------------------+
|                         PERSISTENCE & SECURITY                         |
|   window.localStorage  |   Strict Zero-PII            |  Sandboxed     |
+------------------------------------------------------------------------+
|                         EDGE HOSTING & CDN                             |
|   Cloudflare Pages Edge Network   |   public/_redirects (SPA Fallback) |
+------------------------------------------------------------------------+
```

---

## 2. Technical Stack Matrix

| Component | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | React | 18.3.1 | Declarative component UI and reactive state tree. |
| **Bundler & Tooling** | Vite | 6.x | Near-instant HMR, tree-shaking, and optimized production rollups. |
| **Design Framework** | Zen 2.0 | 2.0 | Liquid Glass, Radix Slate scale, Velvet Mist ambient lighting. |
| **CSS & Utility Engine**| Tailwind CSS | 3.4.x | Scoped responsive utilities and custom design token mapping. |
| **Iconography** | Lucide React | 1.16+ | Clean, uniform SVG icon tokens across all system controls. |
| **Audio Engine** | Web Audio API | Native | Procedural frequency synthesis; zero external audio network requests. |
| **Deployment Target** | Cloudflare Pages | Edge | Sub-50ms global latency, automated GitHub CI/CD, SSL, and SPA redirects. |

---

## 3. Core Subsystems

### 1. StorageEngine (`src/core/storage.js`)
- **Reactive Pub/Sub Architecture**: Wraps `window.localStorage` with subscriber listeners, allowing decoupled state updates between header badges, lab completion checks, and the home dashboard.
- **Offline Persistence**: Stores earned stars, completed challenges, developer rank, and current lab index locally.
- **Graceful Fallback**: In private browsing mode where `localStorage` might be restricted, gracefully degrades to an in-memory session cache.

### 2. AudioEngine (`src/core/audio.js`)
- **Procedural Sound Synthesis**: Generates sound effects directly via the browser's `AudioContext` without loading external audio assets.
- **Oscillator Types & Chords**:
  - `playTone()`: Sine wave tones with exponential gain decay.
  - `playCollect()`: 4-note ascending arpeggio (C5, E5, G5, C6) for collecting items.
  - `playSuccess()`: 5-note fanfare (A4, C#5, E5, A5, C#6) for challenge completion.
  - `playError()`: Low sawtooth pitch-bend ramp (180Hz $\to$ 110Hz) for collisions.
- **Mute Invariant**: Global mute state instantly shuts off all sound and propagates to header controls.

### 3. Zen 2.0 Design System (`src/styles/design-tokens.css`)
- **Dual Light/Dark Baseline**:
  - *Light Mode (Default)*: High-contrast canvas (`#f8fafc`), crisp tactile cards (`#ffffff`), and slate typography (`#0f172a`).
  - *Dark Mode*: Deep cinema slate (`#0c0d10`) with specular edge highlights.
- **Champagne Gold Brand Accent**: Fixed as the baseline palette (`#ca8a04` Light / `#eab308` Dark) across stars and milestones.
- **Anti-Bubble Discipline**: Enforces crisp rectangular geometries (8px–12px radii), preventing rounded capsules from clipping Hebrew typography.

---

## 4. Cloudflare Pages Production Invariants

1. **SPA Redirect Rule (`public/_redirects`)**:
   ```text
   /* /index.html 200
   ```
   Ensures that deep links and page refreshes route through the single-page application without throwing HTTP 404 errors.
2. **Strict Zero-PII Policy**:
   No student names, personal emails, or machine file paths exist in committed code or CI artifacts. Identity is maintained strictly as `Code & AI Explorer Team <team@learnai.internal>`.
