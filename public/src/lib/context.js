import { gameState } from './state/game.svelte.ts';

export const GameContext = {
  provide: () => gameState
};

export function getGameState() {
  return gameState;
}
