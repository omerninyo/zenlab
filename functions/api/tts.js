/**
 * Cloudflare Pages Function: Dynamic Natural Hebrew Google Gemini TTS Endpoint
 *
 * Synthesizes dynamic UI strings (e.g., Station 8 custom AI stories & open Tutor replies)
 * into warm Israeli Hebrew WAV audio using `gemini-3.8-flash-lite-tts` / `gemini-3.8-flash-tts`
 * with voice `Puck`. Keeps GEMINI_API_KEY strictly server-side.
 */

import {
  cleanHebrewForSpeech,
  wrapPcmInWav,
  GEMINI_LIVE_TTS_MODELS,
  synthesizeGeminiLiveWav
} from '../../src/core/speechUtils.js';

const TTS_MODELS = [
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
  'gemini-2.5-flash-preview-tts'
];
const VOICE_NAME = 'Puck';

function decodeBase64ToBytes(b64) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { request, env } = context;
    const apiKey = env?.GEMINI_API_KEY;

    if (!apiKey || !String(apiKey).trim()) {
      return new Response(
        JSON.stringify({ success: false, fallback: true, reason: 'NO_SERVER_KEY' }),
        { status: 503, headers: jsonHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawText = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!rawText) {
      return new Response(
        JSON.stringify({ success: false, fallback: true, error: 'EMPTY_TEXT' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const cleanText = cleanHebrewForSpeech(rawText.slice(0, 450));
    if (!cleanText) {
      return new Response(
        JSON.stringify({ success: false, fallback: true, error: 'EMPTY_CLEAN_TEXT' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    for (const model of TTS_MODELS) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${String(apiKey).trim()}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Pure Hebrew text only: prefixing English causes Gemini 3.8 TTS to speak it aloud
            contents: [{ parts: [{ text: cleanText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: VOICE_NAME }
                }
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const rawBytes = decodeBase64ToBytes(inlineData.data);
            const mime = String(inlineData.mimeType || '').toLowerCase();
            const isWav =
              mime.includes('wav') ||
              (rawBytes.byteLength > 4 &&
                rawBytes[0] === 0x52 &&
                rawBytes[1] === 0x49 &&
                rawBytes[2] === 0x46 &&
                rawBytes[3] === 0x46);

            let wavBytes = rawBytes;
            if (!isWav) {
              const rateMatch = mime.match(/rate=(\d+)/);
              const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
              wavBytes = wrapPcmInWav(rawBytes, sampleRate, 1, 16);
            }

            return new Response(wavBytes, {
              status: 200,
              headers: {
                'Content-Type': 'audio/wav',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        }

        if (response.status === 401 || response.status === 403) {
          break;
        }
      } catch {
        // cascade to next TTS model
      }
    }

    // Fallback to Gemini Live BidiGenerateContent WebSocket channel (e.g. when REST daily free-tier hits 429)
    for (const liveModel of GEMINI_LIVE_TTS_MODELS) {
      try {
        const { wavBytes } = await synthesizeGeminiLiveWav({
          apiKey: String(apiKey).trim(),
          text: cleanText,
          model: liveModel,
          voiceName: VOICE_NAME,
          timeoutMs: 25000
        });
        return new Response(wavBytes, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch {
        // cascade to next Live model
      }
    }

    return new Response(
      JSON.stringify({ success: false, fallback: true, reason: 'TTS_CASCADE_EXHAUSTED' }),
      { status: 503, headers: jsonHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, fallback: true, error: err?.message || 'INTERNAL_ERROR' }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
