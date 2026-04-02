import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './config.js';

const ITEMS_COLLECTION = 'rpg-items';
const CHAT_COLLECTION = 'rpg-chat';
const ROLLS_COLLECTION = 'rpg-rolls';
const USERS_COLLECTION = 'rpg-users';

export function subscribeToItems(callback) {
  const q = query(collection(db, ITEMS_COLLECTION), orderBy('order', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  });
}

export async function addItem(itemData) {
  const snapshot = await getDocs(collection(db, ITEMS_COLLECTION));
  const newItem = { 
    ...itemData, 
    createdAt: serverTimestamp(), 
    order: snapshot.size + 1 
  };
  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), newItem);
  return docRef.id;
}

export async function updateItem(itemId, itemData) {
  await updateDoc(doc(db, ITEMS_COLLECTION, itemId), {
    ...itemData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteItem(itemId) {
  await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
}

export async function deleteItems(ids) {
  const batch = db.batch();
  ids.forEach(id => {
    batch.delete(doc(db, ITEMS_COLLECTION, id));
  });
  await batch.commit();
}

export function subscribeToChat(callback) {
  const q = query(collection(db, CHAT_COLLECTION), orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}

export async function addChatMessage(text, type, sender, color = null) {
  const docRef = await addDoc(collection(db, CHAT_COLLECTION), {
    text,
    type,
    sender,
    color,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export function subscribeToRolls(callback) {
  const q = query(collection(db, ROLLS_COLLECTION), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const rolls = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(rolls);
  });
}

export async function addRoll(rollData) {
  const docRef = await addDoc(collection(db, ROLLS_COLLECTION), {
    ...rollData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function saveUser(name) {
  await setDoc(doc(db, USERS_COLLECTION, name.toLowerCase()), {
    name,
    lastSeen: serverTimestamp()
  }, { merge: true });
}

export async function getSettings() {
  const docSnap = await getDoc(doc(db, 'config', 'mainSettings'));
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function updateSettings(settingsData) {
  await setDoc(doc(db, 'config', 'mainSettings'), settingsData, { merge: true });
}

function setDoc(ref, data, options) {
  return import('firebase/firestore').then(({ setDoc: s }) => s(ref, data, options));
}
