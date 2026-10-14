# RFC 004: Matific-Grade Living Toy Architecture & Embedded X-Ray Code Lens

**Document ID:** `ZEN-RFC-004-EN`  
**Status:** Approved, Implemented & Stabilized in Production (`v0.7.24` – `v0.8.1`)  
**Owner:** Code & AI Explorer Team (`team@learnai.internal`) — Design Lead Channel  
**Updated:** October 2026  

---

## 1. Executive Summary & Design Problem

In early releases (`v0.1.0` through `v0.7.23`), ZenLab's 8 interactive Computer Science and AI labs were structured as scientific dashboards (control panels, memory registers, data tables, and coordinate plots). While algorithmically rigorous for 5th–6th grade learners, three core UX challenges emerged:
1. **Tactile Engagement Gap**: Pure dashboard controls can feel intimidating at first glance for 10–12-year-old learners compared to tactile digital toys like **Matific**, **Toca Boca**, and **Duolingo**.
2. **The Over-Simplification Trap**: Stripping away the underlying CS/AI representations (binary `0/1` bits, 8-bit bytes, `IF/ELSE` branch conditions, `f=g+h` heuristic costs, Euclidean distances, $3\times3$ convolution sums, and Softmax probabilities) turns a CS lab into a generic coloring game and destroys its pedagogical value.
3. **Strict Layout Stability (`CLS = 0` / `ΔY = 0px`)**: In a rich interactive stage featuring a cursor-tracking robot character and live X-Ray overlays, any React state re-render on mouse movement or container height change on toggle causes distracting layout jumps.

---

## 2. Core Architectural Solution: "Living Toy Stage + Embedded X-Ray Code Lens"

Rather than choosing between a simplified toy and an engineering dashboard, we designed a unified dual-layer architecture:
- **Layer 1 — The Living Toy Stage**: Every lab is framed as a physical machine inside the cosmic universe of **Zen (`ZenLivingAvatar`)**, featuring real-time emotional states (`happy`, `thinking`, `celebrating`, `error`), 60fps cursor/touch eye tracking, and pentatonic sound feedback.
- **Layer 2 — The Embedded X-Ray Code Lens (`showXRay` / `עדשת קוד`)**: A tactile toggle at the top of every toy chassis projects the live mathematical and algorithmic representation **directly onto the physical toy pieces** (e.g., `0` and `1` numerals etched inside glass bulbs, `IF/ELSE` code badges on sorting chutes, Manhattan heuristic costs on radar tiles).
- **Layer 3 — 100% Non-Destructive Reversibility**: Every lab (Labs 1–8) and the Home Dashboard retain an instant segmented switcher allowing teachers and students to flip between the new Ludic Toy view (`🌟 פיילוט משחקי (Matific)`) and the classic scientific view (`🔬 מעבדה מדעית`).

---

## 3. Chronological Evolution (`v0.7.24` – `v0.8.1`)

1. **`v0.7.24` — Zen 2.0 Editorial & Bright Classroom Mode (`מצב דפים`)**:
   - Introduced dual-mode classroom accessibility (`isDapimActive`) providing high-contrast warm paper surfaces for sunlit classrooms and projectors alongside the Deep Space dark theme.
2. **`v0.7.25` — Progressive Disclosure (2-Phase Labs) & Adventure Journey Map**:
   - Split every lab into **Phase 1: Media & Theory Briefing (`TheoryView.jsx`)** and **Phase 2: Interactive Research Game** via a compact `LabPhaseHeader.jsx`.
   - Added `AdventureJourneyMap.jsx` on the Home Dashboard with a reversible switcher (`🗺️ מפת מסע משחקית` vs `📋 תצוגת מעבדות כיתתית`).
3. **`v0.7.26` & `v0.7.27` — Lab 1 Living Toy Pilot & Binary X-Ray Lens**:
   - Built `MatificPilotLab1.jsx` featuring Zen holding a 64-bulb light matrix, paired with the Binary X-Ray Lens (`עדשת קוד [01]`), 8-Byte row rulers (`בייט 1`..`בייט 8` + Hex `0x..`), and a two-way 64-bit memory punch-tape.
4. **`v0.8.0` — Gemini 4 Site-Wide Transformation via 4 Parallel Subagents**:
   - Extracted shared core components `ZenLivingAvatar.jsx` and `LudicLabShell.jsx`.
   - Dispatched 4 parallel subagents with strict non-overlapping file ownership to transform the Overworld (`AdventureJourneyMap.jsx`, `HomeDashboard.jsx`, `LabPhaseHeader.jsx`, `TheoryView.jsx`) and build bespoke Matific-grade Living Toy + X-Ray Lens views for Labs 2–8 (`MatificLab2Robot.jsx` through `MatificLab8Llm.jsx`).
5. **`v0.8.1` — Zero-Layout-Shift (`CLS = 0`) & 60fps DOM Eye Tracking Stabilization**:
   - Replaced `useState` mousemove listeners with direct DOM `useRef` + `window.requestAnimationFrame` (`translate3d`) transforms on Zen's pupils.
   - Converted the "איך זה עובד?" drawer into an absolute overlay and locked heights across all X-Ray formula bars and ribbons, achieving `ΔY = 0px` across the Overworld and all 8 Labs (verified via automated Playwright testing).
