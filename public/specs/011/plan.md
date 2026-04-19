# Plan: VTT Dice & Chat Absolute Sync

## 1. Objetivo
Unificar a lógica de rolagem de dados em uma única fonte de verdade (banco de dados) para garantir que todos os jogadores vejam o chat atualizado instantaneamente, sem mensagens duplicadas, e que a simulação 3D dos dados de outros jogadores caia nos mesmos números e cores gerados pelo autor da rolagem.

## 2. Estratégia de Arquitetura
1. **Remoção de Duplicações:** Eliminar todas as instâncias secundárias da engine 3D (ex: remover `useDiceBox` de dentro do `DiceRoller.svelte`). Todos os componentes devem chamar exclusivamente `diceStore.rollDice()`.
2. **Centralização do Salvamento:** O `diceStore.rollDice()` será o único responsável por aguardar a física 3D terminar, avaliar os resultados e então salvar na tabela `dice_rolls` e `chat_messages` via `gameState`. Os componentes de UI não farão mais envios ao DB.
3. **Database como Fonte da Verdade:** As funções `subscribeToChat` e `subscribeToRolls` no `tables.ts` voltarão a escutar `postgres_changes` (INSERTs). Ao receber um INSERT, o `gameState` atualizará a tela.
4. **Sincronia Visual (Forced Rolls):** Se o `gameState` receber um INSERT em `dice_rolls` pertencente a *outro* usuário, chamará `diceStore.playRemoteRoll(roll)`. O `playRemoteRoll` instruirá a biblioteca `@3d-dice/dice-box` a rolar dados com valores pré-determinados e com a cor enviada no payload, recriando a cena 3D perfeitamente para o espectador.