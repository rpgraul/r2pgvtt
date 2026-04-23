# SPEC — Drawing Mode (Quadro Interativo)

**Projeto:** RPGBoard  
**Stack:** SvelteKit + Supabase (Realtime Broadcast + Postgres) + Fabric.js  
**Versão:** 1.0  
**Status:** Proposta  

---

## 1. Visão Geral

O **Drawing Mode** é um quadro colaborativo em tempo real integrado ao RPGBoard. É a ferramenta de cartografia, planejamento e narração visual da sessão. Funciona como um Excalidraw especializado para RPG de mesa: suporta múltiplos boards por jogo, permissões diferenciadas entre Narrador e Jogadores, tokens de personagem, fog of war, grid (quadrado/hexagonal) com snap magnético, rastreio de cursores, gaveta de assets e sincronização total via Supabase Realtime.

### 1.1 Princípios de Design

- **Narrador controla, Jogadores navegam** — o mestre cria e gerencia; os jogadores podem apenas visualizar e anotar (com permissão).
- **Tempo real sem atrito** — mudanças aparecem instantaneamente para todos no mesmo board.
- **Atalhos como cidadão de primeira classe** — toda ação tem atalho de teclado.
- **Performance primeiro** — o canvas usa Fabric.js com renderização via `requestAnimationFrame`; operações broadcast são debounced.

---

## 2. Modelo de Dados (Supabase)

### 2.1 Tabelas

```sql
-- Boards de um jogo
CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Novo Board',
  is_visible  BOOLEAN NOT NULL DEFAULT false,   -- visível para jogadores?
  order_index INT NOT NULL DEFAULT 0,
  grid_type   TEXT CHECK (grid_type IN ('none','square','hex')) DEFAULT 'none',
  grid_size   INT DEFAULT 60,                   -- px por célula (base 60)
  grid_color  TEXT DEFAULT '#ffffff22',
  bg_color    TEXT DEFAULT '#1a1a2e',
  bg_image    TEXT,                             -- URL opcional
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Elementos persistidos de cada board
CREATE TABLE board_elements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL,
  fabric_json JSONB NOT NULL,                   -- snapshot do objeto Fabric.js
  z_index     INT DEFAULT 0,
  group_id    UUID,                             -- para agrupamentos
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Estado do "board ativo" (qual o mestre está exibindo)
CREATE TABLE board_session (
  game_id         UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  active_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  called_at       TIMESTAMPTZ                   -- última vez que o mestre chamou atenção
);
```

### 2.2 Canais Supabase Realtime (Broadcast)

| Canal | Evento | Payload |
|---|---|---|
| `board:{boardId}` | `element:add` | `{ element: FabricJSON }` |
| `board:{boardId}` | `element:update` | `{ id, changes: FabricJSON }` |
| `board:{boardId}` | `element:delete` | `{ id }` |
| `board:{boardId}` | `element:batch` | `{ ops: Op[] }` — undo/redo em lote |
| `board:{boardId}` | `cursor` | `{ userId, name, color, x, y }` — throttled 50ms |
| `board:{boardId}` | `fog:update` | `{ regions: FogRegion[] }` |
| `game:{gameId}` | `board:call` | `{ boardId, boardName }` — mestre chama todos |
| `game:{gameId}` | `board:active` | `{ boardId }` — troca silenciosa de board ativo |

---

## 3. Arquitetura de Estado (SvelteKit / Svelte 5)

### 3.1 `boardState.svelte.ts`

```
src/lib/state/boardState.svelte.ts
```

Responsabilidades:
- Lista de boards do jogo
- Board selecionado localmente (pode diferir do ativo do narrador)
- Board ativo oficial (ditado pelo narrador)
- Flag `hasAlert` — exibe banner para jogadores fora do board chamado
- Canvas Fabric.js instanciado aqui via ref
- Stack de undo/redo
- Cursores remotos mapeados por `userId`

```ts
interface BoardState {
  boards: Board[]
  localBoardId: string | null        // o que EU estou vendo
  activeBoardId: string | null       // o que o MESTRE está exibindo
  alertBoardId: string | null        // mestre "chamou" — mostrar alerta
  cursors: Map<string, RemoteCursor>
  undoStack: CanvasSnapshot[]        // máx 50
  redoStack: CanvasSnapshot[]
  selectedTool: Tool
  selectedColor: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  opacity: number
  isSnapEnabled: boolean
  fogEnabled: boolean
}
```

