export enum CellType {
  EMPTY = 0,
  FILLED = 1,
}

export enum CellState {
  EMPTY = 0,
  FILLED = 1,
  CROSSED = 2,
}

export interface HintSegment {
  value: number;
  run: number;
}

export interface RowData {
  solution: CellType[];
  hints: HintSegment[];
  cells: CellState[];
  cleared: boolean;
  originalIndex: number;
}

export enum GameState {
  IDLE = 'IDLE',
  PUSHING = 'PUSHING',
  CLEARING = 'CLEARING',
  GAME_OVER = 'GAME_OVER',
  FINALE = 'FINALE',
}

export interface ScoreState {
  score: number;
  linesCleared: number;
  level: number;
  combo: number;
  lastClearTime: number;
}

export interface ClearedRowRecord {
  solution: CellType[];
  clearedAt: number;
}
