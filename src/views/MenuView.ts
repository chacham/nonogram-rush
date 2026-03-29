import { Container, Graphics, Text } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';

export class MenuView extends Container {
  onPlayStage?: () => void;
  onPlayEndless?: () => void;
  onSettings?: () => void;

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
    title.y = CANVAS_HEIGHT * 0.22;
    this.addChild(title);

    const subtitle = new Text({
      text: 'RUSH',
      style: { fontFamily: 'monospace', fontSize: 36, fill: COLORS.cellFilled, fontWeight: 'bold' },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = CANVAS_WIDTH / 2;
    subtitle.y = CANVAS_HEIGHT * 0.22 + 52;
    this.addChild(subtitle);

    const btnY = CANVAS_HEIGHT * 0.50;
    const gap = 60;

    this.addButton('STAGE MODE', btnY, COLORS.uiAccent, () => this.onPlayStage?.());
    this.addButton('ENDLESS MODE', btnY + gap, COLORS.scoreText, () => this.onPlayEndless?.());
    this.addButton('SETTINGS', btnY + gap * 2, COLORS.hintText, () => this.onSettings?.());

    const hint = new Text({
      text: 'v0.1',
      style: { fontFamily: 'monospace', fontSize: 12, fill: COLORS.hintTextDim },
    });
    hint.anchor.set(0.5);
    hint.x = CANVAS_WIDTH / 2;
    hint.y = CANVAS_HEIGHT - 30;
    this.addChild(hint);

    this.visible = false;
  }

  private addButton(label: string, y: number, color: number, onClick: () => void): void {
    const btnW = 240;
    const btnH = 44;

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
      style: { fontFamily: 'monospace', fontSize: 16, fill: color, fontWeight: 'bold' },
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
    this.addChild(btn);
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }
}
