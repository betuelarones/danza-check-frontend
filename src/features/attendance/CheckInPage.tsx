import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { consultarSesionPorCodigo, registrarAsistencia } from '../../lib/danzaApi'
import { formatearFecha, formatearHorario, mensajeDeError } from '../../lib/format'
import { useApiData } from '../../lib/useApiData'
import { Alert } from '../../components/ui/Alert'
import { Badge, CodigoSesion } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextField } from '../../components/ui/TextField'
import { Spinner } from '../../components/ui/Spinner'
import { IconoCalendario, IconoQr, IconoReloj } from '../../components/ui/icons'

const LARGO_MINIMO = 4

/** Vista publica: el grupo se apunta usando el codigo de la sesion. */
export function CheckInPage() {
  const parametros = useParams<{ codigo?: string }>()
  const navegar = useNavigate()
  const codigoDeLaUrl = (parametros.codigo ?? '').toUpperCase()

  const [entrada, setEntrada] = useState<string | null>(null)
  /**
   * Codigo que la persona confirmo con el boton. Es el unico que dispara una
   * consulta: teclear el campo no toca el servidor. Antes el campo y la URL
   * iban por separado, asi que corregir un codigo fallido volvia a pedir la
   * sesion y se acumulaban requests.
   */
  const [consultado, setConsultado] = useState<string | null>(
    codigoDeLaUrl.length >= LARGO_MINIMO ? codigoDeLaUrl : null,
  )
  const [urlVista, setUrlVista] = useState(codigoDeLaUrl)
  /**
   * Al entrar por QR o por enlace la sesion ya viene consultada, asi que el
   * buscador de codigo se esconde: no tiene sentido pedir que escriban un
   * codigo que ya esta en la URL. Esta bandera lo vuelve a abrir.
   */
  const [cambiarCodigo, setCambiarCodigo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  // Si la URL cambia (enlace o QR nuevo, boton de atras) el campo y la
  // consulta se siguen. Ajustar estado durante el render es el patron que
  // recomienda React para reaccionar a la entrada, sin usar un efecto.
  if (codigoDeLaUrl !== urlVista) {
    setUrlVista(codigoDeLaUrl)
    setEntrada(null)
    setCambiarCodigo(false)
    setConsultado(codigoDeLaUrl.length >= LARGO_MINIMO ? codigoDeLaUrl : null)
  }

  const codigoEnElCampo = (entrada ?? codigoDeLaUrl).trim().toUpperCase()
  // Escribir un codigo nuevo no borra lo ya consultado: se avisa y se espera
  // al boton para no mostrar una sesion que no corresponde a lo tecleado.
  const codigoDistinto = consultado !== null && codigoEnElCampo !== consultado

  /**
   * El buscador solo aparece si no hay ningun codigo (visita directa a
   * /asistencia) o si la persona pidio cambiarlo.
   */
  const mostrarBuscador = cambiarCodigo || consultado === null

  const sesion = useApiData(
    (signal) => consultarSesionPorCodigo(consultado ?? '', signal),
    [consultado],
    { enabled: consultado !== null },
  )

  const datos = codigoDistinto ? null : sesion.data

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!consultado) {
      return
    }
    setEnviando(true)
    setError(null)
    setExito(false)
    try {
      await registrarAsistencia(consultado, {
        nombre: nombre.trim(),
        correo: correo.trim(),
      })
      setExito(true)
      setNombre('')
      setCorreo('')
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No se pudo registrar tu asistencia.'))
    } finally {
      setEnviando(false)
    }
  }

  function manejarConsulta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const limpio = codigoEnElCampo.trim().toUpperCase()

    if (limpio.length < LARGO_MINIMO) {
      setErrorCodigo(`El codigo tiene al menos ${LARGO_MINIMO} caracteres.`)
      return
    }

    setErrorCodigo(null)
    setExito(false)
    setError(null)
    setConsultado(limpio)
    // Con el codigo confirmado el buscador vuelve a esconderse.
    setCambiarCodigo(false)
    // La URL se actualiza para que el enlace y el QR sean compartibles.
    navegar(`/asistencia/${limpio}`, { replace: true })
  }

  /**
   * El subtitulo sigue el estado: si el buscador esta abierto hay que escribir
   * el codigo, si la sesion fallo avisa en vez de prometer un formulario que
   * no va a aparecer, y con la sesion cargada va directo a confirmar.
   */
  function textoSubtitulo(): string {
    if (mostrarBuscador) {
      return 'Escribe el codigo que te paso quien organiza el ensayo.'
    }
    if (sesion.loading) {
      return 'Buscando la sesion...'
    }
    if (sesion.error && !codigoDistinto) {
      return 'Ese codigo no corresponde a ninguna sesion.'
    }
    return 'Confirma tu asistencia con tu nombre y tu correo.'
  }

  return (
    <div className="grid place-items-center py-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <IconoQr width={26} height={26} />
          </span>
          <h1 className="text-2xl text-ink-900">Registrar asistencia</h1>
          <p className="mt-1.5 text-sm text-ink-500">{textoSubtitulo()}</p>
        </div>

        {mostrarBuscador ? (
          <Card>
            <form
              onSubmit={manejarConsulta}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              noValidate
            >
              {/* El campo no lleva ayuda ni error: si tuviera texto debajo, la
                  columna crece y el boton deja de alinearse con la caja del
                  input. Por eso el aviso va fuera de la fila. */}
              <div className="flex-1">
                <TextField
                  label="Codigo de sesion"
                  value={codigoEnElCampo}
                  onChange={(e) => setEntrada(e.target.value.toUpperCase())}
                  placeholder="K7QM3Z"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  adorno="código"
                  required
                />
              </div>
              {/* h-12 iguala el alto del boton al de la caja del input, que
                  hereda 16px mientras el boton usa text-sm de 14px. */}
              <Button type="submit" className="h-12 w-full sm:w-auto">
                Buscar
              </Button>
            </form>

            {errorCodigo ? (
              <p role="alert" className="mt-3 text-xs font-semibold text-danger">
                {errorCodigo}
              </p>
            ) : (
              <p className="mt-3 text-xs text-ink-400">
                Solo se busca cuando presionas el boton.
              </p>
            )}
          </Card>
        ) : null}

        {sesion.loading && !codigoDistinto ? (
          <Spinner etiqueta="Consultando la sesion" />
        ) : null}

        {codigoDistinto ? (
          <div className="mt-4">
            <Alert tono="info" titulo="El codigo cambio">
              Presiona Buscar para ver la sesion de ese codigo.
            </Alert>
          </div>
        ) : sesion.error ? (
          <div className="mt-4">
            <Alert tono="error" titulo="Codigo no valido">
              {sesion.error.message}
            </Alert>
          </div>
        ) : null}

        {datos && consultado ? (
          <div className="mt-4 flex flex-col gap-4">
            <Card>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg text-ink-900">{datos.nombre}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      <IconoCalendario width={15} height={15} />
                      {formatearFecha(datos.fecha)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IconoReloj width={15} height={15} />
                      {formatearHorario(datos.horaInicio, datos.horaFin)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* La vista publica no devuelve el codigo, asi que se
                      muestra el que la persona ha confirmado con Buscar. */}
                  <CodigoSesion codigo={consultado} />
                  {datos.activa ? (
                    <Badge tono="exito" punto>
                      Abierta
                    </Badge>
                  ) : (
                    <Badge tono="neutro">Cerrada</Badge>
                  )}
                </div>
              </div>

              {!datos.activa ? (
                <Alert tono="error" titulo="Esta sesion ya no admite asistencias">
                  El ensayo ya termino. Pregunta a quien lo organiza por una sesion
                  nueva.
                </Alert>
              ) : exito ? (
                <Alert tono="exito" titulo="Asistencia registrada">
                  Gracias, {nombre.trim() || 'nos vemos en el proximo ensayo'}. Ya
                  puedes cerrar esta pagina.
                </Alert>
              ) : (
                <form onSubmit={manejarEnvio} className="flex flex-col gap-4" noValidate>
                  {error ? <Alert tono="error">{error}</Alert> : null}

                  <TextField
                    label="Nombre y apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Lucia Ferrer"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                  <TextField
                    label="Correo electronico"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="lucia@ejemplo.com"
                    autoComplete="email"
                    required
                    ayuda="Se guarda en minusculas para no duplicar tu registro."
                  />

                  <Button type="submit" cargando={enviando} className="h-12 w-full">
                    Confirmar asistencia
                  </Button>
                </form>
              )}
            </Card>
          </div>
        ) : null}

        {/* Escape para quien llego por un QR equivocado o quiere cambiar de
            sesion sin dar atras. */}
        {!mostrarBuscador ? (
          <div className="mt-4 flex justify-center">
            <Button variante="fantasma" onClick={() => setCambiarCodigo(true)}>
              Usar otro codigo
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
