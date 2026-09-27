import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { Spinner } from '../components/ui/Spinner'

/**
 * Solo deja pasar a las rutas del panel a quien tenga token valido.
 * Recuerda donde estaba el usuario para devolverlo tras entrar.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, initializing } = useAuth()
  const ubicacion = useLocation()

  if (initializing) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner etiqueta="Comprobando sesion" />
      </div>
    )
  }

  if (!admin) {
    return (
      <Navigate to="/entrar" replace state={{ from: { pathname: ubicacion.pathname } }} />
    )
  }

  return <>{children}</>
}
