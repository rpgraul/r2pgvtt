# SPEC — RPGBoard: Drawing Mode (Quadro Interativo)

**Projeto:** RPGBoard  
**Stack:** SvelteKit + Supabase (Realtime Broadcast + Postgres) + Fabric.js  
**Versão:** 2.1  
**Status:** Referência Atualizada

---

## 1. Visão Geral

O **Drawing Mode** é um quadro colaborativo em tempo real integrado ao RPGBoard. Funciona como um whiteboard/gerenciador de mapas e tokens profissional para RPG de mesa. Suporta múltiplos boards por jogo, permissões diferenciadas entre Narrador e Jogadores, tokens de personagem, fog of war por camada, grid quadrado/hexagonal com snap magnético, rastreio de cursores, gaveta de assets e sincronização total via Supabase Realtime.

### 1.1 Princípios de Design

- **Layout minimalista, flutuante e sem scroll** — toolbar vertical à esquerda, painel de propriedades à direita, tudo dentro do canvas. A página nunca tem scroll externo.
- **Fundo branco** — canvas com `backgroundColor: #ffffff` sempre. O fog é preto.
- **Narrador controla, Jogadores navegam** — o mestre cria e gerencia; jogadores podem apenas visualizar e anotar (com permissão).
- **Tempo real sem atrito** — mudanças aparecem instantaneamente para todos no mesmo board.
- **Atalhos como cidadão de primeira classe** — toda ação tem atalho de teclado; scroll e modificadores ajustam propriedades da ferramenta ativa.
- **Preview sempre visível** — lápis e borracha exibem preview de tamanho e cor em tempo real sob o cursor.

---

## 2. Layout

```
┌────────────────────────────────────────────────────────────┐
│  [↩ Undo] [↪ Redo]  [100%]  [Fit]           ← topbar dir  │
│                                                             │
│ ┌──────┐                              ┌─────────────────┐  │
│ │Select│                              │  Props Panel    │  │
│ │ Pan  │        CANVAS (branco)       │  (flutuante,    │  │
│ │──────│                              │   direita)      │  │
│ │Lápis │                              │                 │  │
│ │Borra.│                              └─────────────────┘  │
│ │──────│                                                    │
│ │Formas│                                                    │
│ │Linha │                                                    │
│ │Texto │                                                    │
│ │──────│                                                    │
│ │Imagem│                                                    │
│ │Token │                                                    │
│ │ Fog  │                                                    │
│ │ Grid │                                                    │
│ └──────┘                                                    │
│                                                             │
│        [Ferramenta ativa | info seleção]  ← statusbar      │
└────────────────────────────────────────────────────────────┘
```

- **Toolbar:** painel vertical flutuante, esquerda, centralizado verticalmente, border-radius, sem scroll
- **Props Panel:** painel flutuante, direita, aparece ao selecionar ferramenta ou objeto
- **Topbar:** canto superior direito — Undo, Redo, zoom %, Fit
- **Statusbar:** barra central inferior — nome da ferramenta ativa + info de seleção
- **Zero scroll externo** — `overflow: hidden` em html, body, #app

---

## 3. Modelo de Dados (Supabase)

### 3.1 Tabelas

```sql
CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Novo Board',
  is_visible  BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  grid_type   TEXT CHECK (grid_type IN ('none','square','hex')) DEFAULT 'none',
  grid_size   INT DEFAULT 60,
  grid_color  TEXT DEFAULT '#94a3b8',
  bg_color    TEXT DEFAULT '#ffffff',
  bg_image    TEXT,
  fog_enabled BOOLEAN NOT NULL DEFAULT false,   -- fog ativo no board?
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE board_elements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL,
  fabric_json JSONB NOT NULL,
  z_index     INT DEFAULT 0,
  group_id    UUID,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Fog é armazenado separadamente: lista de polígonos/retângulos revelados
-- O fog base cobre tudo; revelações são buracos nessa camada
CREATE TABLE board_fog (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  revealed    JSONB NOT NULL DEFAULT '[]',  -- array de {x, y, w, h} ou polígonos
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE board_session (
  game_id         UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  active_board_id UUID REFERENCES boards(id) ON DELETE SET NULL,
  called_at       TIMESTAMPTZ
);
```

### 3.2 Canais Supabase Realtime (Broadcast)

