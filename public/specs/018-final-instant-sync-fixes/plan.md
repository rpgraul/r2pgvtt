# Plan: 018 - Final Instant Sync Fixes

## 1. Objetivo
Corrigir o "crash silencioso" (`.trim is not a function`) que impede os dados 3D de renderizarem em navegadores remotos, eliminar o uso de `import()` dinâmicos que falham no Svelte/Vite e garantir que a rolagem, o alerta e o chat sejam criados em um único fluxo unificado e transmitidos instantaneamente para a sala.

## 2. Estratégia de Arquitetura
1. **Wrapper 3D Blindado:** A função `roll` do `useDiceBox.js` terá uma validação estrita de tipos para não tentar tratar um `Array` de dados forçados como se fosse uma `String`.
2. **Imports Estáticos:** Usaremos importação estática (`import { gameState }...` e `import { diceStore }...`) no topo dos arquivos para garantir que as funções de comunicação remota estejam sempre disponíveis, eliminando a dependência de Promises soltas.
3. **Payload Múltiplo:** A função `sendRoll` vai construir simultaneamente o objeto da rolagem (`rollData`) e a mensagem do chat (`chatMsg`), enviá-los via WebSockets (Broadcast) e só depois salvá-los no Supabase.