<script lang="ts">
import GameCard from './GameCard.svelte';
import CreateGameModal from './CreateGameModal.svelte';
import { Plus } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';

interface Props {
  games: any[];
}

let { games = [] }: Props = $props();
let showCreateModal = $state(false);
let canCreateMore = $derived(games.length < 3);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-foreground">Minhas Mesas</h2>
      <p class="text-sm text-muted-foreground">
        {games.length} de 3 mesas
      </p>
    </div>
    
    <Button
      onclick={() => showCreateModal = true}
      disabled={!canCreateMore}
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
      {#each games as game (game.id)}
        <GameCard {game} />
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
