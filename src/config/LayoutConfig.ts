export const CELL_GAP = 2;
export const CELL_RADIUS = 4;

export const UI_PANEL_WIDTH = 180;
export const TIMER_BAR_HEIGHT = 8;

export const ROW_HINT_AREA_WIDTH = 120;
export const HINT_AREA_WIDTH = ROW_HINT_AREA_WIDTH;
export const COL_HINT_AREA_HEIGHT = 100;

export const ROW_HINT_FONT_SIZE = 14;
export const COL_HINT_FONT_SIZE = 12;
export const UI_FONT_SIZE_LARGE = 16;
export const UI_FONT_SIZE_MEDIUM = 14;
export const UI_FONT_SIZE_SMALL = 13;
export const UI_FONT_SIZE_MESSAGE = 24;
export const UI_LINE_HEIGHT = 28;

export const TOUCH_CONTROLS_HEIGHT = 120;

export const FINALE_CELL_SIZE = 8;
export const FINALE_CELL_GAP = 1;
export const FINALE_SCROLL_SPEED = 80;
export const FINALE_TITLE_Y = 30;
export const FINALE_SUBTITLE_Y = 70;

export const BASE_CANVAS_WIDTH = 798;
export const BASE_CANVAS_HEIGHT = 872;

const BASE_COLS = 10;
const BASE_CELL_SIZE = 48;
const BASE_HINT_AREA_WIDTH = 120;
const BASE_GRID_WIDTH = BASE_COLS * (BASE_CELL_SIZE + CELL_GAP) - CELL_GAP;
const BASE_GRID_HEIGHT = BASE_COLS * (BASE_CELL_SIZE + CELL_GAP) - CELL_GAP;

export function calcCellSize(cols: number): number {
  const maxWidth = BASE_CANVAS_WIDTH - UI_PANEL_WIDTH - 40;
  const maxCellSize = Math.floor((maxWidth + CELL_GAP) / cols - CELL_GAP);
  return Math.max(24, Math.min(BASE_CELL_SIZE, maxCellSize));
}

export function calcHintAreaWidth(cols: number): number {
  return Math.floor(BASE_HINT_AREA_WIDTH * (cols / BASE_COLS)) + 20;
}

export function gridWidth(cols: number): number {
  return cols * (calcCellSize(cols) + CELL_GAP) - CELL_GAP;
}

export function gridHeight(visibleRows: number, cols: number): number {
  return visibleRows * (calcCellSize(cols) + CELL_GAP) - CELL_GAP;
}

export function canvasWidth(cols: number): number {
  return calcHintAreaWidth(cols) + gridWidth(cols) + UI_PANEL_WIDTH;
}

export function canvasHeight(visibleRows: number, cols: number, touchMode: boolean = false): number {
  const base = COL_HINT_AREA_HEIGHT + gridHeight(visibleRows, cols) + TIMER_BAR_HEIGHT + 16;
  return touchMode ? base + TOUCH_CONTROLS_HEIGHT : base;
}

export const GRID_VISIBLE_ROWS = 15;
export const GRID_COLS = 10;
export const CELL_SIZE = BASE_CELL_SIZE;
export const GRID_WIDTH = BASE_GRID_WIDTH;
export const GRID_HEIGHT = BASE_GRID_HEIGHT;
export const CANVAS_WIDTH = BASE_GRID_WIDTH;
export const CANVAS_HEIGHT = BASE_CANVAS_HEIGHT;

export function isTouchDevice(): boolean {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}
