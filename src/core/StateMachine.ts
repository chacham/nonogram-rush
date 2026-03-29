import { GameState } from '@/types/index.js';

type TransitionMap = Partial<Record<GameState, GameState[]>>;

export class StateMachine {
  private state: GameState;
  private locked = false;
  private readonly transitions: TransitionMap;

  constructor(initial: GameState, transitions: TransitionMap) {
    this.state = initial;
    this.transitions = transitions;
  }

  get current(): GameState {
    return this.state;
  }

  get isLocked(): boolean {
    return this.locked;
  }

  canTransition(to: GameState): boolean {
    if (this.locked) return false;
    const allowed = this.transitions[this.state];
    return allowed?.includes(to) ?? false;
  }

  transition(to: GameState): boolean {
    if (!this.canTransition(to)) return false;
    this.state = to;
    return true;
  }

  lock(): void {
    this.locked = true;
  }

  unlock(): void {
    this.locked = false;
  }

  forceState(state: GameState): void {
    this.locked = false;
    this.state = state;
  }
}

export function createGameStateMachine(): StateMachine {
  return new StateMachine(GameState.MENU, {
    [GameState.MENU]: [GameState.IDLE, GameState.SETTINGS],
    [GameState.SETTINGS]: [GameState.MENU],
    [GameState.IDLE]: [GameState.PUSHING, GameState.CLEARING, GameState.GAME_OVER, GameState.FINALE, GameState.MENU],
    [GameState.PUSHING]: [GameState.IDLE, GameState.GAME_OVER],
    [GameState.CLEARING]: [GameState.IDLE],
    [GameState.GAME_OVER]: [GameState.IDLE, GameState.MENU],
    [GameState.FINALE]: [GameState.IDLE, GameState.MENU],
  });
}
