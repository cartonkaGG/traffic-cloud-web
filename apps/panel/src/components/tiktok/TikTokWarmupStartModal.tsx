import { Flame, Hash, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { TikTokAccountModel } from '@/domain/types'
import { parseHashtagInput } from '@/lib/tiktokWarmupStorage'

export function TikTokWarmupStartModal({
  account,
  hashtagsRaw,
  onHashtagsChange,
  busy,
  onConfirm,
  onClose
}: {
  account: TikTokAccountModel
  hashtagsRaw: string
  onHashtagsChange: (value: string) => void
  busy?: boolean
  onConfirm: (hashtags: string[]) => void
  onClose: () => void
}): JSX.Element {
  const preview = parseHashtagInput(hashtagsRaw)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-40"
          aria-label="Закрити"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-fuchsia-300">
          <Flame className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-white">Прогрів @{account.username}</h2>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
          Оберіть тематику відео для цієї сесії. Хештеги можна змінити перед кожним прогрівом.
        </p>
        <label className="mt-5 block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Хештеги / тематика
          </span>
          <input
            type="text"
            value={hashtagsRaw}
            onChange={(e) => onHashtagsChange(e.target.value)}
            placeholder="crypto, fitness, cooking"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/40"
          />
          <span className="text-[11px] text-zinc-600">Через кому або пробіл</span>
        </label>
        {preview.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {preview.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-0.5 text-[11px] text-fuchsia-200"
              >
                <Hash className="h-3 w-3" />#{tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[12px] text-amber-200/90">Додайте хоча б один хештег</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 disabled:opacity-40"
          >
            Скасувати
          </button>
          <button
            type="button"
            disabled={busy || preview.length === 0}
            onClick={() => onConfirm(preview)}
            className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100 disabled:opacity-40"
          >
            {busy ? 'Запуск…' : 'Запустити прогрів'}
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
