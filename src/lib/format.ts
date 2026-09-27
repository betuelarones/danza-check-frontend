/**
 * Formateo de fechas y horas en espanol.
 *
 * El backend serializa LocalDate, LocalTime y LocalDateTime en ISO-8601 sin
 * zona horaria. No usamos `new Date(iso)` porque en ISO un "2026-09-25" se
 * interpreta como UTC y en husos negativos retrocederia un dia; aqui se
 * interpreta cada parte por separado.
 */

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]

/** "2026-09-25" -> "viernes, 25 de septiembre de 2026" */
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number)
  if (!anio || !mes || !dia) {
    return iso
  }
  const semana = DIAS[new Date(anio, mes - 1, dia).getDay()]
  return `${semana}, ${dia} de ${MESES[mes - 1]} de ${anio}`
}

/** "2026-09-25" -> "25 sep 2026" */
export function formatearFechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number)
  if (!anio || !mes || !dia) {
    return iso
  }
  return `${dia} ${MESES[mes - 1].slice(0, 3)} ${anio}`
}

/** "19:00:00" -> "19:00" */
export function formatearHora(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 5) : '--:--'
}

/** "19:00:00" / "21:00:00" -> "19:00 - 21:00" */
export function formatearHorario(
  inicio: string,
  fin: string | null | undefined,
): string {
  return fin ? `${formatearHora(inicio)} - ${formatearHora(fin)}` : formatearHora(inicio)
}

/** "2026-09-25T19:34:20.531" -> "25 de septiembre, 19:34" */
export function formatearFechaHora(iso: string): string {
  const [fecha, hora] = iso.split('T')
  if (!fecha) {
    return iso
  }
  const [, mes, dia] = fecha.split('-')
  const nombreMes = MESES[Number(mes) - 1] ?? mes
  return `${dia} de ${nombreMes}, ${formatearHora(hora)}`
}

/** "2026-09-25T19:34:20.531" -> "hace 5 min" */
export function formatearTiempoRelativo(iso: string): string {
  const momento = new Date(iso).getTime()
  if (Number.isNaN(momento)) {
    return iso
  }
  const minutos = Math.round((Date.now() - momento) / 60000)
  if (minutos < 1) return 'hace un momento'
  if (minutos === 1) return 'hace 1 minuto'
  if (minutos < 60) return `hace ${minutos} minutos`
  const horas = Math.round(minutos / 60)
  if (horas === 1) return 'hace 1 hora'
  if (horas < 24) return `hace ${horas} horas`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ayer' : `hace ${dias} días`
}

export function formatearDuracion(segundos: number): string {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.round((segundos % 3600) / 60)
  if (horas === 0) {
    return `${minutos} min`
  }
  return minutos === 0 ? `${horas} h` : `${horas} h ${minutos} min`
}

/**
 * Convierte cualquier fallo en un mensaje que se pueda mostrar tal cual.
 * Los errores de la API ya llegan con un texto pensado para la persona
 * usuaria; los demas (red caida, JSON inesperado) reciben un texto generico.
 */
export function mensajeDeError(fallo: unknown, alternativa: string): string {
  if (fallo instanceof Error && fallo.message) {
    return fallo.message
  }
  return alternativa
}
