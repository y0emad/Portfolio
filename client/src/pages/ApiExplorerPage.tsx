import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import axios from 'axios'
import { JsonView } from '../components/JsonView'
import { PageHeader } from '../components/PageHeader'
import { useProjects } from '../hooks/useProjects'
import { ENDPOINTS, METHOD_STYLE, type Endpoint } from '../lib/endpoints'

type Request = { endpoint: Endpoint; url: string; body?: string }
type Result = {
  request: Request
  status: number
  ms: number
  size: number
  json: string
  headers: [string, string][]
}

const STATUS_TEXT: Record<number, string> = {
  0: 'Network error',
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
}

const SHOWN_HEADERS = ['content-type', 'ratelimit', 'ratelimit-policy', 'content-length']

function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

function buildUrl(endpoint: Endpoint, slug: string, dryRun: boolean) {
  let url = endpoint.path.replace(':slug', encodeURIComponent(slug))
  if (endpoint.method === 'POST' && dryRun) url += '?dryRun=true'
  return url
}

async function run(request: Request): Promise<Result> {
  const start = performance.now()
  try {
    const res = await axios.request<string>({
      method: request.endpoint.method,
      url: request.url,
      data: request.body ? JSON.parse(request.body) : undefined,
      headers: request.body ? { 'Content-Type': 'application/json' } : undefined,
      transformResponse: (raw) => raw,
      responseType: 'text',
      validateStatus: () => true,
    })
    const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
    let json = text
    try {
      json = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      json = text
    }
    const headers = SHOWN_HEADERS.flatMap((h): [string, string][] => {
      const v = res.headers[h]
      return v ? [[h, String(v)]] : []
    })
    return {
      request,
      status: res.status,
      ms: Math.round(performance.now() - start),
      size: new Blob([text]).size,
      json,
      headers,
    }
  } catch {
    return {
      request,
      status: 0,
      ms: Math.round(performance.now() - start),
      size: 0,
      json: '{\n  "error": "Could not reach the server"\n}',
      headers: [],
    }
  }
}