### 3.2 Separação de permissões

```ts
const canEdit = $derived(
  authState.role === 'narrador' ||
  boards.find(b => b.id === localBoardId)?.players_can_edit === true
)
```

---

## 4. Componentes

```
src/lib/components/board/
  BoardMode.svelte          ← container principal (rota /game/[id]/board)
  BoardCanvas.svelte        ← <canvas> wrapping Fabric.js
  BoardToolbar.svelte       ← barra de ferramentas lateral esquerda
  BoardTopbar.svelte        ← barra superior (boards, visibilidade, call)
  BoardPropertiesPanel.svelte ← painel direito (quando elemento selecionado)
  BoardFogOverlay.svelte    ← overlay SVG de fog of war
  BoardCursors.svelte       ← cursores remotos renderizados via SVG overlay
  BoardAlert.svelte         ← banner "O mestre está chamando para um board"
  BoardGrid.svelte          ← renderiza grid no bg (canvas extra / CSS)
  AssetDrawer.svelte        ← gaveta lateral direita de assets
  BoardMinimap.svelte       ← miniatura de navegação (canto inf. dir.)
  TokenPicker.svelte        ← modal para inserir card como token
  BoardContextMenu.svelte   ← menu de contexto (click direito)
```

---

## 5. Ferramentas (Tools)

### 5.1 Catálogo de Ferramentas

| ID | Nome | Atalho | Cursor | Descrição |
|---|---|---|---|---|
| `select` | Selecionar / Mover | `V` ou `Esc` | default | Seleciona, move, redimensiona, rotaciona |
| `pan` | Mover Canvas | `H` ou `Space` (hold) | grab | Pan no canvas sem selecionar nada |
| `pencil` | Lápis Livre | `P` | crosshair | Brush livre, pressão simulada |
| `brush_soft` | Brush Suave | `B` | custom | Traço com blur/opacidade nos bordos |
| `brush_ink` | Brush de Tinta | `I` | custom | Traço com variação de espessura (simula caligrafia) |
| `brush_marker` | Marcador | `M` | custom | Traço espesso translúcido (highlight) |
| `brush_eraser` | Borracha | `E` | eraser | Apaga partes de paths |
| `line` | Linha | `L` | crosshair | Linha reta simples |
| `arrow` | Seta | `A` | crosshair | Linha com ponta de seta |
| `connector` | Conector | `X` | crosshair | Linha que "gruda" em elementos (ligação) |
| `rect` | Retângulo | `R` | crosshair | Com/sem preenchimento, bordas arredondadas |
| `ellipse` | Elipse / Círculo | `O` | crosshair | Shift = círculo perfeito |
| `polygon` | Polígono | `G` | crosshair | N lados configurável |
| `text` | Texto | `T` | text | Texto editável inline |
| `sticky` | Sticky Note | `N` | crosshair | Bloco colorido com texto |
| `image` | Inserir Imagem | `Shift+I` | — | Upload ou URL |
| `token` | Inserir Token | `K` | — | Abre TokenPicker (cards do jogo) |
| `fog_add` | Fog: Adicionar | `F` | crosshair | Pinta área de neblina |
| `fog_erase` | Fog: Revelar | `Shift+F` | eraser | Remove neblina de área |
| `measure` | Medidor | `D` | crosshair | Mostra distância em células de grid |
| `zoom_in` | Zoom + | `+` / scroll up | zoom-in | — |
| `zoom_out` | Zoom - | `-` / scroll down | zoom-out | — |
| `zoom_fit` | Fit Canvas | `Shift+0` | — | Centraliza e ajusta zoom |

### 5.2 Tipos de Brush — Detalhamento Técnico

Todos os brushes são implementados via `fabric.PencilBrush` com pós-processamento ou via `fabric.PatternBrush` customizado.

#### `pencil` — Lápis Livre
- Classe base: `fabric.PencilBrush`
- `decimate`: 4 (simplificação de pontos)
- Linha com `strokeLineCap: 'round'`, `strokeLineJoin: 'round'`
- Largura fixa (controlada pelo slider)

