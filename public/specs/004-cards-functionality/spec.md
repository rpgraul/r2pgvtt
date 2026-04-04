# SPEC 004: Funcionalidade de Cards

**Feature Branch**: `004-cards-functionality`  
**Created**: 2026-04-04  
**Status**: Implemented

---

## 1. Visão Geral

O sistema de cards é a funcionalidade principal para gerenciar conteúdo dentro de cada mesa. Cada card pertence a uma mesa específica (`game_id`) e pode ser categorizado, tagged, e configurado para visibilidade.

---

## 2. Schema da Tabela `items` (Banco)

```sql
CREATE TABLE items (
  id                   uuid      NOT NULL DEFAULT gen_random_uuid(),
  game_id              uuid      NOT NULL,
  titulo               text      NOT NULL DEFAULT '',
  conteudo             text,
  category             text      DEFAULT 'misc',
  tags                 text[]    DEFAULT '{}',
  imagem_url           text,
  is_visible_to_players boolean  DEFAULT true,
  "order"             integer   DEFAULT 0,
  created_by           text,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX idx_items_game_id ON items(game_id);
CREATE INDEX idx_items_order ON items("order");
```

### Colunas (snake_case):
| Coluna no DB | Tipo | Padrão |
|--------------|------|--------|
| `id` | uuid | gen_random_uuid() |
| `game_id` | uuid | - |
| `titulo` | text | '' |
| `conteudo` | text | '' |
| `category` | text | 'misc' |
| `tags` | text[] | '{}' |
| `imagem_url` | text | - |
| `is_visible_to_players` | boolean | true |
| `order` | integer | 0 |
| `created_by` | text | - |
| `created_at` | timestamptz | now() |
| `updated_at` | timestamptz | now() |

---

## 3. Mapeamento camelCase ↔ snake_case

### 3.1 Arquivo: `src/lib/utils/cardMapper.ts` (NOVO)

```typescript
export interface CardInput {
  titulo: string;
  conteudo?: string;
  category?: string;
  tags?: string[];
  imagemUrl?: string;
  isVisibleToPlayers?: boolean;
  order?: number;
  gameId: string;
}

export function toCardDB(card: CardInput): Partial<CardDB> {
  return {
    game_id: card.gameId,
    titulo: card.titulo,
    conteudo: card.conteudo || '',
    category: card.category || 'misc',
    tags: card.tags || [],
    imagem_url: card.imagemUrl || null,
    is_visible_to_players: card.isVisibleToPlayers ?? true,
    order: card.order ?? 0,
  };
}

export function fromCardDB(card: CardDB): any {
  return {
    id: card.id,
    gameId: card.game_id,
    titulo: card.titulo,
    conteudo: card.conteudo,
    category: card.category,
    tags: card.tags,
    imagemUrl: card.imagem_url,
    isVisibleToPlayers: card.is_visible_to_players,
    order: card.order,
    createdBy: card.created_by,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
  };
}

export function fromCardDBArray(cards: CardDB[]): any[] {
  return cards.map(fromCardDB);
}
```

---

## 4. Categorias Válidas

| Valor | Label |
|-------|-------|
| `pj` | Personagem |
| `npc` | NPC |
| `monstro` | Monstro |
| `item` | Item |
| `anotacao` | Anotação |
| `misc` | Diversos (padrão) |

---

## 5. Fluxo de Dados

```
1. CardDialog → gameState.createCard(camelCase)
         ↓
2. gameState.createCard() → db.addItem()
         ↓
3. tables.ts → toCardDB() (converte para snake_case)
         ↓
4. Supabase INSERT (game_id obrigatório)
         ↓
5. subscribeToItems callback → fromCardDBArray()
         ↓
6. gameState.items = cards (camelCase)
         ↓
7. Componentes renderizam normalmente
```

---

## 6. Correções Aplicadas

### 6.1 Correção: game_id null ao criar card
- **Problema**: `tables.ts addItem()` usava `itemData.game_id` mas o estado passa `itemData.gameId`
- **Solução**: Alterar para `itemData.gameId`
- **Arquivo**: `src/lib/supabase/tables.ts`

