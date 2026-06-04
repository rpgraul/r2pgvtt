<script>
import { Search } from 'lucide-svelte';
import { onDestroy } from 'svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';

let searchValue = $state('');

onDestroy(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
let debounceTimer = null;

function handleInput(e) {
  searchValue = e.target.value;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    gameState.setSearch(searchValue);
  }, 200);
}

function handleClear() {
  searchValue = '';
  gameState.setSearch('');
}
</script>

<div class="relative w-full">
  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
  <input
    type="text"
    value={searchValue}
    oninput={handleInput}
    placeholder="Buscar por título, conteúdo ou tag..."
    class="flex h-8.5 w-full rounded border bg-background pl-8 pr-7 text-xs outline-none focus:border-primary/80 transition-colors text-foreground placeholder:text-muted-foreground/60"
  />
  {#if searchValue}
    <button
      type="button"
      onclick={handleClear}
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-semibold select-none"
    >
      ×
    </button>
  {/if}
</div>
