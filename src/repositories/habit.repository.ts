import { SupabaseClient } from '@supabase/supabase-js';
import { CreateHabitDTO, Habit, UpdateHabitDTO, DatabaseError } from '../types';
import { toHabit } from '../utils/mappers';

export class HabitRepository {
  constructor(private readonly db: SupabaseClient) {}
  async create(userId: string, value: CreateHabitDTO): Promise<Habit> {
    const { data, error } = await this.db.from('habits').insert({ user_id: userId, name: value.name, description: value.description, frequency: value.frequency, target_count: value.frequency === 'weekly' ? value.targetCount : null }).select().single();
    if (error) throw new DatabaseError(); return toHabit(data);
  }
  async findByUserId(): Promise<Habit[]> { const { data, error } = await this.db.from('habits').select('*').order('created_at'); if (error) throw new DatabaseError(); return (data ?? []).map(toHabit); }
  async findById(id: string): Promise<Habit | null> { const { data, error } = await this.db.from('habits').select('*').eq('id', id).maybeSingle(); if (error) throw new DatabaseError(); return data ? toHabit(data) : null; }
  async update(id: string, value: UpdateHabitDTO): Promise<Habit | null> { const record: Record<string, unknown> = {}; if (value.name !== undefined) record.name = value.name; if (value.description !== undefined) record.description = value.description; if (value.frequency !== undefined) record.frequency = value.frequency; if (value.targetCount !== undefined) record.target_count = value.targetCount; const { data, error } = await this.db.from('habits').update(record).eq('id', id).select().maybeSingle(); if (error) throw new DatabaseError(); return data ? toHabit(data) : null; }
  async delete(id: string): Promise<boolean> { const { error, count } = await this.db.from('habits').delete({ count: 'exact' }).eq('id', id); if (error) throw new DatabaseError(); return (count ?? 0) > 0; }
}
