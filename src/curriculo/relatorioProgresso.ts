import type { Atividade, Modulo, Tentativa, Trilha } from './tipos'
import {
  encontrarAtividadeParaRevisao,
  encontrarProximaAtividadeDisponivel,
  moduloDesbloqueado,
  type RevisaoEspacada,
} from './progressao'
import type { PlanoIndividual } from '../firebase/perfis'

export type StatusModulo =
  'bloqueado' | 'nao-iniciado' | 'em-pratica' | 'dominado'

export interface ResumoModuloProgresso {
  modulo: Modulo
  status: StatusModulo
  totalTentativas: number
  percentualAcerto: number | null
  dominadasNoModulo: number
  totalAtividades: number
  mediaNivelDica: number | null
}

export interface RelatorioProgresso {
  totalAtividades: number
  totalDominadas: number
  percentualGeral: number
  resumoPorModulo: ResumoModuloProgresso[]
  proximaAtividade: Atividade | null
  revisaoEspacada: RevisaoEspacada | null
  ultimasTentativas: TentativaRelatorio[]
  orientacao: string
  recomendacaoMediacao: string
  recomendacaoApoioGraduado: string
}

export interface TentativaRelatorio {
  tentativa: Tentativa
  atividadeRotulo: string
  moduloTitulo: string
  apoioUsado: 'alto' | 'moderado' | 'baixo'
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}

function statusModulo(
  modulo: Modulo,
  dominadasNoModulo: number,
  totalTentativas: number,
  dominadas: Set<string>,
  trilha?: Trilha,
): StatusModulo {
  if (!moduloDesbloqueado(modulo.preRequisitoModuloId, dominadas, trilha)) {
    return 'bloqueado'
  }
  if (dominadasNoModulo === modulo.atividades.length) return 'dominado'
  if (totalTentativas === 0) return 'nao-iniciado'
  return 'em-pratica'
}

function criarOrientacao(
  resumoPorModulo: ResumoModuloProgresso[],
  proximaAtividade: Atividade | null,
): string {
  if (!proximaAtividade) {
    return 'A trilha atual foi dominada. Mantenha revisões leves e avance para novas habilidades quando houver módulo disponível.'
  }

  const moduloAtual = resumoPorModulo.find(
    (resumo) => resumo.modulo.id === proximaAtividade.moduloId,
  )

  if (!moduloAtual || moduloAtual.status === 'nao-iniciado') {
    return `Comece por "${proximaAtividade.alvo.rotulo}" em ${moduloAtual?.modulo.titulo ?? 'módulo atual'}, com mediação tranquila e sem pressa.`
  }

  if (
    moduloAtual.percentualAcerto !== null &&
    moduloAtual.percentualAcerto < 60
  ) {
    return `Retome ${moduloAtual.modulo.titulo} com mais apoio visual. O objetivo agora é reduzir frustração antes de buscar independência.`
  }

  if (moduloAtual.mediaNivelDica !== null && moduloAtual.mediaNivelDica < 1.5) {
    return `Continue em ${moduloAtual.modulo.titulo}, mantendo dicas visuais por mais algumas tentativas antes de retirar suporte.`
  }

  return `Próximo passo: praticar "${proximaAtividade.alvo.rotulo}" em ${moduloAtual.modulo.titulo}.`
}

function apoioUsado(nivelDicaUsado: number): TentativaRelatorio['apoioUsado'] {
  if (nivelDicaUsado < 1) return 'alto'
  if (nivelDicaUsado < 2) return 'moderado'
  return 'baixo'
}

const textoApoioPreferencial: Record<
  PlanoIndividual['apoioPreferencial'],
  string
> = {
  visual: 'apoio visual',
  verbal: 'fala curta e previsivel',
  gestual: 'modelo gestual',
  pausa: 'pausas combinadas',
}