| Canal | Evento | Payload |
|---|---|---|
| `board:{boardId}` | `element:add` | `{ element: FabricJSON }` |
| `board:{boardId}` | `element:update` | `{ id, changes: FabricJSON }` |
| `board:{boardId}` | `element:delete` | `{ id }` |
| `board:{boardId}` | `element:batch` | `{ ops: Op[] }` |
| `board:{boardId}` | `cursor` | `{ userId, name, color, x, y }` — throttled 50ms |
| `board:{boardId}` | `fog:toggle` | `{ enabled: boolean }` |
| `board:{boardId}` | `fog:update` | `{ revealed: Region[] }` |
| `game:{gameId}` | `board:call` | `{ boardId, boardName }` |
| `game:{gameId}` | `board:active` | `{ boardId }` |

---

## 4. Ferramentas

### 4.1 Catálogo

| ID | Nome | Atalho | Descrição |
|---|---|---|---|
| `select` | Selecionar / Mover | `V` ou `Esc` | Seleciona, move, redimensiona, rotaciona |
| `pan` | Mover Canvas | `M` ou segurar `M` ou Scroll-click | Pan no canvas sem selecionar nada |
| `pencil` | Lápis Livre | `P` | Brush livre com preview |
| `eraser` | Borracha | `E` | Apaga partes de paths com preview |
| `shapes` | Formas | `S` | Abre opções de forma no painel |
| `line` | Linha / Seta | `L` | Linha reta simples ou com ponta de seta |
| `text` | Texto | `T` | Texto editável inline (clique no canvas) |
| `image` | Inserir Imagem | `I` | Upload via clique ou drag & drop |
| `token` | Inserir Token | `K` | Insere token ou card de personagem |
| `fog` | Fog of War | `F` | Liga/desliga fog e ferramentas de revelar/ocultar |
| `grid` | Grid | `G` | Abre configurações de grid no painel |

### 4.2 Modificadores durante desenho de formas

| Modificador | Efeito |
|---|---|
| `Alt` | Proporção 1:1 (círculo perfeito, quadrado perfeito) |
| `Shift` (ao mover) | Restringe a eixo X ou Y |
| `Shift` (ao rotacionar) | Snap de 15° em 15° |
| `Ctrl+Scroll` | Zoom centrado no cursor |
| `Scroll` | Zoom |

### 4.3 Atalhos de ajuste por ferramenta

| Ferramenta ativa | Scroll | Alt+Scroll |
|---|---|---|
| `pencil` | Tamanho do brush | Opacidade |
| `eraser` | Tamanho da borracha | — |
| qualquer outra | Zoom | — |

---

## 5. Preview de Ferramentas

Um círculo flutuante segue o cursor do mouse em tempo real ao usar lápis ou borracha:
- **Tamanho exato** em pixels (escalonado pelo zoom atual)
- **Cor e opacidade** do lápis; tom neutro para a borracha
- `pointer-events: none` — não interfere em cliques
- Desaparece ao trocar para outra ferramenta

```css
#brush-preview {
  position: fixed;
  border-radius: 50%;
  border: 1.5px solid rgba(0,0,0,.3);
  pointer-events: none;
  transform: translate(-50%, -50%);
}
```

---

## 6. Configurações por Ferramenta (Props Panel)

### 6.1 Lápis (`pencil`)

| Propriedade | Controle | Atalho |
|---|---|---|
| Cor | Color picker | — |
| Tamanho | Slider + input numérico (1–60px) | Scroll |
| Opacidade | Slider (0.05–1) | Alt+Scroll |
| Traço | Select: Sólido / Tracejado / Pontilhado | — |

### 6.2 Borracha (`eraser`)

| Propriedade | Controle |
|---|---|
| Tamanho | Slider + input numérico (5–120px) |

### 6.3 Formas (`shapes`)

| Propriedade | Controle |
|---|---|
| Tipo | Select: Retângulo, Elipse, Triângulo, Polígono, Estrela |
| Preenchido | Checkbox |
| Cor de fundo | Color picker |
| Cor da borda | Color picker |
| Largura da borda | Slider (0–20px) |
| Opacidade | Slider (0.05–1) |
| Raio da borda | Slider (0–50px) |
| Traço | Select: Sólido / Tracejado / Pontilhado |

