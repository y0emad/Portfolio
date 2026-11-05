const LAYERS = ['DB · PostgreSQL', 'API · Express', 'UI · React']

export function HeroStack() {
  return (
    <div className="stack-scene" aria-hidden="true">
      <div className="stack">
        {LAYERS.map((label, i) => (
          <div key={label} className="stack-plate" style={{ '--i': i } as React.CSSProperties}>
            <span>{label}</span>
          </div>
        ))}
        <i className="stack-packet" />
      </div>
    </div>
  )
}
