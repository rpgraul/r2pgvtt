-- Step 2: Create RPC function for reorder
CREATE OR REPLACE FUNCTION reorder_music_playlist(updates JSONB)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item JSONB;
  track_id UUID;
  new_order INT;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    track_id := (item->>'id')::UUID;
    new_order := (item->>'order_index')::INT;
    
    UPDATE music_tracks 
    SET order_index = new_order,
        updated_at = NOW()
    WHERE id = track_id;
  END LOOP;
END;
$$;