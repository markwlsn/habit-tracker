import { StreakService } from '../src/services/streak.service';
import { Habit, HabitLog } from '../src/types';

const daily: Habit = { id: 'h', userId: 'u', name: 'Read', description: 'Read', frequency: 'daily', targetCount: null, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') };
const weekly: Habit = { ...daily, frequency: 'weekly', targetCount: 2 };
const log = (day: string): HabitLog => ({ id: day, habitId: 'h', userId: 'u', completionDate: new Date(`${day}T00:00:00Z`), createdAt: new Date() });

describe('StreakService', () => {
  const service = new StreakService();
  it('counts active and longest consecutive daily completions', () => {
    expect(service.getStreakForHabit(daily, [log('2026-08-30'), log('2026-08-31'), log('2026-09-01')], new Date('2026-09-01T12:00:00Z'))).toEqual({ currentStreak: 3, longestStreak: 3 });
  });
  it('resets the current daily streak after a missed date while retaining the longest', () => {
    expect(service.getStreakForHabit(daily, [log('2026-08-28'), log('2026-08-29')], new Date('2026-09-01T12:00:00Z'))).toEqual({ currentStreak: 0, longestStreak: 2 });
  });
  it('requires the weekly target before counting a week', () => {
    expect(service.getStreakForHabit(weekly, [log('2026-08-31'), log('2026-09-01')], new Date('2026-09-02T12:00:00Z'))).toEqual({ currentStreak: 1, longestStreak: 1 });
  });
});
