import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

export function AdminAmbient(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 10% 0%, rgba(251, 191, 36, 0.08), transparent 58%), radial-gradient(ellipse 55% 45% at 95% 15%, rgba(94, 200, 255, 0.1), transparent 55%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(99, 102, 241, 0.06), transparent 60%)'
        }}
      />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-500/[0.06] blur-[100px]" />
      <div className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-cyan-500/[0.08] blur-[90px]" />
      <div className="absolute inset-0 bg-grid-faint bg-grid opacity-[0.18]" />

      <div className="admin-ambient-mark absolute right-[8%] top-[14%] hidden lg:block">
        <TrafficCloudMark size={44} variant="ambient" />
      </div>
      <div className="admin-ambient-mark absolute bottom-[18%] left-[6%] hidden md:block" style={{ animationDelay: '1.4s' }}>
        <TrafficCloudMark size={32} variant="ambient" />
      </div>
    </div>
  )
}
