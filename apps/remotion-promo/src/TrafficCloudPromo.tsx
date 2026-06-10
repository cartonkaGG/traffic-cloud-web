import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';
import { CloudMark } from './components/CloudMark';
import { GridBackground } from './components/GridBackground';
import { SceneFade } from './components/motion/SceneFade';
import { DynamicPanelScene } from './components/panel/DynamicPanelScene';
import { AccountsScreen } from './components/panel/screens/AccountsScreen';
import { CampaignsScreen } from './components/panel/screens/CampaignsScreen';
import { DashboardScreen } from './components/panel/screens/DashboardScreen';
import { HubScreen } from './components/panel/screens/HubScreen';
import { InboxScreen } from './components/panel/screens/InboxScreen';
import { MessagesScreen } from './components/panel/screens/MessagesScreen';
import { SourcesScreen } from './components/panel/screens/SourcesScreen';
import { UniquifyScreen } from './components/panel/screens/UniquifyScreen';
import { useUiScale } from './lib/useUiScale';

const DUR = {
  intro: 90,
  hub: 120,
  accounts: 105,
  sources: 105,
  messages: 90,
  campaigns: 120,
  dashboard: 105,
  inbox: 105,
  uniquify: 75,
  cta: 135
} as const;

function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useUiScale();

  const punch = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const zoom = interpolate(punch, [0, 1], [0.72, 1]);
  const logoOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const titleOpacity = interpolate(frame, [0.35 * fps, 1.1 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const tagOpacity = interpolate(frame, [1.2 * fps, 2 * fps], [0, 1], { extrapolateRight: 'clamp' });
  const workflowOpacity = interpolate(frame, [2.2 * fps, 2.8 * fps], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <SceneFade durationInFrames={DUR.intro}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
            transform: `scale(${zoom})`
          }}
        >
          <div style={{ opacity: logoOpacity }}>
            <CloudMark size={Math.round(150 * s)} />
          </div>
          <h1
            style={{
              marginTop: 28 * s,
              marginBottom: 0,
              fontSize: 68 * s,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              opacity: titleOpacity
            }}
          >
            Traffic <span style={{ color: '#5ec8ff' }}>Cloud</span>
          </h1>
          <p style={{ marginTop: 14 * s, fontSize: 26 * s, color: '#94a3b8', opacity: tagOpacity }}>
            Веб-платформа для Telegram outreach
          </p>
          <div
            style={{
              marginTop: 28 * s,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 720 * s,
              opacity: workflowOpacity
            }}
          >
            {['Hub', 'Акаунти', 'Парсер', 'Шаблони', 'Розсилка', 'Inbox', 'Uniquify'].map((step) => (
              <span
                key={step}
                style={{
                  fontSize: 11 * s,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#5ec8ff',
                  border: '1px solid rgba(94,200,255,0.25)',
                  background: 'rgba(94,200,255,0.08)',
                  borderRadius: 999,
                  padding: `${6 * s}px ${12 * s}px`
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </SceneFade>
    </AbsoluteFill>
  );
}

function CtaScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useUiScale();

  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const scale = interpolate(enter, [0, 1], [0.88, 1]);
  const glow = interpolate(frame, [0, 2 * fps], [0.25, 0.75], { extrapolateRight: 'clamp' });
  const drift = interpolate(frame, [0, DUR.cta], [0, -12], { easing: Easing.inOut(Easing.sin) });

  return (
    <AbsoluteFill>
      <SceneFade durationInFrames={DUR.cta}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
            opacity,
            transform: `translateY(${drift}px) scale(${scale})`
          }}
        >
          <div>
            <CloudMark size={Math.round(100 * s)} />
            <h2
              style={{
                marginTop: 30 * s,
                marginBottom: 12 * s,
                fontSize: 46 * s,
                fontWeight: 800,
                color: '#f8fafc',
                maxWidth: 780 * s,
                lineHeight: 1.15,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Увесь цикл трафіку — від парсингу до відповідей
            </h2>
            <p style={{ fontSize: 20 * s, color: '#94a3b8', marginBottom: 32 * s }}>
              traffic-cloud.app · без десктоп-софту · NOWPayments підписка
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: `${16 * s}px ${40 * s}px`,
                borderRadius: 14 * s,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                boxShadow: `0 0 ${56 * s}px rgba(94, 200, 255, ${glow})`,
                fontSize: 20 * s,
                fontWeight: 700,
                color: '#fff'
              }}
            >
              Увійти в панель →
            </div>
          </div>
        </div>
      </SceneFade>
    </AbsoluteFill>
  );
}

export const TrafficCloudPromo = () => {
  let t = 0;

  const seq = (dur: number) => {
    const from = t;
    t += dur;
    return from;
  };

  const introFrom = seq(DUR.intro);
  const hubFrom = seq(DUR.hub);
  const accountsFrom = seq(DUR.accounts);
  const sourcesFrom = seq(DUR.sources);
  const messagesFrom = seq(DUR.messages);
  const campaignsFrom = seq(DUR.campaigns);
  const dashboardFrom = seq(DUR.dashboard);
  const inboxFrom = seq(DUR.inbox);
  const uniquifyFrom = seq(DUR.uniquify);
  const ctaFrom = seq(DUR.cta);

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <GridBackground />

      <Sequence from={introFrom} durationInFrames={DUR.intro}>
        <IntroScene />
      </Sequence>

      <Sequence from={hubFrom} durationInFrames={DUR.hub}>
        <DynamicPanelScene
          durationInFrames={DUR.hub}
          eyebrow="Крок 1"
          title="Software Hub — вибір інструменту"
          desc="DM Outreach для Telegram-розсилки та Video Uniquify для унікалізації відео прямо в браузері."
          camera={[
            { frame: 0, scale: 1, x: 0, y: 0 },
            { frame: 32, scale: 1.16, x: 95, y: 65 },
            { frame: 95, scale: 1.18, x: 95, y: 65 },
            { frame: 119, scale: 1.05, x: 50, y: 30 }
          ]}
        >
          <HubScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={accountsFrom} durationInFrames={DUR.accounts}>
        <DynamicPanelScene
          durationInFrames={DUR.accounts}
          eyebrow="Крок 2"
          title="Акаунти Telegram"
          desc="Картки акаунтів як у панелі: MTProto, проксі, Telegram Web, Код Telegram і «Запустити спам»."
          camera={[
            { frame: 0, scale: 1.08, x: 0, y: -15 },
            { frame: 32, scale: 1.42, x: 95, y: -55 },
            { frame: 90, scale: 1.42, x: 95, y: -55 }
          ]}
        >
          <AccountsScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={sourcesFrom} durationInFrames={DUR.sources}>
        <DynamicPanelScene
          durationInFrames={DUR.sources}
          eyebrow="Крок 3"
          title="Парсер джерел"
          desc="Збір аудиторії з чатів, каналів і invite-посилань. CSV, фільтри, фази парсингу в реальному часі."
          camera={[
            { frame: 0, scale: 1.05, x: -30, y: 0 },
            { frame: 38, scale: 1.48, x: -70, y: 75 },
            { frame: 92, scale: 1.48, x: -70, y: 75 }
          ]}
        >
          <SourcesScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={messagesFrom} durationInFrames={DUR.messages}>
        <DynamicPanelScene
          durationInFrames={DUR.messages}
          eyebrow="Крок 4"
          title="Шаблони DM"
          desc="Тексти зі змінними {name} і {geo}. Активний шаблон, копії при редагуванні — без перезапису."
          camera={[
            { frame: 0, scale: 1.15, x: 0, y: -25 },
            { frame: 28, scale: 1.52, x: 45, y: -48 },
            { frame: 78, scale: 1.52, x: 45, y: -48 }
          ]}
        >
          <MessagesScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={campaignsFrom} durationInFrames={DUR.campaigns}>
        <DynamicPanelScene
          durationInFrames={DUR.campaigns}
          eyebrow="Крок 5"
          title="Кампанії розсилки"
          desc="Запуск, пауза, stop, ліміти DM на акаунт. Прогрес у реальному часі по кожній кампанії."
          camera={[
            { frame: 0, scale: 1.08, x: 0, y: 5 },
            { frame: 36, scale: 1.5, x: 55, y: -25 },
            { frame: 105, scale: 1.5, x: 55, y: -25 }
          ]}
        >
          <CampaignsScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={dashboardFrom} durationInFrames={DUR.dashboard}>
        <DynamicPanelScene
          durationInFrames={DUR.dashboard}
          eyebrow="Крок 6"
          title="Огляд workspace"
          desc="Реальний дашборд: API online, 4 метрики, живі логи та акаунт з кнопками дій."
          camera={[
            { frame: 0, scale: 1, x: 0, y: 0 },
            { frame: 28, scale: 1.32, x: -25, y: -35 },
            { frame: 62, scale: 1.48, x: 35, y: 95 },
            { frame: 98, scale: 1.48, x: 35, y: 95 }
          ]}
        >
          <DashboardScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={inboxFrom} durationInFrames={DUR.inbox}>
        <DynamicPanelScene
          durationInFrames={DUR.inbox}
          eyebrow="Крок 7"
          title="Вхідні — відповіді в панелі"
          desc="Діалоги з лідами, непрочитані, відповідь прямо з веб-інтерфейсу без Telegram Desktop."
          camera={[
            { frame: 0, scale: 1.1, x: 0, y: 0 },
            { frame: 34, scale: 1.55, x: -195, y: -15 },
            { frame: 92, scale: 1.55, x: -195, y: -15 }
          ]}
        >
          <InboxScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={uniquifyFrom} durationInFrames={DUR.uniquify}>
        <DynamicPanelScene
          durationInFrames={DUR.uniquify}
          eyebrow="Бонус"
          title="Video Uniquify"
          desc="Другий модуль Hub: пакетна унікалізація вертикальних відео через FFmpeg.wasm локально."
          camera={[
            { frame: 0, scale: 1, x: 0, y: 0 },
            { frame: 22, scale: 1.2, x: -55, y: 85 },
            { frame: 62, scale: 1.22, x: -55, y: 85 }
          ]}
        >
          <UniquifyScreen />
        </DynamicPanelScene>
      </Sequence>

      <Sequence from={ctaFrom} durationInFrames={DUR.cta}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