#### `brush_soft` — Brush Suave
- Classe: `CustomSoftBrush extends fabric.PencilBrush`
- No `onMouseUp`: aplicar `fabric.Shadow({ blur: 6, color: currentColor })` ao path resultante
- Opacidade do brush: 0.7 por padrão
- Produz traços com aparência de aquarela leve

#### `brush_ink` — Brush de Tinta (Caligrafia)
- Classe: `CustomInkBrush extends fabric.PencilBrush`
- Varia a largura do traço baseado na velocidade do mouse:
  - `velocidade = distância entre pontos consecutivos`
  - `largura = baseWidth * (1 - velocidade / 500)` (clampado entre 0.3× e 1.5×)
- Resulta em traços mais finos em movimentos rápidos, mais grossos em lentos

#### `brush_marker` — Marcador
- Classe base: `fabric.PencilBrush`
- `globalCompositeOperation`: `'multiply'` (faz overlay de cores)
- Opacidade fixa em 0.4
- Largura sugerida: 20–40px

#### `brush_eraser` — Borracha
- Usa `fabric.EraserBrush` (disponível no fork `fabric-js/fabric.js` v5+)
- Apaga pixels de objetos existentes no canvas
- Fallback: se `EraserBrush` indisponível, seleciona objetos na área e os remove

---

## 6. Texto e Tipografia

### 6.1 Fontes Disponíveis

Todas as fontes são carregadas via **Google Fonts API** com `<link rel="preconnect">` e `font-display: swap`. O carregamento é **lazy**: a fonte só é injetada no `<head>` quando o usuário seleciona a ferramenta de texto ou escolhe aquela fonte específica no seletor.

| Nome Exibido | Google Fonts ID | Uso Sugerido |
|---|---|---|
| Sans Moderno | `Inter` | UI, mapas modernos |
| Fantasia | `MedievalSharp` | Títulos de fantasy |
| Manuscrito | `Caveat` | Notas de aventureiro |
| Serif Clássico | `Lora` | Pergaminhos, documentos |
| Monoespaçado | `JetBrains Mono` | Coordenadas, código |
| Gótico | `UnifrakturMaguntia` | Títulos épicos |
| Rúnico | `Norse` (self-hosted) | Inscrições místicas |

**Carregamento:**
```js
// fontLoader.js
const loaded = new Set()
export async function loadFont(family) {
  if (loaded.has(family)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`
  document.head.appendChild(link)
  await document.fonts.ready
  loaded.add(family)
}
```

A fonte `Norse` (rúnica) é self-hosted em `static/fonts/norse.woff2` por não estar no Google Fonts.

### 6.2 Propriedades de Texto

O objeto `fabric.IText` suporta edição inline ao dar duplo clique. Propriedades expostas no painel direito:
- Família, tamanho (8–144px), cor, cor de fundo
- Negrito, itálico, sublinhado, riscado
- Alinhamento (esquerda, centro, direita, justificado)
- Opacidade
- Borda (stroke) opcional

---

## 7. Grid e Snap Magnético

### 7.1 Grid Quadrado

- Renderizado como padrão CSS `background-image` no wrapper do canvas (não no Fabric canvas)
- `background-size: ${gridSize}px ${gridSize}px`
- Cor e opacidade configuráveis por board
- Tamanho padrão: 60px (configurável de 20px a 200px)

### 7.2 Grid Hexagonal

- Renderizado via SVG `<pattern>` injetado no fundo
- Suporte a orientação **flat-top** e **pointy-top** (configurável por board)
- Fórmula de célula hexagonal implementada via `lib/hexGrid.ts`:

```ts
// Hexágono pointy-top
function hexToPixel(q: number, r: number, size: number) {
  const x = size * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r)
  const y = size * (3/2 * r)
  return { x, y }
}
```

### 7.3 Snap Magnético

Quando ativado (`isSnapEnabled = true`), todos os objetos ao serem movidos ou criados têm suas coordenadas arredondadas para o centro (ou vértice) da célula mais próxima.

```ts
function snapToGrid(x: number, y: number, gridSize: number, type: 'square' | 'hex'): Point {
  if (type === 'square') {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }
  // hex: converter pixel → hex coord → arredondar → pixel
  const q = (Math.sqrt(3)/3 * x - 1/3 * y) / gridSize
  const r = (2/3 * y) / gridSize
  const { q: rq, r: rr } = hexRound(q, r)
  return hexToPixel(rq, rr, gridSize)
}
```

Atalho para toggle snap: **`Ctrl+Shift+G`**

---

## 8. Tokens de Card

### 8.1 O Que É Um Token

Um token é um card do jogo representado no board como:
- **Imagem circular** (1:1, crop centralizado) com bordas arredondadas suaves (`border-radius` aplicado via `clipPath` no Fabric.js)
- **Nome do card** abaixo (opcional, togglable)
- **Indicador de status** (barra de HP opcional, se o card tiver campo HP)

### 8.2 Fluxo de Inserção

1. Usuário seleciona ferramenta `token` (`K`)
2. Modal `TokenPicker.svelte` abre mostrando todos os cards do jogo
3. Cards filtrável por nome / categoria
4. Ao selecionar, o token é colocado no centro do viewport atual
5. Pode arrastar antes de confirmar (preview fantasma)

### 8.3 Estrutura Fabric do Token

```ts
const tokenGroup = new fabric.Group([
  new fabric.Circle({
    radius: 40,
    fill: new fabric.Pattern({ source: croppedImage }),
    stroke: '#c8a96e',        // cor da borda (dourado por padrão)
    strokeWidth: 3,
    shadow: new fabric.Shadow({ blur: 8, color: 'rgba(0,0,0,0.5)' })
  }),
  new fabric.Text(card.titulo, {
    fontSize: 12,
    fill: '#ffffff',
    textAlign: 'center',
    top: 45,
    originX: 'center'
  })
], {
  data: { type: 'token', cardId: card.id },
  lockUniScaling: true
})
```

### 8.4 Borda do Token

A borda usa a paleta de cores do sistema. O narrador pode personalizar cor da borda por token no painel de propriedades. Variações pré-definidas:
- 🟡 Dourado (`#c8a96e`) — PC
- 🔴 Vermelho (`#c84848`) — Inimigo
- 🟢 Verde (`#48c87c`) — Aliado
- ⚪ Prata (`#a0a0b8`) — NPC neutro
- 🟣 Roxo (`#8848c8`) — Mágico / Especial

