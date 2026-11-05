const FACTS = [
  { label: 'Based in', value: 'Cairo, Egypt' },
  { label: 'Education', value: 'B.Sc. Computers & AI, Helwan University (2024)' },
  { label: 'Focus', value: 'React · Node.js · TypeScript · PostgreSQL' },
  { label: 'Languages', value: 'Arabic, English' },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/y0emad' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yousef-emad-702a64309' },
  { label: 'Email', href: 'mailto:y.emad85@yahoo.com' },
]

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <img
            src="/yousef.jpg"
            alt="Yousef Emad"
            width={80}
            height={80}
            className="size-16 shrink-0 rounded-2xl border border-accent/60 object-cover shadow-[0_0_0_4px_rgb(16_185_129/0.15)] sm:size-20"
          />
          <div className="flex flex-col gap-1">
            <h2 id="about-title" className="text-2xl font-semibold">
              Yousef Emad
            </h2>
            <span className="font-mono text-xs text-muted">Full Stack Developer</span>
          </div>
          <span className="ml-auto hidden items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent sm:flex">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Open to work
          </span>
        </div>

        <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted">
          <p>
            I build web apps end to end: React on the front, Node.js, Express and TypeScript on the back, and PostgreSQL
            underneath. I care most about the parts users never see but always feel, like a booking that can't be taken
            twice or a page that loads before you notice.
          </p>
          <p>
            My latest project, <span className="text-ink">ClinicFlow</span>, runs in production on AWS with tests, CI/CD
            and HTTPS. I like taking a feature from a Figma design all the way to a tested, deployed API.
          </p>
        </div>

        <span className="flex w-fit items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent sm:hidden">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          Open to work
        </span>

        <div className="flex flex-wrap gap-2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="rounded-lg border border-line px-3.5 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-6">
        {FACTS.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 py-4">
            <dt className="font-mono text-xs text-muted">{f.label}</dt>
            <dd className="text-[15px]">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
