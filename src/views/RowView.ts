import { Container, Graphics } from 'pixi.js';
import { RowData, CellState } from '@/types/index.js';
import { CellView } from './CellView.js';
import { RowHintView } from './HintViews.js';
import { CLEAR_ANIMATION_DURATION } from '@/config/GameConfig.js';
import { CELL_GAP } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import gsap from 'gsap';

const CLEAR_ANIM_DURATION_S = CLEAR_ANIMATION_DURATION / 1000;

export class RowView extends Container {
  private cells: CellView[] = [];
  private hintView: RowHintView;
  private bg: Graphics;
  private _rowIndex = 0;
  private _data: RowData | null = null;
  readonly cellContainer: Container;

  constructor(cols: number, cellSize: number, hintAreaWidth: number) {
    super();
    this.bg = new Graphics();
    this.addChild(this.bg);

    this.hintView = new RowHintView(hintAreaWidth);
    this.addChild(this.hintView);

    this.cellContainer = new Container();
    this.cellContainer.x = hintAreaWidth;
    this.addChild(this.cellContainer);

    this.drawBackground(cols, cellSize, hintAreaWidth);

    for (let col = 0; col < cols; col++) {
      const cell = new CellView(cellSize);
      cell.x = col * (cellSize + CELL_GAP);
      cell.y = 0;
      cell.setup(0, col);
      this.cellContainer.addChild(cell);
      this.cells.push(cell);
    }
  }

  private drawBackground(cols: number, cellSize: number, hintAreaWidth: number): void {
    const w = hintAreaWidth + cols * (cellSize + CELL_GAP) - CELL_GAP;
    this.bg.clear();
    this.bg.rect(0, 0, w, cellSize);
    this.bg.fill({ color: COLORS.gridBackground, alpha: 0 });
  }

  get rowIndex(): number { return this._rowIndex; }
  get data(): RowData | null { return this._data; }

  bind(data: RowData, rowIndex: number): void {
    this._data = data;
    this._rowIndex = rowIndex;
    this.hintView.setHints(data.hints);
    this.hintView.y = 0;
    this.syncCells();
  }

  syncCells(): void {
    if (!this._data) return;
    for (let col = 0; col < this.cells.length; col++) {
      const cell = this.cells[col]!;
      cell.setup(this._rowIndex, col);
      cell.setState(this._data.cells[col] ?? CellState.EMPTY);
    }
  }

  getCellAt(col: number): CellView | undefined {
    return this.cells[col];
  }

  get allCells(): CellView[] {
    return this.cells;
  }

  playFlash(onComplete: () => void): void {
    gsap.to(this, {
      alpha: 0,
      duration: CLEAR_ANIM_DURATION_S,
      ease: 'power2.in',
      onComplete,
    });
  }

  resetAlpha(): void {
    this.alpha = 1;
  }

  setHighlightRow(active: boolean): void {
    if (active) {
      this.hintView.setHighlight(true);
    } else {
      this.hintView.setDim(false);
    }
  }
}
