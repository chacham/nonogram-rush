import { CellType, HintSegment, RowData, CellState } from '@/types/index.js';
import { calculateHints } from '@/utils/HintUtils.js';
import { GRID_COLS, ROW_FILL_RATIO } from '@/config/GameConfig.js';

let rowCounter = 0;

function generateSolution(cols: number, fillRatio = 0.5): CellType[] {
  const solution: CellType[] = [];
  for (let i = 0; i < cols; i++) {
    solution.push(Math.random() < fillRatio ? CellType.FILLED : CellType.EMPTY);
  }
  return solution;
}

function solutionToCellStates(solution: CellType[]): CellState[] {
  return solution.map(t => (t === CellType.FILLED ? CellState.FILLED : CellState.EMPTY));
}

export function generateRow(cols: number = GRID_COLS, fillRatio: number = ROW_FILL_RATIO): RowData {
  const solution = generateSolution(cols, fillRatio);
  const solutionAsStates = solutionToCellStates(solution);
  const hints = calculateHints(solutionAsStates);
  const cells = new Array<CellState>(cols).fill(CellState.EMPTY);

  return {
    solution,
    hints,
    cells,
    cleared: false,
    originalIndex: rowCounter++,
  };
}

export function resetRowCounter(): void {
  rowCounter = 0;
}

export function getHintsForSolution(solution: CellType[]): HintSegment[] {
  const states = solution.map(t => (t === CellType.FILLED ? CellState.FILLED : CellState.EMPTY));
  return calculateHints(states);
}
