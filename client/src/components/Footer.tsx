import { Link } from 'react-router'
import { useHealth } from '../hooks/useHealth'

const PAGES = [
  { to: '/', label: 'Projects' },
  { to: '/api-explorer', label: 'API explorer' },
  { to: '/status', label: 'Status' },
  { to: '/contact', label: 'Contact' },
]

const ELSEWHERE = [
  { href: 'https://github.com/y0emad', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/yousef-emad-702a64309', label: 'LinkedIn' },
  { href: 'mailto:y.emad85@yahoo.com', label: 'Email' },
  { href: '/Yousef_Emad_CV_Full_Stack.pdf', label: 'CV (PDF)' },
]

const SOURCE_URL = 'https://github.com/y0emad/Portfolio'
const YEAR = new Date().getFullYear()

function ApiDot() {
  const { data, isPending, isError } = useHealth()
  const ok = !isError && data?.status === 'ok'
  const color = isPending ? 'bg-muted' : ok ? 'bg-accent' : 'bg-danger'
  return (
    <Link to="/status" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
      <span className={`size-1.5 rounded-full ${color}`} aria-hidden="true" />
      {isPending ? 'checking the API…' : ok ? 'All systems normal' : 'API having trouble'}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-280 gap-10 px-5 py-12 sm:px-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <Link to="/" className="w-fit font-mono text-[15px] text-accent">
            yousef.dev
          </Link>
          <p className="max-w-80 text-sm leading-relaxed text-muted">
            Built with React, Express and PostgreSQL. Every page here is served by an API I wrote.
          </p>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="w-fit font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            View this site's source ↗
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <span className="font-mono text-xs text-muted uppercase">Pages</span>
          {PAGES.map((p) => (
            <Link key={p.to} to={p.to} className="w-fit text-sm transition-colors hover:text-accent">
              {p.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-muted uppercase">Elsewhere</span>
          {ELSEWHERE.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              download={l.href.endsWith('.pdf') ? true : undefined}
              className="w-fit text-sm transition-colors hover:text-accent"
            >
              {l.label}
              {l.href.startsWith('http') && ' ↗'}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-3 px-5 py-5 font-mono text-xs text-muted sm:px-8">
          <span>© {YEAR} Yousef Emad</span>
          <ApiDot />
        </div>
      </div>
    </footer>
  )
}
