# Tasks: Arquitetura de Mesas

**SPEC**: `003-game-architecture`  
**Status**: Completed  
**Created**: 2026-04-04

---

## Task 1: Header Games Minimalista

### 1.1 Modificar +layout.svelte
- [x] Mostrar Header em /games
- [x] Adicionar prop `minimal` para rotas específicas

### 1.2 Modificar Header.svelte
- [x] Adicionar prop `minimal = false` por padrão
- [x] Quando minimal=true: só logo + theme + user menu
- [x] UserMenu visível em /games mesmo com minimal=true

### 1.3 games/+page.svelte
- [x] Remover header local (usar global)
- [x] Manter só conteúdo da página

---

## Task 2: getUserGames Filtrado

### 2.1 Corrigir tables.ts
- [x] getUserGames() filtra por `game_members.user_id`
- [x] Excluir mesas com `deleted_at`

---

## Task 3: Game State com game_id

### 3.1 Inicialização
- [x] gameState.setGameId(gameId) recebe ID da mesa
- [x] Todas as subscriptions usam game_id

### 3.2 Queries
- [x] db.subscribeToItems(gameId, callback)
- [x] db.subscribeToChat(gameId, callback)
- [x] db.subscribeToRolls(gameId, callback)

---

## Task 4: Fluxo de Criação e Convite

### 4.1 Criação de Mesa
- [x] CreateGameModal redireciona para /?gameId=
- [x] Limite de 3 mesas verificado

### 4.2 Entrada via Convite
- [x] getGameByInviteCode() implementado
- [x] Verifica se já é membro (alreadyMember)
- [x] Verifica limite de 3 mesas
- [x] Redireciona para /?gameId=

### 4.3 gameState Exports
- [x] getGameByInviteCode exportado
- [x] joinGame exportado
- [x] activeGameId getter
- [x] setActiveGameId método

---

## Task 5: Redirecionamento para Grid

### 5.1 /games/[id]
- [x] Redireciona para /?gameId=[id]
- [x] Página simples com loading

### 5.2 / (root)
- [x] Lê ?gameId= da URL
- [x] Chama gameState.setGameId()
- [x] Exibe header "Mesa Ativa" quando com gameId

---

## Task 6: Testes

### 6.1 Teste Manual
- [x] /games mostra apenas minhas mesas
- [x] /games/[id] redireciona para /?gameId=
- [x] Header em /games é minimalista
- [x] Sem erros no console (funções exportadas)

---

## Definition of Done

- [x] Cada mesa tem dados isolados (via gameId)
- [x] Usuário só vê suas mesas (filtrado por membership)
- [x] /games header minimalista
- [x] Build passa
- [x] SPEC atualizado

---

## Pendências (não escopo deste spec)

- RLS policies por game_id
- UI para configurar permissions por role
- Sistema de "lixeira" com restauração
- Backup/export de mesa

---

## Tarefas Adicionais: Correções de Bugs

### Bug 1: Funções não existem no build de produção (CRÍTICO)
- [x] Substituir factory pattern por classe nativa Svelte 5 com $state()
- [x] Criar gameState.svelte.ts (NOVA ABORDAGEM)
- [x] Atualizar todos os imports
- [x] Build passou

### Bug 2: URL com ?gameId= visível
- [x] Usar history.replaceState() para remover query params
- [x] Fluxo: /games/[id] → / → gameState.setGameId()

### Bug 3: leaveGame deletava mesa incorretamente
- [x] Corrigir lógica de isLastMember (verificar após delete)
- [x] Testar: jogador sai → apenas RemoveMember, não delete

### Bug 4: Jogadores podiam convidar outros
- [x] Adicionar userRole prop em InviteLink
- [x] Verificar role antes de mostrar botão
- [x] Passar userRole em settings/+page.svelte

### Bug 5: FAB não aparecia
- [x] Corrigido junto com outras correções
- [x] Build passou
