# Plan: Auth Fixes + Games Loading

**SPEC**: `002-auth-fix`  
**Status**: Ready for Implementation  
**Created**: 2026-04-03

---

## 1. Análise do Problema

### 1.1 Erro 404 no Perfil

```
GET /profiles?select=*&id=eq.c143312a-512c-44f8-8b70-af4e6fe309d5
404 (Not Found)
```

**Causa**: O trigger `handle_new_user()` não criou o perfil ou a tabela não existe.

**Solução**: Modificar `auth.svelte.ts` para:
1. Tentar carregar perfil
2. Se 404, criar perfil automaticamente

### 1.2 Loading Infinito

**Causa**: `games/+page.svelte` chama `db.getUserGames()` antes de `authState` estar pronto.

**Solução**: Usar reactive wait para authState.isLoading

---

## 2. Correções

### 2.1 auth.svelte.ts

```typescript
async function loadProfile() {
  if (!user) return;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error?.code === 'PGRST116') {
    // Perfil não existe, criar automaticamente
    await createProfile();
  } else if (error) {
    console.error('Error loading profile:', error);
  } else {
    profile = data;
  }
}

async function createProfile() {
  if (!user) return;
  
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuário';
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: displayName,
      role: 'jogador'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating profile:', error);
  } else {
    profile = data;
  }
}
```

### 2.2 games/+page.svelte

```svelte
<script lang="ts">
import { authState } from '$lib/state/auth.svelte';
import { onMount } from 'svelte';
import { db } from '$lib/supabase/tables';
import GameList from '$components/games/GameList.svelte';
import { LogOut, User } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import { goto } from '$app/navigation';

let isLoading = $state(true);
let games = $state([]);
let authReady = $derived(!authState.isLoading && authState.isAuthenticated);

// Watch for auth ready
$effect(() => {
  if (authReady) {
    loadGames();
  }
});

async function loadGames() {
  try {
    games = await db.getUserGames();
  } catch (err) {
    console.error('Error loading games:', err);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (!authState.isAuthenticated && !authState.isLoading) {
    goto('/auth/login');
  }
});

async function handleLogout() {
  await authState.signOut();
  await goto('/');
}
</script>
```

---

## 3. Verificações Adicionais

### 3.1 Verificar se tabela profiles existe

Executar no Supabase SQL Editor:

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);
```

Se não existir, executar o schema do SPEC 001.

### 3.2 Verificar trigger

```sql
SELECT tgname, tgrelid::regclass, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'profiles'::regclass;
```

---

## 4. Testing

- [ ] Acessar `/games` sem login → redirect para `/auth/login`
- [ ] Fazer login → perfil criado automaticamente
- [ ] Acessar `/games` → jogos carregados
- [ ] Sem erros 404 no console

---

## 5. Dependencies

Nenhuma dependência externa nova necessária.
