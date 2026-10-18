import { useState, useEffect, useCallback } from 'react';
import curriculumData from '../data/curriculum.json';
import { LAB_METADATA, JOURNEY_CHAPTERS, LAB_ICONS, getLabMeta } from '../core/labMeta.js';
import { StorageEngine } from '../core/storage.js';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { AIService, testTreeAttribute } from '../services/ai.js';
import {
  ZEN_WORKSHOP_GADGETS,
  getEquippedZenGadget,
  setEquippedZenGadget
} from '../components/BespokeIllustrations.jsx';
import { fireChampagneConfetti } from '../core/confetti.js';

const DIRECTIONS = ['north', 'east', 'south', 'west'];

function computeLab1RowBytes(grid) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    const bits = grid.slice(r * 8, r * 8 + 8);
    const bitStr = bits.join('');
    const val = parseInt(bitStr, 2);
    const hex = '0x' + val.toString(16).toUpperCase().padStart(2, '0');
    rows.push({
      rowIndex: r,
      bits,
      bitStr,
      val,
      hex,
      litInRow: bits.filter(b => b === 1).length
    });
  }
  return rows;
}

function getBlueprintGridForMode(mode) {
  const presets = curriculumData.labs.lab1.presets;
  if (mode === 'heart') return presets.heart.grid;
  if (mode === 'smiley') return presets.smiley.grid;
  if (mode === 'sword') return presets.sword.grid;
  return null;
}

function resolveLab8Prompt(promptId) {
  const prompts = curriculumData.labs.lab8.prompts || [];
  if (promptId === 'robot_story') {
    return prompts.find(p => p.id === 'robotics' || p.id === 'robot_story') || prompts[0];
  }
  return prompts.find(p => p.id === promptId) || prompts[0];
}

function computeLab8Distribution(promptId, generatedTokens, temperature) {
  const activePrompt = resolveLab8Prompt(promptId);
  const stepVocabs = activePrompt?.stepVocabularies || [];
  const activeVocabulary =
    stepVocabs.length > 0
      ? stepVocabs[Math.min(generatedTokens.length, stepVocabs.length - 1)]
      : activePrompt?.vocabulary || [];
  const tokenDistribution = AIService.computeTokenProbabilities(activeVocabulary, temperature);
  return { activePrompt, activeVocabulary, tokenDistribution };
}

class ZenGameStoreClass {
  constructor() {
    const storageState = StorageEngine.getState();
    const initialViewMode = StorageEngine.getViewMode?.() || 'home';

    this.listeners = new Set();
    this._lab2Abort = false;
    this._lab4Timer = null;
    this._lab3AnimFrame = null;

    // Initial Lab 1 state
    const lab1Grid = new Array(64).fill(0);

    // Initial Lab 2 state
    const lab2Board = curriculumData.labs.lab2.defaultBoard;

    // Initial Lab 3 state
    const lab3BaseDataset = curriculumData.labs.lab3.dataset;
    const lab3Custom = StorageEngine.getCustomAnimals();
    const lab3Dataset = [...lab3BaseDataset, ...lab3Custom];
    const lab3Eval = AIService.evaluateDecisionTree(lab3Dataset, {
      rootAttr: 'legs',
      leftAttr: 'canFly',
      rightAttr: 'canFly',
      isSingleItemMode: true
    });

    // Initial Lab 4 state
    const lab4Grid = new Array(64).fill(0);
    const lab4Start = { x: 0, y: 0 };
    const lab4Goal = { x: 7, y: 7 };
    const lab4Solution = AIService.solvePathfinder({
      grid: lab4Grid,
      width: 8,
      height: 8,
      start: lab4Start,
      goal: lab4Goal,
      algorithm: 'astar'
    });

    // Initial Lab 5 state
    const lab5Points = [...curriculumData.labs.lab5.initialData];
    const lab5TestPoint = { x: 50, y: 50 };
    const lab5Classification = AIService.classifyPointKNN(lab5Points, lab5TestPoint, 3);

    // Initial Lab 6 state
    const lab6InputGrid = [...curriculumData.labs.lab6.presets.cross.grid];
    const lab6Kernel = curriculumData.labs.lab6.kernels.blur;
    const lab6Conv = AIService.computeConvolution({
      inputGrid: lab6InputGrid,
      width: 8,
      height: 8,
      kernel: lab6Kernel.matrix
    });
    const lab6Inspected = { x: 3, y: 3 };

    // Initial Lab 7 state
    const lab7Eval = AIService.evaluatePerceptron({
      w1: 0.5,
      w2: 0.5,
      bias: 0.0,
      activation: 'step'
    });

    // Initial Lab 8 state
    const lab8Init = computeLab8Distribution('robot_story', [], 0.7);

    this.state = {
      // Global 3D / 2D & Scene state
      appMode: 'game3d', // 'game3d' | 'classic2d'
      sceneMode: initialViewMode === 'lab' ? 'station' : 'overworld', // 'overworld' | 'station'
      activeLabId: storageState.activeLabId || 'lab1',
      activeSubView: 'sandbox', // 'sandbox' | 'holo_media' | 'warmup_codex' | 'laser_quiz'
      showXRay: true,
      selectedWorld: 'all', // 'all' | 'world1' | 'world2' | 'world3' | 'world4'

      // Progress & Audio state synced with StorageEngine & NarrationEngine
      completedChallenges: { ...(storageState.completedChallenges || {}) },
      labStars: { ...(storageState.labStars || {}) },
      totalStars: storageState.totalStars || 0,
      isMuted: Boolean(storageState.isMuted),
      isNarrationEnabled: Boolean(storageState.isNarrationEnabled),
      customAnimals: lab3Custom,
      narrationState: NarrationEngine.getState(),

      // Workshop & Radio state
      equippedGadget: getEquippedZenGadget(storageState.totalStars || 0),
      podcastRadio: {
        isOpen: false,
        labId: storageState.activeLabId || 'lab1',
        isPlaying: false
      },

      // Static Curriculum & Metadata references
      curriculum: curriculumData,
      LAB_METADATA,
      JOURNEY_CHAPTERS,
      LAB_ICONS,
      ZEN_WORKSHOP_GADGETS,

      // =======================================================================
      // STATION 1: Binary Pixels & Voxel Bitboard
      // =======================================================================
      lab1: {
        grid: lab1Grid,
        selectedRow: 1,
        hoveredRow: null,
        hoveredBit: null,
        blueprintMode: 'heart', // 'none' | 'heart' | 'smiley'
        blueprintGrid: getBlueprintGridForMode('heart'),
        rowBytes: computeLab1RowBytes(lab1Grid),
        litCount: 0,
        binaryString: lab1Grid.join('')
      },

      // =======================================================================
      // STATION 2: Algorithmic Robot Maze
      // =======================================================================
      lab2: {
        board: lab2Board,
        gridSize: curriculumData.labs.lab2.gridSize || 6,
        commands: [],
        robotPos: { ...lab2Board.start },
        hasKey: false,
        isGateUnlocked: false,
        status: 'idle', // 'idle' | 'running' | 'success' | 'collision' | 'error'
        statusMessage: 'בחרו פקודות ולחצו על "הפעלת הרובוט"',
        executingIndex: -1,
        isRunning: false
      },

      // =======================================================================
      // STATION 3: Decision Tree Detective
      // =======================================================================
      lab3: {
        datasetMode: 'four', // 'four' | 'eight'
        rootAttr: 'legs',
        leftAttr: 'canFly',
        rightAttr: 'canFly',
        selectedTestAnimalId: 'bat',
        slidingAnimal: null, // { animal, progress, path, isRootYes, isBranchYes, leafKey }
        activeDataset: lab3Dataset,
        attributes: curriculumData.labs.lab3.attributes,
        evaluation: lab3Eval
      },

      // =======================================================================
      // STATION 4: A* vs BFS Space Pathfinder
      // =======================================================================
      lab4: {
        grid: lab4Grid,
        start: lab4Start,
        goal: lab4Goal,
        algorithm: 'astar', // 'astar' | 'bfs'
        isPlaying: false,
        currentStepIndex: 0,
        solution: lab4Solution,
        lastAstarCount: null,
        lastBfsCount: null,
        hoveredCell: null,
        wallCount: 0
      },

      // =======================================================================
      // STATION 5: k-NN Fruit Classifier
      // =======================================================================
      lab5: {
        points: lab5Points,
        selectedClass: 'A', // 'A' | 'B'
        kValue: 3, // 1 | 3 | 5
        testPoint: lab5TestPoint,
        classification: lab5Classification,
        classes: curriculumData.labs.lab5.classes
      },

      // =======================================================================
      // STATION 6: Computer Vision 3x3 Convolution Kernels
      // =======================================================================
      lab6: {
        selectedPreset: 'cross', // 'cross' | 'verticalStripe' | 'square' | 'smiley'
        inputGrid: lab6InputGrid,
        activeKernelKey: 'blur', // 'blur' | 'sharpen' | 'verticalEdge' | 'horizontalEdge'
        currentKernel: lab6Kernel,
        inspectedCell: lab6Inspected,
        scanProgress: 0,
        convolutionResult: lab6Conv,
        inspectedDetail: lab6Conv.details.find(d => d.x === 3 && d.y === 3) || null
      },

      // =======================================================================
      // STATION 7: Artificial Neuron (Perceptron)
      // =======================================================================
      lab7: {
        selectedGate: 'AND', // 'AND' | 'OR' | 'XOR'
        w1: 0.5,
        w2: 0.5,
        bias: 0.0,
        activation: 'step', // 'step' | 'sigmoid'
        evaluation: lab7Eval,
        currentAccuracy: lab7Eval.accuracyAnd
      },

      // =======================================================================
      // STATION 8: Language Model Next-Token Predictor
      // =======================================================================
      lab8: {
        selectedPromptId: 'robot_story',
        temperature: 0.7,
        generatedTokens: [],
        activePrompt: lab8Init.activePrompt,
        activeVocabulary: lab8Init.activeVocabulary,
        tokenDistribution: lab8Init.tokenDistribution
      }
    };

    this._bindActions();
    this._setupSubscriptions();
  }

