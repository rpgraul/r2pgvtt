# Plan: Perfect Sync 3D Dice & Chat Fix

## 1. Objetivo
Garantir que a animação dos dados 3D exiba exatamente os mesmos números e a mesma cor para todos os jogadores simultaneamente. Corrigir os envios duplicados no banco de dados e garantir que o histórico do chat carregue instantaneamente.

## 2. Estratégia de Arquitetura (Dice Sync Matemático)
Para sincronizar a física 3D em todos os navegadores:
1. O jogador que inicia a rolagem (`diceStore.rollDice`) gera o resultado matematicamente de forma instantânea através do `fallbackRoll`.
2. Esse resultado exato, junto com a cor escolhida pelo jogador, é enviado ao `gameState.sendRoll` para broadcast a todos os navegadores da sala.
3. Localmente (e remotamente ao receber o broadcast), chamamos a função `playSyncRoll`, que instrui a biblioteca `@3d-dice/dice-box` a rodar a animação forçando os dados a caírem nos valores exatos calculados no passo 1 e na cor especificada.
4. O componente `DiceRoller.svelte` será refatorado para abandonar sua instância própria de dados e usar exclusivamente a rolagem global do `diceStore`, eliminando a duplicação de eventos no chat e banco.

## 3. Correção do DB e Chat
O arquivo `tables.ts` será limpo definitivamente. Funções de `subscribe` farão apenas uma query simples `select()` via Promise e retornarão os dados limpos, eliminando falhas de reatividade.