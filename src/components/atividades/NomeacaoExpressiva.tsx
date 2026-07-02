import { useEffect, useMemo, useState } from 'react'
import type { Atividade } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'
import { useSpeech } from '../../hooks/useSpeech'
import { usePreferencias } from '../../contexts/PreferenciasContext'

interface NomeacaoExpressivaProps {
  atividade: Atividade
  aoDominar: () => void
  uidResponsavel: string
  perfilId: string
}

type Feedback = 'correto' | 'incorreto' | null

/**
 * "Expressiva" aqui significa a criança produzir/escolher ativamente o nome
 * da letra mostrada, em vez de apenas localizá-la (nomeação receptiva). Como
 * a plataforma não faz reconhecimento de fala, a produção acontece por
 * seleção entre opções de nome — acessível também a crianças não-verbais.
 */
export function NomeacaoExpressiva({
  atividade,
  aoDominar,
  uidResponsavel,
  perfilId,
}: NomeacaoExpressivaProps) {
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

  useEffect(() => {
    falar('Qual é o nome desta letra?')
  }, [atividade.id, falar])

  const mostrarDestaque =
    dicaAtual?.tipo === 'destaque-visual' || dicaAtual?.tipo === 'modelagem'

  function aoClicarEmOpcao(estimuloId: string, rotulo: string) {
    if (feedback) return

    const resultado = responder(estimuloId)
    setFeedback(resultado.correto ? 'correto' : 'incorreto')
    falar(resultado.correto ? `Isso! ${rotulo}` : 'Tente de novo')

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
        Qual é o nome desta letra?
      </p>

      <Icone
        iconeId={atividade.alvo.iconeId as IconeId}
        titulo="Letra a nomear"
        className="h-24 w-24 text-[var(--cor-primaria-escura)] drop-shadow-sm"
      />

      <fieldset className="grid grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-3">
        <legend className="sr-only">Opções de resposta</legend>
        {opcoes.map((opcao) => {
          const ehResposta = opcao.id === atividade.resposta.id
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoClicarEmOpcao(opcao.id, opcao.rotulo)}
              className={`min-w-24 rounded-2xl border-2 bg-[var(--cor-fundo-alt)] px-6 py-4 text-2xl font-semibold text-[var(--cor-texto)] shadow-[var(--sombra-cartao)] ${
                preferencias.animacoes
                  ? 'transition-transform hover:scale-105 active:scale-95'
                  : ''
              } ${
                mostrarDestaque && ehResposta
                  ? 'border-[var(--cor-primaria)] ring-4 ring-[var(--cor-primaria)]/40'
                  : 'border-[var(--cor-borda)]'
              }`}
            >
              {opcao.rotulo}
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
