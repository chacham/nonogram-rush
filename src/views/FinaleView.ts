import { Container, Graphics, Text } from 'pixi.js';
import { ClearedRowRecord, CellType } from '@/types/index.js';
import {
  FINALE_CELL_SIZE, FINALE_CELL_GAP, FINALE_SCROLL_SPEED,
  FINALE_TITLE_Y, FINALE_SUBTITLE_Y,
} from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import gsap from 'gsap';

export class FinaleView extends Container {
  private artContainer: Container;
  private overlay: Graphics;
  private titleText: Text;
  private subtitleText: Text;
  private _isScrolling = false;
  private _cw = 0;
  private _ch = 0;

  constructor() {
    super();

    this.overlay = new Graphics();
    this.addChild(this.overlay);

    this.titleText = new Text({
      text: 'YOUR MASTERPIECE',
      style: { fontFamily: 'monospace', fontSize: 28, fill: COLORS.uiAccent },
    });
    this.titleText.y = FINALE_TITLE_Y;
    this.titleText.anchor.set(0.5, 0);
    this.addChild(this.titleText);

    this.subtitleText = new Text({
      text: '',
      style: { fontFamily: 'monospace', fontSize: 14, fill: COLORS.hintText },
    });
    this.subtitleText.y = FINALE_SUBTITLE_Y;
    this.subtitleText.anchor.set(0.5, 0);
    this.addChild(this.subtitleText);

    this.artContainer = new Container();
    this.addChild(this.artContainer);

    this.visible = false;
  }

  show(records: ClearedRowRecord[], elapsedMs: number, onComplete: () => void): void {
    this.visible = true;
    this._isScrolling = false;
    this._cw = this.parent?.width ?? 798;
    this._ch = this.parent?.height ?? 872;
    this.artContainer.removeChildren();

    this.overlay.clear();
    this.overlay.rect(0, 0, this._cw, this._ch);
    this.overlay.fill({ color: COLORS.finaleBackground, alpha: 0.97 });

    this.titleText.x = this._cw / 2;
    this.subtitleText.x = this._cw / 2;

    if (records.length === 0) {
      this.subtitleText.text = 'No rows cleared!';
      gsap.delayedCall(3, onComplete);
      return;
    }

    const sorted = [...records].sort((a, b) => a.originalRowIndex - b.originalRowIndex);

    const cols = sorted[0]!.solution.length;
    const rowHeight = FINALE_CELL_SIZE + FINALE_CELL_GAP;
    const artWidth = cols * rowHeight - FINALE_CELL_GAP;
    const artHeight = sorted.length * rowHeight;

    const startX = (this._cw - artWidth) / 2;

    for (let r = 0; r < sorted.length; r++) {
      const record = sorted[r]!;
      for (let c = 0; c < cols; c++) {
        const cell = new Graphics();
        const isFilled = record.solution[c] === CellType.FILLED;
        cell.rect(0, 0, FINALE_CELL_SIZE, FINALE_CELL_SIZE);
        cell.fill({ color: isFilled ? COLORS.cellFilled : COLORS.cellEmpty });
        cell.x = startX + c * rowHeight;
        cell.y = r * rowHeight;
        this.artContainer.addChild(cell);
      }
    }

    const totalSec = Math.floor(elapsedMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;

    this.subtitleText.text = `${sorted.length} rows | ${timeStr} | scroll to reveal`;

    this.artContainer.y = this._ch;
    const finalY = this._ch / 2 - artHeight / 2;
    const scrollDist = artHeight + this._ch;
    const scrollDuration = scrollDist / FINALE_SCROLL_SPEED;

    this._isScrolling = true;
    gsap.to(this.artContainer, {
      y: finalY - artHeight,
      duration: scrollDuration,
      ease: 'none',
      onComplete: () => {
        this._isScrolling = false;
        gsap.delayedCall(2, onComplete);
      },
    });
  }

  hide(): void {
    gsap.killTweensOf(this.artContainer);
    this.visible = false;
    this._isScrolling = false;
  }

  get isScrolling(): boolean { return this._isScrolling; }
}
