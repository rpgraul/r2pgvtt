import { createDiceBoxManager } from '../actions/useDiceBox.js';
import { auth } from './auth.svelte.ts';
import { parseFormula, evaluateRolls } from '../utils/diceLogic.js';

function createDiceStore() {
  let activeDice = $state([]);
  let pendingAlerts = $state([]);
  let displayedAlerts = $state([]);
  let hasUserDismissed = $state(false);
  let isDiceVisible = $state(false);
  let alertTimeoutId = null;
  let diceBoxInstance = null;
  let diceBoxResolve = null;
  let diceBoxData = null;
  
  // Custom Dice Color
  const defaultColor = '#0000ff';
  let currentDiceColor = $state(
    typeof window !== 'undefined' 
      ? localStorage.getItem('rpgboard_dice_color') || defaultColor 
      : defaultColor
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
    return activeDice.some(d => d.rolling);
  }

  function getUserName() {
    return auth.getUserName();
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
      onRollComplete: (result) => {
        console.log('[DiceStore] onRollComplete called:', result);
        if (diceBoxResolve && diceBoxData) {
          const diceId = diceBoxData.id;
          console.log('[DiceStore] Resolving dice:', diceId, result);
          
          const evaluated = evaluateRolls(diceBoxData.parsedData, result.rolls);
          // Adiciona os dados passados para fallback
          evaluated.formula = diceBoxData.formula;
          evaluated.diceType = diceBoxData.diceType;

          diceBoxResolve(evaluated);
          completeDice(diceId, evaluated);
          diceBoxResolve = null;
          diceBoxData = null;
        } else {
          console.log('[DiceStore] No resolve or data, ignoring result');
        }
      }
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

      const diceId = generateId();
      const diceType = `d${parsedData.sides}`;
      
      activeDice = [...activeDice, {
        id: diceId,
        formula,
        parsedData, // Guarda estrutura completa
        diceType,
        rolling: true
      }];
      
      hasUserDismissed = false;
      isDiceVisible = true;

      // Tenta recuperar no ambiente dev (HMR) se a store for recriada
      if (!diceBoxInstance && !diceInitializing) {
        console.log('[DiceStore] Recarregando DiceBox devido a HMR...');
        initDiceBox();
      }

      // Se está inicializando, aguardar
      if (diceInitializing) {
        console.log('[DiceStore] Waiting for DiceBox initialization...');
        try {
          await diceInitializing;
        } catch (err) {
          console.error('[DiceStore] Init failed:', err);
        }
      }

      if (!diceBoxInstance || !diceBoxInstance.isInitialized()) {
        console.error('[DiceStore] DiceBox not ready after wait');
        activeDice = activeDice.filter(d => d.id !== diceId);
        reject(new Error('DiceBox not ready'));
        return;
      }

      diceBoxResolve = resolve;
      diceBoxData = { id: diceId, formula, parsedData, diceType };

      try {
        await diceBoxInstance.roll(parsedData.baseFormula);
      } catch (error) {
        console.error('[DiceStore] Roll error:', error);
        const fallback = fallbackRoll(parsedData);
        completeDice(diceId, fallback);
        activeDice = activeDice.filter(d => d.id !== diceId);
        resolve(fallback);
      }
    });
  }

  function fallbackRoll(parsedData) {
    let rawRolls = [];
    for (let i = 0; i < parsedData.count; i++) {
       rawRolls.push(Math.floor(Math.random() * parsedData.sides) + 1);
    }
    return evaluateRolls(parsedData, rawRolls);
  }

  function completeDice(id, result) {
    activeDice = activeDice.map(d => 
      d.id === id ? { ...d, rolling: false, result } : d
    );

    pendingAlerts = [...pendingAlerts, {
      id,
      userName: getUserName(),
      formula: result.parsedData?.original || result.formula,
      result: result.total,
      successes: result.successes,
      textual: result.textual,
      rolls: result.details ? result.details.map(d => d.value) : result.rolls,
      diceType: result.parsedData ? `d${result.parsedData.sides}` : result.diceType,
      timestamp: Date.now()
    }];

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
    displayedAlerts = displayedAlerts.filter(a => a.id !== id);
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
    get activeDice() { return activeDice; },
    get pendingAlerts() { return pendingAlerts; },
    get displayedAlerts() { return displayedAlerts; },
    get canDismiss() { return canDismiss; },
    get hasUserDismissed() { return hasUserDismissed; },
    get isDiceVisible() { return isDiceVisible; },
    get currentDiceColor() { return currentDiceColor; },
    
    rollDice,
    dismissAlert,
    dismissAll,
    clearDice,
    clear3DDice,
    initDiceBox,
    getDiceBox,
    processNextAlert,
    hasActiveRolls,
    setDiceColor
  };
}

export const diceStore = createDiceStore();
