<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import { toast } from '$lib/stores/toast.js';
import Dialog from '$components/ui/Dialog.svelte';
import DialogContent from '$components/ui/DialogContent.svelte';
import DialogTitle from '$components/ui/DialogTitle.svelte';
import DialogDescription from '$components/ui/DialogDescription.svelte';
import Button from '$components/ui/Button.svelte';
import Input from '$components/ui/Input.svelte';
import { Select } from '$components/ui/select/index.js';
import { Checkbox } from '$components/ui/checkbox/index.js';
import RichTextEditor from '$components/editor/RichTextEditor.svelte';

let { open = $bindable(false), editItem = null } = $props();

let title = $state('');
let content = $state('');
let category = $state('pj');
let tags = $state('');
let isVisibleToPlayers = $state(true);
let imagemUrl = $state('');
let isSaving = $state(false);

const categories = [
  { value: 'pj', label: 'Personagem' },
  { value: 'npc', label: 'NPC' },
  { value: 'monstro', label: 'Monstro' },
  { value: 'item', label: 'Item' },
  { value: 'anotacao', label: 'Anotação' },
];

$effect(() => {
  if (open) {
    if (editItem) {
      title = editItem.titulo || '';
      content = editItem.conteudo || '';
      category = editItem.category || 'pj';
      tags = editItem.tags?.join(', ') || '';
      isVisibleToPlayers = editItem.isVisibleToPlayers ?? true;
      imagemUrl = editItem.imagemUrl || '';
    } else {
      title = '';
      content = '';
      category = 'pj';
      tags = '';
      isVisibleToPlayers = true;
      imagemUrl = '';
    }
  }
});

async function handleSave() {
  if (!title.trim()) {
    toast.error('O título é obrigatório');
    return;
  }

  isSaving = true;

  try {
    const cardData = {
      titulo: title.trim(),
      conteudo: content,
      category,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t),
      isVisibleToPlayers,
      imagemUrl: imagemUrl.trim() || null,
    };

    if (editItem) {
      await gameState.editCard(editItem.id, cardData);
      toast.success('Card atualizado!');
    } else {
      await gameState.createCard(cardData);
      toast.success('Card criado!');
    }

    open = false;
  } catch (error) {
    console.error('Error saving card:', error);
    toast.error('Erro ao salvar card');
  } finally {
    isSaving = false;
  }
}

async function handleDelete() {
  if (!editItem) return;

  if (!confirm('Tem certeza que deseja excluir este card?')) return;

  try {
    await gameState.removeCard(editItem.id);
    toast.success('Card excluído!');
    open = false;
  } catch (error) {
    console.error('Error deleting card:', error);
    toast.error('Erro ao excluir card');
  }
}
</script>

<Dialog bind:open onOpenChange={(v) => open = v}>
  <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogTitle>
      {editItem ? 'Editar Card' : 'Criar Card'}
    </DialogTitle>
    <DialogDescription>
      Preencha os detalhes do card. Use o editor de texto para formatar o conteúdo.
    </DialogDescription>
    
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="card-title">Título</label>
        <Input
          id="card-title"
          bind:value={title}
          placeholder="Nome do personagem, item, local..."
        />
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="card-category">Categoria</label>
          <Select
            bind:value={category}
            items={categories}
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium" for="card-tags">Tags</label>
          <Input
            id="card-tags"
            bind:value={tags}
            placeholder="guerreiro, mago, rare"
          />
        </div>
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium" for="card-image">URL da Imagem</label>
        <Input
          id="card-image"
          bind:value={imagemUrl}
          placeholder="https://..."
        />
      </div>
      
      {#if imagemUrl}
        <div class="aspect-video w-full max-w-xs mx-auto rounded-lg overflow-hidden bg-muted">
          <img src={imagemUrl} alt="Preview" class="w-full h-full object-cover" />
        </div>
      {/if}
      
      <div class="flex items-center gap-2">
        <Checkbox
          bind:checked={isVisibleToPlayers}
        />
        <label class="text-sm" for="card-visibility">
          Visível para jogadores
        </label>
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Conteúdo</label>
        <RichTextEditor bind:content />
      </div>
    </div>
    
    <div class="flex justify-between pt-4 border-t">
      <div>
        {#if editItem && gameState.isNarrator}
          <Button variant="destructive" onclick={handleDelete}>
            Excluir
          </Button>
        {/if}
      </div>
      <div class="flex gap-2">
        <Button variant="outline" onclick={() => open = false}>
          Cancelar
        </Button>
        <Button onclick={handleSave} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
