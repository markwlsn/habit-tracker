import { SupabaseClient } from '@supabase/supabase-js';
import { DateRange, HabitLog, DatabaseError } from '../types';
import { toLog, isoDate } from '../utils/mappers';

export class LogRepository {
  constructor(private readonly db: SupabaseClient) {}
  async create(userId: string, habitId: string, date: Date): Promise<HabitLog> { const { data, error } = await this.db.from('habit_logs').insert({ user_id: userId, habit_id: habitId, completion_date: isoDate(date) }).select().single(); if (error) { if (error.code === '23505') throw Object.assign(new Error('duplicate'), { code: '23505' }); throw new DatabaseError(); } return toLog(data); }
  async findByHabitId(habitId: string, range?: DateRange): Promise<HabitLog[]> { let q = this.db.from('habit_logs').select('*').eq('habit_id', habitId).order('completion_date'); if (range) q = q.gte('completion_date', isoDate(range.startDate)).lte('completion_date', isoDate(range.endDate)); const { data, error } = await q; if (error) throw new DatabaseError(); return (data ?? []).map(toLog); }
  async delete(id: string): Promise<boolean> { const { error, count } = await this.db.from('habit_logs').delete({ count: 'exact' }).eq('id', id); if (error) throw new DatabaseError(); return (count ?? 0) > 0; }
}