---

## 9. Fog of War

### 9.1 Modelo

- Layer separada no topo do canvas (SVG overlay)
- Área de fog = conjunto de polígonos/retângulos armazenados em `board_elements` com `data.type = 'fog'`
- **Modo narrador**: vê tudo; áreas de fog aparecem com 40% de opacidade e bordas tracejadas (editor mode)
- **Modo jogador**: fog é opaco (100% opacidade, cor dark `#0a0a0f`)

### 9.2 Operações

| Operação | Narrador | Jogadores |
|---|---|---|
| Adicionar fog | ✅ (ferramenta `fog_add`) | ❌ |
| Revelar fog | ✅ (ferramenta `fog_erase`) | ❌ |
| Ver através do fog | ✅ | ❌ |

### 9.3 Shapes de Fog

- Retângulo livre (padrão)
- Círculo / elipse
- Polígono livre (clique a clique, duplo-clique para fechar)

### 9.4 Sincronização

As regiões de fog são transmitidas via `broadcast` no evento `fog:update`. São persistidas no banco como objetos `board_elements` com flag `is_fog: true`.

---

## 10. Conectores e Ligações

Conectores são linhas especiais que "grudam" em elementos:
- Cada extremidade pode ser **livre** ou **ancorada** a um objeto
- Se o objeto se mover, o conector acompanha
- Suporte a etiqueta de texto na linha
- Estilo: linha reta, curva (bezier), ou linha em ângulos retos (orthogonal)

**Implementação:** `fabric.Line` + evento `object:moving` para recalcular pontos das extremidades ancoradas. Armazenados em `board_elements` com `data.type = 'connector'` e `data.anchors: { from: elementId | null, to: elementId | null }`.

---

## 11. Agrupamento

- **Agrupar:** selecionar múltiplos objetos → `Ctrl+G`
- **Desagrupar:** selecionar grupo → `Ctrl+Shift+G` (conflito com snap? → usar `Ctrl+U`)
- Grupos são transmitidos como um único `element` com `group_id` referenciando seus filhos
- Grupos podem ser nomeados (rótulo visível apenas para narrador, ou para todos)

---

## 12. Undo / Redo

**Estratégia: Snapshot Diferencial por Elemento**

Não é snapshot completo do canvas (custoso demais). Cada operação gera um `Op`:

