import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { PageHeader } from '../components/PageHeader'
import { api, getErrorMessage } from '../lib/api'

const LIMITS = { name: [2, 100], email: [3, 255], body: [10, 2000] } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = keyof typeof LIMITS
type Values = Record<Field, string>
type Stage = 'idle' | 'sending' | 'validated' | 'saved' | 'notified' | 'failed'
type Result = { status: number; ms: number; msg: string; notified?: boolean }

const EMPTY: Values = { name: '', email: '', body: '' }

const LINKS = [
  { label: 'Email', value: 'y.emad85@yahoo.com', href: 'mailto:y.emad85@yahoo.com' },
  { label: 'LinkedIn', value: 'in/yousef-emad', href: 'https://www.linkedin.com/in/yousef-emad-702a64309' },
  { label: 'GitHub', value: 'y0emad', href: 'https://github.com/y0emad' },
]

function validate(v: Values): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  const name = v.name.trim()
  const body = v.body.trim()
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1]) {
    errors.name = 'Name must be between 2 and 100 characters'
  }
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Please provide a valid email address'
  if (body.length < LIMITS.body[0] || body.length > LIMITS.body[1]) {
    errors.body = 'Message must be between 10 and 2000 characters'
  }
  return errors
}

const INPUT =
  'w-full rounded-lg border bg-page px-3.5 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-danger-line'

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null
  return (
    <p id={id} className="text-sm text-danger">
      {text}
    </p>
  )
}

const STEPS: { key: Exclude<Stage, 'idle' | 'failed'>; text: string; code: string }[] = [
  { key: 'sending', text: 'Form posts to', code: 'POST /api/contact' },
  { key: 'validated', text: 'API validates the fields', code: 'express-validator' },
  { key: 'saved', text: 'Message saved in the', code: 'messages table' },
  { key: 'notified', text: 'I get an email notification via', code: 'Brevo' },
]

const ORDER: Stage[] = ['idle', 'sending', 'validated', 'saved', 'notified']

