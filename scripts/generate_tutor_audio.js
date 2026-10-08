import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/audio/tutor');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const TUTOR_ITEMS = [
  // Lab 1
  { id: 'lab1_welcome', text: 'שלום! אני זן, הרובוט החונך שלך. אנחנו חוקרים יחד פיקסלים וביטים! על מה תרצה לשאול?' },
  { id: 'lab1_q0', text: 'פיקסל הוא כמו קוביית לגו קטנטנה של אור על המסך. כשמחברים אלפי קוביות צבעוניות כאלה ביחד, העין שלנו רואה תמונה שלמה!' },
  { id: 'lab1_q1', text: 'בתוך המעבד יש מיליארדי מתגים חשמליים קטנטנים. מתג פתוח זה אפס, ומתג סגור זה אחד. זה כמו להדליק ולכבות מנורה במהירות עצומה!' },
  { id: 'lab1_q2', text: 'כל צבע מורכב משלושה אורות: אדום, ירוק וכחול. המחשב נותן מספר לכל אחד מהם מ-0 עד 255, וכשהם מתערבבים נוצר כל צבע בעולם!' },
  { id: 'lab1_q3', text: 'נסה לחשוב על ציור פשוט כמו לב, סמיילי או חץ. התחל מהמרכז של רשת הפיקסלים, וסמן פיקסלים בצורה סימטרית משני הצדדים!' },

  // Lab 2
  { id: 'lab2_welcome', text: 'היי! אני כאן לעזור לך לתכנת אותי ללכת במבוך. זכור: רובוט עושה בדיוק מה שאומרים לו!' },
  { id: 'lab2_q0', text: 'רובוט אינו חושב כמו בן אדם, הוא עוקב אחרי רשימת הפקודות שלך באדיקות. אם לא אמרנו לו לבדוק שיש קיר לפני שהוא צועד, הוא פשוט ינסה לעבור דרכו!' },
  { id: 'lab2_q1', text: 'פקודה היא צעד בודד, כמו "צעד קדימה". לולאה היא הוראה לחזור על פקודות שוב ושוב, למשל: צעד ארבע פעמים, כדי שלא נצטרך לכתוב את אותו דבר המון פעמים.' },
  { id: 'lab2_q2', text: 'דמיין שאתה עומד בתוך המבוך בכיוון שהרובוט מסתכל. האם היד הימנית שלך פונה לקיר או למסדרון פתוח? תמיד תבדוק לאן הרובוט פונה לפני שאתה פוקד להסתובב.' },
  { id: 'lab2_q3', text: 'חלק את הדרך למקטעים קצרים: קודם כל תגיע לפינה הראשונה, תסתובב, ורק אז תמשיך למטבע הבא!' },

  // Lab 3
  { id: 'lab3_welcome', text: 'שלום בלש צעיר! עצי החלטה הם הדרך שבה מחשבים משחקים 20 מי שאלות. מה תרצה לדעת?' },
  { id: 'lab3_q0', text: 'בדיוק כמו משחק 20 מי יודע! מתחילים בשאלה ראשית כמו "האם יש לזה כנפיים?". תשובת כן מובילה לענף אחד, ותשובת לא מובילה לענף אחר, עד שמגיעים לתשובה.' },
  { id: 'lab3_q1', text: 'השאלה הכי טובה היא זו שמחלקת את כל האפשרויות לשני חצאים שווים בערך! ככה פוסלים חצי מהאפשרויות כבר בשאלה הראשונה.' },
  { id: 'lab3_q2', text: 'כן! אם השאלות בעץ אינן מדויקות, או אם נתקלנו בחיה מיוחדת שלא נלקחה בחשבון כמו ברווזן שיש לו מקור אבל הוא יונק, העץ עלול להוביל לתשובה שגויה.' },
  { id: 'lab3_q3', text: 'בדוק את המאפיינים הייחודיים של כל פריט וחפש תכונה ששייכת רק לחלק מהם, למשל: יכולת לעוף או חיים במים.' },

  // Lab 4
  { id: 'lab4_welcome', text: 'ברוכים הבאים לעולם הניווט החכם! האלגוריתם שאתה חוקר כאן הוא הבסיס של Waze ומפות גוגל.' },
  { id: 'lab4_q0', text: 'הוא מחלק את כל המפה לצמתים ומשקלים. אלגוריתם חכם מחשב את המרחק שעברנו עד כה יחד עם הערכה של המרחק שנותר עד היעד, וכך בוחר תמיד את הצומת המבטיח ביותר!' },
  { id: 'lab4_q1', text: 'זהו שמו של אחד האלגוריתמים המפורסמים במדעי המחשב, איי סטאר. הוא משלב בין המרחק האמיתי שכבר צעדנו לבין קו אווירי למטרה כדי לא לבזבז זמן על כיוונים הפוכים.' },
  { id: 'lab4_q2', text: 'במבוך גדול או בעיר אמיתית יש מיליוני שילובים של רחובות! בדיקת כולם תיקח שעות או ימים. אלגוריתם חכם מוצא את הדרך תוך אלפיות שנייה.' },
  { id: 'lab4_q3', text: 'הימנע ממחסומים שמאלצים אותך להתרחק מאוד מהמטרה. חפש פרצות במרכז המבוך שמובילות ישר ליעד.' },

  // Lab 5
  { id: 'lab5_welcome', text: 'הגעת ללב ליבה של הבינה המלאכותית: למידת מכונה! כאן לא מתכנתים פקודות, אלא מלמדים מדוגמאות.' },
  { id: 'lab5_q0', text: 'במקום לתת חוקים נוקשים, מראים למחשב אלפי דוגמאות כמו תמונות של תפוחים ובננות. המחשב מוצא בעצמו דפוסים מתמטיים משותפים, בדיוק כמו שתינוק לומד לזהות כלב!' },
  { id: 'lab5_q1', text: 'אימון זה שלב הלמידה עם ספר פתוח שבו המחשב רואה דוגמאות יחד עם התשובה הנכונה. מבחן זה כשמציגים לו תמונה חדשה לגמרי שהוא מעולם לא ראה ובודקים אם הוא מזהה אותה נכון.' },
  { id: 'lab5_q2', text: 'אם נראה למחשב רק תפוחים אדומים, הוא יחשוב שתפוח ירוק הוא לא תפוח! ככל שמביאים דוגמאות מגוונות, המודל נהיה חכם ומדויק יותר.' },
  { id: 'lab5_q3', text: 'ודא שיש לך כמות שווה ומגוונת של דוגמאות מכל סוג כדי שהמודל לא יהיה מוטה לטובת סוג מסוים.' },

  // Lab 6
  { id: 'lab6_welcome', text: 'ראייה ממוחשבת היא הדרך שבה מכוניות אוטונומיות וטלפונים רואים ומזהים פנים וחפצים!' },
  { id: 'lab6_q0', text: 'בשביל המחשב, תמונה היא לא ציור אלא טבלה ענקית של מספרים! כל מספר מייצג כמה בהיר או כהה הפיקסל באותה נקודה.' },
  { id: 'lab6_q1', text: 'פילטר הוא כמו זכוכית מגדלת קטנה בגודל 3 על 3 שעוברת על כל פיקסל ומחשבת ממוצע עם השכנים שלו. הוא יכול לטשטש, לחדד, או למצוא קווי מתאר!' },
  { id: 'lab6_q2', text: 'קצה הוא מקום שבו יש קפיצה חדה בצבע, למשל פיקסל שחור ליד פיקסל לבן. הפילטר מחשב את ההפרש בין פיקסלים סמוכים ומאיר את הקווים הבולטים!' },
  { id: 'lab6_q3', text: 'הפעל את פילטר זיהוי הקצוות ושים לב כיצד הקווים החיצוניים של האובייקט נשארים בהירים בעוד שהרקע הופך לשחור.' },

  // Lab 7
  { id: 'lab7_welcome', text: 'חקר רשתות נוירונים! כאן אנחנו מחקים את אופן הפעולה של תאי המוח האנושיים.' },
  { id: 'lab7_q0', text: 'נוירון הוא מתג חכם: הוא מקבל מספר אותות כניסה, מכפיל כל אחד בחשיבות שלו שנקראת משקל, מחבר הכל, ואם הסכום גבוה מספיק – הוא יורה אות הלאה!' },
  { id: 'lab7_q1', text: 'המשקולת קובעת כמה קלט מסוים חשוב להחלטה. למשל, אם מחליטים אם ללכת לים: האם יורד גשם מקבל משקל ענק ושלילי, וצבע החולצה מקבל משקל אפס.' },
  { id: 'lab7_q2', text: 'זהו שער ההחלטה: הוא בודק האם הסכום עבר סף מסוים. אם עברנו את הסף – הנוירון נדלק ומעביר אחד. אם לא – הוא נשאר כבוי באפס.' },
  { id: 'lab7_q3', text: 'אם הנוירון לא נדלק כשהתנאים מתקיימים, נסה להעלות את המשקולת של התכונה החשובה או להוריד מעט את סף ההחלטה.' },

  // Lab 8
  { id: 'lab8_welcome', text: 'מודלי שפה גדולים כמו צ\'אט ג\'י פי טי וג\'מיני! כאן לומדים איך מחשב מייצר טקסט ורעיונות.' },
  { id: 'lab8_q0', text: 'מודל שפה קרא כמויות אדירות של ספרים ומאמרים. הוא מחשב הסתברויות מתמטיות: אחרי המילים "השמש זורחת ב..." המילה "מזרח" מקבלת 99% סיכוי, והמילה "טוסטר" מקבלת סיכוי אפסי!' },
  { id: 'lab8_q1', text: 'זהו הזיכרון לטווח קצר של המודל – כמות המילים שהוא מסוגל לזכור בשיחה הנוכחית. אם השיחה ארוכה מדי מחלון ההקשר, הוא מתחיל לשכוח את מה שנאמר בהתחלה.' },
  { id: 'lab8_q2', text: 'מכיוון שהמודל רק מנחש מילים לפי הסתברות ולא באמת מבין את המציאות, לפעמים הוא ממציא עובדות שנשמעות מאוד משכנעות אבל הן שגויות לחלוטין. תמיד צריך לבדוק עובדות!' },
  { id: 'lab8_q3', text: 'היה ברור ומדויק: הגדר למודל מי הוא, למי הוא מסביר, ובאיזה אורך. למשל: "אתה מדריך מדעים, הסבר לילד בכיתה ה בשני משפטים בלבד".' }
];

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const apiKeyArg = args.find(a => a.startsWith('--api-key='));
const apiKey = apiKeyArg ? apiKeyArg.split('=')[1] : process.env.GEMINI_API_KEY;

