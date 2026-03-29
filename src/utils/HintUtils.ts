import { CellState, HintSegment } from '@/types/index.js';

export function calculateHints(cells: CellState[]): HintSegment[] {
  const segments: HintSegment[] = [];
  let run = 0;

  for (const cell of cells) {
    if (cell === CellState.FILLED) {
      run++;
    } else if (run > 0) {
      segments.push({ value: 1, run });
      run = 0;
    }
  }
  if (run > 0) {
    segments.push({ value: 1, run });
  }

  return segments.length === 0 ? [{ value: 0, run: 0 }] : segments;
}

export function hintsEqual(a: HintSegment[], b: HintSegment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    if (ai.run !== bi.run || ai.value !== bi.value) return false;
  }
  return true;
}

export function validateRow(playerCells: CellState[], solutionHints: HintSegment[]): boolean {
  const hasCrossedOrFilled = playerCells.some(
    c => c === CellState.FILLED || c === CellState.CROSSED
  );
  if (!hasCrossedOrFilled) return false;

  const playerHints = calculateHints(playerCells);
  return hintsEqual(playerHints, solutionHints);
}

export function calculateColumnHints(
  rows: number[][],
  colCount: number
): HintSegment[][] {
  const result: HintSegment[][] = [];
  for (let col = 0; col < colCount; col++) {
    const column = rows.map(row => (row[col] ?? 0) === 1 ? CellState.FILLED : CellState.EMPTY);
    result.push(calculateHints(column));
  }
  return result;
}

export function calculateColumnHintsWithBoundary(
  rows: number[][],
  hiddenCount: number,
  colCount: number
): HintSegment[][] {
  const result: HintSegment[][] = [];
  for (let col = 0; col < colCount; col++) {
    let boundaryCount = 0;
    for (let i = hiddenCount - 1; i >= 0; i--) {
      if ((rows[i]?.[col] ?? 0) === 1) {
        boundaryCount++;
      } else {
        break;
      }
    }

    const visibleCells = rows
      .slice(hiddenCount)
      .map(row => (row[col] ?? 0) === 1 ? CellState.FILLED : CellState.EMPTY);

    const fullColumn: CellState[] = [
      ...Array(boundaryCount).fill(CellState.FILLED),
      ...visibleCells,
    ];

    result.push(calculateHints(fullColumn));
  }
  return result;
}
