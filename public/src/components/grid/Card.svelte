<script>
import { gameState } from '$lib/state/game.svelte.ts';
import Badge from '../ui/Badge.svelte';
import { cn } from '$lib/utils/cn.js';
import { Edit, Eye, EyeOff } from 'lucide-svelte';

let { item, onEdit = null } = $props();
let cardElement;

function getCategoryVariant(cat) {
  const variants = {
    pj: 'default',
    monstro: 'destructive',
    npc: 'secondary',
    item: 'success',
    anotacao: 'warning',
  };
  return variants[cat] || 'default';
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

function handleClick() {
  if (onEdit) {
    onEdit(item);
  }
}
</script>

<div 
  bind:this={cardElement}
  onclick={handleClick}
  class={cn(
    "group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer",
    !item.isVisibleToPlayers && gameState.isNarrator && "border-destructive/50"
  )}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  {#if item.imagemUrl}
    <div class="aspect-video w-full overflow-hidden rounded-t-lg">
      <img 
        src={item.imagemUrl} 
        alt={item.titulo}
        class="h-full w-full object-cover"
      />
    </div>
  {/if}
  
  <div class="p-4 space-y-3">
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold line-clamp-2">{item.titulo}</h3>
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
          <Badge variant="outline" class="text-xs">
            {tag}
          </Badge>
        {/each}
      </div>
    {/if}
    
    {#if !item.isVisibleToPlayers && gameState.isNarrator}
      <div class="absolute top-2 right-2">
        <span class="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
          <EyeOff class="w-3 h-3" />
          Oculto
        </span>
      </div>
    {/if}
    
    <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="bg-background/80 rounded-full p-1">
        <Edit class="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  </div>
</div>
