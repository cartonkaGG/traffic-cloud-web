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
import { PanelSlide } from './components/panel/PanelSlide';
import { CampaignsScreen } from './components/panel/screens/CampaignsScreen';
import { DashboardScreen } from './components/panel/screens/DashboardScreen';
import { HubScreen } from './components/panel/screens/HubScreen';
import { SourcesScreen } from './components/panel/screens/SourcesScreen';

function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const logoOpacity = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1)
  });
  const titleY = interpolate(frame, [0.4 * fps, 1.2 * fps], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const titleOpacity = interpolate(frame, [0.5 * fps, 1.3 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const tagOpacity = interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const tagY = interpolate(frame, [1.4 * fps, 2.2 * fps], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
          <CloudMark size={140} />
        </div>
        <h1
          style={{
            marginTop: 28,
            marginBottom: 0,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity
          }}
        >
          Traffic <span style={{ color: '#5ec8ff' }}>Cloud</span>
        </h1>
        <p
          style={{
            marginTop: 16,
            fontSize: 26,
            color: '#94a3b8',
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity
          }}
        >
          Telegram outreach у хмарі
        </p>
      </div>
    </AbsoluteFill>
  );
}

function CtaScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const scale = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const glow = interpolate(frame, [0, 2 * fps], [0.3, 0.7], {
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity,
          transform: `scale(${0.92 + scale * 0.08})`
        }}
      >
        <CloudMark size={96} />
        <h2
          style={{
            marginTop: 32,
            marginBottom: 12,
            fontSize: 44,
            fontWeight: 800,
            color: '#f8fafc',
            maxWidth: 720,
            lineHeight: 1.2
          }}
        >
          Парсіть · розсилайте · аналізуйте — у браузері
        </h2>
        <p style={{ fontSize: 20, color: '#94a3b8', marginBottom: 36 }}>
          Веб-панель для Telegram outreach без десктоп-софту
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '16px 36px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            boxShadow: `0 0 48px rgba(94, 200, 255, ${glow})`,
            fontSize: 20,
            fontWeight: 700,
            color: '#fff'
          }}
        >
          Увійти в панель →
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const TrafficCloudPromo = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#030712' }}>
      <GridBackground />
      <Sequence durationInFrames={3 * fps}>
        <IntroScene />
      </Sequence>

      <Sequence from={3 * fps} durationInFrames={3.5 * fps}>
        <PanelSlide
          eyebrow="Веб-панель"
          title="Software Hub"
          desc="Один вхід до всіх інструментів: DM Outreach, Video Uniquify та інші модулі."
        >
          <HubScreen />
        </PanelSlide>
      </Sequence>

      <Sequence from={6.5 * fps} durationInFrames={3.5 * fps}>
        <PanelSlide
          eyebrow="Дашборд"
          title="Статистика в реальному часі"
          desc="DM, відповіді, статус акаунтів і live-логи — все на одному екрані."
        >
          <DashboardScreen />
        </PanelSlide>
      </Sequence>

      <Sequence from={10 * fps} durationInFrames={4 * fps}>
        <PanelSlide
          eyebrow="Кампанії"
          title="Розсилка DM з шаблонами"
          desc="Запуск, пауза, ліміти та змінні в текстах — кампанія керується з панелі."
        >
          <CampaignsScreen />
        </PanelSlide>
      </Sequence>

      <Sequence from={14 * fps} durationInFrames={4 * fps}>
        <PanelSlide
          eyebrow="Джерела"
          title="Парсинг аудиторії"
          desc="Збір лідів з чатів і каналів, фільтри та передача одразу в кампанію."
        >
          <SourcesScreen />
        </PanelSlide>
      </Sequence>

      <Sequence from={18 * fps} durationInFrames={6 * fps}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
