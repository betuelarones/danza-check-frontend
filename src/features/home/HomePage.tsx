import { Link } from 'react-router-dom'
import { IconoBailarina, IconoCheck, IconoQr } from '../../components/ui/icons'
import { CodigoSesion } from '../../components/ui/Badge'

/**
 * Foto de la card del hero. Es una miniatura servida por el CDN de Google:
 * mide 547x365 y podria caerse, por eso el contenedor tiene fondo y la
 * tarjeta sigue viéndose bien aunque la imagen no cargue. Cambiala por
 * cualquier otra URL si preferis otra foto.
 */
const IMAGEN_HERO =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnaSDePu7EE6uLfBnhMptBv1xYvXmaRjLA-BLnNXROnQ&s=10'

const PASOS = [
  {
    titulo: 'Crea la sesion',
    texto: 'Indica nombre, fecha y franja horaria. DanzaCheck genera un codigo unico para ese ensayo.',
  },
  {
    titulo: 'Comparte el QR',
    texto: 'Envia el enlace o el codigo al grupo. Cada persona lo abre y se registra con su nombre y correo.',
  },
  {
    titulo: 'Sigue la lista',
    texto: 'Consulta cuantas asistencias hay, revisa los nombres y exporta el listado a CSV cuando quieras.',
  },
]

export function HomePage() {
  return (
    <div className="pb-6">
      <section className="grid grid-cols-1 items-center gap-10 min-[52rem]:gap-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-sm border border-brand-200 bg-white/70 py-1 pr-3.5 pl-3 text-xs font-semibold text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Control de asistencia para grupos de danza
          </p>

          <h1 className="text-5xl leading-[1.05] text-ink-900 max-[40rem]:text-4xl max-[34rem]:text-3xl">
            Cada ensayo, con su lista y su{' '}
            <span className="text-brand-500">codigo QR</span>.
          </h1>

          <p className="mt-5 max-w-[54ch] text-lg text-ink-500 max-[40rem]:text-base">
            Crea una sesion, comparte un enlace y recibe las asistencias en el
            momento. Sin hojas de calculo, sin listas que se pierden por chat.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/asistencia"
              className="inline-flex items-center gap-2 rounded-sm border-2 border-brand-300 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 no-underline transition-colors hover:border-brand-400 hover:bg-brand-50"
            >
              <IconoQr width={16} height={16} />
              Registrar asistencia
            </Link>
          </div>
        </div>

        {/* La card con la foto de fondo es un detalle que solo se ve en movil
            y tablet. En escritorio el hero se queda en una sola columna de
            texto, sin hueco raro a la derecha. */}
        <div className="mx-auto w-full max-w-xs min-[34rem]:max-w-sm min-[52rem]:hidden">
          <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-surface p-5 shadow-float">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgb(255 255 255 / 0.86), rgb(255 255 255 / 0.58)), url(${IMAGEN_HERO})`,
              }}
            />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3 border-b border-ink-200 pb-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <IconoBailarina width={22} height={22} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm text-ink-800">Ensayo general</h2>
                  <p className="truncate text-xs text-ink-400">jueves 25 · 19:00-21:00</p>
                </div>
              </div>

              <ul className="flex flex-col gap-2.5">
                {['Lucia Ferrer', 'Marcos Gil', 'Ana Rios', 'Diego Paz'].map((nombre, indice) => (
                  <li
                    key={nombre}
                    className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white/70 px-3 py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${indice % 2 === 0 ? 'bg-brand-500' : 'bg-ink-400'}`}
                    >
                      {nombre.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-700">{nombre}</span>
                    <span className="shrink-0 text-xs text-success">Registrado</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3.5">
                <span className="text-sm text-ink-600">Asistencias</span>
                <span className="text-2xl font-bold text-brand-800 tabular-nums">4</span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-500">
                <IconoCheck width={15} height={15} />
                <span>Codigo</span>
                <CodigoSesion codigo="K7QM3Z" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PASOS.map((paso, indice) => (
          <article
            key={paso.titulo}
            className="rounded-lg border border-ink-200 bg-surface p-6 shadow-xs"
          >
            <span
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-400 uppercase"
              aria-hidden="true"
            >
              paso {indice + 1}
            </span>
            <h3 className="text-base text-ink-900">{paso.titulo}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{paso.texto}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
