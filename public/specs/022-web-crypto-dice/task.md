# Tasks: 021 - Web Crypto Execution

- [ ] **Task 1: Implementar o Core Criptográfico (`diceLogic.js`)**
  - Vá para o arquivo `public/src/lib/utils/diceLogic.js` (ou `src/lib/utils/diceLogic.js` dependendo de onde estiver no seu diretório atual).
  - No topo ou no fim do arquivo, adicione a seguinte função:
    ```javascript
    export function getSecureRandomInt(sides) {
      const randomBuffer = new Uint32Array(1);
      const maxUint = 0xFFFFFFFF;
      // Limitador para garantir distribuição matemática uniforme (sem modulo bias)
      const limit = maxUint - (maxUint % sides);
      
      let rnd;
      do {
        window.crypto.getRandomValues(randomBuffer);
        rnd = randomBuffer[0];
      } while (rnd >= limit);
      
      return (rnd % sides) + 1;
    }
    ```
  - Ainda em `diceLogic.js`, dentro da função `evaluateRolls(parsedData, rawRolls)`, na seção `if (parsedData.explode) { ... }`, localize a linha onde novos dados são gerados:
    `const newRoll = Math.floor(Math.random() * parsedData.sides) + 1;`
  - Substitua-a para:
    `const newRoll = getSecureRandomInt(parsedData.sides);`

- [ ] **Task 2: Integrar o Cripto ao Store (`diceStore.svelte.js`)**
  - No arquivo `src/lib/state/diceStore.svelte.js`, atualize a importação existente de `diceLogic.js` para incluir a nova função:
    `import { parseFormula, evaluateRolls, getSecureRandomInt } from '../utils/diceLogic.js';`
  - Localize a função `fallbackRoll(parsedData)` e a reescreva para usar a entropia física:
    ```javascript
    function fallbackRoll(parsedData) {
      const rawRolls =[];
      for (let i = 0; i < parsedData.count; i++) {
        rawRolls.push(getSecureRandomInt(parsedData.sides));
      }
      return evaluateRolls(parsedData, rawRolls);
    }
    ```

- [ ] **Task 3: Purgar `Math.random` dos Componentes Antigos (`DiceModal.svelte`)**
  - No arquivo `src/components/dice/DiceModal.svelte`, no bloco de script, adicione a importação:
    `import { diceStore } from '$lib/state/diceStore.svelte.js';`
  - Substitua toda a função `async function roll(dice)` por:
    ```javascript
    async function roll(dice) {
      isRolling = true;
      formula = `1${dice}`;
      try {
        result = await diceStore.rollDice(formula);
        onRollComplete(result);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => { isRolling = false; open = false; }, 1500);
      }
    }
    ```
  - Substitua a função `async function rollCustom()` por:
    ```javascript
    async function rollCustom() {
      if (!formula.trim()) return;
      isRolling = true;
      try {
        result = await diceStore.rollDice(formula);
        onRollComplete(result);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => { isRolling = false; open = false; }, 1500);
      }
    }
    ```
  - (Opcional) Verifique se há outras instâncias de `Math.random` utilizadas para dados no código e aplique o mesmo direcionamento para o `diceStore.rollDice`.