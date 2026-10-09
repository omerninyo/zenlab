# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.14] - 2026-10-09

### Fixed & Enhanced
- **Decision Tree Lab Architectural & Pedagogical Overhaul (`src/labs/Lab3_DecisionTree.jsx`, `src/services/ai.js`, `src/data/curriculum.json`, `src/core/tutorEngine.js`)**:
  - **Authentic Cultural Adaptation**: Replaced the unnatural literal translation "20 שאלות" / "20 מי יודע" across the entire platform and curriculum with the authentic Israeli youth game **"מי אני? (משחק 21 שאלות)"**.
  - **Resolved 100% Accuracy Discrepancy (Dual-Mode Architecture)**:
    - *Mode A: "מי אני?" (4 Core Animals - 1:1 Exact Identification)*: Calibrated the primary dataset with 4 distinct animals (`חתול`, `עטלף`, `נשר`, `צב`). With a 2-level binary tree ($2^2 = 4$ leaves), every single animal lands in its own exclusive leaf, delivering true 100% accuracy in guessing the specific animal with zero confusion.
    - *Mode B: AI Biological Classifier (8 Animals - Class Purity)*: Provided an interactive dataset toggle allowing students to test on 8 animals (`יונקים`, `עופות`, `זוחלים`), explicitly displaying the predicted biological class and class purity percentage on each leaf node.
  - **Eliminated JavaScript Truthy Bug on Attributes**: Fixed runtime bug where numeric `legs: 2` evaluated to truthy in JavaScript (`Boolean(2) === true`), which falsely indicated in the simulator that eagles and bats had 4 legs. Implemented centralized `testTreeAttribute` across all evaluation and step-through paths.
  - **Challenge Progression Integrity**: Fixed initial state auto-completion so that Challenge 1 (`rootAttr === 'canFly'`) is not marked as completed upon initial mount, requiring intentional student interaction to unlock stars.
  - **Rich Tactile Leaf Cards**: Redesigned leaf nodes with path indicators, prediction labels, pure/mixed status pills, and child-friendly animal emojis.

## [0.7.13] - 2026-10-09

### Added
- **Full-Spectrum SEO, Social Graph & Cloudflare Edge Optimization (`index.html`, `public/`, `.github/`)**:
  - **Open Graph Protocol & Social Cards**: Created high-resolution 1200x630 social card (`public/og-image.png`) and GitHub preview banner (`.github/assets/social-preview.png`) rendered with Playwright/Chromium showcasing ZenLab's 8 micro-labs, Zen 2.0 aesthetics, and Israeli MoE / AI4K12 badges.
  - **Multi-Platform Messenger Previews**: Full metadata parity across WhatsApp, Telegram, Facebook, Twitter Summary Large Image, LinkedIn, Discord, and Slack, including secure image URLs, dimensions, and bilingual descriptions.
  - **Canonical SEO & Search Discovery**: Integrated canonical URL (`https://zenlab.ninyo.co/`), bilingual hreflang tags (`he` and `x-default`), search engine crawl directives (`public/robots.txt`), and exhaustive XML sitemap (`public/sitemap.xml`) indexing all 8 micro-labs.
  - **JSON-LD Schema.org Knowledge Graph**: Injected multi-entity structured data (`WebApplication`, `EducationalOrganization`, `LearningResource`, `BreadcrumbList`) enabling rich snippets, course cards, and AI answer engine discovery (Perplexity, Copilot, Gemini).
  - **PWA & Mobile Pinning**: Added Web App Manifest (`public/manifest.webmanifest`), Apple Touch Icon (`public/apple-touch-icon.png`), and high-res vector and raster icons (`public/icon-512.png`, `public/icon-192.png`, `public/favicon.svg`).
  - **Cloudflare Edge Headers & CWV Caching (`public/_headers`)**: Configured immutable caching for hashed static bundles and audio files, security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), and crawler tags (`X-Robots-Tag: all`).
  - **GitHub Repository Social Graph**: Updated GitHub repository description, homepage URL (`https://zenlab.ninyo.co`), enabled GitHub Discussions, and configured 14 comprehensive topics (`education`, `k12-education`, `artificial-intelligence`, `machine-learning`, `neural-networks`, `stem`, `hebrew`, etc.).

## [0.7.12] - 2026-10-09

### Added
- **Wide & Ultrawide Screen Ergonomics & Container-Anchored Floating AI Tutor (`src/App.jsx`, `src/components/ZenAiTutor.jsx`, `src/core/labMeta.js`)**:
  - **Symmetric Container Alignment**: Harmonized `<header>`, `<main>`, and `<footer>` layouts to a unified `max-w-6xl` (`1152px` = `72rem`) bounding grid, eliminating visual disconnection on 1080p, 1440p, and ultrawide displays.
  - **Container-Anchored Floating Bot Positioning**: Replaced physical edge docking with dynamic container anchoring (`left: max(0.75rem, calc((100vw - 72rem) / 2 + 1.5rem))`) for both the trigger button and the interactive chat drawer, keeping the tutor immediately proximate to the educational cards rather than isolated against the screen bezel.
  - **Station Stepper & Title Bug Resolution**: Fixed missing lab titles in the center header navigation by adding canonical `label` attributes across all 8 labs in `LAB_METADATA` (`src/core/labMeta.js`).
  - **Context-Aware Header Navigation**: Implemented clean station picker pill (`מעבדות מחקר (8) ⌄`) on the Home Roadmap view and segmented stepper navigation (`< מעבדה X: [שם] ⌄ >`) inside active labs.
  - **De-Cluttered Top Toolbar**: Streamlined the top-left toolbar to essential student utilities (`Stars / 24`, `תעודה`, `Theme`, `Audio`, `More (3 dots)`), moving developer testing buttons into the nested menu.
  - **Multi-Resolution Responsiveness Verified**: Confirmed layout geometry, squircle card styling, and zero horizontal overflow across 2560x1440 (ultrawide), 1920x1080 (desktop), and 375x667 (mobile).

## [0.7.11] - 2026-10-09

### Added
- **Cloudflare Pages Edge Proxy with Gemini 3 Cascade & Local Fallback Resilience (`functions/api/tutor.js`, `src/core/tutorEngine.js`, `src/components/ZenAiTutor.jsx`)**:
  - **Serverless Edge Proxy (`functions/api/tutor.js`)**: Implemented a secure Cloudflare Pages Function endpoint `POST /api/tutor` leveraging `context.env.GEMINI_API_KEY` stored securely in Cloudflare secrets without exposing keys to client-side bundles or git repositories.
  - **Cascading Gemini 3 Model Waterfall**: Adapted resilience architecture from `resilience.py`, cascading through Gemini generation 3 models (`gemini-3.5-flash-lite` -> `gemini-flash-lite-latest` -> `gemini-3.1-flash-lite-preview` -> `gemini-3-flash-preview`) to guarantee minimal token consumption and cost-effective pedagogy.
  - **Circuit Breaker Pattern (`src/core/tutorEngine.js`)**: Implemented an automated client-side circuit breaker (`CircuitBreaker`) that trips after consecutive remote failures/quota limits (HTTP 429), pausing external calls for 60 seconds and seamlessly falling back to local search without user interruption.
  - **General CS & AI Knowledge Base Expansion**: Expanded the local dictionary by 12 foundational computer science and AI knowledge modules (Hardware vs Software, CPU, RAM, The Internet, Cloud Computing, IP Addresses, Cybersecurity & Phishing, Grace Hopper & First Bug, Babbage & Lovelace, AI Feelings vs Calculations, Deep Learning, AI Agents) with over 20 new indexed vocabulary terms.

## [0.7.10] - 2026-10-09

### Added
- **Intelligent Hybrid AI Tutor Engine & Semantic Matcher (`src/core/tutorEngine.js`, `src/components/ZenAiTutor.jsx`)**:
  - **Option A - Guided Intent Categories**: Replaced empty conversational state with 4 structured, interactive category drawers: Challenge Hints (💡 רמזים מעשיים לאתגרים), FAQs (❓ שאלות נפוצות), Glossary (📖 מילון מושגים מהיר), and Real-world Analogies (🔍 איך זה עובד בעולם האמיתי).
  - **Option B - Zero-Latency Local Semantic Matcher**: Implemented client-side Hebrew tokenization, vocabulary-aware prefix stripping (`ב/ל/כ/ש/ה/ו`), and multi-source scoring indexing all 8 labs, challenges, glossary definitions, and core principles.
  - **Zero-Evasion Transparency**: Out-of-domain queries receive an honest, encouraging response explaining Zen's lab specialization, accompanied by 3 contextual suggested prompt buttons to resume purposeful learning.
  - **Contextual Continuation Chips**: Every tutor response includes 2-3 interactive follow-up chips (`suggestedNext`) enabling continuous discovery without typing friction.
  - **Mobile Touch Ergonomics**: Verified 100% zero horizontal overflow and responsive drawer layout on 390px mobile viewports.

## [0.7.9] - 2026-10-09

