<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { gameState } from '$lib/state/game.svelte';
  import { authState } from '$lib/state/auth.svelte';
  import type { Game, GameMemberWithProfile } from '$lib/supabase/types';
  import { Settings, Users, Share2, ArrowLeft, LogOut } from 'lucide-svelte';
  import Button from '$components/ui/Button.svelte';
  import InviteLink from '$components/games/InviteLink.svelte';
  import MemberList from '$components/games/MemberList.svelte';

  let game = $state<Game | null>(null);
  let members = $state<GameMemberWithProfile[]>([]);
  let userRole = $state<string | null>(null);
  let isLoading = $state(true);

  const gameId = $derived($page.params.id);

  onMount(async () => {
    if (!authState.isAuthenticated) {
      await goto('/auth/login');
      return;
    }

    await loadGame();
    isLoading = false;
  });

  async function loadGame() {
    game = await gameState.getGameById(gameId);
    if (!game) {
      await goto('/games');
      return;
    }

    members = await gameState.getGameMembers(gameId);
    userRole = await gameState.checkUserGameMembership(gameId);

    if (!userRole) {
      await goto('/games');
      return;
    }
  }

  async function handleLeave() {
    if (!confirm('Tem certeza que deseja sair desta mesa?')) return;

    const success = await gameState.leaveGame(gameId);
    if (success) {
      await goto('/games');
    }
  }

  function canManageSettings(): boolean {
    return userRole === 'narrador' || userRole === 'assistente';
  }
</script>

<svelte:head>
  <title>{game?.nome ?? 'Mesa'} - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
    <div class="container px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a href="/games" class="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft class="w-5 h-5" />
          </a>
          <div>
            <h1 class="text-xl font-bold text-foreground">
              {game?.nome ?? 'Carregando...'}
            </h1>
            {#if game?.sistema}
              <p class="text-sm text-muted-foreground">{game.sistema}</p>
            {/if}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <InviteLink {game} />
          
          {#if canManageSettings()}
            <a href="/games/{gameId}/settings">
              <Button variant="outline" size="sm">
                <Settings class="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </a>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="container px-4 py-8">
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    {:else if game}
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users class="w-5 h-5" />
              Membros ({members.length})
            </h2>
            <MemberList
              {members}
              currentUserId={authState.user?.id ?? ''}
              {userRole}
              {gameId}
              onMemberRemoved={loadGame}
            />
          </section>

          <section class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-4">Conteúdo da Mesa</h2>
            <p class="text-muted-foreground">
              Aqui aparecerão os cards, dados e outras funcionalidades da mesa.
            </p>
          </section>
        </div>

        <div class="space-y-6">
          <div class="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 class="font-semibold">Sua Função</h3>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 text-sm font-medium rounded-full
                {userRole === 'narrador' ? 'bg-purple-500/20 text-purple-400' :
                 userRole === 'assistente' ? 'bg-blue-500/20 text-blue-400' :
                 'bg-green-500/20 text-green-400'}">
                {userRole === 'narrador' ? 'Mestre (Narrador)' :
                 userRole === 'assistente' ? 'Assistente' : 'Jogador'}
              </span>
            </div>
          </div>

          {#if userRole !== 'narrador'}
            <Button variant="outline" class="w-full" onclick={handleLeave}>
              <LogOut class="w-4 h-4 mr-2" />
              Sair da Mesa
            </Button>
          {:else}
            <p class="text-sm text-muted-foreground text-center">
              Como narrador, você não pode sair da mesa.
            </p>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>
