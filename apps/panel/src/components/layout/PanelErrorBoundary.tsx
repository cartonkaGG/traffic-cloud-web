import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[panel]', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#030712] px-6 text-center">
          <p className="text-lg font-semibold text-white">Помилка завантаження панелі</p>
          <p className="max-w-md text-sm text-zinc-400">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-medium text-white"
          >
            Оновити сторінку
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
