import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(idToken?: string) {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user);
    return result.user;
  }
  const credential = GoogleAuthProvider.credential(idToken!);
  const result = await signInWithCredential(auth, credential);
  await ensureUserDocument(result.user);
  return result.user;
}

async function ensureUserDocument(firebaseUser: FirebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    const newUser: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? '',
      notificationTime: '21:00',
      notificationTimeSet: false,
      cycleStartedAt: null,
      currentCycleId: null,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, newUser);
  }
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(result.user);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  await ensureUserDocument(result.user);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
