import {
  conteudoApoioPreferencial,
  conteudoRoteiroPausa,
  type ApoioPreferencial,
} from '../../curriculo/apoioPreferencial'
import type { RegulacaoPreferencial } from '../../curriculo/perfilApoio'

export type EtapaRoteiroAtividade = 'preparar' | 'atividade'

interface RoteiroVisualAtividadeProps {
  etapaAtual: EtapaRoteiroAtividade
  rotuloAtividade: string
  apoioPreferencial?: ApoioPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
}

export function RoteiroVisualAtividade({
  etapaAtual,
  rotuloAtividade,
  apoioPreferencial,
  regulacaoPreferencial,
}: RoteiroVisualAtividadeProps) {
  const apoio = conteudoApoioPreferencial(apoioPreferencial)
  const pausa = conteudoRoteiroPausa(apoioPreferencial, regulacaoPreferencial)
  const preparando = etapaAtual === 'preparar'
  const indiceAtual = preparando ? 0 : 1
  const itens = [
    {
      id: 'preparar',
      marcador: indiceAtual === 0 ? 'Agora' : 'Feito',
      titulo: apoio.passosPreparacao[0],
      detalhe: 'Preparar',
      destaque: indiceAtual === 0,
    },
    {
      id: 'fazer',
      marcador: indiceAtual === 1 ? 'Agora' : 'Depois',
      titulo: apoio.passosPreparacao[1],
      detalhe: rotuloAtividade,
      destaque: indiceAtual === 1,
    },
    {
      id: 'terminar',
      marcador: indiceAtual === 1 ? 'Depois' : 'Fim',
      titulo: apoio.passosPreparacao[2],
      detalhe: 'Terminar',
      destaque: false,
    },
    {
      id: 'pausa',
      marcador: 'Pausa',
      titulo: pausa.titulo,
      detalhe: pausa.detalhe,
      destaque: false,
    },
  ] as const

  return (
    <ol
      aria-label="Roteiro visual da atividade"
      className="grid w-full max-w-md grid-cols-2 gap-2 text-center sm:grid-cols-4"
    >
      {itens.map((item) => (
        <li
          key={item.id}
          aria-current={item.destaque ? 'step' : undefined}
          className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-3 ${
            item.destaque
              ? 'border-[var(--cor-primaria)] bg-[var(--cor-primaria-clara)] text-[var(--cor-texto)]'
              : 'border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] text-[var(--cor-texto)]'
          }`}
        >
          <span className="text-xs font-semibold uppercase text-[var(--cor-texto-suave)]">
            {item.marcador}
          </span>
          <span className="text-sm font-semibold sm:text-base">
            {item.titulo}
          </span>
          <span className="max-w-full break-words text-xs leading-tight text-[var(--cor-texto-suave)] [overflow-wrap:anywhere]">
            {item.detalhe}
          </span>
        </li>
      ))}
    </ol>
  )
}
