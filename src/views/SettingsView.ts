import { Container, Graphics, Text } from 'pixi.js';
import { GRID_COLS, GRID_VISIBLE_ROWS } from '@/config/GameConfig.js';
import { canvasWidth, canvasHeight, isTouchDevice } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import { KeyBindings } from '@/types/index.js';
import { loadBindings, saveBindings, keyCodeToLabel } from '@/systems/KeyBindingsManager.js';

type BindingAction = keyof KeyBindings;

const ACTION_LABELS: Record<BindingAction, string> = {
  up: 'UP',
  down: 'DOWN',
  left: 'LEFT',
  right: 'RIGHT',
  fill: 'FILL',
  cross: 'CROSS',
};

const ACTION_ORDER: BindingAction[] = ['up', 'down', 'left', 'right', 'fill', 'cross'];

const SETTINGS_W = canvasWidth(GRID_COLS);
const SETTINGS_H = canvasHeight(GRID_VISIBLE_ROWS, GRID_COLS, isTouchDevice());

interface KeyRow {
  action: BindingAction;
  keyText: Text;
  bg: Graphics;
}

export class SettingsView extends Container {
  onBack?: () => void;
  onChange?: () => void;

  private bindings: KeyBindings;
  private keyRows: KeyRow[] = [];
  private listeningFor: BindingAction | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super();
    this.bindings = loadBindings();

    const bg = new Graphics();
    bg.rect(0, 0, SETTINGS_W, SETTINGS_H);
    bg.fill({ color: COLORS.background });
    this.addChild(bg);

    const title = new Text({
      text: 'SETTINGS',
      style: { fontFamily: 'monospace', fontSize: 32, fill: COLORS.uiAccent, fontWeight: 'bold' },
    });
    title.anchor.set(0.5);
    title.x = SETTINGS_W / 2;
    title.y = 60;
    this.addChild(title);

    const subtitle = new Text({
      text: 'Click a key to rebind, then press new key',
      style: { fontFamily: 'monospace', fontSize: 12, fill: COLORS.hintTextDim },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = SETTINGS_W / 2;
    subtitle.y = 95;
    this.addChild(subtitle);

    const startY = 140;
    const rowGap = 50;

    for (let i = 0; i < ACTION_ORDER.length; i++) {
      const action = ACTION_ORDER[i]!;
      this.addKeyRow(action, startY + i * rowGap);
    }

    const backY = startY + ACTION_ORDER.length * rowGap + 30;
    this.addBackButton(backY);

    this.visible = false;
  }

  private addKeyRow(action: BindingAction, y: number): void {
    const rowW = 280;
    const keyW = 100;
    const keyH = 36;
    const cx = SETTINGS_W / 2;

    const label = new Text({
      text: ACTION_LABELS[action],
      style: { fontFamily: 'monospace', fontSize: 16, fill: COLORS.uiText },
    });
    label.x = cx - rowW / 2;
    label.y = y + (keyH - label.height) / 2;
    this.addChild(label);

    const keyContainer = new Container();
    keyContainer.x = cx + rowW / 2 - keyW;
    keyContainer.y = y;
    keyContainer.eventMode = 'static';
    keyContainer.cursor = 'pointer';

    const bg = new Graphics();
    this.drawKeyBg(bg, keyW, keyH, false);
    keyContainer.addChild(bg);

    const keyText = new Text({
      text: keyCodeToLabel(this.bindings[action]),
      style: { fontFamily: 'monospace', fontSize: 14, fill: COLORS.uiAccent, align: 'center' },
    });
    keyText.anchor.set(0.5);
    keyText.x = keyW / 2;
    keyText.y = keyH / 2;
    keyContainer.addChild(keyText);

    keyContainer.on('pointerdown', () => this.startListening(action));
    this.addChild(keyContainer);

    this.keyRows.push({ action, keyText, bg });
  }

  private drawKeyBg(g: Graphics, w: number, h: number, active: boolean): void {
    g.clear();
    g.roundRect(0, 0, w, h, 4);
    g.fill({ color: active ? 0x2a2a5e : 0x1a1a2e });
    g.roundRect(0, 0, w, h, 4);
    g.stroke({
      color: active ? COLORS.cursorHighlight : COLORS.cellEmptyBorder,
      width: active ? 2 : 1,
      alpha: active ? 1 : 0.5,
    });
  }

  private startListening(action: BindingAction): void {
    if (this.listeningFor) {
      const prev = this.keyRows.find(r => r.action === this.listeningFor);
      if (prev) {
        this.drawKeyBg(prev.bg, 100, 36, false);
        prev.keyText.text = keyCodeToLabel(this.bindings[prev.action]);
        prev.keyText.style.fill = COLORS.uiAccent;
      }
    }

    this.listeningFor = action;
    const row = this.keyRows.find(r => r.action === action)!;
    this.drawKeyBg(row.bg, 100, 36, true);
    row.keyText.text = '...';
    row.keyText.style.fill = COLORS.cursorHighlight;

    if (!this.keyHandler) {
      this.keyHandler = (e: KeyboardEvent) => this.handleKeyCapture(e);
      window.addEventListener('keydown', this.keyHandler);
    }
  }

  private handleKeyCapture(e: KeyboardEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.listeningFor) return;

    if (e.code === 'Escape') {
      this.cancelListening();
      return;
    }

    const action = this.listeningFor;
    this.bindings[action] = e.code;
    saveBindings(this.bindings);

    const row = this.keyRows.find(r => r.action === action)!;
    row.keyText.text = keyCodeToLabel(e.code);
    row.keyText.style.fill = COLORS.uiAccent;
    this.drawKeyBg(row.bg, 100, 36, false);

    this.listeningFor = null;
    this.removeKeyHandler();
    this.onChange?.();
  }

  private cancelListening(): void {
    if (!this.listeningFor) return;
    const row = this.keyRows.find(r => r.action === this.listeningFor)!;
    row.keyText.text = keyCodeToLabel(this.bindings[row.action]);
    row.keyText.style.fill = COLORS.uiAccent;
    this.drawKeyBg(row.bg, 100, 36, false);
    this.listeningFor = null;
    this.removeKeyHandler();
  }

  private removeKeyHandler(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  private addBackButton(y: number): void {
    const btnW = 160;
    const btnH = 40;
    const btn = new Container();
    btn.x = SETTINGS_W / 2;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.fill({ color: 0x1a1a2e });
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.stroke({ color: COLORS.hintText, width: 1.5, alpha: 0.7 });
    btn.addChild(bg);

    const text = new Text({
      text: 'BACK',
      style: { fontFamily: 'monospace', fontSize: 16, fill: COLORS.hintText, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.fill({ color: COLORS.hintText, alpha: 0.15 });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.stroke({ color: COLORS.hintText, width: 2, alpha: 1 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.fill({ color: 0x1a1a2e });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.stroke({ color: COLORS.hintText, width: 1.5, alpha: 0.7 });
    });

    btn.on('pointerdown', () => {
      this.cancelListening();
      this.onBack?.();
    });
    this.addChild(btn);
  }

  show(): void {
    this.bindings = loadBindings();
    for (const row of this.keyRows) {
      row.keyText.text = keyCodeToLabel(this.bindings[row.action]);
      row.keyText.style.fill = COLORS.uiAccent;
      this.drawKeyBg(row.bg, 100, 36, false);
    }
    this.listeningFor = null;
    this.visible = true;
  }

  hide(): void {
    this.cancelListening();
    this.visible = false;
  }

  get isListening(): boolean {
    return this.listeningFor !== null;
  }
}
