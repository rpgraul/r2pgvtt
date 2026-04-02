# Constitution — GameBoard v2

> Documento fundacional que governa todas as decisões de desenvolvimento.

---

## 1. Propósito

Este Constitution estabelece os princípios, padrões e processos que guiam o desenvolvimento do **GameBoard v2** — uma plataforma multi-tenant para mesas de RPG de mesa.

### 1.1 Visão

Uma ferramenta que combina **performance**, **funcionalidades ricas** e **experiência colaborativa** para grupos de RPG, permitindo que narradores e jogadores compartilhem fichas, dados, mapas e narrativas em tempo real.

### 1.2 Valores

| Valor | Descrição |
|-------|-----------|
| **Reatividade** | UI responsiva com sincronização em tempo real |
| **Modularidade** | Componentes independentes e reutilizáveis |
| **Clareza** | Código auto-documentado com tipos explícitos |
| **Estabilidade** | Migrations guiadas para mudanças seguras |

---

## 2. Stack Tecnológica

### 2.1 Stack Principal

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Framework | **Svelte 5** | Runes para reatividade nativa |
| Bundler | **Vite** | Build rápido e HMR |
| UI | **Bits UI** + **Tailwind CSS v4** | Headless components + estilo Shadcn/Zinc-950 |
| Backend | **Supabase** | Postgres + Auth + Realtime + Edge Functions |
| Icons | **Lucide Svelte** | Consistente e tree-shakeable |
| Grid/Layout | **Muuri** | Grid responsivo com drag-and-drop |
| Editor | **Tiptap 2** | Rich text extensível |
| 3D Dice | **@3d-dice/dice-box** | Simulação de dados imersiva |
| Whiteboard | **Fabric.js v6** | Desenho colaborativo em canvas |

### 2.2 Ferramentas de Desenvolvimento

| Ferramenta | Propósito |
|------------|-----------|
| **Biome** | Linting + Formatação (unified tool) |
| **TypeScript** | Tipagem estática |
| **SvelteKit** | Roteamento e SSR/SSG |

---

## 3. Princípios de Código

### 3.1 Reatividade com Runes

```typescript
// ✅ CORRETO — Usar Runes para estado reativo
let count = $state(0);
const doubled = $derived(count * 2);

// ❌ ERRADO — Manipulação direta de DOM
document.getElementById('counter').textContent = count;
```

**Regras:**
- Todo estado reativo **deve** usar `$state`, `$derived`, ou `$effect`
- **Proibido** `document.getElementById`, `document.querySelector`
- **Proibido** `document.createElement` para UI
- Componentes **devem** retornar `getter` functions para estado (não exponha `$state` diretamente)

### 3.2 Componentes

```svelte
<!-- ✅ CORRETO — Props tipadas com snippet -->
<script lang="ts">
  interface Props {
    title: string;
    variant?: 'primary' | 'secondary';
  }
  
  let { title, variant = 'primary' }: Props = $props();
</script>

<!-- ❌ ERRADO — Any implícito -->
<script>
  export let title; // any implícito
</script>
```

**Regras:**
- Todos os componentes **devem** ter interface `Props` explícita
- Usar `$props()` com destructuring pattern
- **Proibido** `export let` sem tipagem
- Componentes de UI em `src/components/ui/`
- Componentes de feature em `src/components/{feature}/`

### 3.3 Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `CardDialog.svelte` |
| Funções | camelCase | `createCard()` |
| Constantes | SCREAMING_SNAKE | `MAX_PLAYERS` |
| Arquivos | kebab-case | `game-state.ts` |
| Diretórios | kebab-case | `src/components/chat/` |
| Tipos/Interfaces | PascalCase | `interface UserProfile` |
| Eventos customizados | kebab-case | `on:card-select` |

### 3.4 Imports e Exports

```typescript
// ✅ CORRETO — Named exports consistentes
export function createGameState() { }
export const gameState = createGameState();

// ❌ ERRADO — Default exports para singletons
export default createGameState();
```

**Regras:**
- **Preferir** named exports sobre default exports
- Imports organizados: externos → internos → relativos
- Agrupar imports do mesmo pacote
- Usar alias `@/` para imports de `src/`

### 3.5 Estilo e CSS

- **Proibido** Bulma ou frameworks CSS غير Tailwind
- Usar **Tailwind CSS v4** com tema `Zinc-950`
- Variáveis CSS customizadas para tokens de design
- **Proibido** `!important` exceto em utilitários de última instância

---

## 4. Arquitetura de Estado

### 4.1 Estrutura

```
src/lib/state/
├── game.svelte.js      # Estado global do jogo
├── auth.svelte.ts      # Autenticação Supabase
├── dice.svelte.js      # Estado dos dados
└── {feature}.svelte.js # Estado por feature
```

