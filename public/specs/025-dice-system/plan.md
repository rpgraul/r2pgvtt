## 1. Objetivo
Sincronizar rolagens de dados 3D em tempo real, garantindo que o resultado visual (3D) seja idêntico ao resultado lógico gerado via Web Crypto API em todos os clientes conectados.

## 2. Estratégia de Arquitetura
1.  **Cálculo Antecipado**: No `rollDice`, a lógica calculará todos os valores (incluindo explosões) antes de iniciar a animação.
2.  **Payload Determinístico**: O broadcast enviará um array de objetos `{ sides, value }` em vez de apenas a fórmula.
3.  **Injeção no Dice-Box**: Utilizaremos a capacidade do `dice-box` de aceitar um array de resultados para forçar a física do dado a parar no valor pré-definido.
4.  **Evento de Conclusão**: O alerta de UI só será processado após o callback `onRollComplete` do Dice-Box para manter o suspense.