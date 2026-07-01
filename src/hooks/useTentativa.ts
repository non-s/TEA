import { useMemo, useRef, useState } from 'react'
import type { Atividade } from '../curriculo/tipos'
import { registrarTentativa } from '../progresso/tentativas'

const NIVEL_INDEPENDENTE = 2

interface EstadoAtividade {
  nivelDicaAtual: number
  acertosConsecutivos: number
  acertosConsecutivosNoNivelIndependente: number
  dominada: boolean
}

const estadoInicial: EstadoAtividade = {
  nivelDicaAtual: NIVEL_INDEPENDENTE,
  acertosConsecutivos: 0,
  acertosConsecutivosNoNivelIndependente: 0,
  dominada: false,
}

function proximoEstado(
  atual: EstadoAtividade,
  correto: boolean,
  acertosConsecutivosNecessarios: number,
): EstadoAtividade {
  if (!correto) {
    return {
      ...atual,
      acertosConsecutivos: 0,
      acertosConsecutivosNoNivelIndependente: 0,
      nivelDicaAtual: Math.max(0, atual.nivelDicaAtual - 1),
    }
  }

  const acertosConsecutivos = atual.acertosConsecutivos + 1
  const noIndependente = atual.nivelDicaAtual === NIVEL_INDEPENDENTE
  const acertosConsecutivosNoNivelIndependente = noIndependente
    ? atual.acertosConsecutivosNoNivelIndependente + 1
    : 0

  // Esmaece a dica (dá menos suporte) após 2 acertos seguidos no nível atual.
  const deveFazerFading =
    !noIndependente && acertosConsecutivos > 0 && acertosConsecutivos % 2 === 0
  const nivelDicaAtual = deveFazerFading
    ? Math.min(NIVEL_INDEPENDENTE, atual.nivelDicaAtual + 1)
    : atual.nivelDicaAtual

  const dominada =
    noIndependente &&
    acertosConsecutivosNoNivelIndependente >= acertosConsecutivosNecessarios

  return {
    nivelDicaAtual,
    acertosConsecutivos,
    acertosConsecutivosNoNivelIndependente,
    dominada,
  }
}

export function useTentativa(atividade: Atividade) {
  const inicioTentativaRef = useRef(Date.now())
  const [estado, setEstado] = useState<EstadoAtividade>(estadoInicial)

  const dicaAtual = useMemo(
    () => atividade.dicas.find((d) => d.ordem === estado.nivelDicaAtual),
    [atividade.dicas, estado.nivelDicaAtual],
  )

  function responder(estimuloId: string): {
    correto: boolean
    dominada: boolean
  } {
    const correto = estimuloId === atividade.alvo.id
    const tempoRespostaMs = Date.now() - inicioTentativaRef.current

    registrarTentativa({
      atividadeId: atividade.id,
      moduloId: atividade.moduloId,
      timestamp: Date.now(),
      resultado: correto ? 'correto' : 'incorreto',
      nivelDicaUsado: estado.nivelDicaAtual,
      tempoRespostaMs,
    })

    const novoEstado = proximoEstado(
      estado,
      correto,
      atividade.criteriosDominio.acertosConsecutivosNecessarios,
    )
    setEstado(novoEstado)
    inicioTentativaRef.current = Date.now()

    return { correto, dominada: novoEstado.dominada }
  }

  return {
    responder,
    dicaAtual,
    dominada: estado.dominada,
    nivelDicaAtual: estado.nivelDicaAtual,
  }
}
