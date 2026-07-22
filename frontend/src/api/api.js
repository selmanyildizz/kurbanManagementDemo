const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
const TOKEN_KEY = 'kurban_auth';

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
}

function setAuth(auth) {
  if (auth) localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
  else localStorage.removeItem(TOKEN_KEY);
}

async function req(method, path, body, { auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const stored = auth ? getAuth() : null;
  if (stored?.token) headers['Authorization'] = `Bearer ${stored.token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    setAuth(null);
    const err = new Error('Oturum süresi doldu, lütfen tekrar giriş yapın.');
    err.unauthorized = true;
    throw err;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Hata oluştu');
  return data;
}

export const api = {
  // Auth
  async login(username, password) {
    const r = await req('POST', '/auth/login', { username, password }, { auth: false });
    setAuth({ token: r.token, username: r.username, displayName: r.displayName });
    return r;
  },
  logout: () => setAuth(null),
  getSession: () => getAuth(),
  isAuthenticated: () => !!getAuth()?.token,

  // Dashboard
  getDashboard: () => req('GET', '/admin/dashboard'),

  // Kayıt & check-in
  registerKurban: (body) => req('POST', '/admin/kurban', body),
  checkin: (token) => req('POST', '/admin/checkin', { token }),

  // Sıra yönetimi
  callNext: (stationId) => req('POST', `/admin/queue/call-next/${stationId}`),
  startCutting: (entryId) => req('POST', `/admin/queue/${entryId}/start-cutting`),
  complete: (entryId) => req('POST', `/admin/queue/${entryId}/complete`),

  // Masa
  toggleBreak: (stationId) => req('POST', `/admin/station/${stationId}/break`),

  // Personel
  createUser: (body) => req('POST', '/admin/users', body),

  // Müşteri (public)
  getStatus: (token) => req('GET', `/status/${token}`, null, { auth: false }),
};
