# Tasks: Perfect Sync Refactoring

- [ ] **Task 1: Atualização do `gameState.svelte.ts`**
  - No método `sendRoll`, adicione o parâmetro `color: string`. Inclua esse parâmetro no payload do `this.roomChannel.send(...)`.
  - No método `setupRoomChannel`, atualize o `.on('broadcast', { event: 'dice_roll' }, ...)`: Quando a mensagem chegar de outro usuário, chame a função importada `module.diceStore.playSyncRoll` passando o objeto com `formula`, `result`, `details`, `color` (vindo do payload) e `userName`.
  - Remova o método `broadcastDiceStart` e o listener correspondente (`dice_roll_start`) do `setupRoomChannel`.

- [ ] **Task 2: Implementação da Física Sincronizada no `diceStore.svelte.js`**
  - Exporte e crie a função `playSyncRoll(payload)`. O `payload` contém `{ formula, result, details, color, userName }`.
  - Dentro de `playSyncRoll`, defina `isDiceVisible = true`. Mapeie os detalhes para um array forçado: `const forcedArray = details.details.map(d => ({ sides: details.parsedData.sides, themeColor: color, value: d.value }));`.
  - Dentro de `playSyncRoll`, chame a biblioteca 3D nativa com `.then()`: `diceBoxInstance.getInstance().roll(forcedArray).then(() => { ... })`. Dentro do `.then()`, adicione os dados ao `pendingAlerts`, chame `processNextAlert()` e programe o `clear3DDice()` para 3000ms.
  - Altere a função existente `rollDice(formula)`: Gere o resultado matemático imediatamente via `fallbackRoll(parsedData)`. Use o `gameState.sendRoll(..., currentDiceColor)` para compartilhar no broadcast, chame `playSyncRoll` localmente e então chame `resolve(result)`.
  - Remova a função obsoleta `rollFake`.

- [ ] **Task 3: Refinamento de Limpeza**
  - Certifique-se de que a variável Svelte `$state` no `gameState.svelte.ts` para o `chatMessages` está sendo atualizada de forma segura, permitindo que a view recarregue quando a busca assíncrona for concluída.
  - Revise o `subscribeToChat` em `tables.ts` para garantir que o array retornado seja adequadamente resolvido.