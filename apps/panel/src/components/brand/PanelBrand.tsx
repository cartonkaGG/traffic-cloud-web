import TrafficCloudMark from './TrafficCloudMark'

type Props = {
  /** compact — sidebar; auth — login card */
  layout?: 'sidebar' | 'compact' | 'auth'
  className?: string
}

export function PanelBrand({ layout = 'sidebar', className = '' }: Props): JSX.Element {
  const markSize = layout === 'auth' ? 48 : 32

  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <div className="relative flex shrink-0 items-center justify-center overflow-visible">
        <TrafficCloudMark size={markSize} variant="logo" />
      </div>
      <div className="min-w-0">
        <div
          className={
            layout === 'auth'
              ? 'font-sans text-xl font-extrabold tracking-[0.18em] text-white'
              : 'font-sans text-[11px] font-extrabold tracking-[0.22em] text-white sm:text-xs'
          }
        >
          TRAFFIC CLOUD
        </div>
        {layout === 'auth' ? (
          <div className="mt-0.5 text-sm font-medium text-zinc-400">Панель outreach</div>
        ) : null}
      </div>
    </div>
  )
}
