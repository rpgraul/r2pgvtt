import { supabase } from '$lib/supabase/client';
import { db } from '$lib/supabase/tables';
import { authState } from './auth.svelte';
import { fromCardDBArray } from '$lib/utils/cardMapper';

const STORAGE_KEY = 'rpgboard_current_game';

function getStoredGameId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}

function setStoredGameId(gameId: string | null): void {
  if (typeof window !== 'undefined') {
    if (gameId) {
      localStorage.setItem(STORAGE_KEY, gameId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

class GameState {
  isLoading = $state(true);
  currentGameId = $state<string | null>(null);

  items = $state<any[]>([]);
  chatMessages = $state<any[]>([]);
  rolls = $state<any[]>([]);

  filters = $state({
    search: '',
    category: 'all',
    tags: [] as string[],
    visibility: 'all',
  });

  viewMode = $state('grid');

  private unsubItems: (() => void) | null = null;
  private unsubChat: (() => void) | null = null;
  private unsubRolls: (() => void) | null = null;
  private rollCallback: ((roll: any) => void) | null = null;
  private lastRollId: string | null = null;
  private realtimeChannels: any = { items: null, chat: null, rolls: null };

  get user() {
    return authState.user;
  }

  get userName() {
    return authState.displayName;
  }

  get isNarrator() {
    return !authState.isLoading && authState.role === 'narrador';
  }

  get gameId() {
    return this.currentGameId;
  }

  get activeGameId() {
    return this.currentGameId;
  }

  get filteredItems() {
    let result = this.items;

    if (authState.role !== 'narrador') {
      result = result.filter((item) => item.isVisibleToPlayers);
    }

    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.titulo?.toLowerCase().includes(searchLower) ||
          item.conteudo?.toLowerCase().includes(searchLower) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    if (this.filters.category && this.filters.category !== 'all') {
      result = result.filter((item) => item.category === this.filters.category);
    }

    if (this.filters.tags && this.filters.tags.length > 0) {
      result = result.filter((item) => this.filters.tags.every((tag) => item.tags?.includes(tag)));
    }

    if (this.filters.visibility !== 'all') {
      if (this.filters.visibility === 'visible') {
        result = result.filter((item) => item.is_visible_to_players);
      } else if (this.filters.visibility === 'hidden') {
        result = result.filter((item) => !item.is_visible_to_players);
      }
    }

    return result;
  }

  get allTags() {
    const tagSet = new Set<string>();
    this.items.forEach((item) => {
      item.tags?.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  get categories() {
    const cats = new Set<string>();
    this.items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }

  init(gameId: string | null = null) {
    this.isLoading = true;

    if (gameId === null) {
      gameId = getStoredGameId();
    }

    this.currentGameId = gameId;
    authState.init();

    this.cleanupRealtimeChannels();

    this.unsubItems = db.subscribeToItems(
      gameId,
      (cards) => {
        this.items = fromCardDBArray(cards);
        this.isLoading = false;
      },
      (channel) => {
        this.realtimeChannels.items = channel;
      },
    );

    this.unsubChat = db.subscribeToChat(
      gameId,
      (messages) => {
        this.chatMessages = messages;
      },
      (channel) => {
        this.realtimeChannels.chat = channel;
      },
    );

    this.unsubRolls = db.subscribeToRolls(
      gameId,
      (rollData) => {
        this.rolls = rollData;

        if (rollData.length > 0) {
          const latestRoll = rollData[0];
          if (latestRoll.id !== this.lastRollId && this.rollCallback) {
            this.lastRollId = latestRoll.id;
            this.rollCallback(latestRoll);
          }
        }
      },
      (channel) => {
        this.realtimeChannels.rolls = channel;
      },
    );
  }

  setGameId(gameId: string | null) {
    if (this.currentGameId !== gameId) {
      setStoredGameId(gameId);
      this.cleanupRealtimeChannels();
      this.destroy();
      this.init(gameId);
    }
  }

  private cleanupRealtimeChannels() {
    if (this.realtimeChannels.items) {
      supabase.removeChannel(this.realtimeChannels.items);
      this.realtimeChannels.items = null;
    }
    if (this.realtimeChannels.chat) {
      supabase.removeChannel(this.realtimeChannels.chat);
      this.realtimeChannels.chat = null;
    }
    if (this.realtimeChannels.rolls) {
      supabase.removeChannel(this.realtimeChannels.rolls);
      this.realtimeChannels.rolls = null;
    }
  }

  setSearch(search: string) {
    this.filters.search = search;
  }

  setCategory(category: string) {
    this.filters.category = category;
  }

  setTags(tags: string[]) {
    this.filters.tags = tags;
  }

  setVisibility(visibility: string) {
    this.filters.visibility = visibility;
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
  }

  onRollReceived(callback: (roll: any) => void) {
    this.rollCallback = callback;
  }

  async createCard(cardData: any) {
    if (!authState.isAuthenticated || !authState.displayName) {
      console.warn('Cannot create card: not authenticated');
      return null;
    }
    if (!this.currentGameId) {
      console.warn('Cannot create card: no game selected');
      return null;
    }
    const result = await db.addItem({
      gameId: this.currentGameId,
      titulo: cardData.titulo,
      conteudo: cardData.conteudo,
      category: cardData.category,
      tags: cardData.tags,
      imagemUrl: cardData.imagemUrl,
      isVisibleToPlayers: cardData.isVisibleToPlayers,
      order: cardData.order,
    });
    await this.refreshItems();
    return result;
  }

  async editCard(cardId: string, cardData: any) {
    await db.updateItem(cardId, {
      ...cardData,
      gameId: this.currentGameId,
    });
    await this.refreshItems();
  }

  async removeCard(cardId: string) {
    await db.deleteItem(cardId);
    await this.refreshItems();
  }

  async getTrashItems() {
    if (!this.currentGameId) return [];
    return await db.getTrashItems(this.currentGameId);
  }

  async restoreCard(cardId: string) {
    await db.restoreItem(cardId);
    await this.refreshItems();
  }

  async permanentlyDeleteCard(cardId: string) {
    await db.permanentlyDeleteItem(cardId);
  }

  async emptyTrash() {
    if (!this.currentGameId) return;
    await db.emptyTrash(this.currentGameId);
    await this.refreshItems();
  }

  async reorderCards(reorderedItems: any[]) {
    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));
    await db.reorderItems(updates);
  }

  async sendMessage(text: string) {
    if (!authState.isAuthenticated || !authState.displayName) return;
    await db.addChatMessage(text, 'user', authState.displayName);
  }

  async sendSystemMessage(text: string) {
    if (!authState.isAuthenticated) return;
    await db.addChatMessage(text, 'system', 'Sistema');
  }

  async sendRoll(formula: string, result: number, details: any) {
    if (!authState.isAuthenticated || !authState.displayName) return;
    await db.addRoll({
      userName: authState.displayName,
      formula,
      result,
      details,
    });
  }

  async getGameById(gameId: string) {
    const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error) return null;
    return data;
  }

  async getGameByInviteCode(inviteCode: string) {
    return await db.getGameByInviteCode(inviteCode);
  }

  async joinGame(inviteCode: string) {
    const result = await db.joinGame(inviteCode);
    return {
      success: true,
      gameId: result.gameId,
      alreadyMember: result.alreadyMember,
      role: result.role,
    };
  }

  async getGameMembers(gameId: string) {
    return await db.getGameMembers(gameId);
  }

  async checkUserGameMembership(gameId: string) {
    const userId = authState.user?.id;
    if (!userId) return null;

    const { data } = await supabase
      .from('game_members')
      .select('role')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .single();

    return data?.role || null;
  }

  async leaveGame(gameId: string) {
    await db.leaveGame(gameId);
    return true;
  }

  async refreshItems() {
    if (!this.currentGameId) return;
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('game_id', this.currentGameId)
      .is('deleted_at', null)
      .order('order', { ascending: true });
    this.items = fromCardDBArray(data || []);
  }

  async removeMember(gameId: string, userId: string) {
    await db.removeMember(gameId, userId);
  }

  destroy() {
    if (this.unsubItems) this.unsubItems();
    if (this.unsubChat) this.unsubChat();
    if (this.unsubRolls) this.unsubRolls();
    this.unsubItems = null;
    this.unsubChat = null;
    this.unsubRolls = null;
  }

  getUserName = () => authState.displayName;
  setUserName = (name: string) => authState.updateProfile({ display_name: name });
  setNarrator = () => authState.updateProfile({ role: 'narrador' });
  logout = () => authState.signOut();
}

export const gameState = new GameState();
