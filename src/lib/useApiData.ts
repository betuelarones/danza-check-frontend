import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './apiClient'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

/**
 * Carga datos de la API con cancelacion al desmontar y recarga manual.
 * Pensado para las lecturas del panel y de la vista publica de asistencia.
 */
export function useApiData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {},
): AsyncState<T> & { reload: () => void } {
  const { enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<ApiError | null>(null)
  const [intento, setIntento] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    let vigente = true

    setLoading(true)
    setError(null)

    loadRef
      .current(controller.signal)
      .then((resultado) => {
        if (vigente) {
          setData(resultado)
          setError(null)
        }
      })
      .catch((fallo: unknown) => {
        if (!vigente || controller.signal.aborted) {
          return
        }
        setData(null)
        setError(
          fallo instanceof ApiError
            ? fallo
            : new ApiError(0, 'No se pudo conectar con el servidor.'),
        )
      })
      .finally(() => {
        if (vigente) {
          setLoading(false)
        }
      })

    return () => {
      vigente = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, intento])

  const reload = useCallback(() => setIntento((valor) => valor + 1), [])

  return { data, loading, error, reload }
}
