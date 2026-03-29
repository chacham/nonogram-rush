import { Application, Container, Ticker } from 'pixi.js';
import gsap from 'gsap';
import {
  GRID_COLS, GRID_VISIBLE_ROWS,
  PUSH_INTERVAL_BASE, PUSH_INTERVAL_MIN,
  STAGE_GOAL_LINES, COMBO_FREEZE_DURATION,
} from '@/config/GameConfig.js';
import { GameState, CellState, RowData } from '@/types/index.js';
import { StateMachine, createGameStateMachine } from '@/core/StateMachine.js';
import { GridContainer } from '@/views/GridContainer.js';
import { UIOverlay } from '@/views/UIOverlay.js';
import { FinaleView } from '@/views/FinaleView.js';
import { ScoringSystem } from '@/systems/ScoringSystem.js';
import { InputSystem } from '@/systems/InputSystem.js';
import { ColHintRevealSystem } from '@/systems/ColHintRevealSystem.js';import { ClearedRowBuffer } from '@/models/ClearedRowBuffer.js';
import { generateRow, resetRowCounter } from '@/models/RowFactory.js';
import { validateRow } from '@/utils/HintUtils.js';

export class Game {
  private app: Application;
  private sm: StateMachine;
  private scene!: Container;
  private gridContainer!: GridContainer;
  private ui!: UIOverlay;
  private finaleView!: FinaleView;
  private scoring: ScoringSystem;
  private input: InputSystem;
  private hintReveal: ColHintRevealSystem;
  private buffer: ClearedRowBuffer;

  private rows: RowData[] = [];
  private pushTimer = 0;
  private pushInterval: number;
  private freezeTimer = 0;
  private unbindKeyboard?: () => void;

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
    this.startNewGame();

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
    this.scene.addChild(this.ui);

    this.finaleView = new FinaleView();
    this.scene.addChild(this.finaleView);
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
    this.input.bindDragOnGrid(this.gridContainer);

    this.input.onCellMark = (row, col, state) => {
      if (this.sm.current !== GameState.IDLE) return;
      this.handleCellMark(row, col, state);
    };

    this.input.onMoveCursor = (row, col) => {
      this.gridContainer.setCursor(row, col);
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR' && this.sm.current === GameState.GAME_OVER) {
        this.startNewGame();
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private startNewGame(): void {
    this.rows = [];
    this.scoring.reset();
    this.hintReveal.reset();
    this.buffer.clear();
    resetRowCounter();
    this.pushInterval = PUSH_INTERVAL_BASE;
    this.pushTimer = 0;
    this.freezeTimer = 0;

    this.input.init(GRID_COLS, 0);
    this.gridContainer.setRows(this.rows);
    this.gridContainer.hideAllColHints();
    this.ui.hideMessage();
    this.ui.updateScore(this.scoring.current);
    this.sm.forceState(GameState.IDLE);
  }

  private update(deltaMS: number): void {
    const state = this.sm.current;

    if (state === GameState.IDLE) {
      if (this.freezeTimer > 0) {
        this.freezeTimer -= deltaMS;
        this.ui.updatePushTimer(0);
        return;
      }

      this.pushTimer += deltaMS;
      this.pushInterval = this.calcPushInterval(this.rows.length);
      this.ui.updatePushTimer(this.pushTimer / this.pushInterval);

      this.gridContainer.setVisibleRowCount(this.rows.length);

      if (this.pushTimer >= this.pushInterval) {
        this.pushTimer = 0;
        this.triggerRowPush();
      }
    }
  }

  private triggerRowPush(): void {
    if (!this.sm.transition(GameState.PUSHING)) return;

    const newRow = generateRow(GRID_COLS);
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
    });
  }

  private calcPushInterval(rowCount: number): number {
    const t = Math.log(rowCount + 1) / Math.log(GRID_VISIBLE_ROWS + 1);
    return PUSH_INTERVAL_MIN + (PUSH_INTERVAL_BASE - PUSH_INTERVAL_MIN) * t;
  }

  private checkGameOver(): boolean {
    if (this.rows.length > GRID_VISIBLE_ROWS) {
      return true;
    }
    return false;
  }

  private handleCellMark(rowIndex: number, col: number, newState: CellState): void {
    if (this.sm.current !== GameState.IDLE) return;

    const rowData = this.rows[rowIndex];
    if (!rowData || rowData.cleared) return;

    const current = rowData.cells[col];
    if (current === newState) {
      rowData.cells[col] = CellState.EMPTY;
      this.gridContainer.updateRowCell(rowIndex, col, CellState.EMPTY);
    } else {
      rowData.cells[col] = newState;
      this.gridContainer.updateRowCell(rowIndex, col, newState);
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
    this.buffer.push(rowData.solution);
    this.buffer.saveToSession();

    const { isCombo } = this.scoring.onLinesCleared(1);
    this.hintReveal.onRowCleared();
    this.ui.updateScore(this.scoring.current);

    if (isCombo) {
      this.freezeTimer = COMBO_FREEZE_DURATION;
      this.shakeScene(8, 0.25);
    }

    this.gridContainer.animateClearRows([rowIndex], () => {
      this.rows = this.rows.filter((_, i) => i !== rowIndex);
      const linesCleared = this.scoring.current.linesCleared;

      if (linesCleared >= STAGE_GOAL_LINES) {
        this.sm.forceState(GameState.FINALE);
        this.ui.showStageClear();
        setTimeout(() => this.showFinale(), 1500);
        return;
      }

      this.gridContainer.removeRowsAndRebuild([rowIndex], this.rows);
      this.input.updateRowCount(this.rows.length);

      this.sm.forceState(GameState.IDLE);
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
    this.finaleView.show(this.buffer.getAll(), () => {
      this.finaleView.hide();
      this.startNewGame();
    });
  }

  destroy(): void {
    this.unbindKeyboard?.();
    if (this.tickHandler) {
      this.app.ticker.remove(this.tickHandler);
    }
  }
}
