import { create } from 'zustand';
import { Complaint, Cycle, User } from '../types';
import { CycleStatus } from '../utils/cycle';

interface CycleState {
  userData: User | null;
  currentCycle: Cycle | null;
  currentComplaints: Complaint[];
  cycleStatus: CycleStatus;
  isLoading: boolean;
  setUserData: (data: User | null) => void;
  setCurrentCycle: (cycle: Cycle | null) => void;
  setCurrentComplaints: (complaints: Complaint[]) => void;
  setCycleStatus: (status: CycleStatus) => void;
  setLoading: (loading: boolean) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  userData: null,
  currentCycle: null,
  currentComplaints: [],
  cycleStatus: 'not_started',
  isLoading: true,
  setUserData: (data) => set({ userData: data }),
  setCurrentCycle: (cycle) => set({ currentCycle: cycle }),
  setCurrentComplaints: (complaints) => set({ currentComplaints: complaints }),
  setCycleStatus: (status) => set({ cycleStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
