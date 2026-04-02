# Tasks: Auth + Games Flow

**SPEC**: `001-auth-and-games`  
**Status**: Ready for Implementation  
**Created**: 2026-04-02

---

## Phase 1: Setup (Frontend)

### Task 1.1: Instalar Dependências
- [ ] Executar `npm install @supabase/supabase-js`
- [ ] Atualizar `.env` com `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY`

### Task 1.2: Configurar Supabase Client
- [ ] Criar `src/lib/supabase/client.ts`
- [ ] Exportar cliente Supabase configurado

### Task 1.3: Configurar Supabase Server (OAuth Callback)
- [ ] Criar `src/lib/supabase/server.ts` (se necessário para server-side)

---

## Phase 2: Auth State

### Task 2.1: Refatorar auth.svelte.ts
- [ ] Implementar `createAuthState()` com Supabase
- [ ] Adicionar métodos: `signInWithGoogle`, `signInWithEmail`, `signUp`, `signOut`
- [ ] Adicionar getters: `user`, `profile`, `isAuthenticated`, `role`
- [ ] Implementar `init()` e `destroy()` lifecycle

### Task 2.2: OAuth Callback Route
- [ ] Criar `src/routes/auth/callback/+server.ts`
- [ ] Processar callback do OAuth
- [ ] Redirecionar para dashboard após sucesso

---

## Phase 3: Auth UI

### Task 3.1: Login Page
- [ ] Criar `src/routes/auth/login/+page.svelte`
- [ ] Layout sem header (página de auth)

### Task 3.2: OAuth Button
- [ ] Criar `src/components/auth/OAuthButton.svelte`
- [ ] Estilizar com Google branding

### Task 3.3: Auth Forms
- [ ] Criar `src/components/auth/LoginForm.svelte`
- [ ] Criar `src/components/auth/RegisterForm.svelte`
- [ ] Toggle entre login/registro

### Task 3.4: Atualizar Header
- [ ] Adicionar botões de Login/Logout no Header
- [ ] Mostrar nome do usuário quando logado

---

## Phase 4: Games Dashboard

### Task 4.1: Games Page
- [ ] Criar `src/routes/games/+page.svelte`
- [ ] Carregar mesas do usuário via Supabase
- [ ] Exibir grid de `GameCard`

### Task 4.2: Game Card Component
- [ ] Criar `src/components/games/GameCard.svelte`
- [ ] Mostrar nome, sistema, data
- [ ] Botão de acesso à mesa

### Task 4.3: Create Game Modal
- [ ] Criar `src/components/games/CreateGameModal.svelte`
- [ ] Input para nome da mesa
- [ ] Chamar `create_game_with_owner()` RPC
- [ ] Verificar limite de 3 mesas

---

## Phase 5: Join via Invite

### Task 5.1: Join Page
- [ ] Criar `src/routes/join/[invite_code]/+page.svelte`
- [ ] Verificar se usuário está autenticado
- [ ] Verificar limite de 3 mesas

### Task 5.2: Join Logic
- [ ] Buscar game por invite_code
- [ ] Inserir em `game_members` com role 'jogador'
- [ ] Redirecionar para `/games/[id]`

---

## Phase 6: Game Page & Settings

### Task 6.1: Game Page
- [ ] Criar `src/routes/games/[id]/+page.svelte`
- [ ] Verificar se usuário é membro
- [ ] Mostrar informações da mesa

### Task 6.2: Invite Link Component
- [ ] Criar `src/components/games/InviteLink.svelte`
- [ ] Copiar link `/join/[invite_code]` para clipboard

### Task 6.3: Member List
- [ ] Criar `src/components/games/MemberList.svelte`
- [ ] Listar membros com roles
- [ ] Botões de ação (remover) para narrador/assistente

### Task 6.4: Settings Page
- [ ] Criar `src/routes/games/[id]/settings/+page.svelte`
- [ ] Form para editar: nome, sistema, moeda
- [ ] Proteger rota (narrador/assistente apenas)

### Task 6.5: Leave Game
- [ ] Implementar "Sair da Mesa" para jogadores
- [ ] Narrador não pode sair (mostrar warning)

---

## Phase 7: Integration

### Task 7.1: Protected Routes
- [ ] Middleware ou layout para proteger rotas `/games/*`
- [ ] Redirecionar para `/auth/login` se não autenticado

### Task 7.2: Update Layout
- [ ] Inicializar `authState` no `+layout.svelte`
- [ ] Mostrar/ocultar elementos baseado no auth state

---

## Phase 8: Database Setup (SQL)

> **Nota**: Estas tarefas precisam ser executadas no Supabase Dashboard > SQL Editor

### Task 8.1: Create Tables
- [ ] Executar SQL de criação de `profiles`
- [ ] Executar SQL de criação de `games`
- [ ] Executar SQL de criação de `game_members`

### Task 8.2: Create Functions
- [ ] Executar `generate_invite_code()`
- [ ] Executar `create_game_with_owner()`
- [ ] Executar `can_join_game()`

### Task 8.3: Setup RLS
- [ ] Habilitar RLS em todas as tabelas
- [ ] Criar policies conforme plan.md

### Task 8.4: Setup Triggers
- [ ] Criar trigger `handle_new_user()` para auto-criar profile

### Task 8.5: Configure Google OAuth
- [ ] No Supabase Dashboard > Authentication > Providers > Google
- [ ] Adicionar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- [ ] Configurar redirect URL

---

## Phase 9: Cleanup

### Task 9.1: Remover Firebase Auth (futuro)
- [ ] Manter Firebase configurado por enquanto
- [ ] Remover quando Supabase estiver 100% funcional

### Task 9.2: Documentation
- [ ] Atualizar `docs/migration/001-firebase-to-supabase.md`
- [ ] Adicionar ADR se necessário

---

## Definition of Done

- [ ] Todas as User Stories do SPEC.md implementadas
- [ ] Critérios de aceite SC-001 a SC-006 cumpridos
- [ ] Código formata com `biome format --write`
- [ ] Lint passa com `biome lint`
- [ ] Testes manuais realizados
- [ ] Sem `console.log` ou debug code

---

## Priority Order

```
P1 (Crítico):
├── Task 1.1, 1.2 - Setup
├── Task 2.1, 2.2 - Auth State + OAuth
├── Task 3.1-3.3 - Auth UI
├── Task 4.1-4.3 - Games Dashboard
└── Task 5.1, 5.2 - Join via Invite

P2 (Importante):
├── Task 6.1-6.5 - Game Page & Settings
└── Task 7.1, 7.2 - Integration

P3 (Nice to have):
├── Task 9.1, 9.2 - Cleanup
└── Task 8.1-8.5 - Database Setup (pode ser paralelo)
```
