import { supabase } from './client';
import { authState } from '$lib/state/auth.svelte';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const db = {
  // Games
  async getUserGames() {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        user_role:game_members(role),
        member_count:game_members(count),
        last_access:game_members(last_accessed_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading games:', error);
      return [];
    }

    return data || [];
  },

  async createGame(nome: string, sistema?: string, campanha?: string, capaUrl?: string) {
    const userId = authState.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Create game
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

    // Add owner as member with narrator role
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
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (gameError || !game) {
      throw new Error('Código de convite inválido');
    }

    const { error: memberError } = await supabase.from('game_members').insert({
      game_id: game.id,
      user_id: userId,
      role: 'jogador',
    });

    if (memberError) {
      console.error('Error joining game:', memberError);
      throw memberError;
    }

    return game.id;
  },

  async leaveGame(gameId: string, userRole?: string) {
    const userId = authState.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Check all members before removing
    const { data: membersBefore } = await supabase
      .from('game_members')
      .select('id, user_id')
      .eq('game_id', gameId);

    const isLastMember = membersBefore && membersBefore.length <= 1;

    // Check if user is narrator
    const isNarrator = userRole === 'narrador';

    // Remove the member
    const { error } = await supabase
      .from('game_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) throw error;

    // If this was the last member
    if (isLastMember) {
      if (isNarrator) {
        // Narrador saindo como último → soft delete
        await supabase
          .from('games')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', gameId);
      } else {
        // Jogador saindo como último → delete permanently
        await supabase.from('games').delete().eq('id', gameId);
      }
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

  // Items (Cards)
  async subscribeToItems(gameId: string | null, callback: (items: any[]) => void) {
    let query = supabase.from('items').select('*').order('order', { ascending: true });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading items:', error);
      callback([]);
      return () => {};
    }

    callback(data || []);

    return supabase
      .channel(`items:${gameId || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        db.subscribeToItems(gameId, callback);
      })
      .subscribe();
  },

  async addItem(itemData: any) {
    const { data, error } = await supabase
      .from('items')
      .insert({
        ...itemData,
        created_by: authState.displayName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(itemId: string, itemData: any) {
    const { error } = await supabase
      .from('items')
      .update({
        ...itemData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) throw error;
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

  // Chat Messages
  async subscribeToChat(gameId: string | null, callback: (messages: any[]) => void) {
    let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading chat:', error);
      callback([]);
      return () => {};
    }

    callback(data || []);

    return supabase
      .channel(`chat:${gameId || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        db.subscribeToChat(gameId, callback);
      })
      .subscribe();
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

  // Dice Rolls
  async subscribeToRolls(gameId: string | null, callback: (rolls: any[]) => void) {
    let query = supabase
      .from('dice_rolls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading rolls:', error);
      callback([]);
      return () => {};
    }

    callback(data || []);

    return supabase
      .channel(`rolls:${gameId || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dice_rolls' }, () => {
        db.subscribeToRolls(gameId, callback);
      })
      .subscribe();
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

  // Audio State
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

  // Settings
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
};
