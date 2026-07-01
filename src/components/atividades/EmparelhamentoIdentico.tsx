import { useMemo, useState } from 'react'
import type { Atividade } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'

interface EmparelhamentoIdenticoProps {
  atividade: Atividade
  aoDominar: () => void
}

type Feedback = 'correto' | 'incorreto' | null

export function EmparelhamentoIdentico({
  atividade,
  aoDominar,
}: EmparelhamentoIdenticoProps) {
  const { responder, dicaAtual } = useTentativa(atividade)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const opcoes = useMemo(
    () => embaralhar([atividade.alvo, ...atividade.distratores]),
    [atividade],
  )

  const mostrarDestaque =
    dicaAtual?.tipo === 'destaque-visual' || dicaAtual?.tipo === 'modelagem'

  function aoClicarEmOpcao(estimuloId: string) {
    if (feedback) return

    const resultado = responder(estimuloId)
    setFeedback(resultado.correto ? 'correto' : 'incorreto')

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
        Toque na figura igual a esta:
      </p>

      <Icone
        iconeId={atividade.alvo.iconeId as IconeId}
        titulo={atividade.alvo.rotulo}
        className="h-24 w-24 text-[var(--cor-primaria-escura)]"
      />

      <fieldset className="grid grid-cols-2 gap-6 border-0 p-0 sm:grid-cols-3">
        <legend className="sr-only">Opções de resposta</legend>
        {opcoes.map((opcao) => {
          const ehAlvo = opcao.id === atividade.alvo.id
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoClicarEmOpcao(opcao.id)}
              aria-label={opcao.rotulo}
              className={`flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-[var(--cor-fundo-alt)] text-[var(--cor-texto)] transition-colors motion-reduce:transition-none ${
                mostrarDestaque && ehAlvo
                  ? 'border-[var(--cor-primaria)] ring-4 ring-[var(--cor-primaria)]/40'
                  : 'border-[var(--cor-borda)]'
              }`}
            >
              <Icone iconeId={opcao.iconeId as IconeId} className="h-14 w-14" />
            </button>
          )
        })}
      </fieldset>

      <p className="min-h-8 text-lg font-medium" aria-live="assertive">
        {feedback === 'correto' && (
          <span className="text-[var(--cor-sucesso)]">Isso! 🎉</span>
        )}
        {feedback === 'incorreto' && (
          <span className="text-[var(--cor-texto-suave)]">Tente de novo</span>
        )}
      </p>
    </div>
  )
}
