"""
Script to generate high-resolution Open Graph social cards, app icons, and favicons for ZenLab.
Uses Playwright with Chromium to render pixel-perfect HTML/CSS templates.
"""
import os
import time
from playwright.sync_api import sync_playwright

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(WORKSPACE, "public")
GITHUB_ASSETS = os.path.join(WORKSPACE, ".github", "assets")

OG_HTML = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600&family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #020617;
      color: #f8fafc;
      font-family: 'Heebo', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 56px;
      position: relative;
    }
    
    /* Background subtle mesh glow */
    .bg-glow-1 {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(2, 6, 23, 0) 70%);
      pointer-events: none;
    }
    .bg-glow-2 {
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(2, 6, 23, 0) 70%);
      pointer-events: none;
    }
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(to right, rgba(51, 65, 85, 0.15) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(51, 65, 85, 0.15) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    
    /* Top Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(37, 99, 235, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .brand-name {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-tag {
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      font-weight: 600;
    }
    .badge-grade {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid #334155;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 600;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }

    /* Hero Text */
    .hero {
      position: relative;
      z-index: 10;
      margin-top: 10px;
    }
    .title {
      font-size: 46px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 30%, #bae6fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 21px;
      font-weight: 500;
      color: #94a3b8;
      font-family: 'Rubik', sans-serif;
      line-height: 1.4;
      max-width: 950px;
    }

    /* Labs Grid */
    .labs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      position: relative;
      z-index: 10;
      margin-top: 8px;
    }
    .lab-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(51, 65, 85, 0.6);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .lab-num {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      flex-shrink: 0;
    }
    .lab-info {
      overflow: hidden;
    }
    .lab-title {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lab-sub {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Footer */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      padding-top: 16px;
      border-top: 1px solid rgba(51, 65, 85, 0.4);
    }
    .footer-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 17px;
      font-weight: 600;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-tags {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }
    .footer-pill {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      padding: 4px 12px;
      border-radius: 6px;
      color: #cbd5e1;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M9 9h6v6H9z"/>
          <path d="M3 9h2"/>
          <path d="M3 15h2"/>
          <path d="M19 9h2"/>
          <path d="M19 15h2"/>
          <path d="M9 3v2"/>
          <path d="M15 3v2"/>
          <path d="M9 19v2"/>
          <path d="M15 19v2"/>
        </svg>
      </div>
      <div class="brand-name">
        ZenLab
        <span class="brand-tag">From Zero to Neural</span>
      </div>
    </div>
    <div class="badge-grade">
      <span class="badge-dot"></span>
      כיתה ה׳ ומעלה • גילאי 10–11
    </div>
  </div>

  <!-- Hero Content -->
  <div class="hero">
    <h1 class="title">מעבדת מדעי המחשב והבינה המלאכותית</h1>
    <p class="subtitle">
      מרחב חקר אינטראקטיבי פתוח וחינמי: מחומרה, פיקסלים ושערים לוגיים ועד לרשתות נוירונים ומודלי שפה ענקיים (LLM).
    </p>
  </div>

  <!-- Labs Cards (8 Labs) -->
  <div class="labs-grid">
    <div class="lab-card">
      <div class="lab-num">01</div>
      <div class="lab-info">
        <div class="lab-title">פיקסלים וצבע</div>
        <div class="lab-sub">ביטים, בתים ורשת 8x8</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">02</div>
      <div class="lab-info">
        <div class="lab-title">ספירה בינארית</div>
        <div class="lab-sub">בסיס 2 ומתגי חומרה</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">03</div>
      <div class="lab-info">
        <div class="lab-title">שערים לוגיים</div>
        <div class="lab-sub">AND, OR, NOT, XOR</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">04</div>
      <div class="lab-info">
        <div class="lab-title">אלגוריתמי חיפוש</div>
        <div class="lab-sub">A* ומסלול קצר במבוך</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">05</div>
      <div class="lab-info">
        <div class="lab-title">למידת מכונה</div>
        <div class="lab-sub">סיווג k-NN ועצי החלטה</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">06</div>
      <div class="lab-info">
        <div class="lab-title">ראייה ממוחשבת</div>
        <div class="lab-sub">פילטרים וקונבולוציה</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">07</div>
      <div class="lab-info">
        <div class="lab-title">רשת נוירונים</div>
        <div class="lab-sub">פרספטרון ומשקולות</div>
      </div>
    </div>
    <div class="lab-card">
      <div class="lab-num">08</div>
      <div class="lab-info">
        <div class="lab-title">מודלי שפה (LLM)</div>
        <div class="lab-sub">חיזוי טוקנים ואתיקה</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-url">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
      zenlab.ninyo.co
    </div>
    <div class="footer-tags">
      <span class="footer-pill">קוד פתוח (MIT)</span>
      <span class="footer-pill">אפס איסוף מידע (Strict Zero-PII)</span>
      <span class="footer-pill">תואם משרד החינוך & AI4K12</span>
    </div>
  </div>
</body>
</html>
"""

ICON_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(14, 165, 233, 0.15) 50%, rgba(2, 6, 23, 0) 75%);
    }
    .icon-box {
      width: 380px;
      height: 380px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 3px solid rgba(56, 189, 248, 0.4);
      border-radius: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 99, 235, 0.35);
      position: relative;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="icon-box">
    <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="3" stroke="#60a5fa" stroke-width="1.8"/>
      <path d="M9 9h6v6H9z" fill="rgba(14, 165, 233, 0.25)" stroke="#38bdf8" stroke-width="2"/>
      <path d="M3 9h2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M3 15h2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M19 9h2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M19 15h2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M9 3v2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M15 3v2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M9 19v2" stroke="#93c5fd" stroke-width="2"/>
      <path d="M15 19v2" stroke="#93c5fd" stroke-width="2"/>
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
    </svg>
  </div>
</body>
</html>
"""

def generate_assets():
    print("Starting Playwright to render social assets...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # 1. Render OG Image (1200 x 630)
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        page.set_content(OG_HTML)
        # Wait for web fonts to load
        page.wait_for_timeout(2000)
        
        og_dest = os.path.join(PUBLIC_DIR, "og-image.png")
        page.screenshot(path=og_dest)
        print(f"Generated {og_dest}")
        
        github_social_dest = os.path.join(GITHUB_ASSETS, "social-preview.png")
        page.screenshot(path=github_social_dest)
        print(f"Generated {github_social_dest}")
        
        # 2. Render Icon (512 x 512)
        icon_page = browser.new_page(viewport={"width": 512, "height": 512}, device_scale_factor=1)
        icon_page.set_content(ICON_HTML)
        icon_page.wait_for_timeout(1000)
        
        icon512_dest = os.path.join(PUBLIC_DIR, "icon-512.png")
        icon_page.screenshot(path=icon512_dest)
        print(f"Generated {icon512_dest}")
        
        # 3. Render 192x192 & Apple Touch Icon (180x180) from PIL
        from PIL import Image
        img512 = Image.open(icon512_dest)
        
        icon192_dest = os.path.join(PUBLIC_DIR, "icon-192.png")
        img512.resize((192, 192), Image.Resampling.LANCZOS).save(icon192_dest)
        print(f"Generated {icon192_dest}")
        
        apple_dest = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
        img512.resize((180, 180), Image.Resampling.LANCZOS).save(apple_dest)
        print(f"Generated {apple_dest}")
        
        browser.close()
    print("All visual assets generated successfully!")

if __name__ == "__main__":
    generate_assets()
