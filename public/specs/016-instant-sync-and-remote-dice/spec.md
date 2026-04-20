# Spec: 016 - Instant Sync Implementation

## 1. Arquivos Afetados
- `src/lib/actions/useDiceBox.js`
- `src/lib/supabase/tables.ts`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`

## 2. Mudanças Estruturais

### 2.1. `useDiceBox.js`
- Na função `roll(formula)`, envolver `.trim()` em um `if (typeof formula === 'string')`. Se a fórmula for Array (rolagem remota forçada), apenas repasse-a inteira para o motor sem processar matemática local.

### 2.2. `tables.ts`
- Atualizar a função `addChatMessage` para aceitar um 5º parâmetro opcional `id?: string`. Se presente, adicionar ao payload do `insert()`.
- Atualizar a função `addRoll` para aceitar `id?: string` no objeto de propriedades. Adicionar no payload.

### 2.3. `gameState.svelte.ts`
- **Configurar `roomChannel`**: Criar método `setupRoomChannel(gameId)` que abre o canal, escuta os eventos `chat_message` e `dice_roll` via broadcast, e usa `.find` nos arrays para não duplicar antes de adicionar. Logar no console todos os recebimentos.
- **Chamada otimista**: No `sendMessage` e `sendRoll`, gerar o `id` na hora, atualizar o array de tela local, disparar `this.roomChannel.send(...)` e em seguida chamar o `tables.ts` passando esse `id`.

### 2.4. `diceStore.svelte.js`
- Refinar `playRemoteRoll(roll)`: Transformar os itens recebidos de `roll.details.details` em um Array específico que o motor `@3d-dice` entende (com `qty: 1`, `sides`, `value` e `themeColor`), e enviar este array diretamente usando a função nativa `diceBoxInstance.getInstance().roll(forcedArray)`.
- Remover qualquer `setTimeout` que esconda o dado (mantendo o clique livre para fechar).