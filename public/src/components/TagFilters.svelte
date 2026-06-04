<script>
import { Check } from 'lucide-svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { cn } from '$lib/utils/cn.js';

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
      "inline-flex h-8.5 items-center gap-1.5 px-3 py-1 text-xs rounded border transition-colors cursor-pointer select-none",
      selectedTags.length > 0 
        ? "bg-primary/10 border-primary text-primary font-semibold" 
        : "bg-background border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
    )}
  >
    <span>Tags</span>
    {#if selectedTags.length > 0}
      <span class="bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full font-bold">
        {selectedTags.length}
      </span>
    {/if}
  </button>
  
  {#if isOpen}
    <div class="absolute top-full left-0 mt-1 z-50 w-56 rounded border bg-popover p-2.5 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Filtrar por Tags</span>
        {#if selectedTags.length > 0}
          <button
            type="button"
            onclick={clearTags}
            class="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Limpar
          </button>
        {/if}
      </div>
      
      {#if allTags.length === 0}
        <p class="text-xs text-muted-foreground py-1">Nenhuma tag disponível</p>
      {:else}
        <div class="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
          {#each allTags as tag}
            {@const isSelected = selectedTags.includes(tag)}
            <button
              type="button"
              onclick={() => toggleTag(tag)}
              class={cn(
                "w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left cursor-pointer",
                isSelected
                  ? "bg-secondary text-foreground font-semibold"
                  : "hover:bg-secondary/40 text-foreground"
              )}
            >
              <div class={cn(
                "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                isSelected ? "bg-primary border-primary" : "border-border bg-background"
              )}>
                {#if isSelected}
                  <Check class="w-2.5 h-2.5 text-primary-foreground" />
                {/if}
              </div>
              <span class="truncate">#{tag}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if isOpen}
    <button
      type="button"
      class="fixed inset-0 z-40 bg-transparent cursor-default"
      onclick={() => isOpen = false}
      aria-label="Fechar"
    ></button>
  {/if}
</div>
