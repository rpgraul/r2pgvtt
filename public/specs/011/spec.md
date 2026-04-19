# Spec: VTT Absolute Sync Implementation

## 1. Arquivos Afetados
- `src/lib/supabase/tables.ts`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/components/dice/DiceRoller.svelte`
- `src/components/chat/ChatSidebar.svelte`
- `src/components/FAB.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/supabase/tables.ts`
- **Reescrever `subscribeToChat` e `subscribeToRolls`**: Ambas devem fazer um `.select()` inicial via async/await, chamar `onInitialLoad(data)`, e em seguida abrir o canal com `postgres_changes` ouvindo `INSERT`, que ao disparar chama `onInsert(payload.new)`. Elas devem retornar a função de unsubscribe `() => supabase.removeChannel(...)`.
- **Reescrever `addChatMessage` e `addRoll`**: Devem apenas fazer `.insert({...}).select().single()` e retornar o resultado, sem manipular canais de broadcast.
- **Dica na Cor do Dado:** No `addRoll`, inclua a cor do usuário salvando-a dentro da coluna JSONB `details`: `details: { ...rollData.details, color: rollData.color }`.

### 2.2. `src/lib/state/gameState.svelte.ts`
- **Atualizar Inscrições:** Use os novos callbacks em `db.subscribeToChat` e `db.subscribeToRolls`.
  - No `onInsert` do Chat, verifique se a mensagem já existe no array `this.chatMessages` (pelo id). Se não, adicione.
  - No `onInsert` dos Rolls, faça o mesmo. Além disso, se o `newRoll.user_name` for diferente do `authState.displayName`, chame `import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(newRoll))`.
- **Atualizar `sendRoll` e `sendMessage`**: Para evitar lag, insira no banco de dados e faça append manual no array (optimistic UI), checando duplicatas.

### 2.3. `src/lib/state/diceStore.svelte.js`
- **Atualizar `onRollComplete` (dentro de `initDiceBox`)**:
  - Quando a rolagem for do autor (`diceBoxResolve` presente): processe o resultado matematicamente (`evaluateRolls`), chame `gameState.sendRoll(formula, total, avaliacao, currentDiceColor)` e `gameState.sendMessage(texto)`.
  - Quando a rolagem for remota (else): apenas aguarde 3 segundos e chame `clear3DDice()`.
- **Criar `playRemoteRoll(roll)`**:
  - Extraia a cor (`roll.details?.color || '#0000ff'`) e os detalhes dos dados (`roll.details?.details ||[]`).
  - Mapeie o array forçado para o `@3d-dice/dice-box`: `const forcedArray = rawDetails.map(d => ({ qty: 1, sides: parsedSides, value: d.value, themeColor: color }));`.
  - Ative `isDiceVisible = true` e chame `await diceBoxInstance.getInstance().roll(forcedArray)`. Adicione o alerta remoto à tela.

### 2.4. Limpeza nos Componentes
- **`src/components/dice/DiceRoller.svelte`**: Remover `useDiceBox` local e deletar a `div` com `bind:this={diceContainer}`. Atualizar `rollDice` e `rollCustom` para chamar apenas `diceStore.rollDice(formula)` e parar, pois o store cuidará de avisar o chat e o banco.
- **`ChatSidebar.svelte` e `FAB.svelte`**: Remover `.then(...)` com chamadas duplas para `gameState.sendMessage` e `gameState.sendRoll`. O comando será apenas `diceStore.rollDice(formula).catch(...)`.