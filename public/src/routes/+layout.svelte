<script>
import { ModeWatcher } from 'mode-watcher';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import YouTubeAudioPlayer from '$components/audio/YouTubeAudioPlayer.svelte';
import YouTubeEmbed from '$components/player/YouTubeEmbed.svelte';
import DiceLayer from '$components/dice/DiceLayer.svelte';
import FAB from '$components/FAB.svelte';
import Header from '$components/Header.svelte';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { audioStore } from '$lib/state/audio.svelte.ts';
import { authState } from '$lib/state/auth.svelte';
import { diceStore } from '$lib/state/diceStore.svelte.js';
import { gameState } from '$lib/state/gameState.svelte.ts';
import { musicState } from '$lib/state/music.svelte.js';
import { supabase } from '$lib/supabase/client';
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

// Ocultar FAB em rotas específicas
const hideFabRoutes = ['/auth/login', '/games', '/join'];
const showFab = $derived(!hideFabRoutes.some((route) => currentPath.startsWith(route)));

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

// Listener para Broadcast de dice (fora do onMount - nível do módulo)
let diceChannelInstance = null;

$effect(() => {
  const gameId = gameState?.gameId;
  if (gameId && !diceChannelInstance) {
    console.log('[Layout] Creating dice broadcast listener for game:', gameId);
    diceChannelInstance = supabase.channel(`dice:${gameId}`);
    diceChannelInstance.on('broadcast', { event: 'roll' }, (payload) => {
      console.log('[Layout] Broadcast roll received:', payload);
      const rollData = payload;
      diceStore.addRemoteAlert({
        formula: rollData.formula,
        result: rollData.result,
        userName: rollData.userName,
        details: rollData.details,
      });
    });
    diceChannelInstance.subscribe();
  }
});

// Listener para Broadcast de chat
let chatChannelInstance = null;

$effect(() => {
  const gameId = gameState?.gameId;
  if (gameId && !chatChannelInstance) {
    console.log('[Layout] Creating chat broadcast listener for game:', gameId);
    chatChannelInstance = supabase.channel(`chat:${gameId}`);
    chatChannelInstance.on('broadcast', { event: 'message' }, (payload) => {
      console.log('[Layout] Chat broadcast received:', payload);
      gameState.refreshChat(); // Forçar refresh quando nova msg recebida
    });
    chatChannelInstance.subscribe();
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

  // Conectar callback de rolls para todos os jogadores
  gameState.onRollReceived((roll) => {
    console.log('[Layout] Roll received:', roll);
    diceStore.addRemoteAlert({
      formula: roll.formula,
      result: roll.result,
      userName: roll.user_name,
      details: roll.details,
    });
  });

  return () => {
    gameState.destroy();
    audioStore.destroy();
    if (diceChannelInstance) {
      supabase.removeChannel(diceChannelInstance);
      diceChannelInstance = null;
    }
    if (chatChannelInstance) {
      supabase.removeChannel(chatChannelInstance);
      chatChannelInstance = null;
    }
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

  <main>
    {@render children()}
  </main>

  {#if showFab}
    <FAB {currentPath} />
  {/if}
{/if}
