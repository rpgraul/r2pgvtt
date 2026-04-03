<script lang="ts">
  import { authState } from '$lib/state/auth.svelte';
  import { onMount } from 'svelte';
  import { db } from '$lib/supabase/tables';
  import GameList from '$components/games/GameList.svelte';
  import { LogOut, User } from 'lucide-svelte';
  import Button from '$components/ui/Button.svelte';
  import { goto } from '$app/navigation';

  let isLoading = $state(true);
  let games = $state([]);

  onMount(async () => {
    if (!authState.isAuthenticated) {
      await goto('/auth/login');
      return;
    }
    
    games = await db.getUserGames();
    isLoading = false;
  });

  async function handleLogout() {
    await authState.signOut();
    await goto('/');
  }
</script>

<svelte:head>
  <title>Minhas Mesas - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
    <div class="container px-4 py-4 flex items-center justify-between">
      <a href="/games" class="text-xl font-bold text-foreground">
        R2PG VTT
      </a>

      <div class="flex items-center gap-4">
        {#if authState.profile}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <User class="w-4 h-4" />
            <span>{authState.displayName}</span>
            {#if authState.role !== 'jogador'}
              <span class="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {authState.role === 'narrador' ? 'Mestre' : 'Assistente'}
              </span>
            {/if}
          </div>
        {/if}
        
        <Button variant="outline" size="sm" onclick={handleLogout}>
          <LogOut class="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  </header>

  <main class="container px-4 py-8">
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    {:else}
      <GameList {games} />
    {/if}
  </main>
</div>
