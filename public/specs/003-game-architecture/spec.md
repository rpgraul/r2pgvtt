# SPEC 003: Arquitetura de Mesas

**Feature Branch**: `003-game-architecture`  
**Created**: 2026-04-04  
**Status**: Partially Implemented

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
- [x] Usuário logado pode criar mesa
- [x] Limite: 3 mesas ativas por usuário
- [x] Ao criar: gera invite_code único (8 caracteres)
- [x] Criador automaticamente vira `narrador`

### 3.2 Convite de Jogadores
- [x] Link de convite: `/join/[invite_code]`
- [x] Ao acessar link:
  - Se não logado → login → redireciona de volta
  - Se já é membro → redireciona para `/`
  - Se não é membro + limite disponível → entra na mesa como `jogador`
  - Se limite atingido → mostra erro

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

## 5. Arquitetura de Rotas

### 5.1 Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Grid principal - contexto global ou por mesa via `?gameId=` |
| `/?gameId=XXX` | Grid com dados da mesa específica |
| `/games` | Lista de mesas do usuário |
| `/games/[id]` | Redireciona para `/?gameId=[id]` |
| `/games/[id]/settings` | Configurações da mesa |
| `/join/[invite_code]` | Tela de entrada via convite |

### 5.2 Fluxo de Criação

1. Usuário clica "Criar Mesa"
2. Modal abre com campos: Nome*, Sistema, Campanha, Capa
3. Usuário preenche e confirma
4. Mesa criada com invite_code
5. Redirecionado para `/?gameId=[id]`

### 5.3 Fluxo de Convite

1. Usuário acessa `/join/[invite_code]`
2. Se não logado → redireciona para `/auth/login?redirect_to=/join/XXX`
3. Se logado:
   - Verifica se já é membro → redireciona para `/?gameId=[id]`
   - Verifica limite de 3 mesas
   - Se não é membro + limite disponível → cria membership como `jogador`
   - Se limite atingido → mostra erro

### 5.4 Lista de Mesas (/games)

- [x] Mostra apenas mesas onde usuário é membro
- [x] Cards muestran: nome, sistema, data, role do usuário
- [x] Botões: Copiar Link, Deletar (narrador), Sair (jogador)
- [x] Limite de 3 mesas visível (botão desabilitado se atingido)

### 5.5 Header Minimalista

- [x] `/games` usa header minimalista (só logo + tema + user menu)
- [x] Página principal com `?gameId=` mostra header "Mesa Ativa"

---

## 6. Questões em Aberto

- [ ] Sistema de convites com limite configurável (atualmente fixo em 3)
- [ ] UI para configurar permissions por role
- [ ] Sistema de "lixeira" com restauração em 3 dias
- [ ] Backup/export de mesa
- [ ] RLS policies por `game_id`

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

## 8. API Implementada

### 8.1 tables.ts (db)

```typescript
// Games
async getUserGames()              // Busca só mesas do usuário (filtrado por membership)
async getGameByInviteCode(code)   // Busca mesa por código de convite
async getUserGameCount()          // Conta mesas do usuário (para limite)
async createGame(nome, sistema, campanha, capaUrl)
async joinGame(inviteCode)        // Retorna { gameId, alreadyMember, role }
async leaveGame(gameId, userRole) // Lida com soft/hard delete
async softDeleteGame(gameId)
async cancelDeleteGame(gameId)
async getGameMembers(gameId)
async deleteGame(gameId)
async getInviteCode(gameId)
```

### 8.2 game.svelte.ts (gameState)

```typescript
// Getters
gameId         // currentGameId
activeGameId   // currentGameId
isNarrator     // authState.role === 'narrador'

// Métodos
setGameId(gameId)           // Inicializa subscriptions para a mesa
setActiveGameId(gameId)     // Alias para setGameId
getGameById(gameId)
getGameByInviteCode(code)
getGameMembers(gameId)
checkUserGameMembership(gameId)
joinGame(inviteCode)        // Wrapper que retorna { success, gameId, alreadyMember, role }
leaveGame(gameId)
```

---

## 9. Dependências

- Tabelas: `games`, `game_members`, `items`, `chat_messages`, `dice_rolls`, `audio_state`
- Colunas: `game_id` em todas as tabelas de dados
- RLS policies por `game_id` (pendente)

---

## 10. Testes Implementados

- [x] /games mostra apenas minhas mesas
- [x] /games/[id] redireciona para /?gameId=
- [x] Cards/Chat/Dados são da mesa atual (via gameId)
- [x] Header em /games é minimalista
- [x] Criar 3 mesas → botão fica desabilitado na 4ª
- [x] Convite: se já membro → redireciona diretamente
- [x] Convite: se limite atingido → mostra erro
- [x] Header "Mesa Ativa" aparece com ?gameId=

---

## 11. Correções Realizadas

### 11.1 Problema: Funções não existem no build de produção
**Causa**: Minificação excessiva do Vite removendo funções factory pattern  
**Solução**: Exportar funções explicitamente com `nome: funcao` ao invés de apenas `funcao`

### 11.2 Problema: leaveGame deletava a mesa incorretamente
**Causa**: `isLastMember` usava `<= 1` ao invés de `=== 1`  
**Solução**: Corrigido para verificar se há 0 membros restantes após delete

### 11.3 Problema: Jogadores podiam convidar outros
**Causa**: InviteLink não verificava role do usuário  
**Solução**: Adicionada verificação `userRole === 'narrador' || userRole === 'assistente'`

### 11.4 Problema: FAB não aparecia na página principal
**Causa**: Rota `/` estava sendo redirecionada para `/games` no auth redirect  
**Solução**: Removido redirecionamento de `/` para `/games` (agora vai direto para `/games` se não logado)
