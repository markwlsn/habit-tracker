import { SupabaseClient } from '@supabase/supabase-js';
import { CreateHabitDTO, Habit, NotFoundError, UpdateHabitDTO } from '../types';
import { HabitRepository } from '../repositories/habit.repository';

export class HabitService {
  private readonly repo: HabitRepository;
  constructor(db: SupabaseClient) { this.repo = new HabitRepository(db); }
  createHabit(userId: string, value: CreateHabitDTO): Promise<Habit> { return this.repo.create(userId, value); }
  getUserHabits(): Promise<Habit[]> { return this.repo.findByUserId(); }
  async getHabitById(id: string): Promise<Habit> { const habit = await this.repo.findById(id); if (!habit) throw new NotFoundError('Habit'); return habit; }
  async updateHabit(id: string, value: UpdateHabitDTO): Promise<Habit> { const habit = await this.repo.update(id, value); if (!habit) throw new NotFoundError('Habit'); return habit; }
  async deleteHabit(id: string): Promise<void> { if (!await this.repo.delete(id)) throw new NotFoundError('Habit'); }
}
