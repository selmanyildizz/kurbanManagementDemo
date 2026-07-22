import { useApp } from '../context/AppContext';
import { STATUS_LABEL, STATUS_PILL, STATION_STATUS_LABEL, STATION_PILL, timeAgo, maskToken } from '../utils/format';

export default function QueuePage() {
  const { dash: s, loading, callNext, startCutting, complete, toggleBreak } = useApp();

  return (
    <div className="queue-layout">
      <div>
        {/* Masalar */}
        {s && (
          <div className="stations">
            {s.stations?.map(st => (
              <div key={st.id} className="station">
                <div className="station-head">
                  <b>{st.name}</b>
                  <span className={`pill ${STATION_PILL[st.status]}`}>{STATION_STATUS_LABEL[st.status]}</span>
                </div>

                {st.currentKurban ? (
                  <div className="occupant">
                    <div className="nm">{st.currentKurban.name}</div>
                    <div className="meta tabular">
                      {st.currentKurban.shares} hisse · {STATUS_LABEL[st.currentKurban.status]}
                    </div>
                  </div>
                ) : (
                  <div className="station-empty">Boş</div>
                )}

                <div className="station-actions">
                  {st.currentKurban?.status === 'CALLED' && (
                    <button onClick={() => startCutting(st.currentKurban.id, st.currentKurban.name)}
                      className="btn btn-danger">🔪 Kes</button>
                  )}
                  {st.currentKurban?.status === 'CUTTING' && (
                    <button onClick={() => complete(st.currentKurban.id, st.currentKurban.name)}
                      className="btn btn-done">✓ Bitti</button>
                  )}
                  {!st.currentKurban && st.status === 'ACTIVE' && (
                    <button onClick={() => callNext(st.id)} className="btn">▶ Sıradakini Çağır</button>
                  )}
                  <button onClick={() => toggleBreak(st.id, st.name)}
                    className={`btn ${st.status === 'BREAK' ? 'btn-done' : 'btn-warn'}`}>
                    {st.status === 'BREAK' ? '▶ Devam' : '⏸ Mola'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kuyruk listesi */}
        <div className="card">
          <div className="card-head">
            <span>Aktif Kuyruk</span>
            <span className="tabular">{s?.queue?.length || 0}</span>
          </div>
          {loading && <div className="empty-note">Yükleniyor...</div>}
          {!loading && (!s?.queue?.length) && <div className="empty-note">Kuyruk boş</div>}
          {s?.queue?.map(q => (
            <div key={q.id} className={`qrow ${q.status === 'CALLED' ? 'called-bg' : ''}`}>
              <div className="qpos tabular">{q.queuePosition ?? '—'}</div>
              <div className="qinfo">
                <div className="qname-line">
                  <span className="qname">{q.name}</span>
                  <span className={`pill ${STATUS_PILL[q.status]}`}>{STATUS_LABEL[q.status]}</span>
                  {q.stationName && <span className="qstation">{q.stationName}</span>}
                </div>
                <div className="qmeta tabular">
                  {q.shares} hisse · check-in: {timeAgo(q.checkinTime)} önce
                  {q.note && <> · {q.note}</>}
                </div>
              </div>
              <span className="qtoken">{maskToken(q.token)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ: Log */}
      <div className="card">
        <div className="card-head">Son İşlemler</div>
        {s?.recentLogs?.map((l, i) => (
          <div key={i} className="logrow">
            <div className="log-head">
              <span className="log-act">{l.action}</span>
              <span className="log-time">{timeAgo(l.createdAt)}</span>
            </div>
            <div className="log-line">
              {l.kurbanName && <>{l.kurbanName} </>}
              {l.stationName && <span className="log-station">→ {l.stationName}</span>}
            </div>
            {l.actor && <div className="log-actor">👤 {l.actor}</div>}
            {l.note && <div className="log-note">{l.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
