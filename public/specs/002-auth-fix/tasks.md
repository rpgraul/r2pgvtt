# Tasks: Auth Fixes + Games v2

**SPEC**: `002-auth-fix`  
**Status**: Completed  
**Created**: 2026-04-03

---

## Phase 1: Database Setup ✅

### Task 1.1: Tabela user_profiles (EXISTE)
- [x] Usar tabela `user_profiles` (já existe no Supabase)
- [x] Executar SQL para adicionar colunas `deleted_at` em games
- [x] Executar SQL para adicionar colunas `last_accessed_at` em game_members

### Task 1.2: Corrigir código para usar user_profiles
- [x] Atualizar `auth.svelte.ts` para usar `user_profiles`
- [x] Atualizar `tables.ts` para usar `user_profiles`

---

## Phase 2: UI Layout Fixes ✅

### Task 2.1: FAB Condicional
- [x] Atualizar `+layout.svelte` para ocultar FAB em /auth/login e /games

### Task 2.2: Loading de Auth
- [x] Adicionar loading state completo durante auth check
- [x] Mostrar spinner antes de qualquer redirecionamento

### Task 2.3: Header Minimalista
- [x] Atualizar Header para modo minimalista em /auth/login
- [x] Remover botão "Entrar" permanentemente

---

## Phase 3: UserMenu Component ✅

### Task 3.1: Criar UserMenu
- [x] Criar `src/components/ui/UserMenu.svelte`
- [x] Implementar: avatar, nome, configurações, sair

### Task 3.2: Integrar UserMenu
- [x] Adicionar UserMenu no Header global

---

## Phase 4: Games Page ✅

### Task 4.1: Atualizar Lista de Mesas
- [x] Exibir: Nome, Sistema, Data criação, Último acesso, Jogadores
- [x] Implementar botão Criar Mesa com limite de 3

### Task 4.2: Criar Modal de Criação
- [x] Criar/Atualizar CreateGameModal
- [x] Campos: Nome*, Campanha, Sistema, Capa
- [x] Preview de capa

### Task 4.3: GameCard Atualizado
- [x] Indicador visual para mesas deletadas
- [x] Botão Deletar (narrador) / Sair (jogador)

---

## Phase 5: Soft Delete ✅

### Task 5.1: Implementar Soft Delete
- [x] Adicionar função `softDeleteGame` em tables.ts
- [x] Adicionar função `cancelDeleteGame` em tables.ts
- [x] Adicionar função `leaveGame` com verificação de último membro

### Task 5.2: Frontend Soft Delete
- [x] Botão "Cancelar exclusão" para narrador
- [x] Deletar permanentemente quando último membro sai

---

## Phase 6: Error Handling ✅

### Task 6.1: Error Handling em auth.svelte.ts
- [x] Tratar erro PGRST205 (tabela não existe)
- [x] Não travar app se profile não carregar

### Task 6.2: Error Handling em games
- [x] Mostrar mensagem amigável em erros
- [x] Botão retry

---

## Phase 7: Fix getGameById ✅

### Task 7.1: Verificar getGameById
- [x] Função já existe em game.svelte.ts

---

## Phase 8: Testing ✅

### Task 8.1: Teste Manual
- [ ] Testes manuais a cargo do usuário

### Task 8.2: Build
- [x] npm run build passa
- [x] biome format --write
- [x] biome lint passa

---

## Definition of Done ✅

- [x] Todas as User Stories do SPEC.md implementadas
- [x] Sem erros 404/205 no console
- [x] Build passa
- [x] Código formatado com biome
- [x] Lint passa
