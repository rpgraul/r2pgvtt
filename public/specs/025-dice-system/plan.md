## 1. Objetivo
Criar um sistema de rolagem de dados 3D sincronizado onde o resultado é pré-determinado por criptografia antes da animação começar, garantindo que todos os jogadores vejam o mesmo valor e movimento.

## 2. Estratégia de Arquitetura
1. **Geração**: O jogador que inicia a rolagem gera um `Uint32` usando `window.crypto.getRandomValues()`.
2. **Sincronização**: O valor e a configuração do dado (lados, cor) são enviados via Supabase Realtime Broadcast no canal da sala (`room_channel`).
3. **Visualização**: Todos os clientes (incluindo o remetente) recebem o evento e chamam `diceBox.roll([{ sides, value }])`. O Dice-Box forçará a física para cair no número recebido.
4. **Finalização**: O callback `onRollComplete` do Dice-Box dispara um evento de UI para exibir o alerta com o resultado.