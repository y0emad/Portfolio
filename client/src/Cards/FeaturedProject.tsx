import { Link } from 'react-router'
import type { Project } from '../types'

function BrowserFrame({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-page shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </span>
        <span className="mx-auto truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[11px] text-muted">
          {url}
        </span>
      </div>
      <img src={src} alt={alt} loading="lazy" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}

export function FeaturedProject({ project }: { project: Project }) {
  const host = project.liveUrl ? new URL(project.liveUrl).host : project.slug
  const results = project.caseStudy?.results.slice(0, 3) ?? []

  return (
    <article className="group relative grid items-center gap-8 overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/60 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-accent/10 blur-3xl"
      />

      {project.coverUrl && (
        <div className="relative transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transition-none">
          <BrowserFrame src={project.coverUrl} alt={`${project.title} screenshot`} url={host} />
        </div>
      )}

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-accent">
            Featured project
          </span>
          {project.liveUrl && (
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Live in production
            </span>
          )}
        </div>

        <h3 className="text-3xl font-semibold tracking-tight">
          <Link to={`/case/${project.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
            {project.title}
          </Link>
        </h3>
        <p className="text-[15px] leading-relaxed text-muted">{project.summary}</p>

        {results.length > 0 && (
          <ul className="flex flex-col gap-2 text-sm">
            {results.map((r) => (
              <li key={r} className="flex gap-2.5">
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                {r}
              </li>
            ))}
          </ul>
        )}

        <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
          {project.skills.slice(0, 7).map((skill) => (
            <li key={skill} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
              {skill}
            </li>
          ))}
        </ul>

        <div className="mt-1 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-accent">Read the case study →</span>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="relative z-10 rounded-lg border border-line px-3.5 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              Open the live site ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
