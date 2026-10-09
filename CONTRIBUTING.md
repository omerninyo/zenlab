# Contributing to ZenLab

Thank you for your interest in contributing to **ZenLab**!  
ZenLab is an open-source, client-side educational platform dedicated to teaching foundational Computer Science, algorithmic thinking, and Artificial Intelligence to 5th-grade students (ages 10–11).

> 🇮🇱 **מדריך תורמים בעברית**: מדריך תרומה מפורט בעברית זמין ב-[`CONTRIBUTING.he.md`](CONTRIBUTING.he.md).

---

## 1. Guiding Principles & Invariants

All contributions must respect our core architectural and pedagogical invariants:

1. **Client-Side SPA Architecture**:
   - Zero server-side requirements. Everything must execute 100% in the modern browser.
   - SPA fallback via `public/_redirects` (`/* /index.html 200`).
2. **Strict Zero-PII Policy**:
   - No personal names, personal email addresses, local absolute paths (`/Users/...`, `/home/...`), or secret keys in any committed code or documentation.
   - Commits use the generic team identity:
     - Name: `Code & AI Explorer Team`
     - Email: `team@learnai.internal`
3. **Role Boundaries & Design System (Zen 2.0)**:
   - Visual tokens, typography, and styling belong to the **Zen 2.0** framework (owned by the Design Lead). Contributors are encouraged to propose styling improvements via issues, but should not unilaterally overwrite design tokens or replace core styling.
   - **Child-Friendly Pedagogical Emojis**: In pedagogical game boards and simulations, friendly emojis (🔑, 🏆, 🔒/🔓, ⭐) are welcomed and encouraged for clarity and warmth. System UI controls (buttons, tabs, header navigation) use Lucide icons exclusively.
4. **Inclusive, Unambiguous Hebrew Language**:
   - All student-facing copy and instructions must use **plural** (`לחצו`, `גררו`, `שלכם`) or **gender-neutral action nouns** (`פתיחת שער`), with strictly zero singular masculine address (`לחץ`, `שלך`).
   - Plural forms prevent gender exclusion for female students and eliminate homograph mispronunciations in Hebrew speech synthesis (TTS) engines.
5. **Separation of Concerns**:
   - Pedagogical copy, challenges, and lesson data live in `src/data/curriculum.json`, separated from React component view logic.

---

## 2. Getting Started Locally

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+

### Setup Steps
```bash
# Clone the repository
git clone https://github.com/omerninyo/zenlab.git
cd zenlab

# Install dependencies cleanly
npm install

# Start local development server
npm run dev

# Open your browser at http://localhost:5173
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## 3. Pull Request Guidelines

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/my-new-challenge
   ```
2. **Verify Clean Compilation**:
   ```bash
   npm run build
   ```
3. **Commit with Conventional Extended Commits**:
   ```text
   feat(lab4): add compass distance heuristic challenge

   Add interactive warm-cold distance helper to A* pathfinding.
   Verified with npm run build. Author: Code & AI Explorer Team <team@learnai.internal>
   ```
4. **Submit Your PR**:
   - Fill out the checklist in [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
   - Ensure the automated GitHub Actions CI build passes.

---

## 4. Community & Support

- **Questions & Classroom Discussions**: Join our [GitHub Discussions](https://github.com/omerninyo/zenlab/discussions).
- **Bug Reports & Pedagogical Feedback**: Open a structured issue via [GitHub Issues](https://github.com/omerninyo/zenlab/issues).
- **Code of Conduct**: All participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
