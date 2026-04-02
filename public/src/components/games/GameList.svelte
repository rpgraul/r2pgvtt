<script lang="ts">
  import { gameState } from '$lib/state/game.svelte';
  import GameCard from './GameCard.svelte';
  import CreateGameModal from './CreateGameModal.svelte';
  import { Plus } from 'lucide-svelte';
  import Button from '$components/ui/Button.svelte';

  let showCreateModal = $state(false);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-foreground">Minhas Mesas</h2>
      <p class="text-sm text-muted-foreground">
        {gameState.games.length} de {gameState.maxGames} mesas
      </p>
    </div>
    
    <Button
      onclick={() => showCreateModal = true}
      disabled={!gameState.canCreateMore}
    >
      <Plus class="w-4 h-4 mr-2" />
      Criar Mesa
    </Button>
  </div>

  {#if gameState.isLoading}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each Array(3) as _}
        <div class="h-32 bg-muted animate-pulse rounded-xl"></div>
      {/each}
    </div>
  {:else if gameState.games.length === 0}
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
      {#each gameState.games as game (game.id)}
        <GameCard {game} userRole={(game as any).user_role} />
      {/each}
    </div>
  {/if}

  {#if !gameState.canCreateMore}
    <p class="text-sm text-muted-foreground text-center">
      Limite de {gameState.maxGames} mesas atingido. Saia de uma mesa para criar outra.
    </p>
  {/if}
</div>

<CreateGameModal
  bind:open={showCreateModal}
/>
