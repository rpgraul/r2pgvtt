<script>
import { ToggleGroup } from 'bits-ui';
import { Trash2 } from 'lucide-svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { cn } from '$lib/utils/cn.js';
import TrashDialog from './grid/TrashDialog.svelte';

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'pj', label: 'Personagem' },
  { value: 'monstro', label: 'Monstro' },
  { value: 'npc', label: 'NPC' },
  { value: 'item', label: 'Item' },
  { value: 'anotacao', label: 'Anotação' },
];

let value = $state('all');
let showTrashDialog = $state(false);

function handleValueChange(newValue) {
  if (!newValue) return; // Prevent deselecting to empty value
  value = newValue;
  gameState.setCategory(newValue === 'all' ? 'all' : newValue);
}
</script>

<div class="flex items-center gap-2">
  <ToggleGroup.Root
    type="single"
    bind:value
    onValueChange={handleValueChange}
    class="inline-flex h-8.5 items-center justify-center rounded border bg-background/50 p-0.5 text-muted-foreground shrink-0"
  >
    {#each categories as cat}
      <ToggleGroup.Item
        value={cat.value}
        class="inline-flex items-center justify-center rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer select-none data-[state=on]:bg-secondary data-[state=on]:text-foreground data-[state=on]:font-semibold"
      >
        {cat.label}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
  
  {#if gameState.isNarrator}
    <button
      type="button"
      onclick={() => showTrashDialog = true}
      class="inline-flex h-8.5 items-center justify-center rounded border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
    >
      <Trash2 class="w-3.5 h-3.5 mr-1" />
      Lixeira
    </button>
  {/if}
</div>

<TrashDialog bind:open={showTrashDialog} />
