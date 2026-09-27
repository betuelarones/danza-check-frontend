import type { ReactNode } from 'react'

/** Estado vacio reutilizable: icono, mensaje y accion opcional. */
export function EmptyState({
  icono,
  titulo,
  descripcion,
  accion,
}: {
  icono?: ReactNode
  titulo: string
  descripcion?: string
  accion?: ReactNode
}) {
  return (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-brand-200 bg-brand-50 px-6 py-11 text-center">
      {icono ? (
        <div className="mb-1 text-brand-500" aria-hidden="true">
          {icono}
        </div>
      ) : null}
      <h3 className="text-base text-ink-800">{titulo}</h3>
      {descripcion ? (
        <p className="max-w-[44ch] text-sm text-ink-500">{descripcion}</p>
      ) : null}
      {accion ? <div className="mt-3">{accion}</div> : null}
    </div>
  )
}
