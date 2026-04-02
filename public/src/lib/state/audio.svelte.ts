import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '$lib/firebase/config.js';
import { authState } from './auth.svelte.ts';

const AUDIO_COLLECTION = 'audio';
const DEFAULT_GAME_ID = 'default';

interface AudioState {
  currentVideoId: string | null;
  status: 'playing' | 'paused' | 'stopped';
  serverTime: number | null;
  startTimeOffset: number;
  volume: number;
  createdBy: string;
}

function createAudioStore() {
  let gameId = $state(DEFAULT_GAME_ID);
  
  let audioState = $state<AudioState>({
    currentVideoId: null,
    status: 'stopped',
    serverTime: null,
    startTimeOffset: 0,
    volume: 80,
    createdBy: ''
  });
  
  let isLocalPlaying = $state(false);
  let isLoading = $state(true);
  let unsubscribe = null;
  let player = $state<YT.Player | null>(null);
  let playerReady = $state(false);
  let syncInterval: ReturnType<typeof setInterval> | null = null;

  function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async function initYoutubePlayer() {
    if (player) return;
    
    return new Promise<void>((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        createPlayer();
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        createPlayer();
        resolve();
      };
    });

    function createPlayer() {
      player = new (window as any).YT.Player('youtube-audio-player', {
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
          enablejsapi: 1
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (audioState.volume) {
              player?.setVolume(audioState.volume);
            }
          },
          onStateChange: onPlayerStateChange
        }
      });
    }
  }

  function onPlayerStateChange(event: any) {
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      isLocalPlaying = true;
    } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
      isLocalPlaying = false;
    } else if (event.data === (window as any).YT.PlayerState.ENDED) {
      isLocalPlaying = false;
    }
  }

  function getCurrentPosition(): number {
    if (audioState.status !== 'playing' || !audioState.serverTime) {
      return audioState.startTimeOffset;
    }
    
    const now = Date.now() / 1000;
    const serverNow = audioState.serverTime / 1000;
    const offset = now - serverNow;
    return audioState.startTimeOffset + offset;
  }

  function syncPlayer() {
    if (!player || !playerReady || !audioState.currentVideoId) return;

    const currentPos = getCurrentPosition();
    const playerState = player.getPlayerState();
    const playerCurrentTime = player.getCurrentPosition?.() || 0;

    if (audioState.status === 'playing') {
      if (playerState !== (window as any).YT.PlayerState.PLAYING) {
        player.seekTo(currentPos, true);
        player.playVideo();
      } else if (Math.abs(playerCurrentTime - currentPos) > 2) {
        player.seekTo(currentPos, true);
      }
    } else if (audioState.status === 'paused') {
      if (playerState === (window as any).YT.PlayerState.PLAYING) {
        player.pauseVideo();
      }
      if (Math.abs(playerCurrentTime - currentPos) > 1) {
        player.seekTo(currentPos, true);
      }
    }
  }

  function startSyncLoop() {
    if (syncInterval) return;
    syncInterval = setInterval(syncPlayer, 1000);
  }

  function stopSyncLoop() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  function subscribeToAudio() {
    if (unsubscribe) return;
    
    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    
    unsubscribe = onSnapshot(audioRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        audioState = {
          currentVideoId: data.currentVideoId || null,
          status: data.status || 'stopped',
          serverTime: data.serverTime?.toMillis?.() || data.serverTime || null,
          startTimeOffset: data.startTimeOffset || 0,
          volume: data.volume ?? 80,
          createdBy: data.createdBy || ''
        };
        
        if (audioState.status === 'playing') {
          startSyncLoop();
        } else {
          stopSyncLoop();
        }
      } else {
        audioState = {
          currentVideoId: null,
          status: 'stopped',
          serverTime: null,
          startTimeOffset: 0,
          volume: 80,
          createdBy: ''
        };
      }
      isLoading = false;
    });
  }

  async function play(videoIdOrUrl: string) {
    const videoId = extractYouTubeId(videoIdOrUrl);
    if (!videoId) return;

    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    const now = Date.now();
    
    await setDoc(audioRef, {
      currentVideoId: videoId,
      status: 'playing',
      serverTime: serverTimestamp(),
      startTimeOffset: 0,
      volume: audioState.volume,
      createdBy: authState.displayName || 'anonymous'
    }, { merge: true });

    if (player && playerReady) {
      player.loadVideoById({ videoId, startSeconds: 0 });
    }
  }

  async function pause() {
    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    const currentPos = getCurrentPosition();
    const now = Date.now();
    
    await updateDoc(audioRef, {
      status: 'paused',
      startTimeOffset: currentPos,
      serverTime: serverTimestamp()
    });

    if (player && playerReady) {
      player.pauseVideo();
    }
  }

  async function resume() {
    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    
    await updateDoc(audioRef, {
      status: 'playing',
      serverTime: serverTimestamp()
    });

    if (player && playerReady) {
      player.playVideo();
    }
  }

  async function stop() {
    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    
    await updateDoc(audioRef, {
      currentVideoId: null,
      status: 'stopped',
      startTimeOffset: 0
    });

    if (player && playerReady) {
      player.stopVideo();
    }
    
    stopSyncLoop();
  }

  async function setVolume(volume: number) {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    audioState.volume = clampedVolume;
    
    if (player && playerReady) {
      player.setVolume(clampedVolume);
    }

    try {
      const audioRef = doc(db, AUDIO_COLLECTION, gameId);
      await updateDoc(audioRef, { volume: clampedVolume });
    } catch (e) {
      console.warn('Failed to sync volume to Firestore');
    }
  }

  async function seekTo(seconds: number) {
    const audioRef = doc(db, AUDIO_COLLECTION, gameId);
    const now = Date.now();
    
    await updateDoc(audioRef, {
      startTimeOffset: seconds,
      serverTime: serverTimestamp()
    });

    if (player && playerReady) {
      player.seekTo(seconds, true);
    }
  }

  function setGameId(id: string) {
    gameId = id;
    if (unsubscribe) {
      unsubscribe();
      subscribeToAudio();
    }
  }

  function init() {
    isLoading = true;
    initYoutubePlayer();
    subscribeToAudio();
  }

  function destroy() {
    stopSyncLoop();
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (player) {
      player.destroy();
      player = null;
    }
  }

  return {
    get audioState() { return audioState; },
    get currentVideoId() { return audioState.currentVideoId; },
    get status() { return audioState.status; },
    get volume() { return audioState.volume; },
    get isLoading() { return isLoading; },
    get playerReady() { return playerReady; },
    get currentPosition() { return getCurrentPosition(); },
    play,
    pause,
    resume,
    stop,
    setVolume,
    seekTo,
    setGameId,
    init,
    destroy
  };
}

export const audioStore = createAudioStore();
