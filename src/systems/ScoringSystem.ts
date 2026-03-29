import { ScoreState } from '@/types/index.js';
import {
  SCORE_PER_LINE,
  COMBO_MULTIPLIER,
  COMBO_WINDOW_MS,
  LEVEL_UP_LINES,
} from '@/config/GameConfig.js';

export class ScoringSystem {
  private state: ScoreState = {
    score: 0,
    linesCleared: 0,
    level: 1,
    combo: 0,
    lastClearTime: 0,
  };

  onLinesCleared(count: number): { points: number; isCombo: boolean } {
    const now = Date.now();
    const timeSinceLast = now - this.state.lastClearTime;
    const isCombo = timeSinceLast <= COMBO_WINDOW_MS && this.state.combo > 0;

    if (isCombo) {
      this.state.combo++;
    } else {
      this.state.combo = 1;
    }

    const comboBonus = isCombo ? Math.floor(this.state.combo * COMBO_MULTIPLIER * SCORE_PER_LINE) : 0;
    const points = count * SCORE_PER_LINE * this.state.level + comboBonus;

    this.state.score += points;
    this.state.linesCleared += count;
    this.state.lastClearTime = now;
    this.state.level = Math.floor(this.state.linesCleared / LEVEL_UP_LINES) + 1;

    return { points, isCombo };
  }

  get current(): ScoreState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      score: 0,
      linesCleared: 0,
      level: 1,
      combo: 0,
      lastClearTime: 0,
    };
  }
}
