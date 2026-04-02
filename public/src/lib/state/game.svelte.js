import { 
  subscribeToItems, 
  subscribeToChat, 
  subscribeToRolls,
  addItem,
  updateItem,
  deleteItem,
  addChatMessage,
  addRoll
} from '../firebase/firestore.js';
import { auth } from './auth.svelte.ts';
import { diceStore } from './diceStore.svelte.js';

function createGameState() {
  let isLoading = $state(true);
  
  let items = $state([]);
  let chatMessages = $state([]);
  let rolls = $state([]);
  
  let filters = $state({
    search: '',
    category: 'all',
    tags: [],
    visibility: 'all'
  });
  
  let viewMode = $state('grid');
  
  let unsubscribeItems = null;
  let unsubscribeChat = null;
  let unsubscribeRolls = null;
  let rollCallback = null;
  let lastRollId = null;
  
  function init() {
    isLoading = true;
    auth.init();
    
    unsubscribeItems = subscribeToItems((cards) => {
      items = cards;
      isLoading = false;
    });
    
    unsubscribeChat = subscribeToChat((messages) => {
      chatMessages = messages;
    });
    
    unsubscribeRolls = subscribeToRolls((rollData) => {
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
  
  function onRollReceived(callback) {
    rollCallback = callback;
  }
  
  const filteredItems = $derived.by(() => {
    let result = items;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.titulo?.toLowerCase().includes(searchLower) ||
        item.conteudo?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(item => 
        filters.tags.every(tag => item.tags?.includes(tag))
      );
    }
    
    if (filters.visibility !== 'all') {
      if (filters.visibility === 'visible') {
        result = result.filter(item => item.isVisibleToPlayers);
      } else if (filters.visibility === 'hidden') {
        result = result.filter(item => !item.isVisibleToPlayers);
      }
    }
    
    return result;
  });
  
  const allTags = $derived.by(() => {
    const tagSet = new Set();
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });
  
  const categories = $derived.by(() => {
    const cats = new Set();
    items.forEach(item => {
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
    return await addItem({
      ...cardData,
      createdBy: auth.userName
    });
  }

  async function editCard(cardId, cardData) {
    await updateItem(cardId, {
      ...cardData,
      updatedBy: auth.userName
    });
  }

  async function removeCard(cardId) {
    await deleteItem(cardId);
  }
  
  async function reorderCards(reorderedItems) {
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      posicao: { x: index % 4, y: Math.floor(index / 4) }
    }));
    
    for (const update of updates) {
      await updateItem(update.id, { posicao: update.posicao });
    }
  }

  async function sendMessage(text) {
    if (!auth.userName) return;
    await addChatMessage(text, 'user', auth.userName, diceStore.currentDiceColor);
  }

  async function sendSystemMessage(text) {
    await addChatMessage(text, 'system', 'Sistema');
  }

  async function sendRoll(formula, result, details) {
    if (!auth.userName) return;
    await addRoll({
      userName: auth.userName,
      formula,
      result,
      ...details
    });
  }

  function destroy() {
    if (unsubscribeItems) unsubscribeItems();
    if (unsubscribeChat) unsubscribeChat();
    if (unsubscribeRolls) unsubscribeRolls();
  }

  return {
    get user() { return auth.user; },
    get userName() { return auth.userName; },
    getUserName: () => auth.getUserName(),
    get isNarrator() { return auth.isNarrator; },
    get isLoading() { return isLoading; },
    get items() { return items; },
    get chatMessages() { return chatMessages; },
    get rolls() { return rolls; },
    get filters() { return filters; },
    get viewMode() { return viewMode; },
    get filteredItems() { return filteredItems; },
    get allTags() { return allTags(); },
    get categories() { return categories(); },
    
    init,
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
    setUserName: (name) => auth.setUserName(name),
    setNarrator: (value) => auth.loginAsNarrator(),
    onRollReceived,
    logout: () => auth.logout(),
    destroy
  };
}

export const gameState = createGameState();
