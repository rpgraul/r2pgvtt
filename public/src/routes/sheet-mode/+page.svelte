<script>
import {
  BookOpen,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Send,
  User,
  X,
  Zap,
} from 'lucide-svelte';
import { onDestroy } from 'svelte';
import RichTextEditor from '$components/editor/RichTextEditor.svelte';
import { authState } from '$lib/state/auth.svelte.ts';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { db } from '$lib/supabase/tables';
import {
  calculateMathExpression,
  parseAllShortcodes,
  parseArguments,
  parseKeyValueArgs,
} from '$lib/utils/shortcodes.ts';

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let selectedCardId = $state(
  typeof window !== 'undefined' ? localStorage.getItem('rpgboard_selected_character_id') || '' : '',
);

let editedContent = $state('');
let isSaving = $state(false);
let privateNotes = $state('');
let chatInput = $state('');

// Macros
let macros = $state([]);
let showMacroModal = $state(false);
let macroName = $state('');
let macroRolls = $state([{ label: '', formula: '' }]); // [{label, formula}]
let macroError = $state('');

// ──────────────────────────────────────────────
// Derived
// ──────────────────────────────────────────────
const characters = $derived(gameState.items.filter((i) => i.category === 'pj'));
const selectedCard = $derived(characters.find((c) => c.id === selectedCardId));

const parsedContent = $derived(
  selectedCard ? parseAllShortcodes(selectedCard, { isPlayerSheet: true }) : null,
);

// ──────────────────────────────────────────────
// Load when character changes
// ──────────────────────────────────────────────
$effect(() => {
  if (selectedCard) {
    editedContent = selectedCard.conteudo || '';

    // Load private notes from Supabase
    const gameId = gameState.gameId;
    const userId = authState.user?.id;
    if (gameId && userId) {
      db.getSettings(`player_notes:${selectedCard.id}:${userId}`).then((val) => {
        privateNotes = typeof val === 'string' ? val : (val?.text || '');
      });
    } else {
      privateNotes = localStorage.getItem(`r2pg_notes_${selectedCard.id}`) || '';
    }

    // Load macros
    const saved = localStorage.getItem(`r2pg_macros_${selectedCard.id}`);
    macros = saved ? JSON.parse(saved) : selectedCard.macros || [];
  } else {
    editedContent = '';
    privateNotes = '';
    macros = [];
  }
});

// ──────────────────────────────────────────────
// Character selection
// ──────────────────────────────────────────────
function selectCharacter(id) {
  selectedCardId = id;
  if (typeof window !== 'undefined') localStorage.setItem('rpgboard_selected_character_id', id);
}

function changeCharacter() {
  selectedCardId = '';
  if (typeof window !== 'undefined') localStorage.removeItem('rpgboard_selected_character_id');
}

// ──────────────────────────────────────────────
// Auto-save content (debounced)
// ──────────────────────────────────────────────
let saveContentTimeout;
$effect(() => {
  // track editedContent changes
  const c = editedContent;
  if (!selectedCard || c === selectedCard.conteudo) return;

  clearTimeout(saveContentTimeout);
  isSaving = true;
  saveContentTimeout = setTimeout(async () => {
    try {
      await gameState.editCard(selectedCard.id, { conteudo: c });
    } finally {
      isSaving = false;
    }
  }, 1500);
});

onDestroy(() => clearTimeout(saveContentTimeout));

// ──────────────────────────────────────────────
// Notes – saved to Supabase with debounce
// ──────────────────────────────────────────────
let notesTimeout;
async function handlePrivateNotesInput() {
  // immediate localStorage backup
  if (selectedCardId) localStorage.setItem(`r2pg_notes_${selectedCardId}`, privateNotes);

  clearTimeout(notesTimeout);
  notesTimeout = setTimeout(async () => {
    const gameId = gameState.gameId;
    const userId = authState.user?.id;
    if (gameId && userId && selectedCard) {
      await db.updateSettings(`player_notes:${selectedCard.id}:${userId}`, { text: privateNotes });
    }
  }, 1500);
}

// ──────────────────────────────────────────────
// Macros
// ──────────────────────────────────────────────
function saveMacrosLocally() {
  if (selectedCardId) localStorage.setItem(`r2pg_macros_${selectedCardId}`, JSON.stringify(macros));
}

