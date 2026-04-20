# Tasks: 015 - Instant Sync Execution

- [ ] **Task 1: Consertar o Crash de Array no Wrapper (`useDiceBox.js`)**
  - No arquivo `public/src/lib/actions/useDiceBox.js`, altere o topo da função `roll(formula)` para suportar Arrays:
    ```javascript
    async function roll(formula) {
      if (!diceBoxInstance) await init();
      return new Promise(async (resolve, reject) => {
        if (!diceBoxInstance) return reject(new Error('DiceBox not initialized'));

        let shouldSum = false;
        let effectiveFormula = formula;
        let originalFormula = formula;

        if (typeof formula === 'string') {
          effectiveFormula = formula.trim();
          if (effectiveFormula.endsWith('+')) {
            shouldSum = true;
            effectiveFormula = effectiveFormula.slice(0, -1).trim();
          }
        } else if (Array.isArray(formula)) {
          originalFormula = 'forced_roll';
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

- [ ] **Task 2: Aceitar UUIDs Externos no Banco (`tables.ts`)**
  - No arquivo `public/src/lib/supabase/tables.ts`, altere a função `addChatMessage`:
    ```typescript
    async addChatMessage(text: string, type: string = 'user', sender?: string, gameId?: string, id?: string) {
      const payload: any = { text, type, sender: sender || authState.displayName || 'Anonymous', game_id: gameId };
      if (id) payload.id = id;
      const { data, error } = await supabase.from('chat_messages').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    ```
  - Faça o mesmo com `addRoll` para aceitar `id?: string` no parâmetro e injetar `if (rollData.id) payload.id = rollData.id;`.

- [ ] **Task 3: Broadcast Instantâneo no GameState (`gameState.svelte.ts`)**
  - No arquivo `public/src/lib/state/gameState.svelte.ts`, adicione `private roomChannel: any = null;` abaixo de `private itemChannel: any = null;`.
  - No método `init(gameId)`, antes de `db.subscribeToItems`, insira a lógica de WebSockets:
    ```typescript
    if (gameId) {
      this.roomChannel = supabase.channel(`room:${gameId}`, { config: { broadcast: { ack: false } } });
      
      this.roomChannel
        .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
          if (payload.userId !== authState.user?.id) {
            if (!this.chatMessages.find(m => m.id === payload.message.id)) {
              this.chatMessages = [...this.chatMessages, payload.message];
            }
          }
        })
        .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
          if (payload.userId !== authState.user?.id) {
            if (!this.rolls.find(r => r.id === payload.roll.id)) {
              this.rolls =[payload.roll, ...this.rolls];
              import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(payload.roll));
            }
          }
        })
        .subscribe();
    }
    ```
  - E lembre-se de adicionar `if (this.roomChannel) { supabase.removeChannel(this.roomChannel); this.roomChannel = null; }` no método `cleanupRealtimeChannels()`.
  - Altere `sendMessage`:
    ```typescript
    async sendMessage(text: string) {
      if (!authState.isAuthenticated || !authState.displayName) return;
      const msgId = crypto.randomUUID();
      const msg = { id: msgId, text, type: 'user', sender: authState.displayName, game_id: this.currentGameId, created_at: new Date().toISOString() };
      
      if (!this.chatMessages.find(m => m.id === msg.id)) this.chatMessages = [...this.chatMessages, msg];
      
      if (this.roomChannel) {
        this.roomChannel.send({ type: 'broadcast', event: 'chat_message', payload: { message: msg, userId: authState.user?.id } });
      }
      db.addChatMessage(text, 'user', authState.displayName, this.currentGameId, msgId);
    }
    ```
  - Altere `sendRoll` para seguir o mesmo padrão: gere um `rollId = crypto.randomUUID()`, construa `rollData`, salve em `this.rolls`, envie no `this.roomChannel.send({ type: 'broadcast', event: 'dice_roll', payload: { roll: rollData, userId: authState.user?.id } })` e passe o `rollId` para `db.addRoll`.

- [ ] **Task 4: Remover Limpeza Automática do Dado (`diceStore.svelte.js`)**
  - No arquivo `public/src/lib/state/diceStore.svelte.js`, em `rollDice(formula)`, execute o `.roll` assincronamente da seguinte forma:
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

          const { gameState } = await import('./gameState.svelte.ts');
          gameState.sendRoll(formula, evaluated.total, evaluated, currentDiceColor);
          gameState.sendMessage(`🎲 Rolou ${formula}: ${evaluated.textual}`);

          const rollId = generateId();
          pendingAlerts =[...pendingAlerts, {
            id: rollId, userName: getUserName(), formula, result: evaluated.total, successes: evaluated.successes, textual: evaluated.textual, rolls: evaluated.details ? evaluated.details.map((d) => d.value) : evaluated.rolls, diceType: `d${parsedData.sides}`, timestamp: Date.now()
          }];
          processNextAlert();
          resolve(evaluated);
        } catch (error) { reject(error); }
      });
    }
    ```
  - Em `playRemoteRoll(roll)`, aplique a mesma correção garantindo que o array de detalhes seja forçado corretamente sem crashar a lib:
    ```javascript
    async function playRemoteRoll(roll) {
      const color = roll.details?.color || roll.color || '#0000ff';
      const rawDetails = roll.details?.details ||[];
      if (rawDetails.length === 0) return;

      const sides = roll.details?.parsedData?.sides || 20;
      const forcedArray = rawDetails.map(d => ({
        qty: 1, sides, value: d.value, themeColor: color
      }));

      isDiceVisible = true;
      await ensureInitialized(null);

      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          await diceBoxInstance.roll(forcedArray);
        } catch (e) {
          console.warn('Remote dice animation skipped', e);
        }
      }

      const rollId = generateId();
      pendingAlerts =[...pendingAlerts, {
        id: rollId, userName: roll.user_name, formula: roll.formula, result: roll.result, successes: roll.details?.successes, textual: roll.details?.textual, rolls: rawDetails.map(d => d.value), diceType: `d${sides}`, color, isRemote: true, timestamp: Date.now()
      }];
      processNextAlert();
    }
    ```
  - **Certifique-se** de que não exista nenhum `setTimeout(() => { clear3DDice(); }, 3000);` nesses dois métodos.