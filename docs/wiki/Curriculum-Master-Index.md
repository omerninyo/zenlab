# Curriculum Master Index: Complete 8-Lab Pedagogical Blueprint

> 🇮🇱 **גרסת אינדקס המעבדות בעברית**: זמינה ב-[`Curriculum-Master-Index.he.md`](Curriculum-Master-Index.he.md).

---

## Overview

ZenLab's curriculum comprises eight meticulously scaffolded interactive laboratory modules organized into two complementary cognitive tracks:
- **Track 1: Classical Computational Thinking & Hardware Foundations** (Labs 1–4)
- **Track 2: Perception, Machine Learning & Modern Generative AI** (Labs 5–8)

Each lab features:
1. **Interactive Principle Simulation (`Svg*Animation`)**: A visual, manipulable animation illustrating the theoretical mechanism.
2. **Interactive Sandbox (`InteractiveView`)**: A hands-on, playful computational simulator.
3. **Audio-Visual Narration & Podcast**: Multi-sensory explanation with real-world analogies.
4. **Three Tiered Challenges**: Step-by-step missions earning up to 3 stars per lab (24 total stars across the suite).

---

## Lab 1: Binary Pixels & Logic Gates (`Lab1_BinaryPixels`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *Light switches and Minecraft blocks*. Just as a giant Minecraft statue is built from individual colored blocks, an iPhone screen is built from tiny colored points of light called pixels. Inside the computer, every pixel is controlled by microscopic electrical switches that can only be ON (1) or OFF (0).
- **Core Concept**: Binary number representation (base-2 place values: 128, 64, 32, 16, 8, 4, 2, 1), 8-bit bytes, hexadecimal notation, and fundamental logic gates (AND, OR, NOT, XOR).

### 2. Interactive Principle Simulations
- **Binary Scale Simulation (`SvgBinaryAnimation`)**: An 8-bit weight scale. Flipping switches displays the cumulative sum in base-10 ("Our normal everyday number") and base-16 ("Hex code"), showing why 8 bits can count from 0 to 255.
- **Logic Gates & Half-Adder Simulation (`SvgLogicGatesAnimation`)**: Explains how two switches interact:
  - *AND ("וגם")*: Lights up only if BOTH switches are ON.
  - *OR ("או")*: Lights up if AT LEAST ONE switch is ON.
  - *NOT ("היפוך")*: Inverts the state (ON becomes OFF).
  - *XOR ("בדיוק אחד מהם")*: The half-adder circuit that produces a Sum bit and Carry bit.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: An $8 \times 8$ pixel canvas (64 bits). Students click pixels to draw icons, observing real-time binary stream updates and hex strings.
- **Challenges**:
  - *Challenge 1 (Heart Shape)*: Draw a symmetrical heart shape or use the heart preset.
  - *Challenge 2 (Smiley Face)*: Light up eyes and smile on specific rows (demonstrating row-by-row memory addressing).
  - *Challenge 3 (Initial Letter)*: Draw the first letter of their name with $\ge 14$ active bits.
- **Common Misconceptions**: Kids often assume computers store letters or photos as tiny drawings. This lab proves that images are purely arrays of numbers.

---

## Lab 2: Algorithmic Robot & CPU Cycle (`Lab2_AlgorithmicRobot`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *A chef following a recipe strictly*. A robot has no common sense; if a recipe says "crack an egg", but you didn't give it a bowl, the egg spills on the floor. A computer executes orders sequentially, exactly as written.
- **Core Concept**: Deterministic algorithmic sequences, preconditions (`if hasKey == true`), logic bugs, and the CPU instruction cycle (Fetch $\to$ Decode $\to$ Execute).

### 2. Interactive Principle Simulations
- **Robot Command Queue (`SvgRobotAnimation`)**: A step-by-step conveyor belt displaying commands. Students watch the robot step forward, collect a key (setting `hasKey = TRUE`), test the gate precondition, and unlock it.
- **CPU Pipeline Architecture (`SvgCpuPipelineAnimation`)**:
  - *Fetch ("קריאת ההוראה")*: Reading the next command from memory.
  - *Decode ("הבנת ההוראה")*: The control unit decoding the operation.
  - *Execute ("ביצוע החישוב")*: The arithmetic logic unit (ALU) adding numbers and updating the accumulator register.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: A $6 \times 6$ maze with walls, a golden key, a locked gate, and a target star. Students assemble a command queue (Forward, Turn Left, Turn Right, Pick Key, Unlock Gate).
