-- ============================================
-- R2PG VTT - Schema FINAL (nome: profiles)
-- Execute no SQL Editor do novo projeto
-- ============================================

-- Limpar
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS audio_state CASCADE;
DROP TABLE IF EXISTS dice_rolls CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS game_members CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Tabela profiles (nome correto que o Supabase espera)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'jogador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL CHECK (char_length(nome) <= 280),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code CHAR(8) UNIQUE NOT NULL,
  sistema TEXT DEFAULT 'RPG',
  moeda_padrao TEXT DEFAULT 'PO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Members
CREATE TABLE game_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'jogador',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT DEFAULT '',
  category TEXT DEFAULT 'misc',
  tags TEXT[] DEFAULT '{}',
  imagem_url TEXT,
  is_visible_to_players BOOLEAN DEFAULT true,
  posicao JSONB DEFAULT '{"x":0,"y":0}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  "order" INTEGER DEFAULT 0
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT NOT NULL,
  type TEXT DEFAULT 'user',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dice Rolls
CREATE TABLE dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  result INTEGER NOT NULL,
  details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio State
CREATE TABLE audio_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  video_id TEXT,
  status TEXT DEFAULT 'stopped',
  current_video_time DOUBLE PRECISION DEFAULT 0,
  volume INTEGER DEFAULT 80,
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funções
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS CHAR(8) AS $$
DECLARE chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; code CHAR(8) := ''; i INT;
BEGIN FOR i IN 1..8 LOOP code := code || substr(chars, floor(random() * 32 + 1)::int, 1); END LOOP; RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_game_with_owner(p_nome TEXT, p_owner_id UUID)
RETURNS UUID AS $$
DECLARE v_game_id UUID; v_invite_code CHAR(8);
BEGIN
  v_invite_code := generate_invite_code();
  INSERT INTO games (nome, owner_id, invite_code) VALUES (p_nome, p_owner_id, v_invite_code) RETURNING id INTO v_game_id;
  INSERT INTO game_members (game_id, user_id, role) VALUES (v_game_id, p_owner_id, 'narrador');
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_games_owner ON games(owner_id);
CREATE INDEX idx_games_invite_code ON games(invite_code);
CREATE INDEX idx_game_members_user ON game_members(user_id);
CREATE INDEX idx_game_members_game ON game_members(game_id);

-- Default
INSERT INTO site_settings (key, value) VALUES ('main', '{"siteTitle": "R2PG VTT", "theme": "dark"}') ON CONFLICT (key) DO NOTHING;

-- Verificar
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';