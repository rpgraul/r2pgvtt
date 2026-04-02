-- ============================================
-- GameBoard v2 - Supabase Schema
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Profiles (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code CHAR(8) UNIQUE NOT NULL,
  sistema TEXT DEFAULT 'RPG Genérico',
  moeda_padrao TEXT DEFAULT 'moedas de ouro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Game Members
CREATE TABLE IF NOT EXISTS game_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'jogador' CHECK (role IN ('narrador', 'assistente', 'jogador')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- ============================================
-- Functions
-- ============================================

-- Generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS CHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code CHAR(8) := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * 8 + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create game with owner
CREATE OR REPLACE FUNCTION create_game_with_owner(
  p_nome TEXT,
  p_owner_id UUID
) RETURNS UUID AS $$
DECLARE
  v_game_id UUID;
  v_invite_code CHAR(8);
BEGIN
  v_invite_code := generate_invite_code();
  
  INSERT INTO games (nome, owner_id, invite_code)
  VALUES (p_nome, p_owner_id, v_invite_code)
  RETURNING id INTO v_game_id;
  
  INSERT INTO game_members (game_id, user_id, role)
  VALUES (v_game_id, p_owner_id, 'narrador');
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can join game (max 3 games)
CREATE OR REPLACE FUNCTION can_join_game(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) < 3
    FROM game_members
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Members can view games" ON games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_members 
      WHERE game_id = games.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update games" ON games
  FOR UPDATE USING (owner_id = auth.uid());

-- Game Members policies
CREATE POLICY "Members can view members" ON game_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_members gm2
      WHERE gm2.game_id = game_members.game_id AND gm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Narradores can manage members" ON game_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_members gm2
      WHERE gm2.game_id = game_members.game_id 
        AND gm2.user_id = auth.uid()
        AND gm2.role IN ('narrador', 'assistente')
    )
  );

CREATE POLICY "Users can join games" ON game_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave games" ON game_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Trigger: Auto-create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_games_owner ON games(owner_id);
CREATE INDEX IF NOT EXISTS idx_games_invite_code ON games(invite_code);
CREATE INDEX IF NOT EXISTS idx_game_members_user ON game_members(user_id);
CREATE INDEX IF NOT EXISTS idx_game_members_game ON game_members(game_id);
