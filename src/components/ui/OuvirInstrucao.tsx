import { useSpeech } from '../../hooks/useSpeech'

interface OuvirInstrucaoProps {
  texto: string
  className?: string
}

export function OuvirInstrucao({ texto, className = '' }: OuvirInstrucaoProps) {
  const { falar, disponivel } = useSpeech()

  if (!disponivel) return null

  return (
    <button
      type="button"
      onClick={() => falar(texto)}
      className={`inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2 text-sm font-medium text-[var(--cor-texto)] shadow-[var(--sombra-cartao)] hover:border-[var(--cor-primaria)] ${className}`.trim()}
      aria-label={`Ouvir instrução: ${texto}`}
    >
      Ouvir
    </button>
  )
}