**Criar:** clicar e arrastar. `Alt` mantém proporção 1:1.

### 6.4 Linha / Seta (`line`)

| Propriedade | Controle |
|---|---|
| Cor | Color picker |
| Espessura | Slider (1–20px) |
| Opacidade | Slider (0.05–1) |
| Seta | Checkbox |
| Traço | Select: Sólido / Tracejado / Pontilhado |

### 6.5 Texto (`text`)

| Propriedade | Controle |
|---|---|
| Cor | Color picker |
| Tamanho | Slider (8–144px) |
| Fonte | Select: 5 fontes (ver seção 7) |
| Negrito | Checkbox |
| Itálico | Checkbox |
| Opacidade | Slider (0.05–1) |

### 6.6 Token (`token`)

| Propriedade | Controle |
|---|---|
| Modo de exibição | Select: Token (circular) / Card (retangular) |
| Cor da borda | Color picker |
| Mostrar nome | Checkbox |

### 6.7 Fog of War (`fog`)

| Propriedade | Controle |
|---|---|
| Fog ativo | Toggle (liga/desliga a camada inteira) |
| Modo de pincel | Select: Revelar / Ocultar |
| Tamanho do pincel | Slider |
| Remover todo fog | Botão (desfaz revelações, volta ao total) |
| Desligar fog | Botão (remove a camada por completo) |

### 6.8 Grid (`grid`)

| Propriedade | Controle |
|---|---|
| Tipo | Select: Nenhum / Quadrado / Hexagonal |
| Tamanho | Slider (20–200px) |
| Snap magnético | Checkbox |

---

## 7. Tipografia

### 7.1 Fontes Disponíveis

| Nome Exibido | Google Fonts ID | Uso Sugerido |
|---|---|---|
| Mono | `JetBrains Mono` | Coordenadas, UI técnica |
| Cinzel | `Cinzel` | Títulos épicos, fantasy |
| Manuscrito | `Caveat` | Notas de aventureiro |
| Playfair | `Playfair Display` | Documentos formais |
| Lora | `Lora` | Texto corrido |

Carregamento lazy: a fonte só é injetada no `<head>` quando selecionada.

---

## 8. Grid e Snap Magnético

### 8.1 Grid Quadrado

- SVG overlay (`position: absolute`, `pointer-events: none`, `z-index: 2`)
- Recalculado a cada `after:render` do Fabric.js para acompanhar pan/zoom
- Opacidade padrão: 0.35 | Cor padrão: `#94a3b8`
- Tamanho padrão: 60px (configurável de 20 a 200px)

### 8.2 Grid Hexagonal

- SVG `<path>` com hexágonos flat-top
- Cálculo de offset para colunas pares/ímpares
- Acompanha transformações do viewport

### 8.3 Snap Magnético

```ts
function snapToGrid(x, y, gridSize, type) {
  if (type === 'square') {
    return { x: Math.round(x/gridSize)*gridSize, y: Math.round(y/gridSize)*gridSize }
  }
  // hex: pixel → axial → round → pixel
}
```

---

## 9. Fog of War

### 9.1 Modelo

O fog é uma **camada única preta** que cobre todo o canvas por cima de todos os elementos do board. Não é um conjunto de retângulos: é uma máscara global com buracos nas áreas reveladas pelo narrador.

**Fundo do canvas:** sempre branco (`#ffffff`).  
**Cor do fog:** sempre preto (`#000000`).

### 9.2 Estados

| Estado | Descrição |
|---|---|
| **Fog desligado** | A camada não existe. Todos veem tudo normalmente. |
| **Fog ligado** | Camada preta cobre todo o board. Narrador vê com ~40% de opacidade. Jogadores veem opaco (100%). |

### 9.3 Operações disponíveis para o Narrador

| Operação | Ferramenta | Efeito |
|---|---|---|
| **Ligar fog** | Botão toggle no painel | Cria a camada preta cobrindo tudo |
| **Revelar área** | Pincel "Revelar" | "Apaga" a máscara naquela região — jogadores passam a ver |
| **Ocultar área** | Pincel "Ocultar" | "Repinta" a máscara em área já revelada — jogadores perdem visão |
| **Remover todo fog** | Botão no painel | Remove todas as revelações (volta ao total) mas mantém fog ligado |
| **Desligar fog** | Botão toggle no painel | Remove a camada inteiramente — todos passam a ver tudo |

