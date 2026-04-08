# Quickstart: Music Player

## 1. Database Setup

Executar migration para criar tabelas:

```sql
-- music_tracks
CREATE TABLE IF NOT EXISTS music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  youtube_id text NOT NULL,
  title text,
  order_index integer NOT NULL DEFAULT 0,
  added_by uuid REFERENCES user_profiles(id),
  added_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_game_order ON music_tracks(game_id, order_index);

-- player_state (atualizado apenas com debounce ~2s ou quando playlist muda)
CREATE TABLE IF NOT EXISTS player_state (
  game_id uuid PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  is_playing boolean DEFAULT false,
  current_index integer DEFAULT 0,
  started_at timestamptz,  -- para sync de posição
  updated_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;

-- Policy: members can manage music
CREATE POLICY "Members manage music tracks" ON music_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = music_tracks.game_id 
      AND user_id = auth.uid()
    )
  );

-- Policy: members can read/update player state
CREATE POLICY "Members manage player state" ON player_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = player_state.game_id 
      AND user_id = auth.uid()
    )
  );
```

---

## 2. Install Dependencies

Nenhuma dependência nova necessária além do Supabase já configurado.

---

## 3. Create State Module

Criar `src/lib/state/music.svelte.js`:

```javascript
import { supabase } from '$lib/supabase/client';

function createMusicState() {
  let playlist = $state([]);
  let isPlaying = $state(false);
  let currentIndex = $state(0);
  let startedAt = $state(null);  // Date.now() do último play
  let isLoaded = $state(false);
  let gameId = $state('');
  let volume = 70;  // localStorage
  
  let channel = null;
  let updateTimeout = null;  // debounce timer

  function getPlaylist() { return playlist; }
  function getIsPlaying() { return isPlaying; }
  function getCurrentTrack() { return playlist[currentIndex] ?? null; }
  function getCurrentIndex() { return currentIndex; }
  function getStartedAt() { return startedAt; }
  function getIsLoaded() { return isLoaded; }

  async function init(gid) {
    gameId = gid;
    
    // Volume from localStorage
    volume = parseInt(localStorage.getItem('music-volume') || '70');
    
    // Load playlist from DB
    const { data: tracks } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('game_id', gid)
      .order('order_index');
    playlist = tracks || [];
    
    // Load player state from DB (for new clients)
    const { data: state } = await supabase
      .from('player_state')
      .select('*')
      .eq('game_id', gid)
      .single();
    if (state) {
      isPlaying = state.is_playing;
      currentIndex = state.current_index;
      startedAt = state.started_at ? new Date(state.started_at).getTime() : null;
    }
    
    // Setup broadcast channel
    channel = supabase.channel(`player:${gid}`);
    
    channel.on('broadcast', { event: 'player' }, ({ payload }) => {
      handleBroadcast(payload);
    });
    
    channel.subscribe();
    isLoaded = true;
  }

  function handleBroadcast(payload) {
    // Deduplicação via timestamp
    if (payload.timestamp <= (startedAt || 0)) return;
    
    if (payload.action === 'play') {
      isPlaying = true;
      currentIndex = payload.trackIndex;
      startedAt = payload.startedAt;
    } else if (payload.action === 'pause') {
      isPlaying = false;
    } else if (payload.action === 'skip' || payload.action === 'auto-skip') {
      currentIndex = payload.toIndex;
      isPlaying = true;  // auto-skip continua tocando
      startedAt = Date.now();
    }
  }

  function destroy() {
    if (channel) {
      supabase.removeChannel(channel);
    }
    if (updateTimeout) clearTimeout(updateTimeout);
  }

  // Extract YouTube ID from various URL formats
  function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  async function addTrack(url) {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('URL inválida');
    
    const { data, error } = await supabase
      .from('music_tracks')
      .insert({
        game_id: gameId,
        youtube_id: videoId,
        title: videoId,  // TODO: fetch title via YouTube API
        order_index: playlist.length
      })
      .select()
      .single();
    
    if (error) throw error;
    playlist = [...playlist, data];
  }

  async function removeTrack(trackId) {
    await supabase.from('music_tracks').delete().eq('id', trackId);
    playlist = playlist.filter(t => t.id !== trackId);
  }

  async function play() {
    const now = Date.now();
    isPlaying = true;
    startedAt = now;
    
    // Broadcast: NÃO writes no DB
    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'play',
        trackIndex: currentIndex,
        startedAt: now,
        timestamp: now
      }
    });
    
    // Debounced DB write (~2s)
    scheduleStateUpdate();
  }

  async function pause() {
    isPlaying = false;
    
    // Broadcast: NÃO writes no DB
    channel?.send({
      type: 'broadcast',
      event: 'player',
      payload: {
        action: 'pause',
        trackIndex: currentIndex,
        timestamp: Date.now()
      }
    });
    
    // Debounced DB write (~2s)
    scheduleStateUpdate();
  }

  async function skip() {
    if (currentIndex < playlist.length - 1) {
      const now = Date.now();
      currentIndex++;
      startedAt = now;
      
      // Broadcast: NÃO writes no DB
      channel?.send({
        type: 'broadcast',
        event: 'player',
        payload: {
          action: 'skip',
          toIndex: currentIndex,
          timestamp: now
        }
      });
      
      scheduleStateUpdate();
    }
  }

  // Called when video ends (onStateChange = 0)
  async function autoSkip() {
    if (currentIndex < playlist.length - 1) {
      const now = Date.now();
      currentIndex++;
      startedAt = now;
      
      channel?.send({
        type: 'broadcast',
        event: 'player',
        payload: {
          action: 'auto-skip',
          toIndex: currentIndex,
          timestamp: now
        }
      });
      
      scheduleStateUpdate();
    } else {
      // Última música terminada
      isPlaying = false;
      channel?.send({
        type: 'broadcast',
        event: 'player',
        payload: {
          action: 'pause',
          trackIndex: currentIndex,
          timestamp: Date.now()
        }
      });
      scheduleStateUpdate();
    }
  }

  // Debounced DB write (~2s) - para evitar writes frequentes
  function scheduleStateUpdate() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
      await supabase
        .from('player_state')
        .upsert({
          game_id: gameId,
          is_playing: isPlaying,
          current_index: currentIndex,
          started_at: startedAt ? new Date(startedAt).toISOString() : null,
          updated_at: new Date()
        });
    }, 2000);
  }

  function setVolume(level) {
    volume = level;
    localStorage.setItem('music-volume', level.toString());
  }

  function getVolume() { return volume; }

  return {
    get playlist() { return getPlaylist; },
    get isPlaying() { return getIsPlaying; },
    get currentTrack() { return getCurrentTrack; },
    get currentIndex() { return getCurrentIndex; },
    get startedAt() { return getStartedAt; },
    get isLoaded() { return getIsLoaded; },
    init, destroy, addTrack, removeTrack, play, pause, skip, autoSkip, setVolume, getVolume
  };
}

export const musicState = createMusicState();
```

