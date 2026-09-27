import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Badge, CodigoSesion } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/ui/StatCard'
import { QrCode } from '../../components/ui/QrCode'
import {
  IconoCalendario,
  IconoCerrar,
  IconoCopiar,
  IconoPersonas,
  IconoQr,
  IconoReloj,
  IconoVolver,
} from '../../components/ui/icons'
import { ApiError } from '../../lib/apiClient'
import {
  cerrarSesion,
  contarAsistencias,
  eliminarAsistencia,
  eliminarSesion,
  listarAsistencias,
  obtenerSesion,
} from '../../lib/danzaApi'
import {
  formatearFecha,
  formatearFechaHora,
  formatearHorario,
  formatearTiempoRelativo,
} from '../../lib/format'
import { useApiData } from '../../lib/useApiData'
import { useAsistenciaStream } from '../../lib/useAsistenciaStream'
import type { AsistenciaResponse } from '../../types/api'

export function SessionDetailPage() {
  const parametros = useParams<{ id: string }>()
  const navegar = useNavigate()
  const id = Number(parametros.id)
  const idValido = Number.isInteger(id) && id > 0

  const [refresco, setRefresco] = useState(0)
  const [cerrando, setCerrando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  /**
   * Fila que esta esperando confirmacion y fila que se esta borrando. Son
   * ids de asistencia, no indices, para que el borrado no dependa de la
   * posicion en la tabla.
   */
  const [porConfirmar, setPorConfirmar] = useState<number | null>(null)
  const [borrando, setBorrando] = useState<number | null>(null)
  /** Confirmacion del borrado de la sesion completa, no de una fila. */
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)
  const [eliminandoSesion, setEliminandoSesion] = useState(false)

  // Lo que llega por el stream. La lista completa sigue viniendo de la
  // consulta: aqui solo se guardan las asistencias que se fueron
  // agregando despues, para no recargarla entera en cada persona que
  // se apunta.
  const [nuevas, setNuevas] = useState<AsistenciaResponse[]>([])
  const [totalEnVivo, setTotalEnVivo] = useState<number | null>(null)

  const sesion = useApiData((signal) => obtenerSesion(id, signal), [id, refresco], {
    enabled: idValido,
  })
  const conteo = useApiData((signal) => contarAsistencias(id, signal), [id, refresco], {
    enabled: idValido,
  })
  const asistencias = useApiData((signal) => listarAsistencias(id, signal), [id, refresco], {
    enabled: idValido,
  })

  // La sesion se monta de nuevo al cambiar de id, asi que estos estados
  // empiezan vacios y se llenan con la carga inicial.
  const lista = [...(asistencias.data ?? []), ...nuevas]
  const cantidad = totalEnVivo ?? conteo.data?.cantidad ?? 0

  const stream = useAsistenciaStream(idValido ? id : null, {
    onAsistenciaRegistrada: ({ asistencia, cantidad: total }) => {
      setNuevas((previas) =>
        previas.some((fila) => fila.id === asistencia.id) ? previas : [...previas, asistencia],
      )
      setTotalEnVivo(total)
    },
    // El backend ya envio la sesion actualizada y despues cerro el
    // stream. Recargar deja cabecera, estados y lista alineados.
    onSesionCerrada: () => {
      olvidarNovedades()
      setRefresco((valor) => valor + 1)
    },
  })

  // Tras un refresco manual la consulta trae la lista completa, asi que
  // lo acumulado por el stream sobra y se limpia.
  function olvidarNovedades() {
    setNuevas([])
    setTotalEnVivo(null)
  }

  const datos = sesion.data
  const urlAsistencia = datos ? `${window.location.origin}/asistencia/${datos.codigo}` : ''

  async function manejarCierre() {
    setCerrando(true)
    setErrorAccion(null)
    setAviso(null)
    try {
      const actualizada = await cerrarSesion(id)
      setAviso(
        actualizada.activa
          ? 'La sesion ya estaba abierta.'
          : 'Sesion cerrada. Ya no admite nuevas asistencias.',
      )
      olvidarNovedades()
      setRefresco((valor) => valor + 1)
    } catch (fallo) {
      setErrorAccion(
        fallo instanceof ApiError ? fallo.message : 'No se pudo cerrar la sesion.',
      )
    } finally {
      setCerrando(false)
    }
  }

  /**
   * Borra la sesion entera. No hay a donde volver con un aviso porque la
   * pagina deja de existir: se regresa al listado.
   */
  async function manejarBorrado() {
    setEliminandoSesion(true)
    setErrorAccion(null)
    try {
      await eliminarSesion(id)
      navegar('/panel')
    } catch (fallo) {
      setErrorAccion(
        fallo instanceof ApiError ? fallo.message : 'No se pudo eliminar la sesion.',
      )
      setEliminandoSesion(false)
      setConfirmandoBorrado(false)
    }
  }

  /**
   * Borra la asistencia. Tras el 204 se recarga la lista y el conteo en vez
   * de quitar la fila a mano: asi la tabla y el contador no pueden quedar
   * descuadrados, y tampoco hay que sincronizar la lista con lo que había
   * llegado por el stream.
   */
  async function manejarBorradoFila(asistencia: AsistenciaResponse) {
    setBorrando(asistencia.id)
    setErrorAccion(null)
    setAviso(null)
    try {
      await eliminarAsistencia(id, asistencia.id)
      setAviso(`Se elimino la asistencia de ${asistencia.nombre}.`)
      olvidarNovedades()
      setRefresco((valor) => valor + 1)
    } catch (fallo) {
      setErrorAccion(
        fallo instanceof ApiError ? fallo.message : 'No se pudo eliminar la asistencia.',
      )
    } finally {
      setBorrando(null)
      setPorConfirmar(null)
    }
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(urlAsistencia)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 1800)
    } catch {
      setAviso('No se pudo copiar. Copia el enlace desde la barra del navegador.')
    }
  }

  function descargarCsv() {
    const cabecera = 'Nombre,Correo,Fecha y hora'
    const cuerpo = lista.map((fila) =>
      [`"${fila.nombre.replace(/"/g, '""')}"`, `"${fila.correo}"`, `"${fila.fechaHora}"`].join(
        ',',
      ),
    )
    const csv = [cabecera, ...cuerpo].join('\n')
    // El BOM permite que Excel muestre bien los acentos.
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `asistencias-${datos?.codigo ?? 'sesion'}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  if (!idValido) {
    return (
      <Alert tono="error" titulo="Identificador no valido">
        La direccion de la sesion no es correcta.
      </Alert>
    )
  }

  if (sesion.loading) {
    return <Spinner etiqueta="Cargando sesion" />
  }

  if (sesion.error || !datos) {
    return (
      <Alert tono="error" titulo="No se pudo cargar la sesion">
        {sesion.error?.message ?? 'Sesion no encontrada.'}
      </Alert>
    )
  }

  return (
    <>
      <div className="mb-5">
        <Link
          to="/panel"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 no-underline transition-colors hover:text-brand-700"
        >
          <IconoVolver width={16} height={16} />
          Todas las sesiones
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 max-[52rem]:flex-col">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <Badge tono={datos.activa ? 'exito' : 'neutro'} punto>
              {datos.activa ? 'Activa' : 'Cerrada'}
            </Badge>
            <span className="text-xs text-ink-400">
              creada {formatearTiempoRelativo(datos.createdAt)}
            </span>
          </div>
          <h1 className="text-3xl text-ink-900 max-[34rem]:text-2xl">{datos.nombre}</h1>
        </div>

        {confirmandoBorrado ? (
          <div className="w-full rounded-md border border-danger-border bg-danger-soft p-3.5 text-left">
            <p className="text-sm text-ink-700">
              Se borra <span className="font-semibold">{datos.nombre}</span> y sus{' '}
              {cantidad} asistencia{cantidad === 1 ? '' : 's'}. No se puede deshacer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variante="peligro"
                cargando={eliminandoSesion}
                onClick={manejarBorrado}
                className="!px-3.5 !py-2 !text-xs"
              >
                Si, eliminar
              </Button>
              <Button
                variante="secundario"
                onClick={() => setConfirmandoBorrado(false)}
                disabled={eliminandoSesion}
                className="!px-3.5 !py-2 !text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {datos.activa ? (
              <Button
                variante="peligro"
                cargando={cerrando}
                onClick={manejarCierre}
                icono={<IconoCerrar width={16} height={16} />}
              >
                Cerrar sesion
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(true)}
              className="rounded-sm border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              Eliminar sesion
            </button>
          </div>
        )}
      </div>

      {aviso ? <Alert tono="exito">{aviso}</Alert> : null}
      {errorAccion ? <Alert tono="error">{errorAccion}</Alert> : null}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          etiqueta="Asistencias"
          valor={conteo.loading && cantidad === 0 ? '—' : cantidad}
          detalle={conteo.error ? 'No disponible' : 'personas registradas'}
          icono={<IconoPersonas width={20} height={20} />}
        />
        <StatCard
          etiqueta="Fecha"
          valor={formatearFecha(datos.fecha)}
          detalle="Dia del ensayo"
          icono={<IconoCalendario width={20} height={20} />}
        />
        <StatCard
          etiqueta="Horario"
          valor={formatearHorario(datos.horaInicio, datos.horaFin)}
          detalle="Hora local"
          icono={<IconoReloj width={20} height={20} />}
        />
        <StatCard
          etiqueta="Codigo"
          valor={<CodigoSesion codigo={datos.codigo} />}
          detalle="Lo usa el grupo para apuntarse"
          icono={<IconoQr width={20} height={20} />}
        />
      </div>

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-5 max-[52rem]:flex-col max-[52rem]:items-stretch">
        <div className="flex min-w-0 items-center gap-5 max-[34rem]:flex-col max-[34rem]:items-start">
          <QrCode valor={urlAsistencia} className="shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base text-ink-900">Enlace de asistencia</h2>
            <p className="mt-1 max-w-[52ch] text-sm text-ink-500">
              Proyectá el QR o compartí el enlace por el grupo: cualquiera con el
              codigo puede registrarse sin cuenta.
            </p>
            <code className="mt-2.5 block max-w-full overflow-x-auto rounded-sm bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600">
              {urlAsistencia}
            </code>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 max-[52rem]:flex-wrap">
          <Button
            variante="secundario"
            onClick={copiarEnlace}
            icono={<IconoCopiar width={16} height={16} />}
          >
            {copiado ? 'Copiado' : 'Copiar'}
          </Button>
          <Link
            to={`/asistencia/${datos.codigo}`}
            className="inline-flex items-center rounded-sm bg-brand-500 px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-600"
          >
            Abrir vista alumno
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader
          titulo="Lista de asistencia"
          descripcion="Orden de registro. Los correos se guardan en minusculas para evitar duplicados."
          acciones={
            <>
              {datos.activa ? (
                <Badge tono={stream.conectado ? 'exito' : 'neutro'} punto>
                  {stream.conectado ? 'En vivo' : 'Conectando'}
                </Badge>
              ) : null}
              {lista.length > 0 ? (
                <Button variante="secundario" onClick={descargarCsv} className="!px-3.5 !py-1.5 !text-xs">
                  Descargar CSV
                </Button>
              ) : null}
            </>
          }
        />

        {stream.error ? <Alert tono="info">{stream.error.message}</Alert> : null}
        {asistencias.loading ? <Spinner etiqueta="Cargando asistencias" /> : null}
        {asistencias.error ? <Alert tono="error">{asistencias.error.message}</Alert> : null}

        {!asistencias.loading && !asistencias.error ? (
          lista.length > 0 ? (
            <div className="-mx-4 -mb-4 overflow-x-auto border-t border-ink-200 sm:-mx-6 sm:-mb-6">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Assistencias de la sesion {datos.nombre}
                </caption>
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50 text-left">
                    <th
                      scope="col"
                      className="hidden px-4 py-3 font-semibold text-ink-500 sm:table-cell sm:px-6"
                    >
                      #
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink-500 sm:px-6">
                      Nombre
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink-500 sm:px-6">
                      Correo
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink-500 sm:px-6">
                      Registrado
                    </th>
                    <th scope="col" className="px-4 py-3 text-right sm:px-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((asistencia, indice) => (
                    <tr key={asistencia.id} className="border-b border-ink-200 last:border-0">
                      <td className="hidden px-4 py-3 text-ink-400 tabular-nums sm:table-cell sm:px-6 sm:py-3.5">
                        {indice + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink-800 sm:px-6 sm:py-3.5">
                        {asistencia.nombre}
                      </td>
                      <td className="px-4 py-3 break-all text-ink-500 sm:px-6 sm:py-3.5 sm:break-normal">
                        {asistencia.correo}
                      </td>
                      <td className="px-4 py-3 text-ink-500 sm:px-6 sm:py-3.5">
                        {formatearFechaHora(asistencia.fechaHora)}
                      </td>
                      <td className="px-4 py-3 text-right align-middle sm:px-6 sm:py-3.5">
                        {porConfirmar === asistencia.id ? (
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => manejarBorradoFila(asistencia)}
                              disabled={borrando !== null}
                              aria-label={`Confirmar el borrado de ${asistencia.nombre}`}
                              className="rounded-sm bg-danger px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger/90 disabled:pointer-events-none disabled:opacity-60"
                            >
                              {borrando === asistencia.id ? 'Borrando' : 'Si, borrar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPorConfirmar(null)}
                              disabled={borrando !== null}
                              className="rounded-sm border border-ink-300 px-2.5 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPorConfirmar(asistencia.id)}
                            disabled={borrando !== null}
                            aria-label={`Eliminar la asistencia de ${asistencia.nombre}`}
                            className="rounded-sm px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft disabled:pointer-events-none disabled:opacity-60"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icono={<IconoPersonas width={30} height={30} />}
              titulo="Todavia no se ha apuntado nadie"
              descripcion="Comparte el codigo de la sesion y las asistencias apareceran aqui."
              accion={
                <Link
                  to={`/asistencia/${datos.codigo}`}
                  className="inline-flex items-center rounded-sm border border-brand-200 bg-surface px-4 py-2 text-sm font-semibold text-brand-800 no-underline transition-colors hover:bg-brand-50"
                >
                  Probar el registro
                </Link>
              }
            />
          )
        ) : null}
      </Card>
    </>
  )
}
