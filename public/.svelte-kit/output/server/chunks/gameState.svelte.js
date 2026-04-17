import "clsx";
import { s as supabase } from "./client.js";
import { a as authState } from "./auth.svelte.js";
function toCardDB(card) {
  return {
    game_id: card.gameId,
    titulo: card.titulo,
    conteudo: card.conteudo || "",
    category: card.category || "misc",
    tags: card.tags || [],
    imagem_url: card.imagemUrl || null,
    is_visible_to_players: card.isVisibleToPlayers ?? true,
    order: card.order ?? 0
  };
}
function fromCardDB(card) {
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
    deletedAt: card.deleted_at
  };
}
function fromCardDBArray(cards) {
  return cards.map(fromCardDB);
}
function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
const db = {
  async getUserGames() {
    const userId = authState.user?.id;
    if (!userId) return [];
    const { data, error } = await supabase.from("games").select(`
        *,
        user_role:game_members(role),
        member_count:game_members(count),
        last_access:game_members(last_accessed_at)
      `).eq("game_members.user_id", userId).is("deleted_at", null).order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading games:", error);
      return [];
    }
    return data || [];
  },
  async getGameByInviteCode(inviteCode) {
    const { data, error } = await supabase.from("games").select("*").eq("invite_code", inviteCode.toUpperCase()).is("deleted_at", null).single();
    if (error || !data) return null;
    return data;
  },
  async getUserGameCount() {
    const userId = authState.user?.id;
    if (!userId) return 0;
    const { count, error } = await supabase.from("game_members").select("*", { count: "exact", head: true }).eq("user_id", userId);
    if (error) {
      console.error("Error counting games:", error);
      return 0;
    }
    return count || 0;
  },
  async createGame(nome, sistema, campanha, capaUrl) {
    const userId = authState.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const inviteCode = generateInviteCode();
    const { data: game, error: gameError } = await supabase.from("games").insert({
      nome,
      owner_id: userId,
      sistema: sistema || "RPG Genérico",
      invite_code: inviteCode,
      campanha: campanha || null,
      capa_url: capaUrl || null
    }).select().single();
    if (gameError) {
      console.error("Error creating game:", gameError);
      throw gameError;
    }
    const { error: memberError } = await supabase.from("game_members").insert({
      game_id: game.id,
      user_id: userId,
      role: "narrador",
      last_accessed_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (memberError) {
      console.error("Error adding member:", memberError);
    }
    return game.id;
  },
  async createGameExtended(nome, sistema, _campanha, _capaUrl) {
    return this.createGame(nome, sistema);
  },
  async joinGame(inviteCode) {
    const userId = authState.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data: game, error: gameError } = await supabase.from("games").select("id, nome").eq("invite_code", inviteCode.toUpperCase()).is("deleted_at", null).single();
    if (gameError || !game) {
      throw new Error("Código de convite inválido");
    }
    const existingMember = await supabase.from("game_members").select("id, role").eq("game_id", game.id).eq("user_id", userId).single();
    if (existingMember) {
      return { gameId: game.id, alreadyMember: true, role: existingMember.role };
    }
    const { count } = await supabase.from("game_members").select("*", { count: "exact", head: true }).eq("user_id", userId);
    if (count !== null && count >= 3) {
      throw new Error("Limite de 3 mesas atingido. Saia de uma mesa para entrar em outra.");
    }
    const { error: memberError } = await supabase.from("game_members").insert({
      game_id: game.id,
      user_id: userId,
      role: "jogador",
      last_accessed_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (memberError) {
      console.error("Error joining game:", memberError);
      throw memberError;
    }
    return { gameId: game.id, alreadyMember: false, role: "jogador" };
  },
  async leaveGame(gameId, userRole) {
    const userId = authState.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data: membersBefore } = await supabase.from("game_members").select("id, user_id").eq("game_id", gameId);
    const isNarrator = userRole === "narrador";
    const { error } = await supabase.from("game_members").delete().eq("game_id", gameId).eq("user_id", userId);
    if (error) throw error;
    const { data: membersAfter } = await supabase.from("game_members").select("id, user_id").eq("game_id", gameId);
    const isLastMember = !membersAfter || membersAfter.length === 0;
    if (isLastMember && isNarrator) {
      await supabase.from("games").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", gameId);
    }
  },
  async softDeleteGame(gameId) {
    const { error } = await supabase.from("games").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", gameId);
    if (error) throw error;
  },
  async cancelDeleteGame(gameId) {
    const { error } = await supabase.from("games").update({ deleted_at: null }).eq("id", gameId);
    if (error) throw error;
  },
  async getGameMembers(gameId) {
    const { data, error } = await supabase.from("game_members").select(`
        *,
        profile:user_profiles(id, display_name)
      `).eq("game_id", gameId);
    if (error) throw error;
    return data || [];
  },
  async deleteGame(gameId) {
    const { error } = await supabase.from("games").delete().eq("id", gameId);
    if (error) throw error;
  },
  async getInviteCode(gameId) {
    const { data, error } = await supabase.from("games").select("invite_code").eq("id", gameId).single();
    if (error) throw error;
    return data?.invite_code;
  },
  subscribeToItems(gameId, callback, onChannelCreated) {
    const loadItems = () => {
      let q = supabase.from("items").select("*").is("deleted_at", null).order("order", { ascending: true });
      if (gameId) {
        q = q.eq("game_id", gameId);
      }
      q.then(({ data, error }) => {
        if (error) {
          console.error("Error loading items:", error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };
    loadItems();
    const channelName = `items:${gameId || "global"}`;
    const filter = gameId ? `game_id=eq.${gameId}` : void 0;
    const channel = supabase.channel(channelName).on("postgres_changes", { event: "*", schema: "public", table: "items", filter }, () => {
      loadItems();
    }).subscribe();
    if (onChannelCreated) {
      onChannelCreated(channel);
    }
    return () => {
      supabase.removeChannel(channel);
    };
  },
  async addItem(itemData) {
    const cardDB = toCardDB({
      titulo: itemData.titulo,
      conteudo: itemData.conteudo,
      category: itemData.category,
      tags: itemData.tags,
      imagemUrl: itemData.imagemUrl,
      isVisibleToPlayers: itemData.isVisibleToPlayers,
      order: itemData.order,
      gameId: itemData.gameId || ""
    });
    const { data, error } = await supabase.from("items").insert({
      ...cardDB,
      created_by: authState.displayName
    }).select().single();
    if (error) {
      console.error("Error adding item:", error);
      throw error;
    }
    return fromCardDB(data);
  },
  async updateItem(itemId, itemData) {
    const cardDB = toCardDB({
      titulo: itemData.titulo,
      conteudo: itemData.conteudo,
      category: itemData.category,
      tags: itemData.tags,
      imagemUrl: itemData.imagemUrl,
      isVisibleToPlayers: itemData.isVisibleToPlayers,
      order: itemData.order,
      gameId: itemData.game_id || ""
    });
    delete cardDB.game_id;
    delete cardDB.created_by;
    const { error } = await supabase.from("items").update({
      ...cardDB,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", itemId);
    if (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  },
  async deleteItem(itemId) {
    const { error } = await supabase.from("items").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", itemId);
    if (error) throw error;
  },
  async getTrashItems(gameId) {
    const { data, error } = await supabase.from("items").select("*").eq("game_id", gameId).not("deleted_at", "is", null).order("deleted_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async restoreItem(itemId) {
    const { error } = await supabase.from("items").update({ deleted_at: null }).eq("id", itemId);
    if (error) throw error;
  },
  async permanentlyDeleteItem(itemId) {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) throw error;
  },
  async emptyTrash(gameId) {
    const { error } = await supabase.from("items").delete().eq("game_id", gameId).not("deleted_at", "is", null);
    if (error) throw error;
  },
  async reorderItems(items) {
    const updates = items.map((item, index) => ({
      id: item.id,
      order: index
    }));
    const { error } = await supabase.from("items").upsert(updates, { onConflict: "id" });
    if (error) throw error;
  },
  subscribeToChat(gameId, callback, onChannelCreated) {
    const loadMessages = () => {
      let q = supabase.from("chat_messages").select("*").order("created_at", { ascending: true });
      if (gameId) {
        q = q.eq("game_id", gameId);
      }
      q.then(({ data, error }) => {
        if (error) {
          console.error("Error loading chat:", error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };
    loadMessages();
    const channelName = `chat:${gameId || "global"}`;
    const filter = gameId ? `game_id=eq.${gameId}` : void 0;
    const channel = supabase.channel(channelName).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages", filter },
      () => {
        loadMessages();
      }
    ).subscribe();
    if (onChannelCreated) {
      onChannelCreated(channel);
    }
    return () => {
      supabase.removeChannel(channel);
    };
  },
  async addChatMessage(text, type = "user", sender) {
    const { data, error } = await supabase.from("chat_messages").insert({
      text,
      type,
      sender: sender || authState.displayName || "Anonymous"
    }).select().single();
    if (error) throw error;
    return data;
  },
  subscribeToRolls(gameId, callback, onChannelCreated) {
    const loadRolls = () => {
      let q = supabase.from("dice_rolls").select("*").order("created_at", { ascending: false }).limit(50);
      if (gameId) {
        q = q.eq("game_id", gameId);
      }
      q.then(({ data, error }) => {
        if (error) {
          console.error("Error loading rolls:", error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };
    loadRolls();
    const channelName = `rolls:${gameId || "global"}`;
    const filter = gameId ? `game_id=eq.${gameId}` : void 0;
    const channel = supabase.channel(channelName).on("postgres_changes", { event: "*", schema: "public", table: "dice_rolls", filter }, () => {
      loadRolls();
    }).subscribe();
    if (onChannelCreated) {
      onChannelCreated(channel);
    }
    return () => {
      supabase.removeChannel(channel);
    };
  },
  async addRoll(rollData) {
    const { data, error } = await supabase.from("dice_rolls").insert({
      user_name: rollData.userName,
      formula: rollData.formula,
      result: rollData.result,
      details: rollData.details || []
    }).select().single();
    if (error) throw error;
    return data;
  },
  async getAudioState(gameId) {
    const { data, error } = await supabase.from("audio_state").select("*").eq("game_id", gameId).single();
    if (error && error.code !== "PGRST116") throw error;
    if (data) {
      return {
        ...data,
        current_time: data.current_video_time
      };
    }
    return data;
  },
  async updateAudioState(gameId, updates) {
    const mappedUpdates = { ...updates };
    if ("current_time" in mappedUpdates) {
      mappedUpdates.current_video_time = mappedUpdates.current_time;
      delete mappedUpdates.current_time;
    }
    const { data, error } = await supabase.from("audio_state").upsert(
      {
        game_id: gameId,
        ...mappedUpdates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_by: authState.displayName
      },
      { onConflict: "game_id" }
    ).select().single();
    if (error) throw error;
    return data;
  },
  async getSettings(key = "main") {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).single();
    if (error && error.code !== "PGRST116") throw error;
    return data?.value || {};
  },
  async updateSettings(key, value) {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key,
        value,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "key" }
    );
    if (error) throw error;
  },
  async removeMember(gameId, userId) {
    const { error } = await supabase.from("game_members").delete().eq("game_id", gameId).eq("user_id", userId);
    if (error) throw error;
  }
};
const STORAGE_KEY = "rpgboard_current_game";
function getStoredGameId() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}
function setStoredGameId(gameId) {
  if (typeof window !== "undefined") {
    if (gameId) {
      localStorage.setItem(STORAGE_KEY, gameId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
class GameState {
  constructor() {
    this.isLoading = true;
    this.currentGameId = null;
    this.currentGameRole = null;
    this.currentGameName = null;
    this.items = [];
    this.chatMessages = [];
    this.rolls = [];
    this.filters = { search: "", category: "all", tags: [], visibility: "all" };
    this.viewMode = "grid";
    this.unsubItems = null;
    this.unsubChat = null;
    this.unsubRolls = null;
    this.rollCallback = null;
    this.lastRollId = null;
    this.realtimeChannels = { items: null, chat: null, rolls: null };
    this.getUserName = () => authState.displayName;
    this.setUserName = (name) => authState.updateProfile({ display_name: name });
    this.setNarrator = () => authState.updateProfile({ role: "narrador" });
    this.logout = () => authState.signOut();
  }
  get user() {
    return authState.user;
  }
  get userName() {
    return authState.displayName;
  }
  get isNarrator() {
    return this.currentGameRole === "narrador";
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
    if (this.currentGameRole !== "narrador") {
      result = result.filter((item) => item.isVisibleToPlayers);
    }
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      result = result.filter((item) => item.titulo?.toLowerCase().includes(searchLower) || item.conteudo?.toLowerCase().includes(searchLower) || item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)));
    }
    if (this.filters.category && this.filters.category !== "all") {
      result = result.filter((item) => item.category === this.filters.category);
    }
    if (this.filters.tags && this.filters.tags.length > 0) {
      result = result.filter((item) => this.filters.tags.every((tag) => item.tags?.includes(tag)));
    }
    if (this.filters.visibility !== "all") {
      if (this.filters.visibility === "visible") {
        result = result.filter((item) => item.is_visible_to_players);
      } else if (this.filters.visibility === "hidden") {
        result = result.filter((item) => !item.is_visible_to_players);
      }
    }
    return result;
  }
  get allTags() {
    const tagSet = /* @__PURE__ */ new Set();
    this.items.forEach((item) => {
      item.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }
  get categories() {
    const cats = /* @__PURE__ */ new Set();
    this.items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }
  init(gameId = null) {
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
    this.unsubItems = db.subscribeToItems(
      gameId,
      (cards) => {
        this.items = fromCardDBArray(cards);
        this.isLoading = false;
      },
      (channel) => {
        this.realtimeChannels.items = channel;
      }
    );
    this.unsubChat = db.subscribeToChat(
      gameId,
      (messages) => {
        this.chatMessages = messages;
      },
      (channel) => {
        this.realtimeChannels.chat = channel;
      }
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
      }
    );
  }
  setGameId(gameId) {
    if (this.currentGameId !== gameId) {
      setStoredGameId(gameId);
      this.cleanupRealtimeChannels();
      this.destroy();
      this.init(gameId);
    }
  }
  async loadGameRole(gameId) {
    if (!authState.user) return;
    const { data } = await supabase.from("game_members").select("role").eq("game_id", gameId).eq("user_id", authState.user.id).single();
    this.currentGameRole = data?.role || null;
    const { data: gameData } = await supabase.from("games").select("nome").eq("id", gameId).single();
    this.currentGameName = gameData?.nome || null;
  }
  cleanupRealtimeChannels() {
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
  setSearch(search) {
    this.filters.search = search;
  }
  setCategory(category) {
    this.filters.category = category;
  }
  setTags(tags) {
    this.filters.tags = tags;
  }
  setVisibility(visibility) {
    this.filters.visibility = visibility;
  }
  setViewMode(mode) {
    this.viewMode = mode;
  }
  onRollReceived(callback) {
    this.rollCallback = callback;
  }
  async createCard(cardData) {
    if (!authState.isAuthenticated || !authState.displayName) {
      console.warn("Cannot create card: not authenticated");
      return null;
    }
    if (!this.currentGameId) {
      console.warn("Cannot create card: no game selected");
      return null;
    }
    if (!this.currentGameId) {
      console.warn("Cannot create card: no game selected");
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
      order: cardData.order
    });
    await this.refreshItems();
    return result;
  }
  async editCard(cardId, cardData) {
    await db.updateItem(cardId, { ...cardData, gameId: this.currentGameId });
    await this.refreshItems();
  }
  async removeCard(cardId) {
    await db.deleteItem(cardId);
    await this.refreshItems();
  }
  async getTrashItems() {
    if (!this.currentGameId) return [];
    return await db.getTrashItems(this.currentGameId);
  }
  async restoreCard(cardId) {
    await db.restoreItem(cardId);
    await this.refreshItems();
  }
  async permanentlyDeleteCard(cardId) {
    await db.permanentlyDeleteItem(cardId);
  }
  async emptyTrash() {
    if (!this.currentGameId) return;
    await db.emptyTrash(this.currentGameId);
    await this.refreshItems();
  }
  async reorderCards(reorderedItems) {
    const updates = reorderedItems.map((item, index) => ({ id: item.id, order: index }));
    await db.reorderItems(updates);
  }
  async sendMessage(text) {
    if (!authState.isAuthenticated || !authState.displayName) return;
    await db.addChatMessage(text, "user", authState.displayName);
  }
  async sendSystemMessage(text) {
    if (!authState.isAuthenticated) return;
    await db.addChatMessage(text, "system", "Sistema");
  }
  async sendRoll(formula, result, details) {
    if (!authState.isAuthenticated || !authState.displayName) return;
    await db.addRoll({ userName: authState.displayName, formula, result, details });
  }
  async getGameById(gameId) {
    const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single();
    if (error) return null;
    return data;
  }
  async getGameByInviteCode(inviteCode) {
    return await db.getGameByInviteCode(inviteCode);
  }
  async joinGame(inviteCode) {
    const result = await db.joinGame(inviteCode);
    return {
      success: true,
      gameId: result.gameId,
      alreadyMember: result.alreadyMember,
      role: result.role
    };
  }
  async getGameMembers(gameId) {
    return await db.getGameMembers(gameId);
  }
  async checkUserGameMembership(gameId) {
    const userId = authState.user?.id;
    if (!userId) return null;
    const { data } = await supabase.from("game_members").select("role").eq("game_id", gameId).eq("user_id", userId).single();
    return data?.role || null;
  }
  async leaveGame(gameId) {
    await db.leaveGame(gameId);
    return true;
  }
  async refreshItems() {
    if (!this.currentGameId) return;
    const { data } = await supabase.from("items").select("*").eq("game_id", this.currentGameId).is("deleted_at", null).order("order", { ascending: true });
    this.items = fromCardDBArray(data || []);
  }
  async removeMember(gameId, userId) {
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
}
const gameState = new GameState();
export {
  gameState as g
};
