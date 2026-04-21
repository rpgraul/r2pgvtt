## 1. Arquivos Afetados
- `src/lib/utils/diceLogic.js`: Ajuste na função de aleatoriedade para maior precisão e exportação de tipos.
- `src/lib/state/diceStore.svelte.js`: Reestruturação do `rollDice` e `forceDisplayRoll`.
- `src/lib/actions/useDiceBox.js`: Configuração de callbacks de conclusão.
- `src/lib/state/game.svelte.js`: (Referência) Garantir que o broadcast suporte o novo payload.

## 2. Contrato de Dados (Payload Broadcast)
```json
{
  "event": "dice_roll",
  "payload": {
    "formula": "2d20",
    "results": [{"sides": 20, "value": 15}, {"sides": 20, "value": 3}],
    "total": 18,
    "userName": "Jogador",
    "color": "#ff0000",
    "details": { ...AST do diceLogic }
  }
}
```

## 3. Mudanças Estruturais
- O `diceStore` passará a ser o orquestrador de eventos.
- `forceDisplayRoll` deixará de receber apenas o `result` (total) e passará a exigir o array `rolls` detalhado.
- Implementação de um sistema de "Queue" visual para evitar que rolagens rápidas sobreponham o canvas.