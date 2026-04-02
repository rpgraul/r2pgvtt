import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config.js';

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function login(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await syncUserProfile(result.user);
  return result.user;
}

export async function register(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  
  await setDoc(doc(db, 'users', result.user.uid), {
    displayName: displayName || email.split('@')[0],
    email,
    role: 'jogador',
    createdAt: new Date()
  });
  
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export async function syncUserProfile(user) {
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName || user.email.split('@')[0],
      email: user.email,
      role: 'jogador',
      createdAt: new Date()
    });
  }
  
  return userDoc.data();
}

export async function getUserRole(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return 'jogador';
}

export async function setUserRole(uid, role) {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
}