function curlFor(request: Request) {
  const url = `${window.location.origin}${request.url}`
  if (request.endpoint.method === 'GET') return `curl "${url}"`
  const body = request.body ? JSON.stringify(JSON.parse(request.body)) : '{}'
  return `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${body.replace(/'/g, "'\\''")}'`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

export function ApiExplorerPage() {
  const [params, setParams] = useSearchParams()
  const { data: projects } = useProjects()

  const initial = ENDPOINTS.find((e) => e.id === params.get('endpoint')) ?? ENDPOINTS[0]
  const [selected, setSelected] = useState<Endpoint>(initial)
  const [slug, setSlug] = useState('clinicflow')
  const [dryRun, setDryRun] = useState(true)
  const [bodies, setBodies] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      ENDPOINTS.filter((e) => e.defaultBody).map((e) => [e.id, JSON.stringify(e.defaultBody, null, 2)]),
    ),
  )
  const [request, setRequest] = useState<Request | null>(() =>
    initial.method === 'GET' ? { endpoint: initial, url: buildUrl(initial, 'clinicflow', true) } : null,
  )
  const [result, setResult] = useState<Result | null>(null)
  const [view, setView] = useState<'response' | 'curl'>('response')

  const body = bodies[selected.id]
  const bodyError = useMemo(() => {
    if (body === undefined) return null
    try {
      JSON.parse(body)
      return null
    } catch {
      return 'The body is not valid JSON'
    }
  }, [body])

  const sending = request !== null && result?.request !== request

  useEffect(() => {
    if (!request) return
    let alive = true
    run(request).then((r) => alive && setResult(r))
    return () => {
      alive = false
    }
  }, [request])

  function send(endpoint = selected, nextSlug = slug) {
    if (endpoint.method === 'POST' && bodyError) return
    setRequest({
      endpoint,
      url: buildUrl(endpoint, nextSlug, dryRun),
      body: endpoint.method === 'POST' ? bodies[endpoint.id] : undefined,
    })
  }

  function select(endpoint: Endpoint) {
    setSelected(endpoint)
    setParams({ endpoint: endpoint.id }, { replace: true })
    if (endpoint.method === 'GET') send(endpoint)
  }

  const slugOptions = [...(projects?.map((p) => p.slug) ?? ['clinicflow']), 'not-a-real-project']
  const shown = result && result.request.endpoint.id === selected.id ? result : null
  const ok = shown ? shown.status >= 200 && shown.status < 300 : false

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="API explorer"
        intro="Pick an endpoint, send the request, and see the real response from my server."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label="Endpoints" className="overflow-hidden rounded-xl border border-line bg-surface">
          <ul className="grid grid-cols-2 gap-px bg-line lg:grid-cols-1">
            {ENDPOINTS.map((e) => {
              const active = e.id === selected.id
              return (
                <li key={e.id} className="bg-surface">
                  <button
                    type="button"
                    onClick={() => select(e)}
                    aria-current={active ? 'true' : undefined}
                    className={`flex h-full w-full flex-col gap-1 px-3 py-3 text-left transition-colors lg:px-4 lg:py-3.5 ${
                      active ? 'bg-line' : 'hover:bg-line/50'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2 font-mono text-xs lg:gap-2.5 lg:text-[13px]">
                      <span className={`w-9 shrink-0 text-xs lg:w-10 lg:text-[13px] ${METHOD_STYLE[e.method]}`}>
                        {e.method}
                      </span>
                      <span className="truncate">{e.path}</span>
                    </span>
                    <span className="hidden pl-12.5 text-xs text-muted lg:block">{e.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <section className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-line bg-page px-3.5 py-2.5 font-mono text-[13px]">
                <span className={`shrink-0 font-semibold ${METHOD_STYLE[selected.method]}`}>{selected.method}</span>
                <span className="truncate">
                  {selected.slugParam ? (
                    <>
                      /api/projects/
                      <select
                        aria-label="Project slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value)
                          send(selected, e.target.value)
                        }}
                        className="rounded border border-line bg-surface px-1.5 py-0.5 text-accent-light focus:border-accent focus:outline-none"
                      >
                        {slugOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    buildUrl(selected, slug, dryRun)
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => send()}
                disabled={sending || (selected.method === 'POST' && !!bodyError)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 font-semibold text-page transition-colors hover:bg-accent-light disabled:opacity-60"
              >
                {sending && (
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-page/30 border-t-page"
                    aria-hidden="true"
                  />
                )}
                {sending ? 'Sending' : 'Send'}
              </button>
            </div>

            <p className="text-sm leading-relaxed text-muted">{selected.description}</p>

            {selected.method === 'POST' && body !== undefined && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="request-body" className="font-mono text-xs text-muted uppercase">
                    Request body
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    Dry run <span className="text-muted">(validate only, nothing is saved or emailed)</span>
                  </label>
                </div>
                <textarea
                  id="request-body"
                  rows={6}
                  spellCheck={false}
                  value={body}
                  onChange={(e) => setBodies((b) => ({ ...b, [selected.id]: e.target.value }))}
                  aria-invalid={!!bodyError}
                  className="w-full resize-y rounded-lg border border-line bg-page p-3.5 font-mono text-[13px] leading-[1.7] text-ink focus:border-accent focus:outline-none aria-[invalid=true]:border-danger-line"
                />
                {bodyError && <p className="text-sm text-danger">{bodyError}</p>}
                {!dryRun && (
                  <p className="text-sm text-warn">
                    This will save a real message and send me an email. Try breaking the body too: an empty name or a
                    bad email gets a 400 with the reason.
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            className="overflow-hidden rounded-xl border border-line bg-surface"
            aria-live="polite"
            aria-busy={sending}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
              <div className="flex items-center gap-1 rounded-lg bg-page p-1 font-mono text-xs">
                {(['response', 'curl'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`rounded-md px-3 py-1.5 transition-colors ${view === v ? 'bg-line text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    {v === 'response' ? 'Response' : 'curl'}
                  </button>
                ))}
              </div>
              {shown && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className={ok ? 'text-accent' : 'text-danger'}>
                    ● {shown.status} {STATUS_TEXT[shown.status] ?? ''}
                  </span>
                  <span className="text-muted">{shown.ms} ms</span>
                  <span className="text-muted">{formatSize(shown.size)}</span>
                </div>
              )}
            </div>

            <div className={`relative transition-opacity ${sending ? 'opacity-50' : ''}`}>
              {view === 'curl' ? (
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex justify-end">
                    <CopyButton text={curlFor({ endpoint: selected, url: buildUrl(selected, slug, dryRun), body })} />
                  </div>
                  <pre className="overflow-auto font-mono text-[13px] leading-[1.7] whitespace-pre text-ink">
                    {curlFor({ endpoint: selected, url: buildUrl(selected, slug, dryRun), body })}
                  </pre>
                </div>
              ) : shown ? (
                <div className="flex flex-col">
                  {shown.headers.length > 0 && (
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-line px-5 py-3 font-mono text-xs">
                      {shown.headers.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-muted">{k}</dt>
                          <dd className="truncate text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="flex justify-end px-5 pt-3">
                    <CopyButton text={shown.json} />
                  </div>
                  <JsonView json={shown.json} className="max-h-[560px] px-5 pt-2 pb-5" />
                </div>
              ) : (
                <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center">
                  {sending ? (
                    <span className="font-mono text-sm text-muted">Waiting for the server…</span>
                  ) : (
                    <>
                      <span className="font-mono text-sm text-muted">No response yet.</span>
                      <span className="text-sm text-muted">Press Send to call the real API.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
