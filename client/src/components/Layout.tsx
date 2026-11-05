import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Footer } from './Footer'
import { LogoMorph } from './logoMorph'

const LINKS = [
  { to: '/', label: 'Projects' },
  { to: '/api-explorer', label: 'API explorer' },
  { to: '/status', label: 'Status' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-ink'}`

function MenuIcon({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-0.5 w-5 rounded bg-current transition-transform duration-200'
  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <span className={`${bar} top-0 ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
      <span className={`${bar} top-1.5 ${open ? 'scale-x-0' : ''}`} />
      <span className={`${bar} top-3 ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
    </span>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof next === 'function' ? next(open) : next) ? pathname : null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-transparent bg-page/80 backdrop-blur-md supports-[backdrop-filter]:bg-page/60">
        <nav className="mx-auto flex max-w-280 h-18 items-center justify-between gap-4 px-5 sm:px-8">
          <NavLink to="/" className="flex items-center gap-2 font-mono text-[15px] text-accent">
            <LogoMorph className="size-9 sm:size-10" />
            yousef.dev
          </NavLink>

          <div className="hidden gap-7 text-[15px] md:flex">
            {LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-11 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            <MenuIcon open={open} />
          </button>
        </nav>

        <div
          id="mobile-menu"
          className={`grid transition-[grid-template-rows] duration-200 md:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="mx-5 mb-4 flex flex-col rounded-xl border border-line bg-surface p-2">
              {LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  tabIndex={open ? 0 : -1}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-base transition-colors hover:bg-line/60 ${isActive ? 'text-accent' : 'text-ink'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-280 flex-1 px-5 pt-8 pb-16 sm:px-8 sm:pt-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
