export function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block size-[0.8em] -translate-y-px align-middle ${className}`}
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  )
}
