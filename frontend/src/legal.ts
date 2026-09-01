export const PRIVACY_NOTICE_VERSION = '2026-09-01';

export const terms = [
  ['Using Tempo', 'Tempo is a personal habit-tracking tool. You must provide accurate account information, keep your password private, and use the service lawfully. Tempo is not medical, mental-health, or professional advice.'],
  ['Your content', 'You retain responsibility for the habits and notes you create. Do not enter sensitive health, financial, government-ID, or third-party personal information unless the service explicitly supports it.'],
  ['Account closure', 'You can stop using Tempo at any time. Request account deletion through the privacy contact below; account data will then be deleted or anonymized unless it must be retained for a lawful reason.'],
];

export const privacyNotice = [
  ['What we collect', 'We collect your username, name, age, email address, Philippine mobile number, password authentication data, habit details, completion logs, and your acceptance timestamp/version. Passwords are handled by Supabase Auth and are not displayed to Tempo.'],
  ['Why we use it', 'We use this information only to create and secure your account, provide habit tracking, calculate progress and streaks, respond to support requests, and meet lawful obligations. Your Philippine mobile number is collected for this local release; Tempo does not send marketing messages or share it for advertising.'],
  ['Where it is stored', 'Account and habit data are processed through the configured Supabase service and the Tempo API. Access is limited to you through authenticated requests and database row-level security.'],
  ['Retention and your choices', 'We retain your account data while your account is active. You may request access, correction, deletion, or withdrawal of consent by contacting the controller. A deletion request may end access to the service.'],
  ['Controller contact', 'Before production, replace this local-testing placeholder with the real organization name, business address, Data Protection Officer contact, and retention schedule: privacy@your-domain.example.'],
];
