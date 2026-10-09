/**
 * Tutor Engine for ZenLab Platform
 * 
 * Provides an intelligent, local, child-friendly pedagogical knowledge base
 * and semantic intent matcher for elementary school students (Grade 5, Ages 10-11).
 * 
 * Combines:
 * - Option A: Rich guided category cards (Hints, FAQs, Glossary, Real-world analogies)
 * - Option B: Zero-latency local semantic search over curriculum.json & curated QA
 * - Fallback with friendly honesty & actionable contextual suggestions
 */

import curriculum from '../data/curriculum.json';

// Curated Q&A knowledge base with studio-recorded child-calibrated audio narration
export const CURATED_TUTOR_KNOWLEDGE = {
  home: {
    welcome: 'שלום חוקרות וחוקרים צעירים! אני זֶן, הרובוט החונך שלכם. זוהי מפת המסע שלכם – ממתגים פשוטים של 0 ו-1 ועד למודלי שפה חכמים! איך תרצו שנתחיל היום?',
    prompts: [
      'מאיפה הכי כדאי להתחיל?',
      'מה ההבדל בין שני המסלולים?',
      'איך משיגים תעודת הצטיינות?',
      'מה נעשה בכל מעבדה?'
    ],
    answers: {
      'מאיפה הכי כדאי להתחיל?': 'אם אתם חדשים כאן, הכי כדאי להתחיל במעבדה 1 – "ציור בפיקסלים", שם לומדים איך מחשב בונה תמונות בעזרת מתגים של 0 ו-1. אם כבר צברתם כוכבים, לחצו על כפתור "התחנה הבאה שלכם" כדי להמשיך ברצף!',
      'מה ההבדל בין שני המסלולים?': 'מסלול א׳ (מעבדות 1-4) מלמד איך מחשב פועל בצורה הגיונית ומסודרת לפי פקודות וחוקים. מסלול ב׳ (מעבדות 5-8) הוא עולם הבינה המלאכותית – איך המחשב לומד מדוגמאות, מזהה תמונות ומנחש מילים ממש כמונו!',
      'איך משיגים תעודת הצטיינות?': 'בכל מעבדה יש 3 אתגרים מעשיים. כשתפתרו אותם תצברו כוכבים. כשתגיעו ל-24 כוכבים, תקבלו תעודת מאסטר בינה מלאכותית רשמית שתוכלו להדפיס או לשמור כ-PDF!',
      'מה נעשה בכל מעבדה?': 'בכל מעבדה יש סרטון קצר, פודקאסט ומשחק אינטראקטיבי שבו אתם המדענים – מזיזים מתגים, מאמנים רובוט, סורקים פיקסלים וכותבים עם מודל שפה.'
    }
  },
  lab1: {
    welcome: 'שלום! אני זֶן, הרובוט החונך שלכם. אנחנו חוקרים יחד פיקסלים וביטים! על מה תרצו לשאול?',
    prompts: [
      'מה זה בעצם פיקסל?',
      'למה המחשב מבין רק 0 ו-1?',
      'איך מספרים הופכים לתמונה צבעונית?',
      'רמז לאתגר הציור!'
    ],
    answers: {
      'מה זה בעצם פיקסל?': 'פיקסל הוא כמו קוביית לגו קטנטנה של אור על המסך. כשמחברים אלפי קוביות צבעוניות כאלה ביחד, העין שלנו רואה תמונה שלמה!',
      'למה המחשב מבין רק 0 ו-1?': 'בתוך המעבד יש מיליארדי מתגים חשמליים קטנטנים. מתג פתוח זה 0 (אין זרם), ומתג סגור זה 1 (יש זרם). זה כמו להדליק ולכבות מנורה במהירות עצומה!',
      'איך מספרים הופכים לתמונה צבעונית?': 'כל צבע מורכב משלושה אורות: אדום (R), ירוק (G) וכחול (B). המחשב נותן מספר לכל אחד מהם (מ-0 עד 255), וכשהם מתערבבים נוצר כל צבע בעולם!',
      'רמז לאתגר הציור!': 'נסו לחשוב על ציור פשוט כמו לב, סמיילי או חץ. התחילו ממרכז רשת הפיקסלים, וסמנו פיקסלים בצורה סימטרית משני הצדדים!'
    }
  },
  lab2: {
    welcome: 'היי! אני כאן לעזור לכם לתכנת אותי ללכת במבוך. זכרו: רובוט עושה בדיוק מה שאומרים לו!',
    prompts: [
      'למה הרובוט לפעמים נתקע בקיר?',
      'מה ההבדל בין פקודה ללולאה?',
      'איך לתכנן מסלול בלי להתבלבל?',
      'רמז לאתגר המבוך'
    ],
    answers: {
      'למה הרובוט לפעמים נתקע בקיר?': 'רובוט אינו חושב כמו בן אדם – הוא עוקב אחרי רשימת הפקודות שלכם באדיקות. אם לא אמרנו לו לבדוק שיש קיר לפני שהוא צועד, הוא פשוט ינסה לעבור דרכו!',
      'מה ההבדל בין פקודה ללולאה?': 'פקודה היא צעד בודד, כמו "צעד קדימה". לולאה היא הוראה לחזור על פקודות שוב ושוב, למשל: "צעד 4 פעמים", כדי שלא נצטרך לכתוב את אותו דבר המון פעמים.',
      'איך לתכנן מסלול בלי להתבלבל?': 'דמיינו שאתם עומדים בתוך המבוך בכיוון שהרובוט מסתכל. האם המסדרון הפתוח פונה ימינה או שמאלה? תמיד בדקו לאן הרובוט פונה לפני שאתם מורים לו להסתובב.',
      'רמז לאתגר המבוך': 'חלקו את הדרך למקטעים קצרים: קודם כל הגיעו לפינה הראשונה, הסתובבו, ורק אז המשיכו למטבע הבא!'
    }
  },
  lab3: {
    welcome: 'שלום בלשיות ובלשים צעירים! עצי החלטה הם הדרך שבה מחשבים משחקים 20 מי יודע. מה תרצו לדעת?',
    prompts: [
      'איך עץ החלטות עובד?',
      'איזו שאלה הכי כדאי לשאול ראשונה?',
      'האם מחשב יכול לטעות בזיהוי?',
      'רמז לאתגר המיון'
    ],
    answers: {
      'איך עץ החלטות עובד?': 'בדיוק כמו משחק 20 מי יודע! מתחילים בשאלה ראשית (כמו "האם יש לזה כנפיים?"). תשובת כן מובילה לענף אחד, ותשובת לא מובילה לענף אחר, עד שמגיעים לתשובה.',
      'איזו שאלה הכי כדאי לשאול ראשונה?': 'השאלה הכי טובה היא זו שמחלקת את כל האפשרויות לשני חצאים שווים בערך! ככה פוסלים חצי מהאפשרויות כבר בשאלה הראשונה.',
      'האם מחשב יכול לטעות בזיהוי?': 'כן! אם השאלות בעץ אינן מדויקות, או אם נתקלנו בחיה מיוחדת שלא נלקחה בחשבון (כמו ברווזן שיש לו מקור אבל הוא יונק), העץ עלול להוביל לתשובה שגויה.',
      'רמז לאתגר המיון': 'בדקו את המאפיינים הייחודיים של כל פריט וחפשו תכונה ששייכת רק לחלק מהם (למשל: יכולת לעוף או חיים במים).'
    }
  },
  lab4: {
    welcome: 'ברוכים הבאים לעולם הניווט החכם! האלגוריתם שאתם חוקרים כאן הוא הבסיס של Waze ומפות Google.',
    prompts: [
      'איך Waze יודע מה הדרך הכי מהירה?',
      'מה המשמעות של A* (איי-סטאר)?',
      'למה לא לבדוק פשוט את כל הדרכים האפשריות?',
      'רמז למציאת המסלול הקצר'
    ],
    answers: {
      'איך Waze יודע מה הדרך הכי מהירה?': 'הוא מחלק את כל המפה לצמתים ומשקלים. אלגוריתם חכם מחשב את המרחק שעברנו עד כה יחד עם הערכה של המרחק שנותר עד היעד, וכך בוחר תמיד את הצומת המבטיח ביותר!',
      'מה המשמעות של A* (איי-סטאר)?': 'זהו שמו של אחד האלגוריתמים המפורסמים במדעי המחשב. הוא משלב בין המרחק האמיתי שכבר צעדנו לבין "קו אווירי" למטרה כדי לא לבזבז זמן על כיוונים הפוכים.',
      'למה לא לבדוק פשוט את כל הדרכים האפשריות?': 'במבוך גדול או בעיר אמיתית יש מיליוני שילובים של רחובות! בדיקת כולם תיקח שעות או ימים. אלגוריתם חכם מוצא את הדרך תוך אלפיות שנייה.',
      'רמז למציאת המסלול הקצר': 'הימנעו ממחסומים שמאלצים אתכם להתרחק מאוד מהמטרה. חפשו פרצות במרכז המבוך שמובילות ישר ליעד.'
    }
  },
  lab5: {
    welcome: 'הגעתם ללב ליבה של הבינה המלאכותית: למידת מכונה! כאן לא מתכנתים פקודות – מלמדים מדוגמאות.',
    prompts: [
      'איך מחשב יכול ללמוד בלי שנתכנת לו הכל?',
      'מה ההבדל בין אימון למבחן?',
      'למה צריך הרבה דוגמאות?',
      'רמז לאימון המודל'
    ],
    answers: {
      'איך מחשב יכול ללמוד בלי שנתכנת לו הכל?': 'במקום לתת חוקים נוקשים, מראים למחשב אלפי דוגמאות (כמו תמונות של תפוחים ובננות). המחשב מוצא בעצמו דפוסים מתמטיים משותפים – בדיוק כמו שתינוק לומד לזהות כלב!',
      'מה ההבדל בין אימון למבחן?': 'אימון זה שלב הלמידה עם ספר פתוח (המחשב רואה דוגמאות יחד עם התשובה הנכונה). מבחן זה כשמציגים לו תמונה חדשה לגמרי שהוא מעולם לא ראה ובודקים אם הוא מזהה אותה נכון.',
      'למה צריך הרבה דוגמאות?': 'אם נראה למחשב רק תפוחים אדומים, הוא יחשוב שתפוח ירוק הוא לא תפוח! ככל שמביאים דוגמאות מגוונות (בגדלים, צבעים וזוויות שונות), המודל נהיה חכם ומדויק יותר.',
      'רמז לאימון המודל': 'ודאו שיש לכם כמות שווה ומגוונת של דוגמאות מכל סוג כדי שהמודל לא יהיה "מוטה" לטובת סוג מסוים.'
    }
  },
  lab6: {
    welcome: 'ראייה ממוחשבת היא הדרך שבה מכוניות אוטונומיות וטלפונים "רואים" ומזהים פנים וחפצים!',
    prompts: [
      'איך מחשב "רואה" תמונה?',
      'מה זה פילטר או קונבולוציה?',
      'איך מוצאים קצוות של חפצים בתמונה?',
      'רמז לזיהוי צורות'
    ],
    answers: {
      'איך מחשב "רואה" תמונה?': 'בשביל המחשב, תמונה היא לא ציור אלא טבלה ענקית של מספרים! כל מספר מייצג כמה בהיר או כהה הפיקסל באותה נקודה.',
      'מה זה פילטר או קונבולוציה?': 'פילטר הוא כמו זכוכית מגדלת קטנה בגודל 3 על 3 שעוברת על כל פיקסל ומחשבת ממוצע עם השכנים שלו. הוא יכול לטשטש, לחדד, או למצוא קווי מתאר!',
      'איך מוצאים קצוות של חפצים בתמונה?': 'קצה הוא מקום שבו יש קפיצה חדה בצבע (למשל פיקסל שחור ליד פיקסל לבן). הפילטר מחשב את ההפרש בין פיקסלים סמוכים ומאיר את הקווים הבולטים!',
      'רמז לזיהוי צורות': 'הפעילו את פילטר זיהוי הקצוות ושימו לב כיצד הקווים החיצוניים של האובייקט נשארים בהירים בעוד שהרקע הופך לשחור.'
    }
  },
  lab7: {
    welcome: 'חקר רשתות נוירונים! כאן אנחנו מחקים את אופן הפעולה של תאי המוח האנושיים.',
    prompts: [
      'מה זה נוירון מלאכותי?',
      'מה תפקיד המשקולות (Weights)?',
      'מהי פונקציית שפעול (Activation)?',
      'רמז לכיול הנוירון'
    ],
    answers: {
      'מה זה נוירון מלאכותי?': 'נוירון הוא מתג חכם: הוא מקבל מספר אותות כניסה, מכפיל כל אחד בחשיבות שלו (המשקל), מחבר הכל, ואם הסכום גבוה מספיק – הוא יורה אות הלאה!',
      'מה תפקיד המשקולות (Weights)?': 'המשקולת קובעת כמה קלט מסוים חשוב להחלטה. למשל, אם מחליטים אם ללכת לים: האם יורד גשם מקבל משקל ענק (שלילי), וצבע החולצה מקבל משקל אפס.',
      'מהי פונקציית שפעול (Activation)?': 'זהו שער ההחלטה: הוא בודק האם הסכום עבר סף מסוים (Threshold). אם עברנו את הסף – הנוירון נדלק ומעביר 1. אם לא – הוא נשאר כבוי ב-0.',
      'רמז לכיול הנוירון': 'אם הנוירון לא נדלק כשהתנאים מתקיימים, נסו להעלות את המשקולת של התכונה החשובה או להוריד מעט את סף ההחלטה (Bias).'
    }
  },
  lab8: {
    welcome: 'מודלי שפה גדולים (כמו ChatGPT ו-Gemini)! כאן לומדים איך מחשב מייצר טקסט ורעיונות.',
    prompts: [
      'איך מודל שפה יודע מה המילה הבאה?',
      'מה זה חלון הקשר (Context Window)?',
      'מהי "הזיה" (Hallucination) ב-AI?',
      'רמז לכתיבת הנחיה (Prompt)'
    ],
    answers: {
      'איך מודל שפה יודע מה המילה הבאה?': 'מודל שפה קרא כמויות אדירות של ספרים ומאמרים. הוא מחשב הסתברויות מתמטיות: אחרי המילים "השמש זורחת ב..." המילה "מזרח" מקבלת 99% סיכוי, והמילה "טוסטר" מקבלת 0.01%!',
      'מה זה חלון הקשר (Context Window)?': 'זהו הזיכרון לטווח קצר של המודל – כמות המילים שהוא מסוגל "לזכור" בשיחה הנוכחית. אם השיחה ארוכה מדי מחלון ההקשר, הוא מתחיל לשכוח את מה שנאמר בהתחלה.',
      'מהי "הזיה" (Hallucination) ב-AI?': 'מכיוון שהמודל רק מנחש מילים לפי הסתברות ולא באמת מבין את המציאות, לפעמים הוא ממציא עובדות שנשמעות מאוד משכנעות אבל הן שגויות לחלוטין. תמיד צריך לבדוק עובדות!',
      'רמז לכתיבת הנחיה (Prompt)': 'היו ברורים ומדויקים: הגדירו למודל את התפקיד ("הדרכת מדעים"), למי מסבירים ("לתלמידים בכיתה ה"), ובאיזה אורך ("בשני משפטים בלבד").'
    }
  }
};

