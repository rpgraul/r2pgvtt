## 1. Arquivos Afetados
- `src/lib/utils/crypto.js`: Utilitário de aleatoriedade.
- `src/lib/stores/diceStore.svelte.js`: Estado global e lógica de comunicação dos dados (Svelte 5).
- `src/components/Dice/DiceScene.svelte`: Componente que hospeda o canvas do Dice-Box.
- `src/components/Dice/RollTrigger.svelte`: Botão de interface para rolar.

## 2. Tabelas e Dados (Supabase)
- Não requer alterações no Schema (uso de **Broadcast** para tráfego efêmero).
- Evento de Broadcast: `dice_roll`
  - Payload: `{ user_id: string, username: string, dice: [{ sides: number, value: number }], themeColor: string }`

## 3. Mudanças Estruturais
- Implementação de um `diceStore` utilizando Runes ($state) para gerenciar o estado do Dice-Box (inicializado ou não).
- Uso de `window.dispatchEvent` para comunicar o fim da rolagem entre o canvas 3D e a UI de alertas/chat.
- Garantia de que apenas o "Roller" gera o número; os outros apenas consomem o valor via WebSocket.