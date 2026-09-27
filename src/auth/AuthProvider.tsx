import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  ApiError,
  clearToken,
  getToken,
  onUnauthorized,
  setToken,
} from '../lib/apiClient'
import { login as loginRequest, logout as logoutRequest, obtenerAdministrador } from '../lib/danzaApi'
import type { AdminResponse } from '../types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminResponse | null>(null)
  // Si no hay token guardado no hay nada que comprobar: se inicializa ya
  // resuelto para no provocar un render extra en el efecto.
  const [initializing, setInitializing] = useState(() => getToken() !== null)

  const cerrarSesionLocal = useCallback(() => {
    clearToken()
    setAdmin(null)
  }, [])

  // Al arrancar, si hay token guardado, se confirma contra /api/auth/me.
  useEffect(() => {
    if (!getToken()) {
      return
    }

    const controller = new AbortController()
    obtenerAdministrador(controller.signal)
      .then(setAdmin)
      .catch((fallo: unknown) => {
        // Este abort lo dispara el cleanup de abajo, que corre en cada
        // montaje de StrictMode y tambien al desmontar. No dice nada sobre
        // el token, asi que acá no se toca la sesion: sin esta guarda el
        // refresh cerraba la sesion siempre.
        if (controller.signal.aborted) {
          return
        }
        // Solo un 401 real invalida el token. Un 5xx o un corte de red
        // dejan el token guardado para que el proximo refresh reintente.
        if (fallo instanceof ApiError && fallo.status === 401) {
          cerrarSesionLocal()
        }
      })
      .finally(() => {
        // El finally tambien corre para la peticion abortada. Si bajara
        // `initializing` ahi, ProtectedRoute mandaria al login antes de que
        // responda la peticion que si vale.
        if (!controller.signal.aborted) {
          setInitializing(false)
        }
      })

    return () => controller.abort()
  }, [cerrarSesionLocal])

  // Un 401 desde cualquier pagina significa que el token ya no sirve.
  useEffect(() => onUnauthorized(cerrarSesionLocal), [cerrarSesionLocal])

  const login = useCallback(async (username: string, password: string) => {
    const respuesta = await loginRequest({ username, password })
    setToken(respuesta.token)
    setAdmin({
      username: respuesta.username,
      rol: 'ADMIN',
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      cerrarSesionLocal()
    }
  }, [cerrarSesionLocal])

  const valor = useMemo<AuthContextValue>(
    () => ({ admin, initializing, login, logout }),
    [admin, initializing, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