### 6.2 Correção: Verificação de gameId
- **Problema**: Criação de card sem gameId selecionado
- **Solução**: Adicionar verificação em `gameState.createCard()` com throw
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.3 Correção: Erro de subscription realtime
- **Problema**: Múltiplos canais de realtime criados causavam erro
- **Solução**: 
  - Adicionar `onChannelCreated` callback nas funções subscribe
  - Rastrear canais em `gameState.realtimeChannels`
  - Limpar canais antes de criar novos em `cleanupRealtimeChannels()`
- **Arquivos**: 
  - `src/lib/supabase/tables.ts`
  - `src/lib/state/gameState.svelte.ts`

### 6.4 Correção: Estado após F5
- **Problema**: Estado não era resetado corretamente após refresh
- **Solução**: Chamar `gameState.destroy()` antes de `setGameId()` em `+page.svelte`
- **Arquivo**: `src/routes/+page.svelte`

### 6.5 Correção: Race condition entre init e setGameId
- **Problema**: `+layout.svelte` chamava `gameState.init()` (seta currentGameId = null), causando "Cannot create card: no game selected"
- **Solução**: Remover `gameState.init()` de +layout.svelte, deixar apenas +page.svelte gerenciar a inicialização
- **Arquivo**: `src/routes/+layout.svelte` (linha 50)

### 6.6 Correção: Erro Tiptap "doc is not defined"
- **Problema**: Editor Tiptap recebia `content = undefined` quando não havia valor inicial
- **Solução**: Usar `content || ''` como padrão
- **Arquivo**: `src/components/editor/RichTextEditor.svelte` (linha 68)

### 6.7 Correção: Erro localStorage em SSR
- **Problema**: `localStorage` não existe no server-side, causando erro em SSR
- **Solução**: Verificar `typeof window !== 'undefined'` antes de acessar localStorage
- **Arquivo**: `src/lib/state/diceStore.svelte.js` (linha 17-22)

### 6.8 Correção: Persistência de gameId após F5
- **Problema**: currentGameId era perdido no refresh da página, causando "no game selected"
- **Solução**: Salvar gameId em localStorage com chave 'rpgboard_current_game' e restaurar no init()
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.9 Correção: Realtime filtrado por game_id
- **Problema**: Realtime recebia updates de todas as mesas, causando múltiplas recargas
- **Solução**: Adicionar filtro `game_id=eq.{gameId}&deleted_at=is.null` no subscription
- **Arquivo**: `src/lib/supabase/tables.ts`

### 6.10 Correção: Card não aparece após criar
- **Problema**: realtime não dispara update visual corretamente
- **Solução**: Adicionar `refreshItems()` após createCard, editCard, removeCard
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.11 Correção: Botão deletar no CardDialog
- **Problema**: Apenas narrador podia excluir cards
- **Solução**: Remover verificação `gameState.isNarrator`, todos podem excluir
- **Arquivo**: `src/components/grid/CardDialog.svelte`

### 6.12 Novo: Sistema de Lixeira (Soft Delete)
- **Problema**: Cards eram deletados permanentemente
- **Solução**: 
  - `deleteItem()` agora usa soft delete (seta `deleted_at`)
  - Adicionadas funções: `getTrashItems()`, `restoreItem()`, `permanentlyDeleteItem()`, `emptyTrash()`
  - Adicionado coluna `deleted_at` na interface CardDB
  - Filtrar items ativos com `.is('deleted_at', null)`
- **Arquivos**: 
  - `src/lib/supabase/tables.ts`
  - `src/lib/state/gameState.svelte.ts`
  - `src/lib/utils/cardMapper.ts`

### 6.13 Novo: Dialog de Lixeira
- **Problema**: Não havia interface para gerenciar cards excluídos
- **Solução**: Criado `TrashDialog.svelte` com:
  - Lista de cards deletados com data de exclusão
  - Indicador de expiração (30 dias)
  - Botão restaurar
  - Botão excluir permanentemente
  - Botão limpar lixeira
  - Apenas narrador pode acessar
- **Arquivo**: `src/components/grid/TrashDialog.svelte`

