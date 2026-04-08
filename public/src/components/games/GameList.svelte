<script lang="ts">
import GameCard from './GameCard.svelte';
import CreateGameModal from './CreateGameModal.svelte';
import { Plus } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import { db } from '$lib/supabase/tables';

interface Props {
  games: any[];
}

let { games = [] }: Props = $props();

// Sort games: active first, deleted at end
let sortedGames = $derived(
  [...games].sort((a, b) => {
    if (a.deleted_at && !b.deleted_at) return 1;
    if (!a.deleted_at && b.deleted_at) return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }),
);

let showCreateModal = $state(false);
let canCreateMore = $derived(games.filter((g) => !g.deleted_at).length < 3);
let isLoading = $state(false);

async function handleDelete(gameId: string) {
  isLoading = true;
  try {
    await db.softDeleteGame(gameId);
    window.location.reload();
  } catch (err) {
    console.error('Error deleting game:', err);
    alert('Erro ao excluir mesa');
  } finally {
    isLoading = false;
  }
}

async function handleLeave(gameId: string, userRole?: string) {
  isLoading = true;
  try {
    await db.leaveGame(gameId, userRole);
    window.location.reload();
  } catch (err) {
    console.error('Error leaving game:', err);
    alert('Erro ao sair da mesa');
  } finally {
    isLoading = false;
  }
}

async function handleRestore(gameId: string) {
  isLoading = true;
  try {
    await db.cancelDeleteGame(gameId);
    window.location.reload();
  } catch (err) {
    console.error('Error restoring game:', err);
    alert('Erro ao restaurar mesa');
  } finally {
    isLoading = false;
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-foreground">Minhas Mesas</h2>
      <p class="text-sm text-muted-foreground">
        {games.filter(g => !g.deleted_at).length} de 3 mesas ativas
      </p>
    </div>
    
    <Button
      onclick={() => showCreateModal = true}
      disabled={!canCreateMore || isLoading}
    >
      <Plus class="w-4 h-4 mr-2" />
      Criar Mesa
    </Button>
  </div>

  {#if games.length === 0}
    <div class="text-center py-12 px-4 bg-muted/50 rounded-xl border border-border border-dashed">
      <p class="text-muted-foreground mb-4">
        Você ainda não participa de nenhuma mesa
      </p>
      <Button onclick={() => showCreateModal = true}>
        Criar sua primeira mesa
      </Button>
    </div>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each sortedGames as game (game.id)}
        {@const userRole = game.user_role?.[0]?.role || game.user_role}
        <GameCard 
          {game} 
          {userRole}
          onDelete={handleDelete}
          onLeave={(id) => handleLeave(id, userRole)}
          onRestore={handleRestore}
        />
      {/each}
    </div>
  {/if}

  {#if !canCreateMore}
    <p class="text-sm text-muted-foreground text-center">
      Limite de 3 mesas atingido. Saia de uma mesa para criar outra.
    </p>
  {/if}
</div>

<CreateGameModal
  bind:open={showCreateModal}
/>
