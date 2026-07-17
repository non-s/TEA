import { useMemo, useState } from 'react'
import type { Atividade, Estimulo, Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { ApoioPreferencial } from '../../curriculo/apoioPreferencial'
import type { RegulacaoPreferencial } from '../../curriculo/perfilApoio'
import { classesAlvoToque } from '../ui/alvosInteracao'
import {
  classesFeedbackCorreto,
  classesFeedbackResposta,
  classesFeedbackTentativa,
} from '../ui/alvosInteracao'
import { ApoioAtual } from './ApoioAtual'
import { AvisoRegistroTentativa } from './AvisoRegistroTentativa'
import { PrepararAtividade } from './PrepararAtividade'
import { PausaSugerida } from './PausaSugerida'

interface MontagemPalavraProps {
  atividade: Atividade
  aoDominar: () => void
  uidResponsavel: string
  perfilId: string
  apoioPreferencial?: ApoioPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
  limiteTentativasAntesPausa?: number
  sinalComunicarPronto?: number
  sinalPedirAjuda?: number
  tentativasAnteriores?: Tentativa[]
  aoEncerrarSessao?: () => void
  aoPedirPausa?: () => void
}

type Feedback = 'correto' | 'incorreto' | null

const ID_PECA_INCORRETA = 'montagem-peca-incorreta'
const ATRASO_FEEDBACK_MS = 700
const ATRASO_FEEDBACK_ERRO_MS = 900

function ChipEscolhaEsta() {
  return (
    <span className="pointer-events-none rounded-full bg-[var(--cor-primaria-clara)] px-2 py-0.5 text-xs font-semibold text-[var(--cor-primaria-escura)]">
      Toque agora
    </span>
  )
}

/**
 * "Escrita" acessível por toque: em vez de digitar ou desenhar (o que
 * excluiria crianças com baixa precisão motora ou que usam escolha
 * mediada/acionador), a criança reconstrói a palavra tocando as sílabas
 * certas em ordem, entre algumas sílabas erradas misturadas. É produção
 * real (a criança decide a sequência, não só reconhece a palavra pronta
 * como em Formação de Palavras), mas continua dentro do mesmo método de
 * toque/seleção usado em toda a trilha — sem exigir fala, digitação ou
 * caligrafia.
 */
export function MontagemPalavra({
  atividade,
  aoDominar,
  uidResponsavel,
  perfilId,
  apoioPreferencial,
  regulacaoPreferencial,
  limiteTentativasAntesPausa,
  sinalComunicarPronto,
  sinalPedirAjuda,
  tentativasAnteriores,
  aoEncerrarSessao,
  aoPedirPausa,
}: MontagemPalavraProps) {
  const {
    responder,
    dicaAtual,
    sugestaoEncerrarSessao,
    sugestaoPausa,
    erroRegistroTentativa,
    dispensarSugestaoEncerrarSessao,
    dispensarSugestaoPausa,
  } = useTentativa(atividade, uidResponsavel, perfilId, {
    limiteTentativasAntesPausa,
    sinalComunicarPronto,
    sinalPedirAjuda,
    tentativasAnteriores,
  })
  const { preferencias } = usePreferencias()
  const [progresso, setProgresso] = useState<Estimulo[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [versaoEmbaralhamento, setVersaoEmbaralhamento] = useState(0)

  const pecas = useMemo(() => atividade.pecas ?? [], [atividade])
  const grupoPecas = useMemo(
    () => embaralhar([...pecas, ...atividade.distratores]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [atividade, versaoEmbaralhamento],
  )

  const instrucao = 'Toque as sílabas em ordem para formar a palavra'
  const indiceAtual = progresso.length
  const pecaCorretaAtual = pecas[indiceAtual]
  const idsUsados = new Set(progresso.map((peca) => peca.id))
  const pecasDisponiveis = grupoPecas.filter((peca) => !idsUsados.has(peca.id))

  const emModelagem = dicaAtual?.tipo === 'modelagem'
  const emDestaqueVisual = dicaAtual?.tipo === 'destaque-visual' || emModelagem
  const idPecaDestacada = emDestaqueVisual
    ? pecasDisponiveis.find((peca) => peca.rotulo === pecaCorretaAtual?.rotulo)
        ?.id
    : undefined

  function reiniciarTentativa() {
    setFeedback(null)
    setProgresso([])
    setVersaoEmbaralhamento((valor) => valor + 1)
  }

  function aoTocarPeca(peca: Estimulo) {
    if (feedback || !pecaCorretaAtual) return

    if (peca.rotulo !== pecaCorretaAtual.rotulo) {
      const resultado = responder(ID_PECA_INCORRETA)
      setFeedback('incorreto')
      setTimeout(() => {
        reiniciarTentativa()
        if (resultado.dominada) aoDominar()
      }, ATRASO_FEEDBACK_ERRO_MS)
      return
    }

    const novoProgresso = [...progresso, peca]
    setProgresso(novoProgresso)

    if (novoProgresso.length < pecas.length) return

    const resultado = responder(atividade.resposta.id)
    setFeedback('correto')
    setTimeout(() => {
      reiniciarTentativa()
      if (resultado.dominada) aoDominar()
    }, ATRASO_FEEDBACK_MS)
  }

  return (
    <PrepararAtividade
      instrucao={instrucao}
      rotuloAtividade={atividade.alvo.rotulo}
      apoioPreferencial={apoioPreferencial}
      regulacaoPreferencial={regulacaoPreferencial}
      alvo={
        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          titulo="Palavra a montar"
          className="h-16 w-16 text-[var(--cor-primaria-escura)]"
        />
      }
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-xl text-[var(--cor-texto)]" aria-live="polite">
          {instrucao}
        </p>

        <p className="text-3xl font-black tracking-widest text-[var(--cor-primaria-escura)]">
          {atividade.alvo.rotulo}
        </p>

        <ApoioAtual dicaAtual={dicaAtual} />
        <AvisoRegistroTentativa mensagem={erroRegistroTentativa} />
        {(sugestaoPausa || sugestaoEncerrarSessao) && (
          <PausaSugerida
            tipo={sugestaoEncerrarSessao ? 'encerrar' : 'pausa'}
            regulacaoPreferencial={regulacaoPreferencial}
            aoEncerrar={() => {
              dispensarSugestaoEncerrarSessao()
              aoEncerrarSessao?.()
            }}
            aoPausar={() => {
              dispensarSugestaoPausa()
              dispensarSugestaoEncerrarSessao()
              aoPedirPausa?.()
            }}
            aoContinuar={() => {
              dispensarSugestaoPausa()
              dispensarSugestaoEncerrarSessao()
            }}
          />
        )}

        <div
          className="flex min-h-16 flex-wrap items-center justify-center gap-2"
          aria-live="polite"
          aria-label={`${progresso.length} de ${pecas.length} sílabas colocadas`}
        >
          {pecas.map((peca, indice) => {
            const preenchida = indice < progresso.length
            return (
              <span
                key={peca.id}
                aria-hidden="true"
                className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold ${
                  preenchida
                    ? 'border-[var(--cor-sucesso)] bg-[var(--cor-sucesso-clara)] text-[var(--cor-sucesso)]'
                    : 'border-dashed border-[var(--cor-borda)] text-[var(--cor-texto-suave)]'
                }`}
              >
                {preenchida ? progresso[indice].rotulo : '?'}
              </span>
            )
          })}
        </div>

        <fieldset className="grid grid-cols-3 gap-3 border-0 p-0 sm:grid-cols-4">
          <legend className="sr-only">Sílabas disponíveis</legend>
          {pecasDisponiveis.map((peca) => {
            const destacada = peca.id === idPecaDestacada
            return (
              <button
                key={peca.id}
                type="button"
                disabled={!!feedback}
                onClick={() => aoTocarPeca(peca)}
                aria-label={
                  destacada ? `${peca.rotulo}. Toque agora` : peca.rotulo
                }
                className={classesAlvoToque({
                  animacoes: preferencias.animacoes,
                  destacado: destacada,
                  className: 'flex-col gap-1 px-4 py-3 text-xl font-bold',
                })}
              >
                {peca.rotulo}
                {destacada && <ChipEscolhaEsta />}
              </button>
            )
          })}
        </fieldset>

        <p
          className={classesFeedbackResposta()}
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback === 'correto' && (
            <span className={classesFeedbackCorreto()}>Isso!</span>
          )}
          {feedback === 'incorreto' && (
            <span className={classesFeedbackTentativa()}>Tente de novo</span>
          )}
        </p>
      </div>
    </PrepararAtividade>
  )
}