### 4.2 Padrão de State Module

```typescript
// ✅ CORRETO — Factory pattern com cleanup
function createGameState() {
  let unsubscribe = null;
  
  function init() {
    unsubscribe = subscribeToCollection((data) => {
      items = data;
    });
  }
  
  function destroy() {
    if (unsubscribe) unsubscribe();
  }
  
  return {
    get items() { return items; },
    init,
    destroy
  };
}

export const gameState = createGameState();
```

**Regras:**
- Todo state module **deve** implementar `init()` e `destroy()`
- `destroy()` **deve** limpar todos os subscriptions/listeners
- Usar factory pattern para permitir múltiplas instâncias se necessário
- Getters para expor estado (não expor `$state` diretamente)

---

## 5. Modelo de Dados (Supabase)

### 5.1 Schema

```sql
-- Users (via Supabase Auth + profiles)
profiles {
  id: uuid (PK, FK -> auth.users)
  display_name: text
  role: enum('narrador', 'jogador')
  created_at: timestamptz
}

-- Games
games {
  id: uuid (PK)
  nome: text
  owner_id: uuid (FK -> profiles)
  created_at: timestamptz
}

-- Cards
cards {
  id: uuid (PK)
  game_id: uuid (FK -> games)
  titulo: text
  conteudo: text
  tags: text[]
  category: text
  is_visible_to_players: boolean
  imagem_url: text
  posicao: jsonb
  created_by: text
  created_at: timestamptz
}

-- Chat Messages
chat_messages {
  id: uuid (PK)
  game_id: uuid (FK -> games)
  uid: uuid (FK -> profiles)
  autor: text
  mensagem: text
  tipo: enum('user', 'system')
  dice_color: text
  created_at: timestamptz
}

-- Dice Rolls
dice_rolls {
  id: uuid (PK)
  game_id: uuid (FK -> games)
  uid: uuid (FK -> profiles)
  autor: text
  expressao: text
  resultado: integer
  detalhes: jsonb
  created_at: timestamptz
}
```

### 5.2 Regras RLS (Row Level Security)

```sql
-- Players podem ver cards marcados como visíveis
CREATE POLICY "Players view visible cards" ON cards
  FOR SELECT USING (
    is_visible_to_players = true
    OR EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = cards.game_id 
      AND user_id = auth.uid()
      AND role = 'narrador'
    )
  );
```

---

## 6. Workflow SDD (Spec-Driven Development)

### 6.1 Ciclo de Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│  1. SPEC      → Descrever O QUÊ e PORQUÊ                   │
│       ↓                                                        
│  2. PLAN      → Definir stack e arquitetura                 │
│       ↓                                                        
│  3. TASKS     → Decompor em tarefas acionáveis             │
│       ↓                                                        
│  4. IMPLEMENT → Executar tarefas                            │
│       ↓                                                        
│  5. VERIFY    → Testar e revisar                           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Antes de Codar

Para **toda feature nova ou mudança significativa**:

1. **Criar SPEC.md** em `SPECs/{feature}/SPEC.md`
2. **Criar ADR** se houver decisão arquitetural
3. **Obter aprovação** do SPEC antes de implementar

### 6.3 Estrutura de um SPEC.md

```markdown
# {Feature Name}

## 1. Visão

Descreva o que esta feature faz e por que existe.

## 2. User Stories

- Como {persona}, quero {ação} para {benefício}
- ...

## 3. Comportamento

### 3.1 Fluxo Principal
- Passo 1
- Passo 2

### 3.2 Estados
| Estado | Comportamento |
|--------|---------------|
| Loading | Skeleton/spinner |
| Empty | Mensagem + CTA |
| Error | Mensagem + Retry |

### 3.3 Edge Cases
- Caso A: comportamento X
- Caso B: comportamento Y

## 4. Design

### 4.1 Layout
[Wireframe ou descrição visual]

### 4.2 Componentes
- `ComponentName`: propósito

## 5. Technical

### 5.1 API/Supabase
- Query: `table.name`
- Mutations: `rpc.function_name()`

### 5.2 Estado Local
```typescript
let localState = $state(initialValue);
```

## 6. Critérios de Aceitação

- [ ] Critério 1
- [ ] Critério 2
```

---

## 7. Documentação

### 7.1 Arquitetura de Docs

```
docs/
├── adr/                    # Architecture Decision Records
│   ├── 001-supabase-backend.md
│   └── 002-svelte-5-runes.md
├── changelog.md
└── migration/
    └── 001-firebase-to-supabase.md
```

### 7.2 ADR (Architecture Decision Record)

