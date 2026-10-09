# מדריך תרומה ופיתוח לפרויקט ZenLab

תודה רבה על הרצון לתרום ל-**ZenLab**!  
ZenLab היא פלטפורמת למידה אינטראקטיבית בקוד פתוח, המיועדת להוראת מדעי המחשב, חשיבה מחשובית ובינה מלאכותית לתלמידי כיתה ה' (גילאי 10–11) בישראל ובעולם.

---

## 1. עקרונות היסוד של הפרויקט

כל תרומה לקוד או לתוכן חייבת לעמוד בעקרונות הבאים:

1. **ארכיטקטורת צד-לקוח מלאה (Client-Side SPA)**:
   - 100% קוד שרץ בדפדפן המשתמש, ללא תלות בשרת אחורי.
   - ניתוב ישיר ורענון דפים נתמכים באמצעות `public/_redirects` (`/* /index.html 200`).
2. **אפס איסוף מידע אישי (Strict Zero-PII)**:
   - חל איסור מוחלט על הכללת שמות פרטיים, כתובות דוא"ל אישיות, נתיבי מחשב מקומיים (`/Users/...`), או מפתחות סודיים.
   - הזיהוי ב-Git הוא צוותי ואחיד: `Code & AI Explorer Team <team@learnai.internal>`.
3. **גבולות אחריות ומערכת העיצוב Zen 2.0**:
   - שפת העיצוב, הטוקנים והטיפוגרפיה שייכים למערכת **Zen 2.0** ומנוהלים על ידי מוביל העיצוב.
   - **אמוג'ים פדגוגיים לילדים**: בלוחות משחק ובהדמיות חקר (כמו 🔑, 🏆, 🔒/🔓, ⭐) השימוש באמוג'ים מבורך ומעודד ליצירת חיבור רגשי ובהירות. בכפתורי ה-UI ומערכת הניווט נעשה שימוש בלעדי באייקוני Lucide.
4. **שפה כוללת וחד-משמעית לקריינות**:
   - הפנייה לתלמידים בכל ההוראות והמעבדות מתבצעת תמיד ב**לשון רבים** (`לחצו`, `גררו`, `שלכם`) או ב**שמות פעולה ניטרליים** (`פתיחת שער`), ללא פנייה בזכר יחיד (`לחץ`, `שלך`).
   - צורת הרבים מבטיחה הכללה מלאה של תלמידות ומונעת שיבושי הגייה במנועי סינתזה קולית (TTS).
5. **הפרדת תוכן מתצוגה**:
   - כל הטקסטים הפדגוגיים, האתגרים, והרמזים מנוהלים בקובץ הנתונים `src/data/curriculum.json`.

---

## 2. התקנה והרצה מקומית

### דרישות קדם
- Node.js 18.x או 20.x
- npm 9 ומעלה

### פקודות הרצה
```bash
# שכפול המאגר
git clone https://github.com/omerninyo/zenlab.git
cd zenlab

# התקנת תלויות
npm install

# הפעלת שרת פיתוח מקומי
npm run dev

# פתחו את הדפדפן בכתובת http://localhost:5173
```

### בדיקת קומפילציה ובנייה
```bash
npm run build
npm run preview
```

---

## 3. הגשת הצעות ו-Pull Requests

1. צרו ענף ייעודי (Branch):
   ```bash
   git checkout -b feat/my-improvement
   ```
2. ודאו שהבנייה עוברת בהצלחה מלאה:
   ```bash
   npm run build
   ```
3. בצעו Commit מנומק לפי מוסכמות הפרויקט:
   ```text
   feat(lab3): improve decision tree explanation for Grade 5

   Clarified entropy splitting analogy using animal guessing game.
   Verified with npm run build. Author: Code & AI Explorer Team <team@learnai.internal>
   ```
4. פתחו Pull Request מלא ומפורט לפי התבנית ב-[`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).

---

## 4. ערוצי קהילה ומשוב
- **פורום דיונים ושאלות מורים**: [GitHub Discussions](https://github.com/omerninyo/zenlab/discussions).
- **דיווח על באגים והצעות פדגוגיות**: [GitHub Issues](https://github.com/omerninyo/zenlab/issues).