```ts
type Op =
  | { type: 'add';    element: FabricJSON }
  | { type: 'delete'; id: string; snapshot: FabricJSON }
  | { type: 'update'; id: string; before: Partial<FabricJSON>; after: Partial<FabricJSON> }
  | { type: 'batch';  ops: Op[] }
```

- Stack de undo: máximo 50 ops
- `Ctrl+Z` → desfaz 1 op; broadcast `element:batch` com op invertida
- `Ctrl+Y` ou `Ctrl+Shift+Z` → refaz

**Importante:** undo/redo é **local por usuário** — não propaga para os outros. Apenas as mudanças resultantes são propagadas via broadcast.

---

## 13. Múltiplos Boards

### 13.1 Listagem

- Painel superior (`BoardTopbar`) exibe lista horizontal de boards
- Cada board tem: nome, ícone de visibilidade (👁/🔒), badge "ATIVO" quando for o board que o mestre está exibindo
- Narrador pode criar, renomear, reordenar (drag), excluir e duplicar boards
- Jogadores veem apenas boards com `is_visible = true`

### 13.2 Board Ativo vs. Board Local

```
Narrador             Jogador A              Jogador B
[Board 2 - ativo] ←──broadcast──→ [Board 2 - alerta!]   [Board 2 - alerta!]
(trabalhando no     (estava no Board 1,     (já no Board 2,
 Board 3 em         recebe alerta)           sem alerta)
 silêncio)
```

**Fluxo de "Chamar para o Board":**
1. Narrador clica em botão **"📢 Chamar todos para este board"** no BoardTopbar
2. Broadcast `board:call` com `{ boardId, boardName }` via canal `game:{gameId}`
3. Todos os jogadores que **não estão** neste board recebem `BoardAlert.svelte`:
   - Banner fixo no topo: `"🗺️ O Mestre está no [Nome do Board] — Clique para ir"`
   - Clicar no banner muda o `localBoardId` do jogador para o board chamado
   - Alert desaparece automaticamente após a troca
4. O board chamado fica marcado com badge especial na lista de boards

**Fluxo de Troca Silenciosa:**
1. Narrador troca de board normalmente (sem clicar em chamar)
2. Broadcast `board:active` registra o board ativo apenas para o sistema
3. Badge "ATIVO" atualiza para todos na lista
4. **Nenhum alerta** é disparado para jogadores
5. Jogadores continuam onde estão

---

## 14. Rastreio de Cursores Remotos

### 14.1 Broadcast

Ao mover o mouse no canvas, broadcast debounced (50ms):
```ts
channel.send({
  type: 'broadcast',
  event: 'cursor',
  payload: {
    userId: authState.userId,
    name: authState.displayName,
    color: userCursorColor,    // cor atribuída ao entrar na sessão
    x: canvasX,                // coordenadas do canvas (não da tela)
    y: canvasY,
  }
})
```

### 14.2 Renderização

`BoardCursors.svelte` é um `<div>` em posição absoluta, sobreposição ao canvas, com `pointer-events: none`. Cada cursor é um componente com:
- Seta SVG na cor do usuário
- Badge com nome abaixo da seta
- Fade-out após 3s de inatividade

### 14.3 Cores dos Cursores

Atribuídas no momento em que o usuário entra na sessão do board, ciclando por uma paleta de 12 cores saturadas distintas, armazenadas no `boardState`.

---

## 15. Gaveta de Assets

### 15.1 Estrutura

`AssetDrawer.svelte` é um painel deslizante (slide-over) ativado pelo atalho `Shift+A` ou pelo botão na toolbar.

### 15.2 Carregamento de Assets Locais

Os assets são carregados diretamente da pasta `static/assets/` e subpastas, via endpoint SvelteKit:

```
GET /api/assets
```

**`src/routes/api/assets/+server.ts`:**
```ts
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  const root = 'static/assets'
  const tree = await buildTree(root, root)
  return Response.json(tree)
}

async function buildTree(basePath: string, rootPath: string) {
  const entries = await readdir(basePath, { withFileTypes: true })
  const result = { folders: [], files: [] }

  for (const entry of entries) {
    const fullPath = join(basePath, entry.name)
    const relativePath = fullPath.replace(rootPath + '/', '')

    if (entry.isDirectory()) {
      result.folders.push({
        name: entry.name,
        path: relativePath,
        children: await buildTree(fullPath, rootPath)
      })
    } else if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(entry.name)) {
      result.files.push({
        name: entry.name,
        path: '/' + fullPath,   // URL pública
        relativePath
      })
    }
  }

  return result
}
```

