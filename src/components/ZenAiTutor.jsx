import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  X, 
  HelpCircle, 
  ChevronRight, 
  Lightbulb, 
  RefreshCw,
  Key,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';

// Comprehensive, child-friendly pedagogical knowledge base for Grade 5 (Ages 10-11)
const CURATED_TUTOR_KNOWLEDGE = {
  lab1: {
    welcome: 'שלום! אני זן, הרובוט החונך שלך. אנחנו חוקרים יחד פיקסלים וביטים! על מה תרצה לשאול?',
    prompts: [
      'מה זה בעצם פיקסל?',
      'למה המחשב מבין רק 0 ו-1?',
      'איך מספרים הופכים לתמונה צבעונית?',
      'תן לי רמז לאתגר הציור!'
    ],
    answers: {
      'מה זה בעצם פיקסל?': 'פיקסל הוא כמו קוביית לגו קטנטנה של אור על המסך. כשמחברים אלפי קוביות צבעוניות כאלה ביחד, העין שלנו רואה תמונה שלמה!',
      'למה המחשב מבין רק 0 ו-1?': 'בתוך המעבד יש מיליארדי מתגים חשמליים קטנטנים. מתג פתוח זה 0 (אין זרם), ומתג סגור זה 1 (יש זרם). זה כמו להדליק ולכבות מנורה במהירות עצומה!',
      'איך מספרים הופכים לתמונה צבעונית?': 'כל צבע מורכב משלושה אורות: אדום (R), ירוק (G) וכחול (B). המחשב נותן מספר לכל אחד מהם (מ-0 עד 255), וכשהם מתערבבים נוצר כל צבע בעולם!',
      'תן לי רמז לאתגר הציור!': 'נסה לחשוב על ציור פשוט כמו לב, סמיילי או חץ. התחל מהמרכז של רשת הפיקסלים, וסמן פיקסלים בצורה סימטרית משני הצדדים!'
    }
  },
  lab2: {
    welcome: 'היי! אני כאן לעזור לך לתכנת אותי ללכת במבוך. זכור: רובוט עושה בדיוק מה שאומרים לו!',
    prompts: [
      'למה הרובוט לפעמים נתקע בקיר?',
      'מה ההבדל בין פקודה ללולאה?',
      'איך לתכנן מסלול בלי להתבלבל?',
      'רמז לאתגר המבוך'
    ],
    answers: {
      'למה הרובוט לפעמים נתקע בקיר?': 'רובוט אינו חושב כמו בן אדם – הוא עוקב אחרי רשימת הפקודות שלך באדיקות. אם לא אמרנו לו לבדוק שיש קיר לפני שהוא צועד, הוא פשוט ינסה לעבור דרכו!',
      'מה ההבדל בין פקודה ללולאה?': 'פקודה היא צעד בודד, כמו "צעד קדימה". לולאה היא הוראה לחזור על פקודות שוב ושוב, למשל: "צעד 4 פעמים", כדי שלא נצטרך לכתוב את אותו דבר המון פעמים.',
      'איך לתכנן מסלול בלי להתבלבל?': 'דמיין שאתה עומד בתוך המבוך בכיוון שהרובוט מסתכל. האם היד הימנית שלך פונה לקיר או למסדרון פתוח? תמיד תבדוק לאן הרובוט פונה לפני שאתה פוקד להסתובב.',
      'רמז לאתגר המבוך': 'חלק את הדרך למקטעים קצרים: קודם כל תגיע לפינה הראשונה, תסתובב, ורק אז תמשיך למטבע הבא!'
    }
  },
  lab3: {
    welcome: 'שלום בלש צעיר! עצי החלטה הם הדרך שבה מחשבים משחקים 20 מי שאלות. מה תרצה לדעת?',
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
      'רמז לאתגר המיון': 'בדוק את המאפיינים הייחודיים של כל פריט וחפש תכונה ששייכת רק לחלק מהם (למשל: יכולת לעוף או חיים במים).'
    }
  },
  lab4: {
    welcome: 'ברוכים הבאים לעולם הניווט החכם! האלגוריתם שאתה חוקר כאן הוא הבסיס של Waze ומפות Google.',
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
      'רמז למציאת המסלול הקצר': 'הימנע ממחסומים שמאלצים אותך להתרחק מאוד מהמטרה. חפש פרצות במרכז המבוך שמובילות ישר ליעד.'
    }
  },
  lab5: {
    welcome: 'הגעת ללב ליבה של הבינה המלאכותית: למידת מכונה! כאן לא מתכנתים פקודות – מלמדים מדוגמאות.',
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
      'רמז לאימון המודל': 'ודא שיש לך כמות שווה ומגוונת של דוגמאות מכל סוג כדי שהמודל לא יהיה "מוטה" לטובת סוג מסוים.'
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
      'רמז לזיהוי צורות': 'הפעל את פילטר זיהוי הקצוות ושים לב כיצד הקווים החיצוניים של האובייקט נשארים בהירים בעוד שהרקע הופך לשחור.'
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
      'רמז לכיול הנוירון': 'אם הנוירון לא נדלק כשהתנאים מתקיימים, נסה להעלות את המשקולת של התכונה החשובה או להוריד מעט את סף ההחלטה (Bias).'
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
      'רמז לכתיבת הנחיה (Prompt)': 'היה ברור ומדויק: הגדר למודל מי הוא ("אתה מדריך מדעים"), למי הוא מסביר ("לילד בכיתה ה"), ובאיזה אורך ("בשני משפטים בלבד").'
    }
  }
};

