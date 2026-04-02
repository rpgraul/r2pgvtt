<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ModeWatcher } from 'mode-watcher';
  import { gameState } from '$lib/state/game.svelte.js';
  import { audioStore } from '$lib/state/audio.svelte.ts';
  import { diceStore } from '$lib/state/diceStore.svelte.js';
  import Header from '$components/Header.svelte';
  import FAB from '$components/FAB.svelte';
  import DiceLayer from '$components/dice/DiceLayer.svelte';
  import YouTubeAudioPlayer from '$components/audio/YouTubeAudioPlayer.svelte';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import '../app.css';
  
  let { children } = $props();
  
  let currentPath = $derived($page.url.pathname);
  
  onMount(() => {
    gameState.init();
    audioStore.init();
    
    // Create fullscreen container for DiceBox
    const diceContainer = document.createElement('div');
    diceContainer.id = 'dice-box-wrapper';
    diceContainer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;';
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
</script>

<ModeWatcher />

<svelte:head>
  <title>GameBoard v2</title>
</svelte:head>

<YouTubeAudioPlayer />
<DiceLayer />
<Toaster />

{#if currentPath === '/' || currentPath === '' || currentPath === '/converter'}
  <Header />
{/if}

<main>
  {@render children()}
</main>

{#if currentPath !== '/drawing-mode'}
  <FAB {currentPath} />
{/if}
