<script>
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import GridView from '$components/grid/GridView.svelte';
import { gameState } from '$lib/state/gameState.svelte.ts';

let ready = $state(false);

const inGame = $derived(!!gameState.gameId);

onMount(() => {
  if (browser) {
    const urlGameId = $page.url.searchParams.get('gameId');
    if (urlGameId) {
      window.history.replaceState({}, '', '/');
      gameState.setGameId(urlGameId);
    }
  }
  ready = true;
});
</script>

<div class="h-full w-full bg-background text-foreground overflow-hidden">
  {#if ready}
    {#if inGame}
      <GridView />
    {:else}
      <!-- Sem mesa selecionada -->
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Nenhuma mesa ativa selecionada</h2>
        <p class="text-sm text-muted-foreground mb-4">Escolha uma mesa para começar a jogar.</p>
        <a href="/games" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Ver Minhas Mesas
        </a>
      </div>
    {/if}
  {/if}
</div>
