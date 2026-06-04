<script>
import Button from '$components/ui/Button.svelte';
import Input from '$components/ui/Input.svelte';

let { onInsert, onClose } = $props();

// ── Tab state ──────────────────────────────────────────────────────────
type Tab = 'hp' | 'stat' | 'money' | 'count' | 'xp' | 'nota' | 'hide';
let activeTab = $state<Tab>('hp');

// ── Common fields ──────────────────────────────────────────────────────
let position = $state(''); // '' | 'left' | 'right' | 'bottom'
let hidden = $state(false); // # flag

// ── HP ─────────────────────────────────────────────────────────────────
let hpCurrent = $state(100);
let hpMax = $state(100);

// ── Stat ───────────────────────────────────────────────────────────────
let statName = $state('FOR');
let statValue = $state(10);

// Auto-compute modifier for D&D scores
const statMod = $derived(
  Number.isInteger(statValue) && statValue >= 1 && statValue <= 30
    ? Math.floor((statValue - 10) / 2)
    : null,
);
const statModLabel = $derived(
  statMod !== null ? (statMod >= 0 ? `+${statMod}` : `${statMod}`) : '',
);

// ── Money ──────────────────────────────────────────────────────────────
let moneyCurrent = $state(0);
let moneyCurrency = $state('PO');

// ── Count ──────────────────────────────────────────────────────────────
let countName = $state('Flechas');
let countCurrent = $state(10);
let countMax = $state(10);
let countTheme = $state<'number' | 'checkbox'>('number');
let countIcon = $state('');
let countOverlay = $state(false); // [*count] vs [count]

// ── XP ─────────────────────────────────────────────────────────────────
let xpCurrent = $state(0);
let xpLabel = $state('XP');

// ── Nota ───────────────────────────────────────────────────────────────
let notaTitulo = $state('');
let notaConteudo = $state('');

// ── Hide block ─────────────────────────────────────────────────────────
let hideConteudo = $state('');

// ── Build shortcode string ─────────────────────────────────────────────
function buildPositionAndHidden(pos: string, hid: boolean): string {
  const parts: string[] = [];
  if (pos) parts.push(pos);
  if (hid) parts.push('#');
  return parts.length ? ' ' + parts.join(' ') : '';
}

function insert() {
  const ph = buildPositionAndHidden(position, hidden);

  switch (activeTab) {
    case 'hp':
      onInsert('hp', { current: hpCurrent, max: hpMax, extra: ph });
      break;
    case 'stat':
      onInsert('stat', { name: statName, value: statValue, extra: ph });
      break;
    case 'money':
      onInsert('money', { current: moneyCurrent, currency: moneyCurrency, extra: ph });
      break;
    case 'count':
      onInsert('count', {
        name: countName,
        current: countCurrent,
        max: countMax,
        theme: countTheme,
        icon: countIcon,
        overlay: countOverlay,
        extra: ph,
      });
      break;
    case 'xp':
      onInsert('xp', { current: xpCurrent, label: xpLabel, extra: ph });
      break;
    case 'nota':
      onInsert('nota', { titulo: notaTitulo, conteudo: notaConteudo, hidden });
      break;
    case 'hide':
      onInsert('hide', { conteudo: hideConteudo });
      break;
  }
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'hp', label: 'HP', emoji: '❤️' },
  { id: 'stat', label: 'Atributo', emoji: '⚔️' },
  { id: 'money', label: 'Dinheiro', emoji: '💰' },
  { id: 'count', label: 'Contador', emoji: '🔢' },
  { id: 'xp', label: 'XP', emoji: '⭐' },
  { id: 'nota', label: 'Nota', emoji: '📋' },
  { id: 'hide', label: 'Ocultar', emoji: '🔒' },
];

