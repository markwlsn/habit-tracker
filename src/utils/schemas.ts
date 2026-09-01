import { z } from 'zod';

/** Normalizes a Philippine mobile number to the E.164 form used for account metadata. */
export const normalizePhilippineMobile = (value: string): string => {
  const compact = value.replace(/[\s()-]/g, '');
  return compact.startsWith('0') ? `+63${compact.slice(1)}` : compact;
};

export const philippineMobileSchema = z.string().trim().transform(normalizePhilippineMobile).refine(
  value => /^\+639\d{9}$/.test(value),
  'Enter a valid Philippine mobile number, for example 0917 123 4567'
);

export const registerSchema = z.object({
  username: z.string().trim().regex(/^[A-Za-z0-9_]{3,30}$/, 'Username must be 3–30 letters, numbers, or underscores'),
  firstName: z.string().trim().regex(/^[\p{L}][\p{L}\s'-]{0,59}$/u, 'Enter a valid first name'),
  middleName: z.string().trim().regex(/^[\p{L}][\p{L}\s'-]{0,59}$/u, 'Enter a valid middle name').optional().or(z.literal('')),
  lastName: z.string().trim().regex(/^[\p{L}][\p{L}\s'-]{0,59}$/u, 'Enter a valid last name'),
  age: z.coerce.number().int().min(13, 'You must be at least 13 years old').max(120, 'Enter a valid age'),
  email: z.string().email(),
  password: z.string().min(8).regex(/[a-z]/, 'Password must include a lowercase letter').regex(/[A-Z]/, 'Password must include an uppercase letter').regex(/\d/, 'Password must include a number').regex(/[^A-Za-z0-9]/, 'Password must include a symbol'),
  phone: philippineMobileSchema,
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms and Privacy Notice to create an account' }) }),
  privacyVersion: z.literal('2026-09-01'),
});
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
