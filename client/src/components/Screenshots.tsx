import { useEffect, useState } from 'react'
import type { Screenshot } from '../types'

function Lightbox({ shot, onClose }: { shot: Screenshot; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-page/95 p-4 backdrop-blur-sm sm:p-10"
    >
      <img
        src={shot.src}
        alt={shot.alt}
        className={`max-h-[82vh] max-w-full rounded-lg border border-line object-contain ${shot.mobile ? 'w-auto' : ''}`}
      />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{shot.caption}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export function Screenshots({ shots }: { shots: Screenshot[] }) {
  const [open, setOpen] = useState<Screenshot | null>(null)
  const wide = shots.filter((s) => !s.mobile)
  const phone = shots.find((s) => s.mobile)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Screenshots</h2>
        <span className="font-mono text-xs text-muted">Click to enlarge</span>
      </div>

      <div className={`grid gap-4 ${phone ? 'lg:grid-cols-[minmax(0,1fr)_220px]' : ''}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {wide.map((shot, i) => (
            <figure key={shot.src} className={`flex flex-col gap-2 ${i === 0 ? 'sm:col-span-2' : ''}`}>
              <button
                type="button"
                onClick={() => setOpen(shot)}
                className="group overflow-hidden rounded-xl border border-line bg-page transition-colors hover:border-accent"
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className={`block w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none ${
                    i === 0 ? 'aspect-[16/9]' : 'aspect-[16/10]'
                  }`}
                />
              </button>
              <figcaption className="font-mono text-xs text-muted">{shot.caption}</figcaption>
            </figure>
          ))}
        </div>

        {phone && (
          <figure className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOpen(phone)}
              className="group mx-auto w-full max-w-[220px] overflow-hidden rounded-[28px] border-4 border-line bg-page transition-colors hover:border-accent"
            >
              <img
                src={phone.src}
                alt={phone.alt}
                loading="lazy"
                className="block aspect-[9/19] w-full object-cover object-top"
              />
            </button>
            <figcaption className="text-center font-mono text-xs text-muted">{phone.caption}</figcaption>
          </figure>
        )}
      </div>

      {open && <Lightbox shot={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
