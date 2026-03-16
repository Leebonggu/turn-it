import { Timestamp } from 'firebase/firestore';

export type Tag = '업무' | '이동' | '쇼핑' | '음식' | '앱/서비스' | '사람관계' | '건강' | '기타';

export interface User {
  email: string;
  displayName: string;
  notificationTime: string; // "21:00"
  notificationTimeSet: boolean;
  cycleStartedAt: Timestamp | null;
  currentCycleId: string | null;
  createdAt: Timestamp;
}

export interface Complaint {
  id?: string;
  userId: string;
  questionId: string;
  content: string; // 최대 200자
  tags: Tag[];
  cycleId: string;
  createdAt: Timestamp;
}

export interface Idea {
  id?: string;
  userId: string;
  cycleId: string;
  title: string;
  basedOnComplaintIds: string[];
  targetCustomer: string;
  solution: string;
  marketPotential: string;
  status: 'interested' | 'pending' | 'discarded';
  createdAt: Timestamp;
}

export interface Question {
  id: string;
  text: string;
  category: Tag;
}
