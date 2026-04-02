<script>
  import { gameState } from '$lib/state/game.svelte.js';
  import Button from '$components/ui/Button.svelte';
  import Badge from '$components/ui/Badge.svelte';
  import { ScrollArea } from '$components/ui/scroll-area/index.js';
  import RichTextEditor from '$components/editor/RichTextEditor.svelte';
  import { FileText, Save, Plus } from 'lucide-svelte';
  import CardDialog from '$components/grid/CardDialog.svelte';
  
  let selectedItem = $state(null);
  let editedContent = $state('');
  let isEditing = $state(false);
  let showNewCardDialog = $state(false);
  
  const items = $derived(gameState.items);
  
  function selectItem(item) {
    selectedItem = item;
    editedContent = item.conteudo || '';
    isEditing = false;
  }
  
  async function handleSaveContent() {
    if (!selectedItem) return;
    
    try {
      await gameState.editCard(selectedItem.id, {
        conteudo: editedContent
      });
      selectedItem = { ...selectedItem, conteudo: editedContent };
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
  
  function getCategoryIcon(cat) {
    return '📝';
  }
</script>

<main class="container px-4 py-6 h-[calc(100vh-64px)]">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Notas</h1>
    <div class="flex gap-2">
      <Button onclick={() => showNewCardDialog = true}>
        <Plus class="w-4 h-4 mr-2" />
        Nova Nota
      </Button>
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100%-80px)]">
    <!-- Sidebar: Notes List -->
    <div class="md:col-span-1 h-full">
      <div class="rounded-lg border bg-card h-full flex flex-col">
        <div class="p-3 border-b flex items-center justify-between">
          <h2 class="font-semibold flex items-center gap-2">
            <FileText class="w-4 h-4" />
            Notas
          </h2>
          <Badge variant="outline">{items.length}</Badge>
        </div>
        <ScrollArea class="flex-1">
          <div class="p-2 space-y-2">
            {#if items.length === 0}
              <p class="text-sm text-muted-foreground p-2">Nenhuma nota encontrada</p>
            {:else}
              {#each items as item}
                <button
                  onclick={() => selectItem(item)}
                  class="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted transition-colors {selectedItem?.id === item.id ? 'border-primary' : ''}"
                >
                  <div class="flex items-start gap-2">
                    <span class="text-lg">{getCategoryIcon(item.category)}</span>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium truncate">{item.titulo}</h3>
                      <p class="text-xs text-muted-foreground truncate">
                        {item.conteudo?.replace(/<[^>]*>/g, '').slice(0, 50) || 'Sem conteúdo'}
                      </p>
                    </div>
                  </div>
                  {#if item.tags && item.tags.length > 0}
                    <div class="flex flex-wrap gap-1 mt-2">
                      {#each item.tags.slice(0, 3) as tag}
                        <span class="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                      {/each}
                    </div>
                  {/if}
                </button>
              {/each}
            {/if}
          </div>
        </ScrollArea>
      </div>
    </div>
    
    <!-- Main Content: Note Editor -->
    <div class="md:col-span-3 h-full">
      {#if selectedItem}
        <div class="rounded-lg border bg-card h-full flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">{selectedItem.titulo}</h2>
              <p class="text-sm text-muted-foreground">
                Última edição: {selectedItem.updatedAt ? new Date(selectedItem.updatedAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Nunca'}
              </p>
            </div>
            
            <Button variant={isEditing ? 'default' : 'outline'} onclick={toggleEdit}>
              <Save class="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar' : 'Editar'}
            </Button>
          </div>
          
          <!-- Editor/Preview -->
          <div class="flex-1 overflow-auto p-4">
            {#if isEditing}
              <RichTextEditor bind:content={editedContent} />
            {:else}
              <div class="prose prose-invert max-w-none">
                {#if selectedItem.conteudo}
                  {@html selectedItem.conteudo}
                {:else}
                  <p class="text-muted-foreground">Sem conteúdo. Clique em Editar para adicionar.</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="rounded-lg border border-dashed p-12 text-center h-full flex items-center justify-center">
          <div>
            <FileText class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p class="text-muted-foreground">Selecione uma nota para editar</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<CardDialog bind:open={showNewCardDialog} />
