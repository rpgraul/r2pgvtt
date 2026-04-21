# Plan: 021 - Web Crypto API Dice Rolls

## 1. Objetivo
Substituir toda a geração de números pseudoaleatórios (`Math.random()`) do VTT por números gerados a partir de entropia física do hardware utilizando a `Web Crypto API`, eliminando qualquer previsibilidade. 

## 2. Estratégia de Arquitetura
1. **Unbiased Randomness:** Implementar a função `getSecureRandomInt(sides)` que gera números aleatórios usando `window.crypto.getRandomValues()`. A função incluirá uma proteção contra "Modulo Bias" (viés de módulo), garantindo que absolutamente todas as faces do dado tenham a exata mesma probabilidade estatística de cair.
2. **Centralização:** Aplicar essa nova função de criptografia na rolagem inicial dos dados no `diceStore.svelte.js` e na lógica de dados explosivos (quando um dado cai no máximo e roda de novo) no `diceLogic.js`.
3. **Limpeza Definitiva:** Garantir que componentes de UI antigos (como o `DiceModal.svelte`) não usem `Math.random()` internamente, redirecionando as chamadas para a fonte única de verdade do sistema (`diceStore.rollDice`).