import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../ui/Button'
import { IconoBailarina, IconoQr, IconoSalir } from '../ui/icons'

export function AppLayout() {
  const { admin, logout } = useAuth()
  const navegar = useNavigate()
  const [saliendo, setSaliendo] = useState(false)

  async function manejarLogout() {
    setSaliendo(true)
    try {
      await logout()
      navegar('/entrar', { replace: true })
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-17 w-full max-w-content flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <span className="grid size-9 place-items-center rounded-md bg-linear-140 from-brand-500 to-brand-800 text-white shadow-soft">
              <IconoBailarina width={22} height={22} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-bold tracking-tight text-ink-900">DanzaCheck</span>
              <span className="text-xs text-ink-400 max-[30rem]:hidden">
                Asistencia a ensayos
              </span>
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 max-[52rem]:order-3 max-[52rem]:w-full max-[52rem]:overflow-x-auto max-[52rem]:pb-1">
            {admin ? (
              <NavLink
                to="/panel"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-sm font-semibold no-underline transition-colors ${
                    isActive
                      ? 'bg-brand-100 text-brand-800'
                      : 'text-ink-500 hover:bg-brand-50 hover:text-brand-800'
                  }`
                }
              >
                Panel
              </NavLink>
            ) : null}
            <NavLink
              to="/asistencia"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-sm font-semibold no-underline transition-colors ${
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-ink-500 hover:bg-brand-50 hover:text-brand-800'
                }`
              }
            >
              <IconoQr width={16} height={16} className="shrink-0" />
              <span className="max-[26rem]:hidden">Registrar asistencia</span>
              <span className="hidden max-[26rem]:inline">Asistencia</span>
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {admin ? (
              <>
                <span
                  title={admin.rol}
                  className="rounded-sm border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 max-[30rem]:hidden"
                >
                  {admin.username}
                </span>
                <Button
                  variante="fantasma"
                  cargando={saliendo}
                  onClick={manejarLogout}
                  className="!px-3 !py-1.5 !text-xs"
                  icono={<IconoSalir width={16} height={16} />}
                >
                  Salir
                </Button>
              </>
            ) : (
              <Link
                to="/entrar"
                className="rounded-sm bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white no-underline hover:bg-brand-600"
              >
                Entrar al panel
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* overflow-x-clip deja que el halo de las tarjetas se salga sin
          generar barra horizontal. No es lo mismo que hidden, asi que no
          rompe el header sticky. */}
      <main className="mx-auto w-full max-w-content flex-1 overflow-x-clip px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-14">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200 bg-surface">
        <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-ink-400 sm:px-6">
          <p>DanzaCheck · control de asistencia a ensayos de danza</p>
          <p className="max-w-[44ch]">
            Si una sesion aparece cerrada, el ensayo ya termino y ya no admite
            nuevas asistencias.
          </p>
        </div>
      </footer>
    </div>
  )
}
