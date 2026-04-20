# Spec: 019 - Event-Driven Sync Implementation

## 1. Affected Files
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/lib/actions/useDiceBox.js`

## 2. Structural Changes

### 2.1. `src/lib/state/gameState.svelte.ts`
- **Remove Import:** Delete `import { diceStore } from './diceStore.svelte.js';` (or any dynamic import of diceStore).
- **Add Listener:** In the `init` method, add a one-time listener for the `outgoing_local_roll` window event, which will call `this.sendRoll(...)`.
- **Update Broadcast Logic:** Inside `setupRoomChannel`, under the `dice_roll` event, update the `chatMessages` and `rolls` arrays. Then, instead of calling diceStore, dispatch: `window.dispatchEvent(new CustomEvent('incoming_remote_roll', { detail: payload.roll }));`.

### 2.2. `src/lib/state/diceStore.svelte.js`
- **Remove Import:** Delete `import { gameState } from './gameState.svelte.ts';` (or any dynamic import of gameState).
- **Update Local Roll:** Inside `rollDice(formula)`, replace the `gameState.sendRoll(...)` and `sendMessage(...)` calls with:
  `window.dispatchEvent(new CustomEvent('outgoing_local_roll', { detail: { formula, result: evaluated.total, details: evaluated, color: currentDiceColor, text } }));`
- **Add Listener:** At the end of the file, add a listener for `incoming_remote_roll` that calls `diceStore.playRemoteRoll(e.detail)`.
- **Bulletproof `playRemoteRoll`:** Add a `try/catch` block. Process the UI alerts immediately, then trigger the 3D engine asynchronously without blocking.

### 2.3. `src/lib/actions/useDiceBox.js`
- Ensure the `roll(formula)` function properly handles `Array.isArray(formula)` and assigns `originalFormula = 'forced_roll'`, bypassing string methods like `.trim()` which cause crashes on forced remote rolls.