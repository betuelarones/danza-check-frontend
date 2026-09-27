import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro'

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-brand-500 text-white border-brand-600 hover:bg-brand-600 hover:border-brand-700 active:bg-brand-700',
  secundario:
    'bg-surface text-brand-800 border-ink-300 hover:bg-brand-50 hover:border-brand-300',
  fantasma: 'bg-transparent text-ink-600 hover:bg-brand-50 hover:text-brand-800',
  peligro: 'bg-surface text-danger border-danger-border hover:bg-danger-soft',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  icono?: ReactNode
}

export function Button({
  variante = 'primario',
  cargando = false,
  icono,
  children,
  className = '',
  type = 'button',
  disabled,
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-semibold tracking-[0.01em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 ${VARIANTES[variante]} ${className}`}
      disabled={disabled || cargando}
      {...resto}
    >
      {cargando ? (
        <span
          className="size-3.5 animate-giro rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : (
        icono
      )}
      <span>{children}</span>
    </button>
  )
}
