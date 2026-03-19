import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Complaint, Idea, Tag } from '../types';

// === Users ===
export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(userId: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', userId), data);
}

// === Complaints ===
export async function addComplaint(data: Omit<Complaint, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'complaints'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getComplaintsByCycle(userId: string, cycleId: string): Promise<Complaint[]> {
  const q = query(
    collection(db, 'complaints'),
    where('userId', '==', userId),
    where('cycleId', '==', cycleId),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
}

export async function getAllComplaints(userId: string): Promise<Complaint[]> {
  const q = query(
    collection(db, 'complaints'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
}

export async function getTodayComplaint(userId: string, cycleId: string): Promise<Complaint | null> {
  const complaints = await getComplaintsByCycle(userId, cycleId);
  const today = new Date().toDateString();
  return complaints.find((c) => c.createdAt?.toDate?.().toDateString() === today) ?? null;
}

// === Ideas ===
export async function addIdeas(ideas: Omit<Idea, 'id' | 'createdAt'>[]) {
  const promises = ideas.map((idea) =>
    addDoc(collection(db, 'ideas'), {
      ...idea,
      createdAt: serverTimestamp(),
    })
  );
  return Promise.all(promises);
}

export async function getIdeasByCycle(userId: string, cycleId: string): Promise<Idea[]> {
  const q = query(
    collection(db, 'ideas'),
    where('userId', '==', userId),
    where('cycleId', '==', cycleId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea));
}

export async function getAllIdeas(userId: string): Promise<Idea[]> {
  const q = query(
    collection(db, 'ideas'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea));
}

export async function getIdea(ideaId: string): Promise<Idea | null> {
  const snap = await getDoc(doc(db, 'ideas', ideaId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Idea) : null;
}

export async function updateIdeaStatus(ideaId: string, status: Idea['status']) {
  await updateDoc(doc(db, 'ideas', ideaId), { status });
}

// === Cycle ===
export async function startNewCycle(userId: string): Promise<string> {
  const cycleId = `${userId}_${Date.now()}`;
  await updateUser(userId, {
    cycleStartedAt: Timestamp.now(),
    currentCycleId: cycleId,
  } as Partial<User>);
  return cycleId;
}

export async function resetCycle(userId: string): Promise<string> {
  return startNewCycle(userId);
}
