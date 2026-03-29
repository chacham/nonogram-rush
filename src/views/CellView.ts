import { Container, Graphics } from 'pixi.js';
import { CellState } from '@/types/index.js';
import { CELL_SIZE, CELL_RADIUS } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';

const CROSS_MARGIN = 8;
const CROSS_STROKE = 2.5;
const CURSOR_STROKE = 2.5;
const CURSOR_FILL_ALPHA = 0.25;

export class CellView extends Container {
  private bg: Graphics;
  private mark: Graphics;
  private highlight: Graphics;
  private _cellState: CellState = CellState.EMPTY;
  private _row = 0;
  private _col = 0;

  constructor() {
    super();
    this.bg = new Graphics();
    this.mark = new Graphics();
    this.highlight = new Graphics();
    this.addChild(this.bg);
    this.addChild(this.mark);
    this.addChild(this.highlight);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.drawEmpty();
  }

  get cellRow(): number { return this._row; }
  get cellCol(): number { return this._col; }
  get cellState(): CellState { return this._cellState; }

  setup(row: number, col: number): void {
    this._row = row;
    this._col = col;
  }

  setState(state: CellState): void {
    this._cellState = state;
    switch (state) {
      case CellState.EMPTY: this.drawEmpty(); break;
      case CellState.FILLED: this.drawFilled(); break;
      case CellState.CROSSED: this.drawCrossed(); break;
    }
  }

  private drawEmpty(): void {
    this.bg.clear();
    this.bg.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
    this.bg.fill({ color: COLORS.cellEmpty });
    this.bg.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
    this.bg.stroke({ color: COLORS.cellEmptyBorder, width: 1 });
    this.mark.clear();
  }

  private drawFilled(): void {
    this.bg.clear();
    this.bg.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
    this.bg.fill({ color: COLORS.cellFilled });
    this.bg.roundRect(1, 1, CELL_SIZE - 2, CELL_SIZE - 2, CELL_RADIUS - 1);
    this.bg.stroke({ color: COLORS.cellFilledSheen, width: 1, alpha: 0.3 });
    this.mark.clear();
  }

  private drawCrossed(): void {
    this.bg.clear();
    this.bg.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
    this.bg.fill({ color: COLORS.cellEmpty });
    this.bg.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
    this.bg.stroke({ color: COLORS.cellCrossedBorder, width: 1 });

    this.mark.clear();
    this.mark.moveTo(CROSS_MARGIN, CROSS_MARGIN);
    this.mark.lineTo(CELL_SIZE - CROSS_MARGIN, CELL_SIZE - CROSS_MARGIN);
    this.mark.stroke({ color: COLORS.cellCrossed, width: CROSS_STROKE });
    this.mark.moveTo(CELL_SIZE - CROSS_MARGIN, CROSS_MARGIN);
    this.mark.lineTo(CROSS_MARGIN, CELL_SIZE - CROSS_MARGIN);
    this.mark.stroke({ color: COLORS.cellCrossed, width: CROSS_STROKE });
  }

  setHighlight(active: boolean): void {
    this.highlight.clear();
    if (active) {
      this.highlight.roundRect(0, 0, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
      this.highlight.fill({ color: COLORS.cursorHighlight, alpha: CURSOR_FILL_ALPHA });
      this.highlight.roundRect(1, 1, CELL_SIZE - 2, CELL_SIZE - 2, CELL_RADIUS - 1);
      this.highlight.stroke({ color: COLORS.cursorHighlight, width: CURSOR_STROKE, alpha: 1 });
    }
  }

  reset(): void {
    this._cellState = CellState.EMPTY;
    this._row = 0;
    this._col = 0;
    this.drawEmpty();
    this.highlight.clear();
    this.alpha = 1;
  }
}
