# Spec: Perfect Sync Implementation

## 1. Arquivos Afetados
- `src/lib/supabase/tables.ts`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/components/chat/ChatSidebar.svelte`
- `src/components/FAB.svelte`
- `src/components/dice/DiceRoller.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/supabase/tables.ts`
- Substituir o conteúdo das funções `subscribeToChat`, `addChatMessage`, `subscribeToRolls` e `addRoll` por versões curtas e limpas, apenas com lógica do Supabase (sem broadcasts, sem `console.log`).

### 2.2. `src/lib/state/diceStore.svelte.js`
- **Refatorar `rollDice(formula)`**:
  - Validar a fórmula.
  - Usar `const result = fallbackRoll(parsedData);` para gerar o número matematicamente.
  - Atribuir `result.formula = formula;`.
  - Importar dinamicamente `gameState` e chamar `gameState.sendRoll(formula, result.total, result, currentDiceColor);`.
  - Chamar `await playSyncRoll({ formula, result: result.total, details: result, color: currentDiceColor, userName: getUserName() });`.
  - Finalizar com `resolve(result);`.
- **Criar `playSyncRoll(payload)`**:
  - Extrair `details`, `color`, `userName`, `result`, `formula`.
  - Construir um `forcedArray` para o dice-box a partir do array `details.details`. O formato exigido pelo `@3d-dice/dice-box` é: `forcedArray = details.details.map(d => ({ sides: details.parsedData.sides, value: d.value, themeColor: color || currentDiceColor }));`.
  - Tornar o dado visível: `isDiceVisible = true;`.
  - Tentar executar a animação: `if (diceBoxInstance && diceBoxInstance.isInitialized()) await diceBoxInstance.getInstance().roll(forcedArray);`
  - Adicionar aos `pendingAlerts` e chamar `processNextAlert()`.
  - Limpar a tela com `setTimeout(() => clear3DDice(), 3000);`.

### 2.3. `src/lib/state/gameState.svelte.ts`
- **Atualizar `sendRoll`**:
  - Alterar a assinatura para aceitar a cor: `async sendRoll(formula: string, result: number, details: any, color: string = '#0000ff')`.
  - Adicionar a `color` no payload do `this.roomChannel.send`.
- **Atualizar `setupRoomChannel`**:
  - No evento `'dice_roll'`, instanciar `playSyncRoll` do `diceStore`:
    `import('./diceStore.svelte.js').then((m) => m.diceStore.playSyncRoll({ formula: payload.roll.formula, result: payload.roll.result, details: payload.roll.details, color: payload.color, userName: payload.roll.user_name }));`

### 2.4. `src/components/dice/DiceRoller.svelte`
- Remover a importação e o uso da Action `useDiceBox` interna.
- Remover o contêiner `bind:this={diceContainer}` (remover a div do DOM do componente).
- As funções `rollDice(dice)` e `rollCustom()` devem apenas setar `isLoading = true`, aguardar `await diceStore.rollDice(...)`, e salvar no `lastResult`. A mensagem do chat vai continuar sendo disparada pela função.

### 2.5. Remoção de `sendRoll` Duplicados na UI
- Em `src/components/chat/ChatSidebar.svelte` e `src/components/FAB.svelte`, remova as chamadas a `gameState.sendRoll(...)` dentro do bloco `.then()` da rolagem, pois o `diceStore.rollDice` já faz isso internamente agora, evitando duplicação.