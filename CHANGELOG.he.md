# יומן שינויים (Changelog)

כל השינויים המהותיים והגרסאות של פרויקט **ZenLab** מתועדים בקובץ זה.

הפורמט מבוסס על [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
והפרויקט מתנהל על פי עקרונות [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-10-08

### נוסף (Added)
- **חבילת 8 המעבדות המלאה לכיתות ה' (Ages 10–11)**:
  - חלוקת תוכנית הלימודים לשני מסלולי ליבה מקבילים בהיקף של 24 כוכבי אתגר:
    - **מסלול 1: חשיבה מחשובית ואלגוריתמיקה**:
      - `Lab1_BinaryPixels`: רשת 8x8, סנכרון 64 ביט, קידוד Hex ותבניות גרפיות.
      - `Lab2_AlgorithmicRobot`: מבוך 6x6, תור פקודות FIFO, תנאי קדם ודיבגר.
      - `Lab3_DecisionTree` (חדש): בונה עצים בינארי, פיצול תכונות (מעופף, פרווה, רגליים), מד טוהר עלים ובדיקת חיה בודדת.
      - `Lab4_Pathfinder` (חדש): מבוך 8x8, עקיפת מכשולים, והשוואת יעילות חיה בין BFS ל-A* Heuristic.
    - **מסלול 2: תפיסה, למידת מכונה ובינה מלאכותית**:
      - `Lab5_MachineLearningClassifier`: מרחב תכונות 2D, אלגוריתם k-NN וגבול החלטה.
      - `Lab6_VisionKernels` (חדש): קונבולוציה דו-ממדית עם פילטרים $3 \times 3$, חלון נע ומפת מאפיינים.
      - `Lab7_Perceptron` (חדש): מודל פרספטרון מתמטי, סליידרים למשקולות והטיה, שערי AND/OR ומגבלת ה-XOR.
      - `Lab8_LanguageModelPredictor`: חיזוי טוקנים במודלי שפה, התפלגות Softmax, וסליידר טמפרטורה.
- **אנימציות SVG אינטראקטיביות להמחשת עקרונות הליבה**:
  - `SvgDecisionTreeAnimation.jsx`: זרימת עץ החלטות עם סימון ענפים פעילים.
  - `SvgPathfinderAnimation.jsx`: התפשטות חזית הגילוי של אלגוריתמי ניווט.
  - `SvgKernelAnimation.jsx`: חלון $3 \times 3$ נע על פני מטריצת פיקסלים עם מכפלות בזמן אמת.
  - `SvgPerceptronAnimation.jsx`: דיאגרמת נוירון מלאכותי עם מתגי קלט, משקולות וסף הפעלה.
- **תעודת הצטיינות אינטראקטיבית להדפסה ושמירה (`CertificateModal.jsx`)**:
  - מנגנון סיום פעילות לתלמידים, תמיכה מלאה בהדפסה נקייה (`window.print`) ללא שום איסוף מידע (Strict Zero-PII).
- **סרגל סינון מסלולים ובאנר הנחיה לילדים ב-`src/App.jsx`**:
  - סינון מהיר בין "כל המעבדות", "מסלול אלגוריתמיקה" ו"מסלול בינה מלאכותית".
- **הרחבת שירותי האלגוריתמיקה (`src/services/ai.js`)**:
  - מנועים דטרמיניסטיים עבור: `solvePathfinder` (BFS/A*), `computeConvolution`, `evaluatePerceptron`, ו-`evaluateDecisionTree`.
- **מערך דוקומנטציה שלם בעברית במקביל**:
  - `README.he.md`, `ROADMAP.he.md`, `docs/TEACHERS_GUIDE_HE.md`, `docs/research/PEDAGOGICAL_FRAMEWORK_GRADE_5.he.md`, `docs/proposals/RFC_001_CORE_ARCHITECTURE.he.md`, `docs/proposals/RFC_002_EIGHT_LAB_MASTER_SUITE.he.md`.

---

## [0.2.0] - 2026-10-08

### נוסף (Added)
- **ארכיטקטורת למידה היברידית דו-שלבית**:
  - מצב תיאוריה (`TheoryView`) ומצב מעשי (`InteractiveView`) בכל מעבדה עם שימור מצב ב-LocalStorage.
  - רכיב כותרת שלבים מרכזי `LabPhaseHeader`.
  - נגן קריינות וליווי קולי `AudioNarrationPlayer` מבוסס Web Speech API ו-HTML5 Audio.
  - רכיב הטמעת סרטוני YouTube מאובטח וללא מעקב `LiteYouTubeEmbed`.

---

## [0.1.0] - 2026-10-08

### נוסף (Added)
- הקמת הפרויקט, חוקי המשילות של הסוכנים ב-`.agent/rules.md` וב-`AGENTS.md`.
- 4 מעבדות בסיס, מנוע שמע Web Audio API, ומנוע חלקיקים קל-משקל.
- תצורת פריסה ב-Cloudflare Pages.
