import { HINT_CLEAR_INTERVAL, HINT_PUSH_INTERVAL, HINT_REVEAL_DURATION_MS } from '@/config/GameConfig.js';

export class HintTokenSystem {
  private tokens = 0;
  private clearsSinceLastToken = 0;
  private pushesSinceLastToken = 0;
  private revealTimers: Map<number, number> = new Map();

  onRevealCol?: (col: number) => void;
  onHideCol?: (col: number) => void;
  onTokensChanged?: (tokens: number) => void;

  private readonly totalCols: number;

  constructor(cols: number) {
    this.totalCols = cols;
  }

  reset(): void {
    for (const timerId of this.revealTimers.values()) {
      clearTimeout(timerId);
    }
    this.revealTimers.clear();
    this.tokens = 0;
    this.clearsSinceLastToken = 0;
    this.pushesSinceLastToken = 0;
    this.onTokensChanged?.(0);
  }

  onRowCleared(): void {
    this.clearsSinceLastToken++;
    if (this.clearsSinceLastToken >= HINT_CLEAR_INTERVAL) {
      this.clearsSinceLastToken = 0;
      this.addToken();
    }
  }

  onRowPushed(): void {
    this.pushesSinceLastToken++;
    if (this.pushesSinceLastToken >= HINT_PUSH_INTERVAL) {
      this.pushesSinceLastToken = 0;
      this.addToken();
    }
  }

  private addToken(): void {
    this.tokens++;
    this.onTokensChanged?.(this.tokens);
    this.consumeToken();
  }

  private consumeToken(): void {
    if (this.tokens <= 0) return;

    const available = this.getAvailableCols();
    if (available.length === 0) return;

    this.tokens--;
    this.onTokensChanged?.(this.tokens);

    const col = available[Math.floor(Math.random() * available.length)]!;
    this.revealCol(col);
  }

  private getAvailableCols(): number[] {
    const result: number[] = [];
    for (let col = 0; col < this.totalCols; col++) {
      if (!this.revealTimers.has(col)) {
        result.push(col);
      }
    }
    return result;
  }

  private revealCol(col: number): void {
    this.onRevealCol?.(col);

    const timerId = window.setTimeout(() => {
      this.revealTimers.delete(col);
      this.onHideCol?.(col);
    }, HINT_REVEAL_DURATION_MS);

    this.revealTimers.set(col, timerId);
  }

  get tokenCount(): number {
    return this.tokens;
  }
}
