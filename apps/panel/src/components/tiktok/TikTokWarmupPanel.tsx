import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Eye,
  Flame,
  Heart,
  Loader2,
  MessageCircle,
  Monitor,
  Pause,
  Play,
  Search,
  UserPlus,
  Workflow
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TikTokAccountModel, TikTokAccountStatus } from '@/domain/types'
import {
  DEFAULT_WARMUP_SETTINGS,
  parseSearchTopicsInput,
  type TikTokExecutionMode,
  type TikTokWarmupSettings
} from '@/lib/tiktokWarmupStorage'

function statusUi(status: TikTokAccountStatus): { label: string; className: string } {
  switch (status) {
    case 'warming':
      return {
        label: 'Прогрів',
        className: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200'
      }
    case 'ready':
      return {
        label: 'Готовий',
        className: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
      }
    case 'paused':
      return {
        label: 'Очікує',
        className: 'border-amber-400/30 bg-amber-500/10 text-amber-200'
      }
    case 'creating':
      return {
        label: 'Реєстрація',
        className: 'border-sky-400/30 bg-sky-500/10 text-sky-200'
      }
    case 'error':
      return {
        label: 'Помилка',
        className: 'border-red-400/30 bg-red-500/10 text-red-200'
      }
  }
}

const EXECUTION_MODES: Array<{
  id: TikTokExecutionMode
  label: string
  icon: typeof Eye
}> = [
  { id: 'visible', label: 'На екрані', icon: Eye },
  { id: 'headless', label: 'Фоном', icon: Workflow }
]

function MetricBox({
  label,
  value,
  onChange,
  min,
  max,
  icon: Icon
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  icon: typeof Heart
}): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-4 transition-colors hover:border-white/[0.12]">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-fuchsia-300/80" />
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-2 w-full bg-transparent text-2xl font-semibold tabular-nums text-white outline-none"
      />
    </div>
  )
}

type Props = {
  accounts: TikTokAccountModel[]
  settings: TikTokWarmupSettings
  onSettingsChange: (next: TikTokWarmupSettings) => void
  busyId: string | null
  activityLog: string[]
  onToggleAccount: (account: TikTokAccountModel) => void
}

