# SPEC 003: Arquitetura de Mesas

**Feature Branch**: `003-game-architecture`  
**Created**: 2026-04-04  
**Status**: Draft

---

## 1. Visão Geral

Cada mesa (game) é um **micro cosmos isolado** que pertence a um grupo específico de jogadores. O sistema de mesas do R2PG VTT funciona como um **sistema multi-tenant** onde:

- Uma mesa = um espaço de jogo privado
- Apenas membros convidados podem participar
- Cada mesa tem seus próprios dados: cards, chat, dados, música, whiteboard

---

## 2. Modelo de Dados

### 2.1 Estrutura de Dados por Mesa

| Tabela | Escopo | Descrição |
|--------|--------|-----------|
| `games` | Global | Metadados da mesa (nome, sistema, owner) |
| `game_members` | Global | Relação usuário ↔ mesa |
| `items` | **Por game_id** | Cards/Notas da mesa |
| `chat_messages` | **Por game_id** | Mensagens do chat |
| `dice_rolls` | **Por game_id** | Histórico de rolagens |
| `audio_state` | **Por game_id** | Estado do player de áudio |

### 2.2 Games Table

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  invite_code CHAR(8) UNIQUE NOT NULL,
  sistema TEXT DEFAULT 'RPG Genérico',
  campanha TEXT,
  capa_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Game Members Table

```sql
CREATE TABLE game_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  last_accessed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);
```

---

## 3. Regras de Negócio

### 3.1 Criação de Mesa
- Usuário logado pode criar mesa
- Limite: 3 mesas ativas por usuário
- Ao criar: gera invite_code único (8 caracteres)
- Criador automaticamente vira `narrador`

### 3.2 Convite de Jogadores
- Link de convite: `/join/[invite_code]`
- Ao acessar link:
  - Se não logado → login → redireciona de volta
  - Se logado → entra na mesa como `jogador`
  - Se já é membro → entra normalmente

### 3.3 Permissões por Role

| Ação | Narrador | Assistente | Jogador |
|------|----------|------------|---------|
| Criar card | ✅ | ✅ | ✅ |
| Editar qualquer card | ✅ | ✅ | ❌ |
| Deletar card | ✅ | ✅ | ❌ |
| Ver cards ocultos | ✅ | ✅ | ❌ |
| Rolar dados | ✅ | ✅ | ✅ |
| Enviar chat | ✅ | ✅ | ✅ |
| Configurar mesa | ✅ | ✅ | ❌ |
| Convidar jogadores | ✅ | ✅ | ❌ |
| Remover jogador | ✅ | ✅ | ❌ |
| Deletar mesa | ✅ | ❌ | ❌ |

### 3.4 Cycle de Vida da Mesa

1. **Ativa**: Mesa com membros ativos
2. **Excluída** (soft delete): Narrador clicou "Excluir"
   - Aparece com badge "Excluída"
   - Narrador pode restaurar
   - Jogadores veem opção de sair
3. **Deletada** (hard delete):
   - Último membro saiu
   - Narrador saiu sendo último
   - Dados permanentemente removidos

### 3.5 Auto-Delete

| Cenário | Comportamento |
|---------|---------------|
| Narrador sai (é único) | Mesa vai para "Excluída" |
| Narrador sai (tem outros) | Mesa continua ativa |
| Jogador sai (era único além do narrador) | Mesa deletada permanentemente |
| Jogador sai (muitos membros) | Apenas remove membro |

---

## 4. Queries do Banco

### 4.1 Buscar Mesas do Usuário

```sql
-- OBTER SÓ MESAS ONDE USUÁRIO É MEMBRO
SELECT g.*, gm.role as user_role
FROM games g
INNER JOIN game_members gm ON g.id = gm.game_id
WHERE gm.user_id = 'user-uuid'
  AND g.deleted_at IS NULL
ORDER BY g.created_at DESC;
```

### 4.2 Buscar Itens da Mesa

```sql
-- OBTER SÓ ITENS DA MESA ESPECÍFICA
SELECT * FROM items 
WHERE game_id = 'game-uuid'
ORDER BY created_at ASC;
```

---

## 5. UI/UX

### 5.1 Fluxo de Criação

1. Usuário clica "Criar Mesa"
2. Modal abre com campos: Nome*, Sistema, Campanha, Capa
3. Usuário preenche e confirma
4. Mesa criada com invite_code
5. Redirecionado para `/games/[id]`

### 5.2 Lista de Mesas (/games)

- Mostra apenas mesas onde usuário é membro
- Cards muestran: nome, sistema, data, role do usuário
- Botões: Copiar Link, Deletar (narrador), Sair (jogador)
- Limite de 3 mesas visível

### 5.3 Página da Mesa (/games/[id])

- Header: Nome da mesa, sistema, botões
- Área principal: Cards/Notas da mesa
- Sidebar: Chat, Dados, Música

### 5.4 Header em /games

Minimalista: apenas "R2PG VTT" + Theme Toggle + UserMenu

---

## 6. Questões em Aberto

- [ ] Como implementar sistema de convites com limite?
- [ ] UI para configurar permissions por role?
- [ ] Sistema de "lixeira" com restauração em 3 dias?
- [ ] Backup/export de mesa?

---

## 7. SQL Necessário

> **Status**: ✅ Já adicionado ao banco

```sql
-- Tabelas base (já existem)
-- user_profiles, games, game_members

-- Adicionar colunas extras
ALTER TABLE games ADD COLUMN IF NOT EXISTS invite_code CHAR(8);
ALTER TABLE games ADD COLUMN IF NOT EXISTS campanha TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS capa_url TEXT;

-- Gerar invite_code para mesas existentes
UPDATE games SET invite_code = (
  SELECT string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random() * 24 + 1)::int, 1), ''
  )
  FROM generate_series(1, 8)
) WHERE invite_code IS NULL;
```

---

## 8. Dependências

- Tabelas: `games`, `game_members`, `items`, `chat_messages`, `dice_rolls`, `audio_state`
- Colunas: `game_id` em todas as tabelas de dados
- RLS policies por `game_id`
