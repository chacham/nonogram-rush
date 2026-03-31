import { Application, Container, Ticker } from 'pixi.js';
import gsap from 'gsap';
import {
  GRID_COLS, GRID_VISIBLE_ROWS,
  PUSH_INTERVAL_BASE, PUSH_INTERVAL_MIN, PUSH_INTERVAL_SCALE,
  STAGE_GOAL_LINES, COMBO_FREEZE_DURATION, MAX_HEARTS,
} from '@/config/GameConfig.js';
import {
  canvasWidth, canvasHeight,
  gridWidth, gridHeight,
} from '@/config/LayoutConfig.js';
import { GameState, GameMode, PlayMode, CellState, CellType, RowData, StageData, InputMode } from '@/types/index.js';
import { StateMachine, createGameStateMachine } from '@/core/StateMachine.js';
import { GridContainer } from '@/views/GridContainer.js';
import { UIOverlay } from '@/views/UIOverlay.js';
import { FinaleView } from '@/views/FinaleView.js';
import { MenuView, loadInputMode } from '@/views/MenuView.js';
import { SettingsView } from '@/views/SettingsView.js';
import { ScoringSystem } from '@/systems/ScoringSystem.js';
import { InputSystem } from '@/systems/InputSystem.js';
import { ColHintRevealSystem } from '@/systems/ColHintRevealSystem.js';
import { ClearedRowBuffer } from '@/models/ClearedRowBuffer.js';
import { generateRow, createRowFromSolution, resetRowCounter } from '@/models/RowFactory.js';
import { validateRow } from '@/utils/HintUtils.js';
import { STAGES } from '@/data/stages.js';
import { loadCustomStages } from '@/data/StageLoader.js';

export class Game {
  private app: Application;
  private sm: StateMachine;
  private scene!: Container;
  private gridContainer!: GridContainer;
  private ui!: UIOverlay;
  private finaleView!: FinaleView;
  private menuView!: MenuView;
  private settingsView!: SettingsView;
  private scoring: ScoringSystem;
  private input: InputSystem;
  private hintReveal: ColHintRevealSystem;
  private buffer: ClearedRowBuffer;

  private rows: RowData[] = [];
  private rowQueue: { solution: CellType[]; stageRowIndex: number }[] = [];
  private allStages: StageData[] = [...STAGES];
  private hearts = MAX_HEARTS;
  private mode: GameMode = GameMode.ASSISTED;
  private playMode: PlayMode = PlayMode.ENDLESS;
  private stageData?: StageData;
  private pushTimer = 0;
  private pushInterval: number;
  private freezeTimer = 0;
  private unbindKeyboard?: () => void;
  private stageStartTime = 0;
  private elapsedMs = 0;
  private inputMode: InputMode = 'keyboard';

  constructor(app: Application) {
    this.app = app;
    this.sm = createGameStateMachine();
    this.scoring = new ScoringSystem();
    this.input = new InputSystem();
    this.hintReveal = new ColHintRevealSystem(GRID_COLS);
    this.buffer = new ClearedRowBuffer();
    this.pushInterval = PUSH_INTERVAL_BASE;
  }

  private tickHandler!: (ticker: Ticker) => void;

  async init(): Promise<void> {
    this.setupScene();
    this.setupInput();
    this.setupHintReveal();

    const custom = await loadCustomStages();
    this.allStages = [...STAGES, ...custom];
    this.menuView.setStages(this.allStages);

    this.showMenu();

    this.tickHandler = (ticker: Ticker) => this.update(ticker.deltaMS);
    this.app.ticker.add(this.tickHandler);
  }

