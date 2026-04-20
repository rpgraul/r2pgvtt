# Plan: 015 - Instant Sync & Remote Dice Fix

## 1. Objetivo
Replicar a velocidade instantânea de VTTs modernos (como Roll20) via Supabase Broadcast (WebSockets) e garantir a renderização exata dos dados 3D nos navegadores dos outros jogadores. Os dados rolados deverão permanecer fixos na tela até serem clicados para fechar.

## 2. Estratégia de Arquitetura
1. **Instant Broadcast:** Em vez de depender do tempo de resposta do banco de dados (Postgres Trigger), enviaremos a rolagem de dados e a mensagem de chat através do `roomChannel` simultaneamente com a gravação no DB.
2. **Deduplicação Inteligente:** Geraremos um `id` único (`crypto.randomUUID()`) localmente no momento do clique, enviando-o via Broadcast e também salvando-o no DB. Assim, se o histórico for carregado depois, o sistema saberá que é a mesma mensagem/rolagem e não a duplicará.
3. **Correção da Wrapper 3D (`useDiceBox.js`):** A função de rolagem deve aceitar a estrutura de `Array` (necessária para forçar os resultados na tela dos espectadores) sem tentar aplicar `.trim()` e quebrar a interface.
4. **Comportamento da UI:** A remoção automática (`setTimeout` de 3s) será deletada do `playRemoteRoll` e do `rollDice`.