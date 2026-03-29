export class ColHintRevealSystem {
  private revealed: Set<number> = new Set();
  private readonly totalCols: number;

  onRevealCol?: (col: number) => void;
  onHideCol?: (col: number) => void;

  constructor(cols: number) {
    this.totalCols = cols;
  }

  reset(): void {
    for (const col of this.revealed) {
      this.onHideCol?.(col);
    }
    this.revealed.clear();
  }

  onRowPushed(): void {
    const hidden = this.getHiddenCols();
    if (hidden.length === 0) return;
    const col = hidden[Math.floor(Math.random() * hidden.length)]!;
    this.revealed.add(col);
    this.onRevealCol?.(col);
  }

  onRowCleared(): void {
    if (this.revealed.size === 0) return;
    const revealedArr = Array.from(this.revealed);
    const col = revealedArr[Math.floor(Math.random() * revealedArr.length)]!;
    this.revealed.delete(col);
    this.onHideCol?.(col);
  }

  private getHiddenCols(): number[] {
    const result: number[] = [];
    for (let col = 0; col < this.totalCols; col++) {
      if (!this.revealed.has(col)) result.push(col);
    }
    return result;
  }

  get revealedCount(): number {
    return this.revealed.size;
  }
}
