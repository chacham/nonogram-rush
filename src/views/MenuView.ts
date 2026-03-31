import { Container, Graphics, Text } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { StageData, InputMode } from '@/types/index.js';

const INPUT_MODE_KEY = 'nonogram-rush-input-mode';

export function loadInputMode(): InputMode {
  const stored = localStorage.getItem(INPUT_MODE_KEY);
  if (stored === 'touchscreen' || stored === 'keyboard') {
    return stored;
  }
  return 'keyboard';
}

export function saveInputMode(mode: InputMode): void {
  localStorage.setItem(INPUT_MODE_KEY, mode);
}

export class MenuView extends Container {
  onPlayStage?: (stage: StageData) => void;
  onPlayEndless?: () => void;
  onSettings?: () => void;
  onInputModeChange?: (mode: InputMode) => void;

  private stageListContainer: Container;
  private inputModeContainer: Container;
  private btnStartY: number;
  private currentInputMode: InputMode = 'keyboard';
  private inputModeBtns: { touchscreen: Container; keyboard: Container } | null = null;

  constructor() {
    super();

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.fill({ color: COLORS.background });
    this.addChild(bg);

    const title = new Text({
      text: 'NONOGRAM',
      style: { fontFamily: 'monospace', fontSize: 48, fill: COLORS.uiAccent, fontWeight: 'bold' },
    });
    title.anchor.set(0.5);
    title.x = CANVAS_WIDTH / 2;
    title.y = CANVAS_HEIGHT * 0.18;
    this.addChild(title);

    const subtitle = new Text({
      text: 'RUSH',
      style: { fontFamily: 'monospace', fontSize: 36, fill: COLORS.cellFilled, fontWeight: 'bold' },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = CANVAS_WIDTH / 2;
    subtitle.y = CANVAS_HEIGHT * 0.18 + 52;
    this.addChild(subtitle);

    this.btnStartY = CANVAS_HEIGHT * 0.40;
    this.stageListContainer = new Container();
    this.addChild(this.stageListContainer);

    this.inputModeContainer = new Container();
    this.inputModeContainer.y = CANVAS_HEIGHT - 80;
    this.addChild(this.inputModeContainer);

    const version = new Text({
      text: 'v0.1',
      style: { fontFamily: 'monospace', fontSize: 12, fill: COLORS.hintTextDim },
    });
    version.anchor.set(0.5);
    version.x = CANVAS_WIDTH / 2;
    version.y = CANVAS_HEIGHT - 30;
    this.addChild(version);

    this.visible = false;
  }

  setInputMode(mode: InputMode): void {
    this.currentInputMode = mode;
    this.updateInputModeUI();
  }

  private updateInputModeUI(): void {
    if (!this.inputModeBtns) return;
    const isTouch = this.currentInputMode === 'touchscreen';
    this.inputModeBtns.touchscreen.alpha = isTouch ? 1 : 0.5;
    this.inputModeBtns.keyboard.alpha = isTouch ? 0.5 : 1;
  }

  setStages(stages: StageData[]): void {
    this.stageListContainer.removeChildren();
    this.inputModeContainer.removeChildren();

    let y = this.btnStartY;
    const gap = 48;

    const stagesLabel = new Text({
      text: 'STAGES',
      style: { fontFamily: 'monospace', fontSize: 11, fill: COLORS.hintTextDim, letterSpacing: 2 },
    });
    stagesLabel.anchor.set(0.5);
    stagesLabel.x = CANVAS_WIDTH / 2;
    stagesLabel.y = y - 16;
    this.stageListContainer.addChild(stagesLabel);

    for (const stage of stages) {
      const label = `${stage.name}  (${stage.cols}×${stage.rows.length})`;
      this.addButton(label, y, COLORS.uiAccent, () => this.onPlayStage?.(stage), this.stageListContainer);
      y += gap;
    }

    y += 12;
    this.addButton('ENDLESS MODE', y, COLORS.scoreText, () => this.onPlayEndless?.(), this.stageListContainer);
    y += gap;
    this.addButton('SETTINGS', y, COLORS.hintText, () => this.onSettings?.(), this.stageListContainer);

    this.setupInputModeButtons();
  }

  private setupInputModeButtons(): void {
    const label = new Text({
      text: 'INPUT',
      style: { fontFamily: 'monospace', fontSize: 11, fill: COLORS.hintTextDim, letterSpacing: 2 },
    });
    label.anchor.set(0.5);
    label.x = CANVAS_WIDTH / 2;
    label.y = -20;
    this.inputModeContainer.addChild(label);

    const touchBtn = this.addSmallButton('TOUCH', CANVAS_WIDTH / 2 - 70, 0, COLORS.cellFilled, () => {
      this.currentInputMode = 'touchscreen';
      saveInputMode('touchscreen');
      this.updateInputModeUI();
      this.onInputModeChange?.('touchscreen');
    });
    const kbdBtn = this.addSmallButton('KEYS', CANVAS_WIDTH / 2 + 70, 0, COLORS.uiAccent, () => {
      this.currentInputMode = 'keyboard';
      saveInputMode('keyboard');
      this.updateInputModeUI();
      this.onInputModeChange?.('keyboard');
    });

    this.inputModeBtns = { touchscreen: touchBtn, keyboard: kbdBtn };
    this.updateInputModeUI();
  }

  private addSmallButton(label: string, x: number, y: number, color: number, onClick: () => void): Container {
    const btnW = 100;
    const btnH = 32;

    const btn = new Container();
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
    bg.fill({ color: 0x1a1a2e });
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
    bg.stroke({ color, width: 1.5, alpha: 0.7 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'monospace', fontSize: 12, fill: color, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
      bg.fill({ color, alpha: 0.15 });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
      bg.stroke({ color, width: 2, alpha: 1 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
      bg.fill({ color: 0x1a1a2e });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 4);
      bg.stroke({ color, width: 1.5, alpha: 0.7 });
    });

    btn.on('pointerdown', onClick);
    this.inputModeContainer.addChild(btn);
    return btn;
  }

  private addButton(label: string, y: number, color: number, onClick: () => void, parent?: Container): void {
    const btnW = 260;
    const btnH = 40;
    const target = parent ?? this;

    const btn = new Container();
    btn.x = CANVAS_WIDTH / 2;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.fill({ color: 0x1a1a2e });
    bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.stroke({ color, width: 1.5, alpha: 0.7 });
    btn.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'monospace', fontSize: 14, fill: color, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    btn.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.fill({ color, alpha: 0.15 });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.stroke({ color, width: 2, alpha: 1 });
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.fill({ color: 0x1a1a2e });
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.stroke({ color, width: 1.5, alpha: 0.7 });
    });

    btn.on('pointerdown', onClick);
    target.addChild(btn);
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }
}
