import { KeyBindings } from '@/types/index.js';

const STORAGE_KEY = 'nonogram-rush-keybindings';

const DEFAULT_BINDINGS: KeyBindings = {
  fill: 'KeyF',
  cross: 'KeyX',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

export function getDefaultBindings(): KeyBindings {
  return { ...DEFAULT_BINDINGS };
}

export function loadBindings(): KeyBindings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultBindings();
    const parsed = JSON.parse(raw) as Partial<KeyBindings>;
    return { ...DEFAULT_BINDINGS, ...parsed };
  } catch {
    return getDefaultBindings();
  }
}

export function saveBindings(bindings: KeyBindings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
}

const KEY_LABELS: Record<string, string> = {
  ArrowUp: '\u2191',
  ArrowDown: '\u2193',
  ArrowLeft: '\u2190',
  ArrowRight: '\u2192',
  Space: 'SPACE',
  Enter: 'ENTER',
  ShiftLeft: 'L-SHIFT',
  ShiftRight: 'R-SHIFT',
  ControlLeft: 'L-CTRL',
  ControlRight: 'R-CTRL',
  AltLeft: 'L-ALT',
  AltRight: 'R-ALT',
  Tab: 'TAB',
  Backspace: 'BKSP',
  Escape: 'ESC',
};

export function keyCodeToLabel(code: string): string {
  if (KEY_LABELS[code]) return KEY_LABELS[code]!;
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}
