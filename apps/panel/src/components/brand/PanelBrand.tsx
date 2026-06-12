import { Link } from 'react-router-dom'
import TrafficCloudMark from './TrafficCloudMark'

type Props = {
  /** compact — sidebar; auth — login card */
  layout?: 'sidebar' | 'compact' | 'auth'
  className?: string
  /** Куди вести по кліку; null — не клікабельний. За замовчуванням /hub (крім auth). */
  homeTo?: string | null
}

export function PanelBrand({
  layout = 'sidebar',
  className = '',
  homeTo
}: Props): JSX.Element {
  const markSize = layout === 'auth' ? 48 : layout === 'compact' ? 22 : 32
  const target = homeTo === undefined ? (layout === 'auth' ? null : '/hub') : homeTo

  const inner = (
    <>
      <div className="relative flex shrink-0 items-center justify-center overflow-visible">
        {layout === 'auth' ? (
          <TrafficCloudMark size={markSize} variant="auth" />
        ) : (
          <TrafficCloudMark size={markSize} variant="logo" />
        )}
      </div>
      <div className="min-w-0">
        <div
          className={
            layout === 'auth'
              ? 'font-sans text-xl font-extrabold tracking-[0.18em] text-white'
              : layout === 'compact'
                ? 'font-sans text-[10px] font-extrabold tracking-[0.2em] text-white'
                : 'font-sans text-[11px] font-extrabold tracking-[0.22em] text-white sm:text-xs'
          }
        >
          TRAFFIC CLOUD
        </div>
        {layout === 'auth' ? (
          <div className="mt-0.5 text-sm font-medium text-zinc-400">Панель outreach</div>
        ) : null}
      </div>
    </>
  )

  const rootClass = `flex items-center gap-2.5 ${className}`.trim()

  if (target) {
    return (
      <Link
        to={target}
        title="Traffic Cloud Hub"
        className={`${rootClass} rounded-xl transition-opacity hover:opacity-90`}
      >
        {inner}
      </Link>
    )
  }

  return <div className={rootClass}>{inner}</div>
}
