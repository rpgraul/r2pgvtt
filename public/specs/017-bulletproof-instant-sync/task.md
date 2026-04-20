# Tasks: 017 - Bulletproof Sync Execution

- [ ] **Task 1: Ajuste de IDs no Supabase (`tables.ts`)**
  - Edite a função `addChatMessage` em `src/lib/supabase/tables.ts`:
    ```typescript
    async addChatMessage(text: string, type: string = 'user', sender?: string, gameId?: string, id?: string) {
      const payload: any = {
        text, type, sender: sender || authState.displayName || 'Anonymous', game_id: gameId,
      };
      if (id) payload.id = id;

      const { data, error } = await supabase.from('chat_messages').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    ```
  - Edite a função `addRoll` no mesmo arquivo:
    ```typescript
    async addRoll(rollData: { userName: string; formula: string; result: number; details?: any; color?: string; gameId?: string; id?: string }) {
      const payload: any = {
        user_name: rollData.userName, formula: rollData.formula, result: rollData.result,
        details: { ...rollData.details, color: rollData.color }, game_id: rollData.gameId,
      };
      if (rollData.id) payload.id = rollData.id;

      const { data, error } = await supabase.from('dice_rolls').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    ```

- [ ] **Task 2: Atualização Completa do Listener (`gameState.svelte.ts`)**
  - No arquivo `src/lib/state/gameState.svelte.ts`, substitua o método `setupRoomChannel(gameId: string)`:
    ```typescript
    private setupRoomChannel(gameId: string) {
      if (this.roomChannel) supabase.removeChannel(this.roomChannel);
      
      this.roomChannel = supabase.channel(`room:${gameId}`, { config: { broadcast: { ack: false } } });
      
      this.roomChannel
        .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
          console.log('[Broadcast] Chat received:', payload);
          if (payload.userId !== authState.user?.id) {
            if (payload.message && !this.chatMessages.find(m => m.id === payload.message.id)) {
              this.chatMessages = [...this.chatMessages, payload.message];
            }
          }
        })
        .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
          console.log('[Broadcast] Roll received:', payload);
          if (payload.userId !== authState.user?.id) {
            if (payload.chatMsg && !this.chatMessages.find(m => m.id === payload.chatMsg.id)) {
               this.chatMessages = [...this.chatMessages, payload.chatMsg];
            }
            if (payload.roll && !this.rolls.find(r => r.id === payload.roll.id)) {
              this.rolls = [payload.roll, ...this.rolls];
              import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(payload.roll));
            }
          }
        })
        .subscribe((status) => console.log('[Broadcast] Room channel status:', status));
    }
    ```
  - Verifique que em `sendRoll`, você está passando `chatMsg` no evento:
    `this.roomChannel.send({ type: 'broadcast', event: 'dice_roll', payload: { roll: rollData, chatMsg, color, userId: authState.user?.id } });`
  - E chamando o banco enviando o ID:
    `db.addRoll({ userName: authState.displayName, formula, result, details, color, gameId: this.currentGameId, id: rollId });`

- [ ] **Task 3: Refatorar o Alerta Remoto Desacoplado (`diceStore.svelte.js`)**
  - No arquivo `src/lib/state/diceStore.svelte.js`, altere completamente a função `playRemoteRoll(roll)`:
    ```javascript
    async function playRemoteRoll(roll) {
      console.log('[DiceStore] playRemoteRoll:', roll);
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

      // Adiciona o alerta IMEDIATAMENTE, sem bloquear a execução com a promessa da engine
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

      // Dispara a física em background
      ensureInitialized(null).then(() => {
        if (diceBoxInstance && diceBoxInstance.isInitialized()) {
          try {
            // Acessamos a instância raiz para passar o Array sem sofrer com o typeof 'string' no wrapper
            const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
            instance.roll(forcedArray).catch(e => console.warn('Remote dice animation skipped', e));
          } catch (e) {
            console.warn('[DiceStore] Remote dice animation error', e);
          }
        }
      });
    }
