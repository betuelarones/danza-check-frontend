import type { ReactNode } from 'react'

type Tono = 'error' | 'exito' | 'info'

const TONOS: Record<Tono, string> = {
  error: 'bg-danger-soft border-danger-border text-danger',
  exito: 'bg-success-soft border-success-border text-success',
  info: 'bg-brand-50 border-brand-200 text-brand-800',
}

/** Mensaje de estado con icono; los errores se anuncian con role="alert". */
export function Alert({
  tono,
  titulo,
  children,
}: {
  tono: Tono
  titulo?: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 text-sm ${TONOS[tono]}`}
      role={tono === 'error' ? 'alert' : 'status'}
    >
      <span
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-current text-xs font-extrabold text-white"
        aria-hidden="true"
      >
        {tono === 'error' ? '!' : tono === 'exito' ? '✓' : 'i'}
      </span>
      <div className="[&_p]:text-inherit">
        {titulo ? <strong className="mb-0.5 block">{titulo}</strong> : null}
        <p>{children}</p>
      </div>
    </div>
  )
}
