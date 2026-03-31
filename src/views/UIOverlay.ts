import { Container, Text, Graphics } from 'pixi.js';
import { MAX_HEARTS } from '@/config/GameConfig.js';
import {
  CANVAS_HEIGHT as BASE_CANVAS_HEIGHT,
  UI_PANEL_WIDTH,
  COL_HINT_AREA_HEIGHT,
  TIMER_BAR_HEIGHT,
  UI_FONT_SIZE_LARGE, UI_FONT_SIZE_MEDIUM, UI_FONT_SIZE_SMALL, UI_FONT_SIZE_MESSAGE, UI_LINE_HEIGHT,
} from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import { ScoreState, KeyBindings, PaintMode } from '@/types/index.js';
import { keyCodeToLabel } from '@/systems/KeyBindingsManager.js';

export class UIOverlay extends Container {
  private scoreText: Text;
  private levelText: Text;
  private comboText: Text;
  private linesText: Text;
  private heartsText: Text;
  private timeText: Text;
  private keysText: Text;
  private messageText: Text;
  private panelBg: Graphics;
  private timerBarBg: Graphics;
  private timerBarFill: Graphics;
  private paintModeBtn: Container;
  private paintModeBg: Graphics;
  private paintModeText: Text;
  private panelX = 0;
  private timerBarW = 0;
  private timerBarY = 0;
  private messageX = 0;
  private messageY = 0;
  private paintModeBtnX = 0;
  private paintModeBtnY = 0;

  onPaintModeToggle?: () => void;

  constructor() {
    super();

    this.panelBg = new Graphics();
    this.addChild(this.panelBg);

    this.timerBarBg = new Graphics();
    this.timerBarFill = new Graphics();
    this.addChild(this.timerBarBg);
    this.addChild(this.timerBarFill);

    this.scoreText = this.makeText('SCORE: 0', UI_FONT_SIZE_LARGE, COLORS.scoreText);
    this.levelText = this.makeText('LV 1', UI_FONT_SIZE_LARGE, COLORS.uiAccent);
    this.comboText = this.makeText('', UI_FONT_SIZE_LARGE, COLORS.comboText);
    this.linesText = this.makeText('LINES: 0', UI_FONT_SIZE_MEDIUM, COLORS.uiText);
    this.heartsText = this.makeText('', UI_FONT_SIZE_LARGE, COLORS.heartFull);
    this.timeText = this.makeText('TIME  0:00', UI_FONT_SIZE_MEDIUM, COLORS.hintText);
    this.keysText = this.makeText('', UI_FONT_SIZE_SMALL, COLORS.hintTextDim);
    this.messageText = this.makeText('', UI_FONT_SIZE_MESSAGE, COLORS.gameOverText);
    this.messageText.anchor.set(0.5);
    this.messageText.alpha = 0;
    this.addChild(this.messageText);

    this.paintModeBtn = new Container();
    this.paintModeBtn.eventMode = 'static';
    this.paintModeBtn.cursor = 'pointer';
    this.paintModeBtn.on('pointerdown', () => this.onPaintModeToggle?.());
    this.paintModeBg = new Graphics();
    this.paintModeBtn.addChild(this.paintModeBg);
    this.paintModeText = new Text({
      text: 'FILL',
      style: { fontFamily: 'monospace', fontSize: 12, fill: COLORS.uiAccent, fontWeight: 'bold' },
    });
    this.paintModeText.anchor.set(0.5);
    this.paintModeBtn.addChild(this.paintModeText);
    this.addChild(this.paintModeBtn);
    this.paintModeBtn.visible = false;
  }

  setTouchMode(enabled: boolean): void {
    this.paintModeBtn.visible = enabled;
    this.keysText.visible = !enabled;
  }

  setPaintMode(mode: PaintMode): void {
    if (mode === 'fill') {
      this.paintModeText.text = 'FILL';
      this.paintModeBg.clear();
      this.paintModeBg.roundRect(-30, -14, 60, 28, 4);
      this.paintModeBg.fill({ color: COLORS.cellFilled, alpha: 0.2 });
      this.paintModeBg.roundRect(-30, -14, 60, 28, 4);
      this.paintModeBg.stroke({ color: COLORS.cellFilled, width: 1.5 });
    } else {
      this.paintModeText.text = '×';
      this.paintModeText.style.fill = COLORS.hintText;
      this.paintModeBg.clear();
      this.paintModeBg.roundRect(-30, -14, 60, 28, 4);
      this.paintModeBg.fill({ color: COLORS.cellEmpty, alpha: 0.1 });
      this.paintModeBg.roundRect(-30, -14, 60, 28, 4);
      this.paintModeBg.stroke({ color: COLORS.hintText, width: 1.5 });
    }
  }

  updateGridDims(hintAreaWidth: number, gridW: number, gridH: number): void {
    this.panelX = hintAreaWidth + gridW + 12;
    this.timerBarW = gridW;
    this.timerBarY = COL_HINT_AREA_HEIGHT + gridH + 8;
    this.messageX = hintAreaWidth + gridW / 2;
    this.messageY = BASE_CANVAS_HEIGHT / 2;
    this.paintModeBtnX = hintAreaWidth + 10;
    this.paintModeBtnY = COL_HINT_AREA_HEIGHT + gridH + 24;

    this.drawPanelBg();
    this.layoutElements();
    this.drawTimerBar(0);
    this.layoutPaintModeBtn();
  }

