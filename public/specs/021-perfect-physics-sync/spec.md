# Spec: 020 - Perfect Physics Sync Implementation

## 1. Arquivos Afetados
- `src/lib/actions/useDiceBox.js`
- `src/lib/state/diceStore.svelte.js`
- `src/lib/state/gameState.svelte.ts`

## 2. Mudanças Estruturais

### 2.1. `useDiceBox.js` (Reset)
- Apagar todas as funções de `roll()`, `currentRollResolve`, e `onRollComplete`. O wrapper apenas criará o `new DiceBox({...})`, inicializará e exportará os métodos básicos de `show()`, `hide()`, `clear()`, `updateConfig()` e `getInstance()`.

### 2.2. `diceStore.svelte.js` (A Espera da Física)
- Importação estática do `gameState`: `import { gameState } from './gameState.svelte.ts';` no topo.
- Na função `rollDice`:
  - Calcular o fallback matemático (ex: 15).
  - Enviar o broadcast imediatamente via `gameState.broadcastDiceAction(formula, result.total, result, color, text)`.
  - Construir o array forçado: `[{ type: 'd' + sides, value: parseInt(d.value), themeColor: currentDiceColor }]`.
  - Aguardar a física: `await diceBoxInstance.getInstance().roll(forcedArray)`.
  - SÓ DEPOIS DISSO: Acionar o alerta (`pendingAlerts.push`) e inserir a mensagem de chat na tela local (`gameState.addMessageToChatLocal(...)`).
- Na função `playRemoteRoll`:
  - Verificar `if (!gameState.gameId) return;`.
  - Construir o mesmo array forçado usando a cor recebida.
  - Aguardar a física: `await diceBoxInstance.getInstance().roll(forcedArray)`.
  - Acionar o alerta e o chat na tela do espectador.
- Sem timeouts de limpeza (`setTimeout(clear3DDice)` devem ser removidos).

### 2.3. `gameState.svelte.ts` (Chat Local)
- No método `setupRoomChannel`, ao receber o evento `dice_action`, não adicionar ao chat ainda. Apenas invocar `diceStore.playRemoteRoll(payload.roll)`. O chat do espectador será preenchido quando o dado terminar de rolar.
- Criar a função `broadcastDiceAction` que envia via WebSocket e faz os inserts no DB (fire-and-forget).
- Criar a função auxiliar `addMessageToChatLocal(text, type, sender)` que faz apenas o push no array `this.chatMessages`.