import { Container, Text, Graphics } from 'pixi.js';
import {
  CANVAS_HEIGHT, GRID_WIDTH, GRID_HEIGHT, MAX_HEARTS,
} from '@/config/GameConfig.js';
import {
  HINT_AREA_WIDTH, COL_HINT_AREA_HEIGHT,
  UI_PANEL_WIDTH, TIMER_BAR_HEIGHT,
  UI_FONT_SIZE_LARGE, UI_FONT_SIZE_MEDIUM, UI_FONT_SIZE_MESSAGE, UI_LINE_HEIGHT,
} from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import { ScoreState } from '@/types/index.js';

const PANEL_X = HINT_AREA_WIDTH + GRID_WIDTH + 12;
const PANEL_INNER_W = UI_PANEL_WIDTH - 20;

const TIMER_BAR_Y = COL_HINT_AREA_HEIGHT + GRID_HEIGHT + 8;
const TIMER_BAR_W = GRID_WIDTH;

export class UIOverlay extends Container {
  private scoreText: Text;
  private levelText: Text;
  private comboText: Text;
  private linesText: Text;
  private heartsText: Text;
  private messageText: Text;
  private panelBg: Graphics;
  private timerBarBg: Graphics;
  private timerBarFill: Graphics;

  constructor() {
    super();

    this.panelBg = new Graphics();
    this.addChild(this.panelBg);
    this.drawPanelBg();

    this.timerBarBg = new Graphics();
    this.timerBarFill = new Graphics();
    this.addChild(this.timerBarBg);
    this.addChild(this.timerBarFill);

    this.scoreText = this.makeText('SCORE: 0', UI_FONT_SIZE_LARGE, COLORS.scoreText);
    this.levelText = this.makeText('LV 1', UI_FONT_SIZE_LARGE, COLORS.uiAccent);
    this.comboText = this.makeText('', UI_FONT_SIZE_LARGE, COLORS.comboText);
    this.linesText = this.makeText('LINES: 0', UI_FONT_SIZE_MEDIUM, COLORS.uiText);
    this.heartsText = this.makeText('', UI_FONT_SIZE_LARGE, COLORS.heartFull);
    this.messageText = this.makeText('', UI_FONT_SIZE_MESSAGE, COLORS.gameOverText);

    this.layoutElements();
    this.drawTimerBar(0);
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
    const panelH = COL_HINT_AREA_HEIGHT + GRID_HEIGHT;
    this.panelBg.clear();
    this.panelBg.rect(PANEL_X - 8, COL_HINT_AREA_HEIGHT, PANEL_INNER_W + 16, panelH);
    this.panelBg.fill({ color: 0x0d0d1a, alpha: 0.6 });
    this.panelBg.rect(PANEL_X - 8, COL_HINT_AREA_HEIGHT, PANEL_INNER_W + 16, panelH);
    this.panelBg.stroke({ color: COLORS.cellEmptyBorder, width: 1, alpha: 0.25 });
  }

  private layoutElements(): void {
    let y = COL_HINT_AREA_HEIGHT + 16;

    this.scoreText.x = PANEL_X;
    this.scoreText.y = y; y += UI_LINE_HEIGHT;

    this.levelText.x = PANEL_X;
    this.levelText.y = y; y += UI_LINE_HEIGHT;

    this.linesText.x = PANEL_X;
    this.linesText.y = y; y += UI_LINE_HEIGHT;

    this.comboText.x = PANEL_X;
    this.comboText.y = y; y += UI_LINE_HEIGHT;

    this.heartsText.x = PANEL_X;
    this.heartsText.y = y;

    this.messageText.x = HINT_AREA_WIDTH + GRID_WIDTH / 2;
    this.messageText.y = CANVAS_HEIGHT / 2;
    this.messageText.anchor.set(0.5);
    this.messageText.alpha = 0;

    this.timerBarBg.x = HINT_AREA_WIDTH;
    this.timerBarBg.y = TIMER_BAR_Y;
    this.timerBarFill.x = HINT_AREA_WIDTH;
    this.timerBarFill.y = TIMER_BAR_Y;
  }

  private drawTimerBar(progress: number): void {
    this.timerBarBg.clear();
    this.timerBarBg.rect(0, 0, TIMER_BAR_W, TIMER_BAR_HEIGHT);
    this.timerBarBg.fill({ color: 0x1a1a2e, alpha: 0.8 });
    this.timerBarBg.rect(0, 0, TIMER_BAR_W, TIMER_BAR_HEIGHT);
    this.timerBarBg.stroke({ color: COLORS.cellEmptyBorder, width: 1, alpha: 0.4 });

    const fillW = Math.max(0, Math.min(1, progress)) * TIMER_BAR_W;
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
    this.showMessage('GAME OVER\n[R] to restart', COLORS.gameOverText);
  }

  showStageClear(): void {
    this.showMessage('STAGE CLEAR!\nPreparing finale...', COLORS.scoreText);
  }
}
