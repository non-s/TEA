interface ClassesAlvoToqueOpcoes {
  animacoes?: boolean
  destacado?: boolean
  className?: string
}

export function classesAlvoToque({
  animacoes = true,
  destacado = false,
  className = '',
}: ClassesAlvoToqueOpcoes = {}) {
  return [
    'flex min-h-[var(--min-alvo-atividade)] min-w-[var(--min-alvo-atividade)] items-center justify-center rounded-3xl border border-white/20 vidro text-[var(--cor-texto)] shadow-lg hover:shadow-[var(--sombra-brilho)]',
    animacoes
      ? 'transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]'
      : '',
    destacado
      ? 'border-[var(--cor-primaria-clara)] bg-[var(--cor-primaria-escura)]/50 ring-4 ring-[var(--cor-primaria)]/50 brilho-pulsante'
      : 'hover:bg-white/10 hover:border-[var(--cor-primaria-clara)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function classesFeedbackResposta() {
  return 'min-h-10 text-lg font-medium'
}

export function classesFeedbackCorreto() {
  return 'rounded-full bg-[var(--cor-sucesso-clara)] px-4 py-1.5 text-[var(--cor-sucesso)]'
}

export function classesFeedbackTentativa() {
  return 'rounded-full bg-[var(--cor-fundo)] px-4 py-1.5 text-[var(--cor-texto-suave)]'
}
