import { PanelChrome } from '../PanelChrome';

const SOURCES = [
  { title: 'Crypto Chat UA', members: '12 400', leads: 842, status: 'Готово' },
  { title: 'Fitness RU Channel', members: '8 900', leads: 316, status: 'Парсинг…' },
  { title: 'Trading signals EN', members: '21 100', leads: 1204, status: 'Готово' }
];

export function SourcesScreen() {
  return (
    <PanelChrome active="sources" path="sources">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>Джерела аудиторії</h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
          Парсинг учасників з чатів і каналів · фільтри · blacklist
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SOURCES.map((s) => (
          <div
            key={s.title}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: 16,
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.members} учасників</div>
            </div>
            <div style={{ fontSize: 13, fontFamily: 'ui-monospace', color: '#5ec8ff' }}>{s.leads} лідів</div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: s.status === 'Готово' ? '#34d399' : '#fbbf24',
                border: `1px solid ${s.status === 'Готово' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                background: s.status === 'Готово' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                borderRadius: 999,
                padding: '4px 10px'
              }}
            >
              {s.status}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 10px'
              }}
            >
              → Кампанія
            </div>
          </div>
        ))}
      </div>
    </PanelChrome>
  );
}
