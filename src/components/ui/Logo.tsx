interface LogoProps {
  className?: string
  comTexto?: boolean
}

export function Logo({ className = '', comTexto = true }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <svg
        viewBox="0 0 100 50"
        className="h-8 w-16 shrink-0"
        role="presentation"
        aria-hidden="true"
      >
        <path
          d="M50,25 C50,36 41,44 30,44 C19,44 11,36 11,25 C11,14 19,6 30,6 C41,6 50,14 50,25 Z"
          fill="none"
          stroke="var(--cor-primaria)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M50,25 C50,36 59,44 70,44 C81,44 89,36 89,25 C89,14 81,6 70,6 C59,6 50,14 50,25 Z"
          fill="none"
          stroke="var(--cor-acento)"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      {comTexto && (
        <span className="text-2xl font-semibold tracking-tight text-[var(--cor-texto)]">
          TEA
        </span>
      )}
    </div>
  )
}
