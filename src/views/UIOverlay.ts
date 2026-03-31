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

const BTN_SIZE = 48;
const BTN_GAP = 4;

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

  private touchControlsContainer: Container;
  private dpadUp: Container;
  private dpadDown: Container;
  private dpadLeft: Container;
  private dpadRight: Container;
  private fillBtn: Container;
  private crossBtn: Container;

  private panelX = 0;
  private timerBarW = 0;
  private timerBarY = 0;
  private messageX = 0;
  private messageY = 0;
  private touchControlsY = 0;

  onPaintModeToggle?: () => void;
  onDpadUp?: () => void;
  onDpadDown?: () => void;
  onDpadLeft?: () => void;
  onDpadRight?: () => void;
  onFillPress?: () => void;
  onCrossPress?: () => void;

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

    this.touchControlsContainer = new Container();
    this.addChild(this.touchControlsContainer);
    this.touchControlsContainer.visible = false;

    this.dpadUp = this.createDPadButton('▲', COLORS.uiAccent);
    this.dpadDown = this.createDPadButton('▼', COLORS.uiAccent);
    this.dpadLeft = this.createDPadButton('◀', COLORS.uiAccent);
    this.dpadRight = this.createDPadButton('▶', COLORS.uiAccent);
    this.fillBtn = this.createActionButton('FILL', COLORS.cellFilled);
    this.crossBtn = this.createActionButton('×', COLORS.hintText);

    this.dpadUp.on('pointerdown', () => this.onDpadUp?.());
    this.dpadDown.on('pointerdown', () => this.onDpadDown?.());
    this.dpadLeft.on('pointerdown', () => this.onDpadLeft?.());
    this.dpadRight.on('pointerdown', () => this.onDpadRight?.());
    this.fillBtn.on('pointerdown', () => this.onFillPress?.());
    this.crossBtn.on('pointerdown', () => this.onCrossPress?.());

    this.touchControlsContainer.addChild(this.dpadUp);
    this.touchControlsContainer.addChild(this.dpadDown);
    this.touchControlsContainer.addChild(this.dpadLeft);
    this.touchControlsContainer.addChild(this.dpadRight);
    this.touchControlsContainer.addChild(this.fillBtn);
    this.touchControlsContainer.addChild(this.crossBtn);
  }

  private createDPadButton(label: string, color: number): Container {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
    bg.fill({ color: 0x1a1a2e });
    bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
    bg.stroke({ color, width: 2, alpha: 0.8 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'monospace', fontSize: 20, fill: color, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
      bg.fill({ color, alpha: 0.2 });
      bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
      bg.stroke({ color, width: 2, alpha: 1 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
      bg.fill({ color: 0x1a1a2e });
      bg.roundRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 8);
      bg.stroke({ color, width: 2, alpha: 0.8 });
    });

    return btn;
  }

  private createActionButton(label: string, color: number): Container {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const w = 80;
    const h = 48;
    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 8);
    bg.fill({ color: 0x1a1a2e });
    bg.roundRect(-w / 2, -h / 2, w, h, 8);
    bg.stroke({ color, width: 2, alpha: 0.8 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'monospace', fontSize: 16, fill: color, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-w / 2, -h / 2, w, h, 8);
      bg.fill({ color, alpha: 0.2 });
      bg.roundRect(-w / 2, -h / 2, w, h, 8);
      bg.stroke({ color, width: 2, alpha: 1 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-w / 2, -h / 2, w, h, 8);
      bg.fill({ color: 0x1a1a2e });
      bg.roundRect(-w / 2, -h / 2, w, h, 8);
      bg.stroke({ color, width: 2, alpha: 0.8 });
    });

    return btn;
  }

  setTouchMode(enabled: boolean): void {
    this.touchControlsContainer.visible = enabled;
    this.keysText.visible = !enabled;
  }

  setPaintMode(mode: PaintMode): void {
    if (mode === 'fill') {
      this.fillBtn.alpha = 1;
      this.crossBtn.alpha = 0.6;
    } else {
      this.fillBtn.alpha = 0.6;
      this.crossBtn.alpha = 1;
    }
  }

  updateGridDims(hintAreaWidth: number, gridW: number, gridH: number): void {
    this.panelX = hintAreaWidth + gridW + 12;
    this.timerBarW = gridW;
    this.timerBarY = COL_HINT_AREA_HEIGHT + gridH + 8;
    this.messageX = hintAreaWidth + gridW / 2;
    this.messageY = BASE_CANVAS_HEIGHT / 2;
    this.touchControlsY = COL_HINT_AREA_HEIGHT + gridH + TIMER_BAR_HEIGHT + 16;

    this.drawPanelBg();
    this.layoutElements();
    this.drawTimerBar(0);
    this.layoutTouchControls(hintAreaWidth, gridW);
  }

  private layoutTouchControls(hintAreaWidth: number, gridW: number): void {
    const centerX = hintAreaWidth + gridW / 2;
    const y = this.touchControlsY + 60;

    this.dpadUp.x = centerX;
    this.dpadUp.y = y - BTN_SIZE - BTN_GAP;

    this.dpadDown.x = centerX;
    this.dpadDown.y = y + BTN_SIZE + BTN_GAP;

    this.dpadLeft.x = centerX - BTN_SIZE - BTN_GAP;
    this.dpadLeft.y = y;

    this.dpadRight.x = centerX + BTN_SIZE + BTN_GAP;
    this.dpadRight.y = y;

    this.fillBtn.x = centerX - 60;
    this.fillBtn.y = y + BTN_SIZE + BTN_GAP + 20;

    this.crossBtn.x = centerX + 60;
    this.crossBtn.y = y + BTN_SIZE + BTN_GAP + 20;
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
