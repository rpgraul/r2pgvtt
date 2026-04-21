import { createDiceBoxManager } from '../actions/useDiceBox.js';
import { authState } from './auth.svelte.ts';
import { gameState } from './gameState.svelte.ts';
import { parseFormula, evaluateRolls, getSecureRandomInt } from '../utils/diceLogic.js';

function createDiceStore() {
  let activeDice = $state([]);
  let pendingAlerts = $state([]);
  let displayedAlerts = $state([]);
  let hasUserDismissed = $state(false);
  let isDiceVisible = $state(false);
  let alertTimeoutId = null;
  let rollMetadataQueue = $state(new Map());
  let diceBoxInstance = null;

  const defaultColor = '#0000ff';
  let currentDiceColor = $state(
    typeof window !== 'undefined'
      ? localStorage.getItem('rpgboard_dice_color') || defaultColor
      : defaultColor,
  );

  function setDiceColor(color) {
    currentDiceColor = color;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rpgboard_dice_color', color);
    }
    if (diceBoxInstance && diceBoxInstance.updateConfig) {
      diceBoxInstance.updateConfig({ themeColor: color });
    }
  }

  const canDismiss = $derived(pendingAlerts.length === 0 && !hasActiveRolls());

  function hasActiveRolls() {
    return activeDice.some((d) => d.rolling);
  }

  function getUserName() {
    return authState.displayName;
  }

  function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
  }

  let diceInitializing = null;
  const rollCompleteListener = () => {
    const firstId = rollMetadataQueue.keys().next().value;
    if (!firstId) return;

    const metadata = rollMetadataQueue.get(firstId);
    if (metadata) {
      // 1. Adiciona ao Chat Local
      gameState.addMessageToChatLocal(metadata.textual, 'user', metadata.userName);

      // 2. Prepara Alerta de UI
      const newAlert = {
        id: firstId,
        userName: metadata.userName,
        formula: metadata.formula,
        result: metadata.total,
        rolls: metadata.rolls || [],
        diceType: `d${metadata.sides || 20}`,
        color: metadata.color,
        timestamp: Date.now(),
      };

      pendingAlerts = [...pendingAlerts, newAlert];
      processNextAlert();

      // 3. Limpa da fila
      rollMetadataQueue.delete(firstId);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dice:3d:finished', rollCompleteListener);
  }

  function initDiceBox(container = null) {
    if (diceBoxInstance) return Promise.resolve(diceBoxInstance);
    if (diceInitializing) return diceInitializing;

    diceBoxInstance = createDiceBoxManager(container, {
      themeColor: currentDiceColor,
    });

    diceInitializing = diceBoxInstance.init().then(() => {
      diceInitializing = null;
    });

    return diceInitializing;
  }

  async function ensureInitialized(container) {
    if (diceInitializing) {
      await diceInitializing;
    }
    if (!diceBoxInstance) {
      await initDiceBox(container);
    }
  }

  async function rollDice(formula) {
    try {
      const parsedData = parseFormula(formula);
      if (!parsedData) throw new Error('Invalid formula');

      const rawRolls = Array.from({ length: parsedData.count }, () =>
        getSecureRandomInt(parsedData.sides),
      );
      const result = evaluateRolls(parsedData, rawRolls);
      const rollId = crypto.randomUUID();

      const payload = {
        rollId,
        deterministicDice: result.details.map((d) => ({
          sides: parsedData.sides,
          value: d.value,
          themeColor: currentDiceColor,
        })),
        metadata: {
          userName: authState.displayName,
          formula,
          total: result.total,
          textual: `🎲 Rolou ${formula}: ${result.textual}`,
          color: currentDiceColor,
          sides: parsedData.sides,
        },
      };

      // DISPARA O BROADCAST (O Roller também vai processar isso no receptor)
      gameState.broadcastDiceAction(payload);
      return result;
    } catch (error) {
      console.error('[DiceStore] Local Roll Error:', error);
      throw error;
    }
  }

  async function processRollSinal(payload) {
    const { rollId, deterministicDice, metadata } = payload;

    // Armazena na fila para mostrar o texto depois
    rollMetadataQueue.set(rollId, metadata);

    isDiceVisible = true;
    await ensureInitialized(null);
    const instance = diceBoxInstance.getInstance();
    if (instance) {
      instance.show();
      try {
        await instance.roll(deterministicDice);
      } catch (e) {
        console.warn('[DiceStore] 3D animation error:', e);
        // Fallback: Se falhar a animação, libera o alerta manualmente
        rollCompleteListener();
      }
    }
  }

  function processNextAlert() {
    if (alertTimeoutId) return;

    if (pendingAlerts.length > 0) {
      const next = pendingAlerts[0];
      pendingAlerts = pendingAlerts.slice(1);

      displayedAlerts = [...displayedAlerts, next];

      alertTimeoutId = setTimeout(() => {
        dismissAlert(next.id);
        alertTimeoutId = null;
        processNextAlert();
      }, 3000);
    }
  }

  function dismissAlert(id) {
    displayedAlerts = displayedAlerts.filter((a) => a.id !== id);
  }

  function dismissAll() {
    if (!canDismiss) {
      hasUserDismissed = true;
    }
  }

  function clearDice() {
    activeDice = [];
    pendingAlerts = [];
    displayedAlerts = [];
    hasUserDismissed = false;
    isDiceVisible = false;
    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
      alertTimeoutId = null;
    }
    if (diceBoxInstance) {
      diceBoxInstance.clear();
    }
  }

  function clear3DDice() {
    if (diceBoxInstance && isDiceVisible && !hasActiveRolls()) {
      diceBoxInstance.clear();
      isDiceVisible = false;
    }
  }

  function getDiceBox() {
    return diceBoxInstance;
  }

  return {
    get activeDice() {
      return activeDice;
    },
    get pendingAlerts() {
      return pendingAlerts;
    },
    get displayedAlerts() {
      return displayedAlerts;
    },
    get canDismiss() {
      return canDismiss;
    },
    get hasUserDismissed() {
      return hasUserDismissed;
    },
    get isDiceVisible() {
      return isDiceVisible;
    },
    get currentDiceColor() {
      return currentDiceColor;
    },

    rollDice,
    processRollSinal,
    dismissAlert,
    dismissAll,
    clearDice,
    clear3DDice,
    initDiceBox,
    getDiceBox,
    processNextAlert,
    hasActiveRolls,
    setDiceColor,
  };
}

export const diceStore = createDiceStore();
