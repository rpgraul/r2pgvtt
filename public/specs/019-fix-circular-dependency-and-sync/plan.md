# Plan: 019 - Event-Driven Architecture for Absolute Sync

## 1. Goal
Fix the silent crash in Browser 2 caused by circular dependency imports between `gameState` and `diceStore`. Ensure that remote dice rolls trigger the 3D physics engine and update the Chat and Alerts instantly.

## 2. Strategy
1. **Decouple Stores:** Remove all static and dynamic imports between `gameState.svelte.ts` and `diceStore.svelte.js`.
2. **Event-Driven Communication:** 
   - When a local roll happens, `diceStore` will dispatch a custom DOM event (`outgoing_local_roll`). `gameState` will listen to this event and handle the Supabase broadcast and DB saving.
   - When a remote broadcast is received, `gameState` will dispatch (`incoming_remote_roll`). `diceStore` will listen to this event to trigger the 3D dice animation and the on-screen alert.
3. **Fail-Safe UI Updates:** The Svelte `$state` arrays (`chatMessages` and `rolls`) will be updated immediately upon receiving the broadcast, guaranteeing that even if the 3D engine fails, the chat will always reflect the roll.