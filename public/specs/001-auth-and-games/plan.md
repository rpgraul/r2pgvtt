# Plan: Auth + Games Flow

**SPEC**: `001-auth-and-games`  
**Status**: Approved  
**Created**: 2026-04-02

---

## 1. Stack Técnica

### 1.1 Dependências a Instalar

```bash
npm install @supabase/supabase-js
npm install -D @types/node
```

### 1.2 Variáveis de Ambiente

Adicionar ao `.env`:

```env
PUBLIC_SUPABASE_URL=https://ptqfvtydezkgosvbocxd.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Ja9cNySOn42Q_1W8ctC-yA_KIjfajvg
```

### 1.3 Schema SQL (Supabase)

```sql
-- Profiles (extensão do auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code CHAR(8) UNIQUE NOT NULL,
  sistema TEXT DEFAULT 'RPG Genérico',
  moeda_padrao TEXT DEFAULT 'moedas de ouro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Members
CREATE TABLE game_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Functions
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS CHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code CHAR(8) := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * 8 + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_game_with_owner(
  p_nome TEXT,
  p_owner_id UUID
) RETURNS UUID AS $$
DECLARE
  v_game_id UUID;
  v_invite_code CHAR(8);
BEGIN
  v_invite_code := generate_invite_code();
  
  INSERT INTO games (nome, owner_id, invite_code)
  VALUES (p_nome, p_owner_id, v_invite_code)
  RETURNING id INTO v_game_id;
  
  INSERT INTO game_members (game_id, user_id, role)
  VALUES (v_game_id, p_owner_id, 'narrador');
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_members ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário vê/edita apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games: membros da mesa veem a mesa
CREATE POLICY "Members can view games" ON games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = games.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update games" ON games
  FOR UPDATE USING (owner_id = auth.uid());

-- Game Members: membros veem lista de membros
CREATE POLICY "Members can view members" ON game_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_members gm2
      WHERE gm2.game_id = game_members.game_id AND gm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Narradores can manage members" ON game_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members gm2
      WHERE gm2.game_id = game_members.game_id 
        AND gm2.user_id = auth.uid()
        AND gm2.role IN ('narrador', 'assistente')
    )
  );

-- Trigger para criar profile automaticamente
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

## 2. Arquitetura Frontend

### 2.1 Estrutura de Arquivos

```
src/lib/supabase/
├── client.ts           # Cliente Supabase browser
├── server.ts          # Cliente Supabase server (se precisar)
└── types.ts           # Tipos TypeScript

src/routes/
├── auth/
│   ├── login/+page.svelte
│   └── callback/+server.ts     # OAuth callback
├── games/
│   ├── +page.svelte            # Dashboard
│   ├── +page.server.ts         # Load games
│   ├── [id]/
│   │   ├── +page.svelte        # Game page
│   │   ├── +page.server.ts
│   │   └── settings/
│   │       └── +page.svelte
│   └── create/+page.svelte     # Create game modal
├── join/
│   └── [invite_code]/
│       ├── +page.svelte
│       └── +page.server.ts
└── (auth)/                     # Layout group para rotas auth
    └── +layout.svelte

src/components/
├── auth/
│   ├── LoginForm.svelte
│   ├── RegisterForm.svelte
│   └── OAuthButton.svelte
├── games/
│   ├── GameCard.svelte
│   ├── GameList.svelte
│   ├── CreateGameModal.svelte
│   ├── InviteLink.svelte
│   └── MemberList.svelte
└── ui/
    └── (existing components)
```

### 2.2 State Management

Refatorar `auth.svelte.ts`:

```typescript
// src/lib/state/auth.svelte.ts
import { createClient } from '$lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

function createAuthState() {
  let user = $state<User | null>(null);
  let session = $state<Session | null>(null);
  let profile = $state<Profile | null>(null);
  let isLoading = $state(true);

  const supabase = createClient();

  async function init() {
    isLoading = true;
    
    const { data } = await supabase.auth.getSession();
    session = data.session;
    user = data.session?.user ?? null;
    
    if (user) {
      await loadProfile();
    }
    
    isLoading = false;

    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session = newSession;
      user = newSession?.user ?? null;
      
      if (user && event === 'SIGNED_IN') {
        await loadProfile();
      } else if (event === 'SIGNED_OUT') {
        profile = null;
      }
    });
  }

  async function loadProfile() {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function destroy() {
    // Cleanup if needed
  }

  return {
    get user() { return user; },
    get profile() { return profile; },
    get isLoading() { return isLoading; },
    get isAuthenticated() { return !!user; },
    get role() { return profile?.role ?? 'jogador'; },
    init,
    destroy,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut
  };
}

export const authState = createAuthState();
```

---

## 3. Fluxos Principais

### 3.1 Login com Google OAuth

```
User → /auth/login → Google OAuth → /auth/callback → Dashboard
```

### 3.2 Criar Mesa

```
Dashboard → "Criar Mesa" → Modal → create_game_with_owner() → /games/[id]
```

### 3.3 Entrar via Convite

```
/join/[invite_code] → Verificar limite → Verificar auth → game_members INSERT → Redirect
```

---

## 4. Componentes UI

### 4.1 Login Page (`/auth/login`)

- Botão "Entrar com Google" (OAuth)
- Form: Email + Senha + Submit
- Toggle: Login / Criar Conta
- Link para recuperação de senha

### 4.2 Game Dashboard (`/games`)

- Grid de `GameCard`
- Botão "Criar Mesa" (desabilitado se >= 3 mesas)
- `CreateGameModal` com campo de nome

### 4.3 Game Page (`/games/[id]`)

- Header com nome da mesa
- Botão "Compartilhar" → `InviteLink`
- Lista de membros (`MemberList`)
- Link para `/games/[id]/settings` (se narrador/assistente)

### 4.4 Settings (`/games/[id]/settings`)

- Campos: Nome, Sistema, Moeda Padrão
- `MemberList` com ações de remoção
- Botão "Sair da Mesa" (se não for narrador)

---

## 5. Validações

### 5.1 Limite de 3 Mesas

Verificar no frontend e backend:

```sql
-- Function para verificar limite
CREATE OR REPLACE FUNCTION can_join_game(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) < 3
    FROM game_members
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 Autorização de Roles

| Ação | narrador | assistente | jogador |
|------|----------|------------|---------|
| Ver configurações | ✅ | ✅ | ❌ |
| Editar configurações | ✅ | ✅ | ❌ |
| Remover membro | ✅ (qualquer) | ✅ (só jogador) | ❌ |
| Sair da mesa | ❌ | ✅ | ✅ |

---

## 6. Dependências Entre Tarefas

```
1. Install @supabase/supabase-js
   ↓
2. Create supabase/client.ts
   ↓
3. Refactor auth.svelte.ts
   ↓
4. Create OAuth callback route
   ↓
5. Create /auth/login page
   ↓
6. Create /games page + GameCard
   ↓
7. Create CreateGameModal
   ↓
8. Create /join/[invite_code] route
   ↓
9. Create /games/[id] page
   ↓
10. Create /games/[id]/settings page
```

---

## 7. Testing Checklist

- [ ] Google OAuth login funciona
- [ ] Email/password login funciona
- [ ] Criar conta com display name
- [ ] Dashboard mostra apenas mesas do usuário
- [ ] Criar mesa gera invite_code único
- [ ] Link de convite funciona
- [ ] Limite de 3 mesas é enforced
- [ ] Usuário não logado é redirecionado para login
- [ ] Jogador não acessa settings
- [ ] Narrador consegue remover membros
- [ ] Jogador consegue sair da mesa
