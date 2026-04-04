export interface CardInput {
  titulo: string;
  conteudo?: string;
  category?: string;
  tags?: string[];
  imagemUrl?: string;
  isVisibleToPlayers?: boolean;
  order?: number;
  gameId: string;
}

export interface CardDB {
  id: string;
  game_id: string;
  titulo: string;
  conteudo: string;
  category: string;
  tags: string[];
  imagem_url: string | null;
  is_visible_to_players: boolean;
  order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function toCardDB(card: CardInput): Partial<CardDB> {
  return {
    game_id: card.gameId,
    titulo: card.titulo,
    conteudo: card.conteudo || '',
    category: card.category || 'misc',
    tags: card.tags || [],
    imagem_url: card.imagemUrl || null,
    is_visible_to_players: card.isVisibleToPlayers ?? true,
    order: card.order ?? 0,
  };
}

export function fromCardDB(card: CardDB): any {
  return {
    id: card.id,
    gameId: card.game_id,
    titulo: card.titulo,
    conteudo: card.conteudo,
    category: card.category,
    tags: card.tags,
    imagemUrl: card.imagem_url,
    isVisibleToPlayers: card.is_visible_to_players,
    order: card.order,
    createdBy: card.created_by,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
  };
}

export function fromCardDBArray(cards: CardDB[]): any[] {
  return cards.map(fromCardDB);
}
