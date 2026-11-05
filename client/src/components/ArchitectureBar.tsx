import { layerId } from '../lib/caseStudy'
import type { CaseStudyLayer } from '../types'

export function ArchitectureBar({ layers, levels }: { layers: CaseStudyLayer[]; levels: number[] }) {
  const level = (i: number) => levels[i] ?? (i === 0 ? 1 : 0)
  const active = layers.reduce((best, _, i) => (level(i) > level(best) ? i : best), 0)

  function go(index: number) {
    document.getElementById(layerId(index))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Architecture"
      className="sticky top-[73px] z-30 -mx-5 border-b border-line bg-page px-5 py-3 sm:-mx-8 sm:px-8"
    >
      <ol className="flex items-stretch gap-1.5 md:gap-2">
        {layers.map((layer, i) => {
          const glow = level(i)
          const reached = Math.max(...layers.map((_, j) => (j >= i ? level(j) : 0)))
          return (
            <li key={layer.name} className="flex min-w-0 flex-1 items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="relative hidden text-lg md:block">
                  <span className="text-line">→</span>
                  <span className="absolute inset-0 text-accent" style={{ opacity: reached }}>
                    →
                  </span>
                </span>
              )}
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === active ? 'step' : undefined}
                className="relative flex w-full min-w-0 flex-col items-center gap-1 rounded-[10px] border border-line bg-surface px-2 py-2.5 text-left transition-colors hover:border-muted/40 md:items-start md:px-3.5 md:py-3"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-[10px] border border-accent bg-line shadow-[0_0_0_4px_rgb(16_185_129/0.18)]"
                  style={{ opacity: glow }}
                />
                <span className="relative max-w-full truncate text-[13px] font-semibold md:text-[15px]">
                  {layer.name}
                </span>
                <span className="relative hidden max-w-full truncate font-mono text-xs text-muted md:block">
                  {layer.tech}
                </span>
                <span
                  className="relative hidden font-mono text-[11px] text-accent md:block"
                  style={{ opacity: glow, transform: `translateY(${(1 - glow) * 3}px)` }}
                >
                  ● you are here
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
