# Plan: 014 - Full WebSocket Rebuild

## 1. Objetivo
Reestruturar a arquitetura para "Math-First" com WebSockets puros. O banco de dados será relegado a segundo plano (apenas persistência), e a engine 3D será instanciada em todos os navegadores antecipadamente para evitar o bug de Lazy-Loading.

## 2. Estratégia de Arquitetura
1. **Fim do Lazy Loading:** O `+layout.svelte` importará estaticamente e inicializará o `diceStore` no `onMount`, garantindo que as ferramentas 3D estejam prontas para receber WebSockets antes mesmo de qualquer clique.
2. **Instant Broadcast:** A rolagem matemática gera um payload completo, e o `gameState` faz o broadcast (`roomChannel`) imediatamente.
3. **Animação Duplicada Controlada:** A função `execute3DAnimation` rodará a física nos clientes.
4. **Fix de Supabase (406):** Mudar todos os `.single()` para `.maybeSingle()` nos getters de estado.