export default function ZenAiTutor({ currentLabId = 'lab1' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [currentLab, setCurrentLab] = useState(currentLabId);
  const messagesEndRef = useRef(null);

  const labKnowledge = CURATED_TUTOR_KNOWLEDGE[currentLabId] || CURATED_TUTOR_KNOWLEDGE.lab1;

  // Initialize conversation when opening or changing lab
  useEffect(() => {
    setCurrentLab(currentLabId);
    setMessages([
      {
        id: 'welcome',
        sender: 'tutor',
        text: labKnowledge.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentLabId]);

  // Load API key from localStorage if saved by user
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('zenlab_gemini_api_key');
      if (savedKey) setUserApiKey(savedKey);
    } catch {
      // ignore localstorage errors
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = (key) => {
    setUserApiKey(key);
    try {
      localStorage.setItem('zenlab_gemini_api_key', key);
    } catch {
      // ignore
    }
    setShowKeyInput(false);
    AudioEngine.playSuccess();
  };

  const handleSpeakText = (text) => {
    NarrationEngine.play(text);
  };

  const handleSendPrompt = async (questionText) => {
    if (!questionText.trim()) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    AudioEngine.playStep();

    // Check if we have a direct curated answer in the pedagogical base
    const curatedAnswer = labKnowledge.answers[questionText];
    if (curatedAnswer) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: curatedAnswer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 500);
      return;
    }

    // If student asked a custom question and has an active Gemini API key:
    if (userApiKey && userApiKey.trim().length > 10) {
      try {
        const promptSystem = `אתה חונך בינה מלאכותית ידידותי, מעודד וסבלני לילדים בכיתה ה (גילאי 10-11) בישראל, בשם "זן הרובוט".
התלמיד לומד כעת בנושא: ${labKnowledge.welcome}.
ענה בעברית פשוטה, ברורה, בגובה העיניים של ילד בן 10. השתמש באנלוגיות יומיומיות (כמו משחקי לגו, מתגי חשמל, עוגה או ספורט).
אל תיתן תשובות ארוכות ומסובכות: עד 2-3 משפטים קצרים ומעצימים. עודד את התלמיד להמשיך לחקור במעבדה.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${userApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${promptSystem}\n\nשאלת התלמיד: "${questionText}"` }]
            }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            setMessages(prev => [
              ...prev,
              {
                id: 'tutor-' + Date.now(),
                sender: 'tutor',
                text: reply.trim(),
                isGemini: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setIsLoading(false);
            AudioEngine.playSuccess();
            return;
          }
        }
      } catch (e) {
        console.warn('Gemini tutor call error:', e);
      }
    }

    // Default pedagogical fallback response
    setTimeout(() => {
      const fallbackReply = `שאלה מצוינת! כדי להבין את זה הכי טוב, נסה לשנות כפתור אחד או להזיז פרמטר במעבדה ולראות מה משתנה מול העיניים שלך. מדענים אמיתיים תמיד לומדים מניסוי ותהייה!`;
      setMessages(prev => [
        ...prev,
        {
          id: 'tutor-' + Date.now(),
          sender: 'tutor',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
      AudioEngine.playSuccess();
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom Corner */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); AudioEngine.playStep(); }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all group scale-100 hover:scale-105 border-2 border-white/80 dark:border-slate-800"
          title="שאל את זן הרובוט - חונך הבינה המלאכותית שלך"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-600" />
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold leading-tight">שאל את זן הרובוט</span>
            <span className="block text-[10px] text-blue-200 leading-tight">חונך AI אישי</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[580px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <span>זן הרובוט</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-normal">חונך כיתתי</span>
                </h3>
                <p className="text-[11px] text-blue-100 font-medium">כאן בשבילך לכל שאלה על המעבדה</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="הגדרות מפתח Gemini לחונך חי"
                className={`p-1.5 rounded-xl transition-colors ${showKeyInput ? 'bg-white/30 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setIsOpen(false); AudioEngine.playStep(); }}
                className="p-1.5 rounded-xl text-blue-200 hover:bg-white/20 hover:text-white transition-colors"
                title="סגור חונך"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showKeyInput && (
            <div className="p-3.5 bg-blue-50 dark:bg-slate-950 border-b border-blue-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>חיבור ישיר למנוע Google Gemini</span>
                </span>
                {userApiKey && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> מחובר
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                המפתח נשמר מקומית בדפדפן שלך בלבד לצורך מענה חי לשאלות חופשיות.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="הדבק מפתח Gemini API..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(userApiKey)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  שמור
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.sender === 'tutor' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold transition-colors"
                          title="השמע בקול"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>השמע</span>
                        </button>
                        {msg.isGemini && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[9px]">
                            Gemini AI
                          </span>
                        )}
                      </div>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>זן חושב על תשובה פשוטה וברורה...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
              שאלות מוכנות שכדאי לשאול:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {labKnowledge.prompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(promptText)}
                  className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-blue-500" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="כתוב שאלה לזן הרובוט..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md transition-all shrink-0"
              title="שלח שאלה"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
