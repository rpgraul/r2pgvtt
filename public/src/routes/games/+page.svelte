<script lang="ts">
import { authState } from '$lib/state/auth.svelte';
import { onMount } from 'svelte';
import { db } from '$lib/supabase/tables';
import GameList from '$components/games/GameList.svelte';
import Button from '$components/ui/Button.svelte';
import { goto } from '$app/navigation';

let isLoading = $state(true);
let games = $state([]);
let error = $state('');
let authReady = $derived(!authState.isLoading && authState.isAuthenticated);

$effect(() => {
  if (authReady) {
    loadGames();
  }
});

async function loadGames() {
  try {
    error = '';
    games = await db.getUserGames();
  } catch (err) {
    console.error('Error loading games:', err);
    error = 'Erro ao carregar jogos. Tente novamente.';
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (!authState.isAuthenticated && !authState.isLoading) {
    goto('/auth/login');
  }
});
</script>

<svelte:head>
  <title>Minhas Mesas - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <main class="container px-4 py-8">
    {#if authState.isLoading || isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <p class="text-red-500 mb-4">{error}</p>
        <Button onclick={loadGames}>Tentar novamente</Button>
      </div>
    {:else}
      <GameList {games} />
    {/if}
  </main>
</div>
