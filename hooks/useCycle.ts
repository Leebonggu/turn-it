import { useEffect, useCallback } from 'react';
import { useCycleStore } from '../stores/cycleStore';
import { useAuthStore } from '../stores/authStore';
import {
  getUser, getCycle, getComplaintsByCycle, startNewCycle, completeCycle, updateUser,
} from '../services/firestore';
import { getCycleStatus } from '../utils/cycle';

export function useCycle() {
  const { firebaseUser } = useAuthStore();
  const {
    userData, currentCycle, currentComplaints, cycleStatus, isLoading,
    setUserData, setCurrentCycle, setCurrentComplaints, setCycleStatus, setLoading,
  } = useCycleStore();

  const refresh = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const user = await getUser(firebaseUser.uid);
      setUserData(user);

      if (user?.currentCycleId) {
        const [cycle, complaints] = await Promise.all([
          getCycle(user.currentCycleId),
          getComplaintsByCycle(firebaseUser.uid, user.currentCycleId),
        ]);
        setCurrentCycle(cycle);
        setCurrentComplaints(complaints);
        setCycleStatus(getCycleStatus(complaints.length, true));
      } else {
        setCurrentCycle(null);
        setCurrentComplaints([]);
        setCycleStatus('not_started');
      }
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCycle = useCallback(async (name?: string) => {
    if (!firebaseUser) return;
    await startNewCycle(firebaseUser.uid, name);
    await refresh();
  }, [firebaseUser, refresh]);

  const endCycle = useCallback(async () => {
    if (!firebaseUser || !userData?.currentCycleId) return;
    await completeCycle(userData.currentCycleId);
    await updateUser(firebaseUser.uid, { currentCycleId: null, cycleStartedAt: null });
    await refresh();
  }, [firebaseUser, userData, refresh]);

  return {
    userData, currentCycle, currentComplaints, cycleStatus, isLoading,
    refresh, startCycle, endCycle,
  };
}
