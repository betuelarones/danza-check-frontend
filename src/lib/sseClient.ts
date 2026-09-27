/**
 * Cliente del stream de asistencias (Server-Sent Events).
 *
 * Por que no se usa `EventSource`: esa API del navegador no permite
 * mandar cabeceras, y este endpoint exige
 * `Authorization: Bearer {token}`. `fetch` si las manda, y con
 * `response.body` se lee la respuesta a medida que llega, que es
 * justo lo que hace un stream.
 *
 * El protocolo de SSE es texto plano con bloques separados por una
 * linea en blanco:
 *
 *     event:asistencia.registrada
 *     data:{"asistencia":{...},"cantidad":4}
 *
 * Las lineas que empiezan por `:` son comentarios. Aqui llegan los
 * latidos que envia el backend para que la conexion no se corte por
 * inactividad, y se descartan.
 *
 * Este modulo maneja una sola conexion. Las reconexiones las decide
 * useAsistenciaStream.
 */

import { ApiError, apiUrl, getToken, notificarUnauthorized } from './apiClient'
import type { AsistenciaRegistrada, SesionResponse, StreamConectado } from '../types/api'

const EVENTO_CONECTADO = 'conectado'
const EVENTO_ASISTENCIA = 'asistencia.registrada'
const EVENTO_SESION_CERRADA = 'sesion.cerrada'

export interface StreamAsistenciasHandlers {
  onConectado?: (datos: StreamConectado) => void
  onAsistenciaRegistrada?: (datos: AsistenciaRegistrada) => void
  onSesionCerrada?: (datos: SesionResponse) => void
  onError?: (fallo: ApiError) => void
}

type EventoRecibido =
  | { tipo: typeof EVENTO_CONECTADO; datos: StreamConectado }
  | { tipo: typeof EVENTO_ASISTENCIA; datos: AsistenciaRegistrada }
  | { tipo: typeof EVENTO_SESION_CERRADA; datos: SesionResponse }

/**
 * Mantiene el stream abierto hasta que se aborta.
 *
 * @param idSesion sesion a la que suscribirse
 * @param handlers aviso para cada tipo de evento
 * @param signal abortarlo cierra la conexion
 */
export async function suscribirStreamAsistencias(
  idSesion: number,
  handlers: StreamAsistenciasHandlers,
  signal: AbortSignal,
): Promise<void> {
  const token = getToken()
  if (!token) {
    throw new ApiError(401, 'Inicia sesion en el panel para ver el stream en vivo.')
  }

  let response: Response
  try {
    response = await fetch(apiUrl(`/api/sesiones/${idSesion}/asistencias/stream`), {
      headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
      signal,
    })
  } catch (fallo) {
    if (esAbortado(signal, fallo)) {
      return
    }
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  if (!response.ok) {
    const error = await errorDesdeRespuesta(response)
    if (error.status === 401) {
      // El token caducó o el servidor se reinició: el panel se cierra
      // solo en vez de quedarse reconectando en el vacío.
      notificarUnauthorized()
    }
    throw error
  }

  if (!response.body) {
    throw new ApiError(0, 'Este navegador no admite lectura en streaming.')
  }

  await leerStream(response.body, handlers, signal)
}

async function leerStream(
  body: ReadableStream<Uint8Array>,
  handlers: StreamAsistenciasHandlers,
  signal: AbortSignal,
): Promise<void> {
  const lector = body.getReader()
  const decodificador = new TextDecoder()
  let acumulado = ''

  try {
    while (!signal.aborted) {
      const { done, value } = await lector.read()
      if (done) {
        return
      }
      acumulado += decodificador.decode(value, { stream: true })

      // Un bloque termina con una linea en blanco. Puede llegar partido
      // entre dos lecturas, asi que solo se procesa lo que ya esta
      // completo y lo que sobra queda acumulado para la proxima.
      const corte = acumulado.lastIndexOf('\n\n')
      if (corte === -1) {
        continue
      }
      const completo = acumulado.slice(0, corte)
      acumulado = acumulado.slice(corte + 2)

      for (const bloque of completo.split('\n\n')) {
        const evento = interpretarBloque(bloque)
        if (evento) {
          despachar(evento, handlers)
        }
      }
    }
  } catch (fallo) {
    if (!esAbortado(signal, fallo)) {
      throw fallo
    }
  } finally {
    void lector.cancel().catch(() => undefined)
  }
}

function despachar(evento: EventoRecibido, handlers: StreamAsistenciasHandlers): void {
  if (evento.tipo === EVENTO_CONECTADO) {
    handlers.onConectado?.(evento.datos)
  } else if (evento.tipo === EVENTO_ASISTENCIA) {
    handlers.onAsistenciaRegistrada?.(evento.datos)
  } else {
    handlers.onSesionCerrada?.(evento.datos)
  }
}

function interpretarBloque(bloque: string): EventoRecibido | null {
  let nombre: string | null = null
  const lineasDatos: string[] = []

  for (const linea of bloque.split('\n')) {
    // Comentario del backend (latido) o linea vacia sobrante.
    if (linea.startsWith(':') || linea.trim() === '') {
      continue
    }
    const separador = linea.indexOf(':')
    const campo = separador === -1 ? linea : linea.slice(0, separador)
    // El protocolo admite un espacio opcional tras los dos puntos.
    const valor = separador === -1 ? '' : linea.slice(separador + 1).trimStart()

    if (campo === 'event') {
      nombre = valor
    } else if (campo === 'data') {
      lineasDatos.push(valor)
    }
  }

  if (nombre === null || lineasDatos.length === 0) {
    return null
  }

  try {
    const datos = JSON.parse(lineasDatos.join('\n'))
    if (nombre === EVENTO_CONECTADO) {
      return { tipo: EVENTO_CONECTADO, datos: datos as StreamConectado }
    }
    if (nombre === EVENTO_ASISTENCIA) {
      return { tipo: EVENTO_ASISTENCIA, datos: datos as AsistenciaRegistrada }
    }
    if (nombre === EVENTO_SESION_CERRADA) {
      return { tipo: EVENTO_SESION_CERRADA, datos: datos as SesionResponse }
    }
  } catch {
    // Un payload ilegible no debe cortar el stream entero.
  }
  return null
}

async function errorDesdeRespuesta(response: Response): Promise<ApiError> {
  const generico = `El stream de asistencias fallo (${response.status}).`
  try {
    const cuerpo = (await response.json()) as { message?: string }
    return new ApiError(response.status, cuerpo.message ?? generico)
  } catch {
    return new ApiError(response.status, generico)
  }
}

function esAbortado(signal: AbortSignal, fallo: unknown): boolean {
  return signal.aborted || (fallo instanceof DOMException && fallo.name === 'AbortError')
}
