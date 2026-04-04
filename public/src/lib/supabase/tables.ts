import { authState } from '$lib/state/auth.svelte';
import { supabase } from './client';
import { toCardDB, fromCardDB } from '$lib/utils/cardMapper';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const db = {
  async getUserGames() {
    const userId = authState.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        user_role:game_members(role),
        member_count:game_members(count),
        last_access:game_members(last_accessed_at)
      `)
      .eq('game_members.user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading games:', error);
      return [];
    }

    return data || [];
  },

  async getGameByInviteCode(inviteCode: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data;
  },

  async getUserGameCount() {
    const userId = authState.user?.id;
    if (!userId) return 0;

    const { count, error } = await supabase
      .from('game_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting games:', error);
      return 0;
    }

    return count || 0;
  },

  async createGame(nome: string, sistema?: string, campanha?: string, capaUrl?: string) {
    const userId = authState.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const inviteCode = generateInviteCode();

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        nome,
        owner_id: userId,
        sistema: sistema || 'RPG Genérico',
        invite_code: inviteCode,
        campanha: campanha || null,
        capa_url: capaUrl || null,
      })
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      throw gameError;
    }

    const { error: memberError } = await supabase.from('game_members').insert({
      game_id: game.id,
      user_id: userId,
      role: 'narrador',
      last_accessed_at: new Date().toISOString(),
    });

    if (memberError) {
      console.error('Error adding member:', memberError);
    }

    return game.id;
  },

  async createGameExtended(nome: string, sistema?: string, _campanha?: string, _capaUrl?: string) {
    return this.createGame(nome, sistema);
  },

  async joinGame(inviteCode: string) {
    const userId = authState.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, nome')
      .eq('invite_code', inviteCode.toUpperCase())
      .is('deleted_at', null)
      .single();

    if (gameError || !game) {
      throw new Error('Código de convite inválido');
    }

    const existingMember = await supabase
      .from('game_members')
      .select('id, role')
      .eq('game_id', game.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return { gameId: game.id, alreadyMember: true, role: existingMember.role };
    }

    const { count } = await supabase
      .from('game_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count !== null && count >= 3) {
      throw new Error('Limite de 3 mesas atingido. Saia de uma mesa para entrar em outra.');
    }

    const { error: memberError } = await supabase.from('game_members').insert({
      game_id: game.id,
      user_id: userId,
      role: 'jogador',
      last_accessed_at: new Date().toISOString(),
    });

    if (memberError) {
      console.error('Error joining game:', memberError);
      throw memberError;
    }

    return { gameId: game.id, alreadyMember: false, role: 'jogador' };
  },

  async leaveGame(gameId: string, userRole?: string) {
    const userId = authState.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: membersBefore } = await supabase
      .from('game_members')
      .select('id, user_id')
      .eq('game_id', gameId);

    const isNarrator = userRole === 'narrador';

    const { error } = await supabase
      .from('game_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) throw error;

    const { data: membersAfter } = await supabase
      .from('game_members')
      .select('id, user_id')
      .eq('game_id', gameId);

    const isLastMember = !membersAfter || membersAfter.length === 0;

    if (isLastMember && isNarrator) {
      await supabase
        .from('games')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', gameId);
    }
  },

  async softDeleteGame(gameId: string) {
    const { error } = await supabase
      .from('games')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', gameId);

    if (error) throw error;
  },

  async cancelDeleteGame(gameId: string) {
    const { error } = await supabase.from('games').update({ deleted_at: null }).eq('id', gameId);

    if (error) throw error;
  },

  async getGameMembers(gameId: string) {
    const { data, error } = await supabase
      .from('game_members')
      .select(`
        *,
        profile:user_profiles(id, display_name)
      `)
      .eq('game_id', gameId);

    if (error) throw error;
    return data || [];
  },

  async deleteGame(gameId: string) {
    const { error } = await supabase.from('games').delete().eq('id', gameId);

    if (error) throw error;
  },

  async getInviteCode(gameId: string) {
    const { data, error } = await supabase
      .from('games')
      .select('invite_code')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return data?.invite_code;
  },

  subscribeToItems(
    gameId: string | null,
    callback: (items: any[]) => void,
    onChannelCreated?: (channel: any) => void,
  ) {
    const loadItems = () => {
      let q = supabase.from('items').select('*').order('order', { ascending: true });
      if (gameId) {
        q = q.eq('game_id', gameId);
      }
      q.then(({ data, error }) => {
        if (error) {
          console.error('Error loading items:', error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };

    loadItems();

    const channelName = `items:${gameId || 'global'}`;

    const filter = gameId ? `game_id=eq.${gameId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter }, () => {
        loadItems();
      })
      .subscribe();

    if (onChannelCreated) {
      onChannelCreated(channel);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async addItem(itemData: any) {
    const cardDB = toCardDB({
      titulo: itemData.titulo,
      conteudo: itemData.conteudo,
      category: itemData.category,
      tags: itemData.tags,
      imagemUrl: itemData.imagemUrl,
      isVisibleToPlayers: itemData.isVisibleToPlayers,
      order: itemData.order,
      gameId: itemData.gameId || '',
    });

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...cardDB,
        created_by: authState.displayName,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      throw error;
    }
    return fromCardDB(data);
  },

  async updateItem(itemId: string, itemData: any) {
    const cardDB = toCardDB({
      titulo: itemData.titulo,
      conteudo: itemData.conteudo,
      category: itemData.category,
      tags: itemData.tags,
      imagemUrl: itemData.imagemUrl,
      isVisibleToPlayers: itemData.isVisibleToPlayers,
      order: itemData.order,
      gameId: itemData.game_id || '',
    });

    delete cardDB.game_id;
    delete cardDB.created_by;

    const { error } = await supabase
      .from('items')
      .update({
        ...cardDB,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  async deleteItem(itemId: string) {
    const { error } = await supabase.from('items').delete().eq('id', itemId);

    if (error) throw error;
  },

  async reorderItems(items: { id: string; order: number }[]) {
    const updates = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    const { error } = await supabase.from('items').upsert(updates, { onConflict: 'id' });
    if (error) throw error;
  },

  subscribeToChat(
    gameId: string | null,
    callback: (messages: any[]) => void,
    onChannelCreated?: (channel: any) => void,
  ) {
    const loadMessages = () => {
      let q = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (gameId) {
        q = q.eq('game_id', gameId);
      }
      q.then(({ data, error }) => {
        if (error) {
          console.error('Error loading chat:', error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };

    loadMessages();

    const channelName = `chat:${gameId || 'global'}`;

    const filter = gameId ? `game_id=eq.${gameId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter },
        () => {
          loadMessages();
        },
      )
      .subscribe();

    if (onChannelCreated) {
      onChannelCreated(channel);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async addChatMessage(text: string, type: string = 'user', sender?: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        text,
        type,
        sender: sender || authState.displayName || 'Anonymous',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToRolls(
    gameId: string | null,
    callback: (rolls: any[]) => void,
    onChannelCreated?: (channel: any) => void,
  ) {
    const loadRolls = () => {
      let q = supabase
        .from('dice_rolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (gameId) {
        q = q.eq('game_id', gameId);
      }

      q.then(({ data, error }) => {
        if (error) {
          console.error('Error loading rolls:', error);
          callback([]);
          return;
        }
        callback(data || []);
      });
    };

    loadRolls();

    const channelName = `rolls:${gameId || 'global'}`;

    const filter = gameId ? `game_id=eq.${gameId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dice_rolls', filter }, () => {
        loadRolls();
      })
      .subscribe();

    if (onChannelCreated) {
      onChannelCreated(channel);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async addRoll(rollData: { userName: string; formula: string; result: number; details?: any }) {
    const { data, error } = await supabase
      .from('dice_rolls')
      .insert({
        user_name: rollData.userName,
        formula: rollData.formula,
        result: rollData.result,
        details: rollData.details || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAudioState(gameId: string) {
    const { data, error } = await supabase
      .from('audio_state')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        ...data,
        current_time: data.current_video_time,
      };
    }
    return data;
  },

  async updateAudioState(gameId: string, updates: any) {
    const mappedUpdates: any = { ...updates };

    if ('current_time' in mappedUpdates) {
      mappedUpdates.current_video_time = mappedUpdates.current_time;
      delete mappedUpdates.current_time;
    }

    const { data, error } = await supabase
      .from('audio_state')
      .upsert(
        {
          game_id: gameId,
          ...mappedUpdates,
          updated_at: new Date().toISOString(),
          created_by: authState.displayName,
        },
        { onConflict: 'game_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSettings(key: string = 'main') {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || {};
  },

  async updateSettings(key: string, value: any) {
    const { error } = await supabase.from('site_settings').upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    );

    if (error) throw error;
  },

  async removeMember(gameId: string, userId: string) {
    const { error } = await supabase
      .from('game_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
