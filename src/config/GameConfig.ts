import { CELL_SIZE, CELL_GAP, HINT_AREA_WIDTH, COL_HINT_AREA_HEIGHT, UI_PANEL_WIDTH, TIMER_BAR_HEIGHT } from './LayoutConfig.js';

export const GRID_COLS = 10;
export const GRID_VISIBLE_ROWS = 15;

export const GRID_WIDTH = GRID_COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
export const GRID_HEIGHT = GRID_VISIBLE_ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;

export const CANVAS_WIDTH = HINT_AREA_WIDTH + GRID_WIDTH + UI_PANEL_WIDTH;
export const CANVAS_HEIGHT = COL_HINT_AREA_HEIGHT + GRID_HEIGHT + TIMER_BAR_HEIGHT + 16;

export const PUSH_INTERVAL_BASE = 16000;
export const PUSH_INTERVAL_MIN = 1000;
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

export const SESSION_STORAGE_KEY = 'nonogram-rush-cleared-rows';
