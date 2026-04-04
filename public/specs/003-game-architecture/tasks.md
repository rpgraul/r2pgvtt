# Tasks: Arquitetura de Mesas

**SPEC**: `003-game-architecture`  
**Status**: Draft  
**Created**: 2026-04-04

---

## Task 1: Header Games Minimalista

### 1.1 Modificar +layout.svelte
- [ ] Mostrar Header em /games (currently excluded)
- [ ] Adicionar prop `minimal` para rotas específicas

### 1.2 Modificar Header.svelte
- [ ] Adicionar prop `minimal = false` por padrão
- [ ] Quando minimal=true: só logo + theme + user menu

### 1.3 games/+page.svelte
- [ ] Remover header local (usar global)
- [ ] Manter só conteúdo da página

---

## Task 2: getUserGames Filtrado

### 2.1 Corrigir tables.ts
- [ ] getUserGames() filtra por `game_members.user_id`
- [ ] Excluir mesas com `deleted_at`

---

## Task 3: Game State com game_id

### 3.1 Inicialização
- [ ] gameState.init(gameId) recebe ID da mesa
- [ ] Todas as subscriptions usam game_id

### 3.2 Queries
- [ ] db.subscribeToItems(gameId, callback)
- [ ] db.subscribeToChat(gameId, callback)
- [ ] db.subscribeToRolls(gameId, callback)

---

## Task 4: Game Page Loading

### 4.1 Corrigir getGameById
- [ ] Verificar se função está sendo exportada corretamente
- [ ] Ou mover para tables.ts como db.getGameById()

---

## Task 5: Testes

### 5.1 Teste Manual
- [ ] /games mostra apenas minhas mesas
- [ ] /games/[id] carrega dados da mesa correta
- [ ] Header em /games é minimalista
- [ ] Sem erros no console

---

## Definition of Done

- [ ] Cada mesa tem dados isolados
- [ ] Usuário só vê suas mesas
- [ ] /games header minimalista
- [ ] Build passa
