# Tasks: Realtime Refactoring Execution

- [ ] **Task 1: Limpeza do Supabase Tables (`src/lib/supabase/tables.ts`)**
  - Remova a lógica de `postgres_changes` e `channel` dentro de `subscribeToChat`. A função deve apenas fazer uma busca inicial assíncrona dos dados via `loadMessages` e executar o `callback(data)`.
  - Faça o mesmo para `subscribeToRolls`.
  - Modifique `addChatMessage` para fazer apenas o `insert` no banco de dados e retornar, removendo a lógica de inicializar canais de broadcast ali dentro.
  - Modifique `addRoll` para fazer apenas o `insert` no banco de dados, removendo o broadcast associado.

- [ ] **Task 2: Implementação do RoomChannel no GameState (`src/lib/state/gameState.svelte.ts`)**
  - Remova as referências a `chatPollingInterval`, `dicePollingInterval`, `startPolling` e `stopPolling`.
  - Substitua a variável `realtimeChannels` (objeto) por propriedades privadas isoladas: `private itemChannel: any = null;` e `private roomChannel: any = null;`.
  - Crie a função `setupRoomChannel(gameId: string)` que assina o canal `room:${gameId}` e escuta eventos de broadcast `chat_message`, `dice_roll` e `dice_roll_start`. Se o usuário que enviou for diferente do local, atualize a interface.
  - No método `init()`, certifique-se de chamar `this.setupRoomChannel(gameId)`. Ajuste a inscrição do `subscribeToItems` para gravar o canal retornado em `this.itemChannel`.
  - Atualize `cleanupRealtimeChannels()` para fechar `this.itemChannel` e `this.roomChannel`.

- [ ] **Task 3: Refatoração das Ações do Usuário (GameState Optimistic UI)**
  - Edite `sendMessage(text: string)`:
    - Crie o objeto da mensagem com UUID e adicione localmente a `this.chatMessages`.
    - Dispare o broadcast com a mensagem via `this.roomChannel.send()`.
    - Chame `db.addChatMessage` de forma assíncrona (fire-and-forget).
  - Faça o mesmo padrão para `sendSystemMessage(text: string)`.
  - Edite `sendRoll(formula, result, details)` usando a mesma abordagem (update local, broadcast, e DB fire-and-forget).
  - Crie o método `broadcastDiceStart(formula: string)` que envia um broadcast de `dice_roll_start`.
  - Remova os códigos de `refreshChat()` e `refreshRolls()` desses métodos, eles não precisam mais recarregar tudo do banco.

- [ ] **Task 4: Atualização da Lógica dos Dados 3D (`src/lib/state/diceStore.svelte.js`)**
  - Crie e exporte o método `rollFake(formula)`. Ele deve checar se `diceBoxInstance` está pronto e executar `.roll()`.
  - Dentro do método `rollDice`, adicione o comando assíncrono/dinâmico para avisar o game state: `import('./gameState.svelte.ts').then(m => m.gameState.broadcastDiceStart(formula));` logo após validar a fórmula.
  - No setup de inicialização `initDiceBox` do `diceBoxInstance`, atualize `onRollComplete`. Adicione a lógica do `else` para quando `diceBoxResolve` não existir, para que limpe os dados falsos após 3 segundos chamando `clear3DDice()`.

- [ ] **Task 5: Limpeza do Layout (`src/routes/+layout.svelte`)**
  - Remova os blocos `$effect` que criam `diceChannelInstance` e `chatChannelInstance`.
  - Remova as respectivas variáveis globais locais referentes a esses canais.
  - Remova o código que desinscreve desses canais no `return () => {}` do `onMount`.