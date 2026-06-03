import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import type { SafetyFiltersConfig, UserFiltersConfig } from '@/domain/types'
import { OUTREACH_FILTERS_STORAGE_KEY } from '@/lib/outreachFiltersStorage'

const defaultUser: UserFiltersConfig = {
  onlyPremium: false,
  onlyOnline: false,
  onlyRecentlyActive: true,
  requireUsername: true,
  ignoreBots: true,
  ignoreDeleted: true
}

const defaultSafety: SafetyFiltersConfig = {
  dedupeAcrossCampaigns: true,
  blacklistUsernames: [],
  stopOnFloodWarning: true,
  skipInactive: true
}

function readStoredFilters(): { user: UserFiltersConfig; safety: SafetyFiltersConfig } {
  try {
    const raw = localStorage.getItem(OUTREACH_FILTERS_STORAGE_KEY)
    if (!raw) return { user: defaultUser, safety: defaultSafety }
    const p = JSON.parse(raw) as {
      user?: Partial<UserFiltersConfig>
      safety?: Partial<SafetyFiltersConfig>
    }
    const user = { ...defaultUser, ...p.user }
    const safety: SafetyFiltersConfig = {
      ...defaultSafety,
      ...p.safety,
      blacklistUsernames: Array.isArray(p.safety?.blacklistUsernames)
        ? p.safety!.blacklistUsernames
        : defaultSafety.blacklistUsernames
    }
    return { user, safety }
  } catch {
    return { user: defaultUser, safety: defaultSafety }
  }
}

function Toggle({
  checked,
  label,
  onChange
}: {
  checked: boolean
  label: string
  onChange: (v: boolean) => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/15"
    >
      <span className="text-sm text-zinc-200">{label}</span>
      <span
        className={[
          'relative h-7 w-12 rounded-full border transition-colors',
          checked ? 'border-accent/40 bg-accent/15' : 'border-white/10 bg-black/30'
        ].join(' ')}
      >
        <motion.span
          layout
          className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white"
          animate={{ x: checked ? 22 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      </span>
    </button>
  )
}

export function FiltersPage(): JSX.Element {
  const { bundle } = useWorkspaceData()
  const initial = useMemo(() => readStoredFilters(), [])
  const [user, setUser] = useState<UserFiltersConfig>(initial.user)
  const [safety, setSafety] = useState<SafetyFiltersConfig>(initial.safety)
  const [blacklistText, setBlacklistText] = useState(
    initial.safety.blacklistUsernames.length ? initial.safety.blacklistUsernames.join('\n') : ''
  )

  const serverAutoBlacklist = bundle?.outreachAutoBlacklistUsernames ?? []

  useEffect(() => {
    try {
      localStorage.setItem(OUTREACH_FILTERS_STORAGE_KEY, JSON.stringify({ user, safety }))
    } catch {
      /* ignore */
    }
  }, [user, safety])

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Ці налаштування застосовуються до MTProto DM-розсилки (кампанії та «Запустити спам»): аудиторія перед
          чергою, blacklist, глобальний дедуп, зупинка після FloodWait. Ручний blacklist зберігається локально в
          браузері; контакти, які під час розсилки виявилися як «немає доставки» (заблокували акаунт), додаються на
          сервер і більше не потрапляють у чергу DM автоматично.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="text-sm font-semibold text-white">Аудитория</div>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={user.onlyPremium}
              label="Только пользователи с Telegram Premium"
              onChange={(v) => setUser({ ...user, onlyPremium: v })}
            />
            <Toggle
              checked={user.onlyOnline}
              label="Только сейчас онлайн"
              onChange={(v) => setUser({ ...user, onlyOnline: v })}
            />
            <Toggle
              checked={user.onlyRecentlyActive}
              label="Только недавно активные"
              onChange={(v) => setUser({ ...user, onlyRecentlyActive: v })}
            />
            <Toggle
              checked={user.requireUsername}
              label="Только с публичным @username"
              onChange={(v) => setUser({ ...user, requireUsername: v })}
            />
            <Toggle
              checked={user.ignoreBots}
              label="Игнорировать ботов"
              onChange={(v) => setUser({ ...user, ignoreBots: v })}
            />
            <Toggle
              checked={user.ignoreDeleted}
              label="Игнорировать удалённые аккаунты"
              onChange={(v) => setUser({ ...user, ignoreDeleted: v })}
            />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="text-sm font-semibold text-white">Безопасность и ограничения</div>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={safety.dedupeAcrossCampaigns}
              label="Не писать повторно тем же пользователям (глобально)"
              onChange={(v) => setSafety({ ...safety, dedupeAcrossCampaigns: v })}
            />
            <Toggle
              checked={safety.stopOnFloodWarning}
              label="Стоп кампании после flood warning"
              onChange={(v) => setSafety({ ...safety, stopOnFloodWarning: v })}
            />
            <Toggle
              checked={safety.skipInactive}
              label="Пропускать неактивных по критериям парсера"
              onChange={(v) => setSafety({ ...safety, skipInactive: v })}
            />
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Blacklist username (по одному в строке)
            </div>
            <textarea
              value={blacklistText}
              onChange={(e) => {
                setBlacklistText(e.target.value)
                const list = e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
                setSafety({ ...safety, blacklistUsernames: list })
              }}
              className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[12px] text-zinc-200 outline-none focus:border-accent/35"
              placeholder="@spam · competitor_bot"
            />
            {serverAutoBlacklist.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
                  Авто-blacklist (сервер, після розсилки)
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
                  Ці @username виключаються з наступних DM разом із ручним списком вище. Зараз записів:{' '}
                  {serverAutoBlacklist.length}.
                </p>
                <div className="mt-2 max-h-28 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-400">
                  {serverAutoBlacklist.map((u) => (
                    <div key={u}>@{u}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
