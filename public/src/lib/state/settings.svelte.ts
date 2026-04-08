import { db } from '$lib/supabase/tables';

const SETTINGS_KEY = 'r2pg_settings';
const DEFAULT_SETTINGS = {
  siteTitle: 'R2PG VTT',
  imgbbApiKey: '',
  siteDescription: '',
  theme: 'dark',
};

function createSettingsStore() {
  let settings = $state({
    siteTitle: 'R2PG VTT',
    imgbbApiKey: '',
    siteDescription: '',
    theme: 'dark',
  });

  let isLoading = $state(true);

  async function loadSettings() {
    isLoading = true;

    try {
      const data = await db.getSettings('main');
      if (data) {
        settings = {
          siteTitle: data.siteTitle || 'R2PG VTT',
          imgbbApiKey: data.imgbbApiKey || '',
          siteDescription: data.siteDescription || '',
          theme: data.theme || 'dark',
        };
      }
    } catch (error) {
      console.warn('Failed to load settings, using localStorage:', error);
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        try {
          settings = JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse stored settings');
        }
      }
    } finally {
      isLoading = false;
    }
  }

  async function saveSettings(newSettings: Partial<typeof settings>) {
    const updated = { ...settings, ...newSettings };
    settings = updated;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }

    try {
      await db.updateSettings('main', updated);
    } catch (error) {
      console.warn('Failed to sync settings to Supabase, saved locally');
    }
  }

  function destroy() {}

  return {
    get settings() {
      return settings;
    },
    get siteTitle() {
      return settings.siteTitle;
    },
    get imgbbApiKey() {
      return settings.imgbbApiKey;
    },
    get isLoading() {
      return isLoading;
    },
    loadSettings,
    saveSettings,
    destroy,
  };
}

export const settings = createSettingsStore();
