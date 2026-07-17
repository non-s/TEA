import { useMemo, useState } from 'react'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { ApoioPreferencial } from '../../curriculo/apoioPreferencial'
import type {
  AcessoPreferencial,
  RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import {
  classesFeedbackCorreto,
  classesFeedbackResposta,
  classesFeedbackTentativa,
} from '../ui/alvosInteracao'
import { ApoioAtual } from './ApoioAtual'
import { AvisoRegistroTentativa } from './AvisoRegistroTentativa'
import { PrepararAtividade } from './PrepararAtividade'
import { PausaSugerida } from './PausaSugerida'
import { OpcoesResposta } from './OpcoesResposta'
import { ApoioLeituraCompartilhada } from './ApoioLeituraCompartilhada'

interface LeituraFraseProps {
  atividade: Atividade
  aoDominar: () => void
  perfilId: string
  apoioPreferencial?: ApoioPreferencial
  acessoPreferencial?: AcessoPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
  limiteTentativasAntesPausa?: number
  sinalComunicarPronto?: number
  sinalPedirAjuda?: number
  tentativasAnteriores?: Tentativa[]
  aoEncerrarSessao?: () => void
  aoPedirPausa?: () => void
}

type Feedback = 'correto' | 'incorreto' | null

export function LeituraFrase({
  atividade,
  aoDominar,
  perfilId,
  apoioPreferencial,
  acessoPreferencial,
  regulacaoPreferencial,
  limiteTentativasAntesPausa,
  sinalComunicarPronto,
  sinalPedirAjuda,
  tentativasAnteriores,
  aoEncerrarSessao,
  aoPedirPausa,
}: LeituraFraseProps) {
  const {
    responder,
    dicaAtual,
    sugestaoEncerrarSessao,
    sugestaoPausa,
    erroRegistroTentativa,
    dispensarSugestaoEncerrarSessao,
    dispensarSugestaoPausa,
  } = useTentativa(atividade, perfilId, {
    limiteTentativasAntesPausa,
    sinalComunicarPronto,
    sinalPedirAjuda,
    tentativasAnteriores,
  })
  const { preferencias } = usePreferencias()
  const [feedback, setFeedback] = useState<Feedback>(null)

  const opcoes = useMemo(
    () => embaralhar([atividade.resposta, ...atividade.distratores]),
    [atividade],
  )

  const fraseFalada = atividade.alvo.audioTexto ?? atividade.alvo.rotulo
  const instrucao = `Toque na frase: ${fraseFalada}`

  function aoClicarEmOpcao(estimuloId: string) {
    if (feedback) return

    const resultado = responder(estimuloId)
    setFeedback(resultado.correto ? 'correto' : 'incorreto')

    setTimeout(() => {
      setFeedback(null)
      if (resultado.dominada) {
        aoDominar()
      }
    }, 700)
  }

  return (
    <PrepararAtividade
      instrucao={instrucao}
      rotuloAtividade={atividade.alvo.rotulo}
      apoioPreferencial={apoioPreferencial}
      regulacaoPreferencial={regulacaoPreferencial}
      apoioMediador={
        <ApoioLeituraCompartilhada convite={`Mostre a frase: ${fraseFalada}`} />
      }
    >
      <div className="flex flex-col items-center gap-8">
        <p
          className="text-xl leading-8 text-[var(--cor-texto)]"
          aria-live="polite"
        >
          {instrucao}
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

        <OpcoesResposta
          opcoes={opcoes}
          respostaId={atividade.resposta.id}
          legenda="Opções de frase"
          acessoPreferencial={acessoPreferencial}
          animacoes={preferencias.animacoes}
          tipoDicaAtual={dicaAtual?.tipo}
          classNameGrade="grid w-full grid-cols-1 gap-4 border-0 p-0"
          classNameOpcao="w-full px-5 py-5 text-xl font-semibold leading-8 [overflow-wrap:anywhere]"
          aoEscolher={(opcao) => aoClicarEmOpcao(opcao.id)}
          renderOpcao={(opcao) => opcao.rotulo}
        />

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
