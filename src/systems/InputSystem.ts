import { CellState } from '@/types/index.js';
import { GridContainer } from '@/views/GridContainer.js';

type DragMode = 'fill' | 'cross' | null;

export class InputSystem {
  private fillKey = 'KeyF';
  private crossKey = 'KeyX';
  private cursorRow = 0;
  private cursorCol = 0;
  private dragMode: DragMode = null;
  private dragStartState: CellState | null = null;
  private isPointerDown = false;

  onCellMark?: (row: number, col: number, state: CellState) => void;
  onMoveCursor?: (row: number, col: number) => void;

  private totalRows = 0;
  private totalCols = 0;

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

  bindKeyboard(): () => void {
    const handler = (e: KeyboardEvent) => this.handleKey(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }

  bindDragOnGrid(gridContainer: GridContainer): void {
    gridContainer.onCellPointerDown = (_rowIndex, _col, currentState, button) => {
      this.isPointerDown = true;
      this.dragMode = button === 2 ? 'cross' : 'fill';
      this.dragStartState = currentState;
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
      this.onCellMark?.(rowIndex, col, newState);
    };

    gridContainer.onCellPointerUp = () => {
      this.isPointerDown = false;
      this.dragMode = null;
      this.dragStartState = null;
    };
  }

  private handleKey(e: KeyboardEvent): void {
    switch (e.code) {
      case 'ArrowUp':
        e.preventDefault();
        this.moveCursor(-1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveCursor(1, 0);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.moveCursor(0, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveCursor(0, 1);
        break;
      case this.fillKey:
        this.triggerMark(CellState.FILLED);
        break;
      case this.crossKey:
        this.triggerMark(CellState.CROSSED);
        break;
    }
  }

  private moveCursor(dRow: number, dCol: number): void {
    const newRow = Math.max(0, Math.min(this.totalRows - 1, this.cursorRow + dRow));
    const newCol = Math.max(0, Math.min(this.totalCols - 1, this.cursorCol + dCol));
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
