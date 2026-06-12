import { useState } from 'react'
import { ChevronDown, ShieldAlert } from 'lucide-react'

export function WindowsUnblockHelp({ compact = false }: { compact?: boolean }): JSX.Element {
  const [open, setOpen] = useState(compact)

  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[12px] font-medium text-amber-100">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          Windows блокує програму?
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-amber-300/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="space-y-2 border-t border-amber-400/15 px-3 py-3 text-[12px] leading-relaxed text-amber-100/85">
          <p className="text-amber-200/70">
            Traffic Cloud поки без платного підпису Microsoft — Defender / SmartScreen можуть
            блокувати .exe з інтернету. Це нормально для нових додатків.
          </p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>
              Після завантаження: ПКМ на <strong className="font-medium">Traffic-Cloud-Setup-*.exe</strong>{' '}
              → <strong className="font-medium">Властивості</strong> → внизу поставте галочку{' '}
              <strong className="font-medium">Розблокувати</strong> → OK.
            </li>
            <li>
              Якщо SmartScreen: натисніть <strong className="font-medium">Докладніше</strong> →{' '}
              <strong className="font-medium">Виконати в будь-якому випадку</strong>.
            </li>
            <li>
              У Захисті Windows: <strong className="font-medium">Керування безпекою</strong> →{' '}
              <strong className="font-medium">Захист від програм і загроз</strong> →{' '}
              <strong className="font-medium">Керування параметрами</strong> → вимкніть тимчасово{' '}
              <strong className="font-medium">Захист у реальному часі</strong> на 2 хв під час установки
              (або додайте папку <code className="rounded bg-black/30 px-1">Downloads</code> у виключення).
            </li>
            <li>
              Не встановлюйте з OneDrive «Робочий стіл» — краще{' '}
              <code className="rounded bg-black/30 px-1">C:\Users\Імʼя\Downloads</code>.
            </li>
          </ol>
          <p className="text-[11px] text-amber-200/55">
            Якщо пише «Application Control policy» — це політика ПК/роботи; потрібен адмін або інший
            компʼютер.
          </p>
        </div>
      ) : null}
    </div>
  )
}
