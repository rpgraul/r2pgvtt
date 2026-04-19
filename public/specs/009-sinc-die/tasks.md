# Tasks: Perfect Sync Refactoring

- [ ] **Task 1: Limpeza do Supabase e Layout (`tables.ts` e `+layout.svelte`)**
  - No `src/lib/supabase/tables.ts`, apague todo o código relacionado a `supabase.channel` e `.send(...)` dentro de `addChatMessage` e `addRoll`.
  - No `src/routes/+layout.svelte`, remova totalmente os blocos `$effect` que criam `diceChannelInstance` e `chatChannelInstance`, bem como as lógicas de `removeChannel` no `return` do `onMount`.

-[ ] **Task 2: Refatorar o Room Channel (`gameState.svelte.ts`)**
  - Em `setupRoomChannel`, atualize a declaração para: `this.roomChannel = supabase.channel('room:' + gameId, { config: { broadcast: { ack: true } } });`
  - Apague a escuta do evento `dice_roll_start` e delete a função `broadcastDiceStart`.
  - Atualize a assinatura do método `sendRoll` para: `async sendRoll(formula: string, result: number, details: any, color: string = '#0000ff')`.
  - Atualize o `this.roomChannel.send` do `sendRoll` para passar a cor no payload: `payload: { roll, color, userId: authState.user?.id }`.
  - No `.on('broadcast', { event: 'dice_roll' })`, use o `diceStore` para criar o alerta: `import('./diceStore.svelte.js').then((m) => m.diceStore.addRemoteAlert({ formula: payload.roll.formula, result: payload.roll.result, userName: payload.roll.user_name, details: payload.roll.details, color: payload.color }));`

- [ ] **Task 3: Atualizar o Alerta Remoto (`diceStore.svelte.js`)**
  - Exclua a função `rollFake`.
  - Na função `addRemoteAlert(alertData)`, assegure que a estrutura final repassada ao array receba a cor (`color: alertData.color || '#0000ff'`).

- [ ] **Task 4: Propagar a Cor nas Rolagens (`ChatSidebar`, `FAB`, `DiceRoller`)**
  - Em `src/components/chat/ChatSidebar.svelte`: Na promessa `.then(result)` de rolagem, modifique a chamada do `sendRoll` para incluir a cor: `gameState.sendRoll(result.formula || formula, result.total, { rolls: result.rolls, diceType: result.diceType }, diceStore.currentDiceColor);`
  - Em `src/components/FAB.svelte`: Modifique a chamada dentro dos cases de rolagem para incluir `diceStore.currentDiceColor`.
  - Em `src/components/dice/DiceRoller.svelte`: Modifique as chamadas de `gameState.sendRoll` (no fallback e no diceBox callback) para também enviar `diceStore.currentDiceColor`.