import DiceBox from '@3d-dice/dice-box';

let diceBoxInstance = null;

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
          assetPath,
          scale,
          gravity,
          friction,
          restitution,
          settleTimeout,
          theme,
          themeColor,
          onRollComplete: (results) => {
            window.dispatchEvent(new CustomEvent('dice:3d:finished', { detail: { results } }));
          },
        });
        await diceBoxInstance.init();
        initialized = true;
        return diceBoxInstance;
      } catch (error) {
        initPromise = null;
        throw error;
      }
    })();
    return initPromise;
  }

  function clear() {
    if (diceBoxInstance) diceBoxInstance.clear();
  }
  function show() {
    if (diceBoxInstance) diceBoxInstance.show();
  }
  function hide() {
    if (diceBoxInstance) diceBoxInstance.hide();
  }
  function isInitialized() {
    return initialized && diceBoxInstance !== null;
  }
  function updateConfig(newConfig) {
    if (diceBoxInstance && typeof diceBoxInstance.updateConfig === 'function')
      diceBoxInstance.updateConfig(newConfig);
  }

  init();

  return {
    clear,
    show,
    hide,
    isInitialized,
    updateConfig,
    init,
    getInstance: () => diceBoxInstance,
  };
}

export function useDiceBox(node, options = {}) {
  return createDiceBoxManager(node, options);
}
