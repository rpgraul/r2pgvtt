# Spec: 017 - Bulletproof Instant Sync

## 1. Arquivos Afetados
- `src/lib/state/diceStore.svelte.js`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/supabase/tables.ts`

## 2. Mudanças Estruturais

### 2.1. `src/lib/state/diceStore.svelte.js`
- **Reescrever `playRemoteRoll(roll)`:**
  - Ao iniciar, deve imediatamente preparar o `forcedArray`.
  - Disparar o `addRemoteAlert` inserindo os dados na tela (sem nenhum `await` bloqueante antes).
  - Em uma promessa desacoplada, rodar `ensureInitialized().then(...)` e, dentro dela, `diceBoxInstance.getInstance().roll(forcedArray)`.

### 2.2. `src/lib/state/gameState.svelte.ts`
- **Listener de Broadcast (`setupRoomChannel`):**
  - No evento `dice_roll`, insira `payload.chatMsg` no array `this.chatMessages` (se existir) para que o Chat da tela do usuário 2 atualize imediatamente.
  - Insira `payload.roll` no array `this.rolls`.
  - Invoque `playRemoteRoll`.

### 2.3. `src/lib/supabase/tables.ts`
- **Consertar Assinaturas:**
  - Assegurar que `addRoll` aceita `id?: string` no seu objeto de argumentos. E passa para o banco: `if (rollData.id) payload.id = rollData.id;`.
  - Assegurar que `addChatMessage` aceita `id?: string` na assinatura e repassa ao banco.