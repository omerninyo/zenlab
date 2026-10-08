# RFC 002: Eight-Lab Master Suite Architecture & Component Contracts

**Status**: Approved / In Implementation  
**Author**: Code & AI Explorer Team (`team@learnai.internal`)  
**Date**: October 2026  
**Supersedes**: RFC 001 (Extensions)  

---

## 1. Context & Motivation

ZenLab is expanding from 4 foundational labs to an 8-lab master curriculum to fully cover the Israeli Ministry of Education Grade 5 CS/AI requirements and the AI4K12 3–5 framework. 

This RFC specifies:
1. The structural contracts for the 4 newly added laboratory components.
2. The deterministic algorithmic engines to be implemented in `src/services/ai.js`.
3. The data schema additions in `src/data/curriculum.json`.
4. The reorganized pedagogical sequence in `src/App.jsx`.

---

## 2. Reorganized Laboratory Matrix

To establish a coherent cognitive ladder, the laboratory sequence is defined as follows:

| Lab ID | Component Name | Title (HE) | Pedagogical Domain |
| :--- | :--- | :--- | :--- |
| `lab1` | `Lab1_BinaryPixels` | פיקסלים בינאריים | Data Representation, Bits, Bytes, Hexadecimal |
| `lab2` | `Lab2_AlgorithmicRobot` | רובוט אלגוריתמי | Sequencing, Preconditions, Logic Debugging, FIFO |
| `lab3` | `Lab3_DecisionTree` | עץ החלטות בלשי | Hierarchical Branching, Conditionals, Classification |
| `lab4` | `Lab4_Pathfinder` | מבוך החיפוש והמסלול הקצר | Graph Representation, State Space, BFS vs. A* Search |
| `lab5` | `Lab5_MachineLearningClassifier` | מסווג למידת מכונה | 2D Feature Space, k-NN Distance, Decision Boundaries |
| `lab6` | `Lab6_VisionKernels` | סטודיו פילטרים וראייה ממוחשבת | 3x3 Convolutions, Multiply-Accumulate, Edge Detection |
| `lab7` | `Lab7_Perceptron` | מתג הנוירון המלאכותי | Weights, Bias, Linear Separability, XOR Limitation |
| `lab8` | `Lab8_LanguageModelPredictor` | מודל שפה וחיזוי מילים | Tokenization, Softmax Probabilities, Temperature, Context |

*(Note: Previous Lab 3 is mapped to `lab5`, and previous Lab 4 is mapped to `lab8` for optimal pedagogical ordering).*

---

## 3. Component Contracts for New Laboratories

Each new lab component must adhere to the standardized ZenLab contract:

```typescript
interface LabProps {
  curriculum: CurriculumData;
}
```

### 3.1 Lab 3: Decision Tree Detective (`Lab3_DecisionTree.jsx`)
- **Theory View**:
  - `SvgDecisionTreeAnimation.jsx`: Interactive visual tree displaying a sample binary classification flow (e.g., Has Wings? $\to$ Yes $\to$ Can Fly? $\to$ Bird / Bat).
  - Narration & concept cards covering nested conditionals and entropy/purity.
- **Interactive View**:
  - A dataset of 8 animal cards with 3 discrete features: `hasFur` (boolean), `canFly` (boolean), `legs` (2 or 4).
  - Visual tree builder allowing students to select a splitting attribute at the root and child nodes.
  - Live purity bar showing percentage of correctly isolated species at leaf nodes.
  - Three progressive challenges:
    1. Isolate the Penguin (Can fly = No, Legs = 2).
    2. Build a tree with 100% purity separating all 4 distinct groups.
    3. Minimize tree depth while maintaining accuracy.

### 3.2 Lab 4: State Space Pathfinder (`Lab4_Pathfinder.jsx`)
- **Theory View**:
  - `SvgPathfinderAnimation.jsx`: Visual graph search showing wavefront expansion vs. heuristic targeting.
  - Narration & concept cards explaining states, obstacles, and path cost.
- **Interactive View**:
  - 8x8 grid where cells can be Start ($S$), Goal ($G$), Free space, or Obstacle wall ($W$).
  - Toggle between **Breadth-First Search (BFS)** (exhaustive circle) and **A* Search** (Manhattan heuristic guided path).
  - Step-by-step playback with visual distinction between:
    - Open Set (frontier nodes under evaluation - amber).
    - Closed Set (visited nodes - slate/blue).
    - Final Reconstructed Path (emerald pulse).
  - Metrics display: Steps explored vs. optimal path length.
  - Three progressive challenges:
    1. Clear a straight corridor.
    2. Bypass a U-shaped dead end (local minima trap).
    3. Compare BFS vs A* exploration count on a complex maze.

