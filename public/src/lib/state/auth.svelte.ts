import { supabase } from '$lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '$lib/supabase/types';

function createAuthState() {
  let user = $state<User | null>(null);
  let profile = $state<Profile | null>(null);
  let isLoading = $state(true);
  let isInitialized = $state(false);

  async function init() {
    if (isInitialized) return;
    isInitialized = true;
    isLoading = true;

    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;

    if (user) {
      await loadProfile();
    }

    isLoading = false;

    supabase.auth.onAuthStateChange(async (event, session) => {
      user = session?.user ?? null;

      if (user && event === 'SIGNED_IN') {
        await loadProfile();
      } else if (event === 'SIGNED_OUT') {
        profile = null;
      }
    });
  }

  async function loadProfile() {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error?.code === 'PGRST116') {
      await createProfile();
    } else if (error) {
      console.error('Error loading profile:', error);
    } else {
      profile = data;
    }
  }

  async function createProfile() {
    if (!user) return;

    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuário';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: displayName,
        role: 'jogador',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      profile = data;
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    profile = data;
    return data;
  }

  function destroy() {
    isInitialized = false;
  }

  return {
    get user() {
      return user;
    },
    get profile() {
      return profile;
    },
    get isLoading() {
      return isLoading;
    },
    get isAuthenticated() {
      return !!user;
    },
    get role() {
      return profile?.role ?? 'jogador';
    },
    get displayName() {
      return profile?.display_name ?? user?.email?.split('@')[0] ?? 'Usuário';
    },
    init,
    destroy,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
    loadProfile,
  };
}

export const authState = createAuthState();
