# Tasks: Perfect Sync Refactoring

- [x] **Task 1: Limpeza Extrema do `tables.ts`**
  - No `src/lib/supabase/tables.ts`, reescreva a função `subscribeToChat` para apenas executar uma Promise com `.select('*').order('created_at', { ascending: true })`, filtrar por `game_id` se fornecido, e chamar `callback(data ||[])`. Remova todos os `console.log`.
  - Reescreva `addChatMessage` para executar apenas `.insert({...}).select().single()` e retornar o `data`. Remova todos os `console.log` e blocos de `supabase.channel`.
  - Aplique a mesma simplificação para `subscribeToRolls` (adicionando `.limit(50)`) e `addRoll`.

- [x] **Task 2: Refatorar o GameState (`gameState.svelte.ts`)**
  - Atualize a função `sendRoll` para aceitar o quarto parâmetro `color: string = '#0000ff'`.
  - No `this.roomChannel.send` do `sendRoll`, inclua a propriedade `color` no payload.
  - No `setupRoomChannel`, dentro da escuta de `.on('broadcast', { event: 'dice_roll' })`, troque qualquer menção a `addRemoteAlert` pela chamada à nova função: `module.diceStore.playSyncRoll({ formula: payload.roll.formula, result: payload.roll.result, details: payload.roll.details, color: payload.color, userName: payload.roll.user_name });`.

- [x] **Task 3: Refatorar o `diceStore.svelte.js`**
  - Adicione a nova função assíncrona `playSyncRoll(payload)`. Ela deve extrair `{ details, color, userName, result, formula }`. Mapeie `details.details` para gerar `const forcedArray = details.details.map(d => ({ sides: details.parsedData.sides, value: d.value, themeColor: color || currentDiceColor }));`. Torne `isDiceVisible = true`. Chame `await diceBoxInstance.getInstance().roll(forcedArray)`. Em seguida, adicione aos `pendingAlerts`, chame `processNextAlert()` e defina um `setTimeout` de 3000ms para `clear3DDice()`. Exporte a função.
  - Sobrescreva totalmente a função `rollDice(formula)`. Faça o parse, gere o resultado via `fallbackRoll`, force `result.formula = formula`, chame `gameState.sendRoll(formula, result.total, result, currentDiceColor)`, aguarde `await playSyncRoll(...)` localmente com seus dados, e por fim chame `resolve(result)`.

- [x] **Task 4: Atualizar Componentes da UI (Limpar Duplicações)**
  - No `src/components/dice/DiceRoller.svelte`: Remova o `import { useDiceBox }...` e remova a tag HTML `<div bind:this={diceContainer} ...></div>`. Modifique `rollDice(dice)` e `rollCustom()` para chamar apenas `const result = await diceStore.rollDice(...)` seguido de `lastResult = result;` e `gameState.sendMessage(...)`. (Remova qualquer referência a `gameState.sendRoll` desse arquivo).
  - No `src/components/chat/ChatSidebar.svelte`: Na promessa de retorno de `diceStore.rollDice`, mantenha `gameState.sendMessage`, mas **remova a chamada de `gameState.sendRoll`**.
  - No `src/components/FAB.svelte`: No bloco `diceStore.rollDice`, mantenha `gameState.sendMessage`, mas **remova a chamada de `gameState.sendRoll`**.