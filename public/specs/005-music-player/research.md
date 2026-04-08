# Research: Music Player

## YouTube IFrame API

**Decision**: Usar YouTube IFrame API oficial

**Rationale**: Solução mais madura e suportada oficialmente pelo YouTube. Permite controle via JavaScript (play, pause, seek, volume).

**Alternatives considered**:
- `youtube-iframe-ctrl` (npm): Biblioteca wrapper, menos overhead que API completa? Não - mesma coisa
- Embed simples sem API: Sem controle de playback

**Implementation**:
```html
<script src="https://www.youtube.com/iframe_api"></script>
```
```javascript
// Carregar player
new YT.Player('player-id', {
  videoId: 'VIDEO_ID',
  playerVars: { autoplay: 0, controls: 1 }
});

// Controlar
player.playVideo();
player.pauseVideo();
player.seekTo(seconds);
player.setVolume(0-100);
```

---

## Supabase Realtime Patterns

**Decision**: Usar **Broadcast** para sincronização de estado + **Postgres** para persistência

**Rationale**: 
- Broadcast: Latência ultra-baixa (<100ms), ideal para play/pause/skip
- Postgres: Playlist persistente, estado inicial ao carregar página

**Alternatives considered**:
- Apenas Postgres com Realtime subscriptions: Funciona mas latência maior (~200-500ms)
- Apenas Broadcast: Estado perdido ao sair/retornar → precisa de persistência
- Redis/另一: Overkill para este caso de uso

**Arquitetura**:
```
┌─────────────┐     Broadcast      ┌─────────────┐
│  Client A   │ ──────────────────▶│  Client B   │
│  (play)     │   (<100ms)         │  (recebe)   │
└─────────────┘                     └─────────────┘
        │
        ▼
┌─────────────────┐
│  Supabase DB    │
│  (playlist,    │
│   player_state) │
└─────────────────┘
        │
        ▼ (on page load)
┌─────────────┐
│  Client C   │
│  (estado    │
│   inicial)  │
└─────────────┘
```

---

## YouTube URL Parsing

**Decision**: Regex para extrair video ID

**Rationale**: Sem necessidade de API externa para apenas extrair ID

**Patterns suportados**:
- `youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`
- `youtube.com/v/VIDEO_ID`

```javascript
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/  // já é ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
```

---

## Sincronização de Estado

**Decision**: Estado compartilhado via Broadcast, estado local (volume) via localStorage

**Rationale**:
- Play/Pause/Skip: Todos recebem (broadcast)
- Volume: Individual (localStorage, não sincronizado)
- Playlist: Persistida no DB (não muda tanto)

**Estado a sincronizar** (via Broadcast):
```typescript
interface PlayerBroadcast {
  action: 'play' | 'pause' | 'skip';
  trackIndex: number;
  timestamp: number;  // para sync de posição
}
```

**Estado persistido** (no DB):
```sql
music_tracks (game_id, youtube_id, title, order_index, added_by, added_at)
player_state (game_id, is_playing, current_index, updated_at)
```

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| YouTube IFrame API | Usar API oficial `YT.Player` |
| Supabase Realtime patterns | Broadcast para sync (<100ms), DB para persistência |
| YouTube URL parsing | Regex custom, sem API externa |
| Latência | Broadcast <100ms, DB ~200-500ms |