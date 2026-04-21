## 1. Arquivos Afetados
- `src/lib/state/diceStore.svelte.js`: Lógica central de orquestração.
- `src/lib/utils/diceLogic.js`: Gerador de números determinísticos.
- `src/lib/actions/useDiceBox.js`: Configuração do callback de finalização.

## 2. Contrato do Payload (Broadcast)
Evento: `dice_roll`
```json
{
  "userName": "Nome",
  "formula": "1d20",
  "color": "#HEX",
  "deterministicRolls": [18], 
  "sides": 20,
  "total": 18,
  "details": { ... } 
}
```

## 3. Regras de Negócio
- **NUNCA** chamar `diceBox.roll("1d20")` com string. Sempre passar o array de objetos `[{ sides: 20, value: 18 }]`.
- O Alerta de UI deve ser disparado pelo evento de janela `dice:3d:finished`.
- Corrigir o erro de `groupId` garantindo que o motor 3D receba a notação de objeto completa.