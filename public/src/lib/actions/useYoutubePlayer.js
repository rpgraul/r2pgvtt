import { audioState } from '../state/audio.svelte.js';

let youtubeApiLoaded = false;
let youtubeApiResolve = null;
const youtubeApiPromise = new Promise((resolve) => {
  youtubeApiResolve = resolve;
});

function loadYoutubeApi() {
  if (youtubeApiLoaded) return youtubeApiPromise;
  
  if (typeof window === 'undefined') return Promise.reject('No window');
  
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
  window.onYouTubeIframeAPIReady = () => {
    youtubeApiLoaded = true;
    youtubeApiResolve();
  };
  
  return youtubeApiPromise;
}

export function useYoutubePlayer(node, options = {}) {
  const {
    videoId = '',
    autoplay = 0,
    onReady = () => {},
    onStateChange = () => {},
    onError = () => {}
  } = options;
  
  let player = null;
  let isReady = false;
  let syncInterval = null;
  
  async function init() {
    await loadYoutubeApi();
    
    player = new window.YT.Player(node, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        loop: 1,
        playlist: videoId
      },
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
        onError
      }
    });
    
    audioState.setPlayer({
      play: () => player?.playVideo?.(),
      pause: () => player?.pauseVideo?.(),
      seekTo: (seconds) => player?.seekTo?.(seconds, true),
      setVolume: (vol) => player?.setVolume?.(vol),
      getCurrentTime: () => player?.getCurrentTime?.() || 0,
      getPlayerState: () => player?.getPlayerState?.()
    });
  }
  
  function handleReady(event) {
    isReady = true;
    onReady(event);
    
    if (audioState.volume) {
      player.setVolume(audioState.volume * 100);
    }
    
    startSyncInterval();
  }
  
  function handleStateChange(event) {
    onStateChange(event);
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      syncInterval = setInterval(syncFromPlayer, 1000);
    } else if (event.data === window.YT.PlayerState.PAUSED || 
               event.data === window.YT.PlayerState.ENDED) {
      stopSyncInterval();
      syncFromPlayer();
    }
  }
  
  function syncFromPlayer() {
    if (!player || !isReady || !audioState.isNarrator) return;
    
    const currentTime = player.getCurrentTime();
    if (typeof currentTime !== 'number' || isNaN(currentTime)) return;
    
    const serverTimestamp = audioState.timestamp;
    const serverLastUpdated = audioState.lastUpdated;
    
    if (!serverLastUpdated) return;
    
    const now = new Date();
    const timeDiff = (now - serverLastUpdated) / 1000;
    const expectedTime = serverTimestamp + timeDiff;
    const drift = Math.abs(currentTime - expectedTime);
    
    if (drift > 2) {
      console.log(`[Audio] Ajustando sincronização: drift=${drift.toFixed(1)}s`);
      player.seekTo(serverTimestamp, true);
    }
  }
  
  function startSyncInterval() {
    stopSyncInterval();
    syncInterval = setInterval(syncFromPlayer, 5000);
  }
  
  function stopSyncInterval() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }
  
  function syncToPlayer() {
    if (!player || !isReady) return;
    
    const serverStatus = audioState.status;
    const serverTimestamp = audioState.timestamp;
    const serverLastUpdated = audioState.lastUpdated;
    
    if (!serverLastUpdated) return;
    
    const playerState = player.getPlayerState();
    const isCurrentlyPlaying = playerState === window.YT.PlayerState.PLAYING;
    
    const now = new Date();
    const timeDiff = (now - serverLastUpdated) / 1000;
    const expectedTime = serverTimestamp + (serverStatus === 'playing' ? timeDiff : 0);
    
    if (Math.abs(player.getCurrentTime() - expectedTime) > 2) {
      player.seekTo(expectedTime, true);
    }
    
    if (serverStatus === 'playing' && !isCurrentlyPlaying) {
      player.playVideo();
    } else if (serverStatus === 'paused' && isCurrentlyPlaying) {
      player.pauseVideo();
    }
  }
  
  function loadVideo(id) {
    if (!player || !isReady) return;
    player.loadVideoById(id);
  }
  
  function destroy() {
    stopSyncInterval();
    if (player && player.destroy) {
      player.destroy();
    }
    player = null;
    isReady = false;
    audioState.setPlayer(null);
  }
  
  init();
  
  return {
    loadVideo,
    destroy,
    getPlayer: () => player,
    getIsReady: () => isReady
  };
}
