import { supabase } from '$lib/supabase/client';
import { authState } from './auth.svelte';
import type { Game, GameMember, GameMemberWithProfile } from '$lib/supabase/types';

const MAX_GAMES = 3;

function createGameState() {
  let games = $state<Game[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function loadGames() {
    if (!authState.user) return;
    
    isLoading = true;
    error = null;

    try {
      const { data, error: err } = await supabase
        .from('game_members')
        .select(`
          role,
          game:games (
            *,
            owner:profiles!owner_id (id, display_name)
          )
        `)
        .eq('user_id', authState.user.id);

      if (err) throw err;

      games = data?.map(m => ({
        ...(m.game as any),
        user_role: m.role
      })) ?? [];
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function createGame(nome: string): Promise<Game | null> {
    if (!authState.user) return null;
    
    if (games.length >= MAX_GAMES) {
      throw new Error(`Limite de ${MAX_GAMES} mesas atingido`);
    }

    isLoading = true;
    error = null;

    try {
      const { data, error: err } = await supabase.rpc('create_game_with_owner', {
        p_nome: nome,
        p_owner_id: authState.user.id
      });

      if (err) throw err;

      await loadGames();
      return data;
    } catch (err: any) {
      error = err.message;
      return null;
    } finally {
      isLoading = false;
    }
  }

  async function getGameById(id: string): Promise<Game | null> {
    const { data, error: err } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (err) return null;
    return data;
  }

  async function getGameByInviteCode(inviteCode: string): Promise<Game | null> {
    const { data, error: err } = await supabase
      .from('games')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (err) return null;
    return data;
  }

  async function getGameMembers(gameId: string): Promise<GameMemberWithProfile[]> {
    const { data, error: err } = await supabase
      .from('game_members')
      .select(`
        *,
        profile:profiles (*)
      `)
      .eq('game_id', gameId);

    if (err) return [];
    return data ?? [];
  }

  async function checkUserGameMembership(gameId: string): Promise<string | null> {
    if (!authState.user) return null;

    const { data } = await supabase
      .from('game_members')
      .select('role')
      .eq('game_id', gameId)
      .eq('user_id', authState.user.id)
      .single();

    return data?.role ?? null;
  }

  async function joinGame(inviteCode: string): Promise<{ success: boolean; gameId?: string; error?: string }> {
    if (!authState.user) {
      return { success: false, error: 'Não autenticado' };
    }

    if (games.length >= MAX_GAMES) {
      return { success: false, error: `Limite de ${MAX_GAMES} mesas atingido` };
    }

    const game = await getGameByInviteCode(inviteCode);
    if (!game) {
      return { success: false, error: 'Código de convite inválido' };
    }

    const existingMembership = await checkUserGameMembership(game.id);
    if (existingMembership) {
      return { success: true, gameId: game.id };
    }

    const { error: err } = await supabase
      .from('game_members')
      .insert({
        game_id: game.id,
        user_id: authState.user.id,
        role: 'jogador'
      });

    if (err) {
      return { success: false, error: err.message };
    }

    await loadGames();
    return { success: true, gameId: game.id };
  }

  async function leaveGame(gameId: string): Promise<boolean> {
    if (!authState.user) return false;

    const membership = await checkUserGameMembership(gameId);
    if (membership === 'narrador') {
      throw new Error('Narrador não pode sair da mesa. Transfira a propriedade primeiro.');
    }

    const { error: err } = await supabase
      .from('game_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', authState.user.id);

    if (err) return false;

    await loadGames();
    return true;
  }

  async function removeMember(gameId: string, userId: string): Promise<boolean> {
    const { error: err } = await supabase
      .from('game_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    return !err;
  }

  async function updateGame(gameId: string, updates: Partial<Game>): Promise<boolean> {
    const { error: err } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId);

    if (err) return false;

    await loadGames();
    return true;
  }

  function destroy() {
    games = [];
    error = null;
  }

  return {
    get games() { return games; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    get canCreateMore() { return games.length < MAX_GAMES; },
    get maxGames() { return MAX_GAMES; },
    init: loadGames,
    destroy,
    loadGames,
    createGame,
    getGameById,
    getGameByInviteCode,
    getGameMembers,
    checkUserGameMembership,
    joinGame,
    leaveGame,
    removeMember,
    updateGame
  };
}

export const gameState = createGameState();
