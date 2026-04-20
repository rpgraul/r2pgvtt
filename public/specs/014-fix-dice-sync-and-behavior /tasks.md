# Tasks: 014 - Execution Steps

- [ ] **Task 1: Correção do Action `useDiceBox.js`**
  - No arquivo `public/src/lib/actions/useDiceBox.js`, modifique a função `async function roll(formula)`.
  - Substitua a lógica de verificação para suportar array:
    ```javascript
    let shouldSum = false;
    let effectiveFormula = formula;
    let originalFormula = formula;

    if (typeof formula === 'string') {
      effectiveFormula = formula.trim();
      if (effectiveFormula.endsWith('+')) {
        shouldSum = true;
        effectiveFormula = effectiveFormula.slice(0, -1).trim();
      }
    } else if (Array.isArray(formula)) {
      originalFormula = 'forced';
    }
    ```
  - Mais abaixo, altere para `currentRollData = { formula: effectiveFormula, originalFormula, shouldSum };`. O restante permanece igual.

- [ ] **Task 2: Lógica Física e Alertas no `diceStore.svelte.js`**
  - No arquivo `public/src/lib/state/diceStore.svelte.js`, apague a função `playSyncRoll`.
  - Reescreva `rollDice(formula)` para o seguinte formato:
    ```javascript
    function rollDice(formula) {
      return new Promise(async (resolve, reject) => {
        try {
          const parsedData = parseFormula(formula);
          if (!parsedData) throw new Error('Invalid formula');

          isDiceVisible = true;
          await ensureInitialized(null);

          // Rola na física primeiro
          const physicsResult = await diceBoxInstance.roll(parsedData.baseFormula);
          
          // Avalia com base nos números físicos exatos que caíram
          const evaluated = evaluateRolls(parsedData, physicsResult.rolls);
          evaluated.formula = formula;

          const { gameState } = await import('./gameState.svelte.ts');
          gameState.sendRoll(formula, evaluated.total, evaluated, currentDiceColor);
          gameState.sendMessage(`🎲 Rolou ${formula}: ${evaluated.textual}`);

          const rollId = generateId();
          pendingAlerts =[...pendingAlerts, {
            id: rollId,
            userName: getUserName(),
            formula,
            result: evaluated.total,
            successes: evaluated.successes,
            textual: evaluated.textual,
            rolls: evaluated.details ? evaluated.details.map((d) => d.value) : evaluated.rolls,
            diceType: `d${parsedData.sides}`,
            timestamp: Date.now()
          }];
          processNextAlert();
          resolve(evaluated);
        } catch (error) {
          reject(error);
        }
      });
    }
    ```
  - Garanta que em `rollDice` **não haja** `setTimeout` para chamar `clear3DDice()`.

- [ ] **Task 3: Refatorar `playRemoteRoll` sem Auto-Dismiss**
  - No mesmo arquivo (`diceStore.svelte.js`), reescreva `playRemoteRoll(roll)`:
    ```javascript
    async function playRemoteRoll(roll) {
      const color = roll.color || roll.details?.color || '#0000ff';
      const rawDetails = roll.details?.details ||[];

      if (rawDetails.length === 0) return;

      const sides = roll.details?.parsedData?.sides || 20;
      const forcedArray = rawDetails.map(d => ({
        qty: 1,
        sides,
        value: d.value,
        themeColor: color,
      }));

      isDiceVisible = true;
      await ensureInitialized(null);

      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          await diceBoxInstance.roll(forcedArray);
        } catch (e) {
          console.warn('Remote dice animation skipped', e);
        }
      }

      const rollId = generateId();
      pendingAlerts =[...pendingAlerts, {
        id: rollId,
        userName: roll.user_name,
        formula: roll.formula,
        result: roll.result,
        successes: roll.details?.successes,
        textual: roll.details?.textual,
        rolls: rawDetails.map(d => d.value),
        diceType: `d${sides}`,
        color,
        isRemote: true,
        timestamp: Date.now(),
      }];
      processNextAlert();
    }
    ```
  - Note que o timeout de 3 segundos foi retirado. Os alertas vão sumir sozinhos, e os dados só sumirão quando o usuário clicar na tela. Exclua do arquivo qualquer `setTimeout(clear3DDice, 3000)`.

- [ ] **Task 4: Correção de Datas no Chat**
  - No arquivo `public/src/components/chat/ChatSidebar.svelte`, localize o bloco `{#if msg.createdAt}` dentro do iterador `{#each messages as msg}`.
  - Altere de:
    `{#if msg.createdAt}`
    para
    `{#if msg.created_at || msg.createdAt}`
  - Altere dentro do laço de:
    `{formatTime(msg.createdAt)}`
    para
    `{formatTime(msg.created_at || msg.createdAt)}`