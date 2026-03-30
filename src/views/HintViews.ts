import { Container, Text } from 'pixi.js';
import { HintSegment } from '@/types/index.js';
import { CELL_GAP, COL_HINT_AREA_HEIGHT, ROW_HINT_FONT_SIZE, COL_HINT_FONT_SIZE } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import gsap from 'gsap';

function hintsToString(hints: HintSegment[]): string {
  if (hints.length === 1 && hints[0]!.run === 0) return '0';
  return hints.map(h => h.run).join(' ');
}

export class RowHintView extends Container {
  private textObj: Text;
  private hintAreaWidth: number;

  constructor(hintAreaWidth: number) {
    super();
    this.hintAreaWidth = hintAreaWidth;
    this.textObj = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: ROW_HINT_FONT_SIZE,
        fill: COLORS.hintText,
        align: 'right',
      },
    });
    this.addChild(this.textObj);
  }

  setHints(hints: HintSegment[]): void {
    this.textObj.text = hintsToString(hints);
    this.textObj.x = this.hintAreaWidth - this.textObj.width - 10;
    this.textObj.y = (CELL_GAP + 4 - this.textObj.height) / 2;
  }

  setDim(dim: boolean): void {
    this.textObj.tint = dim ? COLORS.hintTextDim : COLORS.hintText;
  }

  setHighlight(active: boolean): void {
    this.textObj.tint = active ? COLORS.hintHighlight : COLORS.hintText;
  }
}

export class ColHintView extends Container {
  private textObj: Text;
  private cellSize: number;

  constructor(cellSize: number) {
    super();
    this.cellSize = cellSize;
    this.textObj = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: COL_HINT_FONT_SIZE,
        fill: COLORS.hintText,
        align: 'center',
        wordWrap: false,
      },
    });
    this.addChild(this.textObj);
  }

  setHints(hints: HintSegment[]): void {
    const lines = hints.length === 1 && hints[0]!.run === 0
      ? ['0']
      : hints.map(h => String(h.run));
    this.textObj.text = lines.join('\n');
    this.textObj.x = (this.cellSize - this.textObj.width) / 2;
    this.textObj.y = COL_HINT_AREA_HEIGHT - this.textObj.height - 4;
  }

  setHighlight(active: boolean): void {
    this.textObj.tint = active ? COLORS.hintHighlight : COLORS.hintText;
  }
}

export class ColumnHintsContainer extends Container {
  private hintViews: ColHintView[] = [];
  private readonly cols: number;
  private _highlightedCol = -1;

  constructor(cols: number, cellSize: number) {
    super();
    this.cols = cols;
    this.setupViews(cellSize);
  }

  private setupViews(cellSize: number): void {
    for (let col = 0; col < this.cols; col++) {
      const view = new ColHintView(cellSize);
      view.x = col * (cellSize + CELL_GAP);
      view.y = 0;
      view.alpha = 0;
      this.addChild(view);
      this.hintViews.push(view);
    }
  }

  update(hints: HintSegment[][]): void {
    for (let col = 0; col < this.cols; col++) {
      const colHints = hints[col];
      if (colHints) {
        this.hintViews[col]?.setHints(colHints);
      }
    }
  }

  revealCol(col: number): void {
    const view = this.hintViews[col];
    if (!view) return;
    gsap.killTweensOf(view);
    gsap.to(view, { alpha: 1, duration: 0.3, ease: 'power2.out' });
  }

  hideCol(col: number): void {
    const view = this.hintViews[col];
    if (!view) return;
    gsap.killTweensOf(view);
    gsap.to(view, { alpha: 0, duration: 0.5, ease: 'power2.in' });
  }

  hideAll(): void {
    for (const view of this.hintViews) {
      gsap.killTweensOf(view);
      view.alpha = 0;
    }
  }

  showAll(): void {
    for (const view of this.hintViews) {
      gsap.killTweensOf(view);
      gsap.to(view, { alpha: 1, duration: 0.3, ease: 'power2.out' });
    }
  }

  highlightCol(col: number): void {
    if (this._highlightedCol === col) return;
    this.clearHighlight();
    this._highlightedCol = col;
    const view = this.hintViews[col];
    if (view) view.setHighlight(true);
  }

  clearHighlight(): void {
    if (this._highlightedCol >= 0) {
      const view = this.hintViews[this._highlightedCol];
      if (view) view.setHighlight(false);
    }
    this._highlightedCol = -1;
  }
}
