-- Step 1: Add current_track_id column to player_state
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS current_track_id uuid REFERENCES music_tracks(id);