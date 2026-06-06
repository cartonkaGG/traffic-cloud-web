import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

const FLOATERS = [
  { x: '6%', y: '10%', size: 40, delay: 0, mobile: true },
  { x: '78%', y: '18%', size: 32, delay: 1.8, mobile: false },
  { x: '12%', y: '52%', size: 28, delay: 2.4, mobile: true },
  { x: '84%', y: '62%', size: 36, delay: 0.9, mobile: false },
  { x: '42%', y: '78%', size: 24, delay: 3.2, mobile: true },
  { x: '22%', y: '28%', size: 22, delay: 1.2, mobile: false }
]

export function BillingAmbient(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="billing-aurora absolute inset-0" />
      <div className="billing-ambient-glow billing-ambient-glow--cyan" />
      <div className="billing-ambient-glow billing-ambient-glow--indigo hidden sm:block" />
      <div className="absolute inset-0 cyber-grid opacity-[0.05]" />

      {FLOATERS.map((f, i) => (
        <div
          key={i}
          className={`billing-ambient-floater ${f.mobile ? '' : 'hidden sm:block'}`}
          style={{
            left: f.x,
            top: f.y,
            animationDelay: `${f.delay}s`,
            animationDuration: `${14 + (i % 3) * 3}s`
          }}
        >
          <TrafficCloudMark size={f.size} variant="ambient" />
        </div>
      ))}
    </div>
  )
}
