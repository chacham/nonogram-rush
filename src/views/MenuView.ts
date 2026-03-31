import { Container, Graphics, Text } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { StageData, InputMode } from '@/types/index.js';
import { isTouchDevice } from '@/config/LayoutConfig.js';

export function detectInputMode(): InputMode {
  return isTouchDevice() ? 'touchscreen' : 'keyboard';
}

export class MenuView extends Container {
  onPlayStage?: (stage: StageData) => void;
  onPlayEndless?: () => void;
  onSettings?: () => void;

  private stageListContainer: Container;
  private btnStartY: number;

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

  setStages(stages: StageData[]): void {
    this.stageListContainer.removeChildren();

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
