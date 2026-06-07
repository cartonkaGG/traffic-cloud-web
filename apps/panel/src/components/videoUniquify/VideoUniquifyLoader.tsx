import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

type Props = {
  label: string
  sublabel?: string
  progressPct: number
}

export function VideoUniquifyLoader({ label, sublabel, progressPct }: Props): JSX.Element {
  const clamped = Math.min(100, Math.max(0, progressPct))

  return (
    <div className="vu-loader mt-8 flex flex-col items-center text-center">
      <div className="vu-loader-orbit" aria-hidden>
        <div className="vu-loader-ring" />
        <div className="vu-loader-ring vu-loader-ring--delay" />
        <div className="vu-loader-cloud">
          <TrafficCloudMark size={72} variant="hero" glow="lean" />
        </div>
        <svg className="vu-loader-progress" viewBox="0 0 120 120" aria-hidden>
          <defs>
            <linearGradient id="vu-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(195, 100%, 55%)" />
              <stop offset="100%" stopColor="hsl(220, 90%, 58%)" />
            </linearGradient>
          </defs>
          <circle className="vu-loader-progress-track" cx="60" cy="60" r="52" />
          <circle
            className="vu-loader-progress-fill"
            cx="60"
            cy="60"
            r="52"
            style={{ strokeDashoffset: `${328 - (328 * clamped) / 100}` }}
          />
        </svg>
      </div>

      <p className="mt-8 text-sm font-medium text-zinc-200">{label}</p>
      {sublabel ? (
        <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-zinc-500">{sublabel}</p>
      ) : null}

      <div className="mt-5 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="vu-loader-dot" style={{ animationDelay: `${i * 0.22}s` }} />
        ))}
      </div>
    </div>
  )
}
