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
