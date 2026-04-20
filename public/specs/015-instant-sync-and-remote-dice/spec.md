# Spec: 015 - Instant Sync Implementation

## 1. Arquivos Afetados
- `src/lib/actions/useDiceBox.js`
- `src/lib/supabase/tables.ts`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`

## 2. Mudanças Estruturais

### 2.1. `useDiceBox.js`
- Na função `roll(formula)`, adicionar uma checagem `if (typeof formula === 'string')` antes de aplicar `.trim()` ou `.endsWith('+')`. Se a fórmula for um `Array`, tratá-la como uma rolagem forçada e repassar à engine sem modificações.

### 2.2. `tables.ts`
- Modificar `addChatMessage` para receber um `id` opcional e incluí-lo no payload do insert.
- Modificar `addRoll` para receber um `id` opcional e incluí-lo no payload do insert.

### 2.3. `gameState.svelte.ts`
- **Configuração do Canal:** Adicionar `private roomChannel: any = null;` à classe. No método `init(gameId)`, inicializar `this.roomChannel = supabase.channel('room:' + gameId, { config: { broadcast: { ack: false } } })`. Configurar listeners para `chat_message` e `dice_roll` que atualizam os arrays instantaneamente se o `payload.userId` não for o do próprio autor. Chamar `diceStore.playRemoteRoll` quando receber rolagem.
- **Ações otimistas:** Atualizar `sendMessage` e `sendRoll` para gerar um UUID. Fazer o push local no array, disparar `this.roomChannel.send(...)` para velocidade em milissegundos, e chamar as funções do `tables.ts` (passando o UUID gerado) para persistência assíncrona.

### 2.4. `diceStore.svelte.js`
- Modificar `rollDice`:
  - Aguardar `diceBoxInstance.roll(...)` para a engine calcular a física na tela do jogador 1.
  - Com o resultado em mãos (`physicsResult`), processar a matemática.
  - Disparar `gameState.sendRoll` e `gameState.sendMessage` com o resultado e a cor.
  - Remover qualquer menção ao `setTimeout` para limpeza.
- Refatorar `playRemoteRoll(roll)`:
  - Formatar o array `forcedArray` mapeando `d.value`.
  - Chamar `await diceBoxInstance.roll(forcedArray)`.
  - Remover o `setTimeout` de 3000ms.