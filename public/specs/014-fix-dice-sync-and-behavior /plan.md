# Plan: 014 - Fix Dice Sync & Behavior

## 1. Objetivo
Restaurar o comportamento original de fechamento dos dados (apenas ao clicar), garantir que os dados exibidos no alerta/chat correspondam exatamente ao valor rolado pelo motor de física 3D, e forçar as telas dos outros jogadores a reproduzirem a animação exata (mesmo número e mesma cor) após o resultado ser confirmado. Corrigir o chat para renderizar mensagens antigas.

## 2. Estratégia de Arquitetura (Physics-First)
1. **Física Local como Fonte da Verdade:** A função `rollDice` aguardará a simulação do `@3d-dice/dice-box` terminar. Pegaremos os números resultantes da física, avaliaremos, exibiremos no alerta e enviaremos ao banco de dados e chat.
2. **Forced Roll Remoto:** Modificaremos a action `useDiceBox.js` para aceitar um `Array` na função `roll()` (antes ela falhava ao aplicar `.trim()` num array). O `playRemoteRoll` passará o array forçado com valores e cores exatos.
3. **Fim do Auto-Dismiss:** Eliminar todos os `setTimeout(clear3DDice, 3000)` espalhados no último patch. O dado deve permanecer fixo até a tela ser clicada.
4. **Chat Timestamp Fix:** O `ChatSidebar.svelte` procura por `msg.createdAt`, mas o banco retorna `msg.created_at`. Ajustar o binding garantirá que o histórico apareça corretamente.