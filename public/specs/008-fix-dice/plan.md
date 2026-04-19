# Plan: Perfect Sync Dice & Chat Fix

## 1. Objetivo
Corrigir o carregamento inicial do chat e garantir que todos os jogadores vejam o mesmo resultado e cor das rolagens, eliminando vazamentos de conexão no Supabase que estavam bloqueando o sistema em tempo real.

## 2. Estratégia de Arquitetura

**A. Correção do Vazamento de Broadcast (Channel Leak):**
O `tables.ts` estava instanciando um novo `supabase.channel()` a cada chamada de `addChatMessage` e `addRoll`. Isso esgota os limites de conexão do Supabase e quebra o Realtime.
- **Ação:** Remover totalmente os disparos de broadcast do `tables.ts` e do `+layout.svelte`. Todo o tráfego em tempo real passará estritamente pelo canal único gerido pelo `gameState.svelte.ts` (`roomChannel`).

**B. Consistência dos Dados Rolados:**
Como a engine de física 3D atua localmente e gera números diferentes para cada navegador, faremos o seguinte:
- O dado 3D rola **apenas** na tela do jogador que o acionou.
- Quando o dado termina de rolar (ou seja, quando temos o número definitivo), o resultado, os detalhes e a cor do jogador são enviados via `roomChannel` para a sala.
- Os demais navegadores recebem o evento e exibem imediatamente o **DiceAlert** (com a cor e número exatos) e a mensagem no **Chat**. Isso impede qualquer divergência de resultados.

**C. Estabilidade do Chat:**
Limpar os wrappers que impediam o `subscribeToChat` de povoar a tela inicial com o histórico do banco de dados.