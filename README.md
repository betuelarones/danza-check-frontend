# DanzaCheck — Frontend

Panel de sesiones y registro de asistencias para grupos de danza. Consume
todos los endpoints del backend Spring Boot de `C:\Backend\demo`.

React 19 + TypeScript + Vite 8 + React Router 7 + Tailwind CSS 4, gestionado
con **pnpm**.

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

Quedará en http://localhost:5173. El servidor de desarrollo hace proxy de
`/api` a `http://localhost:8080`, así que no hay que configurar nada.

Para que funcione, el backend tiene que estar arrancado. Con H2 en memoria,
sin instalar PostgreSQL:

```bash
cd C:\Backend\demo
./mvnw spring-boot:run
```

**Usuario del panel:** el que definas en `ADMIN_USERNAME` / `ADMIN_PASSWORD`
del backend. En el `.env.example` del backend viene `admin` / la clave que
tengas puesta; cámbiala antes de subirlo a ningún sitio.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con proxy a `/api`. |
| `pnpm build` | Comprobación de tipos con `tsc -b` y build de producción en `dist/`. |
| `pnpm preview` | Sirve el build de producción. |
| `pnpm lint` | `oxlint` sobre todo el proyecto. |

## Despliegue en Vercel

El proyecto ya viene preparado en `vercel.json`: build con `pnpm`, salida en
`dist`, reescritura de rutas para la SPA y caché inmutable de `/assets`.

Opción A, desde el dashboard:

1. Importa el repositorio en Vercel (Framework Preset: *Vite*).
2. En **Settings → Environment Variables** añade:

   | Nombre | Valor |
   | --- | --- |
   | `VITE_API_URL` | `https://<tu-backend>.onrender.com` (sin barra final) |

3. Deploy. Vercel detecta `pnpm` por el lockfile y `packageManager`.

Opción B, con la CLI:

```bash
pnpm dlx vercel
pnpm dlx vercel env add VITE_API_URL production
pnpm dlx vercel --prod
```

**Las dos piezas deben estar coordinadas.** El frontend en Vercel corre en
`https://danza-check.vercel.app` (o el dominio que elijas) y ya no hay proxy,
así que necesita `VITE_API_URL` apuntando al backend. Y el backend tiene que
aceptar ese origen, porque el panel y el registro de asistencia son peticiones
con CORS desde otro dominio:

```
FRONTEND_URL=https://danza-check.vercel.app
```

Detalles que ya están resueltos aquí:

- **Rutas profundas**: `vercel.json` reescribe todo a `index.html`, así que
  `/asistencia/K7QM3Z` y `/panel/sesiones/1` funcionan al abrirse directamente
  o al recargar (importante, porque el enlace del QR es una ruta del frontend).
- **Enlaces compartidos**: `window.location.origin` da el dominio real de Vercel, así
  que el enlace y el QR que se copian desde el panel apuntan a producción.
- **Caché**: los archivos con hash de `/assets` se sirven un año; `index.html`
  sin caché para que un deploy nuevo se vea de inmediato.
- **`.env*` sin subir**: en Vercel las variables se configuran en el panel, y el
  `.gitignore` impide que `.env.local` acabe en el repositorio.

Recomendación de dominios: en producción, `VITE_API_URL` con `https` y sin
barra final, y en el backend un `JWT_SECRET` aleatorio de 48 bytes.


## Configuración

Solo hay una variable, opcional (`src/vite-env.d.ts` la declara):

| Variable | Por defecto | Para qué sirve |
| --- | --- | --- |
| `VITE_API_URL` | *(vacío)* | Origen del backend. Vacío = rutas relativas y proxy de Vite. Con una URL absoluta (`https://api.danzacheck.com`) el frontend puede servirse desde otro dominio; ese origen debe estar permitido en `FRONTEND_URL` del backend. |

Copia `.env.example` a `.env.local` si necesitas tocarla. Los archivos `.env*`
no se suben al repositorio.

## Rutas

| Ruta | Acceso | Qué hace |
| --- | --- | --- |
| `/` | Público | Explicación del flujo y accesos. |
| `/entrar` | Público | Inicio de sesión del administrador. |
| `/panel` | Protegida | Lista de sesiones, contadores y creación. |
| `/panel/sesiones/:id` | Protegida | Detalle: conteo, lista, cierre y CSV. |
| `/asistencia` | Público | Formulario para escribir el código. |
| `/asistencia/:codigo` | Público | Vista de la persona que se apunta (la que abre el QR). |

## Endpoints que consume

Todo pasa por `src/lib/danzaApi.ts`; ninguna página construye URLs a mano.

