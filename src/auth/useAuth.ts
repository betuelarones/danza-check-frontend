import { useContext } from 'react'
import { AuthContext } from './AuthContext'

/** Acceso al estado de autenticacion del panel administrativo. */
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}
