# Plan: Arquitetura de Mesas

**SPEC**: `003-game-architecture`  
**Status**: Ready for Implementation  
**Created**: 2026-04-04

---

## 1. Problemas Identificados

### 1.1 getUserGames sem filtro
Busca todas as mesas ao invés de filtrar por membership:
```typescript
// PROBLEMA
.from('games')  // busca todas

// SOLUÇÃO
.from('games')
.select('*, game_members(*)')
.eq('game_members.user_id', userId)
```

### 1.2 getGameById não encontrado
A função existe em game.svelte.ts mas o import pode estar incorreto.

### 1.3 Header em /games mostra navegação completa
Deveria ser minimalista (só logo + tema + user menu).

### 1.4 Dados não são filtrados por game_id
Items, chat, rolls não estão limitados à mesa atual.

---

## 2. Correções Required

### 2.1 getUserGames filtrado

```typescript
// tables.ts
async getUserGames() {
  const userId = authState.user?.id;
  if (!userId) return [];

  return supabase
    .from('games')
    .select(`
      *,
      user_role:game_members(role)
    `)
    .eq('game_members.user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
}
```

### 2.2 Header Games Minimalista

Adicionar prop ao Header:
```svelte
<Header minimal={isGamesPage} />
```

### 2.3 gameState com game_id

Todas as queries de dados devem filtrar por `game_id`:
```typescript
// Subscribe a items da mesa atual
db.subscribeToItems(currentGameId, callback)

// Subscribe a chat da mesa atual
db.subscribeToChat(currentGameId, callback)
```

---

## 3. Implementação Proposta

### Fase 1: Header Games
- Modificar +layout.svelte para mostrar header em /games
- Modificar Header para aceitar prop `minimal`
- /games usa minimal=true

### Fase 2: Queries Filtradas
- Corrigir getUserGames() para filtrar por membership
- Corrigir todas as subscriptions para usar game_id

### Fase 3: Game Page
- gameState.init(gameId) inicializa com ID da mesa
- Todos os dados carregados são da mesa específica

---

## 4. Testes Required

- [ ] /games mostra apenas minhas mesas
- [ ] /games/[id] carrega dados da mesa correta
- [ ] Cards/Chat/Dados são da mesa atual
- [ ] Header em /games é minimalista
