import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  ayuda?: string
  adorno?: ReactNode
  accion?: ReactNode
}

/** Campo de formulario con etiqueta, ayuda y mensaje de error accesible. */
export function TextField({
  label,
  error,
  ayuda,
  adorno,
  accion,
  className = '',
  ...resto
}: TextFieldProps) {
  const id = useId()
  const idError = `${id}-error`
  const idAyuda = `${id}-ayuda`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-700">
        {label}
      </label>

      <div
        className={`flex items-center gap-2 rounded-md border bg-surface px-3.5 transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_var(--color-brand-100)] ${
          error ? 'border-danger-border focus-within:border-danger focus-within:shadow-[0_0_0_3px_var(--color-danger-soft)]' : 'border-ink-200'
        }`}
      >
        <input
          id={id}
          className={`min-w-0 flex-1 border-none bg-transparent py-2.5 text-ink-900 outline-none placeholder:text-ink-400 ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
          {...resto}
        />
        {adorno ? (
          <span className="font-mono text-sm tracking-[0.12em] text-ink-400 uppercase">
            {adorno}
          </span>
        ) : null}
        {accion}
      </div>

      {error ? (
        <p id={idError} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idAyuda} className="text-xs text-ink-400">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
