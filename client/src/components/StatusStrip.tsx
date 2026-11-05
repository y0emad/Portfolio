import { Link } from 'react-router'
import { useHealth } from '../hooks/useHealth'
import { formatUptime, timeAgo } from '../lib/format'

export function StatusStrip() {
  const { data: health, isPending, isError } = useHealth()

  const up = !isError && !!health
  const ok = up && health.status === 'ok'
  const deployedAt = health?.deploy.deployedAt

  return (
    <section
      id="status"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-line bg-surface px-6 py-5 font-mono text-[13px]"
    >
      <Link to="/status" className="transition-colors hover:text-accent">
        <span className={isPending ? 'text-muted' : ok ? 'text-accent' : 'text-danger'}>●</span> api.status:{' '}
        {isPending ? '…' : ok ? 'ok' : up ? 'degraded' : 'down'}
      </Link>
      <span className="text-muted">last deploy: {deployedAt ? timeAgo(deployedAt) : 'not deployed'}</span>
      <span className="text-muted">uptime: {up ? formatUptime(health.uptime) : '—'}</span>
      <Link to="/contact" className="text-accent transition-colors hover:text-accent-light">
        POST /contact →
      </Link>
    </section>
  )
}
