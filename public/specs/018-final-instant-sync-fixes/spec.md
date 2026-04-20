# Spec: 018 - Final Instant Sync Implementation

## 1. Arquivos Afetados
- `src/lib/actions/useDiceBox.js`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`

## 2. Mudanças Estruturais

### 2.1. `src/lib/actions/useDiceBox.js`
- A função `roll(formula)` será completamente sobrescrita para fazer a checagem explícita: `if (typeof formula === 'string') { ... } else if (Array.isArray(formula)) { ... }`. Nenhuma operação de `trim()` deve ocorrer fora dessa validação.

### 2.2. `src/lib/state/gameState.svelte.ts`
- Importar o `diceStore` estaticamente no topo do arquivo.
- No método `setupRoomChannel`, dentro da escuta do evento `dice_roll`, acessar `diceStore.playRemoteRoll(...)` diretamente, removendo as promises assíncronas de importação que estavam falhando.
- Reescrever o método `sendRoll` para aceitar `(formula, result, details, color, textual)`. O método deve gerar UUIDs locais tanto para a rolagem quanto para o chat, atualizar `this.rolls` e `this.chatMessages`, transmitir via `this.roomChannel.send` e então chamar o DB em *background*.

### 2.3. `src/lib/state/diceStore.svelte.js`
- Importar o `gameState` estaticamente no topo do arquivo.
- Na função `rollDice`, executar a física, coletar o resultado, construir a string `textual` e passá-la diretamente para `gameState.sendRoll(formula, evaluated.total, evaluated, currentDiceColor, text)`. Remover os timeouts de clear.
- Na função `playRemoteRoll`, adicionar logs robustos. Criar o array mapeado de valores forçados, invocar o alerta remotamente e instruir o motor 3D através da instância raiz. Sem timeouts de `clear3DDice`.