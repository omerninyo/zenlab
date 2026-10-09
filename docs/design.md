# מפרט שפת העיצוב של דפים 4.0 ומדריך ניידות לפרויקטים חיצוניים (Dapim 4.0 Design System & Portability Guide)
## תקן Apple Liquid Glass, איפוק מונוכרומטי, כפתורים חלולים ומנוע ערכות נושא מותאם אישית

> מסמך זה מרכז את כל עקרונות העיצוב, נוסחאות החומרים, טוקני ה-CSS, הגדרות ה-MCP וה-Skills, והנחיות העבודה עבור סוכני AI ומפתחים המעוניינים להשתמש בשפת העיצוב של "דפים" (Dapim 4.0) בפרויקטים נפרדים – בין אם כברירת מחדל מונוכרומטית ובין אם בבניית ערכות נושא מותאמות אישית.

---

## 1. פילוסופיית העיצוב ועקרונות היסוד (Core Philosophy & Axioms)

מערכת העיצוב של דפים 4.0 אינה עוד "ספריית רכיבים" צבעונית, אלא מערכת היררכית ממושמעת בהשראת Apple visionOS, macOS Sequoia ומוצרי קריאה עילית (Kavita Reader, Apple Books).

### א. שתי השכבות הבסיסיות (The Two Fundamentally Different Layers)
הממשק מחולק לשתי שכבות נפרדות לחלוטין ברמת ה-DOM והסגנון:

1. **שכבת התוכן (Content Layer) — 100% מוצקה ואטומה:**
   - **מהות:** גריד הפריטים, כרטיסי המידע, הטבלאות, הטקסטים והתמונות.
   - **חוק ברזל:** שכבת התוכן **לעולם אינה עשויה מזכוכית נוזלית (Liquid Glass)** ואינה כוללת טשטוש רקע (`backdrop-filter: blur`), כדי להבטיח 100% קריאות, חדות וניגודיות (WCAG AAA).
   - **התוכן הוא מקור הצבע היחיד:** תמונות המוצר / כריכות הספרים / יצירות האמנות הן שמכניסות צבע למסך; הממשק עצמו הוא קנבס שקט.

2. **שכבת השליטה התפקודית (Functional UI Layer) — זכוכית נוזלית אופטית:**
   - **מהות:** סרגל עליון (Header), שורת חיפוש צפה, מודאלים, יריעות תחתונות (Bottom Sheets), מעגני פעולות צפים (Floating Action Docks) ותפריטי משתמש.
   - **חוק ברזל:** החומר הזכוכיתי (`backdrop-filter`, `rgba` שקוף למחצה ושפת אור ספקולרית) שייך אך ורק לאלמנטים צפים השולטים על התוכן.

### ב. עקרונות האיפוק הרדיקלי (Radical Restraint & Anti-Glow)
- **איסור מוחלט על אלמנטים זוהרים (Anti-Glow):** אין להשתמש בגרדיאנטים ניאוניים, הילות זרחניות (Glows), או צבעי סגול "AI קסום".
- **איסור על צבעי כחול/ירוק/סגול ב-UI המערכתי:** אין כפתורים כחולים אטומים, אין צ'קבוקסים זוהרים ואין נקודות סטטוס זרחניות.
- **איסור על אמוג'י ברכיבי ממשק (Zero Cartoon Emojis):** כפתורים, סרגלים וכותרות מכילים אך ורק אייקוני וקטור מערכתיים נקיים (קווי SVG בעובי 1.8–2px בסגנון Apple SF Symbols או Lucide Icons).
- **רדיוסים מרוסנים (Restrained Radii):** הימנעות מבועות עגולות מוגזמות (`border-radius: 9999px`). רדיוסים תקניים הם 8px–12px לכרטיסים ולכפתורים, ו-18px–20px למודאלים מוגבהים.

---

## 2. מפרט חומרי ה-Liquid Glass והתאורה (Materials & Lighting Engine)