**Importante:** Em produção (build estático), este endpoint não funcionará. Nesse caso, gerar um arquivo `assets-manifest.json` em build time via script Vite plugin:

```ts
// vite-plugin-asset-manifest.ts
export function assetManifestPlugin() {
  return {
    name: 'asset-manifest',
    async buildStart() {
      // gera static/assets-manifest.json
    }
  }
}
```

### 15.3 Interface da Gaveta

```
┌─────────────────────────────┐
│ 🖼️ Assets                [×]│
│ ┌─────────────────────────┐ │
│ │ 🔍 Buscar assets...     │ │
│ └─────────────────────────┘ │
│                             │
│ 📁 maps/                    │
│   📁 dungeons/              │
│     🖼 dungeon-01.jpg       │
│     🖼 dungeon-02.jpg       │
│   📁 wilderness/            │
│     🖼 forest.png           │
│ 📁 tokens/                  │
│   🖼 goblin.png             │
│   🖼 dragon.png             │
│ 📁 textures/                │
│   🖼 stone.jpg              │
│                             │
│  [Vista: Grade] [Vista: Lista]│
└─────────────────────────────┘
```

### 15.4 Inserção de Asset

- **Drag & Drop** do painel para o canvas → insere como `fabric.Image` na posição solta
- **Clique simples** → insere no centro do viewport
- **Clique direito** → menu com opções: "Inserir como Fundo", "Inserir como Token", "Inserir Normal"

### 15.5 Bancos de Imagens Linkados (Futuro / v2)

Campo de configuração no painel de admin do jogo para adicionar URLs externas de CDN de imagens (ex: OpenGameArt, 2-Minute Tabletop CDN, assets do próprio projeto). Estes aparecem como pastas especiais `🌐` na gaveta, carregados via API paginada.

---

## 16. Painel de Propriedades (Objeto Selecionado)

Aparece no lado direito quando um ou mais objetos estão selecionados:

### Seleção Única

| Seção | Propriedades |
|---|---|
| **Posição** | X, Y (inputs numéricos) |
| **Dimensões** | Largura, Altura, manter proporção |
| **Transformação** | Rotação (slider -180° a +180°, input numérico), Escala X, Escala Y |
| **Aparência** | Cor de preenchimento, Cor da borda, Espessura da borda, Opacidade |
| **Texto** *(se texto)* | Fonte, Tamanho, Estilo, Alinhamento |
| **Token** *(se token)* | Cor da borda, Exibir nome, Exibir HP |
| **Ordem** | Trazer para frente (`]`), Enviar para trás (`[`), Para o topo, Para o fundo |
| **Ações** | Duplicar (`Ctrl+D`), Excluir (`Delete`), Bloquear posição |

### Seleção Múltipla

- Alinhar (esquerda, centro, direita, cima, meio, baixo)
- Distribuir horizontalmente / verticalmente
- Agrupar / Desagrupar
- Excluir todos

---

## 17. Atalhos de Teclado Completos

### Navegação / View

| Atalho | Ação |
|---|---|
| `Space` (hold) | Ativa pan temporário |
| `Scroll` | Zoom in/out |
| `Ctrl+Scroll` | Zoom in/out (alternativo) |
| `+` / `-` | Zoom +/- |
| `Shift+0` | Fit canvas ao viewport |
| `1` | Zoom 100% |
| `2` | Zoom 200% |
| `Ctrl+←↑→↓` | Pan por 100px |

### Ferramentas

| Atalho | Ferramenta |
|---|---|
| `V` ou `Esc` | Selecionar |
| `H` | Pan |
| `P` | Lápis livre |
| `B` | Brush suave |
| `I` | Brush de tinta |
| `M` | Marcador |
| `E` | Borracha |
| `L` | Linha |
| `A` | Seta |
| `X` | Conector |
| `R` | Retângulo |
| `O` | Elipse |
| `G` | Polígono |
| `T` | Texto |
| `N` | Sticky note |
| `Shift+I` | Inserir imagem |
| `K` | Inserir token |
| `F` | Fog: adicionar |
| `Shift+F` | Fog: revelar |
| `D` | Medidor de distância |

