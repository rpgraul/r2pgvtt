<script>
import { gameState } from '$lib/state/game.svelte.ts';
import SearchInput from '$components/SearchInput.svelte';
import CategoryFilters from '$components/CategoryFilters.svelte';
import TagFilters from '$components/TagFilters.svelte';
import GridContainer from '$components/grid/GridContainer.svelte';

let ready = $state(false);

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
