import { useState, type FormEvent } from 'react'
import { crearSesion } from '../../lib/danzaApi'
import type { CrearSesionRequest } from '../../types/api'
import { mensajeDeError } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { Alert } from '../../components/ui/Alert'

const HOY = new Date().toISOString().slice(0, 10)

export function SessionForm({ onCreada }: { onCreada: () => void }) {
  const [formulario, setFormulario] = useState<CrearSesionRequest>({
    nombre: '',
    fecha: HOY,
    horaInicio: '19:00',
    horaFin: '21:00',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function actualizar<K extends keyof CrearSesionRequest>(campo: K, valor: CrearSesionRequest[K]) {
    setFormulario((actual: CrearSesionRequest) => ({ ...actual, [campo]: valor }))
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await crearSesion({
        ...formulario,
        nombre: formulario.nombre.trim(),
      })
      setFormulario({ nombre: '', fecha: HOY, horaInicio: '19:00', horaFin: '21:00' })
      onCreada()
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No se pudo crear la sesion.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-4" noValidate>
      {error ? <Alert tono="error">{error}</Alert> : null}

      <TextField
        label="Nombre de la sesion"
        value={formulario.nombre}
        onChange={(e) => actualizar('nombre', e.target.value)}
        placeholder="Ensayo general"
        maxLength={120}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          label="Fecha"
          type="date"
          value={formulario.fecha}
          onChange={(e) => actualizar('fecha', e.target.value)}
          required
        />
        <TextField
          label="Hora de inicio"
          type="time"
          value={formulario.horaInicio}
          onChange={(e) => actualizar('horaInicio', e.target.value)}
          required
        />
        <TextField
          label="Hora de fin"
          type="time"
          value={formulario.horaFin ?? ''}
          onChange={(e) => actualizar('horaFin', e.target.value)}
          required
        />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-3 max-[30rem]:flex-col max-[30rem]:items-stretch">
        <Button type="submit" cargando={enviando}>
          Crear sesion
        </Button>
        <p className="text-xs text-ink-400">
          Al crearla se genera un codigo y un enlace para compartir.
        </p>
      </div>
    </form>
  )
}
