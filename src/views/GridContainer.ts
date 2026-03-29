import { Container, Graphics } from 'pixi.js';
import { RowView } from './RowView.js';
import { RowData, CellState } from '@/types/index.js';
import {
  CELL_SIZE, CELL_GAP, HINT_AREA_WIDTH,
  GRID_COLS, GRID_VISIBLE_ROWS, GRID_WIDTH,
  COL_HINT_AREA_HEIGHT, PUSH_ANIMATION_DURATION,
} from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { ColumnHintsContainer, DeadLineView } from './HintViews.js';
import { calculateColumnHints } from '@/utils/HintUtils.js';
import gsap from 'gsap';

const ROW_HEIGHT = CELL_SIZE + CELL_GAP;

export class GridContainer extends Container {
  private rowViews: RowView[] = [];
  private rowPool: RowView[] = [];
  private colHints: ColumnHintsContainer;
  private deadLine: DeadLineView;
  private gridBg: Graphics;
  private _rows: RowData[] = [];
  private _cursorRow = -1;
  private _cursorCol = -1;
  readonly cols: number;
  readonly visibleRows: number;

  onCellClick?: (rowIndex: number, col: number, state: CellState) => void;
  onCellPointerDown?: (rowIndex: number, col: number, currentState: CellState, button: number) => void;
  onCellPointerEnter?: (rowIndex: number, col: number) => void;
  onCellPointerUp?: () => void;

  constructor(cols = GRID_COLS, visibleRows = GRID_VISIBLE_ROWS) {
    super();
    this.cols = cols;
    this.visibleRows = visibleRows;

    this.gridBg = new Graphics();
    this.addChild(this.gridBg);
    this.drawBackground();

    this.colHints = new ColumnHintsContainer(cols);
    this.colHints.x = HINT_AREA_WIDTH;
    this.colHints.y = 0;
    this.addChild(this.colHints);

    this.deadLine = new DeadLineView(HINT_AREA_WIDTH + GRID_WIDTH);
    this.deadLine.y = COL_HINT_AREA_HEIGHT;
    this.addChild(this.deadLine);
  }

  private drawBackground(): void {
    const w = HINT_AREA_WIDTH + GRID_WIDTH;
    const h = COL_HINT_AREA_HEIGHT + visibleRowsHeight(this.visibleRows);
    this.gridBg.clear();
    this.gridBg.rect(HINT_AREA_WIDTH, COL_HINT_AREA_HEIGHT, GRID_WIDTH, visibleRowsHeight(this.visibleRows));
    this.gridBg.fill({ color: COLORS.gridBackground });
    this.gridBg.rect(0, 0, w, h);
    this.gridBg.stroke({ color: COLORS.cellEmptyBorder, width: 0.5, alpha: 0.3 });
  }

  private acquireRowView(): RowView {
    const pooled = this.rowPool.pop();
    if (pooled) {
      pooled.alpha = 1;
      return pooled;
    }
    const view = new RowView(this.cols);
    this.setupCellHandlers(view);
    return view;
  }

  private releaseRowView(view: RowView): void {
    this.removeChild(view);
    view.resetAlpha();
    this.rowPool.push(view);
  }

  private setupCellHandlers(rowView: RowView): void {
    for (const cell of rowView.allCells) {
      cell.on('pointerdown', (e) => {
        const button = (e.nativeEvent as PointerEvent).button;
        const col = cell.cellCol;
        const rowIdx = rowView.rowIndex;
        const currentState = cell.cellState;

        let newState: CellState;
        if (button === 2) {
          newState = currentState === CellState.CROSSED ? CellState.EMPTY : CellState.CROSSED;
        } else {
          newState = currentState === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;
        }

        this.onCellPointerDown?.(rowIdx, col, currentState, button);
        this.onCellClick?.(rowIdx, col, newState);
      });

      cell.on('pointerover', () => {
        this.onCellPointerEnter?.(rowView.rowIndex, cell.cellCol);
      });

      cell.on('pointerup', () => {
        this.onCellPointerUp?.();
      });

      cell.on('pointerupoutside', () => {
        this.onCellPointerUp?.();
      });
    }
  }