  private setupScene(): void {
    this.scene = new Container();
    this.app.stage.addChild(this.scene);

    this.gridContainer = new GridContainer(GRID_COLS, GRID_VISIBLE_ROWS);
    this.gridContainer.x = 0;
    this.gridContainer.y = 0;
    this.scene.addChild(this.gridContainer);

    this.gridContainer.onCellClick = (rowIndex, col, newState) => {
      this.handleCellMark(rowIndex, col, newState);
    };

    this.ui = new UIOverlay();
    this.ui.onPaintModeToggle = () => {
      this.input.togglePaintMode();
      this.ui.setPaintMode(this.input.paintMode);
    };
    this.scene.addChild(this.ui);

    this.finaleView = new FinaleView();
    this.scene.addChild(this.finaleView);

    this.inputMode = loadInputMode();
    this.menuView = new MenuView();
    this.menuView.setInputMode(this.inputMode);
    this.menuView.onPlayStage = (stage) => this.startGame(PlayMode.STAGE, stage);
    this.menuView.onPlayEndless = () => this.startGame(PlayMode.ENDLESS);
    this.menuView.onSettings = () => this.showSettings();
    this.menuView.onInputModeChange = (mode) => {
      this.inputMode = mode;
      this.ui.setTouchMode(mode === 'touchscreen');
      if (mode === 'touchscreen') {
        this.input.setPaintMode('fill');
        this.ui.setPaintMode('fill');
      }
    };
    this.app.stage.addChild(this.menuView);

    this.settingsView = new SettingsView();
    this.settingsView.onBack = () => this.showMenu();
    this.settingsView.onChange = () => {
      this.input.reloadBindings();
      this.ui.updateKeys(this.input.getBindings());
    };
    this.app.stage.addChild(this.settingsView);
  }

  private setupHintReveal(): void {
    this.hintReveal.onRevealCol = (col) => {
      this.gridContainer.revealColHint(col);
    };
    this.hintReveal.onHideCol = (col) => {
      this.gridContainer.hideColHint(col);
    };
  }

