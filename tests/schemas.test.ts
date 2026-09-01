import { createHabitSchema, createLogSchema } from '../src/utils/schemas';

describe('request schemas', () => {
  it('requires a target count for a weekly habit', () => expect(createHabitSchema.safeParse({ name: 'Run', description: 'Run', frequency: 'weekly' }).success).toBe(false));
  it('accepts a valid daily habit', () => expect(createHabitSchema.safeParse({ name: 'Read', description: 'Read a book', frequency: 'daily' }).success).toBe(true));
  it('rejects a malformed log date', () => expect(createLogSchema.safeParse({ habitId: 'b7f7ef1e-6f0b-44a9-a8cf-58db5bf1a93a', completionDate: 'not-a-date' }).success).toBe(false));
});
