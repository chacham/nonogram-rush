import { ClearedRowRecord, CellType } from '@/types/index.js';
import { SESSION_STORAGE_KEY } from '@/config/GameConfig.js';

export class ClearedRowBuffer {
  private records: ClearedRowRecord[] = [];

  push(solution: CellType[]): void {
    this.records.push({ solution: [...solution], clearedAt: Date.now() });
  }

  getAll(): ClearedRowRecord[] {
    return this.records;
  }

  clear(): void {
    this.records = [];
  }

  saveToSession(): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.records));
  }

  loadFromSession(): void {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        this.records = JSON.parse(stored) as ClearedRowRecord[];
      } catch {
        this.records = [];
      }
    }
  }

  get count(): number {
    return this.records.length;
  }
}
