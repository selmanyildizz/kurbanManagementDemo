export const STATUS_LABEL = {
  WAITING: 'Bekliyor',
  CALLED: 'Çağrıldı',
  CUTTING: 'Kesiliyor',
  DONE: 'Hazır',
  NOSHOW: 'Gelmedi',
};

export const STATUS_PILL = {
  WAITING: 'pill-waiting',
  CALLED: 'pill-called',
  CUTTING: 'pill-cutting',
  DONE: 'pill-done',
  NOSHOW: 'pill-noshow',
};

export const STATION_STATUS_LABEL = { ACTIVE: 'Aktif', BREAK: 'Molada', OFFLINE: 'Kapalı' };
export const STATION_PILL = { ACTIVE: 'pill-active', BREAK: 'pill-break', OFFLINE: 'pill-offline' };

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}sn`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  return `${Math.floor(diff / 3600)}sa`;
}

export function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('');
}

// Kalabalık büro ortamında ekrana bakan biri kodu çalamasın diye
// token her listede maskeli gösterilir; tam kod yalnızca SMS/e-postada.
export function maskToken(t) {
  if (!t || t.length < 4) return t;
  return t.slice(0, 2) + '•••' + t.slice(-1);
}
