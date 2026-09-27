import type { ReactNode } from 'react'

/** Indicador destacado para el detalle de sesion. */
export function StatCard({
  etiqueta,
  valor,
  detalle,
  icono,
}: {
  etiqueta: string
  valor: ReactNode
  detalle?: string
  icono: ReactNode
}) {
  return (
          <div className="flex items-center gap-3.5 rounded-lg border border-ink-200 bg-surface px-4 py-4 shadow-xs">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"
        aria-hidden="true"
      >
        {icono}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.06em] text-ink-400 uppercase">
          {etiqueta}
        </p>
        <p className="text-xl font-bold text-ink-900 tabular-nums">{valor}</p>
        {detalle ? <p className="text-xs text-ink-500">{detalle}</p> : null}
      </div>
    </div>
  )
}
