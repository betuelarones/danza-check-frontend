import type { SVGProps } from 'react'

/**
 * Iconos en linea (stroke) dibujados con los mismos tokens de color que el
 * resto de la interfaz. Evita depender de una libreria de iconos.
 */

type IconoProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconoProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoMas = (props: IconoProps) => (
  <Base {...props}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconoCalendario = (props: IconoProps) => (
  <Base {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Base>
)

export const IconoReloj = (props: IconoProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Base>
)

export const IconoPersonas = (props: IconoProps) => (
  <Base {...props}>
    <path d="M15.5 19.5v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 17.7v1.8" />
    <circle cx="9.25" cy="8" r="3.25" />
    <path d="M21 19.5v-1.8a3.7 3.7 0 0 0-2.8-3.57M15.5 5.07a3.25 3.25 0 0 1 0 5.86" />
  </Base>
)

export const IconoQr = (props: IconoProps) => (
  <Base {...props}>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
    <path d="M14 14h3v3h-3zM19.5 19.5H21V21h-1.5zM14 20.5h2M20 14h1" />
  </Base>
)

export const IconoSalir = (props: IconoProps) => (
  <Base {...props}>
    <path d="M15 5.5V4.2A1.7 1.7 0 0 0 13.3 2.5H5.2A1.7 1.7 0 0 0 3.5 4.2v15.6A1.7 1.7 0 0 0 5.2 21.5h8.1a1.7 1.7 0 0 0 1.7-1.7v-1.3" />
    <path d="M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5" />
  </Base>
)

export const IconoCandado = (props: IconoProps) => (
  <Base {...props}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Base>
)

export const IconoCheck = (props: IconoProps) => (
  <Base {...props}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Base>
)

export const IconoCerrar = (props: IconoProps) => (
  <Base {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)

export const IconoFlecha = (props: IconoProps) => (
  <Base {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
)

export const IconoVolver = (props: IconoProps) => (
  <Base {...props}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Base>
)

export const IconoCopiar = (props: IconoProps) => (
  <Base {...props}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M15 6.5V6A2 2 0 0 0 13 4H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
  </Base>
)

export const IconoEnlace = (props: IconoProps) => (
  <Base {...props}>
    <path d="M10.5 13.5a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 1 0-5.1-5.1l-1.3 1.3" />
    <path d="M13.5 10.5a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 1 0 5.1 5.1l1.3-1.3" />
  </Base>
)

export const IconoBailarina = (props: IconoProps) => (
  <Base {...props}>
    <circle cx="15" cy="4.4" r="2.1" />
    <path d="M13 7.6l-2.2 4.2 4.4 2.2-2.6 6.6" />
    <path d="M13 7.6l4.4 2.4-3.2 4M10.8 11.8L5 12.6M10.8 11.8l-2 6.4" />
  </Base>
)

export const IconoOjo = (props: IconoProps) => (
  <Base {...props}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </Base>
)

export const IconoOjoTachado = (props: IconoProps) => (
  <Base {...props}>
    <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17.6 17.6 0 0 1-3.4 4M6.3 8.3A17.3 17.3 0 0 0 2.5 12S6 18.2 12 18.2a9.8 9.8 0 0 0 3.7-.7" />
    <path d="M10 10a3.1 3.1 0 0 0 4 4" />
    <path d="M3.2 3.2l17.6 17.6" />
  </Base>
)
