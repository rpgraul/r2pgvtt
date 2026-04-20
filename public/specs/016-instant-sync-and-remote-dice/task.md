# Tasks: 016 - Instant Sync Execution

- [ ] **Task 1: Corrigir o Crash do Array no `useDiceBox.js`**
  - Vá para `src/lib/actions/useDiceBox.js` e atualize o início da função `roll` para:
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

- [ ] **Task 2: Aceitar IDs Manuais no Banco (`tables.ts`)**
  - No arquivo `src/lib/supabase/tables.ts`, modifique a assinatura de `addChatMessage` para:
    `async addChatMessage(text: string, type: string = 'user', sender?: string, gameId?: string, id?: string)`
    E adicione o `id` ao objeto payload:
    `const payload: any = { text, type, sender: sender || authState.displayName || 'Anonymous', game_id: gameId }; if (id) payload.id = id;`
  - Em `addRoll`, atualize a interface do argumento para receber `id?: string` e passe para o payload: `if (rollData.id) payload.id = rollData.id;`.

- [ ] **Task 3: Broadcast Instantâneo no `gameState.svelte.ts`**
  - Em `src/lib/state/gameState.svelte.ts`, crie a variável privada `private roomChannel: any = null;` perto do topo da classe.
  - Crie o método:
    ```typescript
    private setupRoomChannel(gameId: string) {
      if (this.roomChannel) supabase.removeChannel(this.roomChannel);
      
      this.roomChannel = supabase.channel(`room:${gameId}`, { config: { broadcast: { ack: false } } });
      
      this.roomChannel
        .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
          console.log('[Broadcast] Chat received:', payload);
          if (payload.userId !== authState.user?.id && !this.chatMessages.find(m => m.id === payload.message.id)) {
            this.chatMessages = [...this.chatMessages, payload.message];
          }
        })
        .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
          console.log('[Broadcast] Roll received:', payload);
          if (payload.userId !== authState.user?.id && !this.rolls.find(r => r.id === payload.roll.id)) {
            this.rolls = [payload.roll, ...this.rolls];
            import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(payload.roll));
          }
        })
        .subscribe((status) => console.log('[Broadcast] Room channel status:', status));
    }
    ```
  - Chame `this.setupRoomChannel(gameId);` no método `init(gameId)` logo após `this.cleanupRealtimeChannels()`. E em `cleanupRealtimeChannels()` adicione `if (this.roomChannel) { supabase.removeChannel(this.roomChannel); this.roomChannel = null; }`.
  - Atualize `sendMessage(text)` e `sendSystemMessage(text)` para: gerar um id (`const msgId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();`), montar o objeto `message`, inserir no array local se não existir, e disparar:
    `if (this.roomChannel) this.roomChannel.send({ type: 'broadcast', event: 'chat_message', payload: { message, userId: authState.user?.id } });`
    E no fim: `db.addChatMessage(text, 'user', authState.displayName, this.currentGameId, msgId);`
  - Atualize `sendRoll(formula, result, details, color)` para a mesma lógica (gerando `rollId`, montando `rollData`, enviando via `this.roomChannel.send` com evento `dice_roll` e chamando `db.addRoll` passando o `rollId`).

- [ ] **Task 4: Renderização Perfeita de Outros Jogadores (`diceStore.svelte.js`)**
  - No arquivo `src/lib/state/diceStore.svelte.js`, garanta que `rollDice(formula)` tenha a lógica principal de chamar a física 3D primeiro, avaliar e depois enviar pro chat (isso já deve estar feito), mas remova *qualquer `setTimeout` que esconda o dado do jogador*.
  - Substitua a função `playRemoteRoll(roll)` pelo código a seguir:
    ```javascript
    async function playRemoteRoll(roll) {
      const color = roll.color || roll.details?.color || '#0000ff';
      const rawDetails = roll.details?.details ||[];

      if (rawDetails.length === 0) return;

      const sides = roll.details?.parsedData?.sides || 20;
      const forcedArray = rawDetails.map(d => ({
        qty: 1,
        sides,
        value: d.value,
        themeColor: color
      }));

      isDiceVisible = true;
      await ensureInitialized(null);

      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          await diceBoxInstance.getInstance().roll(forcedArray);
        } catch (e) {
          console.warn('[DiceStore] Remote dice animation error', e);
        }
      }

      const rollId = generateId();
      pendingAlerts =[
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
        }
      ];
      processNextAlert();
    }
    ```
    *Atenção especial à linha `diceBoxInstance.getInstance().roll(forcedArray)` que envia para a biblioteca nativa, impedindo as travas.* NUNCA inclua timeout de 3 segundos aqui.