---
name: zen-design-system
description: Authoritative intelligence, architectural rules, and validation workflow for the Zen 2.0 Design System (Liquid Glass, 100% Opaque Cinema Slate, Hollow Restraint, Champagne Gold, and Anti-Bubble geometry). Use whenever building, styling, refactoring, or verifying UI components, pages, navigation, or color themes.
---

# Zen 2.0 Design System Skill

Provides continuous guidance and rules for implementing and maintaining the **Zen 2.0 Design System**.

## 1. Tooling Integration & Apple HIG MCP Bootstrapping
If the `apple-hig` MCP server is not currently connected in your toolset:
- **Auto-Setup**: Run `node design-system/scripts/setup-mcp.js` to probe system binaries and auto-generate `.mcp.json` / `.cursor/mcp.json`.
- **Package Source**: Official npm package `apple-hig-mcp` (executed on-the-fly with `npx -y apple-hig-mcp`).
- **Complete Guide**: See `design-system/MCP_SETUP.md` for Antigravity, Cursor, and Claude Code setup.

Whenever designing or refining components:
1. **Query `apple-hig` MCP Server**:
   - `get_component_spec`: Inspect platform specs for Button, Toggle, SegmentedControl, Modal/Sheet before styling.
   - `get_design_tokens`: Validate corner radii, blur values, and optical margins against macOS/iOS standards.
   - `get_accessibility_requirements`: Check 44pt touch targets and WCAG 2.1 AA contrast ratios.
2. **Validate with `playwright` MCP Server**:
   - Test viewports: Desktop (1280x800) and Mobile (375x667 for iPhone SE, 390x844 for iPhone 14/15).
   - Test horizontal overflow: ensure `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
   - Test theme switching: verify `:root` Light Mode (default `#f8fafc`) and `html.dark` Dark Mode (`#0c0d10`).

## 2. The 7 Non-Negotiable Invariants
1. **Anti-Bubble Geometry Scale**:
   - STRICT BAN on `rounded-full` or `border-radius: 9999px` on functional UI (buttons, cards, badges, tabs).
   - Enforce rectangular radii: Badges (4px), Buttons/Items (4px–6px), Cards/Inputs (8px), Hero (12px).
2. **Dual-Theme Invariant**:
   - Light Mode is the default `:root` baseline.
   - Dark Mode is applied under `html.dark` (or `.dark`).
   - All components use standard CSS variables (`var(--slate-2)`, `var(--accent-base)`, etc.) without duplicate `dark:` classes.
3. **Canonical Default Palette**:
   - Primary active palette is **Champagne Gold** (`#ca8a04` Light / `#eab308` Dark).
4. **Hebrew RTL & Anti-Text-Chopping**:
   - STRICT BAN on `truncate`, `line-clamp-1`, or `line-clamp-2` on educational titles, subtitles, or badges.
   - Allow natural wrap (`break-words`, `leading-relaxed`).
   - Badges must have `px-2 py-0.5` horizontal padding to prevent corner clipping of final Hebrew letters (ך, ף, ץ, ן, ם).
5. **100% Opaque Content Cards**:
   - Liquid Glass (`backdrop-filter: blur(28px)`) is reserved ONLY for floating overlays (Sticky Header, Popovers, Modals).
   - All body containers MUST be 100% opaque tactile cards (`.card-tactile`, `#ffffff` / `#15161c`). Never stack translucent glass.
6. **Functional Hollow Buttons**:
   - Base button: `.btn-hollow` (translucent wash, 1px slate border, 6px radius).
   - Primary button: `.btn-hollow-primary` (deep slate / specular rim with accent glow on hover).
   - ZERO glowing neon borders or neon chromatic clutter.
   - ZERO emojis in UI buttons, tabs, modal headers, or navigation items.
7. **Mobile & iOS Safari Safeguards**:
   - All inputs must have `font-size: 16px` on screens `<768px` to stop iOS Safari auto-zoom.
   - Sticky headers must use `env(safe-area-inset-top)`.
   - Center navigation must collapse into a compact chip on mobile to fit 375px screens.

## 3. Tactile Audio Feedback
Attach `tactileAudio.playClick()` on button clicks, tab switches, and theme toggles for physical, haptic-feeling micro-feedback via Web Audio API.
