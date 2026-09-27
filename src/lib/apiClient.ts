/**
 * Cliente HTTP de la API.
 *
 * - Envuelve fetch y normaliza los errores del backend (ApiError).
 * - Guarda el token JWT en localStorage.
 * - Notifica a la app cuando la API responde 401 para que la sesion del
 *   panel pueda cerrarse sola sin repetir el control en cada pagina.
 */

import type { ApiErrorBody } from '../types/api'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const TOKEN_KEY = 'danzacheck.token'

const MENSAJE_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Autenticación requerida. Inicia sesión en el panel.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'La operación entra en conflicto con el estado actual.',
  500: 'Ocurrió un error inesperado. Intenta nuevamente.',
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Resuelve una ruta contra la base configurada en VITE_API_URL. La usan
 * tanto apiRequest como el cliente de SSE, para que las dos lleguen al
 * mismo origen.
 */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** Permite a la app enterarse de un 401 sin que cada pagina lo controle. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

/**
 * Dispara los avisos de 401 a mano. Lo usa el cliente de SSE, que
 * consulta la API con fetch y no pasa por apiRequest.
 */
export function notificarUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener())
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

function buildHeaders(auth: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = MENSAJE_POR_ESTADO[response.status] ?? 'Error inesperado.'
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>
    if (body?.message) {
      message = body.message
    }
  } catch {
    // El backend siempre responde JSON, pero si no lo hace nos quedamos
    // con el mensaje generico del status.
  }
  return new ApiError(response.status, message)
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = true, signal }: RequestOptions = {},
): Promise<T> {
  const headers = buildHeaders(auth)
  if (body !== undefined) {
    ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
  }

  const response = await fetch(apiUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const error = await toApiError(response)
    if (error.status === 401 && auth) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    throw error
  }

  // 204 No Content (por ejemplo, el logout).
  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
