<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import Card from './Card.svelte';
import CardDialog from './CardDialog.svelte';
import TrashDialog from './TrashDialog.svelte';
import { cn } from '$lib/utils/cn.js';
import { Plus, Trash2 } from 'lucide-svelte';

const items = $derived(gameState.filteredItems);

let showCardDialog = $state(false);
let showTrashDialog = $state(false);
let editingCard = $state(null);
let draggedItem = $state(null);
let dragOverIndex = $state(-1);

function openNewCard() {
  editingCard = null;
  showCardDialog = true;
}

function openEditCard(item) {
  editingCard = item;
  showCardDialog = true;
}

function handleDragStart(e, item, index) {
  draggedItem = { item, index };
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e, index) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  dragOverIndex = index;
}

function handleDragLeave() {
  dragOverIndex = -1;
}

function handleDrop(e, targetIndex) {
  e.preventDefault();

  if (!draggedItem || draggedItem.index === targetIndex) {
    draggedItem = null;
    dragOverIndex = -1;
    return;
  }

  const newItems = [...items];
  const [removed] = newItems.splice(draggedItem.index, 1);
  newItems.splice(targetIndex, 0, removed);

  gameState.reorderCards(newItems);

  draggedItem = null;
  dragOverIndex = -1;
}

function handleDragEnd() {
  draggedItem = null;
  dragOverIndex = -1;
}
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <div class="flex-1"></div>
    <div class="flex gap-2">
      {#if gameState.isNarrator}
        <Button variant="outline" onclick={() => showTrashDialog = true}>
          <Trash2 class="w-4 h-4 mr-2" />
          Lixeira
        </Button>
      {/if}
      <Button onclick={openNewCard}>
        <Plus class="w-4 h-4 mr-2" />
        Novo Card
      </Button>
    </div>
  </div>
  
  {#if items.length === 0}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="text-6xl mb-4">🎲</div>
      <h3 class="text-lg font-medium">Nenhum card encontrado</h3>
      <p class="text-sm text-muted-foreground mt-1">
        Tente ajustar seus filtros ou buscar por outro termo
      </p>
      <Button class="mt-4" onclick={openNewCard}>
        <Plus class="w-4 h-4 mr-2" />
        Criar primeiro card
      </Button>
    </div>
  {:else}
    <div 
      class={cn(
        "grid gap-4",
        gameState.viewMode === 'grid' 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      )}
    >
      {#each items as item, index (item.id)}
        <div
          draggable="true"
          ondragstart={(e) => handleDragStart(e, item, index)}
          ondragover={(e) => handleDragOver(e, index)}
          ondragleave={handleDragLeave}
          ondrop={(e) => handleDrop(e, index)}
          ondragend={handleDragEnd}
          class={cn(
            "transition-all",
            dragOverIndex === index && "opacity-50 scale-95"
          )}
        >
          <Card 
            {item} 
            onEdit={() => openEditCard(item)}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<CardDialog bind:open={showCardDialog} editItem={editingCard} />

<TrashDialog bind:open={showTrashDialog} />

<script context="module">
  import Button from '$components/ui/Button.svelte';
</script>
