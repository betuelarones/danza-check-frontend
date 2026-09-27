/**
 * Tipos que reflejan los DTOs del backend (DanzaCheck).
 * Las fechas y horas llegan en ISO-8601 desde Jackson 3.
 */

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
  expiresIn: number
  username: string
}

export interface AdminResponse {
  username: string
  rol: string
}

export interface CrearSesionRequest {
  nombre: string
  fecha: string
  horaInicio: string
  horaFin?: string | null
}

export interface SesionResponse {
  id: number
  nombre: string
  fecha: string
  horaInicio: string
  horaFin: string | null
  codigo: string
  activa: boolean
  createdAt: string
}

export interface SesionPublicResponse {
  nombre: string
  fecha: string
  horaInicio: string
  horaFin: string | null
  activa: boolean
}

export interface RegistrarAsistenciaRequest {
  nombre: string
  correo: string
}

export interface AsistenciaResponse {
  id: number
  nombre: string
  correo: string
  fechaHora: string
}

export interface AsistenciaCountResponse {
  cantidad: number
}

/* --- Stream de asistencias (SSE) --- */

/** Payload del evento "conectado", el primero al abrir el stream. */
export interface StreamConectado {
  cantidad: number
}

/** Payload del evento "asistencia.registrada". */
export interface AsistenciaRegistrada {
  asistencia: AsistenciaResponse
  cantidad: number
}

export interface ApiErrorBody {
  status: number
  message: string
  timestamp: string
}
