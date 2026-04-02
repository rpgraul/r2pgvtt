<script>
  import { onMount, onDestroy } from 'svelte';
  import { audioStore } from '$lib/state/audio.svelte.ts';
  
  let player = $state(null);
  let playerReady = $state(false);
  let syncInterval = null;
  
  const currentVideoId = $derived(audioStore.currentVideoId);
  const status = $derived(audioStore.status);
  const volume = $derived(audioStore.volume);
  
  onMount(() => {
    initPlayer();
  });
  
  onDestroy(() => {
    if (syncInterval) clearInterval(syncInterval);
    if (player) {
      player.destroy();
    }
  });
  
  function initPlayer() {
    if (typeof window === 'undefined') return;
    
    const win = window;
    if (win.YT && win.YT.Player) {
      createPlayer();
      return;
    }
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    
    win.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
  }
  
  function createPlayer() {
    const win = window;
    player = new win.YT.Player('youtube-audio-player-iframe', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        enablejsapi: 1,
        widget_referrer: window.location.href
      },
      events: {
        onReady: () => {
          playerReady = true;
          if (player && volume) {
            player.setVolume(volume);
          }
          startSyncLoop();
        },
        onStateChange: handleStateChange
      }
    });
  }
  
  function handleStateChange(event) {
    const win = window;
    if (event.data === win.YT.PlayerState.PLAYING) {
      // Playing
    } else if (event.data === win.YT.PlayerState.PAUSED) {
      // Paused
    } else if (event.data === win.YT.PlayerState.ENDED) {
      audioStore.stop();
    }
  }
  
  function startSyncLoop() {
    if (syncInterval) return;
    syncInterval = setInterval(() => {
      if (!player || !playerReady) return;
      
      syncPlayerState();
    }, 1000);
  }
  
  function syncPlayerState() {
    const win = window;
    if (!player || !playerReady || !currentVideoId) return;
    
    const playerState = player.getPlayerState();
    const currentTime = player.getCurrentPosition?.() || 0;
    
    if (status === 'playing') {
      if (playerState !== win.YT.PlayerState.PLAYING) {
        player.playVideo();
      }
      
      const targetTime = audioStore.currentPosition;
      if (Math.abs(currentTime - targetTime) > 2) {
        player.seekTo(targetTime, true);
      }
    } else if (status === 'paused') {
      if (playerState === win.YT.PlayerState.PLAYING) {
        player.pauseVideo();
      }
      
      const targetTime = audioStore.currentPosition;
      if (Math.abs(currentTime - targetTime) > 1) {
        player.seekTo(targetTime, true);
      }
    }
  }
  
  $effect(() => {
    if (!playerReady || !player || !currentVideoId) return;
    
    if (currentVideoId && status === 'playing') {
      player.loadVideoById({
        videoId: currentVideoId,
        startSeconds: audioStore.currentPosition
      });
    }
  });
  
  $effect(() => {
    if (!playerReady || !player) return;
    player.setVolume(volume);
  });
</script>

<div id="youtube-audio-player-iframe" class="hidden"></div>

<style>
  .hidden {
    display: none;
    width: 0;
    height: 0;
    position: absolute;
    left: -9999px;
  }
</style>
