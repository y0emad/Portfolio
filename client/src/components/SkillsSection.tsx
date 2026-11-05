import { useSkills } from '../hooks/useSkills'
import type { SkillCategory } from '../types'
import { ErrorBox } from './ErrorBox'

const CATEGORIES: { key: SkillCategory; title: string }[] = [
  { key: 'frontend', title: 'Frontend' },
  { key: 'backend', title: 'Backend' },
  { key: 'database', title: 'Databases' },
  { key: 'devops', title: 'DevOps & Cloud' },
  { key: 'tools', title: 'Testing & Tools' },
]

const CARD = 'flex flex-col gap-4 rounded-xl border border-line bg-surface p-6'
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5'

function SkillGroupSkeleton() {
  return (
    <div className={`${CARD} animate-pulse`} aria-hidden="true">
      <div className="h-4 w-1/3 rounded bg-line" />
      <div className="flex flex-wrap gap-2">
        {[16, 20, 12, 24, 14, 18].map((w, i) => (
          <div key={i} className="h-7 rounded-md bg-line" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
    </div>
  )
}

export function SkillsSection() {
  const { data: skills, isPending, error, refetch, isRefetching } = useSkills()

  return (
    <section id="skills" className="flex flex-col gap-5" aria-busy={isPending}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold">Stack</h2>
        <span className="font-mono text-xs text-muted">GET /api/skills</span>
      </div>

      {error ? (
        <ErrorBox error={error} onRetry={() => refetch()} retrying={isRefetching} />
      ) : (
        <div className={GRID}>
          {isPending
            ? CATEGORIES.map(({ key }) => <SkillGroupSkeleton key={key} />)
            : CATEGORIES.map(({ key, title }) => {
                const list = skills[key] ?? []
                if (list.length === 0) return null
                return (
                  <div key={key} className={CARD}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{title}</h3>
                      <span className="font-mono text-xs text-accent">{String(list.length).padStart(2, '0')}</span>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {list.map((skill) => (
                        <li
                          key={skill.id}
                          className="rounded-md border border-line bg-page px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink"
                        >
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
        </div>
      )}
    </section>
  )
}
