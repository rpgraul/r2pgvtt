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
  currentGameRole = $state<string | null>(null);
  currentGameName = $state<string | null>(null);

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

  // Realtime channels
  private itemChannel: any = null;
  private roomChannel: any = null;

  private unsubItems: (() => void) | null = null;

  get user() {
    return authState.user;
  }

  get userName() {
    return authState.displayName;
  }

  get isNarrator() {
    return this.currentGameRole === 'narrador';
  }

  get gameId() {
    return this.currentGameId;
  }

  get gameName() {
    return this.currentGameName;
  }

  get activeGameId() {
    return this.currentGameId;
  }

  get filteredItems() {
    let result = this.items;

    if (this.currentGameRole !== 'narrador') {
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

    if (gameId === null && this.currentGameId) {
      gameId = this.currentGameId;
    }

    this.currentGameId = gameId;
    this.currentGameRole = null;
    authState.init();

    if (gameId) {
      this.loadGameRole(gameId);
    }

    this.cleanupRealtimeChannels();

    this.unsubItems = db.subscribeToItems(gameId, (cards) => {
      this.items = fromCardDBArray(cards);
      this.isLoading = false;
    });

    this.setupRoomChannel(gameId);
  }

  private setupRoomChannel(gameId: string | null) {
    if (!gameId) return;

    this.roomChannel = supabase.channel(`room:${gameId}`);

    this.roomChannel
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        const message = payload.payload;
        const currentUserId = authState.user?.id;
        if (message.senderId !== currentUserId) {
          this.chatMessages = [...this.chatMessages, message];
        }
      })
      .on('broadcast', { event: 'dice_roll' }, (payload) => {
        const rollData = payload.payload;
        const currentUserId = authState.user?.id;
        if (rollData.userId !== currentUserId) {
          this.rolls = [rollData, ...this.rolls];
          import('./diceStore.svelte.js').then((m) =>
            m.diceStore.playSyncRoll({
              formula: rollData.formula,
              result: rollData.result,
              details: rollData.details,
              color: rollData.color,
              userName: rollData.user_name,
            }),
          );
        }
      })
      .subscribe((status) => {
        console.log('[GameState] Room channel status:', status);
      });
  }

  setGameId(gameId: string | null) {
    if (this.currentGameId !== gameId) {
      setStoredGameId(gameId);
      this.cleanupRealtimeChannels();
      this.destroy();
      this.init(gameId);
    }
  }

  private async loadGameRole(gameId: string) {
    if (!authState.user) return;

    const { data } = await supabase
      .from('game_members')
      .select('role')
      .eq('game_id', gameId)
      .eq('user_id', authState.user.id)
      .single();

    this.currentGameRole = data?.role || null;

    const { data: gameData } = await supabase
      .from('games')
      .select('nome')
      .eq('id', gameId)
      .single();

    this.currentGameName = gameData?.nome || null;
  }

  private cleanupRealtimeChannels() {
    if (this.itemChannel) {
      supabase.removeChannel(this.itemChannel);
      this.itemChannel = null;
    }
    if (this.roomChannel) {
      supabase.removeChannel(this.roomChannel);
      this.roomChannel = null;
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

  async createCard(cardData: any) {
    if (!authState.isAuthenticated || !authState.displayName) {
      console.warn('Cannot create card: not authenticated');
      return null;
    }
    if (!this.currentGameId) {
      console.warn('Cannot create card: no game selected');
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

    const message = {
      id: crypto.randomUUID(),
      text,
      type: 'user',
      sender: authState.displayName,
      senderId: authState.user?.id,
      game_id: this.currentGameId,
      created_at: new Date().toISOString(),
    };

    this.chatMessages = [...this.chatMessages, message];

    if (this.roomChannel) {
      this.roomChannel.send({
        type: 'broadcast',
        event: 'chat_message',
        payload: message,
      });
    }

    db.addChatMessage(text, 'user', authState.displayName, this.currentGameId);
  }

  async sendSystemMessage(text: string) {
    if (!authState.isAuthenticated) return;

    const message = {
      id: crypto.randomUUID(),
      text,
      type: 'system',
      sender: 'Sistema',
      senderId: null,
      game_id: this.currentGameId,
      created_at: new Date().toISOString(),
    };

    this.chatMessages = [...this.chatMessages, message];

    if (this.roomChannel) {
      this.roomChannel.send({
        type: 'broadcast',
        event: 'chat_message',
        payload: message,
      });
    }

    db.addChatMessage(text, 'system', 'Sistema', this.currentGameId);
  }

  async sendRoll(formula: string, result: number, details: any, color: string) {
    if (!authState.isAuthenticated || !authState.displayName) return;

    const rollData = {
      id: crypto.randomUUID(),
      user_name: authState.displayName,
      userId: authState.user?.id,
      formula,
      result,
      details,
      color,
      game_id: this.currentGameId,
      created_at: new Date().toISOString(),
    };

    this.rolls = [rollData, ...this.rolls];

    if (this.roomChannel) {
      this.roomChannel.send({
        type: 'broadcast',
        event: 'dice_roll',
        payload: rollData,
      });
    }

    db.addRoll({
      userName: authState.displayName,
      formula,
      result,
      details,
      gameId: this.currentGameId,
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
    this.unsubItems = null;
    this.cleanupRealtimeChannels();
  }

  getUserName = () => authState.displayName;
  setUserName = (name: string) => authState.updateProfile({ display_name: name });
  setNarrator = () => authState.updateProfile({ role: 'narrador' });
  logout = () => authState.signOut();
}

export const gameState = new GameState();
