# Plan: 023 - Math-First Strict Sync

## 1. Objetivo
Reestabelecer a arquitetura "Math-First" onde a Web Crypto API define o resultado inquestionável da rolagem instantaneamente. O motor 3D será forçado a exibir esse exato resultado em todos os navegadores, aguardando o fim da animação para então exibir os alertas e o chat.

## 2. Estratégia de Arquitetura
1. **Math-First (Web Crypto):** Ao acionar `rollDice`, o sistema gera o resultado via entropia física.
2. **Broadcast Instantâneo:** O resultado e a intenção de rolagem são enviados via evento para o `gameState`, que dispara o WebSocket imediatamente.
3. **Animação Forçada Rigorosa:** Tanto no `rollDice` local quanto no `playRemoteRoll`, o array de dados forçados será montado com `parseInt` estrito, garantindo que o `@3d-dice/dice-box` respeite a imposição de resultados.
4. **Espera Dramática:** O sistema chamará `await instance.roll(forcedArray)`. Somente após essa Promise resolver (o dado parou) é que o `pendingAlerts` receberá o pop-up na tela.