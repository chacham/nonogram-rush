import { Application } from 'pixi.js';
import { GRID_COLS, GRID_VISIBLE_ROWS } from '@/config/GameConfig.js';
import { canvasWidth, canvasHeight } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import { Game } from '@/core/Game.js';

async function bootstrap(): Promise<void> {
  const app = new Application();

  await app.init({
    width: canvasWidth(GRID_COLS),
    height: canvasHeight(GRID_VISIBLE_ROWS, GRID_COLS),
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
