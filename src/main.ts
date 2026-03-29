import { Application } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/GameConfig.js';
import { COLORS } from '@/config/Theme.js';
import { Game } from '@/core/Game.js';

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
  await game.init();
}

bootstrap().catch(console.error);
