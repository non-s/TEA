import { useEffect, useMemo, useRef, useState } from 'react'
import type { Atividade, Tentativa } from '../curriculo/tipos'

const NIVEL_SUPORTE_TOTAL = 0

export type RegistrarTentativa = (
  tentativa: Tentativa,
) => Promise<unknown> | unknown

interface EstadoAtividade {
  nivelDicaAtual: number
  dominada: boolean
}

const estadoInicial: EstadoAtividade = {
  nivelDicaAtual: NIVEL_SUPORTE_TOTAL,
  dominada: false,
}

function estadoInicialDaAtividade(
  atividade: Atividade,
  tentativasAnteriores: Tentativa[] = [],
): EstadoAtividade {
  return tentativasAnteriores
    .filter((tentativa) => tentativa.atividadeId === atividade.id)
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce(
      (estado, tentativa) =>
        proximoEstado(
          { ...estado, nivelDicaAtual: tentativa.nivelDicaUsado },
          tentativa.resultado === 'correto',
        ),
      estadoInicial,
    )
}

function assinaturaTentativasDaAtividade(
  atividadeId: string,
  tentativasAnteriores: Tentativa[] = [],
): string {
  return tentativasAnteriores
    .filter((tentativa) => tentativa.atividadeId === atividadeId)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(
      (tentativa) =>
        `${tentativa.timestamp}:${tentativa.resultado}:${tentativa.nivelDicaUsado}`,
    )
    .join('|')
}

function estadosIguais(a: EstadoAtividade, b: EstadoAtividade): boolean {
  return a.nivelDicaAtual === b.nivelDicaAtual && a.dominada === b.dominada
}

/**
 * Domina assim que a criança acerta uma vez, em qualquer nível de apoio —
 * ela não precisa "provar" a mesma resposta várias vezes. Um erro só
 * aumenta o apoio pra próxima tentativa, sem penalizar nem travar a
 * atividade.
 */
function proximoEstado(
  atual: EstadoAtividade,
  correto: boolean,
): EstadoAtividade {
  if (!correto) {
    return {
      nivelDicaAtual: Math.max(0, atual.nivelDicaAtual - 1),
      dominada: false,
    }
  }

  return {
    nivelDicaAtual: atual.nivelDicaAtual,
    dominada: true,
  }
}

function estadoComMaisApoio(atual: EstadoAtividade): EstadoAtividade {
  return {
    ...atual,
    nivelDicaAtual: NIVEL_SUPORTE_TOTAL,
  }
}

async function registrarTentativaPadrao(
  perfilId: string,
  tentativa: Tentativa,
) {
  const { registrarTentativa } = await import('../local/perfilLocal')
  return registrarTentativa(perfilId, tentativa)
}

