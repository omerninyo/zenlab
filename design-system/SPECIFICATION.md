# Zen 2.0 Design System Specification & Rulebook
**Standard Architectural Guide for Human Engineers & Autonomous AI Agents**  
*Liquid Glass, 100% Opaque Tactile Slate, Hollow Restraint, and Anti-Bubble Geometry*

---

## 1. Executive Summary & Core Philosophy

The **Zen 2.0 Design System** is an engineering-grade design framework derived from the convergence of Apple’s visionOS/macOS Liquid Glass, Radix UI Monochromatic Slate, and restrained hollow interaction patterns. It is specifically calibrated for high-precision educational applications, developer dashboards, and child-accessible learning environments.

### The Three Foundational Tenets
1. **Optical Glass is for Floating Overlays Only**: Backdrop blurs (`blur(28px)`) and specular edge highlights are strictly reserved for the top navigation bar, floating drawers, and modal dialogs.
2. **Content Lives on 100% Opaque Tactile Cards**: Never nest translucent glass inside translucent glass. All body containers are 100% opaque (`#ffffff` in Light Mode, `#15161c` in Dark Mode) with subtle slate borders and micro-shadows.
3. **Restrained Rectangular Geometry (Anti-Bubble Rule)**: Bubbly capsules (`rounded-full`, `border-radius: 9999px`) are strictly forbidden on functional UI elements. The design system enforces an architectural 4px–8px scale.

---

## 2. The 7 Inviolable Invariants (Agent Directives)

Every autonomous agent or developer implementing this design system **must strictly obey** these seven rules. Violating any of them constitutes an immediate architectural regression.

### Invariant 1: The Anti-Bubble Geometry Scale
* **Prohibition**: NEVER use `rounded-full` or `border-radius: 9999px` on badges, buttons, cards, segmented controls, or form inputs. Capsule shapes look juvenile, distort alignment, and severely pinch Hebrew glyphs.
* **Mandatory Radii Scale**:
  | Token | Value | Tailwind Class | Permitted Usage |
  | :--- | :--- | :--- | :--- |
  | `--radius-badge` | `4px` | `rounded` | Status tags, metadata chips, track indicators |
  | `--radius-item` | `4px` | `rounded` | Segmented control active pill, menu items |
  | `--radius-btn` | `6px` | `rounded-md` | Base hollow buttons, primary action buttons |
  | `--radius-input` | `8px` | `rounded-lg` | Form inputs, select dropdowns, search boxes |
  | `--radius-card` | `8px` | `rounded-lg` | Standard content cards, lab stations, stat tiles |
  | `--radius-container`| `10px` | `rounded-lg` / `rounded-xl`| Segmented containers, grouped sections |
  | `--radius-hero` | `12px` | `rounded-xl` | Master Command Hero, spotlight cards |

### Invariant 2: Dual Light-Mode Default Architecture
* **Rule**: Crisp **Light Mode** is the canonical baseline in `:root`. Dark Mode is an explicit override under `html.dark` (or `.dark`).
* **Tokens Dual-Mapping**: Both modes share identical CSS variable names. UI markup never needs `dark:` utility duplication for core token backgrounds or borders.
* **Baseline Values**:
  * Light Mode: Background `#f8fafc` (Alabaster Slate), Cards `#ffffff`, Primary Text `#0f172a`, Borders `#e2e8f0`.
  * Dark Mode: Background `#0c0d10` (Cinema Slate), Cards `#15161c`, Primary Text `#ffffff`, Borders `rgba(255,255,255,0.10)`.

### Invariant 3: Default Palette — Champagne Gold
* **Canonical Default**: The primary theme is **Champagne Gold**.
  * Light Mode: Base `#ca8a04`, Hover `#a16207`, Rim `rgba(202, 138, 4, 0.35)`, Wash `rgba(202, 138, 4, 0.10)`.
  * Dark Mode: Base `#eab308`, Hover `#facc15`, Rim `rgba(234, 179, 8, 0.42)`, Wash `rgba(234, 179, 8, 0.15)`.
* Secondary supported palettes via `data-theme`: `matte-amber`, `nordic-ice`, `emerald-sanctuary`.

