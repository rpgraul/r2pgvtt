import { db } from '$lib/supabase/tables';
import { authState } from './auth.svelte.ts';

function createGameState() {
  let isLoading = $state(true);
  let currentGameId = $state(null);

  let items = $state([]);
  let chatMessages = $state([]);
  let rolls = $state([]);

  const filters = $state({
    search: '',
    category: 'all',
    tags: [],
    visibility: 'all',
  });

  let viewMode = $state('grid');

  let unsubItems = null;
  let unsubChat = null;
  let unsubRolls = null;
  let rollCallback = null;
  let lastRollId = null;

  function init(gameId = null) {
    isLoading = true;
    currentGameId = gameId;
    authState.init();

    unsubItems = db.subscribeToItems(gameId, (cards) => {
      items = cards;
      isLoading = false;
    });

    unsubChat = db.subscribeToChat(gameId, (messages) => {
      chatMessages = messages;
    });

    unsubRolls = db.subscribeToRolls(gameId, (rollData) => {
      rolls = rollData;

      if (rollData.length > 0) {
        const latestRoll = rollData[0];
        if (latestRoll.id !== lastRollId && rollCallback) {
          lastRollId = latestRoll.id;
          rollCallback(latestRoll);
        }
      }
    });
  }

  function setGameId(gameId = null) {
    if (currentGameId !== gameId) {
      destroy();
      init(gameId);
    }
  }

  function onRollReceived(callback) {
    rollCallback = callback;
  }

  const filteredItems = $derived.by(() => {
    let result = items;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.titulo?.toLowerCase().includes(searchLower) ||
          item.conteudo?.toLowerCase().includes(searchLower) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter((item) => item.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((item) => filters.tags.every((tag) => item.tags?.includes(tag)));
    }

    if (filters.visibility !== 'all') {
      if (filters.visibility === 'visible') {
        result = result.filter((item) => item.is_visible_to_players);
      } else if (filters.visibility === 'hidden') {
        result = result.filter((item) => !item.is_visible_to_players);
      }
    }

    return result;
  });

  const allTags = $derived.by(() => {
    const tagSet = new Set();
    items.forEach((item) => {
      item.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  const categories = $derived.by(() => {
    const cats = new Set();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  });

  function setSearch(search) {
    filters.search = search;
  }

  function setCategory(category) {
    filters.category = category;
  }

  function setTags(tags) {
    filters.tags = tags;
  }

  function setVisibility(visibility) {
    filters.visibility = visibility;
  }

  function setViewMode(mode) {
    viewMode = mode;
  }

  async function createCard(cardData) {
    return await db.addItem({
      game_id: currentGameId,
      ...cardData,
      created_by: authState.displayName,
    });
  }

  async function editCard(cardId, cardData) {
    await db.updateItem(cardId, cardData);
  }

  async function removeCard(cardId) {
    await db.deleteItem(cardId);
  }

  async function reorderCards(reorderedItems) {
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    await db.reorderItems(updates);
  }

  async function sendMessage(text) {
    if (!authState.displayName) return;
    await db.addChatMessage(text, 'user', authState.displayName);
  }

  async function sendSystemMessage(text) {
    await db.addChatMessage(text, 'system', 'Sistema');
  }

  async function sendRoll(formula, result, details) {
    if (!authState.displayName) return;
    await db.addRoll({
      userName: authState.displayName,
      formula,
      result,
      details,
    });
  }

  function destroy() {
    if (unsubItems) unsubItems();
    if (unsubChat) unsubChat();
    if (unsubRolls) unsubRolls();
    unsubItems = null;
    unsubChat = null;
    unsubRolls = null;
  }

  return {
    get user() {
      return authState.user;
    },
    get userName() {
      return authState.displayName;
    },
    getUserName: () => authState.displayName,
    get isNarrator() {
      return authState.role === 'narrador';
    },
    get isLoading() {
      return isLoading;
    },
    get items() {
      return items;
    },
    get chatMessages() {
      return chatMessages;
    },
    get rolls() {
      return rolls;
    },
    get filters() {
      return filters;
    },
    get viewMode() {
      return viewMode;
    },
    get filteredItems() {
      return filteredItems;
    },
    get allTags() {
      return allTags();
    },
    get categories() {
      return categories();
    },
    get gameId() {
      return currentGameId;
    },

    init,
    destroy,
    setGameId,
    setSearch,
    setCategory,
    setTags,
    setVisibility,
    setViewMode,
    createCard,
    editCard,
    removeCard,
    reorderCards,
    sendMessage,
    sendSystemMessage,
    sendRoll,
    setUserName: (name) => authState.updateProfile({ display_name: name }),
    setNarrator: () => authState.updateProfile({ role: 'narrador' }),
    onRollReceived,
    logout: () => authState.signOut(),
  };
}

export const gameState = createGameState();
