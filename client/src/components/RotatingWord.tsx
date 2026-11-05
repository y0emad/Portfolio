import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const HOLD_MS = 3800
const ENTER_DELAY_MS = 350
const CHAR_STAGGER_MS = 40

export function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [width, setWidth] = useState<number>()
  const refs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), HOLD_MS)
    return () => clearInterval(id)
  }, [words.length])

  useLayoutEffect(() => {
    const el = refs.current[index]
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  const prev = (index - 1 + words.length) % words.length

  return (
    <span
      className="relative inline-block whitespace-nowrap text-accent transition-[width] duration-800 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
      style={{ width }}
      aria-hidden="true"
    >
      <span className="invisible">{' '}</span>
      {words.map((word, w) => {
        const state = w === index ? 'in' : w === prev ? 'out' : 'idle'
        return (
          <span
            key={word}
            ref={(el) => {
              refs.current[w] = el
            }}
            className={`left-0 top-0 ${width === undefined && w === index ? 'relative' : 'absolute'} ${
              state === 'idle' ? 'invisible' : ''
            }`}
          >
            {[...word].map((char, i) => (
              <span
                key={i}
                className={`inline-block ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  state === 'in'
                    ? 'translate-y-0 opacity-100 blur-none duration-1000'
                    : state === 'out'
                      ? '-translate-y-[0.12em] opacity-0 blur-[3px] duration-600'
                      : 'translate-y-[0.18em] opacity-0 blur-[6px] duration-0'
                } transition-[transform,opacity,filter]`}
                style={{
                  transitionDelay: state === 'in' ? `${ENTER_DELAY_MS + i * CHAR_STAGGER_MS}ms` : '0ms',
                }}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </span>
        )
      })}
    </span>
  )
}
