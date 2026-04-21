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

  function addRemoteAlert(alertData) {
    const alertId = `remote-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newAlert = {
      id: alertId,
      formula: alertData.formula,
      total: alertData.result,
      userName: alertData.userName,
      rolls: alertData.details?.rolls || [],
      diceType: alertData.details?.diceType || alertData.formula,
      color: alertData.color || '#0000ff',
      isRemote: true,
      timestamp: Date.now(),
    };
    pendingAlerts = [...pendingAlerts, newAlert];
    processNextAlert();
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
    processNextAlert();
    const lastAlert = displayedAlerts[displayedAlerts.length - 1];
    if (lastAlert?.textual) {
      gameState.addMessageToChatLocal(lastAlert.textual, 'user', lastAlert.userName);
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

      const rawRolls = [];
      for (let i = 0; i < parsedData.count; i++) {
        rawRolls.push(getSecureRandomInt(parsedData.sides));
      }
      const result = evaluateRolls(parsedData, rawRolls);
      result.formula = formula;

      const dicePayload = result.details
        .filter((d) => d.isKept)
        .map((d) => ({
          sides: parsedData.sides,
          value: d.value,
        }));

      const text = `🎲 Rolou ${formula}: ${result.textual}`;
      const sidesNum = parseInt(parsedData.sides, 10);

      gameState.broadcastDiceAction(
        formula,
        result.total,
        { ...result, dicePayload },
        currentDiceColor,
        text,
      );

      await forceDisplayRoll({
        formula,
        result: result.total,
        details: result,
        dicePayload,
        userName: getUserName(),
        textual: text,
        sides: sidesNum,
        color: currentDiceColor,
        isRemote: false,
      });

      return result;
    } catch (error) {
      console.error('[DiceStore] Local Roll Error:', error);
      throw error;
    }
  }

  async function forceDisplayRoll(rollData) {
    const {
      formula,
      result,
      details,
      dicePayload,
      color = currentDiceColor,
      userName,
      textual,
      sides: sidesNum,
      isRemote = false,
    } = rollData;

    const sides = parseInt(sidesNum || details?.parsedData?.sides || 20, 10);
    const rolls = dicePayload ||
      details?.details?.map((d) => d.value) ||
      details?.rolls || [result];

    isDiceVisible = true;
    await ensureInitialized(null);
    const instance = diceBoxInstance.getInstance();

    const diceToRoll = Array.isArray(rolls) ? rolls : [{ sides, value: rolls[0] }];

    if (instance) {
      instance.show();
      try {
        await instance.roll(diceToRoll);
      } catch (e) {
        console.warn('[DiceStore] 3D animation error:', e);
      }
    }

    const rollId = generateId();
    pendingAlerts = [
      ...pendingAlerts,
      {
        id: rollId,
        userName,
        formula,
        result,
        successes: details?.successes,
        textual,
        rolls: rolls.map ? rolls.map((d) => (typeof d === 'object' ? d.value : d)) : rolls,
        diceType: `d${sides}`,
        color,
        isRemote,
        timestamp: Date.now(),
      },
    ];
  }

  function completeDice(id, result) {
    activeDice = activeDice.map((d) => (d.id === id ? { ...d, rolling: false, result } : d));

    pendingAlerts = [
      ...pendingAlerts,
      {
        id,
        userName: getUserName(),
        formula: result.parsedData?.original || result.formula,
        result: result.total,
        successes: result.successes,
        textual: result.textual,
        rolls: result.details ? result.details.map((d) => d.value) : result.rolls,
        diceType: result.parsedData ? `d${result.parsedData.sides}` : result.diceType,
        timestamp: Date.now(),
      },
    ];

    processNextAlert();
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

  async function playRemoteRoll(roll) {
    if (!gameState.gameId) return;

    try {
      const color = roll.color || roll.details?.color || '#0000ff';
      const rawDetails = roll.details?.details || [];
      if (rawDetails.length === 0) return;

      const sidesNum = parseInt(roll.details?.parsedData?.sides || 20, 10);
      const result = roll.result;
      const details = roll.details;
      const formula = roll.formula;
      const textual = roll.details?.textual || `🎲 Rolou ${formula}: ${details?.textual || result}`;
      const dicePayload = roll.details?.dicePayload;

      await forceDisplayRoll({
        formula,
        result,
        details,
        dicePayload,
        color,
        userName: roll.user_name,
        textual,
        sides: sidesNum,
        isRemote: true,
      });

      gameState.addMessageToChatLocal(textual, 'user', roll.user_name);
    } catch (err) {
      console.error('[DiceStore] playRemoteRoll error:', err);
    }
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
    forceDisplayRoll,
    playRemoteRoll,
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
