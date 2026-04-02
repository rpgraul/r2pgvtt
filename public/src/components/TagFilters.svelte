<script>
  import { gameState } from '$lib/state/game.svelte.ts';
  import { cn } from '$lib/utils/cn.js';
  import { Check } from 'lucide-svelte';
  
  let isOpen = $state(false);
  
  const allTags = $derived(gameState.allTags);
  const selectedTags = $derived(gameState.filters.tags);
  
  function toggleTag(tag) {
    const current = [...selectedTags];
    const index = current.indexOf(tag);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tag);
    }
    
    gameState.setTags(current);
  }
  
  function clearTags() {
    gameState.setTags([]);
  }
</script>

<div class="relative">
  <button
    type="button"
    onclick={() => isOpen = !isOpen}
    class={cn(
      "inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors",
      selectedTags.length > 0 
        ? "bg-primary/20 border-primary text-primary" 
        : "bg-muted border-input hover:bg-accent"
    )}
  >
    <span>Tags</span>
    {#if selectedTags.length > 0}
      <span class="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
        {selectedTags.length}
      </span>
    {/if}
  </button>
  
  {#if isOpen}
    <div class="absolute top-full left-0 mt-2 z-50 w-64 rounded-lg border bg-popover p-3 shadow-md">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-foreground">Filtrar por Tags</span>
        {#if selectedTags.length > 0}
          <button
            type="button"
            onclick={clearTags}
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar
          </button>
        {/if}
      </div>
      
      {#if allTags.length === 0}
        <p class="text-sm text-muted-foreground">Nenhuma tag disponível</p>
      {:else}
        <div class="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
          {#each allTags as tag}
            <button
              type="button"
              onclick={() => toggleTag(tag)}
              class={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <div class={cn(
                "w-4 h-4 rounded border flex items-center justify-center",
                selectedTags.includes(tag) 
                  ? "bg-primary border-primary" 
                  : "border-input"
              )}>
                {#if selectedTags.includes(tag)}
                  <Check class="w-3 h-3 text-primary-foreground" />
                {/if}
              </div>
              <span class="text-foreground">{tag}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if isOpen}
    <button
      type="button"
      class="fixed inset-0 z-40"
      onclick={() => isOpen = false}
      aria-label="Fechar"
    ></button>
  {/if}
</div>
