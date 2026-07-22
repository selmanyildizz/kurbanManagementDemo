import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/api';
import { STATION_STATUS_LABEL } from '../utils/format';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => api.getSession());
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });
  const closeToast = () => setToast(null);

  const reload = useCallback(async () => {
    try {
      const d = await api.getDashboard();
      setDash(d);
    } catch (e) {
      if (e.unauthorized) setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, [reload, session]);

  function login() {
    setSession(api.getSession());
  }

  function logout() {
    api.logout();
    setSession(null);
    setDash(null);
  }

  async function callNext(stationId) {
    try {
      const r = await api.callNext(stationId);
      showToast(`${r.name} çağrıldı → ${r.stationName}`);
      reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function startCutting(entryId, name) {
    try {
      await api.startCutting(entryId);
      showToast(`${name} kesimi başladı`);
      reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function complete(entryId, name) {
    try {
      await api.complete(entryId);
      showToast(`${name} tamamlandı. mail gönderildi.`);
      reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function toggleBreak(stationId, stationName) {
    try {
      const r = await api.toggleBreak(stationId);
      showToast(`${stationName}: ${STATION_STATUS_LABEL[r.status]}`);
      reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function registerKurban(form) {
    const r = await api.registerKurban(form);
    showToast(`${r.name} kaydedildi. Token gönderildi.`);
    reload();
    return r;
  }

  async function checkin(token) {
    const r = await api.checkin(token);
    showToast(`${r.name} check-in! Sıra: ${r.queuePosition}`);
    reload();
    return r;
  }

  const value = {
    session, dash, loading,
    toast, showToast, closeToast,
    login, logout, reload,
    callNext, startCutting, complete, toggleBreak,
    registerKurban, checkin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
