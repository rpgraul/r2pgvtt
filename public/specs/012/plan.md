# Plan: VTT Physics-First Sync & DB Fix

## 1. Objetivo
Garantir sincronia absoluta do Chat e Dados 3D. A física 3D do jogador que iniciar a rolagem ditará o resultado final, que então será transmitido aos demais jogadores. Além disso, resolveremos os erros de HTTP 406 no Supabase e eliminaremos duplicações de envio na interface.

## 2. Estratégia de Arquitetura
1. **Physics-First Roll:** O `diceStore` aguardará a simulação 3D terminar localmente. O resultado real obtido da engine será transmitido ao `gameState` para ser propagado via Broadcast (`roomChannel`) e salvo no banco.
2. **Recepção Remota Simples:** Jogadores que receberem um broadcast de dado (`dice_roll`) atualizarão seus chats imediatamente, exibirão o alerta visual e forçarão o dado 3D a rolar os números exatos.
3. **Ponto Único de Envio (DRY):** Componentes visuais (`FAB`, `ChatSidebar`, `DiceRoller`) chamarão **apenas** `diceStore.rollDice()`. Todo o código que chamava `gameState.sendMessage` ou `sendRoll` nas UIs será deletado, pois o `diceStore` cuidará disso.
4. **Fix 406 Not Acceptable:** Trocar todas as queries de verificação que usam `.single()` (que quebram a execução se não houver dados) por `.maybeSingle()`.