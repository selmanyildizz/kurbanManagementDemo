import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { initials } from '../utils/format';
import Toast from './Toast';

const NAV_ITEMS = [
  { to: '/panel', label: 'Kuyruk', end: true },
  { to: '/panel/kayit', label: 'Kayıt' },
  { to: '/panel/checkin', label: 'Check-in' },
  { to: '/panel/musteri', label: 'Müşteri' },
  { to: '/panel/log', label: 'Log' },
];

export default function Layout() {
  const { session, dash, toast, closeToast, logout } = useApp();

  if (!session) return <Navigate to="/giris" replace />;

  const s = dash;

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}

      <header className="app-header">
        <div className="brand">
          <span className="emoji" aria-hidden="true">🐑</span>
          <div>
            <div className="brand-name">Kurban Sıra Sistemi</div>
            <div className="brand-sub">Büro Paneli</div>
          </div>
        </div>

        <nav className="tabs" aria-label="Bölümler">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => isActive ? 'on' : ''}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
          {s && (
            <div className="stats">
              <div className="stat stat-waiting"><b className="tabular">{s.waitingCount}</b><span>Bekliyor</span></div>
              <div className="stat stat-cutting"><b className="tabular">{s.cuttingCount}</b><span>Kesiliyor</span></div>
              <div className="stat stat-done"><b className="tabular">{s.doneCount}</b><span>Hazır</span></div>
            </div>
          )}
          <div className="user-chip">
            <div className="avatar">{initials(session.displayName)}</div>
            <span>{session.displayName}</span>
            <button onClick={logout} className="btn btn-ghost" style={{ padding: '7px 13px', fontSize: 12.5 }}>Çıkış</button>
          </div>
        </div>
      </header>

      <main className="app-body">
        <Outlet />
      </main>
    </div>
  );
}
