import { CellType, StageData } from '@/types/index.js';

const _ = CellType.EMPTY;
const X = CellType.FILLED;

const STAGE_PLUS: StageData = {
  id: 'plus',
  name: 'Plus',
  cols: 10,
  rows: [
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [X, X, X, X, X, X, X, X, X, X],
    [X, X, X, X, X, X, X, X, X, X],
    [X, X, X, X, X, X, X, X, X, X],
    [X, X, X, X, X, X, X, X, X, X],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
  ],
};

const STAGE_HEART: StageData = {
  id: 'heart',
  name: 'Heart',
  cols: 10,
  rows: [
    [_, X, X, _, _, _, _, X, X, _],
    [X, X, X, X, _, _, X, X, X, X],
    [X, X, X, X, X, X, X, X, X, X],
    [X, X, X, X, X, X, X, X, X, X],
    [_, X, X, X, X, X, X, X, X, _],
    [_, _, X, X, X, X, X, X, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, _, X, X, _, _, _, _],
  ],
};

const STAGE_ARROW: StageData = {
  id: 'arrow',
  name: 'Arrow',
  cols: 10,
  rows: [
    [_, _, _, _, X, X, _, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, X, X, X, X, X, X, _, _],
    [_, X, X, X, X, X, X, X, X, _],
    [X, X, X, X, X, X, X, X, X, X],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
    [_, _, _, X, X, X, X, _, _, _],
  ],
};

export const STAGES: StageData[] = [
  STAGE_PLUS,
  STAGE_HEART,
  STAGE_ARROW,
];