### א. נוסחת הזכוכית הנוזלית (Optical Liquid Glass OS 27)
הזכוכית מורכבת מ-4 רבדים חזותיים המעניקים עומק פיזיקלי ללא כובד:
```css
/* Functional Liquid Glass Formula */
.liquid-glass-surface {
  background: rgba(16, 18, 24, 0.84); /* רקע זכוכיתי כהה שקוף למחצה */
  backdrop-filter: blur(32px) saturate(190%); /* טשטוש אופטי עשיר והגברת רוויה טבעית */
  -webkit-backdrop-filter: blur(32px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.09); /* מסגרת דקיקה */
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.16), /* שפת אור עליונה (Specular Highlight) */
    0 16px 40px -4px rgba(0, 0, 0, 0.65),      /* צל עומק רך */
    0 4px 12px rgba(0, 0, 0, 0.45);
}
```

### ב. תאורת Velvet Ambient וקנבס גלובלי (Master Velvet Formula)
במקום רקע שחור אחיד, המערכת משתמשת בתאורת אליפסה עליונה רכה וקבועה המייצרת תחושת עומק ויוקרה:
```css
/* Dark Mode: Cinema Slate + Ambient Velvet Mist */
:root {
  --content-bg: #0c0d10;
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(212, 131, 68, 0.12) 0%, rgba(212, 131, 68, 0.035) 45%, transparent 75%),
    linear-gradient(180deg, #151720 0%, #0d0e12 40%, #07080a 100%);
}

body {
  background-color: var(--content-bg);
  background-image: var(--content-bg-gradient);
  background-attachment: fixed;
  color: var(--text-primary);
  min-height: 100vh;
}
```

---

## 3. ארכיטקטורת הכפתורים החלולים (The Canonical Hollow Button Mandate)

> **חוק בל יעבור:** כפתורים לעולם אינם עשויים מבלוק צבע אטום או מגרדיאנט בוהק. כל הכפתורים במערכת שקופים למחצה (Hollow Glass).

### א. כפתור משני / בסיס (Hollow Glass Secondary Button)
- רקע זכוכיתי שקוף `rgba(255, 255, 255, 0.05)` עם `backdrop-filter: blur(12px)`.
- מסגרת עדינה מבוססת Slate.
- שפת אור עליונה `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.

### ב. כפתור פעולה ראשי חלול (Hollow Primary Action Button)
- משטח זכוכית חלולה עם גרדיאנט עדין: `linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%)`.
- שפת הדגשה עדינה (Accent Rim): `1px solid var(--accent-rim)`.
- קו אור ספקולרי מואר: `inset 0 1px 0 0 rgba(255, 255, 255, 0.20)`.
- בהובר: שטיפת צבע עדינה ושקופה (`rgba(..., 0.18)`), ללא הפיכה למשטח אטום.

### ג. קוד ה-CSS של הכפתורים להעתקה ישירה:
```css
/* Base Hollow Button */
.btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.20);
  transform: translateY(-1px);
}

.btn-glass:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.04);
}

/* Primary Action Hollow Button */
.btn-glass-primary {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid var(--accent-rim);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.35);
  color: #ffffff;
  font-weight: 600;
}

.btn-glass-primary:hover {
  background: var(--accent-wash);
  border-color: var(--accent-hover);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.30),
    0 4px 14px rgba(0, 0, 0, 0.45);
  transform: translateY(-1px);
}

