import { Habit, HabitLog } from '../types';

export function toHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string, userId: row.user_id as string, name: row.name as string,
    description: row.description as string, frequency: row.frequency as Habit['frequency'],
    targetCount: (row.target_count as number | null) ?? null,
    createdAt: new Date(row.created_at as string), updatedAt: new Date(row.updated_at as string),
  };
}

export function toLog(row: Record<string, unknown>): HabitLog {
  return {
    id: row.id as string, habitId: row.habit_id as string, userId: row.user_id as string,
    completionDate: new Date(`${row.completion_date as string}T00:00:00.000Z`),
    createdAt: new Date(row.created_at as string),
  };
}

export function isoDate(date: Date): string { return date.toISOString().slice(0, 10); }
