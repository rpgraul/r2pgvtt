export type UserRole = 'narrador' | 'assistente' | 'jogador';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface Game {
  id: string;
  nome: string;
  owner_id: string;
  invite_code: string;
  sistema: string;
  moeda_padrao: string;
  created_at: string;
}

export interface GameMember {
  id: string;
  game_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

export interface GameWithMembers extends Game {
  members?: GameMember[];
}

export interface GameMemberWithProfile extends GameMember {
  profile: Profile;
}
