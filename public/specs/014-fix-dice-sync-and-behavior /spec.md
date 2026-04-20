# Spec: 014 - Physics-First Implementation

## 1. Arquivos Afetados
- `public/src/lib/actions/useDiceBox.js`
- `public/src/lib/state/diceStore.svelte.js`
- `public/src/components/chat/ChatSidebar.svelte`

## 2. Mudanças Estruturais

### 2.1. `useDiceBox.js`
- **Suporte a Rolagem Forçada:** A função `roll(formula)` espera uma string, mas as rolagens forçadas da biblioteca `@3d-dice/dice-box` requerem um Array de objetos. Modifique o início da função `roll` para tratar tanto `String` quanto `Array`. Se for string, aplica o `.trim()` e lógica de soma. Se for array, repassa diretamente para o motor 3D.

### 2.2. `diceStore.svelte.js`
- **Reescrever `rollDice(formula)` (Physics-First):**
  - Fazer o parse da fórmula.
  - Tornar `isDiceVisible = true`.
  - Aguardar a inicialização.
  - Rolar fisicamente usando o motor 3D: `const physicsResult = await diceBoxInstance.roll(parsedData.baseFormula);`
  - Só então usar os valores físicos para avaliar: `const evaluated = evaluateRolls(parsedData, physicsResult.rolls);`
  - Importar o `gameState`, enviar a rolagem, a cor e a mensagem ao chat.
  - Exibir o alerta no array `pendingAlerts` e remover qualquer timeout de auto-dismiss.
- **Reescrever `playRemoteRoll(roll)`:**
  - Extrair a cor e os dados (`rawDetails`).
  - Mapear para o formato aceito pelo dice-box: `const forcedArray = rawDetails.map(d => ({ qty: 1, sides: parsedSides, value: d.value, themeColor: color }));`.
  - Ativar `isDiceVisible = true`.
  - Aguardar e rodar a animação forçada: `await diceBoxInstance.roll(forcedArray)`.
  - Lançar o alerta visual (`addRemoteAlert` interno). Remover qualquer timeout de auto-dismiss.
- **Limpeza:** Remover a antiga função `playSyncRoll` se ainda existir, pois foi absorvida. Remover todos os `setTimeout(() => { clear3DDice(); }, 3000);`.

### 2.3. `ChatSidebar.svelte`
- No template HTML, alterar a propriedade de data da mensagem. Onde há `{#if msg.createdAt}` e `formatTime(msg.createdAt)`, trocar para lidar com as propriedades que vêm do Supabase: `{#if msg.created_at || msg.createdAt}` e `formatTime(msg.created_at || msg.createdAt)`. Isso vai desocultar as mensagens do histórico.