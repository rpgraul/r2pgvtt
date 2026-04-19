import { createDiceBoxManager } from '../actions/useDiceBox.js';
import { authState } from './auth.svelte.ts';
import { parseFormula, evaluateRolls } from '../utils/diceLogic.js';

function createDiceStore() {
  let activeDice = $state([]);
  let pendingAlerts = $state([]);
  let displayedAlerts = $state([]);
  let hasUserDismissed = $state(false);
  let isDiceVisible = $state(false);
  let alertTimeoutId = null;
  let diceBoxInstance = null;
  const diceBoxResolve = null;
  const diceBoxData = null;

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
    return Math.random().toString(36).substr(2, 9);
  }

  let diceInitializing = null;

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

  function rollDice(formula) {
    return new Promise(async (resolve, reject) => {
      const parsedData = parseFormula(formula);
      if (!parsedData) {
        reject(new Error('Invalid formula'));
        return;
      }

      const result = fallbackRoll(parsedData);
      result.formula = formula;

      const gameStateModule = await import('./gameState.svelte.ts');
      gameStateModule.gameState.sendRoll(formula, result.total, result, currentDiceColor);

      await playSyncRoll({
        formula,
        result: result.total,
        details: result,
        color: currentDiceColor,
        userName: getUserName(),
      });

      resolve(result);
    });
  }

  function fallbackRoll(parsedData) {
    const rawRolls = [];
    for (let i = 0; i < parsedData.count; i++) {
      rawRolls.push(Math.floor(Math.random() * parsedData.sides) + 1);
    }
    return evaluateRolls(parsedData, rawRolls);
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

  function playSyncRoll(payload) {
    const { formula, result, details, color, userName } = payload;
    const sides = details.parsedData.sides;
    const forcedArray = details.details.map((d) => ({
      sides,
      themeColor: color,
      value: d.value,
    }));

    isDiceVisible = true;

    if (!diceBoxInstance && !diceInitializing) {
      initDiceBox();
    }

    const finishRoll = () => {
      const rollId = generateId();
      pendingAlerts = [
        ...pendingAlerts,
        {
          id: rollId,
          userName,
          formula,
          result,
          successes: details.successes,
          textual: details.textual,
          rolls: details.details.map((d) => d.value),
          diceType: `d${sides}`,
          timestamp: Date.now(),
        },
      ];
      processNextAlert();
      setTimeout(() => {
        clear3DDice();
      }, 3000);
    };

    const doRoll = () => {
      if (!diceBoxInstance || !diceBoxInstance.isInitialized()) {
        console.error('[DiceStore] playSyncRoll: DiceBox not ready');
        return;
      }
      diceBoxInstance.getInstance().roll(forcedArray).then(finishRoll);
    };

    if (diceInitializing) {
      diceInitializing.then(doRoll);
    } else {
      doRoll();
    }
  }

  async function playRemoteRoll(roll) {
    const color = roll.details?.color || '#0000ff';
    const rawDetails = roll.details?.details || [];

    if (rawDetails.length === 0) return;

    const sides = roll.details?.parsedData?.sides || 6;
    const forcedArray = rawDetails.map(d => ({
      qty: 1,
      sides,
      value: d.value,
      themeColor: color,
    }));

    isDiceVisible = true;

    const finishRoll = () => {
      const rollId = generateId();
      pendingAlerts = [
        ...pendingAlerts,
        {
          id: rollId,
          userName: roll.user_name,
          formula: roll.formula,
          result: roll.result,
          successes: roll.details?.successes,
          textual: roll.details?.textual,
          rolls: rawDetails.map(d => d.value),
          diceType: `d${sides}`,
          color,
          isRemote: true,
          timestamp: Date.now(),
        },
      ];
      processNextAlert();
      setTimeout(() => {
        clear3DDice();
      }, 3000);
    };

    const doRoll = () => {
      if (!diceBoxInstance || !diceBoxInstance.isInitialized()) {
        if (!diceInitializing) {
          initDiceBox();
        }
        diceInitializing.then(() => {
          if (diceBoxInstance) {
            diceBoxInstance.getInstance().roll(forcedArray).then(finishRoll);
          }
        });
        return;
      }
      diceBoxInstance.getInstance().roll(forcedArray).then(finishRoll);
    };

    if (diceInitializing) {
      diceInitializing.then(doRoll);
    } else {
      doRoll();
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
    playSyncRoll,
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
    addRemoteAlert,
  };
}

export const diceStore = createDiceStore();
