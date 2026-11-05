type LogoMorphProps = { className?: string }

export function LogoMorph({ className = 'size-16' }: LogoMorphProps) {
  const morph =
    '[transform-box:fill-box] origin-center transition-all duration-500 ease-out motion-reduce:transition-none'
  const layer = `${morph} fill-accent stroke-page stroke-2 [vector-effect:non-scaling-stroke]`

  return (
    <span className={`group inline-block rounded-[22%] bg-page ${className}`}>
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
        <path
          d="M15 10 32 29 49 10"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${morph} stroke-ink group-hover:opacity-0 group-hover:[transform:translateY(-12px)_scale(.5)]`}
        />

        <path
          d="M32 50 43 55 32 60 21 55Z"
          fillOpacity=".35"
          className={`${layer} delay-150 group-hover:[transform:translateY(-9px)_scale(2,2.4)]`}
        />

        <path
          d="M32 43 43 48 32 53 21 48Z"
          fillOpacity=".65"
          className={`${layer} delay-75 group-hover:[transform:translateY(-14px)_scale(2,2.4)]`}
        />

        <path
          d="M32 36 43 41 32 46 21 41Z"
          className={`${layer} group-hover:[transform:translateY(-19px)_scale(2,2.4)]`}
        />
      </svg>
    </span>
  )
}
