<script>
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import CategoryFilters from '$components/CategoryFilters.svelte';
import GridContainer from '$components/grid/GridContainer.svelte';
import SearchInput from '$components/SearchInput.svelte';
import TagFilters from '$components/TagFilters.svelte';
import { authState } from '$lib/state/auth.svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';

let ready = $state(false);

onMount(() => {
  const urlGameId = $page.url.searchParams.get('gameId');
  if (urlGameId && browser) {
    window.history.replaceState({}, '', '/');
    gameState.setGameId(urlGameId);
  } else {
    gameState.init(null);
  }
  ready = true;
});

$effect(() => {
  ready = true;
});
</script>

<div class="min-h-screen bg-background text-foreground">
  {#if gameState.gameId}
    <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="container px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a href="/games" class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </a>
            <span class="text-sm text-muted-foreground">Mesa Ativa</span>
          </div>
          <a href="/games" class="text-sm text-primary hover:underline">Ver todas as mesas</a>
        </div>
      </div>
    </header>
  {/if}

  <main class="container px-4 py-6 space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 max-w-md">
        <SearchInput />
      </div>
      <div class="flex items-center gap-2">
        <CategoryFilters />
        <TagFilters />
      </div>
    </div>
    
    <GridContainer />
  </main>
</div>
