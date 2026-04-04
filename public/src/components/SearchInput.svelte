<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import Input from './ui/Input.svelte';
import { Search } from 'lucide-svelte';
import { onDestroy } from 'svelte';

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
  }, 300);
}

function handleClear() {
  searchValue = '';
  gameState.setSearch('');
}
</script>

<div class="relative">
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input
    type="text"
    value={searchValue}
    oninput={handleInput}
    placeholder="Buscar por título, conteúdo ou tag..."
    class="flex h-10 w-full rounded-md border bg-popover pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground border-input"
  />
  {#if searchValue}
    <button
      type="button"
      onclick={handleClear}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      ×
    </button>
  {/if}
</div>
