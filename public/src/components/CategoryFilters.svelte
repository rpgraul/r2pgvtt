<script>
import { ToggleGroup } from 'bits-ui';
import { cn } from '$lib/utils/cn.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import TrashDialog from './grid/TrashDialog.svelte';
import { Trash2 } from 'lucide-svelte';

const categories = [
  { value: 'all', label: 'Todos', icon: null },
  { value: 'pj', label: 'Personagem', icon: null },
  { value: 'monstro', label: 'Monstro', icon: null },
  { value: 'npc', label: 'NPC', icon: null },
  { value: 'item', label: 'Item', icon: null },
  { value: 'anotacao', label: 'Anotação', icon: null },
];

let value = $state('all');
let showTrashDialog = $state(false);

function handleValueChange(newValue) {
  value = newValue;
  gameState.setCategory(newValue === 'all' ? 'all' : newValue);
}
</script>

<div class="flex flex-wrap gap-2">
  <ToggleGroup.Root
    type="single"
    bind:value
    onValueChange={handleValueChange}
    class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
  >
    {#each categories as cat}
      <ToggleGroup.Item
        value={cat.value}
        class={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        )}
      >
        {cat.label}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
  
  {#if gameState.isNarrator}
    <button
      type="button"
      onclick={() => showTrashDialog = true}
      class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground"
    >
      <Trash2 class="w-4 h-4 mr-1" />
      Lixeira
    </button>
  {/if}
</div>

<TrashDialog bind:open={showTrashDialog} />
