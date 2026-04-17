# Implementation Plan: Chat + Dados Visíveis da Mesa

**Branch**: `006-chat-and-shared-data` | **Date**: 2026-04-17 | **Spec**: `specs/006-chat-and-shared-data/spec.md`

## Current State

Chat e card visibility JÁ ESTÃO IMPLEMENTADOS no código existente. Esta spec foca em **verificação e ajustes**.

## Code Locations

| Feature | Arquivo | Status |
|---------|--------|--------|
| Chat UI | `src/components/chat/ChatSidebar.svelte` | ✅_exists |
| Chat Subscribe | `src/lib/supabase/tables.ts` `subscribeToChat()` | ✅_exists |
| Send Message | `src/lib/state/gameState.svelte.ts` `sendMessage()` | ✅_exists |
| Card Visibility Filter | `gameState.filteredItems` getter | ✅_exists |
| Realtime Cards | `subscribeToItems()` | ✅_exists |

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Runes | ✅ PASS | `$state`, `$derived`, `$effect` |
| Tailwind v4 | ✅ PASS | Zinc-950 theme |
| Supabase Realtime | ✅ PASS | Already in use |

## Tasks

**Verificação e ajustes apenas** (código já existe):

- [ ] T001 [Verify] Testar chat: duas sessões → enviar mensagem
- [ ] T002 [Verify] Testar dice: `/r 1d20` funciona
- [ ] T003 [Verify] Testar card visibility: narrador cria card oculto, jogador não vê
- [ ] T004 [Fix] Ajustar lógica de visibilidade se necessário
- [ ] T005 [Verify] Testar realtime sync de cards