  setRows(rows: RowData[]): void {
    this._rows = rows;
    this.rebuildRowViews();
  }

  private rebuildRowViews(): void {
    for (const rv of this.rowViews) {
      this.releaseRowView(rv);
    }
    this.rowViews = [];

    const count = Math.min(this._rows.length, this.visibleRows);
    const bottomVisualIndex = this.visibleRows - 1;

    for (let i = 0; i < count; i++) {
      const dataIndex = this._rows.length - count + i;
      const rowData = this._rows[dataIndex];
      if (!rowData) continue;
      const view = this.acquireRowView();
      view.bind(rowData, dataIndex);
      const visualIndex = bottomVisualIndex - (count - 1) + i;
      view.y = this.getRowY(visualIndex);
      this.addChild(view);
      this.rowViews.push(view);
    }

    this.applyCursorHighlight();
    this.updateColHints();
  }

  private getRowY(visualIndex: number): number {
    return COL_HINT_AREA_HEIGHT + visualIndex * ROW_HEIGHT;
  }

  setCursor(row: number, col: number): void {
    this._cursorRow = row;
    this._cursorCol = col;
    this.applyCursorHighlight();
  }

  private applyCursorHighlight(): void {
    for (const view of this.rowViews) {
      for (const cell of view.allCells) {
        const isHighlighted = view.rowIndex === this._cursorRow && cell.cellCol === this._cursorCol;
        cell.setHighlight(isHighlighted);
      }
    }
  }

  updateRowCell(rowIndex: number, col: number, state: CellState): void {
    const rowData = this._rows[rowIndex];
    if (!rowData) return;
    rowData.cells[col] = state;

    const view = this.rowViews.find(v => v.rowIndex === rowIndex);
    view?.getCellAt(col)?.setState(state);
    this.updateColHints();
  }

  animatePushDown(onComplete: () => void): void {
    const durationS = PUSH_ANIMATION_DURATION / 1000;

    for (const view of this.rowViews) {
      gsap.to(view, {
        y: view.y - ROW_HEIGHT,
        duration: durationS,
        ease: 'power2.out',
      });
    }

    gsap.delayedCall(durationS, onComplete);
  }

  animateClearRows(rowIndices: number[], onComplete: () => void): void {
    const toRemove = this.rowViews.filter(v => rowIndices.includes(v.rowIndex));
    let remaining = toRemove.length;
    if (remaining === 0) { onComplete(); return; }

    for (const view of toRemove) {
      gsap.to(view, {
        alpha: 0,
        scaleX: 1.05,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          remaining--;
          if (remaining === 0) onComplete();
        },
      });
    }
  }

  removeRowsAndRebuild(_rowIndices: number[], rows: RowData[]): void {
    this._rows = rows;
    this.rebuildRowViews();
  }

  setDangerLevel(level: number): void {
    this.deadLine.setDanger(level);
  }

  revealColHint(col: number): void {
    this.colHints.revealCol(col);
  }

  hideColHint(col: number): void {
    this.colHints.hideCol(col);
  }

  private _allColHintsVisible = false;

  showAllColHints(): void {
    if (this._allColHintsVisible) return;
    this._allColHintsVisible = true;
    this.colHints.showAll();
  }

  hideAllColHints(): void {
    this._allColHintsVisible = false;
    this.colHints.hideAll();
  }

  private updateColHints(): void {
    const activeCells = this._rows
      .filter(r => !r.cleared)
      .map(r => r.solution);
    const hints = calculateColumnHints(activeCells, this.cols);
    this.colHints.update(hints);
  }

  refreshAllCells(): void {
    for (const view of this.rowViews) {
      view.syncCells();
    }
    this.applyCursorHighlight();
    this.updateColHints();
  }
}

function visibleRowsHeight(rows: number): number {
  return rows * ROW_HEIGHT - CELL_GAP;
}
