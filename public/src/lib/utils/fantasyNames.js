const FANTASY_NAMES_GIST =
  'https://gist.githubusercontent.com/tkfu/9819e4ac6d529e225e9fc58b358c3479/raw/srd_5e_monsters.json';

let cachedNames = null;

export async function getRandomFantasyName() {
  if (cachedNames) {
    return cachedNames[Math.floor(Math.random() * cachedNames.length)];
  }

  try {
    const response = await fetch(FANTASY_NAMES_GIST);
    if (!response.ok) throw new Error('Falha ao buscar nomes');

    const data = await response.json();
    cachedNames = data.map((item) => item.name);
    return cachedNames[Math.floor(Math.random() * cachedNames.length)];
  } catch (error) {
    console.error('Erro ao buscar nomes fantasia:', error);
    return 'Viajante';
  }
}

export function getOrCreateUserName() {
  const stored = localStorage.getItem('rpgboard_user_name');
  if (stored) return stored;

  const defaultNames = [
    'Dragão das Sombras',
    'Mago Ancião',
    'Cavaleiro Negro',
    'Elfo Arqueiro',
    'Anão Ferreiro',
    'Orc Bárbaro',
    'Fada Encantada',
    'Goblin Ladino',
    'Druida Selvagem',
    'Bárbaro Berserker',
  ];

  return defaultNames[Math.floor(Math.random() * defaultNames.length)];
}
