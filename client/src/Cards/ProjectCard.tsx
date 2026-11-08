import { Link } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { ErrorBox } from '../components/ErrorBox'
import { FeaturedProject } from './FeaturedProject'
import type { Project } from '../types'

const CARD = 'flex flex-col gap-3 rounded-xl border border-line bg-surface p-6'
const MAX_TAGS = 4

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const extra = project.skills.length - MAX_TAGS

  return (
    <Link
      to={`/case/${project.slug}`}
      className={`group rise-in ${CARD} [box-shadow:0_18px_36px_-18px_rgba(0,0,0,0.9)] transition-[transform,box-shadow] duration-250
        hover:[box-shadow:0_28px_48px_-16px_rgba(0,0,0,0.95),0_0_0_1px_var(--color-accent)]
        hover:[transform:perspective(800px)_translateZ(14px)_rotateX(3deg)]
        motion-reduce:transition-none motion-reduce:hover:transform-none`}
    >
      <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
      <span className="text-xl font-semibold group-hover:text-accent">{project.title}</span>
      <span className="text-[15px] leading-relaxed text-muted">{project.summary}</span>

      <ul className="mt-1 flex flex-wrap gap-2" aria-label="Tech stack">
        {project.skills.slice(0, MAX_TAGS).map((skill) => (
          <li key={skill} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
            {skill}
          </li>
        ))}
        {extra > 0 && <li className="px-1 py-0.5 font-mono text-xs text-muted">+{extra}</li>}
      </ul>

      <span className="mt-auto pt-2 text-sm group-hover:text-accent">Read the architecture →</span>
    </Link>
  )
}

function ProjectCardSkeleton() {
  return (
    <div className={`${CARD} animate-pulse`} aria-hidden="true">
      <div className="h-3 w-6 rounded bg-line" />
      <div className="h-5 w-2/3 rounded bg-line" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-line" />
        <div className="h-3 w-5/6 rounded bg-line" />
      </div>
      <div className="mt-1 flex gap-2">
        <div className="h-5 w-14 rounded-md bg-line" />
        <div className="h-5 w-16 rounded-md bg-line" />
        <div className="h-5 w-12 rounded-md bg-line" />
      </div>
    </div>
  )
}

export function ProjectGrid() {
  const { data: projects, isPending, error, refetch, isRefetching } = useProjects()
  const featured = projects?.filter((p) => p.featured) ?? []
  const rest = projects?.filter((p) => !p.featured) ?? []

  return (
    <section id="projects" className="flex flex-col gap-5" aria-busy={isPending}>
      <h2 className="text-2xl font-semibold">Case studies</h2>

      {error ? (
        <ErrorBox error={error} onRetry={() => refetch()} retrying={isRefetching} />
      ) : (
        <>
          {isPending ? (
            <div className={`${CARD} h-72 animate-pulse sm:h-80`} aria-hidden="true" />
          ) : (
            featured.map((p, i) => <FeaturedProject key={p.id} project={p} reverse={i % 2 === 1} />)
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {isPending
              ? Array.from({ length: 3 }, (_, i) => <ProjectCardSkeleton key={i} />)
              : rest.map((p, i) => <ProjectCard key={p.id} project={p} index={i + featured.length} />)}
          </div>
        </>
      )}

      {projects?.length === 0 && <p className="text-muted">No projects yet.</p>}
    </section>
  )
}
