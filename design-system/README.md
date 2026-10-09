# Zen 2.0 Design System Starter Kit & Export Package
*Production-ready Liquid Glass, 100% Opaque Tactile Cards, and Hollow Restraint Framework*

> **Notice for Developers & Autonomous Agents**:  
> Before implementing or modifying this design system, read the mandatory [SPECIFICATION.md](./SPECIFICATION.md) (or [SPECIFICATION.he.md](./SPECIFICATION.he.md)).

---

## What Is This?
This directory contains the **complete, standalone, exportable design system** created for high-focus educational, dashboard, and creative tools. It can be dropped directly into any React, Vue, Svelte, Astro, Next.js, or plain HTML project.

### Key Highlights
- **Default Light Mode with Clean Dark Mode Override**: Fresh visits load in crisp, bright, high-contrast alabaster (`#f8fafc`), with instant toggle to deep cinema slate (`#0c0d10`).
- **Canonical Champagne Gold Theme**: Default accent palette tuned for subtle elegance, with fallback support for Matte Amber, Nordic Ice, and Emerald Sanctuary.
- **Strict Anti-Bubble Geometry**: No bloated capsules or `rounded-full` pills on functional UI elements. Strict architectural 4px–8px rectangular radii scale.
- **Hebrew RTL & Anti-Clipping Safeguards**: Designed specifically to prevent letter pinching (ך, ף, ץ, ן, ם) and text truncation (`truncate`/`line-clamp`).
- **iOS Safari & Mobile Hardening**: Verified zero horizontal scrollbar on 375px screens, 16px mobile input font-size (stops Safari auto-zoom), and safe-area padding.

---

## Directory Structure

```
design-system/
├── tokens.css             # Standalone CSS variables (Light :root + Dark html.dark, Champagne Gold)
├── components.css         # Utility classes (.card-tactile, .btn-hollow, .segmented-glass, etc.)
├── tailwind.preset.js     # Tailwind CSS configuration preset
├── mcp.json               # Direct MCP server configuration (Apple HIG + Playwright)
├── demo.html              # Standalone interactive showcase (double-click to test anywhere!)
├── SPECIFICATION.md       # Complete architectural rulebook in English
├── SPECIFICATION.he.md    # Complete architectural rulebook in Hebrew
├── scripts/
│   └── verify-design.js   # Automated Playwright invariant auditor (Light mode, 375px, 16px inputs)
├── skills/
│   └── zen-design-system/
│       └── SKILL.md       # Agent skill for Antigravity, Cursor, and Claude Code
└── templates/             # Drop-in React components & utilities
    ├── Header.jsx         # Sticky optical liquid glass header with responsive nav
    ├── TactileCard.jsx    # 100% opaque tactile card (default, highlight, hero)
    ├── HollowButton.jsx   # Canonical hollow glass button (base & primary)
    ├── SegmentedControl.jsx # Apple-style specular segmented switch
    ├── Badge.jsx          # 4px rectangular badge with anti-pinch padding
    ├── ThemeToggle.jsx    # One-tap Sun/Moon theme switcher
    └── tactileAudio.js    # Zero-dependency Web Audio tactile click engine
```

---

## 5-Minute Quickstart

### 1. Plain HTML / CSS
Simply include the CSS files:
```html
<link rel="stylesheet" href="./design-system/tokens.css" />
<link rel="stylesheet" href="./design-system/components.css" />

<body class="canvas-ambient">
  <div class="card-tactile">
    <span class="badge-glass badge-glass-accent">Champagne Gold</span>
    <h2>Card Title</h2>
    <button class="btn-hollow-primary">Action &larr;</button>
  </div>
</body>
```

### 2. React / Vite / Next.js
In your main CSS file (`index.css` / `globals.css`):
```css
@import './design-system/tokens.css';
@import './design-system/components.css';
```
Then import the ready-to-use templates:
```jsx
import TactileCard from './design-system/templates/TactileCard.jsx';
import HollowButton from './design-system/templates/HollowButton.jsx';
import Badge from './design-system/templates/Badge.jsx';

export default function MyWidget() {
  return (
    <TactileCard variant="highlight">
      <Badge variant="accent">New Station</Badge>
      <h3>Ready to Begin</h3>
      <HollowButton variant="primary">Launch &larr;</HollowButton>
    </TactileCard>
  );
}
```

### 3. Interactive Browser Demo
Double-click `demo.html` in your file explorer or open it in any web browser to see the live tokens, component states, palette switcher, and Light/Dark toggle in action.
