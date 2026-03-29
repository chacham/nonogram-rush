import { Application } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { Game } from '@/core/Game.js';
import { PlayMode } from '@/types/index.js';
import { STAGES } from '@/data/stages.js';

async function bootstrap(): Promise<void> {
  const app = new Application();

  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: COLORS.background,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  document.body.appendChild(app.canvas);

  const game = new Game(app);
  await game.init(PlayMode.STAGE, STAGES[0]);
}

bootstrap().catch(console.error);
