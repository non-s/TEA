import { useMemo, useState } from 'react'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { embaralhar } from '../../utils/embaralhar'
import { useTentativa, type RegistrarTentativa } from '../../hooks/useTentativa'
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

interface EmparelhamentoIdenticoProps {
  atividade: Atividade
  aoDominar: () => void
  perfilId: string
  apoioPreferencial?: ApoioPreferencial
  acessoPreferencial?: AcessoPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
  limiteTentativasAntesPausa?: number
  registrarTentativa?: RegistrarTentativa
  sinalComunicarPronto?: number
  sinalPedirAjuda?: number
  tentativasAnteriores?: Tentativa[]
  aoEncerrarSessao?: () => void
  aoPedirPausa?: () => void
}

type Feedback = 'correto' | 'incorreto' | null

export function EmparelhamentoIdentico({
  atividade,
  aoDominar,
  perfilId,
  apoioPreferencial,
  acessoPreferencial,
  regulacaoPreferencial,
  limiteTentativasAntesPausa,
  registrarTentativa,
  sinalComunicarPronto,
  sinalPedirAjuda,
  tentativasAnteriores,
  aoEncerrarSessao,
  aoPedirPausa,
}: EmparelhamentoIdenticoProps) {
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
    registrarTentativa,
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

  const rotuloAlvoFalado = atividade.alvo.audioTexto ?? atividade.alvo.rotulo
  const textoInstrucao = 'Toque na figura igual a esta:'
  const instrucao = `${textoInstrucao} ${rotuloAlvoFalado}`

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
      alvo={
        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          titulo={atividade.alvo.rotulo}
          className="h-20 w-20 text-[var(--cor-primaria-escura)]"
        />
      }
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-xl text-[var(--cor-texto)]" aria-live="polite">
          {textoInstrucao}
        </p>

        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          titulo={atividade.alvo.rotulo}
          className="h-24 w-24 text-[var(--cor-primaria-escura)] drop-shadow-sm"
        />

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
          classNameGrade="grid grid-cols-2 gap-6 border-0 p-0 sm:grid-cols-3"
          aoEscolher={(opcao) => aoClicarEmOpcao(opcao.id)}
          renderOpcao={(opcao) => (
            <Icone iconeId={opcao.iconeId as IconeId} className="h-14 w-14" />
          )}
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
