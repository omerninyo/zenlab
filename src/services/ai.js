/**
 * AI Service for LearnAI Platform
 * 
 * Provides deterministic client-side calculations for all educational labs,
 * with an optional adapter for external Google Gemini API calls when VITE_GEMINI_API_KEY is configured.
 */

// Reads optional API key without throwing if undefined
const GEMINI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';

export const AIService = {
  /**
   * Computes normalized Softmax probabilities given logits and temperature.
   * If temperature is near zero, collapses to deterministic greedy distribution.
   * 
   * @param {Array<{ token: string, baseScore: number, explanation: string }>} candidates 
   * @param {number} temperature (0.0 to 1.5)
   * @returns {Array<{ token: string, probability: number, rawProb: number, explanation: string }>}
   */
  computeTokenProbabilities(candidates, temperature = 0.7) {
    if (!candidates || candidates.length === 0) return [];

    // Deterministic greedy mode when temperature is close to 0
    if (temperature <= 0.05) {
      let maxScore = -Infinity;
      let maxIndex = 0;
      candidates.forEach((c, idx) => {
        if (c.baseScore > maxScore) {
          maxScore = c.baseScore;
          maxIndex = idx;
        }
      });

      return candidates.map((c, idx) => ({
        token: c.token,
        probability: idx === maxIndex ? 100 : 0,
        rawProb: idx === maxIndex ? 1.0 : 0.0,
        explanation: c.explanation
      }));
    }

    // Apply temperature scaling: z_i / T
    const scaledScores = candidates.map(c => c.baseScore / temperature);
    const maxScaled = Math.max(...scaledScores); // numerical stability trick
    const expScores = scaledScores.map(s => Math.exp(s - maxScaled));
    const sumExp = expScores.reduce((sum, val) => sum + val, 0);

    return candidates.map((c, idx) => {
      const rawProb = expScores[idx] / sumExp;
      return {
        token: c.token,
        probability: Math.round(rawProb * 100),
        rawProb,
        explanation: c.explanation
      };
    });
  },

  /**
   * Samples a token based on computed probability distribution.
   * 
   * @param {Array<{ token: string, rawProb: number }>} candidatesWithProb 
   * @param {number} temperature 
   * @returns {string} The chosen token
   */
  sampleToken(candidatesWithProb, temperature = 0.7) {
    if (!candidatesWithProb || candidatesWithProb.length === 0) return '';

    // If deterministic, pick highest probability
    if (temperature <= 0.05) {
      const best = [...candidatesWithProb].sort((a, b) => b.rawProb - a.rawProb)[0];
      return best.token;
    }

    // Stochastic roulette-wheel sampling
    const rand = Math.random();
    let cumulative = 0;
    for (const item of candidatesWithProb) {
      cumulative += item.rawProb;
      if (rand <= cumulative) {
        return item.token;
      }
    }
    return candidatesWithProb[candidatesWithProb.length - 1].token;
  },

  /**
   * Classifies a 2D test point using k-Nearest Neighbors (k-NN) algorithm.
   * 
   * @param {Array<{ id: number, x: number, y: number, label: string }>} trainPoints 
   * @param {{ x: number, y: number }} queryPoint 
   * @param {number} k (1, 3, 5, etc.)
   * @returns {{ predictedLabel: string, confidence: number, nearestNeighbors: Array<any> }}
   */
  classifyPointKNN(trainPoints, queryPoint, k = 3) {
    if (!trainPoints || trainPoints.length === 0) {
      return { predictedLabel: 'A', confidence: 50, nearestNeighbors: [] };
    }

    // Calculate Euclidean distance to every training point
    const withDistances = trainPoints.map(p => {
      const dx = p.x - queryPoint.x;
      const dy = p.y - queryPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return { ...p, distance };
    });

    // Sort by ascending distance and slice top k
    withDistances.sort((a, b) => a.distance - b.distance);
    const effectiveK = Math.min(k, withDistances.length);
    const nearestNeighbors = withDistances.slice(0, effectiveK);

    // Count votes for each label
    const votes = {};
    for (const item of nearestNeighbors) {
      votes[item.label] = (votes[item.label] || 0) + 1;
    }

    let maxVotes = -1;
    let predictedLabel = trainPoints[0].label;

    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        predictedLabel = label;
      }
    }

    const confidence = Math.round((maxVotes / effectiveK) * 100);

    return {
      predictedLabel,
      confidence,
      nearestNeighbors,
      votes
    };
  },

  /**
   * Optional external Gemini API integration.
   * Falls back seamlessly to deterministic mock if no key or on failure.
   */
  async generatePedagogicalExplanation(prompt, fallbackText) {
    if (!GEMINI_API_KEY) {
      return fallbackText;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `הסבר בקצרה ובפשטות לתלמיד בעברית: ${prompt}` }] }]
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
    } catch {
      return fallbackText;
    }
  }
};
