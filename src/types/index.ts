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
  stageRowIndex?: number;
}

export enum GameMode {
  ASSISTED = 'ASSISTED',
  NORMAL = 'NORMAL',
}

export enum PlayMode {
  STAGE = 'STAGE',
  ENDLESS = 'ENDLESS',
}

export type InputMode = 'touchscreen' | 'keyboard';

export type PaintMode = 'fill' | 'cross';

export interface StageData {
  id: string;
  name: string;
  cols: number;
  rows: CellType[][];
}

export enum GameState {
  MENU = 'MENU',
  SETTINGS = 'SETTINGS',
  IDLE = 'IDLE',
  PUSHING = 'PUSHING',
  CLEARING = 'CLEARING',
  GAME_OVER = 'GAME_OVER',
  FINALE = 'FINALE',
}

export interface KeyBindings {
  fill: string;
  cross: string;
  up: string;
  down: string;
  left: string;
  right: string;
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
  originalRowIndex: number;
}
