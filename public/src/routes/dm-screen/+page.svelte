<script>
import {
  BookOpen,
  Check,
  Copy,
  Eye,
  FileText,
  Pin,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-svelte';
import { onMount } from 'svelte';
import Badge from '$components/ui/Badge.svelte';
import Button from '$components/ui/Button.svelte';
import { ScrollArea } from '$components/ui/scroll-area/index.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { db } from '$lib/supabase/tables';
import { parseAllShortcodes } from '$lib/utils/shortcodes.ts';

let pinnedCardIds = $state([]);
let dmNotes = $state('');
let activeRefTab = $state('conditions'); // 'conditions' | 'dc' | 'combat'
let showPinSelector = $state(false);
let selectedCardIdToPin = $state('');
let copied = $state(false);
let members = $state([]);

// Carregar configurações sincronizadas com o banco do Supabase
$effect(() => {
  const gameId = gameState.gameId;
  if (gameId) {
    db.getSettings(`dm_screen_pinned:${gameId}`).then((val) => {
      pinnedCardIds = Array.isArray(val) ? val : [];
    });
    db.getSettings(`dm_notes:${gameId}`).then((val) => {
      dmNotes = typeof val === 'string' ? val : val?.text || '';
    });
    gameState.getGameMembers(gameId).then((data) => {
      members = data || [];
    });
  }
});

// Auto-salvamento das notas com debounce de 1s
let saveTimeout;
function handleNotesInput() {
  const gameId = gameState.gameId;
  if (!gameId) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    db.updateSettings(`dm_notes:${gameId}`, { text: dmNotes }).catch((err) =>
      console.error('[Escudo] Erro ao salvar notas:', err),
    );
  }, 1000);
}

// Fixar/Desafixar cards
async function pinCard() {
  const gameId = gameState.gameId;
  if (!gameId || !selectedCardIdToPin) return;

  if (!pinnedCardIds.includes(selectedCardIdToPin)) {
    pinnedCardIds = [...pinnedCardIds, selectedCardIdToPin];
    await db.updateSettings(`dm_screen_pinned:${gameId}`, pinnedCardIds);
  }
  selectedCardIdToPin = '';
  showPinSelector = false;
}

async function unpinCard(id) {
  const gameId = gameState.gameId;
  if (!gameId) return;

  pinnedCardIds = pinnedCardIds.filter((c) => c !== id);
  await db.updateSettings(`dm_screen_pinned:${gameId}`, pinnedCardIds);
}

const pinnedCards = $derived(gameState.items.filter((item) => pinnedCardIds.includes(item.id)));
const unpinnedCards = $derived(gameState.items.filter((item) => !pinnedCardIds.includes(item.id)));

function copyInviteCode() {
  db.getInviteCode(gameState.gameId).then((code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  });
}
</script>

