# Spec: 021 - Web Crypto API Implementation

## 1. Arquivos Afetados
- `src/lib/utils/diceLogic.js`
- `src/lib/state/diceStore.svelte.js`
- `src/components/dice/DiceModal.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/utils/diceLogic.js`
- **Nova Função `getSecureRandomInt`:**
  - Exportar a função `getSecureRandomInt(sides)`.
  - Criar um buffer `new Uint32Array(1)`.
  - Calcular o limite de distribuição: `const limit = 0xFFFFFFFF - (0xFFFFFFFF % sides);`.
  - Criar um loop `do...while` que gera um valor via `window.crypto.getRandomValues(buffer)` e rejeita os números que ultrapassam o `limit` (para evitar o Modulo Bias).
  - Retornar o valor seguro: `(buffer[0] % sides) + 1`.
- **Modificar `evaluateRolls`:**
  - Na parte que avalia se a fórmula tem dados explosivos (`if (parsedData.explode)`), substituir a linha que usa `Math.random()` pela chamada a `getSecureRandomInt(parsedData.sides)`.

### 2.2. `src/lib/state/diceStore.svelte.js`
- **Modificar `fallbackRoll`:**
  - Adicionar a importação de `getSecureRandomInt` no topo vindo de `../utils/diceLogic.js`.
  - Dentro do laço de repetição `for`, substituir `Math.floor(Math.random() * ...)` por `getSecureRandomInt(parsedData.sides)`.

### 2.3. `src/components/dice/DiceModal.svelte`
- Os métodos `roll(dice)` e `rollCustom()` desse modal de UI estão defasados usando o antigo `Math.random()`. Eles devem ser alterados para usar a nova via expressa: `await diceStore.rollDice(formula)`. Apenas coletar o resultado final e fechar o modal.