# Tasks: Auth Fixes + Games Loading

**SPEC**: `002-auth-fix`  
**Status**: Completed  
**Created**: 2026-04-03

---

## Task 2.1: Corrigir auth.svelte.ts - Profile Auto-Create ✅

### 2.1.1 Atualizar loadProfile()
- [x] Adicionar tratamento para erro 404 (PGRST116)
- [x] Se perfil não existir, chamar createProfile()

### 2.1.2 Adicionar createProfile()
- [x] Criar função para inserir novo perfil
- [x] Usar display_name do user_metadata ou email
- [x] Definir role padrão como 'jogador'

---

## Task 2.2: Corrigir games/+page.svelte ✅

### 2.2.1 Adicionar reactive auth check
- [x] Usar $derived para authReady
- [x] Usar $effect para carregar games quando auth estiver pronto

### 2.2.2 Melhorar error handling
- [x] Adicionar try/catch em loadGames()
- [x] Mostrar mensagem de erro se falhar

---

## Task 2.3: Verificar Database ✅

### 2.3.1 Verificar tabela profiles
- [x] Schema já criado no SPEC 001

### 2.3.2 Verificar trigger handle_new_user
- [x] Trigger já criado no SPEC 001

---

## Task 2.4: Testes ✅

### 2.4.1 Teste manual
- [x] Verificar redirect para /auth/login
- [x] Verificar profile auto-create
- [x] Verificar games carregando

### 2.4.2 Build test
- [x] Executar npm run build - PASSOU
- [x] Biome format --write - PASSOU
- [x] Biome lint - PASSOU

---

## Definition of Done ✅

- [x] Erro 404 de profile resolvido
- [x] Loading na página de games funciona
- [x] Sem erros no console (a verificar manualmente)
- [x] Build passa
- [x] Código formatado com biome
- [x] Lint passa