| Método y ruta | Dónde se usa |
| --- | --- |
| `POST /api/auth/login` | `LoginPage` |
| `POST /api/auth/logout` | Cabecera, botón *Salir* |
| `GET /api/auth/me` | `AuthProvider` al arrancar (valida el token guardado) |
| `GET /api/sesiones` | `SessionsPage` |
| `POST /api/sesiones` | `SessionForm` |
| `GET /api/sesiones/{id}` | `SessionDetailPage` |
| `PATCH /api/sesiones/{id}/cerrar` | `SessionDetailPage` |
| `GET /api/sesiones/{id}/asistencias` | `SessionDetailPage` (tabla y CSV) |
| `GET /api/sesiones/{id}/asistencias/count` | `SessionDetailPage` (contador) |
| `GET /api/sesiones/{id}/asistencias/stream` | `SessionDetailPage` (SSE, lista en vivo) |
| `GET /api/sesiones/codigo/{codigo}` | `CheckInPage` |
| `POST /api/sesiones/{codigo}/asistencias` | `CheckInPage` |

### El stream en vivo

`SessionDetailPage` abre un Server-Sent Events contra
`/api/sesiones/{id}/asistencias/stream`, así el profesor ve las asistencias
aparecer sin recargar.

| Archivo | Rol |
| --- | --- |
| `src/lib/sseClient.ts` | Una conexión: `fetch` + `ReadableStream` e interpretación del protocolo SSE |
| `src/lib/useAsistenciaStream.ts` | Ciclo de vida del hook: conectar, reconectar y cortar |

Dos decisiones que conviene no deshacer sin pensarlo:

- **No se usa `EventSource`.** Esa API del navegador no permite mandar
  cabeceras, y el endpoint exige `Authorization: Bearer {token}`. Por eso el
  cliente lee el `ReadableStream` del `fetch` a mano, incluido el parseo de los
  bloques `event:`/`data:` y el descarte de los comentarios (`:latido`) que
  manda el backend para que la conexión no se corte.
- **La lista no se recarga.** El estado local solo guarda las asistencias que
  llegan por el stream; la lista completa sigue viniendo de la consulta normal.
  Al cambiar de sesión, `SessionDetailRoute` en `App.tsx` monta la página con el
  id como clave, y así nada de lo acumulado queda de una sesión en otra.

El hook reconecta solo cada 3 s si la conexión se cae, hasta 20 intentos. Un
`401` no se reintenta: el token no vuelve a ser válido solo esperando, y el panel
se cierra mediante el aviso centralizado de `apiClient`.

## Estructura

```
src/
  auth/          AuthContext, AuthProvider, useAuth, ProtectedRoute
  components/
    layout/      AppLayout: cabecera, navegación y pie
    ui/          Button, TextField, Card, Badge, Alert, Spinner,
                 EmptyState, PageHeader, StatCard, icons
  features/
    home/        HomePage
    auth/        LoginPage
    sessions/    SessionsPage, SessionForm, SessionCard, SessionDetailPage
    attendance/  CheckInPage
    misc/        NotFoundPage
  lib/           apiClient, danzaApi, useApiData, sseClient,
                 useAsistenciaStream, format
  styles/        index.css: Tailwind y el tema
  types/         Tipos de la API
```

## Decisiones

- **Tailwind CSS 4** con el plugin `@tailwindcss/vite`. La paleta vive en
  `@theme` dentro de `src/styles/index.css`: escala `brand-*` (rojo cereza
  apagado, `#bf4a66` en el 500), neutros cálidos `ink-*`, colores semánticos y
  sombras con tinte rojo. No hay CSS por componente.
- **Token en `localStorage`** (`danzacheck.token`). El cliente HTTP lo adjunta
  solo y, ante un 401, avisa al `AuthProvider` para limpiar la sesión; por eso
  no hay que comprobar el token en cada llamada.
- **`ApiError`** con el mensaje que ya devuelve el backend, listo para
  mostrarse. `mensajeDeError` en `lib/format.ts` cae a un texto genérico si el
  fallo no viene de la API.
- **`useApiData`** centraliza carga, cancelación con `AbortSignal` y recarga
  manual, con `reload` para refrescar el detalle al cerrar una sesión.
- **`useAsistenciaStream`** sigue el patrón de `useApiData` pero para una
  conexión viva: no corta y vuelve a pedir, se queda escuchando y entrega cada
  cambio. Los handlers van en un `ref` para no reconectar en cada render.
- **Proxy de Vite sin timeout** (`vite.config.ts`): el stream es una petición
  que no termina, así que un `timeout` por defecto o una respuesta comprimida
  harían que los eventos llegaran a ráfagas o la conexión muriera.
- **Fechas en español sin sorpresas de zona horaria**: el backend serializa
  `LocalDate`/`LocalTime` sin zona, así que `lib/format.ts` interpreta cada
  parte por separado en vez de pasar la cadena por `new Date()`.
- **Accesibilidad**: `fieldset`/`legend` en los formularios, errores con
  `role="alert"` y `aria-describedby`, foco visible, objetivos táctiles de
  44 px y contraste ≥ 4.5:1 en el texto.
- **Responsive**: una columna en móvil, rejilla de estadísticas y de sesiones
  a partir de `sm`/`md`.
# danza-check-frontend
