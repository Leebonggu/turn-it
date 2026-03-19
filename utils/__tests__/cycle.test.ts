import { getQuestionForCycle, getCycleStatus } from '../cycle';

describe('getQuestionForCycle', () => {
  it('returns question at index = recordCount % poolSize', () => {
    expect(getQuestionForCycle(0, 10)).toBe(0);
    expect(getQuestionForCycle(3, 10)).toBe(3);
    expect(getQuestionForCycle(10, 10)).toBe(0);
    expect(getQuestionForCycle(12, 10)).toBe(2);
  });
});

describe('getCycleStatus', () => {
  it('returns "not_started" when count is 0 and no cycle', () => {
    expect(getCycleStatus(0, false)).toBe('not_started');
  });
  it('returns "in_progress" when count < 3', () => {
    expect(getCycleStatus(1, true)).toBe('in_progress');
    expect(getCycleStatus(2, true)).toBe('in_progress');
  });
  it('returns "early_analysis" when count is 3-6', () => {
    expect(getCycleStatus(3, true)).toBe('early_analysis');
    expect(getCycleStatus(6, true)).toBe('early_analysis');
  });
  it('returns "ready" when count >= 7', () => {
    expect(getCycleStatus(7, true)).toBe('ready');
    expect(getCycleStatus(10, true)).toBe('ready');
  });
});
