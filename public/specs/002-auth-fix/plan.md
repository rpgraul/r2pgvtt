# Plan: Auth Fixes + Games v2

**SPEC**: `002-auth-fix`  
**Status**: Ready for Implementation  
**Created**: 2026-04-03

---

## 1. Análise dos Problemas

### 1.1 Erro de Tabela (PGRST205)

```
Could not find the table 'public.profiles' in the schema cache
```

**Causa**: Tabela `profiles` não existe no Supabase ou schema cache desatualizado.

**Solução**:
1. Verificar se tabela existe
2. Se não existir, criar schema SQL
3. Verificar trigger `handle_new_user`

### 1.2 getGameById is not a function

**Causa**: Função não existe ou mal importada.

**Solução**: Verificar game.svelte.ts para função getGameById

### 1.3 Loading durante auth check

**Causa**: Redirecionamento após render, causando flicker.

**Solução**: Mostrar loading completo antes de decidir rota.

---

## 2. Tarefas de Banco de Dados

### 2.1 Verificar/Criar Tabelas

```sql
-- Verificar se profiles existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);

-- Se não existir, criar:
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar deleted_at em games
ALTER TABLE games ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Adicionar last_accessed_at em game_members
ALTER TABLE game_members ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;
```

### 2.2 Verificar Trigger

```sql
-- Verificar trigger
SELECT tgname FROM pg_trigger WHERE tgrelid = 'profiles'::regclass;

-- Se não existir, criar:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 3. Correções de UI

### 3.1 FAB Condicional (+layout.svelte)

```svelte
// Ocultar FAB em rotas específicas
const hideFabRoutes = ['/auth/login', '/games', '/join'];
const showFab = $derived(!hideFabRoutes.some(r => currentPath.startsWith(r)));
```

### 3.2 Loading de Auth (+layout.svelte)

```svelte
// Mostrar loading durante auth check
let showAuthLoading = $derived(authState.isLoading);

// Se mostrando loading, renderizar só isso
{#if showAuthLoading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
  </div>
{:else}
  <!-- rest of app -->
{/if}
```

### 3.3 Header Minimalista (Header.svelte)

```svelte
// Em /auth/login, só mostrar logo + theme toggle
const minimalHeader = $derived(currentPath === '/auth/login');
```

### 3.4 UserMenu Component

Criar `src/components/ui/UserMenu.svelte` com:
- Avatar (ou placeholder)
- Nome do usuário
- Link configurações
- Botão sair

---

## 4. Correções de Games

### 4.1 /games/+page.svelte

- Remover FAB (já coberto em 3.1)
- Adicionar UserMenu no header
- Mostrar: Nome, Sistema, Data criação, Último acesso, Jogadores
- Botão criar/desabilitado com tooltip

### 4.2 CreateGameModal

- Campos: Nome*, Campanha, Sistema, Capa
- Preview de capa 100x100
- Chamada RPC para criar

### 4.3 Soft Delete

```typescript
// db.softDeleteGame(gameId)
await supabase.from('games').update({ deleted_at: new Date() }).eq('id', gameId);

// db.cancelDeleteGame(gameId)  
await supabase.from('games').update({ deleted_at: null }).eq('id', gameId);

// db.leaveGame(gameId) - verifica último membro
const { data: members } = await supabase.from('game_members').select('id').eq('game_id', gameId);
if (members.length === 1) {
  await supabase.from('games').delete().eq('id', gameId);
}
```

### 4.4 GameCard

- Exibir campos completos
- Indicador visual para mesas deletadas
- Botão "Deletar" (narrador) ou "Sair" (jogador)

---

## 5. Error Handling

### 5.1 auth.svelte.ts

```typescript
async function loadProfile() {
  if (!user) return;
  try {
    const { data, error } = await supabase...
    if (error?.code === 'PGRST116') {
      await createProfile();
    } else if (error?.code === 'PGRST205') {
      console.error('Tabela profiles não existe');
      profile = null; // não trava
    }
  } catch (e) {
    console.error('Error loading profile:', e);
    profile = null;
  }
}
```

---

## 6. Testing

- [ ] /auth/login sem FAB
- [ ] /games sem FAB  
- [ ] Loading antes de redirecionar
- [ ] Header login minimalista
- [ ] UserMenu funcionando
- [ ] Lista de mesas completa
- [ ] Criar mesa com capa
- [ ] Soft delete
- [ ] Sem erros 404/205

---

## 7. Dependencies

- Nenhuma dependência externa nova
- Componentes UI já existentes
