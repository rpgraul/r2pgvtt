import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';
import { gameState } from '../state/game.svelte.js';

const MUSIC_COLLECTION = 'music';
const CURRENT_DOC = 'current';

let unsubscribe = null;

export function subscribeToMusic(gameId, callback) {
  if (unsubscribe) {
    unsubscribe();
  }
  
  const musicRef = doc(db, 'games', gameId, MUSIC_COLLECTION, CURRENT_DOC);
  
  unsubscribe = onSnapshot(musicRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        ...data,
        lastUpdated: data.lastUpdated?.toDate?.() || new Date()
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro ao ouvir música:', error);
    callback(null);
  });
  
  return unsubscribe;
}

export async function updatePlayback(gameId, state) {
  if (!gameState.isNarrator) {
    console.warn('Apenas o narrador pode controlar a música');
    return;
  }
  
  const musicRef = doc(db, 'games', gameId, MUSIC_COLLECTION, CURRENT_DOC);
  
  await setDoc(musicRef, {
    ...state,
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

export async function setVideoId(gameId, videoId) {
  if (!gameState.isNarrator) {
    console.warn('Apenas o narrador pode mudar o vídeo');
    return;
  }
  
  const musicRef = doc(db, 'games', gameId, MUSIC_COLLECTION, CURRENT_DOC);
  
  await setDoc(musicRef, {
    videoId,
    status: 'paused',
    timestamp: 0,
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

export async function play(gameId) {
  return updatePlayback(gameId, { status: 'playing' });
}

export async function pause(gameId) {
  return updatePlayback(gameId, { status: 'paused' });
}

export async function seekTo(gameId, timestamp) {
  return updatePlayback(gameId, { timestamp });
}

export function unsubscribeMusic() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
