import type { ReactNode } from 'react'

type Tono = 'exito' | 'neutro' | 'alerta' | 'info'

const TONOS: Record<Tono, string> = {
  exito: 'bg-success-soft border-success-border text-success',
  neutro: 'bg-ink-100 border-ink-200 text-ink-600',
  alerta: 'bg-warning-soft border-warning-border text-warning',
  info: 'bg-brand-50 border-brand-200 text-brand-600',
}

export function Badge({
  children,
  tono = 'neutro',
  punto = false,
}: {
  children: ReactNode
  tono?: Tono
  punto?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-xs font-semibold tracking-[0.02em] whitespace-nowrap ${TONOS[tono]}`}
    >
      {punto ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}

/** Codigo de sesion en monoespaciada, pensado para leerse o dictarse. */
export function CodigoSesion({ codigo }: { codigo: string }) {
  return (
    <span className="rounded-sm border border-dashed border-brand-200 bg-brand-50 py-0.5 pr-2 pl-2.5 font-mono text-sm font-bold tracking-[0.18em] text-brand-800">
      {codigo}
    </span>
  )
}
