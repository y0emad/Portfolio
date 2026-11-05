import { getErrorMessage } from '../lib/api'

export function ErrorBox({ error, onRetry, retrying }: { error: unknown; onRetry: () => void; retrying: boolean }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-danger-line bg-danger-bg p-5 text-danger"
    >
      <span>{getErrorMessage(error)}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="rounded-lg border border-danger-line px-4 py-2 text-sm text-ink transition-colors hover:border-danger disabled:opacity-50"
      >
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  )
}