  private layoutPaintModeBtn(): void {
    this.paintModeBtn.x = this.paintModeBtnX + 30;
    this.paintModeBtn.y = this.paintModeBtnY;
  }

  private makeText(content: string, size: number, color: number): Text {
    const t = new Text({
      text: content,
      style: { fontFamily: 'monospace', fontSize: size, fill: color },
    });
    this.addChild(t);
    return t;
  }

  private drawPanelBg(): void {
    const panelInnerW = UI_PANEL_WIDTH - 20;
    const panelH = COL_HINT_AREA_HEIGHT + (this.timerBarY - COL_HINT_AREA_HEIGHT);
    this.panelBg.clear();
    this.panelBg.rect(this.panelX - 8, COL_HINT_AREA_HEIGHT, panelInnerW + 16, panelH);
    this.panelBg.fill({ color: 0x0d0d1a, alpha: 0.6 });
    this.panelBg.rect(this.panelX - 8, COL_HINT_AREA_HEIGHT, panelInnerW + 16, panelH);
    this.panelBg.stroke({ color: COLORS.cellEmptyBorder, width: 1, alpha: 0.25 });
  }

  private layoutElements(): void {
    let y = COL_HINT_AREA_HEIGHT + 16;

    this.scoreText.x = this.panelX;
    this.scoreText.y = y; y += UI_LINE_HEIGHT;

    this.levelText.x = this.panelX;
    this.levelText.y = y; y += UI_LINE_HEIGHT;

    this.linesText.x = this.panelX;
    this.linesText.y = y; y += UI_LINE_HEIGHT;

    this.timeText.x = this.panelX;
    this.timeText.y = y; y += UI_LINE_HEIGHT;

    this.comboText.x = this.panelX;
    this.comboText.y = y; y += UI_LINE_HEIGHT;

    this.heartsText.x = this.panelX;
    this.heartsText.y = y; y += UI_LINE_HEIGHT + 12;

    this.keysText.x = this.panelX;
    this.keysText.y = y;

    this.messageText.x = this.messageX;
    this.messageText.y = this.messageY;

    this.timerBarBg.x = this.panelX - this.timerBarW - 12;
    this.timerBarBg.y = this.timerBarY;
    this.timerBarFill.x = this.panelX - this.timerBarW - 12;
    this.timerBarFill.y = this.timerBarY;
  }

  private drawTimerBar(progress: number): void {
    this.timerBarBg.clear();
    this.timerBarBg.rect(0, 0, this.timerBarW, TIMER_BAR_HEIGHT);
    this.timerBarBg.fill({ color: 0x1a1a2e, alpha: 0.8 });
    this.timerBarBg.rect(0, 0, this.timerBarW, TIMER_BAR_HEIGHT);
    this.timerBarBg.stroke({ color: COLORS.cellEmptyBorder, width: 1, alpha: 0.4 });

    const fillW = Math.max(0, Math.min(1, progress)) * this.timerBarW;
    const danger = progress > 0.75;
    const fillColor = danger ? COLORS.uiWarning : COLORS.uiAccent;

    this.timerBarFill.clear();
    if (fillW > 0) {
      this.timerBarFill.rect(0, 1, fillW, TIMER_BAR_HEIGHT - 2);
      this.timerBarFill.fill({ color: fillColor, alpha: 0.85 });
    }
  }

  updatePushTimer(progress: number): void {
    this.drawTimerBar(progress);
  }

  updateHearts(current: number): void {
    const full = '\u2665';
    const empty = '\u2661';
    this.heartsText.text = full.repeat(current) + empty.repeat(MAX_HEARTS - current);
  }

  updateScore(state: ScoreState): void {
    this.scoreText.text = `SCORE: ${state.score}`;
    this.levelText.text = `LV ${state.level}`;
    this.linesText.text = `LINES: ${state.linesCleared}`;
    this.comboText.text = state.combo > 1 ? `${state.combo}x COMBO!` : '';
  }

  showMessage(text: string, color: number = COLORS.uiText): void {
    this.messageText.text = text;
    this.messageText.style.fill = color;
    this.messageText.alpha = 1;
  }

  hideMessage(): void {
    this.messageText.alpha = 0;
  }

  showGameOver(): void {
    this.showMessage('GAME OVER\n[R] to restart\n[ESC] menu', COLORS.gameOverText);
  }

  showStageClear(): void {
    this.showMessage('STAGE CLEAR!\nPreparing finale...', COLORS.scoreText);
  }

  updateTime(elapsedMs: number): void {
    const totalSec = Math.floor(elapsedMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.timeText.text = `TIME  ${min}:${sec.toString().padStart(2, '0')}`;
  }

  updateKeys(bindings: KeyBindings): void {
    const u = keyCodeToLabel(bindings.up);
    const d = keyCodeToLabel(bindings.down);
    const l = keyCodeToLabel(bindings.left);
    const r = keyCodeToLabel(bindings.right);
    const f = keyCodeToLabel(bindings.fill);
    const x = keyCodeToLabel(bindings.cross);
    this.keysText.text =
      `KEYS\n` +
      `${u}${d}${l}${r}  Move\n` +
      `${f}    Fill\n` +
      `${x}    Cross\n` +
      `ESC  Menu`;
  }
}
