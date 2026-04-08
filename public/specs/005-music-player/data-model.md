# Data Model: Music Player

## Database Schema

### Tabela: `music_tracks`

Playlist de músicas por jogo.

```sql
CREATE TABLE music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  youtube_id text NOT NULL,
  title text,
  order_index integer NOT NULL DEFAULT 0,
  added_by uuid REFERENCES user_profiles(id),
  added_at timestamptz DEFAULT now()
);

-- Índice para buscar playlist de um jogo ordenado
CREATE INDEX idx_music_tracks_game_order ON music_tracks(game_id, order_index);

-- RLS: qualquer membro da mesa pode ver/adicionar
CREATE POLICY "Members can manage music tracks" ON music_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = music_tracks.game_id 
      AND user_id = auth.uid()
    )
  );
```

### Tabela: `player_state`

Estado atual do player (qual música, playing/paused). Atualizado **apenas quando a playlist muda** ou com **debounce ~2s** em play/pause (para evitar writes frequentes).

```sql
CREATE TABLE player_state (
  game_id uuid PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  is_playing boolean DEFAULT false,
  current_index integer DEFAULT 0,
  started_at timestamptz,  -- Date.now() do último play, para sync de posição
  updated_at timestamptz DEFAULT now()
);

-- RLS: qualquer membro da mesa
CREATE POLICY "Members can read player state" ON player_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = player_state.game_id 
      AND user_id = auth.uid()
    )
  );

-- Atualização apenas com debounce ~2s (play/pause) ou quando playlist muda
CREATE POLICY "Members can update player state" ON player_state
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = player_state.game_id 
      AND user_id = auth.uid()
    )
  );
```

---

## Estado Local (localStorage)

Volume individual por usuário (não sincronizado):

```typescript
interface LocalPlayerState {
  volume: number;        // 0-100, padrão 70
  lastGameId: string;   // último jogo acessado
}
```

---

## Broadcast Channel

Nome do canal: `player:{game_id}` (ex: `player:abc-123`)

### Payload Format

```typescript
interface PlayerBroadcast {
  action: 'play' | 'pause' | 'skip' | 'auto-skip';
  trackIndex: number;
  startedAt: number;   // Date.now() do momento que deu play (para sync de posição)
  timestamp: number;   // Date.now() do broadcast (para deduplicação)
}
```

### Eventos

| Evento | Conteúdo | Quando enviar |
|--------|----------|---------------|
| play | `{action: 'play', trackIndex, startedAt, timestamp}` | Usuário clica Play |
| pause | `{action: 'pause', trackIndex, timestamp}` | Usuário clica Pause |
| skip | `{action: 'skip', toIndex, timestamp}` | Usuário clica Skip |
| auto-skip | `{action: 'auto-skip', toIndex, timestamp}` | Vídeo terminou (onStateChange = 0) |

### Fluxo de Sincronização

1. Cliente A dá **play**: envia broadcast `{action: 'play', trackIndex: 0, startedAt: Date.now()}`
2. Cliente B recebe: configura YouTube player para `trackIndex: 0`, faz `seekTo(0)`, dá play
3. Cliente C entra na mesa depois: busca `player_state` do banco (tem `started_at`), calcula `elapsed = Date.now() - started_at`, faz `seekTo(elapsed/1000)`

---

## Entity Relationships

```
games (1) ──────< (N) music_tracks
      │
      └──────< (1) player_state

profiles (1) ──< (N) music_tracks (added_by)
```

---

## Queries

### Obter playlist ordenada
```sql
SELECT * FROM music_tracks 
WHERE game_id = $game_id 
ORDER BY order_index ASC;
```

### Obter estado atual (para novo cliente sincronizar)
```sql
SELECT * FROM player_state WHERE game_id = $game_id;
```

### Adicionar música (com broadcast同步 para outros clientes)
```sql
INSERT INTO music_tracks (game_id, youtube_id, title, order_index, added_by)
VALUES ($game_id, $youtube_id, $title, 
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM music_tracks WHERE game_id = $game_id),
  $user_id
);
```

### Remover música
```sql
DELETE FROM music_tracks WHERE id = $track_id;
```

### Atualizar estado (apenas com debounce ~2s ou quando playlist muda)
```sql
UPDATE player_state 
SET is_playing = $is_playing, 
    current_index = $current_index, 
    started_at = $started_at, 
    updated_at = now()
WHERE game_id = $game_id;
```