import { useEffect, useState } from 'react'
import { ArrowUpRight } from './ArrowUpRight'

const SLOW_MS = 12_000

const MOBILE_QUERY = '(max-width: 767px)'

const isPrototype = (url: string) => new URL(url).pathname.startsWith('/proto/')

function toEmbedUrl(url: string) {
  const u = new URL(url)
  u.hostname = 'embed.figma.com'
  u.searchParams.set('embed-host', 'share')
  if (isPrototype(url)) {
    u.searchParams.set('hide-ui', '1')
    u.searchParams.set('scaling', 'scale-down-width')
    u.searchParams.set('content-scaling', 'fixed')
    u.searchParams.set('theme', 'dark')
  }
  return u.toString()
}

function isMobile() {
  try {
    return window.matchMedia(MOBILE_QUERY).matches
  } catch {
    return false
  }
}

function MobileCard({ url, preview, title }: { url: string; preview?: string; title: string }) {
  const proto = isPrototype(url)
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent"
    >
      {preview ? (
        <img
          src={preview}
          alt={`${title} home screen`}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover object-top"
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-page" aria-hidden="true">
          <svg viewBox="0 0 38 57" className="h-16 w-auto">
            <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
            <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
            <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
            <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
            <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
          </svg>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3.5">
        <span className="text-sm">{proto ? 'Open the clickable prototype' : 'Open the design in Figma'}</span>
        <span className="text-accent">
          <ArrowUpRight />
        </span>
      </div>
    </a>
  )
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

export function FigmaEmbed({ url, title, preview }: { url: string; title: string; preview?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [mobile] = useState(isMobile)
  const proto = isPrototype(url)

  useEffect(() => {
    if (loaded || mobile) return
    const id = setTimeout(() => setSlow(true), SLOW_MS)
    return () => clearTimeout(id)
  }, [loaded, mobile])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{proto ? 'Try the prototype' : 'The design'}</h2>
        <span className="font-mono text-xs text-muted">
          {proto
            ? 'Clickable Figma prototype · starts on the home screen'
            : 'Live Figma file · drag to pan, scroll to zoom'}
        </span>
      </div>
      {mobile ? (
        <MobileCard url={url} preview={preview} title={title} />
      ) : (
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
      )}
    </section>
  )
}