### 9.4 Implementação Técnica

O fog é implementado com um elemento HTML/SVG overlay separado do canvas Fabric.js, usando SVG com `<mask>` ou `<clipPath>`:

```
┌────────────── canvas stack ──────────────┐
│  [SVG Fog Overlay]   z-index: 50         │  ← camada preta com buracos
│  [Fabric Canvas]     z-index: 10         │  ← tudo (elementos, tokens, etc.)
│  [Grid SVG]          z-index: 2          │
│  [Canvas background] branco              │
└──────────────────────────────────────────┘
```

**Estrutura do SVG de fog:**

```svg
<svg id="fog-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:50; pointer-events:none (jogador) / all (narrador no modo fog)">
  <defs>
    <mask id="fog-mask">
      <!-- Fundo branco = visível para o fog (oculta o canvas) -->
      <rect width="100%" height="100%" fill="white"/>
      <!-- Buracos pretos = áreas reveladas (fog não aparece) -->
      <rect x="200" y="150" width="300" height="200" fill="black"/>
      <circle cx="500" cy="400" r="80" fill="black"/>
      <!-- ... demais regiões reveladas ... -->
    </mask>
  </defs>
  <!-- Camada preta com a máscara aplicada -->
  <rect width="100%" height="100%" fill="black" mask="url(#fog-mask)"
        opacity="1"     <!-- jogadores: 100% opaco -->
        opacity="0.4"   <!-- narrador: 40% transparente -->
  />
</svg>
```

O narrador usa pincel sobre o SVG overlay para adicionar/remover `<rect>` ou `<path>` dentro do `<mask>`. As regiões reveladas são persistidas em `board_fog.revealed`.

### 9.5 Sincronização

- Ao ligar/desligar o fog: broadcast `fog:toggle { enabled }`
- Ao revelar/ocultar área: broadcast `fog:update { revealed: Region[] }`
- Persistido em `board_fog` com debounce de 300ms
- Jogadores recebem o estado completo ao entrar no board

### 9.6 Visibilidade por Papel

| | Narrador | Jogador |
|---|---|---|
| **Fog desligado** | Vê tudo | Vê tudo |
| **Fog ligado** | Vê tudo com fog 40% opaco (transparente) | Fog 100% opaco (cego) |
| **Área revelada** | Vê a área normalmente | Vê a área normalmente |
| **Área oculta** | Vê com 40% de sobreposição | Não vê nada |
| **Ligar/desligar fog** | ✅ | ❌ |
| **Revelar áreas** | ✅ | ❌ |
| **Ocultar áreas** | ✅ | ❌ |

---

## 10. Tokens

### 10.1 Propósito

Tokens são representações visuais de personagens (PCs, NPCs, monstros, aliados) no mapa. Servem para o mestre e os jogadores marcarem posições no board. Não têm HP nem atributos — são puramente visuais e posicionais.

### 10.2 Dois Modos de Exibição

| Modo | Formato | Uso |
|---|---|---|
| **Token** | Circular, tamanho pequeno (~80px de diâmetro) | Marcar posição de personagem no mapa |
| **Card** | Retangular, mantém proporção da imagem (~200px de largura) | Mostrar NPC/criatura com mais destaque, apresentar personagem |

O modo pode ser alternado a qualquer momento via **clique direito → "Modo: Token / Card"** sem perder a imagem ou reposicionamento.

### 10.3 Estrutura Fabric.js

**Modo Token:**
```ts
const token = new fabric.Group([
  new fabric.Circle({
    radius: 40,
    fill: new fabric.Pattern({ source: croppedImage }),
    stroke: borderColor,   // cor da borda configurável
    strokeWidth: 3,
  }),
  new fabric.Text(name, {   // nome abaixo (opcional)
    fontSize: 11,
    fill: '#222222',
    textAlign: 'center',
    top: 46,
    originX: 'center',
  })
], {
  data: { type: 'token', mode: 'token', name, imageUrl },
  lockUniScaling: true,
})
```

**Modo Card:**
```ts
const card = new fabric.Group([
  new fabric.Image(imgElement, {
    scaleX: targetWidth / imgElement.width,
    scaleY: (targetWidth / imgElement.width),  // mantém proporção
  }),
  new fabric.Text(name, {   // nome abaixo (opcional)
    fontSize: 12,
    fill: '#222222',
    textAlign: 'center',
    top: scaledHeight + 6,
    originX: 'center',
  })
], {
  data: { type: 'token', mode: 'card', name, imageUrl },
})
```

