const BASE = 'http://localhost:8080/api';

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Hata oluştu');
  return data;
}

export const api = {
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

  // Müşteri (public)
  getStatus: (token) => req('GET', `/status/${token}`),
};
