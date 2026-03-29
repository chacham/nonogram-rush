export const GRID_COLS = 10;
export const GRID_VISIBLE_ROWS = 12;

export const CELL_SIZE = 48;
export const CELL_GAP = 2;
export const HINT_AREA_WIDTH = 120;
export const COL_HINT_AREA_HEIGHT = 100;

export const PUSH_INTERVAL_BASE = 5000;
export const PUSH_INTERVAL_MIN = 1500;
export const PUSH_ANIMATION_DURATION = 300;
export const CLEAR_ANIMATION_DURATION = 400;
export const COMBO_WINDOW_MS = 2000;
export const COMBO_FREEZE_DURATION = 1500;

export const LEVEL_UP_LINES = 10;
export const SPEED_FACTOR = 0.85;

export const SCORE_PER_LINE = 100;
export const COMBO_MULTIPLIER = 0.5;

export const GRID_WIDTH = GRID_COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
export const GRID_HEIGHT = GRID_VISIBLE_ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

export const CANVAS_WIDTH = HINT_AREA_WIDTH + GRID_WIDTH + 40;
export const CANVAS_HEIGHT = COL_HINT_AREA_HEIGHT + GRID_HEIGHT + 60;

export const STAGE_GOAL_LINES = 30;

export const SESSION_STORAGE_KEY = 'nonogram-rush-cleared-rows';