.btn-glass-primary:active {
  transform: translateY(0);
}
```

---

## 4. שבע תבניות הרכיבים המרכזיות (The 7 Canonical UI Templates)

| תבנית | ייעוד | מאפייני CSS עיקריים |
|---|---|---|
| **1. קנבס ואיפוסים** | רקע גלובלי, פונטים, מניעת זום | `background-attachment: fixed; font-family: -apple-system, sans-serif;` |
| **2. סרגל עליון דביק** | Header ראשי | `position: sticky; top: 0; backdrop-filter: blur(32px); padding-top: max(0.65rem, env(safe-area-inset-top));` |
| **3. כרטיס תוכן טקטילי** | כרטיסי מידע, פריטים | `background: rgba(22, 24, 32, 0.75); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;` |
| **4. מודאל / יריעת מובייל** | דיאלוגים וטפסים | דסקטופ: מודאל ממורכז `min(640px, 92vw)`. מובייל (`<=768px`): יריעה תחתונה `height: 90dvh; border-radius: 20px 20px 0 0;` |
| **5. כפתורים חלולים** | כל פעולות ה-UI | כפתורי בסיס וראשיים חלולים מזכוכית נוזלית (ראו סעיף 3) |
| **6. שדות קלט ובקרים** | חיפוש, טפסים, מתגים | גובה 40px, רקע `rgba(255,255,255,0.06)`, גופן `16px !important` במובייל למניעת זום באייפון |
| **7. תקן מובייל ו-iOS** | התאמת מגע ובטיחות מסך | מינימום 44px שטח מגע (`min-height: 44px`), שימוש ב-`env(safe-area-inset-bottom)`, ואפס גלילה אופקית |

---

## 5. מנוע החלפת ערכות נושא (Theme Customization & Alternative Palette Engine)

כדי ליצור עיצוב חדש לחלוטין בפרויקט אחר, **אין צורך לשנות את ה-HTML או את לוגיקת ה-Liquid Glass**. 
כל מה שנדרש הוא להחליף את בלוק הטוקנים ב-CSS.

המבנה הארכיטקטוני מפריד בין:
- **המבנה הפיזי (Structure):** דרגות Slate 1–7 (רקעים, כרטיסים, גבולות, טקסט).
- **האווירה וההדגשה (Accent & Atmosphere):** דרגות 8–10 והגרדיאנט העליון.

### דוגמה א': ברירת המחדל של דפים — Kavita Matte Amber (ספרייה ארכיונית חמימה)
```css
:root {
  --theme-name: "Dapim Matte Amber";
  --accent-base: #d48344;
  --accent-hover: #e09559;
  --accent-rim: rgba(212, 131, 68, 0.45);
  --accent-wash: rgba(212, 131, 68, 0.18);
  --focus-ring: 0 0 0 2px rgba(212, 131, 68, 0.45);
  
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(212, 131, 68, 0.12) 0%, rgba(212, 131, 68, 0.035) 45%, transparent 75%),
    linear-gradient(180deg, #151720 0%, #0d0e12 40%, #07080a 100%);
}
```

### דוגמה ב': ערכת Nordic Ice & Midnight (טכנולוגי, קר ויוקרתי)
מתאים למערכות תוכנה, קונסולות DevOps, או ממשקי Data:
```css
[data-theme="nordic-ice"] {
  --theme-name: "Nordic Ice";
  --accent-base: #38bdf8;
  --accent-hover: #7dd3fc;
  --accent-rim: rgba(56, 189, 248, 0.40);
  --accent-wash: rgba(56, 189, 248, 0.15);
  --focus-ring: 0 0 0 2px rgba(56, 189, 248, 0.40);
  
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(56, 189, 248, 0.09) 0%, rgba(56, 189, 248, 0.02) 45%, transparent 75%),
    linear-gradient(180deg, #101520 0%, #0a0d14 40%, #05070a 100%);
}
```

### דוגמה ג': ערכת Emerald Sanctuary (אורגני, מחקר ומסמכים)
מתאים לאפליקציות בריאות, סביבה, ניהול ידע ומסמכים:
```css
[data-theme="emerald-sanctuary"] {
  --theme-name: "Emerald Sanctuary";
  --accent-base: #10b981;
  --accent-hover: #34d399;
  --accent-rim: rgba(16, 185, 129, 0.40);
  --accent-wash: rgba(16, 185, 129, 0.16);
  --focus-ring: 0 0 0 2px rgba(16, 185, 129, 0.40);
  
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(16, 185, 129, 0.10) 0%, rgba(16, 185, 129, 0.025) 45%, transparent 75%),
    linear-gradient(180deg, #101c18 0%, #0a110e 40%, #050807 100%);
}
```

### דוגמה ד': ערכת Cyberpunk Luxury & Champagne Gold (עושר פיננסי או פרימיום כהה)
מתאים לאתרי יוקרה, מסחר, או קריפטו:
```css
[data-theme="champagne-gold"] {
  --theme-name: "Champagne Gold";
  --accent-base: #eab308;
  --accent-hover: #facc15;
  --accent-rim: rgba(234, 179, 8, 0.42);
  --accent-wash: rgba(234, 179, 8, 0.15);
  --focus-ring: 0 0 0 2px rgba(234, 179, 8, 0.42);
  
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(234, 179, 8, 0.11) 0%, rgba(234, 179, 8, 0.03) 45%, transparent 75%),
    linear-gradient(180deg, #181610 0%, #0e0d0a 40%, #070605 100%);
}
```

---

## 6. ארגז הכלים לסוכן AI ולפרויקט (Tools, MCPs & Skills Setup)

כאשר מקימים פרויקט חדש או רוצים שסוכן AI ישלוט בשפה זו, מומלץ לחמש אותו בכלים הבאים:

### א. תוסף ושרת MCP: `apple-hig-mcp`
שרת ה-MCP הרשמי להנחיות Apple HIG ו-Liquid Glass.
- **התקנה:**
  ```bash
  # באמצעות Homebrew או npm (LobeHub Marketplace)
  npm install -g apple-hig-mcp
  # או הורדת הבינארי ל-/opt/homebrew/bin/apple-hig-mcp
  ```
- **קונפיגורציה (`~/.gemini/config/mcp_config.json` או בפרויקט):**
  ```json
  {
    "mcpServers": {
      "apple-hig": {
        "command": "/opt/homebrew/bin/apple-hig-mcp",
        "args": []
      }
    }
  }
  ```
- **כלים זמינים שהסוכן מפעיל:**
  1. `search_guidelines(query, platform, category)`: חיפוש תקנים רשמיים (למשל `liquid glass`, `buttons`, `materials`).
  2. `get_component_spec(componentName, platform)`: שליפת מפרט טכני מלא עבור רכיב (Navigation Bar, Segmented Control, Sheets).
  3. `get_design_tokens(category, platform)`: שליפת ערכי גדלים, מרווחים ושקיפויות.
  4. `get_accessibility_requirements(componentName)`: אימות עמידה בדרישות נגישות ו-Touch targets.

### ב. סקילס (Skills) מומלצים לארכיטקטורת ממשק
1. **`apple-hig`:** מתאם ומנגיש את כללי ה-HIG של Apple (טיפוגרפיית SF Pro, יחסי גובה-רוחב, תנועה ומשטחים).
2. **`modern-web-guidance`:** כלי מחקר ל-CSS ו-HTML מודרניים (`:has()`, container queries, popovers, backdrop-filter תאימות דפדפנים).
3. **`a11y-debugging`:** כלי אימות נגישות של Chrome DevTools (יחסי קונטרסט, focus rings, גדלי לחיצה).
4. **`chrome-devtools`:** הרצת Playwright לבדיקות ויזואליות חיות, לכידת צילומי מסך ואימות חזותי.

---

## 7. תבנית הנחיות מוכנה להדבקה עבור סוכן AI חדש (Drop-in AI System Prompt)

העתיקו את הבלוק הבא ישירות לקובץ `AGENTS.md` או ל-System Prompt של הפרויקט הבא שלכם:

```markdown
# תקן העיצוב המחייב: Apple Liquid Glass & Hollow Restraint System

