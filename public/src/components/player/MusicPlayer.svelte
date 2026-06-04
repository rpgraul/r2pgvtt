<script>
import { onMount } from 'svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { musicState } from '$lib/state/music.svelte.js';
import Controls from './Controls.svelte';
import Playlist from './Playlist.svelte';

let urlInput = $state('');
let isAdding = $state(false);
let addError = $state(null);

const isLoaded = $derived(musicState.isLoaded());

onMount(() => {
  const gameId = gameState.gameId;
  if (gameId && !musicState.isLoaded()) {
    musicState.init(gameId);
  }
});

async function handleAddTrack() {
  if (!urlInput.trim()) return;

  isAdding = true;
  addError = null;

  try {
    await musicState.addTrack(urlInput.trim());
    urlInput = '';
  } catch (e) {
    addError = e.message || 'Erro ao adicionar música';
  } finally {
    isAdding = false;
  }
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    handleAddTrack();
  }
}
</script>

<div class="h-full flex flex-col">
  {#if !isLoaded}
    <div class="flex flex-col items-center justify-center gap-3 py-12 select-none">
      <div class="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
      <span class="text-xs text-muted-foreground">Carregando player...</span>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <Controls />

      <!-- Add Track Section -->
      <div class="flex flex-col gap-1.5 select-none">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={urlInput}
            onkeydown={handleKeyDown}
            placeholder="Cole URL do YouTube..."
            class="flex-1 h-8 px-2.5 rounded border bg-background text-xs outline-none focus:border-primary/80 transition-colors text-foreground placeholder:text-muted-foreground/50"
            disabled={isAdding}
          />
          <button
            class="inline-flex h-8 items-center justify-center rounded border bg-background px-2.5 text-xs font-semibold hover:bg-secondary/60 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer"
            onclick={handleAddTrack}
            disabled={!urlInput.trim() || isAdding}
          >
            {#if isAdding}
              <span class="animate-spin w-3.5 h-3.5 border-2 border-foreground border-t-transparent rounded-full"></span>
            {:else}
              Adicionar
            {/if}
          </button>
        </div>
        {#if addError}
          <p class="text-[10px] text-destructive">{addError}</p>
        {/if}
      </div>

      <!-- Playlist Section -->
      <div class="mt-2 select-none">
        <Playlist />
      </div>
    </div>
  {/if}
</div>