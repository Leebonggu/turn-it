import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, startAfter, Timestamp, serverTimestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Complaint, Idea, Cycle, Tag } from '../types';

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
export async function startNewCycle(userId: string, name: string = '새 사이클'): Promise<string> {
  const cycleRef = await addDoc(collection(db, 'cycles'), {
    userId,
    name,
    status: 'active',
    createdAt: serverTimestamp(),
    completedAt: null,
  });
  await updateUser(userId, {
    cycleStartedAt: Timestamp.now(),
    currentCycleId: cycleRef.id,
  } as Partial<User>);
  return cycleRef.id;
}

export async function completeCycle(cycleId: string) {
  await updateDoc(doc(db, 'cycles', cycleId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

export async function getCycle(cycleId: string): Promise<Cycle | null> {
  const snap = await getDoc(doc(db, 'cycles', cycleId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Cycle) : null;
}

const CYCLES_PAGE_SIZE = 20;

export async function getUserCycles(
  userId: string,
  lastDoc?: QueryDocumentSnapshot,
): Promise<{ cycles: Cycle[]; lastDoc: QueryDocumentSnapshot | null }> {
  const constraints = [
    collection(db, 'cycles'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(CYCLES_PAGE_SIZE),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(...(constraints as [any, ...any[]]));
  const snap = await getDocs(q);
  const cycles = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cycle));
  const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { cycles, lastDoc: last };
}

