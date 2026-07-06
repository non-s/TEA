import { useMemo, useState } from 'react'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { falaCorrespondeResposta } from '../../curriculo/reconhecimentoFala'
import { useTentativa } from '../../hooks/useTentativa'
import { useSpeech } from '../../hooks/useSpeech'
import { useReconhecimentoFala } from '../../hooks/useReconhecimentoFala'
import { respostaPorVozAtiva } from '../../preferenciasDispositivo'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { ApoioPreferencial } from '../../curriculo/apoioPreferencial'
import type {
  AcessoPreferencial,
  RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import { Botao } from '../ui/Botao'
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

const ID_RESPOSTA_FALA_INCORRETA = 'fala-nao-corresponde'

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
 * da letra mostrada, em vez de apenas localizá-la (nomeação receptiva). A
 * produção acontece por seleção entre opções de nome (acessível também a
 * crianças não-verbais) e, quando o dispositivo permite e a família ativou
 * em Configurações, também por fala — nunca só por fala, sempre com a
 * opção de toque disponível.
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

  function processarResposta(estimuloId: string, rotulo: string) {
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

  function aoClicarEmOpcao(estimuloId: string, rotulo: string) {
    processarResposta(estimuloId, rotulo)
  }

  const reconhecimentoFala = useReconhecimentoFala((texto) => {
    const respostasAceitas = [
      atividade.resposta.rotulo,
      atividade.resposta.audioTexto,
    ].filter((valor): valor is string => Boolean(valor))
    const correspondeu = falaCorrespondeResposta(texto, respostasAceitas)
    processarResposta(
      correspondeu ? atividade.resposta.id : ID_RESPOSTA_FALA_INCORRETA,
      atividade.resposta.rotulo,
    )
  })
  const vozHabilitada = respostaPorVozAtiva() && reconhecimentoFala.disponivel

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

        {vozHabilitada && (
          <div
            className="flex flex-col items-center gap-2"
            aria-live="polite"
          >
            <Botao
              type="button"
              variante="secundario"
              disabled={!!feedback}
              onClick={
                reconhecimentoFala.ouvindo
                  ? reconhecimentoFala.pararEscuta
                  : reconhecimentoFala.iniciarEscuta
              }
            >
              {reconhecimentoFala.ouvindo
                ? 'Ouvindo... toque para parar'
                : 'Falar a resposta'}
            </Botao>
            {reconhecimentoFala.erro && (
              <p role="alert" className="text-sm text-[var(--cor-erro)]">
                {reconhecimentoFala.erro}
              </p>
            )}
            <p className="text-sm text-[var(--cor-texto-suave)]">
              ou toque numa opção abaixo
            </p>
          </div>
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
