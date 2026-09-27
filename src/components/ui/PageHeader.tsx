import type { ReactNode } from 'react'

/** Cabecera de pagina con descripcion y acciones. */
export function PageHeader({
  titulo,
  descripcion,
  acciones,
  children,
}: {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
      <div className="min-w-0">
        <h1 className="text-3xl text-ink-900">{titulo}</h1>
        {descripcion ? (
          <p className="mt-1.5 max-w-[62ch] text-sm text-ink-500">{descripcion}</p>
        ) : null}
        {children}
      </div>
      {acciones ? (
        <div className="flex flex-wrap items-center gap-2.5 max-sm:w-full">{acciones}</div>
      ) : null}
    </div>
  )
}