// Flagship 2026 model: gemini-3.8-flash-tts
const MODEL_NAME = 'gemini-3.8-flash-tts';
const VOICE_NAME = 'Puck'; // Warm, enthusiastic child-friendly robot voice

async function synthesizeGemini(text, outFile) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text }]
      }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: VOICE_NAME
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini 3.8 Flash TTS error (${response.status}): ${err}`);
  }

  const json = await response.json();
  const rawBase64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!rawBase64) {
    throw new Error('No audio data returned in response');
  }
  const audioBuf = Buffer.from(rawBase64, 'base64');
  fs.writeFileSync(outFile, audioBuf);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log(`🎙️ ZenLab Tutor Studio Voice Generator`);
  console.log(`Model: ${MODEL_NAME} | Voice: ${VOICE_NAME}`);
  console.log(`Total Snippets: ${TUTOR_ITEMS.length}`);
  console.log(`Target Output: ${OUTPUT_DIR}\n`);

  if (isDryRun || !apiKey) {
    console.log('📋 Dry-Run Mode. Provide --api-key=... to generate audio files.');
    TUTOR_ITEMS.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.id}] ${item.text.slice(0, 45)}...`);
    });
    return;
  }

  for (let i = 0; i < TUTOR_ITEMS.length; i++) {
    const item = TUTOR_ITEMS[i];
    const outFile = path.join(OUTPUT_DIR, `${item.id}.wav`);

    // Check if already exists and non-empty
    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
      console.log(`[${i + 1}/${TUTOR_ITEMS.length}] Already exists: ${item.id}.wav (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB), skipping.`);
      continue;
    }

    console.log(`[${i + 1}/${TUTOR_ITEMS.length}] Synthesizing ${item.id}...`);
    let success = false;
    let attempts = 0;

    while (!success && attempts < 4) {
      attempts++;
      try {
        await synthesizeGemini(item.text, outFile);
        console.log(`  -> Saved ${item.id}.wav (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
        success = true;
        if (i < TUTOR_ITEMS.length - 1) {
          await sleep(2500); // 2.5s polite delay for standard tier
        }
      } catch (err) {
        if (err.message.includes('429') && attempts < 4) {
          console.log(`  ⚠️ Quota limit (429). Waiting 10s before retry ${attempts + 1}...`);
          await sleep(10000);
        } else {
          console.error(`  ❌ Error on ${item.id}:`, err.message);
          break;
        }
      }
    }
  }

  console.log('\n✨ Generation completed for all 40 tutor audio snippets!');
}

run();
