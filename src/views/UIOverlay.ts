import { Container, Text, Graphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HINT_AREA_WIDTH, GRID_WIDTH, COL_HINT_AREA_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { ScoreState } from '@/types/index.js';

const TIMER_BAR_W = GRID_WIDTH;
const TIMER_BAR_H = 6;

export class UIOverlay extends Container {
  private scoreText: Text;
  private levelText: Text;
  private comboText: Text;
  private linesText: Text;
  private hintTokenText: Text;
  private messageText: Text;
  private panel: Graphics;
  private timerBarBg: Graphics;
  private timerBarFill: Graphics;

  constructor() {
    super();
    this.panel = new Graphics();
    this.addChild(this.panel);

    this.timerBarBg = new Graphics();
    this.timerBarFill = new Graphics();
    this.addChild(this.timerBarBg);
    this.addChild(this.timerBarFill);

    this.scoreText = this.makeText('SCORE: 0', 16, COLORS.scoreText);
    this.levelText = this.makeText('LV 1', 16, COLORS.uiAccent);
    this.comboText = this.makeText('', 18, COLORS.comboText);
    this.linesText = this.makeText('LINES: 0', 14, COLORS.uiText);
    this.hintTokenText = this.makeText('', 13, COLORS.hintText);
    this.messageText = this.makeText('', 24, COLORS.gameOverText);

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

  private layoutElements(): void {
    const rightX = CANVAS_WIDTH - 150;

    this.scoreText.x = rightX;
    this.scoreText.y = 10;

    this.levelText.x = rightX;
    this.levelText.y = 35;

    this.linesText.x = rightX;
    this.linesText.y = 60;

    this.comboText.x = rightX;
    this.comboText.y = 90;

    this.hintTokenText.x = rightX;
    this.hintTokenText.y = 115;

    this.messageText.x = CANVAS_WIDTH / 2;
    this.messageText.y = CANVAS_HEIGHT / 2;
    this.messageText.anchor.set(0.5);
    this.messageText.alpha = 0;

    const barY = COL_HINT_AREA_HEIGHT - TIMER_BAR_H - 4;
    this.timerBarBg.x = HINT_AREA_WIDTH;
    this.timerBarBg.y = barY;
    this.timerBarFill.x = HINT_AREA_WIDTH;
    this.timerBarFill.y = barY;
  }

  private drawTimerBar(progress: number): void {
    this.timerBarBg.clear();
    this.timerBarBg.rect(0, 0, TIMER_BAR_W, TIMER_BAR_H);
    this.timerBarBg.fill({ color: 0x1a1a2e, alpha: 0.8 });
    this.timerBarBg.rect(0, 0, TIMER_BAR_W, TIMER_BAR_H);
    this.timerBarBg.stroke({ color: COLORS.cellEmptyBorder, width: 1, alpha: 0.4 });

    const fillW = Math.max(0, Math.min(1, progress)) * TIMER_BAR_W;
    const danger = progress > 0.75;
    const fillColor = danger ? COLORS.uiWarning : COLORS.uiAccent;

    this.timerBarFill.clear();
    if (fillW > 0) {
      this.timerBarFill.rect(0, 1, fillW, TIMER_BAR_H - 2);
      this.timerBarFill.fill({ color: fillColor, alpha: 0.85 });
    }
  }

  updatePushTimer(progress: number): void {
    this.drawTimerBar(progress);
  }

  updateHintTokens(count: number): void {
    this.hintTokenText.text = count > 0 ? `HINT x${count}` : '';
  }

  updateScore(state: ScoreState): void {
    this.scoreText.text = `SCORE: ${state.score}`;
    this.levelText.text = `LV ${state.level}`;
    this.linesText.text = `LINES: ${state.linesCleared}`;
    if (state.combo > 1) {
      this.comboText.text = `${state.combo}x COMBO!`;
    } else {
      this.comboText.text = '';
    }
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
