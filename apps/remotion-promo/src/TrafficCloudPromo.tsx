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
import { FeatureCard } from './components/FeatureCard';
import { GridBackground } from './components/GridBackground';

const FEATURES = [
  { title: 'Акаунти Telegram', desc: 'MTProto · проксі · health', color: '#22d3ee' },
  { title: 'Кампанії DM', desc: 'Шаблони · ліміти · пауза', color: '#a78bfa' },
  { title: 'Парсинг джерел', desc: 'Чати · канали · фільтри', color: '#fb7185' },
  { title: 'Аналітика', desc: 'Логи · WebSocket · історія', color: '#34d399' }
] as const;

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

function FeaturesScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        padding: 64,
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif'
      }}
    >
      <div style={{ textAlign: 'center', opacity: headerOpacity }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#5ec8ff',
            margin: 0
          }}
        >
          Що вміє панель
        </p>
        <h2
          style={{
            marginTop: 12,
            marginBottom: 48,
            fontSize: 42,
            fontWeight: 800,
            color: '#f8fafc'
          }}
        >
          Усе в одному веб-інтерфейсі
        </h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          maxWidth: 900,
          margin: '0 auto'
        }}
      >
        {FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            title={f.title}
            desc={f.desc}
            color={f.color}
            delayFrames={Math.round(0.3 * fps + i * 0.25 * fps)}
          />
        ))}
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
          Стабільний потік лідів і масштабування кампаній
        </h2>
        <p style={{ fontSize: 20, color: '#94a3b8', marginBottom: 36 }}>
          Акаунти · джерела · розсилка · аналітика
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
      <Sequence from={3 * fps} durationInFrames={6 * fps}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={9 * fps} durationInFrames={9 * fps}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