### 10.4 Borda do Token

Configurável no painel de propriedades ao selecionar o token. Cores sugeridas pré-definidas:

| Cor | Papel |
|---|---|
| 🟡 Dourado `#c8a96e` | PC (personagem jogável) |
| 🔴 Vermelho `#c84848` | Inimigo |
| 🟢 Verde `#48c87c` | Aliado |
| ⚪ Prata `#a0a0b8` | NPC neutro |
| 🟣 Roxo `#8848c8` | Especial / Mágico |

### 10.5 Inserção

1. Usuário seleciona ferramenta `token` (`K`)
2. Clica no canvas ou arrasta uma imagem (do PC, de asset, ou upload)
3. Token é inserido no modo padrão (Token circular) no ponto clicado
4. Painel de propriedades abre com opções de modo, borda e nome

### 10.6 Troca de Modo (Token ↔ Card)

Via **clique direito → "Exibir como Card"** ou **"Exibir como Token"**:
- A imagem e posição são preservadas
- O objeto Fabric é reconstruído no novo formato
- O `data.mode` é atualizado e propagado via broadcast

### 10.7 Menu de Contexto do Token

```
┌────────────────────────────┐
│ ✎  Renomear                │
│ ○  Exibir como Token       │  ← (se estiver em modo Card)
│ ▭  Exibir como Card        │  ← (se estiver em modo Token)
│ ─────────────────────────  │
│ ↑  Trazer à frente         │
│ ↓  Enviar ao fundo         │
│ ⧉  Duplicar                │
│ ─────────────────────────  │
│ ✕  Excluir                 │
└────────────────────────────┘
```

---

## 11. Menu de Contexto (Clique Direito)

### Em elemento comum:

| Ação | Descrição |
|---|---|
| ↑ Trazer à frente | `bringForward()` |
| ↓ Enviar ao fundo | `sendBackwards()` |
| ⧉ Duplicar | Clona com offset de 20px |
| ⊙ Bloquear | Toggle `lockMovement/Scaling/Rotation` |
| ⊞ Agrupar | (se múltiplos selecionados) |
| ⊟ Desagrupar | (se grupo) |
| ✕ Excluir | Remove do canvas |

### Em token:

Exibe menu específico de token (ver seção 10.7).

### Em área vazia:

| Ação | Descrição |
|---|---|
| ⊞ Selecionar tudo | Seleciona todos os objetos não-fog |
| ⊡ Colar | Cola o clipboard |
| ⊟ Limpar canvas | Confirma e limpa tudo |

---

## 12. Painel de Propriedades — Objeto Selecionado

Ao selecionar qualquer elemento, o painel de propriedades exibe suas configurações:

| Seção | Propriedades |
|---|---|
| **Posição** | X, Y (inputs numéricos) |
| **Dimensões** | Largura, Altura |
| **Transformação** | Rotação (slider -180° a +180°) |
| **Aparência** | Opacidade, Preenchimento, Cor da borda, Espessura |
| **Texto** *(se IText)* | Cor, Tamanho, Fonte, Negrito, Itálico |
| **Token** *(se token)* | Modo (Token/Card), Cor da borda, Mostrar nome |
| **Ordem** | Trazer à frente, Enviar ao fundo |
| **Ações** | Excluir |

---

## 13. Imagens

- **Ferramenta `I`:** abre `<input type="file" accept="image/*">`
- **Drag & Drop:** arrastar do sistema operacional para o canvas
- Centralizada no viewport atual ao inserir
- Redimensionamento automático se largura > 50% do canvas (mantém proporção)

---

## 14. Undo / Redo

Snapshot JSON completo do canvas (excluindo a camada de fog, que é gerenciada separadamente).

- Stack de undo: máximo 50 snapshots
- `Ctrl+Z` → restaura snapshot anterior
- `Ctrl+Y` → refaz
- Local por usuário — mudanças resultantes propagadas via broadcast
- Botões de Undo e Redo visíveis no topbar

---

## 15. Atalhos de Teclado Completos

### Ferramentas

