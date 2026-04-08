# Tasks: Auth + Games Flow

**SPEC**: `001-auth-and-games`  
**Status**: Completed  
**Created**: 2026-04-02
**Updated**: 2026-04-03

---

## Phase 1: Setup (Frontend) ✅

### Task 1.1: Instalar Dependências
- [x] Executar `npm install @supabase/supabase-js`
- [x] Atualizar `.env` com `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY`

### Task 1.2: Configurar Supabase Client
- [x] Criar `src/lib/supabase/client.ts`
- [x] Exportar cliente Supabase configurado

### Task 1.3: Configurar Supabase Server (OAuth Callback)
- [x] Criar `src/lib/supabase/server.ts` (se necessário para server-side)

---

## Phase 2: Auth State ✅

### Task 2.1: Refatorar auth.svelte.ts
- [x] Implementar `createAuthState()` com Supabase
- [x] Adicionar métodos: `signInWithGoogle`, `signInWithEmail`, `signUp`, `signOut`
- [x] Adicionar getters: `user`, `profile`, `isAuthenticated`, `role`
- [x] Implementar `init()` e `destroy()` lifecycle

### Task 2.2: OAuth Callback Route
- [x] Criar `src/routes/auth/callback/+server.ts`
- [x] Processar callback do OAuth
- [x] Redirecionar para dashboard após sucesso

---

## Phase 3: Auth UI ✅

### Task 3.1: Login Page
- [x] Criar `src/routes/auth/login/+page.svelte`
- [x] Layout sem header (página de auth)

### Task 3.2: OAuth Button
- [x] Criar `src/components/auth/OAuthButton.svelte`
- [x] Estilizar com Google branding

### Task 3.3: Auth Forms
- [x] Criar `src/components/auth/LoginForm.svelte`
- [x] Criar `src/components/auth/RegisterForm.svelte`
- [x] Toggle entre login/registro

### Task 3.4: Atualizar Header
- [x] Adicionar botões de Login/Logout no Header
- [x] Mostrar nome do usuário quando logado

---

## Phase 4: Games Dashboard ✅

### Task 4.1: Games Page
- [x] Criar `src/routes/games/+page.svelte`
- [x] Carregar mesas do usuário via Supabase
- [x] Exibir grid de `GameCard`

### Task 4.2: Game Card Component
- [x] Criar `src/components/games/GameCard.svelte`
- [x] Mostrar nome, sistema, data
- [x] Botão de acesso à mesa

### Task 4.3: Create Game Modal
- [x] Criar `src/components/games/CreateGameModal.svelte`
- [x] Input para nome da mesa
- [x] Chamar `create_game_with_owner()` RPC
- [x] Verificar limite de 3 mesas

---

## Phase 5: Join via Invite ✅

### Task 5.1: Join Page
- [x] Criar `src/routes/join/[invite_code]/+page.svelte`
- [x] Verificar se usuário está autenticado
- [x] Verificar limite de 3 mesas

### Task 5.2: Join Logic
- [x] Buscar game por invite_code
- [x] Inserir em `game_members` com role 'jogador'
- [x] Redirecionar para `/games/[id]`

---

## Phase 6: Game Page & Settings ✅

### Task 6.1: Game Page
- [x] Criar `src/routes/games/[id]/+page.svelte`
- [x] Verificar se usuário é membro
- [x] Mostrar informações da mesa

### Task 6.2: Invite Link Component
- [x] Criar `src/components/games/InviteLink.svelte`
- [x] Copiar link `/join/[invite_code]` para clipboard

### Task 6.3: Member List
- [x] Criar `src/components/games/MemberList.svelte`
- [x] Listar membros com roles
- [x] Botões de ação (remover) para narrador/assistente

### Task 6.4: Settings Page
- [x] Criar `src/routes/games/[id]/settings/+page.svelte`
- [x] Form para editar: nome, sistema, moeda
- [x] Proteger rota (narrador/assistente apenas)

### Task 6.5: Leave Game
- [x] Implementar "Sair da Mesa" para jogadores
- [x] Narrador não pode sair (mostrar warning)

---

## Phase 7: Integration ✅

### Task 7.1: Protected Routes
- [x] Middleware ou layout para proteger rotas `/games/*`
- [x] Redirecionar para `/auth/login` se não autenticado

### Task 7.2: Update Layout
- [x] Inicializar `authState` no `+layout.svelte`
- [x] Mostrar/ocultar elementos baseado no auth state

---

## Phase 8: Database Setup (SQL) ✅

> **Nota**: Estas tarefas foram executadas no Supabase Dashboard > SQL Editor

### Task 8.1: Create Tables
- [x] Executar SQL de criação de `profiles`
- [x] Executar SQL de criação de `games`
- [x] Executar SQL de criação de `game_members`

### Task 8.2: Create Functions
- [x] Executar `generate_invite_code()`
- [x] Executar `create_game_with_owner()`
- [x] Executar `can_join_game()`

### Task 8.3: Setup RLS
- [x] Habilitar RLS em todas as tabelas
- [x] Criar policies conforme plan.md

### Task 8.4: Setup Triggers
- [x] Criar trigger `handle_new_user()` para auto-criar profile

### Task 8.5: Configure Google OAuth
- [x] No Supabase Dashboard > Authentication > Providers > Google
- [x] Adicionar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- [x] Configurar redirect URL

---

## Phase 9: Cleanup ✅

### Task 9.1: Remover Firebase Auth (futuro)
- [x] Firebase não estava sendo usado no frontend (já removido implicitamente)
- [x] Manter configuração por enquanto

### Task 9.2: Documentation
- [x] Atualizar `docs/migration/001-firebase-to-supabase.md`
- [ ] Adicionar ADR se necessário

---

## Definition of Done ✅

- [x] Todas as User Stories do SPEC.md implementadas
- [x] Critérios de aceite SC-001 a SC-006 cumpridos
- [x] Código formata com `biome format --write`
- [x] Lint passa com `biome lint`
- [x] Testes manuais realizados
- [x] Sem `console.log` ou debug code

---

## Priority Order

```
P1 (Crítico): ✅ COMPLETO
├── Task 1.1, 1.2 - Setup
├── Task 2.1, 2.2 - Auth State + OAuth
├── Task 3.1-3.3 - Auth UI
├── Task 4.1-4.3 - Games Dashboard
└── Task 5.1, 5.2 - Join via Invite

P2 (Importante): ✅ COMPLETO
├── Task 6.1-6.5 - Game Page & Settings
└── Task 7.1, 7.2 - Integration

P3 (Nice to have): ⏳ PENDENTE
├── Task 9.1, 9.2 - Cleanup
└── Task 8.1-8.5 - Database Setup (✅ COMPLETO)
```
