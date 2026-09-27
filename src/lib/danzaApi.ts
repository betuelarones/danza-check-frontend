/**
 * Un punto de acceso por cada endpoint del backend.
 * Las paginas nunca construyen URLs a mano.
 */

import { apiRequest } from './apiClient'
import type {
  AdminResponse,
  AsistenciaCountResponse,
  AsistenciaResponse,
  CrearSesionRequest,
  LoginRequest,
  LoginResponse,
  RegistrarAsistenciaRequest,
  SesionPublicResponse,
  SesionResponse,
} from '../types/api'

/* --- Publicos --- */

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: credentials,
    auth: false,
  })
}

export function consultarSesionPorCodigo(
  codigo: string,
  signal?: AbortSignal,
): Promise<SesionPublicResponse> {
  return apiRequest<SesionPublicResponse>(
    `/api/sesiones/codigo/${encodeURIComponent(codigo)}`,
    { auth: false, signal },
  )
}

export function registrarAsistencia(
  codigo: string,
  datos: RegistrarAsistenciaRequest,
): Promise<AsistenciaResponse> {
  return apiRequest<AsistenciaResponse>(
    `/api/sesiones/${encodeURIComponent(codigo)}/asistencias`,
    { method: 'POST', body: datos, auth: false },
  )
}

/* --- Del panel administrativo --- */

export function logout(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' })
}

export function obtenerAdministrador(signal?: AbortSignal): Promise<AdminResponse> {
  return apiRequest<AdminResponse>('/api/auth/me', { signal })
}

export function crearSesion(datos: CrearSesionRequest): Promise<SesionResponse> {
  return apiRequest<SesionResponse>('/api/sesiones', { method: 'POST', body: datos })
}

export function listarSesiones(signal?: AbortSignal): Promise<SesionResponse[]> {
  return apiRequest<SesionResponse[]>('/api/sesiones', { signal })
}

export function obtenerSesion(
  id: number,
  signal?: AbortSignal,
): Promise<SesionResponse> {
  return apiRequest<SesionResponse>(`/api/sesiones/${id}`, { signal })
}

export function cerrarSesion(id: number): Promise<SesionResponse> {
  return apiRequest<SesionResponse>(`/api/sesiones/${id}/cerrar`, {
    method: 'PATCH',
  })
}

/**
 * Elimina la sesión de forma definitiva, junto con sus asistencias. No es lo
 * mismo que cerrar: cerrar conserva el historial y solo deja de admitir
 * gente nueva. Devuelve 204, sin cuerpo.
 */
export function eliminarSesion(id: number): Promise<void> {
  return apiRequest<void>(`/api/sesiones/${id}`, { method: 'DELETE' })
}

export function listarAsistencias(
  id: number,
  signal?: AbortSignal,
): Promise<AsistenciaResponse[]> {
  return apiRequest<AsistenciaResponse[]>(`/api/sesiones/${id}/asistencias`, {
    signal,
  })
}

export function contarAsistencias(
  id: number,
  signal?: AbortSignal,
): Promise<AsistenciaCountResponse> {
  return apiRequest<AsistenciaCountResponse>(
    `/api/sesiones/${id}/asistencias/count`,
    { signal },
  )
}

/**
 * Borra una asistencia del listado. Es una correccion manual: la sesion
 * sigue existiendo y el resto de la lista no se toca. Devuelve 204, sin
 * cuerpo.
 */
export function eliminarAsistencia(sesionId: number, asistenciaId: number): Promise<void> {
  return apiRequest<void>(
    `/api/sesiones/${sesionId}/asistencias/${asistenciaId}`,
    { method: 'DELETE' },
  )
}
