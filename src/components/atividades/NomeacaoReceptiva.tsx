import { useEffect, useMemo, useState } from 'react'
import type { Atividade } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'
import { useSpeech } from '../../hooks/useSpeech'
import { usePreferencias } from '../../contexts/PreferenciasContext'

interface NomeacaoReceptivaProps {
  atividade: Atividade
  aoDominar: () => void
  uidResponsavel: string
  perfilId: string
}

type Feedback = 'correto' | 'incorreto' | null

export function NomeacaoReceptiva({
  atividade,
  aoDominar,
  uidResponsavel,
  perfilId,
}: NomeacaoReceptivaProps) {
  const { responder, dicaAtual } = useTentativa(
    atividade,
    uidResponsavel,
    perfilId,
  )
  const { falar } = useSpeech()
  const { preferencias } = usePreferencias()
  const [feedback, setFeedback] = useState<Feedback>(null)

  const opcoes = useMemo(
    () => embaralhar([atividade.resposta, ...atividade.distratores]),
    [atividade],
  )

  const instrucao = `Toque na letra ${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}`

  useEffect(() => {
    falar(instrucao)
  }, [atividade.id, instrucao, falar])

  const mostrarDestaque =
    dicaAtual?.tipo === 'destaque-visual' || dicaAtual?.tipo === 'modelagem'

  function aoClicarEmOpcao(estimuloId: string) {
    if (feedback) return

    const resultado = responder(estimuloId)
    setFeedback(resultado.correto ? 'correto' : 'incorreto')
    falar(resultado.correto ? 'Isso!' : 'Tente de novo')

    window.setTimeout(() => {
      setFeedback(null)
      if (resultado.dominada) {
        aoDominar()
      }
    }, 700)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-xl text-[var(--cor-texto)]" aria-live="polite">
        {instrucao}
      </p>

      <fieldset className="grid grid-cols-2 gap-6 border-0 p-0 sm:grid-cols-3">
        <legend className="sr-only">Opções de resposta</legend>
        {opcoes.map((opcao) => {
          const ehResposta = opcao.id === atividade.resposta.id
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoClicarEmOpcao(opcao.id)}
              aria-label={opcao.rotulo}
              className={`flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-[var(--cor-fundo-alt)] text-[var(--cor-texto)] shadow-[var(--sombra-cartao)] ${
                preferencias.animacoes
                  ? 'transition-transform hover:scale-105 active:scale-95'
                  : ''
              } ${
                mostrarDestaque && ehResposta
                  ? 'border-[var(--cor-primaria)] ring-4 ring-[var(--cor-primaria)]/40'
                  : 'border-[var(--cor-borda)]'
              }`}
            >
              <Icone iconeId={opcao.iconeId as IconeId} className="h-14 w-14" />
            </button>
          )
        })}
      </fieldset>

      <p className="min-h-10 text-lg font-medium" aria-live="assertive">
        {feedback === 'correto' && (
          <span className="rounded-full bg-[var(--cor-sucesso-clara)] px-4 py-1.5 text-[var(--cor-sucesso)]">
            Isso! 🎉
          </span>
        )}
        {feedback === 'incorreto' && (
          <span className="rounded-full bg-[var(--cor-fundo)] px-4 py-1.5 text-[var(--cor-texto-suave)]">
            Tente de novo
          </span>
        )}
      </p>
    </div>
  )
}
