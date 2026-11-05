import type { ReactNode } from 'react'

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

function highlight(json: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of json.matchAll(TOKEN)) {
    const start = m.index ?? 0
    if (start > last) out.push(json.slice(last, start))
    const [text, str, colon, bool] = m
    if (str && colon) {
      out.push(
        <span key={key++} className="text-accent-light">
          {str}
        </span>,
        colon,
      )
    } else if (str) {
      out.push(
        <span key={key++} className="text-ink">
          {str}
        </span>,
      )
    } else if (bool) {
      out.push(
        <span key={key++} className="text-sky-300">
          {text}
        </span>,
      )
    } else if (text === 'null') {
      out.push(
        <span key={key++} className="text-muted italic">
          {text}
        </span>,
      )
    } else {
      out.push(
        <span key={key++} className="text-amber-300">
          {text}
        </span>,
      )
    }
    last = start + text.length
  }
  if (last < json.length) out.push(json.slice(last))
  return out
}

export function JsonView({ json, className = '' }: { json: string; className?: string }) {
  return (
    <pre className={`overflow-auto font-mono text-[13px] leading-[1.7] whitespace-pre text-muted ${className}`}>
      <code>{highlight(json)}</code>
    </pre>
  )
}
