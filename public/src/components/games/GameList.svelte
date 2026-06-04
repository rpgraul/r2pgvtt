<script lang="ts">
import { Plus } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import { db } from '$lib/supabase/tables';
import CreateGameModal from './CreateGameModal.svelte';
import GameCard from './GameCard.svelte';

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

<div class="space-y-6 max-w-5xl mx-auto py-8 px-4">
  <div class="flex items-center justify-between border-b pb-4">
    <div>
      <h1 class="text-xl font-bold text-foreground tracking-tight">Minhas Mesas</h1>
      <p class="text-xs text-muted-foreground mt-0.5">
        {games.filter(g => !g.deleted_at).length} de 3 mesas ativas
      </p>
    </div>
    
    <button
      onclick={() => showCreateModal = true}
      disabled={!canCreateMore || isLoading}
      class="inline-flex h-8.5 items-center justify-center rounded border bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus class="w-3.5 h-3.5 mr-1" />
      Criar Mesa
    </button>
  </div>

  {#if games.length === 0}
    <div class="text-center py-16 px-4 bg-background border border-dashed rounded flex flex-col items-center justify-center">
      <p class="text-xs text-muted-foreground mb-4">
        Você ainda não participa de nenhuma mesa.
      </p>
      <button 
        onclick={() => showCreateModal = true}
        class="inline-flex h-8.5 items-center justify-center rounded border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer text-foreground"
      >
        Criar sua primeira mesa
      </button>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    <p class="text-xs text-muted-foreground text-center pt-2">
      Limite de 3 mesas ativas atingido. Exclua ou saia de uma mesa para poder criar outra.
    </p>
  {/if}
</div>

<CreateGameModal
  bind:open={showCreateModal}
/>
