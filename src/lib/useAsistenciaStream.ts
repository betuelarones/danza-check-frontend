/**
 * Hook que mantiene abierto el stream de asistencias de una sesion.
 *
 * A diferencia de useApiData, este hook no corta y vuelve a pedir la
 * lista: se queda escuchando y entrega cada cambio por separado. Eso
 * evita el polling y, sobre todo, que aparezca un spinner en mitad de
 * un ensayo.

 *
 * Tambien reconecta solo. Entre el navegador, Render y cualquier proxy
 * hay varios puntos donde una conexion larga se puede caer, y sin
 * reconexion el panel se quedaria congelado mostrando datos viejos sin
 * avisar de nada.
 */

import { useEffect, useRef, useState } from 'react'
import { ApiError } from './apiClient'
import { suscribirStreamAsistencias } from './sseClient'
import type { StreamAsistenciasHandlers } from './sseClient'

/** Espera antes de reintentar tras una caida. */
const ESPERA_RECONEXION_MS = 3000

/** Maximo de reintentos seguidos antes de dejar de insistir. */
const MAX_INTENTOS = 20

export interface EstadoStream {
  /** true mientras la conexion esta abierta. */
  conectado: boolean
  /** Ultimo fallo, para avisar sin tapar la pantalla. */
  error: ApiError | null
}

/**
 * @param idSesion sesion a escuchar, o null para no suscribirse
 * @param handlers aviso de cada evento
 * @param activo permite cortar el stream (por ejemplo al perder la sesion)
 */
export function useAsistenciaStream(
  idSesion: number | null,
  handlers: StreamAsistenciasHandlers,
  activo = true,
): EstadoStream {
  const [conectado, setConectado] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  // Los handlers se guardan en un ref para no reiniciar la conexion
  // cada vez que la pagina crea funciones nuevas en cada render.
  const handlersRef = useRef(handlers)

  // Se actualiza despues de cada render, antes de que corran los
  // efectos siguientes, para que la conexion use siempre los handlers
  // mas recientes sin depender de ellos.
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (idSesion === null || !activo) {
      return
    }

    const controller = new AbortController()
    let vigente = true
    let timer: number | undefined
    let intentos = 0

    const conectar = async () => {
      try {
        await suscribirStreamAsistencias(
          idSesion,
          {
            onConectado: (datos) => {
              intentos = 0
              setConectado(true)
              setError(null)
              handlersRef.current.onConectado?.(datos)
            },
            onAsistenciaRegistrada: (datos) => handlersRef.current.onAsistenciaRegistrada?.(datos),
            onSesionCerrada: (datos) => handlersRef.current.onSesionCerrada?.(datos),
            onError: (fallo) => setError(fallo),
          },
          controller.signal,
        )
        // El servidor cerro la conexion sin error (por ejemplo, al
        // cerrarse la sesion). No se reintenta: reconectar a un stream
        // que ya no emite seria futile.
        if (vigente) {
          setConectado(false)
        }
      } catch (fallo) {
        if (!vigente || controller.signal.aborted) {
          return
        }
        setConectado(false)
        setError(
          fallo instanceof ApiError
            ? fallo
            : new ApiError(0, 'Se perdió la conexión con el stream de asistencias.'),
        )
        // Un 401 no se reintenta: el token no va a volver a ser valido
        // solo esperando, y el panel ya se esta cerrando.
        if (fallo instanceof ApiError && fallo.status === 401) {
          return
        }
        intentos += 1
        if (intentos > MAX_INTENTOS) {
          setError(
            new ApiError(0, 'Se perdió la conexión con el stream. Recarga la página para reintentarlo.'),
          )
          return
        }
        timer = window.setTimeout(() => {
          if (vigente) {
            void conectar()
          }
        }, ESPERA_RECONEXION_MS)
      }
    }

    void conectar()

    return () => {
      vigente = false
      controller.abort()
      if (timer !== undefined) {
        window.clearTimeout(timer)
      }
      setConectado(false)
    }
  }, [idSesion, activo])

  return { conectado, error }
}
