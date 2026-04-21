# Tasks: 014 - Rebuild Execution

- [ ] **Task 1: Consertar Erros 406 do Supabase (`tables.ts` e `music.svelte.js`)**
  - Em `src/lib/supabase/tables.ts`, busque por `getAudioState` e mude `.single()` para `.maybeSingle()`. Faça o mesmo em `getSettings`.
  - No arquivo `src/lib/state/gameState.svelte.ts`, vá para a função `checkUserGameMembership` e mude o `.single()` para `.maybeSingle()`.
  - Em `src/lib/state/music.svelte.js`, vá para a função `loadPlayerState` e mude `.single()` para `.maybeSingle()`.

- [ ] **Task 2: Acabar com o Lazy-Loading dos Dados 3D (`+layout.svelte`)**
  - No arquivo `src/routes/+layout.svelte`, garanta que a importação do store de dados exista estaticamente no topo do script: `import { diceStore } from '$lib/state/diceStore.svelte.js';`.
  - Dentro do `onMount`, o código já cria o `diceContainer` e chama `diceStore.initDiceBox(diceContainer);`. Mantenha assim. Remova quaisquer listeners antigos que sobraram do `supabase.channel` dentro do `+layout.svelte`.

- [ ] **Task 3: Refatorar Lógica de Broadcast (`gameState.svelte.ts`)**
  - Em `src/lib/state/gameState.svelte.ts`, crie a função:
    ```typescript
    broadcastRoll(payload: any) {
      if (!authState.isAuthenticated || !authState.displayName) return;

      const chatMsg = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: payload.textual, type: 'user', sender: payload.userName,
        game_id: this.currentGameId, created_at: new Date().toISOString()
      };
      
      const rollData = {
        id: payload.rollId, user_name: payload.userName, formula: payload.formula,
        result: payload.result, details: payload.details, color: payload.color,
        game_id: this.currentGameId, created_at: new Date().toISOString()
      };

      if (!this.chatMessages.find(m => m.id === chatMsg.id)) this.chatMessages =[...this.chatMessages, chatMsg];
      if (!this.rolls.find(r => r.id === rollData.id)) this.rolls = [rollData, ...this.rolls];

      if (this.roomChannel) {
        this.roomChannel.send({ type: 'broadcast', event: 'dice_roll', payload: { roll: rollData, chatMsg, color: payload.color, userId: authState.user?.id } });
      }

      db.addRoll({ userName: payload.userName, formula: payload.formula, result: payload.result, details: payload.details, color: payload.color, gameId: this.currentGameId, id: rollData.id }).catch(console.error);
      db.addChatMessage(payload.textual, 'user', payload.userName, this.currentGameId, chatMsg.id).catch(console.error);
    }
    ```
  - E atualize o listener de WS em `setupRoomChannel`:
    ```typescript
    .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
      if (payload.userId !== authState.user?.id) {
        if (payload.chatMsg && !this.chatMessages.find(m => m.id === payload.chatMsg.id)) {
          this.chatMessages =[...this.chatMessages, payload.chatMsg];
        }
        if (payload.roll && !this.rolls.find(r => r.id === payload.roll.id)) {
          this.rolls =[payload.roll, ...this.rolls];
          import('./diceStore.svelte.js').then(m => {
            m.diceStore.execute3DAnimation({
              rollId: payload.roll.id, formula: payload.roll.formula,
              result: payload.roll.result, details: payload.roll.details,
              color: payload.color, userName: payload.roll.user_name, textual: payload.chatMsg.text
            });
          });
        }
      }
    })
    ```

- [ ] **Task 4: A Nova Lógica Síncrona 3D (`diceStore.svelte.js`)**
  - No `src/lib/state/diceStore.svelte.js`, adicione e exporte a nova função principal:
    ```javascript
    async function execute3DAnimation(payload) {
      const { rollId, formula, result, details, color, userName, textual } = payload;
      const sides = details.parsedData.sides;
      const forcedArray = details.details.map(d => ({
        qty: 1, sides, value: d.value, themeColor: color || '#0000ff'
      }));

      isDiceVisible = true;

      pendingAlerts =[...pendingAlerts, {
        id: rollId, userName, formula, result, successes: details.successes,
        textual, rolls: details.details.map(d => d.value),
        diceType: `d${sides}`, color, timestamp: Date.now(),
      }];
      processNextAlert();

      await ensureInitialized(null);
      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
          await instance.roll(forcedArray);
        } catch (e) { console.warn('Animation skipped', e); }
      }
    }
    ```
  - Substitua a antiga `rollDice` por:
    ```javascript
    async function rollDice(formula) {
      const parsedData = parseFormula(formula);
      if (!parsedData) throw new Error('Invalid formula');

      const result = fallbackRoll(parsedData);
      result.formula = formula;

      const payload = {
        rollId: generateId(), formula, result: result.total,
        details: result, color: currentDiceColor,
        userName: getUserName(), textual: `🎲 Rolou ${formula}: ${result.textual}`
      };

      const { gameState } = await import('./gameState.svelte.ts');
      gameState.broadcastRoll(payload);
      execute3DAnimation(payload);

      return result;
    }
    ```
  - Apague as antigas funções `playSyncRoll` ou `playRemoteRoll` se ainda estiverem lá. Certifique-se que o array em `diceStore` expõe: `rollDice, execute3DAnimation, ...`