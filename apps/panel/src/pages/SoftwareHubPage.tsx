import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Home, Lock, Play, Shield, Sparkles } from 'lucide-react'
import { AccountMenu } from '@/components/account/AccountMenu'
import { Link, useNavigate } from 'react-router-dom'
import { SubscriptionTerm } from '@/components/billing/SubscriptionTerm'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { useAuth } from '@/context/AuthContext'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { hasPanelAccess } from '@/lib/subscriptionAccess'
import { getMarketingHomeUrl } from '@/lib/site'
import { useSoftware } from '@/context/SoftwareContext'
import {
  SOFTWARE_PRODUCTS,
  type SoftwareProduct,
  type SoftwareStatus
} from '@/domain/softwareProducts'

function statusLabel(status: SoftwareStatus): string {
  return status === 'active' ? 'Доступно' : 'Скоро'
}

function SoftwareTile({
  product,
  needsSubscription,
  onLaunch
}: {
  product: SoftwareProduct
  needsSubscription: boolean
  onLaunch: (product: SoftwareProduct) => void
}): JSX.Element {
  const Icon = product.icon
  const isActive = product.status === 'active'

  return (
    <motion.button
      type="button"
      disabled={!isActive}
      onClick={() => onLaunch(product)}
      whileHover={isActive ? { y: -4, scale: 1.01 } : undefined}
      whileTap={isActive ? { scale: 0.99 } : undefined}
      className={[
        'group relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-3xl border p-6 text-left transition-[border-color,box-shadow] duration-300',
        isActive
          ? 'hub-tile-active cursor-pointer border-white/[0.10] bg-[#0c1019]/90 hover:border-accent/35'
          : 'cursor-not-allowed border-white/[0.05] bg-[#080b12]/80 opacity-75'
      ].join(' ')}
      style={isActive ? ({ '--hub-glow': product.glow } as CSSProperties) : undefined}
    >
      <div
        className={[
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          isActive ? 'group-hover:opacity-60' : ''
        ].join(' ')}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${product.glow}, transparent 70%)`
        }}
        aria-hidden
      />

      <div className="relative mb-6 flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${product.accent}`}
          aria-hidden
        />
        <div className="absolute inset-0 bg-grid-faint bg-grid opacity-30" aria-hidden />
        <Icon
          className={[
            'relative z-10 h-12 w-12 text-white/90',
            isActive ? 'neon-cloud-icon' : 'text-zinc-500'
          ].join(' ')}
          strokeWidth={1.5}
        />
        {!isActive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <Lock className="h-5 w-5 text-zinc-400" />
          </div>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-white">{product.name}</h3>
          <span
            className={[
              'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
              isActive
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                : 'border-white/10 bg-white/[0.04] text-zinc-500'
            ].join(' ')}
          >
            {statusLabel(product.status)}
          </span>
        </div>

        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-zinc-500">{product.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 pt-1">
          <span className="font-mono text-[11px] text-zinc-600">v{product.version}</span>
          {isActive ? (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-accent group-hover:text-cyan-200">
              {needsSubscription ? 'Оформити підписку' : 'Запустити'}
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          ) : (
            <span className="text-[12px] text-zinc-600">У розробці</span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export function SoftwareHubPage(): JSX.Element {
  const { isAdmin } = useAuth()
  const { subscription } = useWorkspaceData()
  const { selectSoftware } = useSoftware()
  const navigate = useNavigate()

  const canEnterPanel = hasPanelAccess(subscription, isAdmin)

  function launch(product: SoftwareProduct): void {
    if (product.status !== 'active') return
    selectSoftware(product.id)
    const target =
      product.id === 'video-uniquify'
        ? '/uniquify'
        : product.id === 'tiktok-warmup'
          ? '/tiktok'
          : '/'
    if (canEnterPanel) {
      navigate(target)
      return
    }
    navigate('/billing?gate=1&from=hub')
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% -20%, rgba(34,211,238,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(99,102,241,0.08), transparent 50%), linear-gradient(180deg, #030712 0%, #060a12 100%)'
        }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]"
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between gap-6 border-b border-white/[0.06] px-8 py-5 backdrop-blur-xl">
        <PanelBrand layout="sidebar" />
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <a
            href={getMarketingHomeUrl()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-accent/25 hover:text-zinc-200"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Головна</span>
          </a>
          <Link
            to="/billing"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-accent/25 hover:text-zinc-200"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Підписка</span>
          </Link>
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 transition-colors hover:border-violet-400/35"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Адмін</span>
            </Link>
          ) : null}
          <AccountMenu redirectAfterSwitch="/hub" />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 py-10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-accent/80" />
            Traffic Cloud Hub
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Оберіть застосунок
          </h1>
          <div className="mt-3">
            <SubscriptionTerm variant="inline" />
          </div>
        </div>

        <div className="mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTWARE_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <SoftwareTile
                product={product}
                needsSubscription={!canEnterPanel}
                onLaunch={launch}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-auto pt-12 text-center text-[12px] text-zinc-600">
          Traffic Cloud Hub · DM Outreach · Video Uniquify · TikTok Warmup
        </div>
      </main>
    </div>
  )
}