// Global concepts and terms for comprehensive cross-lab discovery
const GLOBAL_VOCABULARY = new Set([
  'פיקסל', 'פיקסלים', 'ביט', 'ביטים', 'בייט', 'בייטים', 'בינארי', 'בינארית',
  'מתג', 'מתגים', 'רובוט', 'רובוטים', 'מבוך', 'פקודה', 'פקודות', 'לולאה', 'לולאות',
  'אלגוריתם', 'אלגוריתמים', 'באג', 'דיבאגינג', 'עץ', 'החלטה', 'עצי', 'החלטות',
  'מיון', 'אנטרופיה', 'waze', 'וייז', 'ווייז', 'a*', 'איסטאר', 'אייסטאר', 'מסלול',
  'גרף', 'צומת', 'צמתים', 'מרחק', 'למידה', 'מכונה', 'אימון', 'מבחן', 'דוגמה', 'דוגמאות',
  'ראייה', 'ממוחשבת', 'פילטר', 'פילטרים', 'קונבולוציה', 'קצה', 'קצוות', 'גרדיאנט',
  'נוירון', 'נוירונים', 'משקולת', 'משקולות', 'שפעול', 'אקטיבציה', 'סף', 'רשת',
  'מודל', 'שפה', 'מילה', 'מילים', 'הסתברות', 'טוקן', 'טוקנים', 'חלון', 'הקשר',
  'הזיה', 'הזיות', 'פרומפט', 'הנחיה', 'הנחיות', 'chatgpt', 'gemini', 'גמיני', 'צ\'אט',
  'תעודה', 'כוכב', 'כוכבים', 'אתגר', 'אתגרים', 'רמז', 'רמזים', 'עזרה', 'שלום', 'היי'
]);

