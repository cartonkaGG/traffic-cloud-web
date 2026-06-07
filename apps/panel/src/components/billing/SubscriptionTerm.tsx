import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { formatSubscriptionEnd } from '@/lib/formatSubscription'

type Variant = 'inline' | 'card' | 'menu'

export function SubscriptionTerm({ variant = 'inline' }: { variant?: Variant }): JSX.Element | null {
  const { isAdmin } = useAuth()
  const { subscription } = useWorkspaceData()

  if (isAdmin) {
    if (variant === 'menu') {
      return (
        <div className="mt-2 text-[12px] text-violet-300/90">Адмін · повний доступ</div>
      )
    }
    if (variant === 'card') {
      return (
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Підписка
          </div>
          <p className="mt-2 text-[13px] text-violet-100">Адмін · без обмеження терміну</p>
        </div>
      )
    }
    return null
  }

  if (subscription?.isActive && subscription.currentPeriodEnd) {
    const end = formatSubscriptionEnd(subscription.currentPeriodEnd)
    if (variant === 'menu') {
      return (
        <div className="mt-2 text-[12px] text-emerald-300/90">
          Підписка до <span className="font-medium text-emerald-100">{end}</span>
        </div>
      )
    }
    if (variant === 'card') {
      return (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Підписка
          </div>
          <p className="mt-2 text-[13px] text-zinc-400">
            Діє до <span className="font-medium text-emerald-100">{end}</span>
          </p>
          <Link
            to="/billing"
            className="mt-3 inline-block text-[11px] font-medium text-accent hover:text-cyan-200"
          >
            Продовжити →
          </Link>
        </div>
      )
    }
    return (
      <span className="text-[12px] text-zinc-500">
        Підписка до <span className="font-medium text-emerald-200/90">{end}</span>
      </span>
    )
  }

  if (variant === 'menu') {
    return (
      <Link
        to="/billing?gate=1"
        className="mt-2 block text-[12px] font-medium text-amber-300/90 hover:text-amber-200"
      >
        Оформити підписку →
      </Link>
    )
  }
  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.08] p-4">
        <p className="text-[13px] text-zinc-400">Підписка не активна</p>
        <Link
          to="/billing?gate=1"
          className="mt-2 inline-block text-[12px] font-semibold text-amber-200 hover:text-amber-100"
        >
          Оплатити місяць →
        </Link>
      </div>
    )
  }

  return null
}
