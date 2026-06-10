import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { PanelChrome } from '../PanelChrome';

export function CampaignsScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0.3 * fps, 2.5 * fps], [24, 68], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <PanelChrome active="campaigns" path="campaigns">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>Кампанії DM</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Розсилка з шаблонами та лімітами</p>
        </div>
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff'
          }}
        >
          + Нова кампанія
        </div>
      </div>

      <CampaignRow
        name="Crypto UA · Wave 3"
        status="Запущена"
        statusColor="#34d399"
        sent={Math.round(progress * 4.2)}
        total={420}
        progress={progress}
        template="Привіт {name}! Бачив твій інтерес до…"
      />
      <CampaignRow
        name="Fitness leads RU"
        status="Пауза"
        statusColor="#fbbf24"
        sent={156}
        total={300}
        progress={52}
        template="Доброго дня, {name} — коротке питання…"
      />
    </PanelChrome>
  );
}

function CampaignRow({
  name,
  status,
  statusColor,
  sent,
  total,
  progress,
  template
}: {
  name: string;
  status: string;
  statusColor: string;
  sent: number;
  total: number;
  progress: number;
  template: string;
}) {
  return (
    <div
      style={{
        marginBottom: 12,
        padding: 14,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: statusColor,
            border: `1px solid ${statusColor}44`,
            background: `${statusColor}18`,
            borderRadius: 999,
            padding: '3px 10px'
          }}
        >
          {status}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>{template}</div>
      <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #0ea5e9, #5ec8ff)'
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8', fontFamily: 'ui-monospace' }}>
        {sent} / {total} DM
      </div>
    </div>
  );
}
