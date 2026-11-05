import { useState } from 'react'
import { Link } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { api } from '../lib/api'
import type { Project, ProjectsResponse } from '../types'

type Result = { status: number; ms: number; projects: Project[] }

const PREVIEW_COUNT = 3

function preview(status: number, projects: Project[]) {
  const rows = projects.slice(0, PREVIEW_COUNT).map((p) => {
    const stack = p.skills
      .slice(0, 3)
      .map((s) => JSON.stringify(s))
      .join(', ')
    return `    { "slug": ${JSON.stringify(p.slug)}, "stack": [${stack}] }`
  })
  if (projects.length > PREVIEW_COUNT) rows.push(`    … ${projects.length - PREVIEW_COUNT} more`)
  return `{\n  "status": ${status},\n  "data": [\n${rows.join(',\n')}\n  ]\n}`
}

export function ApiPreview() {
  const { data: cached } = useProjects()
  const [result, setResult] = useState<Result | null>(null)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function send() {
    setSending(true)
    setFailed(false)
    const start = performance.now()
    try {
      const res = await api.get<ProjectsResponse>('/projects', { validateStatus: () => true })
      setResult({
        status: res.status,
        ms: Math.round(performance.now() - start),
        projects: res.data?.projects ?? [],
      })
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  const body = failed
    ? '{\n  "error": "Could not reach the server"\n}'
    : result
      ? preview(result.status, result.projects)
      : cached
        ? preview(200, cached)
        : '{\n  "status": 200,\n  "data": [ … ]\n}'

  return (
    <div id="api" className="panel-3d overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4.5 py-3.5 font-mono text-[13px]">
        <span>
          <span className="text-accent">GET</span> /api/projects
        </span>
        <div className="flex items-center gap-3">
          {result && (
            <span className={result.status < 400 ? 'text-accent' : 'text-danger'}>
              {result.status} · {result.ms} ms
            </span>
          )}
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="min-h-11 rounded-md bg-accent px-3.5 font-semibold text-page transition-colors hover:bg-accent-light disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Try it'}
          </button>
        </div>
      </div>
      <pre
        className={`max-h-64 overflow-auto p-4.5 font-mono text-[13px] leading-[1.7] transition-opacity ${
          sending ? 'opacity-50' : ''
        } ${failed ? 'text-danger' : 'text-muted'}`}
      >
        {body}
      </pre>
      <Link
        to="/api-explorer"
        className="block border-t border-line px-4.5 py-3 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        More endpoints in the API explorer →
      </Link>
    </div>
  )
}
