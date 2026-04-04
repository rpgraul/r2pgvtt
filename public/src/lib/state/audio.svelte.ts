import { db } from '$lib/supabase/tables';

interface AudioStateData {
  video_id: string | null;
  status: 'playing' | 'paused' | 'stopped';
  current_time: number;
  volume: number;
}

function createAudioStore() {
  let gameId = $state<string | null>(null);

  let audioState = $state<AudioStateData>({
    video_id: null,
    status: 'stopped',
    current_time: 0,
    volume: 80,
  });

  let isLocalPlaying = $state(false);
  let isLoading = $state(true);
  let player = $state<YT.Player | null>(null);
  let playerReady = $state(false);
  let syncInterval: ReturnType<typeof setInterval> | null = null;
  let lastServerTime = $state<number | null>(null);

  function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
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
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (audioState.volume) {
              player?.setVolume(audioState.volume);
            }
          },
          onStateChange: onPlayerStateChange,
        },
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
    if (audioState.status !== 'playing' || !lastServerTime) {
      return audioState.current_time;
    }

    const now = Date.now() / 1000;
    const serverNow = lastServerTime / 1000;
    const offset = now - serverNow;
    return audioState.current_time + offset;
  }

  function syncPlayer() {
    if (!player || !playerReady || !audioState.video_id) return;

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

  async function loadAudioState() {
    if (!gameId) return;

    try {
      const data = await db.getAudioState(gameId);
      if (data) {
        audioState = {
          video_id: data.video_id,
          status: data.status,
          current_time: data.current_time || 0,
          volume: data.volume ?? 80,
        };
        lastServerTime = new Date(data.updated_at).getTime() / 1000;

        if (audioState.status === 'playing') {
          startSyncLoop();
        }
      }
    } catch (e) {
      console.warn('Failed to load audio state:', e);
    }
    isLoading = false;
  }

  async function play(videoIdOrUrl: string) {
    if (!gameId) return;

    const videoId = extractYouTubeId(videoIdOrUrl);
    if (!videoId) return;

    lastServerTime = Date.now() / 1000;

    await db.updateAudioState(gameId, {
      video_id: videoId,
      status: 'playing',
      current_time: 0,
      volume: audioState.volume,
    });

    audioState = {
      ...audioState,
      video_id: videoId,
      status: 'playing',
      current_time: 0,
    };

    if (player && playerReady) {
      player.loadVideoById({ videoId, startSeconds: 0 });
    }

    startSyncLoop();
  }

  async function pause() {
    if (!gameId) return;

    const currentPos = getCurrentPosition();

    await db.updateAudioState(gameId, {
      status: 'paused',
      current_time: currentPos,
    });

    audioState = {
      ...audioState,
      status: 'paused',
      current_time: currentPos,
    };

    if (player && playerReady) {
      player.pauseVideo();
    }

    stopSyncLoop();
  }

  async function resume() {
    if (!gameId) return;

    lastServerTime = Date.now() / 1000;

    await db.updateAudioState(gameId, {
      status: 'playing',
    });

    audioState = {
      ...audioState,
      status: 'playing',
    };

    if (player && playerReady) {
      player.playVideo();
    }

    startSyncLoop();
  }

  async function stop() {
    if (!gameId) return;

    await db.updateAudioState(gameId, {
      video_id: null,
      status: 'stopped',
      current_time: 0,
    });

    audioState = {
      video_id: null,
      status: 'stopped',
      current_time: 0,
      volume: audioState.volume,
    };

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

    if (gameId) {
      try {
        await db.updateAudioState(gameId, { volume: clampedVolume });
      } catch (e) {
        console.warn('Failed to sync volume to Supabase');
      }
    }
  }

  async function seekTo(seconds: number) {
    if (!gameId) return;

    await db.updateAudioState(gameId, {
      current_time: seconds,
    });

    audioState = {
      ...audioState,
      current_time: seconds,
    };

    if (player && playerReady) {
      player.seekTo(seconds, true);
    }
  }

  function setGameId(id: string | null) {
    gameId = id;
    if (id) {
      loadAudioState();
    }
  }

  function init(gameIdParam?: string) {
    isLoading = true;
    if (gameIdParam) {
      gameId = gameIdParam;
    }
    initYoutubePlayer();
    if (gameId) {
      loadAudioState();
    }
  }

  function destroy() {
    stopSyncLoop();
    if (player) {
      player.destroy();
      player = null;
    }
    playerReady = false;
  }

  return {
    get audioState() {
      return audioState;
    },
    get currentVideoId() {
      return audioState.video_id;
    },
    get status() {
      return audioState.status;
    },
    get volume() {
      return audioState.volume;
    },
    get isLoading() {
      return isLoading;
    },
    get playerReady() {
      return playerReady;
    },
    get currentPosition() {
      return getCurrentPosition();
    },
    play,
    pause,
    resume,
    stop,
    setVolume,
    seekTo,
    setGameId,
    init,
    destroy,
  };
}

export const audioStore = createAudioStore();
