import { create } from 'zustand';
import { Complaint, User } from '../types';
import { CycleStatus } from '../utils/cycle';

interface CycleState {
  userData: User | null;
  currentComplaints: Complaint[];
  cycleStatus: CycleStatus;
  todayRecorded: boolean;
  isLoading: boolean;
  setUserData: (data: User | null) => void;
  setCurrentComplaints: (complaints: Complaint[]) => void;
  setCycleStatus: (status: CycleStatus) => void;
  setTodayRecorded: (recorded: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  userData: null,
  currentComplaints: [],
  cycleStatus: 'not_started',
  todayRecorded: false,
  isLoading: true,
  setUserData: (data) => set({ userData: data }),
  setCurrentComplaints: (complaints) => set({ currentComplaints: complaints }),
  setCycleStatus: (status) => set({ cycleStatus: status }),
  setTodayRecorded: (recorded) => set({ todayRecorded: recorded }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
