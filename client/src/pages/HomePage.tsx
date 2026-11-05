import { Link } from 'react-router'
import { ProjectGrid } from '../Cards/ProjectCard'
import { AboutSection } from '../components/AboutSection'
import { ApiPreview } from '../components/ApiPreview'
import { HeroStack } from '../components/HeroStack'
import { LiveServedBy } from '../components/LiveServedBy'
import { RotatingWord } from '../components/RotatingWord'
import { SkillsSection } from '../components/SkillsSection'
import { StatusStrip } from '../components/StatusStrip'

const WORDS = ['APIs.', 'web apps.', 'systems.']

const BUTTON = 'inline-flex items-center rounded-lg px-5.5 py-3.5 text-[15px] transition-colors'

export function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="font-mono text-[13px] text-muted">Full Stack Developer · Cairo</span>
          <h1
            className="text-[40px] leading-[1.08] font-semibold tracking-tight sm:text-[56px]"
            aria-label="I build APIs, web apps and systems that run in production."
          >
            <span className="block" aria-hidden="true">
              <span className="whitespace-nowrap">
                I build <RotatingWord words={WORDS} />
              </span>
              <br />
              <span className="text-muted">that run in production.</span>
            </span>
          </h1>
          <LiveServedBy />
          <p className="max-w-120 text-lg leading-relaxed text-muted">
            From the database schema to the last pixel, tested, deployed and live. This page is served by an API I
            wrote, so go ahead and hit it.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/api-explorer" className={`${BUTTON} bg-accent font-semibold text-page hover:bg-accent-light`}>
              Try the API
            </Link>
            <a
              href="/Yousef_Emad_CV_Full_Stack.pdf"
              download
              className={`${BUTTON} border border-line hover:border-accent hover:text-accent`}
            >
              Download CV
            </a>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <HeroStack />
          <ApiPreview />
        </div>
      </section>

      <AboutSection />
      <ProjectGrid />
      <SkillsSection />
      <StatusStrip />
    </div>
  )
}
