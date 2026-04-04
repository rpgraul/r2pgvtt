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
    gameState.destroy();
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
