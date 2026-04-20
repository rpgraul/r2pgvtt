# Tasks: 018 - Final Instant Sync Execution

- [ ] **Task 1: Blindar a Action `useDiceBox.js`**
  - No arquivo `src/lib/actions/useDiceBox.js`, substitua toda a função `async function roll(formula)` por esta versão:
    ```javascript
    async function roll(formula) {
      if (!diceBoxInstance) await init();

      return new Promise(async (resolve, reject) => {
        if (!diceBoxInstance) {
          reject(new Error('DiceBox not initialized'));
          return;
        }

        let shouldSum = false;
        let effectiveFormula = formula;
        let originalFormula = 'forced_roll';

        if (typeof formula === 'string') {
          effectiveFormula = formula.trim();
          originalFormula = effectiveFormula;
          if (effectiveFormula.endsWith('+')) {
            shouldSum = true;
            effectiveFormula = effectiveFormula.slice(0, -1).trim();
          }
        }

        currentRollResolve = resolve;
        currentRollData = {
          formula: effectiveFormula,
          originalFormula,
          shouldSum,
        };

        try {
          diceBoxInstance.show();
          await new Promise((r) => setTimeout(r, 50));
          diceBoxInstance.roll(effectiveFormula);
        } catch (error) {
          console.error('[Dice3D] Roll error:', error);
          currentRollResolve = null;
          currentRollData = null;
          reject(error);
        }
      });
    }
    ```

- [ ] **Task 2: GameState - Importação Estática e Payload Duplo**
  - No topo do arquivo `src/lib/state/gameState.svelte.ts`, adicione o import: `import { diceStore } from './diceStore.svelte.js';`.
  - No método `setupRoomChannel`, altere a escuta do evento `dice_roll` para:
    ```typescript
    .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
      console.log('[Broadcast] Roll received:', payload);
      if (payload.userId !== authState.user?.id) {
        if (payload.chatMsg && !this.chatMessages.find(m => m.id === payload.chatMsg.id)) {
          this.chatMessages = [...this.chatMessages, payload.chatMsg];
        }
        if (payload.roll && !this.rolls.find(r => r.id === payload.roll.id)) {
          this.rolls = [payload.roll, ...this.rolls];
          diceStore.playRemoteRoll(payload.roll);
        }
      }
    })
    ```
  - Altere a função `sendRoll` para:
    ```typescript
    async sendRoll(formula: string, result: number, details: any, color: string, textual: string) {
      if (!authState.isAuthenticated || !authState.displayName) return;

      const rollId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const msgId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + 1).toString();

      const rollData = {
        id: rollId, user_name: authState.displayName, userId: authState.user?.id,
        formula, result, details: { ...details, color }, color,
        game_id: this.currentGameId, created_at: new Date().toISOString(),
      };

      const chatMsg = {
        id: msgId, text: textual, type: 'user',
        sender: authState.displayName, senderId: authState.user?.id,
        game_id: this.currentGameId, created_at: new Date().toISOString(),
      };

      if (!this.rolls.find(r => r.id === rollData.id)) this.rolls =[rollData, ...this.rolls];
      if (!this.chatMessages.find(m => m.id === chatMsg.id)) this.chatMessages = [...this.chatMessages, chatMsg];

      if (this.roomChannel) {
        this.roomChannel.send({
          type: 'broadcast', event: 'dice_roll',
          payload: { roll: rollData, chatMsg, color, userId: authState.user?.id }
        });
      }

      db.addRoll({ userName: authState.displayName, formula, result, details, color, gameId: this.currentGameId, id: rollId }).catch(console.error);
      db.addChatMessage(textual, 'user', authState.displayName, this.currentGameId, msgId).catch(console.error);
    }
    ```

- [ ] **Task 3: DiceStore - Engine Refactoring**
  - No topo de `src/lib/state/diceStore.svelte.js`, adicione o import: `import { gameState } from './gameState.svelte.ts';`.
  - Reescreva a função `rollDice` usando async/await puro:
    ```javascript
    function rollDice(formula) {
      return new Promise(async (resolve, reject) => {
        try {
          const parsedData = parseFormula(formula);
          if (!parsedData) throw new Error('Invalid formula');

          isDiceVisible = true;
          await ensureInitialized(null);

          const physicsResult = await diceBoxInstance.roll(parsedData.baseFormula);
          const evaluated = evaluateRolls(parsedData, physicsResult.rolls);
          evaluated.formula = formula;

          const text = `🎲 Rolou ${formula}: ${evaluated.textual}`;
          gameState.sendRoll(formula, evaluated.total, evaluated, currentDiceColor, text);

          const rollId = generateId();
          pendingAlerts =[
            ...pendingAlerts,
            {
              id: rollId, userName: getUserName(), formula, result: evaluated.total,
              successes: evaluated.successes, textual: evaluated.textual,
              rolls: evaluated.details ? evaluated.details.map(d => d.value) : evaluated.rolls,
              diceType: `d${parsedData.sides}`, timestamp: Date.now(),
            },
          ];
          processNextAlert();
          resolve(evaluated);
        } catch (error) { reject(error); }
      });
    }
    ```
  - Reescreva `playRemoteRoll(roll)`:
    ```javascript
    async function playRemoteRoll(roll) {
      console.log('[DiceStore] playRemoteRoll called:', roll);
      const color = roll.color || roll.details?.color || '#0000ff';
      const rawDetails = roll.details?.details ||[];

      if (rawDetails.length === 0) return;

      const sides = roll.details?.parsedData?.sides || 20;
      const forcedArray = rawDetails.map(d => ({
        qty: 1, sides, value: d.value, themeColor: color,
      }));

      isDiceVisible = true;
      const rollId = generateId();
      pendingAlerts =[
        ...pendingAlerts,
        {
          id: rollId, userName: roll.user_name, formula: roll.formula, result: roll.result,
          successes: roll.details?.successes, textual: roll.details?.textual,
          rolls: rawDetails.map(d => d.value), diceType: `d${sides}`, color, isRemote: true, timestamp: Date.now(),
        },
      ];
      processNextAlert();

      await ensureInitialized(null);
      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
          instance.roll(forcedArray).catch(e => console.warn('Remote dice animation skipped', e));
        } catch (e) { console.warn('[DiceStore] Engine failed to roll forced array:', e); }
      }
    }
    ```