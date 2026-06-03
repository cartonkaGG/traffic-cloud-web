import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { HumanizationConfig } from '@/domain/types'

const STORAGE_KEY = 'traffic-cloud-humanization-v1'

const defaults: HumanizationConfig = {
  delayMinMs: 4200,
  delayMaxMs: 14800,
  typingSimulation: true,
  readingSimulation: true,
  randomPauses: true,
  accountCooldownMinutes: 35,
  smartDailyCap: 220
}

function readStored(): HumanizationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const p = JSON.parse(raw) as Partial<HumanizationConfig>
    return { ...defaults, ...p }
  } catch {
    return defaults
  }
}

export function HumanizationPage(): JSX.Element {
  const initial = useMemo(() => readStored(), [])
  const [cfg, setCfg] = useState<HumanizationConfig>(initial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    } catch {
      /* ignore */
    }
  }, [cfg])

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Параметры использует outreach worker: случайные задержки между действиями, симуляция набора текста и
          «чтения» чата. Значения синхронизируются с Redis-конфигом для каждого аккаунта.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel space-y-6 p-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">Задержка между действиями</div>
              <div className="font-mono text-[12px] text-zinc-500">
                {cfg.delayMinMs}–{cfg.delayMaxMs} ms
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Min
                </div>
                <input
                  type="range"
                  min={800}
                  max={20000}
                  step={100}
                  value={cfg.delayMinMs}
                  onChange={(e) =>
                    setCfg({ ...cfg, delayMinMs: Number(e.target.value) })
                  }
                  className="mt-2 w-full accent-accent"
                />
              </label>
              <label className="block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Max
                </div>
                <input
                  type="range"
                  min={1000}
                  max={60000}
                  step={100}
                  value={cfg.delayMaxMs}
                  onChange={(e) =>
                    setCfg({ ...cfg, delayMaxMs: Number(e.target.value) })
                  }
                  className="mt-2 w-full accent-accent"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-3">
            {(
              [
                ['typingSimulation', 'Симуляция набора текста'],
                ['readingSimulation', 'Симуляция чтения чата'],
                ['randomPauses', 'Случайные микропаузы']
              ] as const
            ).map(([key, label]) => (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setCfg({ ...cfg, [key]: !cfg[key] })}
                className={[
                  'flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                  cfg[key]
                    ? 'border-accent/35 bg-accent/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/15'
                ].join(' ')}
              >
                <span>{label}</span>
                <span className="font-mono text-[11px] text-zinc-500">{cfg[key] ? 'on' : 'off'}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="glass-panel space-y-6 p-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">Кулдаун аккаунта</div>
              <div className="font-mono text-[12px] text-zinc-500">{cfg.accountCooldownMinutes} мин</div>
            </div>
            <input
              type="range"
              min={5}
              max={240}
              step={5}
              value={cfg.accountCooldownMinutes}
              onChange={(e) =>
                setCfg({ ...cfg, accountCooldownMinutes: Number(e.target.value) })
              }
              className="mt-4 w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">Smart daily cap (DM)</div>
              <div className="font-mono text-[12px] text-zinc-500">{cfg.smartDailyCap}</div>
            </div>
            <input
              type="range"
              min={20}
              max={2000}
              step={10}
              value={cfg.smartDailyCap}
              onChange={(e) =>
                setCfg({ ...cfg, smartDailyCap: Number(e.target.value) })
              }
              className="mt-4 w-full accent-accent"
            />
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-zinc-500">
            Warmup-режим повышает лимиты постепенно — конфиг хранится на уровне аккаунта и кампании,
            orchestrator читает его перед каждым циклом worker pool.
          </div>
        </div>
      </div>
    </div>
  )
}
