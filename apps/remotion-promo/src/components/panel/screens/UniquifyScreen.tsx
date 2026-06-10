import { HighlightRing } from '../../motion/HighlightRing';
import { HubChrome } from '../HubChrome';

export function UniquifyScreen() {
  return (
    <HubChrome>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>Video Uniquify</h3>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
          FFmpeg у браузері · пакетна обробка · ZIP-експорт
        </p>
      </div>
      <div style={{ position: 'relative' }}>
        <HighlightRing x={0} y={0} width={760} height={200} label="Локально на ПК · без сервера" />
        <div
          style={{
            height: 140,
            borderRadius: 16,
            border: '2px dashed rgba(94,200,255,0.35)',
            background: 'rgba(94,200,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#5ec8ff' }}>Перетягніть відео сюди</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Reels · TikTok · Shorts · 9:16</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
          {['3 файли в черзі', 'Pro якість', 'ZIP download'].map((t) => (
            <div
              key={t}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 11,
                color: '#94a3b8',
                textAlign: 'center'
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            textAlign: 'center',
            padding: '12px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f43f5e, #f97316)',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff'
          }}
        >
          Запустити унікалізацію
        </div>
      </div>
    </HubChrome>
  );
}
