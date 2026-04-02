<script>
  import { gameState } from '$lib/state/game.svelte.js';
  import { authState } from '$lib/state/auth.svelte.ts';
  import Badge from '$components/ui/Badge.svelte';
  import Button from '$components/ui/Button.svelte';
  import RichTextEditor from '$components/editor/RichTextEditor.svelte';
  import { ScrollArea } from '$components/ui/scroll-area/index.js';
  import { parseAllShortcodes } from '$lib/utils/shortcodes.ts';
  import { User, Sword, Heart, Coins, Star } from 'lucide-svelte';
  
  let selectedCard = $state(null);
  let editedContent = $state('');
  let isEditing = $state(false);
  
  const items = $derived(gameState.items.filter(i => i.category === 'pj'));
  const characters = $derived(items);
  
  function selectCard(item) {
    selectedCard = item;
    editedContent = item.conteudo || '';
    isEditing = false;
  }
  
  async function handleSaveContent() {
    if (!selectedCard) return;
    
    try {
      await gameState.editCard(selectedCard.id, {
        conteudo: editedContent
      });
      selectedCard = { ...selectedCard, conteudo: editedContent };
      isEditing = false;
    } catch (error) {
      console.error('Error saving:', error);
    }
  }
  
  function toggleEdit() {
    if (isEditing) {
      handleSaveContent();
    } else {
      isEditing = true;
    }
  }
  
  const parsedContent = $derived(selectedCard ? parseAllShortcodes(selectedCard) : null);
</script>

<main class="container px-4 py-6">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Modo Ficha</h1>
    <Badge>Em desenvolvimento</Badge>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Sidebar: Character List -->
    <div class="md:col-span-1">
      <div class="rounded-lg border bg-card">
        <div class="p-3 border-b">
          <h2 class="font-semibold flex items-center gap-2">
            <User class="w-4 h-4" />
            Personagens
          </h2>
        </div>
        <ScrollArea class="h-[calc(100vh-300px)]">
          <div class="p-2 space-y-2">
            {#if characters.length === 0}
              <p class="text-sm text-muted-foreground p-2">Nenhum personagem encontrado</p>
            {:else}
              {#each characters as item}
                <button
                  onclick={() => selectCard(item)}
                  class="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted transition-colors {selectedCard?.id === item.id ? 'border-primary' : ''}"
                >
                  {#if item.imagemUrl}
                    <img 
                      src={item.imagemUrl} 
                      alt={item.titulo}
                      class="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  {/if}
                  <h3 class="font-medium truncate">{item.titulo}</h3>
                  <p class="text-xs text-muted-foreground truncate">
                    {item.category === 'pj' ? 'Personagem' : item.category}
                  </p>
                </button>
              {/each}
            {/if}
          </div>
        </ScrollArea>
      </div>
    </div>
    
    <!-- Main Content: Character Sheet -->
    <div class="md:col-span-3">
      {#if selectedCard}
        <div class="rounded-lg border bg-card">
          <!-- Header -->
          <div class="p-4 border-b flex items-center justify-between">
            <div class="flex items-center gap-4">
              {#if selectedCard.imagemUrl}
                <img 
                  src={selectedCard.imagemUrl} 
                  alt={selectedCard.titulo}
                  class="w-20 h-20 object-cover rounded-lg"
                />
              {/if}
              <div>
                <h2 class="text-xl font-bold">{selectedCard.titulo}</h2>
                <p class="text-sm text-muted-foreground">
                  {selectedCard.category === 'pj' ? 'Personagem' : selectedCard.category}
                </p>
              </div>
            </div>
            
            {#if gameState.isNarrator || isEditing}
              <Button variant={isEditing ? 'default' : 'outline'} onclick={toggleEdit}>
                {isEditing ? 'Salvar' : 'Editar'}
              </Button>
            {/if}
          </div>
          
          <!-- Quick Stats (if parsed) -->
          {#if parsedContent && (parsedContent.left || parsedContent.bottom)}
            <div class="p-4 border-b bg-muted/30">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                {#if parsedContent.bottom.includes('hp')}
                  <div class="flex items-center gap-2 p-2 rounded bg-red-900/20">
                    <Heart class="w-5 h-5 text-red-500" />
                    <span class="text-sm">HP</span>
                  </div>
                {/if}
                {#if parsedContent.left.includes('stat')}
                  <div class="flex items-center gap-2 p-2 rounded bg-blue-900/20">
                    <Sword class="w-5 h-5 text-blue-500" />
                    <span class="text-sm">ATRIBUTOS</span>
                  </div>
                {/if}
                {#if parsedContent.left.includes('money')}
                  <div class="flex items-center gap-2 p-2 rounded bg-amber-900/20">
                    <Coins class="w-5 h-5 text-amber-500" />
                    <span class="text-sm">DINHEIRO</span>
                  </div>
                {/if}
                {#if parsedContent.left.includes('xp')}
                  <div class="flex items-center gap-2 p-2 rounded bg-purple-900/20">
                    <Star class="w-5 h-5 text-purple-500" />
                    <span class="text-sm">XP</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          
          <!-- Content/Editor -->
          <div class="p-4">
            {#if isEditing}
              <RichTextEditor bind:content={editedContent} />
            {:else}
              <div class="prose prose-invert max-w-none">
                {#if selectedCard.conteudo}
                  {@html selectedCard.conteudo}
                {:else}
                  <p class="text-muted-foreground">Sem conteúdo. Clique em Editar para adicionar.</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="rounded-lg border border-dashed p-12 text-center">
          <User class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p class="text-muted-foreground">Selecione um personagem para ver a ficha</p>
        </div>
      {/if}
    </div>
  </div>
</main>
