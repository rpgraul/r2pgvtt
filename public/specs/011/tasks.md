# Tasks: Absolute Sync Refactoring

- [x] **Task 1: Ajuste do `tables.ts` (Single Source of Truth)**
  - Reescreva `subscribeToChat(gameId, onInitialLoad, onInsert)`. A função deve carregar o histórico ordenado por `created_at` e executar `onInitialLoad(data)`. Depois, usar `supabase.channel(...).on('postgres_changes', {event: 'INSERT', table: 'chat_messages', ...}, payload => onInsert(payload.new)).subscribe()`. Retorne a função de remover o canal.
  - Faça o mesmo com `subscribeToRolls(gameId, onInitialLoad, onInsert)`.
  - Reescreva `addChatMessage` e `addRoll` para realizar apenas o `.insert().select().single()` puro no banco. No `addRoll`, armazene a cor dentro do JSONB: `details: { ...rollData.details, color: rollData.color }`.

- [x] **Task 2: Ajuste do `gameState.svelte.ts` (Sincronização)**
  - No `init`, atualize as chamadas do chat e dos rolls para usar a nova assinatura `(gameId, onInitialLoad, onInsert)`.
  - Na callback `onInsert` de rolls, se `newRoll.user_name !== this.userName`, chame dinamicamente `import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(newRoll))`.
  - Atualize os métodos `sendMessage` e `sendRoll`. Eles devem apenas usar `await db.add...` e, caso o retorno não esteja já nos arrays de estado (`this.chatMessages` ou `this.rolls`), adicioná-los no topo/final da lista.
  - Remova as referências obsoletas aos canais de broadcast manuais (`roomChannel`).

-[x] **Task 3: Ajuste do `diceStore.svelte.js` (Lógica Centralizada)**
  - Vá para a configuração do `diceBoxInstance` no `initDiceBox` e localize o `onRollComplete`.
  - Se for o autor da rolagem (`if (diceBoxResolve)`): Use a importação dinâmica para pegar o gameState e chame `m.gameState.sendRoll(diceBoxData.formula, evaluated.total, evaluated, currentDiceColor)` e também `m.gameState.sendMessage(...)`. Resolve a promise do dado.
  - Crie e exporte a função assíncrona `playRemoteRoll(roll)`. Dentro dela: Faça o parse da fórmula original. Crie `const forcedArray = roll.details.details.map(d => ({ qty: 1, sides: parsedData.sides, value: d.value, themeColor: roll.details.color || '#0000ff' }));`. Mude `isDiceVisible = true`. Pegue a instância (`const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;`) e execute `await instance.roll(forcedArray)`. Chame `addRemoteAlert` e agende a limpeza `clear3DDice` após 3s.

-[x] **Task 4: Limpeza drástica nos Componentes de UI (Fim das Duplicações)**
  - Em `src/components/dice/DiceRoller.svelte`: Remova o import e código de inicialização do `useDiceBox`. Remova o HTML do `<div bind:this={diceContainer}...></div>`. Nas funções `rollDice` e `rollCustom`, mantenha apenas `isLoading = true`, chame `lastResult = await diceStore.rollDice(formula)`, defina `isLoading = false`. Apague `gameState.sendMessage` e `gameState.sendRoll` dali de dentro.
  - Em `src/components/chat/ChatSidebar.svelte`: Na linha onde rola dados com `/r`, mantenha apenas `diceStore.rollDice(formula).catch(err => console.error(err));`. Apague os `gameState.sendRoll` e `gameState.sendMessage` que estavam dentro do `.then()`.
  - Em `src/components/FAB.svelte`: Nas rolagens (cases `d4`, `d6`, etc.), mantenha apenas `diceStore.rollDice('1d...').catch(...)`. Apague os `gameState.sendRoll` e `gameState.sendMessage` que estavam dentro do `.then()`.