import { Link, useNavigate, useParams } from 'react-router-dom'
import { encontrarAtividade } from '../../curriculo/trilha-v1'
import { marcarAtividadeDominada } from '../../firebase/perfis'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { EmparelhamentoIdentico } from '../../components/atividades/EmparelhamentoIdentico'
import { NomeacaoReceptiva } from '../../components/atividades/NomeacaoReceptiva'
import { NomeacaoExpressiva } from '../../components/atividades/NomeacaoExpressiva'
import { FormacaoSilaba } from '../../components/atividades/FormacaoSilaba'

export function Atividade() {
  const { atividadeId } = useParams<{ atividadeId: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { perfilAtivo } = usePerfilAtivo()
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
    marcarAtividadeDominada(usuario!.uid, perfilAtivo!.id, atividade!.id)
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
          <EmparelhamentoIdentico
            atividade={atividade}
            aoDominar={aoDominar}
            uidResponsavel={usuario!.uid}
            perfilId={perfilAtivo!.id}
          />
        )}
        {atividade.tipo === 'nomeacao-receptiva' && (
          <NomeacaoReceptiva
            atividade={atividade}
            aoDominar={aoDominar}
            uidResponsavel={usuario!.uid}
            perfilId={perfilAtivo!.id}
          />
        )}
        {atividade.tipo === 'nomeacao-expressiva' && (
          <NomeacaoExpressiva
            atividade={atividade}
            aoDominar={aoDominar}
            uidResponsavel={usuario!.uid}
            perfilId={perfilAtivo!.id}
          />
        )}
        {atividade.tipo === 'formacao-silaba' && (
          <FormacaoSilaba
            atividade={atividade}
            aoDominar={aoDominar}
            uidResponsavel={usuario!.uid}
            perfilId={perfilAtivo!.id}
          />
        )}
      </div>
    </main>
  )
}