function criarRecomendacaoMediacao(
  planoIndividual: PlanoIndividual | undefined,
  proximaAtividade: Atividade | null,
): string {
  if (!planoIndividual?.metaAtual.trim()) {
    return 'Defina uma meta pequena para a semana e registre a resposta da crianca apos cada sessao.'
  }

  const alvo = proximaAtividade
    ? ` durante "${proximaAtividade.alvo.rotulo}"`
    : ' durante as revisoes'
  const apoio =
    textoApoioPreferencial[planoIndividual.apoioPreferencial] ??
    textoApoioPreferencial.visual
  const observacao = planoIndividual.observacaoMediador.trim()

  return [
    `Meta atual: ${planoIndividual.metaAtual.trim()}.`,
    `Use ${apoio}${alvo} e retire ajuda aos poucos quando houver conforto.`,
    observacao ? `Observacao do mediador: ${observacao}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function tentativasRecentesDaAtividade(
  tentativas: Tentativa[],
  atividadeId: string,
): Tentativa[] {
  return tentativas
    .filter((tentativa) => tentativa.atividadeId === atividadeId)
    .slice(-5)
}

function acertosIndependentesRecentes(tentativas: Tentativa[]): number {
  let total = 0

  for (let indice = tentativas.length - 1; indice >= 0; indice -= 1) {
    const tentativa = tentativas[indice]
    if (tentativa.resultado !== 'correto' || tentativa.nivelDicaUsado < 2) {
      break
    }
    total += 1
  }

  return total
}

function criarRecomendacaoApoioGraduado(
  tentativas: Tentativa[],
  proximaAtividade: Atividade | null,
  revisaoEspacada: RevisaoEspacada | null,
): string {
  const atividade = proximaAtividade ?? revisaoEspacada?.atividade ?? null

  if (!atividade) {
    return 'Mantenha revisoes curtas com apoio baixo e observe sinais de cansaco antes de ampliar a trilha.'
  }

  const recentes = tentativasRecentesDaAtividade(tentativas, atividade.id)

  if (recentes.length === 0) {
    return `Comece "${atividade.alvo.rotulo}" com espera curta, apoio visual disponivel e sem antecipar a resposta; se houver frustracao, modele e tente retirar um passo depois.`
  }

  const corretas = recentes.filter(
    (tentativa) => tentativa.resultado === 'correto',
  ).length
  const percentualAcerto = (corretas / recentes.length) * 100
  const mediaNivelDica = media(
    recentes.map((tentativa) => tentativa.nivelDicaUsado),
  )
  const independentesRecentes = acertosIndependentesRecentes(recentes)

  if (percentualAcerto < 60) {
    return `Aumente o apoio em "${atividade.alvo.rotulo}": modele ou destaque a resposta, reduza distratores se preciso e priorize conforto antes de independencia.`
  }

  if (independentesRecentes >= 3) {
    return `Mantenha apoio baixo em "${atividade.alvo.rotulo}" e generalize em outro contexto curto, sem alongar a sessao.`
  }

  if (
    percentualAcerto >= 80 &&
    mediaNivelDica !== null &&
    mediaNivelDica < 1.5
  ) {
    return `Reduza um passo de apoio em "${atividade.alvo.rotulo}": passe de modelo para destaque visual, ou de destaque para espera silenciosa.`
  }

  return `Mantenha o apoio atual em "${atividade.alvo.rotulo}" por mais algumas tentativas e retire ajuda somente quando a resposta vier com conforto.`
}

function criarTentativasRelatorio(
  trilha: Trilha,
  tentativas: Tentativa[],
): TentativaRelatorio[] {
  return [...tentativas]
    .reverse()
    .slice(0, 10)
    .map((tentativa) => {
      const modulo = trilha.modulos.find((m) => m.id === tentativa.moduloId)
      const atividade = modulo?.atividades.find(
        (a) => a.id === tentativa.atividadeId,
      )

      return {
        tentativa,
        atividadeRotulo: atividade?.alvo.rotulo ?? tentativa.atividadeId,
        moduloTitulo: modulo?.titulo ?? tentativa.moduloId,
        apoioUsado: apoioUsado(tentativa.nivelDicaUsado),
      }
    })
}

export function criarRelatorioProgresso(
  trilha: Trilha,
  atividadesDominadas: string[],
  tentativas: Tentativa[],
  planoIndividual?: PlanoIndividual,
): RelatorioProgresso {
  const dominadas = new Set(atividadesDominadas)
  const totalAtividades = trilha.modulos.reduce(
    (soma, modulo) => soma + modulo.atividades.length,
    0,
  )
  const totalDominadas = atividadesDominadas.length

  const resumoPorModulo = trilha.modulos.map((modulo) => {
    const tentativasDoModulo = tentativas.filter(
      (tentativa) => tentativa.moduloId === modulo.id,
    )
    const corretas = tentativasDoModulo.filter(
      (tentativa) => tentativa.resultado === 'correto',
    ).length
    const percentualAcerto =
      tentativasDoModulo.length > 0
        ? Math.round((corretas / tentativasDoModulo.length) * 100)
        : null
    const dominadasNoModulo = modulo.atividades.filter((atividade) =>
      dominadas.has(atividade.id),
    ).length
    const mediaNivelDica = media(
      tentativasDoModulo.map((tentativa) => tentativa.nivelDicaUsado),
    )

    return {
      modulo,
      status: statusModulo(
        modulo,
        dominadasNoModulo,
        tentativasDoModulo.length,
        dominadas,
        trilha,
      ),
      totalTentativas: tentativasDoModulo.length,
      percentualAcerto,
      dominadasNoModulo,
      totalAtividades: modulo.atividades.length,
      mediaNivelDica,
    }
  })

  const proximaAtividade = encontrarProximaAtividadeDisponivel(
    trilha,
    dominadas,
  )
  const revisaoEspacada = encontrarAtividadeParaRevisao(
    trilha,
    dominadas,
    tentativas,
  )

  return {
    totalAtividades,
    totalDominadas,
    percentualGeral:
      totalAtividades > 0
        ? Math.round((totalDominadas / totalAtividades) * 100)
        : 0,
    resumoPorModulo,
    proximaAtividade,
    revisaoEspacada,
    ultimasTentativas: criarTentativasRelatorio(trilha, tentativas),
    orientacao: criarOrientacao(resumoPorModulo, proximaAtividade),
    recomendacaoMediacao: criarRecomendacaoMediacao(
      planoIndividual,
      proximaAtividade,
    ),
    recomendacaoApoioGraduado: criarRecomendacaoApoioGraduado(
      tentativas,
      proximaAtividade,
      revisaoEspacada,
    ),
  }
}