  _setupSubscriptions() {
    if (typeof window === 'undefined') return;

    StorageEngine.subscribe(s => {
      const nextSceneMode = s.viewMode === 'lab' ? 'station' : 'overworld';
      this.state = {
        ...this.state,
        completedChallenges: { ...(s.completedChallenges || {}) },
        labStars: { ...(s.labStars || {}) },
        totalStars: s.totalStars || 0,
        isMuted: Boolean(s.isMuted),
        isNarrationEnabled: Boolean(s.isNarrationEnabled),
        activeLabId: s.activeLabId || this.state.activeLabId,
        sceneMode: nextSceneMode,
        customAnimals: StorageEngine.getCustomAnimals(),
        equippedGadget: getEquippedZenGadget(s.totalStars || 0)
      };
      this.notify();
    });

    NarrationEngine.subscribe(nState => {
      this.state = {
        ...this.state,
        narrationState: nState
      };
      this.notify();
    });

    window.addEventListener('zen-gadget-change', e => {
      if (e.detail?.gadgetId) {
        this.state = {
          ...this.state,
          equippedGadget: e.detail.gadgetId
        };
        this.notify();
      }
    });
  }

  _rewardChallenge(labId, challengeId, stars = 1) {
    if (StorageEngine.isChallengeCompleted(challengeId)) return false;
    const res = StorageEngine.completeChallenge(labId, challengeId, stars);
    if (res.isNew) {
      AudioEngine.playSuccess();
      fireChampagneConfetti();
      return true;
    }
    return false;
  }

