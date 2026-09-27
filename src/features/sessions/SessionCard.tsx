import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, CodigoSesion } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { IconoQr } from '../../components/ui/icons'
import { eliminarSesion } from '../../lib/danzaApi'
import { ApiError } from '../../lib/apiClient'
import type { SesionResponse } from '../../types/api'
import { formatearFecha, formatearHora } from '../../lib/format'

interface Props {
  sesion: SesionResponse
  /** Se avisa al panel para que recargue la lista y baje el total. */
  onEliminada: (sesion: SesionResponse) => void
  onError: (mensaje: string) => void
}

export function SessionCard({ sesion, onEliminada, onError }: Props) {
  const [enlaceCopiado, setEnlaceCopiado] = useState(false)
  /** Dos pasos: primero se pide confirmar, y solo entonces se borra. */
  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const enlace = `${window.location.origin}/asistencia/${sesion.codigo}`

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(enlace)
    } catch {
      // Si el navegador bloquea el portapapeles, se deja el enlace visible
      // en la tarjeta para que la persona pueda copiarlo a mano.
    }
    setEnlaceCopiado(true)
    window.setTimeout(() => setEnlaceCopiado(false), 2000)
  }

  async function manejarBorrado() {
    setBorrando(true)
    try {
      await eliminarSesion(sesion.id)
      onEliminada(sesion)
    } catch (fallo) {
      onError(
        fallo instanceof ApiError ? fallo.message : 'No se pudo eliminar la sesion.',
      )
      setBorrando(false)
      setConfirmando(false)
    }
  }

  return (
          <li className="rounded-lg border border-ink-200 bg-surface p-5 shadow-xs transition-shadow hover:shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base text-ink-900">{sesion.nombre}</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            {formatearFecha(sesion.fecha)} · {formatearHora(sesion.horaInicio)}-
            {formatearHora(sesion.horaFin)}
          </p>
        </div>
        {sesion.activa ? (
          <Badge tono="exito" punto>
            Abierta
          </Badge>
        ) : (
          <Badge tono="neutro">Cerrada</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CodigoSesion codigo={sesion.codigo} />
        <a
          href={enlace}
          className="max-w-full truncate font-mono text-xs text-ink-400 no-underline"
          title={enlace}
        >
          {enlace}
        </a>
      </div>

      {confirmando ? (
        <div className="mt-4 rounded-md border border-danger-border bg-danger-soft p-3">
          <p className="text-xs text-ink-700">
            Se borra <span className="font-semibold">{sesion.nombre}</span> y todas
            sus asistencias. No se puede deshacer.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button
              variante="peligro"
              onClick={manejarBorrado}
              cargando={borrando}
              className="!px-3 !py-1.5 !text-xs"
            >
              Si, eliminar
            </Button>
            <Button
              variante="secundario"
              onClick={() => setConfirmando(false)}
              disabled={borrando}
              className="!px-3 !py-1.5 !text-xs"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to={`/panel/sesiones/${sesion.id}`}
            className="inline-flex items-center gap-1.5 rounded-sm border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-800 no-underline transition-colors hover:bg-brand-50"
          >
            <IconoQr width={14} height={14} />
            Ver asistencias
          </Link>
          <Button
            variante="secundario"
            onClick={copiarEnlace}
            className="!px-3.5 !py-1.5 !text-xs"
          >
            {enlaceCopiado ? 'Enlace copiado' : 'Copiar enlace'}
          </Button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="ml-auto rounded-sm px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft"
          >
            Eliminar
          </button>
        </div>
      )}
    </li>
  )
}