/**
 * Normalizes Hebrew word tokens against known vocabulary
 */
function normalizeHebrewWord(word) {
  if (!word) return '';
  let clean = word.toLowerCase().replace(/[\u0591-\u05C7]/g, '').replace(/["'״׳?!,.:;\-_]/g, '').trim();
  if (GLOBAL_VOCABULARY.has(clean)) return clean;

  const prefixes = ['וה', 'וב', 'ול', 'וכ', 'וש', 'שב', 'שה', 'ו', 'ה', 'ב', 'ל', 'כ', 'ש', 'מ'];
  for (const p of prefixes) {
    if (clean.startsWith(p)) {
      const rest = clean.slice(p.length);
      if (GLOBAL_VOCABULARY.has(rest)) return rest;
    }
  }

  // Handle plural suffix (ות / ים)
  if (clean.endsWith('ות')) {
    const candidateSingular = clean.slice(0, -2) + 'ה';
    if (GLOBAL_VOCABULARY.has(candidateSingular)) return candidateSingular;
    if (GLOBAL_VOCABULARY.has(clean.slice(0, -2))) return clean.slice(0, -2);
  }
  if (clean.endsWith('ים')) {
    if (GLOBAL_VOCABULARY.has(clean.slice(0, -2))) return clean.slice(0, -2);
  }

  return clean;
}

/**
 * Tokenizes user query into normalized search keywords
 */
function tokenizeQuery(text) {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map(normalizeHebrewWord)
    .filter(w => w.length > 1 && !['של', 'את', 'זה', 'על', 'עם', 'איך', 'מה', 'למה', 'כמה', 'האם'].includes(w));
}

/**
 * Retrieves categorized quick chips for Option A (Guided Flow)
 */
export function getLabCategories(labId) {
  const isHome = labId === 'home' || !curriculum.labs[labId];
  const lab = curriculum.labs[labId];
  const curated = CURATED_TUTOR_KNOWLEDGE[labId] || CURATED_TUTOR_KNOWLEDGE.home;

  // 1. FAQs from Curated Base
  const faqs = curated.prompts.map((promptText, idx) => ({
    id: `faq-${idx}`,
    type: 'faq',
    title: promptText,
    query: promptText,
    badge: 'שאלה נפוצה',
    icon: 'HelpCircle'
  }));

  if (isHome) {
    return {
      faqs,
      hints: [
        {
          id: 'hint-start',
          type: 'hint',
          title: 'איך מתחילים את המסע?',
          query: 'מאיפה הכי כדאי להתחיל?',
          badge: 'צעד ראשון',
          icon: 'Lightbulb'
        },
        {
          id: 'hint-cert',
          type: 'hint',
          title: 'איך זוכים בתעודת מאסטר?',
          query: 'איך משיגים תעודת הצטיינות?',
          badge: 'פרס והצטיינות',
          icon: 'Sparkles'
        }
      ],
      glossary: [
        {
          id: 'gl-track1',
          type: 'glossary',
          title: 'מה לומדים במסלול א׳?',
          query: 'מה ההבדל בין שני המסלולים?',
          badge: 'אלגוריתמיקה',
          icon: 'BookOpen'
        },
        {
          id: 'gl-track2',
          type: 'glossary',
          title: 'מה לומדים במסלול ב׳?',
          query: 'מה ההבדל בין שני המסלולים?',
          badge: 'בינה מלאכותית',
          icon: 'Bot'
        }
      ],
      mechanics: [
        {
          id: 'mech-home',
          type: 'mechanics',
          title: 'מה נעשה בכל אחת מהמעבדות?',
          query: 'מה נעשה בכל מעבדה?',
          badge: 'מבנה הלמידה',
          icon: 'Compass'
        }
      ]
    };
  }

  // 2. Practical Challenge Hints from curriculum.json
  const hints = (lab.challenges || []).map((ch, idx) => ({
    id: `hint-${idx}`,
    type: 'hint',
    title: `רמז לאתגר ${idx + 1}: ${ch.title}`,
    query: `רמז לאתגר ${idx + 1}`,
    badge: `אתגר ${idx + 1} ⭐`,
    icon: 'Lightbulb',
    payload: {
      text: `💡 רמז לאתגר "${ch.title}": ${ch.hint}\n\nההנחיה היא: ${ch.instructions}`,
      category: 'רמז מעשי לאתגר'
    }
  }));

  // 3. Glossary Terms from curriculum.json
  const glossary = (lab.glossary || []).map((item, idx) => {
    const cleanTerm = item.term.split('(')[0].trim();
    return {
      id: `glossary-${idx}`,
      type: 'glossary',
      title: `מה זה ${cleanTerm}?`,
      query: `מה זה ${cleanTerm}`,
      badge: 'מילון מושגים',
      icon: 'BookOpen',
      payload: {
        text: `📖 ${item.term}:\n${item.definition}`,
        category: 'מילון מונחי המעבדה'
      }
    };
  });

  // 4. Mechanics & Real World Analogy
  const mechanics = [
    {
      id: 'mech-analogy',
      type: 'mechanics',
      title: 'איך זה עובד בעולם האמיתי?',
      query: 'איך זה עובד בעולם האמיתי?',
      badge: 'אנלוגיה יומיומית',
      icon: 'Compass',
      payload: {
        text: `🔍 כמו בעולם האמיתי: ${lab.conceptExplanation?.realWorldAnalogy || lab.subtitle}\n\nרעיון מרכזי: ${lab.conceptExplanation?.summary || ''}`,
        category: 'אנלוגיה והבנה עמוקה'
      }
    }
  ];

  return { faqs, hints, glossary, mechanics };
}

/**
 * Searches the entire local pedagogical index for Option B (Smart Intent Matcher)
 */
export function searchKnowledge(userQuery, currentLabId = 'lab1') {
  if (!userQuery || !userQuery.trim()) {
    return null;
  }

  const cleanQuery = userQuery.trim();
  const queryTokens = tokenizeQuery(cleanQuery);
  const isHome = currentLabId === 'home';
  const currentLab = curriculum.labs[currentLabId];
  const labTitle = isHome ? 'עולם המחשבים והבינה המלאכותית' : (currentLab?.title || 'המעבדה');

  // Friendly conversational greeting handling
  if (/^(שלום|היי|בוקר טוב|ערב טוב|מה קורה|מי אתה|היי זן|שלום זן)/i.test(cleanQuery)) {
    const welcomeText = CURATED_TUTOR_KNOWLEDGE[currentLabId]?.welcome || CURATED_TUTOR_KNOWLEDGE.home.welcome;
    return {
      matched: true,
      text: welcomeText,
      audioSrc: `/audio/tutor/${currentLabId}_welcome.mp3?v=0.6.3`,
      category: 'ברכת שלום',
      suggestedNext: (CURATED_TUTOR_KNOWLEDGE[currentLabId]?.prompts || []).slice(0, 3)
    };
  }

  // 1. Direct Curated Match in current lab
  const currentLabCurated = CURATED_TUTOR_KNOWLEDGE[currentLabId];
  if (currentLabCurated && currentLabCurated.answers[cleanQuery]) {
    const promptIndex = currentLabCurated.prompts.indexOf(cleanQuery);
    return {
      matched: true,
      text: currentLabCurated.answers[cleanQuery],
      audioSrc: promptIndex !== -1 ? `/audio/tutor/${currentLabId}_q${promptIndex}.mp3?v=0.6.3` : null,
      category: 'תשובת חונך מוקלטת',
      suggestedNext: currentLabCurated.prompts.filter(p => p !== cleanQuery).slice(0, 2)
    };
  }

  // 2. Direct Challenge Hint Match ("רמז לאתגר 1", "שלב 2", "איך לפתור לב")
  if (currentLab && currentLab.challenges) {
    for (let i = 0; i < currentLab.challenges.length; i++) {
      const ch = currentLab.challenges[i];
      const challengeKeywords = [
        `אתגר ${i + 1}`,
        `שלב ${i + 1}`,
        `אתגר ${ch.title}`,
        ch.title,
        ch.targetPreset
      ].filter(Boolean);

      const isMatch = challengeKeywords.some(kw => 
        cleanQuery.includes(kw) || kw.includes(cleanQuery)
      ) || (cleanQuery.includes('רמז') && cleanQuery.includes(String(i + 1)));

      if (isMatch) {
        return {
          matched: true,
          text: `💡 רמז לאתגר ${i + 1} ("${ch.title}"):\n${ch.hint}\n\nההנחיה: ${ch.instructions}`,
          audioSrc: null,
          category: `רמז לאתגר ${i + 1}`,
          suggestedNext: [
            i + 1 < currentLab.challenges.length ? `רמז לאתגר ${i + 2}` : 'איך זה עובד בעולם האמיתי?',
            currentLabCurated?.prompts[0] || 'מה זה בעצם?'
          ]
        };
      }
    }
  }

  // 3. Multi-source candidate scoring engine
  const candidates = [];

  // A. Curated Q&A items across all labs (with heavy boost to current lab)
  Object.entries(CURATED_TUTOR_KNOWLEDGE).forEach(([labKey, data]) => {
    data.prompts.forEach((promptText, idx) => {
      candidates.push({
        type: 'curated',
        labId: labKey,
        title: promptText,
        text: data.answers[promptText],
        audioSrc: `/audio/tutor/${labKey}_q${idx}.mp3?v=0.6.3`,
        category: labKey === currentLabId ? 'תשובת חונך' : `מתוך מעבדה ${labKey}`,
        tokens: tokenizeQuery(promptText)
      });
    });
  });

  // B. Glossary definitions from current lab & other labs
  Object.entries(curriculum.labs).forEach(([labKey, lab]) => {
    (lab.glossary || []).forEach(item => {
      candidates.push({
        type: 'glossary',
        labId: labKey,
        title: item.term,
        text: `📖 ${item.term}:\n${item.definition}`,
        audioSrc: null,
        category: 'מילון מושגים',
        tokens: tokenizeQuery(item.term)
      });
    });
  });

  // C. Challenge Hints
  if (currentLab && currentLab.challenges) {
    currentLab.challenges.forEach((ch, idx) => {
      candidates.push({
        type: 'hint',
        labId: currentLabId,
        title: `רמז לאתגר ${idx + 1}: ${ch.title}`,
        text: `💡 רמז לאתגר "${ch.title}": ${ch.hint}\n\nהמשימה: ${ch.instructions}`,
        audioSrc: null,
        category: `רמז לאתגר ${idx + 1}`,
        tokens: tokenizeQuery(`${ch.title} ${ch.hint} רמז אתגר ${idx + 1}`)
      });
    });
  }

  // D. Real World Analogies & Concepts
  if (currentLab?.conceptExplanation) {
    candidates.push({
      type: 'concept',
      labId: currentLabId,
      title: 'איך זה עובד בעולם האמיתי?',
      text: `🔍 כמו בעולם האמיתי: ${currentLab.conceptExplanation.realWorldAnalogy}\n\nרעיון מרכזי: ${currentLab.conceptExplanation.summary}`,
      audioSrc: null,
      category: 'אנלוגיה יומיומית',
      tokens: tokenizeQuery(`עולם אמיתי אנלוגיה דוגמה ${currentLab.title} ${currentLab.conceptExplanation.summary}`)
    });
  }

  // E. Score every candidate against query tokens
  let bestCandidate = null;
  let highestScore = 0;

  // Clean query of common question/filler words for semantic core comparison
  const cleanCoreQuery = cleanQuery
    .replace(/^(מה זה|מהו|מהי|מהם|איך|כיצד|למה|מדוע|ספר לי על|הסבר לי על|תסביר לי על|בעצם)\s+/gi, '')
    .replace(/[?!,.:;\-_]/g, '')
    .trim();

  candidates.forEach(cand => {
    let score = 0;

    const cleanCoreTitle = cand.title
      .replace(/^(מה זה|מהו|מהי|מהם|איך|כיצד|למה|מדוע|ספר לי על|הסבר לי על|תסביר לי על|בעצם)\s+/gi, '')
      .replace(/[?!,.:;\-_]/g, '')
      .trim();

    // Direct semantic core match (e.g. "מה זה פיקסל" vs "מה זה בעצם פיקסל?")
    if (cleanCoreQuery.length > 1 && (cleanCoreTitle === cleanCoreQuery || cleanCoreTitle.includes(cleanCoreQuery) || cleanCoreQuery.includes(cleanCoreTitle))) {
      score += 70;
    }

    // Exact string containment in full title
    if (cand.title.includes(cleanQuery) || cleanQuery.includes(cand.title)) {
      score += 50;
    }

    // Token overlap between query and title
    let titleOverlap = 0;
    queryTokens.forEach(t => {
      if (cand.tokens.includes(t)) {
        titleOverlap++;
        score += 30;
      } else if (cand.title.includes(t)) {
        score += 20;
      } else if (cand.text.includes(t)) {
        score += 5;
      }
    });

    // Bonus for matching multiple query tokens
    if (titleOverlap > 1) {
      score += titleOverlap * 20;
    }

    // If query is asking "מה זה..." and candidate is a direct concept explanation or glossary
    if (/^(מה זה|מהו|מהי|מהם|הסבר)/.test(cleanQuery) && (cand.type === 'glossary' || cand.title.startsWith('מה זה'))) {
      score += 25;
    }

    // Contextual affinity to current lab (only slight bias so specific concept searches across labs succeed)
    if (cand.labId === currentLabId) {
      score += 10;
    }

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = cand;
    }
  });

  // Confidence threshold
  if (bestCandidate && highestScore >= 20) {
    const relatedPrompts = (CURATED_TUTOR_KNOWLEDGE[bestCandidate.labId]?.prompts || [])
      .filter(p => p !== bestCandidate.title)
      .slice(0, 2);

    return {
      matched: true,
      text: bestCandidate.text,
      audioSrc: bestCandidate.audioSrc,
      category: bestCandidate.category,
      suggestedNext: relatedPrompts.length > 0 ? relatedPrompts : (currentLabCurated?.prompts || []).slice(0, 2)
    };
  }

  // 4. Honest, encouraging out-of-domain response (Zero-Evasion Policy)
  const defaultSuggestions = (currentLabCurated?.prompts || []).slice(0, 3);
  return {
    matched: false,
    text: `שאלה מסקרנת! אני זֶן, החונך הדיגיטלי שלכם. עדיין לא למדתי מספיק על השאלה הזו, אבל אני מומחה בנושא של המעבדה הנוכחית (${labTitle}).\n\nתרצו שנחקור יחד את אחת השאלות המרכזיות הבאות?`,
    audioSrc: null,
    category: 'הכוונה להמשך מחקר',
    suggestedNext: defaultSuggestions
  };
}