  _bindActions() {
    // =========================================================================
    // GLOBAL NAVIGATION & HUD ACTIONS
    // =========================================================================
    this.setAppMode = (mode) => {
      const valid = mode === 'classic2d' ? 'classic2d' : 'game3d';
      this.state = { ...this.state, appMode: valid };
      AudioEngine.playStep();
      this.notify();
    };

    this.setSceneMode = (mode) => {
      const next = mode === 'station' ? 'station' : 'overworld';
      this.state = {
        ...this.state,
        sceneMode: next,
        activeSubView: next === 'overworld' ? 'sandbox' : this.state.activeSubView
      };
      StorageEngine.setViewMode(next === 'station' ? 'lab' : 'home');
      AudioEngine.playStep();
      this.notify();
    };

    this.setActiveLabId = (labId) => {
      if (!LAB_METADATA[labId]) return;
      this.state = {
        ...this.state,
        activeLabId: labId,
        activeSubView: 'sandbox'
      };
      StorageEngine.setActiveLab(labId);
      AudioEngine.playStep();
      this.notify();
    };

    this.enterStation = (labId, subView = 'sandbox') => {
      const targetLab = LAB_METADATA[labId] ? labId : this.state.activeLabId;
      this.state = {
        ...this.state,
        activeLabId: targetLab,
        sceneMode: 'station',
        activeSubView: subView
      };
      StorageEngine.setActiveLab(targetLab);
      StorageEngine.setViewMode('lab');
      AudioEngine.playStep();
      this.notify();
    };

    this.returnToOverworld = () => {
      this.state = {
        ...this.state,
        sceneMode: 'overworld',
        activeSubView: 'sandbox'
      };
      StorageEngine.setViewMode('home');
      AudioEngine.playStep();
      this.notify();
    };

    this.setActiveSubView = (subView) => {
      const validViews = ['sandbox', 'holo_media', 'warmup_codex', 'laser_quiz'];
      const next = validViews.includes(subView) ? subView : 'sandbox';
      this.state = { ...this.state, activeSubView: next };
      AudioEngine.playStep();
      this.notify();
    };

    this.setShowXRay = (show) => {
      const next = typeof show === 'boolean' ? show : !this.state.showXRay;
      this.state = { ...this.state, showXRay: next };
      AudioEngine.playStep();
      this.notify();
    };

    this.toggleXRay = () => {
      this.setShowXRay(!this.state.showXRay);
    };

    this.setSelectedWorld = (worldId) => {
      this.state = { ...this.state, selectedWorld: worldId || 'all' };
      AudioEngine.playStep();
      this.notify();
    };

    this.equipGadget = (gadgetId) => {
      setEquippedZenGadget(gadgetId);
      this.state = { ...this.state, equippedGadget: gadgetId };
      AudioEngine.playCollect();
      this.notify();
    };

    this.toggleMute = () => {
      const nextMuted = !this.state.isMuted;
      StorageEngine.setMuted(nextMuted);
    };

    this.setPodcastRadio = (patch) => {
      this.state = {
        ...this.state,
        podcastRadio: {
          ...this.state.podcastRadio,
          ...(typeof patch === 'function' ? patch(this.state.podcastRadio) : patch)
        }
      };
      this.notify();
    };

    this.togglePodcastRadio = (labId) => {
      const current = this.state.podcastRadio;
      const nextOpen = !current.isOpen;
      this.state = {
        ...this.state,
        podcastRadio: {
          ...current,
          isOpen: nextOpen,
          labId: labId || this.state.activeLabId || current.labId
        }
      };
      AudioEngine.playStep();
      this.notify();
    };

    // =========================================================================
    // LAB 1 ACTIONS: Binary Pixels & Voxels
    // =========================================================================
    const updateLab1Grid = (nextGrid, playSoundVal = null) => {
      const rowBytes = computeLab1RowBytes(nextGrid);
      const litCount = nextGrid.filter(b => b === 1).length;
      const binaryString = nextGrid.join('');

      this.state = {
        ...this.state,
        lab1: {
          ...this.state.lab1,
          grid: nextGrid,
          rowBytes,
          litCount,
          binaryString
        }
      };

      if (playSoundVal !== null) {
        AudioEngine.playToggle(playSoundVal === 1);
      }

      // Challenge checks
      const presets = curriculumData.labs.lab1.presets;
      const isHeart = presets.heart.grid.every((v, i) => v === nextGrid[i]);
      if (isHeart) {
        this._rewardChallenge('lab1', 'lab1_challenge1', 1);
      }
      const isSmiley = presets.smiley.grid.every((v, i) => v === nextGrid[i]);
      if (isSmiley) {
        this._rewardChallenge('lab1', 'lab1_challenge2', 1);
      }
      if (litCount >= 14 && litCount < 58) {
        this._rewardChallenge('lab1', 'lab1_challenge3', 1);
      }

      this.notify();
    };

    const lab1Actions = {
      toggleBit: (idx) => {
        if (idx < 0 || idx >= 64) return;
        const nextGrid = [...this.state.lab1.grid];
        const nextVal = nextGrid[idx] === 1 ? 0 : 1;
        nextGrid[idx] = nextVal;
        updateLab1Grid(nextGrid, nextVal);
      },
      setBit: (idx, val) => {
        if (idx < 0 || idx >= 64) return;
        const target = val ? 1 : 0;
        if (this.state.lab1.grid[idx] === target) return;
        const nextGrid = [...this.state.lab1.grid];
        nextGrid[idx] = target;
        updateLab1Grid(nextGrid, target);
      },
      clearGrid: () => {
        updateLab1Grid(new Array(64).fill(0), null);
        AudioEngine.playStep();
      },
      invertGrid: () => {
        const nextGrid = this.state.lab1.grid.map(b => (b === 1 ? 0 : 1));
        updateLab1Grid(nextGrid, null);
        AudioEngine.playStep();
      },
      setSelectedRow: (rowIdx) => {
        const clamped = Math.max(0, Math.min(7, Number(rowIdx) || 0));
        this.state = {
          ...this.state,
          lab1: { ...this.state.lab1, selectedRow: clamped }
        };
        this.notify();
      },
      setHoveredRow: (rowIdx) => {
        this.state = {
          ...this.state,
          lab1: { ...this.state.lab1, hoveredRow: rowIdx }
        };
        this.notify();
      },
      setHoveredBit: (bitIdx) => {
        this.state = {
          ...this.state,
          lab1: { ...this.state.lab1, hoveredBit: bitIdx }
        };
        this.notify();
      },
      setBlueprintMode: (mode) => {
        const valid = ['none', 'heart', 'smiley'].includes(mode) ? mode : 'none';
        this.state = {
          ...this.state,
          lab1: {
            ...this.state.lab1,
            blueprintMode: valid,
            blueprintGrid: getBlueprintGridForMode(valid)
          }
        };
        AudioEngine.playStep();
        this.notify();
      },
      loadPresetForTest: (presetKey) => {
        const preset = curriculumData.labs.lab1.presets[presetKey];
        if (preset?.grid) {
          updateLab1Grid([...preset.grid], null);
        }
      }
    };
    this.lab1Actions = lab1Actions;
    this.loadPresetForTest = lab1Actions.loadPresetForTest;

    // =========================================================================
    // LAB 2 ACTIONS: Algorithmic Robot
    // =========================================================================
    const board2 = curriculumData.labs.lab2.defaultBoard;
    const gridSize2 = curriculumData.labs.lab2.gridSize || 6;
    const isWall2 = (x, y) => board2.walls.some(w => w.x === x && w.y === y);

    const lab2Actions = {
      addCommand: (cmdType) => {
        if (this.state.lab2.isRunning) return;
        const normalized =
          cmdType === 'LEFT'
            ? 'TURN_LEFT'
            : cmdType === 'RIGHT'
            ? 'TURN_RIGHT'
            : cmdType;
        this.state = {
          ...this.state,
          lab2: {
            ...this.state.lab2,
            commands: [...this.state.lab2.commands, normalized]
          }
        };
        AudioEngine.playStep();
        this.notify();
      },
      removeCommand: (index) => {
        if (this.state.lab2.isRunning) return;
        this.state = {
          ...this.state,
          lab2: {
            ...this.state.lab2,
            commands: this.state.lab2.commands.filter((_, i) => i !== index)
          }
        };
        AudioEngine.playStep();
        this.notify();
      },
      clearCommands: () => {
        if (this.state.lab2.isRunning) return;
        this._lab2Abort = true;
        this.state = {
          ...this.state,
          lab2: {
            ...this.state.lab2,
            commands: [],
            isRunning: false,
            executingIndex: -1,
            robotPos: { ...board2.start },
            hasKey: false,
            isGateUnlocked: false,
            status: 'idle',
            statusMessage: 'תור הפקודות נוקה. מוכן לתכנות חדש!'
          }
        };
        AudioEngine.playStep();
        this.notify();
      },
      resetSimulation: () => {
        this._lab2Abort = true;
        this.state = {
          ...this.state,
          lab2: {
            ...this.state.lab2,
            isRunning: false,
            executingIndex: -1,
            robotPos: { ...board2.start },
            hasKey: false,
            isGateUnlocked: false,
            status: 'idle',
            statusMessage: 'הרובוט חזר לנקודת ההתחלה. מוכן להרצה!'
          }
        };
        AudioEngine.playStep();
        this.notify();
      },
      runAlgorithm: async () => {
        const cmds = this.state.lab2.commands;
        if (cmds.length === 0 || this.state.lab2.isRunning) return;

        this._lab2Abort = false;
        let currentPos = { ...board2.start };
        let currentKey = false;
        let currentGateUnlocked = false;

        this.state = {
          ...this.state,
          lab2: {
            ...this.state.lab2,
            isRunning: true,
            executingIndex: -1,
            robotPos: currentPos,
            hasKey: false,
            isGateUnlocked: false,
            status: 'running',
            statusMessage: 'הרובוט מבצע את האלגוריתם צעד אחר צעד...'
          }
        };
        this.notify();

        for (let i = 0; i < cmds.length; i++) {
          if (this._lab2Abort) return;

          this.state = {
            ...this.state,
            lab2: { ...this.state.lab2, executingIndex: i }
          };
          this.notify();

          await new Promise(r => setTimeout(r, 420));
          if (this._lab2Abort) return;

          const cmd = cmds[i];

          if (cmd === 'FORWARD') {
            let nextX = currentPos.x;
            let nextY = currentPos.y;
            if (currentPos.dir === 'north') nextY -= 1;
            else if (currentPos.dir === 'south') nextY += 1;
            else if (currentPos.dir === 'east') nextX += 1;
            else if (currentPos.dir === 'west') nextX -= 1;

            if (nextX < 0 || nextX >= gridSize2 || nextY < 0 || nextY >= gridSize2) {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  status: 'collision',
                  statusMessage: `זהירות! הרובוט ניסה לצאת מגבולות הלוח בפקודה #${i + 1}`,
                  isRunning: false
                }
              };
              AudioEngine.playError();
              this.notify();
              return;
            }

            if (isWall2(nextX, nextY)) {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  status: 'collision',
                  statusMessage: `אופס! הרובוט נתקע בקיר בפקודה #${i + 1}`,
                  isRunning: false
                }
              };
              AudioEngine.playError();
              this.notify();
              return;
            }

            if (nextX === board2.gate.x && nextY === board2.gate.y && !currentGateUnlocked) {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  status: 'error',
                  statusMessage: 'השער נעול! צריך קודם לאסוף מפתח ולפתוח אותו',
                  isRunning: false
                }
              };
              AudioEngine.playError();
              this.notify();
              return;
            }

            currentPos = { ...currentPos, x: nextX, y: nextY };
            this.state = {
              ...this.state,
              lab2: { ...this.state.lab2, robotPos: currentPos }
            };
            AudioEngine.playStep();
            this.notify();
          } else if (cmd === 'TURN_LEFT') {
            const curDirIdx = DIRECTIONS.indexOf(currentPos.dir);
            currentPos = { ...currentPos, dir: DIRECTIONS[(curDirIdx + 3) % 4] };
            this.state = {
              ...this.state,
              lab2: { ...this.state.lab2, robotPos: currentPos }
            };
            AudioEngine.playTone(360, 'sine', 0.05);
            this.notify();
          } else if (cmd === 'TURN_RIGHT') {
            const curDirIdx = DIRECTIONS.indexOf(currentPos.dir);
            currentPos = { ...currentPos, dir: DIRECTIONS[(curDirIdx + 1) % 4] };
            this.state = {
              ...this.state,
              lab2: { ...this.state.lab2, robotPos: currentPos }
            };
            AudioEngine.playTone(420, 'sine', 0.05);
            this.notify();
          } else if (cmd === 'PICK_KEY') {
            if (currentPos.x === board2.key.x && currentPos.y === board2.key.y) {
              currentKey = true;
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  hasKey: true,
                  statusMessage: 'יש! אספתם את המפתח המוזהב 🔑'
                }
              };
              AudioEngine.playCollect();
              this._rewardChallenge('lab2', 'lab2_challenge1', 1);
              this.notify();
            } else {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  statusMessage: 'אין מפתח במשבצת הזו!'
                }
              };
              AudioEngine.playTone(200, 'sawtooth', 0.1);
              this.notify();
            }
          } else if (cmd === 'UNLOCK_GATE') {
            const isNearGate =
              Math.abs(currentPos.x - board2.gate.x) + Math.abs(currentPos.y - board2.gate.y) <= 1;
            if (!currentKey) {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  status: 'error',
                  statusMessage: 'לא ניתן לפתוח את השער בלי מפתח!',
                  isRunning: false
                }
              };
              AudioEngine.playError();
              this.notify();
              return;
            }
            if (isNearGate) {
              currentGateUnlocked = true;
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  isGateUnlocked: true,
                  statusMessage: 'כל הכבוד! השער נפתח בהצלחה 🔓'
                }
              };
              AudioEngine.playUnlock();
              this._rewardChallenge('lab2', 'lab2_challenge2', 1);
              this.notify();
            } else {
              this.state = {
                ...this.state,
                lab2: {
                  ...this.state.lab2,
                  statusMessage: 'הרובוט צריך לעמוד ליד השער כדי לפתוח אותו.'
                }
              };
              AudioEngine.playTone(200, 'sawtooth', 0.1);
              this.notify();
            }
          }
        }

        if (currentPos.x === board2.goal.x && currentPos.y === board2.goal.y) {
          this.state = {
            ...this.state,
            lab2: {
              ...this.state.lab2,
              executingIndex: -1,
              isRunning: false,
              status: 'success',
              statusMessage: 'אלופים! הרובוט הגיע למשבצת היעד בהצלחה! 🏆'
            }
          };
          AudioEngine.playSuccess();
          fireChampagneConfetti();
          this._rewardChallenge('lab2', 'lab2_challenge3', 1);
        } else {
          this.state = {
            ...this.state,
            lab2: {
              ...this.state.lab2,
              executingIndex: -1,
              isRunning: false,
              status: 'idle',
              statusMessage: 'הפקודות הסתיימו, אך הרובוט עדיין לא הגיע ליעד.'
            }
          };
        }
        this.notify();
      },
      stepAlgorithm: () => {
        const l2 = this.state.lab2;
        if (l2.commands.length === 0 || l2.isRunning) return;

        const nextIdx = l2.executingIndex + 1;
        if (nextIdx >= l2.commands.length) {
          lab2Actions.resetSimulation();
          return;
        }

        const cmd = l2.commands[nextIdx];
        let currentPos = { ...l2.robotPos };
        let currentKey = l2.hasKey;
        let currentGateUnlocked = l2.isGateUnlocked;
        let nextStatus = 'idle';
        let nextMsg = `צעד #${nextIdx + 1}: ${cmd}`;

        if (cmd === 'FORWARD') {
          let nextX = currentPos.x;
          let nextY = currentPos.y;
          if (currentPos.dir === 'north') nextY -= 1;
          else if (currentPos.dir === 'south') nextY += 1;
          else if (currentPos.dir === 'east') nextX += 1;
          else if (currentPos.dir === 'west') nextX -= 1;

          if (nextX < 0 || nextX >= gridSize2 || nextY < 0 || nextY >= gridSize2) {
            this.state = {
              ...this.state,
              lab2: {
                ...l2,
                executingIndex: nextIdx,
                status: 'collision',
                statusMessage: `זהירות! ניסיון לצאת מהלוח בפקודה #${nextIdx + 1}`
              }
            };
            AudioEngine.playError();
            this.notify();
            return;
          }
          if (isWall2(nextX, nextY)) {
            this.state = {
              ...this.state,
              lab2: {
                ...l2,
                executingIndex: nextIdx,
                status: 'collision',
                statusMessage: `הרובוט נתקע בקיר בפקודה #${nextIdx + 1}`
              }
            };
            AudioEngine.playError();
            this.notify();
            return;
          }
          if (nextX === board2.gate.x && nextY === board2.gate.y && !currentGateUnlocked) {
            this.state = {
              ...this.state,
              lab2: {
                ...l2,
                executingIndex: nextIdx,
                status: 'error',
                statusMessage: 'השער נעול! אספו מפתח ופתחו אותו תחילה'
              }
            };
            AudioEngine.playError();
            this.notify();
            return;
          }
          currentPos = { ...currentPos, x: nextX, y: nextY };
          AudioEngine.playStep();
          nextMsg = `צעד #${nextIdx + 1}: התקדמות אל (${nextX},${nextY})`;
        } else if (cmd === 'TURN_LEFT') {
          const curDirIdx = DIRECTIONS.indexOf(currentPos.dir);
          currentPos = { ...currentPos, dir: DIRECTIONS[(curDirIdx + 3) % 4] };
          AudioEngine.playTone(360, 'sine', 0.05);
          nextMsg = `צעד #${nextIdx + 1}: פנייה שמאלה`;
        } else if (cmd === 'TURN_RIGHT') {
          const curDirIdx = DIRECTIONS.indexOf(currentPos.dir);
          currentPos = { ...currentPos, dir: DIRECTIONS[(curDirIdx + 1) % 4] };
          AudioEngine.playTone(420, 'sine', 0.05);
          nextMsg = `צעד #${nextIdx + 1}: פנייה ימינה`;
        } else if (cmd === 'PICK_KEY') {
          if (currentPos.x === board2.key.x && currentPos.y === board2.key.y) {
            currentKey = true;
            AudioEngine.playCollect();
            nextMsg = 'אספתם את המפתח המוזהב! 🔑';
            this._rewardChallenge('lab2', 'lab2_challenge1', 1);
          } else {
            nextMsg = 'אין מפתח במשבצת הנוכחית.';
            AudioEngine.playTone(200, 'sawtooth', 0.1);
          }
        } else if (cmd === 'UNLOCK_GATE') {
          const isNearGate =
            Math.abs(currentPos.x - board2.gate.x) + Math.abs(currentPos.y - board2.gate.y) <= 1;
          if (currentKey && isNearGate) {
            currentGateUnlocked = true;
            AudioEngine.playUnlock();
            nextMsg = 'השער נפתח בהצלחה! 🔓';
            this._rewardChallenge('lab2', 'lab2_challenge2', 1);
          } else {
            nextMsg = !currentKey ? 'חסר מפתח לפתיחת השער!' : 'עמדו ליד השער כדי לפתוח אותו.';
            AudioEngine.playError();
          }
        }

        if (currentPos.x === board2.goal.x && currentPos.y === board2.goal.y) {
          nextStatus = 'success';
          nextMsg = 'אלופים! הרובוט הגיע למשבצת היעד! 🏆';
          AudioEngine.playSuccess();
          fireChampagneConfetti();
          this._rewardChallenge('lab2', 'lab2_challenge3', 1);
        }

        this.state = {
          ...this.state,
          lab2: {
            ...l2,
            executingIndex: nextIdx,
            robotPos: currentPos,
            hasKey: currentKey,
            isGateUnlocked: currentGateUnlocked,
            status: nextStatus,
            statusMessage: nextMsg
          }
        };
        this.notify();
      }
    };
    this.lab2Actions = lab2Actions;

    // =========================================================================
    // LAB 3 ACTIONS: Decision Tree Detective
    // =========================================================================
    const recomputeLab3 = (patch) => {
      const nextLab3 = { ...this.state.lab3, ...patch };
      const base =
        nextLab3.datasetMode === 'eight' && curriculumData.labs.lab3.extendedDataset
          ? [...curriculumData.labs.lab3.dataset, ...curriculumData.labs.lab3.extendedDataset]
          : [...curriculumData.labs.lab3.dataset];
      const activeDataset = [...base, ...(this.state.customAnimals || [])];
      const evaluation = AIService.evaluateDecisionTree(activeDataset, {
        rootAttr: nextLab3.rootAttr,
        leftAttr: nextLab3.leftAttr,
        rightAttr: nextLab3.rightAttr,
        isSingleItemMode: nextLab3.datasetMode === 'four'
      });

      this.state = {
        ...this.state,
        lab3: {
          ...nextLab3,
          activeDataset,
          evaluation
        }
      };

      // Challenge checks
      if (nextLab3.rootAttr === 'canFly') {
        this._rewardChallenge('lab3', 'lab3_challenge1', 1);
      }
      if (evaluation.accuracy >= 75) {
        this._rewardChallenge('lab3', 'lab3_challenge2', 1);
      }
      if (evaluation.accuracy === 100) {
        this._rewardChallenge('lab3', 'lab3_challenge3', 1);
      }

      this.notify();
    };

    const lab3Actions = {
      setRootAttr: (attr) => {
        AudioEngine.playStep();
        recomputeLab3({ rootAttr: attr });
      },
      setLeftAttr: (attr) => {
        AudioEngine.playStep();
        recomputeLab3({ leftAttr: attr });
      },
      setRightAttr: (attr) => {
        AudioEngine.playStep();
        recomputeLab3({ rightAttr: attr });
      },
      setDatasetMode: (mode) => {
        const valid = mode === 'eight' ? 'eight' : 'four';
        AudioEngine.playStep();
        recomputeLab3({ datasetMode: valid });
      },
      setSelectedTestAnimalId: (animalId) => {
        AudioEngine.playStep();
        recomputeLab3({ selectedTestAnimalId: animalId });
      },
      launchAnimalCapsule: (animalId) => {
        const targetId = animalId || this.state.lab3.selectedTestAnimalId || 'bat';
        const l3 = this.state.lab3;
        const animal = l3.activeDataset.find(a => a.id === targetId) || l3.activeDataset[0];
        if (!animal) return;

        const isRootYes = testTreeAttribute(animal, l3.rootAttr);
        const branchAttr = isRootYes ? l3.leftAttr : l3.rightAttr;
        const isBranchYes = testTreeAttribute(animal, branchAttr);
        const leafKey = isRootYes
          ? isBranchYes
            ? 'leafLL'
            : 'leafLR'
          : isBranchYes
          ? 'leafRL'
          : 'leafRR';

        const path = [
          'root',
          isRootYes ? 'leftGroup' : 'rightGroup',
          leafKey
        ];

        if (this._lab3AnimFrame) {
          cancelAnimationFrame(this._lab3AnimFrame);
        }

        AudioEngine.playCollect();
        const startTime = performance.now();
        const duration = 1200;

        const stepAnim = (now) => {
          const progress = Math.min(1, (now - startTime) / duration);
          this.state = {
            ...this.state,
            lab3: {
              ...this.state.lab3,
              selectedTestAnimalId: animal.id,
              slidingAnimal: {
                animal,
                progress,
                path,
                isRootYes,
                isBranchYes,
                leafKey
              }
            }
          };
          this.notify();

          if (progress < 1) {
            this._lab3AnimFrame = requestAnimationFrame(stepAnim);
          } else {
            this._lab3AnimFrame = null;
          }
        };

        this._lab3AnimFrame = requestAnimationFrame(stepAnim);
      },
      resetTree: () => {
        if (this._lab3AnimFrame) {
          cancelAnimationFrame(this._lab3AnimFrame);
          this._lab3AnimFrame = null;
        }
        AudioEngine.playStep();
        recomputeLab3({
          rootAttr: 'legs',
          leftAttr: 'canFly',
          rightAttr: 'canFly',
          slidingAnimal: null
        });
      }
    };
    this.lab3Actions = lab3Actions;

    // =========================================================================
    // LAB 4 ACTIONS: Pathfinder (A* vs BFS)
    // =========================================================================
    const checkLab4Challenges = () => {
      const l4 = this.state.lab4;
      const isActiveOrDone = l4.currentStepIndex > 0;
      if (l4.solution.found && l4.algorithm === 'astar' && isActiveOrDone) {
        this._rewardChallenge('lab4', 'lab4_challenge1', 1);
      }
      if (l4.solution.found && l4.wallCount >= 4 && isActiveOrDone) {
        this._rewardChallenge('lab4', 'lab4_challenge2', 1);
      }
      if (
        l4.lastAstarCount !== null &&
        l4.lastBfsCount !== null &&
        l4.lastAstarCount < l4.lastBfsCount
      ) {
        this._rewardChallenge('lab4', 'lab4_challenge3', 1);
      }
    };

    const recomputeLab4 = (patch) => {
      const nextLab4 = { ...this.state.lab4, ...patch };
      const solution = AIService.solvePathfinder({
        grid: nextLab4.grid,
        width: 8,
        height: 8,
        start: nextLab4.start,
        goal: nextLab4.goal,
        algorithm: nextLab4.algorithm
      });
      const wallCount = nextLab4.grid.filter(c => c === 1).length;

      this.state = {
        ...this.state,
        lab4: {
          ...nextLab4,
          solution,
          wallCount
        }
      };
      this.notify();
    };

    const lab4Actions = {
      toggleWall: (x, y, forceVal = null) => {
        const l4 = this.state.lab4;
        if ((x === l4.start.x && y === l4.start.y) || (x === l4.goal.x && y === l4.goal.y)) return;
        const idx = y * 8 + x;
        if (idx < 0 || idx >= 64) return;
        const nextGrid = [...l4.grid];
        const target = forceVal !== null ? (forceVal ? 1 : 0) : nextGrid[idx] === 1 ? 0 : 1;
        if (nextGrid[idx] === target) return;
        nextGrid[idx] = target;
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }
        AudioEngine.playToggle(target === 1);
        recomputeLab4({
          grid: nextGrid,
          isPlaying: false,
          currentStepIndex: 0
        });
      },
      setAlgorithm: (algo) => {
        const valid = algo === 'bfs' ? 'bfs' : 'astar';
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }
        AudioEngine.playStep();
        recomputeLab4({
          algorithm: valid,
          isPlaying: false,
          currentStepIndex: 0
        });
      },
      runSearch: () => {
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }

        const l4 = this.state.lab4;
        const totalSteps = l4.solution.visitedOrder.length;
        const nextAstarCount =
          l4.solution.found && l4.algorithm === 'astar' ? l4.solution.totalExplored : l4.lastAstarCount;
        const nextBfsCount =
          l4.solution.found && l4.algorithm === 'bfs' ? l4.solution.totalExplored : l4.lastBfsCount;

        this.state = {
          ...this.state,
          lab4: {
            ...l4,
            isPlaying: true,
            currentStepIndex: 1,
            lastAstarCount: nextAstarCount,
            lastBfsCount: nextBfsCount
          }
        };
        AudioEngine.playStep();
        checkLab4Challenges();
        this.notify();

        this._lab4Timer = setInterval(() => {
          const cur = this.state.lab4;
          if (cur.currentStepIndex < totalSteps) {
            this.state = {
              ...this.state,
              lab4: {
                ...cur,
                currentStepIndex: cur.currentStepIndex + 1
              }
            };
            AudioEngine.playStep();
            checkLab4Challenges();
            this.notify();
          } else {
            clearInterval(this._lab4Timer);
            this._lab4Timer = null;
            this.state = {
              ...this.state,
              lab4: {
                ...cur,
                isPlaying: false
              }
            };
            if (cur.solution.found) {
              AudioEngine.playChallengeSuccess();
            }
            checkLab4Challenges();
            this.notify();
          }
        }, 65);
      },
      pauseSearch: () => {
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }
        this.state = {
          ...this.state,
          lab4: { ...this.state.lab4, isPlaying: false }
        };
        AudioEngine.playStep();
        this.notify();
      },
      resetGrid: () => {
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }
        AudioEngine.playStep();
        recomputeLab4({
          grid: new Array(64).fill(0),
          isPlaying: false,
          currentStepIndex: 0
        });
      },
      loadPresetMaze: () => {
        if (this._lab4Timer) {
          clearInterval(this._lab4Timer);
          this._lab4Timer = null;
        }
        const next = new Array(64).fill(0);
        for (let r = 1; r < 7; r++) {
          next[r * 8 + 3] = 1;
        }
        AudioEngine.playCollect();
        recomputeLab4({
          grid: next,
          isPlaying: false,
          currentStepIndex: 0
        });
      },
      setHoveredCell: (cell) => {
        this.state = {
          ...this.state,
          lab4: { ...this.state.lab4, hoveredCell: cell }
        };
        this.notify();
      }
    };
    this.lab4Actions = lab4Actions;

    // =========================================================================
    // LAB 5 ACTIONS: k-NN Classifier
    // =========================================================================
    const recomputeLab5 = (patch) => {
      const nextLab5 = { ...this.state.lab5, ...patch };
      const classification = AIService.classifyPointKNN(
        nextLab5.points,
        nextLab5.testPoint,
        nextLab5.kValue
      );

      this.state = {
        ...this.state,
        lab5: {
          ...nextLab5,
          classification
        }
      };

      // Challenge checks
      if (nextLab5.points.length >= 10) {
        this._rewardChallenge('lab5', 'lab5_challenge1', 1);
      }
      if (nextLab5.testPoint.x !== 50 || nextLab5.testPoint.y !== 50) {
        this._rewardChallenge('lab5', 'lab5_challenge2', 1);
      }
      if (nextLab5.kValue === 5) {
        this._rewardChallenge('lab5', 'lab5_challenge3', 1);
      }

      this.notify();
    };

    const lab5Actions = {
      addPoint: (x, y, cls) => {
        const label = cls || this.state.lab5.selectedClass || 'A';
        const boundedX = Math.max(5, Math.min(95, Math.round(Number(x) || 50)));
        const boundedY = Math.max(5, Math.min(95, Math.round(Number(y) || 50)));
        const newPoint = {
          id: Date.now() + Math.random(),
          x: boundedX,
          y: boundedY,
          label
        };
        AudioEngine.playToggle(true);
        recomputeLab5({
          points: [...this.state.lab5.points, newPoint]
        });
      },
      moveTestPoint: (x, y) => {
        const pointObj = typeof x === 'object' && x !== null ? x : { x, y };
        const boundedX = Math.max(5, Math.min(95, Math.round(Number(pointObj.x) || 50)));
        const boundedY = Math.max(5, Math.min(95, Math.round(Number(pointObj.y) || 50)));
        recomputeLab5({
          testPoint: { x: boundedX, y: boundedY }
        });
      },
      randomizeTestPoint: () => {
        const rx = Math.floor(15 + Math.random() * 70);
        const ry = Math.floor(15 + Math.random() * 70);
        AudioEngine.playCollect();
        recomputeLab5({
          testPoint: { x: rx, y: ry }
        });
      },
      setKValue: (k) => {
        const validK = [1, 3, 5].includes(Number(k)) ? Number(k) : 3;
        AudioEngine.playStep();
        recomputeLab5({ kValue: validK });
      },
      setSelectedClass: (cls) => {
        const validCls = cls === 'B' ? 'B' : 'A';
        AudioEngine.playStep();
        recomputeLab5({ selectedClass: validCls });
      },
      resetPoints: () => {
        AudioEngine.playStep();
        recomputeLab5({
          points: [...curriculumData.labs.lab5.initialData],
          testPoint: { x: 50, y: 50 },
          kValue: 3
        });
      }
    };
    this.lab5Actions = lab5Actions;

    // =========================================================================
    // LAB 6 ACTIONS: Vision Kernels (3x3 Convolution)
    // =========================================================================
    const getLab6PresetGrid = (key) => {
      if (curriculumData.labs.lab6.presets[key]?.grid) {
        return [...curriculumData.labs.lab6.presets[key].grid];
      }
      if (key === 'smiley' && curriculumData.labs.lab1.presets.smiley?.grid) {
        return [...curriculumData.labs.lab1.presets.smiley.grid];
      }
      return [...curriculumData.labs.lab6.presets.cross.grid];
    };

    const recomputeLab6 = (patch, isUserInspect = false) => {
      const nextLab6 = { ...this.state.lab6, ...patch };
      const currentKernel =
        curriculumData.labs.lab6.kernels[nextLab6.activeKernelKey] ||
        curriculumData.labs.lab6.kernels.blur;
      const convolutionResult = AIService.computeConvolution({
        inputGrid: nextLab6.inputGrid,
        width: 8,
        height: 8,
        kernel: currentKernel.matrix
      });
      const inspectedDetail = nextLab6.inspectedCell
        ? convolutionResult.details.find(
            d => d.x === nextLab6.inspectedCell.x && d.y === nextLab6.inspectedCell.y
          ) || null
        : null;

      this.state = {
        ...this.state,
        lab6: {
          ...nextLab6,
          currentKernel,
          convolutionResult,
          inspectedDetail
        }
      };

      // Challenge checks
      if (
        nextLab6.selectedPreset === 'verticalStripe' &&
        nextLab6.activeKernelKey === 'verticalEdge'
      ) {
        this._rewardChallenge('lab6', 'lab6_challenge1', 1);
      }
      if (
        nextLab6.selectedPreset === 'square' &&
        (nextLab6.activeKernelKey === 'horizontalEdge' ||
          nextLab6.activeKernelKey === 'verticalEdge')
      ) {
        this._rewardChallenge('lab6', 'lab6_challenge2', 1);
      }
      if (isUserInspect && nextLab6.inspectedCell) {
        this._rewardChallenge('lab6', 'lab6_challenge3', 1);
      }

      this.notify();
    };

    const lab6Actions = {
      togglePixel: (idx) => {
        if (idx < 0 || idx >= 64) return;
        const nextGrid = [...this.state.lab6.inputGrid];
        nextGrid[idx] = nextGrid[idx] === 1 ? 0 : 1;
        AudioEngine.playToggle(nextGrid[idx] === 1);
        recomputeLab6({
          inputGrid: nextGrid,
          selectedPreset: 'custom'
        });
      },
      selectPreset: (key) => {
        AudioEngine.playStep();
        recomputeLab6({
          selectedPreset: key,
          inputGrid: getLab6PresetGrid(key)
        });
      },
      selectKernel: (key) => {
        if (!curriculumData.labs.lab6.kernels[key]) return;
        AudioEngine.playStep();
        recomputeLab6({
          activeKernelKey: key
        });
      },
      inspectCell: (xOrObj, y) => {
        const cell =
          typeof xOrObj === 'object' && xOrObj !== null
            ? { x: Number(xOrObj.x) || 3, y: Number(xOrObj.y) || 3 }
            : { x: Number(xOrObj) || 3, y: Number(y) || 3 };
        const clampedX = Math.max(0, Math.min(7, cell.x));
        const clampedY = Math.max(0, Math.min(7, cell.y));
        AudioEngine.playTone(440, 'sine', 0.1);
        recomputeLab6({ inspectedCell: { x: clampedX, y: clampedY } }, true);
      },
      setScanProgress: (val) => {
        const clamped = Math.max(0, Math.min(1, Number(val) || 0));
        const cellIdx = Math.min(63, Math.floor(clamped * 64));
        const cx = Math.max(1, Math.min(6, cellIdx % 8));
        const cy = Math.max(1, Math.min(6, Math.floor(cellIdx / 8)));
        recomputeLab6({
          scanProgress: clamped,
          inspectedCell: { x: cx, y: cy }
        }, true);
      },
      clearGrid: () => {
        AudioEngine.playStep();
        recomputeLab6({
          inputGrid: new Array(64).fill(0),
          selectedPreset: 'custom'
        });
      }
    };
    this.lab6Actions = lab6Actions;

    // =========================================================================
    // LAB 7 ACTIONS: Artificial Neuron (Perceptron)
    // =========================================================================
    const recomputeLab7 = (patch) => {
      const nextLab7 = { ...this.state.lab7, ...patch };
      const clamp = (v) => Math.max(-3.0, Math.min(3.0, Math.round((Number(v) || 0) * 100) / 100));
      const w1 = clamp(nextLab7.w1);
      const w2 = clamp(nextLab7.w2);
      const bias = clamp(nextLab7.bias);
      const evaluation = AIService.evaluatePerceptron({
        w1,
        w2,
        bias,
        activation: nextLab7.activation
      });
      const currentAccuracy =
        nextLab7.selectedGate === 'AND'
          ? evaluation.accuracyAnd
          : nextLab7.selectedGate === 'OR'
          ? evaluation.accuracyOr
          : evaluation.accuracyXor;

      this.state = {
        ...this.state,
        lab7: {
          ...nextLab7,
          w1,
          w2,
          bias,
          evaluation,
          currentAccuracy
        }
      };

      // Challenge checks
      if (nextLab7.selectedGate === 'AND' && evaluation.accuracyAnd === 100) {
        this._rewardChallenge('lab7', 'lab7_challenge1', 1);
      }
      if (nextLab7.selectedGate === 'OR' && evaluation.accuracyOr === 100) {
        this._rewardChallenge('lab7', 'lab7_challenge2', 1);
      }
      if (nextLab7.selectedGate === 'XOR' && evaluation.accuracyXor >= 75) {
        this._rewardChallenge('lab7', 'lab7_challenge3', 1);
      }

      this.notify();
    };

    const lab7Actions = {
      setSelectedGate: (gate) => {
        const valid = ['AND', 'OR', 'XOR'].includes(gate) ? gate : 'AND';
        AudioEngine.playStep();
        recomputeLab7({ selectedGate: valid });
      },
      setW1: (w1) => {
        recomputeLab7({ w1 });
      },
      setW2: (w2) => {
        recomputeLab7({ w2 });
      },
      setBias: (bias) => {
        recomputeLab7({ bias });
      },
      setActivation: (act) => {
        const valid = act === 'sigmoid' ? 'sigmoid' : 'step';
        AudioEngine.playStep();
        recomputeLab7({ activation: valid });
      },
      resetPerceptron: () => {
        AudioEngine.playStep();
        recomputeLab7({ w1: 0.5, w2: 0.5, bias: 0.0 });
      }
    };
    this.lab7Actions = lab7Actions;

    // =========================================================================
    // LAB 8 ACTIONS: Language Model Next-Token Predictor
    // =========================================================================
    const recomputeLab8 = (patch) => {
      const nextLab8 = { ...this.state.lab8, ...patch };
      const { activePrompt, activeVocabulary, tokenDistribution } = computeLab8Distribution(
        nextLab8.selectedPromptId,
        nextLab8.generatedTokens,
        nextLab8.temperature
      );

      this.state = {
        ...this.state,
        lab8: {
          ...nextLab8,
          activePrompt,
          activeVocabulary,
          tokenDistribution
        }
      };

      // Challenge checks
      if (nextLab8.temperature <= 0.05 && nextLab8.generatedTokens.length >= 1) {
        this._rewardChallenge('lab8', 'lab8_challenge1', 1);
      }
      if (nextLab8.temperature >= 0.8 && nextLab8.generatedTokens.length >= 1) {
        this._rewardChallenge('lab8', 'lab8_challenge2', 1);
      }
      if (nextLab8.generatedTokens.length >= 4) {
        this._rewardChallenge('lab8', 'lab8_challenge3', 1);
      }

      this.notify();
    };

    const lab8Actions = {
      selectPrompt: (id) => {
        AudioEngine.playStep();
        recomputeLab8({
          selectedPromptId: id,
          generatedTokens: []
        });
      },
      setTemperature: (t) => {
        const clamped = Math.max(0.0, Math.min(1.5, Math.round((Number(t) || 0) * 100) / 100));
        recomputeLab8({ temperature: clamped });
      },
      appendToken: (tok) => {
        if (!tok) return;
        AudioEngine.playToken();
        recomputeLab8({
          generatedTokens: [...this.state.lab8.generatedTokens, tok]
        });
      },
      sampleNextToken: () => {
        const l8 = this.state.lab8;
        const sampled = AIService.sampleToken(l8.tokenDistribution, l8.temperature);
        if (sampled) {
          AudioEngine.playToken();
          recomputeLab8({
            generatedTokens: [...l8.generatedTokens, sampled]
          });
        }
        return sampled;
      },
      resetTokens: () => {
        AudioEngine.playStep();
        recomputeLab8({ generatedTokens: [] });
      }
    };
    this.lab8Actions = lab8Actions;
  }

  getSnapshot() {
    const s = this.state;
    const activeLabData = curriculumData.labs[s.activeLabId] || curriculumData.labs.lab1;
    const activeLabMeta = getLabMeta(s.activeLabId);

    return {
      ...s,
      activeLabData,
      activeLabMeta,

      // Top-level actions
      setAppMode: this.setAppMode,
      setSceneMode: this.setSceneMode,
      setActiveLabId: this.setActiveLabId,
      enterStation: this.enterStation,
      returnToOverworld: this.returnToOverworld,
      setActiveSubView: this.setActiveSubView,
      setShowXRay: this.setShowXRay,
      toggleXRay: this.toggleXRay,
      setSelectedWorld: this.setSelectedWorld,
      equipGadget: this.equipGadget,
      toggleMute: this.toggleMute,
      setPodcastRadio: this.setPodcastRadio,
      togglePodcastRadio: this.togglePodcastRadio,
      loadPresetForTest: this.loadPresetForTest,

      // Top-level convenience aliases for station actions
      ...this.lab1Actions,
      ...this.lab2Actions,
      ...this.lab3Actions,
      ...this.lab4Actions,
      ...this.lab5Actions,
      ...this.lab6Actions,
      ...this.lab7Actions,
      ...this.lab8Actions,
      clearGrid: () => {
        if (this.state.activeLabId === 'lab6') {
          this.lab6Actions.clearGrid();
        } else {
          this.lab1Actions.clearGrid();
        }
      },

      // Station state + actions merged cleanly
      lab1: { ...s.lab1, ...this.lab1Actions },
      lab2: { ...s.lab2, ...this.lab2Actions },
      lab3: { ...s.lab3, ...this.lab3Actions },
      lab4: { ...s.lab4, ...this.lab4Actions },
      lab5: { ...s.lab5, ...this.lab5Actions },
      lab6: { ...s.lab6, ...this.lab6Actions },
      lab7: { ...s.lab7, ...this.lab7Actions },
      lab8: { ...s.lab8, ...this.lab8Actions }
    };
  }

  getState() {
    return this.getSnapshot();
  }

  setState(updater) {
    const patch = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snap = this.getSnapshot();
    this.listeners.forEach(fn => fn(snap));
  }
}

export const ZenGameStore = new ZenGameStoreClass();

export function useZenGameStore(selector = null) {
  const [snapshot, setSnapshot] = useState(() => ZenGameStore.getSnapshot());

  useEffect(() => {
    return ZenGameStore.subscribe(newSnap => {
      setSnapshot(newSnap);
    });
  }, []);

  if (typeof selector === 'function') {
    return selector(snapshot);
  }
  return snapshot;
}

// Attach Zustand-compatible static helpers on the hook function
useZenGameStore.getState = () => ZenGameStore.getSnapshot();
useZenGameStore.setState = (updater) => ZenGameStore.setState(updater);
useZenGameStore.subscribe = (listener) => ZenGameStore.subscribe(listener);

export default useZenGameStore;
