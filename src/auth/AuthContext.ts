import { createContext } from 'react'
import type { AdminResponse } from '../types/api'

export interface AuthContextValue {
  /** true mientras se consulta /api/auth/me al arrancar. */
  initializing: boolean
  /** Administrador autenticado, o null si no hay sesion. */
  admin: AdminResponse | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
