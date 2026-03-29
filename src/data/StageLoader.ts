import { CellType, StageData } from '@/types/index.js';

interface RawStageData {
  id: string;
  name: string;
  cols: number;
  rows: number[][];
}

function parseRawStage(raw: RawStageData): StageData {
  return {
    id: raw.id,
    name: raw.name,
    cols: raw.cols,
    rows: raw.rows.map(row => row.map(v => (v === 1 ? CellType.FILLED : CellType.EMPTY))),
  };
}

export async function loadCustomStages(): Promise<StageData[]> {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}stages/manifest.json`);
    if (!res.ok) return [];
    const filenames: string[] = await res.json();
    const stages: StageData[] = [];
    for (const name of filenames) {
      try {
        const r = await fetch(`${base}stages/${name}`);
        if (!r.ok) continue;
        const raw: RawStageData = await r.json();
        stages.push(parseRawStage(raw));
      } catch { }
    }
    return stages;
  } catch {
    return [];
  }
}