אתה פועל תחת תקן עיצוב קפדני ומודרני (Pure Slate, Liquid Glass & Hollow Buttons). כל רכיב ממשק (HTML/CSS/JS) חייב לעמוד בכללים הבאים:

1. הפרדת שכבות מוחלטת:
   - שכבת התוכן (Content Layer): 100% מוצקה ואטומה. לעולם ללא backdrop-blur או שקיפויות הפוגעות בקריאות.
   - שכבת השליטה (Functional UI): זכוכית נוזלית צפה (backdrop-filter: blur(32px) saturate(190%)), מסגרת דקה וקו אור עליון ספקולרי (inset 0 1px 0 0 rgba(255,255,255,0.16)).
2. איסור מוחלט על כפתורים אטומים (Hollow Button Mandate):
   - כל הכפתורים במערכת שקופים למחצה (חצי-זכוכית).
   - כפתור ראשי מוגדר ע"י שפת הדגשה עדינה (Accent Rim) וקו אור ספקולרי מואר, עם שטיפת צבע שקופה בלבד בהובר. חל איסור על בלוקים אטומים או גרדיאנטים בוהקים.
3. איפוק רדיקלי ואפס זוהר (Anti-Glow & Zero Blue):
   - אסור להשתמש בגרדיאנטים ניאוניים, הילות זוהרות (box-shadow בוהק) או כחול דפדפן ברירת מחדל.
   - טבעת פוקוס היא תמיד עדינה ומאופקת: 0 0 0 2px var(--focus-ring).
