# GameBoard v2 — Spec-Driven Development

Web App modular para RPG de mesa com foco em **Reatividade** e **Performance**.

> **Nota:** Este projeto segue o workflow **Spec-Driven Development (SDD)**. Leia o Constitution em `.specify/memory/constitution.md` antes de fazer alterações significativas.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Svelte 5 (Runes: `$state`, `$derived`, `$effect`) |
| Bundler | Vite |
| UI & Components | Bits UI (Headless) + Tailwind CSS v4 |
| Icons | Lucide Svelte |
| Backend | **Supabase** (Postgres + Auth + Realtime) |
| Linting | Biome |
| Grid/Layout | Muuri |
| Editor | Tiptap 2 |
| 3D Dice | @3d-dice/dice-box |
| Whiteboard | Fabric.js v6 |
| Deploy | Vercel/Netlify |

---

## Estrutura de Diretórios

```text
public/
├── .specify/           # SpecKit SDD artifacts
│   ├── memory/
│   │   └── constitution.md    # Princípios do projeto
│   ├── templates/      # Templates SDD
│   └── integrations/   # Integração com agentes
├── specs/              # SPECs por feature
│   └── 001-feature-name/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── docs/               # Documentação adicional
│   └── adr/           # Architecture Decision Records
├── src/
│   ├── components/
│   │   ├── ui/        # Componentes base (Button, Input, etc)
│   │   ├── grid/      # Cards e grid de jogos
│   │   ├── dice/      # Sistema de dados
│   │   ├── whiteboard/# Quadro colaborativo
│   │   ├── chat/      # Chat em tempo real
│   │   └── editor/    # Editor de texto rico
│   ├── lib/
│   │   ├── supabase/  # Cliente Supabase
│   │   ├── state/     # Estado global (Runes)
│   │   └── utils/     # Utilitários
│   └── routes/        # Páginas SvelteKit
└── package.json
```

---

## Workflow SDD

Para **toda feature nova**:

```
1. /speckit.specify  → Criar SPEC.md da feature
2. /speckit.plan     → Criar plano técnico
3. /speckit.tasks    → Decompor em tarefas
4. /speckit.implement → Implementar
```

### Comandos SpecKit

| Comando | Descrição |
|---------|-----------|
| `/speckit.constitution` | Revisar/atualizar princípios |
| `/speckit.specify` | Criar especificação |
| `/speckit.plan` | Plano de implementação |
| `/speckit.tasks` | Lista de tarefas |
| `/speckit.implement` | Executar implementação |

### Comandos Opcionais

| Comando | Descrição |
|---------|-----------|
| `/speckit.clarify` | Perguntas para desambiguar |
| `/speckit.analyze` | Verificar consistência |
| `/speckit.checklist` | Checklist de qualidade |

---

## Princípios Fundamentais

### Reatividade
- Usar **Runes** (`$state`, `$derived`, `$effect`)
- **Proibido**: `document.getElementById`, `document.querySelector`

### Componentes
- Props tipadas com `$props()`
- Interface `Props` explícita
- Componentes de UI em `src/components/ui/`

### Estado
- Factory pattern com `init()` e `destroy()`
- Limpar subscriptions no `destroy()`
- Getters para expor estado (não `$state` diretamente)

### Estilo
- **Proibido** Bulma — usar **Tailwind CSS v4** (tema `Zinc-950`)
- Estilo **Shadcn/UI** dark

### Linting
- `biome format --write` antes de commits
- `biome lint` deve passar

---

## Modelo de Dados (Supabase)

### Schema Principal

```sql
-- Profiles (via Supabase Auth)
profiles {
  id: uuid (PK)
  display_name: text
  role: 'narrador' | 'jogador'
}

-- Games
games {
  id: uuid (PK)
  nome: text
  owner_id: uuid (FK -> profiles)
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
}
```

### RLS Policies
- Jogadores veem apenas cards `is_visible_to_players = true`
- Narradores veem todos os cards

---

## Shortcodes RPG

| Shortcode | Descrição |
|-----------|-----------|
| `[hp:atual/max:mod]` | Pontos de vida |
| `[stat:Nome:valor:mod:save]` | Atributo |
| `[money:100po,50pp]` | Dinheiro |
| `[count:inicial:inc:max]` | Contador |
| `[xp:atual/total:prox]` | Experiência |

---

## Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Linting
biome format --write
biome lint

# Deploy (Vercel/Netlify)
vercel deploy
```

---

## Migration Firebase → Supabase

Ver `docs/migration/001-firebase-to-supabase.md` para detalhes.

**Status**: Em progresso
