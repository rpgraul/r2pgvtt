# Plan: 020 - Perfect Physics Sync

## 1. Objetivo
Garantir que os dados 3D rolem para todos na sala com os mesmos números virados para cima, que o alerta e o chat só apareçam *após* o dado parar de girar, e que a rolagem não apareça em páginas fora do jogo (como login).

## 2. Estratégia de Arquitetura
1. **Limpeza do Wrapper 3D:** Simplificar totalmente o arquivo `useDiceBox.js`. Ele não tentará mais gerenciar as Promises da rolagem. Ele servirá apenas para carregar a biblioteca e nos fornecer a instância raiz (`getInstance()`), que já possui Promises nativas de física perfeitas.
2. **O Fluxo Perfeito de Sincronia:** 
   - Jogador 1 clica em rolar. A matemática gera `15`.
   - Jogador 1 envia "Broadcast" avisando todos: "Rolem forçadamente o número 15!".
   - A engine de todos (Jogador 1 e os outros) rola o 3D *forçado* ao número 15.
   - Quando a física para (usando o `await` nativo do motor), a tela mostra o Alerta e adiciona a mensagem no Chat.
3. **Isolamento de Sala:** O `playRemoteRoll` verificará se o jogador está dentro de uma sala (`gameState.gameId !== null`). Se não estiver, ignora a rolagem.