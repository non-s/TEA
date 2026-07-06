export interface PontoTracado {
  x: number
  y: number
}

/**
 * Cada letra é um ou mais traços (arrays de pontos) num espaço 0-100, o
 * mesmo viewBox usado pelos ícones em curriculo/ativos/Icone.tsx. Formas
 * simplificadas de um único traço contínuo por perna da letra — não são
 * fontes reais, só o suficiente para guiar o movimento da criança.
 */
export const guiasLetras: Record<string, PontoTracado[][]> = {
  A: [
    [
      { x: 50, y: 10 },
      { x: 20, y: 90 },
    ],
    [
      { x: 50, y: 10 },
      { x: 80, y: 90 },
    ],
    [
      { x: 32, y: 58 },
      { x: 68, y: 58 },
    ],
  ],
  E: [
    [
      { x: 30, y: 10 },
      { x: 30, y: 90 },
    ],
    [
      { x: 30, y: 10 },
      { x: 75, y: 10 },
    ],
    [
      { x: 30, y: 50 },
      { x: 65, y: 50 },
    ],
    [
      { x: 30, y: 90 },
      { x: 75, y: 90 },
    ],
  ],
  I: [
    [
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ],
  ],
  O: [
    [
      { x: 50, y: 10 },
      { x: 68, y: 15 },
      { x: 78, y: 32 },
      { x: 78, y: 68 },
      { x: 68, y: 85 },
      { x: 50, y: 90 },
      { x: 32, y: 85 },
      { x: 22, y: 68 },
      { x: 22, y: 32 },
      { x: 32, y: 15 },
      { x: 50, y: 10 },
    ],
  ],
  U: [
    [
      { x: 25, y: 10 },
      { x: 25, y: 65 },
      { x: 32, y: 82 },
      { x: 50, y: 88 },
      { x: 68, y: 82 },
      { x: 75, y: 65 },
      { x: 75, y: 10 },
    ],
  ],
  M: [
    [
      { x: 20, y: 90 },
      { x: 20, y: 10 },
      { x: 50, y: 55 },
      { x: 80, y: 10 },
      { x: 80, y: 90 },
    ],
  ],
  P: [
    [
      { x: 30, y: 90 },
      { x: 30, y: 10 },
      { x: 65, y: 10 },
      { x: 70, y: 26 },
      { x: 65, y: 42 },
      { x: 30, y: 42 },
    ],
  ],
  T: [
    [
      { x: 20, y: 15 },
      { x: 80, y: 15 },
    ],
    [
      { x: 50, y: 15 },
      { x: 50, y: 90 },
    ],
  ],
  L: [
    [
      { x: 30, y: 10 },
      { x: 30, y: 90 },
      { x: 75, y: 90 },
    ],
  ],
  B: [
    [
      { x: 30, y: 90 },
      { x: 30, y: 10 },
      { x: 60, y: 10 },
      { x: 66, y: 25 },
      { x: 60, y: 38 },
      { x: 30, y: 38 },
      { x: 65, y: 38 },
      { x: 72, y: 64 },
      { x: 65, y: 90 },
      { x: 30, y: 90 },
    ],
  ],
}

export function possuiGuiaTracado(letra: string): boolean {
  return letra.toUpperCase() in guiasLetras
}

function distanciaAoSegmento(
  ponto: PontoTracado,
  a: PontoTracado,
  b: PontoTracado,
): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const comprimentoQuadrado = dx * dx + dy * dy
  if (comprimentoQuadrado === 0) {
    return Math.hypot(ponto.x - a.x, ponto.y - a.y)
  }
  const t = Math.max(
    0,
    Math.min(
      1,
      ((ponto.x - a.x) * dx + (ponto.y - a.y) * dy) / comprimentoQuadrado,
    ),
  )
  const projecaoX = a.x + t * dx
  const projecaoY = a.y + t * dy
  return Math.hypot(ponto.x - projecaoX, ponto.y - projecaoY)
}

function segmentosDoGuia(
  guia: PontoTracado[][],
): Array<[PontoTracado, PontoTracado]> {
  return guia.flatMap((traco) =>
    traco
      .slice(1)
      .map((ponto, indice): [PontoTracado, PontoTracado] => [
        traco[indice],
        ponto,
      ]),
  )
}

function distanciaMinimaAosSegmentos(
  ponto: PontoTracado,
  segmentos: Array<[PontoTracado, PontoTracado]>,
): number {
  return segmentos.reduce(
    (minimo, [a, b]) => Math.min(minimo, distanciaAoSegmento(ponto, a, b)),
    Infinity,
  )
}

/** Densifica cada segmento do guia em pontos de referência espaçados, para
 * a cobertura exigir que a criança percorra o traço inteiro (não só toque
 * nas pontas). */
function pontosReferencia(
  guia: PontoTracado[][],
  espacamento = 4,
): PontoTracado[] {
  const pontos: PontoTracado[] = []
  for (const traco of guia) {
    for (let i = 0; i < traco.length - 1; i++) {
      const a = traco[i]
      const b = traco[i + 1]
      const distancia = Math.hypot(b.x - a.x, b.y - a.y)
      const passos = Math.max(1, Math.round(distancia / espacamento))
      for (let passo = 0; passo <= passos; passo++) {
        const t = passo / passos
        pontos.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
      }
    }
  }
  return pontos
}

export interface ResultadoTracado {
  precisao: number
  cobertura: number
  aprovado: boolean
}

export interface OpcoesAvaliacaoTracado {
  tolerancia?: number
  precisaoMinima?: number
  coberturaMinima?: number
}

const TOLERANCIA_PADRAO = 12
const PRECISAO_MINIMA_PADRAO = 0.55
const COBERTURA_MINIMA_PADRAO = 0.5

/**
 * Compara o que a criança desenhou com o guia da letra. Não é uma análise
 * grafomotora clínica — é deliberadamente tolerante (tanto para acesso por
 * mouse quanto por dedo em telas pequenas) e nunca reprova por velocidade.
 */
export function avaliarTracado(
  tracosDesenhados: PontoTracado[][],
  guia: PontoTracado[][],
  opcoes: OpcoesAvaliacaoTracado = {},
): ResultadoTracado {
  const tolerancia = opcoes.tolerancia ?? TOLERANCIA_PADRAO
  const precisaoMinima = opcoes.precisaoMinima ?? PRECISAO_MINIMA_PADRAO
  const coberturaMinima = opcoes.coberturaMinima ?? COBERTURA_MINIMA_PADRAO

  const pontosDesenhados = tracosDesenhados.flat()
  if (pontosDesenhados.length === 0) {
    return { precisao: 0, cobertura: 0, aprovado: false }
  }

  const segmentos = segmentosDoGuia(guia)
  const dentroDaTolerancia = pontosDesenhados.filter(
    (ponto) => distanciaMinimaAosSegmentos(ponto, segmentos) <= tolerancia,
  )
  const precisao = dentroDaTolerancia.length / pontosDesenhados.length

  const referencia = pontosReferencia(guia)
  const referenciaCobertos = referencia.filter((pontoGuia) =>
    pontosDesenhados.some(
      (ponto) =>
        Math.hypot(ponto.x - pontoGuia.x, ponto.y - pontoGuia.y) <= tolerancia,
    ),
  )
  const cobertura =
    referencia.length === 0 ? 1 : referenciaCobertos.length / referencia.length

  return {
    precisao,
    cobertura,
    aprovado: precisao >= precisaoMinima && cobertura >= coberturaMinima,
  }
}
