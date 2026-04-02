import { subscribeToMusic, unsubscribeMusic, play, pause, seekTo, setVideoId } from '../firebase/audioService.js';
import { gameState } from './game.svelte.js';

function createAudioState() {
  let videoId = $state(null);
  let status = $state('paused');
  let timestamp = $state(0);
  let lastUpdated = $state(null);
  let volume = $state(0.5);
  let isVisible = $state(true);
  
  let localPlayer = $state(null);
  let unsubscribeFirebase = null;
  
  function init(gameId) {
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }
    
    unsubscribeFirebase = subscribeToMusic(gameId, (data) => {
      if (data) {
        videoId = data.videoId || null;
        status = data.status || 'paused';
        timestamp = data.timestamp || 0;
        lastUpdated = data.lastUpdated || null;
        
        if (data.volume !== undefined) {
          volume = data.volume;
        }
      }
    });
  }
  
  function destroy() {
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
      unsubscribeFirebase = null;
    }
    videoId = null;
    status = 'paused';
    timestamp = 0;
    lastUpdated = null;
  }
  
  function setPlayer(player) {
    localPlayer = player;
  }
  
  function togglePlay() {
    if (!gameState.isNarrator || !localPlayer) return;
    
    if (status === 'playing') {
      pauseAction();
    } else {
      playAction();
    }
  }
  
  function playAction() {
    if (!gameState.gameId || !gameState.isNarrator) return;
    play(gameState.gameId);
  }
  
  function pauseAction() {
    if (!gameState.gameId || !gameState.isNarrator) return;
    pause(gameState.gameId);
  }
  
  function seekAction(newTimestamp) {
    if (!gameState.gameId || !gameState.isNarrator) return;
    seekTo(gameState.gameId, newTimestamp);
  }
  
  function setVideoIdAction(newVideoId) {
    if (!gameState.gameId || !gameState.isNarrator) return;
    setVideoId(gameState.gameId, newVideoId);
  }
  
  function setVolume(newVolume) {
    volume = Math.max(0, Math.min(1, newVolume));
    if (localPlayer && localPlayer.setVolume) {
      localPlayer.setVolume(volume * 100);
    }
  }
  
  function toggleVisibility() {
    isVisible = !isVisible;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('audioPlayerVisible', isVisible.toString());
    }
  }
  
  function loadVisibilityPreference() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('audioPlayerVisible');
      if (saved !== null) {
        isVisible = saved === 'true';
      }
    }
  }
  
  loadVisibilityPreference();
  
  return {
    get videoId() { return videoId; },
    get status() { return status; },
    get timestamp() { return timestamp; },
    get lastUpdated() { return lastUpdated; },
    get volume() { return volume; },
    get isVisible() { return isVisible; },
    get isPlaying() { return status === 'playing'; },
    get hasVideo() { return videoId !== null && videoId !== ''; },
    
    init,
    destroy,
    setPlayer,
    togglePlay,
    play: playAction,
    pause: pauseAction,
    seek: seekAction,
    setVideoId: setVideoIdAction,
    setVolume,
    toggleVisibility
  };
}

export const audioState = createAudioState();
