import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import axios from 'axios'
import { ArchitectureBar } from '../components/ArchitectureBar'
import { ErrorBox } from '../components/ErrorBox'
import { FigmaEmbed } from '../components/FigmaEmbed'
import { Screenshots } from '../components/Screenshots'
import { useProject } from '../hooks/useProject'
import { useProjects } from '../hooks/useProjects'
import { layerId } from '../lib/caseStudy'
import type { CaseStudyLayer, Project } from '../types'

const CARD = 'rounded-xl border border-line bg-surface'
const BUTTON = 'inline-flex items-center rounded-lg px-5 py-3 text-[15px] transition-colors'

const FADE = 0.5

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function useLayerLevels(count: number) {
  const [levels, setLevels] = useState<number[]>([])

  useEffect(() => {
    if (count === 0) return

    const update = () => {
      const middle = window.innerHeight / 2
      const next = Array.from({ length: count }, (_, i) => {
        const el = document.getElementById(layerId(i))
        if (!el) return 0
        const { top, height } = el.getBoundingClientRect()
        const p = (middle - top) / height
        const fadeIn = i === 0 ? 1 : clamp01((p + FADE / 2) / FADE)
        const fadeOut = i === count - 1 ? 1 : clamp01((1 + FADE / 2 - p) / FADE)
        return Math.round(Math.min(fadeIn, fadeOut) * 100) / 100
      })
      setLevels((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [count])

  return levels
}

function MetaCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-col gap-1 px-5 py-4`}>
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="font-mono text-xs leading-relaxed text-muted">{children}</span>
    </div>
  )
}

function LayerSection({ layer, index }: { layer: CaseStudyLayer; index: number }) {
  return (
    <section id={layerId(index)} className="flex min-h-90 scroll-mt-48 flex-col gap-4 pt-10 pb-6">
      <span className="font-mono text-xs tracking-[0.08em] text-accent uppercase">
        {String(index + 1).padStart(2, '0')} · {layer.name}
      </span>
      <h2 className="text-2xl font-semibold sm:text-[28px]">{layer.title}</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {(
          [
            ['Problem', layer.problem],
            ['Decision', layer.decision],
          ] as const
        ).map(([label, text]) => (
          <div key={label} className={`${CARD} p-5`}>
            <div className="mb-2 font-mono text-xs text-accent uppercase">{label}</div>
            <p className="text-base leading-[1.7] text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Neighbours({ slug }: { slug: string }) {
  const { data: projects } = useProjects()
  if (!projects || projects.length < 2) return null

  const i = projects.findIndex((p) => p.slug === slug)
  if (i === -1) return null
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]

  const card = (p: Project, label: string, align: string) => (
    <Link
      to={`/case/${p.slug}`}
      className={`${CARD} group flex flex-col gap-1 p-5 transition-colors hover:border-accent ${align}`}
    >
      <span className="font-mono text-xs text-muted">{label}</span>
      <span className="font-semibold group-hover:text-accent">{p.title}</span>
    </Link>
  )

  return (
    <nav aria-label="More case studies" className="grid gap-4 sm:grid-cols-2">
      {card(prev, '← Previous', 'items-start')}
      {card(next, 'Next →', 'items-start sm:items-end sm:text-right')}
    </nav>
  )
}

function CaseStudySkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="h-4 w-28 rounded bg-line" />
      <div className="h-10 w-2/3 rounded bg-line" />
      <div className="h-4 w-full max-w-155 rounded bg-line" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${CARD} h-20`} />
        ))}
      </div>
      <div className={`${CARD} h-20`} />
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`${CARD} h-40`} />
        <div className={`${CARD} h-40`} />
      </div>
    </div>
  )
}

export function CaseStudyPage() {
  const { slug = '' } = useParams()
  return <CaseStudyView key={slug} slug={slug} />
}

function CaseStudyView({ slug }: { slug: string }) {
  const { data: project, isPending, error, refetch, isRefetching } = useProject(slug)
  const layers = project?.caseStudy?.layers ?? []
  const levels = useLayerLevels(layers.length)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (isPending) return <CaseStudySkeleton />

  if (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return (
        <div className="flex flex-col items-start gap-6">
          <title>Project not found · Yousef Emad</title>
          <h1 className="text-4xl font-semibold">Project not found</h1>
          <p className="text-muted">There is no case study called “{slug}”.</p>
          <Link to="/" className={`${BUTTON} bg-accent font-semibold text-page hover:bg-accent-light`}>
            See all projects
          </Link>
        </div>
      )
    }
    return <ErrorBox error={error} onRetry={() => refetch()} retrying={isRefetching} />
  }

  const cs = project.caseStudy

  return (
    <article className="flex flex-col gap-10">
      <title>{`${project.title} · Case study · Yousef Emad`}</title>

      <header className="flex flex-col gap-5">
        <Link to="/" className="w-fit font-mono text-xs text-muted transition-colors hover:text-accent">
          ← All projects
        </Link>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-[40px]">{project.title}</h1>
        <p className="max-w-155 text-[17px] leading-relaxed text-muted">{project.summary}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetaCard label="Role">{cs?.role ?? 'Solo'}</MetaCard>
          <MetaCard label="Stack">{project.skills.slice(0, 5).join(' · ')}</MetaCard>
          <MetaCard label="Deploy">{cs?.deploy ?? '—'}</MetaCard>
        </div>

        <div className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className={`${BUTTON} bg-accent font-semibold text-page hover:bg-accent-light`}
            >
              Open the live site ↗
            </a>
          )}
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className={`${BUTTON} border border-line hover:border-accent hover:text-accent`}
          >
            View the code on GitHub ↗
          </a>
          {cs?.designUrl && (
            <a
              href={cs.designUrl}
              target="_blank"
              rel="noreferrer"
              className={`${BUTTON} border border-line hover:border-accent hover:text-accent`}
            >
              View the design in Figma ↗
            </a>
          )}
        </div>
      </header>

      {cs?.screenshots && cs.screenshots.length > 0 && <Screenshots shots={cs.screenshots} />}

      {cs?.designUrl && <FigmaEmbed url={cs.designUrl} title={project.title} />}

      {cs && layers.length > 0 ? (
        <div>
          <ArchitectureBar layers={layers} levels={levels} />
          {layers.map((layer, i) => (
            <LayerSection key={layer.name} layer={layer} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex max-w-170 flex-col gap-4">
          {project.body.split('\n\n').map((p, i) => (
            <p key={i} className="text-base leading-[1.7] text-muted">
              {p}
            </p>
          ))}
        </div>
      )}

      {cs && cs.results.length > 0 && (
        <section className={`${CARD} flex flex-col gap-4 p-6`}>
          <h2 className="text-xl font-semibold">Results</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cs.results.map((r) => (
              <li key={r} className="flex gap-3 text-muted">
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Neighbours slug={project.slug} />
    </article>
  )
}
