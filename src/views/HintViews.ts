import { Container, Text, Graphics } from 'pixi.js';
import { HintSegment } from '@/types/index.js';
import { CELL_SIZE, CELL_GAP, HINT_AREA_WIDTH, COL_HINT_AREA_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import gsap from 'gsap';

function hintsToString(hints: HintSegment[]): string {
  if (hints.length === 1 && hints[0]!.run === 0) return '0';
  return hints.map(h => h.run).join(' ');
}

export class RowHintView extends Container {
  private textObj: Text;

  constructor() {
    super();
    this.textObj = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: 14,
        fill: COLORS.hintText,
        align: 'right',
      },
    });
    this.addChild(this.textObj);
  }

  setHints(hints: HintSegment[]): void {
    this.textObj.text = hintsToString(hints);
    this.textObj.x = HINT_AREA_WIDTH - this.textObj.width - 10;
    this.textObj.y = (CELL_SIZE - this.textObj.height) / 2;
  }

  setDim(dim: boolean): void {
    this.textObj.tint = dim ? COLORS.hintTextDim : 0xffffff;
  }
}

export class ColHintView extends Container {
  private textObj: Text;

  constructor() {
    super();
    this.textObj = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
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
    this.textObj.x = (CELL_SIZE - this.textObj.width) / 2;
    this.textObj.y = COL_HINT_AREA_HEIGHT - this.textObj.height - 4;
  }
}

export class ColumnHintsContainer extends Container {
  private hintViews: ColHintView[] = [];
  private readonly cols: number;

  constructor(cols: number) {
    super();
    this.cols = cols;
    this.setupViews();
  }

  private setupViews(): void {
    for (let col = 0; col < this.cols; col++) {
      const view = new ColHintView();
      view.x = col * (CELL_SIZE + CELL_GAP);
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
}

export class DeadLineView extends Container {
  private line: Graphics;
  private _dangerTween: gsap.core.Tween | null = null;
  private _width: number;

  constructor(width: number) {
    super();
    this._width = width;
    this.line = new Graphics();
    this.addChild(this.line);
    this.draw(1, 0.8);
  }

  private draw(lineWidth: number, alpha: number): void {
    this.line.clear();
    this.line.moveTo(0, 0);
    this.line.lineTo(this._width, 0);
    this.line.stroke({ color: COLORS.deadLine, width: lineWidth, alpha });
  }

  setDanger(level: number): void {
    this._dangerTween?.kill();
    this._dangerTween = null;

    if (level <= 0) {
      this.draw(2, 0.8);
      return;
    }

    const maxWidth = 2 + level * 2;
    this.draw(maxWidth, 0.8 + level * 0.1);

    if (level >= 1) {
      this._dangerTween = gsap.to(this.line, {
        alpha: 0.2,
        duration: 0.4 - level * 0.08,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
  }
}
