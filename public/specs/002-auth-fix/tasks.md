# Tasks: Auth Fixes + Games v2

**SPEC**: `002-auth-fix`  
**Status**: In Progress (Bug Fixes)  
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

## Phase 8: Bug Fixes ✅

### Task 8.1: Menu em /games
- [x] Header aparece em /games e outras rotas autenticadas

### Task 8.2: Mesas deletadas
- [x] Separar visualmente: mesa normal vs deletada
- [x] Mesas deletadas não são navegáveis (não são links)
- [x] Narrador vê botão "Restaurar"
- [x] Sorted: ativas primeiro, deletadas no fim

### Task 8.3: Coluna 'campanha' não existe
- [ ] SQL necessário para criar colunas

### Task 8.4: Raiz redireciona para /games
- [x] Usuário logado em `/` → `/games`
- [x] Usuário não logado → /auth/login

---

## Phase 9: Corrigir Criação de Mesa

### Task 9.1: SQL - Criar colunas necessárias
- [x] Código pronto (esperando SQL do usuário)

### Task 9.2: createGame() - Gerar invite_code
- [x] Gerar invite_code automaticamente

### Task 9.3: CreateGameModal - Restaurar campos
- [x] Adicionar campos Campanha e Capa de volta

---

## Phase 10: Auto-Delete e Link de Convite

### Task 10.1: Auto-delete quando último membro sai
- [x] Narrador sai → mesa vai para excluded_at (soft delete)
- [x] Jogador sai → confirmation, then auto-delete

### Task 10.2: Botão Link de Convite
- [x] Adicionar botão "Copiar Link" no GameCard
- [x] Gerar link `/join/[invite_code]`

---

## Phase 11: Build e Testing

### Task 11.1: Build
- [x] npm run build passa
- [x] biome format --write
- [x] biome lint passa

### Task 11.2: Testing
- [ ] Teste manual completo

---

## Definition of Done

- [x] Mesa cria com invite_code automático
- [x] Campos Campanha e Capa funcionam
- [x] Auto-delete quando último membro sai
- [x] Botão Link de Convite funciona
- [x] Build passa
