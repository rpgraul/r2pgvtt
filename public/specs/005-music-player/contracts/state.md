# Interface Contracts: Music Player

## State Module: `music.svelte.js`

### Factory Function

```typescript
interface MusicState {
  // Getters (não expõe $state diretamente)
  get playlist(): MusicTrack[];
  get isPlaying(): boolean;
  get currentTrack(): MusicTrack | null;
  get currentIndex(): number;
  get startedAt(): number | null;  // Date.now() do último play
  get isLoaded(): boolean;

  // Actions
  init(gameId: string): Promise<void>;
  destroy(): void;
  
  // Player controls (via Broadcast, não write no DB)
  addTrack(url: string): Promise<void>;
  removeTrack(trackId: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  skip(): Promise<void>;
  autoSkip(): Promise<void>;  // Called when video ends
  
  // Volume local (não sincronizado)
  setVolume(level: number): void;
  getVolume(): number;
}
```

### Types

```typescript
interface MusicTrack {
  id: string;
  youtubeId: string;
  title: string;
  orderIndex: number;
  addedBy: string;
  addedAt: Date;
}

interface PlayerState {
  isPlaying: boolean;
  currentIndex: number;
  startedAt: number | null;  // Date.now() do último play
  updatedAt: Date;
}
```

---

## Component: `MusicPlayer.svelte`

### Props

```typescript
interface Props {
  gameId: string;
  class?: string;
}
```

### Events

```svelte
<script>
  let { gameId, class: className }: Props = $props();
</script>
```

---

## Component: `YouTubeEmbed.svelte`

### Props

```typescript
interface Props {
  videoId: string;
}
```

### Behavior

- Carrega YouTube IFrame API dinamicamente
- Escuta `onStateChange` para detectar vídeo terminado → chama `autoSkip()`
- Usa `$effect` para sincronizar play/pause/seek com `musicState`

---

## Supabase Functions

### Database Tables

- `music_tracks`: Playlist completa (persistida)
- `player_state`: Estado do player (atualizado com debounce ~2s)

### Broadcast Channel

**Channel name**: `player:{game_id}`

**Payloads**:

```typescript
// Play
{
  action: 'play',
  trackIndex: number,
  startedAt: number,  // Date.now()
  timestamp: number   // Date.now() (para deduplicação)
}

// Pause
{
  action: 'pause',
  trackIndex: number,
  timestamp: number
}

// Skip (manual)
{
  action: 'skip',
  toIndex: number,
  timestamp: number
}

// Auto-skip (video ended)
{
  action: 'auto-skip',
  toIndex: number,
  timestamp: number
}
```

---

## Fluxo de Sincronização

### Cliente novo entra na mesa:

1. Busca playlist: `SELECT * FROM music_tracks WHERE game_id = $game_id`
2. Busca estado: `SELECT * FROM player_state WHERE game_id = $game_id`
3. Se `is_playing && started_at`: calcula `elapsed = Date.now() - started_at`, faz `seekTo(elapsed)`

### Cliente dá play:

1. Atualiza estado local (`isPlaying = true`, `startedAt = Date.now()`)
2. Envia Broadcast (não write no DB)
3. Debounced upsert (~2s) para `player_state`

### Cliente recebe broadcast:

1. Recebe payload com `startedAt`
2. Calcula `elapsed = Date.now() - startedAt`
3. `player.seekTo(elapsed)` + `player.playVideo()`