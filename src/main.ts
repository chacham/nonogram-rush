import { Application } from 'pixi.js';
import { GRID_COLS, GRID_VISIBLE_ROWS } from '@/config/GameConfig.js';
import { canvasWidth, canvasHeight, isTouchDevice } from '@/config/LayoutConfig.js';
import { COLORS } from '@/config/Theme.js';
import { Game } from '@/core/Game.js';

async function bootstrap(): Promise<void> {
  const container = document.getElementById('game-container')!;
  if (!container) throw new Error('Game container not found');

  const touchMode = isTouchDevice();
  const canvasW = canvasWidth(GRID_COLS);
  const canvasH = canvasHeight(GRID_VISIBLE_ROWS, GRID_COLS, touchMode);

  const app = new Application();

  await app.init({
    width: canvasW,
    height: canvasH,
    background: COLORS.background,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  container.appendChild(app.canvas);

  function scaleCanvas(): void {
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    const scale = Math.min(maxW / canvasW, maxH / canvasH, 1);
    app.canvas.style.width = `${canvasW * scale}px`;
    app.canvas.style.height = `${canvasH * scale}px`;
  }

  scaleCanvas();

  window.addEventListener('resize', () => {
    scaleCanvas();
  });

  const game = new Game(app, touchMode);
  await game.init();
}

bootstrap().catch(console.error);
