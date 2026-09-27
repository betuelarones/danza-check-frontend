import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { CheckInPage } from './features/attendance/CheckInPage'
import { HomePage } from './features/home/HomePage'
import { NotFoundPage } from './features/misc/NotFoundPage'
import { SessionDetailPage } from './features/sessions/SessionDetailPage'
import { SessionsPage } from './features/sessions/SessionsPage'

/**
 * Monta el detalle con el id como clave, para que al pasar de una sesión
 * a otra el componente arranque de cero. Así lo que el stream acumularon
 * para la sesión anterior no queda mezclado con la nueva.
 */
function SessionDetailRoute() {
  const { id } = useParams<{ id: string }>()
  return <SessionDetailPage key={id} />
}

/**
 * Rutas de la aplicacion.
 *  /                     portada
 *  /entrar               login de la delegada
 *  /panel                listado de sesiones (protegido)
 *  /panel/sesiones/:id   detalle con la lista de asistencia (protegido)
 *  /asistencia           registro público, el código se teclea
 *  /asistencia/:codigo   registro público desde el enlace o QR
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="entrar" element={<LoginPage />} />
            <Route
              path="panel"
              element={
                <ProtectedRoute>
                  <SessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="panel/sesiones/:id"
              element={
                <ProtectedRoute>
                  <SessionDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route path="asistencia" element={<CheckInPage />} />
            <Route path="asistencia/:codigo" element={<CheckInPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
