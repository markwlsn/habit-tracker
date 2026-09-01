import { SupabaseClient } from '@supabase/supabase-js';
import { DateRange, DuplicateError, HabitLog, NotFoundError } from '../types';
import { LogRepository } from '../repositories/log.repository';
import { HabitService } from './habit.service';

export class LogService {
  private readonly repo: LogRepository; private readonly habits: HabitService;
  constructor(db: SupabaseClient) { this.repo = new LogRepository(db); this.habits = new HabitService(db); }
  async createLog(userId: string, habitId: string, date = new Date()): Promise<HabitLog> { await this.habits.getHabitById(habitId); try { return await this.repo.create(userId, habitId, date); } catch (e) { if ((e as { code?: string }).code === '23505') throw new DuplicateError('A completion already exists for this habit and date'); throw e; } }
  async getLogsByHabit(habitId: string, range?: DateRange): Promise<HabitLog[]> { await this.habits.getHabitById(habitId); return this.repo.findByHabitId(habitId, range); }
  async deleteLog(id: string): Promise<void> { if (!await this.repo.delete(id)) throw new NotFoundError('Habit log'); }
}
