import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { IconoBailarina } from '../../components/ui/icons'

export function NotFoundPage() {
  const navegar = useNavigate()

  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-bold text-brand-300 tabular-nums">404</p>
        <span className="mx-auto my-4 grid size-11 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <IconoBailarina width={24} height={24} />
        </span>
        <h1 className="text-2xl text-ink-900">Esta pagina no existe</h1>
        <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-500">
          Quiza el enlace del QR estaba incompleto. Vuelve al inicio y busca tu
          ensayo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-sm bg-brand-500 px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-600"
          >
            Ir al inicio
          </Link>
          <Button variante="secundario" onClick={() => navegar(-1)}>
            Volver atras
          </Button>
        </div>
      </div>
    </div>
  )
}
