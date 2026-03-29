import { CellState, KeyBindings } from '@/types/index.js';
import { GridContainer } from '@/views/GridContainer.js';
import { loadBindings } from '@/systems/KeyBindingsManager.js';

type DragMode = 'fill' | 'cross' | null;

export class InputSystem {
  private bindings: KeyBindings;
  private cursorRow = 0;
  private cursorCol = 0;
  private dragMode: DragMode = null;
  private dragStartState: CellState | null = null;
  private isPointerDown = false;

  onCellMark?: (row: number, col: number, state: CellState) => void;
  onCellPaint?: (row: number, col: number, state: CellState) => void;
  onMoveCursor?: (row: number, col: number) => void;

  private totalRows = 0;
  private totalCols = 0;

  constructor() {
    this.bindings = loadBindings();
  }

  reloadBindings(): void {
    this.bindings = loadBindings();
  }

  getBindings(): KeyBindings {
    return { ...this.bindings };
  }

  init(cols: number, rows: number): void {
    this.totalCols = cols;
    this.totalRows = rows;
    this.cursorRow = 0;
    this.cursorCol = 0;
  }

  updateRowCount(rows: number): void {
    this.totalRows = rows;
    this.cursorRow = Math.min(this.cursorRow, Math.max(0, rows - 1));
  }

  private heldAction: CellState | null = null;

  bindKeyboard(): () => void {
    const down = (e: KeyboardEvent) => this.handleKeyDown(e);
    const up = (e: KeyboardEvent) => this.handleKeyUp(e);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }

  bindDragOnGrid(gridContainer: GridContainer): void {
    gridContainer.onCellPointerDown = (_rowIndex, _col, currentState, button) => {
      this.isPointerDown = true;
      this.dragMode = button === 2 ? 'cross' : 'fill';
      this.dragStartState = currentState;
      this.cursorRow = -1;
      this.cursorCol = -1;
      this.onMoveCursor?.(-1, -1);
    };

    gridContainer.onCellPointerEnter = (rowIndex, col) => {
      if (!this.isPointerDown || !this.dragMode) return;
      const isCrossMode = this.dragMode === 'cross';
      let newState: CellState;
      if (isCrossMode) {
        newState = this.dragStartState === CellState.CROSSED ? CellState.EMPTY : CellState.CROSSED;
      } else {
        newState = this.dragStartState === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;
      }
      this.onCellPaint?.(rowIndex, col, newState);
    };

    gridContainer.onCellPointerUp = () => {
      this.isPointerDown = false;
      this.dragMode = null;
      this.dragStartState = null;
    };
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const code = e.code;

    if (code === this.bindings.fill) {
      this.heldAction = CellState.FILLED;
      this.triggerMark(CellState.FILLED);
      return;
    }
    if (code === this.bindings.cross) {
      this.heldAction = CellState.CROSSED;
      this.triggerMark(CellState.CROSSED);
      return;
    }

    if (code === this.bindings.up) {
      e.preventDefault();
      this.moveCursor(-1, 0);
    } else if (code === this.bindings.down) {
      e.preventDefault();
      this.moveCursor(1, 0);
    } else if (code === this.bindings.left) {
      e.preventDefault();
      this.moveCursor(0, -1);
    } else if (code === this.bindings.right) {
      e.preventDefault();
      this.moveCursor(0, 1);
    }

    if (this.heldAction !== null) {
      this.onCellPaint?.(this.cursorRow, this.cursorCol, this.heldAction);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const code = e.code;
    if (
      (code === this.bindings.fill && this.heldAction === CellState.FILLED) ||
      (code === this.bindings.cross && this.heldAction === CellState.CROSSED)
    ) {
      this.heldAction = null;
    }
  }

  private moveCursor(dRow: number, dCol: number): void {
    if (this.totalRows === 0) return;
    const newRow = ((this.cursorRow + dRow) % this.totalRows + this.totalRows) % this.totalRows;
    const newCol = ((this.cursorCol + dCol) % this.totalCols + this.totalCols) % this.totalCols;
    this.cursorRow = newRow;
    this.cursorCol = newCol;
    this.onMoveCursor?.(newRow, newCol);
  }

  private triggerMark(desiredState: CellState): void {
    this.onCellMark?.(this.cursorRow, this.cursorCol, desiredState);
  }

  get cursor(): { row: number; col: number } {
    return { row: this.cursorRow, col: this.cursorCol };
  }
}