<div class="h-[calc(100vh-48px)] flex flex-col overflow-hidden w-full bg-background select-none">
  
  <div class="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
    
    <!-- Heading Section -->
    <div class="flex items-center justify-between border-b pb-3 shrink-0">
      <div class="flex items-center gap-2">
        <Shield class="w-4.5 h-4.5 text-foreground shrink-0" />
        <h1 class="text-sm font-bold text-foreground tracking-tight">Escudo do Mestre</h1>
      </div>
      <span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/10 text-primary uppercase tracking-wider">
        Narrador
      </span>
    </div>

    <!-- Triple Column Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
      
      <!-- Column 1: Master Notes & References -->
      <div class="lg:col-span-1 flex flex-col gap-5">
        
        <!-- DM Notes -->
        <div class="rounded border bg-background flex flex-col h-72">
          <div class="p-2.5 border-b flex items-center justify-between bg-sidebar">
            <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5" />
              Notas do Narrador
            </span>
            <span class="text-[9px] text-muted-foreground">Auto-salvar</span>
          </div>
          <textarea
            bind:value={dmNotes}
            oninput={handleNotesInput}
            placeholder="Anotações rápidas, lore, status da aventura..."
            class="flex-1 w-full p-3.5 text-xs bg-transparent text-foreground border-0 resize-none focus:outline-none scrollbar-thin placeholder:text-muted-foreground/50 select-text"
          ></textarea>
        </div>

        <!-- Rules Reference -->
        <div class="rounded border bg-background flex flex-col h-72">
          <div class="border-b bg-sidebar flex text-xs shrink-0 select-none">
            <button
              onclick={() => activeRefTab = 'conditions'}
              class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r cursor-pointer text-center {activeRefTab === 'conditions' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}"
            >
              Condições
            </button>
            <button
              onclick={() => activeRefTab = 'dc'}
              class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r cursor-pointer text-center {activeRefTab === 'dc' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}"
            >
              CDs
            </button>
            <button
              onclick={() => activeRefTab = 'combat'}
              class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center {activeRefTab === 'combat' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}"
            >
              Ações
            </button>
          </div>

          <ScrollArea class="flex-1 p-3.5 select-text">
            {#if activeRefTab === 'conditions'}
              <div class="space-y-3.5 text-[11px] leading-relaxed">
                <div>
                  <strong class="text-foreground">Caído:</strong> Movimento custa o dobro. Ataques corpo-a-corpo contra têm Vantagem; à distância têm Desvantagem.
                </div>
                <div>
                  <strong class="text-foreground">Atordoado:</strong> Incapacitado, falha em testes de Força/Destreza. Ataques contra têm Vantagem.
                </div>
                <div>
                  <strong class="text-foreground">Envenenado:</strong> Desvantagem em jogadas de ataque e testes de atributo.
                </div>
                <div>
                  <strong class="text-foreground">Invisível:</strong> Ataques contra têm Desvantagem. Ataques do invisível têm Vantagem.
                </div>
              </div>
            {:else if activeRefTab === 'dc'}
              <div class="space-y-3 text-[11px] leading-relaxed">
                <p class="text-muted-foreground font-medium">Classes de Dificuldade (CD) sugeridas:</p>
                <div class="grid grid-cols-2 gap-1.5 border-b pb-2">
                  <span>Fácil</span> <span class="font-bold text-right">CD 10</span>
                  <span>Médio</span> <span class="font-bold text-right">CD 15</span>
                  <span>Difícil</span> <span class="font-bold text-right">CD 20</span>
                  <span>Muito Difícil</span> <span class="font-bold text-right">CD 25</span>
                </div>
                <p class="text-[10px] text-muted-foreground mt-1">Utilize a perícia de Percepção Passiva dos personagens como CD padrão de furtividade.</p>
              </div>
            {:else}
              <div class="space-y-3.5 text-[11px] leading-relaxed">
                <div>
                  <strong class="text-foreground">Esquivar:</strong> Ataques contra o atacante têm Desvantagem e testes de Destreza têm Vantagem.
                </div>
                <div>
                  <strong class="text-foreground">Desengajar:</strong> Seu movimento não gera ataques de oportunidade neste turno.
                </div>
                <div>
                  <strong class="text-foreground">Ajudar:</strong> Oferece Vantagem ao aliado no próximo teste ou ataque.
                </div>
              </div>
            {/if}
          </ScrollArea>
        </div>

      </div>

      <!-- Column 2 & 3: Pinned Cards & Dashboard -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        
        <!-- Pinned Cards Dashboard -->
        <div class="rounded border bg-background flex flex-col min-h-72">
          <div class="p-2.5 border-b flex items-center justify-between bg-sidebar shrink-0">
            <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Pin class="w-3.5 h-3.5" />
              Cards Fixados no Painel
            </span>
            
            <div class="flex items-center gap-2 select-none">
              {#if showPinSelector}
                <select
                  bind:value={selectedCardIdToPin}
                  onchange={pinCard}
                  class="text-[10px] bg-background border rounded px-1.5 py-0.5 outline-none text-foreground cursor-pointer"
                >
                  <option value="">Selecionar card...</option>
                  {#each unpinnedCards as item}
                    <option value={item.id}>[{item.category.toUpperCase()}] {item.titulo}</option>
                  {/each}
                </select>
                <button onclick={() => showPinSelector = false} class="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                  Cancelar
                </button>
              {:else}
                <button 
                  onclick={() => showPinSelector = true}
                  class="inline-flex h-6.5 items-center justify-center rounded border bg-background px-2 text-[10px] font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <Plus class="w-3 h-3 mr-0.5" />
                  Fixar
                </button>
              {/if}
            </div>
          </div>

          <ScrollArea class="flex-1 p-4">
            {#if pinnedCards.length === 0}
              <div class="text-center py-16 flex flex-col items-center justify-center">
                <Pin class="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p class="text-xs text-muted-foreground">Nenhum card fixado.</p>
                <p class="text-[10px] text-muted-foreground/80 mt-0.5">Use o botão acima para fixar fichas ou monstros e checá-los aqui.</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each pinnedCards as item (item.id)}
                  {@const parsed = parseAllShortcodes(item)}
                  <div class="rounded border bg-secondary/15 flex flex-col justify-between overflow-hidden shadow-sm hover:border-foreground/20 transition-all select-text">
                    <div>
                      <!-- Card Header -->
                      <div class="p-2.5 border-b flex items-center justify-between bg-sidebar/50 select-none">
                        <div>
                          <h3 class="font-semibold text-xs text-foreground truncate max-w-[140px]">{item.titulo}</h3>
                          <span class="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">{item.category}</span>
                        </div>
                        <button
                          onclick={() => unpinCard(item.id)}
                          class="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                          title="Desafixar card"
                          aria-label="Desafixar card"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <!-- Shortcodes interactive list inside screen -->
                      {#if parsed && (parsed.left || parsed.right || parsed.bottom)}
                        <div class="p-2.5 border-b bg-background space-y-1.5 text-[11px] select-none">
                          {#if parsed.bottom}
                            <div class="w-full">{@html parsed.bottom}</div>
                          {/if}
                          <div class="grid grid-cols-2 gap-1.5">
                            {#if parsed.left}
                              <div class="space-y-1 flex flex-col">{@html parsed.left}</div>
                            {/if}
                            {#if parsed.right}
                              <div class="space-y-1 flex flex-col">{@html parsed.right}</div>
                            {/if}
                          </div>
                        </div>
                      {/if}

                      <!-- Content description snippet -->
                      <div class="p-3 text-[11px] prose prose-invert line-clamp-3 text-foreground/85 leading-relaxed">
                        {#if item.conteudo}
                          {@html item.conteudo}
                        {:else}
                          <p class="text-muted-foreground/60 italic">Sem conteúdo.</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </ScrollArea>
        </div>

        <!-- Session & Table Dashboard -->
        <div class="rounded border bg-background p-4 flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b pb-3 shrink-0">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-muted-foreground" />
              <h2 class="font-semibold text-xs uppercase text-muted-foreground tracking-wider">Jogadores Conectados</h2>
            </div>
            
            <button
              onclick={copyInviteCode}
              class="inline-flex h-7 items-center justify-center rounded border bg-background px-2.5 text-[10px] font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors gap-1.5"
            >
              {#if copied}
                <Check class="w-3.5 h-3.5 text-success" />
                <span class="text-success">Copiado</span>
              {:else}
                <Copy class="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              {/if}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Connected players List -->
            <div class="space-y-2">
              {#if members.length === 0}
                <p class="text-xs text-muted-foreground">Nenhum jogador cadastrado na mesa.</p>
              {:else}
                <div class="flex flex-wrap gap-1.5">
                  {#each members as m}
                    <Badge variant="secondary" class="text-[10px] py-0.5 px-2 bg-secondary text-foreground rounded">
                      {m.profile?.display_name || 'Jogador'}
                      {#if m.role === 'narrador'}
                        <span class="ml-1 text-[8px] text-primary font-bold">(Mestre)</span>
                      {/if}
                    </Badge>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Table statistics card -->
            <div class="text-xs space-y-1.5 border-l pl-4 border-border">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Nome da Mesa:</span>
                <span class="font-bold text-foreground truncate max-w-[130px]">{gameState.gameName || 'Carregando...'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total de Cards:</span>
                <span class="font-bold text-foreground">{gameState.items.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>

</div>
