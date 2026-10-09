/**
 * AI Service for LearnAI Platform
 * 
 * Provides deterministic client-side calculations for all educational labs,
 * with an optional adapter for external Google Gemini API calls when VITE_GEMINI_API_KEY is configured.
 */

// Reads optional API key without throwing if undefined
const GEMINI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';

/**
 * Tests an item against an attribute with proper numeric and boolean handling.
 * Avoids JavaScript truthy bugs on numeric legs.
 */
export function testTreeAttribute(item, attr) {
  if (!item || !attr) return false;
  if (attr === 'legs') return item.legs === 4;
  if (attr === 'hasShell') return Boolean(item.hasShell);
  return Boolean(item[attr]);
}

export const AIService = {
  // Expose helper on AIService
  testTreeAttribute,

  /**
   * Computes normalized Softmax probabilities given logits and temperature.

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
  },

  /**
   * Solves a grid maze using either Breadth-First Search (BFS) or A* Heuristic Search.
   * 
   * @param {{ grid: number[], width: number, height: number, start: {x: number, y: number}, goal: {x: number, y: number}, algorithm: 'bfs' | 'astar' }} params
   * @returns {{ visitedOrder: Array<{x: number, y: number}>, path: Array<{x: number, y: number}>, totalExplored: number, found: boolean }}
   */
  solvePathfinder({ grid, width = 8, height = 8, start = { x: 0, y: 0 }, goal = { x: 7, y: 7 }, algorithm = 'astar' }) {
    const isInside = (x, y) => x >= 0 && x < width && y >= 0 && y < height;
    const isWalkable = (x, y) => isInside(x, y) && grid[y * width + x] === 0;
    const keyOf = (p) => `${p.x},${p.y}`;
    const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const visitedOrder = [];
    const cameFrom = new Map();

    if (!isWalkable(start.x, start.y) || !isWalkable(goal.x, goal.y)) {
      return { visitedOrder: [], path: [], totalExplored: 0, found: false };
    }

    if (start.x === goal.x && start.y === goal.y) {
      return { visitedOrder: [start], path: [start], totalExplored: 1, found: true };
    }

    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ];

    if (algorithm === 'bfs') {
      const queue = [{ x: start.x, y: start.y }];
      const visited = new Set([keyOf(start)]);

      while (queue.length > 0) {
        const current = queue.shift();
        visitedOrder.push(current);

        if (current.x === goal.x && current.y === goal.y) {
          // Reconstruct path
          const path = [];
          let currKey = keyOf(current);
          while (currKey) {
            const [cx, cy] = currKey.split(',').map(Number);
            path.unshift({ x: cx, y: cy });
            currKey = cameFrom.get(currKey);
          }
          return { visitedOrder, path, totalExplored: visitedOrder.length, found: true };
        }

        for (const dir of directions) {
          const nx = current.x + dir.x;
          const ny = current.y + dir.y;
          const nKey = `${nx},${ny}`;

          if (isWalkable(nx, ny) && !visited.has(nKey)) {
            visited.add(nKey);
            cameFrom.set(nKey, keyOf(current));
            queue.push({ x: nx, y: ny });
          }
        }
      }

      return { visitedOrder, path: [], totalExplored: visitedOrder.length, found: false };
    }

    // A* Heuristic Search
    const openSet = [{ x: start.x, y: start.y }];
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(keyOf(start), 0);
    fScore.set(keyOf(start), manhattan(start, goal));

    while (openSet.length > 0) {
      // Find node with lowest fScore
      let bestIndex = 0;
      let lowestF = Infinity;
      for (let i = 0; i < openSet.length; i++) {
        const f = fScore.get(keyOf(openSet[i])) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          bestIndex = i;
        }
      }

      const current = openSet.splice(bestIndex, 1)[0];
      const curKey = keyOf(current);

      if (closedSet.has(curKey)) continue;
      closedSet.add(curKey);
      visitedOrder.push(current);

      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        const path = [];
        let currKey = curKey;
        while (currKey) {
          const [cx, cy] = currKey.split(',').map(Number);
          path.unshift({ x: cx, y: cy });
          currKey = cameFrom.get(currKey);
        }
        return { visitedOrder, path, totalExplored: visitedOrder.length, found: true };
      }

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const neighbor = { x: nx, y: ny };
        const nKey = keyOf(neighbor);

        if (!isWalkable(nx, ny) || closedSet.has(nKey)) continue;

        const tentativeG = (gScore.get(curKey) ?? Infinity) + 1;

        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, curKey);
          gScore.set(nKey, tentativeG);
          fScore.set(nKey, tentativeG + manhattan(neighbor, goal));

          if (!openSet.some(p => p.x === nx && p.y === ny)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return { visitedOrder, path: [], totalExplored: visitedOrder.length, found: false };
  },

  /**
   * Computes a 2D convolution over an 8x8 input grid using a 3x3 kernel.
   * 
   * @param {{ inputGrid: number[], width: number, height: number, kernel: number[][], bias?: number }} params
   * @returns {{ outputGrid: number[], details: Array<{x: number, y: number, sum: number, clamped: number, products: number[]}> }}
   */
  computeConvolution({ inputGrid, width = 8, height = 8, kernel, bias = 0 }) {
    const outputGrid = new Array(width * height).fill(0);
    const details = [];

    const getPixel = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return 0; // Zero-padding
      return inputGrid[y * width + x] || 0;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        const products = [];

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = getPixel(x + kx, y + ky);
            const kw = kernel[ky + 1][kx + 1];
            const prod = px * kw;
            products.push(prod);
            sum += prod;
          }
        }

        sum += bias;
        // Clamp output between 0 and 1 (or 0 and 255 if grayscale)
        const clamped = Math.max(0, Math.min(1, Math.round(sum * 100) / 100));
        outputGrid[y * width + x] = clamped;

        details.push({ x, y, sum, clamped, products });
      }
    }

    return { outputGrid, details };
  },

  /**
   * Evaluates single-layer artificial neuron (Perceptron) on standard binary truth points.
   * 
   * @param {{ w1: number, w2: number, bias: number, activation?: 'step' | 'sigmoid' }} params
   * @returns {{ results: Array<{ x1: number, x2: number, z: number, output: number, targetAnd: number, targetOr: number, targetXor: number }>, accuracyAnd: number, accuracyOr: number, accuracyXor: number }}
   */
  evaluatePerceptron({ w1, w2, bias, activation = 'step' }) {
    const truthTable = [
      { x1: 0, x2: 0, targetAnd: 0, targetOr: 0, targetXor: 0 },
      { x1: 0, x2: 1, targetAnd: 0, targetOr: 1, targetXor: 1 },
      { x1: 1, x2: 0, targetAnd: 0, targetOr: 1, targetXor: 1 },
      { x1: 1, x2: 1, targetAnd: 1, targetOr: 1, targetXor: 0 }
    ];

    const results = truthTable.map(point => {
      const z = w1 * point.x1 + w2 * point.x2 + bias;
      let output = 0;

      if (activation === 'sigmoid') {
        const sig = 1 / (1 + Math.exp(-z));
        output = Math.round(sig * 100) / 100;
      } else {
        // Step function threshold at 0
        output = z >= 0 ? 1 : 0;
      }

      return {
        ...point,
        z: Math.round(z * 100) / 100,
        output
      };
    });

    const isMatch = (out, target) => (activation === 'step' ? out === target : (out >= 0.5 ? 1 : 0) === target);

    const matchAnd = results.filter(r => isMatch(r.output, r.targetAnd)).length;
    const matchOr = results.filter(r => isMatch(r.output, r.targetOr)).length;
    const matchXor = results.filter(r => isMatch(r.output, r.targetXor)).length;

    return {
      results,
      accuracyAnd: Math.round((matchAnd / 4) * 100),
      accuracyOr: Math.round((matchOr / 4) * 100),
      accuracyXor: Math.round((matchXor / 4) * 100)
    };
  },

  /**
   * Evaluates a 2-level decision tree against an animal classification dataset.
   * 
   * @param {Array<{ id: string, name: string, hasFur: boolean, canFly: boolean, legs: number, species: string }>} dataset 
   * @param {{ rootAttr: string, leftAttr: string, rightAttr: string }} splitRules
   * @returns {{ tree: any, accuracy: number, leafPurity: number }}
   */
  evaluateDecisionTree(dataset, { rootAttr = 'canFly', leftAttr = 'hasFur', rightAttr = 'legs' }) {
    if (!dataset || dataset.length === 0) {
      return { accuracy: 0, leafPurity: 0, nodes: {}, isSingleItemMode: false };
    }

    // Root Split
    const rootTrue = dataset.filter(item => testTreeAttribute(item, rootAttr));
    const rootFalse = dataset.filter(item => !testTreeAttribute(item, rootAttr));

    // Left Subtree Split (rootTrue)
    const leafLL = rootTrue.filter(item => testTreeAttribute(item, leftAttr));
    const leafLR = rootTrue.filter(item => !testTreeAttribute(item, leftAttr));

    // Right Subtree Split (rootFalse)
    const leafRL = rootFalse.filter(item => testTreeAttribute(item, rightAttr));
    const leafRR = rootFalse.filter(item => !testTreeAttribute(item, rightAttr));

    const leaves = [
      { key: 'leafLL', path: 'כן / כן', items: leafLL },
      { key: 'leafLR', path: 'כן / לא', items: leafLR },
      { key: 'leafRL', path: 'לא / כן', items: leafRL },
      { key: 'leafRR', path: 'לא / לא', items: leafRR }
    ];

    const isSingleItemMode = dataset.length <= 4;
    const totalItems = dataset.length;
    let pureItemsCount = 0;
    let isolatedAnimalsCount = 0;
    const leafDetails = {};

    leaves.forEach(({ key, path, items }) => {
      const counts = {};
      items.forEach(item => {
        counts[item.species] = (counts[item.species] || 0) + 1;
      });

      let dominantSpecies = null;
      let maxCount = 0;
      for (const [species, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantSpecies = species;
        }
      }

      const isPure = items.length > 0 && maxCount === items.length;
      if (items.length > 0) {
        pureItemsCount += maxCount;
      }
      if (items.length === 1) {
        isolatedAnimalsCount += 1;
      }

      let predictedLabel = 'ריק';
      if (items.length === 0) {
        predictedLabel = 'ריק (אין חיות בענף)';
      } else if (items.length === 1) {
        predictedLabel = items[0].name;
      } else if (isPure) {
        predictedLabel = `מחלקת ${dominantSpecies} (${items.length})`;
      } else {
        predictedLabel = 'מעורב (בלבול בין מחלקות)';
      }

      leafDetails[key] = {
        count: items.length,
        items,
        path,
        isPure,
        isSingle: items.length === 1,
        dominantSpecies,
        predictedLabel,
        purityRatio: items.length > 0 ? Math.round((maxCount / items.length) * 100) : 0
      };
    });

    const leafPurity = totalItems > 0 ? Math.round((pureItemsCount / totalItems) * 100) : 0;
    const accuracy = isSingleItemMode
      ? Math.round((isolatedAnimalsCount / totalItems) * 100)
      : leafPurity;

    return {
      rootAttr,
      leftAttr,
      rightAttr,
      isSingleItemMode,
      leafDetails,
      nodes: {
        root: { count: dataset.length },
        leftGroup: { count: rootTrue.length, items: rootTrue },
        rightGroup: { count: rootFalse.length, items: rootFalse },
        leafLL: leafDetails.leafLL,
        leafLR: leafDetails.leafLR,
        leafRL: leafDetails.leafRL,
        leafRR: leafDetails.leafRR
      },
      leafPurity,
      accuracy
    };
  }
};

