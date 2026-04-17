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
  current_track_id uuid REFERENCES music_tracks(id),
  is_playing boolean DEFAULT false,
  started_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_state ENABLE ROW LEVEL SECURITY;

-- Policy para music_tracks (apenas usuário autenticado)
DROP POLICY IF EXISTS "Members manage music tracks" ON music_tracks;
CREATE POLICY "Members manage music tracks" ON music_tracks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Policy para player_state (apenas usuário autenticado)
DROP POLICY IF EXISTS "Members manage player state" ON player_state;
CREATE POLICY "Members manage player state" ON player_state
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Função RPC para reordenar playlist (otimizada - 1 request)
CREATE OR REPLACE FUNCTION reorder_music_playlist(updates JSONB)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE music_tracks 
    SET order_index = (item->>'order_index')::int,
        updated_at = NOW()
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;