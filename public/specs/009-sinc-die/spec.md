# Spec: Perfect Sync Implementation

## 1. Arquivos Afetados
- `src/lib/supabase/tables.ts`
- `src/routes/+layout.svelte`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/components/chat/ChatSidebar.svelte`
- `src/components/FAB.svelte`
- `src/components/dice/DiceRoller.svelte`

## 2. Mudanças Estruturais

### 2.1. `src/lib/supabase/tables.ts`
- **Remover** as inicializações e envios de `supabase.channel` dentro de `addChatMessage` e `addRoll`. As funções devem voltar a ser puramente de banco de dados (apenas `.insert(...)`).

### 2.2. `src/routes/+layout.svelte`
- **Limpeza:** Remover os blocos `$effect` soltos no nível do módulo que instanciam `diceChannelInstance` e `chatChannelInstance`. O `+layout.svelte` não fará mais escutas diretas do Supabase.

### 2.3. `src/lib/state/gameState.svelte.ts`
- **RoomChannel Config:** No `setupRoomChannel`, garantir que a criação do canal inclua a flag de ack: `supabase.channel('room:' + gameId, { config: { broadcast: { ack: true } } })`.
- **Remoção de Eventos Obsoletos:** Remover a escuta do evento `dice_roll_start` e deletar a função `broadcastDiceStart()`.
- **Aprimorar o `sendRoll`:**
  - Adicionar o parâmetro `color: string`.
  - O payload do `this.roomChannel.send` deve incluir a `color` (`{ roll, color, userId }`).
- **Lidar com Recebimento de Dados (`dice_roll` event):**
  - Quando receber o evento `dice_roll` de outro usuário, instancie o alerta local chamando `import('./diceStore.svelte.js').then(m => m.diceStore.addRemoteAlert({...payload.roll, color: payload.color}))`.

### 2.4. `src/lib/state/diceStore.svelte.js`
- **Adicionar Suporte a Cores no Alerta:** Modificar `addRemoteAlert` e a renderização do alerta para aceitarem a cor do dado recebida pelo broadcast.
- **Limpeza:** Remover a função `rollFake`.

### 2.5. Componentes de UI (Chat, FAB, DiceRoller)
- Atualmente os componentes estão chamando `gameState.sendRoll(...)` sem a cor. É preciso buscar a cor atual do dado via `import { diceStore } from '$lib/state/diceStore.svelte.js'` e incluí-la como o último parâmetro ao chamar `gameState.sendRoll(..., diceStore.currentDiceColor)`.