export function TikTokWarmupPanel({
  accounts,
  settings,
  onSettingsChange,
  busyId,
  activityLog,
  onToggleAccount
}: Props): JSX.Element {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const topics = useMemo(
    () => parseSearchTopicsInput(settings.searchTopicsRaw),
    [settings.searchTopicsRaw]
  )

  const patch = (partial: Partial<TikTokWarmupSettings>): void => {
    let next = { ...settings, ...partial }
    if (
      partial.watchSecondsMin !== undefined ||
      partial.watchSecondsMax !== undefined
    ) {
      next.watchSecondsMin = Math.max(2, Number(next.watchSecondsMin) || 5)
      next.watchSecondsMax = Math.max(
        next.watchSecondsMin,
        Number(next.watchSecondsMax) || DEFAULT_WARMUP_SETTINGS.watchSecondsMax
      )
    }
    onSettingsChange(next)
  }

  return (
    <div className="space-y-5">
      {/* Hero: search topics */}
      <section className="relative overflow-hidden rounded-2xl border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/[0.08] via-[#0a0a12] to-cyan-500/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10">
              <Flame className="h-4 w-4 text-fuchsia-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Що дивитися в TikTok</h2>
              <p className="text-[12px] text-zinc-500">
                Пошук відкриється у браузері — акаунт переглядає відео за цими темами
              </p>
            </div>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-300/70" />
            <input
              type="text"
              value={settings.searchTopicsRaw}
              onChange={(e) => patch({ searchTopicsRaw: e.target.value })}
              placeholder="crypto, рецепти веган, fitness motivation"
              className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-[border,box-shadow] placeholder:text-zinc-600 focus:border-fuchsia-400/35 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.12)]"
            />
          </div>

          {topics.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[12px] text-fuchsia-100"
                >
                  <Search className="h-3 w-3 opacity-70" />
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-amber-200/80">
              Додайте хоча б одну тему — через кому
            </p>
          )}
        </div>
      </section>

      {/* Bento: mode + metrics */}
      <section className="grid gap-3 lg:grid-cols-12">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 lg:col-span-4">
          <p className="text-[11px] font-medium text-zinc-500">Режим</p>
          <div className="mt-3 flex rounded-xl border border-white/[0.08] bg-black/30 p-1">
            {EXECUTION_MODES.map((mode) => {
              const Icon = mode.icon
              const active = settings.executionMode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => patch({ executionMode: mode.id })}
                  className={[
                    'relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium transition-colors',
                    active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  ].join(' ')}
                >
                  {active ? (
                    <motion.span
                      layoutId="warmup-mode"
                      className="absolute inset-0 rounded-lg bg-fuchsia-500/15 shadow-[inset_0_0_0_1px_rgba(217,70,239,0.25)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-[11px] font-medium text-zinc-500">Сесія (хв)</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <input
                type="number"
                min={1}
                max={60}
                value={settings.scrollMinutesMin}
                onChange={(e) =>
                  patch({
                    scrollMinutesMin:
                      Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.scrollMinutesMin
                  })
                }
                className="w-12 bg-transparent text-xl font-semibold text-white outline-none"
              />
              <span className="text-zinc-600">—</span>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.scrollMinutesMax}
                onChange={(e) =>
                  patch({
                    scrollMinutesMax:
                      Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.scrollMinutesMax
                  })
                }
                className="w-12 bg-transparent text-xl font-semibold text-white outline-none"
              />
            </div>
          </div>
          <MetricBox
            label="Лайки"
            icon={Heart}
            min={0}
            max={50}
            value={settings.likesPerSession}
            onChange={(n) => patch({ likesPerSession: n })}
          />
          <MetricBox
            label="Підписки"
            icon={UserPlus}
            min={0}
            max={20}
            value={settings.followsPerSession}
            onChange={(n) => patch({ followsPerSession: n })}
          />
          <MetricBox
            label="Коментарі"
            icon={MessageCircle}
            min={0}
            max={30}
            value={settings.commentsPerSession}
            onChange={(n) => patch({ commentsPerSession: n })}
          />
        </div>
      </section>

      {/* Advanced (collapsed) */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-sm font-medium text-zinc-400">Детальні налаштування</span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {advancedOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-white/[0.06] px-5 pb-5 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] text-zinc-500">Перегляд мін (сек)</span>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      value={settings.watchSecondsMin}
                      onChange={(e) =>
                        patch({
                          watchSecondsMin:
                            Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.watchSecondsMin
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] text-zinc-500">Перегляд макс (сек)</span>
                    <input
                      type="number"
                      min={2}
                      max={180}
                      value={settings.watchSecondsMax}
                      onChange={(e) =>
                        patch({
                          watchSecondsMax:
                            Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.watchSecondsMax
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                    />
                  </label>
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.watchFullVideos}
                    onChange={(e) => patch({ watchFullVideos: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 accent-fuchsia-500"
                  />
                  <span className="text-[13px] text-zinc-400">Дивитися відео до кінця</span>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] text-zinc-500">
                    Тексти коментарів (кожен з нового рядка)
                  </span>
                  <textarea
                    rows={3}
                    value={settings.commentTexts.join('\n')}
                    onChange={(e) =>
                      patch({
                        commentTexts: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      })
                    }
                    placeholder={'🔥🔥🔥\nТопчик\nКласне відео'}
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                  />
                </label>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* Accounts */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Акаунти</h3>
          <span className="text-[11px] text-zinc-600">{accounts.length} у списку</span>
        </div>

        {accounts.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Спочатку додайте акаунт на вкладці «Додати акаунт».
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {accounts.map((account) => {
              const ui = statusUi(account.status)
              const isBusy = busyId === account.id
              const warming = account.status === 'warming'
              return (
                <li
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 transition-colors hover:border-white/[0.1]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">@{account.username}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${ui.className}`}
                      >
                        {ui.label}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-600">
                        {account.trustScore}%
                      </span>
                    </div>
                    {account.watchHashtags.length > 0 ? (
                      <p className="mt-1 truncate text-[11px] text-zinc-600">
                        Останній пошук: {account.watchHashtags.join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={isBusy || (!warming && topics.length === 0)}
                    onClick={() => onToggleAccount(account)}
                    title={
                      !warming && topics.length === 0
                        ? 'Спочатку вкажіть теми пошуку'
                        : undefined
                    }
                    className={[
                      'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                      warming
                        ? 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-red-400/25 hover:text-red-200'
                        : 'border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100 hover:border-fuchsia-400/50'
                    ].join(' ')}
                  >
                    {isBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : warming ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    {warming ? 'Стоп' : 'Старт'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {settings.executionMode === 'visible' && activityLog.length > 0 ? (
        <section className="rounded-2xl border border-white/[0.06] bg-black/20 p-5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
            <Monitor className="h-4 w-4 text-cyan-300" />
            Журнал сесії
          </div>
          <div className="mt-3 max-h-40 space-y-1 overflow-y-auto font-mono text-[11px]">
            {activityLog.map((line, i) => (
              <div key={`${line}-${i}`} className="text-zinc-500">
                <span className="text-zinc-700">{String(i + 1).padStart(2, '0')}</span> {line}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
