import {
  CELL_SIZE, CELL_GAP,
  GRID_WIDTH, GRID_HEIGHT,
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_VISIBLE_ROWS,
} from './LayoutConfig.js';

export {
  GRID_WIDTH, GRID_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT,
  CELL_SIZE, CELL_GAP, GRID_VISIBLE_ROWS,
};

export const GRID_COLS = 10;

export const PUSH_INTERVAL_BASE = 16000;
export const PUSH_INTERVAL_MIN = 300;
export const PUSH_INTERVAL_SCALE = 1.0;
export const PUSH_ANIMATION_DURATION = 300;
export const CLEAR_ANIMATION_DURATION = 400;
export const COMBO_WINDOW_MS = 2000;
export const COMBO_FREEZE_DURATION = 1500;

export const SCORE_PER_LINE = 100;
export const COMBO_MULTIPLIER = 0.5;
export const LEVEL_UP_LINES = 10;

export const STAGE_GOAL_LINES = 30;

export const MAX_HEARTS = 5;

export const ROW_FILL_RATIO = 0.5;

export const DEFAULT_GAME_MODE = 'ASSISTED' as const;

export const SESSION_STORAGE_KEY = 'nonogram-rush-cleared-rows';
