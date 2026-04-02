import { supabase } from './client';
import { authState } from '$lib/state/auth.svelte';

export const db = {
  // Items (Cards)
  async subscribeToItems(gameId: string | null, callback: (items: any[]) => void) {
    let query = supabase
      .from('items')
      .select('*')
      .order('order', { ascending: true });

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

    return supabase.channel(`items:${gameId || 'global'}`)
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
        created_by: authState.displayName
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
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
  },

  async deleteItem(itemId: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async reorderItems(items: { id: string; order: number }[]) {
    const updates = items.map((item, index) => ({
      id: item.id,
      order: index
    }));

    const { error } = await supabase.from('items').upsert(updates, { onConflict: 'id' });
    if (error) throw error;
  },

  // Chat Messages
  async subscribeToChat(gameId: string | null, callback: (messages: any[]) => void) {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

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

    return supabase.channel(`chat:${gameId || 'global'}`)
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
        sender: sender || authState.displayName || 'Anonymous'
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

    return supabase.channel(`rolls:${gameId || 'global'}`)
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
        details: rollData.details || []
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
    return data;
  },

  async updateAudioState(gameId: string, updates: any) {
    const { data, error } = await supabase
      .from('audio_state')
      .upsert({
        game_id: gameId,
        ...updates,
        updated_at: new Date().toISOString(),
        created_by: authState.displayName
      }, { onConflict: 'game_id' })
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
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;
  }
};