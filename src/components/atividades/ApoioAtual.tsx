import type { NivelDica } from '../../curriculo/tipos'

interface ApoioAtualProps {
  dicaAtual: NivelDica | undefined
}

const textosPorTipo: Record<
  NivelDica['tipo'],
  { titulo: string; detalhe: string }
> = {
  modelagem: {
    titulo: 'Com ajuda visual',
    detalhe: 'A resposta certa aparece com um aviso visual calmo.',
  },
  'destaque-visual': {
    titulo: 'Com pista',
    detalhe: 'Procure a opção com destaque.',
  },
  'dica-verbal': {
    titulo: 'Com dica',
    detalhe: 'O adulto pode repetir a instrução devagar.',
  },
  nenhuma: {
    titulo: 'Sozinho',
    detalhe: 'Responda no seu tempo.',
  },
}

export function ApoioAtual({ dicaAtual }: ApoioAtualProps) {
  const texto = textosPorTipo[dicaAtual?.tipo ?? 'nenhuma']

  return (
    <div
      className="rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 text-center"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-[var(--cor-texto)]">
        {texto.titulo}
      </p>
      <p className="text-xs text-[var(--cor-texto-suave)]">{texto.detalhe}</p>
    </div>
  )
}
