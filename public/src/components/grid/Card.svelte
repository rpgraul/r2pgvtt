<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import { toast } from '$lib/stores/toast.js';
import Badge from '../ui/Badge.svelte';
import { cn } from '$lib/utils/cn.js';
import { Edit, Trash2 } from 'lucide-svelte';

let { item, onEdit = null } = $props();

function getCategoryVariant(cat) {
  const variants = {
    pj: 'default',
    monstro: 'destructive',
    npc: 'secondary',
    item: 'success',
    anotacao: 'warning',
  };
  return variants[cat] || 'outline';
}

function getCategoryLabel(cat) {
  const labels = {
    pj: 'Personagem',
    monstro: 'Monstro',
    npc: 'NPC',
    item: 'Item',
    anotacao: 'Anotação',
  };
  return labels[cat] || cat;
}

function handleEdit(e) {
  e.stopPropagation();
  if (onEdit) {
    onEdit(item);
  }
}

async function handleDelete(e) {
  e.stopPropagation();
  if (!confirm(`Tem certeza que deseja excluir "${item.titulo}"?`)) return;

  try {
    await gameState.removeCard(item.id);
    toast.success('Card movido para a lixeira');
  } catch (error) {
    console.error('Error deleting card:', error);
    toast.error('Erro ao excluir card');
  }
}
</script>

<div 
  class={cn(
    "group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all overflow-hidden",
    !item.isVisibleToPlayers && gameState.isNarrator && "border-amber-500/50 border-dashed"
  )}
>
  {#if item.imagemUrl}
    <div class="relative aspect-[3/4] w-full overflow-hidden">
      <img 
        src={item.imagemUrl} 
        alt={item.titulo}
        class="h-full w-full object-cover"
      />
      
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      {#if item.category}
        <div class="absolute top-3 left-3">
          <Badge variant={getCategoryVariant(item.category)} class="backdrop-blur-sm">
            {getCategoryLabel(item.category)}
          </Badge>
        </div>
      {/if}
      
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="font-bold text-lg text-white line-clamp-2 drop-shadow-md">{item.titulo}</h3>
        
        {#if item.tags && item.tags.length > 0}
          <div class="flex flex-wrap gap-1 mt-2">
            {#each item.tags as tag}
              <span class="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="p-4 space-y-3">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-bold text-lg line-clamp-2">{item.titulo}</h3>
        {#if item.category}
          <Badge variant={getCategoryVariant(item.category)} class="shrink-0">
            {getCategoryLabel(item.category)}
          </Badge>
        {/if}
      </div>
      
      {#if item.conteudo}
        <div class="text-sm text-muted-foreground line-clamp-3">
          {item.conteudo.replace(/<[^>]*>/g, '')}
        </div>
      {/if}
      
      {#if item.tags && item.tags.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each item.tags as tag}
            <span class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {tag}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
    <button 
      onclick={handleEdit}
      class="bg-background/90 backdrop-blur-sm p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
      title="Editar"
    >
      <Edit class="w-4 h-4" />
    </button>
    <button 
      onclick={handleDelete}
      class="bg-background/90 backdrop-blur-sm p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
      title="Excluir"
    >
      <Trash2 class="w-4 h-4" />
    </button>
  </div>
</div>