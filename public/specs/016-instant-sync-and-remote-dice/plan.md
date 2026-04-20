# Plan: 016 - Instant Sync & Remote Dice

## 1. Objetivo
Alcançar sincronia de dados e chat instantânea entre navegadores usando WebSockets Puros (Supabase Broadcast), garantindo que o dado 3D remoto seja exibido corretamente sem quebrar o Javascript por incompatibilidade de tipos de dados. Eliminar o auto-fechamento (os dados ficam fixos até clique).

## 2. Estratégia de Arquitetura
1. **Deduplicação de IDs:** Todas as mensagens e rolagens ganharão um UUID na hora de envio. Se o Broadcast (WebSocket) chegar antes do Postgres_Changes, o sistema já renderiza na tela e ignora a duplicata.
2. **Correção do Wrapper 3D:** A função `roll()` no `useDiceBox.js` será corrigida para não quebrar quando receber `Array` em vez de `String`.
3. **Setup Correto do RoomChannel:** O `gameState.svelte.ts` vai logar ativamente o status do Broadcast e injetar o canal corretamente no `init()`.