export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-[40px]">{title}</h1>
      {intro && <p className="max-w-155 text-[17px] leading-relaxed text-muted">{intro}</p>}
    </header>
  )
}
