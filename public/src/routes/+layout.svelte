<script>
import { ModeWatcher } from 'mode-watcher';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import YouTubeAudioPlayer from '$components/audio/YouTubeAudioPlayer.svelte';
import DiceLayer from '$components/dice/DiceLayer.svelte';
import Header from '$components/Header.svelte';
import YouTubeEmbed from '$components/player/YouTubeEmbed.svelte';
import HelpModal from '$lib/components/layout/HelpModal.svelte';
import Sidebar from '$lib/components/layout/Sidebar.svelte';
import ControlButtons from '$lib/components/ui/ControlButtons.svelte';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { audioStore } from '$lib/state/audio.svelte.ts';
import { authState } from '$lib/state/auth.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { musicState } from '$lib/state/music.svelte.js';
import { uiState } from '$lib/state/ui.svelte.js';
import '../app.css';

let { children } = $props();

let currentPath = $derived($page.url.pathname);
const inGame = $derived(
  !!gameState.gameId &&
    currentPath !== '/games' &&
    !currentPath.startsWith('/auth') &&
    currentPath !== '/converter',
);

// Rotas públicas que não precisam de login
const publicRoutes = ['/auth/login', '/auth/callback', '/join', '/converter'];
const isPublicRoute = $derived(publicRoutes.some((route) => currentPath.startsWith(route)));

// Loading durante auth check
const showAuthLoading = $derived(authState.isLoading);

// Music player global
const musicCurrentTrack = $derived(musicState.currentTrack());
const musicVideoId = $derived(musicCurrentTrack?.youtube_id || '');

// Inicializar musicState quando entrar em uma mesa
$effect(() => {
  const gameId = gameState.gameId;
  if (gameId && !musicState.isLoaded()) {
    musicState.init(gameId);
  }
});

onMount(async () => {
  authState.init();

  const checkAuth = setInterval(() => {
    if (!authState.isLoading) {
      clearInterval(checkAuth);
      handleAuthRedirect();
    }
  }, 100);

  audioStore.init();

  // Handle gameId query parameter if present
  const urlGameId = $page.url.searchParams.get('gameId');
  if (urlGameId) {
    const url = new URL(window.location.href);
    url.searchParams.delete('gameId');
    window.history.replaceState({}, '', url.pathname + url.search);
    gameState.setGameId(urlGameId);
  } else {
    gameState.init(null);
  }

  // Create fullscreen container for DiceBox
  const diceContainer = document.createElement('div');
  diceContainer.id = 'dice-box-wrapper';
  diceContainer.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;';
  document.body.appendChild(diceContainer);

  diceStore.initDiceBox(diceContainer);

  return () => {
    gameState.destroy();
    audioStore.destroy();
    if (diceContainer.parentNode) {
      diceContainer.parentNode.removeChild(diceContainer);
    }
  };
});

function handleAuthRedirect() {
  const isLoggedIn = authState.isAuthenticated;
  const goingToLogin = currentPath.startsWith('/auth/login');
  const goingToCallback = currentPath.startsWith('/auth/callback');

  // Se não está logado e não está em rota pública, redirecionar para login
  if (!isLoggedIn && !isPublicRoute) {
    goto('/auth/login');
    return;
  }

  // Se está logado e tenta acessar /auth/login (não callback), redirecionar para /games
  if (isLoggedIn && goingToLogin && !goingToCallback) {
    goto('/games');
    return;
  }
}

// Reação a mudanças no auth state
$effect(() => {
  if (!authState.isLoading) {
    handleAuthRedirect();
  }
});

// Guard de role para jogadores e narradores
$effect(() => {
  const isLoggedIn = authState.isAuthenticated;
  const role = gameState.currentGameRole;
  if (isLoggedIn && inGame && role) {
    if (role === 'narrador' && currentPath === '/sheet-mode') {
      goto('/dm-screen');
    } else if (role !== 'narrador' && currentPath === '/dm-screen') {
      goto('/sheet-mode');
    }
  }
});
</script>

<ModeWatcher />

<svelte:head>
  <title>R2PG VTT</title>
</svelte:head>

<YouTubeAudioPlayer />
{#if musicVideoId}
  <YouTubeEmbed videoId={musicVideoId} visible={false} />
{/if}
<DiceLayer />
<Toaster />

{#if showAuthLoading}
  <!-- Loading durante auth check -->
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
  </div>
{:else}
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-background">
    {#if !currentPath.startsWith('/auth') && currentPath !== '/join'}
      <Header minimal={currentPath.startsWith('/games') || !inGame} />
    {/if}

    <div class="relative flex-1 flex min-h-0 w-full overflow-hidden bg-background">
      <main class="relative flex-1 h-full overflow-auto">
        {@render children()}
      </main>

      {#if uiState.isSidebarOpen && inGame}
        <div class="h-full w-80 border-l bg-card flex flex-col shrink-0 animate-slide-in-right">
          <Sidebar />
        </div>
      {/if}

      <ControlButtons />
    </div>

    <HelpModal />
  </div>
{/if}
