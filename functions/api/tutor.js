/**
 * Cloudflare Pages Function: Secure Serverless AI Tutor Proxy
 * 
 * Invokes Google Gemini 3 models using the encrypted server-side GEMINI_API_KEY secret.
 * Features Cascading Model Waterfall inspired by Dapim/Leket resilience architecture.
 * Safely hides API keys from client-side bundles and GitHub repositories.
 */

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview'
];

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        fallback: true, 
        reason: 'NO_SERVER_KEY' 
      }), { status: 200, headers });
    }

    const body = await request.json().catch(() => ({}));
    const userQuery = (body.query || '').trim();
    const labId = body.labId || 'home';

    if (!userQuery) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'EMPTY_QUERY' 
      }), { status: 400, headers });
    }

    const systemPrompt = `אתם חונך בינה מלאכותית ידידותי, מעודד, סבלני ומלהיב לילדים וילדות בכיתה ה (גילאי 10-11) בישראל, בשם "זֶן הרובוט".
הנושא הנלמד כעת: ${labId === 'home' ? 'עולם המחשבים ומבנה המסע' : 'מעבדה ' + labId}.
ענו בעברית פשוטה, בהירה, קולחת ובגובה העיניים של תלמידי כיתה ה. השתמשו באנלוגיות יומיומיות מוחשיות (משחקי לגו, מתגי חשמל, עוגה, פיצה, מיינקראפט, Waze או ספורט).
כלל דקדוקי חובה וקריטי: פנו תמיד בלשון רבים מכלילה (אתם, שלכם, נסו, שימו לב, בואו נגלה) או בלשון נקבה, ולעולם אל תפנו בלשון זכר יחיד!
אורך התשובה: עד 2-3 משפטים קצרים ומעצימים (מקסימום 45 מילים). אל תעמיסו הסברים מורכבים. עודדו את התלמידים להמשיך לחקור ולהתנסות בעצמם.`;

    let lastError = null;

    // Cascading Model Waterfall (Resilience Architecture)
    for (const model of FALLBACK_MODELS) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nשאלת התלמידים: "${userQuery}"` }]
            }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 180
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText && replyText.trim()) {
            return new Response(JSON.stringify({
              success: true,
              text: replyText.trim(),
              model: model
            }), { status: 200, headers });
          }
        }

        const errText = await response.text().catch(() => '');
        lastError = { status: response.status, body: errText, model };

        // If rate limit (429) or temporary server overload (503), cascade to next model
        if (response.status === 429 || response.status === 503 || response.status === 500) {
          continue;
        }

        // If auth error (401, 403), stop cascading
        if (response.status === 401 || response.status === 403) {
          break;
        }
      } catch (err) {
        lastError = { message: err.message, model };
      }
    }

    // If waterfall exhausted or tripped, signal frontend to fallback gracefully
    return new Response(JSON.stringify({
      success: false,
      fallback: true,
      reason: 'CASCADE_EXHAUSTED',
      details: lastError
    }), { status: 200, headers });

  } catch (globalErr) {
    return new Response(JSON.stringify({
      success: false,
      fallback: true,
      error: globalErr.message
    }), { status: 200, headers });
  }
}