### 3.3 Lab 6: Vision Kernel Studio (`Lab6_VisionKernels.jsx`)
- **Theory View**:
  - `SvgKernelAnimation.jsx`: Animated $3 \times 3$ sliding window multiplying image values and producing an output pixel.
  - Concept cards explaining how convolutional neural networks (CNNs) process imagery.
- **Interactive View**:
  - Left canvas: 8x8 grayscale or binary pixel matrix (user-drawable or presets: Edge, Cross, Circle, Face).
  - Center panel: 3x3 Convolution Kernel selector & editor:
    - *Horizontal Edge Detection*: `[[-1,-1,-1],[0,0,0],[1,1,1]]`
    - *Vertical Edge Detection*: `[[-1,0,1],[-1,0,1],[-1,0,1]]`
    - *Sharpen*: `[[0,-1,0],[-1,5,-1],[0,-1,0]]`
    - *Box Blur*: `[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]]`
  - Right canvas: Resulting 8x8 Feature Map with real-time value inspector.
  - Interactive Step/Dragger: Allows dragging the 3x3 window over the input canvas to see the exact multiply-accumulate formula in an explanation card:
    $$\sum_{i=-1}^1 \sum_{j=-1}^1 I(x+i, y+j) \cdot K(i, j)$$
  - Three progressive challenges:
    1. Detect all vertical lines using the vertical Sobel/edge kernel.
    2. Soften an image using the blur kernel.
    3. Isolate corner features on a diamond shape.

### 3.4 Lab 7: The Perceptron Switch (`Lab7_Perceptron.jsx`)
- **Theory View**:
  - `SvgPerceptronAnimation.jsx`: Diagram of inputs $x_1, x_2$, incoming weight branches $w_1, w_2$, summation node $\Sigma$, bias $b$, and activation threshold.
  - Concept cards explaining the biological inspiration and mathematical formulation of artificial neurons.
- **Interactive View**:
  - Direct manipulators:
    - Weight 1 slider ($w_1 \in [-3.0, 3.0]$)
    - Weight 2 slider ($w_2 \in [-3.0, 3.0]$)
    - Bias slider ($b \in [-3.0, 3.0]$)
    - Activation function toggle (Step vs. Sigmoid)
  - 2D Truth Table Visualizer: Interactive unit square $[0,1] \times [0,1]$ showing points $(0,0), (0,1), (1,0), (1,1)$.
  - Real-time decision boundary line:
    $$w_1 x_1 + w_2 x_2 + b = 0 \implies x_2 = -\frac{w_1}{w_2} x_1 - \frac{b}{w_2}$$
  - Presets: Target Logic Gate: **AND**, **OR**, **NAND**, and the famous **XOR** trap.
  - Three progressive challenges:
    1. Tune weights to solve the logical AND gate (Accuracy 100%).
    2. Tune weights to solve the logical OR gate.
    3. The Historic XOR Challenge: Prove that no single straight line can separate XOR, demonstrating why deep multilayer networks were invented.

---

## 4. Algorithmic Engine Extensions (`src/services/ai.js`)

The following deterministic functions must be exported from `AIService`:

1. `solvePathfinder({ grid, width, height, start, goal, algorithm })`:
   - Computes deterministic path, returning `{ visitedNodes, finalPath, expandedCount, isSuccess }`.
2. `computeConvolution({ inputGrid, width, height, kernel, kernelSize })`:
   - Computes padded 2D convolution, returning `{ outputGrid, featureMap, intermediateSteps }`.
3. `evaluatePerceptron({ x1, x2, w1, w2, bias, activation })`:
   - Computes weighted sum and activated output, returning `{ sum, output, boundaryPoints }`.
4. `evaluateDecisionTree({ dataset, treeConfig })`:
   - Evaluates purity and classification accuracy across dataset samples.

---

## 5. Implementation Execution Plan

1. **Phase 1**: Add algorithmic functions to `src/services/ai.js`.
2. **Phase 2**: Add curriculum content for `lab3`, `lab4`, `lab6`, `lab7` to `src/data/curriculum.json`.
3. **Phase 3**: Implement SVG animations and Lab components in parallel.
4. **Phase 4**: Update `src/App.jsx` navigation and verify build and live rendering.
