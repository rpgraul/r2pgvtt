import { createDiceBoxManager } from '../actions/useDiceBox.js';
import { evaluateRolls, parseFormula } from '../utils/diceLogic.js';
import { authState } from './auth.svelte.ts';
import { gameState } from './gameState.svelte.ts';

function createDiceStore() {
  // ── UI state ──────────────────────────────────────────────────
  let displayedAlerts = $state([]);
  let isDiceVisible = $state(false);
  let hasVisibleDice = $state(false);
  let canClearAfterCountdown = $state(false);

  let alertTimeoutId = null;
  let countdownTimeoutId = null;
  let diceBoxInstance = null;
  let diceInitializing = null;

  // ── Color ─────────────────────────────────────────────────────
  const defaultColor = '#0000ff';
  let currentDiceColor = $state(
    typeof window !== 'undefined'
      ? localStorage.getItem('rpgboard_dice_color') || defaultColor
      : defaultColor,
  );

  function setDiceColor(color) {
    currentDiceColor = color;
    if (typeof window !== 'undefined') localStorage.setItem('rpgboard_dice_color', color);
    if (diceBoxInstance?.updateConfig) diceBoxInstance.updateConfig({ themeColor: color });
  }

  // ── Local roll queue ──────────────────────────────────────────
  // Each entry = one pending local rollDice() call waiting for dice:3d:finished
  // FIFO; keyed by insertion order (Map preserves order)
  const localRollQueue = new Map(); // rollId → { parsedData, formula, color, resolve, reject }

  // ── onRollComplete handler ────────────────────────────────────
  // Fires for every roll() or add() that completes.
  // For LOCAL rolls: the queue has an entry → use the actual 3D values.
  // For REMOTE rolls: queue is empty → nothing to do (notification already shown by processRollSinal).
  const rollCompleteListener = (event) => {
    const firstId = localRollQueue.keys().next().value;
    if (!firstId) {
      // Remote roll completed – just start countdown
      startCountdown();
      return;
    }

    const entry = localRollQueue.get(firstId);
    localRollQueue.delete(firstId);

    const { parsedData, formula, color, resolve } = entry;
    const userName = authState.displayName;

    // ── Extract actual values from the 3D dice box ──
    const diceResults = event?.detail?.results ?? [];
    // diceResults is an array of roll-collections; each has .rolls = [{value, sides, ...}]
    let rawValues = diceResults.flatMap((col) =>
      (col.rolls ?? []).map((d) => d.value),
    );

    // Safety fallback (if dice-box returned empty / unexpected format)
    if (rawValues.length < parsedData.count) {
      rawValues = Array.from(
        { length: parsedData.count },
        () => Math.floor(Math.random() * parsedData.sides) + 1,
      );
    }

    // Keep only the expected number of dice (the latest add/roll)
    rawValues = rawValues.slice(-parsedData.count);

    // ── Compute total (applies formula modifiers like +5) ──
    const result = evaluateRolls(parsedData, rawValues);

    // ── Broadcast deterministic payload to other players ──
    const deterministicDice = rawValues.map((v) => ({
      sides: parsedData.sides,
      value: v,
      themeColor: color,
    }));

    gameState.broadcastDiceAction({
      rollId: firstId,
      deterministicDice,
      metadata: {
        userName,
        formula,
        total: result.total,
        textual: `🎲 Rolou ${formula}: ${result.textual}`,
        color,
        sides: parsedData.sides,
        rolls: rawValues,
      },
    });

    // ── Chat message ──
    gameState.addMessageToChatLocal(
      `🎲 Rolou ${formula}: ${result.textual}`,
      'user',
      userName,
    );

    // ── Notification alert ──
    showAlert({
      id: firstId,
      userName,
      formula,
      result: result.total,
      successes: result.successes,
      rolls: rawValues,
      diceType: `d${parsedData.sides}`,
      color,
    });

    // ── Countdown to allow click-to-clear ──
    startCountdown();

    // ── Resolve the promise returned by rollDice() ──
    resolve?.(result);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dice:3d:finished', rollCompleteListener);
  }

  // ── DiceBox init ──────────────────────────────────────────────
  function initDiceBox(container = null) {
    if (diceBoxInstance) return Promise.resolve(diceBoxInstance);
    if (diceInitializing) return diceInitializing;

    diceBoxInstance = createDiceBoxManager(container, { themeColor: currentDiceColor });
    diceInitializing = diceBoxInstance.init().then(() => { diceInitializing = null; });
    return diceInitializing;
  }

  async function ensureInitialized() {
    if (diceInitializing) await diceInitializing;
    if (!diceBoxInstance) await initDiceBox(null);
  }

  // ── LOCAL ROLL ────────────────────────────────────────────────
  // Let the dice-box roll freely; read the actual result in rollCompleteListener.
  // Returns a Promise<result> that resolves when the animation finishes.
  async function rollDice(formula) {
    const parsedData = parseFormula(formula);
    if (!parsedData) throw new Error(`Invalid formula: ${formula}`);

    const rollId = crypto.randomUUID();
    const color = currentDiceColor;

    // Cancel countdown – a new roll is starting
    if (countdownTimeoutId) { clearTimeout(countdownTimeoutId); countdownTimeoutId = null; }
    canClearAfterCountdown = false;
    isDiceVisible = true;

    // Notation for dice-box (NO value → random)
    const notation = [{ qty: parsedData.count, sides: parsedData.sides, themeColor: color }];

    // Promise that resolves when dice:3d:finished fires for this roll
    const rollPromise = new Promise((resolve, reject) => {
      localRollQueue.set(rollId, { parsedData, formula, color, resolve, reject });
    });

    await ensureInitialized();
    const instance = diceBoxInstance.getInstance();
    if (instance) {
      instance.show();
      try {
        if (hasVisibleDice) {
          await instance.add(notation);
        } else {
          hasVisibleDice = true;
          await instance.roll(notation);
        }
      } catch (e) {
        console.warn('[DiceStore] roll error:', e);
        // Manually fire listener so the promise resolves even on animation failure
        rollCompleteListener(null);
      }
    }

    return rollPromise;
  }

  // ── REMOTE ROLL ───────────────────────────────────────────────
  // Received via Supabase broadcast from another player.
  // Animate with their deterministic values; show their pre-computed result in notification.
  async function processRollSinal(payload) {
    const { rollId, deterministicDice, metadata } = payload;

    if (countdownTimeoutId) { clearTimeout(countdownTimeoutId); countdownTimeoutId = null; }
    canClearAfterCountdown = false;
    isDiceVisible = true;

    await ensureInitialized();
    const instance = diceBoxInstance.getInstance();
    if (instance) {
      instance.show();
      try {
        if (hasVisibleDice) {
          await instance.add(deterministicDice);
        } else {
          hasVisibleDice = true;
          await instance.roll(deterministicDice);
        }
      } catch (e) {
        console.warn('[DiceStore] remote roll error:', e);
      }
    }

    // Chat
    gameState.addMessageToChatLocal(metadata.textual, 'user', metadata.userName);

    // Notification with broadcaster's already-correct total
    showAlert({
      id: rollId,
      userName: metadata.userName,
      formula: metadata.formula,
      result: metadata.total,
      rolls: metadata.rolls || [],
      diceType: `d${metadata.sides || 20}`,
      color: metadata.color,
    });

    startCountdown();
  }

  // ── Alert helpers ─────────────────────────────────────────────
  function showAlert(alert) {
    displayedAlerts = [...displayedAlerts, { ...alert, timestamp: Date.now() }];

    // Auto-dismiss after 4s
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    alertTimeoutId = setTimeout(() => {
      dismissAlert(alert.id);
      alertTimeoutId = null;
    }, 4000);
  }

  function dismissAlert(id) {
    displayedAlerts = displayedAlerts.filter((a) => a.id !== id);
  }

  function startCountdown() {
    if (countdownTimeoutId) clearTimeout(countdownTimeoutId);
    canClearAfterCountdown = false;
    countdownTimeoutId = setTimeout(() => {
      canClearAfterCountdown = true;
      countdownTimeoutId = null;
    }, 1000);
  }

  function hasActiveRolls() {
    return localRollQueue.size > 0;
  }

  // ── Clear ─────────────────────────────────────────────────────
  function clearDice() {
    displayedAlerts = [];
    isDiceVisible = false;
    hasVisibleDice = false;
    canClearAfterCountdown = false;
    if (alertTimeoutId) { clearTimeout(alertTimeoutId); alertTimeoutId = null; }
    if (countdownTimeoutId) { clearTimeout(countdownTimeoutId); countdownTimeoutId = null; }
    diceBoxInstance?.clear?.();
  }

  function tryDismissOnClick() {
    if (!isDiceVisible) return;
    if (hasActiveRolls()) return;
    if (!canClearAfterCountdown) return;
    clearDice();
  }

  // ── Public API ─────────────────────────────────────────────────
  return {
    get displayedAlerts() { return displayedAlerts; },
    get isDiceVisible() { return isDiceVisible; },
    get currentDiceColor() { return currentDiceColor; },
    get canClearAfterCountdown() { return canClearAfterCountdown; },

    rollDice,
    processRollSinal,
    dismissAlert,
    clearDice,
    tryDismissOnClick,
    initDiceBox,
    getDiceBox: () => diceBoxInstance,
    hasActiveRolls,
    setDiceColor,
  };
}

export const diceStore = createDiceStore();
