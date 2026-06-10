import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { UniquifyChrome } from '../UniquifyChrome';
import { PANEL } from '../../../lib/panelTokens';

export function UniquifyScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dropActive = interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <UniquifyChrome>
      <GlassPanel style={{ padding: '14px 16px', marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(94,200,255,0.8)' }}>
          Traffic Cloud Studio
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 22,
            fontWeight: 800,
            background: PANEL.textGradient,
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Унікалізація відео
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, lineHeight: 1.5, color: PANEL.dim, maxWidth: 520 }}>
          Одне відео — десятки унікальних копій. Обробка на вашому ПК, без завантаження на сервер.
        </p>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Локально у браузері', '9:16 · 1080×1920', 'Pro унікалізація'].map((l) => (
            <span
              key={l}
              style={{
                fontSize: 10,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.3)',
                color: PANEL.muted
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </GlassPanel>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 12 }}>
        <div>
          <GlassPanel style={{ padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: PANEL.dim }}>
              Вихідне відео
            </div>
            <FocusCard label="Drop zone · локально" delay={14} style={{ marginTop: 10 }}>
              <div
                style={{
                  padding: '28px 16px',
                  borderRadius: 14,
                  border: `2px dashed rgba(94,200,255,${0.25 + dropActive * 0.2})`,
                  background: `rgba(94,200,255,${0.03 + dropActive * 0.04})`,
                  textAlign: 'center',
                  boxShadow: dropActive > 0.5 ? '0 0 40px -12px rgba(94,200,255,0.35)' : undefined
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: '0 auto 10px',
                    borderRadius: 14,
                    border: '1px solid rgba(94,200,255,0.2)',
                    background: PANEL.accentSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: PANEL.accent
                  }}
                >
                  ↑
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Перетягніть відео або натисніть</div>
                <div style={{ fontSize: 11, color: PANEL.dim, marginTop: 4 }}>MP4 · MOV · WebM · до 250 MB</div>
              </div>
            </FocusCard>
          </GlassPanel>

          <GlassPanel style={{ padding: 14, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: PANEL.dim }}>
                  Кількість копій
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#52525b' }}>Кожна — унікальний набір змін</p>
              </div>
              <div style={{ fontFamily: 'ui-monospace', fontSize: 28, fontWeight: 800, color: PANEL.accent }}>5</div>
            </div>
            <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: '42%', height: '100%', borderRadius: 999, background: PANEL.accent }} />
            </div>
          </GlassPanel>

          <div
            style={{
              marginTop: 10,
              padding: '14px',
              borderRadius: 14,
              background: PANEL.vuCta,
              boxShadow: PANEL.vuCtaShadow,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#fff'
            }}
          >
            ✦ Створити 5 копій
          </div>
        </div>

        <GlassPanel style={{ padding: 14, minHeight: 260 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: PANEL.dim }}>
            Результат
          </div>
          <div style={{ marginTop: 40, textAlign: 'center', color: PANEL.dim, fontSize: 12 }}>
            Після обробки — список копій і ZIP-архів
          </div>
        </GlassPanel>
      </div>
    </UniquifyChrome>
  );
}
