export type CycleStatus = 'not_started' | 'in_progress' | 'early_analysis' | 'ready';

export function getQuestionForCycle(recordCount: number, poolSize: number): number {
  return recordCount % poolSize;
}

export function getCycleStatus(recordCount: number, hasCycle: boolean): CycleStatus {
  if (!hasCycle) return 'not_started';
  if (recordCount < 3) return 'in_progress';  // 0~2개
  if (recordCount < 7) return 'early_analysis';
  return 'ready';
}

export function generateCycleId(userId: string): string {
  return `${userId}_${Date.now()}`;
}
