<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { gameState } from '$lib/state/gameState.svelte';
import { authState } from '$lib/state/auth.svelte';
import type { Game } from '$lib/supabase/types';
import { ArrowLeft, Save, Copy, Check } from 'lucide-svelte';
import Button from '$components/ui/Button.svelte';
import Input from '$components/ui/Input.svelte';
import InviteLink from '$components/games/InviteLink.svelte';
import MemberList from '$components/games/MemberList.svelte';
import type { GameMemberWithProfile } from '$lib/supabase/types';

let game = $state<Game | null>(null);
let members = $state<GameMemberWithProfile[]>([]);
let userRole = $state<string | null>(null);
let isLoading = $state(true);
let isSaving = $state(false);
let saveMessage = $state('');

let nome = $state('');
let sistema = $state('');
let moedaPadrao = $state('');

const gameId = $derived($page.params.id);

onMount(async () => {
  if (!authState.isAuthenticated) {
    await goto('/auth/login');
    return;
  }

  userRole = await gameState.checkUserGameMembership(gameId);

  if (!userRole || userRole === 'jogador') {
    await goto(`/games/${gameId}`);
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

  nome = game.nome;
  sistema = game.sistema;
  moedaPadrao = game.moeda_padrao;

  members = await gameState.getGameMembers(gameId);
}

async function handleSave() {
  if (!nome.trim()) return;

  isSaving = true;
  saveMessage = '';

  const success = await gameState.updateGame(gameId, {
    nome: nome.trim(),
    sistema: sistema.trim() || 'RPG Genérico',
    moeda_padrao: moedaPadrao.trim() || 'moedas de ouro',
  });

  isSaving = false;

  if (success) {
    saveMessage = 'Alterações salvas!';
    setTimeout(() => (saveMessage = ''), 3000);
  } else {
    saveMessage = 'Erro ao salvar';
  }
}
</script>

<svelte:head>
  <title>Configurações - {game?.nome ?? 'Mesa'} - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
    <div class="container px-4 py-4">
      <div class="flex items-center gap-4">
        <a href="/games/{gameId}" class="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </a>
        <div>
          <h1 class="text-xl font-bold text-foreground">Configurações da Mesa</h1>
          <p class="text-sm text-muted-foreground">{game?.nome ?? 'Carregando...'}</p>
        </div>
      </div>
    </div>
  </header>

  <main class="container px-4 py-8">
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    {:else}
      <div class="max-w-2xl space-y-8">
        <section class="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 class="text-lg font-semibold">Informações da Mesa</h2>

          <div class="space-y-4">
            <div class="space-y-2">
              <label for="nome" class="text-sm font-medium">Nome da Mesa</label>
              <Input
                id="nome"
                type="text"
                bind:value={nome}
                placeholder="Nome da sua aventura"
              />
            </div>

            <div class="space-y-2">
              <label for="sistema" class="text-sm font-medium">Sistema de RPG</label>
              <Input
                id="sistema"
                type="text"
                bind:value={sistema}
                placeholder="D&D 5e, Pathfinder, Tormenta20, etc."
              />
            </div>

            <div class="space-y-2">
              <label for="moeda" class="text-sm font-medium">Moeda Padrão</label>
              <Input
                id="moeda"
                type="text"
                bind:value={moedaPadrao}
                placeholder="Moedas de ouro, piezas, créditos, etc."
              />
            </div>
          </div>

          <div class="flex items-center gap-4 pt-2">
            <Button onclick={handleSave} disabled={isSaving || !nome.trim()}>
              {#if isSaving}
                <div class="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                Salvando...
              {:else}
                <Save class="w-4 h-4 mr-2" />
                Salvar Alterações
              {/if}
            </Button>
            {#if saveMessage}
              <span class="text-sm {saveMessage.includes('Erro') ? 'text-destructive' : 'text-green-500'}">
                {saveMessage}
              </span>
            {/if}
          </div>
        </section>

        <section class="bg-card border border-border rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Link de Convite</h2>
            <InviteLink {game} {userRole} />
          </div>
          <p class="text-sm text-muted-foreground">
            Compartilhe este link para convidar jogadores para a mesa.
          </p>
          {#if game?.invite_code}
            <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code class="flex-1 font-mono text-sm">{game.invite_code}</code>
            </div>
          {/if}
        </section>

        <section class="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 class="text-lg font-semibold">Membros da Mesa</h2>
          <MemberList
            {members}
            currentUserId={authState.user?.id ?? ''}
            {userRole}
            {gameId}
            onMemberRemoved={loadGame}
          />
        </section>
      </div>
    {/if}
  </main>
</div>
