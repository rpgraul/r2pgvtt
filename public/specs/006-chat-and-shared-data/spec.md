# Feature Specification: Chat + Dados Visíveis da Mesa

**Feature Branch**: `006-chat-and-shared-data`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: "Criar chat funcional e tornar dados visíveis para todos da mesa"

---

## Current State Analysis

### Chat (EXISTING - Code Complete)

- `src/components/chat/ChatSidebar.svelte` — UI com input, history
- `src/lib/state/gameState.svelte.ts` — `sendMessage()`, realtime subscription
- `src/lib/supabase/tables.ts` — `subscribeToChat()`, `addChatMessage()`
- Dice commands via `/r` or `/roll` already implemented

**Database**: `chat_messages` table already exists with fields: `text`, `type`, `sender`, `created_at`

**Verdict**: Chat functionality exists. Need to verify it works end-to-end.

### Card Visibility (EXISTING - Partially Implemented)

- `is_visible_to_players` field exists in items table
- Filter logic in `gameState.svelte.ts`:

```typescript
if (this.currentGameRole !== 'narrador') {
  result = result.filter((item) => item.isVisibleToPlayers);
}
```

**Verdict**: Visibility filter exists. Need to verify behavior.

---

## User Scenarios & Testing

### User Story 1 - Chat em Tempo Real (Priority: P1)

Como **participante da mesa**, quero enviar e receber mensagens de chat em tempo real.

**Independent Test**: Open two browsers → send message in one → appears in other

**Acceptance Scenarios**:

1. **Given** participante logado na mesa, **When** acessa sidebar de chat, **Then** vê histórico de mensagens
2. **Given** participante, **When** digita mensagem e pressiona Enter, **Then** mensagem aparece para todos
3. **Given** participante, **When** usa comando `/r 1d20+5`, **Then** rola dado e exibe resultado

---

### User Story 2 - Dados Visíveis da Mesa (Priority: P1)

Como **narrador**, quero que dados dos personagens sejam visíveis para todos na mesa.

**Independent Test**: Narrador marks card visible → players see it

**Acceptance Scenarios**:

1. **Given** Card com `is_visible_to_players = true`, **When** jogador acessa, **Then** vê o card
2. **Given** Card com `is_visible_to_players = false**, **When** jogador acessa, **Then** NÃO vê o card
3. **Given** Narrador, **When** acessa, **Then** vê TODOS os cards

---

### User Story 3 - Atualização Realtime de Cards (Priority: P1)

Como **participante**, quero ver atualizações de cards em tempo real.

**Independent Test**: Narrador creates card → appears for players immediately

**Acceptance Scenarios**:

1. **Given** Card visível criado, **When** happens, **Then**同步 a todos os participantes

---

## Requirements

### Functional Requirements

- **FR-001**: Sistema DEVE enviar/receber mensagens via Supabase Realtime
- **FR-002**: Sistema DEVE filtrar cards por visibilidade (is_visible_to_players)
- **FR-003**: Narrador DEVE ver todos os cards (ignorar visibilidade)
- **FR-004**: Cards visíveis DEVEM sincronizar em tempo real

### Non-Functional Requirements

- **NFR-001**: Mensagens aparecem em < 500ms

---

## Existing Code Locations

| Componente | Arquivo |
|-----------|---------|
| Chat UI | `src/components/chat/ChatSidebar.svelte` |
| Chat State | `src/lib/state/gameState.svelte.ts` |
| DB Operations | `src/lib/supabase/tables.ts` |
| Card Filters | `gameState.filteredItems` getter |

---

## Success Criteria

- **SC-001**: Mensagens trocadas sem refresh
- **SC-002**: Cards visíveis atualizam em tempo real
- **SC-003**: Narrador vê conteúdo oculto, jogadores não