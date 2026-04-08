-- Migration: 002_music_player.sql
-- Creates music_tracks and player_state tables for collaborative music player

-- music_tracks: Playlist de músicas por jogo
CREATE TABLE IF NOT EXISTS music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  youtube_id text NOT NULL,
  title text,
  order_index integer NOT NULL DEFAULT 0,
  added_by uuid REFERENCES user_profiles(id),
  added_at timestamptz DEFAULT now()
);

-- Índice para buscar playlist de um jogo ordenado
CREATE INDEX IF NOT EXISTS idx_music_tracks_game_order ON music_tracks(game_id, order_index);

-- player_state: Estado atual do player (atualizado apenas quando playlist muda ou com debounce ~2s)
CREATE TABLE IF NOT EXISTS player_state (
  game_id uuid PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  is_playing boolean DEFAULT false,
  current_index integer DEFAULT 0,
  started_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;

-- Policy para music_tracks (usa DROP/CREATE pois IF NOT EXISTS não é suportado em policies)
DROP POLICY IF EXISTS "Members manage music tracks" ON music_tracks;
CREATE POLICY "Members manage music tracks" ON music_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = music_tracks.game_id 
      AND user_id = auth.uid()
    )
  );

-- Policy para player_state (usa DROP/CREATE pois IF NOT EXISTS não é suportado em policies)
DROP POLICY IF EXISTS "Members manage player state" ON player_state;
CREATE POLICY "Members manage player state" ON player_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = player_state.game_id 
      AND user_id = auth.uid()
    )
  );