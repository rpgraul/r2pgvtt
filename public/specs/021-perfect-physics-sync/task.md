# Tasks: 020 - Perfect Sync Execution

- [ ] **Task 1: Limpar o Wrapper (`useDiceBox.js`)**
  - Substitua **TODO** o conteúdo do arquivo `src/lib/actions/useDiceBox.js` por:
    ```javascript
    import DiceBox from '@3d-dice/dice-box';

    let diceBoxInstance = null;

    export function createDiceBoxManager(container, options = {}) {
      const {
        assetPath = '/assets/dice-box/', scale = 5, gravity = 1, friction = 0.8,
        restitution = 0, settleTimeout = 3000, theme = 'default', themeColor = '#0000ff'
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
              container: '#' + containerId, id: 'dice-box-canvas', assetPath,
              scale, gravity, friction, restitution, settleTimeout, theme, themeColor
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

      function clear() { if (diceBoxInstance) diceBoxInstance.clear(); }
      function show() { if (diceBoxInstance) diceBoxInstance.show(); }
      function hide() { if (diceBoxInstance) diceBoxInstance.hide(); }
      function isInitialized() { return initialized && diceBoxInstance !== null; }
      function updateConfig(newConfig) { if (diceBoxInstance && typeof diceBoxInstance.updateConfig === 'function') diceBoxInstance.updateConfig(newConfig); }

      init();

      return { clear, show, hide, isInitialized, updateConfig, init, getInstance: () => diceBoxInstance };
    }

    export function useDiceBox(node, options = {}) { return createDiceBoxManager(node, options); }
    ```

- [ ] **Task 2: Refatorar o DiceStore (`diceStore.svelte.js`)**
  - No arquivo `src/lib/state/diceStore.svelte.js`, adicione o import no topo:
    `import { gameState } from './gameState.svelte.ts';`
  - Substitua a função `rollDice` por esta lógica sincronizada (com `try/catch` e array forçado correto):
    ```javascript
    async function rollDice(formula) {
      try {
        const parsedData = parseFormula(formula);
        if (!parsedData) throw new Error('Invalid formula');

        const result = fallbackRoll(parsedData);
        result.formula = formula;
        
        const sides = parseInt(parsedData.sides);
        const forcedArray = result.details.map(d => ({
          type: `d${sides}`, value: parseInt(d.value), themeColor: currentDiceColor
        }));

        const text = `🎲 Rolou ${formula}: ${result.textual}`;
        gameState.broadcastDiceAction(formula, result.total, result, currentDiceColor, text);

        isDiceVisible = true;
        await ensureInitialized(null);
        const instance = diceBoxInstance.getInstance();
        
        if (instance) {
          instance.show();
          await instance.roll(forcedArray); // Espera a física terminar!
        }

        const rollId = generateId();
        pendingAlerts =[...pendingAlerts, {
          id: rollId, userName: getUserName(), formula, result: result.total,
          successes: result.successes, textual: result.textual,
          rolls: result.details.map(d => d.value), diceType: `d${sides}`, color: currentDiceColor, timestamp: Date.now()
        }];
        processNextAlert();

        gameState.addMessageToChatLocal(text, 'user', getUserName());
        return result;
      } catch (error) { console.error('[DiceStore] Roll error', error); throw error; }
    }
    ```
  - Substitua a função `playRemoteRoll` para processar a animação dos espectadores da mesma forma:
    ```javascript
    async function playRemoteRoll(roll) {
      if (!gameState.gameId) return; // Protege contra rolar na tela de login

      try {
        const color = roll.color || roll.details?.color || '#0000ff';
        const rawDetails = roll.details?.details ||[];
        if (rawDetails.length === 0) return;

        const sides = roll.details?.parsedData?.sides || 20;
        const forcedArray = rawDetails.map(d => ({
          type: `d${sides}`, value: parseInt(d.value), themeColor: color
        }));

        isDiceVisible = true;
        await ensureInitialized(null);
        
        const instance = diceBoxInstance.getInstance();
        if (instance) {
          instance.show();
          await instance.roll(forcedArray).catch(e => console.warn('Remote animation skipped', e));
        }

        const rollId = generateId();
        pendingAlerts =[...pendingAlerts, {
          id: rollId, userName: roll.user_name, formula: roll.formula, result: roll.result,
          successes: roll.details?.successes, textual: roll.details?.textual,
          rolls: rawDetails.map(d => d.value), diceType: `d${sides}`, color, isRemote: true, timestamp: Date.now()
        }];
        processNextAlert();

        const text = `🎲 Rolou ${roll.formula}: ${roll.details?.textual}`;
        gameState.addMessageToChatLocal(text, 'user', roll.user_name);
      } catch (err) { console.error('[DiceStore] playRemoteRoll error', err); }
    }
    ```

- [ ] **Task 3: Atualizar o GameState (`gameState.svelte.ts`)**
  - No arquivo `src/lib/state/gameState.svelte.ts`, remova os métodos e listeners de broadcast de `dice_roll` antigos. 
  - Adicione as seguintes funções à classe:
    ```typescript
    broadcastDiceAction(formula: string, result: number, details: any, color: string, textual: string) {
      if (!authState.isAuthenticated || !authState.displayName) return;

      const rollData = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        user_name: authState.displayName, formula, result, details, color,
        game_id: this.currentGameId, created_at: new Date().toISOString()
      };

      if (this.roomChannel) {
        this.roomChannel.send({ type: 'broadcast', event: 'dice_action', payload: { roll: rollData, userId: authState.user?.id } });
      }

      db.addRoll({ userName: authState.displayName, formula, result, details, color, gameId: this.currentGameId }).catch(console.error);
      db.addChatMessage(textual, 'user', authState.displayName, this.currentGameId).catch(console.error);
    }

    addMessageToChatLocal(text: string, type: string, sender: string) {
      const chatMsg = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text, type, sender, game_id: this.currentGameId, created_at: new Date().toISOString()
      };
      this.chatMessages = [...this.chatMessages, chatMsg];
    }
    ```
  - Em `setupRoomChannel`, ouça pelo `dice_action`:
    ```typescript
    .on('broadcast', { event: 'dice_action' }, ({ payload }) => {
      if (payload.userId !== authState.user?.id) {
        this.rolls = [payload.roll, ...this.rolls];
        import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(payload.roll));
      }
    })
    ```