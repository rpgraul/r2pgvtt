- [ ] **Task 1: Atualizar gerador em `diceLogic.js`**
  - Ajustar para retornar o valor puro.
  ```javascript
  // src/lib/utils/diceLogic.js
  export function getSecureRandomInt(sides) {
    const array = new Uint32Array(1);
    const maxUint32 = 0xFFFFFFFF;
    const threshold = maxUint32 - (maxUint32 % sides);
    let val;
    do { window.crypto.getRandomValues(array); val = array[0]; } while (val >= threshold);
    return (val % sides) + 1;
  }
  ```

- [ ] **Task 2: Preparar o callback no `useDiceBox.js`**
  - Garantir que o evento de término seja propagado globalmente.
  ```javascript
  // public/src/lib/actions/useDiceBox.js
  // Dentro da função init(), após criar a instância:
  diceBoxInstance.onRollComplete = (results) => {
    window.dispatchEvent(new CustomEvent('dice:3d:finished', { detail: results }));
  };
  ```

- [ ] **Task 3: Reformular `rollDice` no `diceStore.svelte.js`**
  - O fluxo deve ser: Calcular -> Broadcast -> Local Animation.
  ```javascript
  // src/lib/state/diceStore.svelte.js

  async function rollDice(formula) {
    const parsedData = parseFormula(formula);
    // 1. Gerar números exatos ANTES de tudo
    const rawRolls = Array.from({ length: parsedData.count }, () => getSecureRandomInt(parsedData.sides));
    const result = evaluateRolls(parsedData, rawRolls);

    // 2. Criar payload para o DiceBox (deterministic)
    const dicePayload = result.details.map(d => ({
      sides: parsedData.sides,
      value: d.value,
      themeColor: currentDiceColor
    }));

    // 3. Enviar para todos via Broadcast (incluindo eu mesmo)
    // Nota: gameState.broadcastDiceAction deve usar esse payload
    gameState.broadcastDiceAction(formula, result.total, { ...result, dicePayload }, currentDiceColor);

    // 4. Iniciar animação local (o Navegador 1 também reage ao broadcast ou chama direto)
    await forceDisplayRoll({
      formula,
      result: result.total,
      details: result,
      dicePayload,
      userName: getUserName(),
      color: currentDiceColor,
      isRemote: false
    });
  }
  ```

- [ ] **Task 4: Ajustar `forceDisplayRoll` para aceitar `dicePayload`**
  - Forçar o Dice-Box a usar os valores recebidos.
  ```javascript
  // src/lib/state/diceStore.svelte.js

  async function forceDisplayRoll(rollData) {
    const { dicePayload, userName, formula, result, color, isRemote } = rollData;
    
    isDiceVisible = true;
    const instance = diceBoxInstance.getInstance();
    
    if (instance) {
      instance.show();
      // IMPORTANTE: Passar o array de objetos força o resultado no 3D
      await instance.roll(dicePayload); 
    }

    // Guardar para mostrar o alerta quando o evento 'dice:3d:finished' disparar
    const rollId = generateId();
    pendingAlerts = [...pendingAlerts, { id: rollId, ...rollData }];
  }
  ```

- [ ] **Task 5: Sincronizar Alerta e Chat com o fim do 3D**
  - O alerta não pode ser automático. Ele deve esperar o dado parar.
  ```javascript
  // No corpo de createDiceStore ou num $effect:
  if (typeof window !== 'undefined') {
    window.addEventListener('dice:3d:finished', (e) => {
      // Quando o 3D termina, processamos o alerta e enviamos pro chat local
      const lastRoll = pendingAlerts[pendingAlerts.length - 1];
      if (lastRoll) {
         // Exibe o balão de resultado
         processNextAlert(); 
         // Adiciona ao chat local de quem está vendo
         gameState.addMessageToChatLocal(lastRoll.textual, 'user', lastRoll.userName);
      }
    });
  }
  ```

- [ ] **Task 6: Resolver erro 403 (RLS)**
  - Como o chat agora é alimentado via Broadcast + `addMessageToChatLocal`, a falha no POST para a tabela `chat_messages` não impedirá a visualização em tempo real. 
  - Certifique-se de que `gameState.broadcastDiceAction` não trave se o `supabase.from().insert()` falhar (use um bloco try/catch ou apenas ignore o erro do insert para fins de animação).