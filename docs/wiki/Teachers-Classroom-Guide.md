# Teacher's Classroom Guide: 45-Minute Lesson Plans & Pedagogical Strategy

> 🇮🇱 **גרסת המדריך למורה בעברית**: זמינה ב-[`Teachers-Classroom-Guide.he.md`](Teachers-Classroom-Guide.he.md).

---

## 1. The 45-Minute Classroom Lesson Blueprint

Each ZenLab module is engineered to fit a standard 45-minute elementary school lesson structure:

```text
+------------------------------------------------------------------------+
|                      45-MINUTE CLASSROOM WORKFLOW                      |
+-------------------+----------------------------------------------------+
| 00:00 - 10:00     | Phase 1: Spark of Wonder & Real-World Analogy      |
| 10:00 - 30:00     | Phase 2: Autonomous Hands-on Sandbox & Challenges  |
| 30:00 - 40:00     | Phase 3: Peer Debugging & Socratic Discussion      |
| 40:00 - 45:00     | Phase 4: Reflection & Star Mastery Milestone       |
+-------------------+----------------------------------------------------+
```

### Phase 1: Spark of Wonder (10 Minutes)
- **Do NOT start with abstract definitions.** Start with a relatable real-world question:
  - *Lab 1*: "How does your phone screen draw a yellow sun if it only has red, green, and blue tiny bulbs?"
  - *Lab 4*: "How does Waze know how to navigate around traffic jams in seconds without getting lost?"
  - *Lab 8*: "How does autocomplete finish your sentence before you finish typing?"
- Play the short interactive explainer tour (`TheoryView`) or the audio podcast.

### Phase 2: Autonomous Hands-on Sandbox (20 Minutes)
- Students switch to the `InteractiveView` sandbox.
- Pair programming is highly recommended: one student acts as the **Navigator** (reading challenges and observing), while the other acts as the **Driver** (manipulating the screen), swapping roles every 10 minutes.
- Students solve the 3 tiered challenges to collect stars.

### Phase 3: Peer Debugging & Socratic Discussion (10 Minutes)
- When students get stuck (e.g. the robot hits a wall in Lab 2 or the neuron fails the XOR test in Lab 7), encourage **Peer Debugging**:
  - Ask: *"What order did the robot execute? Did it have the key before testing the gate?"*
  - Ask: *"Why can't a single straight line separate diagonal points in XOR?"*
- Connect the simulation mechanics back to real-world technology.

### Phase 4: Reflection & Mastery (5 Minutes)
- Students review their star counter and developer rank on the top navigation bar.
- Conclude with a takeaway sentence summarized in their discovery worksheet.

---

## 2. Differentiation Strategies

### Scaffolding for Struggling Students
- **Audio-Visual Multimodal Support**: Encourage students with reading challenges to activate the audio narration player and listen to the concept podcast.
- **Visual Step Debugging**: In Lab 2, use the "צעד בודד" (Single Step) button to observe execution one command at a time.
- **Built-in Hints**: Each challenge card has a collapsible "💡 רמז" (Hint) button offering guidance without giving away the direct answer.

### Extension for Advanced Students
- **Open Sandbox Creativity**:
  - *Lab 1*: Encode a 64-bit multi-character sprite animation.
  - *Lab 4*: Build a complex labyrinth with dead-ends and observe the difference between BFS and $A^*$.
  - *Lab 6*: Create custom pixel patterns to test diagonal line edge responses.
  - *Lab 8*: Test high temperatures ($T=1.5$) to generate creative micro-stories.

---

## 3. Formative Assessment Rubric

| Criteria | Novice (1 Star) | Competent (2 Stars) | Master (3 Stars) |
| :--- | :--- | :--- | :--- |
| **Algorithmic Execution** | Executes preset demonstrations without understanding. | Solves challenges with teacher assistance or trial-and-error. | Formulates deliberate, bug-free sequences independently. |
| **Conceptual Reasoning** | Cannot explain the mechanism in own words. | Explains mechanism using the lesson's analogy (e.g., "hot-cold game"). | Connects the computational principle to modern technologies (e.g., Waze, FaceID). |
| **Critical Evaluation** | Assumes the computer is always right. | Notices when a model makes mistakes due to small sample sizes. | Articulates why training data bias or temperature causes errors/hallucinations. |

---

## 4. The 24-Star Master Certificate
When students earn all 24 stars across the suite, they unlock the **Master Certificate of Completion** (`CertificateModal`), which can be personalized and printed directly from the browser for classroom graduation!
