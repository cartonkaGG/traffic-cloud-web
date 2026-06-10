import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { HighlightRing } from '../../motion/HighlightRing';
import { OutreachChrome } from '../OutreachChrome';

export function CampaignsScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [0.3 * fps, 2.8 * fps], [31, 72], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const sent = Math.round(progress * 4.2);

  return (
    <OutreachChrome active="campaigns" path="/campaigns" kicker="Розсилка · DM jobs" title="Кампанії">
      <div style={{ position: 'relative' }}>
        <HighlightRing x={0} y={0} width={780} height={118} label="Запуск · пауза · ліміти" />
        <CampaignRow
          name="Crypto UA · Wave 3"
          status="Запущена"
          statusColor="#34d399"
          sent={sent}
          total={420}
          progress={progress}
          account="@lead_bot_01"
          template="Привіт {name}! Бачив твій інтерес…"
        />
        <CampaignRow
          name="Fitness leads RU"
          status="Пауза"
          statusColor="#fbbf24"
          sent={156}
          total={300}
          progress={52}
          account="@traffic_ru"
          template="Доброго дня, {name} — коротке питання…"
        />
        <CampaignRow
          name="Trading EN night"
          status="Запланирована"
          statusColor="#38bdf8"
          sent={0}
          total={180}
          progress={0}
          account="@dm_warm"
          template="Hi {name}, quick question about signals…"
        />
      </div>
    </OutreachChrome>
  );
}

function CampaignRow({
  name,
  status,
  statusColor,
  sent,
  total,
  progress,
  account,
  template
}: {
  name: string;
  status: string;
  statusColor: string;
  sent: number;
  total: number;
  progress: number;
  account: string;
  template: string;
}) {
  return (
    <div
      style={{
        marginBottom: 12,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{account}</div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
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
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>{template}</div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
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
        {sent} / {total} DM · Play · Pause · Stop
      </div>
    </div>
  );
}
