<script>
import { gameState } from '$lib/state/gameState.svelte.ts';
import { toast } from '$lib/stores/toast.js';
import Dialog from '$components/ui/Dialog.svelte';
import DialogContent from '$components/ui/DialogContent.svelte';
import DialogTitle from '$components/ui/DialogTitle.svelte';
import DialogDescription from '$components/ui/DialogDescription.svelte';
import Button from '$components/ui/Button.svelte';
import { Trash2, RotateCcw, X } from 'lucide-svelte';

let { open = $bindable(false) } = $props();

let trashItems = $state([]);
let isLoading = $state(false);

async function loadTrash() {
  if (!gameState.isNarrator) return;
  isLoading = true;
  try {
    trashItems = await gameState.getTrashItems();
  } catch (error) {
    console.error('Error loading trash:', error);
    toast.error('Erro ao carregar lixeira');
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (open && gameState.isNarrator) {
    loadTrash();
  }
});

async function handleRestore(itemId) {
  try {
    await gameState.restoreCard(itemId);
    toast.success('Card restaurado');
    await loadTrash();
  } catch (error) {
    console.error('Error restoring card:', error);
    toast.error('Erro ao restaurar card');
  }
}

async function handlePermanentDelete(itemId) {
  if (
    !confirm(
      'Tem certeza que deseja EXCLUIR PERMANENTEMENTE este card? Esta ação não pode ser desfeita.',
    )
  )
    return;

  try {
    await gameState.permanentlyDeleteCard(itemId);
    toast.success('Card excluído permanentemente');
    await loadTrash();
  } catch (error) {
    console.error('Error permanently deleting card:', error);
    toast.error('Erro ao excluir card');
  }
}

async function handleEmptyTrash() {
  if (
    !confirm(
      'Tem certeza que deseja LIMPAR A LIXEIRA? Todos os cards serão excluídos permanentemente.',
    )
  )
    return;

  try {
    await gameState.emptyTrash();
    toast.success('Lixeira limpa');
    await loadTrash();
  } catch (error) {
    console.error('Error emptying trash:', error);
    toast.error('Erro ao limpar lixeira');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isOlderThan30Days(dateStr) {
  if (!dateStr) return false;
  const deletedDate = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - deletedDate) / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}
</script>

<Dialog bind:open onOpenChange={(v) => open = v}>
  <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogTitle>Lixeira</DialogTitle>
    <DialogDescription>
      Cards excluídos são mantidos por 30 dias. Narrador pode restaurar ou excluir permanentemente.
    </DialogDescription>
    
    {#if !gameState.isNarrator}
      <div class="text-center py-8 text-muted-foreground">
        Apenas o narrador pode acessar a lixeira.
      </div>
    {:else if isLoading}
      <div class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    {:else if trashItems.length === 0}
      <div class="text-center py-8 text-muted-foreground">
        <Trash2 class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>A lixeira está vazia.</p>
      </div>
    {:else}
      <div class="space-y-2 py-4">
        {#each trashItems as item}
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{item.titulo}</p>
              <p class="text-xs text-muted-foreground">
                Excluído em {formatDate(item.deleted_at)}
                {#if isOlderThan30Days(item.deleted_at)}
                  <span class="text-destructive font-medium"> (expirando)</span>
                {/if}
              </p>
            </div>
            <div class="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onclick={() => handleRestore(item.id)}>
                <RotateCcw class="w-4 h-4 mr-1" />
                Restaurar
              </Button>
              <Button size="sm" variant="destructive" onclick={() => handlePermanentDelete(item.id)}>
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
        {/each}
      </div>
      
      <div class="flex justify-end pt-4 border-t">
        <Button variant="destructive" onclick={handleEmptyTrash}>
          <Trash2 class="w-4 h-4 mr-2" />
          Limpar Lixeira
        </Button>
      </div>
    {/if}
  </DialogContent>
</Dialog>