| Atalho | Ferramenta |
|---|---|
| `V` ou `Esc` | Selecionar |
| `M` | Mover canvas |
| `P` | Lápis |
| `E` | Borracha |
| `S` | Formas |
| `L` | Linha / Seta |
| `T` | Texto |
| `I` | Inserir imagem |
| `K` | Inserir token |
| `F` | Fog of War |
| `G` | Grid |

### Navegação

| Atalho | Ação |
|---|---|
| `Scroll` | Zoom in/out |
| `Ctrl+Scroll` | Zoom alternativo |
| `Space` + arrastar | Pan |
| Scroll-click + arrastar | Pan |

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
| `Ctrl+G` | Agrupar |
| `Ctrl+U` | Desagrupar |
| `]` | Trazer para frente |
| `[` | Enviar para trás |

### Ajuste rápido (durante uso da ferramenta)

| Atalho | Lápis | Borracha |
|---|---|---|
| `Scroll` | Tamanho | Tamanho |
| `Alt+Scroll` | Opacidade | — |

---

## 16. Zoom e Pan

- **Zoom:** `canvas.zoomToPoint()` centrado no cursor
- **Pan:** `canvas.relativePan()` via `M` + drag ou scroll-click
- **Limites:** 5% – 2000%
- **Zoom display:** exibido em % no topbar
- **Fit:** restaura zoom 100% e viewport à origem

---

## 17. Múltiplos Boards

- Painel superior com lista horizontal de boards
- Narrador: criar, renomear, reordenar, excluir, duplicar
- Jogadores: veem apenas boards com `is_visible = true`
- **"Chamar para board":** broadcast `board:call`, jogadores recebem alerta clicável no topo
- **Troca silenciosa:** narrador troca sem notificar jogadores

---

## 18. Rastreio de Cursores Remotos

- Broadcast throttled a cada 50ms com posição `{x, y}` em coordenadas do canvas
- Overlay SVG com `pointer-events: none`
- Cada cursor: seta SVG colorida + badge com nome + fade-out após 3s
- 12 cores distintas atribuídas ao entrar na sessão

---

## 19. Gaveta de Assets

Ativada por `Shift+A`. Painel slide-over listando assets de `static/assets/`.

- Drag & Drop do painel para o canvas
- Clique simples insere no centro do viewport
- Clique direito: "Inserir como Fundo", "Inserir como Token", "Inserir Normal"
- Busca por nome | Vista grade ou lista

---

## 20. Conectores

- Linhas que "grudam" em elementos e os acompanham ao mover
- Estilos: reta, curva bezier, ortogonal
- Etiqueta de texto opcional
- Armazenados com `data.type: 'connector'` e `data.anchors: {from, to}`

---

## 21. Agrupamento

- `Ctrl+G` → agrupar seleção múltipla
- `Ctrl+U` → desagrupar
- Grupos transmitidos como um único elemento no broadcast

---

## 22. Performance e Sincronização

| Evento | Estratégia | Delay |
|---|---|---|
| `cursor` | throttle | 50ms |
| `element:update` (mover/resize) | throttle | 80ms |
| `element:update` (finalizado) | imediato no `mouseup` | — |
| `brush stroke` | debounce | 200ms após `mouseup` |
| `fog:update` | debounce | 300ms |

**Persistência:** broadcast imediato → upsert no banco debounced em 500ms. Last-Write-Wins via `updated_at`.

---

## 23. Segurança (Supabase RLS)

```sql
CREATE POLICY "narrador_manage_boards" ON boards
  USING (EXISTS (
    SELECT 1 FROM game_members
    WHERE game_id = boards.game_id AND user_id = auth.uid() AND role = 'narrador'
  ));

CREATE POLICY "player_view_visible_boards" ON boards
  FOR SELECT USING (
    is_visible = true OR EXISTS (
      SELECT 1 FROM game_members
      WHERE game_id = boards.game_id AND user_id = auth.uid() AND role = 'narrador'
    )
  );

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

-- Fog: narrador gerencia, jogadores lêem
CREATE POLICY "fog_select" ON board_fog
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards b
      JOIN game_members gm ON gm.game_id = b.game_id
      WHERE b.id = board_fog.board_id AND gm.user_id = auth.uid()
        AND (b.is_visible = true OR gm.role = 'narrador')
    )
  );

CREATE POLICY "fog_manage" ON board_fog
  USING (EXISTS (
    SELECT 1 FROM boards b
    JOIN game_members gm ON gm.game_id = b.game_id
    WHERE b.id = board_fog.board_id AND gm.user_id = auth.uid() AND gm.role = 'narrador'
  ));
```