---

## 4. Create YouTube Embed Component

Criar `src/components/player/YouTubeEmbed.svelte`:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { musicState } from '$lib/state/music.svelte';

  let { videoId }: { videoId: string } = $props();
  
  let player: YT.Player | null = null;
  let playerReady = $state(false);
  let container: HTMLDivElement;

  onMount(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }
  });

  function createPlayer() {
    player = new window.YT.Player(container, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: () => { playerReady = true; },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          // Video ended (state = 0) → auto-skip
          if (event.data === window.YT.PlayerState.ENDED) {
            musicState.autoSkip();
          }
        }
      }
    });
  }

  // Sync with state changes
  $effect(() => {
    if (!player || !playerReady) return;
    
    const isPlaying = musicState.isPlaying();
    const startedAt = musicState.startedAt();
    
    if (isPlaying && startedAt) {
      const elapsed = (Date.now() - startedAt) / 1000;
      player.seekTo(elapsed, true);
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  });

  onDestroy(() => {
    if (player) {
      player.destroy();
    }
  });
</script>

<div bind:this={container} class="youtube-player"></div>

<style>
  .youtube-player {
    width: 100%;
    aspect-ratio: 16 / 9;
  }
</style>
```

---

## 5. Create Main Player Component

Criar `src/components/player/MusicPlayer.svelte`:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { musicState } from '$lib/state/music.svelte';
  import YouTubeEmbed from './YouTubeEmbed.svelte';
  
  interface Props {
    gameId: string;
  }
  
  let { gameId }: Props = $props();
  let urlInput = $state('');
  
  onMount(() => musicState.init(gameId));
  onDestroy(() => musicState.destroy());
</script>

<div class="music-player">
  <div class="controls">
    <button onclick={() => musicState.pause()} disabled={!musicState.isPlaying()}>⏸</button>
    <button onclick={() => musicState.play()} disabled={musicState.isPlaying()}>▶</button>
    <button onclick={() => musicState.skip()}>⏭</button>
    
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={musicState.getVolume()}
      oninput={(e) => musicState.setVolume(parseInt(e.currentTarget.value))}
    />
  </div>
  
  <div class="add-track">
    <input 
      type="text" 
      bind:value={urlInput} 
      placeholder="YouTube URL"
    />
    <button onclick={() => { musicState.addTrack(urlInput); urlInput = ''; }}>
      Adicionar
    </button>
  </div>
  
  <ul class="playlist">
    {#each musicState.playlist() as track, i}
      <li class:active={i === musicState.currentIndex()}>
        <span>{track.title || track.youtube_id}</span>
        <button onclick={() => musicState.removeTrack(track.id)}>×</button>
      </li>
    {/each}
  </ul>
  
  {#if musicState.currentTrack()}
    <YouTubeEmbed videoId={musicState.currentTrack().youtube_id} />
  {/if}
</div>
```

---

## 6. Integrar na Página do Jogo

Em `src/routes/games/[id]/+page.svelte`:

```svelte
<script>
  import MusicPlayer from '$components/player/MusicPlayer.svelte';
</script>

<MusicPlayer gameId={data.game.id} />
```

---

## 7. Fluxo de Sincronização

```
┌─────────────┐     Broadcast      ┌─────────────┐
│  Client A   │ ──────────────────▶│  Client B   │
│  (play)     │   startedAt        │  (recebe)   │
└─────────────┘                     └─────────────┘
        │                                    │
        ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│  Debounced      │                 │  seekTo()       │
│  upsert (~2s)   │                 │  playVideo()    │
└─────────────────┘                 └─────────────────┘
        │
        ▼ (on page load)
┌─────────────┐
│  Client C   │
│  (busca     │
│   started_at│
│   do DB)    │
└─────────────┘
```

---

## 8. Testar

1. Abrir dois navegadores na mesma página do jogo
2. Adicionar uma música (URL YouTube)
3. Clicar Play em um navegador → outro deve sincronizar em <500ms
4. Ajustar volume → não sincroniza (comportamento esperado)
5. Recarregar página → música continua do ponto onde estava