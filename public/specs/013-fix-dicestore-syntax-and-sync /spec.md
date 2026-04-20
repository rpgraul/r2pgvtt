# Spec: 013 - Syntax and Sync Implementation

## 1. Arquivos Afetados
- `src/lib/state/diceStore.svelte.js`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/supabase/tables.ts`
- `src/components/dice/DiceRoller.svelte`
- `src/components/chat/ChatSidebar.svelte`
- `src/components/FAB.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/state/diceStore.svelte.js` (Core Fixes)
- **Correção de Constantes:** Transformar `const diceBoxResolve = null;` e `const diceBoxData = null;` em `let`. Na verdade, essas variáveis nem serão mais necessárias na nova arquitetura, então devem ser removidas.
- **Refatorar `rollDice(formula)`:**
  - Tornar o interior da Promise um bloco `async` com `try/catch`.
  - Fazer o parse e `fallbackRoll` imediatamente.
  - Importar o gameState e chamar `gameState.sendRoll(formula, result.total, result, currentDiceColor)`.
  - Chamar `gameState.sendMessage('🎲 Rolou ' + formula + ': ' + result.textual)`.
  - Chamar `await playSyncRoll(...)` localmente.
  - Retornar o `result`.
- **Refatorar `playSyncRoll` e `playRemoteRoll`:**
  - Ambas as funções agora criam o `forcedArray`, definem `isDiceVisible = true`, aguardam `await ensureInitialized()`, e rodam `await diceBoxInstance.getInstance().roll(forcedArray)`. Em seguida, disparam o alerta visual (`pendingAlerts`) e chamam o timeout para sumir com os dados.
- **Limpeza do `initDiceBox`:** Como a física não dita mais o resultado, a propriedade `onRollComplete` do `createDiceBoxManager` pode ser deixada vazia ou sem responsabilidades críticas.

### 2.2. `src/lib/state/gameState.svelte.ts`
- O método `sendRoll` e `sendMessage` devem fazer a inserção local no array de estado e chamar o método correspondente em `db` (Supabase).
- O listener `subscribeToRolls` no `init()` chamará o `playRemoteRoll` do `diceStore` sempre que chegar um dado cujo `user_name` for diferente do usuário atual.

### 2.3. Limpeza dos Componentes de UI (Fim das Duplicações)
- Os componentes `FAB.svelte`, `ChatSidebar.svelte` e `DiceRoller.svelte` apenas chamam `diceStore.rollDice(formula)`.
- Remover todos os `gameState.sendMessage` ou `gameState.sendRoll` que sobraram nesses arquivos.