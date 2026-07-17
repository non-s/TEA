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
    'flex min-h-[var(--min-alvo-atividade)] min-w-[var(--min-alvo-atividade)] items-center justify-center rounded-3xl border border-white/20 shadow-lg hover:shadow-[var(--sombra-brilho)]',
    animacoes
      ? 'transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]'
      : '',
    // `.vidro` tem `background` num seletor de mesma especificidade que as
    // utilities `bg-[...]` do Tailwind — como ela vem depois no CSS gerado,
    // vence se estiver presente junto de uma utility de fundo. Por isso só
    // entra no estado não-destacado, que não define seu próprio `bg-*`.
    destacado
      ? 'border-[var(--cor-primaria-escura)] bg-[var(--cor-primaria)] text-white ring-4 ring-[var(--cor-primaria)]/50 brilho-pulsante'
      : 'vidro text-[var(--cor-texto)] hover:bg-[var(--cor-primaria-clara)]/20 hover:border-[var(--cor-primaria-clara)]',
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
