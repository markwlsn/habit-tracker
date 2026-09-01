import type { RegistrationPayload } from './types';

export type SignupValues = Omit<RegistrationPayload, 'age' | 'termsAccepted' | 'privacyVersion'> & { age: string; confirmPassword: string; termsAccepted: boolean };
export type FieldErrors = Partial<Record<keyof SignupValues | 'loginEmail' | 'loginPassword', string>>;

const namePattern = /^[\p{L}][\p{L}\s'-]{0,59}$/u;
const phonePattern = /^(?:\+639\d{9}|09\d{9})$/;
const compactPhone = (phone: string) => phone.replace(/[\s()-]/g, '');

export function passwordStrength(password: string): { score: number; label: string; checks: string[] } {
  const checks = [password.length >= 8 ? '' : '8+ characters', /[a-z]/.test(password) ? '' : 'lowercase', /[A-Z]/.test(password) ? '' : 'uppercase', /\d/.test(password) ? '' : 'number', /[^A-Za-z0-9]/.test(password) ? '' : 'symbol'].filter(Boolean);
  const score = 5 - checks.length;
  return { score, label: score <= 2 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Strong' : 'Excellent', checks };
}

export function validateSignup(values: SignupValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[A-Za-z0-9_]{3,30}$/.test(values.username)) errors.username = 'Use 3–30 letters, numbers, or underscores.';
  if (!namePattern.test(values.firstName)) errors.firstName = 'Enter a valid first name.';
  if (values.middleName && !namePattern.test(values.middleName)) errors.middleName = 'Enter a valid middle name.';
  if (!namePattern.test(values.lastName)) errors.lastName = 'Enter a valid last name.';
  if (!/^\d+$/.test(values.age) || Number(values.age) < 13 || Number(values.age) > 120) errors.age = 'Enter an age from 13 to 120.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!phonePattern.test(compactPhone(values.phone))) errors.phone = 'Use a Philippine mobile number, e.g. 0917 123 4567.';
  const strength = passwordStrength(values.password);
  if (strength.score < 5) errors.password = `Add: ${strength.checks.join(', ')}.`;
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';
  if (!values.termsAccepted) errors.termsAccepted = 'Accept the Terms and Privacy Notice to continue.';
  return errors;
}

export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.loginEmail = 'Enter a valid email address.';
  if (!password) errors.loginPassword = 'Enter your password.';
  return errors;
}
