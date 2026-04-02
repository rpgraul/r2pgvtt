import { getDoc, doc } from 'firebase/firestore';
import { db } from '$lib/firebase/config.js';

function createSettingsStore() {
  let settings = $state({
    siteTitle: 'GameBoard',
    imgbbApiKey: '',
    siteDescription: '',
    theme: 'dark'
  });
  
  let isLoading = $state(true);
  let unsubscribe = null;

  async function loadSettings() {
    isLoading = true;
    
    try {
      const docSnap = await getDoc(doc(db, 'config', 'mainSettings'));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        settings = {
          siteTitle: data.siteTitle || 'GameBoard',
          imgbbApiKey: data.imgbbApiKey || '',
          siteDescription: data.siteDescription || '',
          theme: data.theme || 'dark'
        };
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
    } finally {
      isLoading = false;
    }
  }

  async function saveSettings(newSettings: Partial<typeof settings>) {
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'config', 'mainSettings'), newSettings);
      settings = { ...settings, ...newSettings };
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  function destroy() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  return {
    get settings() { return settings; },
    get siteTitle() { return settings.siteTitle; },
    get imgbbApiKey() { return settings.imgbbApiKey; },
    get isLoading() { return isLoading; },
    loadSettings,
    saveSettings,
    destroy
  };
}

export const settings = createSettingsStore();