function openMacroModal() {
  macroName = '';
  macroRolls = [{ label: '', formula: '' }];
  macroError = '';
  showMacroModal = true;
}

function addRollRow() {
  macroRolls = [...macroRolls, { label: '', formula: '' }];
}

function removeRollRow(i) {
  if (macroRolls.length === 1) return;
  macroRolls = macroRolls.filter((_, idx) => idx !== i);
}

function saveMacro() {
  if (!macroName.trim()) { macroError = 'Dê um nome ao macro.'; return; }
  const validRolls = macroRolls.filter((r) => r.label.trim() && r.formula.trim());
  if (validRolls.length === 0) { macroError = 'Adicione pelo menos uma rolagem.'; return; }
  macros = [...macros, { nome: macroName.trim(), rolls: validRolls }];
  saveMacrosLocally();
  showMacroModal = false;
}

function deleteMacro(i) {
  macros = macros.filter((_, idx) => idx !== i);
  saveMacrosLocally();
}

async function runMacro(mac) {
  if (!mac.rolls?.length) return;

  const charName = selectedCard?.titulo || 'Personagem';
  const results = [];

  // Roll each sub-formula and collect results
  for (const r of mac.rolls) {
    try {
      const res = await diceStore.rollDice(r.formula);
      results.push({ label: r.label, total: res?.total ?? '?' });
    } catch {
      results.push({ label: r.label, total: '(erro)' });
    }
  }

  // Build combined chat message
  const lines = [`🎲 **[${charName}]** usou **[${mac.nome}]**`];
  results.forEach((r) => lines.push(`${r.label}: **${r.total}**`));
  gameState.addMessageToChatLocal(lines.join('\n'), 'system', charName);
}

// ──────────────────────────────────────────────
// Quick Dice & Chat footer
// ──────────────────────────────────────────────
async function rollQuickDice(formula) {
  diceStore.rollDice(formula).catch(console.error);
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const text = chatInput.trim();
  if (!text) return;
  if (text.startsWith('/r ') || text.startsWith('/roll ')) {
    diceStore.rollDice(text.replace(/^\/(r|roll)\s*/, '')).catch(console.error);
  } else {
    await gameState.sendMessage(text);
  }
  chatInput = '';
}