### Edição

| Atalho | Ação |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copiar |
| `Ctrl+V` | Colar |
| `Ctrl+D` | Duplicar |
| `Ctrl+A` | Selecionar tudo |
| `Delete` / `Backspace` | Excluir seleção |
| `Ctrl+G` | Agrupar seleção |
| `Ctrl+U` | Desagrupar |
| `]` | Trazer para frente |
| `[` | Enviar para trás |
| `Shift+]` | Trazer para o topo |
| `Shift+[` | Enviar para o fundo |
| `←↑→↓` | Mover 1px (ou 1 célula se snap ativo) |
| `Shift+←↑→↓` | Mover 10px |

### Board / Sistema

| Atalho | Ação |
|---|---|
| `Shift+A` | Toggle gaveta de assets |
| `Ctrl+Shift+G` | Toggle snap magnético |
| `Ctrl+Shift+F` | Toggle fog of war |
| `Ctrl+Shift+H` | Toggle grid |

### Modificadores durante desenho

| Modificador | Efeito |
|---|---|
| `Shift` (ao criar forma) | Proporção 1:1 (círculo perfeito, quadrado perfeito) |
| `Alt` (ao criar forma) | Expande a partir do centro |
| `Shift` (ao mover) | Restringe a eixo X ou Y |
| `Shift` (ao rotacionar) | Snap de 15° em 15° |

---

## 18. Transformações

Todos os objetos Fabric.js suportam as seguintes transformações:

- **Mover:** drag direto ou inputs X/Y no painel
- **Redimensionar:** handles de canto / lateral (com `Shift` para manter proporção)
- **Rotacionar:** handle no topo + input de grau no painel + atalho `Shift` para snap
- **Esticar:** redimensionar sem manter proporção (handles laterais)
- **Espelhar:** botões no painel de propriedades (flip horizontal / vertical)
- **Bloquear:** flag `lockMovementX/Y` e `lockScalingX/Y` e `lockRotation`

---

## 19. Zoom e Pan

- **Zoom:** `fabric.Canvas.zoomToPoint()` — zoom centrado no cursor do mouse
- **Pan:** `fabric.Canvas.relativePan()` — move o viewport
- **Limites:** zoom mínimo 5%, máximo 2000%
- **Minimap** (`BoardMinimap.svelte`): canvas miniatura no canto inferior direito mostrando posição do viewport com retângulo vermelho. Clicável para navegar rapidamente.

---

## 20. Performance e Sincronização

### 20.1 Throttle/Debounce de Broadcasts

| Evento | Estratégia | Delay |
|---|---|---|
| `cursor` | throttle | 50ms |
| `element:update` (mover/resize) | throttle | 80ms |
| `element:update` (finalizado) | imediato no `mouseup` | — |
| `brush stroke` | debounce | 200ms após `mouseup` |
| `fog:update` | debounce | 300ms |

### 20.2 Persistência vs. Broadcast

Broadcasts são **efêmeros** (não persistidos pelo Supabase). A persistência real é feita via `UPDATE board_elements` no Supabase Postgres. Estratégia:

1. Broadcast imediato → todos veem a mudança em ~50ms
2. Upsert no banco via `supabase.from('board_elements').upsert(...)` — debounced em 500ms após a última mudança

### 20.3 Carregamento Inicial do Board

1. `SELECT * FROM board_elements WHERE board_id = $id ORDER BY z_index`
2. Desserializar cada `fabric_json` via `canvas.loadFromJSON()`
3. Subscrever canal Realtime do board
4. Renderizar fog overlay

### 20.4 Reconciliação de Conflitos

Last-Write-Wins via `updated_at`. Se dois usuários editam o mesmo elemento simultaneamente, o último broadcast vence. Para o futuro: implementar CRDT-lite baseado em `updated_at` comparando antes de aplicar.

---

## 21. Segurança e Row Level Security (Supabase)