### Invariant 4: Hebrew RTL Typography & Anti-Text-Chopping
* **Rule**: NEVER use `truncate`, `line-clamp-1`, or `line-clamp-2` on educational titles, station descriptions, or student rank badges.
* **Rationale**: In Hebrew, sentences cannot be arbitrarily clipped with `...` without destroying pedagogical clarity. Words are wider and vowel diacritics / terminal letters (ך, ף, ץ, ן, ם) require clearance.
* **Mandatory Practice**: Use `break-words`, `leading-relaxed` or `leading-snug`, and natural multi-line wrapping.
* **Badge Clearance**: Badges must have at least `px-2 py-0.5` horizontal padding to prevent corner curves from clipping final letters.

### Invariant 5: Canonical Hollow Glass Buttons
* **Rule**: Buttons are **hollow glass** with backdrop blur, subtle borders, and micro-elevation. Strictly NO solid electric blue or glowing neon borders.
  * Base Button (`.btn-hollow`): Translucent neutral wash, 1px slate border, 6px radius.
  * Primary Button (`.btn-hollow-primary`): Deep slate / specular rim with accent illumination on hover.

### Invariant 6: Mobile & iOS Safari Hardening
* **Rule 1 (16px Input Font)**: All `<input>` and `<select>` controls must have `font-size: 16px` on viewports `<768px`. This is the strict requirement to stop iOS Safari from triggering disruptive auto-zoom on focus.
* **Rule 2 (375px Zero-Overflow)**: The top navigation bar must collapse center navigation into compact icon chips on mobile. Minimum supported viewport is 375px (iPhone SE). Horizontal scrolling (`overflow-x`) is forbidden.
* **Rule 3 (Safe Area Insets)**: Sticky headers and bottom sheets must use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

### Invariant 7: Visual Discipline & Monochromatic Icons
* **Rule**: Exclusively use vector line icons (e.g. Lucide). Strictly **NO emojis in UI buttons, tabs, modal headers, or navigation items**.
* Monochromatic slate palette with only a single accent color active at any time.

---

## 3. CSS Token Reference (`tokens.css`)

