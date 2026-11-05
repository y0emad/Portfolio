import { useEffect, useState, type ReactNode } from 'react'
import { ErrorBox } from '../components/ErrorBox'
import { PageHeader } from '../components/PageHeader'
import { useDeploys } from '../hooks/useDeploys'
import { useHealth } from '../hooks/useHealth'
import { formatUptime, timeAgo } from '../lib/format'

const CARD = 'flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-surface p-4 sm:p-5'
const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function StatCard({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className={CARD}>
      <span className="font-mono text-xs text-muted">{label}</span>
      <span className="text-lg font-semibold sm:text-[22px]">{children}</span>
      {hint && <span className="font-mono text-xs text-muted">{hint}</span>}
    </div>
  )
}

function Dot({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <span className={ok ? 'text-accent' : 'text-danger'}>● {children}</span>
}

function StatCardSkeleton() {
  return (
    <div className={`${CARD} animate-pulse`} aria-hidden="true">
      <div className="h-3 w-16 rounded bg-line" />
      <div className="h-6 w-24 rounded bg-line" />
    </div>
  )
}

function HealthCards() {
  const { data: health, isPending, isError, dataUpdatedAt } = useHealth()
  const now = useNow()

  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const apiUp = !isError && !!health
  const dbUp = apiUp && health.database.status === 'ok'
  const secondsSinceCheck = Math.floor((now - dataUpdatedAt) / 1000)
  const deployedAt = health?.deploy.deployedAt ?? null

  return (
    <div className="flex flex-col gap-3">
      <div className={GRID}>
        <StatCard label="API">
          <Dot ok={apiUp}>{apiUp ? 'ok' : 'down'}</Dot>
        </StatCard>
        <StatCard
          label="Database"
          hint={dbUp && health.database.latencyMs !== null ? `${health.database.latencyMs} ms` : undefined}
        >
          <Dot ok={dbUp}>{dbUp ? 'ok' : 'down'}</Dot>
        </StatCard>
        <StatCard label="Uptime">{apiUp ? formatUptime(health.uptime + secondsSinceCheck) : '—'}</StatCard>
        <StatCard
          label="Last deploy"
          hint={deployedAt ? (health?.deploy.commit?.slice(0, 7) ?? undefined) : 'running locally'}
        >
          {deployedAt ? timeAgo(deployedAt, now) : <span className="text-muted">not deployed</span>}
        </StatCard>
      </div>
      <p className="font-mono text-xs text-muted" aria-live="polite">
        {isError ? 'server not responding, retrying every 15s' : `checked ${timeAgo(dataUpdatedAt, now)}`}
      </p>
    </div>
  )
}

function RecentDeploys() {
  const { data: deploys, isPending, error, refetch, isRefetching } = useDeploys()

  return (
    <section className="flex flex-col gap-4" aria-busy={isPending}>
      <h2 className="text-xl font-semibold">Recent deploys</h2>

      {error ? (
        <ErrorBox error={error} onRetry={() => refetch()} retrying={isRefetching} />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-line bg-surface">
          {isPending &&
            Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex animate-pulse gap-4 border-b border-line px-5 py-4 last:border-b-0">
                <div className="h-4 w-16 rounded bg-line" />
                <div className="h-4 flex-1 rounded bg-line" />
              </li>
            ))}

          {deploys?.length === 0 && <li className="px-5 py-4 text-muted">No deploys yet.</li>}

          {deploys?.map((d) => (
            <li key={d.sha} className="border-b border-line last:border-b-0">
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-line/50"
              >
                <span className="font-mono text-sm text-accent">{d.sha}</span>
                <span className="min-w-0 flex-1 truncate">{d.message}</span>
                <span className="font-mono text-xs text-muted">{d.date ? timeAgo(d.date) : ''}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function StatusPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Status" intro="Live health of the server behind this site." />
      <HealthCards />
      <RecentDeploys />
    </div>
  )
}