```sql
-- Apenas narrador do jogo pode criar/editar boards
CREATE POLICY "narrador_manage_boards" ON boards
  USING (
    EXISTS (
      SELECT 1 FROM game_members
      WHERE game_id = boards.game_id
        AND user_id = auth.uid()
        AND role = 'narrador'
    )
  );

-- Jogadores só veem boards visíveis
CREATE POLICY "player_view_visible_boards" ON boards
  FOR SELECT USING (
    is_visible = true
    OR EXISTS (
      SELECT 1 FROM game_members
      WHERE game_id = boards.game_id
        AND user_id = auth.uid()
        AND role = 'narrador'
    )
  );

-- Elementos: narrador pode tudo; jogadores lêem se board visível
CREATE POLICY "elements_select" ON board_elements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN game_members gm ON gm.game_id = b.game_id
      WHERE b.id = board_elements.board_id
        AND gm.user_id = auth.uid()
        AND (b.is_visible = true OR gm.role = 'narrador')
    )
  );
```

---

## 22. Biblioteca Principal: Fabric.js

**Versão:** `fabric@7.x` 

**Por que Fabric.js?**
- API madura e completa para manipulação de objetos canvas
- Serialização/desserialização JSON nativa
- Suporte a grupos, clipPath, eventos ricos
- `EraserBrush` disponível
- Boa performance para casos de uso de VTT (virtual tabletop)

**Instalação:**
```bash
npm install fabric
```

**Integração com Svelte:**
```svelte
<!-- BoardCanvas.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte'
  import { Canvas } from 'fabric'
  import { boardState } from '$lib/state/boardState.svelte'

  let canvasEl: HTMLCanvasElement
  let fabricCanvas: Canvas

  onMount(() => {
    fabricCanvas = new Canvas(canvasEl, {
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
      preserveObjectStacking: true,
    })
    boardState.mountCanvas(fabricCanvas)
  })

  onDestroy(() => {
    boardState.unmountCanvas()
    fabricCanvas.dispose()
  })
</script>

<canvas bind:this={canvasEl} />
```

---

## 23. Responsividade e Resize

- O canvas ocupa 100% da área disponível (tela completa menos toolbars)
- `ResizeObserver` no container → `canvas.setDimensions({ width, height })` ao redimensionar a janela
- O viewport (pan/zoom) é preservado no resize

---

## 24. Acessibilidade (Mínimo Viável)

- Todos os botões da toolbar têm `aria-label` e `title` (tooltip com atalho)
- O alerta de board (`BoardAlert`) usa `role="alert"` e `aria-live="assertive"`
- Focus trap no modal TokenPicker

---

## 25. Roadmap / Fases de Implementação

### Fase 1 — Core Canvas (MVP)
- [ ] Fabric.js + BoardCanvas.svelte
- [ ] Ferramentas: select, pan, pencil, rect, ellipse, text, image
- [ ] Undo/Redo local
- [ ] Board único por jogo
- [ ] Persistência no Supabase

### Fase 2 — Colaboração
- [ ] Broadcast Supabase em tempo real
- [ ] Cursores remotos
- [ ] Múltiplos boards + visibilidade
- [ ] Board ativo (narrador) + alertas

### Fase 3 — Recursos VTT
- [ ] Tokens de card
- [ ] Fog of War
- [ ] Grid quadrado + snap
- [ ] Grid hexagonal
- [ ] Gaveta de assets (local)
- [ ] Conectores / ligações

### Fase 4 — Polish
- [ ] Brushes avançados (ink, soft, marker)
- [ ] Minimap
- [ ] Painel de propriedades completo
- [ ] Espelhar, alinhar, distribuir
- [ ] Todos os atalhos de teclado
- [ ] Sticky notes

### Fase 5 — Expansão
- [ ] Assets externos / bancos linkados
- [ ] Exportar board como PNG/PDF
- [ ] Templates de board
- [ ] Permissão por board para jogadores editarem
- [ ] Histórico de versões de board

---

## 26. Glossário

| Termo | Definição |
|---|---|
| **Board** | Um canvas individual dentro de um jogo |
| **Board Ativo** | O board que o narrador está exibindo para os jogadores |
| **Board Local** | O board que um usuário específico está visualizando no momento |
| **Token** | Representação visual de um card do jogo no canvas |
| **Fog of War** | Camada de névoa que esconde regiões do mapa para os jogadores |
| **Snap Magnético** | Travamento automático de elementos nas células do grid |
| **Conector** | Linha que vincula dois elementos e os segue ao serem movidos |
| **Broadcast** | Mensagem efêmera em tempo real via Supabase Realtime |
| **Op** | Operação atômica de mudança no canvas (add/update/delete) |
