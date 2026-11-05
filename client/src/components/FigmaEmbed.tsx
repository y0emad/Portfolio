import { useEffect, useState } from 'react'
import { ArrowUpRight } from './ArrowUpRight'

const SLOW_MS = 12_000

function toEmbedUrl(url: string) {
  const u = new URL(url)
  u.hostname = 'embed.figma.com'
  u.searchParams.set('embed-host', 'share')
  return u.toString()
}

function FigmaLoader({ slow, url }: { slow: boolean; url: string }) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 text-center">
      <div className="relative size-12" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-line" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-medium">Loading the Figma file…</span>
        <span className="font-mono text-xs text-muted">
          {slow ? 'Taking longer than usual.' : 'Big design files can take a few seconds.'}
        </span>
      </div>
      {slow && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-line px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          Open it in Figma instead <ArrowUpRight />
        </a>
      )}
      <div className="flex w-56 flex-col gap-2 opacity-60" aria-hidden="true">
        <div className="h-2 w-full animate-pulse rounded bg-line" />
        <div className="h-2 w-4/5 animate-pulse rounded bg-line [animation-delay:150ms]" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-line [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export function FigmaEmbed({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (loaded) return
    const id = setTimeout(() => setSlow(true), SLOW_MS)
    return () => clearTimeout(id)
  }, [loaded])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">The design</h2>
        <span className="font-mono text-xs text-muted">Live Figma file · drag to pan, scroll to zoom</span>
      </div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface sm:aspect-video"
        aria-busy={!loaded}
      >
        <iframe
          src={toEmbedUrl(url)}
          title={`${title} design in Figma`}
          loading="lazy"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 size-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          role="status"
          className={`absolute inset-0 grid place-items-center bg-surface transition-opacity duration-500 ${
            loaded ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <FigmaLoader slow={slow} url={url} />
        </div>
      </div>
    </section>
  )
}
