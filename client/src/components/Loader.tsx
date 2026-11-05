import { useEffect, useState } from 'react'

const LINES = [
  { text: '$ boot yousef.dev' },
  { text: 'connecting to api ........', ok: true },
  { text: 'loading projects .........', ok: true },
  { text: 'compiling interface ......', ok: true },
  { text: 'GET / → 200 OK', final: true },
]

const LINE_MS = 240
const FADE_MS = 400

export function Loader({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }
    if (shown < LINES.length) {
      const t = setTimeout(() => setShown((n) => n + 1), LINE_MS)
      return () => clearTimeout(t)
    }
    const t1 = setTimeout(() => setLeaving(true), 300)
    const t2 = setTimeout(onDone, 300 + FADE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [shown, onDone])

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-50 grid place-items-center bg-page transition-opacity duration-400 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-[min(420px,90vw)] font-mono text-sm">
        <div className="mb-4 flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </div>

        <ul className="space-y-1.5">
          {LINES.slice(0, shown).map((line, i) => (
            <li key={i} className={line.final ? 'text-accent' : i === 0 ? 'text-ink' : 'text-muted'}>
              {line.text}
              {line.ok && <span className="text-accent"> ok</span>}
            </li>
          ))}
          {shown < LINES.length && (
            <li className="text-accent">
              <span className="animate-pulse">▍</span>
            </li>
          )}
        </ul>

        <div className="mt-6 h-1 overflow-hidden rounded bg-surface">
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${(shown / LINES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