// ──────────────────────────────────────────────
// Shortcode interaction (sidebar stats)
// ──────────────────────────────────────────────
async function handleInteraction(event) {
  const target = event.target.closest('.is-interactive');
  if (!target) return;
  const shortcodeEncoded = target.getAttribute('data-shortcode');
  if (!shortcodeEncoded) return;

  const shortcode = decodeURIComponent(shortcodeEncoded);
  const inner = shortcode.slice(1, -1).trim();
  const args = parseArguments(inner);
  const command = args[0].replace(/^[#*]+/, '').toLowerCase();

  if (command === 'stat') {
    const label = args.slice(1, -1).join(' ');
    const valueStr = args[args.length - 1] || '10';
    let modifier = 0;
    if (valueStr.startsWith('+') || valueStr.startsWith('-')) {
      modifier = parseInt(valueStr, 10);
    } else {
      const val = parseInt(valueStr, 10);
      if (!isNaN(val)) modifier = Math.floor((val - 10) / 2);
    }
    const formula = `1d20${modifier >= 0 ? '+' : ''}${modifier}`;
    gameState.addMessageToChatLocal(`🎲 Teste de ${label} (${selectedCard.titulo})`, 'system', 'Sistema');
    diceStore.rollDice(formula).catch(console.error);
  } else {
    const labelMap = { hp: 'PV', money: 'Dinheiro', count: 'Contador', xp: 'XP' };
    const params = parseKeyValueArgs(args.slice(1));
    const currentValue = parseFloat(params.current || params.max || '0');
    const input = prompt(`Atualizar ${labelMap[command] || command}:\nValor (ex: 15) ou +5 / -10:`);
    if (input === null) return;

    const trimmed = input.trim();
    let newValue = trimmed.match(/^[+\-*/]/)
      ? calculateMathExpression(currentValue, trimmed)
      : parseFloat(trimmed);

    if (isNaN(newValue)) { alert('Valor inválido!'); return; }

    let newShortcode = '';
    if (command === 'hp') newShortcode = `[hp current=${newValue} max=${params.max || '100'}]`;
    else if (command === 'money') newShortcode = `[money current=${newValue} currency=${params.currency || 'PO'}]`;
    else if (command === 'count') newShortcode = `[count ${args.find((a) => !a.includes('=')) || ''} current=${newValue} max=${params.max || '10'}]`;
    else if (command === 'xp') newShortcode = `[xp current=${newValue}]`;

    if (newShortcode) {
      const newContent = (selectedCard.conteudo || '').replace(shortcode, newShortcode);
      gameState.editCard(selectedCard.id, { conteudo: newContent }).catch(console.error);
    }
  }
}

const diceList = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
</script>

<!-- ─────────────────────────────────────────── -->
<!-- CHARACTER SELECTION                         -->
<!-- ─────────────────────────────────────────── -->
{#if !selectedCard}
  <div class="h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-background p-6 select-none">
    <div class="max-w-md w-full text-center">
      <User class="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h2 class="text-lg font-bold text-foreground">Escolha seu Personagem</h2>
      <p class="text-xs text-muted-foreground mt-1 mb-6">A escolha é lembrada automaticamente.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#if characters.length === 0}
          <div class="sm:col-span-2 p-6 border border-dashed rounded text-xs text-muted-foreground">
            Nenhum card de personagem (PJ) encontrado. Peça ao narrador para criar um.
          </div>
        {:else}
          {#each characters as item}
            <button
              onclick={() => selectCharacter(item.id)}
              class="flex items-center gap-3 p-3.5 rounded border bg-card hover:bg-secondary/40 transition-colors text-left cursor-pointer w-full group"
            >
              {#if item.imagemUrl}
                <img src={item.imagemUrl} alt={item.titulo} class="w-12 h-12 object-contain rounded border shrink-0 bg-black" />
              {:else}
                <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center shrink-0 border">
                  <User class="w-6 h-6 text-muted-foreground" />
                </div>
              {/if}
              <div class="min-w-0">
                <p class="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{item.titulo || 'Sem título'}</p>
                <p class="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">Personagem</p>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>

<!-- ─────────────────────────────────────────── -->
<!-- SHEET VIEW                                  -->
<!-- ─────────────────────────────────────────── -->
{:else}
  <div class="flex flex-col h-[calc(100vh-48px)] overflow-hidden bg-background">

    <!-- 3-COLUMN LAYOUT -->
    <div class="flex flex-1 min-h-0 overflow-hidden">

      <!-- ══════════════════════════ -->
      <!-- LEFT SIDEBAR              -->
      <!-- ══════════════════════════ -->
      <aside class="w-56 shrink-0 border-r bg-sidebar flex flex-col overflow-hidden select-none">

        <!-- Character Avatar – full proportional image -->
        <div class="relative bg-black flex items-center justify-center overflow-hidden shrink-0" style="height: 200px;">
          {#if selectedCard.imagemUrl}
            <img
              src={selectedCard.imagemUrl}
              alt={selectedCard.titulo}
              class="max-w-full max-h-full object-contain"
              style="width:100%;height:100%;object-fit:contain;"
            />
          {:else}
            <User class="w-16 h-16 text-muted-foreground/20" />
          {/if}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <!-- Character Info -->
        <div class="px-3 py-2.5 border-b shrink-0">
          <span class="text-[9px] font-bold text-primary uppercase tracking-widest">Personagem</span>
          <h2 class="font-bold text-sm text-foreground leading-tight mt-0.5 truncate" title={selectedCard.titulo}>
            {selectedCard.titulo || 'Sem título'}
          </h2>
          <button
            onclick={changeCharacter}
            class="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw class="w-2.5 h-2.5" /> Trocar personagem
          </button>
        </div>

        <!-- Shortcodes stats -->
        {#if parsedContent && (parsedContent.left || parsedContent.right || parsedContent.bottom)}
          <div
            class="px-2 py-2 border-b shrink-0 space-y-1 overflow-y-auto max-h-44 scrollbar-thin"
            onclick={handleInteraction}
          >
            <p class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1">Atributos & Recursos</p>
            {#if parsedContent.bottom}<div class="space-y-1">{@html parsedContent.bottom}</div>{/if}
            {#if parsedContent.left}<div class="space-y-1">{@html parsedContent.left}</div>{/if}
            {#if parsedContent.right}<div class="space-y-1">{@html parsedContent.right}</div>{/if}
          </div>
        {/if}

        <!-- ── Macros ── -->
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-3 py-2 border-b flex items-center justify-between shrink-0">
            <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Zap class="w-3 h-3" /> Macros
            </span>
            <button
              onclick={openMacroModal}
              class="w-5 h-5 flex items-center justify-center rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Criar macro"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
            {#if macros.length === 0}
              <p class="text-[10px] text-muted-foreground text-center py-4">
                Nenhum macro.<br/>Clique em + para criar.
              </p>
            {:else}
              {#each macros as mac, i}
                <div class="group flex items-center gap-1">
                  <button
                    onclick={() => runMacro(mac)}
                    class="flex-1 text-left px-2 py-1.5 text-xs rounded border bg-background hover:bg-secondary/50 hover:border-primary/50 text-foreground font-semibold transition-colors cursor-pointer truncate"
                    title={mac.rolls?.map((r) => `${r.label}: ${r.formula}`).join(' | ')}
                  >
                    🎲 {mac.nome}
                  </button>
                  <button
                    onclick={() => deleteMacro(i)}
                    class="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all cursor-pointer shrink-0"
                    title="Remover macro"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </aside>

      <!-- ══════════════════════════ -->
      <!-- MAIN EDITOR (always on)   -->
      <!-- ══════════════════════════ -->
      <main class="flex-1 flex flex-col min-h-0 overflow-hidden">

        <!-- Toolbar strip -->
        <div class="flex items-center gap-2 px-4 py-1.5 border-b bg-sidebar/40 shrink-0 select-none">
          <span class="text-xs font-semibold text-foreground flex-1">Ficha de {selectedCard.titulo}</span>
          {#if isSaving}
            <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Loader2 class="w-3 h-3 animate-spin" /> Salvando...
            </span>
          {:else}
            <span class="text-[10px] text-muted-foreground/50">Salvo automaticamente</span>
          {/if}
        </div>

        <!-- Tiptap editor – always editable, fills the space -->
        <div class="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <RichTextEditor bind:content={editedContent} />
        </div>
      </main>

      <!-- ══════════════════════════ -->
      <!-- RIGHT: Notes              -->
      <!-- ══════════════════════════ -->
      <aside class="w-52 shrink-0 border-l bg-sidebar flex flex-col overflow-hidden select-none">
        <div class="px-3 py-2.5 border-b shrink-0">
          <p class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">📝 Notas Pessoais</p>
          <p class="text-[10px] text-muted-foreground/50 mt-0.5">Salvo no servidor • só você vê</p>
        </div>
        <textarea
          bind:value={privateNotes}
          oninput={handlePrivateNotesInput}
          placeholder="Suas anotações privadas..."
          class="flex-1 w-full p-3 text-xs bg-transparent text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/30 scrollbar-thin select-text"
        ></textarea>
      </aside>
    </div>

    <!-- ══════════════════════════ -->
    <!-- FOOTER                    -->
    <!-- ══════════════════════════ -->
    <footer class="shrink-0 border-t bg-sidebar flex items-center gap-3 px-3 py-2 select-none h-11">
      <div class="flex items-center gap-1 shrink-0">
        {#each diceList as dice}
          <button
            onclick={() => rollQuickDice(`1${dice}`)}
            class="px-1.5 py-1 text-[10px] font-bold rounded border bg-background hover:bg-secondary/60 hover:border-primary/50 text-foreground transition-colors cursor-pointer uppercase"
          >{dice}</button>
        {/each}
      </div>
      <div class="w-px h-5 bg-border shrink-0"></div>
      <form onsubmit={handleChatSubmit} class="flex-1 flex items-center gap-2">
        <input
          bind:value={chatInput}
          type="text"
          placeholder="Mensagem ou /r 1d20+5..."
          class="flex-1 h-7 px-2.5 text-xs rounded border bg-background text-foreground outline-none focus:border-primary/80 placeholder:text-muted-foreground/30 transition-colors"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          class="h-7 w-7 flex items-center justify-center rounded border bg-background hover:bg-secondary/60 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send class="w-3 h-3" />
        </button>
      </form>
    </footer>

  </div>
{/if}

<!-- ═══════════════════════════════════════════ -->
<!-- MACRO CREATION MODAL                        -->
<!-- ═══════════════════════════════════════════ -->
{#if showMacroModal}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={(e) => { if (e.target === e.currentTarget) showMacroModal = false; }}
  >
    <div class="bg-card border rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b shrink-0">
        <div>
          <h2 class="font-bold text-sm text-foreground">Criar Macro</h2>
          <p class="text-[10px] text-muted-foreground mt-0.5">Agrupe várias rolagens sob um nome</p>
        </div>
        <button onclick={() => showMacroModal = false} class="p-1.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto flex-1 p-5 space-y-4 scrollbar-thin">

        <!-- Name -->
        <div>
          <label class="text-xs font-semibold text-foreground block mb-1">Nome do Macro</label>
          <input
            bind:value={macroName}
            type="text"
            placeholder="ex: Ataque Corpo a Corpo"
            class="w-full px-3 py-2 text-sm rounded border bg-background text-foreground outline-none focus:border-primary/80 transition-colors placeholder:text-muted-foreground/40"
          />
        </div>

        <!-- Rolls -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-foreground">Rolagens</label>
            <button
              onclick={addRollRow}
              class="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-semibold cursor-pointer transition-colors"
            >
              <Plus class="w-3 h-3" /> Adicionar rolagem
            </button>
          </div>

          <div class="space-y-2">
            {#each macroRolls as roll, i}
              <div class="flex items-center gap-2">
                <input
                  bind:value={macroRolls[i].label}
                  type="text"
                  placeholder="Rótulo (ex: Ataque)"
                  class="w-32 shrink-0 px-2 py-1.5 text-xs rounded border bg-background text-foreground outline-none focus:border-primary/80 placeholder:text-muted-foreground/40"
                />
                <input
                  bind:value={macroRolls[i].formula}
                  type="text"
                  placeholder="Fórmula (ex: 1d20+6)"
                  class="flex-1 px-2 py-1.5 text-xs rounded border bg-background text-foreground outline-none focus:border-primary/80 placeholder:text-muted-foreground/40 font-mono"
                />
                {#if macroRolls.length > 1}
                  <button
                    onclick={() => removeRollRow(i)}
                    class="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                  >
                    <X class="w-3 h-3" />
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Examples / Help -->
        <div class="rounded border border-border/60 bg-secondary/10 p-3 space-y-1.5">
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <HelpCircle class="w-3 h-3" /> Exemplos de macros
          </p>
          <div class="space-y-1 text-[11px] text-muted-foreground">
            <p><span class="font-semibold text-foreground/80">Ataque:</span> Rótulo "Ataque" → <code class="bg-background px-1 rounded font-mono">1d20+6</code></p>
            <p><span class="font-semibold text-foreground/80">Dano:</span> Rótulo "Dano" → <code class="bg-background px-1 rounded font-mono">1d6+3</code></p>
            <p class="pt-1 border-t border-border/40">Quando rodar o macro, o chat exibirá:</p>
            <div class="bg-background rounded p-2 font-mono text-[10px] leading-relaxed">
              🎲 <strong>[{selectedCard?.titulo}]</strong> usou <strong>[Ataque]</strong><br/>
              Ataque: 16<br/>
              Dano: 6
            </div>
          </div>
        </div>

        <!-- Fórmulas suportadas -->
        <div class="text-[10px] text-muted-foreground space-y-0.5">
          <p class="font-semibold text-foreground/60 uppercase tracking-wider mb-1">Fórmulas suportadas</p>
          <p><code class="bg-background px-1 rounded font-mono">1d20</code> — dado simples</p>
          <p><code class="bg-background px-1 rounded font-mono">2d6+3</code> — soma com modificador</p>
          <p><code class="bg-background px-1 rounded font-mono">4d6kh3</code> — mantém 3 maiores</p>
          <p><code class="bg-background px-1 rounded font-mono">1d20!</code> — explosivo</p>
        </div>

        {#if macroError}
          <p class="text-xs text-destructive">{macroError}</p>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 px-5 py-3.5 border-t bg-sidebar/30 shrink-0">
        <button
          onclick={() => showMacroModal = false}
          class="px-4 py-2 text-xs rounded border hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onclick={saveMacro}
          class="px-4 py-2 text-xs rounded border bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Salvar Macro
        </button>
      </div>
    </div>
  </div>
{/if}
