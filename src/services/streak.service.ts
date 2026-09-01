import { Habit, HabitLog, StreakData } from '../types';

const DAY = 86_400_000;
function utcDay(date: Date): number { return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY); }
function weekKey(date: Date): number { const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return utcDay(d) / 7; }
export class StreakService {
  getStreakForHabit(habit: Habit, logs: HabitLog[], referenceDate = new Date()): StreakData { return habit.frequency === 'daily' ? this.daily(logs, referenceDate) : this.weekly(logs, habit.targetCount ?? 1, referenceDate); }
  private daily(logs: HabitLog[], reference: Date): StreakData { const days = new Set(logs.map(l => utcDay(l.completionDate))); const today = utcDay(reference); let current = 0; for (let d = today; days.has(d); d--) current++; const ordered = [...days].sort((a,b) => a-b); let longest = 0, run = 0, previous: number | undefined; for (const day of ordered) { run = previous === day - 1 ? run + 1 : 1; longest = Math.max(longest, run); previous = day; } return { currentStreak: current, longestStreak: longest }; }
  private weekly(logs: HabitLog[], target: number, reference: Date): StreakData { const counts = new Map<number, number>(); logs.forEach(l => { const key = weekKey(l.completionDate); counts.set(key, (counts.get(key) ?? 0) + 1); }); const met = [...counts].filter(([, n]) => n >= target).map(([w]) => w).sort((a,b) => a-b); let current = 0; for (let w = weekKey(reference); counts.get(w) !== undefined && (counts.get(w) ?? 0) >= target; w--) current++; let longest = 0, run = 0, previous: number | undefined; for (const w of met) { run = previous === w - 1 ? run + 1 : 1; longest = Math.max(longest, run); previous = w; } return { currentStreak: current, longestStreak: longest }; }
}