- **Challenges**:
  - *Challenge 1 (Key Collection)*: Navigate from start to key coordinate $(2, 3)$.
  - *Challenge 2 (Gate Unlocking)*: Test preconditions—reach the gate with the key and unlock it.
  - *Challenge 3 (Winning Route)*: Assemble a full multi-step program that reaches the goal star without hitting walls.
- **Common Misconceptions**: Children often believe robots "know what we meant". This lab reinforces that robots only execute the exact code provided.

---

## Lab 3: Decision Tree Detective (`Lab3_DecisionTree`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *The game of "20 Questions" (20 מי יודע)*. To guess an animal, asking "Is it a cat?" is wasteful. Asking "Does it live in water?" cuts the search space in half instantly!
- **Core Concept**: Hierarchical branching, binary conditionals (`if-then-else`), information entropy, and group purity.

### 2. Interactive Principle Simulation (`SvgDecisionTreeAnimation`)
- An interactive tree showing how root questions ("Can it fly?", "Does it live in water?") branch downward. Students see individual animal cards travel through branch nodes until arriving at a leaf classification.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: An animal dataset (Eagle, Dolphin, Lion, Goldfish, Frog, Dog, Penguin). Students click feature filters and build decision trees, observing a real-time "Purity Meter".
- **Challenges**:
  - *Challenge 1 (First Question)*: Pick an optimal root question that splits the dataset into balanced subsets.
  - *Challenge 2 (Leaf Isolation)*: Add secondary branches to isolate specific species.
  - *Challenge 3 (Perfect 100% Tree)*: Build a full tree classifying all 8 animals with 100% purity.
- **Common Misconceptions**: Thinking AI makes decisions magically. Students see that machine decisions are structured logical paths.

---

## Lab 4: State Space Pathfinder (`Lab4_Pathfinder`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *The "Hot and Cold" game (חם-קר) vs. Wandering in the dark*. If you search a dark room blindly, you bump into every wall (Breadth-First Search). But if you have a smart compass telling you if you are getting warmer or colder, you head straight for the target (A* Search).
- **Core Concept**: Graph state spaces, obstacles, Breadth-First Search (BFS), heuristic functions, Euclidean distance, and the $A^*$ algorithm ($f(n) = g(n) + h(n)$).

### 2. Interactive Principle Simulation (`SvgPathfinderAnimation`)
- Side-by-side visualization comparing Blind Exploration (scanning radially in all directions) against Smart Compass ($A^*$, projecting a direct vector toward the goal). Explains how Waze finds optimal routes.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: An $8 \times 8$ grid maze. Students draw obstacle walls with their mouse or finger, place start and target coordinates, and trigger the search algorithm.
- **Challenges**:
  - *Challenge 1 (Draw Walls)*: Place at least 5 wall blocks creating a challenging maze.
  - *Challenge 2 (Successful Path)*: Run the pathfinder to find a valid route around the walls.
  - *Challenge 3 (Algorithm Comparison)*: Compare BFS steps vs. $A^*$ steps to observe heuristic efficiency.
- **Common Misconceptions**: Believing GPS apps test every road in the country. Students realize heuristics allow apps to compute optimal routes in milliseconds.

---

## Lab 5: Machine Learning Classifier (`Lab5_MachineLearningClassifier`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *Asking friends for recommendations*. If you move to a new neighborhood and want to know which pizza shop is best, you ask the 3 nearest neighbors.
- **Core Concept**: Supervised classification in 2D feature space (Fruit Weight vs. Fruit Size), $k$-Nearest Neighbors ($k$-NN), majority voting, training data distribution, and algorithmic bias.

### 2. Interactive Principle Simulation (`SvgClassifierAnimation`)
- A 2D feature plane showing Apple (red) and Orange (orange) data points. Students drag a test fruit and see a circle expand to encompass the $k$ nearest neighbors, with a majority vote indicator determining the predicted label.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: An interactive 2D graph. Students click to place training samples, drag a test query, and adjust the $k$ hyperparameter slider ($k=1, 3, 5, 7$).
- **Challenges**:
  - *Challenge 1 (Data Collection)*: Place at least 6 balanced training samples of each class.
  - *Challenge 2 (Tuning $k$)*: Adjust $k$ to test how odd values prevent tie votes.
  - *Challenge 3 (Bias Investigation)*: Intentionally overload the plane with 15 apples and 2 oranges, demonstrating how biased training data misclassifies valid items.
- **Common Misconceptions**: Assuming machine learning never makes mistakes. Students experience firsthand that AI is only as fair as its training dataset.

---

