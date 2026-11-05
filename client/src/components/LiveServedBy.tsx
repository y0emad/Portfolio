import { Link } from 'react-router'
import { useHealth } from '../hooks/useHealth'

export function LiveServedBy() {
  const { data: health, isPending, isError } = useHealth()

  const up = !isError && !!health
  const ok = up && health.status === 'ok'

  const dot = isPending ? 'bg-muted' : ok ? 'bg-accent' : 'bg-danger'
  const text = isPending
    ? 'connecting to my API…'
    : !up
      ? 'API unreachable right now'
      : ok
        ? `served by my API · ${health.responseMs} ms`
        : `served by my API · database degraded`

  return (
    <Link
      to="/status"
      className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink"
      aria-live="polite"
    >
      <span className="relative flex size-2">
        {ok && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />}
        <span className={`relative inline-flex size-2 rounded-full ${dot}`} />
      </span>
      {text}
    </Link>
  )
}
