/**
 * Shared Hebrew Phonetic Normalization & Audio Formatting Utilities
 *
 * Used identically across:
 * - Client `NarrationEngine` (src/core/narration.js)
 * - Cloudflare Pages `/api/tts` endpoint (functions/api/tts.js)
 * - Studio MP3 pre-renderer (scripts/generate_gemini_tts_all.mjs)
 */

/**
 * Phonetically normalize Hebrew text for natural, child-friendly Google Gemini TTS & Web Speech:
 * - Strips emojis, markdown symbols, and redundant English parenthetical duplicates.
 * - Replaces math/coding symbols and acronyms with crisp Israeli Hebrew pronunciation.
 * - Preserves Hebrew geresh/gershayim (ג׳, צ׳, מכ״ם) for accurate letter pronunciation.
 *
 * @param {string} text
 * @returns {string}
 */
export function cleanHebrewForSpeech(text) {
  if (!text) return '';

  return String(text)
    // Preserve A* before stripping asterisks
    .replace(/\*A|A\*/gi, 'אֵיי-סטאר')
    // Remove markdown links & inline markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#~•]/g, '')
    // Strip emojis & variation selectors
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, '')
    // Remove empty mystery icon parens like (?)
    .replace(/\(\s*\?\s*\)/g, '')
    // Clean redundant English duplicates in parentheses beside Hebrew terms
    .replace(/(['"״׳]?וגם['"״׳]?)\s*\(AND\)/gi, '$1')
    .replace(/(['"״׳]?או['"״׳]?)\s*\(OR\)/gi, '$1')
    .replace(/\(IF\s*\/\s*ELSE\)/gi, 'אִיף אוֹ אֶלְס')
    .replace(/\(Kernel\s*3[×xX]3\)/gi, 'בגודל שלוש על שלוש')
    .replace(
      /\((?:Byte|Weights?|Activation|Threshold|Bias|Data|Loops?|Debugging|Bug|Temperature|Context Window|Hallucinations?|Prompt|Attention|Self-Attention|Cloud|Deep Learning|AI Agent|Inputs?|Features?|Binary|ALU|CPU|RAM|RGB)\)/gi,
      ''
    )
    // Formula & coordinate expansions
    .replace(/f\s*=\s*g\s*\+\s*h/gi, 'אֵף שווה גִ׳י ועוד אֵייץ׳')
    .replace(/\(g\)/g, 'גִ׳י')
    .replace(/\(h\)/g, 'אֵייץ׳')
    .replace(/\((?:R|G|B)\)/g, '')
    .replace(/\(0\s*,\s*0\)/g, 'אפס ואפס')
    .replace(/\(0\s*,\s*1\)/g, 'אפס ואחת')
    .replace(/\(1\s*,\s*0\)/g, 'אחת ואפס')
    .replace(/\(1\s*,\s*1\)/g, 'אחת ואחת')
    .replace(/w₁/g, 'דאבל-יו אחת')
    .replace(/w₂/g, 'דאבל-יו שתיים')
    // Technical acronyms
    .replace(/\bCPU\b/gi, 'סִי-פִּי-יוּ')
    .replace(/\bRAM\b/gi, 'רָאם')
    .replace(/\bALU\b/gi, 'אֵיי-אֵל-יוּ')
    .replace(/\bBFS\b/gi, 'בִּי-אֵף-אֵס')
    .replace(/\bk-NN\b/gi, 'קֵיי-אֵן-אֵן')
    .replace(/\bRGB\b/gi, 'אָר גִ׳י בִּי')
    .replace(/\bLLMs\b/gi, 'מודלי שפה')
    .replace(/\bLLM\b/gi, 'מודל שפה')
    .replace(/\bXOR\b/gi, 'אֶקְס-אוֹר')
    .replace(/\bNAND\b/gi, 'נָאנְד')
    .replace(/\bAND\b/gi, 'אֶנְד')
    .replace(/\bOR\b/gi, 'אוֹ')
    .replace(/\bNOT\b/gi, 'נוֹט')
    .replace(/\bPC\b/gi, 'מונה פקודות')
    .replace(/\bIR\b/gi, 'אוגר פקודה')
    .replace(/\bACC\b/gi, 'אוגר הצובר')
    .replace(/\bk=5\b/gi, 'קֵיי שווה חמש')
    .replace(/\bk=3\b/gi, 'קֵיי שווה שלוש')
    .replace(/\bk=1\b/gi, 'קֵיי שווה אחת')
    .replace(/(?<![A-Za-z])k(?![A-Za-z])/g, 'קֵיי')
    .replace(/(?<![A-Za-z])h(?![A-Za-z])/g, 'אֵייץ׳')
    .replace(/(?<![A-Za-z])g(?![A-Za-z])/g, 'גִ׳י')
    // Grid dimensions
    .replace(/3[×xX]3/g, 'שלוש על שלוש')
    .replace(/8[×xX]8/g, 'שמונה על שמונה')
    .replace(/6[×xX]6/g, 'שש על שש')
    .replace(/5[×xX]5/g, 'חמש על חמש')
    // Brand & product names
    .replace(/\bZenLab\b/gi, 'זֶן-לאבּ')
    .replace(/\bZen\b/gi, 'זֶן')
    .replace(/(^|\s)זן(?=\s|[.,!?]|$)/g, '$1זֶן')
    .replace(/\bChatGPT\b/gi, 'צ׳אט ג׳י-פּי-טי')
    .replace(/\bGemini\b/gi, 'ג׳מיני')
    .replace(/\bClaude\b/gi, 'קלוד')
    .replace(/\bWaze\b/gi, 'ווייז')
    .replace(/\bGmail\b/gi, 'ג׳ימייל')
    .replace(/\bGoogle\b/gi, 'גוגל')
    .replace(/\bAkinator\b/gi, 'אקינטור')
    .replace(/\bFaceID\b/gi, 'פייס-איי-די')
    .replace(/\bMobileye\b/gi, 'מובילאיי')
    .replace(/\bScratch\b/gi, 'סקראץ׳')
    .replace(/\bRoblox\b/gi, 'רובלוקס')
    .replace(/\bMinecraft\b/gi, 'מיינקראפט')
    .replace(/\bSpotify\b/gi, 'ספוטיפיי')
    .replace(/\bYouTube\b/gi, 'יוטיוב')
    .replace(/\bTikTok\b/gi, 'טיקטוק')
    .replace(/\bInstagram\b/gi, 'אינסטגרם')
    .replace(/\bWhatsApp\b/gi, 'ווטסאפ')
    .replace(/(?<![A-Za-z])AI(?![A-Za-z])/gi, 'בינה מלאכותית')
    // Hebrew numeric phrasing that often trips TTS engines
    .replace(/0\s*ו-1/g, 'אפס ואחת')
    .replace(/מ-0\s*ל-1/g, 'מאפס לאחת')
    .replace(/מ-0\s*עד\s*255/g, 'מאפס עד מאתיים חמישים וחמש')
    .replace(/0\s*עד\s*1/g, 'אפס עד אחת')
    .replace(/ב-100%/g, 'במאה אחוז')
    .replace(/100%/g, 'מאה אחוז')
    .replace(/10₂/g, 'עשר בבינארית, שזה שתיים')
    // Arrows & punctuation pauses
    .replace(/[⬅←→]/g, ', ואז ')
    .replace(/↔/g, ' לבין ')
    .replace(/[–—]/g, ', ')
    .replace(/(^|[\s(])'|'([\s.,!?):]|$)/g, '$1$2')
    .replace(/["“”‘’]/g, ' ')
    .replace(/\s+\/\s+/g, ' או ')
    .replace(/\+/g, ' ועוד ')
    .replace(/=/g, ' שווה ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?:])/g, '$1')
    .trim();
}

/**
 * Wraps raw signed 16-bit PCM bytes into a standard 44-byte RIFF WAV container.
 *
 * @param {Uint8Array} pcmBytes
 * @param {number} [sampleRate=24000]
 * @param {number} [numChannels=1]
 * @param {number} [bitsPerSample=16]
 * @returns {Uint8Array}
 */
export function wrapPcmInWav(pcmBytes, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.byteLength;
  const wav = new Uint8Array(44 + dataSize);
  const view = new DataView(wav.buffer);

  const writeStr = (offset, s) => {
    for (let i = 0; i < s.length; i++) wav[offset + i] = s.charCodeAt(i);
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  wav.set(pcmBytes, 44);

  return wav;
}

function base64ToUint8(b64) {
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

function concatUint8Arrays(chunks) {
  const total = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

export const GEMINI_LIVE_TTS_MODELS = [
  'models/gemini-2.5-flash-native-audio-latest',
  'models/gemini-3.1-flash-live-preview'
];

const LIVE_TTS_SYSTEM_INSTRUCTION =
  'אתה מנוע הקראת טקסט (Text-to-Speech) בעברית ישראלית טבעית וחמה לילדים. הקרא בקול את הטקסט שמופיע בין המירכאות מילה במילה מההתחלה ועד הסוף, בדיוק כפי שהוא כתוב. אל תוסיף אף מילה לפני או אחרי.';

const PCM_ACTIVE_PEAK_THRESHOLD = 450;

/**
 * Analyzes signed 16-bit LE PCM audio in 20ms frames, computes active speech duration
 * and internal silent gaps, and trims leading/trailing silence with small safety padding.
 *
 * @param {Uint8Array} pcmBytes
 * @param {number} [sampleRate=24000]
 * @returns {{ activeSec: number, maxInternalSilentSec: number, trimmedPcm: Uint8Array }}
 */
function analyzeAndTrimPcm16(pcmBytes, sampleRate = 24000) {
  const frameDurationSec = 0.02;
  const frameBytes = Math.max(2, Math.floor(sampleRate * frameDurationSec) * 2);
  const totalFrames = Math.floor(pcmBytes.byteLength / frameBytes);
  const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);

  let firstActiveFrame = -1;
  let lastActiveFrame = -1;
  let activeFrames = 0;
  let currentSilentRun = 0;
  let maxInternalSilentFrames = 0;

  for (let f = 0; f < totalFrames; f++) {
    const start = f * frameBytes;
    let peak = 0;
    for (let j = 0; j < frameBytes; j += 2) {
      const amp = Math.abs(view.getInt16(start + j, true));
      if (amp > peak) peak = amp;
    }

    if (peak > PCM_ACTIVE_PEAK_THRESHOLD) {
      if (firstActiveFrame === -1) {
        firstActiveFrame = f;
      } else if (currentSilentRun > maxInternalSilentFrames) {
        maxInternalSilentFrames = currentSilentRun;
      }
      lastActiveFrame = f;
      activeFrames++;
      currentSilentRun = 0;
    } else if (firstActiveFrame !== -1) {
      currentSilentRun++;
    }
  }

  if (firstActiveFrame === -1) {
    return { activeSec: 0, maxInternalSilentSec: 0, trimmedPcm: new Uint8Array(0) };
  }

  const startByte = Math.max(0, firstActiveFrame - 4) * frameBytes;
  const endByte = Math.min(totalFrames * frameBytes, (lastActiveFrame + 8) * frameBytes);
  return {
    activeSec: activeFrames * frameDurationSec,
    maxInternalSilentSec: maxInternalSilentFrames * frameDurationSec,
    trimmedPcm: pcmBytes.slice(startByte, endByte)
  };
}

function extractNormalizedHebrewWords(input) {
  const withoutNiqqud = String(input || '').replace(/[\u0591-\u05C7]/g, '');
  return withoutNiqqud.match(/[\u05D0-\u05EA]+/g) || [];
}

/**
 * Synthesizes verbatim Hebrew speech over Gemini Live BidiGenerateContent WebSocket
 * and wraps the resulting 24kHz PCM stream in a standard WAV container.
 *
 * @param {{ apiKey: string, text: string, model?: string, voiceName?: string, timeoutMs?: number }} opts
 * @returns {Promise<{ wavBytes: Uint8Array, model: string }>}
 */
export function synthesizeGeminiLiveWav({
  apiKey,
  text,
  model = GEMINI_LIVE_TTS_MODELS[0],
  voiceName = 'Puck',
  timeoutMs = 35000
}) {
  return new Promise((resolve, reject) => {
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(wsUrl);
    const pcmChunks = [];
    let outputTranscript = '';
    let sampleRate = 24000;
    let settled = false;
    let genDoneTimer = null;
    let seenActiveSpeech = false;
    let trailingSilentFrames = 0;

    const nonSpaceChars = String(text || '').replace(/\s+/g, '').length;
    const minActiveSec = Math.max(0.9, nonSpaceChars * 0.035);
    const expectedWords = extractNormalizedHebrewWords(text);

    const finish = (err, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (genDoneTimer) clearTimeout(genDoneTimer);
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {
        // ignore close failure
      }
      if (err) reject(err);
      else resolve(value);
    };

    const finalizeAudio = () => {
      const pcmBytes = concatUint8Arrays(pcmChunks);
      const { activeSec, maxInternalSilentSec, trimmedPcm } = analyzeAndTrimPcm16(
        pcmBytes,
        sampleRate
      );

      if (activeSec < minActiveSec) {
        finish(
          new Error(
            `${model}: active speech too short (${activeSec.toFixed(2)}s < ${minActiveSec.toFixed(2)}s)`
          )
        );
        return;
      }

      if (maxInternalSilentSec > 2.2) {
        finish(
          new Error(
            `${model}: excessive internal silence (${maxInternalSilentSec.toFixed(2)}s > 2.2s)`
          )
        );
        return;
      }

      if (outputTranscript.trim().length > 0 && expectedWords.length >= 4) {
        const spokenWords = extractNormalizedHebrewWords(outputTranscript);
        const minWords = Math.ceil(expectedWords.length * 0.65);
        if (spokenWords.length < minWords) {
          finish(
            new Error(
              `${model}: incomplete live speech (${spokenWords.length}/${expectedWords.length} Hebrew words)`
            )
          );
          return;
        }
      }

      finish(null, { wavBytes: wrapPcmInWav(trimmedPcm, sampleRate, 1, 16), model });
    };

    // Keep an active timer ref so Node v26 undici WebSocket does not exit early before turnComplete
    const timer = setTimeout(() => {
      finish(new Error(`${model}: Live WebSocket timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          setup: {
            model,
            generationConfig: {
              responseModalities: ['AUDIO'],
              temperature: 0.1,
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName }
                }
              }
            },
            outputAudioTranscription: {},
            systemInstruction: {
              parts: [{ text: LIVE_TTS_SYSTEM_INSTRUCTION }]
            }
          }
        })
      );
    });

    ws.addEventListener('message', async (ev) => {
      try {
        let rawStr = '';
        if (typeof ev.data === 'string') {
          rawStr = ev.data;
        } else if (ev.data && typeof ev.data.arrayBuffer === 'function') {
          rawStr = new TextDecoder().decode(await ev.data.arrayBuffer());
        } else if (ev.data) {
          rawStr = new TextDecoder().decode(ev.data);
        }

        const msg = JSON.parse(rawStr);

        if (msg.error) {
          finish(new Error(`${model} error: ${msg.error.message || JSON.stringify(msg.error)}`));
          return;
        }

        if (msg.setupComplete) {
          ws.send(
            JSON.stringify({
              clientContent: {
                turns: [{ role: 'user', parts: [{ text: `טקסט להקראה: "${text}"` }] }],
                turnComplete: true
              }
            })
          );
          return;
        }

        if (msg.serverContent?.outputTranscription?.text) {
          outputTranscript += msg.serverContent.outputTranscription.text;
        }

        const parts = msg.serverContent?.modelTurn?.parts || [];
        for (const p of parts) {
          if (p.inlineData?.data) {
            const mime = String(p.inlineData.mimeType || '').toLowerCase();
            const rateMatch = mime.match(/rate=(\d+)/);
            if (rateMatch) sampleRate = Number(rateMatch[1]);
            const chunk = base64ToUint8(p.inlineData.data);
            pcmChunks.push(chunk);

            const frameBytes = Math.max(2, Math.floor(sampleRate * 0.02) * 2);
            const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
            for (let off = 0; off + frameBytes <= chunk.byteLength; off += frameBytes) {
              let peak = 0;
              for (let j = 0; j < frameBytes; j += 2) {
                const amp = Math.abs(view.getInt16(off + j, true));
                if (amp > peak) peak = amp;
              }
              if (peak > PCM_ACTIVE_PEAK_THRESHOLD) {
                seenActiveSpeech = true;
                trailingSilentFrames = 0;
              } else if (seenActiveSpeech) {
                trailingSilentFrames++;
              }
            }

            if (seenActiveSpeech && trailingSilentFrames >= 175) {
              finalizeAudio();
              return;
            }
          }
        }

        if (msg.serverContent?.turnComplete) {
          finalizeAudio();
          return;
        }

        if (msg.serverContent?.generationComplete && !genDoneTimer) {
          genDoneTimer = setTimeout(finalizeAudio, 700);
        }
      } catch (err) {
        finish(err);
      }
    });

    ws.addEventListener('error', (err) => {
      finish(new Error(`${model}: WebSocket error ${err?.message || ''}`.trim()));
    });

    ws.addEventListener('close', (ev) => {
      if (!settled) {
        finish(new Error(`${model}: WebSocket closed early (${ev?.code || 0} ${ev?.reason || ''})`.trim()));
      }
    });
  });
}
