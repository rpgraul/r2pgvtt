# Tasks: 019 - Event-Driven Sync Execution

- [ ] **Task 1: Bulletproof `useDiceBox.js`**
  - In `src/lib/actions/useDiceBox.js`, update the `async function roll(formula)` to safely handle arrays:
    ```javascript
    async function roll(formula) {
      if (!diceBoxInstance) await init();
      return new Promise(async (resolve, reject) => {
        if (!diceBoxInstance) return reject(new Error('DiceBox not initialized'));

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
        currentRollData = { formula: effectiveFormula, originalFormula, shouldSum };

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

- [ ] **Task 2: Decouple `gameState.svelte.ts`**
  - In `src/lib/state/gameState.svelte.ts`, **remove** any import related to `diceStore`.
  - Add a private property to the class: `private _hasLocalRollListener = false;`
  - In the `init(gameId: string | null = null)` method, add this block:
    ```typescript
    if (typeof window !== 'undefined' && !this._hasLocalRollListener) {
      window.addEventListener('outgoing_local_roll', (e: any) => {
        const { formula, result, details, color, text } = e.detail;
        this.sendRoll(formula, result, details, color, text);
      });
      this._hasLocalRollListener = true;
    }
    ```
  - In `setupRoomChannel`, update the `dice_roll` event block:
    ```typescript
    .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
      console.log('[Broadcast] Roll received:', payload);
      if (payload.userId !== authState.user?.id) {
        if (payload.chatMsg && !this.chatMessages.find(m => m.id === payload.chatMsg.id)) {
          this.chatMessages =[...this.chatMessages, payload.chatMsg];
        }
        if (payload.roll && !this.rolls.find(r => r.id === payload.roll.id)) {
          this.rolls =[payload.roll, ...this.rolls];
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('incoming_remote_roll', { detail: payload.roll }));
          }
        }
      }
    })
    ```

- [ ] **Task 3: Decouple and Secure `diceStore.svelte.js`**
  - In `src/lib/state/diceStore.svelte.js`, **remove** any import related to `gameState`.
  - Update `rollDice(formula)` to dispatch the local event instead of calling gameState:
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
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('outgoing_local_roll', {
              detail: { formula, result: evaluated.total, details: evaluated, color: currentDiceColor, text }
            }));
          }

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
  - Update `playRemoteRoll(roll)` to handle the remote roll safely:
    ```javascript
    async function playRemoteRoll(roll) {
      try {
        const color = roll.color || roll.details?.color || '#0000ff';
        const rawDetails = roll.details?.details ||[];

        if (rawDetails.length === 0) return;

        const sides = roll.details?.parsedData?.sides || 20;
        const forcedArray = rawDetails.map(d => ({
          qty: 1, sides, value: d.value, themeColor: color
        }));

        isDiceVisible = true;

        const rollId = generateId();
        pendingAlerts =[
          ...pendingAlerts,
          {
            id: rollId, userName: roll.user_name, formula: roll.formula, result: roll.result,
            successes: roll.details?.successes, textual: roll.details?.textual,
            rolls: rawDetails.map(d => d.value), diceType: `d${sides}`, color, isRemote: true, timestamp: Date.now(),
          }
        ];
        processNextAlert();

        await ensureInitialized(null);
        if (diceBoxInstance && diceBoxInstance.isInitialized()) {
          const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
          instance.roll(forcedArray).catch(e => console.warn('Remote dice animation skipped', e));
        }
      } catch (err) {
        console.error('[DiceStore] playRemoteRoll error:', err);
      }
    }
    ```
  - At the very bottom of the file (outside the `createDiceStore` function, or inside it if needed, but ensure it only runs once), add the event listener:
    ```javascript
    if (typeof window !== 'undefined') {
      window.addEventListener('incoming_remote_roll', (e) => {
        diceStore.playRemoteRoll(e.detail);
      });
    }
    ```