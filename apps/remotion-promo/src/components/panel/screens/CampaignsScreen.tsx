import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

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
      <FocusCard label="Запущена кампанія" delay={10}>
        <GlassPanel style={{ padding: '12px 14px', marginBottom: 8 }}>
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
        </GlassPanel>
      </FocusCard>
      <GlassPanel style={{ padding: '12px 14px', marginBottom: 8, opacity: 0.85 }}>
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
      </GlassPanel>
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
          <div style={{ fontSize: 10, color: PANEL.dim, marginTop: 3 }}>{account}</div>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: statusColor,
            border: `1px solid ${statusColor}44`,
            background: `${statusColor}18`,
            borderRadius: 999,
            padding: '3px 9px'
          }}
        >
          {status}
        </span>
      </div>
      <div style={{ fontSize: 10, color: PANEL.muted, marginTop: 6 }}>{template}</div>
      <div style={{ marginTop: 8, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #0ea5e9, #5ec8ff)'
          }}
        />
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: PANEL.muted, fontFamily: 'ui-monospace' }}>
        {sent} / {total} DM · Play · Pause · Stop
      </div>
    </>
  );
}
