import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  valor: string
  /** Lado del cuadro en pixeles. El PNG se genera al triple para no verse borroso. */
  tamano?: number
  className?: string
}

/**
 * QR generado en el cliente: no hace falta endpoint ni libreria en el
 * backend. Se usa en el detalle de la sesion para que el grupo escanee
 * con la camara del celu y entre directo a marcar asistencia.
 */
export function QrCode({ valor, tamano = 168, className = '' }: QrCodeProps) {
  // El resultado se guarda junto al valor que lo produjo, asi durante el
  // render sabemos si todavia corresponde a la URL actual.
  const [resultado, setResultado] = useState<{ valor: string; url: string } | null>(
    null,
  )
  const [falloDe, setFalloDe] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true

    QRCode.toDataURL(valor, {
      width: tamano * 3,
      margin: 1,
      errorCorrectionLevel: 'M',
      // Negro puro sobre blanco: es lo que mejor lee la camara.
      color: { dark: '#1a1717ff', light: '#ffffffff' },
    })
      .then((url) => {
        if (vigente) setResultado({ valor, url })
      })
      .catch(() => {
        if (vigente) setFalloDe(valor)
      })

    return () => {
      vigente = false
    }
  }, [valor, tamano])

  if (falloDe === valor) {
    return (
      <p className="rounded-sm border border-danger-border bg-danger-soft px-3 py-2 text-xs text-danger">
        No se pudo generar el QR. Usa el codigo o el enlace.
      </p>
    )
  }

  const imagen = resultado?.valor === valor ? resultado.url : null

  return (
    <div
      className={`grid place-items-center border border-ink-200 bg-white p-2 ${className}`}
      style={{ width: tamano + 16, height: tamano + 16 }}
    >
      {imagen ? (
        <img
          src={imagen}
          width={tamano}
          height={tamano}
          alt="Codigo QR de la sesion"
          className="block"
        />
      ) : (
        <div
          className="animate-brillo rounded-sm bg-linear-100 from-ink-100 to-ink-200"
          style={{ width: tamano, height: tamano }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
