import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardData, DateRange, Habit, HabitLog } from '../types';
import { HabitService } from './habit.service';
import { LogService } from './log.service';
import { StreakService } from './streak.service';
import { isoDate } from '../utils/mappers';

export class AnalyticsService {
  private readonly habits: HabitService; private readonly logs: LogService; private readonly streaks = new StreakService();
  constructor(db: SupabaseClient) { this.habits = new HabitService(db); this.logs = new LogService(db); }
  async getDashboardData(range?: DateRange): Promise<DashboardData> { const habits = await this.habits.getUserHabits(); const logGroups = await Promise.all(habits.map(h => this.logs.getLogsByHabit(h.id, range))); const all = logGroups.flat(); const heatmap = [...all.reduce((map, log) => map.set(isoDate(log.completionDate), (map.get(isoDate(log.completionDate)) ?? 0) + 1), new Map<string, number>()).entries()].sort(([a],[b]) => a.localeCompare(b)).map(([date,count]) => ({ date, count })); const enriched = habits.map((habit, i) => ({ ...habit, streak: this.streaks.getStreakForHabit(habit, logGroups[i]) })); const rates = habits.map((habit, i) => this.rate(habit, logGroups[i], range)); return { heatmap, statistics: { totalHabits: habits.length, activeStreaks: enriched.filter(h => h.streak.currentStreak > 0).length, averageCompletionRate: rates.length ? Math.round(rates.reduce((a,b) => a+b, 0) / rates.length) : 0 }, habits: enriched }; }
  private rate(habit: Habit, logs: HabitLog[], range?: DateRange): number { const end = range?.endDate ?? new Date(); const start = range?.startDate ?? habit.createdAt; const days = Math.max(1, Math.floor((Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate()) - Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate())) / 86_400_000) + 1); const expected = habit.frequency === 'daily' ? days : Math.ceil(days / 7) * (habit.targetCount ?? 1); return Math.min(100, Math.round((logs.length / expected) * 100)); }
}
