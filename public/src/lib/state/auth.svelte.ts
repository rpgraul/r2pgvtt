const NARRATOR_PASSWORDS = ['dimitrinho', 'tomatinho'];
const STORAGE_KEY = 'isNarrator';
const USER_NAME_KEY = 'rpgboard_user_name';

function createAuthStore() {
  let user = $state(null);
  let userName = $state('');
  let isNarrator = $state(false);
  let isLoading = $state(true);

  function init() {
    isLoading = true;
    
    const storedNarrator = localStorage.getItem(STORAGE_KEY);
    const storedName = localStorage.getItem(USER_NAME_KEY);
    
    if (storedName) {
      userName = storedName;
      user = { name: storedName };
    }
    
    isNarrator = storedNarrator === 'true';
    isLoading = false;
  }

  function getUserName(): string {
    if (userName) return userName;
    const stored = localStorage.getItem(USER_NAME_KEY);
    if (stored) return stored;
    return 'Visitante';
  }

  function validateNarratorPassword(pwd: string): boolean {
    return !!pwd && NARRATOR_PASSWORDS.some(p => p === pwd);
  }

  function loginAsNarrator() {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(USER_NAME_KEY, 'Mestre');
    isNarrator = true;
    userName = 'Mestre';
    user = { name: 'Mestre' };
  }

  function loginAsPlayer(name: string) {
    localStorage.setItem(STORAGE_KEY, 'false');
    localStorage.setItem(USER_NAME_KEY, name);
    isNarrator = false;
    userName = name;
    user = { name };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    isNarrator = false;
    userName = '';
    user = null;
  }

  function setUserName(name: string) {
    userName = name;
    localStorage.setItem(USER_NAME_KEY, name);
    user = { name };
  }

  return {
    get user() { return user; },
    get userName() { return userName; },
    get isNarrator() { return isNarrator; },
    get isLoading() { return isLoading; },
    getUserName,
    validateNarratorPassword,
    loginAsNarrator,
    loginAsPlayer,
    logout,
    setUserName,
    init
  };
}

export const auth = createAuthStore();
