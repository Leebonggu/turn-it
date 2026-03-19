import { useEffect, useCallback } from 'react';
import { useCycleStore } from '../stores/cycleStore';
import { useAuthStore } from '../stores/authStore';
import {
  getUser, getComplaintsByCycle, getTodayComplaint, startNewCycle, resetCycle,
} from '../services/firestore';
import { getCycleStatus } from '../utils/cycle';

export function useCycle() {
  const { firebaseUser } = useAuthStore();
  const {
    userData, currentComplaints, cycleStatus, todayRecorded, isLoading,
    setUserData, setCurrentComplaints, setCycleStatus, setTodayRecorded, setLoading,
  } = useCycleStore();

  const refresh = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const user = await getUser(firebaseUser.uid);
      setUserData(user);

      if (user?.currentCycleId) {
        const complaints = await getComplaintsByCycle(firebaseUser.uid, user.currentCycleId);
        setCurrentComplaints(complaints);
        setCycleStatus(getCycleStatus(complaints.length, true));

        const today = await getTodayComplaint(firebaseUser.uid, user.currentCycleId);
        setTodayRecorded(!!today);
      } else {
        setCurrentComplaints([]);
        setCycleStatus('not_started');
        setTodayRecorded(false);
      }
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCycle = useCallback(async () => {
    if (!firebaseUser) return;
    await startNewCycle(firebaseUser.uid);
    await refresh();
  }, [firebaseUser, refresh]);

  const resetCurrentCycle = useCallback(async () => {
    if (!firebaseUser) return;
    await resetCycle(firebaseUser.uid);
    await refresh();
  }, [firebaseUser, refresh]);

  return {
    userData, currentComplaints, cycleStatus, todayRecorded, isLoading,
    refresh, startCycle, resetCurrentCycle,
  };
}
