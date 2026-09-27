import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Aplica el relleno estandar de la tarjeta. */
  conRelleno?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}

export function Card({
  children,
  className = '',
  conRelleno = true,
  as: Elemento = 'div',
}: CardProps) {
  return (
    <Elemento
      className={`rounded-lg border border-ink-200 bg-surface shadow-soft ${
        conRelleno ? 'p-4 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </Elemento>
  )
}

export function CardHeader({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: ReactNode
  descripcion?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4 max-sm:flex-col">
      <div>
        <h2 className="text-lg text-ink-900">{titulo}</h2>
        {descripcion ? (
          <p className="mt-1 max-w-[52ch] text-sm text-ink-500">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </header>
  )
}
