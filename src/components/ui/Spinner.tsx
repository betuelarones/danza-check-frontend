export function Spinner({ etiqueta = 'Cargando' }: { etiqueta?: string }) {
  return (
    <div className="grid place-items-center py-10" role="status">
      <span
        className="size-8 animate-giro rounded-full border-[3px] border-brand-100 border-t-brand-500"
        aria-hidden="true"
      />
      <span className="sr-only">{etiqueta}</span>
    </div>
  )
}

export function SkeletonLine({ ancho = '100%' }: { ancho?: string }) {
  return (
    <span
      className="block h-3.5 animate-brillo rounded-full bg-[linear-gradient(90deg,var(--color-ink-100)_25%,var(--color-ink-200)_37%,var(--color-ink-100)_63%)] bg-[length:400%_100%]"
      style={{ width: ancho }}
      aria-hidden="true"
    />
  )
}