  private setupInput(): void {
    this.unbindKeyboard = this.input.bindKeyboard();
    this.bindInputToGrid();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.settingsView.isListening) return;
        if (this.sm.current === GameState.SETTINGS) {
          this.showMenu();
        } else if (this.sm.current !== GameState.MENU) {
          this.showMenu();
        }
        return;
      }
      if (e.code === 'KeyR' && this.sm.current === GameState.GAME_OVER) {
        this.startNewGame();
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private bindInputToGrid(): void {
    if (this.inputMode === 'touchscreen') {
      this.input.bindTouchOnGrid(this.gridContainer);
    } else {
      this.input.bindDragOnGrid(this.gridContainer);
    }

    this.input.onCellMark = (row, col, state) => {
      if (this.sm.current !== GameState.IDLE && this.sm.current !== GameState.PUSHING
        && this.sm.current !== GameState.CLEARING) return;
      this.handleCellMark(row, col, state);
    };

    this.input.onCellPaint = (row, col, state) => {
      if (this.sm.current !== GameState.IDLE && this.sm.current !== GameState.PUSHING
        && this.sm.current !== GameState.CLEARING) return;
      const rowData = this.rows[row];
      if (!rowData || rowData.cleared) return;
      if (rowData.cells[col] === state) return;
      this.handleCellMark(row, col, state);
    };

    this.input.onMoveCursor = (row, col) => {
      this.gridContainer.setCursor(row, col);
    };
  }

  private startNewGame(): void {
    this.rows = [];
    if (this.stageData) {
      this.rowQueue = this.stageData.rows.map((solution, idx) => ({ solution, stageRowIndex: idx }));
    } else {
      this.rowQueue = [];
    }
    this.hearts = MAX_HEARTS;
    this.scoring.reset();
    this.hintReveal.reset();
    this.buffer.clear();
    resetRowCounter();
    this.pushInterval = PUSH_INTERVAL_BASE;
    this.pushTimer = 0;
    this.freezeTimer = 0;
    this.stageStartTime = 0;
    this.elapsedMs = 0;

    this.input.init(this.gridContainer.cols, 0);
    this.gridContainer.setRows(this.rows);
    this.gridContainer.hideAllColHints();
    this.ui.hideMessage();
    this.ui.updateScore(this.scoring.current);
    this.ui.updateHearts(this.hearts);
    this.ui.updateTime(0);
    this.ui.updateKeys(this.input.getBindings());
    this.ui.setTouchMode(this.inputMode === 'touchscreen');
    if (this.inputMode === 'touchscreen') {
      this.input.setPaintMode('fill');
      this.ui.setPaintMode('fill');
    }
    this.sm.forceState(GameState.IDLE);
  }

  private showMenu(): void {
    this.scene.visible = false;
    this.settingsView.hide();
    this.menuView.show();
    this.sm.forceState(GameState.MENU);
  }

  private showSettings(): void {
    this.menuView.hide();
    this.settingsView.show();
    this.sm.forceState(GameState.SETTINGS);
  }

  private startGame(playMode: PlayMode, stageData?: StageData): void {
    this.playMode = playMode;
    this.stageData = stageData;
    this.menuView.hide();
    this.settingsView.hide();
    this.scene.visible = true;
    this.input.reloadBindings();
    this.initSceneForCols(stageData?.cols ?? GRID_COLS);
    this.startNewGame();
  }

  private initSceneForCols(cols: number): void {
    this.app.renderer.resize(canvasWidth(cols), canvasHeight(GRID_VISIBLE_ROWS, cols));

    if (this.gridContainer) {
      this.scene.removeChild(this.gridContainer);
      this.gridContainer.destroy({ children: true });
    }
    this.gridContainer = new GridContainer(cols, GRID_VISIBLE_ROWS);
    this.gridContainer.x = 0;
    this.gridContainer.y = 0;
    this.scene.addChildAt(this.gridContainer, 0);

    this.gridContainer.onCellClick = (rowIndex, col, newState) => {
      this.handleCellMark(rowIndex, col, newState);
    };

    this.hintReveal = new ColHintRevealSystem(cols);
    this.hintReveal.onRevealCol = (col) => {
      this.gridContainer.revealColHint(col);
    };
    this.hintReveal.onHideCol = (col) => {
      this.gridContainer.hideColHint(col);
    };

    this.bindInputToGrid();

    this.ui.updateGridDims(
      this.gridContainer.hintAreaWidth,
      gridWidth(cols),
      gridHeight(GRID_VISIBLE_ROWS, cols),
    );
  }

  private update(deltaMS: number): void {
    const state = this.sm.current;

    if (this.stageStartTime > 0) {
      this.elapsedMs += deltaMS;
      this.ui.updateTime(this.elapsedMs);
    }

    if (state === GameState.IDLE) {
      if (this.freezeTimer > 0) {
        this.freezeTimer -= deltaMS;
        this.ui.updatePushTimer(0);
        return;
      }

      this.gridContainer.setVisibleRowCount(this.rows.length);

      const shouldPush = this.playMode === PlayMode.ENDLESS || this.rowQueue.length > 0;
      if (!shouldPush) {
        this.ui.updatePushTimer(0);
        return;
      }

      this.pushTimer += deltaMS;
      this.pushInterval = this.calcPushInterval(this.rows.length);
      this.ui.updatePushTimer(this.pushTimer / this.pushInterval);

      if (this.pushTimer >= this.pushInterval) {
        this.pushTimer = 0;
        this.triggerRowPush();
      }
    }
  }

  private triggerRowPush(): void {
    if (!this.sm.transition(GameState.PUSHING)) return;

    if (this.stageStartTime === 0 && this.rows.length === 0) {
      this.stageStartTime = Date.now();
    }

    let newRow: RowData;
    if (this.playMode === PlayMode.STAGE) {
      const item = this.rowQueue.pop();
      if (!item) {
        this.sm.forceState(GameState.IDLE);
        return;
      }
      newRow = createRowFromSolution(item.solution, item.stageRowIndex);
    } else {
      newRow = generateRow(GRID_COLS);
    }

    this.rows.push(newRow);
    this.input.updateRowCount(this.rows.length);
    this.hintReveal.onRowPushed();
    this.shakeScene(4, 0.15);

    this.gridContainer.animatePushDown(() => {
      this.gridContainer.setRows(this.rows);

      if (this.checkGameOver()) {
        this.sm.forceState(GameState.GAME_OVER);
        this.shakeScene(12, 0.4);
        this.ui.showGameOver();
        return;
      }

      this.sm.forceState(GameState.IDLE);
      this.recheckAllRows();

      if (this.playMode === PlayMode.STAGE && this.rowQueue.length === 0) {
        this.gridContainer.showAllColHints();
      }
    });
  }

  private recheckAllRows(): void {
    for (let i = this.rows.length - 1; i >= 0; i--) {
      this.checkRowCompletion(i);
    }
  }

  private calcPushInterval(rowCount: number): number {
    const t = Math.log(rowCount + 1) / Math.log(GRID_VISIBLE_ROWS + 1);
    return (PUSH_INTERVAL_MIN + (PUSH_INTERVAL_BASE - PUSH_INTERVAL_MIN) * t) * PUSH_INTERVAL_SCALE;
  }

  private checkGameOver(): boolean {
    if (this.rows.length > GRID_VISIBLE_ROWS) {
      return true;
    }
    return false;
  }

  private handleCellMark(rowIndex: number, col: number, newState: CellState): void {
    const rowData = this.rows[rowIndex];
    if (!rowData || rowData.cleared) return;

    const current = rowData.cells[col];
    if (current === newState) {
      rowData.cells[col] = CellState.EMPTY;
      this.gridContainer.updateRowCell(rowIndex, col, CellState.EMPTY);
    } else {
      const isWrong =
        (newState === CellState.FILLED && rowData.solution[col] === CellType.EMPTY) ||
        (newState === CellState.CROSSED && rowData.solution[col] === CellType.FILLED);

      if (isWrong && this.mode === GameMode.ASSISTED) {
        this.hearts = Math.max(0, this.hearts - 1);
        this.ui.updateHearts(this.hearts);
        this.shakeScene(4, 0.12);

        const correct = rowData.solution[col] === CellType.FILLED
          ? CellState.FILLED
          : CellState.CROSSED;
        rowData.cells[col] = correct;
        this.gridContainer.updateRowCell(rowIndex, col, correct);

        if (this.hearts <= 0) {
          this.sm.forceState(GameState.GAME_OVER);
          this.ui.showGameOver();
          return;
        }
      } else {
        rowData.cells[col] = newState;
        this.gridContainer.updateRowCell(rowIndex, col, newState);
      }
    }

    this.checkRowCompletion(rowIndex);
  }

  private checkRowCompletion(rowIndex: number): void {
    const rowData = this.rows[rowIndex];
    if (!rowData || rowData.cleared) return;

    if (validateRow(rowData.cells, rowData.hints)) {
      this.clearRow(rowIndex);
    }
  }

  private clearRow(rowIndex: number): void {
    if (!this.sm.transition(GameState.CLEARING)) return;

    const rowData = this.rows[rowIndex]!;
    rowData.cleared = true;
    this.buffer.push(rowData.solution, rowData.stageRowIndex ?? rowData.originalIndex);
    this.buffer.saveToSession();

    const { isCombo } = this.scoring.onLinesCleared(1);
    const stageQueueEmpty = this.playMode === PlayMode.STAGE && this.rowQueue.length === 0;
    if (!stageQueueEmpty) {
      this.hintReveal.onRowCleared();
    }
    this.hearts = Math.min(MAX_HEARTS, this.hearts + 1);
    this.ui.updateScore(this.scoring.current);
    this.ui.updateHearts(this.hearts);

    if (isCombo) {
      this.freezeTimer = COMBO_FREEZE_DURATION;
      this.shakeScene(8, 0.25);
    }

    this.gridContainer.animateClearRows([rowIndex], () => {
      this.rows = this.rows.filter((_, i) => i !== rowIndex);

      const stageComplete = this.playMode === PlayMode.STAGE
        && this.rowQueue.length === 0
        && this.rows.length === 0;
      const endlessGoalReached = this.playMode === PlayMode.ENDLESS
        && this.scoring.current.linesCleared >= STAGE_GOAL_LINES;

      if (stageComplete || endlessGoalReached) {
        this.sm.forceState(GameState.FINALE);
        this.ui.showStageClear();
        setTimeout(() => this.showFinale(), 1500);
        return;
      }

      this.gridContainer.removeRowsAndRebuild([rowIndex], this.rows);
      this.input.updateRowCount(this.rows.length);

      this.sm.forceState(GameState.IDLE);
      this.recheckAllRows();

      if (this.playMode === PlayMode.STAGE && this.rowQueue.length === 0) {
        this.gridContainer.showAllColHints();
      }
    });
  }

  private shakeScene(intensity: number, duration: number): void {
    const ox = this.scene.x;
    const oy = this.scene.y;
    gsap.killTweensOf(this.scene);
    gsap.to(this.scene, {
      x: ox + intensity,
      y: oy - intensity * 0.5,
      duration: duration * 0.25,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.scene.x = ox;
        this.scene.y = oy;
      },
    });
  }

  private showFinale(): void {
    this.ui.hideMessage();
    this.finaleView.show(this.buffer.getAll(), this.elapsedMs, () => {
      this.finaleView.hide();
      this.showMenu();
    });
  }

  destroy(): void {
    this.unbindKeyboard?.();
    if (this.tickHandler) {
      this.app.ticker.remove(this.tickHandler);
    }
  }
}
