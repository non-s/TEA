import type { ReactElement, SVGProps } from 'react'
import {
  ehLetra,
  caractereDaLetra,
  type FormaIconeId,
  type IconeId,
} from './tipos'

const tracos: Record<FormaIconeId, ReactElement> = {
  circulo: <circle cx="50" cy="50" r="38" />,
  quadrado: <rect x="14" y="14" width="72" height="72" rx="10" />,
  triangulo: <polygon points="50,12 88,82 12,82" />,
  estrela: (
    <polygon points="50,8 61,38 93,38 67,57 77,88 50,69 23,88 33,57 7,38 39,38" />
  ),
  coracao: (
    <path d="M50 86 C20 62 6 45 6 28 C6 12 18 4 30 4 C40 4 47 10 50 18 C53 10 60 4 70 4 C82 4 94 12 94 28 C94 45 80 62 50 86 Z" />
  ),
  lua: (
    <path
      fillRule="evenodd"
      d="M10,50 A40,40 0 1,0 90,50 A40,40 0 1,0 10,50 M39,44 A34,34 0 1,0 107,44 A34,34 0 1,0 39,44"
    />
  ),
}

interface IconeProps extends SVGProps<SVGSVGElement> {
  iconeId: IconeId
  titulo?: string
}

export function Icone({ iconeId, titulo, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      role={titulo ? 'img' : 'presentation'}
      aria-hidden={titulo ? undefined : true}
      {...props}
    >
      {titulo ? <title>{titulo}</title> : null}
      {ehLetra(iconeId) ? (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={caractereDaLetra(iconeId).length > 1 ? '44' : '70'}
          fontWeight="700"
          fontFamily="system-ui, 'Segoe UI', sans-serif"
        >
          {caractereDaLetra(iconeId)}
        </text>
      ) : (
        tracos[iconeId]
      )}
    </svg>
  )
}
