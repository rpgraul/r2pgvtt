# Spec: Realtime Chat & 3D Dice Implementation

## 1. Arquivos Afetados
- `src/lib/supabase/tables.ts`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/routes/+layout.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/supabase/tables.ts`
- **Remover** totalmente a lógica complexa de subscriptions do Postgres e Broadcasts antigos das funções:
  - `subscribeToChat` (manter apenas a lógica para buscar dados iniciais: `loadMessages`).
  - `subscribeToRolls` (manter apenas a lógica para buscar dados iniciais: `loadRolls`).
- **Simplificar** `addChatMessage` e `addRoll`: devem apenas fazer o `.insert()` no banco, sem emitir broadcast.

### 2.2. `src/lib/state/gameState.svelte.ts`
- **Variáveis Privadas:** Adicionar `private roomChannel: any = null;`.
- **Setup do Canal:** Criar método `setupRoomChannel(gameId: string)` que:
  - Inicializa o canal `room:[gameId]`.
  - Escuta os eventos: `chat_message`, `dice_roll_start` e `dice_roll`.
  - Atualiza os arrays `chatMessages` e `rolls` quando recebe payload de outros usuários.
  - No evento `dice_roll_start`, importa e chama `diceStore.rollFake(formula)`.
- **Métodos de Ação (`sendMessage`, `sendSystemMessage`, `sendRoll`):**
  - Construir o objeto da mensagem/rolagem localmente gerando um ID falso/temporário (ex: `crypto.randomUUID()`).
  - Fazer push no array de estado local imediatamente.
  - Enviar o objeto via `this.roomChannel.send()`.
  - Chamar a função do `db` para persistência como uma promessa sem usar `await` bloqueante.
- **Adição de Método:** `broadcastDiceStart(formula: string)` para avisar os outros clientes sobre o início de uma rolagem.
- **Remoções:** Deletar `startPolling`, `stopPolling`, `chatPollingInterval`, `dicePollingInterval` e antigas `realtimeChannels`.

### 2.3. `src/lib/state/diceStore.svelte.js`
- **Nova Função `rollFake(formula)`:**
  - Faz o parse da fórmula.
  - Altera `isDiceVisible = true`.
  - Executa a rolagem visual via `diceBoxInstance.roll(parsedData.baseFormula)` capturando e ignorando erros/promises de retorno (apenas efeito visual).
- **Alteração em `rollDice`:**
  - Imediatamente após fazer o parse da fórmula com sucesso, chamar a importação de `gameState` para executar `gameState.broadcastDiceStart(formula)`.
- **Alteração no callback do `DiceBox`:**
  - Na configuração `onRollComplete`, tratar rolagens "fake". Se `diceBoxResolve` não existir (rolagem iniciada por outro client), dar um console log ignorando o resultado e limpar os dados da tela após 3 segundos chamando `clear3DDice()`.

### 2.4. `src/routes/+layout.svelte`
- **Limpeza:** O layout atualmente possui listeners `$effect` soltos instanciando `diceChannelInstance` e `chatChannelInstance`. Remover esses blocos `$effect` inteiros, além de suas devidas variáveis e desativações no `onDestroy`, pois o `gameState` agora controlará o Broadcast integralmente.