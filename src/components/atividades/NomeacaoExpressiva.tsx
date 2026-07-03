import { useMemo, useState } from 'react'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa } from '../../hooks/useTentativa'
import { useSpeech } from '../../hooks/useSpeech'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { ApoioPreferencial } from '../../curriculo/apoioPreferencial'
import type {
  AcessoPreferencial,
  RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import { OuvirInstrucao } from '../ui/OuvirInstrucao'
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

interface NomeacaoExpressivaProps {
  atividade: Atividade
  aoDominar: () => void
  uidResponsavel: string
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
  apoioPreferencial,
  acessoPreferencial,
  regulacaoPreferencial,
  limiteTentativasAntesPausa,
  sinalComunicarPronto,
  sinalPedirAjuda,
  tentativasAnteriores,
  aoEncerrarSessao,
  aoPedirPausa,
}: NomeacaoExpressivaProps) {
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
  const { falar } = useSpeech()
  const { preferencias } = usePreferencias()
  const [feedback, setFeedback] = useState<Feedback>(null)

  const opcoes = useMemo(
    () => embaralhar([atividade.resposta, ...atividade.distratores]),
    [atividade],
  )

  const instrucao = 'Qual é o nome desta letra?'

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
    <PrepararAtividade
      instrucao={instrucao}
      rotuloAtividade={atividade.alvo.rotulo}
      apoioPreferencial={apoioPreferencial}
      regulacaoPreferencial={regulacaoPreferencial}
      alvo={
        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          titulo="Letra a nomear"
          className="h-20 w-20 text-[var(--cor-primaria-escura)]"
        />
      }
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-xl text-[var(--cor-texto)]" aria-live="polite">
          {instrucao}
        </p>

        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          titulo="Letra a nomear"
          className="h-24 w-24 text-[var(--cor-primaria-escura)] drop-shadow-sm"
        />

        <OuvirInstrucao texto={instrucao} />
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
          legenda="Opções de resposta"
          acessoPreferencial={acessoPreferencial}
          animacoes={preferencias.animacoes}
          tipoDicaAtual={dicaAtual?.tipo}
          classNameGrade="grid grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-3"
          classNameOpcao="px-6 py-4 text-2xl font-semibold"
          aoEscolher={(opcao) => aoClicarEmOpcao(opcao.id, opcao.rotulo)}
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
