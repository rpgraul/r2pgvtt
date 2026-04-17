import "clsx";
import { s as supabase } from "./client.js";
function createAuthState() {
  let user = null;
  let profile = null;
  let isLoading = true;
  let isInitialized = false;
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
      if (user && event === "SIGNED_IN") {
        await loadProfile();
      } else if (event === "SIGNED_OUT") {
        profile = null;
      }
    });
  }
  async function loadProfile() {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (error?.code === "PGRST116") {
        await createProfile();
      } else if (error?.code === "PGRST205") {
        console.error("Tabela user_profiles não existe. Criando automaticamente...");
        await createProfile();
      } else if (error) {
        console.error("Error loading profile:", error);
        profile = null;
      } else {
        profile = data;
      }
    } catch (e) {
      console.error("Error loading profile:", e);
      profile = null;
    }
  }
  async function createProfile() {
    if (!user) return;
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuário";
    try {
      const { data, error } = await supabase.from("user_profiles").insert({ id: user.id, display_name: displayName, role: "jogador" }).select().single();
      if (error) {
        if (error.code === "PGRST205") {
          console.error("Tabela profiles não existe ainda.");
          return;
        }
        console.error("Error creating profile:", error);
      } else {
        profile = data;
      }
    } catch (e) {
      console.error("Error creating profile:", e);
    }
  }
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
  }
  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  async function updateProfile(updates) {
    if (!user) return;
    const { data, error } = await supabase.from("user_profiles").update(updates).eq("id", user.id).select().single();
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
      return profile?.role ?? "jogador";
    },
    get displayName() {
      return profile?.display_name ?? user?.email?.split("@")[0] ?? "Usuário";
    },
    init,
    destroy,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
    loadProfile
  };
}
const authState = createAuthState();
export {
  authState as a
};
