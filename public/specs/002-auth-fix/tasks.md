# Tasks: Auth Fixes + Games v2

**SPEC**: `002-auth-fix`  
**Status**: In Progress  
**Created**: 2026-04-03

---

## Phase 1: Database Setup

### Task 1.1: Verificar/Criar Tabela profiles
- [ ] Executar query para verificar se tabela existe
- [ ] Se não existir, executar SQL de criação
- [ ] Executar SQL para adicionar colunas `deleted_at` em games
- [ ] Executar SQL para adicionar colunas `last_accessed_at` em game_members

### Task 1.2: Verificar/Recriar Trigger
- [ ] Verificar se trigger `handle_new_user` existe
- [ ] Se não existir, criar trigger

---

## Phase 2: UI Layout Fixes

### Task 2.1: FAB Condicional
- [ ] Atualizar `+layout.svelte` para ocultar FAB em /auth/login e /games

### Task 2.2: Loading de Auth
- [ ] Adicionar loading state completo durante auth check
- [ ] Mostrar spinner antes de qualquer redirecionamento

### Task 2.3: Header Minimalista
- [ ] Atualizar Header para modo minimalista em /auth/login
- [ ] Remover botão "Entrar" permanentemente

---

## Phase 3: UserMenu Component

### Task 3.1: Criar UserMenu
- [ ] Criar `src/components/ui/UserMenu.svelte`
- [ ] Implementar: avatar, nome, configurações, sair

### Task 3.2: Integrar UserMenu
- [ ] Adicionar UserMenu no header de /games

---

## Phase 4: Games Page

### Task 4.1: Atualizar Lista de Mesas
- [ ] Exibir: Nome, Sistema, Data criação, Último acesso, Jogadores
- [ ] Implementar botão Criar Mesa com limite de 3

### Task 4.2: Criar Modal de Criação
- [ ] Criar/Atualizar CreateGameModal
- [ ] Campos: Nome*, Campanha, Sistema, Capa
- [ ] Preview de capa 100x100

### Task 4.3: GameCard Atualizado
- [ ] Indicador visual para mesas deletadas
- [ ] Botão Deletar (narrador) / Sair (jogador)

---

## Phase 5: Soft Delete

### Task 5.1: Implementar Soft Delete
- [ ] Adicionar função `softDeleteGame` em tables.ts
- [ ] Adicionar função `cancelDeleteGame` em tables.ts
- [ ] Adicionar função `leaveGame` com verificação de último membro

### Task 5.2: Frontend Soft Delete
- [ ] Botão "Cancelar exclusão" para narrador
- [ ] Deletar permanentemente quando último membro sai

---

## Phase 6: Error Handling

### Task 6.1: Error Handling em auth.svelte.ts
- [ ] Tratar erro PGRST205 (tabela não existe)
- [ ] Não travar app se profile não carregar

### Task 6.2: Error Handling em games
- [ ] Mostrar mensagem amigável em erros
- [ ] Botão retry

---

## Phase 7: Fix getGameById

### Task 7.1: Verificar getGameById
- [ ] Verificar se função existe em game.svelte.ts
- [ ] Se não existir, implementar ou remover referência

---

## Phase 8: Testing

### Task 8.1: Teste Manual
- [ ] /auth/login sem FAB
- [ ] /games sem FAB
- [ ] Loading antes de redirecionar
- [ ] Header login minimalista
- [ ] UserMenu funcionando
- [ ] Lista de mesas completa
- [ ] Criar mesa com capa
- [ ] Soft delete
- [ ] Sem erros no console

### Task 8.2: Build
- [ ] npm run build passa
- [ ] biome format --write
- [ ] biome lint passa

---

## Definition of Done

- [ ] Todas as User Stories do SPEC.md implementadas
- [ ] Sem erros 404/205 no console
- [ ] Build passa
- [ ] Código formatado com biome
- [ ] Lint passa
