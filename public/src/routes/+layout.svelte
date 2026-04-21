<script>
import { ModeWatcher } from 'mode-watcher';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import YouTubeAudioPlayer from '$components/audio/YouTubeAudioPlayer.svelte';
import YouTubeEmbed from '$components/player/YouTubeEmbed.svelte';
import DiceLayer from '$components/dice/DiceLayer.svelte';
import Header from '$components/Header.svelte';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { audioStore } from '$lib/state/audio.svelte.ts';
import { authState } from '$lib/state/auth.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { musicState } from '$lib/state/music.svelte.js';
import { uiState } from '$lib/state/ui.svelte.js';
import Sidebar from '$lib/components/layout/Sidebar.svelte';
import ControlButtons from '$lib/components/ui/ControlButtons.svelte';
import HelpModal from '$lib/components/layout/HelpModal.svelte';
import '../app.css';

let { children } = $props();

let currentPath = $derived($page.url.pathname);

// Rotas públicas que não precisam de login
const publicRoutes = ['/auth/login', '/auth/callback', '/join', '/converter'];
const isPublicRoute = $derived(publicRoutes.some((route) => currentPath.startsWith(route)));

// Verificar se deve mostrar header (páginas选择了 pública)
const isGamesPage = $derived(currentPath.startsWith('/games'));
const showHeaderOnPublicPages = $derived(
  currentPath === '/' || currentPath === '' || currentPath === '/converter',
);

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
  const goingToJoin = currentPath.startsWith('/join');

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
  {#if currentPath === '/' || currentPath === '' || currentPath === '/converter' || currentPath === '/auth/login' || currentPath.startsWith('/games') || currentPath.startsWith('/text-mode') || currentPath.startsWith('/sheet-mode') || currentPath.startsWith('/drawing-mode')}
    <Header minimal={currentPath === '/auth/login' || isGamesPage} />
  {/if}

  <div class="relative flex h-screen w-screen overflow-hidden bg-background">
    <main class="relative flex-1 overflow-auto transition-all duration-300">
      {@render children()}
    </main>

    {#if uiState.isSidebarOpen}
      <div class="h-full w-80 border-l bg-card transition-all duration-300 animate-slide-in-right">
        <Sidebar />
      </div>
    {/if}

    <ControlButtons />
  </div>

  <HelpModal />
{/if}