### 6.14 Novo: Botões de ação no hover do Card
- **Problema**: Não havia como excluir card diretamente
- **Solução**: Adicionados botões editar e excluir no hover do card
- **Arquivo**: `src/components/grid/Card.svelte`

### 6.15 Novo: Redesign Card estilo TCG
- **Problema**: Card era box de info genérico
- **Solução**: Card estilo TCG com:
  - Imagem grande em proporção 3:4
  - Gradiente sobre a imagem
  - Título e tags sobre a imagem
  - Botões de editar/excluir no hover
- **Arquivo**: `src/components/grid/Card.svelte`

### 6.16 Correção: Remover clique no Card
- **Problema**: Card abria edição ao clicar no card inteiro
- **Solução**: Remover onclick, role, tabindex do card. Apenas botão Editar abre dialog
- **Arquivo**: `src/components/grid/Card.svelte`

### 6.17 Correção: Remover zoom no hover
- **Problema**: Card tinha scale no hover
- **Solução**: Remover hover:scale-[1.02] e group-hover:scale-105
- **Arquivo**: `src/components/grid/Card.svelte`

### 6.18 Novo: Botão Lixeira em CategoryFilters
- **Problema**: Lixeira estava em local мало visible
- **Solução**: Mover botão Lixeira para CategoryFilters (após Anotações), visível apenas para narrador
- **Arquivo**: `src/components/CategoryFilters.svelte`

### 6.19 Correção: Lixeira não aparece para narrador
- **Problema**: `isNarrator` retornava false quando profile ainda não estava carregado
- **Solução**: Verificar `!authState.isLoading && authState.role === 'narrador'`
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.20 Correção: Jogadores veem cards ocultos
- **Problema**: `filteredItems` não filtrava cards ocultos para jogadores por padrão
- **Solução**: Adicionar filtro `if (role !== 'narrador')` para filtrar `isVisibleToPlayers`
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.21 Correção: Tiptap "doc is not defined"
- **Problema**: Editor Tiptap tentava inicializar sem elemento DOM
- **Solução**: Verificar `if (!element) return` antes de criar editor
- **Arquivo**: `src/components/editor/RichTextEditor.svelte`

### 6.22 Correção: isNarrator baseado no role da mesa
- **Problema**: `isNarrator` usava `authState.role` (global) que não existe mais
- **Solução**: 
  - Adicionar `currentGameRole` state no gameState
  - Buscar role em `game_members` via `loadGameRole()` no init()
  - `isNarrator` agora retorna `currentGameRole === 'narrador'`
  - Filtrar items para não-narradores com `currentGameRole !== 'narrador'`
- **Arquivo**: `src/lib/state/gameState.svelte.ts`

### 6.23 Correção: Badge Oculto removida, borda sutil adicionada
- **Problema**: Badge "Oculto" não estava visualmente boa
- **Solução**: 
  - Remover badge "Oculto" do Card
  - Adicionar borda tracejada amber (`border-amber-500/50 border-dashed`) apenas para narrador
- **Arquivo**: `src/components/grid/Card.svelte`

### 6.24 Novo: Supabase Realtime para items
- **Problema**: Atualizações não apareciam em tempo real para outros usuários
- **Solução**: 
  - Habilitar realtime com `ALTER PUBLICATION supabase_realtime ADD TABLE items`
  - Código já configurado com subscriptions em `subscribeToItems()`
  - Updates em tempo real via Supabase Realtime broadcast
- **Arquivo**: `src/lib/supabase/tables.ts`

---

## 7. Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/utils/cardMapper.ts` | **NOVO** - Funções de mapeamento |
| `src/lib/supabase/tables.ts` | `addItem`, `updateItem` com toCardDB; subscribe* com onChannelCreated |
| `src/lib/state/gameState.svelte.ts` | realtimeChannels, cleanupRealtimeChannels, createCard com verificação |
| `src/routes/+page.svelte` | destroy() antes de setGameId() |

---

## 8. Testes Realizados

- [x] Build passa
- [x] Criar card com gameId
- [x] Editar card
- [x] Deletar card
- [x] Refresh (F5) mantém estado
- [x] Realtime funciona corretamente