---

## 24. Biblioteca Principal: Fabric.js

**Versão:** `fabric@5.x`

```bash
npm install fabric
```

```svelte
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
      backgroundColor: '#ffffff'
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

## 25. Responsividade e Resize

- Canvas ocupa 100% da área disponível
- `ResizeObserver` → `canvas.setDimensions({ width, height })`
- Viewport (pan/zoom) preservado no resize
- Grid SVG e fog overlay recalculados após resize

---

## 26. Acessibilidade (Mínimo Viável)

- Botões da toolbar com `aria-label`, `title` e tooltip com atalho
- Alerta de board com `role="alert"` e `aria-live="assertive"`
- Focus trap no modal de inserção de token

---

## 27. Roadmap / Fases de Implementação

### Fase 1 — Core Canvas (MVP)
- [ ] Fabric.js + BoardCanvas
- [ ] Ferramentas: select, pan, pencil, eraser, shapes, line, text, image
- [ ] Preview de lápis e borracha em tempo real
- [ ] Undo/Redo local (50 snapshots)
- [ ] Grid quadrado e hexagonal com SVG overlay
- [ ] Snap magnético
- [ ] Drag & Drop de imagens
- [ ] Menu de contexto com clique direito
- [ ] Painel de propriedades por ferramenta e por objeto selecionado
- [ ] 5 fontes via Google Fonts (lazy load)
- [ ] Atalhos de teclado completos
- [ ] Scroll para ajustar tamanho, Alt+Scroll para opacidade
- [ ] Agrupamento/desagrupamento
- [ ] Zoom display em %

### Fase 2 — Tokens e Fog
- [ ] Token modo circular (Token) com upload de imagem
- [ ] Token modo retangular (Card)
- [ ] Alternância Token ↔ Card via clique direito
- [ ] Fog of War: camada SVG global preta
- [ ] Fog: toggle liga/desliga
- [ ] Fog: pincel revelar área
- [ ] Fog: pincel ocultar área
- [ ] Fog: visibilidade diferenciada narrador (40%) vs jogador (100%)
- [ ] Persistência do fog em `board_fog`

### Fase 3 — Colaboração
- [ ] Broadcast Supabase em tempo real
- [ ] Cursores remotos
- [ ] Múltiplos boards + visibilidade
- [ ] Board ativo (narrador) + alertas
- [ ] Sync de fog entre usuários

### Fase 4 — Recursos VTT
- [ ] Gaveta de assets (local)
- [ ] Conectores / ligações com anchor
- [ ] Minimap de navegação

### Fase 5 — Polish
- [ ] Brushes avançados (ink, soft, marker)
- [ ] Painel de alinhamento e distribuição
- [ ] Sticky notes
- [ ] Medidor de distância em células

### Fase 6 — Expansão
- [ ] Assets externos / bancos linkados
- [ ] Exportar board como PNG/PDF
- [ ] Templates de board
- [ ] Permissão por board para jogadores editarem
- [ ] Histórico de versões de board

---

## 28. Glossário

| Termo | Definição |
|---|---|
| **Board** | Um canvas individual dentro de um jogo |
| **Board Ativo** | O board que o narrador está exibindo para os jogadores |
| **Board Local** | O board que um usuário específico está visualizando |
| **Token** | Representação visual circular de um personagem no mapa |
| **Card** | Representação visual retangular de um personagem (modo alternativo do token) |
| **Fog of War** | Camada preta global que oculta o mapa para jogadores; revelada progressivamente pelo narrador |
| **Snap Magnético** | Travamento automático de elementos nas células do grid |
| **Conector** | Linha que vincula dois elementos e os segue ao moverem |
| **Broadcast** | Mensagem efêmera em tempo real via Supabase Realtime |
| **Op** | Operação atômica de mudança no canvas (add/update/delete) |
| **Preview** | Indicador visual em tempo real do tamanho/cor da ferramenta ativa |
| **Região revelada** | Área do fog onde o narrador removeu a opacidade, tornando visível para jogadores |