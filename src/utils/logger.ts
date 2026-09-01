/**
 * JSON logs work locally and are understood by most deployment platforms.
 * Connect an external error tracker here once a provider and credentials are chosen.
 */
export function log(level: 'info' | 'error', event: string, details: Record<string, unknown> = {}): void {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...details });
  // eslint-disable-next-line no-console -- the deployment platform collects structured stdout/stderr.
  if (level === 'error') console.error(entry); else console.info(entry);
}
