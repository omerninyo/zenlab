# Master Project Rules & Agent Governance Protocol

This document defines the non-negotiable operational invariants, architectural standards, visual rules, and governance protocol for this repository. All autonomous agents and contributors must strictly adhere to these specifications.

---

## 1. Direction & Language Invariant
- **Hebrew Response Tagging**: EVERY SINGLE AGENT RESPONSE CONTAINING HEBREW CHARACTERS MUST BE WRAPPED IN `<div dir="rtl">` AND `</div>`.
- **No Orphan RTL**: Never emit RTL text without explicit opening `<div dir="rtl">` and closing `</div>` boundary tags.
- **Pedagogical Text Separation**: All Hebrew pedagogical copy, instructions, challenges, and user-facing explanations must reside strictly in data files (e.g., `src/data/curriculum.json`), maintaining strict separation between content and presentation logic.

---

## 2. Communication Style, Strict Anti-Sycophancy & The 10th Man Mandate
- **Macro-Level Planning First**: State once in clear conversational terms what will be executed before calling tool batches.
- **Silent Read-Only Operations**: Do not emit conversational commentary before read-only inspection calls (`cat`, `ls`, `grep`, `git status`, test runs).
- **Mandatory Notice Before State Modifications**: Inform immediately before writing/modifying files, running git mutations, or modifying environments.
- **Strict Anti-Sycophancy Mandate**: Zero flattery, zero praise, no empty compliments ("מעולה", "גאוני", "צודק", "great job"). Maintain a cold, direct, analytical, and technical tone at all times.
- **The 10th Man / Red Team Mandate (Devil's Advocate)**: Whenever a new major feature, secondary product domain, architectural shift, or multi-app expansion is proposed, the agent MUST NOT simply agree or rubber-stamp the request. The agent is strictly required to assume a 10th Man / Red Team role: rigorously stress-testing the idea, uncovering hidden friction, maintenance debts, blast radius risks, domain pollution, and cognitive overhead, while presenting concrete alternatives and hard trade-offs.

---

## 3. Zero-PII, License Hygiene & Public GitHub Readiness
- **STRICT ZERO-PII MANDATE**: This repository is designed for public hosting on GitHub.
  - Absolutely NO personal names, personal email addresses, local absolute machine paths (`/Users/...`, `/home/...`), private API keys, or personal tokens in any committed file, configuration, test artifact, or git log.
  - Commits must use the generic identity:
    - Name: `Code & AI Explorer Team`
    - Email: `team@learnai.internal` (or `code-and-ai-explorer@users.noreply.github.com`)
- **Environment Secrets**: All secrets and configuration keys must be loaded exclusively via `VITE_*` environment variables. Provide a sanitized `.env.example` in the root.
- **License**: Standard MIT License.
- **Dependency Hygiene**: Strictly forbidden to ingest or link code from copyleft/viral licenses (GPL/AGPL). Use only permissive dependencies (MIT, Apache 2.0, BSD).

---

## 4. Visual Discipline, Zen 2.0 Design System & Role Separation
- **Role Separation & Design Lead Ownership**:
  - The visual design system is officially named **Zen 2.0**.
  - A separate dedicated conversation acts as the **Design Lead / Design Director**, owning visual aesthetics, design tokens, styling, and UI layout.
  - The engineering/pedagogy agent is strictly responsible for code logic, curriculum, 5th-grade pedagogical calibration, interactive algorithms, and architecture.
  - The engineering agent may propose design suggestions, but must NOT unilaterally alter or overwrite design tokens, styling, or visual decisions made by the Design Lead.
- **Monochromatic Restraint & Zen 2.0 Tokens**: Clean slate/neutral dual dark-and-light theme palette with subtle, restrained brand accents (Champagne Gold baseline).
- **Anti-Glow / No Chromatic Clutter**: Avoid neon glows, loud drop shadows, saturated primary fills, or arbitrary rainbow badges. The educational content is the visual hero.
- **Iconography vs. Child-Friendly Emojis**:
  - **System UI**: Strictly NO emojis inside system UI buttons, tabs, modal headers, or navigation items. Use Lucide Icons (`lucide-react`) exclusively.
  - **Child-Friendly Pedagogical Content**: In interactive game boards, simulation boards, and student reward feedback (e.g., 🔑, 🏆, 🔒/🔓, ⭐), age-appropriate emojis are welcomed and preserved to maintain high engagement, warmth, and intuitive comprehension for 5th-grade learners (ages 10–11).
- **Disciplined Border Radii**: Modern 8px–12px border radii (`rounded-lg` / `rounded-xl`). Avoid excessive pill/bubble styling.
- **Typography**: Clean, legible Hebrew font pairing (Heebo/Rubik) with full native RTL alignment.

---

## 5. Cloudflare Pages & Production Readiness
- **Architecture**: Pure Client-Side Single Page Application (SPA) architecture with zero backend requirement.
- **SPA Routing Fallback**: Mandatory `public/_redirects` containing `/* /index.html 200` to prevent HTTP 404 on deep links or browser refreshes.
- **Build Output**: Optimized production build targeting `dist/`.
- **Infrastructure Code**:
  - `wrangler.toml` for Cloudflare Pages local preview and deployment.
  - GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated Cloudflare Pages builds.

---

## 6. Continuous Changelog & Extended Conventional Commits
- **Changelog**: Maintain `CHANGELOG.md` following Semantic Versioning (starting at `v0.1.0`) and "Keep a Changelog" formatting. Must be updated synchronously with all feature or architecture changes.
- **Extended Conventional Commit Format**:
  ```text
  <type>(<scope>): <concise description>

  <body: key architectural rationale and list of modified files>

  Verified: <explicit test count and browser verification status>
  ```
  Allowed types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `style`.

---

## 7. Cumulative Memory & Definition of Done (DoD)
- **Zero Ad-Hoc Patches**: Every bug or edge case must be codified in core logic or regression tests.
- **Definition of Done Checklist**:
  1. Automated build passes cleanly (`npm run build`).
  2. `CHANGELOG.md` and `README.md` updated synchronously.
  3. Zero PII verified across repository contents and git history.
  4. Live browser inspection via DevTools/Playwright confirming UI rendering, sound effects synthesis, responsive layout, and RTL alignment.