```css
/* LIGHT MODE (DEFAULT) */
:root {
  --slate-1: #f8fafc;
  --slate-2: #ffffff;
  --slate-3: #f1f5f9;
  --slate-4: #e2e8f0;
  --slate-5: #cbd5e1;
  --slate-6: #e2e8f0;
  --slate-7: #cbd5e1;
  --slate-11: #334155;
  --slate-12: #0f172a;

  --theme-name: "Champagne Gold";
  --accent-base: #ca8a04;
  --accent-hover: #a16207;
  --accent-rim: rgba(202, 138, 4, 0.35);
  --accent-wash: rgba(202, 138, 4, 0.10);
  --focus-ring: 0 0 0 2px rgba(202, 138, 4, 0.35);

  --content-bg: #f8fafc;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-blur: blur(28px) saturate(180%);
  --glass-border: 1px solid rgba(0, 0, 0, 0.08);
  --glass-specular-top: inset 0 1px 0 0 rgba(255, 255, 255, 0.95);
  --glass-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
}

/* DARK MODE OVERRIDES */
html.dark, .dark {
  --slate-1: #0c0d10;
  --slate-2: #15161c;
  --slate-3: #1c1e27;
  --slate-4: #252834;
  --slate-5: #2f3342;
  --slate-6: rgba(255, 255, 255, 0.10);
  --slate-7: rgba(255, 255, 255, 0.16);
  --slate-11: #9ca3af;
  --slate-12: #ffffff;

  --accent-base: #eab308;
  --accent-hover: #facc15;
  --accent-rim: rgba(234, 179, 8, 0.42);
  --accent-wash: rgba(234, 179, 8, 0.15);

  --content-bg: #0c0d10;
  --glass-bg: rgba(16, 18, 24, 0.84);
  --glass-blur: blur(32px) saturate(190%);
  --glass-border: 1px solid rgba(255, 255, 255, 0.09);
  --glass-specular-top: inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
  --glass-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.45);

  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

---

## 4. Component Classes Matrix (`components.css`)

| Class | Element | Visual Description |
| :--- | :--- | :--- |
| `.canvas-ambient` | `<body>` / Wrapper | Velvet ambient background with smooth radial gradient |
| `.header-glass` | `<header>` | Sticky optical glass bar, specular highlight, iOS safe areas |
| `.card-tactile` | `<div>` / `<article>` | 100% opaque tactile card, 8px radius, micro-shadow, hover lift |
| `.card-command-hero` | `<section>` | Master dashboard hero card, 12px radius, subtle border |
| `.card-tactile-highlight` | `<div>` | Spotlight station card with accent rim illumination |
| `.btn-hollow` | `<button>` / `<a>` | 6px radius hollow glass button, subtle border, hover lift |
| `.btn-hollow-primary` | `<button>` / `<a>` | Primary action button with specular highlight and high affordance |
| `.segmented-glass-container` | `<div>` | Apple-style segmented switch container (8px radius) |
| `.segmented-glass-item` | `<button>` | Segmented tab item (4px radius) |
| `.segmented-glass-item-active`| `<button>` | Active tab item with elevated opaque white/specular pill |
| `.badge-glass` | `<span>` | 4px rectangular badge with anti-pinch padding |
| `.badge-glass-accent` | `<span>` | Accent-tinted badge |
| `.badge-glass-emerald` | `<span>` | Success/Completion emerald badge |
| `.input-glass` | `<input>` / `<select>`| Form control with 16px mobile font-size safeguard |

---

## 5. Migration & Integration in Any New Project

### Step 1: Copy Files
Copy the `design-system/` directory directly into your target project:
```bash
cp -r design-system/ /path/to/target-project/src/design-system/
```

### Step 2: Import Styles
In your global stylesheet (`index.css` or `App.css`):
```css
@import './design-system/tokens.css';
@import './design-system/components.css';
```

### Step 3 (Optional): Tailwind Preset
In your `tailwind.config.js`:
```javascript
module.exports = {
  presets: [require('./src/design-system/tailwind.preset.js')],
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  // ...
};
```

### Step 4: Verify Requirements Checklist
- [ ] Fresh visit loads in **Light Mode** by default.
- [ ] Theme switcher toggles `html.classList.toggle('dark')`.
- [ ] Default palette is **Champagne Gold**.
- [ ] Zero `rounded-full` pills on functional UI elements.
- [ ] Hebrew text wraps naturally without `truncate` or `line-clamp`.
- [ ] Mobile view on 375px has zero horizontal overflow.
- [ ] Inputs have `font-size: 16px` on mobile.

---

## 6. MCP Server Integration: Apple HIG Intelligence

To give AI agents (Antigravity, Cursor, Claude Code) direct access to official Apple HIG guidelines and Liquid Glass specifications, link the included `mcp.json`:

```json
{
  "mcpServers": {
    "apple-hig": {
      "command": "npx",
      "args": ["-y", "apple-hig-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Mandatory Agent MCP Workflow
Before authoring any new component:
1. `call_mcp_tool(ServerName: "apple-hig", ToolName: "get_component_spec", Arguments: { component: "Button" })`
2. `call_mcp_tool(ServerName: "apple-hig", ToolName: "get_design_tokens", Arguments: { category: "radii" })`
3. `call_mcp_tool(ServerName: "apple-hig", ToolName: "get_accessibility_requirements", Arguments: { component: "Button" })`

---

## 7. Automated Invariant Verification & Tactile Audio

### Automated Playwright Audit (`verify-design.js`)
Run the automated verification script to validate all 7 invariants headlessly before committing:
```bash
node design-system/scripts/verify-design.js http://localhost:5173
```
Verifies:
- Default Light Mode baseline
- 375px & 390px zero horizontal overflow
- Input font size >= 16px on mobile
- Zero `rounded-full` / 9999px pills on functional controls

### Tactile Micro-Audio (`tactileAudio.js`)
Zero-dependency Web Audio haptic click synthesis:
```javascript
import { tactileAudio } from './design-system/templates/tactileAudio.js';

// Inside button or tab click:
tactileAudio.playClick();
```

