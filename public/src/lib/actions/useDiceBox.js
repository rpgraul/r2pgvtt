import DiceBox from '@3d-dice/dice-box';

let diceBoxInstance = null;
let currentRollResolve = null;
let currentRollData = null;
let diceDismissLocked = false;

function extractDiceType(formula) {
  const match = formula.match(/(\d*)d(\d+)/i);
  if (match) return `d${match[2]}`;
  return 'd20';
}

export function createDiceBoxManager(container, options = {}) {
  const {
    assetPath = '/assets/dice-box/',
    scale = 5,
    gravity = 1,
    friction = 0.8,
    restitution = 0,
    settleTimeout = 3000,
    theme = 'default',
    themeColor = '#0000ff',
    onRollComplete = () => { }
  } = options;

  const containerId = container?.id || 'dice-box-wrapper';

  let initialized = false;
  let initPromise = null;

  async function init() {
    if (initialized || diceBoxInstance) return diceBoxInstance;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        diceBoxInstance = new DiceBox({
          container: '#' + containerId,
          id: 'dice-box-canvas',
          idExt: '', // Some versions of DiceBox append an extension. We can explicitly provide '' to keep it 'dice-box-canvas' if needed, or just let it be. But `id: 'dice-box-canvas'` handles it.
          assetPath,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          scale,
          gravity,
          friction,
          restitution,
          settleTimeout,
          theme,
          themeColor,
          onBeforeRoll: () => {
            diceDismissLocked = true;
          },
          onRollComplete: (rollResult) => {
            const firstGroup = Array.isArray(rollResult) ? rollResult[0] : rollResult;

            if (firstGroup && currentRollResolve && currentRollData) {
              const rolls = (firstGroup.rolls || []).map(r => r.value || r.result || 0);
              let total = firstGroup.value || 0;
              const diceType = extractDiceType(currentRollData.formula);
              
              // Ajuste automático para d100 (se 00 e 0 resultarem em 0, é 100 no RPG clássico)
              if (diceType === 'd100') {
                 if (total === 0) total = 100;
              }
              
              const result = {
                total,
                rolls,
                formula: currentRollData.originalFormula || currentRollData.formula,
                diceType,
                shouldSum: currentRollData.shouldSum || false
              };

              currentRollResolve(result);
              onRollComplete(result);

              currentRollResolve = null;
              currentRollData = null;
            }

            diceDismissLocked = true;

            setTimeout(() => {
              diceDismissLocked = false;
            }, 3000);
          }
        });

        await diceBoxInstance.init();
        initialized = true;
        return diceBoxInstance;
      } catch (error) {
        console.error('[DiceBox] Init error:', error);
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  }

  async function roll(formula) {
    if (!diceBoxInstance) {
      await init();
    }

    return new Promise(async (resolve, reject) => {
      if (!diceBoxInstance) {
        reject(new Error('DiceBox not initialized'));
        return;
      }

      let shouldSum = false;
      let effectiveFormula = formula.trim();
      
      if (effectiveFormula.endsWith('+')) {
        shouldSum = true;
        effectiveFormula = effectiveFormula.slice(0, -1).trim();
      }

      currentRollResolve = resolve;
      currentRollData = { 
        formula: effectiveFormula, 
        originalFormula: formula,
        shouldSum 
      };

      try {
        diceBoxInstance.show();
        await new Promise(r => setTimeout(r, 50));
        diceBoxInstance.roll(effectiveFormula);
      } catch (error) {
        console.error('[Dice3D] Roll error:', error);
        currentRollResolve = null;
        currentRollData = null;
        reject(error);
      }
    });
  }

  function clear() {
    if (diceBoxInstance) {
      diceBoxInstance.clear();
    }
  }

  function show() {
    if (diceBoxInstance) {
      diceBoxInstance.show();
    }
  }

  function hide() {
    if (diceBoxInstance) {
      diceBoxInstance.hide();
    }
  }

  function destroy() {
    if (diceBoxInstance) {
      diceBoxInstance.destroy();
      diceBoxInstance = null;
      initialized = false;
      initPromise = null;
    }
  }

  function isInitialized() {
    return initialized && diceBoxInstance !== null;
  }

  function updateConfig(newConfig) {
    if (diceBoxInstance && typeof diceBoxInstance.updateConfig === 'function') {
      diceBoxInstance.updateConfig(newConfig);
    }
  }

  init();

  return {
    roll,
    clear,
    show,
    hide,
    destroy,
    isInitialized,
    updateConfig,
    init,
    getInstance: () => diceBoxInstance
  };
}

export function useDiceBox(node, options = {}) {
  return createDiceBoxManager(node, options);
}
