import type { SVGProps } from 'react'
import type { EstagioPlanta } from '../jardim'

interface PlantaJardimProps extends SVGProps<SVGSVGElement> {
  estagio: EstagioPlanta
}

// Um único tom (currentColor, como em Icone.tsx) com variação de opacidade
// para dar profundidade — assim a ilustração continua legível no modo de
// alto contraste, que substitui as cores do app por uma única cor sobre
// fundo preto.
export function PlantaJardim({ estagio, ...props }: PlantaJardimProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="currentColor"
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="50" cy="108" rx="34" ry="8" opacity="0.25" />

      {estagio === 'semente' && <circle cx="50" cy="100" r="4" opacity="0.6" />}

      {estagio === 'brotando' && (
        <>
          <path
            d="M50,108 C50,90 46,80 50,68"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M50,86 C40,82 34,74 36,66 C46,66 52,74 50,86 Z"
            opacity="0.85"
          />
        </>
      )}

      {estagio === 'floresceu' && (
        <>
          <path
            d="M50,108 C50,80 44,62 50,40"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M50,90 C38,86 31,76 34,66 C46,66 53,76 50,90 Z" />
          <path d="M50,74 C62,70 69,60 66,50 C54,50 47,60 50,74 Z" />
          {[0, 72, 144, 216, 288].map((angulo) => (
            <ellipse
              key={angulo}
              cx="50"
              cy="24"
              rx="9"
              ry="15"
              opacity="0.85"
              transform={`rotate(${angulo} 50 40)`}
            />
          ))}
          <circle cx="50" cy="40" r="7" />
        </>
      )}
    </svg>
  )
}
