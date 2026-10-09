# Autonomous Agent Directives

> **Notice**: All autonomous agents, contributors, and automated tooling must adhere to the Master Project Rules & Agent Governance Protocol defined in [`.agent/rules.md`](file:///.agent/rules.md).

## Operational Quick Reference

1. **Direction & Language Invariant**:
   - Every single agent response containing Hebrew must be wrapped in `<div dir="rtl">` and `</div>`.
   - Pedagogical copy must remain separated in `src/data/curriculum.json`.

2. **Communication Style, Anti-Sycophancy & 10th Man Directive**:
   - Macro-level planning first.
   - Silent read-only operations.
   - Mandatory notice before state modifications.
   - Strictly zero sycophancy or flattery. Direct, technical, and analytical tone.
   - Mandatory 10th Man / Red Team architectural perspective on major features and domain expansions.

3. **Zero-PII & License Hygiene**:
   - Generic identity: `Code & AI Explorer Team` (`team@learnai.internal`).
   - No personal names, emails, or absolute machine paths (`/Users/...`).
   - Standard MIT License with permissive dependencies only.

4. **Visual Discipline, Zen 2.0 & Role Separation**:
   - The design system is officially named **Zen 2.0**, owned by the separate **Design Lead** conversation. This agent focuses on engineering, pedagogy, algorithms, and curriculum. Suggestions may be proposed, but design tokens or styling must not be unilaterally overwritten.
   - Monochromatic slate/neutral palette, zero chromatic clutter or glowing neon.
   - Lucide icons (`lucide-react`) exclusively in system UI (buttons, tabs, modal headers, navigation).
   - In pedagogical game boards and child-facing simulations, friendly emojis (🔑, 🏆, 🔒/🔓, ⭐) are welcomed for engagement and clarity.
   - Modern 8px–12px border radii.
   - Native Hebrew RTL typography with Heebo/Rubik font styling.

5. **Cloudflare Pages Production Readiness**:
   - SPA architecture with `public/_redirects` (`/* /index.html 200`).
   - Target directory `dist/`.
   - Infrastructure via `wrangler.toml` and `.github/workflows/deploy.yml`.

6. **Changelog & Extended Commits**:
   - Continuous `CHANGELOG.md` updates following SemVer.
   - Extended commit format with explicit verification stamps.

7. **Definition of Done (DoD)**:
   - Clean build (`npm run build`).
   - Updated documentation and changelog.
   - Zero-PII verified.
   - Live browser inspection verifying layout, audio synthesis, and RTL compliance.

For the exhaustive specification, see [`.agent/rules.md`](file:///.agent/rules.md).