function Pipeline({ stage, failedAt, result }: { stage: Stage; failedAt: number | null; result: Result | null }) {
  const reached = stage === 'failed' ? (failedAt ?? 0) : ORDER.indexOf(stage)

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">What happens when you send</h2>
        {result && (
          <span className={`font-mono text-xs ${result.status < 400 ? 'text-accent' : 'text-danger'}`}>
            {result.status} · {result.ms} ms
          </span>
        )}
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const n = i + 1
          const failed = stage === 'failed' && failedAt === n
          const done = !failed && reached >= n
          const skipped = n === STEPS.length && stage === 'saved' && result?.notified === false
          const current = stage === 'sending' && n === 1
          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-500 ${
                failed
                  ? 'border-danger-line bg-danger-bg text-danger'
                  : skipped
                    ? 'border-dashed border-line text-muted'
                    : done
                      ? 'border-accent/50 bg-line/60 text-ink'
                      : 'border-line text-muted'
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px] ${
                  failed ? 'bg-danger text-page' : done ? 'bg-accent text-page' : 'bg-line text-muted'
                }`}
              >
                {failed ? '✕' : skipped ? '–' : done && !current ? '✓' : String(n).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                {step.text} <code className="font-mono text-xs text-accent">{step.code}</code>
              </span>
              {current && <span className="ml-auto size-2 animate-ping rounded-full bg-accent" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
      <p className="font-mono text-xs leading-relaxed text-muted">
        {stage === 'idle' && 'Each step lights up with the real response from the server.'}
        {stage === 'sending' && 'Waiting for the server…'}
        {stage === 'saved' &&
          (result?.notified === false
            ? 'Saved in the database. Email notifications are switched off right now.'
            : 'Saved in the database. Sending the notification…')}
        {stage === 'notified' && 'Done. The message is saved and I just got an email about it.'}
        {stage === 'failed' && result && `The server answered: ${result.msg}`}
      </p>
    </aside>
  )
}

export function ContactPage() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [website, setWebsite] = useState('')
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [stage, setStage] = useState<Stage>('idle')
  const [failedAt, setFailedAt] = useState<number | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const errors = validate(values)
  const show = (f: Field) => (touched[f] ? errors[f] : undefined)
  const sending = stage === 'sending' || stage === 'validated'

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, body: true })
    if (Object.keys(errors).length > 0) return

    setStage('sending')
    setFailedAt(null)
    setResult(null)
    const start = performance.now()
    try {
      const res = await api.post<{ msg: string; notified?: boolean }>('/contact', { ...values, website })
      const ms = Math.round(performance.now() - start)
      setResult({ status: res.status, ms, msg: res.data.msg, notified: res.data.notified })
      setStage('validated')
      setTimeout(() => setStage('saved'), 450)
      if (res.data.notified) setTimeout(() => setStage('notified'), 900)
    } catch (err) {
      const ms = Math.round(performance.now() - start)
      const status = axios.isAxiosError(err) ? (err.response?.status ?? 0) : 0
      setResult({ status, ms, msg: getErrorMessage(err) })
      setFailedAt(status === 400 ? 2 : status >= 500 ? 3 : 1)
      setStage('failed')
    }
  }

  function reset() {
    setValues(EMPTY)
    setTouched({})
    setStage('idle')
    setResult(null)
    setFailedAt(null)
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Contact"
        intro="Send a message. It goes straight to my API, gets validated and lands in my database."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {stage === 'saved' || stage === 'notified' ? (
          <div
            role="status"
            className="flex flex-col items-start gap-4 rounded-xl border border-accent/50 bg-surface p-6 sm:p-8"
          >
            <span className="grid size-11 place-items-center rounded-full bg-accent text-lg font-semibold text-page">
              ✓
            </span>
            <h2 className="text-2xl font-semibold">Message sent</h2>
            <p className="text-muted">
              Thanks, {values.name.trim().split(' ')[0]}. I read every message and will reply to{' '}
              <span className="text-ink">{values.email.trim()}</span>.
            </p>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-line px-4 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 sm:p-8"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                maxLength={LIMITS.name[1]}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                aria-invalid={!!show('name')}
                aria-describedby="name-error"
                className={`${INPUT} border-line`}
              />
              <FieldError id="name-error" text={show('name')} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                maxLength={LIMITS.email[1]}
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!show('email')}
                aria-describedby="email-error"
                className={`${INPUT} border-line`}
              />
              <FieldError id="email-error" text={show('email')} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="body" className="text-sm">
                  Message
                </label>
                <span
                  className={`font-mono text-xs ${values.body.trim().length > LIMITS.body[1] ? 'text-danger' : 'text-muted'}`}
                >
                  {values.body.trim().length} / {LIMITS.body[1]}
                </span>
              </div>
              <textarea
                id="body"
                rows={6}
                placeholder="Say hello, or tell me about the role"
                value={values.body}
                onChange={(e) => set('body', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, body: true }))}
                aria-invalid={!!show('body')}
                aria-describedby="body-error"
                className={`${INPUT} resize-y border-line`}
              />
              <FieldError id="body-error" text={show('body')} />
            </div>

            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {stage === 'failed' && result && (
              <p
                role="alert"
                className="rounded-lg border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
              >
                {result.msg}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-semibold text-page transition-colors hover:bg-accent-light disabled:opacity-60"
            >
              {sending && (
                <span
                  className="size-4 animate-spin rounded-full border-2 border-page/30 border-t-page"
                  aria-hidden="true"
                />
              )}
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-5">
          <Pipeline stage={stage} failedAt={failedAt} result={result} />

          <div className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-2">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-line/60"
              >
                <span className="text-sm text-muted">{l.label}</span>
                <span className="font-mono text-sm group-hover:text-accent">{l.value} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
