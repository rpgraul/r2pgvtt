<script lang="ts">
import { CheckCircle, Loader2, XCircle } from 'lucide-svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import Button from '$components/ui/Button.svelte';
import { authState } from '$lib/state/auth.svelte';
import { gameState } from '$lib/state/gameState.svelte';

let status = $state<'loading' | 'joining' | 'success' | 'error'>('loading');
let errorMessage = $state('');
let gameName = $state('');

const inviteCode = $derived($page.params.invite_code);

onMount(async () => {
  if (!authState.isAuthenticated) {
    const redirectTo = `/join/${inviteCode}`;
    await goto(`/auth/login?redirect_to=${encodeURIComponent(redirectTo)}`);
    return;
  }

  await tryJoinGame();
});

async function tryJoinGame() {
  status = 'joining';

  const game = await gameState.getGameByInviteCode(inviteCode);
  if (game) {
    gameName = game.nome;

    const existingRole = await gameState.checkUserGameMembership(game.id);
    if (existingRole) {
      status = 'success';
      gameState.setGameId(game.id);
      setTimeout(() => {
        goto('/');
      }, 1000);
      return;
    }
  }

  try {
    const result = await gameState.joinGame(inviteCode);

    if (result.success && result.gameId) {
      status = 'success';
      gameState.setGameId(result.gameId);
      setTimeout(() => {
        goto('/');
      }, 1500);
    } else {
      status = 'error';
      errorMessage = result.error || 'Erro ao entrar na mesa';
    }
  } catch (err: any) {
    status = 'error';
    if (err.message?.includes('Limite')) {
      errorMessage = 'Você atingiu o limite de 3 mesas. Saia de uma mesa para entrar em outra.';
    } else if (err.message?.includes('inválido')) {
      errorMessage = 'Código de convite inválido ou mesa excluída.';
    } else {
      errorMessage = err.message || 'Erro ao entrar na mesa';
    }
  }
}

async function goToLogin() {
  await goto(`/auth/login?redirect_to=/join/${inviteCode}`);
}

async function goToGames() {
  await goto('/games');
}
</script>

<svelte:head>
  <title>Entrar na Mesa - R2PG VTT</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
  <div class="w-full max-w-md text-center space-y-6">
    {#if status === 'loading' || status === 'joining'}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Entrando na Mesa
        </h1>
        <p class="text-muted-foreground">
          {#if gameName}
            Entrando em "{gameName}"...
          {:else}
            Verificando código de convite...
          {/if}
        </p>
      </div>
    {:else if status === 'success'}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle class="w-8 h-8 text-green-500" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Bem-vindo!
        </h1>
        <p class="text-muted-foreground">
          Você entrou na mesa com sucesso.
        </p>
        <p class="text-sm text-muted-foreground">
          Redirecionando...
        </p>
      </div>
    {:else if status === 'error'}
      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <XCircle class="w-8 h-8 text-destructive" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">
          Não foi possível entrar
        </h1>
        <p class="text-muted-foreground">
          {errorMessage}
        </p>
        <div class="flex flex-col gap-3 pt-4">
          <Button onclick={goToGames}>
            Ir para Minhas Mesas
          </Button>
          <Button variant="outline" onclick={goToLogin}>
            Fazer Login
          </Button>
        </div>
      </div>
    {/if}

    <div class="pt-4">
      <p class="text-xs text-muted-foreground">
        Código: <span class="font-mono font-semibold">{inviteCode}</span>
      </p>
    </div>
  </div>
</div>
