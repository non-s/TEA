import { Link, useNavigate, useParams } from 'react-router-dom'
import { encontrarAtividade } from '../../curriculo/trilha-v1'
import { marcarAtividadeDominada } from '../../progresso/dominadas'
import { EmparelhamentoIdentico } from '../../components/atividades/EmparelhamentoIdentico'
import { NomeacaoReceptiva } from '../../components/atividades/NomeacaoReceptiva'

export function Atividade() {
  const { atividadeId } = useParams<{ atividadeId: string }>()
  const navigate = useNavigate()
  const atividade = atividadeId ? encontrarAtividade(atividadeId) : undefined

  if (!atividade) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-lg text-[var(--cor-texto)]">
          Não encontramos essa atividade.
        </p>
        <Link
          to="/crianca/trilha"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para a trilha
        </Link>
      </main>
    )
  }

  function aoDominar() {
    marcarAtividadeDominada(atividade!.id)
    navigate('/crianca/trilha')
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-6 py-10">
      <Link
        to="/crianca/trilha"
        className="self-start text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
      >
        ← Voltar para a trilha
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center">
        {(atividade.tipo === 'emparelhamento-identico' ||
          atividade.tipo === 'emparelhamento-categoria') && (
          <EmparelhamentoIdentico atividade={atividade} aoDominar={aoDominar} />
        )}
        {atividade.tipo === 'nomeacao-receptiva' && (
          <NomeacaoReceptiva atividade={atividade} aoDominar={aoDominar} />
        )}
      </div>
    </main>
  )
}
