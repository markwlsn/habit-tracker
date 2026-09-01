import { z } from 'zod';

export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const habitFields = {
  name: z.string().trim().min(1), description: z.string().trim().min(1),
  frequency: z.enum(['daily', 'weekly']), targetCount: z.number().int().positive().optional(),
};
export const createHabitSchema = z.object(habitFields).superRefine((value, ctx) => {
  if (value.frequency === 'weekly' && !value.targetCount) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'targetCount is required for weekly habits', path: ['targetCount'] });
});
export const updateHabitSchema = z.object(habitFields).partial().refine(value => Object.keys(value).length > 0, 'At least one field is required');
export const createLogSchema = z.object({ habitId: z.string().uuid(), completionDate: z.string().date().optional() });
export const dateRangeSchema = z.object({ startDate: z.string().date().optional(), endDate: z.string().date().optional() }).refine(v => !v.startDate || !v.endDate || v.startDate <= v.endDate, 'startDate must not be after endDate');
