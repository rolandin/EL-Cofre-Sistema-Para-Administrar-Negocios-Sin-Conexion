import db from '../../server/db';

export function updateLastSeen(): boolean {
  const license = db.prepare('SELECT lastSeen FROM license_info WHERE id = 1').get() as any;
  if (!license) return true;

  const now = new Date();
  const lastSeen = new Date(license.lastSeen);
  const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < -24) return false;

  db.prepare('UPDATE license_info SET lastSeen = ? WHERE id = 1').run(now.toISOString());
  return true;
}
