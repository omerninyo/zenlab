# RFC 001: מפרט ארכיטקטורת ליבה ומנוע פדגוגי

- **סטטוס**: אושר ומיושם
- **מחבר**: Code & AI Explorer Team (`team@learnai.internal`)
- **תאריך**: אוקטובר 2026
- **תחום**: ארכיטקטורת פלטפורמה, סכימת נתונים, מפרט תוכנית לימודים, וחוזי קומפוננטות

---

## 1. תקציר מנהלים

**ZenLab** היא פלטפורמת למידה אינטראקטיבית בקוד פתוח, הפועלת כולה בצד הלקוח כ-Single Page Application (SPA). מטרתה להקנות מושגי יסוד במדעי המחשב, חשיבה אלגוריתמית ובינה מלאכותית. הפלטפורמה מתוכננת לפעול בעלות שרת אפסית, בזמינות גבוהה, בהתאמה מלאה למכשירים בבתי ספר, ותוך עמידה קפדנית בהנחיות הגנת הפרטיות (Strict Zero-PII).

---

## 2. עמודי התווך של הארכיטקטורה

```text
+--------------------------------------------------------------------------+
|                            Vite + React SPA                              |
+--------------------------------------------------------------------------+
|  סרגל ניווט ומסלולים   |   יישור עברי טבעי (RTL)    |   צלמיות Lucide    |
+--------------------------------------------------------------------------+
|                              מנועי ליבה                                  |
|  - סינתיסייזר שמע Web Audio API (אפס קבצים חיצוניים)                    |
|  - מנהל התקדמות וכוכבים מקומי (LocalStorage State Manager)               |
|  - מנוע חלקיקי הצלחה וקונפטי (HTML5 Canvas Confetti)                     |
|  - שירות בינה מלאכותית דטרמיניסטי (AIService) + הכנה לגשר Gemini API     |
|  - מנוע ליווי קולי וקריינות (NarrationEngine + Web Speech API)           |
+--------------------------------------------------------------------------+
|                            שכבת הנתונים                                  |
|  - src/data/curriculum.json (טקסטים פדגוגיים, אתגרים, מילון מונחים)     |
+--------------------------------------------------------------------------+
```

---

## 3. סכימת נתונים ומפרט תוכנית הלימודים (`curriculum.json`)

כל הטקסטים הפדגוגיים, הגדרות האתגרים, הרמזים והאנלוגיות מופרדים לחלוטין מקוד התוכנה ומאוחסנים בקובץ מרכזי: `src/data/curriculum.json`. קומפוננטות ה-UI אינן מכילות טקסט חינוכי מובנה.

```typescript
interface CurriculumData {
  version: string;
  metadata: {
    title: string;
    description: string;
    locale: "he-IL";
    direction: "rtl";
  };
  labs: Record<string, LabCurriculum>;
}

interface LabCurriculum {
  id: string; // "lab1" .. "lab8"
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  conceptExplanation: {
    summary: string;
    keyPoints: string[];
    realWorldAnalogy: string;
  };
  challenges: Challenge[];
  media: {
    youtubeId?: string;
    narration: {
      audioSrc: string;
      transcript: string;
    };
  };
  glossary: Array<{ term: string; definition: string }>;
}
```

---

## 4. מנועי הליבה העצמאיים

1. **מנוע שמע (`src/core/audio.js`):** מבוסס Web Audio API. מייצר צלילי אוסצילטור מסונתזים עם מעטפת ADSR ללא צורך בהורדת קבצי MP3.
2. **מנוע התקדמות (`src/core/storage.js`):** ניהול ריאקטיבי מקומי של כוכבים (עד 24 כוכבים), אתגרים שהושלמו, מצב השתקה, ושלבי מעבדה.
3. **מנוע חלקיקים (`src/core/canvas-particles.js`):** פיצוץ קונפטי קל-משקל לחיווי הצלחה בלמידה.
4. **שירות בינה מלאכותית (`src/services/ai.js`):** אלגוריתמים דטרמיניסטיים מלאים (A*, BFS, קונבולוציה $3 \times 3$, פרספטרון, עצי החלטות, k-NN ו-Softmax).