## Lab 6: Vision Kernel Studio (`Lab6_VisionKernels`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *A detective's magnifying glass*. A self-driving car doesn't see a "stop sign"; it scans an image through a magnifying glass that looks for sharp color changes between dark and light pixels.
- **Core Concept**: 2D image convolutions, $3 \times 3$ kernel matrices, multiply-accumulate (MAC) math, horizontal/vertical Sobel edge detection, sharpen, and blur filters.

### 2. Interactive Principle Simulation (`SvgKernelAnimation`)
- A sliding $3 \times 3$ filter matrix traversing an image grid. Students watch the filter multiply overlapping pixel values, demonstrating how adjacent color differences light up edge borders.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: An $8 \times 8$ canvas with drawing tools and preset geometric shapes. Students select filters (Vertical Edge, Horizontal Edge, Sharpen, Blur) and inspect processed matrices.
- **Challenges**:
  - *Challenge 1 (Preset Inspection)*: Load vertical lines and apply the Vertical Edge kernel.
  - *Challenge 2 (Interactive Drag)*: Move the inspection window over an edge to see the convolution calculation live.
  - *Challenge 3 (Custom Shape Detection)*: Draw a custom shape (like a box) and extract its boundary contours.
- **Common Misconceptions**: Thinking computers understand image context immediately. Students learn that vision begins with primitive edge and line extraction.

---

## Lab 7: The Artificial Neuron / Perceptron (`Lab7_Perceptron`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *Weighing advice before deciding*. If your best friend invites you to play soccer, their advice has high weight (+10). If someone you don't know suggests it, it has low weight (+1). If it's pouring rain, that has huge negative weight (-20). If the total sum passes your threshold, you decide to go!
- **Core Concept**: Mathematical neuron model ($y = \text{step}(\sum w_i x_i + b)$), synapse weights, bias threshold, linear decision boundaries, and the historic XOR limitation.

### 2. Interactive Principle Simulation (`SvgPerceptronAnimation`)
- Two input sliders ($x_1, x_2$), two weight sliders ($w_1, w_2$), and a threshold bias slider ($b$). A visual summation gauge shows whether the total activation exceeds the threshold to light up the neuron output. Includes hardware logic gate simulations (AND, OR, and the unsolvable XOR).

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: A 2D classification plane with green and red coordinate points. Students adjust weight and bias sliders to tilt and shift the linear separation line.
- **Challenges**:
  - *Challenge 1 (AND Gate)*: Train weights so the neuron fires only when both inputs are 1.
  - *Challenge 2 (OR Gate)*: Adjust bias so the neuron fires if either input is 1.
  - *Challenge 3 (The XOR Barrier)*: Attempt to separate the diagonal XOR points with a single straight line, discovering why multi-layer neural networks are required.
- **Common Misconceptions**: Believing a single neuron is a full "electronic brain". Students see that one neuron can only draw straight lines, necessitating networks of interconnected neurons.

---

## Lab 8: Language Model & Attention Predictor (`Lab8_LanguageModelPredictor`)

### 1. Conceptual Foundation & 5th-Grade Analogy
- **The Analogy**: *Smartphone autocomplete and an ice-cream temperature dial*. When typing on a phone, it guesses the next word based on books it read. If the temperature is cold (0.0), it always picks the safest, most common word. If you heat it up (1.0), it gets adventurous and creative!
- **Core Concept**: Autoregressive next-token prediction, vocabulary probability distribution, Softmax temperature scaling, and self-attention contextual associations.

### 2. Interactive Principle Simulations
- **Next-Token Probability & Temperature (`SvgLlmAnimation`)**: Shows how the temperature slider shapes the probability curve: flattening it for creative sampling or sharpening it for deterministic choices.
- **Self-Attention Connection Map (`SvgSelfAttentionAnimation`)**: An interactive sentence graph showing how the word "it" connects to "robot" or "gate" depending on context.

### 3. Hands-on Sandbox & Challenges
- **Sandbox**: Interactive sentence builder ("The robot stepped into the...", "In the secret lab we found..."). Students generate text word-by-word, inspect probability bars, and test temperatures from 0.0 to 1.5.
- **Challenges**:
  - *Challenge 1 (Cold Prediction)*: Set temperature to 0.0 and generate words to see deterministic output.
  - *Challenge 2 (Creative Warmth)*: Set temperature above 0.8 and observe surprising, diverse word suggestions.
  - *Challenge 3 (Sentence Completion)*: Chain 4 consecutive tokens to complete a coherent story sentence.
- **Common Misconceptions**: Believing chatbots are conscious beings that "know everything". Students realize LLMs are probabilistic word calculators that can generate false facts ("hallucinations") if not verified.
