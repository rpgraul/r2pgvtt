# Plan: Realtime Chat & 3D Dice with Supabase Broadcast

## 1. Objetivo
Migrar o sistema de sincronização do Chat e Rolagem de Dados de uma arquitetura baseada em banco de dados (Polling/Postgres Changes) para uma arquitetura "Peer-to-Peer" via Supabase Realtime Broadcast. O banco de dados passará a ser usado apenas para persistência assíncrona (histórico).

## 2. Motivação
- **Performance e Custo:** Reduzir drasticamente as operações de leitura/escrita no banco de dados (Supabase), eliminando polling a cada 1.5s e triggers de banco.
- **UX (Experiência do Usuário):** Prover uma experiência instantânea, no estilo Miro/Figma, onde mensagens e animações de dados 3D aparecem simultaneamente para todos os jogadores na mesa sem atraso de rede (DB lag).

## 3. Estratégia de Arquitetura
1. **Canal Único:** Usar um único canal de broadcast por mesa (`room:[gameId]`) gerenciado pelo `gameState.svelte.ts`.
2. **Optimistic UI:** Ao enviar uma mensagem ou rolar um dado, a ação atualiza o estado local imediatamente, envia um evento de broadcast para os outros clientes, e, em paralelo (background), salva no banco de dados.
3. **Eventos do Canal:**
   - `chat_message`: Transmite a nova mensagem de chat.
   - `dice_roll_start`: Transmite a intenção de rolagem (ex: "1d20") para que os outros clientes rodem a animação 3D do dado (`rollFake`).
   - `dice_roll`: Transmite o resultado final da rolagem.
4. **Limpeza:** Remover funções antigas de polling, subscriptions de banco focadas em chat/rolls no `tables.ts` e listeners soltos no `+layout.svelte`.