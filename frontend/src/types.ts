export type Frequency = 'daily' | 'weekly';

export interface User { id: string; email: string; }
export interface AuthResult { user: User; accessToken: string | null; refreshToken: string | null; }
export interface RegistrationPayload {
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  phone: string;
  termsAccepted: true;
  privacyVersion: string;
}
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: Frequency;
  targetCount: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface Streak { currentStreak: number; longestStreak: number; }
export interface HabitWithStreak extends Habit { streak: Streak; }
export interface HeatmapEntry { date: string; count: number; }
export interface Dashboard { heatmap: HeatmapEntry[]; statistics: { totalHabits: number; activeStreaks: number; averageCompletionRate: number; }; habits: HabitWithStreak[]; }
export interface HabitPayload { name: string; description: string; frequency: Frequency; targetCount?: number; }
