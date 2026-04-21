- [ ] **Task 1: Refinar Aleatoriedade Criptográfica**
  - Atualizar `getSecureRandomInt` em `src/lib/utils/diceLogic.js` para garantir ausência de Modulo Bias e melhor performance.
  ```javascript
  export function getSecureRandomInt(sides) {
    const array = new Uint32Array(1);
    const maxUint32 = 0xFFFFFFFF;
    const range = sides;
    const threshold = maxUint32 - (maxUint32 % range);
    let val;
    do {
      window.crypto.getRandomValues(array);
      val = array[0];
    } while (val >= threshold);
    return (val % range) + 1;
  }
  ```

- [ ] **Task 2: Atualizar o Gerenciador de Instância (useDiceBox.js)**
  - Configurar o callback `onRollComplete` dentro do `createDiceBoxManager` para despachar um evento customizado que o store possa ouvir.
  ```javascript
  // src/lib/actions/useDiceBox.js
  // Dentro do init():
  diceBoxInstance.onRollComplete = (results) => {
    window.dispatchEvent(new CustomEvent('dice:3d:finished', { detail: results }));
  };
  ```

- [ ] **Task 3: Reformular lógica de rolagem no DiceStore**
  - Alterar `rollDice` para gerar os valores brutos antes de qualquer ação.
  - Alterar `forceDisplayRoll` para passar o array de objetos ao Dice-Box.
  ```javascript
  // src/lib/state/diceStore.svelte.js
  
  async function rollDice(formula) {
    const parsedData = parseFormula(formula);
    // 1. Gera valores DETERMINÍSTICOS
    const rawRolls = Array.from({ length: parsedData.count }, () => getSecureRandomInt(parsedData.sides));
    
    // 2. Avalia (Explosões, etc) - gera o resultado final lógico
    const result = evaluateRolls(parsedData, rawRolls);
    
    // 3. Prepara o payload para o Dice-Box ([{sides, value}, ...])
    const dicePayload = result.details.filter(d => d.isKept).map(d => ({
      sides: parsedData.sides,
      value: d.value
    }));

    // 4. Broadcast com os valores exatos
    gameState.broadcastDiceAction(formula, result.total, { ...result, dicePayload }, currentDiceColor);
    
    // 5. Exibe localmente
    await forceDisplayRoll({
      dicePayload,
      result: result.total,
      // ... outros dados
    });
  }
  ```

- [ ] **Task 4: Implementar forçamento de resultado no forceDisplayRoll**
  - Modificar a chamada ao `instance.roll` para usar o array determinístico.
  ```javascript
  // src/lib/state/diceStore.svelte.js -> forceDisplayRoll
  if (instance) {
    instance.show();
    // Em vez de passar a string '2d20', passamos o array de objetos com 'value'
    // Isso faz o DiceBox rolar exatamente para aqueles números
    await instance.roll(dicePayload); 
  }
  ```

- [ ] **Task 5: Sincronizar Alerta com o Fim da Animação**
  - Remover a chamada imediata de `processNextAlert()` dentro de `forceDisplayRoll`.
  - Adicionar um listener de janela para o evento `dice:3d:finished` criado na Task 2 para processar o alerta somente quando os dados pararem de cair.
  ```javascript
  // No createDiceStore inicial:
  if (typeof window !== 'undefined') {
    window.addEventListener('dice:3d:finished', () => {
      processNextAlert();
    });
  }
  ```

- [ ] **Task 6: Ajustar playRemoteRoll**
  - Garantir que ao receber uma rolagem de outro jogador, o `dicePayload` recebido via broadcast seja injetado no `forceDisplayRoll` do cliente local.