```markdown
# ADR-001: Backend Framework

## Status
Aceito

## Contexto
Procuramos um backend para substituir Firebase que oferecesse:
- Realtime subscriptions
- Auth integrado
- Self-hosting opcional
- Boa documentação

## Decisão
Usar **Supabase**

## Consequências

### Positivas
- Postgres para queries complexas
- Realtime built-in
- Edge Functions para serverless

### Negativas
- Migração de dados necessária
- Curva de aprendizado para RLS
```

### 7.3 Regras de Documentação

| Tipo | Onde | Formato |
|------|------|---------|
| SPEC.md | `SPECs/{feature}/` | Markdown (template acima) |
| ADR | `docs/adr/ADR-NNN-title.md` | Markdown (template acima) |
| JSDoc | No código | JSDoc/TSDoc comments |
| Migration | `docs/migration/` | Markdown + Scripts |

---

## 8. Breaking Changes e Migrations

### 8.1 Política

1. **Nunca** quebrar produção intencionalmente
2. **Toda** mudança significativa **deve** ter migration script
3. **Migrations** devem ser reversíveis quando possível

### 8.2 Processo de Breaking Change

```
1. Criar migration script em docs/migration/
2. Documentar steps de rollback
3. Testar migration em staging
4. Deploy com feature flag (se aplicável)
5. Executar migration
6. Monitorar métricas
7. Remover código antigo (após período de estabilização)
```

### 8.3 Migration Script Template

```typescript
// docs/migration/001-firebase-to-supabase.ts

/**
 * Migration: Firebase → Supabase
 * 
 * Data: {date}
 * Author: {author}
 * Status: pending | completed | rolled_back
 * 
 * Steps:
 * 1. Exportar dados do Firebase
 * 2. Transformar formato
 * 3. Importar para Supabase
 * 4. Verificar integridade
 * 
 * Rollback:
 * 1. Manter backup Firebase por 30 dias
 */

export async function up() {
  // Migration forward
}

export async function down() {
  // Migration rollback
}
```

---

## 9. Git e Versionamento

### 9.1 Branching Strategy

**Trunk-Based Development**

```
main ──────────────────────────────────────►
       │          │          │
       ├─ feat/   ├─ fix/    ├─ chore/
       │  123     │  456     │  deps-upgrade
       │          │          │
       └──────────┴──────────┘
       (branches curtas, 1-2 dias max)
```

### 9.2 Commit Messages

```
feat(auth): add Google OAuth support
fix(cards): prevent duplicate cards on rapid click
chore(deps): upgrade Svelte to 5.20
docs(readme): update installation steps
refactor(state): migrate to factory pattern
test(dice): add unit tests for roll calculation
```

### 9.3 PR Guidelines

- **Título**: {type}: {description}
- **Descrição**: Link para SPEC.md
- **Checklist**:
  - [ ] Código segue Constitution
  - [ ] SPEC.md atualizado se necessário
  - [ ] Migration script criado (se breaking change)
  - [ ] Testes manuais passaram

---

## 10. Código de Conduta para Desenvolvimento

### 10.1 Antes de Commitar

- [ ] Código formata com `biome format --write`
- [ ] Lint passa com `biome lint`
- [ ] Sem `console.log` ou debugger
- [ ] Comentários descrevem **por que**, não **o quê**
- [ ] Testes manuais realizados

### 10.2 Review de Código

**O que revisar:**
- Lógica de negócio está correta?
- Estados de borda tratados?
- Performance adequada?
- Está seguind o Constitution?

**O que NÃO revisar:**
- Estilo (Biome cuida disso)
- Preferências pessoais dentro do padrão
- Mudanças não relacionadas ao PR

---

## 11. Definições

| Termo | Definição |
|-------|-----------|
| **Feature** | Funcionalidade que entrega valor ao usuário |
| **Breaking Change** | Mudança que pode quebrar funcionalidade existente |
| **Migration** | Script para transição de dados/estado |
| **ADR** | Documento que registra decisão arquitetural e seu contexto |
| **SPEC** | Especificação executável de uma feature |
| **Runes** | Sistema de reatividade do Svelte 5 (`$state`, `$derived`, `$effect`) |
| **RLS** | Row Level Security — segurança em nível de linha (Supabase) |

---

## 12. Aprovação e Versionamento

| Item | Responsável | Frequência |
|------|-------------|------------|
| Constitution | Owner | Revisão anual |
| SPEC.md | Dev | Por feature |
| ADR | Tech Lead | Por decisão |
| Migration | Dev | Por breaking change |

**Versão Atual**: 1.0.0  
**Última Atualização**: {date}  
**Próxima Revisão**: {date + 1 year}

---

*Este documento é a fonte de verdade. Código que viola o Constitution deve ser refatorado.*
