# Spec: Perfect Sync Implementation

## 1. Arquivos Afetados
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/lib/supabase/tables.ts`

## 2. Mudanças Estruturais

### 2.1. `src/lib/state/diceStore.svelte.js`
- **Substituir o fluxo de `rollDice(formula)`:**
  - Analisar a fórmula. Se válida, calcular o resultado matemático imediatamente usando `const result = fallbackRoll(parsedData);`.
  - Chamar `gameState.sendRoll(formula, result.total, result, currentDiceColor)` para compartilhar.
  - Chamar localmente `playSyncRoll` para o próprio autor ver sua animação 3D imediatamente.
  - Resolver a Promise imediatamente com o `result` para que o ChatSidebar envie a mensagem de chat sem atrasos.
- **Criar a função `playSyncRoll(payload)`:**
  - Recebe `{ formula, result, details, color, userName }`.
  - Extrai `sides = details.parsedData.sides`.
  - Mapeia `details.details` para um array de objetos forçados que o `dice-box` entende nativamente: `forcedArray = details.details.map(d => ({ sides, themeColor: color, value: d.value }))`.
  - Chama a instância raiz do dice-box: `diceBoxInstance.getInstance().roll(forcedArray)`.
  - No `.then()` dessa rolagem, adiciona o alerta em `pendingAlerts` e chama `processNextAlert()`. Após 3 segundos, limpa os dados.
- **Limpeza:** Remover a antiga função `rollFake` e remover os blocos de fallback físico no `onRollComplete` do `initDiceBox` (pois o `playSyncRoll` resolve seu próprio `.then()`).

### 2.2. `src/lib/state/gameState.svelte.ts`
- **Atualizar `sendRoll`:**
  - Receber `color: string` como parâmetro.
  - Atualizar o envio no `this.roomChannel.send` para incluir a cor (`payload: { roll, color, userId }`).
- **Atualizar `setupRoomChannel`:**
  - Ao receber o evento `dice_roll`, invocar a nova função de sincronização importando dinamicamente: `module.diceStore.playSyncRoll({ formula: roll.formula, result: roll.result, details: roll.details, color: payload.color, userName: roll.user_name })`.
- **Limpeza:** Remover a função `broadcastDiceStart` que enviava o evento `dice_roll_start`, já que agora unificamos o fluxo.

### 2.3. `src/lib/supabase/tables.ts`
- **Verificação do Chat:** Confirmar a query em `subscribeToChat` para certificar-se de que está utilizando o `await` corretamente e retornando a promessa para o callback.