# Spec: Physics-First Sync Implementation

## 1. Arquivos Afetados
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/lib/supabase/tables.ts`
- `src/components/dice/DiceRoller.svelte`
- `src/components/chat/ChatSidebar.svelte`
- `src/components/FAB.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/state/gameState.svelte.ts`
- **Correção 406:** No método `loadGameRole` e `checkUserGameMembership`, altere a consulta do banco de `.single()` para `.maybeSingle()`.
- **Refatorar `sendRoll`:** 
  - A assinatura deve ser `async sendRoll(formula: string, result: number, details: any, color: string, textual: string)`.
  - Construir os objetos `rollData` e `chatMsg` com UUID local.
  - Atualizar o estado local (`this.rolls` e `this.chatMessages`).
  - Transmitir via `roomChannel` o payload: `{ roll: rollData, chatMsg, color }`.
  - Chamar assincronamente as funções de persistência no `db`.
- **Eventos no `roomChannel`:** Ao receber um `dice_roll`, insira o `payload.roll` e `payload.chatMsg` nos estados e instancie `diceStore.playRemoteRoll(payload.roll)`.

### 2.2. `src/lib/state/diceStore.svelte.js`
- **Refatorar `rollDice(formula)`**:
  - Envolver a lógica atual em uma Promise isolada que apenas cuida da rolagem 3D.
  - Após a Promise resolver e a física parar (recebendo o `result`), instanciar: `const text = '🎲 Rolou ' + formula + ': ' + result.textual;`.
  - Importar dinamicamente o `gameState` e chamar `gameState.sendRoll(formula, result.total, result, currentDiceColor, text)`.
  - Retornar o `result`.
- **Criar `playRemoteRoll(roll)`**:
  - Usar os detalhes do dado para forçar o array: `const forcedArray = rawDetails.map(d => ({ qty: 1, sides: parsedSides, value: d.value, themeColor: color }));`.
  - Exibir o alerta remoto localmente chamando `addRemoteAlert`.
  - Disparar `diceBoxInstance.getInstance().roll(forcedArray)`. Adicionar `clear3DDice` em um timer.

### 2.3. Limpeza nos Componentes e Banco de Dados
- **`tables.ts`**: `subscribeToChat` e `subscribeToRolls` farão apenas um `.select().order(...)` seguido do respectivo `callback`. Retirar inicializações de `supabase.channel`.
- **Componentes UIs (`FAB`, `ChatSidebar`, `DiceRoller`)**: Todas as chamadas para rolar dados devem ser estritamente `diceStore.rollDice(formula)`. Deletar qualquer código que faça `.then(res => gameState.sendMessage(...))` ou `gameState.sendRoll(...)`.