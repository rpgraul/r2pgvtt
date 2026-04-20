# Tasks: 013 - Syntax and Sync Execution

- [ ] **Task 1: Correção Geral do `diceStore.svelte.js`**
  - No topo do arquivo, remova as declarações com `const` que causam quebras (`const diceBoxResolve = null;`, `const diceBoxData = null;`). 
  - Reescreva a função `rollDice(formula)` exatamente assim (para evitar erros do Acorn):
    ```javascript
    function rollDice(formula) {
      return new Promise(async (resolve, reject) => {
        try {
          const parsedData = parseFormula(formula);
          if (!parsedData) throw new Error('Invalid formula');

          const result = fallbackRoll(parsedData);
          result.formula = formula;

          const { gameState } = await import('./gameState.svelte.ts');
          
          gameState.sendRoll(formula, result.total, result, currentDiceColor);
          gameState.sendMessage(`🎲 Rolou ${formula}: ${result.textual}`);

          await playSyncRoll({
            formula,
            result: result.total,
            details: result,
            color: currentDiceColor,
            userName: getUserName(),
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }
    ```
  - Reescreva `playSyncRoll(payload)` para ser estritamente sequencial:
    ```javascript
    async function playSyncRoll(payload) {
      const { formula, result, details, color, userName } = payload;
      const sides = details.parsedData.sides;
      const forcedArray = details.details.map((d) => ({
        sides,
        themeColor: color,
        value: d.value,
      }));

      isDiceVisible = true;
      await ensureInitialized(null);

      if (diceBoxInstance && diceBoxInstance.isInitialized()) {
        try {
          await diceBoxInstance.getInstance().roll(forcedArray);
        } catch (e) {
          console.warn('Dice animation skipped', e);
        }
      }

      const rollId = generateId();
      pendingAlerts =[...pendingAlerts, {
        id: rollId, userName, formula, result,
        successes: details.successes, textual: details.textual,
        rolls: details.details.map((d) => d.value), diceType: `d${sides}`, timestamp: Date.now()
      }];
      processNextAlert();
      setTimeout(() => { clear3DDice(); }, 3000);
    }
    ```
  - Aplique a mesma lógica limpa à função `playRemoteRoll(roll)`. Crie o `forcedArray` extraindo `roll.details.parsedData.sides` e as cores, defina `isDiceVisible = true`, chame `ensureInitialized`, rode a animação, e adicione aos alertas. Exporte esta função no `return` do store.

- [ ] **Task 2: Lógica de Estado e Sincronização (`gameState.svelte.ts` e `tables.ts`)**
  - Verifique `src/lib/state/gameState.svelte.ts`. No método `init()`, dentro de `db.subscribeToRolls(gameId, (rolls) => {...}, (newRoll) => {...})`, assegure-se de que a lógica chame o store remoto corretamente: 
    ```typescript
    if (newRoll.user_name !== this.userName) {
      import('./diceStore.svelte.js').then(m => m.diceStore.playRemoteRoll(newRoll));
    }
    ```
  - Em `src/lib/supabase/tables.ts`, certifique-se de que `subscribeToChat` e `subscribeToRolls` fazem o `select()` inicial ordenado, passam para o callback `onInitialLoad` e em seguida conectam o `.on('postgres_changes', { event: 'INSERT'... }, payload => onInsert(payload.new)).subscribe()`. Sem criar canais extras em `addRoll` ou `addChatMessage`.

- [ ] **Task 3: Remoção Definitiva de Duplicações na UI**
  - Edite `src/components/dice/DiceRoller.svelte`: Remova o HTML `<div bind:this={diceContainer}...></div>`. Nas funções `rollDice` e `rollCustom`, o código deve ser SOMENTE:
    ```javascript
    isLoading = true;
    try {
      lastResult = await diceStore.rollDice(customFormula); // ou `1${dice}`
    } catch(e) { console.error(e); } finally { isLoading = false; }
    ```
    Remova qualquer chamada a `gameState.sendRoll` ou `gameState.sendMessage` deste arquivo.
  - Edite `src/components/chat/ChatSidebar.svelte`: Na condicional do comando `/r`, use apenas `diceStore.rollDice(formula).catch(...)`. Remova os blocos `.then` que disparam mensagens duplicadas.
  - Edite `src/components/FAB.svelte`: Nas funções de rolagem (`d20`, `d6`, etc), use apenas `diceStore.rollDice('1' + action).catch(...)`. Remova os blocos `.then`.