### Added
- **Complete GitHub Community Infrastructure & Community Standards (`.github/`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`)**:
  - **Interactive Issue Forms (`.github/ISSUE_TEMPLATE/`)**:
    - `bug_report.yml`: Structured form with lab selector, device/browser details, and reproduction steps.
    - `feature_request.yml`: Structured proposal form for new educational modules and algorithms.
    - `pedagogical_feedback.yml`: Dedicated educator feedback template for 5th-grade reading level and Israeli Ministry of Education (MoE) curriculum alignment.
    - `config.yml`: Global issue configuration linking to discussions and security policy.
  - **Standardized Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)**: Comprehensive checklist enforcing clean builds (`npm run build`), Zero-PII verification, Hebrew RTL layout alignment, and 5th-grade pedagogical compliance.
  - **GitHub Discussions Categories (`.github/DISCUSSION_TEMPLATE/`)**: Pre-configured templates for Q&A (שאלות ותשובות), Ideas (רעיונות למעבדות), and Show & Tell (שיתוף תוצרים מהכיתה).
  - **Automated CI/CD Workflow (`.github/workflows/ci.yml`)**: Continuous integration testing Node 20.x, Vite production build, SPA redirects validation (`public/_redirects`), and strict Zero-PII git tree scanning.
  - **Automated Dependabot Security Updates (`.github/dependabot.yml`)**: Weekly npm and monthly GitHub Actions security patch configuration.
  - **Open Source Governance & Guidelines**:
    - `CONTRIBUTING.md` & `CONTRIBUTING.he.md`: Exhaustive bilingual contributor guides explaining local setup, role boundaries with Design Lead (Zen 2.0), and extended commit conventions.
    - `CODE_OF_CONDUCT.md`: Contributor Covenant v2.1 adapted specifically for elementary school educational safety.
    - `SECURITY.md`: Transparent Zero-PII student privacy guarantee and vulnerability disclosure workflow.
- **Exhaustive Master Pedagogical & Technical Wiki in English & Hebrew (`docs/wiki/`)**:
  - `Home.md` / `Home.he.md`: Central wiki navigation portal and educational mission statement.
  - `Pedagogical-Framework.md` / `Pedagogical-Framework.he.md`: Complete pedagogical foundation mapping Israeli MoE 5th-grade standards, AI4K12 5 Big Ideas, Seymour Papert's Constructionist Microworlds model, and gender-inclusive language standards.
  - `Curriculum-Master-Index.md` / `Curriculum-Master-Index.he.md`: Deep-dive pedagogical specification across all 8 labs detailing 5th-grade analogies, interactive principle simulations, sandbox mechanics, step-by-step challenges, common misconceptions, and real-world tech connections.
  - `Architecture-and-Tech-Stack.md` / `Architecture-and-Tech-Stack.he.md`: Complete technical stack specification covering client-side SPA architecture, Web Audio API sound synthesis, StorageEngine offline persistence, Zen 2.0 design framework, and Cloudflare Pages edge deployment.
  - `Teachers-Classroom-Guide.md` / `Teachers-Classroom-Guide.he.md`: Practical 45-minute lesson plans, pair programming flows, peer debugging questions, differentiation strategies, and formative assessment rubrics.
- **Bilingual Showcase Documentation (`README.md`, `README.he.md`)**: Modernized root READMEs with live status badges, lab suite matrix, architecture diagrams, Wiki links, and Cloudflare Pages deployment instructions.

## [0.7.8] - 2026-10-09

### Added
- **Child-Friendly Pedagogical Alignment & Unified Station Metaphors (`src/core/labMeta.js`, `src/components/HomeDashboard.jsx`, `src/components/LabPhaseHeader.jsx`, `src/App.jsx`)**:
  - Replaced abstract and developer-centric icons with consistent, child-friendly pedagogical metaphors repeating across all touchpoints (Home Roadmap, Header Stepper, and Lab Phase Headers):
    - **מעבדה 1**: פלטת פיקסלים (`Palette`)
    - **מעבדה 2**: רובוט פקודות (`Bot`)
    - **מעבדה 3**: בלש החלטות (`Search`)
    - **מעבדה 4**: ווייז ניווט (`Navigation`)
    - **מעבדה 5**: סיווג ותיוג (`Tags`)
    - **מעבדה 6**: ראייה וסריקה (`Scan`)
    - **מעבדה 7**: מוח ונוירון (`Brain`)
    - **מעבדה 8**: שיחה חכמה (`MessageSquareText`)
- **Interactive SVG Micro-Visual Previews (`src/components/LabCardPreview.jsx`)**:
  - Embedded compact 54x42px SVG visual previews for all 8 lab stations directly within each station card, giving 5th-grade learners an immediate visual sense of the core mechanism before entering.
- **Contextual AI Co-Pilot (ZenAiTutor) Guidance Bubble (`src/components/HomeDashboard.jsx`, `src/components/ZenAiTutor.jsx`)**:
  - Integrated an interactive tutor greeting bubble directly into the Command Hero card, dynamically adapting its message to the learner's current progress and station, with a direct trigger to open the AI tutor modal.
- **5-Tier Granular Researcher Rank Progression (`src/components/HomeDashboard.jsx`, `src/components/CertificateModal.jsx`)**:
  - Granularized researcher ranks to reward learners every 2 completed labs:
    - 0–5 כוכבים: **חוקר/ת מתחיל/ה**
    - 6–11 כוכבים: **בלש/ית קוד**
    - 12–17 כוכבים: **נווט/ת אלגוריתמים**
    - 18–23 כוכבים: **מהנדס/ת רשתות**
    - 24 כוכבים: **מאסטר בינה מלאכותית (דרגת על)**
- **Zero-Dependency Champagne Gold Milestone Confetti Generator (`src/core/confetti.js`, `src/App.jsx`)**:
  - Added celebratory 3-star milestone particle effects rendered on an ephemeral HTML5 Canvas in the Zen 2.0 champagne gold palette without any external dependencies.

### Fixed
- **Mobile Responsive Layout & Viewport Verification**:
  - Verified 100% zero horizontal overflow (`scrollWidth === clientWidth`) on iPhone 375px/390px viewports with natural text wrapping and no clipping.
  - Added `playClick` alias support to `AudioEngineClass` in `src/core/audio.js`.

## [0.7.7] - 2026-10-09

### Changed
- **Total Elimination of Singular Masculine Address & Unified Plural/Inclusive Language Standard (`src/data/curriculum.json`, `src/components/ZenAiTutor.jsx`, `src/components/HomeDashboard.jsx`, `src/components/TheoryView.jsx`, `src/components/LiteYouTubeEmbed.jsx`, `src/components/HebrewExplainerTour.jsx`, `src/labs/*.jsx`, `src/App.jsx`, `src/components/animations/*.jsx`)**:
  - **Zero Singular Masculine**: Executed complete purge of singular masculine 2nd-person address (e.g. "שלך", "לחץ", "פתח", "גלה", "נסה", "תרצה", "דמיין שאתה", "שים לב") across all learner-facing copy.
  - **Plural (רבים) as Standard & Speech-Synthesis (TTS) Safeguard**:
    - Standardized all pedagogical instructions, challenges, tips, and AI tutor knowledge base entries to grammatically unambiguous plural forms ending in `ו` (e.g. "לחצו", "נסו", "שימו לב", "פתחו", "שלכם", "גלו", "ראו").
    - Plural verbal morphology provides 100% pronunciation certainty in Hebrew text-to-speech engines without vocalization (niqqud), preventing the gender mispronunciations inherent to ambiguous unvocalized singular forms ("שלך", "לחץ").
  - **Feminine & Inclusive Greetings**: Updated greetings and persona references in `ZenAiTutor.jsx` to "שלום חוקרות וחוקרים צעירים!", "בלשיות ובלשים", and "מדעניות ומדענים", ensuring equal belonging for 5th-grade girls.
  - **Gender-Neutral Action Nouns in Controls & UI**: Standardized buttons and system switches from imperative verbs to neutral action nouns (e.g., "הפעלת ליווי קולי", "השתקת צלילים", "פתיחת שער נעול", "התחלת הסיור", "שמירת מפתח", "טעינת ערך").

## [0.7.6] - 2026-10-09

### Changed
- **Elementary 5th-Grade Pedagogy & Language Calibration for "הדמיה אינטראקטיבית של עקרון היסוד" (`src/data/curriculum.json`, `src/components/animations/*.jsx`, `src/labs/*.jsx`)**:
  - Replaced university/engineering-level technical jargon across all 8 labs' primary principle simulations with intuitive, tangible 5th-grade analogies matching the Israeli Ministry of Education CS & AI curriculum:
    - **Lab 1 (Binary & Pixels)**: Replaced abstract binary powers ($2^7 \dots 2^0$) with friendly bit weight counters (128, 64...), labeled the base-10 conversion as "המספר הרגיל שלנו", simplified logic gates ($A \land B$, $A \lor B$, $\neg A$, $A \oplus B$) to plain Hebrew conditions ("וגם", "או", "היפוך", "בדיוק אחד מהם"), replaced HIGH/LOW electrical states with "דולק (1)" / "כבוי (0)", and translated the half-adder circuit into unit/tens column addition.
    - **Lab 2 (Algorithmic Robot & CPU)**: Removed FIFO/prerequisite terminology, converted the CPU instruction cycle stages into intuitive student terms ("1. קריאת ההוראה (Fetch)", "2. הבנת ההוראה (Decode)", "3. ביצוע החישוב (Execute)"), replaced hardware acronyms (PC, ALU, Control Unit, Register ACC) with friendly metaphors ("מספר השורה בתור", "מחשבון המעבד", "מוח הניהול", "לוח התוצאה"), and replaced emojis with clean inline SVG icons.
    - **Lab 3 (Decision Tree)**: Simplified classification taxonomy into simple binary questions and friendly species cards.
    - **Lab 4 (Pathfinding Algorithms)**: Replaced BFS/A* graph theory jargon with the "משחק חם-קר" (hot-and-cold game) compass analogy, contrasting "חיפוש עיוור שבודק הכל לכל הכיוונים" with "מצפן חכם שמנחש את המרחק לקו הסיום".
    - **Lab 5 (k-NN Classifier)**: Replaced Euclidean distance metric and hyperparameter terminology with "כמה שכנים שואלים? (k)", fruit size/weight coordinates, and "החלטת הרוב".
    - **Lab 6 (Computer Vision & Kernels)**: Demystified 3x3 convolution matrices and matrix dot products into a "זכוכית מגדלת שמזהה קווים וצורות", scanning image pixels for vertical and horizontal lines.
    - **Lab 7 (Artificial Neuron)**: Replaced linear algebra weights, bias and step activation formulas ($w \cdot x + b$) with intuitive sliders: "כמה חשוב הנושא? (משקל 1/2)", "סף החלטה (Bias)", and "סכום החישוב - מתי הנוירון מחליט להידלק?".
    - **Lab 8 (Language Models & Attention)**: Replaced Softmax probability distribution and logit sampling curves with an interactive temperature gauge: "מד החום (טמפרטורה) - כמה המחשב יצירתי?", showing the trade-off between safe, predictable completions and creative, surprising guesses. Converted self-attention ($Q \times K$) into an intuitive word-connection map ("איך המחשב מבין משפט בעזרת 'תשומת לב'").
  - **Curriculum Architecture (`src/data/curriculum.json`)**: Added structured `svgAnimation` objects with student-tailored titles and subtitles for every lab, aligned with the Zen 2.0 design framework and tactile card specifications.
  - **Child-Friendly Visual Affordance**: Preserved engaging, age-appropriate emojis (🔑, 🏆, 🔒/🔓) in interactive simulation boards to maximize clarity and excitement for 5th-grade learners, while retaining Lucide icons in standard UI controls.

## [0.7.5] - 2026-10-09

### Added
- **Permanent Champagne Gold Baseline & Complete Reusable Design System Export Package (`design-system/`, `src/core/storage.js`, `src/styles/design-tokens.css`)**:
  - Permanently set **Champagne Gold** (`#ca8a04` Light / `#eab308` Dark) as the canonical default active palette in `StorageEngine` and `:root` / `html.dark` design tokens.
  - Exported the complete, standalone **Zen 2.0 Design System Starter Kit** to `/design-system/`:
    - `tokens.css`: Zero-dependency, dual Light/Dark mode CSS variables with calibrated Radix Slate scales and ambient velvet canvas.
    - `components.css`: Production-ready classes (`.canvas-ambient`, `.header-glass`, `.card-tactile`, `.card-command-hero`, `.card-tactile-highlight`, `.btn-hollow`, `.btn-hollow-primary`, `.segmented-glass-container`, `.segmented-glass-item`, `.badge-glass`, `.input-glass`).
    - `tailwind.preset.js`: Drop-in Tailwind CSS preset with custom colors, radii, shadows, and fonts.
    - `templates/`: Modular React components (`Header.jsx`, `TactileCard.jsx`, `HollowButton.jsx`, `SegmentedControl.jsx`, `Badge.jsx`, `ThemeToggle.jsx`).
    - `demo.html`: Standalone, interactive HTML showcase demonstrating live tokens, palette switcher, and Light/Dark toggling without build tooling.
    - `SPECIFICATION.md` & `SPECIFICATION.he.md`: Exhaustive architectural rulebooks codifying the 7 Inviolable Invariants (Anti-Bubble Geometry, Light Mode Default, Champagne Gold Baseline, Anti-Text-Chopping in Hebrew, 100% Opaque Tactile Cards, Functional Hollow Buttons, and iOS Safari 16px input safeguards).
    - `README.md`: 5-minute quickstart guide for new projects across HTML, React, Vite, and Next.js.

## [0.7.4] - 2026-10-09

### Added
- **Default Light Mode with Seamless Dark Mode Toggle (`src/styles/design-tokens.css`, `src/core/storage.js`, `src/App.jsx`, `src/components/LabPhaseHeader.jsx`, `src/components/HomeDashboard.jsx`)**:
  - Set crisp, high-contrast **Light Mode** as the default baseline theme across the entire application and design system (including "עיצוב זֶן 2.0" / Dapim Liquid Glass).
  - Cleanly decoupled theme selection from Zen 2.0 mode in `StorageEngine`: activating `dapimMode` no longer forces `html.dark`.
  - Added dual CSS token architecture in `src/styles/design-tokens.css`:
    - `:root` default Light Mode tokens: `--content-bg: #f8fafc`, crisp tactile cards (`#ffffff`), high-contrast primary typography (`#0f172a`), light liquid glass header, light segmented controls with elevated active pill, and calibrated light palettes (`matte-amber`, `nordic-ice`, `emerald-sanctuary`, `champagne-gold`).
    - `html.dark` tokens: Deep cinema slate `--content-bg: #0c0d10`, tactile card `#15161c`, white typography, dark liquid glass header, and glowing specular highlights.
  - Added a dedicated, one-tap Theme Toggle button (`Sun`/`Moon` Lucide icon) directly in the top navigation bar (desktop and mobile) right alongside the More tools menu.
  - Added URL query parameter support: `?theme=dark` or `?theme=light` for immediate remote and device-specific testing.
  - Fixed tactile card text colors in `LabPhaseHeader` (`text-slate-900 dark:text-white`) and unearned star colors in `HomeDashboard` (`text-slate-300 dark:text-slate-700`) for balanced contrast in both Light and Dark modes.

## [0.7.3] - 2026-10-09

### Changed
- **Pill-to-Rectangle Architectural Discipline & Anti-Bubble Geometry (`src/styles/design-tokens.css`, `src/components/HomeDashboard.jsx`, `src/components/LabPhaseHeader.jsx`, `src/components/TheoryView.jsx`, `src/components/HebrewExplainerTour.jsx`, `src/components/LiteYouTubeEmbed.jsx`, `src/App.jsx`)**:
  - Replaced bubbly capsule rounding (`border-radius: 9999px`, `rounded-full`, `rounded-3xl`, `rounded-2xl`) with crisp, restrained architectural rectangles (4px–8px radii: `rounded-md`, `rounded-lg`).
  - Calibrated `.badge-glass` to 4px radius with proportional padding, preventing corner curvature from pinching Hebrew characters.
  - Refined `.segmented-glass-container` (6px) and `.segmented-glass-item` (4px) for subtle tactile switches.
  - Refined `.btn-glass` and `.btn-hollow` buttons to 6px radii and `.card-tactile` to 8px.
  - Refined track container wrappers from bubbly `rounded-3xl` (24px) to sleek `rounded-xl` (12px).
- **Eliminated Hebrew Copy Chopping & Premature Ellipsis Truncation (`src/components/HomeDashboard.jsx`, `src/components/LabPhaseHeader.jsx`, `src/components/LiteYouTubeEmbed.jsx`)**:
  - Removed aggressive `line-clamp-1` and `line-clamp-2` constraints that cut off pedagogical sentences mid-word with `...`.
  - Replaced with natural multi-line wrapping and `leading-relaxed` line-height across "התחנה המומלצת הבאה שלך", station roadmap cards, lab phase headers, and video explainer titles.
  - Removed `truncate` on student developer rank badge to accommodate longer titles cleanly on smaller screens.
- **Resolved Mobile Top Navigation Bar Overflow across iPhone Viewports (`src/App.jsx`, `src/styles/design-tokens.css`)**:
  - Fixed horizontal overflow on both standard mode and Zen 2.0 mode on mobile screens (375px iPhone SE/mini and 390px iPhone 12–16).
  - Eliminated duplicate horizontal padding in `.header-glass` (`max(0.25rem, env(safe-area-inset-top))` and safe-area insets).
  - On mobile (<640px), stepper arrows are hidden and center button renders a compact, responsive chip (`[icon] מעבדה X [chevron]`), keeping total top bar width well within 300px.
  - Verified 100% zero horizontal overflow (`totalOverflowing: 0`) and zero text clipping via headless Playwright inspections on 375x667 and 390x844 viewports.

## [0.7.2] - 2026-10-09

### Added
- **Full Application-Wide "עיצוב זֶן 2.0" (Zen 2.0 / Dapim Liquid Glass & Hollow Restraint) Overhaul (`src/components/HomeDashboard.jsx`, `src/App.jsx`, `src/components/LabPhaseHeader.jsx`, `src/styles/design-tokens.css`, `src/index.css`)**:
  - **Essence-Inspired Educational Adaptation**: Synthesized the core essence of the Dapim design system (Apple visionOS/macOS Liquid Glass, Radix Slate scale, Master Velvet Mist ambient lighting, and canonical hollow buttons) calibrated specifically for 5th-grade learners (ages 10–11).
  - **Tactile Mission Command Hero (`src/components/HomeDashboard.jsx`)**: Converted the roadmap orientation section to a 100% opaque cinema slate command center (`.card-command-hero`, `#15161c`) with specular highlight, ambient radial mist, Radix Slate stat tiles (`var(--slate-3)`), Heebo typography, and golden star indicators.
  - **Spotlight "התחנה הבאה שלך" Station**: Transformed the recommended next station into an active tactile card with accent rim illumination, hollow Lucide icon squircle, and primary hollow glass action button (`.btn-hollow-primary`) with high click affordance (`Play` icon, `ChevronLeft` arrow).
  - **Tactile 2-Track Roadmap & 8 Lab Stations**: Re-architected all 8 laboratory stations into 100% opaque tactile cards (`.card-tactile`, `#15161c`) with subtle slate borders, star indicators (`★ ★ ★`), and hollow glass CTA buttons (`.btn-hollow` / `.btn-hollow-primary`), completely eliminating legacy solid blue/indigo blocks.
  - **Apple Liquid Glass Segmented Controls (`src/styles/design-tokens.css`, `src/components/LabPhaseHeader.jsx`, `src/App.jsx`)**: Built `.segmented-glass-container` and `.segmented-glass-item-active` with optical blur, specular highlight, and glowing active pills for both the central lab stepper and the 2-phase lab switcher (`[ שלב 1: הבנה ומדיה | שלב 2: מעבדה מעשית ]`).
  - **Direct Topbar & Mobile Drawer Zen 2.0 Toggle**: Added one-tap instant toggle in the top bar (desktop) and mobile drawer with live pulse status and Web Audio tactile click feedback, plus persistent URL auto-activation (`?design=zen2`).
  - **iOS Mobile Safeguards & Zero Horizontal Scroll (`src/index.css`, `src/App.jsx`)**: Fixed mobile viewport constraints (`overflow-x: hidden`, compact top bar spacing), ensuring zero horizontal scroll and 44px minimum touch targets on iPhone.

## [0.7.1] - 2026-10-09

### Added
- **Zen 2.0 (זֶן 2.0) Liquid Glass & Hollow Restraint Design Verification Bench (`src/components/DesignSystemTestModal.jsx`, `src/styles/design-tokens.css`, `src/core/storage.js`, `src/App.jsx`, `src/index.css`)**:
  - **Drop-in Design Tokens Specification (`src/styles/design-tokens.css`)**: Fully implemented the design system specified in `docs/design.md`, including Radix Slate monochromatic scales (1–12), Master Velvet Mist ambient lighting formula (`ellipse 95% 65% at 50% -8%`), Optical Liquid Glass surfaces with specular top highlights (`inset 0 1px 0 0 rgba(255,255,255,0.16)`), 100% solid tactile content cards, and canonical hollow buttons.
  - **Live URL Query Parameter Auto-Activation**: Added instant remote testing support via `?design=zen2` (or `?zen2=true`) and optional palette selector `?palette=nordic-ice` for immediate one-tap inspection on iPhone and mobile devices.
  - **4-Theme Palette Engine**: Integrated full live switching between all 4 palettes:
    1. *Kavita Matte Amber* (warm archival library, `#d48344`)
    2. *Nordic Ice & Midnight* (high-tech cyber/data consoles, `#38bdf8`)
    3. *Emerald Sanctuary* (academic research & documents, `#10b981`)
    4. *Champagne Gold* (luxury premium dark, `#eab308`)
  - **7 Canonical UI Templates Interactive Test Harness**:
    1. Velvet Ambient Canvas with fixed attachment
    2. Optical Liquid Glass Sticky Header
    3. 100% Opaque Tactile Content Cards (WCAG AAA)
    4. Adaptive Apple Centered Modal (640px desktop) & iOS 90dvh Bottom Sheet
    5. Canonical Hollow Glass Buttons (base & primary with specular sheen and accent wash)
    6. iOS Safe Form Inputs (40px height, 16px font mobile safeguard against Safari auto-zoom)
    7. Touch ergonomics (44px min targets and zero horizontal scroll)
  - **Live ZenLab Sandbox Simulation**: Interactive 4x4 matrix card in 100% solid slate displaying pixel toggles and hollow button feedback with Web Audio synthesis.
  - **Global Application Switcher**: Added single-click live toggling of the Zen 2.0 design system across the entire ZenLab application (Home Roadmap, Active Labs, and Navigation).
  - **The 10th Man Red Team Architectural Audit**: Embedded dedicated critical assessment contrasting adult minimal reader ergonomics against 5th-grade classroom Chromebook hardware and young student click affordance.
- **Child-Friendly Pedagogical Register Overhaul across All 8 Interactive Labs & Curriculum (`src/labs/Lab1_BinaryPixels.jsx` through `Lab8_LanguageModelPredictor.jsx`, `src/data/curriculum.json`)**:
  - **Eliminated University & Machine Learning Jargon**: Replaced advanced academic formulas and abstract terminology with concrete Israeli elementary school metaphors (aligned with Ministry of Education 5th-grade guidelines):
    - *Lab 1 (Binary Pixels)*: "מחרוזת בינארית מלאה (64-Bit)" &rarr; "קוד המתגים של הציור (0 ו-1)"; "ייצוג הקסדצימלי" &rarr; "קוד המחשב המקוצר (8 בייטים)".
    - *Lab 2 (Algorithmic Robot)*: "סטטוס מנוע" &rarr; "מה הרובוט עושה"; "מפתח בזיכרון" &rarr; "יש מפתח"; "תור פקודות ריק" &rarr; "רשימת הפקודות ריקה".
    - *Lab 3 (Decision Tree)*: "טוהר מודל" &rarr; "דיוק הזיהוי"; "שאלת שורש מרכזית" &rarr; "שאלה ראשונה (לכל החיות)"; eliminated raw LaTeX math symbols (`\to`) in favor of clean Hebrew arrow flow.
    - *Lab 4 (Pathfinder)*: "חיפוש עיוור" &rarr; "חיפוש לכל הכיוונים"; replaced cryptic English 'S' and 'G' grid letters with Navigation and Target Lucide icons; "אורך מסלול אופטימלי" &rarr; "המסלול הקצר ביותר (צעדים)".
    - *Lab 5 (Fruit KNN Classifier)*: "לוח תכונות: גודל מול משקל" &rarr; "לוח השוואת פירות (גודל מול משקל)"; "קולות השכנים" &rarr; "הצבעת השכנים הקרובים"; "מידת ביטחון" &rarr; "כמה המחשב בטוח".
    - *Lab 6 (Vision Kernels)*: "תמונת קלט מקורית" &rarr; "הציור המקורי שלכם"; replaced convolution summation arithmetic jargon with intuitive "זכוכית מגדלת בלשית שמשווה לדפוס ומחשבת ציון התאמה".
    - *Lab 7 (Perceptron & Logic Gates)*: Removed intimidating algebraic line formula (`w1*x1 + w2*x2 + b = 0`); replaced with "קו ההפרדה של הנוירון: הקו שמבדיל בין תשובות 'כן' ל-'לא'". Replaced abstract XOR analysis with concrete two-color diagonal explanation.
    - *Lab 8 (Language Model)*: "חזה את האסימון הבא" &rarr; "גלה את המילה הבאה"; "התפלגות הסתברויות לאסימון הבא" &rarr; "גלגל הסיכויים של המילים הבאות"; "מד יצירתיות ודמיון" simplified temperature levels (0.0 = בטוח וצפוי, 0.7 = טבעי ומאוזן, 1.5 = הרבה דמיון והפתעות).
  - **100% Validated Clean Build & Zero-PII Compliance**: Passed `npm run build` with zero warnings/errors and strict MIT/Generic Identity governance.

## [0.6.9] - 2026-10-08

### Added
- **Dedicated Child-Friendly Home & Learning Roadmap Dashboard (`src/components/HomeDashboard.jsx`, `src/App.jsx`, `src/core/storage.js`, `src/data/curriculum.json`)**:
  - **Inviting Mission Map & Orientation Hub ("מפת המסע: מביטים בודדים עד בינה מלאכותית")**: Created an autonomous, empowering home dashboard designed specifically for 5th-grade elementary students (ages 10–11) to guide their learning journey independently with clarity and joy.
  - **Smart "התחנה הבאה שלך" Quick-Launch Hero Card**: Automatically identifies the student's next unfinished laboratory station (based on star progress), providing an encouraging 1-sentence teaser and a prominent one-tap CTA button (`המשיכו במעבדה ◀` / `התחילו את המעבדה ◀`) that launches them straight into their next challenge.
  - **Scaffolded 2-Track Journey Architecture**:
    - **מסלול א׳: עקרונות המחשב והאלגוריתמיקה** (מעבדות 1–4: ציור בפיקסלים, לתכנת רובוט, עץ החלטות בלשי, הווייז של הרובוט A*).
    - **מסלול ב׳: בינה מלאכותית ולמידת מכונה** (מעבדות 5–8: איך מחשב לומד KNN, העיניים של המחשב, נוירון חכם, מודל שפה חכם).
  - **8 Interactive Lab Cards**: Each card features a distinct Lucide icon, track accent, 1-line plain Hebrew concept explanation, 3-star visual tracker (`★ ★ ★`), live status pill ("הושלם בהצטיינות", "בתהליך (X/3)", "מוכן להתחלה"), and a direct launch button.
  - **Pedagogical 3-Step Guide ("איך לומדים וחוקרים כאן?")**: Visual 3-card roadmap outlining the discovery loop (1. מבינים וחוקרים, 2. מתנסים ומשחקים, 3. פותרים ומקבלים תעודה).
  - **Overview Progress & Rank Bar**: Displays real-time total stars earned (`X / 24`), percentage complete, completed lab counter (`X / 8`), and active developer rank (`חוקר/ת מתחיל/ה` up to `מאסטר בינה מלאכותית`).
  - **Seamless Two-Way Navigation**:
    - Dedicated "מפת המסע" button in top application bar (always accessible on mobile, tablet, and desktop).
    - Quick "חזרה למפת המסלול" breadcrumb link atop active laboratory workspaces.
    - Persistent state persistence via `StorageEngine.getViewMode()` and `setViewMode()`.
  - **Roadmap-Aware Zen AI Tutor (`ZenAiTutor.jsx`)**: Added personalized onboarding knowledge base for `home` mode where Zen the robot explains the journey, distinguishes between the two tracks, and guides the student on where to start.
  - **Pedagogical Copy Separation**: All Hebrew copy, track subtitles, and guidelines stored natively in `src/data/curriculum.json` under `homeRoadmap`.

## [0.6.8] - 2026-10-08

### Changed
- **Apple-Grade iPhone & Mobile Architecture Redesign (`src/App.jsx`, `src/components/*`, `src/labs/*`)**:
  - **Unclipped Fluid Navigation Bar**: Slashed mobile navbar congestion by moving secondary desktop controls (`תעודה`, `Mute`) into the unified More Tools menu (`[⋮]`) and making the star counter badge an interactive tap target that opens the certificate. Prevented icon clipping and horizontal overflow across iPhone SE, 14, 15, and 16.
  - **Centered 8-Lab Modal**: Replaced unstable anchored dropdown with a centered, backdrop-blurred mobile modal overlay (`fixed inset-x-3 top-16 max-h-[80vh]`), guaranteeing comfortable navigation with 0 horizontal overflow.
  - **Compact Native Header Hierarchy (`LabPhaseHeader.jsx`)**: Moved the Apple-style Segmented Control (`[ שלב 1: לומדים | שלב 2: מתנסים ]`) to the top of the mobile view and condensed the header from 260px down to ~90px, recovering over 160px of vertical space so sandbox canvases and videos are immediately visible in the first fold.
  - **Compact Circular Tutor FAB (`ZenAiTutor.jsx`)**: Converted the wide rectangular floating tutor button on mobile into a sleek, non-intrusive 48px circular FAB (`Bot` icon with presence dot), preventing it from blocking sandbox matrices, buttons, and text streams.
  - **Native 3-Column Media Segmented Bar (`TheoryView.jsx`)**: Refactored video/podcast/tour media switcher tabs into a tidy 3-column mobile grid, eliminating awkward multiline tab wrapping.
  - **Refined Sandbox Toolbars & Canvases (Labs 1, 4, 5, 6, 7, 8)**: Unified presets and playback controls into compact toolbars, added `touch-none` to coordinate spaces to prevent accidental mobile viewport scrolling during point dragging, and adjusted grid canvases for comfortable one-handed thumb interaction.

## [0.6.7] - 2026-10-08

### Changed
- **Mobile & Tablet Full Touch UX Optimization (`src/App.jsx`, `src/components/*`, `src/labs/*`)**:
  - **Fluid Responsive Header**: Calibrated app bar padding and gap sizing for small mobile screens (360px–390px, iPhone SE & 14/15) with responsive `shortLabel` truncation so brand identity, lab stepper, and achievement stars never overlap or clip.
  - **Mobile Bottom-Drawer Zen AI Tutor**: Converted `ZenAiTutor.jsx` from a rigid popup box into an adaptive bottom-sheet drawer (`fixed bottom-3 left-3 right-3 sm:w-[420px]`) with smooth vertical scrolling and touch targets.
  - **Scrollable & Scaled Certificate Modal**: Added fluid mobile padding and vertical overflow container to `CertificateModal.jsx` ensuring certificates render cleanly on any viewport.
  - **Responsive Sub-branch Layout in Lab 3**: Converted decision tree sub-branches from fixed 2-column to responsive single-column on mobile (`grid-cols-1 sm:grid-cols-2`), allowing effortless reading and selection on smartphones.
  - **Hebrew Logical Gates in Lab 7**: Updated logic gate selector buttons to standard elementary Hebrew terminology: `שער "וגם" (AND)`, `שער "או" (OR)`, `שער "או-אבל-לא-שניהם" (XOR)`.
  - **Intuitive XOR Visual Intuition Note**: Replaced complex academic Minsky/Papert historical narrative with clear visual geometric intuition explaining why a single straight line cannot separate diagonal points.
  - **Eliminated Residual English Labels**: Replaced `Feature Map` with `מפת רמזים ומאפיינים שנמצאו` in Lab 6, and updated classification terminology in Lab 5 (`בחר סוג פריט להוספה`, `החלטת המחשב`, `מידת ביטחון`).
  - **Consistent Explicit Segol Nikud**: Standardized all references to the mascot name as `זֶן הרובוט` with explicit Segol vocalization across input placeholders, system prompts, and thinking indicators.

## [0.6.6] - 2026-10-08

### Changed
- **Grade 5 Pedagogical & Terminology Overhaul (`src/data/curriculum.json`, `src/labs/*`, `src/components/*`)**:
  - Overhauled all 8 laboratory glossaries and pedagogical definitions to align with Israeli Ministry of Education (משרד החינוך) elementary guidelines for 5th grade (ages 10–11).
  - Replaced university/academic jargon ("יוריסטיקה", "מרחב תכונות", "קונבולוציה", "דטרמיניסטי", "פרספטרון", "טוהר 100%") with concrete, playful, everyday metaphors ("משחק חם-קר", "לוח ההשוואה", "זכוכית מגדלת סורקת", "בטוח וצפוי", "נוירון החלטות", "100% דיוק").
  - Removed intimidating technical English words in parentheses across all glossary cards and student-facing labels.
  - Aligned laboratory sliders, animation headers, and sandbox challenge texts with joyful, encouraging elementary vocabulary.

## [0.6.5] - 2026-10-08

### Fixed
- **CI / Cloudflare Build Workflow Resolution (`.github/workflows/deploy.yml`, `.node-version`)**:
  - Resolved persistent GitHub Actions failure alert (`Unable to resolve action cloudflare/pages-action, not found`) by removing the deprecated/non-existent third-party action step.
  - Converted GitHub workflow to a robust CI build verification pipeline (`npm ci` & `npm run build`), ensuring automated build validation on every push and pull request.
  - Added `.node-version` (`22`) to guarantee explicit Node.js version alignment across Cloudflare Pages build environment and local development.
  - Preserved Cloudflare Pages direct Git integration, which handles production publishing autonomously and seamlessly to `https://zenlab.ninyo.co`.

## [0.6.4] - 2026-10-08

### Changed
- **Apple-Minimalist & Child-Centric UX Architecture Refactoring (`src/App.jsx`, `src/components/LabPhaseHeader.jsx`, `src/components/ZenAiTutor.jsx`)**:
  - **Eliminated AI-generated Control Clutter**: Replaced 12 scattered header tools and badges with 3 focused, harmonious Apple-style zones (Brand, Lab Stepper, Unified Tools).
  - **Kid-Friendly Apple Stepper**: Introduced a unified central navigation stepper `< מעבדה 1 מתוך 8: ציור בפיקסלים >` with persistent, cheerful Lucide icons and one-click Previous/Next arrows.
  - **8-Lab Interactive Popover Drawer**: Clicking the center stepper opens an elegant 2-column modal grid showcasing all 8 labs, categorized by track (Algorithms vs AI) with live star completion counters.
  - **Saved ~350px of Vertical Chrome**: Completely removed the redundant 2-row navigation pills bar and the dismissible welcome banner, allowing elementary students to access the learning canvas immediately upon load.
  - **Apple-Style Segmented Control for Phases**: Streamlined `LabPhaseHeader.jsx` into a clean 2-phase switcher (`שלב 1: הבנה ומדיה` / `שלב 2: מעבדה מעשית (3 אתגרים)`), removing duplicated narration triggers.
  - **Secondary Tools Menu**: Tucked Glossary, Narration toggle, Light/Dark theme, and Classroom settings into a quiet, accessible popover menu.
  - **Calm, Tactile Zen AI Tutor Trigger**: Removed distracting perpetual bouncing animation from the floating robot button, maintaining a gentle, welcoming Presence dot and clear vocalized label (`שאל את זֶן הרובוט`).

## [0.6.3] - 2026-10-08

### Added
- **Neural Hebrew Voice Upgrade (`he-IL-HilaNeural`)**:
  - Replaced the sluggish, deep male voice and legacy Carmit synthesis with Microsoft's neural female educator voice `he-IL-HilaNeural`.
  - Calibrated playback rate to `+12%` and pitch to `+3Hz` for an energetic, welcoming, and child-friendly pedagogical tone (specifically tuned for 5th graders).
  - Fixed Hebrew pronunciation of "זן" by introducing explicit Niqqud Segol (`זֶן` /zen/) across all 41 audio files, `ZenAiTutor.jsx` knowledge base, and `NarrationEngine.js` text normalizer.
  - Complete 41-item studio audio set in ultra-optimized MP3 format (~50 KB each, ~2.2 MB total folder size, replacing 30 MB of uncompressed `.wav` files).
  - Dedicated `tutor_fallback.mp3` ensuring non-canned/custom student questions answered by Zen speak in the natural neural voice rather than falling back to browser robotic voices.

## [0.6.2] - 2026-10-08

### Added
- **Full Multimedia Suite Across All 8 Labs (`src/data/curriculum.json`, `public/videos/`, `public/audio/explainers/`)**:
  - Symlinked and integrated all 8 user-uploaded NotebookLM Hebrew video explainers (`lab1.mp4` through `lab8.mp4`, ~25-31 MB each).
  - Symlinked and integrated all 8 user-uploaded NotebookLM Hebrew deep-dive audio podcasts (`lab1_podcast.m4a` through `lab8_podcast.m4a`, ~9-12 MB each).
  - Cross-platform ASCII symlinks guaranteeing 100% reliable URL resolution across all operating systems and Cloudflare Pages.
- **Brand Tagline "From Zero to Neural"**:
  - Adopted official brand tagline across `index.html`, `App.jsx`, navigation badges, hero card, `curriculum.json`, and `CertificateModal.jsx`.
- **Kid-Centric UX & Visual Delights (5th Grade Calibrated)**:
  - Interactive **Mission Launch Card** in `TheoryView.jsx` ("מוכנים ליישם את מה שלמדתם בארגז החול?") with direct challenge preview and tactile CTA.
  - Distinct track themes in `App.jsx`: Sky/Cyan/Blue for Track 1 (Algorithms & Computers) and Indigo/Purple/Violet for Track 2 (AI & Neural Networks).
  - Tactile 2-phase switcher buttons in `LabPhaseHeader.jsx` with active ring styling and an animated amber indicator for uncompleted challenges.
  - High-contrast star badges displaying exact completion count per lab.
- **Google Flagship TTS Studio Voice Engine (`scripts/generate_tutor_audio.js`, `public/audio/tutor/`)**:
  - Built an autonomous multi-model cascading generator utilizing Google's flagship 2026 TTS models (`gemini-3.8-flash-lite-tts`, `gemini-3.1-flash-tts-preview`, `gemini-3.8-flash-tts`).
  - Synthesized 30 studio-quality 24kHz WAV audio files with warm robot persona `Puck` for Zen AI Tutor interactions.
  - Graceful phonetic fallback to browser natural speech synthesis if any snippet is unavailable.
- **Typography & Content Sanitization**:
  - Cleaned all raw HTML entity strings (`&ndash;`) into native typographic dashes across `curriculum.json`.
- **E2E QA/QC Verification via Headless Browser**:
  - Verified 0 console errors and 0 warnings across all 8 labs, video players, podcast players, Zen AI Tutor, and Certificate modal.

## [0.6.1] - 2026-10-08

### Added
- **Interactive Laboratory Podcast Player (`src/components/PodcastPlayer.jsx`)**:
  - Dedicated rich audio player for long-form pedagogical podcasts produced via Google NotebookLM.
  - Interactive playback controls: Play/Pause, seek slider, duration and elapsed time display, restart, mute toggle.
  - Multi-speed playback toggle cycling through `1.0x`, `1.25x`, and `1.5x`.
  - Dynamic animated waveform audio visualizer matching playback status.
  - Strictly adheres to Lucide icons and classroom visual discipline without emojis.
- **Integrated Lab 1 Multimedia Suite (`src/data/curriculum.json`, `src/components/TheoryView.jsx`)**:
  - Technical analysis and integration of user-generated NotebookLM media:
    - Video Explainer: `01_סוד_המסך__מציירים_במספרים.mp4` (H.264, 720p HD, 24 fps, duration `05:59`, 30.1 MB).
    - Audio Deep-Dive Podcast: `01_איך_המחשב_הופך_מספרים_לצבעים_במסך.m4a` (Stereo AAC, 256 kbps, duration `05:36`, 10.3 MB).
  - Cross-platform ASCII symlinks (`public/videos/lab1.mp4`, `public/audio/explainers/lab1_podcast.m4a`) ensuring 100% reliable URL resolution across all web hosting environments.
  - Multi-tab theory view with instant switching between Video Explainer, Audio Podcast, Hebrew Explainer Tour, and Quick Audio Narration.

## [0.6.0] - 2026-10-08

### Added
- **Zen AI Tutor: Interactive Classroom Robot Companion (`src/components/ZenAiTutor.jsx`, `src/App.jsx`)**:
  - Interactive floating robot companion ("זן הרובוט") designed for 5th-grade elementary students.
  - Curated, child-friendly pedagogical knowledge base and pre-canned questions across all 8 labs.
  - Socratic guidance with everyday analogies (Lego, light switches, cake recipe, sports decisions).
  - Integrated speech synthesis ("השמע") playing explanations out loud via `NarrationEngine`.
  - Dynamic connection to Google's **Gemini 3 Flash** (`gemini-3-flash-preview`) for answering free-form student questions with local client-side key storage (`localStorage`).
  - Zero-latency local fallback ensuring students always receive an encouraging, scientifically sound answer even without an API key or internet connection.
- **Google Veo 3.1 Video Production Pipeline (`scripts/generate_video.js`)**:
  - Standalone CLI generator utilizing Google's flagship video generation model (`models/veo-3.1-generate-preview`).
  - 8 Pixar-style educational 3D animation prompts tailored to 10-year-olds.
  - Long-running operation polling, automatic MP4 download, and dynamic linkage into `src/data/curriculum.json` (`localSrc`).
  - Safe `--dry-run` inspection and quota diagnostics.
- **Dedicated Google NotebookLM Educational Content Pack (`docs/notebooklm_pack/`)**:
  - Comprehensive suite of 12 grounded Markdown source documents covering every lab for Grade 5 elementary students.
  - Master prompts repository (`10_ALL_CUSTOMIZATION_PROMPTS_HE.md`) documenting all exact customization prompts for NotebookLM Video Overviews (Cinematic & Explainer), Audio Overviews, and study guides across all 8 labs.
  - Dedicated cinematic video production guide (`09_CINEMATIC_VIDEO_PROMPTS_AND_GUIDE_HE.md`) with 4-scene storyboard prompts for all 8 labs in Pixar 3D animated style.
  - Step-by-step guide (`README_NOTEBOOKLM_GUIDE_HE.md`) for generating multi-speaker Audio Overviews and educational video scripts with zero cost using Google Ultra.

## [0.5.1] - 2026-10-08

### Added
- **Studio-Quality Hebrew TTS Generator CLI (`scripts/generate_audio.js`)**:
  - Full support for **Google Gemini Flash TTS** (`gemini-2.5-flash-preview-tts` at 24kHz PCM/WAV), **Google Cloud TTS** (`he-IL-Neural2-A`), and **ElevenLabs** (`eleven_multilingual_v2`).
  - Automatic provider detection from API key (`AQ.` / `AIzaSy` keys automatically use Gemini Ultra/Studio endpoints).
  - Built-in rate limit throttle (20s delay) and exponential backoff retry for preview models.
  - `--dry-run` quota inspector: calculated 2,360 characters total across all 8 labs ($0.00 marginal cost).
- **Bundled High-Fidelity Hebrew Audio Suite for All 8 Labs (`public/audio/narration/`)**:
  - Successfully synthesized and bundled native 24,000Hz studio audio files for all 8 labs: `lab1.wav` through `lab8.wav` (~9.4 MB total).
  - Fully linked into `src/data/curriculum.json` across all labs for instantaneous zero-latency playback.
- **Local HTML5 Video Support in `LiteYouTubeEmbed` and `TheoryView` (`src/components/LiteYouTubeEmbed.jsx`, `src/components/TheoryView.jsx`)**:
  - Added `localSrc` prop support to render native HTML5 video player for GenAI-generated MP4 files, eliminating third-party YouTube embeds when local media exists.
- **Pedagogical Audio & Video Pipeline Research Specifications (`docs/research/TTS_AND_GENAI_VIDEO_PIPELINE.he.md`, `docs/research/TTS_AND_GENAI_VIDEO_PIPELINE.md`)**:
  - Detailed architectural specifications for Hebrew voice generation, quota math, and GenAI video production roadmaps (HeyGen/D-ID avatar video, Remotion code-to-video).

## [0.5.0] - 2026-10-08

### Added
- **Default Child-Friendly Classroom Light Theme & Theme Switcher (`src/App.jsx`, `src/index.css`)**:
  - Replaced the dark/cyber aesthetic with an inviting, high-contrast, bright Classroom Light Mode (`theme-light` by default) tailored for elementary schools.
  - Soft 2px borders, gentle card shadows, and large tactile click targets (min 44px) matching Scratch and Code.org conventions.
  - Header Sun/Moon toggle allowing instant switching between Light Classroom Mode and Dark Mode.
- **Built-in Animated Hebrew Explainer Tour (`src/components/HebrewExplainerTour.jsx`)**:
  - Interactive 4-scene video-like animated presentation in 100% Hebrew per lab, replacing external English YouTube videos as the primary media tool.
  - Synchronized speech narration, play/pause controls, step progress bar, and visual subtitle highlighting.
  - 100% client-side, zero cookies, zero external dependencies, school-firewall safe.
- **Natural Hebrew Voice Synthesis & Normalization Engine (`src/core/narration.js`)**:
  - Automatically identifies and prioritizes high-quality neural voices (`Google עברית`, `Microsoft Hila Natural`, `Siri`, `Carmit Enhanced`).
  - Child-calibrated tempo (`rate = 0.92`) and warm pitch (`1.05`) for clear storytelling.
  - Phonetic normalization cleaning English acronyms (`CPU`, `ALU`, `LLM`, `RAM`, `A*`, `XOR`) into natural spoken Hebrew, eliminating robotic stuttering.
- **Accessible Grade 5 Pedagogical Language Overhaul (`src/data/curriculum.json`)**:
  - Re-anchored every concept in relatable children's analogies: Lego & Minecraft blocks (Pixels), cake recipe (Algorithm), 20 Questions game (Decision Trees), Waze navigation (A* search), baby recognizing dogs (Machine Learning), coloring book contours (Computer Vision), soccer match decision (Neuron), and phone predictive text (Language Models).
  - Clear, accessible phrasing across titles, subtitles, concepts, highlights, challenges, and glossaries.

### Changed
- `src/components/TheoryView.jsx`: Overhauled layout with large typography (14px–18px body, 20px–30px titles), made Hebrew Explainer Tour the primary media tool, and applied light classroom styling.
- `src/components/LabPhaseHeader.jsx`: Enlarged titles, star badges, and phase switcher buttons with high-contrast accessibility.
- `src/core/storage.js`: Added theme persistence with default `'light'`.
- `package.json` & `src/App.jsx`: Version bumped to `v0.5.0`.

### Verified
- Automated build passed cleanly (`npm run build` in 4.33s).
- Live Playwright browser audit: 0 console errors, 0 warnings.
- Verified Zero-PII across all modified and newly created files.

## [0.4.0] - 2026-10-08

### Added
- **Multi-Animation Pipeline in TheoryView (`src/components/TheoryView.jsx`)**:
  - Upgraded `TheoryView` architecture to accept an array of `animations` with responsive sub-tabs, full backward-compatibility with legacy single `animationComponent` props, and synchronized auditory clicks.
- **Interactive CPU Pipeline Simulator (`src/components/animations/SvgCpuPipelineAnimation.jsx`)**:
  - Interactive 3-stage CPU cycle (`FETCH` $\to$ `DECODE` $\to$ `EXECUTE`).
  - Vector hardware architecture showing Memory (RAM), Program Counter (PC), Instruction Register (IR), Control Unit (CU), and Arithmetic Logic Unit (ALU) calculating into the Accumulator (ACC).
  - Manual clock-pulse trigger (`Tick`), auto-run playback, and real-time natural language cycle explanation.
- **Interactive Logic Gates & Half-Adder Circuit Playground (`src/components/animations/SvgLogicGatesAnimation.jsx`)**:
  - Dual-mode hardware explorer:
    1. Basic Logic Gates (AND, OR, NOT, XOR, NAND) with interactive inputs, illuminated pulse wires, and dynamic truth tables.
    2. Binary Half-Adder Circuit ($A \oplus B = \text{Sum}$, $A \cdot B = \text{Carry}$), demonstrating hardware binary addition ($1_2 + 1_2 = 10_2$).
- **Interactive Transformer Self-Attention Visualizer (`src/components/animations/SvgSelfAttentionAnimation.jsx`)**:
  - Dynamic token query selector with curved cubic-bezier attention weight arcs, percentage badges, and $Q \times K$ interactive attention heatmap matrix.
- **Curriculum Parity in `src/data/curriculum.json`**:
  - Added complete `structuredConcepts` (4 structured cards with Lucide icons) and curated educational videos (`media.video`) across all 8 micro-labs, reaching 100% pedagogical and media completeness.

### Changed
- `src/labs/Lab1_BinaryPixels.jsx`: Integrated dual animations (`SvgBinaryAnimation` and `SvgLogicGatesAnimation`).
- `src/labs/Lab2_AlgorithmicRobot.jsx`: Integrated dual animations (`SvgRobotAnimation` and `SvgCpuPipelineAnimation`).
- `src/labs/Lab7_Perceptron.jsx`: Integrated dual animations (`SvgPerceptronAnimation` and `SvgLogicGatesAnimation`).
- `src/labs/Lab8_LanguageModelPredictor.jsx`: Integrated dual animations (`SvgLlmAnimation` and `SvgSelfAttentionAnimation`).
- `package.json` & `src/App.jsx`: Version bumped to `v0.4.0`.

### Verified
- Zero console errors and zero warnings verified via automated Playwright live browser inspection.
- Production build verified (`npm run build` in 4.11s).
- Strict Zero-PII and child privacy regulatory compliance validated.

## [0.3.2] - 2026-10-08

### Added
- **Full-Curriculum Interactive Glossary Modal (`src/components/GlossaryModal.jsx`)**:
  - Searchable by term or definition keyword across all 8 micro-labs.
  - Filter by lab category pills ("All Concepts", "Lab 1: Pixels" ... "Lab 8: Language Model").
  - Accessible via top navigation header (`BookOpen` icon).
- **Classroom Settings & Progress Management Modal (`src/components/ClassroomSettingsModal.jsx`)**:
  - One-click classroom progress reset with safety confirmation dialog (`StorageEngine.resetProgress`).
  - Client-side JSON backup download (`StorageEngine.exportStateJSON`) and restore file picker (`StorageEngine.importStateJSON`).
  - Auditory synthesizer toggle and live sound test trigger (`AudioEngine.playSuccess`).
  - Strict Zero-PII privacy guarantee statement.
- **Security & Privacy Infrastructure for Cloudflare Pages**:
  - `public/_headers`: Enforced security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and child privacy permissions policy disabling camera/mic/geolocation).
  - `index.html`: Enhanced metadata with OpenGraph (`og:title`, `og:description`), Twitter Card tags, theme color (`#020617`), and mobile web app capabilities.
- **Pedagogical Discovery Worksheets & Global Competitive Benchmark**:
  - `docs/STUDENT_WORKSHEET_HE.md` & `docs/STUDENT_WORKSHEET.md`: Printable 2-page student discovery inquiry sheets with 24-star coloring tracker, reflection questions, and ethics dilemmas.
  - `docs/research/COMPETITIVE_BENCHMARK_AND_INNOVATION.he.md` & `.md`: In-depth analysis comparing ZenLab with Code.org, Scratch/MIT RAISE, Teachable Machine, Machine Learning for Kids, and Israeli MOE frameworks.

### Changed
- `src/App.jsx`: Header actions enhanced with Glossary and Settings modals; version bumped to `v0.3.2`.
- `src/core/storage.js`: Added `exportStateJSON` and `importStateJSON` methods, hardened deep-state reset.

### Verified
- Automated build passed cleanly (`npm run build` in 4.05s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.

## [0.3.1] - 2026-10-08

### Added
- **Full Hebrew Documentation Parity & Institutional Memory**:
  - `README.he.md`: Complete Hebrew project overview, pedagogical scope, and Cloudflare Pages deployment instructions.
  - `ROADMAP.he.md`: Hebrew engineering and educational roadmap spanning Phase 1 to Phase 3.
  - `CHANGELOG.he.md`: Synchronized Hebrew release notes across all releases.
  - `docs/TEACHERS_GUIDE_HE.md`: Comprehensive 45-minute modular classroom lesson plans, interactive discussion prompts, and evaluation rubric for educators.
  - `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.he.md`: Institutional research codifying Israeli Ministry of Education (MOE) AI Competency Rubric, AI4K12 3–5 framework, Piaget/Bruner cognitive progressions, and Zero-Syntax guidelines.
  - `docs/proposals/RFC_001_CORE_ARCHITECTURE.he.md` & `RFC_002_EIGHT_LAB_MASTER_SUITE.he.md`: Hebrew translations of core architecture proposals and laboratory contracts.
- **Student Achievement Certificate Modal (`src/components/CertificateModal.jsx`)**:
  - Client-side printable achievement certificate featuring personalized student name input, total stars tally (up to 24), rank title, and `@media print` optimized layout.
- **Track Navigation Filter & Welcome Banner (`src/App.jsx`)**:
  - Track filter pills ("All (8)", "Track 1: Algorithms (4)", "Track 2: AI (4)").
  - Grade 5 friendly welcome guide banner explaining progression, stars, and certificate.

### Changed
- `src/core/storage.js`: Extended default state to support all 8 labs across completion and phase persistence, and added `recordChallengeCompletion` alias.

### Verified
- Automated build passed cleanly (`npm run build` in 3.97s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.

## [0.3.0] - 2026-10-08

### Added
- **Eight-Lab Master Curriculum Suite for Grade 5 (Ages 10–11)**:
  - Reorganized curriculum into two parallel cognitive tracks across 8 comprehensive labs (24 total achievement stars):
    - **Track 1: Classical Computational Thinking & Algorithms**:
      - `Lab1_BinaryPixels`: 8x8 toggle matrix, 64-bit binary stream, hex encoding, and pixel presets.
      - `Lab2_AlgorithmicRobot`: 6x6 maze, FIFO command queue, preconditions, and step debugger.
      - `Lab3_DecisionTree` (New): Interactive binary decision tree builder, feature splits (CanFly, HasFur, Legs), live leaf purity gauge, and single-animal path tracer.
      - `Lab4_Pathfinder` (New): 8x8 grid maze, obstacle traversal, step-by-step playback comparing Breadth-First Search (BFS) vs. A* Heuristic search.
    - **Track 2: Perception, Machine Learning & Modern Generative AI**:
      - `Lab5_MachineLearningClassifier`: 2D feature space, k-NN distance, dynamic decision boundary separator.
      - `Lab6_VisionKernels` (New): 2D convolutions with 3x3 kernel filters (Sobel vertical/horizontal, sharpen, blur), sliding window multiply-accumulate inspector, and feature map generator.
      - `Lab7_Perceptron` (New): Artificial neuron mathematical model with $w_1, w_2, \text{bias}$ direct manipulators, 2D decision boundary on unit square, logic gates (AND, OR), and the historic XOR limitation.
      - `Lab8_LanguageModelPredictor`: Next-token prediction, Softmax probability distribution bar chart, interactive Temperature slider, and autoregression.
- **Interactive SVG Principle Animations for All New Labs**:
  - `SvgDecisionTreeAnimation.jsx`: Interactive branching flow with dynamic animal selection, highlighted active paths, and leaf classification.
  - `SvgPathfinderAnimation.jsx`: Frontier wave expansion vs. heuristic targeting, live step counter, and shortest path reconstruction.
  - `SvgKernelAnimation.jsx`: 3x3 sliding frame over an 8x8 input matrix, real-time dot product summation, and feature map intensity shading.
  - `SvgPerceptronAnimation.jsx`: Biological/artificial neuron diagram with live input toggles, synapse weight scaling, summation node $\Sigma$, and output signal trigger.
- **Algorithmic Engine Expansions (`src/services/ai.js`)**:
  - `solvePathfinder`: Deterministic implementation of Breadth-First Search and A* Heuristic search with Manhattan distance.
  - `computeConvolution`: 2D image convolution with zero-padding and step breakdown.
  - `evaluatePerceptron`: Linear model calculation, step/sigmoid activation, and logic gate accuracy scoring.
  - `evaluateDecisionTree`: Tree traversal, group splitting, and leaf purity evaluation.
- **Collective Memory & Pedagogical Research Documentation**:
  - `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.md`: Exhaustive institutional memory detailing Israeli Ministry of Education (MOE) AI Competency Rubric, AI4K12 National Guidelines (Five Big Ideas for Grades 3–5), cognitive theories (Piaget and Bruner), and child-centered UI/UX requirements.
  - `docs/proposals/RFC_002_EIGHT_LAB_MASTER_SUITE.md`: Architectural specification for the 8 micro-labs, data contracts, and deterministic execution engines.

### Changed
- Migrated previous `Lab3_MachineLearningClassifier` and `Lab4_LanguageModelPredictor` to `Lab5` and `Lab8` to establish a clean cognitive progression.
- Updated `src/App.jsx` navigation bar with 8 interactive lab tabs, Lucide icons, and 24-star progress tracker.
- Enriched `src/data/curriculum.json` with Hebrew pedagogical explanations, 3-star challenges, and glossaries for all 8 labs.

### Verified
- Automated build passed cleanly (`npm run build` in 4.06s).
- Zero console errors and zero warnings.
- Verified Zero-PII compliance across all added files and git history.


### Added
- **Hybrid Learning Modules Architecture**:
  - Two-Phase Learning View across all micro-labs (`TheoryView` and `InteractiveView`) with sticky navigation switcher and persistent phase retention (`StorageEngine.setLabPhase`, `getLabPhase`).
  - Integrated `LabPhaseHeader` component featuring lab metadata, star achievement counters, phase switcher, and voiceover audio toggles.
  - Unified `TheoryView` coordinating concept cards, interactive SVG animations, media slot, scientific analogies, and key principles.
- **Interactive SVG Principle Animations**:
  - `SvgBinaryAnimation.jsx`: 8-bit bus, interactive bit toggling, electric switch states, pixel illumination, decimal sum, and hex encoding.
  - `SvgRobotAnimation.jsx`: FIFO execution queue, step sequencer, robot avatar tracking, and dynamic precondition gate unlocking (`hasKey === TRUE`).
  - `SvgClassifierAnimation.jsx`: 2D feature coordinates, draggable/clickable query point, expanding k-NN radius circle, Euclidean distance lines, and real-time majority voting tally.
  - `SvgLlmAnimation.jsx`: Token prediction pipeline, live Softmax distribution curve, interactive Temperature slider ($0.0 \le T \le 1.5$), and token sampling trigger.
- **Media Slot & Persistent Voiceover Engine**:
  - `src/core/narration.js`: Zero-dependency voiceover narration engine supporting HTML5 Audio with graceful fallback to browser Web Speech API (`window.speechSynthesis` in `he-IL`), variable playback rates (`1.0x`, `1.25x`, `1.5x`), and reactive event bus.
  - `src/components/LiteYouTubeEmbed.jsx`: Lightweight, on-demand sandboxed YouTube player (`youtube-nocookie.com`, `sandbox="allow-scripts allow-same-origin allow-presentation"`, zero telemetry prior to user interaction).
  - `src/components/AudioNarrationPlayer.jsx`: Audio player with play/pause, seek scrubber, speed cycle, waveform visualizer, and collapsible Hebrew transcript.
  - Global persistent voiceover listening toggle in top application header alongside sound effects mute switch.
- **Curriculum Enrichment (`src/data/curriculum.json`)**:
  - Added structured concept definitions (`badge`, `title`, `description`, `highlight`, `icon`), SVG animation configurations, and media metadata (voiceover transcripts and video descriptors) across all 4 labs.

### Verified
- Automated production build passed cleanly (`npm run build`, bundle size: 292 kB, gzip: 86 kB).
- Live browser inspection via Playwright confirmed responsive rendering across desktop (1280x800) and mobile (390x844) viewports.
- Verified phase transitions (`TheoryView` ↔ `InteractiveView`) across all 4 labs.
- Verified Zero browser console errors and zero warnings logged.
- Full native Hebrew RTL layout alignment and Web Audio sound feedback verified.
- Strict Zero-PII hygiene enforced across repository files and git log.

## [0.1.0] - 2026-10-08

### Added
- **Governance & Zero-PII Invariants**:
  - Master governance protocols codified in `.agent/rules.md` and mirrored in root `AGENTS.md`.
  - RFC specification `docs/proposals/RFC_001_CORE_ARCHITECTURE.md`.
  - Multi-phase project roadmap in `ROADMAP.md`.
  - Standard MIT License in `LICENSE` and sanitized `.env.example`.
  - Pre-flight environment audit persisted to `config/environment.json`.
- **Application Core Infrastructure**:
  - Modern Single Page Application (SPA) architecture with React 18, Vite 6, and Tailwind CSS.
  - Strict visual discipline: monochromatic dark-mode slate/neutral palette, zero chromatic clutter, Lucide icons exclusively with zero emojis in UI controls.
  - Native Hebrew Right-to-Left (RTL) layout with Heebo and Rubik typography.
  - SPA routing fallback in `public/_redirects` (`/* /index.html 200`) and Cloudflare Pages deployment configuration (`wrangler.toml`, `.github/workflows/deploy.yml`).
- **Core Platform Engines**:
  - `src/core/audio.js`: Zero-dependency Web Audio API procedural sound synthesizer (sine/triangle oscillators, ADSR envelopes, mute controller).
  - `src/core/storage.js`: Reactive `localStorage` state engine tracking completed challenges, accumulated stars, and user preferences.
  - `src/core/canvas-particles.js`: Lightweight HTML5 canvas particle explosion engine for celebratory feedback.
  - `src/services/ai.js`: Pluggable AI engine providing deterministic Softmax temperature scaling, k-NN Euclidean distance classification, and an optional Google Gemini API bridge.
  - `src/data/curriculum.json`: Complete separation of pedagogical Hebrew copy, challenge criteria, concept summaries, and glossaries.
- **Interactive Micro-Labs**:
  - **Lab 1: Binary Pixels (`Lab1_BinaryPixels.jsx`)**: 8x8 toggle matrix, real-time 64-bit binary stream, 8-byte hexadecimal encoding, graphic presets (Heart, Smiley, Sword), and custom initial symbol challenges.
  - **Lab 2: Algorithmic Robot (`Lab2_AlgorithmicRobot.jsx`)**: 6x6 grid maze, visual command queue (Forward, Turn Left, Turn Right, Pick Key, Unlock Gate), step-by-step playback with visual execution pointer, and deterministic collision/error traps.
  - **Lab 3: Machine Learning Classifier (`Lab3_MachineLearningClassifier.jsx`)**: 2D feature space scatter plot, interactive training point placement, draggable query object, dynamic Euclidean distance neighbor visualization, and $k$-hyperparameter control ($k \in \{1, 3, 5\}$).
  - **Lab 4: Language Model Predictor (`Lab4_LanguageModelPredictor.jsx`)**: Next-token prediction simulator, selectable context prompts, interactive Temperature slider ($0.0 \le T \le 1.5$), real-time probability distribution bar chart, and token-by-token sentence generator.

### Verified
- Automated production build passed cleanly (`npm run build`, bundle size: 241 kB gzip: 69 kB).
- Live browser inspection via Playwright confirmed responsive rendering across desktop (1280x800) and mobile (390x844) viewports.
- Zero browser console errors and zero warnings logged.
- Full native Hebrew RTL layout alignment and Web Audio sound feedback verified.
- Strict Zero-PII hygiene enforced across repository files and git log.
