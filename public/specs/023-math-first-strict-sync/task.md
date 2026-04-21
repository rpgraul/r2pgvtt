# Tasks: 023 - Math-First Strict Sync Execution

- [ ] **Task 1: Validar Criptografia (`diceLogic.js`)**
  - No arquivo `src/lib/utils/diceLogic.js`, certifique-se de que a função `getSecureRandomInt` está declarada e exportada. Se não estiver, adicione no fim do arquivo:
    ```javascript
    export function getSecureRandomInt(sides) {
      const randomBuffer = new Uint32Array(1);
      const maxUint = 0xFFFFFFFF;
      const limit = maxUint - (maxUint % sides);
      let rnd;
      do {
        window.crypto.getRandomValues(randomBuffer);
        rnd = randomBuffer[0];
      } while (rnd >= limit);
      return (rnd % sides) + 1;
    }
    ```
  - Verifique se a função `evaluateRolls`, na parte do `parsedData.explode`, utiliza `getSecureRandomInt(parsedData.sides)` em vez de `Math.random()`.

- [ ] **Task 2: Implementar Math-First Local (`diceStore.svelte.js`)**
  - No arquivo `src/lib/state/diceStore.svelte.js`, garanta que a importação tenha: `import { parseFormula, evaluateRolls, getSecureRandomInt } from '../utils/diceLogic.js';`
  - Substitua a função `rollDice` completamente por este código:
    ```javascript
    function rollDice(formula) {
      return new Promise(async (resolve, reject) => {
        try {
          const parsedData = parseFormula(formula);
          if (!parsedData) throw new Error('Invalid formula');

          // 1. Matemática Primeiro (Gera o resultado exato instantaneamente)
          const rawRolls =[];
          for (let i = 0; i < parsedData.count; i++) {
            rawRolls.push(getSecureRandomInt(parsedData.sides));
          }
          const evaluated = evaluateRolls(parsedData, rawRolls);
          evaluated.formula = formula;

          // 2. Avisa o sistema imediatamente (Broadcast sem atraso)
          const text = `🎲 Rolou ${formula}: ${evaluated.textual}`;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('outgoing_local_roll', {
              detail: { formula, result: evaluated.total, details: evaluated, color: currentDiceColor, text }
            }));
          }

          // 3. Prepara a física forçada (Parsing rigoroso para o motor 3D)
          const sidesNum = parseInt(parsedData.sides, 10);
          const forcedArray = evaluated.details.map(d => ({
            sides: sidesNum,
            value: parseInt(d.value, 10),
            themeColor: currentDiceColor
          }));

          isDiceVisible = true;
          await ensureInitialized(null);
          const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
          
          if (instance) {
            instance.show();
            // 4. Aguarda a animação do dado parar
            await instance.roll(forcedArray); 
          }

          // 5. Exibe o alerta visual
          const rollId = generateId();
          pendingAlerts =[
            ...pendingAlerts,
            {
              id: rollId, userName: getUserName(), formula, result: evaluated.total,
              successes: evaluated.successes, textual: evaluated.textual,
              rolls: evaluated.details.map(d => d.value), diceType: `d${sidesNum}`, color: currentDiceColor, timestamp: Date.now()
            }
          ];
          processNextAlert();

          resolve(evaluated);
        } catch (error) {
          console.error('[DiceStore] Local Roll Error:', error);
          reject(error);
        }
      });
    }
    ```

- [ ] **Task 3: Sincronizar Espectadores (`diceStore.svelte.js`)**
  - No mesmo arquivo, remova a função `fallbackRoll` antiga (sua lógica agora está embutida no início do `rollDice`).
  - Substitua a função `playRemoteRoll(roll)` por esta versão:
    ```javascript
    async function playRemoteRoll(roll) {
      try {
        const color = roll.color || roll.details?.color || '#0000ff';
        const rawDetails = roll.details?.details ||[];
        if (rawDetails.length === 0) return;

        const sidesNum = parseInt(roll.details?.parsedData?.sides || 20, 10);
        
        // Formato rigoroso de objeto para forçar o resultado
        const forcedArray = rawDetails.map(d => ({
          sides: sidesNum,
          value: parseInt(d.value, 10),
          themeColor: color
        }));

        isDiceVisible = true;
        await ensureInitialized(null);
        
        const instance = diceBoxInstance.getInstance ? diceBoxInstance.getInstance() : diceBoxInstance;
        
        if (instance) {
          instance.show();
          // Aguarda a animação remota parar
          await instance.roll(forcedArray); 
        }

        // Mostra o alerta apenas quando a física termina na tela do espectador
        const rollId = generateId();
        pendingAlerts =[
          ...pendingAlerts,
          {
            id: rollId, userName: roll.user_name, formula: roll.formula, result: roll.result,
            successes: roll.details?.successes, textual: roll.details?.textual,
            rolls: rawDetails.map(d => d.value), diceType: `d${sidesNum}`, color, isRemote: true, timestamp: Date.now()
          }
        ];
        processNextAlert();

      } catch (err) {
        console.error('[DiceStore] playRemoteRoll error:', err);
      }
    }
    ```