export function useTentativa(
  atividade: Atividade,
  perfilId: string,
  opcoes: {
    limiteTentativasAntesEncerrar?: number
    limiteTentativasAntesPausa?: number
    registrarTentativa?: RegistrarTentativa
    sinalComunicarPronto?: number
    sinalPedirAjuda?: number
    tentativasAnteriores?: Tentativa[]
  } = {},
) {
  const inicioTentativaRef = useRef(Date.now())
  const ultimoSinalAjudaRef = useRef(opcoes.sinalPedirAjuda ?? 0)
  const ultimoSinalProntoRef = useRef(opcoes.sinalComunicarPronto ?? 0)
  const tentativasAnterioresRef = useRef<Tentativa[]>([])
  tentativasAnterioresRef.current = opcoes.tentativasAnteriores ?? []
  const assinaturaHistorico = assinaturaTentativasDaAtividade(
    atividade.id,
    tentativasAnterioresRef.current,
  )
  const [estado, setEstado] = useState<EstadoAtividade>(() =>
    estadoInicialDaAtividade(atividade, tentativasAnterioresRef.current),
  )
  const [tentativasSessao, setTentativasSessao] = useState(0)
  const [sugestaoEncerrarSessao, setSugestaoEncerrarSessao] = useState(false)
  const [sugestaoPausa, setSugestaoPausa] = useState(false)
  const [erroRegistroTentativa, setErroRegistroTentativa] = useState<
    string | null
  >(null)
  const limiteTentativasAntesEncerrar =
    opcoes.limiteTentativasAntesEncerrar ??
    (opcoes.limiteTentativasAntesPausa
      ? opcoes.limiteTentativasAntesPausa * 3
      : undefined)

  useEffect(() => {
    if (tentativasSessao > 0) return
    const proximo = estadoInicialDaAtividade(
      atividade,
      tentativasAnterioresRef.current,
    )
    setEstado((atual) => (estadosIguais(atual, proximo) ? atual : proximo))
  }, [atividade, assinaturaHistorico, tentativasSessao])

  useEffect(() => {
    const sinalAtual = opcoes.sinalPedirAjuda ?? 0
    if (sinalAtual === ultimoSinalAjudaRef.current) return

    ultimoSinalAjudaRef.current = sinalAtual
    if (sinalAtual <= 0) return

    setEstado((atual) => estadoComMaisApoio(atual))
    inicioTentativaRef.current = Date.now()
  }, [opcoes.sinalPedirAjuda])

  useEffect(() => {
    const sinalAtual = opcoes.sinalComunicarPronto ?? 0
    if (sinalAtual === ultimoSinalProntoRef.current) return

    ultimoSinalProntoRef.current = sinalAtual
    if (sinalAtual <= 0) return

    setSugestaoPausa(false)
    setSugestaoEncerrarSessao(false)
    inicioTentativaRef.current = Date.now()
  }, [opcoes.sinalComunicarPronto])

  const dicaAtual = useMemo(
    () => atividade.dicas.find((d) => d.ordem === estado.nivelDicaAtual),
    [atividade.dicas, estado.nivelDicaAtual],
  )

  function responder(estimuloId: string): {
    correto: boolean
    dominada: boolean
  } {
    const correto = estimuloId === atividade.resposta.id
    const tempoRespostaMs = Date.now() - inicioTentativaRef.current
    const totalTentativasSessao = tentativasSessao + 1
    const tentativa: Tentativa = {
      atividadeId: atividade.id,
      moduloId: atividade.moduloId,
      timestamp: Date.now(),
      resultado: correto ? 'correto' : 'incorreto',
      nivelDicaUsado: estado.nivelDicaAtual,
      tempoRespostaMs,
    }
    const registrar =
      opcoes.registrarTentativa ??
      ((tentativaAtual: Tentativa) =>
        registrarTentativaPadrao(perfilId, tentativaAtual))

    void Promise.resolve()
      .then(() => registrar(tentativa))
      .then(() => {
        setErroRegistroTentativa(null)
      })
      .catch(() => {
        setErroRegistroTentativa(
          'A resposta foi respeitada, mas ainda não foi salva. Verifique a conexão antes de encerrar.',
        )
      })

    const novoEstado = proximoEstado(estado, correto)
    setEstado(novoEstado)
    setTentativasSessao(totalTentativasSessao)
    if (
      limiteTentativasAntesEncerrar &&
      totalTentativasSessao % limiteTentativasAntesEncerrar === 0
    ) {
      setSugestaoPausa(false)
      setSugestaoEncerrarSessao(true)
    } else if (
      opcoes.limiteTentativasAntesPausa &&
      totalTentativasSessao % opcoes.limiteTentativasAntesPausa === 0
    ) {
      setSugestaoPausa(true)
    }
    inicioTentativaRef.current = Date.now()

    return { correto, dominada: novoEstado.dominada }
  }

  function dispensarSugestaoPausa() {
    setSugestaoPausa(false)
  }

  function dispensarSugestaoEncerrarSessao() {
    setSugestaoEncerrarSessao(false)
  }

  return {
    responder,
    dicaAtual,
    dominada: estado.dominada,
    nivelDicaAtual: estado.nivelDicaAtual,
    erroRegistroTentativa,
    tentativasSessao,
    sugestaoEncerrarSessao,
    sugestaoPausa,
    dispensarSugestaoEncerrarSessao,
    dispensarSugestaoPausa,
  }
}
