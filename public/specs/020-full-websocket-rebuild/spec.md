# Spec: 014 - Full WebSocket Rebuild Implementation

## 1. Arquivos Afetados
- `src/lib/supabase/tables.ts`
- `src/lib/state/music.svelte.js`
- `src/lib/state/gameState.svelte.ts`
- `src/lib/state/diceStore.svelte.js`
- `src/routes/+layout.svelte`

## 2. Mudanças Estruturais

### 2.1. Correções de API Supabase (`tables.ts` e `music.svelte.js`)
- Alterar as consultas que causam HTTP 406. Onde houver `.select().single()`, mas que pode retornar vazio (como `getAudioState`, `getSettings`, `checkUserGameMembership` e `loadPlayerState`), trocar para `.select().maybeSingle()`.

### 2.2. Inicialização Global (`+layout.svelte`)
- Adicionar o import estático do `diceStore` no topo do arquivo.
- No bloco `onMount`, garantir a chamada de `diceStore.initDiceBox(diceContainer)` para engatilhar a lib 3D na memória do navegador espectador desde o carregamento da página.

### 2.3. Broadcast Instantâneo (`gameState.svelte.ts`)
- Criar a função `broadcastRoll(payload)`:
  - Cria os objetos para as listas `$state` (`this.rolls` e `this.chatMessages`) e atualiza a UI localmente.
  - Envia via `this.roomChannel.send()` o pacote WebSocket.
  - Salva em background via `db.addRoll` e `db.addChatMessage`.
- Atualizar o `setupRoomChannel`: no evento `dice_roll`, atualizar a UI e usar a importação dinâmica do `diceStore` chamando `m.diceStore.execute3DAnimation(payload)`.

### 2.4. Física Forçada (`diceStore.svelte.js`)
- Substituir a função `rollDice`: Parse -> FallbackRoll (Matemática) -> Monta Payload -> Chama `gameState.broadcastRoll(payload)` -> Chama `execute3DAnimation(payload)` localmente.
- Criar `execute3DAnimation(payload)`: Recebe os números forçados, roda a animação `.roll(forcedArray)`, emite o alerta visual na tela. (Não tem auto-dismiss com timeout, fica até o usuário clicar).