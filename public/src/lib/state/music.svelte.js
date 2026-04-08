import { supabase } from '$lib/supabase/client';
import { authState } from './auth.svelte.ts';

function createMusicState() {
  let playlist = $state([]);
  let isPlaying = $state(false);
  let currentIndex = $state(0);
  let startedAt = $state(null);
  let isLoaded = $state(false);
  let currentGameId = $state('');
  let volume = 70;
  let isLoading = $state(false);
  let error = $state(null);

  let channel = null;
  let updateTimeout = null;
  let lastBroadcastTimestamp = 0;

  function getPlaylist() {
    return playlist;
  }

  function getIsPlaying() {
    return isPlaying;
  }

  function getCurrentTrack() {
    return playlist[currentIndex] ?? null;
  }

  function getCurrentIndex() {
    return currentIndex;
  }

  function getStartedAt() {
    return startedAt;
  }

  function getIsLoaded() {
    return isLoaded;
  }

  function getVolume() {
    return volume;
  }

  function getIsLoading() {
    return isLoading;
  }

  function getError() {
    return error;
  }

  function extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async function fetchVideoTitle(videoId) {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      );
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (e) {
      console.warn('[Music] Failed to fetch title:', e);
    }
    return null;
  }

  async function loadPlaylist(gameId) {
    const { data: tracks, error: fetchError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true });

    if (fetchError) {
      console.error('[Music] Error loading playlist:', fetchError);
      error = 'Erro ao carregar playlist';
      return;
    }

    playlist = tracks || [];
  }

  async function loadPlayerState(gameId) {
    const { data: state, error: fetchError } = await supabase
      .from('player_state')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[Music] Error loading player state:', fetchError);
      return;
    }

    if (state) {
      isPlaying = state.is_playing ?? false;
      currentIndex = state.current_index ?? 0;
      startedAt = state.started_at ? new Date(state.started_at).getTime() : null;
    }
  }

  function handleBroadcast(payload) {
    if (payload.timestamp <= lastBroadcastTimestamp) {
      return;
    }
    lastBroadcastTimestamp = payload.timestamp;

    if (payload.action === 'play') {
      isPlaying = true;
      currentIndex = payload.trackIndex;
      startedAt = payload.startedAt;
    } else if (payload.action === 'pause') {
      isPlaying = false;
    } else if (payload.action === 'skip' || payload.action === 'auto-skip') {
      currentIndex = payload.toIndex;
      if (payload.action === 'auto-skip') {
        isPlaying = true;
        startedAt = Date.now();
      }
    }
  }

  async function init(gameId) {
    if (!gameId) return;

    isLoading = true;
    error = null;
    currentGameId = gameId;

    if (typeof window !== 'undefined' && window.localStorage) {
      volume = parseInt(localStorage.getItem('music-volume') || '70', 10);
    }

    await loadPlaylist(gameId);
    await loadPlayerState(gameId);

    channel = supabase.channel(`player:${gameId}`);

    channel.on('broadcast', { event: 'player' }, ({ payload }) => {
      handleBroadcast(payload);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Music] Broadcast channel subscribed');
      }
    });

    isLoaded = true;
    isLoading = false;
  }

  function destroy() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
    isLoaded = false;
    playlist = [];
    isPlaying = false;
    currentIndex = 0;
    startedAt = null;
  }

  async function addTrack(url) {
    const videoId = extractVideoId(url);
    if (!videoId) {
      error = 'URL do YouTube inválida';
      throw new Error('URL inválida');
    }

    isLoading = true;
    error = null;

    const title = await fetchVideoTitle(videoId);

    const { data: track, error: insertError } = await supabase
      .from('music_tracks')
      .insert({
        game_id: currentGameId,
        youtube_id: videoId,
        title: title || videoId,
        order_index: playlist.length,
        added_by: authState.user?.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Music] Error adding track:', insertError);
      error = 'Erro ao adicionar música';
      isLoading = false;
      throw insertError;
    }

    playlist = [...playlist, track];
    isLoading = false;
  }

  async function removeTrack(trackId) {
    const { error: deleteError } = await supabase.from('music_tracks').delete().eq('id', trackId);

    if (deleteError) {
      console.error('[Music] Error removing track:', deleteError);
      error = 'Erro ao remover música';
      throw deleteError;
    }

    playlist = playlist.filter((t) => t.id !== trackId);

    if (currentIndex >= playlist.length && playlist.length > 0) {
      currentIndex = playlist.length - 1;
    }
  }

  async function play() {
    if (playlist.length === 0) return;

    const now = Date.now();
    isPlaying = true;
    startedAt = now;

    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'play',
        trackIndex: currentIndex,
        startedAt: now,
        timestamp: now,
      },
    });

    scheduleStateUpdate();
  }

  async function pause() {
    isPlaying = false;

    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'pause',
        trackIndex: currentIndex,
        timestamp: Date.now(),
      },
    });

    scheduleStateUpdate();
  }

  async function skip() {
    if (currentIndex >= playlist.length - 1) return;

    const now = Date.now();
    currentIndex++;
    startedAt = now;
    isPlaying = true;

    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'skip',
        toIndex: currentIndex,
        timestamp: now,
      },
    });

    scheduleStateUpdate();
  }

  async function setTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    currentIndex = index;
    startedAt = Date.now();
    isPlaying = true;

    const now = Date.now();
    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'play',
        trackIndex: index,
        startedAt: now,
        timestamp: now,
      },
    });

    scheduleStateUpdate();
  }

  async function autoSkip() {
    const now = Date.now();

    if (currentIndex < playlist.length - 1) {
      currentIndex++;
      startedAt = now;
      isPlaying = true;

      channel?.send({
        type: 'broadcast',
        event: 'player',
        payload: {
          action: 'auto-skip',
          toIndex: currentIndex,
          timestamp: now,
        },
      });
    } else {
      isPlaying = false;
      startedAt = null;

      channel?.send({
        type: 'broadcast',
        event: 'player',
        payload: {
          action: 'pause',
          trackIndex: currentIndex,
          timestamp: now,
        },
      });
    }

    scheduleStateUpdate();
  }

  function scheduleStateUpdate() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(async () => {
      await supabase.from('player_state').upsert({
        game_id: currentGameId,
        is_playing: isPlaying,
        current_index: currentIndex,
        started_at: startedAt ? new Date(startedAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      });
    }, 2000);
  }

  function setVolume(level) {
    volume = level;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('music-volume', level.toString());
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get playlist() {
      return getPlaylist;
    },
    get isPlaying() {
      return getIsPlaying;
    },
    get currentTrack() {
      return getCurrentTrack;
    },
    get currentIndex() {
      return getCurrentIndex;
    },
    get startedAt() {
      return getStartedAt;
    },
    get isLoaded() {
      return getIsLoaded;
    },
    get volume() {
      return getVolume;
    },
    get isLoading() {
      return getIsLoading;
    },
    get error() {
      return getError;
    },
    get gameId() {
      return currentGameId;
    },
    init,
    destroy,
    addTrack,
    removeTrack,
    play,
    pause,
    skip,
    setTrack,
    autoSkip,
    setVolume,
    clearError,
  };
}

export const musicState = createMusicState();
