import { User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LogPage() {
  const { dash: s } = useApp();

  return (
    <div className="card">
      <div className="card-head">Tüm İşlem Geçmişi</div>
      {s?.recentLogs?.map((l, i) => (
        <div key={i} className="logtable-row">
          <span className="t">{new Date(l.createdAt).toLocaleTimeString('tr-TR')}</span>
          <span className="a">{l.action}</span>
          <span className="n">{l.kurbanName || '—'}</span>
          <span className="s">{l.stationName || ''}</span>
          <span className="who">
            {l.actor && <><User size={12} aria-hidden="true" /> {l.actor}</>}
          </span>
          {l.note && <span className="note">{l.note}</span>}
        </div>
      ))}
    </div>
  );
}
