# Plan: 013 - Fix DiceStore Syntax & Absolute Sync

## 1. Objetivo
Corrigir o erro de sintaxe do compilador (`Unexpected token` no Acorn) no arquivo `diceStore.svelte.js`, corrigir a reatribuição de constantes (`diceBoxResolve`), e implementar a arquitetura "Math-First" para sincronia perfeita dos dados 3D.

## 2. Estratégia de Arquitetura (Math-First Sync)
A causa dos valores divergentes é que a engine 3D calcula sua própria física, que é inerentemente aleatória em cada navegador. Para forçar a sincronia:
1. **Geração Imediata:** Quando o jogador clica em rolar, o `diceStore` calcula o resultado matematicamente de forma síncrona.
2. **Propagação Pura:** Esse resultado é enviado ao `gameState`, que salva no banco de dados e dispara o evento no chat local e remoto. Nenhum outro componente deve chamar envios de chat/roll.
3. **Animação Forçada (Visual-Only):** O resultado matemático é passado para o `@3d-dice/dice-box` no formato `forcedArray` tanto localmente quanto remotamente. A engine 3D vira um "marionete" que apenas anima a queda dos dados para os números já decididos.
4. **Resolução de Erros de Sintaxe:** O código será reescrito utilizando blocos `try/catch` com `async/await` limpos e padronizados para o compilador Vite/Svelte 5.