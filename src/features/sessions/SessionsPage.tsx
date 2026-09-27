import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonLine } from '../../components/ui/Spinner'
import { IconoQr } from '../../components/ui/icons'
import { listarSesiones } from '../../lib/danzaApi'
import { useApiData } from '../../lib/useApiData'
import { useAuth } from '../../auth/useAuth'
import { SessionForm } from './SessionForm'
import { SessionCard } from './SessionCard'
import type { SesionResponse } from '../../types/api'

export function SessionsPage() {
  const { admin } = useAuth()
  const [creadasHoy, setCreadasHoy] = useState(0)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const cargarSesiones = useCallback(() => listarSesiones(), [])
  const {
    data: sesiones,
    loading: cargando,
    error,
    reload: recargar,
  } = useApiData(cargarSesiones, [])

  function manejarCreada() {
    setCreadasHoy((total) => total + 1)
    setMostrarFormulario(false)
    recargar()
  }

  function manejarEliminada(sesion: SesionResponse) {
    setAviso(`Se elimino la sesion ${sesion.nombre} con sus asistencias.`)
    setErrorAccion(null)
    recargar()
  }

  const abiertas = sesiones?.filter((sesion) => sesion.activa).length ?? 0

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${admin?.username ?? ''}`}
        descripcion="Crea una sesion para cada ensayo y comparte su codigo con el grupo. Las asistencias se cuentan solas."
        acciones={
          <Button onClick={() => setMostrarFormulario((visible) => !visible)}>
            {mostrarFormulario ? 'Ocultar formulario' : 'Nueva sesion'}
          </Button>
        }
      />

      <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-ink-200 bg-surface px-4 py-3.5 shadow-xs">
          <p className="text-xs font-semibold tracking-[0.06em] text-ink-400 uppercase">
            Total
          </p>
          <p className="text-2xl font-bold text-ink-900 tabular-nums">
            {sesiones?.length ?? '—'}
          </p>
        </div>
                  <div className="rounded-lg border border-ink-200 bg-surface px-4 py-3.5 shadow-xs">
          <p className="text-xs font-semibold tracking-[0.06em] text-ink-400 uppercase">
            Abiertas
          </p>
          <p className="text-2xl font-bold text-brand-600 tabular-nums">{abiertas}</p>
        </div>
                  <div className="rounded-lg border border-ink-200 bg-surface px-4 py-3.5 shadow-xs">
          <p className="text-xs font-semibold tracking-[0.06em] text-ink-400 uppercase">
            Creadas hoy
          </p>
          <p className="text-2xl font-bold text-ink-900 tabular-nums">{creadasHoy}</p>
        </div>
      </div>

      {aviso ? (
        <div className="mb-5">
          <Alert tono="exito">{aviso}</Alert>
        </div>
      ) : null}
      {errorAccion ? (
        <div className="mb-5">
          <Alert tono="error">{errorAccion}</Alert>
        </div>
      ) : null}

      {mostrarFormulario ? (
        <div className="mb-8">
          <Card>
            <CardHeader
              titulo="Nueva sesion"
              descripcion="Necesitas nombre, fecha y franja horaria. El codigo se genera solo."
            />
            <SessionForm onCreada={manejarCreada} />
          </Card>
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg text-ink-900">Sesiones</h2>

        {cargando && !sesiones ? (
          <div className="flex flex-col gap-3">
            <SkeletonLine />
            <SkeletonLine ancho="80%" />
            <SkeletonLine ancho="60%" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-sm text-danger">{error.message}</p>
            <div className="mt-4">
              <Button variante="secundario" onClick={recargar}>
                Reintentar
              </Button>
            </div>
          </Card>
        ) : sesiones && sesiones.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sesiones.map((sesion) => (
              <SessionCard
                key={sesion.id}
                sesion={sesion}
                onEliminada={manejarEliminada}
                onError={setErrorAccion}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icono={<IconoQr width={26} height={26} />}
            titulo="Todavia no hay sesiones"
            descripcion="Crea la primera para obtener un codigo y empezar a registrar asistencias."
            accion={<Button onClick={() => setMostrarFormulario(true)}>Crear la primera</Button>}
          />
        )}
      </section>

      <p className="mt-8 text-sm text-ink-400">
        ¿Necesitas registrar una asistencia?{' '}
        <Link to="/asistencia" className="font-semibold text-brand-700">
          Abre el codigo de tu ensayo
        </Link>
        .
      </p>
    </div>
  )
}