4. אפס אמוג'י ב-UI:
   - אין להשתמש באמוג'י בשום כפתור, תפריט או כותרת. יש להשתמש אך ורק באייקוני וקטור מערכתיים נקיים (SVG קווי בעובי 1.8-2px בסגנון Apple SF Symbols / Lucide).
5. תקן מובייל ואייפון:
   - כל שדה קלט מוגדר עם font-size: 16px !important במובייל כדי למנוע זום אוטומטי של Safari iOS.
   - כל יעד מגע (Touch Target) הוא לפחות 44x44px.
   - מודאלים הופכים במובייל ליריעות תחתונות (Bottom Sheets) עם גובה 90dvh ורדיוס עליון 20px.
```

---

## 8. קובץ ה-CSS הבסיסי להעתקה מיידית (`design-tokens.css`)

```css
/* ==========================================================================
   PORTABLE LIQUID GLASS & HOLLOW RESTRICTIVE DESIGN SYSTEM
   Drop this CSS file directly into any web application.
   ========================================================================== */

:root {
  /* 1. Monochromatic Radix Slate Scale */
  --slate-1: #0c0d10;
  --slate-2: #15161c;
  --slate-3: #1c1e27;
  --slate-4: #252834;
  --slate-5: #2f3342;
  --slate-6: rgba(255, 255, 255, 0.10);
  --slate-7: rgba(255, 255, 255, 0.16);
  --slate-11: #9ca3af;
  --slate-12: #ffffff;

  /* 2. Active Accent Palette (Replace here to swap theme!) */
  --accent-base: #d48344;
  --accent-hover: #e09559;
  --accent-rim: rgba(212, 131, 68, 0.45);
  --accent-wash: rgba(212, 131, 68, 0.18);
  --focus-ring: 0 0 0 2px rgba(212, 131, 68, 0.45);

  /* 3. Velvet Ambient Lighting Formula */
  --content-bg: #0c0d10;
  --content-bg-gradient: 
    radial-gradient(ellipse 95% 65% at 50% -8%, rgba(212, 131, 68, 0.12) 0%, rgba(212, 131, 68, 0.035) 45%, transparent 75%),
    linear-gradient(180deg, #151720 0%, #0d0e12 40%, #07080a 100%);

  /* 4. Optical Liquid Glass Material */
  --glass-bg: rgba(16, 18, 24, 0.84);
  --glass-blur: blur(32px) saturate(190%);
  --glass-border: 1px solid rgba(255, 255, 255, 0.09);
  --glass-specular-top: inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
  --glass-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.45);

  /* 5. Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Heebo", "Assistant", sans-serif;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}

/* Global Setup */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-family);
  background-color: var(--content-bg);
  background-image: var(--content-bg-gradient);
  background-attachment: fixed;
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.5;
}

/* Header Optical Glass */
.header-glass {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: var(--glass-border);
  box-shadow: var(--glass-specular-top), 0 8px 24px -4px rgba(0, 0, 0, 0.4);
  padding: max(0.65rem, env(safe-area-inset-top)) 1.25rem 0.65rem 1.25rem;
}

/* Tactile Opaque Card (Content Layer) */
.card-tactile {
  background: var(--slate-2);
  border: 1px solid var(--slate-6);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 6px 20px -2px rgba(0, 0, 0, 0.4);
  padding: 1.25rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card-tactile:hover {
  transform: translateY(-2px);
  border-color: var(--accent-rim);
}

/* Hollow Base Button */
.btn-hollow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-hollow:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

/* Hollow Primary Action Button */
.btn-hollow-primary {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid var(--accent-rim);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 2px 8px rgba(0, 0, 0, 0.35);
  font-weight: 600;
}

.btn-hollow-primary:hover {
  background: var(--accent-wash);
  border-color: var(--accent-hover);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.30), 0 4px 14px rgba(0, 0, 0, 0.45);
  transform: translateY(-1px);
}

/* Responsive iOS Form Input */
.input-glass {
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--slate-6);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0 12px;
  font-family: inherit;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-glass:focus {
  border-color: var(--accent-base);
  box-shadow: var(--focus-ring);
}

@media (max-width: 768px) {
  .input-glass {
    font-size: 16px !important; /* Critical: Stops iOS Safari auto-zoom */
  }
}
```
