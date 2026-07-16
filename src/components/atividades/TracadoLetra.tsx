import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import {
  caractereDaLetra,
  type LetraIconeId,
} from '../../curriculo/ativos/tipos'
import {
  avaliarTracado,
  guiasLetras,
  type PontoTracado,
} from '../../curriculo/tracadoLetras'
import { useTentativa } from '../../hooks/useTentativa'
import { useSpeech } from '../../hooks/useSpeech'
import type { ApoioPreferencial } from '../../curriculo/apoioPreferencial'
import type { RegulacaoPreferencial } from '../../curriculo/perfilApoio'
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

interface TracadoLetraProps {
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

const ID_RESPOSTA_INCORRETA_TRACADO = 'tracado-nao-corresponde'

function pontosParaTraco(pontos: PontoTracado[]): string {
  return pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(' ')
}

/**
 * Prática grafomotora: a criança traça a letra sobre um guia pontilhado.
 * Diferente das outras atividades (escolha entre opções), aqui a resposta é
 * um gesto contínuo — por isso não usa OpcoesResposta. A avaliação
 * (curriculo/tracadoLetras.ts) é deliberadamente tolerante, e a criança
 * decide quando enviar o traçado (nunca é avaliado automaticamente
 * enquanto desenha).
 */
export function TracadoLetra({
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
}: TracadoLetraProps) {
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
  const [tracosDesenhados, setTracosDesenhados] = useState<PontoTracado[][]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const desenhandoRef = useRef(false)

  const letra = caractereDaLetra(atividade.alvo.iconeId as LetraIconeId)
  const guia = guiasLetras[letra.toUpperCase()] ?? []
  const instrucao = `Trace a letra ${letra} com o dedo ou o mouse, seguindo o guia pontilhado.`

  function pontoRelativo(
    evento: ReactPointerEvent<SVGSVGElement>,
  ): PontoTracado {
    const retangulo = svgRef.current?.getBoundingClientRect()
    if (!retangulo || retangulo.width === 0 || retangulo.height === 0) {
      return { x: 0, y: 0 }
    }
    return {
      x: ((evento.clientX - retangulo.left) / retangulo.width) * 100,
      y: ((evento.clientY - retangulo.top) / retangulo.height) * 100,
    }
  }

  function aoIniciarTraco(evento: ReactPointerEvent<SVGSVGElement>) {
    if (feedback) return
    desenhandoRef.current = true
    // jsdom (testes) não implementa a Pointer Capture API.
    evento.currentTarget.setPointerCapture?.(evento.pointerId)
    setTracosDesenhados((atuais) => [...atuais, [pontoRelativo(evento)]])
  }

  function aoMoverTraco(evento: ReactPointerEvent<SVGSVGElement>) {
    if (!desenhandoRef.current || feedback) return
    const ponto = pontoRelativo(evento)
    setTracosDesenhados((atuais) => {
      if (atuais.length === 0) return atuais
      const copia = atuais.slice()
      copia[copia.length - 1] = [...copia[copia.length - 1], ponto]
      return copia
    })
  }

  function aoTerminarTraco() {
    desenhandoRef.current = false
  }

  function aoLimpar() {
    setTracosDesenhados([])
  }

  function aoVerificar() {
    if (feedback || tracosDesenhados.length === 0) return

    const resultado = avaliarTracado(tracosDesenhados, guia)
    const idResposta = resultado.aprovado
      ? atividade.resposta.id
      : ID_RESPOSTA_INCORRETA_TRACADO
    const resultadoTentativa = responder(idResposta)
    setFeedback(resultadoTentativa.correto ? 'correto' : 'incorreto')
    falar(resultadoTentativa.correto ? `Isso! ${letra}` : 'Tente de novo')

    setTimeout(() => {
      setFeedback(null)
      setTracosDesenhados([])
      if (resultadoTentativa.dominada) {
        aoDominar()
      }
    }, 900)
  }

  return (
    <PrepararAtividade
      instrucao={instrucao}
      rotuloAtividade={atividade.alvo.rotulo}
      apoioPreferencial={apoioPreferencial}
      regulacaoPreferencial={regulacaoPreferencial}
      alvo={
        <span
          aria-hidden="true"
          className="text-6xl font-bold text-[var(--cor-primaria-escura)]"
        >
          {letra}
        </span>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <p className="text-xl text-[var(--cor-texto)]" aria-live="polite">
          {instrucao}
        </p>

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

        {/* Escala com --min-alvo-atividade (maior quando "Alvos maiores" está
            ligado): traçado é a atividade mais exigente motoramente do app,
            então é a que mais se beneficia de mais espaço físico de desenho. */}
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          role={'img' as const}
          aria-label={`Área para traçar a letra ${letra}`}
          className="h-[calc(var(--min-alvo-atividade)*3)] w-[calc(var(--min-alvo-atividade)*3)] touch-none rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] shadow-[var(--sombra-cartao)]"
          onPointerDown={aoIniciarTraco}
          onPointerMove={aoMoverTraco}
          onPointerUp={aoTerminarTraco}
          onPointerLeave={aoTerminarTraco}
        >
          {guia.map((traco, indice) => (
            <polyline
              key={indice}
              points={pontosParaTraco(traco)}
              fill="none"
              stroke="var(--cor-borda)"
              strokeWidth="6"
              strokeDasharray="4 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {tracosDesenhados.map((traco, indice) => (
            <polyline
              key={indice}
              points={pontosParaTraco(traco)}
              fill="none"
              stroke="var(--cor-primaria)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>

        <div className="flex flex-wrap justify-center gap-3">
          <Botao
            type="button"
            variante="secundario"
            onClick={aoLimpar}
            disabled={!!feedback || tracosDesenhados.length === 0}
          >
            Limpar
          </Botao>
          <Botao
            type="button"
            onClick={aoVerificar}
            disabled={!!feedback || tracosDesenhados.length === 0}
          >
            Verificar traçado
          </Botao>
        </div>

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