const hasPosHidden = $derived(!['nota', 'hide'].includes(activeTab));
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
  <button class="absolute inset-0 bg-black/50" onclick={onClose} aria-label="Fechar"></button>

  <div class="relative bg-popover border rounded-lg shadow-xl w-[500px] max-h-[85vh] overflow-hidden flex flex-col">

    <!-- Header -->
    <div class="p-4 border-b shrink-0">
      <h2 class="text-base font-bold text-foreground">Inserir Shortcode RPG</h2>
      <p class="text-xs text-muted-foreground mt-0.5">Adicione elementos interativos à ficha</p>
    </div>

    <!-- Tab bar -->
    <div class="flex border-b shrink-0 overflow-x-auto scrollbar-none">
      {#each TABS as tab}
        <button
          class="flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer
            {activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'}"
          onclick={() => { activeTab = tab.id; }}
        >
          <span>{tab.emoji}</span> {tab.label}
        </button>
      {/each}
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">

      <!-- ── HP ───────────────────────────────────────────────────── -->
      {#if activeTab === 'hp'}
        <p class="text-xs text-muted-foreground">Barra de pontos de vida com estados de cor automáticos.</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">PV Atual</label>
            <Input type="number" bind:value={hpCurrent} min="0" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">PV Máximo</label>
            <Input type="number" bind:value={hpMax} min="1" />
          </div>
        </div>
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1">
          [hp current={hpCurrent} max={hpMax}]
        </div>

      <!-- ── STAT ─────────────────────────────────────────────────── -->
      {:else if activeTab === 'stat'}
        <p class="text-xs text-muted-foreground">Atributo clicável — rola 1d20 + modificador automaticamente calculado.</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Nome</label>
            <Input bind:value={statName} placeholder="FOR, DEX, INT…" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Valor (1–30 ou +mod)</label>
            <Input type="number" bind:value={statValue} />
          </div>
        </div>
        {#if statModLabel}
          <p class="text-xs text-muted-foreground">
            Modificador automático: <span class="font-bold text-primary">{statModLabel}</span>
            (rolará 1d20{statModLabel})
          </p>
        {/if}
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1">
          [stat "{statName}" "{statValue}"]
        </div>

      <!-- ── MONEY ────────────────────────────────────────────────── -->
      {:else if activeTab === 'money'}
        <p class="text-xs text-muted-foreground">Valor de dinheiro interativo — clique para editar.</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Quantidade</label>
            <Input type="number" bind:value={moneyCurrent} min="0" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Moeda</label>
            <select bind:value={moneyCurrency} class="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground border-input">
              <option value="PO">Ouro (PO)</option>
              <option value="PP">Prata (PP)</option>
              <option value="PC">Cobre (PC)</option>
              <option value="PE">Platina (PE)</option>
              <option value="GP">GP</option>
              <option value="SP">SP</option>
              <option value="CP">CP</option>
            </select>
          </div>
        </div>
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1">
          [money current={moneyCurrent} currency={moneyCurrency}]
        </div>

      <!-- ── COUNT ────────────────────────────────────────────────── -->
      {:else if activeTab === 'count'}
        <p class="text-xs text-muted-foreground">Contador de recursos (flechas, poções, feitiços…).</p>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Nome</label>
          <Input bind:value={countName} placeholder="Flechas, Slots de Feitiço…" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Atual</label>
            <Input type="number" bind:value={countCurrent} min="0" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Máximo</label>
            <Input type="number" bind:value={countMax} min="1" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Tema visual</label>
            <select bind:value={countTheme} class="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground border-input">
              <option value="number">Numérico (3/10)</option>
              <option value="checkbox">Caixas (●●●○○)</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Ícone (emoji)</label>
            <Input bind:value={countIcon} placeholder="🏹 💊 ✨" />
          </div>
        </div>
        <label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" bind:checked={countOverlay} class="rounded" />
          Flutuante / Overlay (<code>[*count]</code>)
        </label>
        <!-- Preview -->
        {#if countTheme === 'checkbox' && countMax <= 20}
          <div class="flex gap-1 flex-wrap text-base">
            {#each Array(countMax) as _, i}
              <span class={i < countCurrent ? 'text-primary' : 'text-muted-foreground/30'}>
                {i < countCurrent ? '●' : '○'}
              </span>
            {/each}
          </div>
        {/if}
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1">
          [{countOverlay ? '*' : ''}count "{countName}" max={countMax} current={countCurrent}{countTheme !== 'number' ? ' ' + countTheme : ''}{countIcon ? ` icon="${countIcon}"` : ''}]
        </div>

      <!-- ── XP ───────────────────────────────────────────────────── -->
      {:else if activeTab === 'xp'}
        <p class="text-xs text-muted-foreground">Experiência ou qualquer recurso acumulável com label customizável.</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Valor atual</label>
            <Input type="number" bind:value={xpCurrent} min="0" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">Label</label>
            <Input bind:value={xpLabel} placeholder="XP, Rep, Glória…" />
          </div>
        </div>
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1">
          [xp current={xpCurrent} label="{xpLabel}"]
        </div>

      <!-- ── NOTA ─────────────────────────────────────────────────── -->
      {:else if activeTab === 'nota'}
        <p class="text-xs text-muted-foreground">Bloco de nota com título destacado. Use # para ocultar dos jogadores.</p>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Título da nota</label>
          <Input bind:value={notaTitulo} placeholder="Informações secretas, lore…" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Conteúdo</label>
          <textarea
            bind:value={notaConteudo}
            rows="4"
            placeholder="Conteúdo da nota..."
            class="w-full px-3 py-2 text-sm rounded-md border bg-background text-foreground outline-none focus:border-primary/80 resize-none placeholder:text-muted-foreground/40"
          ></textarea>
        </div>
        <label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" bind:checked={hidden} class="rounded" />
          Oculto para jogadores (#)
        </label>
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1 whitespace-pre-wrap">
{`[nota titulo="${notaTitulo}"${hidden ? ' #' : ''}]
${notaConteudo}
[/nota]`}
        </div>

      <!-- ── HIDE ─────────────────────────────────────────────────── -->
      {:else if activeTab === 'hide'}
        <p class="text-xs text-muted-foreground">Bloco de conteúdo visível apenas para o narrador. Os jogadores não verão isso.</p>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Conteúdo oculto</label>
          <textarea
            bind:value={hideConteudo}
            rows="5"
            placeholder="Segredos, motivações do inimigo, plot hooks…"
            class="w-full px-3 py-2 text-sm rounded-md border bg-background text-foreground outline-none focus:border-primary/80 resize-none placeholder:text-muted-foreground/40"
          ></textarea>
        </div>
        <div class="text-xs text-muted-foreground font-mono bg-secondary/20 rounded px-2 py-1 whitespace-pre-wrap">
{`[hide]
${hideConteudo}
[/hide]`}
        </div>
      {/if}

      <!-- ── Common: Posição + Oculto ─────────────────────────────── -->
      {#if hasPosHidden}
        <div class="border-t pt-3 space-y-3">
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Opções</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Posição na ficha</label>
              <select bind:value={position} class="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground border-input">
                <option value="">Padrão</option>
                <option value="left">Coluna esquerda</option>
                <option value="right">Coluna direita</option>
                <option value="bottom">Rodapé / largo</option>
              </select>
            </div>
            <div class="flex items-end pb-1.5">
              <label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" bind:checked={hidden} class="rounded" />
                Oculto (só narrador)
              </label>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="p-4 border-t bg-sidebar/30 flex justify-end gap-2 shrink-0">
      <Button variant="outline" onclick={onClose}>Cancelar</Button>
      <Button onclick={insert}>Inserir</Button>
    </div>
  </div>
</div>
