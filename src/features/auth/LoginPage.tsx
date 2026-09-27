import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { Alert } from '../../components/ui/Alert'
import { IconoBailarina, IconoOjo, IconoOjoTachado } from '../../components/ui/icons'
import { mensajeDeError } from '../../lib/format'

type Destino = { from?: { pathname?: string } }

export function LoginPage() {
  const { login } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const destino = (ubicacion.state as Destino | null)?.from?.pathname ?? '/panel'

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await login(usuario.trim(), clave)
      navegar(destino, { replace: true })
    } catch (fallo) {
      setError(mensajeDeError(fallo, 'No se pudo iniciar sesion.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid place-items-center py-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-linear-140 from-brand-500 to-brand-800 text-white shadow-soft">
            <IconoBailarina width={26} height={26} />
          </span>
          <h1 className="text-2xl text-ink-900">Entrar al panel</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Esta zona es para quien administra las sesiones del grupo.
          </p>
        </div>

        {error ? (
          <div className="mb-5">
            <Alert tono="error" titulo="No pudimos iniciar sesion">
              {error}
            </Alert>
          </div>
        ) : null}

        <form onSubmit={manejarEnvio} className="flex flex-col gap-4" noValidate>
          <TextField
            label="Usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
            required
            placeholder="admin"
          />
          <TextField
            label="Contrasena"
            type={verClave ? 'text' : 'password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            accion={
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                aria-pressed={verClave}
                title={verClave ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                className="-mr-1 grid size-8 shrink-0 place-items-center rounded-sm text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {verClave ? (
                  <IconoOjoTachado width={18} height={18} />
                ) : (
                  <IconoOjo width={18} height={18} />
                )}
              </button>
            }
          />
          <Button type="submit" cargando={enviando} className="mt-1 w-full !py-2.5">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Si solo quieres registrar tu asistencia,{' '}
          <a href="/asistencia" className="font-semibold text-brand-700">
            usa el codigo de tu ensayo
          </a>
          .
        </p>
      </div>
    </div>
  )
}
