import { createHabitSchema, createLogSchema, registerSchema } from '../src/utils/schemas';

describe('request schemas', () => {
  it('requires a target count for a weekly habit', () => expect(createHabitSchema.safeParse({ name: 'Run', description: 'Run', frequency: 'weekly' }).success).toBe(false));
  it('accepts a valid daily habit', () => expect(createHabitSchema.safeParse({ name: 'Read', description: 'Read a book', frequency: 'daily' }).success).toBe(true));
  it('rejects a malformed log date', () => expect(createLogSchema.safeParse({ habitId: 'b7f7ef1e-6f0b-44a9-a8cf-58db5bf1a93a', completionDate: 'not-a-date' }).success).toBe(false));
  it('requires consent and normalizes a valid Philippine mobile number at registration', () => {
    const result = registerSchema.safeParse({ username: 'alex_h', firstName: 'Alex', middleName: '', lastName: 'Hill', age: 28, email: 'alex@example.com', password: 'Password123!', phone: '0917 123 4567', termsAccepted: true, privacyVersion: '2026-09-01' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+639171234567');
  });
  it('rejects weak passwords, non-Philippine numbers, invalid ages, and missing consent', () => expect(registerSchema.safeParse({ username: 'a!', firstName: 'Alex', lastName: 'Hill', age: 12, email: 'alex@example.com', password: 'password123', phone: '+1 202 555 0123', termsAccepted: false, privacyVersion: '2026-09-01' }).success).toBe(false));
});
